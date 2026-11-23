const { ControlCalidad, ArticulosEmbarques } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        ControlCalidad.find()
            .populate('proveedores')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ControlCalidad.findById(id)
            .populate('proveedores')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneProveedor: (req, res)=>{
        const { proveedor } = req.params
        ControlCalidad.find({proveedores:proveedor})
            .populate('proveedores')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneFechas: (req, res)=>{
        const { inicio, fin } = req.params
        ControlCalidad.find({fecha:{$gte: inicio, $lte: fin}})
            .populate('proveedores')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req

        const newControlCalidad = new ControlCalidad(body)
        newControlCalidad.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        ControlCalidad.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        ControlCalidad.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    cancel: async (req, res) => {
    
        const art = await ArticulosEmbarques.updateMany( {controlCalidad: req.params.id}, {calidad: "No"} , { new: true } )

        const cc = await ControlCalidad.findByIdAndUpdate( req.params.id, {is_active: "No"} , { new: true } )
          .then((resDB) => res.status(201).json(resDB))
          .catch((err) => res.status(400).json(err));
      },
}