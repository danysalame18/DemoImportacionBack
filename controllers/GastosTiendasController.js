const { GastosTiendas } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        GastosTiendas.find()
            .populate('areas')
            .populate('bancos')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        GastosTiendas.findById(id)
            .populate('areas')
            .populate('bancos')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneArea: (req, res)=>{
        const { area } = req.params
        GastosTiendas.find({areas:area})
            .populate('areas')
            .populate('bancos')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneGastosDiario: (req, res)=>{
        const { area, inicio, fin } = req.params
        GastosTiendas.find({fecha:{$gte: inicio, $lte: fin},areas:area})
        .populate('areas')
        .populate('bancos')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneGastosDiarioGeneral: (req, res)=>{
        const { inicio, fin } = req.params
        GastosTiendas.find({fecha:{$gte: inicio, $lte: fin}})
        .populate('areas')
        .populate('bancos')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const newGastosTiendas = new GastosTiendas(body)
        newGastosTiendas.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        GastosTiendas.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        GastosTiendas.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}