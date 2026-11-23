const { AbonosFacturas, Clientes, Facturas, NotasCargo } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        AbonosFacturas.find()
            .populate('bancos')
            .populate({path: 'clientes', populate:{path: 'contacto'}})
            .populate('facturas')
            .populate('notasCargo')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        AbonosFacturas.findById(id)
            .populate('bancos')
            .populate({path: 'clientes', populate:{path: 'contacto'}})
            .populate('facturas')
            .populate('notasCargo')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneCliente: (req, res)=>{
        const { cliente } = req.params
        AbonosFacturas.find({clientes:cliente})
            .populate('bancos')
            .populate({path: 'clientes', populate:{path: 'contacto'}})
            .populate('facturas')
            .populate('notasCargo')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneColaborador: (req, res)=>{
        const { colaborador } = req.params
        AbonosFacturas.find({colaboradores:colaborador, concepto:{$nin:["Devolucion", "Bonificacion"]}, comisionPagada:"No",  is_active:"Si"})
            .populate({path: 'clientes', populate:{path: 'contacto'}})
            .populate('facturas')
            .populate('notasCargo')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneFechas: (req, res)=>{
        const { inicio, fin } = req.params
        AbonosFacturas.find({fecha:{$gte: inicio, $lte: fin}})
            .populate('bancos')
            .populate({path: 'clientes', populate:{path: 'contacto'}})
            .populate('facturas')
            .populate('notasCargo')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req

        const saldoCliente = await Clientes.findByIdAndUpdate(body.clientes, {$inc:{abonosk: body.importe, saldok: -body.importe}}, {new:true})

        const newAbonosFacturas = await new AbonosFacturas(body)
        newAbonosFacturas.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    createAplicarAnticipo: async (req, res)=>{
        const { body } = req

        const newAbonosFacturas = await new AbonosFacturas(body)
        newAbonosFacturas.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        AbonosFacturas.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    cancel: async (req, res)=>{
        let abns = await AbonosFacturas.findById(req.params.id)

        let abnsArray = Object.values(abns)

        abnsArray.map(async(a)=>{
            await Clientes.findByIdAndUpdate(a.clientes, {$inc:{abonosk: - a.importe, saldok: a.importe}}, { new: true})
            await Facturas.findByIdAndUpdate(a.facturas, {$inc:{saldok: a.importe}}, { new: true})
            await NotasCargo.findByIdAndUpdate(a.notasCargo, {$inc:{saldok: a.importe}}, { new: true})
        })

        const abs = await AbonosFacturas.findByIdAndUpdate(req.params.id, {importe: 0, is_active: "No"}, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    edit: async (req, res)=>{
        const { body } = req
        const saldoCliente = await Clientes.findByIdAndUpdate(body.idCliente, {$inc:{abonos: body.importe, saldo: - body.importe}}, { new: true})
        const saldoFactura = await Facturas.findByIdAndUpdate(body.notaEdit, {$inc:{saldo: - body.importe}}, { new: true})
        const saldoNotasCargo = await NotasCargo.findByIdAndUpdate(body.notaEdit, {$inc:{saldo: - body.importe}}, { new: true})
        
        const abn = await AbonosFacturas.findByIdAndUpdate(req.params.id, {$inc:{importe: body.importe}, fecha: body.fecha, editado:body.editado}, { new: true})
        
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },

    
}