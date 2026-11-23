const { VentasAbyFiscal, VentasTiendas } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        VentasAbyFiscal.find()
            .populate('ventasTiendas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        VentasAbyFiscal.findById(id)
            .populate('ventasTiendas')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const newVentasAbyFiscal = new VentasAbyFiscal(body)
        newVentasAbyFiscal.save()
        .then(async (respDB)=>{
            
            let vt = await VentasTiendas.findByIdAndUpdate(body.ventasTiendas, {consecutivo: respDB.idVentasAbyFiscal}, { new: true})
            res.status(201).json(respDB)
        })
        .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        VentasAbyFiscal.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        VentasAbyFiscal.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}