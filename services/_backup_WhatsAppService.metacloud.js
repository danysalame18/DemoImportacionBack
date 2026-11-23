/**
 * WhatsAppService.js  —  Transporte oficial WhatsApp Cloud API (Meta)
 * ===========================================================================
 * Reemplaza la integración no oficial con Baileys (respaldada en
 * services/_backup_WhatsAppService.baileys.js) por la API oficial de Meta.
 *
 * Conserva la MISMA interfaz pública que usaba el resto del sistema, para que
 * ChatBotService, ClientesController y WhatsAppController sigan funcionando:
 *   - getMessageEmitter()        -> EventEmitter que emite 'message' (entrantes)
 *   - create()                   -> no-op (la Cloud API es HTTP, sin sesión/QR)
 *   - isReady() / getState()     -> estado de configuración
 *   - sendMsg(num, text)         -> texto de sesión, con fallback a plantilla
 *   - sendPDF(num, buf, name)    -> documento de sesión, fallback a plantilla
 *   - sendPDFFront(num,msg,buf..)-> documento + caption, fallback a plantilla
 *
 * Además expone los métodos nuevos para envíos PROACTIVOS (requieren plantilla):
 *   - sendTemplate(num, name, lang, components)
 *   - sendSaldoRecordatorio(num, nombre, saldo)
 *   - sendDocumentoTemplate(num, nombre, tipoDoc, buffer, fileName)
 *   - sendEstadoCuentaTemplate(num, nombre, buffer, fileName)
 * y el manejo del WEBHOOK entrante (verifyWebhook / receiveWebhook).
 *
 * Variables de entorno necesarias (.env):
 *   WA_CLOUD_TOKEN        Token de acceso permanente del System User de Meta
 *   WA_PHONE_NUMBER_ID    ID del número de teléfono (Phone Number ID)
 *   WA_WABA_ID            (opcional) ID de la cuenta de WhatsApp Business
 *   WA_API_VERSION        (opcional) versión de Graph API, default v21.0
 *   WA_VERIFY_TOKEN       Token de verificación del webhook (lo defines tú)
 *   WA_DEFAULT_LANG       (opcional) idioma de plantillas, default es_MX
 *   WA_MX_PREFIX          (opcional) prefijo al enviar a MX, default 52
 * ===========================================================================
 */

const axios = require("axios");
const crypto = require("crypto");
const EventEmitter = require("events");
const T = require("./WhatsAppTemplates");

class WhatsAppMessageEmitter extends EventEmitter {}
const messageEmitter = new WhatsAppMessageEmitter();

// ---- Configuración ---------------------------------------------------------
const API_VERSION = (process.env.WA_API_VERSION || "v21.0").trim();
const TOKEN = (process.env.WA_CLOUD_TOKEN || "").trim();
const PHONE_NUMBER_ID = (process.env.WA_PHONE_NUMBER_ID || "").trim();
const VERIFY_TOKEN = (process.env.WA_VERIFY_TOKEN || "").trim();
const MX_PREFIX = (process.env.WA_MX_PREFIX || "52").trim();
const APP_SECRET = (process.env.WA_APP_SECRET || "").trim();
const GRAPH = `https://graph.facebook.com/${API_VERSION}`;
const MAX_RETRIES = parseInt(process.env.WA_MAX_RETRIES || "2", 10);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isConfigured() {
  return Boolean(TOKEN && PHONE_NUMBER_ID);
}

function authHeaders(extra = {}) {
  return { Authorization: `Bearer ${TOKEN}`, ...extra };
}

// ---- Normalización de números ---------------------------------------------
// El sistema guarda los teléfonos a 10 dígitos. Internamente el chatbot maneja
// JIDs estilo Baileys ("521XXXXXXXXXX@s.whatsapp.net"). Aquí convertimos en
// ambos sentidos para no tocar la lógica existente.

function last10(input) {
  const d = String(input || "").replace(/\D+/g, "");
  return d.slice(-10);
}

/** Convierte cualquier formato a wa_id E.164 sin '+': MX_PREFIX + 10 dígitos. */
function toWaId(number) {
  const ten = last10(number);
  if (!ten) return "";
  return `${MX_PREFIX}${ten}`;
}

/** Convierte un wa_id entrante al JID que espera ChatBotService (slice(3)). */
function toJid(waId) {
  return `521${last10(waId)}@s.whatsapp.net`;
}

// ---- Cliente HTTP a Graph API ---------------------------------------------

// Reintenta sólo ante errores transitorios: sin respuesta (red/timeout),
// 5xx del servidor o 429 (rate limit). Los errores de negocio (4xx) NO se
// reintentan: se devuelven para que el caller decida el fallback a plantilla.
function isTransient(err) {
  const status = err?.response?.status;
  if (status === undefined) return true; // network / timeout
  return status >= 500 || status === 429;
}

async function graphPost(path, payload, { isForm = false } = {}) {
  if (!isConfigured()) {
    return { ok: false, error: { message: "WhatsApp Cloud API no configurado (faltan WA_CLOUD_TOKEN / WA_PHONE_NUMBER_ID)" } };
  }
  const url = `${GRAPH}/${path}`;
  const headers = isForm ? authHeaders() : authHeaders({ "Content-Type": "application/json" });

  let lastErr = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data } = await axios.post(url, payload, { headers, timeout: 30000 });
      return { ok: true, data };
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_RETRIES && isTransient(err)) {
        const backoff = 800 * Math.pow(2, attempt); // 0.8s, 1.6s
        console.warn(`graphPost reintento ${attempt + 1}/${MAX_RETRIES} en ${backoff}ms (${err?.response?.status || "network"})`);
        await sleep(backoff);
        continue;
      }
      break;
    }
  }
  const apiErr = lastErr?.response?.data?.error || { message: lastErr?.message || "Error desconocido" };
  return { ok: false, error: apiErr, status: lastErr?.response?.status };
}

/**
 * Sube un archivo a Meta y devuelve el media_id (necesario para enviar
 * documentos, ya sea de sesión o en el header de una plantilla).
 */
async function uploadMedia(buffer, fileName = "documento.pdf", mimetype = "application/pdf") {
  if (!isConfigured()) return { ok: false, error: { message: "Cloud API no configurado" } };
  try {
    const form = new FormData();
    form.append("messaging_product", "whatsapp");
    form.append("type", mimetype);
    // Node 18+/20: Blob global disponible
    const blob = new Blob([buffer], { type: mimetype });
    form.append("file", blob, fileName);

    const { data } = await axios.post(`${GRAPH}/${PHONE_NUMBER_ID}/media`, form, {
      headers: authHeaders(),
      timeout: 60000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return { ok: true, mediaId: data?.id };
  } catch (err) {
    const apiErr = err?.response?.data?.error || { message: err?.message };
    return { ok: false, error: apiErr };
  }
}

// ---- Envíos de SESIÓN (dentro de ventana de 24 h, sin plantilla) ----------

async function sendSessionText(waId, text) {
  return graphPost(`${PHONE_NUMBER_ID}/messages`, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: waId,
    type: "text",
    text: { preview_url: false, body: String(text ?? "") },
  });
}

async function sendSessionDocument(waId, mediaId, fileName, caption) {
  const document = { id: mediaId, filename: fileName };
  if (caption) document.caption = caption;
  return graphPost(`${PHONE_NUMBER_ID}/messages`, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: waId,
    type: "document",
    document,
  });
}

// ---- Envío de PLANTILLA (proactivo) ---------------------------------------

async function sendTemplate(number, name, language, components = []) {
  const waId = toWaId(number);
  return graphPost(`${PHONE_NUMBER_ID}/messages`, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: waId,
    type: "template",
    template: {
      name,
      language: { code: language || T.LANG },
      ...(components.length ? { components } : {}),
    },
  });
}

// Mapea la respuesta de Graph al formato {error, message, waId} que esperaban
// los callers antiguos del sistema.
function normalizeResult(r, okMsg = "Enviado") {
  if (r.ok) {
    const waId = r.data?.messages?.[0]?.id || null;
    return { error: false, message: okMsg, waId };
  }
  return { error: true, message: r.error?.message || "Error al enviar", code: r.error?.code };
}

/* ===========================================================================
 *  WEBHOOK ENTRANTE  ->  re-emite 'message' con forma compatible con Baileys
 *  para que ChatBotService.handleMessage funcione sin cambios.
 * =========================================================================== */

function extractText(msg) {
  if (!msg) return "";
  if (msg.type === "text") return msg.text?.body || "";
  if (msg.type === "interactive") {
    return (
      msg.interactive?.button_reply?.title ||
      msg.interactive?.list_reply?.title ||
      ""
    );
  }
  if (msg.type === "button") return msg.button?.text || ""; // respuesta de quick-reply de plantilla
  return "";
}

// Verifica la firma X-Hub-Signature-256 que Meta envía en cada POST del webhook,
// usando el App Secret. Si no hay WA_APP_SECRET configurado, la validación se
// omite (devuelve true) para no bloquear en entornos de prueba.
function isSignatureRequired() {
  return Boolean(APP_SECRET);
}

function verifySignature(rawBody, signatureHeader) {
  if (!APP_SECRET) return true; // no exigido
  if (!signatureHeader || !rawBody) return false;
  try {
    const expected =
      "sha256=" +
      crypto.createHmac("sha256", APP_SECRET).update(rawBody).digest("hex");
    const a = Buffer.from(signatureHeader);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (e) {
    return false;
  }
}

function handleWebhookEvent(body) {
  try {
    const entries = body?.entry || [];
    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        const value = change?.value || {};
        const messages = value.messages || [];
        for (const msg of messages) {
          if (!msg || !msg.from) continue;
          const text = extractText(msg);
          if (!text) continue; // solo procesamos texto / quick-reply

          // Forma compatible con lo que consume ChatBotService:
          //   message.key.remoteJid, message.key.fromMe, message.message.conversation
          messageEmitter.emit("message", {
            key: {
              remoteJid: toJid(msg.from),
              fromMe: false,
              id: msg.id,
            },
            message: { conversation: text },
            _cloud: { from: msg.from, type: msg.type, raw: msg },
          });
        }
        // value.statuses[] (sent/delivered/read/failed) disponible aquí si se
        // quisiera registrar acuses; por ahora solo se loguea en fallos.
        for (const st of value.statuses || []) {
          if (st.status === "failed") {
            console.warn("WA status failed:", JSON.stringify(st.errors || st));
          }
        }
      }
    }
  } catch (e) {
    console.error("Error procesando webhook WhatsApp:", e?.message || e);
  }
}

/* ===========================================================================
 *  API PÚBLICA
 * =========================================================================== */

module.exports = {
  // ---- Compatibilidad con el código existente ----
  getMessageEmitter: () => messageEmitter,
  getClientG: () => (isConfigured() ? { cloud: true } : null),
  getLastQrCode: () => null, // Cloud API no usa QR
  isReady: () => isConfigured(),
  getState: () => (isConfigured() ? 2 : 0), // 2 = conectado (el front pinta verde)
  getReconnectInfo: () => ({
    transport: "cloud-api",
    configured: isConfigured(),
    apiVersion: API_VERSION,
    phoneNumberId: PHONE_NUMBER_ID ? `***${PHONE_NUMBER_ID.slice(-4)}` : null,
  }),

  // En Cloud API no hay sesión que crear; se mantiene para no romper api/index.js
  create: async function () {
    if (isConfigured()) {
      console.log("🟢 WhatsApp Cloud API listo (transporte oficial de Meta).");
    } else {
      console.warn("⚠️ WhatsApp Cloud API SIN configurar: define WA_CLOUD_TOKEN y WA_PHONE_NUMBER_ID en .env");
    }
    return { ready: isConfigured() };
  },

  // restart / hardReset ya no aplican (no hay sesión). Se conservan como no-op.
  restart: async function () {
    return { success: true, message: "Cloud API no requiere reinicio de sesión" };
  },
  hardReset: async function () {
    return { success: true, message: "Cloud API no maneja sesión local; nada que limpiar" };
  },

  // ---- Webhook ----
  getVerifyToken: () => VERIFY_TOKEN,
  verifyWebhook: (mode, token, challenge) => {
    if (mode === "subscribe" && token && token === VERIFY_TOKEN) {
      return { ok: true, challenge };
    }
    return { ok: false };
  },
  receiveWebhook: (body) => handleWebhookEvent(body),
  isSignatureRequired,
  verifySignature,

  // Catálogo de plantillas (para exponerlo en un endpoint si se desea)
  getTemplatesCatalog: () => T.CATALOGO_PARA_META,

  // ---- Bajo nivel ----
  uploadMedia,
  sendTemplate,
  toWaId,
  toJid,

  /* -------------------------------------------------------------------------
   * sendMsg: usado tanto por el chatbot (reactivo, va como sesión) como por el
   * front (proactivo). Intenta envío de sesión; si Meta lo rechaza (típicamente
   * por estar fuera de la ventana de 24 h), cae a la plantilla notificacion_general.
   * ------------------------------------------------------------------------- */
  sendMsg: async function (number, message /*, idempotencyKey */) {
    const waId = toWaId(number);
    const r = await sendSessionText(waId, message);
    if (r.ok) return normalizeResult(r, "Enviado");

    // Fallback proactivo: plantilla genérica
    console.warn(`sendMsg sesión falló (${r.error?.code || ""}: ${r.error?.message}). Intentando plantilla notificacion_general...`);
    const tpl = T.TEMPLATES.NOTIFICACION_GENERAL;
    const rt = await sendTemplate(number, tpl.name, tpl.language, T.buildNotificacionGeneral(message));
    return normalizeResult(rt, "Enviado (plantilla)");
  },

  /* -------------------------------------------------------------------------
   * sendPDF: documento sin caption. Sesión con fallback a plantilla envio_documento.
   * ------------------------------------------------------------------------- */
  sendPDF: async function (number, buffer, fileName = "documento.pdf", mimetype = "application/pdf") {
    if (!buffer) return { error: true, message: "Datos de PDF inválidos" };
    const up = await uploadMedia(Buffer.from(buffer), fileName, mimetype);
    if (!up.ok) return { error: true, message: up.error?.message || "No se pudo subir el PDF" };

    const waId = toWaId(number);
    const r = await sendSessionDocument(waId, up.mediaId, fileName, null);
    if (r.ok) return normalizeResult(r, "Enviado");

    console.warn(`sendPDF sesión falló (${r.error?.message}). Usando plantilla envio_documento...`);
    const tpl = T.TEMPLATES.ENVIO_DOCUMENTO;
    const tipoDoc = String(fileName).replace(/\.pdf$/i, "");
    const rt = await sendTemplate(number, tpl.name, tpl.language, T.buildEnvioDocumento("", tipoDoc, up.mediaId, fileName));
    return normalizeResult(rt, "Enviado (plantilla)");
  },

  /* -------------------------------------------------------------------------
   * sendPDFFront: documento con caption (texto que escribe el usuario en la UI).
   * Sesión con caption; fallback a plantilla envio_documento (el caption no
   * puede viajar libre fuera de la ventana, se usa el nombre del archivo).
   * ------------------------------------------------------------------------- */
  sendPDFFront: async function (number, message, buffer, fileName = "documento.pdf", mimetype = "application/pdf") {
    if (!buffer) return { error: true, message: "Datos de PDF inválidos" };
    const up = await uploadMedia(Buffer.from(buffer), fileName, mimetype);
    if (!up.ok) return { error: true, message: up.error?.message || "No se pudo subir el PDF" };

    const waId = toWaId(number);
    const r = await sendSessionDocument(waId, up.mediaId, fileName, message);
    if (r.ok) return normalizeResult(r, "Enviado");

    console.warn(`sendPDFFront sesión falló (${r.error?.message}). Usando plantilla envio_documento...`);
    const tpl = T.TEMPLATES.ENVIO_DOCUMENTO;
    const tipoDoc = String(fileName).replace(/\.pdf$/i, "");
    const rt = await sendTemplate(number, tpl.name, tpl.language, T.buildEnvioDocumento("", tipoDoc, up.mediaId, fileName));
    return normalizeResult(rt, "Enviado (plantilla)");
  },

  // ---- Helpers de PLANTILLA de alto nivel (proactivo) ----

  /** Recordatorio de saldo (cron). nombre y saldo ya formateados. */
  sendSaldoRecordatorio: async function (number, nombre, saldoFormateado) {
    const tpl = T.TEMPLATES.SALDO_RECORDATORIO;
    const r = await sendTemplate(number, tpl.name, tpl.language, T.buildSaldoRecordatorio(nombre, saldoFormateado));
    return normalizeResult(r, "Enviado (plantilla saldo_recordatorio)");
  },

  /** Entrega de Estado de Cuenta (PDF) por plantilla, proactivo. */
  sendEstadoCuentaTemplate: async function (number, nombre, buffer, fileName = "EdoCta.pdf") {
    const up = await uploadMedia(Buffer.from(buffer), fileName, "application/pdf");
    if (!up.ok) return { error: true, message: up.error?.message || "No se pudo subir el PDF" };
    const tpl = T.TEMPLATES.ENVIO_ESTADO_CUENTA;
    const r = await sendTemplate(number, tpl.name, tpl.language, T.buildEnvioEstadoCuenta(nombre, up.mediaId, fileName));
    return normalizeResult(r, "Enviado (plantilla envio_estado_cuenta)");
  },

  /** Entrega de documento genérico (PDF) por plantilla, proactivo. */
  sendDocumentoTemplate: async function (number, nombre, tipoDocumento, buffer, fileName = "documento.pdf") {
    const up = await uploadMedia(Buffer.from(buffer), fileName, "application/pdf");
    if (!up.ok) return { error: true, message: up.error?.message || "No se pudo subir el PDF" };
    const tpl = T.TEMPLATES.ENVIO_DOCUMENTO;
    const r = await sendTemplate(number, tpl.name, tpl.language, T.buildEnvioDocumento(nombre, tipoDocumento, up.mediaId, fileName));
    return normalizeResult(r, "Enviado (plantilla envio_documento)");
  },
};
