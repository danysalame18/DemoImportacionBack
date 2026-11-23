// Ajusta inventarios = kardex (misma logica que listadoKardex) en TODAS las areas.
// Guarda backup del estado previo para poder revertir.
// Uso: node _ajustaInventarios.js "<URI>" [--apply]
const mongoose = require("mongoose");
const fs = require("fs");

const URI = process.argv[2];
const APPLY = process.argv.includes("--apply");
const first = (x) => (Array.isArray(x) ? x[0] : x);
const S = (x) => String(first(x) || "");

(async () => {
  await mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;

  const areas = await db.collection("areas").find({}).project({ name: 1 }).toArray();
  const areaName = {};
  areas.forEach((a) => (areaName[String(a._id)] = a.name));
  const arts = await db.collection("articulos").find({}).project({ codigo: 1 }).toArray();
  const artCodigo = {};
  arts.forEach((a) => (artCodigo[String(a._id)] = a.codigo));

  const calc = new Map();
  const add = (art, area, val) => {
    if (!art || !area) return;
    const k = art + "|" + area;
    calc.set(k, (calc.get(k) || 0) + (Number(val) || 0));
  };

  const directas = [
    ["comprasacumulados", +1], ["articulossurtidos", -1], ["articulosts", -1],
    ["articulostes", +1], ["articulosventastiendas", -1],
    ["articulosdevolucionestiendas", +1], ["articulosajustesinvs", +1],
  ];
  for (const [col, signo] of directas) {
    const rows = await db.collection(col).find({}).project({ articulos: 1, areas: 1, cantidad: 1 }).toArray();
    rows.forEach((r) => add(S(r.articulos), S(r.areas), signo * (Number(r.cantidad) || 0)));
  }
  const porPadre = [
    ["articulosdevoluciones", "devoluciones", "devoluciones", +1],
    ["articulosdevolucionesfiscal", "devolucionesFiscal", "devolucionesfiscals", +1],
    ["articulosms", "muestrasSalida", "muestrassalidas", -1],
    ["articulosme", "muestrasEntrada", "muestrasentradas", +1],
  ];
  for (const [col, refField, padreCol, signo] of porPadre) {
    let rows = [];
    try { rows = await db.collection(col).find({}).project({ articulos: 1, cantidad: 1, [refField]: 1 }).toArray(); } catch (e) { continue; }
    if (!rows.length) continue;
    let padres = [];
    try { padres = await db.collection(padreCol).find({}).project({ areas: 1 }).toArray(); } catch (e) {}
    const padreArea = {};
    padres.forEach((p) => (padreArea[String(p._id)] = S(p.areas)));
    rows.forEach((r) => add(S(r.articulos), padreArea[S(r[refField])], signo * (Number(r.cantidad) || 0)));
  }

  const invs = await db.collection("inventarios").find({}).toArray();
  const invPorKey = new Map();
  invs.forEach((i) => invPorKey.set(S(i.articulos) + "|" + S(i.areas), i));

  const keys = new Set([...calc.keys(), ...invPorKey.keys()]);
  const updates = [], inserts = [], backup = [];

  for (const k of keys) {
    const [art, area] = k.split("|");
    const kx = Math.round((calc.get(k) || 0) * 1000) / 1000;
    const doc = invPorKey.get(k);
    const actual = doc ? Number(doc.cantidad) || 0 : null;
    if (doc) {
      if (Math.abs(actual - kx) > 0.001) {
        updates.push({ _id: doc._id, nueva: kx, anterior: actual, codigo: artCodigo[art], area: areaName[area] });
        backup.push({ _id: String(doc._id), cantidad: actual });
      }
    } else if (Math.abs(kx) > 0.001) {
      inserts.push({ articulos: art, areas: area, cantidad: kx, codigo: artCodigo[art], area_name: areaName[area] });
    }
  }

  console.log("A ACTUALIZAR:", updates.length, "| A CREAR:", inserts.length);

  if (!APPLY) {
    console.log("\n*** DRY-RUN, no se modifico nada. Usa --apply ***");
    await mongoose.disconnect();
    return;
  }

  // backup del estado previo
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const file = `/Users/dsm/Documents/Lynqro/backups/revertir-inventarios-${stamp}.json`;
  fs.writeFileSync(file, JSON.stringify(backup, null, 1));
  console.log("Backup para revertir:", file);

  const ops = updates.map((u) => ({
    updateOne: { filter: { _id: u._id }, update: { $set: { cantidad: u.nueva } } },
  }));
  if (ops.length) {
    for (let i = 0; i < ops.length; i += 500) {
      await db.collection("inventarios").bulkWrite(ops.slice(i, i + 500), { ordered: false });
    }
  }
  if (inserts.length) {
    await db.collection("inventarios").insertMany(
      inserts.map((x) => ({
        articulos: [new mongoose.Types.ObjectId(x.articulos)],
        areas: [new mongoose.Types.ObjectId(x.areas)],
        cantidad: x.cantidad,
        is_active: "Si",
        costoUnitario: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
  }
  console.log("LISTO -> actualizados:", updates.length, "| creados:", inserts.length);
  await mongoose.disconnect();
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
