const { ConceptosGastosEmbarques } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        ConceptosGastosEmbarques.find()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ConceptosGastosEmbarques.findById(id)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findAllFijos: (req, res)=>{
        ConceptosGastosEmbarques.find({fijo:"Si"})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newConceptosGastosEmbarques = new ConceptosGastosEmbarques(body)
        const color = newConceptosGastosEmbarques.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        ConceptosGastosEmbarques.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        ConceptosGastosEmbarques.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}