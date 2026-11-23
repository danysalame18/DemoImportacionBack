// Consulta general del MCP: cualquier listado del sistema con el permiso del boton de su pantalla
// (Botones*.jsx). Agregar un modulo = agregar un renglon a MODULOS. Van todos aunque hoy esten
// vacios: el usuario los va a ir usando. Fuera a proposito: nomina, sueldos y usuarios.
// Responde en tabla "col|col" (ver util.tabla) y con "folio" da el documento y sus renglones.
const { z } = require('zod')
const modelos = require('../models')
const U = require('./util')
const A = require('./acceso')

const LIMITE_DOCUMENTOS = 5000
// Catalogos (articulos, clientes, proveedores) se leen completos para que buscar los encuentre todos
const LIMITE_CATALOGO = 30000

const uno = (v) => (Array.isArray(v) ? v[0] : v)
const nom = (v, c = 'name') => String((uno(v) && uno(v)[c]) || '').trim()
const razon = (v) => nom(v, 'nombre_comercial') || nom(v, 'razon_social')
const persona = (v) => (uno(v) ? [uno(v).nombre, uno(v).apellido].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim() : '')
const folioDe = (v, c) => (uno(v) && uno(v)[c]) || ''
const cod = (v) => nom(v, 'codigo')
const tel = (v) => (String(v || '').replace(/\D/g, '').length > 6 ? v : '')
const notaTienda = (v) => (uno(v) ? `${uno(v).prefijo || ''}${uno(v).consecutivo ?? uno(v).idVentaTienda ?? ''}` : '')
// Rellenos del sistema que no son dato: NA, fecha 2000-01-01, correo a@a.a, "Sin Guia"
const RELLENO = new Set(['NA', 'N/A', '2000-01-01', 'a@a.a', 'Sin Guia', 'Sin Factura'])
const limpia = (f) => f.map((v) => (RELLENO.has(String(v ?? '').trim()) ? '' : v))
const r = U.r
const r2 = (n) => Math.round(Number(n || 0) * 100) / 100
// Que movimiento genero un registro de bancos
const ORIGEN_BANCO = [
  ['abonos', 'Cobro cliente'], ['abonosTiendas', 'Cobro tienda'], ['abonosTraspasos', 'Cobro traspaso'], ['abonosProveedores', 'Pago proveedor'],
  ['gastosGeneral', 'Gasto'], ['gastosTiendas', 'Gasto tienda'], ['bancosTraspasos', 'Traspaso'], ['comisiones', 'Comisión'], ['anticipos', 'Anticipo'],
]

// Los usuarios siempre con select: el modelo trae la contrasena
const P = {
  cliente: { path: 'clientes', select: 'nombre_comercial razon_social' },
  proveedor: { path: 'proveedores', select: 'nombre_comercial razon_social' },
  almacen: { path: 'areas', select: 'name' },
  usuario: { path: 'user', select: 'nombre apellido' },
  vendedor: { path: 'colaboradores', select: 'nombre apellido' },
  articulo: { path: 'articulos', select: 'codigo nombre' },
  pedido: { path: 'pedidos', select: 'idPedido' },
  nota: { path: 'surtidos', select: 'idSurtido' },
  embarque: { path: 'embarques', select: 'idEmbarques' },
  banco: { path: 'bancos', select: 'banco' },
  ventaTienda: { path: 'ventasTiendas', select: 'prefijo consecutivo idVentaTienda' },
  salida: { path: 'areaSalida', select: 'name' },
  destino: { path: 'areaDestino', select: 'name' },
}

const puede = (...permisos) => (u) => !A.esDeTienda(u) && permisos.some((p) => !!u[p])
// Pantallas de Tiendas: el usuario de tienda solo ve lo de su tienda (ver acceso.js)
const tiendas = (...permisos) => (u) => A.accesoTiendas(u) && permisos.some((p) => !!u[p])

// t: aclaracion corta solo si el nombre no basta (va en la descripcion de la herramienta)
// cols/fila: columnas de la tabla; suma: columnas que se totalizan; renglones.agrupar: n columnas clave
// renglones.sumar: columnas que suman en el pie (las demas, como Precio, no)
const MODULOS = {
  // ---- Ventas (mayoreo)
  pedidos: {
    permiso: puede('menu_pedidos'),
    modelo: 'Pedidos', folio: 'idPedido', base: { is_active: 'Si' },
    poblar: [P.cliente, P.vendedor, P.almacen],
    cols: ['Pedido', 'Fecha', 'Cliente', 'Vendedor', 'Almacén', 'Pzs', 'Entregadas', 'Pend', 'Total', 'Status', 'Autorizado', 'Obs'],
    fila: (d) => [d.idPedido, d.fecha, razon(d.clientes), persona(d.colaboradores), nom(d.areas), r(d.total_cantidad), r(d.piezasEntregadas), r(d.piezasPendientes), r(d.total_general), d.status, d.autorizadoSurtido, U.corto(d.observaciones, 40)],
    suma: ['Pzs', 'Pend', 'Total'],
    renglones: {
      // sin filtro de activo: al cerrar el pedido sus renglones quedan dados de baja
      modelo: 'ArticulosPedido', por: 'pedidos', poblar: [P.articulo],
      cols: ['Código', 'Cant', 'Surtido', 'Pend', 'Precio', 'Total', 'Autorizado', 'Baja'],
      fila: (x) => [cod(x.articulos), x.cantidad, x.surtido, x.pendiente_surtir, r2(x.precio), r(x.total), x.autorizadoSurtido, x.is_active === 'No' ? 'Si' : ''],
      sumar: ['Cant', 'Surtido', 'Pend', 'Total'],
    },
  },
  notas: {
    t: 'ventas surtidas de mayoreo',
    permiso: puede('menu_surtidos', 'menu_ventas'),
    modelo: 'Surtidos', folio: 'idSurtido', base: { is_active: 'Si' },
    poblar: [P.cliente, P.vendedor, P.almacen, P.pedido],
    cols: ['Nota', 'Fecha', 'Pedido', 'Cliente', 'Vendedor', 'Almacén', 'Pzs', 'Subtotal', 'IVA', 'Total', 'Saldo', 'Factura', 'Guía', 'Obs'],
    fila: (d) => [d.idSurtido, d.fecha, folioDe(d.pedidos, 'idPedido'), razon(d.clientes), persona(d.colaboradores), nom(d.areas), r(d.total_cantidad), r(d.subTotal), r(d.iva), r(d.total_general), r(d.saldo), d.noFactura, d.noGuia, U.corto(d.observaciones, 40)],
    suma: ['Pzs', 'Subtotal', 'IVA', 'Total', 'Saldo'],
    renglones: {
      modelo: 'ArticulosSurtidos', por: 'surtidos', poblar: [P.articulo, { path: 'articulosPedido', select: 'precio' }],
      cols: ['Código', 'Cant', 'Precio', 'Importe'],
      fila: (x) => [cod(x.articulos), x.cantidad, r2(nom(x.articulosPedido, 'precio')), r(x.cantidad * (Number(nom(x.articulosPedido, 'precio')) || 0))],
      sumar: ['Cant', 'Importe'],
    },
  },
  devoluciones: {
    permiso: puede('menu_devoluciones', 'menu_devolucionesAdmin'),
    modelo: 'Devoluciones', folio: 'idDevolucion', base: { is_active: 'Si' },
    poblar: [P.cliente, P.almacen, P.nota],
    cols: ['Dev', 'Fecha', 'Nota', 'Cliente', 'Almacén', 'Pzs', 'Total', 'Aplicada', 'Obs'],
    fila: (d) => [d.idDevolucion, d.fecha, folioDe(d.surtidos, 'idSurtido'), razon(d.clientes), nom(d.areas), r(d.total_cantidad), r(d.total_general), d.aplicada, U.corto(d.observaciones, 40)],
    suma: ['Pzs', 'Total'],
    renglones: {
      modelo: 'ArticulosDevoluciones', por: 'devoluciones', base: { is_active: 'Si' }, poblar: [P.articulo],
      cols: ['Código', 'Cant', 'Defectos', 'Precio', 'Total'],
      fila: (x) => [cod(x.articulos), x.cantidad, x.defectos, r2(x.precio), r(x.total)],
      sumar: ['Cant', 'Defectos', 'Total'],
    },
  },
  clientes: {
    t: 'saldos, plazo y contacto',
    permiso: puede('menu_clientes', 'edoCtaClientes'),
    modelo: 'Clientes', folio: 'codigo', sinFecha: true, base: { is_active: { $ne: 'No' } }, orden: { saldo: -1 },
    poblar: [{ path: 'vendedor', select: 'nombre apellido' }, { path: 'grupos', select: 'name' }],
    cols: ['Núm', 'Cliente', 'Vendedor', 'Grupo', 'Cargos', 'Abonos', 'Saldo', 'Plazo', 'Último pago', 'Tel', 'Email', 'Estado', 'Compromiso'],
    fila: (d) => [d.codigo, razon(d), persona(d.vendedor), nom(d.grupos), r(d.cargos), r(d.abonos), r(d.saldo), d.plazo ?? '', d.ultimo_pago, tel(d.telefono), d.email, d.estado, d.fechaCompromiso],
    suma: ['Cargos', 'Abonos', 'Saldo'],
    texto: (d) => [d.razon_social, d.RFC, d.observacionesCobranza],
  },
  abonos: {
    t: 'cobranza de clientes',
    permiso: puede('abonos', 'edoCtaClientes'),
    modelo: 'Abonos', folio: 'idAbono', base: { is_active: { $ne: 'No' } },
    poblar: [P.cliente, P.nota, P.banco, { path: 'notasCargo', select: 'idNotaCargo' }],
    cols: ['Abono', 'Fecha', 'Cliente', 'Importe', 'Forma', 'Concepto', 'Nota', 'NC', 'Banco', 'Obs'],
    fila: (d) => [d.idAbono, d.fecha, razon(d.clientes), r2(d.importe), d.formaPago, d.concepto, folioDe(d.surtidos, 'idSurtido'), folioDe(d.notasCargo, 'idNotaCargo'), nom(d.bancos, 'banco'), U.corto(d.observaciones, 40)],
    suma: ['Importe'],
  },
  notas_cargo: {
    permiso: puede('notasCargo'),
    modelo: 'NotasCargo', folio: 'idNotaCargo',
    poblar: [P.cliente],
    cols: ['NC', 'Fecha', 'Cliente', 'Importe', 'Saldo', 'Obs'],
    fila: (d) => [d.idNotaCargo, d.fecha, razon(d.clientes), r(d.importe), r(d.saldo), U.corto(d.observaciones, 50)],
    suma: ['Importe', 'Saldo'],
  },
  saldo_inicial: {
    permiso: puede('notasCargo'),
    modelo: 'SaldoInicial', folio: 'idSaldoInicial',
    poblar: [P.cliente],
    cols: ['SI', 'Fecha', 'Cliente', 'Importe', 'Saldo', 'Obs'],
    fila: (d) => [d.idSaldoInicial, d.fecha, razon(d.clientes), r(d.importe), r(d.saldo), U.corto(d.observaciones, 50)],
    suma: ['Importe', 'Saldo'],
  },
  anticipos: {
    t: 'de clientes',
    permiso: puede('menuAnticipos'),
    modelo: 'Anticipos', folio: 'idAnticipo', base: { is_active: { $ne: 'No' } },
    poblar: [P.cliente, P.banco],
    cols: ['Anticipo', 'Fecha', 'Cliente', 'Importe', 'Usado', 'Saldo', 'Forma', 'Banco'],
    fila: (d) => [d.idAnticipo, d.fecha, razon(d.clientes), r(d.importe), r(d.utilizado), r(d.saldo), d.formaPago, nom(d.bancos, 'banco')],
    suma: ['Importe', 'Usado', 'Saldo'],
  },
  comisiones: {
    permiso: puede('comisiones'),
    modelo: 'Comisiones', folio: 'idComision', base: { is_active: { $ne: 'No' } },
    poblar: [P.vendedor, P.banco],
    cols: ['Comisión', 'Fecha', 'Vendedor', 'Cobrado', '%', 'Comisión $', 'Pagada', 'Banco'],
    fila: (d) => [d.idComision, d.fecha, persona(d.colaboradores), r(d.importe), d.porcentaje, r(d.total), d.pagada, nom(d.bancos, 'banco')],
    suma: ['Cobrado', 'Comisión $'],
  },
  // ---- Compras y proveedores
  ordenes_compra: {
    permiso: puede('menu_oc'),
    modelo: 'OrdenesCompra', folio: 'idOrdenCompra', base: { is_active: { $ne: 'No' } },
    poblar: [P.proveedor],
    cols: ['OC', 'Fecha', 'Proveedor', 'Folio prov', 'Moneda', 'Pzs', 'Embarcado', 'Total', 'Status', 'Autorizada', 'Compromiso'],
    fila: (d) => [d.idOrdenCompra, d.fecha, razon(d.proveedores), d.folioProveedor, d.moneda, r(d.total_cantidad), r(d.embarcado), r(d.total_general), d.status, d.autorizado, d.fecha_compromiso],
    suma: ['Pzs', 'Embarcado', 'Total'],
    renglones: {
      modelo: 'ArticulosOC', por: 'ordenesCompra', base: { is_active: { $ne: 'No' } }, poblar: [P.articulo],
      cols: ['Código', 'Cant', 'Embarcado', 'Pend', 'Precio', 'Total'],
      fila: (x) => [cod(x.articulos), x.cantidad, x.embarcado, x.pendiente_embarcar, r2(x.precio), r(x.total)],
      sumar: ['Cant', 'Embarcado', 'Pend', 'Total'],
    },
  },
  embarques: {
    t: 'contenedores',
    permiso: puede('embarques', 'menu_compras'),
    modelo: 'Embarques', folio: 'idEmbarques', base: { is_active: { $ne: 'No' } }, fecha: 'fechaEmbarque',
    cols: ['Emb', 'Contenedor', 'Salida', 'Llegada', 'Pzs', 'Costo', 'Gastos', 'Saldo', 'Recibido', 'Factura', 'Obs'],
    fila: (d) => [d.idEmbarques, d.contenedor, d.fechaEmbarque, d.fechaEstimada, r(d.total_cantidad), r(d.total_costo), r(d.total_gasto), r(d.saldo), d.recibido, d.noFactura, U.corto(d.observaciones, 40)],
    suma: ['Pzs', 'Costo', 'Gastos', 'Saldo'],
    renglones: {
      modelo: 'ArticulosEmbarques', por: 'embarques', base: { is_active: { $ne: 'No' } }, poblar: [P.articulo, P.proveedor],
      cols: ['Código', 'Proveedor', 'Cant', 'Recibido', 'Pend', 'Costo', 'Total'],
      fila: (x) => [cod(x.articulos), razon(x.proveedores), x.cantidad, x.recibido, x.pendiente_recibir, r2(x.costo), r(x.total_costo)],
      sumar: ['Cant', 'Recibido', 'Pend', 'Total'],
    },
  },
  gastos_embarque: {
    permiso: puede('embarques', 'menu_compras'),
    modelo: 'GastosEmbarques', sinFecha: true,
    poblar: [P.embarque, { path: 'conceptosGastosEmbarques', select: 'concepto' }],
    cols: ['Emb', 'Concepto', 'Estimado', 'Real'],
    fila: (d) => [folioDe(d.embarques, 'idEmbarques'), nom(d.conceptosGastosEmbarques, 'concepto'), r(d.estimado), r(d.real)],
    suma: ['Estimado', 'Real'],
  },
  entradas: {
    t: 'recepciones de mercancía y compras directas',
    permiso: puede('menu_compras'),
    modelo: 'Compras', folio: 'idCompras', base: { is_active: { $ne: 'No' } },
    poblar: [P.embarque, P.almacen, P.usuario],
    cols: ['Entrada', 'Fecha', 'Emb', 'Almacén', 'Pzs', 'TC', 'Factura', 'Usuario', 'Obs'],
    fila: (d) => [d.idCompras, d.fecha, folioDe(d.embarques, 'idEmbarques'), nom(d.areas), r(d.total_cantidad), d.tipoCambio, d.factura, persona(d.user), U.corto(d.observaciones, 40)],
    suma: ['Pzs'],
    renglones: {
      modelo: 'ComprasAcumulados', por: 'compras', poblar: [P.articulo],
      cols: ['Código', 'Cant', 'Precio', 'TC', 'Precio MX'],
      fila: (x) => [cod(x.articulos), x.cantidad, r2(x.precio), x.tipoCambio, r2(x.precioMX)],
      sumar: ['Cant'],
    },
  },
  devoluciones_proveedores: {
    permiso: puede('menu_compras'),
    modelo: 'DevolucionesProveedores', folio: 'idDevolucionProveedor', base: { is_active: { $ne: 'No' } },
    poblar: [P.proveedor, P.almacen],
    cols: ['Dev', 'Fecha', 'Proveedor', 'Almacén', 'Pzs', 'Total', 'Aplicada', 'Obs'],
    fila: (d) => [d.idDevolucionProveedor, d.fecha, razon(d.proveedores), nom(d.areas), r(d.total_cantidad), r(d.total_general), d.aplicada, U.corto(d.observaciones, 40)],
    suma: ['Pzs', 'Total'],
    renglones: {
      modelo: 'ArticulosDevolucionesProveedores', por: 'devolucionesProveedores', base: { is_active: { $ne: 'No' } }, poblar: [P.articulo],
      cols: ['Código', 'Cant', 'Precio', 'Total'],
      fila: (x) => [cod(x.articulos), x.cantidad, r2(x.precio), r(x.total)],
      sumar: ['Cant', 'Total'],
    },
  },
  control_calidad: {
    permiso: puede('menuCalidad'),
    modelo: 'ControlCalidad', folio: 'idControlCalidad', base: { is_active: { $ne: 'No' } },
    poblar: [P.proveedor],
    cols: ['CC', 'Fecha', 'Proveedor', 'Familia', 'Descripción', 'Total'],
    fila: (d) => [d.idControlCalidad, d.fecha, razon(d.proveedores), d.familia, U.corto(d.descripcion, 50), r(d.total)],
    suma: ['Total'],
  },
  proveedores: {
    t: 'saldos y contacto',
    permiso: puede('menu_proveedores', 'edoCtaProveedores', 'pagoProveedores'),
    modelo: 'Proveedores', sinFecha: true, base: { is_active: { $ne: 'No' } }, orden: { saldo: -1 },
    cols: ['Proveedor', 'Tipo', 'Moneda', 'Cargos', 'Abonos', 'Saldo', 'Contacto', 'Tel', 'Email'],
    fila: (d) => [razon(d), d.tipo, d.moneda, r(d.cargos), r(d.abonos), r(d.saldo), d.contacto, tel(d.telefono), d.email],
    suma: ['Cargos', 'Abonos', 'Saldo'],
    texto: (d) => [d.razon_social, d.RFC],
  },
  cxp: {
    t: 'compras por pagar (notas de proveedor)',
    permiso: puede('edoCtaProveedores'),
    modelo: 'NotasCxP', folio: 'idNotasCxP', base: { is_active: { $ne: 'No' } },
    poblar: [P.proveedor, P.embarque, { path: 'compras', select: 'idCompras' }],
    cols: ['Nota', 'Fecha', 'Proveedor', 'Emb', 'Entrada', 'Pzs', 'Total', 'Saldo', 'Directa'],
    fila: (d) => [d.idNotasCxP, d.fecha, razon(d.proveedores), folioDe(d.embarques, 'idEmbarques'), folioDe(d.compras, 'idCompras'), r(d.total_cantidad), r(d.total_costo), r(d.saldo), d.compraDirecta],
    suma: ['Pzs', 'Total', 'Saldo'],
  },
  pagos_proveedores: {
    permiso: puede('pagoProveedores'),
    modelo: 'AbonosProveedores', folio: 'idAbonoProveedor',
    poblar: [P.proveedor, P.banco],
    cols: ['Pago', 'Fecha', 'Proveedor', 'Importe', 'TC', 'Concepto', 'Banco', 'Obs'],
    fila: (d) => [d.idAbonoProveedor, d.fecha, razon(d.proveedores), r(d.importe), d.tipoCambio, d.concepto, nom(d.bancos, 'banco'), U.corto(d.observaciones, 40)],
    suma: ['Importe'],
  },
  // ---- Inventario
  ajustes: {
    t: 'ajustes de inventario',
    permiso: (u) => !!u.ajustesInventario,
    modelo: 'AjustesInventario', folio: 'idAjustesInventario', area: 'areas',
    poblar: [P.almacen, P.usuario],
    cols: ['Ajuste', 'Fecha', 'Almacén', 'Pzs', 'Autorizado', 'Usuario', 'Obs'],
    fila: (d) => [d.idAjustesInventario, d.fecha, nom(d.areas), r(d.total), d.autorizado, persona(d.user), U.corto(d.observaciones, 50)],
    suma: ['Pzs'],
    renglones: {
      modelo: 'ArticulosAjustesInv', por: 'ajustesInventario', poblar: [P.articulo, P.almacen], agrupar: 2,
      cols: ['Código', 'Almacén', 'Cant'],
      fila: (x) => [cod(x.articulos), nom(x.areas), x.cantidad],
      sumar: ['Cant'],
    },
  },
  traspasos: {
    permiso: (u) => !!(u.menu_traspasos_salida || u.menu_traspasos_entrada),
    modelo: 'TraspasosSalida', folio: 'idTraspasosSalida', base: { is_active: { $ne: 'No' } }, area: ['areaSalida', 'areaDestino'],
    poblar: [P.salida, P.destino, P.usuario],
    cols: ['Traspaso', 'Fecha', 'De', 'A', 'Pzs', 'Importe', 'Recibido', 'Usuario', 'Obs'],
    fila: (d) => [d.idTraspasosSalida, d.fecha, nom(d.areaSalida), nom(d.areaDestino), r(d.total), r(d.total_general), d.recibida, persona(d.user), U.corto(d.observaciones, 40)],
    suma: ['Pzs', 'Importe'],
    renglones: {
      modelo: 'ArticulosTS', por: 'traspasosSalida', base: { is_active: { $ne: 'No' } }, poblar: [P.articulo], agrupar: 1,
      cols: ['Código', 'Cant'],
      fila: (x) => [cod(x.articulos), x.cantidad],
      sumar: ['Cant'],
    },
  },
  solicitudes_traspaso: {
    permiso: (u) => !!u.menu_traspasos_salida,
    modelo: 'TraspasosSolicitudV2', folio: 'idTraspasosSolicitudV2', base: { is_active: { $ne: 'No' } }, area: ['areaSalida', 'areaDestino'],
    poblar: [P.salida, P.destino],
    cols: ['Solicitud', 'Fecha', 'De', 'A', 'Pzs', 'Status', 'Surtido', 'Obs'],
    fila: (d) => [d.idTraspasosSolicitudV2, d.fecha, nom(d.areaSalida), nom(d.areaDestino), r(d.total_cantidad), d.status, d.surtido, U.corto(d.observaciones, 40)],
    suma: ['Pzs'],
    renglones: {
      modelo: 'ArticulosTSolV2', por: 'traspasosSolicitudV2', base: { is_active: { $ne: 'No' } }, poblar: [P.articulo], agrupar: 1,
      cols: ['Código', 'Cant', 'Surtido', 'Pend'],
      fila: (x) => [cod(x.articulos), x.cantidad, x.surtido, x.pendiente_surtir],
      sumar: ['Cant', 'Surtido', 'Pend'],
    },
  },
  muestras_salida: {
    permiso: puede('menu_traspasos_salida'),
    modelo: 'MuestrasSalida', folio: 'idMuestrasSalida',
    poblar: [P.cliente, P.almacen, P.usuario],
    cols: ['Muestra', 'Fecha', 'Cliente', 'Almacén', 'Pzs', 'Usuario', 'Obs'],
    fila: (d) => [d.idMuestrasSalida, d.fecha, razon(d.clientes), nom(d.areas), r(d.total), persona(d.user), U.corto(d.observaciones, 40)],
    suma: ['Pzs'],
    renglones: {
      modelo: 'ArticulosMS', por: 'muestrasSalida', poblar: [P.articulo], agrupar: 1,
      cols: ['Código', 'Cant'], fila: (x) => [cod(x.articulos), x.cantidad], sumar: ['Cant'],
    },
  },
  muestras_entrada: {
    permiso: puede('menu_traspasos_entrada'),
    modelo: 'MuestrasEntrada', folio: 'idMuestrasEntrada',
    poblar: [P.cliente, P.almacen, P.usuario],
    cols: ['Muestra', 'Fecha', 'Cliente', 'Almacén', 'Pzs', 'Usuario', 'Obs'],
    fila: (d) => [d.idMuestrasEntrada, d.fecha, razon(d.clientes), nom(d.areas), r(d.total), persona(d.user), U.corto(d.observaciones, 40)],
    suma: ['Pzs'],
    renglones: {
      modelo: 'ArticulosME', por: 'muestrasEntrada', poblar: [P.articulo], agrupar: 1,
      cols: ['Código', 'Cant'], fila: (x) => [cod(x.articulos), x.cantidad], sumar: ['Cant'],
    },
  },
  articulos: {
    t: 'catálogo de modelos: línea, marca, familia, proveedor, precios, EAN, clave SAT',
    permiso: puede('menu_articulos', 'inventarios'),
    modelo: 'Articulos', sinFecha: true, orden: { codigo: 1 },
    campos: 'codigo nombre descripcion lineas marcas familias colecciones proveedores piezasPorCaja costoUSD costoMX venta precioTienda EAN codigoSAT ano is_active',
    poblar: ['lineas', 'marcas', 'familias', 'colecciones'].map((path) => ({ path, select: 'name' })).concat([P.proveedor]),
    cols: (u) => ['Código', 'Nombre', 'Línea', 'Marca', 'Familia', 'Colección', 'Proveedor', 'PxC', ...(A.verCostos(u) ? ['Costo USD', 'Costo MX'] : []), 'Venta', 'P. tienda', 'EAN', 'SAT', 'Año', 'Activo'],
    fila: (d, u) => [
      d.codigo, U.corto(d.nombre, 40), nom(d.lineas), nom(d.marcas), nom(d.familias), nom(d.colecciones), razon(d.proveedores), d.piezasPorCaja,
      ...(A.verCostos(u) ? [r2(d.costoUSD), r2(d.costoMX)] : []), r2(d.venta), r2(d.precioTienda), d.EAN, d.codigoSAT, d.ano, d.is_active,
    ],
    texto: (d) => [d.descripcion],
  },
  // ---- Administracion
  bancos: {
    t: 'saldos por cuenta (cada uno en su moneda)',
    permiso: puede('bancos'),
    modelo: 'Bancos', sinFecha: true, base: { is_active: { $ne: 'No' } },
    cols: ['Banco', 'Cuenta', 'Moneda', 'Entradas', 'Salidas', 'Saldo'],
    fila: (d) => [d.banco, d.cuenta, d.moneda, r(d.abonos), r(d.cargos), r((d.abonos || 0) - (d.cargos || 0))],
  },
  movimientos_bancos: {
    permiso: puede('bancos'),
    modelo: 'MovimientosBancos', folio: 'idMovBanco', base: { is_active: { $ne: 'No' } },
    poblar: [P.banco],
    cols: ['Mov', 'Fecha', 'Banco', 'Tipo', 'Origen', 'Importe', 'Moneda'],
    fila: (d) => [d.idMovBanco, d.fecha, nom(d.bancos, 'banco'), d.tipo, (ORIGEN_BANCO.find(([c]) => (d[c] || []).length) || [, ''])[1], r2(d.importe), d.moneda],
    suma: ['Importe'],
  },
  traspasos_bancos: {
    permiso: puede('bancos'),
    modelo: 'BancosTraspasos', folio: 'idBancoTraspaso', base: { is_active: { $ne: 'No' } },
    poblar: [{ path: 'bancoOrigen', select: 'banco' }, { path: 'bancoDestino', select: 'banco' }],
    cols: ['Folio', 'Fecha', 'De', 'A', 'Importe', 'Moneda', 'TC'],
    fila: (d) => [d.idBancoTraspaso, d.fecha, nom(d.bancoOrigen, 'banco'), nom(d.bancoDestino, 'banco'), r2(d.importe), d.monedaOrigen, d.tipoCambio],
    suma: ['Importe'],
  },
  gastos: {
    permiso: puede('menu_gastos'),
    modelo: 'GastosGeneral', folio: 'idGastoGeneral', base: { is_active: { $ne: 'No' } },
    poblar: [{ path: 'categorias', select: 'name' }, { path: 'subCategorias', select: 'name' }, { path: 'conceptosGastos', select: 'name' }, { path: 'solicitantes', select: 'name' }, P.banco],
    cols: ['Gasto', 'Fecha', 'Categoría', 'Subcategoría', 'Concepto', 'Descripción', 'Subtotal', 'IVA', 'Total', 'Banco', 'Solicitante'],
    fila: (d) => [d.idGastoGeneral, d.fecha, nom(d.categorias), nom(d.subCategorias), nom(d.conceptosGastos), U.corto(d.descripcion, 40), r(d.subtotal), r(d.iva), r(d.total), nom(d.bancos, 'banco'), nom(d.solicitantes)],
    suma: ['Subtotal', 'IVA', 'Total'],
  },
  abonos_traspasos: {
    t: 'cobros de traspasos a tiendas',
    permiso: puede('abonos'),
    modelo: 'AbonosTraspasos', folio: 'idAbonoTraspaso', base: { is_active: { $ne: 'No' } },
    poblar: [P.almacen, { path: 'traspasosSalida', select: 'idTraspasosSalida' }, P.banco],
    cols: ['Abono', 'Fecha', 'Almacén', 'Traspaso', 'Importe', 'Forma', 'Concepto', 'Banco', 'Obs'],
    fila: (d) => [d.idAbonoTraspaso, d.fecha, nom(d.areas), folioDe(d.traspasosSalida, 'idTraspasosSalida'), r(d.importe), d.formaPago, d.concepto, nom(d.bancos, 'banco'), U.corto(d.observaciones, 40)],
    suma: ['Importe'],
  },
  bitacora: {
    t: 'quién hizo qué; default 7 días',
    permiso: puede('menu_logs'),
    modelo: 'Logs', fecha: 'createdAt', fechaEsDate: true, diasPorDefecto: 7, orden: { createdAt: -1 },
    poblar: [P.usuario],
    cols: ['Fecha', 'Tipo', 'Usuario', 'Detalle'],
    fila: (d) => [horaMx(d.createdAt), d.tipo, persona(d.user), U.corto(d.detalle, 90)],
  },
  // ---- Fiscal
  facturas: {
    t: 'folio = folio de la factura',
    permiso: puede('facturasFiscal'),
    modelo: 'Facturas', folio: 'folio', base: { is_active: { $ne: 'No' } },
    poblar: [P.cliente],
    cols: ['Factura', 'Fecha', 'Cliente', 'RFC', 'Subtotal', 'IVA', 'Total', 'Abonos', 'Saldo', 'Pagada', 'Timbrada', 'Status'],
    fila: (d) => [`${d.serie || ''} ${d.folio ?? ''}`.trim(), String(d.fecha || '').slice(0, 10), razon(d.clientes) || d.nombreCliente, d.rfcCliente, r(d.subTotal), r(d.iva), r(d.total), r(d.abonos), r(d.saldo), d.pagado, d.timbre, d.status],
    suma: ['Subtotal', 'IVA', 'Total', 'Saldo'],
  },
  complementos_pago: {
    t: 'folio = folio del complemento',
    permiso: puede('compPagosFiscal'),
    modelo: 'CompPago', folio: 'folio', base: { is_active: { $ne: 'No' } },
    poblar: [P.cliente],
    cols: ['CP', 'Fecha', 'Cliente', 'Total', 'Forma', 'Timbrado', 'Obs'],
    fila: (d) => [`${d.serie || ''} ${d.folio ?? ''}`.trim(), String(d.fecha || '').slice(0, 10), razon(d.clientes), r2(d.total), d.paymentForm, d.timbre, U.corto(d.observaciones, 40)],
    suma: ['Total'],
    renglones: {
      modelo: 'PagosFacturas', por: 'compPago', base: { is_active: { $ne: 'No' } }, poblar: [{ path: 'facturas', select: 'serie folio' }],
      cols: ['Factura', 'Parcialidad', 'Saldo anterior', 'Pagado', 'Insoluto'],
      fila: (x) => [`${nom(x.facturas, 'serie')} ${nom(x.facturas, 'folio')}`.trim(), x.PartialityNumber, r2(x.PreviousBalanceAmount), r2(x.AmountPaid), r2(x.ImpSaldoInsoluto)],
      sumar: ['Pagado'],
    },
  },
  notas_credito: {
    permiso: puede('notasCreditoFiscal'),
    modelo: 'NotasCredito', folio: 'folio', base: { is_active: { $ne: 'No' } },
    poblar: [P.cliente],
    cols: ['NC', 'Fecha', 'Cliente', 'Subtotal', 'IVA', 'Total', 'Timbrada', 'Obs'],
    fila: (d) => [`${d.serie || ''} ${d.folio ?? ''}`.trim(), String(d.fecha || '').slice(0, 10), razon(d.clientes), r(d.subTotal), r(d.iva), r(d.total), d.timbre, U.corto(d.observaciones, 40)],
    suma: ['Subtotal', 'IVA', 'Total'],
  },
  devoluciones_fiscal: {
    permiso: puede('devolucionesFiscal'),
    modelo: 'DevolucionesFiscal', folio: 'folio', base: { is_active: { $ne: 'No' } },
    poblar: [P.cliente, { path: 'facturas', select: 'serie folio' }],
    cols: ['Dev', 'Fecha', 'Factura', 'Cliente', 'Subtotal', 'IVA', 'Total', 'Timbrada', 'Obs'],
    fila: (d) => [`${d.serie || ''} ${d.folio ?? ''}`.trim(), String(d.fecha || '').slice(0, 10), `${nom(d.facturas, 'serie')} ${nom(d.facturas, 'folio')}`.trim(), razon(d.clientes), r(d.subTotal), r(d.iva), r(d.total), d.timbre, U.corto(d.observaciones, 40)],
    suma: ['Subtotal', 'IVA', 'Total'],
  },
  // ---- Tiendas (el usuario de tienda solo ve su tienda)
  ventas_tiendas: {
    t: 'folio = nota de tienda (ej. BN822)',
    permiso: tiendas('listadoVentasTiendas', 'ventasTiendas', 'corteTiendas'),
    modelo: 'VentasTiendas', folio: 'idVentaTienda', folioTienda: true, base: { is_active: { $ne: 'No' } }, area: 'areas',
    poblar: [P.cliente, P.vendedor, P.almacen],
    cols: ['Nota', 'Fecha', 'Cliente', 'Vendedor', 'Tienda', 'Pzs', 'Desc %', 'Total', 'Saldo', 'Pago', 'Entregado', 'Obs'],
    fila: (d) => [notaTienda(d), d.fecha, razon(d.clientes), persona(d.colaboradores), nom(d.areas), r(d.total_cantidad), d.descuento || '', r(d.total_general), r(d.saldo), d.cond_pago, d.entregado, U.corto(d.observaciones, 30)],
    suma: ['Pzs', 'Total', 'Saldo'],
    renglones: {
      modelo: 'ArticulosVentasTiendas', por: 'ventasTiendas', base: { is_active: { $ne: 'No' } }, poblar: [P.articulo],
      cols: ['Código', 'Cant', 'Precio', 'Total'],
      fila: (x) => [cod(x.articulos), x.cantidad, r2(x.precio), r(x.total)],
      sumar: ['Cant', 'Total'],
    },
  },
  cotizaciones_tiendas: {
    permiso: tiendas('ventasTiendas'),
    modelo: 'CotizacionesTiendas', folio: 'idCotizacionTienda', base: { is_active: { $ne: 'No' } }, area: 'areas',
    poblar: [P.cliente, P.almacen],
    cols: ['Cot', 'Fecha', 'Cliente', 'Tienda', 'Pzs', 'Total', 'Vendida'],
    fila: (d) => [d.idCotizacionTienda, d.fecha, razon(d.clientes), nom(d.areas), r(d.total_cantidad), r(d.total_general), d.vendido],
    suma: ['Pzs', 'Total'],
    renglones: {
      modelo: 'ArticulosCotizacionesTiendas', por: 'cotizacionesTiendas', base: { is_active: { $ne: 'No' } }, poblar: [P.articulo],
      cols: ['Código', 'Cant', 'Precio', 'Total'],
      fila: (x) => [cod(x.articulos), x.cantidad, r2(x.precio), r(x.total)],
      sumar: ['Cant', 'Total'],
    },
  },
  devoluciones_tiendas: {
    permiso: tiendas('devolucionesTiendas'),
    modelo: 'DevolucionesTiendas', folio: 'idDevolucionTienda', base: { is_active: { $ne: 'No' } }, area: 'areas',
    poblar: [P.cliente, P.almacen, P.ventaTienda],
    cols: ['Dev', 'Fecha', 'Nota', 'Cliente', 'Tienda', 'Pzs', 'Total', 'Obs'],
    fila: (d) => [d.idDevolucionTienda, d.fecha, notaTienda(d.ventasTiendas), razon(d.clientes), nom(d.areas), r(d.total_cantidad), r(d.total_general), U.corto(d.observaciones, 40)],
    suma: ['Pzs', 'Total'],
    renglones: {
      modelo: 'ArticulosDevolucionesTiendas', por: 'devolucionesTiendas', base: { is_active: { $ne: 'No' } }, poblar: [P.articulo],
      cols: ['Código', 'Cant', 'Precio', 'Total'],
      fila: (x) => [cod(x.articulos), x.cantidad, r2(x.precio), r(x.total)],
      sumar: ['Cant', 'Total'],
    },
  },
  abonos_tiendas: {
    permiso: tiendas('abonosTiendas', 'corteTiendas'),
    modelo: 'AbonosTiendas', folio: 'idAbonoTiendas', base: { is_active: { $ne: 'No' } }, area: 'areas',
    poblar: [P.cliente, P.almacen, P.ventaTienda, P.banco],
    cols: ['Abono', 'Fecha', 'Cliente', 'Nota', 'Total', 'Efectivo', 'TDC', 'Transf', 'Cortesía', 'Nómina', 'Tienda', 'Banco'],
    fila: (d) => [d.idAbonoTiendas, d.fecha, razon(d.clientes), notaTienda(d.ventasTiendas), r(d.total), r(d.efectivo), r(d.tdc), r(d.transfer), r(d.cortesia), r(d.nomina), nom(d.areas), nom(d.bancos, 'banco')],
    suma: ['Total', 'Efectivo', 'TDC', 'Transf', 'Cortesía', 'Nómina'],
  },
  gastos_tiendas: {
    permiso: tiendas('gastosTiendas'),
    modelo: 'GastosTiendas', folio: 'idGastoTiendas', area: 'areas',
    poblar: [P.almacen, P.banco, { path: 'conceptosGastosTiendas', select: 'name' }],
    cols: ['Gasto', 'Fecha', 'Concepto', 'Descripción', 'Total', 'Tienda', 'Banco'],
    fila: (d) => [d.idGastoTiendas, d.fecha, nom(d.conceptosGastosTiendas) || d.concepto, U.corto(d.descripcion, 40), r(d.total), nom(d.areas), nom(d.bancos, 'banco')],
    suma: ['Total'],
  },
  traspasos_dinero: {
    permiso: tiendas('gastosTiendas'),
    modelo: 'TraspasosDinero', folio: 'idTraspasosDinero', area: 'areas',
    poblar: [P.almacen],
    cols: ['Folio', 'Fecha', 'Tienda', 'Importe', 'Entrada'],
    fila: (d) => [d.idTraspasosDinero, d.fecha, nom(d.areas), r(d.importe), d.entrada],
    suma: ['Importe'],
  },
}

function horaMx(d) {
  if (!d) return ''
  const t = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(d))
  return t.replace(',', '').slice(0, 16)
}

const modulosDe = (u) => Object.keys(MODULOS).filter((k) => MODULOS[k].permiso(u))
const columnas = (m, u) => (typeof m.cols === 'function' ? m.cols(u) : m.cols)

function poblar(consulta, lista) {
  ;(lista || []).forEach((p) => {
    consulta = consulta.populate(p)
  })
  return consulta
}

// El usuario de tienda solo ve documentos de su tienda (como en sus pantallas)
function soloSuTienda(m, u) {
  const area = A.tiendaDe(u)
  if (!area || !m.area) return {}
  const campos = Array.isArray(m.area) ? m.area : [m.area]
  return campos.length === 1 ? { [campos[0]]: area } : { $or: campos.map((c) => ({ [c]: area })) }
}

// Junta renglones con la misma clave (primeras n columnas) y suma lo demas
function agrupar(filas, n) {
  const m = new Map()
  filas.forEach((f) => {
    const k = f.slice(0, n).join('|')
    const a = m.get(k)
    if (!a) return m.set(k, [...f])
    for (let i = n; i < f.length; i++) a[i] = (Number(a[i]) || 0) + (Number(f[i]) || 0)
  })
  return [...m.values()]
}

const redondear = (f) => f.map((v) => (typeof v === 'number' && !Number.isInteger(v) ? r2(v) : v))

function totales(cols, filas, suma) {
  if (!suma || !suma.length) return ''
  return suma
    .map((c) => {
      const i = cols.indexOf(c)
      return i < 0 ? '' : `${c} ${U.r(filas.reduce((t, f) => t + (Number(f[i]) || 0), 0)).toLocaleString('en-US')}`
    })
    .filter(Boolean)
    .join(' · ')
}

// Folio de nota de tienda: "BN822" (prefijo + consecutivo) o el numero interno
function filtroFolio(m, folio) {
  const t = String(folio).trim().toUpperCase()
  if (m.folioTienda) {
    const x = t.match(/^([A-Z]+)\s*(\d+)$/)
    if (x) return { prefijo: x[1], consecutivo: Number(x[2]) }
  }
  const n = Number(t)
  if (!Number.isFinite(n)) throw U.errorUsuario(`Folio no válido: ${folio}`)
  return { [m.folio]: n }
}

async function porFolio(m, clave, folio, u, a) {
  if (!m.folio) throw U.errorUsuario(`${clave} no maneja folios; usa buscar`)
  const doc = await poblar(modelos[m.modelo].findOne({ ...filtroFolio(m, folio), ...soloSuTienda(m, u) }).sort({ _id: -1 }), m.poblar).lean()
  if (!doc) throw U.errorUsuario(`No existe el folio ${folio} en ${clave}`)
  const cols = columnas(m, u)
  const valores = limpia(m.fila(doc, u))
  const cabecera = cols.map((c, i) => [c, U.celda(valores[i])]).filter(([, v]) => v !== '').map(([c, v]) => `${c}: ${v}`).join(' · ')
  if (!m.renglones) return cabecera
  const R = m.renglones
  let filas = (await poblar(modelos[R.modelo].find({ ...(R.base || {}), [R.por]: doc._id }), R.poblar).lean()).map((x) => limpia(R.fila(x, u)))
  if (R.agrupar) filas = agrupar(filas, R.agrupar)
  filas = filas.map(redondear).sort((x, y) => String(x[0]).localeCompare(String(y[0])))
  return `${cabecera}\n${U.tabla(R.cols, filas, { limite: a.limite, saltar: a.saltar, pie: `Suma: ${totales(R.cols, filas, R.sumar)}` })}`
}

async function consultar(a, u) {
  const m = MODULOS[a.modulo]
  if (!m || !m.permiso(u)) throw U.errorUsuario('Ese módulo no está disponible con tu usuario')
  if (a.folio !== undefined && a.folio !== '') return porFolio(m, a.modulo, a.folio, u, a)

  const match = { ...(m.base || {}), ...soloSuTienda(m, u) }
  let periodo = ''
  if (!m.sinFecha) {
    const desde = a.desde || (m.diasPorDefecto ? U.sumaDias(U.hoyStr(), -m.diasPorDefecto) : '')
    const rango = {}
    if (desde) rango.$gte = m.fechaEsDate ? new Date(`${desde}T00:00:00-06:00`) : desde
    if (a.hasta) rango.$lte = m.fechaEsDate ? new Date(`${a.hasta}T23:59:59-06:00`) : `${a.hasta}~`
    if (desde || a.hasta) {
      match[m.fecha || 'fecha'] = rango
      periodo = `${desde || 'inicio'} a ${a.hasta || 'hoy'}`
    }
  }
  const orden = m.orden || (m.folio && !m.folioTienda ? { [m.folio]: -1 } : { [m.fecha || 'fecha']: -1, _id: -1 })
  const tope = m.sinFecha ? LIMITE_CATALOGO : LIMITE_DOCUMENTOS
  const docs = await poblar(modelos[m.modelo].find(match, m.campos).sort(orden).limit(tope), m.poblar).lean()
  const cols = columnas(m, u)
  const filas = docs
    .map((d) => ({ f: limpia(m.fila(d, u)), extra: m.texto ? m.texto(d) : [] }))
    .filter(({ f, extra }) => !a.buscar || U.coincide(a.buscar, ...f, ...extra))
    .map(({ f }) => f)
  const pie = [periodo, totales(cols, filas, m.suma) && `Totales: ${totales(cols, filas, m.suma)}`, docs.length >= tope ? `solo los ${tope} más recientes: acota fechas` : '']
    .filter(Boolean)
    .join(' · ')
  return U.tabla(cols, filas, { limite: a.limite, saltar: a.saltar, pie })
}

const herramientaConsulta = {
  nombre: 'consultar',
  titulo: 'Consultar un módulo',
  descripcion: (u) => {
    const notas = modulosDe(u).filter((k) => MODULOS[k].t).map((k) => `${k}=${MODULOS[k].t}`)
    return `Listados del sistema con totales; filtra con buscar (cualquier columna) y fechas. Con folio da el documento y sus renglones.${notas.length ? ` ${notas.join('; ')}.` : ''}`
  },
  permiso: (u) => modulosDe(u).length > 0,
  entrada: (u) => ({
    modulo: z.enum(modulosDe(u)),
    folio: z.union([z.number().int(), z.string()]).optional(),
    buscar: z.string().optional().describe('Texto en cualquier columna: cliente, código, status...'),
    desde: U.fecha(),
    hasta: U.fecha(),
    limite: U.limite(25),
    saltar: U.saltar(),
  }),
  correr: consultar,
}

module.exports = { herramientaConsulta, MODULOS, modulosDe }
