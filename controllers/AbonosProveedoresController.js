const { AbonosProveedores, Proveedores, NotasCxP, Bancos, MovimientosBancos} = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        AbonosProveedores.find()
            .populate('bancos')
            .populate('proveedores')
            .populate({path: 'notasCxP', populate:{path: 'embarques', populate:{path: 'ordenesCompra'}}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        AbonosProveedores.findById(id)
            .populate('bancos')
            .populate('proveedores')
            .populate({path: 'notasCxP', populate:{path: 'embarques', populate:{path: 'ordenesCompra'}}})
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneProveedor: (req, res)=>{
        const { proveedor } = req.params
        AbonosProveedores.find({proveedores:proveedor})
            .populate('bancos')
            .populate('proveedores')
            .populate({path: 'notasCxP', populate:{path: 'embarques', populate:{path: 'ordenesCompra'}}})
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneFechas: (req, res)=>{
        const { inicio, fin } = req.params
        AbonosProveedores.find({fecha:{$gte: inicio, $lte: fin}})
            .populate('bancos')
            .populate('proveedores')
            .populate({path: 'notasCxP', populate:{path: 'embarques', populate:{path: 'ordenesCompra'}}})
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req

        const saldoProveedor = await Proveedores.findByIdAndUpdate(body.proveedores, {$inc:{abonos: body.importe, saldo: -body.importe}}, {new:true})

        const newAbonosProveedores = new AbonosProveedores(body)
        newAbonosProveedores.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        AbonosProveedores.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: async (req, res)=>{
        const { body } = req
        const saldoProveedor = await Proveedores.findByIdAndUpdate(body.proveedores, {$inc:{abonos: body.importe, saldo: - body.importe}}, { new: true})
        // const saldoEmbarque = await NotasCxP.findByIdAndUpdate(body.notasCxP, {$inc:{saldo: - body.importe}}, { new: true})
        
            if(body.bancos){
                const ban = await Bancos.findByIdAndUpdate( body.bancos, { $inc: { cargos: body.importe } },{ new: true } );
                const mov = await MovimientosBancos.updateMany( {abonosProveedores: req.params.id}, { $inc: { importe: -body.importe } },  { new: true } );            
            }

        const abono = await AbonosProveedores.findByIdAndUpdate(req.params.id, {$inc:{importe: body.importe}, tipoCambio: body.tipoCambio}, { new: true})
        
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}