const {
  Surtidos,
  Abonos,
  GastosGeneral,
  GastosTiendas,
  Clientes,
  VentasTiendas,
  Inventarios,
  Proveedores,
  Compras,
} = require("../models");
const Groq = require("groq-sdk");
const moment = require("moment");

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
               "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const fmtMXN = (v) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 })
    .format(Number(v) || 0);

const pct = (num, den) =>
  !den ? "0%" : `${((Number(num) / Number(den)) * 100).toFixed(1)}%`;

const sumArr = (a) => a.reduce((s, v) => s + (Number(v) || 0), 0);

module.exports = {
  chat: async (req, res) => {
    try {
      const { message, history = [] } = req.body;
      if (!message) return res.status(400).json({ error: "message requerido" });

      const anio    = new Date().getFullYear();
      const anioAnt = anio - 1;

      const fi    = `${anio}-01-01`;
      const ff    = moment().format("YYYY-MM-DD");
      const fiAnt = `${anioAnt}-01-01`;
      const ffAnt = `${anioAnt}-12-31`;

      // Suma por mes de una coleccion con campo 'fecha' (string YYYY-MM-DD)
      const pipeMes = (col, field, fechaI, fechaF, extraMatch = {}) =>
        col.aggregate([
          { $match: { fecha: { $gte: fechaI, $lte: fechaF }, ...extraMatch } },
          { $addFields: { fd: { $toDate: "$fecha" } } },
          { $group: { _id: { mes: { $month: "$fd" } }, total: { $sum: `$${field}` } } },
          { $sort: { "_id.mes": 1 } },
        ]);

      const [
        ventaMesAgg, ventaTiendaMesAgg, cobranzaMesAgg, gastosMesAgg, gastosTiendaMesAgg,
        ventaMesAntAgg, gastosMesAntAgg,
        clientesSaldo,
        proveedoresSaldo,
        invPorArea,
        topArticulos,
        surtidosRecientes,
        abonosRecientes,
        gastosRecientes,
        comprasRecientes,
      ] = await Promise.all([
        // Ventas (surtidos activos) del anio actual, por mes
        pipeMes(Surtidos, "total_general", fi, ff, { is_active: "Si" }),
        // Ventas de tiendas del anio actual, por mes
        pipeMes(VentasTiendas, "total_general", fi, ff, { is_active: "Si" }),
        // Cobranza (abonos) por mes
        pipeMes(Abonos, "importe", fi, ff, { is_active: "Si" }),
        // Gastos generales por mes
        pipeMes(GastosGeneral, "total", fi, ff),
        // Gastos de tiendas por mes
        pipeMes(GastosTiendas, "total", fi, ff),
        // Anio anterior para comparar
        pipeMes(Surtidos, "total_general", fiAnt, ffAnt, { is_active: "Si" }),
        pipeMes(GastosGeneral, "total", fiAnt, ffAnt),
        // Clientes con saldo (cartera)
        Clientes.find({ is_active: "Si", saldo: { $ne: 0 } })
          .sort({ saldo: -1 })
          .limit(25)
          .select("nombre_comercial codigo saldo cargos abonos plazo"),
        // Proveedores con saldo (CxP)
        Proveedores.find({ saldo: { $ne: 0 } })
          .sort({ saldo: -1 })
          .limit(15)
          .select("nombre_comercial saldo cargos abonos"),
        // Inventario por area. Se agrupa PRIMERO y el lookup va al final
        // (si no, hace el join sobre miles de docs y tarda muchisimo).
        Inventarios.aggregate([
          { $match: { cantidad: { $gt: 0 } } },
          { $unwind: { path: "$areas", preserveNullAndEmptyArrays: true } },
          { $group: { _id: "$areas", piezas: { $sum: "$cantidad" }, modelos: { $sum: 1 } } },
          { $sort: { piezas: -1 } },
          { $lookup: { from: "areas", localField: "_id", foreignField: "_id", as: "a" } },
          { $unwind: { path: "$a", preserveNullAndEmptyArrays: true } },
          { $project: { _id: "$a.name", piezas: 1, modelos: 1 } },
        ]),
        // Articulos con mas existencia (mismo criterio: agrupar -> limitar -> join)
        Inventarios.aggregate([
          { $match: { cantidad: { $gt: 0 } } },
          { $unwind: { path: "$articulos", preserveNullAndEmptyArrays: true } },
          { $group: { _id: "$articulos", piezas: { $sum: "$cantidad" } } },
          { $sort: { piezas: -1 } },
          { $limit: 10 },
          { $lookup: { from: "articulos", localField: "_id", foreignField: "_id", as: "art" } },
          { $unwind: { path: "$art", preserveNullAndEmptyArrays: true } },
          { $project: { _id: "$art.codigo", piezas: 1 } },
        ]),
        // Ultimos movimientos (limitados por el TPM de Groq)
        Surtidos.find({ is_active: "Si" })
          .sort({ fecha: -1 })
          .limit(12)
          .populate("clientes", "nombre_comercial")
          .select("fecha total_general total_cantidad saldo clientes idSurtido"),
        Abonos.find({ is_active: "Si" })
          .sort({ fecha: -1 })
          .limit(12)
          .populate("clientes", "nombre_comercial")
          .select("fecha importe concepto clientes"),
        GastosGeneral.find({})
          .sort({ fecha: -1 })
          .limit(10)
          .select("fecha total descripcion"),
        Compras.find({ is_active: "Si" })
          .sort({ fecha: -1 })
          .limit(8)
          .select("fecha total_cantidad idCompras factura"),
      ]);

      const to12 = (agg) => {
        const arr = Array(12).fill(0);
        agg.forEach((r) => { const i = (r._id?.mes || 1) - 1; if (i >= 0 && i < 12) arr[i] = r.total; });
        return arr;
      };

      const ventaMes        = to12(ventaMesAgg);
      const ventaTiendaMes  = to12(ventaTiendaMesAgg);
      const cobranzaMes     = to12(cobranzaMesAgg);
      const gastosMes       = to12(gastosMesAgg);
      const gastosTiendaMes = to12(gastosTiendaMesAgg);
      const ventaMesAnt     = to12(ventaMesAntAgg);
      const gastosMesAnt    = to12(gastosMesAntAgg);

      const gastoTotalMes = gastosMes.map((g, i) => g + gastosTiendaMes[i]);
      const ventaTotalMes = ventaMes.map((v, i) => v + ventaTiendaMes[i]);
      const utilidadMes   = ventaTotalMes.map((v, i) => v - gastoTotalMes[i]);

      const ventaTotal    = sumArr(ventaMes);
      const ventaTiendaT  = sumArr(ventaTiendaMes);
      const cobranzaTotal = sumArr(cobranzaMes);
      const gastosTotal   = sumArr(gastoTotalMes);
      const ventaAntTotal = sumArr(ventaMesAnt);
      const gastosAntTot  = sumArr(gastosMesAnt);

      const tablaMeses = MESES.map((m, i) =>
        `  ${m.padEnd(11)} Mayoreo: ${fmtMXN(ventaMes[i]).padStart(14)} | Tiendas: ${fmtMXN(ventaTiendaMes[i]).padStart(12)} | Cobranza: ${fmtMXN(cobranzaMes[i]).padStart(14)} | Gastos: ${fmtMXN(gastoTotalMes[i]).padStart(12)} | Utilidad: ${fmtMXN(utilidadMes[i]).padStart(14)}`
      ).join("\n");

      const carteraStr = clientesSaldo.map((c, i) =>
        `  ${i + 1}. ${c.codigo || ""} ${c.nombre_comercial}: saldo ${fmtMXN(c.saldo)} (plazo ${c.plazo || 0} dias)`
      ).join("\n");

      const provStr = proveedoresSaldo.map((p, i) =>
        `  ${i + 1}. ${p.nombre_comercial}: ${fmtMXN(p.saldo)}`
      ).join("\n");

      const invStr = invPorArea.map((a) =>
        `  ${(a._id || "Sin area").padEnd(24)} ${String(a.piezas).padStart(10)} pzas en ${a.modelos} registros`
      ).join("\n");

      const topArtStr = topArticulos.map((a, i) =>
        `  ${i + 1}. ${a._id || "?"}: ${a.piezas} pzas`
      ).join("\n");

      const surtStr = surtidosRecientes.map((s) =>
        `  ${s.fecha} Nota ${s.idSurtido} | ${s.clientes?.[0]?.nombre_comercial || "?"} | ${fmtMXN(s.total_general)} | ${s.total_cantidad} pzas | saldo ${fmtMXN(s.saldo)}`
      ).join("\n");

      const abonosStr = abonosRecientes.map((a) =>
        `  ${a.fecha} | ${a.clientes?.[0]?.nombre_comercial || "?"} | ${fmtMXN(a.importe)} | ${a.concepto || ""}`
      ).join("\n");

      const gastosStr = gastosRecientes.map((g) =>
        `  ${g.fecha} | ${fmtMXN(g.total)} | ${g.descripcion || ""}`
      ).join("\n");

      const comprasStr = comprasRecientes.map((c) =>
        `  ${c.fecha} | Compra ${c.idCompras} | ${c.total_cantidad} pzas | factura ${c.factura || "NA"}`
      ).join("\n");

      const systemPrompt = `
Eres el asistente de American Fly, una empresa de ropa que vende a mayoreo y en tiendas propias.
Respondes en espanol, claro y directo, con numeros concretos. Usa los datos de abajo.
Si te preguntan algo que no esta en los datos, dilo con honestidad en vez de inventar.
Los montos estan en pesos mexicanos.

══════════════════════════════════════════════════════
RESUMEN ${anio}
══════════════════════════════════════════════════════
  Venta mayoreo:       ${fmtMXN(ventaTotal)}
  Venta tiendas:       ${fmtMXN(ventaTiendaT)}
  Venta total:         ${fmtMXN(ventaTotal + ventaTiendaT)}
  Cobranza:            ${fmtMXN(cobranzaTotal)}
  Gastos:              ${fmtMXN(gastosTotal)}
  Utilidad estimada:   ${fmtMXN(ventaTotal + ventaTiendaT - gastosTotal)}

  Comparativo ${anioAnt}: venta ${fmtMXN(ventaAntTotal)} | gastos ${fmtMXN(gastosAntTot)}
  Variacion venta mayoreo vs ${anioAnt}: ${ventaAntTotal ? (((ventaTotal - ventaAntTotal) / ventaAntTotal) * 100).toFixed(1) + "%" : "sin base"}

══════════════════════════════════════════════════════
DESGLOSE MENSUAL ${anio}
══════════════════════════════════════════════════════
${tablaMeses}

══════════════════════════════════════════════════════
CARTERA — CLIENTES CON SALDO (top 25)
══════════════════════════════════════════════════════
${carteraStr || "Sin datos"}

══════════════════════════════════════════════════════
CUENTAS POR PAGAR — PROVEEDORES CON SALDO
══════════════════════════════════════════════════════
${provStr || "Sin datos"}

══════════════════════════════════════════════════════
INVENTARIO POR ALMACEN
══════════════════════════════════════════════════════
${invStr || "Sin datos"}

  Articulos con mas existencia:
${topArtStr || "  Sin datos"}

══════════════════════════════════════════════════════
ULTIMAS NOTAS DE VENTA (mayoreo)
══════════════════════════════════════════════════════
${surtStr || "Sin datos"}

══════════════════════════════════════════════════════
ULTIMOS PAGOS RECIBIDOS
══════════════════════════════════════════════════════
${abonosStr || "Sin datos"}

══════════════════════════════════════════════════════
ULTIMOS GASTOS
══════════════════════════════════════════════════════
${gastosStr || "Sin datos"}

══════════════════════════════════════════════════════
ULTIMAS COMPRAS
══════════════════════════════════════════════════════
${comprasStr || "Sin datos"}
      `.trim();

      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      // El plan de Groq limita tokens por minuto: solo mandamos lo reciente.
      const historyCorto = history.slice(-4);

      const completion = await groq.chat.completions.create({
        model:            process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        max_tokens:       1200,
        reasoning_effort: "low",
        messages: [
          { role: "system", content: systemPrompt },
          ...historyCorto.map((h) => ({ role: h.role, content: h.content })),
          { role: "user", content: message },
        ],
      });

      const reply = (completion.choices[0].message.content || "").trim()
        || "No pude generar una respuesta, intenta reformular la pregunta.";

      res.status(200).json({ reply });
    } catch (err) {
      console.error("AIController error:", err?.message || err);
      if (err?.status === 413) {
        return res.status(200).json({
          reply: "La consulta resulto demasiado grande para el limite del plan. " +
                 "Intenta con una pregunta mas especifica, o borra el chat para reiniciar el historial.",
        });
      }
      if (err?.status === 429) {
        return res.status(200).json({
          reply: "Se alcanzo el limite de consultas por minuto. Espera unos segundos e intenta de nuevo.",
        });
      }
      res.status(500).json({ error: err?.message || "Error en asistente IA" });
    }
  },
};
