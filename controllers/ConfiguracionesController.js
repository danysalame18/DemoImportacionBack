const { Configuraciones } = require('../models')
const { ConfiguracionesService } = require('../services')

module.exports = { 
    findAll: (req, res)=>{
        Configuraciones.find()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Configuraciones.findById(id)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const newConfiguracion = new Configuraciones(body)
        newConfiguracion.save()
        .then((resDB)=> res.status(204).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    delete: (req, res)=>{
        Configuraciones.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Configuraciones.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}