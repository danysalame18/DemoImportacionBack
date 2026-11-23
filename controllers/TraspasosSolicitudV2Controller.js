const { TraspasosSolicitudV2 } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        TraspasosSolicitudV2.find()
        .populate('areaDestino')
        .populate('areaSalida')
        .populate('autorizoSurtido')
        .populate('autorizoApartado')
        .populate('editPedido')
        .populate('editArticulos')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        TraspasosSolicitudV2.findById(id)
        .populate('areaDestino')
        .populate('areaSalida')
        .populate('autorizoSurtido')
        .populate('autorizoApartado')
        .populate('editPedido')
        .populate('editArticulos')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneTraspasosSolicitudV2Fechas: (req, res)=>{
        const { inicio, fin } = req.params
        TraspasosSolicitudV2.find({fecha:{$gte: inicio, $lte: fin}})
        .populate('areaDestino')
        .populate('areaSalida')
        .populate('autorizoSurtido')
        .populate('autorizoApartado')
        .populate('editPedido')
        .populate('editArticulos')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findPendienteSurtir: (req, res)=>{
        TraspasosSolicitudV2.find({is_active:"Si", autorizadoSurtido:"Si", status:"Abierto"})
        .populate('areaDestino')
        .populate('areaSalida')
        .populate('autorizoSurtido')
        .populate('autorizoApartado')
        .populate('editPedido')
        .populate('editArticulos')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newTraspasosSolicitudV2 = new TraspasosSolicitudV2(body)
        const pedido = newTraspasosSolicitudV2.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        TraspasosSolicitudV2.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: async (req, res)=>{
        const { body } = req
        let ped = await TraspasosSolicitudV2.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}