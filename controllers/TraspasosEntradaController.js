const { TraspasosEntrada, TraspasosSalida } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        TraspasosEntrada.find()
            .populate({ path: "traspasosSalida", populate: { path: "areaDestino" } })
            .populate({ path: "traspasosSalida", populate: { path: "areaSalida" } })
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        TraspasosEntrada.findById(id)
            .populate({ path: "traspasosSalida", populate: { path: "areaDestino" } })
            .populate({ path: "traspasosSalida", populate: { path: "areaSalida" } })
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findFechas: (req, res)=>{
        const { inicio, fin } = req.params
        TraspasosEntrada.find({fecha:{$gte: inicio, $lte: fin}})
        .populate({ path: "traspasosSalida", populate: { path: "areaDestino" } })
        .populate({ path: "traspasosSalida", populate: { path: "areaSalida" } })
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
console.log(body)
        const te = await TraspasosSalida.findByIdAndUpdate(
            body.traspasosSalida,
            { recibida: "Si" },
            { new: true }
          );

        const newPedidos = new TraspasosEntrada(body)
        const pedido = newPedidos.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        TraspasosEntrada.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        TraspasosEntrada.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}