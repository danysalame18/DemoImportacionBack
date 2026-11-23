const { CuentasEmpresas } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        CuentasEmpresas.find()
            .populate('empresas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        CuentasEmpresas.findById(id)
        .populate('empresas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneEmpresa: (req, res)=>{
        const { empresa } = req.params
        CuentasEmpresas.find({empresas:empresa})
        .populate('empresas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newCuentasEmpresas = new CuentasEmpresas(body)
        const c = newCuentasEmpresas.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        CuentasEmpresas.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        CuentasEmpresas.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}