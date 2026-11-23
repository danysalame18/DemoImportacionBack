const { CotizacionesTiendas, Clientes } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        CotizacionesTiendas.find()
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        CotizacionesTiendas.findById(id)
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneCotizacionesDiario: (req, res)=>{
        const { almacen, inicio, fin } = req.params
        CotizacionesTiendas.find({fecha:{$gte: inicio, $lte: fin},areas:almacen})
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneCotizacionesDiarioGeneral: (req, res)=>{
        const { inicio, fin } = req.params
        CotizacionesTiendas.find({fecha:{$gte: inicio, $lte: fin}})
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneCliente: (req, res)=>{
        const { cliente } = req.params
        CotizacionesTiendas.find({clientes:cliente, "saldo"  : {$gt : 0}})
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const newCotizacionesTiendas = new CotizacionesTiendas(body)
        const pedido = newCotizacionesTiendas.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        CotizacionesTiendas.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: async (req, res)=>{
        const { body } = req
        let ped = await CotizacionesTiendas.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}