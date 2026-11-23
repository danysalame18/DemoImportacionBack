const { SaldoInicial, Clientes } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        SaldoInicial.find()
            .populate({path: 'clientes', populate:{path: 'vendedor'}})
            .populate({path: 'clientes', populate:{path: 'areas'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        SaldoInicial.findById(id)
            .populate({path: 'clientes', populate:{path: 'vendedor'}})
            .populate({path: 'clientes', populate:{path: 'areas'}})
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneFechas: (req, res)=>{
        const { inicio, fin} = req.params
        SaldoInicial.find({fecha:{$gte: inicio, $lte: fin}})
            .populate({path: 'clientes', populate:{path: 'vendedor'}})
            .populate({path: 'clientes', populate:{path: 'areas'}})
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneCliente: (req, res)=>{
        const { cliente } = req.params
        SaldoInicial.find({clientes:cliente, saldo:{$gt:0}})
            .populate({path: 'clientes', populate:{path: 'vendedor'}})
            .populate({path: 'clientes', populate:{path: 'areas'}})
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req

        const saldoCliente = await Clientes.findByIdAndUpdate(body.clientes, {$inc:{cargos: body.importe, saldo: body.importe}}, {new:true})

        const newSaldoInicial = await new SaldoInicial(body)
        newSaldoInicial.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        SaldoInicial.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    aplicarAbono: (req, res)=>{
        const { body } = req
        SaldoInicial.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    edit: async (req, res)=>{
        const { body } = req
        const saldoCliente = await Clientes.findByIdAndUpdate(body.clientes, {$inc:{cargos: body.importe, saldo: body.importe}}, { new: true})
        const nota = await SaldoInicial.findByIdAndUpdate(req.params.id, {$inc:{importe: body.importe, saldo: body.importe}, fecha:body.fecha, observaciones:body.observaciones}, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}