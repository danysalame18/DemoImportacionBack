const mongoose = require("mongoose");

// Unique instance ID for this Node process
const INSTANCE_ID =
  process.env.WA_OWNER_ID ||
  `instance-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

console.log(`[DISTRIBUTED LOCK] Instance ID: ${INSTANCE_ID}`);

// Schema
const DistributedLockSchema = new mongoose.Schema(
  {
    lockName: { type: String, required: true, unique: true },
    instanceId: { type: String, required: true },
    lockedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { minimize: false }
);

// TTL index (Mongo limpia automáticamente, puede tardar ~1 min)
DistributedLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const DistributedLock =
  mongoose.models.DistributedLock ||
  mongoose.model("DistributedLock", DistributedLockSchema);

// Heartbeats por lock
const heartbeats = new Map();

class DistributedLockService {
  static getInstanceId() {
    return INSTANCE_ID;
  }

  /**
   * Intenta adquirir un lock tipo "lease" (expira).
   * - Si el lock NO existe => lo inserta
   * - Si existe y está expirado => lo toma
   * - Si existe y ya es tuyo => lo renueva
   * - Si existe y es de otro y está fresco => NO lo toma
   *
   * @param {string} lockName
   * @param {number} ttlMinutes - tiempo de vida del lock en minutos (default 1)
   * @returns {boolean}
   */
  static async acquireLock(lockName, ttlMinutes = 1) {
    const now = new Date();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    try {
      // 1) UPDATE si es mío o está expirado
      const upd = await DistributedLock.updateOne(
        {
          lockName,
          $or: [{ instanceId: INSTANCE_ID }, { expiresAt: { $lte: now } }],
        },
        { $set: { instanceId: INSTANCE_ID, lockedAt: now, expiresAt } }
      );

      if (upd.modifiedCount > 0) {
        console.log(
          `[DISTRIBUTED LOCK] ${INSTANCE_ID}: Lock OK (update) ${lockName}`
        );
        return true;
      }

      // 2) INSERT si no existe
      try {
        await DistributedLock.create({
          lockName,
          instanceId: INSTANCE_ID,
          lockedAt: now,
          expiresAt,
        });
        console.log(
          `[DISTRIBUTED LOCK] ${INSTANCE_ID}: Lock OK (insert) ${lockName}`
        );
        return true;
      } catch (e) {
        // Duplicate key = ya existe
        if (e?.code === 11000) {
          console.log(
            `[DISTRIBUTED LOCK] ${INSTANCE_ID}: Lock NO (exists) ${lockName}`
          );
          return false;
        }
        throw e;
      }
    } catch (error) {
      console.error(
        `[DISTRIBUTED LOCK] ${INSTANCE_ID}: Error acquiring lock ${lockName}:`,
        error
      );
      return false;
    }
  }

  /**
   * Renueva el lock si es tuyo.
   * @param {string} lockName
   * @param {number} ttlMinutes
   * @returns {boolean}
   */
  static async renewLock(lockName, ttlMinutes = 1) {
    try {
      const now = new Date();
      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

      const res = await DistributedLock.updateOne(
        { lockName, instanceId: INSTANCE_ID },
        { $set: { expiresAt, lockedAt: now } }
      );

      return res.modifiedCount > 0;
    } catch (error) {
      console.error(
        `[DISTRIBUTED LOCK] ${INSTANCE_ID}: Error renewing lock ${lockName}:`,
        error
      );
      return false;
    }
  }

  /**
   * Libera el lock si es tuyo.
   */
  static async releaseLock(lockName) {
    try {
      const result = await DistributedLock.deleteOne({
        lockName,
        instanceId: INSTANCE_ID,
      });

      if (result.deletedCount > 0) {
        console.log(
          `[DISTRIBUTED LOCK] ${INSTANCE_ID}: Lock released ${lockName}`
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error(
        `[DISTRIBUTED LOCK] ${INSTANCE_ID}: Error releasing lock ${lockName}:`,
        error
      );
      return false;
    }
  }

  /**
   * Inicia un heartbeat para mantener vivo el lock (lease).
   * @returns {Function} stop()
   */
  static startHeartbeat(lockName, ttlMinutes = 1, intervalMs = 20000) {
    this.stopHeartbeat(lockName);

    const t = setInterval(async () => {
      const ok = await this.renewLock(lockName, ttlMinutes);
      if (!ok) {
        console.warn(
          `[DISTRIBUTED LOCK] ${INSTANCE_ID}: Heartbeat failed for ${lockName}`
        );
      }
    }, intervalMs);

    heartbeats.set(lockName, t);
    return () => this.stopHeartbeat(lockName);
  }

  static stopHeartbeat(lockName) {
    const t = heartbeats.get(lockName);
    if (t) {
      clearInterval(t);
      heartbeats.delete(lockName);
    }
  }

  /**
   * Utilidad: estado del lock
   */
  static async getLockStatus(lockName) {
    try {
      const lock = await DistributedLock.findOne({ lockName }).lean();
      if (!lock) return { exists: false, available: true };

      const now = new Date();
      const isExpired = lock.expiresAt && new Date(lock.expiresAt) <= now;

      return {
        exists: true,
        available: isExpired,
        instanceId: lock.instanceId,
        lockedAt: lock.lockedAt,
        expiresAt: lock.expiresAt,
        isExpired,
        ownedByThisInstance: lock.instanceId === INSTANCE_ID,
      };
    } catch (error) {
      return { exists: false, available: false, error: error?.message || String(error) };
    }
  }
}

module.exports = DistributedLockService;
