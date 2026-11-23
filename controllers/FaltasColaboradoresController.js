const { FaltasColaboradores } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        FaltasColaboradores.find()
            .populate({path: 'colaboradores', populate:{path: 'areas'}})
            .populate({path: 'colaboradores', populate:{path: 'planteles'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        FaltasColaboradores.findById(id)
        .populate({path: 'colaboradores', populate:{path: 'areas'}})
        .populate({path: 'colaboradores', populate:{path: 'planteles'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newFaltasColaboradores = new FaltasColaboradores(body)
         newFaltasColaboradores.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        FaltasColaboradores.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        FaltasColaboradores.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}