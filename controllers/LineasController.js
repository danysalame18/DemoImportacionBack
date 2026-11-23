const { Lineas } = require('../models')
const { LineasService } = require('../services')

module.exports = { 
    findAll: (req, res)=>{
        Lineas.find()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Lineas.findById(id)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
       try {
        const lineasExists = await LineasService.findOneByName(body.name)
        if (lineasExists) {res.status(400).json({message: 'Esa linea ya esta registrada'}) 
        alert('Esa linea ya esta registrada')}
        else{
        const newLinea = new Lineas(body)
        const linea = await newLinea.save()
        res.status(201).json(linea)
        }
       } catch (error) {
           res.status(400).json(error)
           console.log(error)
       }
    },
    delete: (req, res)=>{
        Lineas.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Lineas.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}