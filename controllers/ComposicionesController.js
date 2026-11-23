const { Composiciones } = require('../models')
const { ComposicionesService } = require('../services')

module.exports = { 
    findAll: (req, res)=>{
        Composiciones.find()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Composiciones.findById(id)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
       try {
        const composicionesExists = await ComposicionesService.findOneByName(body.name)
        if (composicionesExists) {res.status(400).json({message: 'Esa composicion ya esta registrada'}) 
        alert('Esa composicion ya esta registrada')}
        else{
        const newArea = new Composiciones(body)
        const composicion = await newArea.save()
        res.status(201).json(composicion)
        }
       } catch (error) {
           res.status(400).json(error)
           console.log(error)
       }
    },
    delete: (req, res)=>{
        Composiciones.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Composiciones.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}