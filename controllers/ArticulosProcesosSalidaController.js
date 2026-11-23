const { ArticulosProcesosSalida, ArticulosPedido } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        ArticulosProcesosSalida.find()
        .populate({path: 'articulosPedido', populate:{path: 'articulos'}})
        .populate({path: 'articulosPedido', populate:{path: 'tallas'}})
        .populate({path: 'articulosPedido', populate:{path: "articulos", populate:{path: 'catalogoProcesos'}}})
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'procesosSalida', populate:{path: 'catalogoProcesos'}})
        .populate({path: 'procesosSalida', populate:{path: 'proveedores'}})
        .populate("proveedores")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ArticulosProcesosSalida.findById(id)
        .populate({path: 'articulosPedido', populate:{path: 'articulos'}})
        .populate({path: 'articulosPedido', populate:{path: 'tallas'}})
        .populate({path: 'articulosPedido', populate:{path: "articulos", populate:{path: 'catalogoProcesos'}}})
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'procesosSalida', populate:{path: 'catalogoProcesos'}})
        .populate({path: 'procesosSalida', populate:{path: 'proveedores'}})
        .populate("proveedores")
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findFechasActivos: (req, res)=>{
        const { inicio, fin } = req.params;
        ArticulosProcesosSalida.find({
            fecha: { $gte: inicio, $lte: fin },
            is_active: "Si",
            faltantes: {$gt:0}
          })
        .populate({path: 'articulosPedido', populate:{path: 'articulos'}})
        .populate({path: 'articulosPedido', populate:{path: 'tallas'}})
        .populate({path: 'articulosPedido', populate:{path: "articulos", populate:{path: 'catalogoProcesos'}}})
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'procesosSalida', populate:{path: 'catalogoProcesos'}})
        .populate({path: 'procesosSalida', populate:{path: 'proveedores'}})
        .populate("proveedores")
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneProceso: (req, res)=>{
        const { id } = req.params
        ArticulosProcesosSalida.find({ procesosSalida: id })
        .populate({path: 'articulosPedido', populate:{path: 'articulos'}})
        .populate({path: 'articulosPedido', populate:{path: 'tallas'}})
        .populate({path: 'articulosPedido', populate:{path: "articulos", populate:{path: 'catalogoProcesos'}}})
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'procesosSalida', populate:{path: 'catalogoProcesos'}})
        .populate({path: 'procesosSalida', populate:{path: 'proveedores'}})
        .populate("proveedores")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOnePedido: (req, res)=>{
        const { id } = req.params
        ArticulosProcesosSalida.find({ pedidos: id })
        .populate({path: 'articulosPedido', populate:{path: 'articulos'}})
        .populate({path: 'articulosPedido', populate:{path: 'tallas'}})
        .populate({path: 'articulosPedido', populate:{path: "articulos", populate:{path: 'catalogoProcesos'}}})
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'procesosSalida', populate:{path: 'catalogoProcesos'}})
        .populate({path: 'procesosSalida', populate:{path: 'proveedores'}})
        .populate("proveedores")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const saldoCliente = await ArticulosPedido.findByIdAndUpdate(
            body.articulosPedido,
            { $inc: { cantidadProcesos: body.cantidadSalida } },
            { new: true }
          );
        const newArticulosProcesosSalida = new ArticulosProcesosSalida(body)
        newArticulosProcesosSalida.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        ArticulosProcesosSalida.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        ArticulosProcesosSalida.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}