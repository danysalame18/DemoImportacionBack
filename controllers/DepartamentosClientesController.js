const { DepartamentosClientes } = require('../models')
const { DepartamentosClientesService } = require('../services')

module.exports = { 
    findAll: (req, res)=>{
        DepartamentosClientes.find()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        DepartamentosClientes.findById(id)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
       try {
        const DepartamentosClientesExists = await DepartamentosClientesService.findOneByName(body.name)
        if (DepartamentosClientesExists) {res.status(400).json({message: 'Esa area ya esta registrada'}) 
        alert('Esa area ya esta registrada')}
        else{
        const newDepartamentosClientes = new DepartamentosClientes(body)
        const departamentosClientes = await newDepartamentosClientes.save()
        res.status(201).json(departamentosClientes)
        }
       } catch (error) {
           res.status(400).json(error)
           console.log(error)
       }
    },
    delete: (req, res)=>{
        DepartamentosClientes.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        DepartamentosClientes.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}