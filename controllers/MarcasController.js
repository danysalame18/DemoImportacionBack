const { Marcas } = require('../models')
const { MarcasService } = require('../services')

module.exports = { 
    findAll: (req, res)=>{
        Marcas.find()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Marcas.findById(id)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
       try {
        const marcasExists = await MarcasService.findOneByName(body.name)
        if (marcasExists) {res.status(400).json({message: 'Esa marca ya esta registrada'}) 
        alert('Esa marca ya esta registrada')}
        else{
        const newMarca = new Marcas(body)
        const marca = await newMarca.save()
        res.status(201).json(marca)
        }
       } catch (error) {
           res.status(400).json(error)
           console.log(error)
       }
    },
    delete: (req, res)=>{
        Marcas.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Marcas.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}