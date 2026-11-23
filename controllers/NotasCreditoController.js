const { NotasCredito, Series } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        NotasCredito.find()
        .populate('facturas')
        .populate('empresas')
        .populate('clientes')
        .populate('colaboradores')      
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        NotasCredito.findById(id)
        .populate('facturas')
        .populate('empresas')
        .populate('clientes')
        .populate('colaboradores')      
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneFechas: (req, res)=>{
        const { inicio, fin } = req.params
        NotasCredito.find({fecha:{$gte: inicio, $lte: fin}})
        .populate('facturas')
        .populate('empresas')
        .populate('clientes')
        .populate('colaboradores')      
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
create: async (req, res) => {
  const { body } = req;

  try {
    const fol = await Series.find({ serie: body.serie });
    if (!fol?.length) {
      return res.status(400).json({ message: "Serie no encontrada" });
    }

    // 1) Normalizar facturas / detalle
    const facturasDetalle = Array.isArray(body.facturasDetalle)
      ? body.facturasDetalle
          .filter((x) => x?.factura && Number(x?.monto) > 0)
          .map((x) => ({
            factura: x.factura,
            monto: Number(x.monto),
          }))
      : [];

    // Si NO mandas facturasDetalle, caemos a facturas []
    // (pero OJO: sin detalle luego no puedes afectar saldos correctamente)
    const facturasIds =
      facturasDetalle.length > 0
        ? facturasDetalle.map((x) => x.factura)
        : Array.isArray(body.facturas)
        ? body.facturas.filter(Boolean)
        : [];

    if (!facturasIds.length) {
      return res.status(400).json({ message: "Selecciona al menos una factura" });
    }

    const newNotasCredito = new NotasCredito({
      fecha: body.fecha,
      clientes: body.clientes,
      colaboradores: body.colaboradores,
      empresas: body.empresas,

      // ✅ guarda ambas (recomendado)
      facturas: facturasIds,
      facturasDetalle, // <- NUEVO (requiere schema)

      observaciones: body.observaciones,

      timbre: body.timbre,
      cfdiType: body.cfdiType,

      serie: body.serie,
      folio: fol[0].folio + 1,
      expeditionPlace: body.expeditionPlace,

      rfcEmpresa: body.rfcEmpresa,
      nombreEmpresa: body.nombreEmpresa,
      regFiscalEmpresa: body.regFiscalEmpresa,

      cfdiUse: body.cfdiUse,
      paymentForm: body.paymentForm,
      paymentMethod: body.paymentMethod,

      subTotal: body.subTotal,
      iva: body.iva,
      total: body.total,

      currency: body.currency,
    });

    await Series.findByIdAndUpdate(
      fol[0]._id,
      { $inc: { folio: 1 } },
      { new: true }
    );

    const fac = await newNotasCredito.save();
    return res.status(201).json(fac);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
},

    delete: (req, res)=>{
        NotasCredito.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        NotasCredito.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}