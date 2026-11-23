const { TelefonosWhatsApp } = require('../models')
const { TelefonosWhatsAppService } = require('../services')

module.exports = { 
    findAll: (req, res)=>{
        TelefonosWhatsApp.find()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        TelefonosWhatsApp.findById(id)
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
       try {
        const TelefonosWhatsAppExists = await TelefonosWhatsAppService.findOneByTelefono(body.telefono)
        if (TelefonosWhatsAppExists) {res.status(400).json({message: 'El Telefono ya esta registrado'}) 
        }
        else{
        const newTel = new TelefonosWhatsApp(body)
        const tel = await newTel.save()
        res.status(201).json(tel)
        }
       } catch (error) {
           res.status(400).json(error)
           console.log(error)
       }
    },
    delete: (req, res)=>{
        TelefonosWhatsApp.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        TelefonosWhatsApp.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}