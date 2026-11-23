const { Puestos } = require('../models')
const { PuestosService } = require('../services')

module.exports = { 
    findAll: (req, res)=>{
        Puestos.find()
            .populate('areas')
            .populate('planteles')
            .populate({path: 'colaboradores', populate:{path: 'puestos'}})
            .populate({path: 'colaboradores', populate:{path: 'planteles'}})
            .populate({path: 'colaboradores', populate:{path: 'areas'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Puestos.findById(id)
            .populate('areas')
            .populate('planteles')
            .populate({path: 'colaboradores', populate:{path: 'puestos'}})
            .populate({path: 'colaboradores', populate:{path: 'planteles'}})
            .populate({path: 'colaboradores', populate:{path: 'areas'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
       try {
        const puestosExists = await PuestosService.findOneByName(body.name)
        if (puestosExists) {res.status(400).json({message: 'Este puesto ya esta registrado'}) 
        alert('Ya esta registrado')}
        else{
        const newPuesto = new Puestos(body)
        const puesto = await newPuesto.save()
        res.status(201).json(puesto)
        }
       } catch (error) {
           res.status(400).json(error)
           console.log(error)
       }
    },
    delete: (req, res)=>{
        Puestos.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Puestos.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}