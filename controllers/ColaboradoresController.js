const { Colaboradores } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        Colaboradores.find()
        .populate('planteles')
        .populate('areas')
        .populate({path: 'puestos', populate:{path: 'areas'}})
        .populate({path: 'puestos', populate:{path: 'colaboradores'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Colaboradores.findById(id)
        .populate('planteles')
        .populate('areas')
        .populate({path: 'puestos', populate:{path: 'areas'}})
        .populate({path: 'puestos', populate:{path: 'colaboradores'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findVendedor: (req, res)=>{
        Colaboradores.find({vendedor: "Si"})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneColaboradorMail: (req, res)=>{
        const { email } = req.params
        Colaboradores.find({"email": email})
        .populate('planteles')
        .populate('areas')
        .populate({path: 'puestos', populate:{path: 'areas'}})
        .populate({path: 'puestos', populate:{path: 'colaboradores'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newColaboradores = new Colaboradores(body)
        const colaboradores = newColaboradores.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        Colaboradores.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Colaboradores.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}