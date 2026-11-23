require("dotenv").config();
const fs = require("fs");
const { MongoClient } = require("mongodb");

(async () => {
  const c = new MongoClient(process.env.MONGO_DB_URL);
  await c.connect();
  const db = c.db(process.env.DB_NAME);

  const abonos = await db.collection("abonos")
    .find({ anticipos: { $exists: true, $ne: [] } }).toArray();
  const ants = await db.collection("anticipos").find({}).project({ idAnticipo: 1, fecha: 1 }).toArray();
  const mapAnt = new Map(ants.map(a => [String(a._id), a]));

  const backup = [];
  const ops = [];
  for (const ab of abonos) {
    const ant = mapAnt.get(String((ab.anticipos || [])[0]));
    if (!ant || !ant.fecha || ab.fecha === ant.fecha) continue;
    backup.push({ _id: ab._id, idAbono: ab.idAbono, fechaAnterior: ab.fecha, fechaNueva: ant.fecha, idAnticipo: ant.idAnticipo, importe: ab.importe });
    ops.push({ updateOne: { filter: { _id: ab._id }, update: { $set: { fecha: ant.fecha } } } });
  }

  fs.writeFileSync("_backupFechasAbonosAnticipos.json", JSON.stringify(backup, null, 2));
  console.log("Respaldo escrito: _backupFechasAbonosAnticipos.json (", backup.length, "abonos )");

  if (ops.length) {
    const r = await db.collection("abonos").bulkWrite(ops);
    console.log("Actualizados:", r.modifiedCount);
  }

  // verificacion
  const post = await db.collection("abonos").find({ anticipos: { $exists: true, $ne: [] } }).project({ fecha: 1, anticipos: 1 }).toArray();
  let malos = 0;
  for (const ab of post) {
    const ant = mapAnt.get(String((ab.anticipos || [])[0]));
    if (ant && ant.fecha && ab.fecha !== ant.fecha) malos++;
  }
  console.log("Verificacion -> abonos con fecha distinta al anticipo:", malos, "de", post.length);
  await c.close();
})().catch(e => { console.error(e.message); process.exit(1); });
