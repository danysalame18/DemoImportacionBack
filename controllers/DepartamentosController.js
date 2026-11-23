const { Departamentos } = require('../models')
const { DepartamentosService } = require('../services')

module.exports = { 
    findAll: (req, res)=>{
        Departamentos.find()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Departamentos.findById(id)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
       try {
        const DepartamentosExists = await DepartamentosService.findOneByName(body.name)
        if (DepartamentosExists) {res.status(400).json({message: 'Esa area ya esta registrada'}) 
        alert('Esa area ya esta registrada')}
        else{
        const newDepartamentos = new Departamentos(body)
        const departamentos = await newDepartamentos.save()
        res.status(201).json(departamentos)
        }
       } catch (error) {
           res.status(400).json(error)
           console.log(error)
       }
    },
    delete: (req, res)=>{
        Departamentos.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Departamentos.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}