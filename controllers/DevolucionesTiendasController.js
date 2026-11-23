const { DevolucionesTiendas } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        DevolucionesTiendas.find()
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
        .populate('ventasTiendas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        DevolucionesTiendas.findById(id)
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
        .populate('ventasTiendas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneCliente: (req, res)=>{
        const { cliente } = req.params
        DevolucionesTiendas.find({clientes:cliente})
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
        .populate('ventasTiendas')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneDevolucionesDiario: (req, res)=>{
        const { almacen, inicio, fin } = req.params
        DevolucionesTiendas.find({fecha:{$gte: inicio, $lte: fin},areas:almacen})
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
        .populate('ventasTiendas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneDevolucionesDiarioGeneral: (req, res)=>{
        const { inicio, fin } = req.params
        DevolucionesTiendas.find({fecha:{$gte: inicio, $lte: fin}})
        .populate('clientes')
        .populate('colaboradores')
        .populate('areas')
        .populate('ventasTiendas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newDevolucionesTiendas = new DevolucionesTiendas(body)
        const pedido = newDevolucionesTiendas.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        DevolucionesTiendas.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: async (req, res)=>{
        const { body } = req
        let ped = await DevolucionesTiendas.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}