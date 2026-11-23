const { ProcesosEntrada, Proveedores } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        ProcesosEntrada.find()
        .populate('proveedores')
        .populate('pedidos')
        .populate({path: 'procesosSalida', populate:{path: 'articulos'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ProcesosEntrada.findById(id)
        .populate('proveedores')
        .populate('pedidos')
        .populate({path: 'procesosSalida', populate:{path: 'articulos'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const saldoProveedor = await Proveedores.findByIdAndUpdate(body.proveedores, {$inc:{cargos: body.totalGeneral, saldo: body.totalGeneral}}, { new: true})
       
        const newProcesos = new ProcesosEntrada(body)
        const color = newProcesos.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        ProcesosEntrada.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        ProcesosEntrada.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}