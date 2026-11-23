const { Empresas } = require('../models')
const { EmpresasService } = require('../services')

module.exports = { 
    findAll: (req, res)=>{
        Empresas.find()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Empresas.findById(id)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
       try {
        const empresasExists = await EmpresasService.findOneByName(body.name)
        if (empresasExists) {res.status(400).json({message: 'La empresa ya esta registrada'}) 
        alert('La empresa ya esta registrada')}
        else{
        const newArea = new Empresas(body)
        const area = await newArea.save()
        res.status(201).json(area)
        }
       } catch (error) {
           res.status(400).json(error)
           console.log(error)
       }
    },
    delete: (req, res)=>{
        Empresas.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Empresas.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}