const { TraspasosSolicitud } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        TraspasosSolicitud.find()
        .populate('areaDestino')
        .populate('areaSalida')
        .populate('user')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        TraspasosSolicitud.findById(id)
        .populate('areaDestino')
        .populate('areaSalida')
        .populate('user')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneAlmacen: (req, res)=>{
        const { almacen } = req.params
        TraspasosSolicitud.find({areaDestino:almacen, salida:"No"})
        .populate('areaDestino')
        .populate('areaSalida')
        .populate('user')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findFechas: (req, res)=>{
        const { inicio, fin } = req.params
        TraspasosSolicitud.find({fecha:{$gte: inicio, $lte: fin}})
        .populate('areaDestino')
        .populate('areaSalida')
        .populate('user')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneAlmacenes: (req, res)=>{
        const { salida, destino } = req.params
        TraspasosSolicitud.find({areaSalida:salida, areaDestino:destino, salida:"No"})
        .populate('areaDestino')
        .populate('areaSalida')
        .populate('user')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newTraspasos = new TraspasosSolicitud(body)
        const traspaso = newTraspasos.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        TraspasosSolicitud.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        TraspasosSolicitud.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}