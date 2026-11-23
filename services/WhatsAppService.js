/**
 * WhatsAppService.js  —  Transporte vía CONTACTA (OneChat) — WhatsApp Business API
 * ===========================================================================
 * El cliente opera WhatsApp a través del BSP **Contacta** (hub OneChat), no
 * directo con Meta. Este servicio habla con la API de Contacta y mantiene la
 * MISMA interfaz pública de siempre, por lo que ChatBotService, ClientesController
 * y WhatsAppController siguen funcionando sin cambios:
 *   getMessageEmitter / create / isReady / getState /
 *   sendMsg / sendPDF / sendPDFFront / sendSaldoRecordatorio / verifyWebhook / receiveWebhook
 *
 * Versiones anteriores respaldadas:
 *   services/_backup_WhatsAppService.baileys.js    (no oficial)
 *   services/_backup_WhatsAppService.metacloud.js  (Meta directo)
 *
 * ---------------------------------------------------------------------------
 * API de Contacta (https://docs.contacta.mx/whatsapp-business/):
 *   Endpoint:  POST https://hub.onechat.mx/wab   (Basic auth: usuario/contraseña)
 *   Texto:     { type:"text",  agent, number, message }
 *   Archivo:   { type:"file",  agent, number, url, filename, caption? }
 *   Plantilla: { type:"template", agent, number, language, templateName,
 *                templateData: { body:{ placeholders:[...] },
 *                                header:{ placeholders:[...] }            // header de texto
 *                                       | { type:"DOCUMENT", mediaUrl, filename } } }
 *   `agent`  = número de WhatsApp del negocio que envía.
 *   `number` = destinatario (52 + 10 dígitos).
 *   Documentos: Contacta NO recibe el archivo; requiere URL pública → subimos el
 *               PDF a Cloudinary y mandamos su URL.
 *   Webhook entrante (POST, sin verificación):
 *     { type:"inbound", payload:{ msisdn, type_message,
 *         payload:{ source, type, sender:{phone,name}, payload:{ text|title|caption } } } }
 *
 * Variables de entorno (.env):
 *   WA_CONTACTA_URL     (default https://hub.onechat.mx/wab)
 *   WA_CONTACTA_USER    usuario (Basic auth)
 *   WA_CONTACTA_PASS    contraseña (Basic auth)
 *   WA_CONTACTA_AGENT   número de WhatsApp del negocio (campo "agent")
 *   WA_DEFAULT_LANG     idioma de plantillas (default "es" — Contacta usa en/es/fr/de/it/pt)
 *   WA_MX_PREFIX        prefijo a destinatarios MX (default 52)
 *   API_KEY_CLOUDINARY / API_SECRET_CLOUDINARY   (para subir PDFs)
 * ===========================================================================
 */

const axios = require("axios");
const EventEmitter = require("events");
const cloudinary = require("cloudinary").v2;
const T = require("./WhatsAppTemplates");

class WhatsAppMessageEmitter extends EventEmitter {}
const messageEmitter = new WhatsAppMessageEmitter();

// ---- Configuración --------------------------------------------------------
const URL = (process.env.WA_CONTACTA_URL || "https://hub.onechat.mx/wab").trim();
const USER = (process.env.WA_CONTACTA_USER || "").trim();
const PASS = (process.env.WA_CONTACTA_PASS || "").trim();
const AGENT = (process.env.WA_CONTACTA_AGENT || "").trim();
const LANG = (process.env.WA_DEFAULT_LANG || "es_MX").trim();
const MX_PREFIX = (process.env.WA_MX_PREFIX || "52").trim();
const MAX_RETRIES = parseInt(process.env.WA_MAX_RETRIES || "2", 10);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || "sistemify",
  api_key: process.env.API_KEY_CLOUDINARY,
  api_secret: process.env.API_SECRET_CLOUDINARY,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isConfigured() {
  return Boolean(USER && PASS && AGENT);
}
function basicAuthHeader() {
  return "Basic " + Buffer.from(`${USER}:${PASS}`).toString("base64");
}

// ---- Normalización de números --------------------------------------------
function last10(input) {
  return String(input || "").replace(/\D+/g, "").slice(-10);
}
/** Destinatario para Contacta: MX_PREFIX + 10 dígitos (ej. 5215512345678 → 525512345678). */
function toNumber(number) {
  const ten = last10(number);
  return ten ? `${MX_PREFIX}${ten}` : "";
}
/** wa_id entrante → JID estilo Baileys que ya espera ChatBotService (from.slice(3)). */
function toJid(waId) {
  return `521${last10(waId)}@s.whatsapp.net`;
}

// ---- POST a Contacta con reintentos ante errores transitorios -------------
function isTransient(err) {
  const status = err?.response?.status;
  if (status === undefined) return true; // red / timeout
  return status >= 500 || status === 429;
}

async function postContacta(payload) {
  if (!isConfigured()) {
    return { ok: false, error: { message: "Contacta no configurado (faltan WA_CONTACTA_USER / WA_CONTACTA_PASS / WA_CONTACTA_AGENT)" } };
  }
  const headers = { Authorization: basicAuthHeader(), "Content-Type": "application/json" };
  let lastErr = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data } = await axios.post(URL, payload, { headers, timeout: 30000 });
      // Contacta responde { error:false, code:200, message:"..." }
      if (data && data.error === true) {
        return { ok: false, error: { message: data.message || "Error en Contacta", code: data.code } };
      }
      return { ok: true, data };
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_RETRIES && isTransient(err)) {
        const backoff = 800 * Math.pow(2, attempt);
        console.warn(`Contacta reintento ${attempt + 1}/${MAX_RETRIES} en ${backoff}ms (${err?.response?.status || "network"})`);
        await sleep(backoff);
        continue;
      }
      break;
    }
  }
  const apiErr = lastErr?.response?.data || { message: lastErr?.message || "Error desconocido" };
  return { ok: false, error: { message: apiErr.message || JSON.stringify(apiErr), code: lastErr?.response?.status } };
}

function normalizeResult(r, okMsg = "Enviado") {
  if (r.ok) return { error: false, message: okMsg, raw: r.data };
  return { error: true, message: r.error?.message || "Error al enviar", code: r.error?.code };
}

// ---- Subida de PDF a Cloudinary (para obtener URL pública) -----------------
function uploadPdfBuffer(buffer, fileName = "documento.pdf") {
  return new Promise((resolve, reject) => {
    try {
      const safe = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.pdf$/i, "");
      const publicId = `americanFlyDocs/${safe}-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "raw", public_id: publicId, format: "pdf", overwrite: true },
        (err, result) => (err ? reject(err) : resolve(result?.secure_url))
      );
      stream.end(Buffer.from(buffer));
    } catch (e) {
      reject(e);
    }
  });
}

// ---- Construcción de payloads de Contacta ---------------------------------
function textPayload(number, message) {
  return { type: "text", agent: AGENT, number: toNumber(number), message: String(message ?? "") };
}
function filePayload(number, url, filename, caption) {
  const p = { type: "file", agent: AGENT, number: toNumber(number), url, filename: filename || "documento.pdf" };
  if (caption) p.caption = caption;
  return p;
}
function templatePayload(number, templateName, language, { body = [], headerText = [], document = null } = {}) {
  const templateData = {};
  if (body.length) templateData.body = { placeholders: body.map((v) => String(v ?? "")) };
  if (document) {
    templateData.header = { type: "DOCUMENT", mediaUrl: document.url, filename: document.filename || "documento.pdf" };
  } else if (headerText.length) {
    templateData.header = { placeholders: headerText.map((v) => String(v ?? "")) };
  }
  return {
    type: "template",
    agent: AGENT,
    number: toNumber(number),
    language: language || LANG,
    templateName,
    templateData,
  };
}

async function sendTemplate(number, templateName, language, opts) {
  return postContacta(templatePayload(number, templateName, language, opts));
}

/* ===========================================================================
 *  WEBHOOK ENTRANTE  ->  re-emite 'message' con forma Baileys para ChatBotService
 * =========================================================================== */
function extractInbound(body) {
  // Contacta: { type:"inbound", payload:{ msisdn, type_message, payload:{ source, type, sender:{phone}, payload:{...} } } }
  const outer = body?.payload || body || {};
  const inner = outer.payload || {};
  const content = inner.payload || {};
  const from =
    inner?.sender?.phone || inner?.source || outer?.msisdn || body?.msisdn || "";
  // texto directo, título de botón/quick-reply, o caption de media
  const text = content.text || content.title || content.caption || inner.text || "";
  const id = inner.id || content.id || null;
  return { from: String(from || ""), text: String(text || ""), id };
}

function handleWebhookEvent(body) {
  try {
    const { from, text, id } = extractInbound(body);
    if (!from || !text) return; // solo procesamos mensajes de texto / quick-reply
    messageEmitter.emit("message", {
      key: { remoteJid: toJid(from), fromMe: false, id },
      message: { conversation: text },
      _contacta: { from, raw: body },
    });
  } catch (e) {
    console.error("Error procesando webhook Contacta:", e?.message || e);
  }
}

/* ===========================================================================
 *  API PÚBLICA
 * =========================================================================== */
module.exports = {
  // ---- Compatibilidad ----
  getMessageEmitter: () => messageEmitter,
  getClientG: () => (isConfigured() ? { contacta: true } : null),
  getLastQrCode: () => null,
  isReady: () => isConfigured(),
  getState: () => (isConfigured() ? 2 : 0),
  getReconnectInfo: () => ({
    transport: "contacta-onechat",
    configured: isConfigured(),
    endpoint: URL,
    agent: AGENT ? `***${AGENT.slice(-4)}` : null,
  }),

  create: async function () {
    if (isConfigured()) {
      console.log("🟢 WhatsApp vía Contacta (OneChat) listo.");
    } else {
      console.warn("⚠️ Contacta SIN configurar: define WA_CONTACTA_USER, WA_CONTACTA_PASS y WA_CONTACTA_AGENT en .env");
    }
    return { ready: isConfigured() };
  },
  restart: async () => ({ success: true, message: "Contacta es HTTP; no requiere reinicio de sesión" }),
  hardReset: async () => ({ success: true, message: "Contacta no maneja sesión local; nada que limpiar" }),

  // ---- Webhook (Contacta no requiere verificación) ----
  getVerifyToken: () => null,
  verifyWebhook: (mode, token, challenge) => ({ ok: true, challenge: challenge || "OK" }),
  receiveWebhook: (body) => handleWebhookEvent(body),
  isSignatureRequired: () => false,
  verifySignature: () => true,

  getTemplatesCatalog: () => T.CATALOGO_PARA_META,

  // ---- Bajo nivel ----
  sendTemplate,
  uploadPdfBuffer,
  toNumber,
  toJid,

  /* -------------------------------------------------------------------------
   * sendMsg: chatbot (reactivo, mensaje de sesión) y front (proactivo).
   * Intenta texto de sesión; si falla (típicamente fuera de la ventana de 24 h),
   * cae a la plantilla notificacion_general.
   * ------------------------------------------------------------------------- */
  sendMsg: async function (number, message) {
    const r = await postContacta(textPayload(number, message));
    if (r.ok) return normalizeResult(r, "Enviado");

    console.warn(`sendMsg texto falló (${r.error?.message}). Intentando plantilla notificacion_general...`);
    const tpl = T.TEMPLATES.NOTIFICACION_GENERAL;
    const rt = await sendTemplate(number, tpl.name, tpl.language, { body: [message] });
    return normalizeResult(rt, "Enviado (plantilla)");
  },

  /* -------------------------------------------------------------------------
   * sendPDF: documento sin caption. Sube a Cloudinary y manda como 'file'
   * (sesión); si falla, plantilla envio_documento con el documento en el header.
   * ------------------------------------------------------------------------- */
  sendPDF: async function (number, buffer, fileName = "documento.pdf") {
    if (!buffer) return { error: true, message: "Datos de PDF inválidos" };
    let url;
    try {
      url = await uploadPdfBuffer(buffer, fileName);
    } catch (e) {
      return { error: true, message: "No se pudo subir el PDF a Cloudinary: " + (e?.message || e) };
    }

    const r = await postContacta(filePayload(number, url, fileName, null));
    if (r.ok) return normalizeResult(r, "Enviado");

    console.warn(`sendPDF 'file' falló (${r.error?.message}). Usando plantilla envio_documento...`);
    const tpl = T.TEMPLATES.ENVIO_DOCUMENTO;
    const tipoDoc = String(fileName).replace(/\.pdf$/i, "");
    const rt = await sendTemplate(number, tpl.name, tpl.language, {
      body: ["", tipoDoc],
      document: { url, filename: fileName },
    });
    return normalizeResult(rt, "Enviado (plantilla)");
  },

  /* -------------------------------------------------------------------------
   * sendPDFFront: documento con caption (texto que escribe el usuario en la UI).
   * ------------------------------------------------------------------------- */
  sendPDFFront: async function (number, message, buffer, fileName = "documento.pdf") {
    if (!buffer) return { error: true, message: "Datos de PDF inválidos" };
    let url;
    try {
      url = await uploadPdfBuffer(buffer, fileName);
    } catch (e) {
      return { error: true, message: "No se pudo subir el PDF a Cloudinary: " + (e?.message || e) };
    }

    const r = await postContacta(filePayload(number, url, fileName, message));
    if (r.ok) return normalizeResult(r, "Enviado");

    console.warn(`sendPDFFront 'file' falló (${r.error?.message}). Usando plantilla envio_documento...`);
    const tpl = T.TEMPLATES.ENVIO_DOCUMENTO;
    const tipoDoc = String(fileName).replace(/\.pdf$/i, "");
    const rt = await sendTemplate(number, tpl.name, tpl.language, {
      body: ["", tipoDoc],
      document: { url, filename: fileName },
    });
    return normalizeResult(rt, "Enviado (plantilla)");
  },

  // ---- Helpers de PLANTILLA de alto nivel (proactivo) ----

  /** Recordatorio de saldo (cron). nombre y saldo ya formateados. */
  sendSaldoRecordatorio: async function (number, nombre, saldoFormateado) {
    const tpl = T.TEMPLATES.SALDO_RECORDATORIO;
    const r = await sendTemplate(number, tpl.name, tpl.language, { body: [nombre, saldoFormateado] });
    return normalizeResult(r, "Enviado (plantilla saldo_recordatorio)");
  },

  /** Entrega de Estado de Cuenta (PDF) por plantilla, proactivo. */
  sendEstadoCuentaTemplate: async function (number, nombre, buffer, fileName = "EdoCta.pdf") {
    let url;
    try {
      url = await uploadPdfBuffer(buffer, fileName);
    } catch (e) {
      return { error: true, message: "No se pudo subir el PDF: " + (e?.message || e) };
    }
    const tpl = T.TEMPLATES.ENVIO_ESTADO_CUENTA;
    const r = await sendTemplate(number, tpl.name, tpl.language, {
      body: [nombre],
      document: { url, filename: fileName },
    });
    return normalizeResult(r, "Enviado (plantilla envio_estado_cuenta)");
  },

  /** Entrega de documento genérico (PDF) por plantilla, proactivo. */
  sendDocumentoTemplate: async function (number, nombre, tipoDocumento, buffer, fileName = "documento.pdf") {
    let url;
    try {
      url = await uploadPdfBuffer(buffer, fileName);
    } catch (e) {
      return { error: true, message: "No se pudo subir el PDF: " + (e?.message || e) };
    }
    const tpl = T.TEMPLATES.ENVIO_DOCUMENTO;
    const r = await sendTemplate(number, tpl.name, tpl.language, {
      body: [nombre, tipoDocumento],
      document: { url, filename: fileName },
    });
    return normalizeResult(r, "Enviado (plantilla envio_documento)");
  },
};
