const { Logs } = require('../models')
const moment = require('moment')

module.exports = { 
    findAll: (req, res)=>{

    let hoy = new Date()
    let inicio = new Date();
    inicio.setDate(inicio.getDate()-30);

    let startDate = moment(inicio).utcOffset('+0600').format("YYYY-MM-DDTHH:mm:ss.SSSZ"); 
    let endDate   = moment(hoy).utcOffset('+0600').format("YYYY-MM-DDTHH:mm:ss.SSSZ"); 

    Logs.find({createdAt:{$gte:  new Date(startDate).toISOString(),
    $lt:  new Date(endDate).toISOString()}})
            .populate('user')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Logs.findById(id)
            .populate('user')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newLogs = new Logs(body)
        const log = newLogs.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        Logs.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Logs.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}