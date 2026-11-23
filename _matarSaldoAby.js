require("dotenv").config();
const fs = require("fs");
const { MongoClient, ObjectId } = require("mongodb");
const ABY = new ObjectId("6201b1920f94f86068a741c6");

(async () => {
  const c = new MongoClient(process.env.MONGO_DB_URL);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const f = n => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(n||0);

  const clientes = await db.collection("clientes").find({ areas: ABY }).toArray();
  const ids = clientes.map(x => x._id);

  const vt = await db.collection("ventastiendas").find({ clientes:{$in:ids}, saldo:{$gt:0.009} }).toArray();
  const nc = await db.collection("notascargos").find({ clientes:{$in:ids}, saldo:{$gt:0.009} }).toArray();

  // ---- RESPALDO ----
  const backup = {
    fecha: new Date().toISOString(),
    nota: "Baja de cartera Tienda Aby: migrada a otra base de datos. Ventas y notas de cargo se conservan activas; solo se apaga el cobro.",
    clientes: clientes.map(x => ({ _id:x._id, nombre_comercial:x.nombre_comercial, cargos:x.cargos, abonos:x.abonos, saldo:x.saldo })),
    ventasTiendas: vt.map(x => ({ _id:x._id, idVentaTienda:x.idVentaTienda, fecha:x.fecha, is_active:x.is_active, saldo:x.saldo })),
    notasCargo: nc.map(x => ({ _id:x._id, idNotaCargo:x.idNotaCargo, fecha:x.fecha, is_active:x.is_active, saldo:x.saldo, importe:x.importe })),
  };
  fs.writeFileSync("_backupCarteraTiendaAby.json", JSON.stringify(backup, null, 2));
  console.log("Respaldo -> _backupCarteraTiendaAby.json");
  console.log("  clientes:", backup.clientes.length, "| ventas:", vt.length, f(vt.reduce((a,b)=>a+b.saldo,0)),
              "| notas cargo:", nc.length, f(nc.reduce((a,b)=>a+b.saldo,0)));

  // ---- APLICAR ----
  const r1 = await db.collection("ventastiendas").updateMany(
    { _id: { $in: vt.map(x=>x._id) } }, { $set: { saldo: 0 } });
  const r2 = await db.collection("notascargos").updateMany(
    { _id: { $in: nc.map(x=>x._id) } }, { $set: { saldo: 0 } });
  const r3 = await db.collection("clientes").updateMany(
    { _id: { $in: ids } }, { $set: { cargos: 0, abonos: 0, saldo: 0 } });

  console.log("\nventas de tienda saldadas :", r1.modifiedCount);
  console.log("notas de cargo saldadas   :", r2.modifiedCount);
  console.log("clientes en ceros         :", r3.modifiedCount);

  // ---- VERIFICACION ----
  const q1 = await db.collection("ventastiendas").countDocuments({clientes:{$in:ids}, saldo:{$gt:0.009}});
  const q2 = await db.collection("notascargos").countDocuments({clientes:{$in:ids}, saldo:{$gt:0.009}});
  const q3 = await db.collection("clientes").countDocuments({areas:ABY, $or:[{saldo:{$ne:0}},{cargos:{$ne:0}},{abonos:{$ne:0}}]});
  const act = await db.collection("clientes").countDocuments({areas:ABY, is_active:"Si"});
  const vAct = await db.collection("ventastiendas").countDocuments({clientes:{$in:ids}, is_active:"Si"});
  console.log("\n--- verificacion ---");
  console.log("ventas con saldo pendiente :", q1);
  console.log("notas de cargo pendientes  :", q2);
  console.log("clientes fuera de cero     :", q3);
  console.log("clientes que siguen activos:", act, "de 84");
  console.log("ventas que siguen activas  :", vAct, "(historico intacto)");
  await c.close();
})().catch(e => { console.error(e.message); process.exit(1); });
