const { ComprasAcumulados } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        ComprasAcumulados.find()
        .populate("compras")
        .populate({path: 'articulosEmbarques', populate:{path: 'articulosOC'}})
        .populate("articulos")
        .populate("areas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ComprasAcumulados.findById(id)
        .populate("compras")
        .populate({path: 'articulosEmbarques', populate:{path: 'articulosOC'}})
        .populate("articulos")
        .populate("areas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneCompra: (req, res)=>{
        const { id } = req.params
        ComprasAcumulados.find({ compras: id })
        .populate("compras")
        .populate({path: 'articulosEmbarques', populate:{path: 'articulosOC'}})
        .populate("articulos")
        .populate("areas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findOneFechas: (req, res)=>{
        const { inicio, fin } = req.params
        ComprasAcumulados.find({fecha:{$gte: inicio, $lte: fin}})
        .populate("compras")
        .populate({path: 'articulosEmbarques', populate:{path: 'articulosOC'}})
        .populate({path: 'articulos', populate:{path: 'proveedores'}})
        .populate("areas")
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneOrden: (req, res)=>{
        const { id } = req.params
        ComprasAcumulados.find({ ordenesCompra: id })
        .populate("compras")
        .populate({path: 'articulosEmbarques', populate:{path: 'articulosOC'}})
        .populate("articulos")
        .populate("areas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findOneInventario: (req, res)=>{
        const { id } = req.params
        ComprasAcumulados.find({ inventarios: id })
        .populate("compras")
        .populate({path: 'articulosEmbarques', populate:{path: 'articulosOC'}})
        .populate("articulos")
        .populate("areas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newComprasAcumulados = new ComprasAcumulados(body)
        const dev = newComprasAcumulados.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        ComprasAcumulados.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        ComprasAcumulados.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}