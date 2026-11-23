const { CompPago, Series } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        CompPago.find()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        CompPago.findById(id)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneFechas: (req, res)=>{
        const { inicio, fin } = req.params
        CompPago.find({fecha:{$gte: inicio, $lte: fin}})
        .populate('empresas')
        .populate('clientes')
        .populate('colaboradores')     
        .populate('cuentasClientes') 
        .populate('cuentasEmpresas') 
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
       try {

        const fol = await Series.find({serie: body.serie})

        const newCompPago = new CompPago({
              fecha: body.fecha,
              clientes: body.clientes,
              colaboradores: body.colaboradores,
              empresas: body.empresas,
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

              total: body.total,
              currency: body.currency,

              cuentasClientes: body.cuentasClientes,
              cuentasEmpresas: body.cuentasEmpresas,
            
            })

        const actFolio = await Series.findByIdAndUpdate(fol[0]._id, {$inc:{folio: 1}}, { new: true})

        const fac = await newCompPago.save()
        res.status(201).json(fac)
       } catch (error) {
           res.status(400).json(error)
           console.log(error)
       }
    },
    delete: (req, res)=>{
        CompPago.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        CompPago.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}