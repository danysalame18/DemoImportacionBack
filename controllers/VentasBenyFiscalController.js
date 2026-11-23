const { VentasBenyFiscal, VentasTiendas } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        VentasBenyFiscal.find()
            .populate('ventasTiendas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        VentasBenyFiscal.findById(id)
            .populate('ventasTiendas')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const newVentasBenyFiscal = new VentasBenyFiscal(body)
        newVentasBenyFiscal.save()
        .then(async (respDB)=>{
            
            let vt = await VentasTiendas.findByIdAndUpdate(body.ventasTiendas, {consecutivo: respDB.idVentasBenyFiscal}, { new: true})
            res.status(201).json(respDB)
        })
        .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        VentasBenyFiscal.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        VentasBenyFiscal.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}