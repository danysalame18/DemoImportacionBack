const { DetalleSolicitudInsumosPedidos, InventariosHab } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        DetalleSolicitudInsumosPedidos.find()
        .populate('insumos')
        .populate('solicitudInsumosPedidos')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        DetalleSolicitudInsumosPedidos.findById(id)
        .populate('insumos')
        .populate('solicitudInsumosPedidos')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findActivos: (req, res)=>{
        DetalleSolicitudInsumosPedidos.find({pendientePedir:{$gt:0}})
        .populate('insumos')
        .populate('solicitudInsumosPedidos')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOnePedido: (req, res)=>{
        const { id } = req.params
        DetalleSolicitudInsumosPedidos.find({ pedidos: id })
        .populate('insumos')
        .populate('solicitudInsumosPedidos')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const newDetalleSolicitudInsumosPedidos = new DetalleSolicitudInsumosPedidos(body)
        newDetalleSolicitudInsumosPedidos.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        DetalleSolicitudInsumosPedidos.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        DetalleSolicitudInsumosPedidos.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}