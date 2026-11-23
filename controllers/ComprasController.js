const { Compras, ComprasAcumulados, Embarques } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        Compras.find()
        .populate('embarques')
        .populate('user')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Compras.findById(id)
        .populate('embarques')
        .populate('user')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneFechas: (req, res)=>{
        const { inicio, fin } = req.params;
        Compras.find({ fecha: { $gte: inicio, $lte: fin } })
        .populate('embarques')
        .populate('user')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req

        if(body.embarques != ""){
        let embarque = await Embarques.findByIdAndUpdate(body.embarques, {recibido:"Si"}, {new:true})
        }
        
        const newCompras = await new Compras(body)
        const compra = newCompras.save()


            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        Compras.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    editRollo: async(req, res)=>{

        const { id } = req.params
        const { body } = req
        let compra = await Compras.findById(id)

        let total_metros
        let total_kilos

        if(body.unidadEdit == "Abys"){
            total_metros =  compra.total_metros - body.cantidadAnterior + body.cantidadNuevo
            total_kilos = compra.total_kilos
        } else {
            total_kilos =  compra.total_kilos - body.cantidadAnterior + body.cantidadNuevo
            total_metros = compra.total_metros
        }

        Compras.findByIdAndUpdate(id, {total_kilos, total_metros}, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    edit: async  (req, res)=>{
        const { body } = req
        let comp = await ComprasAcumulados.updateMany({ compras: req.params.id}, { fecha: body.fecha})
        let c = await Compras.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}