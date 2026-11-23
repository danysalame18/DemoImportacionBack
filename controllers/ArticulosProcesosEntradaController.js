const { ArticulosProcesosEntrada, ArticulosProcesosSalida } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        ArticulosProcesosEntrada.find()
        .populate({path: 'articulosPedido', populate:{path: 'articulos'}})
        .populate({path: 'articulosPedido', populate:{path: 'tallas'}})
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate("proveedores")        
        .populate('articulosProcesosSalida')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ArticulosProcesosEntrada.findById(id)
        .populate({path: 'articulosPedido', populate:{path: 'articulos'}})
        .populate({path: 'articulosPedido', populate:{path: 'tallas'}})
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate("proveedores")        
        .populate('articulosProcesosSalida')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneProceso: (req, res)=>{
        const { id } = req.params
        ArticulosProcesosEntrada.find({ procesosEntrada: id })
        .populate({path: 'articulosPedido', populate:{path: 'articulos'}})
        .populate({path: 'articulosPedido', populate:{path: 'tallas'}})
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate("proveedores")        
        .populate('articulosProcesosSalida')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOnePedido: (req, res)=>{
        const { id } = req.params
        ArticulosProcesosEntrada.find({ pedidos: id })
        .populate({path: 'articulosPedido', populate:{path: 'articulos'}})
        .populate({path: 'articulosPedido', populate:{path: 'tallas'}})
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate("proveedores")        
        .populate('articulosProcesosSalida')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req

        let total = body.cantidadEntrada 
        // + body.cantidadFaltantes + body.cantidadSegundas

        let artSal = await ArticulosProcesosSalida.findByIdAndUpdate(body.articulosProcesosSalida, {$inc:{cantidadEntrada: total, faltantes: -total
            // , faltantesHab: body.cantidadFaltantes, segundas: body.cantidadSegundas
        }}, {new:true})

        const newArticulosProcesosEntrada = new ArticulosProcesosEntrada(body)
        newArticulosProcesosEntrada.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        ArticulosProcesosEntrada.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        ArticulosProcesosEntrada.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}