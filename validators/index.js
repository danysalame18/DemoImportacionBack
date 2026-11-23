const UserValidator = require('./UserValidator')
const AreasValidator = require('./AreasValidator')
const PuestosValidator = require('./PuestosValidator')
const ColaboradoresValidator = require('./ColaboradoresValidator')
const NominasValidator = require('./NominasValidator')
const ClientesValidator = require('./ClientesValidator')
const GruposValidator = require('./GruposValidator')
const PlantelesValidator = require('./PlantelesValidator')
const ProveedoresValidator = require('./ProveedoresValidator')
const DepartamentosValidator = require('./DepartamentosValidator')
const DepartamentosClientesValidator = require('./DepartamentosClientesValidator')
const GastosTiendasValidator = require('./GastosTiendasValidator')
const LogsValidator = require('./LogsValidator')
const FaltasColaboradoresValidator = require('./FaltasColaboradoresValidator')
const ConfiguracionesValidator = require('./ConfiguracionesValidator')
const ArticulosValidator = require('./ArticulosValidator')
const OrdenesCompraValidator = require('./OrdenesCompraValidator')
const ArticulosOCValidator = require('./ArticulosOCValidator')
const InventariosValidator = require('./InventariosValidator')
const ComprasValidator = require('./ComprasValidator')
const PedidosValidator = require('./PedidosValidator')
const ArticulosPedidoValidator = require('./ArticulosPedidoValidator')
const SurtidosValidator = require('./SurtidosValidator')
const DevolucionesValidator = require('./DevolucionesValidator')
const DevolucionesProveedoresValidator = require('./DevolucionesProveedoresValidator')
const ArticulosSurtidosValidator = require('./ArticulosSurtidosValidator')
const ArticulosDevolucionesValidator = require('./ArticulosDevolucionesValidator')
const ArticulosDevolucionesProveedoresValidator = require('./ArticulosDevolucionesProveedoresValidator')
const ComprasAcumuladosValidator = require('./ComprasAcumuladosValidator')
const AbonosValidator = require('./AbonosValidator')
const LineasValidator = require('./LineasValidator')
const MarcasValidator = require('./MarcasValidator')
const FamiliasValidator = require('./FamiliasValidator')
const ColeccionesValidator = require('./ColeccionesValidator')
const ComposicionesValidator = require('./ComposicionesValidator')
const TraspasosSalidaValidator = require('./TraspasosSalidaValidator')
const TraspasosEntradaValidator = require('./TraspasosEntradaValidator')
const ArticulosTSValidator = require('./ArticulosTSValidator')
const ArticulosTEValidator = require('./ArticulosTEValidator')
const ArticulosTSolValidator = require('./ArticulosTSolValidator')
const ArticulosTSolV2Validator = require('./ArticulosTSolV2Validator')
const TraspasosSolicitudValidator = require('./TraspasosSolicitudValidator')
const TraspasosSolicitudV2Validator = require('./TraspasosSolicitudV2Validator')
const ArticulosVentasTiendasValidator = require('./ArticulosVentasTiendasValidator')
const VentasTiendasValidator = require('./VentasTiendasValidator')
const AbonosTiendasValidator = require('./AbonosTiendasValidator')
const VentasConsecutivoValidator = require('./VentasConsecutivoValidator')
const ArticulosDevolucionesTiendasValidator = require('./ArticulosDevolucionesTiendasValidator')
const DevolucionesTiendasValidator = require('./DevolucionesTiendasValidator')
const BancosValidator = require('./BancosValidator')
const AnticiposValidator = require('./AnticiposValidator')
const NotasCargoValidator = require('./NotasCargoValidator')
const MuestrasEntradaValidator = require('./MuestrasEntradaValidator')
const ArticulosMEValidator = require('./ArticulosMEValidator')
const MuestrasSalidaValidator = require('./MuestrasSalidaValidator')
const ArticulosMSValidator = require('./ArticulosMSValidator')
const ComisionesValidator = require('./ComisionesValidator')
const GastosGeneralValidator = require('./GastosGeneralValidator')
const AbonosProveedoresValidator = require('./AbonosProveedoresValidator')
const AjustesInventarioValidator = require('./AjustesInventarioValidator')
const ArticulosAjustesInvValidator = require('./ArticulosAjustesInvValidator')
const ConceptosGastosValidator = require('./ConceptosGastosValidator')
const ArticulosEmbarquesValidator = require('./ArticulosEmbarquesValidator')
const ConceptosGastosEmbarquesValidator = require('./ConceptosGastosEmbarquesValidator')
const ConceptosGastosTiendasValidator = require('./ConceptosGastosTiendasValidator')
const EmbarquesValidator = require('./EmbarquesValidator')
const GastosEmbarquesValidator = require('./GastosEmbarquesValidator')
const NotasCxPValidator = require('./NotasCxPValidator')
const TraspasosDineroValidator = require('./TraspasosDineroValidator')
const CotizacionesTiendasValidator = require('./CotizacionesTiendasValidator')
const ArticulosCotizacionesTiendasValidator = require('./ArticulosCotizacionesTiendasValidator')
const InsumosValidator = require('./InsumosValidator')
const OrdenesCompraHabValidator = require('./OrdenesCompraHabValidator')
const HabOCValidator = require('./HabOCValidator')
const ComprasHabValidator = require('./ComprasHabValidator')
const ComprasAcumuladosHabValidator = require('./ComprasAcumuladosHabValidator')
const InventariosHabValidator = require('./InventariosHabValidator')
const ExplosionValidator = require('./ExplosionValidator')
const InsumosPedidosValidator = require('./InsumosPedidosValidator')
const DetalleInsumosPedidosValidator = require('./DetalleInsumosPedidosValidator')
const MovimientosBancosValidator = require('./MovimientosBancosValidator')
const BancosTraspasosValidator = require('./BancosTraspasosValidator')
const SolicitudInsumosPedidosValidator = require('./SolicitudInsumosPedidosValidator')
const DetalleSolicitudInsumosPedidosValidator = require('./DetalleSolicitudInsumosPedidosValidator')
const NameValidator = require('./NameValidator')
const SubCategoriasValidator = require('./SubCategoriasValidator')
const ProcesosSalidaValidator = require('./ProcesosSalidaValidator')
const ProcesosEntradaValidator = require('./ProcesosEntradaValidator')
const ArticulosProcesosSalidaValidator = require('./ArticulosProcesosSalidaValidator')
const ArticulosProcesosEntradaValidator = require('./ArticulosProcesosEntradaValidator')
const ControlCalidadValidator = require('./ControlCalidadValidator')
const TelefonosWhatsAppValidator = require('./TelefonosWhatsAppValidator')
const ArticulosProporcionValidator = require('./ArticulosProporcionValidator')
const SaldoInicialValidator = require('./SaldoInicialValidator')
const BrokersValidator = require('./BrokersValidator')
const AbonosTraspasosValidator = require('./AbonosTraspasosValidator')
const AbonosFacturasValidator = require('./AbonosFacturasValidator')
const EmpresasValidator = require('./EmpresasValidator')

const ArticulosDevolucionesFiscalValidator = require('./ArticulosDevolucionesFiscalValidator')
const CompPagoValidator = require('./CompPagoValidator')
const CuentasClientesValidator = require('./CuentasClientesValidator')
const CuentasEmpresasValidator = require('./CuentasEmpresasValidator')
const DevolucionesFiscalValidator = require('./DevolucionesFiscalValidator')
const FacturasValidator = require('./FacturasValidator')
const NotasCreditoValidator = require('./NotasCreditoValidator')
const PagosFacturasValidator = require('./PagosFacturasValidator')
const SeriesValidator = require('./SeriesValidator')

module.exports = {
    UserValidator,
    AreasValidator,
    PuestosValidator,
    ColaboradoresValidator,
    NominasValidator,
    ClientesValidator,
    GruposValidator,
    PlantelesValidator,
    DepartamentosValidator,
    ProveedoresValidator,
    GastosTiendasValidator,
    LogsValidator,
    FaltasColaboradoresValidator,
    ConfiguracionesValidator,
    ArticulosValidator,
    OrdenesCompraValidator,
    ArticulosOCValidator,
    InventariosValidator,
    ComprasValidator,
    PedidosValidator,
    ArticulosPedidoValidator,
    SurtidosValidator,
    DevolucionesValidator,
    DevolucionesProveedoresValidator,
    ArticulosSurtidosValidator,
    ArticulosDevolucionesValidator,
    ArticulosDevolucionesProveedoresValidator,
    ComprasAcumuladosValidator,
    AbonosValidator,
    LineasValidator,
    MarcasValidator,
    FamiliasValidator,
    ColeccionesValidator,
    ComposicionesValidator,
    TraspasosSalidaValidator,
    TraspasosEntradaValidator,
    ArticulosTSValidator,
    ArticulosTEValidator,
    DepartamentosClientesValidator,
    ArticulosTSolValidator,
    ArticulosTSolV2Validator,
    TraspasosSolicitudValidator,
    TraspasosSolicitudV2Validator,
    ArticulosVentasTiendasValidator,
    VentasTiendasValidator,
    AbonosTiendasValidator,
    VentasConsecutivoValidator,
    ArticulosDevolucionesTiendasValidator,
    DevolucionesTiendasValidator,
    BancosValidator,
    AnticiposValidator,
    NotasCargoValidator,
    MuestrasEntradaValidator,
    ArticulosMEValidator,
    MuestrasSalidaValidator,
    ArticulosMSValidator,
    ComisionesValidator,
    GastosGeneralValidator,
    AbonosProveedoresValidator,
    AjustesInventarioValidator,
    ArticulosAjustesInvValidator,
    ConceptosGastosValidator,
    ArticulosEmbarquesValidator,
    ConceptosGastosEmbarquesValidator,
    ConceptosGastosTiendasValidator,
    EmbarquesValidator,
    GastosEmbarquesValidator,
    NotasCxPValidator,
    TraspasosDineroValidator,
    CotizacionesTiendasValidator,
    ArticulosCotizacionesTiendasValidator,
    InsumosValidator,
    OrdenesCompraHabValidator,
    HabOCValidator,
    ComprasHabValidator,
    ComprasAcumuladosHabValidator,
    InventariosHabValidator,
    ExplosionValidator,
    InsumosPedidosValidator,
    DetalleInsumosPedidosValidator,
    BancosTraspasosValidator,
    MovimientosBancosValidator,
    SolicitudInsumosPedidosValidator,
    DetalleSolicitudInsumosPedidosValidator,
    NameValidator,
    SubCategoriasValidator,
    ProcesosSalidaValidator,
    ProcesosEntradaValidator,
    ArticulosProcesosSalidaValidator,
    ArticulosProcesosEntradaValidator,
    ControlCalidadValidator,
    TelefonosWhatsAppValidator,
    ArticulosProporcionValidator,
    SaldoInicialValidator,
    BrokersValidator,
    AbonosTraspasosValidator,
    AbonosFacturasValidator,
    EmpresasValidator,
    ArticulosDevolucionesFiscalValidator,
    CompPagoValidator,
    CuentasClientesValidator,
    CuentasEmpresasValidator,
    DevolucionesFiscalValidator,
    FacturasValidator,
    NotasCreditoValidator,
    PagosFacturasValidator,
    SeriesValidator,
}