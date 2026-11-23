const { ComprasAcumuladosHab } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        ComprasAcumuladosHab.find()
        .populate("comprasHab")
        .populate({path: 'ordenesCompraHab', populate:{path: 'proveedores'}})
        .populate("habOC")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ComprasAcumuladosHab.findById(id)
        .populate("comprasHab")
        .populate({path: 'ordenesCompraHab', populate:{path: 'proveedores'}})
        .populate("habOC")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findOneCompra: (req, res)=>{
        const { id } = req.params
        ComprasAcumuladosHab.find({ comprasHab: id })
        .populate("comprasHab")
        .populate("insumos")
        .populate({path: 'ordenesCompraHab', populate:{path: 'proveedores'}})
        .populate("habOC")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    }, 
    findOneOrden: (req, res)=>{
        const { id } = req.params
        ComprasAcumuladosHab.find({ ordenesCompraHab: id })
        .populate("comprasHab")
        .populate({path: 'ordenesCompraHab', populate:{path: 'proveedores'}})
        .populate("habOC")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findOneInventarioTelas: (req, res)=>{
        const { id } = req.params
        ComprasAcumuladosHab.find({ inventariosHab: id })
        .populate("comprasHab")
        .populate({path: 'ordenesCompraHab', populate:{path: 'proveedores'}})
        .populate("habOC")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newComprasAcumuladosHab = new ComprasAcumuladosHab(body)
        const dev = newComprasAcumuladosHab.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        ComprasAcumuladosHab.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        ComprasAcumuladosHab.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}