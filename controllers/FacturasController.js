const { Facturas, Series, PagosFacturas, NotasCredito, Surtidos, ArticulosSurtidos } = require('../models')

// Cuanto de cada factura esta acreditado con notas de credito activas y timbradas hechas SOLO para
// esa factura (la nota que la "anula", como la N-268 de la F 1958). No cuentan las notas repartidas
// entre varias facturas (descuentos/aportaciones de CASA LEY): esa mercancia si se vendio.
async function acreditadoNC(ids) {
    const mapa = {}
    if (!ids.length) return mapa
    const notas = await NotasCredito.find({
        is_active: "Si",
        timbre: "Si",
        $or: [{ facturas: { $in: ids } }, { "facturasDetalle.factura": { $in: ids } }],
    }).select("facturas facturasDetalle total").lean()
    const buscadas = new Set(ids.map(String))
    notas.forEach((n) => {
        const relacionadas = new Set([
            ...(n.facturas || []).map(String),
            ...(n.facturasDetalle || []).map((d) => String(d.factura)),
        ])
        if (relacionadas.size !== 1) return
        const f = [...relacionadas][0]
        if (!buscadas.has(f)) return
        const det = (n.facturasDetalle || []).find((d) => String(d.factura) === f)
        mapa[f] = (mapa[f] || 0) + (Number(det ? det.monto : n.total) || 0)
    })
    return mapa
}
const acreditadaCompleta = (factura, acreditado) => (acreditado || 0) >= (Number(factura.total) || 0) - 0.5

module.exports = {
    // Complementos de pago y notas de crédito (activos y timbrados) relacionados a una factura
    findRelacionados: async (req, res) => {
        try {
            const { id } = req.params;

            // Complementos de pago: se relacionan vía PagosFacturas (factura + compPago + AmountPaid)
            const pagos = await PagosFacturas.find({ facturas: id, is_active: "Si" })
                .populate("compPago");

            const complementos = pagos
                .filter((p) => {
                    const c = p.compPago && p.compPago[0];
                    return c && c.is_active === "Si" && c.timbre === "Si";
                })
                .map((p) => {
                    const c = p.compPago[0];
                    return {
                        numero: c.idCompPago,
                        serie: c.serie || "",
                        folio: c.folio || "",
                        fecha: c.fecha || "",
                        monto: p.AmountPaid || 0,
                    };
                });

            // Notas de crédito: referencian la factura en `facturas` o en `facturasDetalle.factura`
            const notas = await NotasCredito.find({
                is_active: "Si",
                timbre: "Si",
                $or: [{ facturas: id }, { "facturasDetalle.factura": id }],
            });

            const notasMap = notas.map((n) => {
                const det = (n.facturasDetalle || []).find(
                    (d) => String(d.factura) === String(id)
                );
                return {
                    numero: n.idNotaCredito,
                    serie: n.serie || "",
                    folio: n.folio || "",
                    fecha: n.fecha || "",
                    monto: det ? det.monto : (n.total || 0),
                };
            });

            res.status(200).json({ complementos, notas: notasMap });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    findAll: (req, res)=>{
        Facturas.find()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Facturas.findById(id)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneFechas: async (req, res)=>{
        try {
            const { inicio, fin } = req.params
            const facturas = await Facturas.find({fecha:{$gte: inicio, $lte: fin}})
                .populate('empresas')
                .populate('clientes')
                .populate('colaboradores')
                .lean()
            // liberable: acreditada al 100% con nota(s) de credito solo de ella y su nota (surtido) sigue marcada
            // como facturada, asi que no sale para volver a facturar
            const pagadas = facturas.filter((f) => f.is_active === "Si" && f.timbre === "Si" && Number(f.saldo) < 0.5)
            const acreditado = await acreditadoNC(pagadas.map((f) => f._id))
            const candidatas = pagadas.filter((f) => acreditadaCompleta(f, acreditado[String(f._id)])).map((f) => f._id)
            const conNota = new Set()
            if (candidatas.length) {
                const surtidos = await Surtidos.find({ facturas: { $in: candidatas }, facturado: "Si", is_active: "Si" }).select("facturas").lean()
                surtidos.forEach((s) => (s.facturas || []).forEach((f) => conNota.add(String(f))))
            }
            facturas.forEach((f) => { f.liberable = conNota.has(String(f._id)) })
            res.status(200).json(facturas)
        } catch (err) {
            console.log(err)
            res.status(400).json({ message: err.message })
        }
    },
    // Deja otra vez "sin facturar" las notas de una factura acreditada al 100% con notas de credito,
    // para que salgan en Nueva Factura (igual que al cancelar una factura). No toca saldos.
    liberarSurtidos: async (req, res)=>{
        try {
            const { id } = req.params
            const factura = await Facturas.findById(id).lean()
            if (!factura || factura.is_active !== "Si") {
                return res.status(400).json({ message: "La factura no existe o ya esta cancelada" })
            }
            const acreditado = (await acreditadoNC([factura._id]))[String(factura._id)] || 0
            if (!acreditadaCompleta(factura, acreditado)) {
                return res.status(400).json({ message: `Solo se libera si una nota de credito hecha solo para esta factura la acredita al 100% (acreditado ${acreditado.toFixed(2)} de ${Number(factura.total).toFixed(2)})` })
            }
            const surtidos = await Surtidos.find({ facturas: id, facturado: "Si" }).select("idSurtido").lean()
            if (!surtidos.length) {
                return res.status(400).json({ message: "Esta factura ya no tiene notas por liberar" })
            }
            const ids = surtidos.map((s) => s._id)
            await Surtidos.updateMany({ _id: { $in: ids } }, { facturado: "No" })
            const art = await ArticulosSurtidos.updateMany({ surtidos: { $in: ids }, facturas: id, facturado: "Si" }, { facturado: "No" })
            res.status(200).json({ notas: surtidos.map((s) => s.idSurtido), articulos: art.nModified ?? art.modifiedCount ?? 0 })
        } catch (err) {
            console.log(err)
            res.status(400).json({ message: err.message })
        }
    },
    findOneCliente: (req, res)=>{
        const { cliente } = req.params
        Facturas.find({clientes:cliente, saldo:{$gt:0}, is_active:"Si"})
        .populate('empresas')
        .populate('clientes')
        .populate('colaboradores')  
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findPagoFacturas: (req, res)=>{
        Facturas.find({saldo:{$gt:0}, is_active:"Si", timbre:"Si"})
        .populate('empresas')
        .populate({path: 'clientes', populate:{path: 'vendedor'}})
        .populate('colaboradores')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneCompPago: (req, res)=>{
        const { cliente, empresa } = req.params
        Facturas.find({clientes:cliente, empresas:empresa, is_active:"Si", timbre:"Si", pagado:"No"})
        .populate('empresas')
        .populate('clientes')
        .populate('colaboradores')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
       try {

        const fol = await Series.find({serie: body.serie})

        const newFacturas = new Facturas({
            fecha: body.fecha,
              observaciones: body.observaciones,
              totalCantidad: body.totalCantidad,
              subTotal: body.subTotal,
              iva: body.iva,
              total: body.total,
              descuentoPorcentaje1: body.descuentoPorcentaje1,
              descuentoNumero1: body.descuentoNumero1,
              descuentoConcepto1: body.descuentoConcepto1,
              descuentoPorcentaje2: body.descuentoPorcentaje2,
              descuentoNumero2: body.descuentoNumero2,
              descuentoConcepto2: body.descuentoConcepto2,
              empresas: body.empresas,
              clientes: body.clientes,
              colaboradores: body.colaboradores,
              timbre: body.timbre,
              currency: body.currency,
              cfdiType: body.cfdiType,
              
              serie: body.serie,
              expeditionPlace: body.expeditionPlace,

              rfcEmpresa: body.rfcEmpresa,
              nombreEmpresa: body.nombreEmpresa,
              regFiscalEmpresa: body.regFiscalEmpresa,

              condicionesPagoSATCliente: body.condicionesPagoSATCliente,
              formaPagoSATCliente: body.formaPagoSATCliente,
              metodoPagoSATCliente: body.metodoPagoSATCliente,
              rfcCliente: body.rfcCliente,
              nombreCliente: body.nombreCliente,
              usoCFDICliente: body.usoCFDICliente,
              regFiscalCliente: body.regFiscalCliente,
              cpCliente: body.cpCliente,

              abonos: body.abonos,
              saldo: body.saldo,
              pagado: body.pagado,
            
            folio: fol[0].folio + 1})

        const actFolio = await Series.findByIdAndUpdate(fol[0]._id, {$inc:{folio: 1}}, { new: true})

        const fac = await newFacturas.save()
        res.status(201).json(fac)
       } catch (error) {
           res.status(400).json(error)
           console.log(error)
       }
    },
    delete: (req, res)=>{
        Facturas.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Facturas.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editPago: async (req, res)=>{
        const { body } = req

        let pagado
        let a = await Facturas.findById(req.params.id)
        .populate('clientes')
        .populate('colaboradores')
        .populate('empresas')
        
        if(a.saldo - body.abonos > 0){
            pagado = "No"
        }else{
            pagado = "Si"
        }

        let newPF = new PagosFacturas({
            fecha: body.fecha,
            clientes: a.clientes[0]._id,
            colaboradores: a.colaboradores[0]._id,
            empresas: a.empresas[0]._id,
            facturas: a._id,
            compPago: body.compPago,
            PartialityNumber: a.numeroPagos + 1,
            PreviousBalanceAmount: a.saldo,
            AmountPaid: body.abonos,
            ImpSaldoInsoluto: parseFloat((a.saldo - body.abonos).toFixed(6)),
        })

        const p = await newPF.save()

       let fa = await Facturas.findByIdAndUpdate(req.params.id, { pagado: pagado, $inc:{abonos: body.abonos, saldo: -body.abonos, numeroPagos: 1} }, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editNotaCredito: async (req, res)=>{
        const { body } = req

        let pagado
        let a = await Facturas.findById(req.params.id)
        
        if(a.saldo - body.abonos > 0){
            pagado = "No"
        }else{
            pagado = "Si"
        }

       let fa = await Facturas.findByIdAndUpdate(req.params.id, { pagado: pagado, $inc:{abonos: body.abonos, saldo: -body.abonos, numeroPagos: 1} }, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}