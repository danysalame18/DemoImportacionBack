const { InsumosPedidos } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        InsumosPedidos.find()
        .populate("clientes")
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate("procesosSalida")
        .populate("proveedores")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        InsumosPedidos.findById(id)
        .populate("clientes")
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate("procesosSalida")
        .populate("proveedores")
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOnePedido: (req, res)=>{
        const { id } = req.params
        InsumosPedidos.find({ pedidos: id })
        .populate("clientes")
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate("procesosSalida")
        .populate("proveedores")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const newInsumosPedidos = new InsumosPedidos(body)
        newInsumosPedidos.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        InsumosPedidos.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        InsumosPedidos.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}