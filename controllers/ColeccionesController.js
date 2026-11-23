const { Colecciones } = require('../models')
const { ColeccionesService } = require('../services')

module.exports = { 
    findAll: (req, res)=>{
        Colecciones.find()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Colecciones.findById(id)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
       try {
        const coleccionesExists = await ColeccionesService.findOneByName(body.name)
        if (coleccionesExists) {res.status(400).json({message: 'Esa coleccion ya esta registrada'}) 
        alert('Esa coleccion ya esta registrada')}
        else{
        const newArea = new Colecciones(body)
        const coleccion = await newArea.save()
        res.status(201).json(coleccion)
        }
       } catch (error) {
           res.status(400).json(error)
           console.log(error)
       }
    },
    delete: (req, res)=>{
        Colecciones.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Colecciones.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}