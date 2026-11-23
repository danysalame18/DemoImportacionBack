const { makeWASocket, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const BaileysMongo = require("baileys-mongo");
const { Boom } = require("@hapi/boom");
const pino = require("pino");
const EventEmitter = require("events");
const { randomUUID } = require("crypto"); // NEW: owner único por proceso
var cron = require("node-cron");

class WhatsAppMessageEmitter extends EventEmitter {}
const messageEmitter = new WhatsAppMessageEmitter();

let mongoDB = null;
let auth = null;
let clientG = null;
let lastQrCode = null;
let ready = false;
let status = 0;

// Variables para control de reconexión
let reconnectAttempts = 0;
let maxReconnectAttempts = 5; // Reducir intentos
let isReconnecting = false;
let reconnectTimeout = null;
let circuitBreakerTripped = false;
let conflictErrorCount = 0;
let lastConnectionTime = 0;

// Variables de diagnóstico
let clientInstances = 0;
let eventListenerCount = 0;
let activeTimeouts = new Set();
let memoryUsageStart = process.memoryUsage();

// NEW: intervalos activos (heartbeat)
let activeIntervals = new Set();

// NEW: candados/banderas
let creating = false;               // evita create() concurrente
let hasInitializedAuth = false;     // inicializar auth una sola vez

// NEW: lock distribuido (sin cambiar tu sesión)
const LOCK_COLLECTION = process.env.WA_LOCK_COLLECTION || "wa_session_locks";
const LOCK_TTL_MS = parseInt(process.env.WA_LOCK_TTL_MS || "45000", 10);          // si no late el heartbeat por >45s, el lock se considera vencido
const LOCK_HEARTBEAT_MS = parseInt(process.env.WA_LOCK_HEARTBEAT_MS || "10000", 10);
const INSTIT = (process.env.REACT_APP_NOMBRE_INSTITUCION || "default").trim();
const LOCK_KEY = `${INSTIT}:wa`;
const OWNER_ID = process.env.WA_LOCK_OWNER_ID || randomUUID();                    // identifica a este proceso

// === OUTBOX: configuración e índices ===
const OUTBOX_COLLECTION = process.env.WA_OUTBOX_COLLECTION || "wa_outbox";
const OUTBOX_LOCK_MS = parseInt(process.env.WA_OUTBOX_LOCK_MS || "30000", 10); // lock por job: 30s

// Colección para guardar el QR actual
const QR_COLLECTION = process.env.WA_QR_COLLECTION || "wa_qr_codes";

// Guardar/actualizar el QR en la BD (Prisma Mongo)
async function upsertQrCode(prisma, qr) {
  if (!prisma) return;

  try {
    const instanceKey = process.env.REACT_APP_NOMBRE_INSTITUCION || "default";

    const updateData = {
      instanceKey,
      updatedAt: new Date(),
    };

    // Si viene un QR nuevo lo guardamos, si no, dejamos qr en null
    if (qr) {
      updateData.qr = qr;
    } else {
      updateData.qr = null;
    }

    await prisma.$runCommandRaw({
      update: QR_COLLECTION, 
      updates: [
        {
          q: { instanceKey },
          u: {
            $set: updateData,
          },
          upsert: true,
          multi: false,
        },
      ],
    });

    console.log(
      qr
        ? `💾 QR actualizado en DB para instancia ${instanceKey}.`
        : `🧹 QR limpiado en DB para instancia ${instanceKey}.`
    );
  } catch (e) {
    console.error("❌ Error guardando QR en DB:", e);
  }
}



async function ensureOutboxIndexes(prisma) {
  try {
    await prisma.$runCommandRaw({
      createIndexes: OUTBOX_COLLECTION,
      indexes: [
        { key: { status: 1, lockedAt: 1, createdAt: 1 }, name: "status_locked_created" },
        { key: { idempotencyKey: 1 }, name: "idempotency_unique", unique: true, sparse: true },
      ],
    });
    console.log(`📦 Índices del outbox verificados (${OUTBOX_COLLECTION}).`);
  } catch (e) {
    console.warn("Outbox index create (ignorable):", e.message || e);
  }
}


let lockOwned = false;
let waitingLock = false;

// Standby informativo
let standby = { active: false, reason: "", since: 0 };

// Función de diagnóstico de memoria
function logMemoryUsage(context) {
  const usage = process.memoryUsage();
  const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
  // console.log(`[MEMORY DIAGNOSTIC] ${context}: Heap Used: ${heapUsedMB}MB, Heap Total: ${heapTotalMB}MB, Client Instances: ${clientInstances}, Event Listeners: ${eventListenerCount}, Active Timeouts: ${activeTimeouts.size}`);
}

// Limpiar todos los timeouts activos
function clearAllActiveTimeouts() {
  for (const t of activeTimeouts) clearTimeout(t);
  activeTimeouts.clear();
  reconnectTimeout = null;
}

// NEW: limpiar todos los intervals activos (heartbeats)
function clearAllActiveIntervals() {
  for (const h of activeIntervals) clearInterval(h);
  activeIntervals.clear();
}

// Función para eliminar sesiones guardadas
async function deleteWhereKeyContainsTest(prisma) {
  try {
    const docsContainingTest = await prisma.auth.findMany({
      where: {
        key: {
          contains: process.env.REACT_APP_NOMBRE_INSTITUCION,
        },
      },
      select: { id: true },
    });

    const deletionPromises = docsContainingTest.map((doc) =>
      prisma.auth.delete({ where: { id: doc.id } })
    );

    await Promise.all(deletionPromises);
    console.log("Sesiones anteriores eliminadas correctamente.");
  } catch (error) {
    console.error("Error al eliminar sesiones:", error);
  }
}

// Función de timeout
function timeoutPromise(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout: no se pudo enviar el mensaje a tiempo")), ms)
  );
}

// Backoff exponencial mejorado
function getBackoffDelay(attempt) {
  const baseDelay = 10000; // 10 segundos base (aumentado)
  const maxDelay = 600000; // 10 minutos máximo (aumentado)
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = Math.random() * 2000; // Más variación aleatoria
  return delay + jitter;
}

// Circuit breaker para detectar errores persistentes
function checkCircuitBreaker() {
  const now = Date.now();
  
  if (conflictErrorCount >= 3) {
    circuitBreakerTripped = true;
    console.error("🚨 CIRCUIT BREAKER ACTIVADO: Demasiados errores de conflicto (440). Deteniendo reconexiones automáticas.");
    console.error("💡 SOLUCIÓN: Cierra WhatsApp Web en otros dispositivos/navegadores y reinicia manualmente.");
    return false;
  }
  
  if (lastConnectionTime > 0 && (now - lastConnectionTime) < 5000) {
    console.warn("⚠️ Conexiones muy rápidas detectadas. Aumentando delay...");
    return false;
  }
  
  return true;
}

// Función para resetear circuit breaker
function resetCircuitBreaker() {
  circuitBreakerTripped = false;
  conflictErrorCount = 0;
  reconnectAttempts = 0;
  console.log("✅ Circuit breaker reseteado");
}

// Función de reconexión mejorada con circuit breaker
async function retryCreate(createFunction) {
  logMemoryUsage(`retryCreate INICIO - Intento ${reconnectAttempts + 1}`);
  
  if (standby.active) {
    console.warn("⏸️ En standby: no se intentará reconectar automáticamente hasta resolver la causa.");
    return;
  }

  if (waitingLock) {
    console.warn("🔒 Esperando lock: no se intentará create() hasta obtener el lock.");
    return;
  }

  if (circuitBreakerTripped) {
    console.error("🚫 Circuit breaker activado. No se intentará reconectar automáticamente.");
    console.error("💡 Para reiniciar: cierra WhatsApp Web en otros dispositivos y usa el endpoint /restart");
    return;
  }
  
  if (isReconnecting) {
    console.log("Ya hay una reconexión en progreso, ignorando...");
    return;
  }

  if (reconnectAttempts >= maxReconnectAttempts) {
    console.error(`🛑 Se alcanzó el límite de ${maxReconnectAttempts} reintentos. Activando circuit breaker.`);
    circuitBreakerTripped = true;
    status = -1; // Estado de error crítico
    logMemoryUsage("retryCreate MAX_ATTEMPTS_REACHED");
    return;
  }

  if (!checkCircuitBreaker()) {
    console.warn("Circuit breaker impide la reconexión. Esperando...");
    return;
  }

  isReconnecting = true;
  const delay = getBackoffDelay(reconnectAttempts);
  
  console.log(`⏳ Esperando ${Math.round(delay/1000)} segundos antes del intento ${reconnectAttempts + 1}...`);
  
  const timeoutId = setTimeout(async () => {
    activeTimeouts.delete(timeoutId);
    try {
      reconnectAttempts++;
      logMemoryUsage(`retryCreate ANTES_CREATE - Intento ${reconnectAttempts}`);
      await createFunction();
      console.log("✅ Reconexión exitosa.");
      resetCircuitBreaker();
      isReconnecting = false;
      logMemoryUsage("retryCreate EXITO");
    } catch (error) {
      console.error(`❌ Intento ${reconnectAttempts} fallido: ${error.message}`);
      isReconnecting = false;
      logMemoryUsage(`retryCreate ERROR - Intento ${reconnectAttempts}`);
      await retryCreate(createFunction);
    }
  }, delay);
  
  activeTimeouts.add(timeoutId);
  reconnectTimeout = timeoutId;
}

// Función para detener reconexiones
function stopReconnection() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    activeTimeouts.delete(reconnectTimeout);
    reconnectTimeout = null;
  }
  clearAllActiveTimeouts();
  isReconnecting = false;
  reconnectAttempts = 0;
  resetCircuitBreaker();
  logMemoryUsage("stopReconnection");
}

// Función para limpiar cliente actual
function cleanupClient() {
  if (clientG) {
    logMemoryUsage("cleanupClient ANTES");
    try {
      clientG.ev.removeAllListeners('creds.update');
      clientG.ev.removeAllListeners('connection.update');
      clientG.ev.removeAllListeners('messages.upsert');
      eventListenerCount = Math.max(0, eventListenerCount - 3);
      
      clientG.end();
      clientG = null;
      clientInstances = Math.max(0, clientInstances - 1);
      logMemoryUsage("cleanupClient DESPUES");
    } catch (error) {
      console.error("Error durante limpieza de cliente:", error);
    }
  }
  // NEW: detener heartbeats
  clearAllActiveIntervals();
  lockOwned = false;
}

// Función para formatear el número de WhatsApp
function formatNumber(number) {
  return number.includes("@s.whatsapp.net") ? number : `521${number}@s.whatsapp.net`;
}

/* =========================
   BLOQUE DE LOCK DISTRIBUIDO
   ========================= */

async function ensureLockIndexes(prisma) {
  try {
    await prisma.$runCommandRaw({
      createIndexes: LOCK_COLLECTION,
      indexes: [
        { key: { key: 1 }, name: "key_unique", unique: true },
      ],
    });
    console.log(`🔐 Índices del lock verificados (${LOCK_COLLECTION}).`);
  } catch (e) {
    // Si ya existen o el proveedor no soporta, ignoramos
    console.warn("Lock index create (ignorable):", e.message || e);
  }
}

function lockExpired(doc) {
  if (!doc || !doc.heartbeat) return true;
  return (Date.now() - new Date(doc.heartbeat).getTime()) > LOCK_TTL_MS;
}

async function acquireLock(prisma) {
  if (!prisma) return false;
  const now = new Date();
  const expireAt = new Date(Date.now() - LOCK_TTL_MS);

  // 1) UPDATE (sin upsert)
  try {
    const upd = await prisma.$runCommandRaw({
      update: LOCK_COLLECTION,
      updates: [{
        q: {
          key: LOCK_KEY,
          $or: [
            { owner: OWNER_ID },
            { owner: null },
            { heartbeat: { $lt: expireAt } },
          ],
        },
        u: { $set: { key: LOCK_KEY, owner: OWNER_ID, heartbeat: now } },
        upsert: false,
        multi: false,
      }],
      ordered: true,
    });
    const modified = (upd && (upd.nModified ?? upd.modifiedCount ?? upd.n)) || 0;
    if (modified > 0) {
      console.log(`🔒 acquireLock -> OK (update) owner=${OWNER_ID}`);
      return true;
    }
  } catch (e) {
    console.warn("acquireLock update error (continuable):", e?.meta?.message || e.message || e);
  }

  // 2) INSERT (si no existe doc)
  try {
    const ins = await prisma.$runCommandRaw({
      insert: LOCK_COLLECTION,
      documents: [{ key: LOCK_KEY, owner: OWNER_ID, heartbeat: now }],
      ordered: true,
    });
    const hasWriteErrors = !!(ins && ins.writeErrors && ins.writeErrors.length);
    const inserted = (ins && (ins.n === 1 || ins.insertedCount === 1)) && !hasWriteErrors;
    console.log(`🔒 acquireLock -> ${inserted ? "OK" : "NO"} (insert) owner=${OWNER_ID}`);
    return !!inserted;
  } catch (e) {
    const msg = e?.meta?.message || e.message || "";
    if (msg.includes("E11000")) {
      console.warn("🔒 acquireLock -> NO (otro proceso creó el lock primero). Me quedo en espera.");
      return false;
    }
    throw e;
  }
}



async function refreshLock(prisma) {
  if (!prisma) return false;
  const now = new Date();
  const res = await prisma.$runCommandRaw({
    findAndModify: LOCK_COLLECTION,
    query: { key: LOCK_KEY, owner: OWNER_ID },
    update: { $set: { heartbeat: now } },
    new: true,
  });
  const ok = !!(res && res.value && res.value.owner === OWNER_ID);
  if (!ok) console.warn("⚠️ Perdí el lock en refreshLock()");
  return ok;
}

async function releaseLock(prisma) {
  if (!prisma) return false;
  const res = await prisma.$runCommandRaw({
    findAndModify: LOCK_COLLECTION,
    query: { key: LOCK_KEY, owner: OWNER_ID },
    update: { $set: { owner: null, heartbeat: new Date(0) } },
    new: true,
  });
  const released = !!(res && res.value && res.value.owner === null);
  console.log("🔓 releaseLock ->", released);
  return released;
}

function startHeartbeat(prisma) {
  // Evitar duplicados
  for (const h of activeIntervals) clearInterval(h);
  activeIntervals.clear();

  const interval = setInterval(async () => {
    try {
      const ok = await refreshLock(prisma);
      if (!ok) {
        // Perdimos el lock: paramos socket y esperamos lock de nuevo
        console.warn("🔕 Heartbeat: lock perdido. Parando socket y esperando lock...");
        cleanupClient();
        lockOwned = false;
        scheduleLockWait(prisma);
      }
    } catch (e) {
      console.error("Heartbeat error:", e.message || e);
    }
  }, LOCK_HEARTBEAT_MS);

  activeIntervals.add(interval);
  console.log("❤️‍🔥 Heartbeat iniciado.");
}

// === OUTBOX: worker (solo la réplica dueña y ready envía) ===
function startOutboxWorker(prisma) {
  const iv = setInterval(async () => {
    try {
      if (!lockOwned || !ready || !clientG) return; // solo la dueña envía
      const job = await claimNextOutbox(prisma);
      if (!job) return;

      const to = formatNumber(job.to);
      let waRespId = null;

      try {
        if (job.kind === "text") {
          const r = await clientG.sendMessage(to, { text: job.text || "" });
          waRespId = r?.key?.id || null;
          await completeOutbox(prisma, job._id, true, waRespId);
          return;
        }

        if (job.kind === "pdf") {
          const buf = bufferFromBase64(job.bufferBase64 || "");
          if (!buf) throw new Error("bufferBase64 inválido");
          const data = { document: Buffer.from(buf), fileName: job.fileName, mimetype: job.mime };
          const r = await clientG.sendMessage(to, data);
          waRespId = r?.key?.id || null;
          await completeOutbox(prisma, job._id, true, waRespId);
          return;
        }

        if (job.kind === "text+pdf") {
          await clientG.sendMessage(to, { text: job.text || "" });
          const buf = bufferFromBase64(job.bufferBase64 || "");
          if (!buf) throw new Error("bufferBase64 inválido");
          const data = { document: Buffer.from(buf), fileName: job.fileName, mimetype: job.mime };
          const r = await clientG.sendMessage(to, data);
          waRespId = r?.key?.id || null;
          await completeOutbox(prisma, job._id, true, waRespId);
          return;
        }

        throw new Error(`kind desconocido: ${job.kind}`);
      } catch (err) {
        console.error("Outbox send error:", err?.message || err);
        await completeOutbox(prisma, job._id, false, waRespId, err?.message);
      }
    } catch (err) {
      console.error("Outbox worker loop error:", err?.message || err);
    }
  }, 1000); // cada 1s

  activeIntervals.add(iv);
  console.log("🚚 Outbox worker iniciado.");
}


function scheduleLockWait(prisma, delayMs = 15000) {
  if (waitingLock) return;
  waitingLock = true;
  standby = { active: true, reason: "lock-not-owned", since: Date.now() };
  console.warn(`🔒 Esperando lock (${LOCK_KEY})... reintento en ${Math.round(delayMs/1000)}s`);

  const t = setTimeout(async () => {
    activeTimeouts.delete(t);
    try {
      const got = await acquireLock(prisma);
      if (got) {
        console.log("✅ Lock obtenido. Saliendo de standby y creando socket...");
        lockOwned = true;
        waitingLock = false;
        standby = { active: false, reason: "", since: 0 }; // Clear standby
        startHeartbeat(prisma);
        await ensureOutboxIndexes(prisma);
        startOutboxWorker(prisma);
        await module.exports.create();
      } else {
        waitingLock = false;
        scheduleLockWait(prisma, Math.min(delayMs * 1.5, 60000)); // backoff
      }
    } catch (e) {
      console.error("Error al intentar obtener lock:", e.message || e);
      waitingLock = false;
      scheduleLockWait(prisma, Math.min(delayMs * 1.5, 60000));
    }
  }, delayMs);

  activeTimeouts.add(t);
}

// === OUTBOX: helpers ===
function now() { return new Date(); }

async function enqueueOutbox(prisma, job) {
  // job: { kind:'text'|'pdf'|'text+pdf', to, text?, fileName?, mime?, bufferBase64?, idempotencyKey? }
  const doc = {
    ...job,
    idempotencyKey: job.idempotencyKey || randomUUID(),
    status: "queued",
    attempts: 0,
    createdAt: now(),
    lockedAt: null,
    worker: null,
    error: null,
  };

  const res = await prisma.$runCommandRaw({
    insert: OUTBOX_COLLECTION,
    documents: [doc],
    ordered: true,
  });

  const hasWriteErrors = !!(res && res.writeErrors && res.writeErrors.length);
  const ok = (res && (res.ok === 1 || res.n === 1)) && !hasWriteErrors;
  console.log(`📮 Outbox enqueue -> ${ok ? "OK" : "NO"} key=${doc.idempotencyKey} kind=${doc.kind}`);
  return { ok: !!ok, idempotencyKey: doc.idempotencyKey };
}

async function claimNextOutbox(prisma) {
  const expire = new Date(Date.now() - OUTBOX_LOCK_MS);
  const res = await prisma.$runCommandRaw({
    findAndModify: OUTBOX_COLLECTION,
    query: {
      status: "queued",
      $or: [{ lockedAt: null }, { lockedAt: { $lt: expire } }],
    },
    sort: { createdAt: 1 },
    update: {
      $set: { status: "sending", lockedAt: now(), worker: OWNER_ID },
      $inc: { attempts: 1 },
    },
    new: true,
  });
  return res && res.value ? res.value : null;
}

async function completeOutbox(prisma, _id, ok, waId, errMsg) {
  const update = ok
    ? { $set: { status: "sent", sentAt: now(), waId, error: null, lockedAt: null } }
    : { $set: { status: "failed", error: errMsg || "unknown", lockedAt: null } };
  await prisma.$runCommandRaw({
    findAndModify: OUTBOX_COLLECTION,
    query: { _id },
    update,
    new: true,
  });
}

function bufferFromBase64(b64) {
  try { return Buffer.from(b64, "base64"); } catch { return null; }
}


cron.schedule(
  "0 0 * * *",
  async () => {
    const DistributedLockService = require("./DistributedLockService");
    const result = await DistributedLockService.executeWithLock(
      'descartar-pendientes-whatsapp',
      async () => {
        const resultadoDescarte = await descartarPendientes();
        console.log("Se completó el descarte de mensajes pendientes");
        return resultadoDescarte;
      },
      10 // TTL 10 minutos para operación de limpieza
    );
    
    if (result === null) {
      console.log('⏭️ Otra instancia ya está procesando descarte de mensajes pendientes');
    }
  },
  {
    scheduled: true,
    timezone: "America/Mexico_City",
  }
);

async function descartarPendientes(){
  try {
    // Verificar que mongoDB esté disponible, con reintentos
    if (!mongoDB) {
      console.warn("⚠️ descartarPendientes: mongoDB no está disponible, esperando conexión...");
      
      // Esperar hasta 30 segundos para que mongoDB esté disponible
      let retries = 6; // 6 intentos x 5 segundos = 30 segundos máximo
      while (!mongoDB && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
        retries--;
        if (!mongoDB && retries > 0) {
          console.log(`⏳ Esperando conexión MongoDB... (${retries} intentos restantes)`);
        }
      }
      
      if (!mongoDB) {
        console.error("❌ descartarPendientes: MongoDB no disponible después de 30 segundos");
        return { success: false, message: "MongoDB no disponible después de esperar" };
      }
      
      console.log("✅ MongoDB conectado, procediendo con descarte...");
    }

    console.log("🗑️ Iniciando descarte de mensajes pendientes...");

    // Actualizar todos los mensajes con status "queued" a "descartado"
    const result = await mongoDB.$runCommandRaw({
      update: OUTBOX_COLLECTION,
      updates: [{
        q: { status: "queued" },
        u: {
          $set: {
            status: "descartado",
            discardedAt: now(),
            error: "Descartado por tarea programada"
          }
        },
        upsert: false,
        multi: true
      }],
      ordered: false
    });

    const modifiedCount = result?.nModified ?? result?.modifiedCount ?? 0;
    
    if (modifiedCount > 0) {
      console.log(`✅ Se descartaron ${modifiedCount} mensajes pendientes`);
      return {
        success: true,
        message: `${modifiedCount} mensajes descartados exitosamente`,
        count: modifiedCount
      };
    } else {
      console.log("ℹ️ No se encontraron mensajes pendientes para descartar");
      return {
        success: true,
        message: "No había mensajes pendientes",
        count: 0
      };
    }

  } catch (error) {
    console.error("❌ Error al descartar mensajes pendientes:", error?.message || error);
    return {
      success: false,
      message: `Error: ${error?.message || "Error desconocido"}`,
      error: error
    };
  }
}

// descartarPendientes()

/* =========================
   FIN BLOQUE DE LOCK
   ========================= */

module.exports = {
  getMessageEmitter: () => messageEmitter,
  getClientG: () => clientG,
  getLastQrCode: () => lastQrCode,
  isReady: () => ready,
  getState: () => status,
  getReconnectInfo: () => ({
    attempts: reconnectAttempts,
    isReconnecting,
    maxAttempts: maxReconnectAttempts,
    circuitBreakerTripped,
    conflictErrorCount,
    standby,
    lockOwned,
    waitingLock,
    ownerId: OWNER_ID,
    lockKey: LOCK_KEY,
  }),
  
    // 🔹 NUEVO: solo crear el cliente WA si la instancia está habilitada como worker
    initIfEnabled: async function () {
      const enabled = process.env.ENABLE_WHATSAPP_WORKER === "1";
      if (!enabled) {
        console.log("🚫 WhatsApp worker deshabilitado en esta instancia (ENABLE_WHATSAPP_WORKER != 1)");
        return;
      }

      console.log("✅ WhatsApp worker habilitado en esta instancia. Iniciando create()...");
      await this.create();
    },

  // Función para reiniciar manualmente el servicio
  restart: async function() {
    console.log("🔄 Reiniciando servicio WhatsApp manualmente...");
    logMemoryUsage("restart INICIO");
    stopReconnection();
    cleanupClient();
    ready = false;
    status = 0;
    resetCircuitBreaker();
    console.log("💡 Circuit breaker reseteado. Intentando reconexión...");
    logMemoryUsage("restart ANTES_CREATE");
    await this.create();
    logMemoryUsage("restart FINALIZADO");
  },

  // Función para reset completo con limpieza de datos
  hardReset: async function() {
    console.log("🧹 HARD RESET: Limpiando completamente el estado de WhatsApp...");
    logMemoryUsage("hardReset INICIO");
    
    stopReconnection();
    cleanupClient();

    ready = false;
    status = 0;
    lastQrCode = null;
    resetCircuitBreaker();

    try {
      if (mongoDB) {
        console.log("🗑️ Eliminando sesiones...");
        await deleteWhereKeyContainsTest(mongoDB);
        
        // 🔧 FORCE CLEAR: Eliminar CUALQUIER lock existente para este LOCK_KEY
        console.log("🔓 Forzando liberación de lock existente...");
        try {
          await mongoDB.$runCommandRaw({
            delete: LOCK_COLLECTION,
            deletes: [{
              q: { key: LOCK_KEY },
              limit: 0  // delete all matching
            }]
          });
          console.log("✅ Lock forzadamente liberado");
        } catch (e) {
          console.warn("Lock force-clear warning (ignorable):", e.message || e);
        }
      }

      auth = null;
      mongoDB = null;
      hasInitializedAuth = false;
      lockOwned = false;
      waitingLock = false;

      console.log("✅ Estado completamente limpiado. Creando nueva sesión...");
      logMemoryUsage("hardReset ANTES_CREATE");
      
      await this.create();
      
      console.log("🟢 Hard reset completado exitosamente");
      logMemoryUsage("hardReset FINALIZADO");
      
      return { success: true, message: "Hard reset completado exitosamente" };
      
    } catch (error) {
      console.error("❌ Error durante hard reset:", error);
      logMemoryUsage("hardReset ERROR");
      throw new Error(`Hard reset falló: ${error.message}`);
    }
  },

  create: async function () {
    if (creating) {
      console.log("create() ya en progreso, omitiendo...");
      return;
    }
    creating = true;

    try {
      logMemoryUsage("create INICIO");
      
      // Inicializar auth UNA sola vez
      if (!hasInitializedAuth && clientG === null) {
        const { createNewAuth } = await BaileysMongo.BaileysMongo.init();
        const authResults = await createNewAuth(process.env.REACT_APP_NOMBRE_INSTITUCION);
        mongoDB = authResults.mongoDB;
        const authHandler = await authResults.auth.useAuthHandler();
        auth = authHandler;
        hasInitializedAuth = true;
        logMemoryUsage("create AUTH_CREADO");

        // NEW: asegurar índice del lock
        await ensureLockIndexes(mongoDB);
        
        // 🔍 DIAGNOSTIC: Check auth state before socket creation
        console.log("🔍 [DIAGNOSTIC] Auth state keys:", Object.keys(auth.state || {}).length > 0 ? Object.keys(auth.state) : "EMPTY");
        console.log("🔍 [DIAGNOSTIC] Has creds.me?", !!auth.state?.creds?.me);
        console.log("🔍 [DIAGNOSTIC] Has registrationId?", !!auth.state?.creds?.registrationId);
        console.log("🔍 [DIAGNOSTIC] Sessions count:", Object.keys(auth.state?.sessions || {}).length);
      }

      // Si no tenemos lock, lo intentamos obtener (sin caernos)
      if (!lockOwned) {
        const got = await acquireLock(mongoDB);
        if (!got) {
          console.warn("🔒 No se obtuvo el lock. Entrando en espera y reintentando...");
          scheduleLockWait(mongoDB); // reintenta en background
          standby = { active: true, reason: "lock-not-owned", since: Date.now() };
          return; // NO crear socket hasta tener lock
        }
        lockOwned = true;
        standby = { active: false, reason: "", since: 0 }; // Clear standby when lock acquired
        startHeartbeat(mongoDB);
        await ensureOutboxIndexes(mongoDB);
        startOutboxWorker(mongoDB);
      }

      // Limpiar cliente anterior si existe
      if (clientG) {
        cleanupClient();
      }

      // Negociar versión de WhatsApp Web
      const { version } = await fetchLatestBaileysVersion();
      console.log("🔍 [DIAGNOSTIC] Baileys version:", version?.join('.'));

      clientG = makeWASocket({
        version,
        auth: auth.state,
        browser: ["Windows", "Chrome", "10.0"], // Windows browser fingerprint
        logger: pino({ level: "silent" }),
        syncFullHistory: false,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 25000, // Standard WhatsApp Web interval
        retryRequestDelayMs: 250,
        maxMsgRetryCount: 5,
        markOnlineOnConnect: false,
        fireInitQueries: true,
        generateHighQualityLinkPreview: false,
        printQRInTerminal: false,
        emitOwnEvents: false,
        getMessage: async () => undefined,
      });
      
      console.log("🔍 [DIAGNOSTIC] Socket creado, esperando eventos...");
      
      clientInstances++;
      logMemoryUsage("create CLIENTE_CREADO");

      clientG.ev.on("creds.update", async () => {
        try {
          await auth.saveState();
        } catch (error) {
          console.error("Error guardando credenciales:", error);
        }
      });
      eventListenerCount++;
      logMemoryUsage("create LISTENER_CREDS_ADDED");

      clientG.ev.on("connection.update", async (update) => {
        try {
          // 🔍 Log EVERY connection update for debugging
          console.log("🔍 [DIAGNOSTIC] connection.update:", {
            connection: update.connection,
            isNewLogin: update.isNewLogin,
            qr: update.qr ? "QR_PRESENTE" : "NO_QR",
            receivedPendingNotifications: update.receivedPendingNotifications,
            lastDisconnect: update.lastDisconnect ? "ERROR_PRESENTE" : "NO_ERROR"
          });
          
          const state = update.connection;

          if (state === "open") {
            console.log("🟢 Client is connected!");
            
            // 🔍 Check if we're actually authenticated (not just socket open)
            const isAuthenticated = !!(auth?.state?.creds?.me);
            console.log("🔍 [DIAGNOSTIC] Socket open - Authenticated?", isAuthenticated);
            
            if (isAuthenticated) {
              // Solo si estamos autenticados, marcamos como ready
              ready = true;
              status = 2;
              lastConnectionTime = Date.now();
              resetCircuitBreaker();
              isReconnecting = false;

              clearAllActiveTimeouts();
              stopReconnection();

              // 🔹 Ahora SÍ limpiamos el QR porque estamos autenticados
              lastQrCode = null;
              if (mongoDB) {
                upsertQrCode(mongoDB, null);
              }
              console.log("✅ WhatsApp autenticado y conectado completamente");
            } else {
              // Socket abierto pero no autenticado - esperando escaneo de QR
              console.log("⏳ Socket conectado, esperando escaneo de QR...");
              ready = false;
              status = 1; // Esperando QR
            }

            logMemoryUsage("connection OPEN");
          }

            const qr = update.qr;
            if (qr) {
              console.log("🔍 [DIAGNOSTIC] New QR code received, length:", qr.length);
              lastQrCode = qr;
              ready = false;
              status = 1;

              // 🔹 Guardar QR en la base de datos para que el Servicio A lo pueda leer
              if (mongoDB) {
                upsertQrCode(mongoDB, qr);
              }
            }
            
            // 🔍 Log pairing code if available (WhatsApp might send this instead of QR sometimes)
            if (update.isNewLogin !== undefined) {
              console.log("🔍 [DIAGNOSTIC] isNewLogin:", update.isNewLogin);
            }

          if (state === "close") {
            ready = false;
            const boom = new Boom(update.lastDisconnect?.error);
            const disconnectCode = boom.output.statusCode;
            console.error(`🔴 Conexión cerrada - Código: ${disconnectCode}, Razón: ${boom.message}`);

            const rawErr = update.lastDisconnect?.error;
            console.error("WA CLOSE RAW ERROR:", {
              statusCode: disconnectCode,
              data: rawErr?.data,
              message: rawErr?.message,
              stack: rawErr?.stack ? rawErr.stack.split("\n").slice(0,2).join(" | ") : undefined
            });
            
            // 🔍 DIAGNOSTIC: Check if this is 401 conflict specifically
            if (disconnectCode === 401) {
              console.log("🔍 [DIAGNOSTIC] 401 Error Details:");
              console.log("  - Message:", rawErr?.message);
              console.log("  - Has 'conflict' in message?", (rawErr?.message || '').includes('conflict'));
              console.log("  - Has 'Stream Errored' in message?", (rawErr?.message || '').includes('Stream Errored'));
              console.log("  - Data.tag:", rawErr?.data?.tag);
              console.log("  - Data.attrs.code:", rawErr?.data?.attrs?.code);
            }

            logMemoryUsage(`connection CLOSE - Código: ${disconnectCode}`);

            // Limpiar cliente antes de cualquier reconexión
            cleanupClient();

            // 🔧 Handle 401 errors (conflict OR logged out)
            if (disconnectCode === 401) {
              const isConflict = (rawErr?.message || '').includes('conflict') ||
                                 (rawErr?.message || '').includes('Stream Errored');
              
              if (isConflict) {
                console.log("🔍 [DIAGNOSTIC] Detected 401 conflict - likely old session data interfering");
                console.log("💡 Clearing all session data and restarting fresh...");
                
                // Clear everything and start fresh
                try { await releaseLock(mongoDB); } catch (_) {}
                lockOwned = false;
                await deleteWhereKeyContainsTest(mongoDB);
                lastQrCode = null;
                status = 0;
                conflictErrorCount = 0;
                
                // Force clear the lock to ensure we can reacquire it
                try {
                  await mongoDB.$runCommandRaw({
                    delete: LOCK_COLLECTION,
                    deletes: [{
                      q: { key: LOCK_KEY },
                      limit: 0
                    }]
                  });
                  console.log("🔓 Lock forzadamente liberado tras conflicto");
                } catch (_) {}
                
                if (mongoDB) {
                  upsertQrCode(mongoDB, null);
                }
                
                // Wait a bit before retrying to avoid immediate conflict
                const wait = 3000 + Math.floor(Math.random() * 2000);
                const t = setTimeout(async () => {
                  activeTimeouts.delete(t);
                  await retryCreate(module.exports.create.bind(module.exports));
                }, wait);
                activeTimeouts.add(t);
                return;
              }
              // If not conflict, fall through to loggedOut handling
            }

            if (disconnectCode === 440) {
              conflictErrorCount++;
              console.error(`⚠️ 440 conflict. Mantengo el lock para evitar thrash. Reintentando con backoff corto...`);
              standby = { active: false, reason: "", since: 0 };
              const wait = 5000 + Math.floor(Math.random() * 2000);
              const t = setTimeout(async () => {
                activeTimeouts.delete(t);
                await retryCreate(module.exports.create.bind(module.exports));
              }, wait);
              activeTimeouts.add(t);
              return;
            }

            // Manejo de otros errores
            switch (disconnectCode) {
              case DisconnectReason.loggedOut:
                console.log("🔓 Sesión cerrada por logout, limpiando datos.");
                try { await releaseLock(mongoDB); } catch (_) {}
                lockOwned = false;
                await deleteWhereKeyContainsTest(mongoDB);
                lastQrCode = null;
                status = 0;
                conflictErrorCount = 0;
                stopReconnection();
                if (mongoDB) {
                  upsertQrCode(mongoDB, null); // <-- agregar esto
                }
                await retryCreate(module.exports.create.bind(module.exports));
                break;

              // ...

              case DisconnectReason.badSession:
              case DisconnectReason.multideviceMismatch:
                console.log("❌ Sesión inválida, eliminando y recreando.");
                try { await releaseLock(mongoDB); } catch (_) {}
                lockOwned = false;
                await deleteWhereKeyContainsTest(mongoDB);
                lastQrCode = null;
                status = 0;
                conflictErrorCount = 0;
                if (mongoDB) {
                  upsertQrCode(mongoDB, null); // <-- agregar esto
                }
                await retryCreate(module.exports.create.bind(module.exports));
                break;

                
              case DisconnectReason.restartRequired:
              case 515: // Restart required code
                console.log("🔄 Reinicio requerido por el servidor (515)");
                console.log("💡 Esto ocurre normalmente después de escanear QR - reconectando inmediatamente...");
                
                // Clear standby and reconnect immediately with short delay
                standby = { active: false, reason: "", since: 0 };
                status = 0;
                
                const quickWait = 2000 + Math.floor(Math.random() * 1000);
                const t = setTimeout(async () => {
                  activeTimeouts.delete(t);
                  // Direct create call, not retryCreate (to bypass standby check)
                  await module.exports.create();
                }, quickWait);
                activeTimeouts.add(t);
                break;
                
              case DisconnectReason.timedOut:
              case 408: // Request timeout
                console.log("⏰ Timeout detectado, esperando antes de reconectar.");
                status = 0;
                lastQrCode = null;
                if (mongoDB) {
                  upsertQrCode(mongoDB, null); // limpiamos QR expirado en BD
                }
                await retryCreate(module.exports.create.bind(module.exports));
                break;

                
              case DisconnectReason.badSession:
              case DisconnectReason.multideviceMismatch:
                console.log("❌ Sesión inválida, eliminando y recreando...");
                try { await releaseLock(mongoDB); } catch (_) {}
                lockOwned = false;
                await deleteWhereKeyContainsTest(mongoDB);
                lastQrCode = null;
                status = 0;
                conflictErrorCount = 0;
                await retryCreate(module.exports.create.bind(module.exports));
                break;
                
              default:
                console.log(`🔄 Reconectando por código: ${disconnectCode}`);
                status = 0;
                await retryCreate(module.exports.create.bind(module.exports));
            }
          }
        } catch (error) {
          console.error("Error crítico en connection.update:", error);
          status = -1;
          logMemoryUsage("connection ERROR_CRITICO");
        }
      });
      eventListenerCount++;
      logMemoryUsage("create LISTENER_CONNECTION_ADDED");

      clientG.ev.on("messages.upsert", async (messagesUpdates) => {
        try {
          for (const message of messagesUpdates.messages) {
            if (!message || !message.key || message.key.fromMe) continue;
            if (!message.message) {
              console.log("Mensaje vacío recibido, ignorando.");
              continue;
            }
            messageEmitter.emit("message", message);
          }
        } catch (error) {
          console.error("Error al procesar mensaje entrante:", error);
        }
      });
      eventListenerCount++;
      logMemoryUsage("create LISTENER_MESSAGES_ADDED");

    } catch (error) {
      console.error("Error crítico al crear cliente WhatsApp:", error);
      status = -1;
      logMemoryUsage("create ERROR_CRITICO");
      throw error;
    } finally {
      creating = false;
    }
    
    logMemoryUsage("create FINALIZADO");
  },

sendMsg: async function (number, message, idempotencyKey) {
  if (ready && lockOwned && clientG) {
    try {
      const to = formatNumber(number);
      const r = await Promise.race([
        clientG.sendMessage(to, { text: message }),
        timeoutPromise(15000)
      ]);
      console.log(`Mensaje enviado a ${to}.`);
      return { error: false, message: "Enviado", waId: r?.key?.id || null };
    } catch (error) {
      console.error(`Error al enviar (directo):`, error.message || "Error desconocido");
      // fallback: encolar abajo
    }
  }
  try {
    const res = await enqueueOutbox(mongoDB, {
      kind: "text",
      to: number,
      text: message,
      idempotencyKey,
    });
    return { error: false, message: "Encolado", idempotencyKey: res.idempotencyKey };
  } catch (e) {
    return { error: true, message: e?.message || "No se pudo encolar" };
  }
},

sendPDF: async (number, buffer, fileName, mimetype, idempotencyKey) => {
  if (!buffer || !fileName) return { error: true, message: "Datos de PDF inválidos" };

  if (ready && lockOwned && clientG) {
    try {
      const to = formatNumber(number);
      const data = { document: Buffer.from(buffer), fileName, mimetype };
      await Promise.race([clientG.sendMessage(to, data), timeoutPromise(30000)]);
      console.log(`PDF enviado a ${to}.`);
      return { error: false, message: "Enviado" };
    } catch (error) { /* fallback a outbox abajo */ }
  }

  try {
    const res = await enqueueOutbox(mongoDB, {
      kind: "pdf",
      to: number,
      fileName,
      mime: mimetype,
      bufferBase64: Buffer.from(buffer).toString("base64"),
      idempotencyKey,
    });
    return { error: false, message: "Encolado", idempotencyKey: res.idempotencyKey };
  } catch (e) {
    return { error: true, message: e?.message || "No se pudo encolar" };
  }
},

sendPDFFront: async (number, message, buffer, fileName, mimetype, idempotencyKey) => {
  if (!buffer || !fileName) return { error: true, message: "Datos de PDF inválidos" };

  if (ready && lockOwned && clientG) {
    try {
      const to = formatNumber(number);
      await Promise.race([clientG.sendMessage(to, { text: message }), timeoutPromise(20000)]);
      await new Promise(r => setTimeout(r, 1000));
      const data = { document: Buffer.from(buffer), fileName, mimetype };
      await Promise.race([clientG.sendMessage(to, data), timeoutPromise(45000)]);
      console.log(`📄 PDF con mensaje enviado a ${to}.`);
      return { error: false, message: "Enviado" };
    } catch (error) { /* fallback a outbox abajo */ }
  }

  try {
    const res = await enqueueOutbox(mongoDB, {
      kind: "text+pdf",
      to: number,
      text: message,
      fileName,
      mime: mimetype,
      bufferBase64: Buffer.from(buffer).toString("base64"),
      idempotencyKey,
    });
    return { error: false, message: "Encolado", idempotencyKey: res.idempotencyKey };
  } catch (e) {
    return { error: true, message: e?.message || "No se pudo encolar" };
  }
},

// Función para descartar mensajes pendientes (también disponible externamente)
descartarPendientes: descartarPendientes,

};
