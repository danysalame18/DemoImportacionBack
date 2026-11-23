const { Nominas } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        Nominas.find()
        .populate({path: 'colaboradores', populate:{path: 'planteles'}})
        .populate({path: 'colaboradores', populate:{path: 'areas'}})
        .populate('planteles')
        .populate('areas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Nominas.findById(id)
        .populate('colaboradores')
        .populate('planteles')
        .populate('areas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newNominas = new Nominas(body)
        newNominas.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        Nominas.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Nominas.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}