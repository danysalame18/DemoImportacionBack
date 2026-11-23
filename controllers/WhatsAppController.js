const { WhatsAppService } = require("../services");

/**
 * Controller WhatsApp
 * - login: inicia servicio si es necesario y devuelve QR (si aplica)
 * - status: devuelve estado consistente + info de lock/reintentos
 * - restart/hardReset
 * - enviarMsg / sendPDF / sendPDFFront
 */
module.exports = {
  // ---- WEBHOOK Meta ----
  // GET: verificación del webhook (Meta envía hub.mode / hub.verify_token / hub.challenge)
  verifyWebhook: (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    const result = WhatsAppService.verifyWebhook(mode, token, challenge);
    if (result.ok) {
      return res.status(200).send(result.challenge);
    }
    return res.sendStatus(403);
  },

  // POST: recepción de eventos (mensajes entrantes, estados de entrega)
  receiveWebhook: (req, res) => {
    // Validación de firma (si WA_APP_SECRET está configurado)
    if (WhatsAppService.isSignatureRequired?.()) {
      const signature = req.headers["x-hub-signature-256"];
      const ok = WhatsAppService.verifySignature(req.rawBody, signature);
      if (!ok) {
        console.warn("Webhook con firma inválida; descartado.");
        return res.sendStatus(401);
      }
    }
    try {
      WhatsAppService.receiveWebhook(req.body);
    } catch (e) {
      console.error("Error en receiveWebhook:", e?.message || e);
    }
    // Siempre 200 rápido para que Meta no reintente
    return res.sendStatus(200);
  },

  // GET: catálogo de plantillas a dar de alta en Meta (referencia/consulta)
  templatesCatalog: (req, res) => {
    return res.status(200).json({
      ok: true,
      total: WhatsAppService.getTemplatesCatalog().length,
      plantillas: WhatsAppService.getTemplatesCatalog(),
    });
  },

  login: async (req, res) => {
    const clientG = WhatsAppService.getClientG();

    // Si no hay cliente, intenta iniciar
    if (!clientG) {
      try {
        await WhatsAppService.create();
      } catch (e) {
        return res.status(500).json({
          message: "Error iniciando WhatsApp",
          error: e?.message || String(e),
          info: WhatsAppService.getReconnectInfo?.(),
        });
      }

      return res.status(202).json({
        message: "Inicializando WhatsApp, intenta de nuevo",
        info: WhatsAppService.getReconnectInfo?.(),
      });
    }

    if (WhatsAppService.isReady()) {
      return res.status(200).json({ ready: true, message: "Ya está conectado" });
    }

    // Espera QR con timeout (no infinito)
    const timeoutMs = 30000;
    const start = Date.now();
    let qr = WhatsAppService.getLastQrCode?.();

    while (!qr && Date.now() - start < timeoutMs) {
      await new Promise((r) => setTimeout(r, 500));
      qr = WhatsAppService.getLastQrCode?.();
    }

    if (!qr) {
      return res.status(202).json({
        message: "Aún no hay QR (sigue inicializando)",
        info: WhatsAppService.getReconnectInfo?.(),
      });
    }

    return res.status(200).json({ message: "QR generado", qr });
  },

  status: async (req, res) => {
    const info = WhatsAppService.getReconnectInfo?.() || {};
    const clientG = WhatsAppService.getClientG?.() || null;
    const ready = WhatsAppService.isReady?.() || false;
    const qr = !!WhatsAppService.getLastQrCode?.();
    const state = WhatsAppService.getState?.();

    return res.status(200).json({
      ok: true,
      hasClient: !!clientG,
      ready,
      qr,
      state,
      info,
    });
  },

  restart: async (req, res) => {
    try {
      console.log("🔄 Solicitud de reinicio manual recibida");
      await WhatsAppService.restart();
      return res.status(200).json({
        message: "Servicio WhatsApp reiniciado exitosamente",
        info: WhatsAppService.getReconnectInfo?.(),
      });
    } catch (error) {
      console.error("❌ Error al reiniciar servicio WhatsApp:", error);
      return res.status(500).json({
        error: true,
        message: "Error al reiniciar el servicio: " + (error?.message || String(error)),
      });
    }
  },

  hardReset: async (req, res) => {
    try {
      console.log("🧹 Solicitud de hard reset recibida");
      const result = await WhatsAppService.hardReset();
      return res.status(200).json({
        message: "Hard reset completado exitosamente - todas las sesiones limpiadas",
        result,
        info: WhatsAppService.getReconnectInfo?.(),
      });
    } catch (error) {
      console.error("❌ Error durante hard reset:", error);
      return res.status(500).json({
        error: true,
        message: "Error durante hard reset: " + (error?.message || String(error)),
      });
    }
  },

  enviarMsg: async (req, res) => {
    try {
      const { number, message, idempotencyKey } = req.body || {};
      const r = await WhatsAppService.sendMsg(number, message, idempotencyKey);
      return res.status(r?.error ? 400 : 200).json(r);
    } catch (e) {
      return res.status(500).json({ error: true, message: e?.message || "Error enviando mensaje" });
    }
  },

  sendPDF: async (req, res) => {
    try {
      const body = req.body || {};
      const number = body.number;
      const fileName = body.fileName || "documento.pdf";
      const mimetype = body.mimetype || body.mime || "application/pdf";
      const idempotencyKey = body.idempotencyKey;

      // Acepta varios nombres de campo para compatibilidad
      const b64 = body.base64File || body.bufferBase64 || body.file || body.pdfBase64 || "";
      const buffer = b64 ? Buffer.from(String(b64), "base64") : null;

      const r = await WhatsAppService.sendPDF(number, buffer, fileName, mimetype, idempotencyKey);
      return res.status(r?.error ? 400 : 200).json(r);
    } catch (e) {
      return res.status(400).json({ error: true, message: e?.message || "PDF inválido" });
    }
  },

  // Soporta 2 modos:
  // 1) query + body binario (como lo tienes)
  // 2) JSON { number, message, base64File, fileName, mimetype }
  sendPDFFront: async (req, res) => {
    try {
      // Modo JSON
      if (req.is("application/json")) {
        const body = req.body || {};
        const number = body.number;
        const message = body.message || "";
        const fileName = body.fileName || "documento.pdf";
        const mimetype = body.mimetype || body.mime || "application/pdf";
        const idempotencyKey = body.idempotencyKey;
        const b64 = body.base64File || body.bufferBase64 || "";
        const buffer = b64 ? Buffer.from(String(b64), "base64") : null;

        const r = await WhatsAppService.sendPDFFront(number, message, buffer, fileName, mimetype, idempotencyKey);
        return res.status(r?.error ? 400 : 200).json(r);
      }

      // Modo binario (stream)
      const q = req.query || {};
      const number = q.number;
      const message = q.message || "";
      const fileName = q.fileName || "documento.pdf";
      const mimetype = q.mimetype || "application/pdf";
      const idempotencyKey = q.idempotencyKey;

      const chunks = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", async () => {
        const buffer = Buffer.concat(chunks);
        const r = await WhatsAppService.sendPDFFront(number, message, buffer, fileName, mimetype, idempotencyKey);
        res.status(r?.error ? 400 : 200).json(r);
      });
    } catch (e) {
      return res.status(500).json({ error: true, message: e?.message || "Error enviando PDF" });
    }
  },
};
