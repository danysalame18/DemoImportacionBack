// Herramientas de consulta del MCP de DemoImportacion. Pocas, con descripciones cortas y respuestas en tabla: las
// definiciones viajan en cada mensaje y el JSON repite llaves, asi se gastan menos tokens. Cada una usa el permiso del
// boton de su pantalla (Botones*.jsx) y las reglas de acceso de acceso.js. Lo especifico (inventario, ventas,
// pendientes, cartera) tiene herramienta propia; todo lo demas sale por "consultar" (consultas.js).
const { z } = require('zod')
const mongoose = require('mongoose')
const M = require('../models')
const { EstadoCuentaController } = require('../controllers')
const { herramientaConsulta } = require('./consultas')
const A = require('./acceso')
const U = require('./util')

const uno = (v) => (Array.isArray(v) ? v[0] : v)
const id = (v) => U.idDe(uno(v))
const pesos = (n) => `$${U.r(n).toLocaleString('en-US')}`
const miles = (n) => U.r(n).toLocaleString('en-US')
// Celda vacia = 0: en tablas con muchas columnas ahorra tokens (se avisa en las instrucciones)
const v0 = (n) => (U.r(n) === 0 ? '' : U.r(n))
const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '')
// En aggregate: el campo puede venir como arreglo o como id suelto
const prim = (c) => ({ $cond: [{ $isArray: `$${c}` }, { $arrayElemAt: [`$${c}`, 0] }, `$${c}`] })

const PUEDE = {
  inventario: (u) => (!A.esDeTienda(u) && !!(u.inventarios || u.menu_disponible || u.disponible_vendedores || u.menu_reportes)) || (A.accesoTiendas(u) && !!u.inventariosTiendas),
  mayoreo: (u) => !A.esDeTienda(u) && !!(u.menu_ventas || u.menu_surtidos || u.menu_reportes),
  tiendas: (u) => (A.accesoTiendas(u) && !!(u.listadoVentasTiendas || u.corteTiendas)) || (!A.esDeTienda(u) && !!u.menu_reportes),
  utilidad: (u) => !A.esDeTienda(u) && !!u.menu_reportes,
  pendientes: (u) => !A.esDeTienda(u) && !!(u.menu_pedidos || u.menu_surtidos || u.surtidos_create),
  compras: (u) => !A.esDeTienda(u) && !!(u.menu_compras || u.menu_oc || u.embarques || u.pendiente_recibir || u.pendiente_embarcar),
  cartera: (u) => !A.esDeTienda(u) && !!(u.abonos || u.edoCtaClientes || u.menu_reportes),
  porPagar: (u) => !A.esDeTienda(u) && !!(u.menu_proveedores || u.edoCtaProveedores || u.pagoProveedores),
  gastos: (u) => !A.esDeTienda(u) && !!u.menu_gastos,
  bancos: (u) => !A.esDeTienda(u) && !!u.bancos,
}
PUEDE.ventas = (u) => PUEDE.mayoreo(u) || PUEDE.tiendas(u)

// ---------- catalogo y existencias
const corta = (n) => String(n || '').replace(/^BODEGA\s+/i, '').replace(/^Tienda\s+/i, '').replace(/\s+Maya$/i, '').trim()
const CAMPO = { linea: 'lineas', marca: 'marcas', familia: 'familias', coleccion: 'colecciones', proveedor: 'proveedores' }

async function catalogo() {
  const [arts, areas, lineas, marcas, familias, colecciones, proveedores] = await Promise.all([
    M.Articulos.find({}, 'codigo nombre lineas marcas familias colecciones proveedores costoMX venta is_active').lean(),
    M.Areas.find({}, 'name').lean(),
    M.Lineas.find({}, 'name').lean(),
    M.Marcas.find({}, 'name').lean(),
    M.Familias.find({}, 'name').lean(),
    M.Colecciones.find({}, 'name').lean(),
    M.Proveedores.find({}, 'nombre_comercial').lean(),
  ])
  const mapa = (l, c = 'name') => new Map(l.map((x) => [String(x._id), String(x[c] || '').trim()]))
  const N = { linea: mapa(lineas), marca: mapa(marcas), familia: mapa(familias), coleccion: mapa(colecciones), proveedor: mapa(proveedores, 'nombre_comercial') }
  return {
    arts,
    porId: new Map(arts.map((a) => [String(a._id), a])),
    area: new Map(areas.map((x) => [String(x._id), corta(x.name)])),
    de: (a, k) => (a ? N[k].get(id(a[CAMPO[k]])) || '' : ''),
  }
}
const textoArt = (a) => `${a.codigo} ${a.nombre}`

// Busca un almacen por nombre ("tlalne", "mixcalco", "cedis")
function areaPorNombre(cat, texto) {
  const k = [...cat.area.entries()].find(([, n]) => U.coincide(texto, n))
  if (!k) throw U.errorUsuario(`No existe el almacén "${texto}". Hay: ${[...cat.area.values()].join(', ')}`)
  return k[0]
}

// Existencia por articulo y almacen: Map articulo -> { area: cantidad }
async function existencias(soloArea) {
  const inv = await M.Inventarios.aggregate([
    { $match: { is_active: 'Si', cantidad: { $ne: 0 } } },
    { $group: { _id: { a: prim('articulos'), z: prim('areas') }, c: { $sum: '$cantidad' } } },
  ])
  const m = new Map()
  inv.forEach((x) => {
    const z = String(x._id.z)
    // Tienda Aby se migro a otra base: su inventario ya no se maneja aqui
    if (z === A.AREA_EXCLUIDA || (soloArea && z !== soloArea)) return
    const k = String(x._id.a)
    const e = m.get(k) || {}
    e[z] = (e[z] || 0) + x.c
    m.set(k, e)
  })
  return m
}
const totalDe = (e, zonas) => zonas.reduce((t, z) => t + ((e && e[z]) || 0), 0)

// Lo comprometido y lo que viene, igual que la pantalla Disponible (InventariosController.findDisponible):
// disponible = inventario + por recibir (embarques + OC) - pedidos autorizados sin surtir - solicitudes de traspaso
async function comprometido() {
  const pedidos = (await M.Pedidos.find({ surtido: 'No' }, '_id').lean()).map((p) => p._id)
  const suma = (Modelo, match, campo) =>
    Modelo.aggregate([{ $match: match }, { $group: { _id: prim('articulos'), c: { $sum: `$${campo}` } } }]).then((l) => new Map(l.map((x) => [String(x._id), x.c])))
  const [pedido, embarque, oc, traspaso] = await Promise.all([
    suma(M.ArticulosPedido, { is_active: 'Si', autorizadoSurtido: 'Si', pedidos: { $in: pedidos } }, 'pendiente_surtir'),
    suma(M.ArticulosEmbarques, { is_active: 'Si', pendiente_recibir: { $gt: 0 } }, 'pendiente_recibir'),
    suma(M.ArticulosOC, { is_active: 'Si', pendiente_embarcar: { $gt: 0 } }, 'pendiente_embarcar'),
    suma(M.ArticulosTSolV2, { is_active: 'Si', pendiente_surtir: { $gt: 0 } }, 'pendiente_surtir'),
  ])
  return {
    pedido: (k) => pedido.get(k) || 0,
    recibir: (k) => (embarque.get(k) || 0) + (oc.get(k) || 0),
    traspaso: (k) => traspaso.get(k) || 0,
  }
}

// ---------- ventas: notas de mayoreo y ventas de tienda, menos devoluciones. Venta = sin IVA y con descuento.
async function lineasVenta(desde, hasta, { mayoreo = true, tiendas = true, area = '' } = {}) {
  const rango = { $gte: desde, $lte: `${hasta}~` }
  const L = []
  const tareas = []
  if (mayoreo) {
    tareas.push((async () => {
      const [notas, devs] = await Promise.all([
        M.Surtidos.find({ is_active: 'Si', fecha: rango }, 'descuento clientes colaboradores areas fecha').lean(),
        M.Devoluciones.find({ is_active: 'Si', fecha: rango }, 'clientes colaboradores areas fecha').lean(),
      ])
      const [lin, dl] = await Promise.all([
        M.ArticulosSurtidos.find({ surtidos: { $in: notas.map((n) => n._id) } }, 'surtidos articulos articulosPedido cantidad areas').lean(),
        M.ArticulosDevoluciones.find({ is_active: 'Si', devoluciones: { $in: devs.map((d) => d._id) } }, 'devoluciones articulos cantidad total').lean(),
      ])
      const precios = new Map(
        (await M.ArticulosPedido.find({ _id: { $in: lin.map((x) => uno(x.articulosPedido)).filter(Boolean) } }, 'precio').lean()).map((p) => [String(p._id), Number(p.precio) || 0])
      )
      const nMap = new Map(notas.map((n) => [String(n._id), n]))
      lin.forEach((x) => {
        const n = nMap.get(id(x.surtidos))
        if (!n) return
        const venta = x.cantidad * (precios.get(id(x.articulosPedido)) || 0) * (1 - (Number(n.descuento) || 0) / 100)
        L.push({ canal: 'Mayoreo', art: id(x.articulos), cliente: id(n.clientes), vendedor: id(n.colaboradores), area: id(x.areas) || id(n.areas), fecha: n.fecha, cant: x.cantidad, venta })
      })
      const dMap = new Map(devs.map((d) => [String(d._id), d]))
      dl.forEach((x) => {
        const d = dMap.get(id(x.devoluciones))
        if (!d) return
        L.push({ canal: 'Mayoreo', art: id(x.articulos), cliente: id(d.clientes), vendedor: id(d.colaboradores), area: id(d.areas), fecha: d.fecha, cant: -x.cantidad, venta: -(Number(x.total) || 0) })
      })
    })())
  }
  if (tiendas) {
    tareas.push((async () => {
      const f = { is_active: 'Si', fecha: rango, ...(area ? { areas: area } : {}) }
      const [vts, dts] = await Promise.all([
        M.VentasTiendas.find(f, 'descuento clientes colaboradores areas fecha').lean(),
        M.DevolucionesTiendas.find(f, 'clientes colaboradores areas fecha').lean(),
      ])
      const [lin, dl] = await Promise.all([
        M.ArticulosVentasTiendas.find({ is_active: { $ne: 'No' }, ventasTiendas: { $in: vts.map((v) => v._id) } }, 'ventasTiendas articulos cantidad total').lean(),
        M.ArticulosDevolucionesTiendas.find({ is_active: { $ne: 'No' }, devolucionesTiendas: { $in: dts.map((d) => d._id) } }, 'devolucionesTiendas articulos cantidad total').lean(),
      ])
      const vMap = new Map(vts.map((v) => [String(v._id), v]))
      lin.forEach((x) => {
        const v = vMap.get(id(x.ventasTiendas))
        if (!v) return
        L.push({ canal: 'Tiendas', art: id(x.articulos), cliente: id(v.clientes), vendedor: id(v.colaboradores), area: id(v.areas), fecha: v.fecha, cant: x.cantidad, venta: (Number(x.total) || 0) * (1 - (Number(v.descuento) || 0) / 100) })
      })
      const dMap = new Map(dts.map((d) => [String(d._id), d]))
      dl.forEach((x) => {
        const d = dMap.get(id(x.devolucionesTiendas))
        if (!d) return
        L.push({ canal: 'Tiendas', art: id(x.articulos), cliente: id(d.clientes), vendedor: id(d.colaboradores), area: id(d.areas), fecha: d.fecha, cant: -x.cantidad, venta: -(Number(x.total) || 0) })
      })
    })())
  }
  await Promise.all(tareas)
  return L
}

// Que canales ve el usuario (el de tienda, solo su tienda)
const alcanceVentas = (u) => ({ mayoreo: PUEDE.mayoreo(u), tiendas: PUEDE.tiendas(u), area: A.tiendaDe(u) })

async function nombres(L) {
  const cIds = [...new Set(L.map((l) => l.cliente))]
  const vIds = [...new Set(L.map((l) => l.vendedor))]
  const [cs, vs] = await Promise.all([
    M.Clientes.find({ _id: { $in: cIds } }, 'nombre_comercial estado').lean(),
    M.Colaboradores.find({ _id: { $in: vIds } }, 'nombre apellido').lean(),
  ])
  const c = new Map(cs.map((x) => [String(x._id), x]))
  const v = new Map(vs.map((x) => [String(x._id), `${x.nombre || ''} ${x.apellido || ''}`.replace(/\s+/g, ' ').trim()]))
  return {
    cliente: (k) => String((c.get(k) || {}).nombre_comercial || '').trim(),
    estado: (k) => String((c.get(k) || {}).estado || '').trim(),
    vendedor: (k) => v.get(k) || '',
  }
}

const AGRUPAR = {
  canal: (l) => l.canal,
  cliente: (l, x) => x.n.cliente(l.cliente),
  vendedor: (l, x) => x.n.vendedor(l.vendedor),
  articulo: (l, x) => (x.cat.porId.get(l.art) || {}).codigo,
  linea: (l, x) => x.cat.de(x.cat.porId.get(l.art), 'linea'),
  marca: (l, x) => x.cat.de(x.cat.porId.get(l.art), 'marca'),
  familia: (l, x) => x.cat.de(x.cat.porId.get(l.art), 'familia'),
  coleccion: (l, x) => x.cat.de(x.cat.porId.get(l.art), 'coleccion'),
  proveedor: (l, x) => x.cat.de(x.cat.porId.get(l.art), 'proveedor'),
  almacen: (l, x) => x.cat.area.get(l.area),
  estado: (l, x) => x.n.estado(l.cliente),
  dia: (l) => String(l.fecha).slice(0, 10),
  mes: (l) => String(l.fecha).slice(0, 7),
}

// Junta las lineas por la clave pedida y les pone costo (costoMX actual, como los reportes de utilidad)
async function acumularVentas(L, clave, filtro = () => true) {
  const [cat, n] = await Promise.all([catalogo(), nombres(L)])
  const x = { cat, n }
  const acum = new Map()
  const tot = { cant: 0, venta: 0, costo: 0 }
  L.forEach((l) => {
    const art = cat.porId.get(l.art) || {}
    if (!filtro(l, x, art)) return
    const k = clave(l, x) || '(sin)'
    const f = acum.get(k) || { art, cant: 0, venta: 0, costo: 0 }
    const costo = l.cant * (Number(art.costoMX) || 0)
    f.cant += l.cant
    f.venta += l.venta
    f.costo += costo
    acum.set(k, f)
    tot.cant += l.cant
    tot.venta += l.venta
    tot.costo += costo
  })
  return { acum, tot }
}

// Mismo tramo del mes anterior (1-10 nov → 1-10 oct)
const mesAntes = (f) => {
  const [y, m, d] = f.split('-').map(Number)
  const ultimo = new Date(Date.UTC(y, m - 1, 0)).getUTCDate()
  return new Date(Date.UTC(y, m - 2, Math.min(d, ultimo))).toISOString().slice(0, 10)
}
const variacion = (act, ant) => (ant ? `${act >= ant ? '+' : ''}${Math.round(((act - ant) / ant) * 100)}%` : 's/d')

// ---------- herramientas
const inventario = {
  nombre: 'inventario',
  titulo: 'Inventario',
  descripcion: 'Existencias por almacén (o agrupadas por línea, marca, familia, colección, proveedor o almacén). Busca por código o nombre. Opcional: disponible para venta, cobertura (venta 30 días y días de inventario) y valor a costo.',
  permiso: PUEDE.inventario,
  entrada: (u) => ({
    q: z.string().optional().describe('Código o nombre'),
    agrupar: z.enum(['articulo', 'linea', 'marca', 'familia', 'coleccion', 'proveedor', 'almacen']).default('articulo'),
    ...(A.tiendaDe(u) ? {} : { almacen: z.string().optional().describe('CEDIS, TLALNE, SHOWROOM, Mixcalco...') }),
    ...(A.tiendaDe(u) ? {} : { disponible: z.boolean().default(false).describe('Agrega pedidos, por recibir y disponible para venta') }),
    cobertura: z.boolean().default(false).describe('Agrega venta de 30 días y días de inventario; ordena por menos días'),
    ...(A.verCostos(u) ? { valor: z.boolean().default(false).describe('Agrega valor a costo') } : {}),
    con_cero: z.boolean().default(false).describe('Incluir sin existencia'),
    orden: z.enum(['mayor', 'menor']).default('mayor'),
    limite: U.limite(25),
    saltar: U.saltar(),
  }),
  correr: async (a, u) => {
    const cat = await catalogo()
    const soloArea = A.tiendaDe(u)
    const filtroArea = !soloArea && a.almacen ? areaPorNombre(cat, a.almacen) : ''
    const conDisp = !!a.disponible && !soloArea
    const costear = !!a.valor && A.verCostos(u)
    const [ex, comp, v30] = await Promise.all([
      existencias(soloArea || filtroArea),
      conDisp ? comprometido() : null,
      a.cobertura ? lineasVenta(U.sumaDias(U.hoyStr(), -30), U.hoyStr(), { mayoreo: !soloArea, tiendas: true, area: soloArea }) : null,
    ])
    const venta30 = new Map()
    ;(v30 || []).forEach((l) => venta30.set(l.art, (venta30.get(l.art) || 0) + l.cant))
    // Columnas de almacen: solo las que tienen piezas, de mayor a menor
    const porZona = new Map()
    ex.forEach((e) => Object.entries(e).forEach(([z, c]) => porZona.set(z, (porZona.get(z) || 0) + c)))
    const zonas = [...porZona.entries()].filter(([, c]) => c !== 0).sort((x, y) => y[1] - x[1]).map(([z]) => z)
    // Si el disponible es global, el inventario que suma tambien (todos los almacenes)
    const exGlobal = conDisp && filtroArea ? await existencias('') : ex

    const arts = cat.arts.filter((x) => !a.q || U.coincide(a.q, textoArt(x)))
    const datos = arts.map((x) => {
      const k = String(x._id)
      const e = ex.get(k) || {}
      const stock = totalDe(e, zonas)
      const d = conDisp ? { ped: comp.pedido(k), rec: comp.recibir(k), tras: comp.traspaso(k), inv: Object.values(exGlobal.get(k) || {}).reduce((t, c) => t + c, 0) } : null
      return { x, e, stock, d, venta: venta30.get(k) || 0, valor: stock * (Number(x.costoMX) || 0) }
    }).filter((r) => a.con_cero || a.q || r.stock !== 0 || (r.d && (r.d.ped || r.d.rec)) || r.venta)

    const dias = (stock, venta) => (venta > 0 ? Math.max(0, Math.round(stock / (venta / 30))) : '')
    const disp = (d) => d.inv + d.rec - d.ped - d.tras
    const colsExtra = [...(conDisp ? ['Pedido', 'Por recibir', 'Disp'] : []), ...(a.cobertura ? ['V30', 'Días'] : []), ...(costear ? ['Valor'] : [])]
    const extra = (r) => [
      ...(conDisp ? [v0(r.d.ped + r.d.tras), v0(r.d.rec), U.r(disp(r.d))] : []),
      ...(a.cobertura ? [v0(r.venta), dias(r.stock, r.venta)] : []),
      ...(costear ? [v0(r.valor)] : []),
    ]
    const nZona = (z) => cat.area.get(z) || '?'

    let cols
    let filas
    if (a.agrupar === 'almacen') {
      cols = ['Almacén', 'Modelos', 'Pzs', ...(costear ? ['Valor'] : [])]
      filas = zonas.map((z) => {
        const conPzs = datos.filter((r) => (r.e[z] || 0) !== 0)
        return { orden: porZona.get(z), fila: [nZona(z), conPzs.length, U.r(porZona.get(z)), ...(costear ? [U.r(conPzs.reduce((t, r) => t + r.e[z] * (Number(r.x.costoMX) || 0), 0))] : [])] }
      })
    } else if (a.agrupar === 'articulo') {
      cols = ['Código', 'Nombre', ...zonas.map(nZona), ...(zonas.length > 1 ? ['Total'] : []), ...colsExtra]
      filas = datos.map((r) => ({
        orden: r.stock, dias: dias(r.stock, r.venta), venta: r.venta,
        fila: [r.x.codigo, U.corto(r.x.nombre, 34), ...zonas.map((z) => v0(r.e[z])), ...(zonas.length > 1 ? [U.r(r.stock)] : []), ...extra(r)],
      }))
    } else {
      const g = new Map()
      datos.forEach((r) => {
        const k = cat.de(r.x, a.agrupar) || '(sin)'
        const s = g.get(k) || { modelos: 0, e: {}, stock: 0, venta: 0, valor: 0, d: conDisp ? { ped: 0, rec: 0, tras: 0, inv: 0 } : null }
        if (r.stock) s.modelos += 1
        zonas.forEach((z) => { s.e[z] = (s.e[z] || 0) + (r.e[z] || 0) })
        s.stock += r.stock
        s.venta += r.venta
        s.valor += r.valor
        if (conDisp) Object.keys(s.d).forEach((c) => { s.d[c] += r.d[c] })
        g.set(k, s)
      })
      cols = [a.agrupar, 'Modelos', ...zonas.map(nZona), ...(zonas.length > 1 ? ['Total'] : []), ...colsExtra]
      filas = [...g.entries()].map(([k, s]) => ({
        orden: s.stock, dias: dias(s.stock, s.venta), venta: s.venta,
        fila: [k, s.modelos, ...zonas.map((z) => v0(s.e[z])), ...(zonas.length > 1 ? [U.r(s.stock)] : []), ...extra(s)],
      }))
    }
    if (a.cobertura && a.agrupar !== 'almacen') filas.sort((x, y) => (x.dias === '' ? Infinity : x.dias) - (y.dias === '' ? Infinity : y.dias) || y.venta - x.venta)
    else filas.sort((x, y) => (a.orden === 'menor' ? x.orden - y.orden : y.orden - x.orden))

    const suma = datos.reduce((t, r) => t + r.stock, 0)
    const pie = [
      `Suma ${miles(suma)} pzs${soloArea ? ` en ${nZona(soloArea)}` : filtroArea ? ` en ${nZona(filtroArea)}` : ''}`,
      costear ? `valor a costo ${pesos(datos.reduce((t, r) => t + r.valor, 0))}` : '',
      conDisp ? `Disp = inventario de todos los almacenes + por recibir (embarques y OC) − pedidos autorizados sin surtir y traspasos solicitados (Pedido), igual que la pantalla Disponible${conDisp ? ` · total disponible ${miles(datos.reduce((t, r) => t + disp(r.d), 0))}` : ''}` : '',
      a.cobertura ? 'V30 = piezas vendidas en 30 días (mayoreo + tiendas); Días = existencia / venta diaria' : '',
    ]
    return U.tabla(cols, filas.map((f) => f.fila), { limite: a.limite, saltar: a.saltar, pie: pie.filter(Boolean).join(' · ') })
  },
}

const ventas = {
  nombre: 'ventas',
  titulo: 'Ventas',
  descripcion: (u) =>
    `Ventas de un periodo en piezas y pesos (sin IVA, con descuento, menos devoluciones)${PUEDE.mayoreo(u) && PUEDE.tiendas(u) ? ': Mayoreo (notas) y Tiendas' : ''}. Agrupa por canal, cliente, vendedor, artículo, línea, marca, familia, colección, proveedor, almacén, estado, día o mes.${PUEDE.utilidad(u) ? ' Con utilidad agrega costo y margen.' : ''}`,
  permiso: PUEDE.ventas,
  entrada: (u) => ({
    desde: U.fecha('AAAA-MM-DD; default día 1 del mes'),
    hasta: U.fecha('default hoy'),
    agrupar: z.enum(Object.keys(AGRUPAR)).default(PUEDE.mayoreo(u) && PUEDE.tiendas(u) ? 'canal' : 'cliente'),
    ...(PUEDE.mayoreo(u) && PUEDE.tiendas(u) ? { canal: z.enum(['Mayoreo', 'Tiendas']).optional() } : {}),
    q: z.string().optional().describe('Código o nombre del artículo'),
    cliente: z.string().optional(),
    vendedor: z.string().optional(),
    ...(PUEDE.utilidad(u) ? { utilidad: z.boolean().default(false).describe('Agrega costo, utilidad y margen') } : {}),
    orden: z.enum(['venta', 'piezas', 'utilidad']).default('venta'),
    limite: U.limite(25),
    saltar: U.saltar(),
  }),
  correr: async (a, u) => {
    const desde = a.desde || U.inicioMes()
    const hasta = a.hasta || U.hoyStr()
    const al = alcanceVentas(u)
    const util = !!a.utilidad && PUEDE.utilidad(u)
    // La utilidad de tiendas solo la ven los usuarios del reporte Utilidad Tiendas
    const sinTiendas = util && !A.verUtilidadTiendas(u)
    const tiendas = al.tiendas && !sinTiendas && a.canal !== 'Mayoreo'
    const mayoreo = al.mayoreo && a.canal !== 'Tiendas'
    const L = await lineasVenta(desde, hasta, { mayoreo, tiendas, area: al.area })
    const filtro = (l, x, art) =>
      (!a.q || U.coincide(a.q, textoArt(art))) && (!a.cliente || U.coincide(a.cliente, x.n.cliente(l.cliente))) && (!a.vendedor || U.coincide(a.vendedor, x.n.vendedor(l.vendedor)))
    const { acum, tot } = await acumularVentas(L, AGRUPAR[a.agrupar], filtro)
    const conNombre = a.agrupar === 'articulo'
    const enTiempo = a.agrupar === 'dia' || a.agrupar === 'mes'
    const ordenar = { venta: (f) => f.venta, piezas: (f) => f.cant, utilidad: (f) => f.venta - f.costo }[util || a.orden !== 'utilidad' ? a.orden : 'venta']
    const filas = [...acum.entries()]
      .sort((x, y) => (enTiempo ? (x[0] < y[0] ? -1 : 1) : ordenar(y[1]) - ordenar(x[1])))
      .map(([k, f]) => [k, ...(conNombre ? [U.corto(f.art.nombre, 30)] : []), U.r(f.cant), U.r(f.venta), ...(util ? [U.r(f.costo), U.r(f.venta - f.costo), pct(f.venta - f.costo, f.venta)] : [])])
    const cols = [a.agrupar, ...(conNombre ? ['Nombre'] : []), 'Pzs', 'Venta', ...(util ? ['Costo', 'Utilidad', 'Margen'] : [])]
    const pie = [
      `${desde} a ${hasta}${al.area ? ' · solo tu tienda' : ''}`,
      `Total ${miles(tot.cant)} pzs, venta ${pesos(tot.venta)}${util ? `, costo ${pesos(tot.costo)}, utilidad ${pesos(tot.venta - tot.costo)} (${pct(tot.venta - tot.costo, tot.venta)})` : ''}`,
      util ? 'Costo = costo MX actual del modelo, como los reportes de utilidad' : '',
      sinTiendas && al.tiendas ? 'sin Tiendas: su utilidad es solo para usuarios autorizados' : '',
    ]
    return U.tabla(cols, filas, { limite: a.limite, saltar: a.saltar, pie: pie.filter(Boolean).join(' · ') })
  },
}

const verFecha = (t) => {
  const m = String(t || '').match(/^\d{4}-(\d{2})-(\d{2})/)
  return m ? `${m[2]}/${m[1]}` : ''
}

// Pedidos abiertos con piezas pendientes de surtir
async function pendientesDeSurtir() {
  const lineas = await M.ArticulosPedido.find({ is_active: 'Si', pendiente_surtir: { $gt: 0 } }, 'pedidos articulos pendiente_surtir precio autorizadoSurtido').lean()
  const peds = await M.Pedidos.find({ _id: { $in: [...new Set(lineas.map((l) => id(l.pedidos)))] }, is_active: 'Si', status: 'Abierto' }, 'idPedido fecha fecha_estimada fecha_entrega clientes colaboradores')
    .populate('clientes', 'nombre_comercial')
    .populate('colaboradores', 'nombre apellido')
    .lean()
  const pMap = new Map(peds.map((p) => [String(p._id), p]))
  return { lineas: lineas.filter((l) => pMap.has(id(l.pedidos))), pMap }
}
const persona = (v) => (uno(v) ? `${uno(v).nombre || ''} ${uno(v).apellido || ''}`.replace(/\s+/g, ' ').trim() : '')
const clienteDe = (p) => String((uno(p.clientes) || {}).nombre_comercial || '').trim()

const pendientes = {
  nombre: 'pedidos_pendientes',
  titulo: 'Pendientes de surtir',
  descripcion: 'Pedidos abiertos con piezas por surtir (importe y cuánto está autorizado). Con "pedido" da su detalle por artículo con inventario y disponible; con "q" dice qué pedidos esperan ese artículo.',
  permiso: PUEDE.pendientes,
  entrada: {
    pedido: z.number().int().optional().describe('Número de pedido'),
    q: z.string().optional().describe('Código o nombre del artículo'),
    cliente: z.string().optional(),
    vendedor: z.string().optional(),
    solo_autorizados: z.boolean().default(false),
    limite: U.limite(25),
    saltar: U.saltar(),
  },
  correr: async (a) => {
    if (a.pedido) {
      const p = await M.Pedidos.findOne({ idPedido: a.pedido, is_active: 'Si' }).populate('clientes', 'nombre_comercial').populate('colaboradores', 'nombre apellido').lean()
      if (!p) throw U.errorUsuario(`No existe el pedido ${a.pedido}`)
      const [lineas, cat, ex, comp] = await Promise.all([
        // Todos los renglones: al cerrar un pedido sus renglones quedan dados de baja
        M.ArticulosPedido.find({ pedidos: p._id }, 'articulos cantidad surtido pendiente_surtir precio autorizadoSurtido is_active').lean(),
        catalogo(),
        existencias(''),
        comprometido(),
      ])
      const filas = lineas
        .map((l) => {
          const k = id(l.articulos)
          const art = cat.porId.get(k) || {}
          const inv = Object.values(ex.get(k) || {}).reduce((t, c) => t + c, 0)
          return [art.codigo, U.corto(art.nombre, 28), U.r(l.cantidad), v0(l.surtido), v0(l.pendiente_surtir), U.r(l.precio), l.autorizadoSurtido === 'Si' ? 'Si' : 'No', U.r(inv), U.r(inv + comp.recibir(k) - comp.pedido(k) - comp.traspaso(k)), l.is_active === 'No' ? 'Si' : '']
        })
        .sort((x, y) => String(x[0]).localeCompare(String(y[0])))
      const pend = lineas.filter((l) => l.is_active !== 'No').reduce((t, l) => t + (l.pendiente_surtir || 0), 0)
      return U.tabla(['Código', 'Nombre', 'Cant', 'Surtido', 'Pend', 'Precio', 'Aut', 'Inv', 'Disp', 'Baja'], filas, {
        limite: a.limite,
        saltar: a.saltar,
        pie: `Pedido ${p.idPedido} · ${p.fecha} · ${clienteDe(p)} · ${persona(p.colaboradores)} · ${p.status} · ${miles(pend)} pzs pendientes · Inv = todos los almacenes; Disp = disponible para venta (ya descuenta los pedidos autorizados)`,
      })
    }
    const { lineas, pMap } = await pendientesDeSurtir()
    const cat = a.q ? await catalogo() : null
    const g = new Map()
    lineas.forEach((l) => {
      if (a.solo_autorizados && l.autorizadoSurtido !== 'Si') return
      if (cat && !U.coincide(a.q, textoArt(cat.porId.get(id(l.articulos)) || {}))) return
      const p = pMap.get(id(l.pedidos))
      if ((a.cliente && !U.coincide(a.cliente, clienteDe(p))) || (a.vendedor && !U.coincide(a.vendedor, persona(p.colaboradores)))) return
      const f = g.get(String(p._id)) || { p, pzs: 0, imp: 0, aut: 0 }
      f.pzs += l.pendiente_surtir
      f.imp += l.pendiente_surtir * (Number(l.precio) || 0)
      if (l.autorizadoSurtido === 'Si') f.aut += l.pendiente_surtir
      g.set(String(p._id), f)
    })
    const lista = [...g.values()].sort((x, y) => x.p.idPedido - y.p.idPedido)
    const filas = lista.map(({ p, pzs, imp, aut }) => [p.idPedido, p.fecha, verFecha(p.fecha_entrega || p.fecha_estimada), U.corto(clienteDe(p), 26), U.corto(persona(p.colaboradores), 20), U.r(pzs), U.r(imp), v0(aut)])
    const t = lista.reduce((s, f) => ({ pzs: s.pzs + f.pzs, imp: s.imp + f.imp, aut: s.aut + f.aut }), { pzs: 0, imp: 0, aut: 0 })
    return U.tabla(['Pedido', 'Fecha', 'Entrega', 'Cliente', 'Vendedor', 'Pzs', 'Importe', 'Aut'], filas, {
      limite: a.limite,
      saltar: a.saltar,
      pie: `${lista.length} pedidos abiertos · ${miles(t.pzs)} pzs por surtir (${miles(t.aut)} autorizadas), importe ${pesos(t.imp)} sin IVA${a.q ? ` · solo las piezas de "${a.q}"` : ''} · Aut = piezas autorizadas para surtir`,
    })
  },
}

const compras = {
  nombre: 'compras_pendientes',
  titulo: 'Por recibir',
  descripcion: 'Embarques (contenedores) por recibir y órdenes de compra por embarcar. Con "embarque" u "oc" da su detalle por artículo; con "q" dice dónde viene ese artículo.',
  permiso: PUEDE.compras,
  entrada: {
    embarque: z.number().int().optional().describe('Número de embarque'),
    oc: z.number().int().optional().describe('Número de orden de compra'),
    q: z.string().optional().describe('Código o nombre del artículo'),
    limite: U.limite(15),
    saltar: U.saltar(),
  },
  correr: async (a) => {
    const cat = await catalogo()
    if (a.embarque) {
      const e = await M.Embarques.findOne({ idEmbarques: a.embarque, is_active: { $ne: 'No' } }).lean()
      if (!e) throw U.errorUsuario(`No existe el embarque ${a.embarque}`)
      const lineas = await M.ArticulosEmbarques.find({ embarques: e._id, is_active: { $ne: 'No' } }, 'articulos proveedores cantidad recibido pendiente_recibir costo').populate('proveedores', 'nombre_comercial').lean()
      const filas = lineas.map((l) => {
        const art = cat.porId.get(id(l.articulos)) || {}
        return [art.codigo, U.corto(art.nombre, 26), U.corto((uno(l.proveedores) || {}).nombre_comercial, 20), U.r(l.cantidad), v0(l.recibido), v0(l.pendiente_recibir), Math.round((Number(l.costo) || 0) * 100) / 100]
      })
      return U.tabla(['Código', 'Nombre', 'Proveedor', 'Cant', 'Recibido', 'Pend', 'Costo'], filas, {
        limite: a.limite,
        saltar: a.saltar,
        pie: `Embarque ${e.idEmbarques} · ${e.contenedor || ''} · salida ${e.fechaEmbarque || ''} · llegada ${e.fechaEstimada || ''} · ${e.recibido === 'Si' ? 'ya recibido' : 'por recibir'}`,
      })
    }
    if (a.oc) {
      const o = await M.OrdenesCompra.findOne({ idOrdenCompra: a.oc, is_active: { $ne: 'No' } }).populate('proveedores', 'nombre_comercial').lean()
      if (!o) throw U.errorUsuario(`No existe la OC ${a.oc}`)
      const lineas = await M.ArticulosOC.find({ ordenesCompra: o._id, is_active: { $ne: 'No' } }, 'articulos cantidad embarcado pendiente_embarcar precio').lean()
      const filas = lineas.map((l) => {
        const art = cat.porId.get(id(l.articulos)) || {}
        return [art.codigo, U.corto(art.nombre, 28), U.r(l.cantidad), v0(l.embarcado), v0(l.pendiente_embarcar), Math.round((Number(l.precio) || 0) * 100) / 100]
      })
      return U.tabla(['Código', 'Nombre', 'Cant', 'Embarcado', 'Pend', 'Precio'], filas, {
        limite: a.limite,
        saltar: a.saltar,
        pie: `OC ${o.idOrdenCompra} · ${o.fecha} · ${(uno(o.proveedores) || {}).nombre_comercial || ''} · ${o.moneda || ''} · ${o.status || ''} · compromiso ${o.fecha_compromiso || ''}`,
      })
    }
    const deArt = a.q ? new Set(cat.arts.filter((x) => U.coincide(a.q, textoArt(x))).map((x) => x._id)) : null
    const conArt = deArt ? { articulos: { $in: [...deArt] } } : {}
    const [eGrupos, oGrupos] = await Promise.all([
      M.ArticulosEmbarques.aggregate([
        { $match: { is_active: 'Si', pendiente_recibir: { $gt: 0 }, ...conArt } },
        { $group: { _id: prim('embarques'), pzs: { $sum: '$cantidad' }, pend: { $sum: '$pendiente_recibir' }, costo: { $sum: '$total_costo' }, prov: { $addToSet: prim('proveedores') } } },
      ]),
      M.ArticulosOC.aggregate([
        { $match: { is_active: 'Si', pendiente_embarcar: { $gt: 0 }, ...conArt } },
        { $group: { _id: prim('ordenesCompra'), pzs: { $sum: '$cantidad' }, pend: { $sum: '$pendiente_embarcar' } } },
      ]),
    ])
    const [embs, ocs, provs] = await Promise.all([
      M.Embarques.find({ _id: { $in: eGrupos.map((x) => x._id) }, is_active: { $ne: 'No' }, recibido: { $ne: 'Si' } }, 'idEmbarques contenedor fechaEmbarque fechaEstimada').lean(),
      M.OrdenesCompra.find({ _id: { $in: oGrupos.map((x) => x._id) }, is_active: { $ne: 'No' } }, 'idOrdenCompra fecha proveedores status fecha_compromiso').populate('proveedores', 'nombre_comercial').lean(),
      M.Proveedores.find({}, 'nombre_comercial').lean(),
    ])
    const pN = new Map(provs.map((x) => [String(x._id), String(x.nombre_comercial || '').trim()]))
    const eMap = new Map(eGrupos.map((x) => [String(x._id), x]))
    const oMap = new Map(oGrupos.map((x) => [String(x._id), x]))
    const fe = embs
      .map((e) => ({ e, g: eMap.get(String(e._id)) }))
      .sort((x, y) => String(x.e.fechaEstimada || '').localeCompare(String(y.e.fechaEstimada || '')))
      .map(({ e, g }) => [e.idEmbarques, e.contenedor, U.corto(g.prov.map((p) => pN.get(String(p))).filter(Boolean).join(', '), 30), e.fechaEmbarque, e.fechaEstimada, U.r(g.pzs), U.r(g.pend), U.r(g.costo)])
    const fo = ocs
      .map((o) => ({ o, g: oMap.get(String(o._id)) }))
      .sort((x, y) => x.o.idOrdenCompra - y.o.idOrdenCompra)
      .map(({ o, g }) => [o.idOrdenCompra, o.fecha, U.corto((uno(o.proveedores) || {}).nombre_comercial, 26), o.status, o.fecha_compromiso, U.r(g.pzs), U.r(g.pend)])
    const suma = (l, i) => miles(l.reduce((t, f) => t + (Number(f[i]) || 0), 0))
    return [
      `EMBARQUES POR RECIBIR${a.q ? ` (piezas de "${a.q}")` : ''}`,
      U.tabla(['Emb', 'Contenedor', 'Proveedor', 'Salida', 'Llegada', 'Pzs', 'Pend', 'Costo'], fe, { limite: a.limite, saltar: a.saltar, pie: `Pendiente de recibir ${suma(fe, 6)} pzs` }),
      `OC POR EMBARCAR${a.q ? ` (piezas de "${a.q}")` : ''}`,
      U.tabla(['OC', 'Fecha', 'Proveedor', 'Status', 'Compromiso', 'Pzs', 'Pend'], fo, { limite: a.limite, saltar: a.saltar, pie: `Pendiente de embarcar ${suma(fo, 6)} pzs` }),
    ].join('\n')
  },
}

// ---------- cartera: notas y notas de cargo con saldo, como Antiguedad de Saldos (sin Tienda Aby)
// 2000-01-01 es relleno del sistema: cliente sin pagos registrados
const ultimoPago = (c) => (String(c.ultimo_pago || '').startsWith('2000-01-01') ? '' : String(c.ultimo_pago || '').slice(0, 10))
const RANGOS = ['Por vencer', '1-30', '31-60', '61-90', '91-120', '121-180', '+180']
const rangoDe = (d) => (d <= 0 ? 0 : d <= 30 ? 1 : d <= 60 ? 2 : d <= 90 ? 3 : d <= 120 ? 4 : d <= 180 ? 5 : 6)
const diasEntre = (a, b) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000)

async function cartera() {
  const [sur, nc] = await Promise.all([
    M.Surtidos.find({ is_active: 'Si', saldo: { $gt: 0.5 } }, 'idSurtido fecha total_general saldo clientes').lean(),
    M.NotasCargo.find({ saldo: { $gt: 0.5 } }, 'idNotaCargo fecha importe saldo clientes').lean(),
  ])
  const cls = await M.Clientes.find({ _id: { $in: [...new Set([...sur, ...nc].map((d) => id(d.clientes)))] } }, 'nombre_comercial areas plazo vendedor ultimo_pago')
    .populate('vendedor', 'nombre apellido')
    .lean()
  const valido = (c) => !(Array.isArray(c.areas) ? c.areas : [c.areas]).some((x) => U.idDe(x) === A.AREA_EXCLUIDA)
  const cMap = new Map(cls.filter(valido).map((c) => [String(c._id), c]))
  const hoy = U.hoyStr()
  const docs = [
    ...sur.map((d) => ({ doc: 'Nota', folio: d.idSurtido, fecha: d.fecha, total: d.total_general, saldo: d.saldo, cliente: id(d.clientes) })),
    ...nc.map((d) => ({ doc: 'Nota cargo', folio: d.idNotaCargo, fecha: d.fecha, total: d.importe, saldo: d.saldo, cliente: id(d.clientes) })),
  ]
    .filter((d) => cMap.has(d.cliente))
    .map((d) => {
      const vence = U.sumaDias(String(d.fecha).slice(0, 10), Number(cMap.get(d.cliente).plazo) || 0)
      const dias = diasEntre(vence, hoy)
      return { ...d, vence, dias, rango: rangoDe(dias) }
    })
  return { docs, cMap }
}

async function estadoDeCuenta(c, a) {
  const movs = await U.llamar(EstadoCuentaController.findOneClienteAgrupado, { params: { cliente: String(c._id) } })
  let saldo = 0
  const filas = movs.map((m) => {
    const cargo = Number(m.cargo) || 0
    const abono = (Number(m.abono) || 0) + (Number(m.bonificacion) || 0) + (Number(m.devolucion) || 0)
    saldo += cargo - abono
    return [String(m.fecha || '').slice(0, 10), m.movimiento, m.numero, v0(cargo), v0(abono), U.r(saldo), U.corto(m.observaciones === 'NA' ? '' : m.observaciones, 30)]
  })
  const cargos = movs.reduce((t, m) => t + (Number(m.cargo) || 0), 0)
  return U.tabla(['Fecha', 'Movimiento', 'Núm', 'Cargo', 'Abono', 'Saldo', 'Obs'], filas.reverse(), {
    limite: a.limite,
    saltar: a.saltar,
    pie: `${c.nombre_comercial} · saldo ${pesos(saldo)} · cargos ${pesos(cargos)}, abonos ${pesos(cargos - saldo)} · más recientes primero; Abono incluye bonificaciones y devoluciones`,
  })
}

const carteraHerr = {
  nombre: 'cartera',
  titulo: 'Cuentas por cobrar',
  descripcion: 'Saldos por cobrar con antigüedad (por vencer y días vencidos según el plazo del cliente), por cliente o vendedor. Con "cliente" da sus documentos con saldo; con movimientos, su estado de cuenta.',
  permiso: PUEDE.cartera,
  entrada: {
    cliente: z.string().optional().describe('Nombre del cliente'),
    vendedor: z.string().optional(),
    agrupar: z.enum(['cliente', 'vendedor']).default('cliente'),
    solo_vencido: z.boolean().default(false),
    movimientos: z.boolean().default(false).describe('Con cliente: estado de cuenta completo'),
    limite: U.limite(25),
    saltar: U.saltar(),
  },
  correr: async (a) => {
    if (a.cliente && a.movimientos) {
      const cs = (await M.Clientes.find({ is_active: { $ne: 'No' } }, 'nombre_comercial razon_social').lean()).filter((c) => U.coincide(a.cliente, c.nombre_comercial, c.razon_social))
      if (!cs.length) throw U.errorUsuario(`No hay cliente que coincida con "${a.cliente}"`)
      if (cs.length > 1) {
        const exacto = cs.filter((c) => U.normaliza(String(c.nombre_comercial).trim()) === U.normaliza(a.cliente.trim()))
        if (exacto.length !== 1) return `Coinciden ${cs.length} clientes; sé más específico: ${cs.slice(0, 15).map((c) => String(c.nombre_comercial).trim()).join(' · ')}`
        return estadoDeCuenta(exacto[0], a)
      }
      return estadoDeCuenta(cs[0], a)
    }
    const { docs, cMap } = await cartera()
    const vend = (c) => persona(c.vendedor)
    const sel = docs.filter((d) => {
      const c = cMap.get(d.cliente)
      return (!a.cliente || U.coincide(a.cliente, c.nombre_comercial)) && (!a.vendedor || U.coincide(a.vendedor, vend(c)))
    })
    const clientes = new Set(sel.map((d) => d.cliente))
    if (a.cliente && clientes.size === 1) {
      const c = cMap.get([...clientes][0])
      const filas = sel
        .filter((d) => !a.solo_vencido || d.dias > 0)
        .sort((x, y) => String(x.fecha).localeCompare(String(y.fecha)))
        .map((d) => [d.doc, d.folio, String(d.fecha).slice(0, 10), d.vence, d.dias > 0 ? d.dias : '', U.r(d.total), U.r(d.saldo)])
      const tot = sel.reduce((t, d) => t + d.saldo, 0)
      const venc = sel.filter((d) => d.dias > 0).reduce((t, d) => t + d.saldo, 0)
      return U.tabla(['Doc', 'Folio', 'Fecha', 'Vence', 'Días venc', 'Total', 'Saldo'], filas, {
        limite: a.limite,
        saltar: a.saltar,
        pie: `${c.nombre_comercial} · plazo ${c.plazo || 0} días · saldo ${pesos(tot)}, vencido ${pesos(venc)} · vendedor ${vend(c)}${ultimoPago(c) ? ` · último pago ${ultimoPago(c)}` : ''}`,
      })
    }
    const g = new Map()
    sel.forEach((d) => {
      const c = cMap.get(d.cliente)
      const k = a.agrupar === 'vendedor' ? vend(c) || '(sin)' : d.cliente
      const f = g.get(k) || { c, nombre: a.agrupar === 'vendedor' ? k : String(c.nombre_comercial).trim(), clientes: new Set(), saldo: 0, r: RANGOS.map(() => 0) }
      f.clientes.add(d.cliente)
      f.saldo += d.saldo
      f.r[d.rango] += d.saldo
      g.set(k, f)
    })
    const vencido = (f) => f.saldo - f.r[0]
    const lista = [...g.values()].filter((f) => !a.solo_vencido || vencido(f) > 0.5).sort((x, y) => (a.solo_vencido ? vencido(y) - vencido(x) : y.saldo - x.saldo))
    const filas = lista.map((f) =>
      a.agrupar === 'vendedor'
        ? [f.nombre, f.clientes.size, U.r(f.saldo), ...f.r.map(v0)]
        : [U.corto(f.nombre, 30), U.corto(vend(f.c), 20), U.r(f.saldo), ...f.r.map(v0), ultimoPago(f.c)]
    )
    const cols = a.agrupar === 'vendedor' ? ['Vendedor', 'Clientes', 'Saldo', ...RANGOS] : ['Cliente', 'Vendedor', 'Saldo', ...RANGOS, 'Último pago']
    const tot = sel.reduce((t, d) => t + d.saldo, 0)
    const venc = sel.filter((d) => d.dias > 0).reduce((t, d) => t + d.saldo, 0)
    return U.tabla(cols, filas, {
      limite: a.limite,
      saltar: a.saltar,
      pie: `Por cobrar ${pesos(tot)}, vencido ${pesos(venc)} (${pct(venc, tot)}) · rangos = días vencidos (fecha + plazo del cliente); notas y notas de cargo; sin Tienda Aby${a.cliente && clientes.size > 1 ? ' · varios clientes coinciden: sé más específico para ver documentos' : ''}`,
    })
  },
}

const resumen = {
  nombre: 'resumen',
  titulo: 'Resumen del negocio',
  descripcion: 'Una sola llamada para "¿cómo vamos?": ventas vs mismo tramo del mes anterior, cobranza, por cobrar, por surtir, por recibir, inventario, por pagar, gastos y bancos (según tus permisos).',
  permiso: (u) => [PUEDE.ventas, PUEDE.cartera, PUEDE.pendientes, PUEDE.compras, PUEDE.inventario].some((p) => p(u)),
  entrada: {
    desde: U.fecha('AAAA-MM-DD; default día 1 del mes'),
    hasta: U.fecha('default hoy'),
  },
  correr: async (a, u) => {
    const desde = a.desde || U.inicioMes()
    const hasta = a.hasta || U.hoyStr()
    const area = A.tiendaDe(u)
    const partes = []
    const tareas = []
    const rango = { $gte: desde, $lte: `${hasta}~` }
    if (PUEDE.ventas(u)) {
      const al = alcanceVentas(u)
      tareas.push(
        Promise.all([lineasVenta(desde, hasta, al), lineasVenta(mesAntes(desde), mesAntes(hasta), al)]).then(([act, ant]) => {
          const suma = (L, canal) => L.filter((l) => !canal || l.canal === canal).reduce((t, l) => ({ cant: t.cant + l.cant, venta: t.venta + l.venta }), { cant: 0, venta: 0 })
          const canales = ['Mayoreo', 'Tiendas'].filter((c) => (c === 'Mayoreo' ? al.mayoreo : al.tiendas)).map((c) => {
            const x = suma(act, c)
            return `${c} ${miles(x.cant)} pzs ${pesos(x.venta)} (${variacion(x.venta, suma(ant, c).venta)})`
          })
          const t = suma(act)
          partes[0] = `Ventas ${desde} a ${hasta}${area ? ' (tu tienda)' : ''}: ${pesos(t.venta)} en ${miles(t.cant)} pzs (${variacion(t.venta, suma(ant).venta)} vs ${mesAntes(desde)} a ${mesAntes(hasta)}) · ${canales.join(' · ')} · sin IVA, menos devoluciones`
        })
      )
    }
    if (PUEDE.cartera(u)) {
      tareas.push(
        Promise.all([
          cartera(),
          M.Abonos.aggregate([{ $match: { is_active: { $ne: 'No' }, concepto: 'Abono', fecha: rango } }, { $group: { _id: null, t: { $sum: '$importe' } } }]),
        ]).then(([{ docs }, ab]) => {
          const tot = docs.reduce((t, d) => t + d.saldo, 0)
          const venc = docs.filter((d) => d.dias > 0).reduce((t, d) => t + d.saldo, 0)
          const mas90 = docs.filter((d) => d.dias > 90).reduce((t, d) => t + d.saldo, 0)
          partes[1] = `Cobranza del periodo (por fecha del abono) ${pesos((ab[0] || {}).t)} · Por cobrar ${pesos(tot)}: vencido ${pesos(venc)} (${pct(venc, tot)}), más de 90 días ${pesos(mas90)}`
        })
      )
    }
    if (PUEDE.tiendas(u)) {
      tareas.push(
        M.AbonosTiendas.aggregate([
          { $match: { is_active: { $ne: 'No' }, fecha: rango, ...(area ? { areas: mongoose.Types.ObjectId(area) } : {}) } },
          { $group: { _id: null, t: { $sum: '$total' }, ef: { $sum: '$efectivo' }, tdc: { $sum: '$tdc' }, tr: { $sum: '$transfer' } } },
        ]).then((x) => {
          const s = x[0] || {}
          partes[2] = `Cobrado en tiendas ${pesos(s.t)} (efectivo ${pesos(s.ef)}, TDC ${pesos(s.tdc)}, transferencia ${pesos(s.tr)})`
        })
      )
    }
    if (PUEDE.pendientes(u)) {
      tareas.push(
        pendientesDeSurtir().then(({ lineas, pMap }) => {
          const pzs = lineas.reduce((t, l) => t + l.pendiente_surtir, 0)
          const aut = lineas.filter((l) => l.autorizadoSurtido === 'Si').reduce((t, l) => t + l.pendiente_surtir, 0)
          const imp = lineas.reduce((t, l) => t + l.pendiente_surtir * (Number(l.precio) || 0), 0)
          partes[3] = `Por surtir: ${new Set(lineas.map((l) => id(l.pedidos))).size || pMap.size} pedidos abiertos, ${miles(pzs)} pzs (${miles(aut)} autorizadas), ${pesos(imp)} sin IVA`
        })
      )
    }
    if (PUEDE.compras(u)) {
      tareas.push(
        Promise.all([
          M.Embarques.find({ is_active: { $ne: 'No' }, recibido: { $ne: 'Si' } }, '_id').lean(),
          M.ArticulosOC.aggregate([{ $match: { is_active: 'Si', pendiente_embarcar: { $gt: 0 } } }, { $group: { _id: null, t: { $sum: '$pendiente_embarcar' } } }]),
        ]).then(async ([embs, oc]) => {
          const pend = await M.ArticulosEmbarques.aggregate([{ $match: { is_active: 'Si', embarques: { $in: embs.map((e) => e._id) }, pendiente_recibir: { $gt: 0 } } }, { $group: { _id: null, t: { $sum: '$pendiente_recibir' } } }])
          partes[4] = `Por recibir: ${embs.length} embarques, ${miles((pend[0] || {}).t)} pzs · OC por embarcar ${miles((oc[0] || {}).t)} pzs`
        })
      )
    }
    if (PUEDE.inventario(u)) {
      tareas.push(
        Promise.all([catalogo(), existencias(area)]).then(([cat, ex]) => {
          const z = new Map()
          let valor = 0
          // Igual que la herramienta inventario: solo modelos que existen en el catalogo
          ex.forEach((e, k) => cat.porId.has(k) && Object.entries(e).forEach(([ar, c]) => {
            z.set(ar, (z.get(ar) || 0) + c)
            valor += c * (Number((cat.porId.get(k) || {}).costoMX) || 0)
          }))
          const lista = [...z.entries()].filter(([, c]) => c).sort((x, y) => y[1] - x[1])
          partes[5] = `Inventario ${miles(lista.reduce((t, [, c]) => t + c, 0))} pzs: ${lista.map(([ar, c]) => `${cat.area.get(ar)} ${miles(c)}`).join(' · ')}${A.verCostos(u) ? ` · valor a costo ${pesos(valor)}` : ''}`
        })
      )
    }
    if (PUEDE.porPagar(u)) {
      tareas.push(
        M.Proveedores.find({ is_active: { $ne: 'No' }, saldo: { $gt: 0.5 } }, 'nombre_comercial saldo').sort({ saldo: -1 }).lean().then((ps) => {
          partes[6] = `Por pagar a proveedores ${pesos(ps.reduce((t, p) => t + p.saldo, 0))}${ps.length ? ` (${ps.slice(0, 3).map((p) => `${String(p.nombre_comercial).trim()} ${pesos(p.saldo)}`).join(', ')})` : ''}`
        })
      )
    }
    if (PUEDE.gastos(u)) {
      tareas.push(
        M.GastosGeneral.aggregate([{ $match: { is_active: { $ne: 'No' }, fecha: rango } }, { $group: { _id: null, t: { $sum: '$total' } } }]).then((x) => {
          partes[7] = `Gastos del periodo ${pesos((x[0] || {}).t)}`
        })
      )
    }
    if (PUEDE.bancos(u)) {
      tareas.push(
        M.Bancos.find({ is_active: { $ne: 'No' } }, 'moneda abonos cargos').lean().then((bs) => {
          const m = new Map()
          bs.forEach((b) => m.set(b.moneda || 'MXN', (m.get(b.moneda || 'MXN') || 0) + (b.abonos || 0) - (b.cargos || 0)))
          partes[8] = `Bancos: ${[...m.entries()].map(([mon, s]) => `${mon} ${pesos(s)}`).join(' · ')}`
        })
      )
    }
    await Promise.all(tareas)
    return partes.filter(Boolean).join('\n')
  },
}

// ---------- PDFs para descargar: estado de cuenta e inventario disponible (formato de mcp/pdf.js)
const PDF = require('./pdf')
const archivos = require('./archivos')

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100
const urlBase = () => String(process.env.MCP_PUBLIC_URL || '').trim().replace(/[/.]+$/, '')
const nombreArchivo = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().replace(/[^\w.-]+/g, '_')
const empresa = () => process.env.REACT_APP_NOMBRE_INSTITUCION || 'Demo Importacion'
const pieDe = (u) => `Generado desde Claude por ${persona(u)} el ${U.hoyStr()}`

// El PDF se queda en memoria 30 min y se baja con GET /mcp/archivo/:token (ver archivos.js)
function conEnlace(hecho, nombre, que) {
  const token = archivos.guarda(hecho.buffer, nombre)
  const uri = `${urlBase()}/mcp/archivo/${token}`
  return {
    texto: `PDF listo: ${que} (${hecho.paginas} pág.). Descargar: ${uri} · vence en 30 minutos`,
    __enlace: { uri, name: nombre, mimeType: 'application/pdf', description: que },
  }
}

async function unCliente(texto) {
  const cs = (await M.Clientes.find({ is_active: { $ne: 'No' } }, 'nombre_comercial razon_social').lean()).filter((c) => U.coincide(texto, c.nombre_comercial, c.razon_social))
  if (!cs.length) throw U.errorUsuario(`No hay cliente que coincida con "${texto}"`)
  if (cs.length === 1) return cs[0]
  const exacto = cs.filter((c) => U.normaliza(String(c.nombre_comercial).trim()) === U.normaliza(texto.trim()))
  if (exacto.length === 1) return exacto[0]
  throw U.errorUsuario(`Coinciden ${cs.length} clientes; sé más específico: ${cs.slice(0, 15).map((c) => String(c.nombre_comercial).trim()).join(' · ')}`)
}

// Mismo estado de cuenta que la pantalla (EstadoCuentaController) + antiguedad como el reporte
async function pdfEstadoCuenta(a, u) {
  if (!a.cliente) throw U.errorUsuario('Falta el cliente')
  const base = await unCliente(a.cliente)
  const [c, movs, { docs }] = await Promise.all([
    M.Clientes.findById(base._id, 'nombre_comercial razon_social codigo plazo vendedor telefono ultimo_pago areas').populate('vendedor', 'nombre apellido').lean(),
    U.llamar(EstadoCuentaController.findOneClienteAgrupado, { params: { cliente: String(base._id) } }),
    cartera(),
  ])
  if ((Array.isArray(c.areas) ? c.areas : [c.areas]).some((x) => U.idDe(x) === A.AREA_EXCLUIDA)) {
    throw U.errorUsuario('Ese cliente es de Tienda Aby: su cuenta ya no se maneja en este sistema')
  }
  const hoy = U.hoyStr()
  const suyos = docs.filter((d) => d.cliente === String(c._id)).sort((x, y) => String(x.fecha).localeCompare(String(y.fecha)))

  // Movimientos con saldo corrido; con "desde" el saldo previo va en un renglon de saldo anterior
  let saldo = 0
  let conAnterior = false
  const filas = []
  const anterior = () => {
    if (a.desde && !conAnterior) filas.push({ fecha: a.desde, movimiento: 'Saldo anterior', saldo: r2(saldo) })
    conAnterior = true
  }
  movs.forEach((m) => {
    const f = String(m.fecha || '').slice(0, 10)
    const cargo = Number(m.cargo) || 0
    const abono = (Number(m.abono) || 0) + (Number(m.bonificacion) || 0) + (Number(m.devolucion) || 0)
    if (a.desde && f < a.desde) {
      saldo += cargo - abono
      return
    }
    if (a.hasta && f > a.hasta) return
    anterior()
    saldo += cargo - abono
    filas.push({
      fecha: f,
      movimiento: m.movimiento,
      folio: m.numero !== undefined && m.numero !== null ? String(m.numero) : '',
      observaciones: m.observaciones === 'NA' ? '' : m.observaciones,
      banco: m.banco === 'NA' ? '' : m.banco,
      cargos: cargo ? r2(cargo) : null,
      abonos: abono ? r2(abono) : null,
      saldo: r2(saldo),
    })
  })
  anterior()
  const ant = RANGOS.map((_, i) => suyos.filter((d) => d.rango === i).reduce((t, d) => t + d.saldo, 0))
  const porCobrar = ant.reduce((t, x) => t + x, 0)
  const suma = (l, k) => r2(l.reduce((t, f) => t + (Number(f[k]) || 0), 0))
  const periodo = a.desde || a.hasta ? ` · movimientos ${a.desde || 'inicio'} a ${a.hasta || hoy}` : ''
  const hecho = PDF.pdfDocumento({
    empresa: empresa(),
    titulo: 'Estado de cuenta',
    subtitulo: `${String(c.nombre_comercial).trim()} · al ${hoy}${periodo}`,
    datos: {
      cliente: String(c.nombre_comercial).trim(),
      numero_cliente: c.codigo !== undefined && c.codigo !== null ? String(c.codigo) : '',
      vendedor: persona(c.vendedor),
      plazo: `${Number(c.plazo) || 0} días`,
      telefono: c.telefono,
      ultimo_pago: ultimoPago(c),
      saldo_por_cobrar: r2(porCobrar),
      vencido: r2(porCobrar - ant[0]),
    },
    secciones: [
      { titulo: 'Antigüedad de saldos (días vencidos: fecha + plazo)', filas: [Object.fromEntries(RANGOS.map((k, i) => [k, r2(ant[i])]).concat([['Total', r2(porCobrar)]]))] },
      {
        titulo: 'Documentos con saldo',
        filas: suyos.map((d) => ({ documento: d.doc, folio: String(d.folio), fecha: String(d.fecha).slice(0, 10), vence: d.vence, dias_vencidos: d.dias > 0 ? d.dias : null, total: r2(d.total), saldo: r2(d.saldo) })),
        totales: { total: suma(suyos, 'total'), saldo: suma(suyos, 'saldo') },
      },
      { titulo: `Movimientos${periodo ? ` (${periodo.slice(15)})` : ''}`, filas, totales: { cargos: suma(filas, 'cargos'), abonos: suma(filas, 'abonos'), saldo: r2(saldo) } },
    ],
    pieTexto: pieDe(u),
  })
  return conEnlace(hecho, `EstadoCuenta_${nombreArchivo(c.nombre_comercial)}_${hoy}.pdf`, `Estado de cuenta de ${String(c.nombre_comercial).trim()}`)
}

// Mismo disponible que la pantalla Disponible; el usuario de tienda recibe las existencias de su tienda
async function pdfInventario(a, u) {
  const soloArea = A.tiendaDe(u)
  const [cat, ex, comp] = await Promise.all([catalogo(), existencias(soloArea), soloArea ? null : comprometido()])
  const filas = []
  cat.arts.forEach((x) => {
    if (a.q && !U.coincide(a.q, x.codigo, x.nombre, cat.de(x, 'linea'), cat.de(x, 'marca'), cat.de(x, 'familia'), cat.de(x, 'coleccion'))) return
    const k = String(x._id)
    const inv = Object.values(ex.get(k) || {}).reduce((t, c) => t + c, 0)
    const base = { codigo: x.codigo, nombre: x.nombre, linea: cat.de(x, 'linea'), precio: r2(x.venta) || null }
    if (soloArea) {
      if (a.con_cero || inv > 0) filas.push({ ...base, existencia: inv })
      return
    }
    const rec = comp.recibir(k)
    const ped = comp.pedido(k)
    const tras = comp.traspaso(k)
    const disp = inv + rec - ped - tras
    if (a.con_cero || disp > 0) filas.push({ ...base, inventario: inv, por_recibir: rec, pedido: ped, traspaso: tras, disponible: disp })
  })
  filas.sort((x, y) => String(x.codigo).localeCompare(String(y.codigo)))
  const totales = {}
  ;(soloArea ? ['existencia'] : ['inventario', 'por_recibir', 'pedido', 'traspaso', 'disponible']).forEach((k) => { totales[k] = filas.reduce((t, f) => t + (Number(f[k]) || 0), 0) })
  const hoy = U.hoyStr()
  const tienda = soloArea ? cat.area.get(soloArea) : ''
  const hecho = PDF.pdfListado({
    empresa: empresa(),
    titulo: soloArea ? `Inventario ${tienda}` : 'Inventario disponible',
    subtitulo: [hoy, a.q ? `filtro "${a.q}"` : '', soloArea ? '' : 'Disponible = inventario de todos los almacenes + por recibir (embarques y OC) - pedidos autorizados sin surtir - traspasos solicitados'].filter(Boolean).join(' · '),
    filas,
    totales,
    pieTexto: pieDe(u),
  })
  const que = soloArea ? `Inventario de ${tienda}` : 'Inventario disponible'
  return conEnlace(hecho, `${nombreArchivo(que)}${a.q ? `_${nombreArchivo(a.q)}` : ''}_${hoy}.pdf`, `${que}${a.q ? ` (${a.q})` : ''}: ${filas.length} modelos`)
}

const descargarPdf = {
  nombre: 'descargar_pdf',
  titulo: 'Descargar PDF',
  descripcion: (u) =>
    `PDF con enlace de descarga (vence en 30 min): ${[
      PUEDE.cartera(u) ? 'estado_cuenta de un cliente (saldo, antigüedad, documentos y movimientos; desde/hasta acota los movimientos)' : '',
      PUEDE.inventario(u) ? `inventario_disponible (${A.tiendaDe(u) ? 'existencias de tu tienda' : 'inventario, por recibir, pedidos y disponible'}; q filtra por código, nombre, línea o marca)` : '',
    ].filter(Boolean).join('; ')}. Da el enlace tal cual.`,
  permiso: (u) => PUEDE.cartera(u) || PUEDE.inventario(u),
  entrada: (u) => ({
    tipo: z.enum([...(PUEDE.cartera(u) ? ['estado_cuenta'] : []), ...(PUEDE.inventario(u) ? ['inventario_disponible'] : [])]),
    ...(PUEDE.cartera(u) ? { cliente: z.string().optional(), desde: U.fecha(), hasta: U.fecha() } : {}),
    ...(PUEDE.inventario(u) ? { q: z.string().optional(), con_cero: z.boolean().default(false).describe('Incluir modelos sin disponible') } : {}),
  }),
  correr: (a, u) => (a.tipo === 'estado_cuenta' && PUEDE.cartera(u) ? pdfEstadoCuenta(a, u) : pdfInventario(a, u)),
}

const HERRAMIENTAS = [resumen, inventario, ventas, pendientes, compras, carteraHerr, descargarPdf, herramientaConsulta]

// Puede conectar Claude quien tenga al menos una herramienta
const usuarioApto = (u) => !!u && u.is_active !== 'No' && HERRAMIENTAS.some((h) => !h.permiso || h.permiso(u))

module.exports = { HERRAMIENTAS, usuarioApto }
