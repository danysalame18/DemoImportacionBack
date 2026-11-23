const { BancosTraspasos} = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        BancosTraspasos.find()
        .populate('bancoOrigen')
        .populate('bancoDestino')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        BancosTraspasos.findById(id)
        .populate('bancoOrigen')
        .populate('bancoDestino')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req

        const newBancosTraspasos = new BancosTraspasos(body)
        newBancosTraspasos.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        BancosTraspasos.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        BancosTraspasos.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}