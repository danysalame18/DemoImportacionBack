const { Proveedores } = require('../models')
const { ProveedoresService } = require('../services')

module.exports = { 
    findAll: (req, res)=>{
        Proveedores.find()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Proveedores.findById(id)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findTipo: (req, res)=>{
        const { tipo } = req.params
        Proveedores.find({tipo:tipo})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
       try {
        const proveedoresExists = await ProveedoresService.findOneByRFC(body.RFC)
        if (proveedoresExists) res.status(400).json({message: 'RFC Already Registred'})
        else{
        const newProveedor = new Proveedores(body)
        const proveedor = await newProveedor.save()
        res.status(201).json(proveedor)
        }
       } catch (error) {
           res.status(400).json(error)
       }
    },
    edit: (req, res)=>{
        const { body } = req
        Proveedores.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    delete: (req, res)=>{
        Proveedores.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    }
 }