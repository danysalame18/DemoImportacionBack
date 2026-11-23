const { NotasCxP, ComprasAcumulados, Proveedores } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        NotasCxP.find()
        .populate('proveedores')
        .populate('embarques')
        .populate("compras")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        NotasCxP.findById(id)
        .populate('proveedores')
        .populate('embarques')
        .populate("compras")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneProveedor: (req, res)=>{
        const { proveedor } = req.params
        NotasCxP.find({proveedores:proveedor})
        .populate('proveedores')
        .populate('embarques')
        .populate("compras")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const saldoProveedor = await Proveedores.findByIdAndUpdate(body.proveedores, {$inc:{cargos: body.total_costo, saldo: body.total_costo}}, { new: true})
        const newNotasCxP = await new NotasCxP(body)
        newNotasCxP.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        NotasCxP.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        NotasCxP.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editEmbarque: async(req, res)=>{
        const { body } = req
        let saldoProveedor = await Proveedores.findByIdAndUpdate(body.proveedores, {$inc:{cargos: body.difSaldo, saldo: body.difSaldo}}, { new: true})
        NotasCxP.findByIdAndUpdate(req.params.id, {total_cantidad: body.total_cantidad, total_costo: body.total_costo, saldo:body.saldo}, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}