const { Familias } = require('../models')
const { FamiliasService } = require('../services')

module.exports = { 
    findAll: (req, res)=>{
        Familias.find()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Familias.findById(id)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
       try {
        const familiasExists = await FamiliasService.findOneByName(body.name)
        if (familiasExists) {res.status(400).json({message: 'Esa familia ya esta registrada'}) 
        alert('Esa familia ya esta registrada')}
        else{
        const newArea = new Familias(body)
        const familia = await newArea.save()
        res.status(201).json(familia)
        }
       } catch (error) {
           res.status(400).json(error)
           console.log(error)
       }
    },
    delete: (req, res)=>{
        Familias.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Familias.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}