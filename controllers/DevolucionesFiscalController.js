const { DevolucionesFiscal, Series } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        DevolucionesFiscal.find()
        .populate('facturas')
        .populate('empresas')
        .populate('clientes')
        .populate('colaboradores')      
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        DevolucionesFiscal.findById(id)
        .populate('facturas')
        .populate('empresas')
        .populate('clientes')
        .populate('colaboradores')      
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneFechas: (req, res)=>{
        const { inicio, fin } = req.params
        DevolucionesFiscal.find({fecha:{$gte: inicio, $lte: fin}})
        .populate('facturas')
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

        const newDevolucionesFiscal = new DevolucionesFiscal({
              fecha: body.fecha,
              clientes: body.clientes,
              colaboradores: body.colaboradores,
              empresas: body.empresas,
              facturas: body.facturas,
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

              subTotal: body.subTotal,
              iva: body.iva,
              total: body.total,

              currency: body.currency,
            
            })

        const actFolio = await Series.findByIdAndUpdate(fol[0]._id, {$inc:{folio: 1}}, { new: true})

        const fac = await newDevolucionesFiscal.save()
        res.status(201).json(fac)
       } catch (error) {
           res.status(400).json(error)
           console.log(error)
       }
    },
    delete: (req, res)=>{
        DevolucionesFiscal.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        DevolucionesFiscal.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}