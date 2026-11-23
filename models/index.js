const User = require('./User')
const Areas = require('./Areas')
const Puestos = require('./Puestos')
const Colaboradores = require('./Colaboradores')
const Nominas = require('./Nominas')
const Clientes = require('./Clientes')
const Grupos = require('./Grupos')
const FaltasColaboradores = require('./FaltasColaboradores')
const Planteles = require('./Planteles')
const Proveedores = require('./Proveedores')
const Departamentos = require('./Departamentos')
const DepartamentosClientes = require('./DepartamentosClientes')
const GastosTiendas = require('./GastosTiendas')
const Logs = require('./Logs')
const Counters = require('./Counters')
const Configuraciones = require('./Configuraciones')
const Articulos = require('./Articulos')
const ArticulosProporcion = require('./ArticulosProporcion')
const OrdenesCompra = require('./OrdenesCompra')
const ArticulosOC = require('./ArticulosOC')
const Inventarios = require('./Inventarios')
const Compras = require('./Compras')
const Pedidos = require('./Pedidos')
const ArticulosPedido = require('./ArticulosPedido')
const Surtidos = require('./Surtidos')
const Devoluciones = require('./Devoluciones')
const DevolucionesProveedores = require('./DevolucionesProveedores')
const ArticulosSurtidos = require('./ArticulosSurtidos')
const ArticulosDevolucionesProveedores = require('./ArticulosDevolucionesProveedores')
const ArticulosDevoluciones = require('./ArticulosDevoluciones')
const ComprasAcumulados = require('./ComprasAcumulados')
const Abonos = require('./Abonos')
const AbonosFacturas = require('./AbonosFacturas')
const Lineas = require('./Lineas')
const Marcas = require('./Marcas')
const Familias = require('./Familias')
const Colecciones = require('./Colecciones')
const Composiciones = require('./Composiciones')
const TraspasosSalida = require('./TraspasosSalida')
const TraspasosEntrada = require('./TraspasosEntrada')
const ArticulosTS = require('./ArticulosTS')
const ArticulosTE = require('./ArticulosTE')
const TraspasosSolicitud = require('./TraspasosSolicitud')
const TraspasosSolicitudV2 = require('./TraspasosSolicitudV2')
const ArticulosTSol = require('./ArticulosTSol')
const ArticulosTSolV2 = require('./ArticulosTSolV2')
const VentasTiendas = require('./VentasTiendas')
const ArticulosVentasTiendas = require('./ArticulosVentasTiendas')
const AbonosTiendas = require('./AbonosTiendas')
const VentasAby = require('./VentasAby')
const VentasAbyFiscal = require('./VentasAbyFiscal')
const VentasBeny = require('./VentasBeny')
const VentasBenyFiscal = require('./VentasBenyFiscal')
const DevolucionesTiendas = require('./DevolucionesTiendas')
const ArticulosDevolucionesTiendas = require('./ArticulosDevolucionesTiendas')
const Bancos = require('./Bancos')
const Anticipos = require('./Anticipos')
const NotasCargo = require('./NotasCargo')
const MuestrasEntrada = require('./MuestrasEntrada')
const ArticulosME = require('./ArticulosME')
const MuestrasSalida = require('./MuestrasSalida')
const ArticulosMS = require('./ArticulosMS')
const Comisiones = require('./Comisiones')
const GastosGeneral = require('./GastosGeneral')
const AbonosProveedores = require('./AbonosProveedores')
const AjustesInventario = require('./AjustesInventario')
const ArticulosAjustesInv = require('./ArticulosAjustesInv')
const ConceptosGastos = require('./ConceptosGastos')
const ArticulosEmbarques = require('./ArticulosEmbarques')
const ConceptosGastosEmbarques = require('./ConceptosGastosEmbarques')
const ConceptosGastosTiendas = require('./ConceptosGastosTiendas')
const Embarques = require('./Embarques')
const GastosEmbarques = require('./GastosEmbarques')
const NotasCxP = require('./NotasCxP')
const TraspasosDinero = require('./TraspasosDinero')
const CotizacionesTiendas = require('./CotizacionesTiendas')
const ArticulosCotizacionesTiendas = require('./ArticulosCotizacionesTiendas')
const Insumos = require('./Insumos')
const OrdenesCompraHab = require('./OrdenesCompraHab')
const HabOC = require('./HabOC')
const ComprasHab = require('./ComprasHab')
const ComprasAcumuladosHab = require('./ComprasAcumuladosHab')
const InventariosHab = require('./InventariosHab')
const Explosion = require('./Explosion')
const InsumosPedidos = require('./InsumosPedidos')
const DetalleInsumosPedidos = require('./DetalleInsumosPedidos')
const MovimientosBancos = require('./MovimientosBancos')
const BancosTraspasos = require('./BancosTraspasos')
const SolicitudInsumosPedidos = require('./SolicitudInsumosPedidos')
const DetalleSolicitudInsumosPedidos = require('./DetalleSolicitudInsumosPedidos')
const Categorias = require('./Categorias')
const SubCategorias = require('./SubCategorias')
const Solicitantes = require('./Solicitantes')
const ProcesosEntrada = require('./ProcesosEntrada')
const ProcesosSalida = require('./ProcesosSalida')
const ArticulosProcesosEntrada = require('./ArticulosProcesosEntrada')
const ArticulosProcesosSalida = require('./ArticulosProcesosSalida')
const ControlCalidad = require('./ControlCalidad')
const TelefonosWhatsApp = require('./TelefonosWhatsApp')
const UsuariosWhatsApp = require('./UsuariosWhatsApp')
const Tallas = require('./Tallas')
const Colores = require('./Colores')
const SaldoInicial = require('./SaldoInicial')
const Brokers = require('./Brokers')
const Empresas = require('./Empresas')
const AbonosTraspasos = require('./AbonosTraspasos')

const ArticulosDevolucionesFiscal = require('./ArticulosDevolucionesFiscal')
const CompPago = require('./CompPago')
const CuentasClientes = require('./CuentasClientes')
const CuentasEmpresas = require('./CuentasEmpresas')
const DevolucionesFiscal = require('./DevolucionesFiscal')
const Facturas = require('./Facturas')
const NotasCredito = require('./NotasCredito')
const PagosFacturas = require('./PagosFacturas')
const Series = require('./Series')



const McpClientes = require('./McpClientes')
const McpTokens = require('./McpTokens')

module.exports= {
    User,
    Areas,
    Puestos,
    FaltasColaboradores,
    Planteles,
    Colaboradores,
    Nominas,
    Clientes,
    Grupos,
    Proveedores,
    Departamentos,
    GastosTiendas,
    Logs,
    Counters,
    Configuraciones,
    Articulos,
    ArticulosProporcion,
    OrdenesCompra,
    ArticulosOC,
    Inventarios,
    Compras,
    Pedidos,
    ArticulosPedido,
    Surtidos,
    Devoluciones,
    DevolucionesProveedores,
    ArticulosSurtidos,
    ArticulosDevoluciones,
    ArticulosDevolucionesProveedores,
    ComprasAcumulados,
    Abonos,
    AbonosFacturas,
    Lineas,
    Marcas,
    Familias,
    Colecciones,
    Composiciones,
    TraspasosSalida,
    TraspasosEntrada,
    ArticulosTS,
    ArticulosTE,
    DepartamentosClientes,
    TraspasosSolicitud,
    TraspasosSolicitudV2,
    ArticulosTSol,
    ArticulosTSolV2,
    VentasTiendas,
    ArticulosVentasTiendas,
    AbonosTiendas,
    VentasAby,
    VentasAbyFiscal,
    VentasBeny,
    VentasBenyFiscal,
    DevolucionesTiendas,
    ArticulosDevolucionesTiendas,
    Bancos,
    Anticipos,
    NotasCargo,
    MuestrasEntrada,
    ArticulosME,
    MuestrasSalida,
    ArticulosMS,
    Comisiones,
    GastosGeneral,
    AbonosProveedores,
    AjustesInventario,
    ArticulosAjustesInv,
    ConceptosGastos,
    ArticulosEmbarques,
    ConceptosGastosEmbarques,
    ConceptosGastosTiendas,
    Embarques,
    GastosEmbarques,
    NotasCxP,
    TraspasosDinero,
    CotizacionesTiendas,
    ArticulosCotizacionesTiendas,
    Insumos,
    OrdenesCompraHab,
    HabOC,
    ComprasHab,
    ComprasAcumuladosHab,
    InventariosHab,
    Explosion,
    InsumosPedidos,
    DetalleInsumosPedidos,
    BancosTraspasos,
    MovimientosBancos,
    SolicitudInsumosPedidos,
    DetalleSolicitudInsumosPedidos,
    Categorias,
    SubCategorias,
    Solicitantes,
    ProcesosEntrada,
    ProcesosSalida,
    ArticulosProcesosEntrada,
    ArticulosProcesosSalida,
    ControlCalidad,
    TelefonosWhatsApp,
    UsuariosWhatsApp,
    Tallas,
    Colores,
    SaldoInicial,
    Brokers,
    Empresas,
    AbonosTraspasos,
    ArticulosDevolucionesFiscal,
    CompPago,
    CuentasClientes,
    CuentasEmpresas,
    DevolucionesFiscal,
    Facturas,
    NotasCredito,
    PagosFacturas,
    Series,
    McpClientes,
    McpTokens
}