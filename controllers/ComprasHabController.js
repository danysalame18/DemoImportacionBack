const { ComprasHab, ComprasAcumuladosHab, Proveedores } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        ComprasHab.find()
        .populate({path: 'ordenesCompraHab', populate:{path: 'proveedores'}})
        .populate('user')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ComprasHab.findById(id)
        .populate({path: 'ordenesCompraHab', populate:{path: 'proveedores'}})
        .populate('user')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneProveedor: (req, res)=>{
        const { proveedor } = req.params
        ComprasHab.find({proveedores:proveedor, saldo: {$gt : 0}})
        .populate({path: 'ordenesCompraHab', populate:{path: 'proveedores'}})
        .populate('user')
        .populate('proveedores')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const saldoProveedor = await Proveedores.findByIdAndUpdate(body.proveedores, {$inc:{cargos: body.total_costo, saldo: body.total_costo}}, { new: true})
        const newComprasHab = await new ComprasHab(body)
        const compra = newComprasHab.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        ComprasHab.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: async  (req, res)=>{
        const { body } = req
        let comp = await ComprasAcumuladosHab.updateMany({ comprasHab: req.params.id}, { fecha: body.fecha})
        let c = await ComprasHab.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}