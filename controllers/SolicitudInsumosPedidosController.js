const { SolicitudInsumosPedidos } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        SolicitudInsumosPedidos.find()
        .populate("clientes")
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        SolicitudInsumosPedidos.findById(id)
        .populate("clientes")
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOnePedido: (req, res)=>{
        const { id } = req.params
        SolicitudInsumosPedidos.find({ pedidos: id })
        .populate("clientes")
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const newSolicitudInsumosPedidos = new SolicitudInsumosPedidos(body)
        newSolicitudInsumosPedidos.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        SolicitudInsumosPedidos.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        SolicitudInsumosPedidos.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}