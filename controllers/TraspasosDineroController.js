const { TraspasosDinero } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        TraspasosDinero.find()
            .populate('areas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        TraspasosDinero.findById(id)
            .populate('areas')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneArea: (req, res)=>{
        const { area } = req.params
        TraspasosDinero.find({areas:area})
            .populate('areas')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findFechas: (req, res)=>{
        const { inicio, fin } = req.params
        TraspasosDinero.find({fecha:{$gte: inicio, $lte: fin}})
        .populate('areas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const newTraspasosDinero = new TraspasosDinero(body)
        newTraspasosDinero.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        TraspasosDinero.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        TraspasosDinero.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}