const { DetalleInsumosPedidos, InventariosHab } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        DetalleInsumosPedidos.find()
        .populate('insumos')
        .populate('insumosPedidos')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate("proveedores")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        DetalleInsumosPedidos.findById(id)
        .populate('insumos')
        .populate('insumosPedidos')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate("proveedores")
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOnePedido: (req, res)=>{
        const { id } = req.params
        DetalleInsumosPedidos.find({ pedidos: id })
        .populate('insumos')
        .populate('insumosPedidos')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate("proveedores")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneFechas: (req, res)=>{
        const { inicio, fin } = req.params
        DetalleInsumosPedidos.find({  fecha: { $gte: inicio, $lte: fin },})
        .populate('insumos')
        .populate('insumosPedidos')
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate("proveedores")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        let inv = await InventariosHab.findOneAndUpdate( {insumos: body.insumos} ,
        { $inc: {cantidad: -body.cantidad } }, { new: true }  );
            

        const newDetalleInsumosPedidos = new DetalleInsumosPedidos(body)
        newDetalleInsumosPedidos.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        DetalleInsumosPedidos.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        DetalleInsumosPedidos.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}