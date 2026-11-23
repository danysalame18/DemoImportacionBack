const { WhatsAppService } = require("../services");
const BaileysMongo = require("baileys-mongo");
const { PrismaClient } = require("@prisma/client"); 

const QR_COLLECTION = process.env.WA_QR_COLLECTION || "wa_qr_codes";
const INSTANCE_KEY = process.env.REACT_APP_NOMBRE_INSTITUCION;
const ENABLE_WHATSAPP_WORKER = process.env.ENABLE_WHATSAPP_WORKER === "1";

let waPrisma = null;

// Obtener instancia de Prisma para leer wa_qr_codes
async function getWaPrisma() {
  if (waPrisma) return waPrisma;

  try {
    // Intento 1: usar baileys-mongo (por si tu versión sí expone prisma)
    const { BaileysMongo: BaileysMongoClass } = BaileysMongo;
    const initResult = await BaileysMongoClass.init({
      session: INSTANCE_KEY,
      disableAuth: true, // no creamos sesión WA aquí
    });

    if (initResult && initResult.prisma) {
      waPrisma = initResult.prisma;
      return waPrisma;
    }

    console.warn(
      "BaileysMongo.init() no devolvió prisma, usando PrismaClient directo"
    );
  } catch (e) {
    console.warn(
      "BaileysMongo.init() falló, usando PrismaClient directo:",
      e.message || e
    );
  }

  // Fallback: PrismaClient normal que ya usas en el proyecto
  waPrisma = new PrismaClient();
  return waPrisma;
}



// Leer el último QR de la colección wa_qr_codes
async function getQrFromDb() {
  const prisma = await getWaPrisma();

  const result = await prisma.$runCommandRaw({
    find: QR_COLLECTION,
    filter: {
      instanceKey: INSTANCE_KEY,
    },
    sort: { updatedAt: -1 },
    limit: 1,
  });

  const doc =
    result &&
    result.cursor &&
    result.cursor.firstBatch &&
    result.cursor.firstBatch[0];

  if (!doc) return null;

  return {
    qr: doc.qr || null,
    updatedAt: doc.updatedAt || null,
  };
}

module.exports = {
  login: async (req, res) => {
    try {
      // Si viene un "modo estado" (por ej. ?type=state), respondemos el estado igual que antes
      const type = req.query.type || req.body?.type;

      if (type === "state") {
        const state = WhatsAppService.getState();
        if (state == null || state === 0) {
          res.status(200).json({
            message: "El Estado se genero correctamente",
            state: "No Conectado",
          });
          return;
        }

        res.status(200).json({
          message: "El Estado se genero correctamente",
          state: state,
        });
        return;
      }

      // 🔹 MODO WORKER: esta instancia sí tiene el cliente WA en memoria
      if (ENABLE_WHATSAPP_WORKER) {
        const clientG = WhatsAppService.getClientG();
        if (clientG == null) {
          res.status(400).json({ message: "No hay cliente" });
          return;
        }

        const ready = WhatsAppService.isReady();
        if (ready) {
          res
            .status(200)
            .json({ ready: true, message: "Ya está conectado" });
          return;
        }

        // Esperar a que se genere el QR en memoria (flujo actual)
        let newLastQrCode = WhatsAppService.getLastQrCode();
        let attempts = 0;

        while (newLastQrCode == null && attempts < 20) {
          // esperar hasta 20 segundos máx.
          await new Promise((resolve) => setTimeout(resolve, 1000));
          newLastQrCode = WhatsAppService.getLastQrCode();
          attempts++;
        }

        if (!newLastQrCode) {
          return res.status(500).json({
            ready: false,
            qr: "",        // 👈 agrega esto
            message: "No se pudo obtener el QR",
          });
        }

        res.status(200).json({
          ready: false,
          qr: newLastQrCode,
          message: "QR generado correctamente (worker)",
        });
        return;
      }

      // 🔹 MODO API (NO WORKER): esta instancia NO tiene cliente WA
      // Aquí leemos el QR desde la BD, guardado por el worker
      const qrDoc = await getQrFromDb();

      if (!qrDoc || !qrDoc.qr) {
        return res.status(200).json({
          ready: false,
          qr: "", // 👈 en vez de null
          message: "Esperando QR del worker",
        });
      }

      return res.status(200).json({
        ready: false,
        qr: qrDoc.qr || "",          // 👈 aseguramos string
        updatedAt: qrDoc.updatedAt || null,
        message: "QR obtenido desde la BD",
      });
    } catch (err) {
      console.error("❌ Error en WhatsAppController.login:", err);
      res.status(500).json({
        message: "Error interno al obtener QR/estado",
        error: err?.message || err,
      });
    }
  },
   restart: async (req, res) => {
    try {
      console.log("🔄 Solicitud de reinicio manual recibida");
      await WhatsAppService.restart();
      const info = WhatsAppService.getReconnectInfo();
      res.status(200).json({
        message: "Servicio WhatsApp reiniciado exitosamente",
        info: info
      });
    } catch (error) {
      console.error("❌ Error al reiniciar servicio WhatsApp:", error);
      res.status(500).json({
        error: true,
        message: "Error al reiniciar el servicio: " + error.message
      });
    }
  },
  hardReset: async (req, res) => {
    try {
      console.log("🧹 Solicitud de hard reset recibida");
      const result = await WhatsAppService.hardReset();
      const info = WhatsAppService.getReconnectInfo();
      res.status(200).json({
        message: "Hard reset completado exitosamente - todas las sesiones limpiadas",
        result: result,
        info: info
      });
    } catch (error) {
      console.error("❌ Error durante hard reset:", error);
      res.status(500).json({
        error: true,
        message: "Error durante hard reset: " + error.message
      });
    }
  },
  enviarMsg: async (req, res) => {
    const { body } = req;
    const message = await WhatsAppService.sendMsg(body.number, body.message);
    res.status(message.error ? 400 : 200).json(message);
  },
  sendPDF: async (req, res) => {
    const { body } = req;
    const message = await WhatsAppService.sendPDF(body.number, body.message, body.base64File, body.fileName);
    res.status(message.error ? 400 : 200).json(message);
  },
  sendPDFFront: async (req, res) => {
    let data = [];
  req.on('data', chunk => {
    data.push(chunk);
  });
  req.on('end', async () => {
    let buffer = Buffer.concat(data);

    const message = await WhatsAppService.sendPDFFront(req.query.number, req.query.message, buffer, req.query.fileName, req.query.mimetype);
    res.status(message.error ? 400 : 200).json(message);
  });
   
  },
  status: async (req, res) => {
    const clientG = WhatsAppService.getClientG();
    if (clientG == null) {
      res
        .status(400)
        .json({ message: "No hay cliente", state: "No Conectado" });
      return;
    }

    const ready = WhatsAppService.isReady();
    if (!ready) {
      res
        .status(200)
        .json({
          message: "El Estado se genero correctamente",
          state: "No Conectado",
        });
      return;
    }
    const state = WhatsAppService.getState();
    res
      .status(200)
      .json({ message: "El Estado se genero correctamente", state: state });
  },
};
