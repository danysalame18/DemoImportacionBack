const { NotasCargo, Clientes } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        NotasCargo.find()
            .populate({path: 'clientes', populate:{path: 'vendedor'}})
            .populate({path: 'clientes', populate:{path: 'areas'}})
            .populate('bancos')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        NotasCargo.findById(id)
            .populate({path: 'clientes', populate:{path: 'vendedor'}})
            .populate({path: 'clientes', populate:{path: 'areas'}})
            .populate('bancos')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneFechas: (req, res)=>{
        const { inicio, fin} = req.params
        NotasCargo.find({fecha:{$gte: inicio, $lte: fin}})
            .populate({path: 'clientes', populate:{path: 'vendedor'}})
            .populate({path: 'clientes', populate:{path: 'areas'}})
            .populate('bancos')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneCliente: (req, res)=>{
        const { cliente } = req.params
        NotasCargo.find({clientes:cliente, saldo:{$gt:0}})
            .populate({path: 'clientes', populate:{path: 'vendedor'}})
            .populate({path: 'clientes', populate:{path: 'areas'}})
            .populate('bancos')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req

        const saldoCliente = await Clientes.findByIdAndUpdate(body.clientes, {$inc:{cargos: body.importe, saldo: body.importe}}, {new:true})

        const newNotasCargo = await new NotasCargo(body)
        newNotasCargo.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        NotasCargo.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    aplicarAbono: (req, res)=>{
        const { body } = req
        NotasCargo.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    edit: async (req, res)=>{
        const { body } = req
        // NotasCargo.findByIdAndUpdate(req.params.id, body, { new: true})
        const saldoCliente = await Clientes.findByIdAndUpdate(body.clientes, {$inc:{cargos: body.importe, saldo: body.importe}}, { new: true})
        const nota = await NotasCargo.findByIdAndUpdate(req.params.id, {$inc:{importe: body.importe, saldo: body.importe}, fecha:body.fecha, observaciones:body.observaciones}, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}