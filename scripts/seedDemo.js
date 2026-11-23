/**
 * Siembra de datos DEMO para Demo Importacion.
 *
 *   node scripts/seedDemo.js          (siembra)
 *   DRY=1 node scripts/seedDemo.js    (solo muestra el resumen, no escribe)
 *
 * - Solo corre contra la base indicada en BASES_PERMITIDAS (lee el .env del back).
 * - No borra nada: se niega a correr si la base ya tiene articulos o pedidos.
 * - Espera la semilla base (plantel, areas, bancos, departamentos, puesto y admin@lynqro.com).
 * - Crea el usuario de pruebas (ver USUARIO_PRUEBAS abajo).
 * Todos los documentos llevan `demo: true`.
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const config = require("../config");

const BASES_PERMITIDAS = ["demoImportacionPruebas", "demoImportacion"];
const USUARIO_PRUEBAS = { email: "pruebas@demoimportacion.com", password: "Demo2026", nombre: "Usuario", apellido: "Pruebas" };

const O = (s) => (s ? new mongoose.Types.ObjectId(s) : new mongoose.Types.ObjectId());
const ID = {
  admin: O("613a9434225bce3df050c220"),
  plantel: O("5fadcffbc699d907b4e7ca3d"),
  general: O("5fade908a9d14923bc7cd3d3"),
  cedis: O("6201b18c0f94f86068a741c0"),
  area2: O("6201b1920f94f86068a741c6"),
  area3: O("6240a0754999152b10f8e0a3"),
  bBonif: O("6255c1bb98f8a71d7414a110"),
  bDevol: O("6255c1ca98f8a71d7414a115"),
  bEfectivo: O("628bb60fb9a3c3001601e546"),
  puestoVendedor: O("627547a80b64170016800822"),
};

// ── utilidades ───────────────────────────────────────────────────────────────
let semilla = 20261123;
const rnd = () => { semilla |= 0; semilla = (semilla + 0x6d2b79f5) | 0; let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const entre = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const elige = (arr) => arr[Math.floor(rnd() * arr.length)];
const r2 = (n) => Math.round(n * 100) / 100;
const HOY = new Date(); HOY.setHours(12, 0, 0, 0);
const fechaD = (diasAtras) => new Date(HOY.getTime() - diasAtras * 86400000);
const f = (diasAtras) => fechaD(diasAtras).toISOString().slice(0, 10);
const ts = (diasAtras) => { const d = fechaD(Math.max(diasAtras, 0)); return { createdAt: d, updatedAt: d }; };
const base = (dias = 200) => ({ is_active: "Si", demo: true, ...ts(dias) });

const col = {}; // nombre de coleccion -> documentos
const add = (nombre, doc) => { (col[nombre] = col[nombre] || []).push(doc); return doc; };
const catalogo = (nombre, nombres) => nombres.map((name) => add(nombre, { _id: O(), name, ...base() }));

// ── catalogos ────────────────────────────────────────────────────────────────
const lineas = catalogo("lineas", ["CHAMARRAS", "SUDADERAS", "PLAYERAS", "PANTALONES", "MOCHILAS", "ACCESORIOS"]);
const marcas = catalogo("marcas", ["NORTHWIND", "URBAN PEAK", "BLUE HARBOR", "KAIRO"]);
const familias = catalogo("familias", ["CABALLERO", "DAMA", "JUVENIL", "INFANTIL", "UNISEX"]);
const colecciones = catalogo("colecciones", ["OTOÑO INVIERNO 2026", "PRIMAVERA VERANO 2027", "BASICOS"]);
const composiciones = catalogo("composiciones", ["100% POLIESTER", "100% ALGODON", "65% POLIESTER 35% ALGODON", "95% ALGODON 5% ELASTANO", "100% NYLON"]);
const colores = catalogo("colores", ["NEGRO", "MARINO", "GRIS", "BLANCO", "ROJO", "VERDE MILITAR", "BEIGE", "AZUL REY"]);
const tallas = catalogo("tallas", ["CH", "M", "G", "EG", "2EG", "UNITALLA"]);
const grupos = catalogo("grupos", ["NA", "CADENAS", "MAYORISTAS", "BOUTIQUES"]);
const deptosClientes = catalogo("departamentosclientes", ["NA", "CABALLEROS", "DAMAS", "DEPORTES"]);
const brokers = catalogo("brokers", ["Agencia Aduanal del Pacífico", "Logística Manzanillo", "Trans-Asia Forwarding"]);
const solicitantes = ["Dirección", "Almacén", "Ventas"].map((name) => add("solicitantes", { _id: O(), name, demo: true, ...ts(200) }));

const empresas = [
  add("empresas", { _id: O(), name: "DEMO IMPORTACION", prefijo: "DI", razonSocial: "DEMO IMPORTACION SA DE CV", rfc: "XAXX010101000", regimenFiscal: "601", direccionFiscal: "Av. Insurgentes Sur 1234, CDMX", cp: "03100", listoFacturar: "No", ...base() }),
  add("empresas", { _id: O(), name: "COMERCIALIZADORA DEMO", prefijo: "CD", razonSocial: "COMERCIALIZADORA DEMO SA DE CV", rfc: "XAXX010101000", regimenFiscal: "601", direccionFiscal: "NA", cp: "NA", listoFacturar: "No", ...base() }),
];

const categoriasGasto = {
  "RENTA": ["BODEGA", "OFICINA"],
  "NOMINA": ["SUELDOS", "IMSS"],
  "SERVICIOS": ["LUZ", "INTERNET", "TELEFONIA"],
  "LOGISTICA": ["FLETES LOCALES", "PAQUETERIA", "EMPAQUE"],
  "MARKETING": ["PUBLICIDAD", "FERIAS"],
};
const subCats = [];
Object.entries(categoriasGasto).forEach(([cat, subs]) => {
  const c = add("categorias", { _id: O(), name: cat, demo: true, ...ts(200) });
  subs.forEach((s) => subCats.push({ cat: c, sub: add("subcategorias", { _id: O(), name: s, categorias: [c._id], demo: true, ...ts(200) }) }));
});

const conceptosEmb = [["Flete marítimo", 4200, "No"], ["Agente aduanal", 650, "Si"], ["Maniobras en puerto", 380, "Si"], ["Custodia", 220, "Si"], ["Flete terrestre", 980, "No"]]
  .map(([concepto, estimado, fijo]) => add("conceptosgastosembarques", { _id: O(), concepto, estimado, fijo, demo: true, ...ts(200) }));

// ── bancos nuevos ────────────────────────────────────────────────────────────
const bBBVA = add("bancos", { _id: O(), banco: "BBVA", cuenta: "0123456789", cargos: 0, abonos: 0, moneda: "MXN", ...base() });
const bUSD = add("bancos", { _id: O(), banco: "BANORTE USD", cuenta: "9876543210", cargos: 0, abonos: 0, moneda: "USD", ...base() });
const saldoBanco = {}; // id -> {cargos, abonos}
const movBanco = (banco, importe, fecha, dias, liga = {}, moneda = "MXN", tipoCambio = 1) => {
  const k = String(banco);
  saldoBanco[k] = saldoBanco[k] || { cargos: 0, abonos: 0 };
  if (importe >= 0) saldoBanco[k].abonos = r2(saldoBanco[k].abonos + importe); else saldoBanco[k].cargos = r2(saldoBanco[k].cargos - importe);
  return add("movimientosbancos", { _id: O(), bancos: [banco], abonos: [], abonosTiendas: [], abonosTraspasos: [], abonosProveedores: [], gastosGeneral: [], bancosTraspasos: [], comisiones: [], anticipos: [], gastosTiendas: [], ...liga, fecha, importe: r2(importe), tipo: importe >= 0 ? "Ingreso" : "Egreso", moneda, tipoCambio, _dias: dias, ...base(dias) });
};

// ── proveedores ──────────────────────────────────────────────────────────────
const proveedores = [
  ["Guangzhou Textile Co.", "Guangzhou", "Li Wei"], ["Ningbo Garments Ltd.", "Ningbo", "Chen Jing"], ["Xiamen Sportswear Mfg.", "Xiamen", "Zhang Min"],
  ["Qingdao Outdoor Wear", "Qingdao", "Wang Fang"], ["Shenzhen Bags Factory", "Shenzhen", "Liu Yang"], ["Yiwu Accessories Trading", "Yiwu", "Zhao Lei"],
].map(([nombre, ciudad, contacto], i) => add("proveedores", {
  _id: O(), nombre_comercial: nombre, razon_social: nombre.toUpperCase(), RFC: "NA", calle: "NA", numero_ext: "0", numero_int: "0", delegacion: "NA", estado: ciudad, pais: "China", cp: 0, colonia: "NA",
  moneda: "USD", ciudad, contacto, telefono: 0, email: `ventas${i + 1}@proveedor-demo.com`, cargos: 0, abonos: 0, saldo: 0, tipo: "China", subTipo: "NA", codigo: String(i + 1).padStart(3, "0"), ...base(),
}));

// ── colaboradores ────────────────────────────────────────────────────────────
const colaboradores = [
  ["Mariana", "López", "Si"], ["Jorge", "Ramírez", "Si"], ["Sofía", "Hernández", "Si"], ["Luis", "Torres", "No"], ["Paola", "Méndez", "No"],
].map(([nombre, apellido, vendedor], i) => add("colaboradores", {
  _id: O(), puestos: [ID.puestoVendedor], observaciones: "NA", cobrador: "No", planteles: [ID.plantel], areas: [ID.general], acceso_sistema: "No", vendedor, comisiones: 0, abonos: 0,
  nombre, apellido, identificacion: "NA", email: `${nombre.toLowerCase()}@demoimportacion.com`, direccion: "NA", fecha_ingreso: f(400 - i * 30), fecha_nacimiento: "1990-01-01", frecuencia: "Quincenal",
  telefono: 5500000000 + i, contacto_emergencia: "NA", telefono_emergencia: 0, sueldo_actual: 12000 + i * 1500, banco: "NA", clabe: "NA", ultimo_aumento: f(200), sueldo_anterior: 11000 + i * 1500, ...base(),
}));
const vendedores = colaboradores.filter((c) => c.vendedor === "Si");
// puestos: la pantalla de Empleados necesita que cada puesto tenga jefe (puestos.colaboradores[0])
const jefe = colaboradores[3];
const puestosNuevos = ["GERENTE GENERAL", "ADMINISTRACION"].map((name) => add("puestos", { _id: O(), name, colaboradores: [jefe._id], areas: [ID.general], ...base() }));
colaboradores[3].puestos = [puestosNuevos[0]._id];
colaboradores[4].puestos = [puestosNuevos[1]._id];

// ── clientes ─────────────────────────────────────────────────────────────────
const clientes = [
  ["Tiendas La Moderna", "CIUDAD DE MEXICO", "Credito", 30, 1], ["Grupo Comercial del Norte", "NUEVO LEON", "Credito", 45, 1], ["Boutique Aurora", "JALISCO", "Contado", 0, 3],
  ["Almacenes El Faro", "PUEBLA", "Credito", 30, 1], ["Distribuidora Textil Bajío", "GUANAJUATO", "Credito", 30, 2], ["Moda Express", "CIUDAD DE MEXICO", "Contado", 0, 3],
  ["Comercializadora Sureste", "YUCATAN", "Credito", 60, 2], ["Casa Rivera", "QUERETARO", "Contado", 0, 3], ["Mayoreo Central", "ESTADO DE MEXICO", "Credito", 30, 2],
  ["Deportes Olimpia", "VERACRUZ", "Credito", 30, 1], ["Outlet Pacífico", "SINALOA", "Contado", 0, 2], ["Uniformes y Más", "CHIHUAHUA", "Credito", 15, 2],
  ["Bazar Santa Fe", "CIUDAD DE MEXICO", "Contado", 0, 3], ["Importadora Peninsular", "QUINTANA ROO", "Credito", 45, 2],
].map(([nombre, estado, forma_pago, plazo, g], i) => {
  const c = add("clientes", {
    _id: O(), areas: [ID.cedis], grupos: [grupos[g]._id], departamentosClientes: [deptosClientes[i % 4]._id], vendedor: [vendedores[i % 3]._id], observaciones: "NA", empresas: [empresas[0]._id],
    nombre_comercial: nombre, razon_social: nombre.toUpperCase() + " SA DE CV", RFC: "XAXX010101000", calle: "Av. Principal", numero_ext: String(100 + i * 7), numero_int: "NA", delegacion: "Centro", estado, pais: "Mexico",
    cp: String(10000 + i * 1234).slice(0, 5), colonia: "Centro", ciudad: estado, telefono: String(5510000000 + i), telefonoCobranza: String(5510000000 + i), telefonoCompras: String(5510000000 + i), encargadaPagos: "NA",
    email: `compras${i + 1}@cliente-demo.com`, ultimo_pago: "2000-01-01", forma_pago, calificadora: 1, plazo, regFiscal: 601, cargos: 0, abonos: 0, saldo: 0,
    alertasVentas: "No", alertasEdoCta: "No", alertasMarketing: "No", codigo: i + 1, ...base(),
  });
  add("sucursales", { _id: O(), paqueteria: "Por definir", clientes: [c._id], calle: c.calle, numero_ext: c.numero_ext, numero_int: "NA", delegacion: "Centro", estado, pais: "Mexico", cp: c.cp, colonia: "Centro", ciudad: estado, alias: "Principal", RFC: c.RFC, razon_social: c.razon_social, regFiscal: 601, ...base() });
  return c;
});

// ── articulos (5 por proveedor) e inventario en CEDIS ────────────────────────
const TC = 18.6;
const catalogoArticulos = [
  // [codigo, nombre, linea, costoUSD, piezasPorCaja, tallas(0=ropa,1=unitalla)]
  ["CH-1001", "Chamarra acolchada capitonada", 0, 18.5, 12, 0], ["CH-1002", "Chamarra rompevientos ligera", 0, 11.2, 20, 0], ["CH-1003", "Chamarra bomber clásica", 0, 14.8, 16, 0], ["CH-1004", "Chaleco térmico", 0, 9.6, 24, 0], ["CH-1005", "Parka con gorro desmontable", 0, 24.0, 10, 0],
  ["SU-2001", "Sudadera con capucha básica", 1, 7.4, 24, 0], ["SU-2002", "Sudadera cuello redondo", 1, 6.2, 24, 0], ["SU-2003", "Sudadera con cierre", 1, 8.1, 24, 0], ["SU-2004", "Sudadera oversize", 1, 8.9, 20, 0], ["SU-2005", "Conjunto deportivo 2 piezas", 1, 12.5, 12, 0],
  ["PL-3001", "Playera cuello redondo lisa", 2, 2.1, 60, 0], ["PL-3002", "Playera tipo polo", 2, 4.3, 48, 0], ["PL-3003", "Playera deportiva dry-fit", 2, 3.2, 60, 0], ["PL-3004", "Playera manga larga", 2, 3.6, 48, 0], ["PL-3005", "Playera estampada", 2, 2.9, 60, 0],
  ["PA-4001", "Pantalón cargo", 3, 9.8, 24, 0], ["PA-4002", "Jogger deportivo", 3, 6.9, 30, 0], ["PA-4003", "Pantalón de mezclilla slim", 3, 10.5, 24, 0], ["PA-4004", "Short deportivo", 3, 3.8, 48, 0], ["PA-4005", "Pants térmico", 3, 7.7, 30, 0],
  ["MO-5001", "Mochila escolar 20L", 4, 6.5, 20, 1], ["MO-5002", "Mochila para laptop 15\"", 4, 11.9, 12, 1], ["MO-5003", "Mochila de viaje 40L", 4, 16.4, 10, 1], ["MO-5004", "Maleta deportiva", 4, 8.8, 16, 1], ["MO-5005", "Lonchera térmica", 4, 3.9, 36, 1],
  ["AC-6001", "Gorra bordada", 5, 1.9, 100, 1], ["AC-6002", "Gorro tejido", 5, 1.4, 120, 1], ["AC-6003", "Bufanda térmica", 5, 2.2, 80, 1], ["AC-6004", "Guantes touch", 5, 1.7, 100, 1], ["AC-6005", "Cinturón táctico", 5, 2.6, 60, 1],
];
const articulos = catalogoArticulos.map(([codigo, nombre, li, costoUSD, ppc, uni], i) => {
  const prov = proveedores[Math.floor(i / 5)];
  const costoMX = Math.round(costoUSD * TC * 1.22);
  const venta = Math.round((costoMX * 1.75) / 5) * 5 - 1;
  const a = add("articulos", {
    _id: O(), foto: "No", urlFoto: "No", lineas: [lineas[li]._id], marcas: [marcas[i % 4]._id], familias: [familias[i % 5]._id], colecciones: [colecciones[i % 3]._id], composiciones: [composiciones[i % 5]._id],
    proveedores: [prov._id], empresas: [empresas[0]._id], pesoCaja: entre(8, 22), tamanoCaja: "60x40x40", colores: [colores[i % 8]._id, colores[(i + 3) % 8]._id, colores[(i + 5) % 8]._id],
    tallas: uni ? [tallas[5]._id] : [tallas[0]._id, tallas[1]._id, tallas[2]._id, tallas[3]._id], codigo, nombre, descripcion: nombre, piezasPorCaja: ppc, costoUSD, costoMX, venta, observaciones: "NA",
    codigoSAT: "53101500", codigoUnidad: "H87", ano: "2026", EAN: "NA", vendedores: "Si", precioTienda: Math.round(venta * 1.2), ...base(190),
  });
  a._prov = prov; a._stock = 0;
  a._inv = add("inventarios", { _id: O(), areas: [ID.cedis], articulos: [a._id], cantidad: 0, costoUnitario: costoMX, ...base(190) });
  return a;
});

// ── ordenes de compra ────────────────────────────────────────────────────────
//            proveedor, dias atras, autorizado
const planOC = [[0, 172, "Si"], [1, 154, "Si"], [2, 136, "Si"], [3, 118, "Si"], [4, 62, "Si"], [5, 46, "Si"], [0, 30, "Si"], [1, 21, "Si"], [2, 9, "No"], [3, 3, "No"]];
const ordenes = planOC.map(([p, dias, autorizado], k) => {
  const prov = proveedores[p];
  const oc = add("ordenescompras", { _id: O(), proveedores: [prov._id], status: "Abierto", autorizado, fecha: f(dias), plazo: 30, fecha_compromiso: f(dias - 30), total_general: 0, total_cantidad: 0, observaciones: "NA", embarcado: 0, moneda: "USD", folioProveedor: `PI-${2600 + k + 1}`, idOrdenCompra: k + 1, _dias: dias, ...base(dias) });
  oc._lineas = articulos.filter((a) => a._prov === prov).map((a) => {
    const cantidad = entre(12, 40) * a.piezasPorCaja;
    oc.total_cantidad += cantidad; oc.total_general = r2(oc.total_general + cantidad * a.costoUSD);
    const l = add("articulosocs", { _id: O(), ordenesCompra: [oc._id], articulos: [a._id], cantidad, embarcado: 0, pendiente_embarcar: cantidad, precio: a.costoUSD, total: r2(cantidad * a.costoUSD), ...base(dias) });
    l._art = a; return l;
  });
  oc._prov = prov; return oc;
});

// ── embarques, gastos, notas por pagar, compras (recepcion) ──────────────────
//            oc, embarque, llegada estimada, recepcion (null = en transito), % embarcado, % pagado al proveedor
const planEmb = [[0, 150, 115, 113, 1, 1], [1, 132, 97, 95, 1, 1], [2, 114, 79, 78, 1, 0.5], [3, 96, 61, 60, 1, 0.3], [4, 40, -6, null, 1, 0.3], [5, 24, -21, null, 0.6, 0]];
const tcDe = (dias) => r2(TC + (Math.sin(dias / 17) * 0.45));
planEmb.forEach(([iOC, dEmb, dEst, dRec, pct, pagado], k) => {
  const oc = ordenes[iOC], prov = oc._prov, tc = tcDe(dRec === null ? dEmb : dRec);
  const emb = add("embarques", { _id: O(), recibido: dRec === null ? "No" : "Si", creado: [ID.admin], brokers: [brokers[k % 3]._id], fechaEmbarque: f(dEmb), fechaEstimada: f(dEst), observaciones: "NA", contenedor: `MSKU${4810000 + k * 7919}`, total_cantidad: 0, total_costo: 0, saldo: 0, total_gasto: 0, tipoCambioUSDMXN: tc, tipoCambioCNYUSD: 1, bultos: 0, noFactura: `INV-26-${String(k + 1).padStart(3, "0")}`, idEmbarques: k + 1, ...base(dEmb) });
  const nota = add("notascxps", { _id: O(), embarques: [emb._id], compras: [], proveedores: [prov._id], calidad: "No", compraDirecta: "No", total_cantidad: 0, total_costo: 0, saldo: 0, fecha: f(dEmb), idNotasCxP: k + 1, ...base(dEmb) });
  let compra = null;
  if (dRec !== null) {
    compra = add("compras", { _id: O(), embarques: [emb._id], user: [ID.admin], areas: [ID.cedis], fotoEvidencia: "No", fecha: f(dRec), factura: emb.noFactura, observaciones: "NA", total_cantidad: 0, tipoCambio: tc, reciboDeposito: "NA", idCompras: k + 1, ...base(dRec) });
    nota.compras = [compra._id];
  }
  oc._lineas.forEach((l) => {
    const a = l._art;
    const cantidad = pct === 1 ? l.cantidad : Math.round((l.cantidad * pct) / a.piezasPorCaja) * a.piezasPorCaja;
    l.embarcado = cantidad; l.pendiente_embarcar = l.cantidad - cantidad; oc.embarcado += cantidad;
    const recibido = dRec === null ? 0 : cantidad;
    const ae = add("articulosembarques", {
      _id: O(), articulosOC: [l._id], articulos: [a._id], embarques: [emb._id], proveedores: [prov._id], notasCxP: [nota._id], controlCalidad: [], costoUnitario: 0, precio: 0, cantidad, recibido, pendiente_recibir: cantidad - recibido,
      costo: a.costoUSD, costoUSD: a.costoUSD, total_costo: r2(cantidad * a.costoUSD), faltante: 0, danado: 0, impuestos: 0, revisarFaltante: 0, revisarDanado: 0, pedirFaltante: 0, pedirDanado: 0, faltanteTotal: 0, danadoTotal: 0,
      descuentoFaltante: 0, descuentoDanado: 0, descuentoTotal: 0, familias: "NA", sup: "NA", observaciones: "NA", calidad: "No", ...base(dEmb),
    });
    emb.total_cantidad += cantidad; emb.total_costo = r2(emb.total_costo + ae.total_costo); emb.bultos += cantidad / a.piezasPorCaja;
    if (compra) {
      compra.total_cantidad += cantidad;
      add("comprasacumulados", { _id: O(), embarques: [emb._id], compras: [compra._id], articulosEmbarques: [ae._id], articulos: [a._id], areas: [ID.cedis], fecha: f(dRec), cantidad, precio: a.costoUSD, tipoCambio: tc, precioMX: r2(a.costoUSD * tc), demo: true, ...ts(dRec) });
      a._stock += cantidad; a._desde = dRec;
    }
  });
  if (oc._lineas.every((l) => l.pendiente_embarcar === 0)) oc.status = "Cerrado";
  nota.total_cantidad = emb.total_cantidad; nota.total_costo = emb.total_costo;
  conceptosEmb.forEach((c) => {
    const real = dRec === null ? 0 : r2(c.estimado * (0.92 + rnd() * 0.2));
    emb.total_gasto = r2(emb.total_gasto + real);
    add("gastosembarques", { _id: O(), conceptosGastosEmbarques: [c._id], embarques: [emb._id], real, estimado: c.estimado, demo: true, ...ts(dEmb) });
  });
  // pagos al proveedor (USD)
  const totalPagar = r2(emb.total_costo * pagado);
  const partes = pagado === 1 ? [0.3, 0.7] : pagado > 0 ? [1] : [];
  let pagadoAcum = 0;
  partes.forEach((p, j) => {
    const importe = j === partes.length - 1 ? r2(totalPagar - pagadoAcum) : r2(totalPagar * p);
    pagadoAcum = r2(pagadoAcum + importe);
    const dias = j === 0 ? dEmb - 2 : Math.max((dRec === null ? dEmb : dRec) - 12, 1);
    const ab = add("abonosproveedores", { _id: O(), tipoCambio: tcDe(dias), proveedores: [prov._id], observaciones: `Contenedor ${emb.contenedor}`, bancos: [bUSD._id], fecha: f(dias), importe, concepto: "Abono", _dias: dias, demo: true, ...ts(dias) });
    movBanco(bUSD._id, -importe, f(dias), dias, { abonosProveedores: [ab._id] }, "USD", tcDe(dias));
    prov.abonos = r2(prov.abonos + importe);
  });
  nota.saldo = r2(nota.total_costo - pagadoAcum); emb.saldo = nota.saldo;
  prov.cargos = r2(prov.cargos + nota.total_costo); prov.saldo = r2(prov.cargos - prov.abonos);
});
// fondeo de la cuenta en dolares
movBanco(bUSD._id, 420000, f(178), 178, {}, "USD", TC);

// ── ventas: pedidos, notas (surtidos), cobranza ──────────────────────────────
const IVA = 16;
const pedidos = [];
const N_PEDIDOS = 38;
for (let i = 0; i < N_PEDIDOS; i++) {
  const dias = Math.round(104 - i * 2.75);
  const cliente = clientes[(i * 5 + (i % 3)) % clientes.length];
  const vendedor = colaboradores.find((c) => String(c._id) === String(cliente.vendedor[0]));
  // 0-27 surtido completo, 28-30 parcial, 31-35 autorizado sin surtir, 36-37 sin autorizar
  const modo = i < 28 ? "completo" : i < 31 ? "parcial" : i < 36 ? "pendiente" : "sinAutorizar";
  const disponibles = articulos.filter((a) => a._desde !== undefined && a._desde >= dias + 0 && a._stock >= a.piezasPorCaja * 2);
  const elegidos = []; const nLineas = Math.min(entre(3, 5), disponibles.length);
  while (elegidos.length < nLineas) { const a = elige(disponibles); if (!elegidos.includes(a)) elegidos.push(a); }
  const autorizado = modo === "sinAutorizar" ? "No" : "Si";
  const ped = add("pedidos", {
    _id: O(), autorizadoApartado: autorizado, autorizadoSurtido: autorizado, clientes: [cliente._id], colaboradores: [vendedor._id], areas: [], status: "Abierto", autorizoApartado: autorizado === "Si" ? [ID.admin] : [],
    autorizoSurtido: autorizado === "Si" ? [ID.admin] : [], editPedido: [], editArticulos: [], surtido: "No", editado: "No", creado: [ID.admin], departamentosClientes: cliente.departamentosClientes, entregaInsumos: "No", descuento: 0,
    fecha: f(dias), total_general: 0, observaciones: "NA", total_cantidad: 0, paqueteria: elige(["NA", "Paquetexpress", "Tresguerras", "Entrega local"]), comisionTDC: 0, comisionFlete: 0, subTotal: 0, iva: 0, impuestos: IVA,
    fechaModificado: f(dias), fecha_estimada: f(dias - 7), fecha_entrega: f(dias - 7), fechaInicio: f(dias), fechaCancelacion: f(dias - 30), piezasEntregadas: 0, piezasPendientes: 0, idPedido: i + 1, ...base(dias),
  });
  const dSurt = Math.max(dias - entre(2, 5), 0);
  let surt = null, lineasSurt = [];
  ped._lineas = elegidos.map((a) => {
    const maxCajas = Math.max(1, Math.min(6, Math.floor(a._stock / a.piezasPorCaja / 6)));
    const cantidad = entre(1, maxCajas) * a.piezasPorCaja;
    const surtido = modo === "completo" ? cantidad : modo === "parcial" ? Math.max(a.piezasPorCaja, Math.floor(cantidad / 2 / a.piezasPorCaja) * a.piezasPorCaja) : 0;
    const l = add("articulospedidos", { _id: O(), autorizadoApartado: autorizado, autorizadoSurtido: autorizado, pedidos: [ped._id], articulos: [a._id], clientes: [cliente._id], cantidadProcesos: 0, cantidad, surtido: Math.min(surtido, cantidad), pendiente_surtir: cantidad - Math.min(surtido, cantidad), precio: a.venta, total: r2(cantidad * a.venta), fecha: f(dias), ...base(dias) });
    ped.total_cantidad += cantidad; ped.subTotal = r2(ped.subTotal + l.total);
    ped.piezasEntregadas += l.surtido; ped.piezasPendientes += l.pendiente_surtir;
    if (l.surtido > 0) { a._stock -= l.surtido; lineasSurt.push({ l, a }); }
    return l;
  });
  ped.iva = r2(ped.subTotal * IVA / 100); ped.total_general = r2(ped.subTotal + ped.iva);
  if (modo === "completo") { ped.status = "Cerrado"; ped.surtido = "Si"; }
  if (lineasSurt.length) {
    const sub = r2(lineasSurt.reduce((s, x) => s + x.l.surtido * x.a.venta, 0)), iva = r2(sub * IVA / 100);
    surt = add("surtidos", {
      _id: O(), pedidos: [ped._id], clientes: [cliente._id], user: [ID.admin], areas: [ID.cedis], colaboradores: [vendedor._id], comisionPagada: "No", comisiones: [], fotoEvidencia: "No", mail: "No", noFactura: "Sin Factura", noGuia: "Sin Guia",
      empresas: [empresas[0]._id], descuento: 0, flete: 0, facturas: [], facturado: "No", fecha: f(dSurt), observaciones: "NA", total_general: r2(sub + iva), saldo: r2(sub + iva), subTotal: sub, iva, impuestos: IVA, salidaBodega: "NA",
      plazo: cliente.plazo, comision: 0, total_cantidad: lineasSurt.reduce((s, x) => s + x.l.surtido, 0), idSurtido: (col.surtidos || []).length + 1, _dias: dSurt, _cliente: cliente, _vendedor: vendedor, ...base(dSurt),
    });
    lineasSurt.forEach(({ l, a }) => add("articulossurtidos", { _id: O(), surtidos: [surt._id], inventarios: [a._inv._id], articulos: [a._id], clientes: [cliente._id], areas: [ID.cedis], articulosPedido: [l._id], costoUnitario: a.costoMX, facturas: [], facturado: "No", fecha: f(dSurt), cantidad: l.surtido, demo: true, ...ts(dSurt) }));
    cliente.cargos = r2(cliente.cargos + surt.total_general);
  }
  pedidos.push(ped);
}

// cobranza
let nAbono = 0;
const abonar = (surt, importe, dias, formaPago, banco, extra = {}) => {
  const c = surt._cliente;
  const ab = add("abonos", { _id: O(), clientes: [c._id], colaboradores: [surt._vendedor._id], surtidos: [surt._id], notasCargo: [], saldoInicial: [], bancos: [banco], comisionPagada: "No", comisiones: [], devoluciones: [], anticipos: [], fecha: f(dias), importe: r2(importe), formaPago, concepto: formaPago === "Devolucion" ? "Devolucion" : "Abono", observaciones: "NA", codigoAgrupado: crypto.randomUUID(), editado: "No", ...extra, idAbono: ++nAbono, ...base(dias) });
  movBanco(banco, importe, f(dias), dias, { abonos: [ab._id] });
  surt.saldo = r2(surt.saldo - importe); c.abonos = r2(c.abonos + importe);
  if (formaPago !== "Devolucion" && f(dias) > c.ultimo_pago) c.ultimo_pago = f(dias);
  return ab;
};
(col.surtidos || []).forEach((s, i) => {
  const c = s._cliente, total = s.total_general;
  const banco = () => (rnd() < 0.8 ? bBBVA._id : ID.bEfectivo);
  const forma = (b) => (String(b) === String(ID.bEfectivo) ? "Efectivo" : "Transfer");
  if (c.forma_pago === "Contado") { const b = banco(); abonar(s, total, s._dias, forma(b), b); return; }
  const vence = s._dias - c.plazo; // dias atras en que vence
  if (vence > 12) { // vencida hace tiempo: pagada (algunas en dos partes)
    if (i % 3 === 0) { const b = banco(); abonar(s, r2(total * 0.5), Math.max(vence + 10, 1), forma(b), b); abonar(s, r2(s.saldo), Math.max(vence - entre(0, 8), 1), "Transfer", bBBVA._id); }
    else if (i % 7 !== 5) { const b = banco(); abonar(s, total, Math.max(vence + entre(0, 6), 1), forma(b), b); }
    // i % 7 === 5: se queda vencida sin pagar (para antiguedad de saldos)
  } else if (vence > -10 && i % 2 === 0) abonar(s, r2(total * 0.4), Math.max(s._dias - 10, 1), "Transfer", bBBVA._id);
});

// devoluciones de clientes (aplicadas)
const conSaldo = (col.surtidos || []).filter((s) => s.saldo > 0 && s._dias > 8);
conSaldo.slice(0, 2).forEach((s, k) => {
  const linea = col.articulossurtidos.find((x) => String(x.surtidos[0]) === String(s._id));
  const art = articulos.find((a) => String(a._id) === String(linea.articulos[0]));
  const cantidad = Math.min(art.piezasPorCaja, linea.cantidad), sub = r2(cantidad * art.venta), iva = r2(sub * IVA / 100), dias = Math.max(s._dias - 6, 1);
  const dev = add("devoluciones", { _id: O(), clientes: [s._cliente._id], colaboradores: [s._vendedor._id], areas: [ID.cedis], surtidos: [s._id], aplicada: "Si", comisionPagada: "No", comisiones: [], fecha: f(dias), total_general: r2(sub + iva), observaciones: "Mercancía con defecto", total_cantidad: cantidad, subTotal: sub, iva, impuestos: IVA, idDevolucion: k + 1, ...base(dias) });
  add("articulosdevoluciones", { _id: O(), devoluciones: [dev._id], articulos: [art._id], cantidad, defectos: 0, totalPiezas: cantidad, precio: art.venta, total: sub, ...base(dias) });
  art._stock += cantidad;
  abonar(s, Math.min(dev.total_general, s.saldo), dias, "Devolucion", ID.bDevol, { devoluciones: [dev._id] });
});

// anticipos de clientes
[[clientes[2], 15000, 6], [clientes[7], 8000, 2]].forEach(([c, importe, dias], k) => {
  const an = add("anticipos", { _id: O(), clientes: [c._id], bancos: [bBBVA._id], fecha: f(dias), importe, formaPago: "Transfer", utilizado: 0, saldo: importe, idAnticipo: k + 1, ...base(dias) });
  movBanco(bBBVA._id, importe, f(dias), dias, { anticipos: [an._id] });
});

// ── gastos generales ─────────────────────────────────────────────────────────
const planGastos = [["BODEGA", 68000, "Renta de bodega CEDIS"], ["OFICINA", 24000, "Renta de oficina"], ["SUELDOS", 96000, "Nómina quincenal"], ["LUZ", 7400, "CFE bodega"], ["INTERNET", 1899, "Internet y telefonía"], ["FLETES LOCALES", 12500, "Fletes a clientes"], ["PAQUETERIA", 6800, "Guías de paquetería"], ["EMPAQUE", 4300, "Cajas y cinta"], ["PUBLICIDAD", 15000, "Campaña en redes"], ["IMSS", 31000, "Cuotas obrero-patronales"]];
let nGasto = 0;
[150, 120, 90, 60, 30, 4].forEach((mes, m) => planGastos.forEach(([sub, monto, descripcion], j) => {
  if ((j === 8 && m % 2) || (j === 7 && m % 3)) return;
  const sc = subCats.find((x) => x.sub.name === sub), dias = Math.max(mes - j, 1);
  const subtotal = r2(monto * (0.95 + rnd() * 0.1)), conIva = !["SUELDOS", "IMSS"].includes(sub), iva = conIva ? r2(subtotal * 0.16) : 0, total = r2(subtotal + iva);
  const banco = monto < 5000 ? ID.bEfectivo : bBBVA._id;
  const g = add("gastosgenerals", { _id: O(), descripcion, areas: [ID.general], conceptosGastos: [], categorias: [sc.cat._id], empresas: [empresas[0]._id], subCategorias: [sc.sub._id], solicitantes: [solicitantes[j % 3]._id], bancos: [banco], fotoEvidencia: "No", fecha: f(dias), subtotal, iva, total, idGastoGeneral: ++nGasto, ...base(dias) });
  movBanco(banco, -total, f(dias), dias, { gastosGeneral: [g._id] });
}));
// fondeo inicial de caja
movBanco(ID.bEfectivo, 60000, f(180), 180);
movBanco(bBBVA._id, 950000, f(180), 180);

// ── cierres ──────────────────────────────────────────────────────────────────
clientes.forEach((c) => { c.saldo = r2(c.cargos - c.abonos); });
articulos.forEach((a) => { a._inv.cantidad = a._stock; });
col.movimientosbancos.sort((a, b) => b._dias - a._dias).forEach((m, i) => { m.idMovBanco = i + 1; });
col.abonosproveedores.sort((a, b) => b._dias - a._dias).forEach((m, i) => { m.idAbonoProveedor = i + 1; });
const contadores = {
  idOrdenCompra: col.ordenescompras.length, idEmbarques: col.embarques.length, idNotasCxP: col.notascxps.length, idCompras: col.compras.length, idAbonoProveedor: col.abonosproveedores.length,
  idPedido: col.pedidos.length, idSurtido: col.surtidos.length, idAbono: col.abonos.length, idMovBanco: col.movimientosbancos.length, idGastoGeneral: col.gastosgenerals.length,
  idDevolucion: col.devoluciones.length, idAnticipo: col.anticipos.length, codigo: clientes.length,
};
const limpio = (doc) => Object.fromEntries(Object.entries(doc).filter(([k]) => !k.startsWith("_") || k === "_id"));

// ── escritura ────────────────────────────────────────────────────────────────
(async () => {
  if (process.env.DRY) {
    Object.entries(col).forEach(([n, d]) => console.log(n.padEnd(26), d.length));
    console.log("stock", articulos.map((a) => a.codigo + ":" + a._stock).join(" "));
    console.log("bancos", JSON.stringify(saldoBanco));
    console.log("clientes", clientes.map((c) => c.nombre_comercial + " " + c.saldo).join(" | "));
    console.log("proveedores", proveedores.map((p) => p.nombre_comercial + " " + p.saldo).join(" | "));
    console.log("pedidos", pedidos.map((p) => p.idPedido + ":" + p.status[0] + p._lineas.length).join(" "));
    return;
  }
  const dbName = process.env.DB_NAME;
  if (!BASES_PERMITIDAS.includes(dbName)) throw new Error(`DB_NAME="${dbName}" no está en BASES_PERMITIDAS; no se siembra.`);
  await mongoose.connect(config.db_url, { compression: { compressors: ["zlib"] } });
  const db = mongoose.connection.db;
  if (db.databaseName !== dbName) throw new Error("La conexión no apunta a " + dbName);
  for (const c of ["articulos", "pedidos", "ordenescompras", "clientes"]) if (await db.collection(c).countDocuments()) throw new Error(`La colección ${c} ya tiene datos; no se siembra dos veces.`);
  const admin = await db.collection("users").findOne({ _id: ID.admin });
  if (!admin) throw new Error("Falta la semilla base (usuario admin).");

  for (const [nombre, docs] of Object.entries(col)) { const r = await db.collection(nombre).insertMany(docs.map(limpio)); console.log(nombre.padEnd(26), r.insertedCount); }
  await db.collection("counters").insertMany(Object.entries(contadores).map(([id, seq]) => ({ id, reference_value: null, seq })));

  // areas y bancos de la semilla base (por _id)
  await db.collection("areas").updateOne({ _id: ID.area2 }, { $set: { name: "Bodega Norte" } });
  await db.collection("areas").updateOne({ _id: ID.area3 }, { $set: { name: "Showroom" } });
  await db.collection("puestos").updateOne({ _id: ID.puestoVendedor }, { $set: { colaboradores: [jefe._id] } });
  for (const [id, s] of Object.entries(saldoBanco)) await db.collection("bancos").updateOne({ _id: O(id) }, { $set: { cargos: s.cargos, abonos: s.abonos } });

  // usuario de pruebas: mismos permisos que el admin
  if (!(await db.collection("users").findOne({ email: USUARIO_PRUEBAS.email }))) {
    const ahora = new Date();
    await db.collection("users").insertOne({ ...admin, _id: O(), email: USUARIO_PRUEBAS.email, nombre: USUARIO_PRUEBAS.nombre, apellido: USUARIO_PRUEBAS.apellido, password: bcrypt.hashSync(USUARIO_PRUEBAS.password, 10), colaboradores: [], clientes: [], demo: true, createdAt: ahora, updatedAt: ahora });
    console.log("usuario de pruebas".padEnd(26), USUARIO_PRUEBAS.email);
  }
  await mongoose.disconnect();
  console.log("Listo.");
})().catch(async (e) => { console.error("ERROR:", e.message); try { await mongoose.disconnect(); } catch (_) {} process.exit(1); });
