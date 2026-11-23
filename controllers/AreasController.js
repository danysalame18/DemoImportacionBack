const { Areas } = require('../models')
const { AreasService } = require('../services')

module.exports = { 
    findAll: (req, res)=>{
        Areas.find()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Areas.findById(id)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
       try {
        const areasExists = await AreasService.findOneByName(body.name)
        if (areasExists) {res.status(400).json({message: 'Esa area ya esta registrada'}) 
        alert('Esa area ya esta registrada')}
        else{
        const newArea = new Areas(body)
        const area = await newArea.save()
        res.status(201).json(area)
        }
       } catch (error) {
           res.status(400).json(error)
           console.log(error)
       }
    },
    delete: (req, res)=>{
        Areas.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Areas.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}