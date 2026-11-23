const { OrdenesCompra, ComprasAcumulados } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        OrdenesCompra.find()
        .populate('proveedores')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        OrdenesCompra.findById(id)
        .populate('proveedores')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneFechas: (req, res)=>{
        const { inicio, fin } = req.params;
        OrdenesCompra.find({ fecha: { $gte: inicio, $lte: fin } })
        .populate('proveedores')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneFechasStatus: (req, res)=>{
        const { inicio, fin, status } = req.params;
        OrdenesCompra.find({ fecha: { $gte: inicio, $lte: fin }, status:status })
        .populate('proveedores')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newOrdenesCompra = new OrdenesCompra(body)
        const orden = newOrdenesCompra.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        OrdenesCompra.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: async (req, res)=>{
        const { body } = req
        let comp = await ComprasAcumulados.updateMany({ ordenesCompra: req.params.id}, { proveedores: body.proveedores})
        let ord = await OrdenesCompra.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}