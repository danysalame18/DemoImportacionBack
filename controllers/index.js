const UserController = require('./UserController')
const AIController = require('./AIController')
const AreasController = require('./AreasController')
const PuestosController = require('./PuestosController')
const ColaboradoresController = require('./ColaboradoresController')
const NominasController = require('./NominasController')
const ClientesController = require('./ClientesController')
const GruposController = require('./GruposController')
const PlantelesController = require('./PlantelesController')
const ProveedoresController = require('./ProveedoresController')
const DepartamentosController = require('./DepartamentosController')
const DepartamentosClientesController = require('./DepartamentosClientesController')
const GastosTiendasController = require('./GastosTiendasController')
const SendMailAttController = require('./SendMailAttController')
const SendMailAttDobleController = require('./SendMailAttDobleController')
const LogsController = require('./LogsController')
const FaltasColaboradoresController = require('./FaltasColaboradoresController')
const CountersController = require('./CountersController')
const ConfiguracionesController = require('./ConfiguracionesController')
const FileController = require('./FileController')
const ArticulosController = require('./ArticulosController')
const OrdenesCompraController = require('./OrdenesCompraController')
const ArticulosOCController = require('./ArticulosOCController')
const InventariosController = require('./InventariosController')
const ComprasController = require('./ComprasController')
const PedidosController = require('./PedidosController')
const ArticulosPedidoController = require('./ArticulosPedidoController')
const SurtidosController = require('./SurtidosController')
const DevolucionesController = require('./DevolucionesController')
const DevolucionesProveedoresController = require('./DevolucionesProveedoresController')
const SeguimientosController = require('./SeguimientosController')
const ArticulosSurtidosController = require('./ArticulosSurtidosController')
const ArticulosDevolucionesController = require('./ArticulosDevolucionesController')
const ArticulosDevolucionesProveedoresController = require('./ArticulosDevolucionesProveedoresController')
const GraficasController = require('./GraficasController')
const ComprasAcumuladosController = require('./ComprasAcumuladosController')
const AbonosController = require('./AbonosController')
const AbonosFacturasController = require('./AbonosFacturasController')
const LineasController = require('./LineasController')
const MarcasController = require('./MarcasController')
const FamiliasController = require('./FamiliasController')
const ColeccionesController = require('./ColeccionesController')
const ComposicionesController = require('./ComposicionesController')
const TraspasosSalidaController = require('./TraspasosSalidaController')
const TraspasosEntradaController = require('./TraspasosEntradaController')
const ArticulosTSController = require('./ArticulosTSController')
const ArticulosTEController = require('./ArticulosTEController')
const ArticulosTSolController = require('./ArticulosTSolController')
const ArticulosTSolV2Controller = require('./ArticulosTSolV2Controller')
const TraspasosSolicitudController = require('./TraspasosSolicitudController')
const TraspasosSolicitudV2Controller = require('./TraspasosSolicitudV2Controller')
const ArticulosVentasTiendasController = require('./ArticulosVentasTiendasController')
const VentasTiendasController = require('./VentasTiendasController')
const AbonosTiendasController = require('./AbonosTiendasController')
const VentasAbyController = require('./VentasAbyController')
const VentasAbyFiscalController = require('./VentasAbyFiscalController')
const VentasBenyController = require('./VentasBenyController')
const VentasBenyFiscalController = require('./VentasBenyFiscalController')
const ArticulosDevolucionesTiendasController = require('./ArticulosDevolucionesTiendasController')
const DevolucionesTiendasController = require('./DevolucionesTiendasController')
const BancosController = require('./BancosController')
const AnticiposController = require('./AnticiposController')
const NotasCargoController = require('./NotasCargoController')
const EstadoCuentaController = require('./EstadoCuentaController')
const MuestrasEntradaController = require('./MuestrasEntradaController')
const ArticulosMEController = require('./ArticulosMEController')
const MuestrasSalidaController = require('./MuestrasSalidaController')
const ArticulosMSController = require('./ArticulosMSController')
const ComisionesController = require('./ComisionesController')
const GastosGeneralController = require('./GastosGeneralController')
const AbonosProveedoresController = require('./AbonosProveedoresController')
const AjustesInventarioController = require('./AjustesInventarioController')
const ArticulosAjustesInvController = require('./ArticulosAjustesInvController')
const ConceptosGastosController = require('./ConceptosGastosController')
const ArticulosEmbarquesController = require('./ArticulosEmbarquesController')
const ConceptosGastosEmbarquesController = require('./ConceptosGastosEmbarquesController')
const ConceptosGastosTiendasController = require('./ConceptosGastosTiendasController')
const EmbarquesController = require('./EmbarquesController')
const GastosEmbarquesController = require('./GastosEmbarquesController')
const NotasCxPController = require('./NotasCxPController')
const TraspasosDineroController = require('./TraspasosDineroController')
const CotizacionesTiendasController = require('./CotizacionesTiendasController')
const ArticulosCotizacionesTiendasController = require('./ArticulosCotizacionesTiendasController')
const InsumosController = require('./InsumosController')
const OrdenesCompraHabController = require('./OrdenesCompraHabController')
const HabOCController = require('./HabOCController')
const ComprasHabController = require('./ComprasHabController')
const ComprasAcumuladosHabController = require('./ComprasAcumuladosHabController')
const InventariosHabController = require('./InventariosHabController')
const ExplosionController = require('./ExplosionController')
const InsumosPedidosController = require('./InsumosPedidosController')
const DetalleInsumosPedidosController = require('./DetalleInsumosPedidosController')
const DashboardsController = require('./DashboardsController')
const MovimientosBancosController = require('./MovimientosBancosController')
const BancosTraspasosController = require('./BancosTraspasosController')
const SolicitudInsumosPedidosController = require('./SolicitudInsumosPedidosController')
const DetalleSolicitudInsumosPedidosController = require('./DetalleSolicitudInsumosPedidosController')
const CategoriasController = require('./CategoriasController')
const SubCategoriasController = require('./SubCategoriasController')
const SolicitantesController = require('./SolicitantesController')
const ProcesosEntradaController = require('./ProcesosEntradaController')
const ProcesosSalidaController = require('./ProcesosSalidaController')
const ArticulosProcesosEntradaController = require('./ArticulosProcesosEntradaController')
const ArticulosProcesosSalidaController = require('./ArticulosProcesosSalidaController')
const ControlCalidadController = require('./ControlCalidadController')
const WhatsAppController = require('./WhatsAppController')
const TelefonosWhatsAppController = require('./TelefonosWhatsAppController')
const TallasController = require('./TallasController')
const ColoresController = require('./ColoresController')
const ArticulosProporcionController = require('./ArticulosProporcionController')
const SaldoInicialController = require('./SaldoInicialController')
const BrokersController = require('./BrokersController')
const EmpresasController = require('./EmpresasController')
const AbonosTraspasosController = require('./AbonosTraspasosController')

const ArticulosDevolucionesFiscalController = require('./ArticulosDevolucionesFiscalController')
const CompPagoController = require('./CompPagoController')
const CuentasClientesController = require('./CuentasClientesController')
const CuentasEmpresasController = require('./CuentasEmpresasController')
const DevolucionesFiscalController = require('./DevolucionesFiscalController')
const FacturasController = require('./FacturasController')
const NotasCreditoController = require('./NotasCreditoController')
const SeriesController = require('./SeriesController')
const TimbrarController = require('./TimbrarController')


module.exports = {
    UserController,
    AreasController,
    PuestosController,
    PlantelesController,
    ColaboradoresController,
    NominasController,
    ClientesController,
    GruposController,
    ProveedoresController,
    DepartamentosController,
    GastosTiendasController,
    SendMailAttController,
    SendMailAttDobleController,
    LogsController,
    FaltasColaboradoresController,
    CountersController,
    ConfiguracionesController,
    FileController,
    ArticulosController,
    OrdenesCompraController,
    ArticulosOCController,
    InventariosController,
    ComprasController,
    PedidosController,
    ArticulosPedidoController,
    SurtidosController,
    DevolucionesController,
    DevolucionesProveedoresController,
    SeguimientosController,
    ArticulosSurtidosController,
    ArticulosDevolucionesController,
    ArticulosDevolucionesProveedoresController,
    GraficasController,
    ComprasAcumuladosController,
    AbonosController,
    AbonosFacturasController,
    LineasController,
    MarcasController,
    FamiliasController,
    ColeccionesController,
    ComposicionesController,
    TraspasosSalidaController,
    TraspasosEntradaController,
    ArticulosTSController,
    ArticulosTEController,
    DepartamentosClientesController,
    ArticulosTSolController,
    TraspasosSolicitudController,
    TraspasosSolicitudV2Controller,
    ArticulosTSolV2Controller,
    ArticulosVentasTiendasController,
    VentasTiendasController,
    AbonosTiendasController,
    VentasAbyController,
    VentasAbyFiscalController,
    VentasBenyController,
    VentasBenyFiscalController,
    ArticulosDevolucionesTiendasController,
    DevolucionesTiendasController,
    BancosController,
    AnticiposController,
    NotasCargoController,
    EstadoCuentaController,
    MuestrasEntradaController,
    ArticulosMEController,
    MuestrasSalidaController,
    ArticulosMSController,
    ComisionesController,
    GastosGeneralController,
    AbonosProveedoresController,
    AjustesInventarioController,
    ArticulosAjustesInvController,
    ConceptosGastosController,
    ArticulosEmbarquesController,
    ConceptosGastosEmbarquesController,
    ConceptosGastosTiendasController,
    EmbarquesController,
    GastosEmbarquesController,
    NotasCxPController,
    TraspasosDineroController,
    CotizacionesTiendasController,
    ArticulosCotizacionesTiendasController,
    InsumosController,
    OrdenesCompraHabController,
    HabOCController,
    ComprasHabController,
    ComprasAcumuladosHabController,
    InventariosHabController,
    ExplosionController,
    InsumosPedidosController,
    DetalleInsumosPedidosController,
    DashboardsController,
    BancosTraspasosController,
    MovimientosBancosController,
    SolicitudInsumosPedidosController,
    DetalleSolicitudInsumosPedidosController,
    CategoriasController,
    SubCategoriasController,
    SolicitantesController,
    ProcesosEntradaController,
    ProcesosSalidaController,
    ArticulosProcesosEntradaController,
    ArticulosProcesosSalidaController,
    ControlCalidadController,
    TelefonosWhatsAppController,
    WhatsAppController,
    TallasController,
    ColoresController,
    ArticulosProporcionController,
    SaldoInicialController,
    BrokersController,
    EmpresasController,
    AbonosTraspasosController,
    ArticulosDevolucionesFiscalController,
    CompPagoController,
    CuentasClientesController,
    CuentasEmpresasController,
    DevolucionesFiscalController,
    FacturasController,
    NotasCreditoController,
    SeriesController,
    TimbrarController,
    AIController
}