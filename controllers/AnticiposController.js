const { Anticipos, Clientes, Bancos, MovimientosBancos } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        Anticipos.find()
            .populate({path: 'clientes', populate:{path: 'vendedor'}})
            .populate('bancos')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Anticipos.findById(id)
            .populate({path: 'clientes', populate:{path: 'vendedor'}})
            .populate('bancos')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneCliente: (req, res)=>{
        const { cliente } = req.params
        Anticipos.find({clientes:cliente})
            .populate({path: 'clientes', populate:{path: 'vendedor'}})
            .populate('bancos')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    findOneFechas: (req, res)=>{
        const { inicio, fin} = req.params
        Anticipos.find({fecha:{$gte: inicio, $lte: fin}})
            .populate({path: 'clientes', populate:{path: 'vendedor'}})
            .populate('bancos')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req

        const saldoCliente = await Clientes.findByIdAndUpdate(body.clientes, {$inc:{abonos: body.importe, saldo: -body.importe}}, {new:true})

        const newAnticipos = new Anticipos(body)
        newAnticipos.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        Anticipos.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: async (req, res)=>{
        const { body } = req
        const saldoCliente = await Clientes.findByIdAndUpdate(body.idCliente, {$inc:{abonos: body.importe, saldo: - body.importe}}, { new: true})
   
        const ban = await Bancos.findByIdAndUpdate( body.bancos, { $inc: { abonos: body.importe } },{ new: true } );
        const mov = await MovimientosBancos.updateMany( {anticipos: req.params.id}, { $inc: { importe: body.importe } },  { new: true } );
       
        const an = await Anticipos.findByIdAndUpdate(req.params.id, {$inc:{importe: body.importe, saldo: body.importe}}, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    cancel: async (req, res)=>{
        let ant = await Anticipos.findById(req.params.id)

        let antic = Object.values(ant)

        antic.map(async(a)=>{
            await Clientes.findByIdAndUpdate(a.clientes, {$inc:{abonos: - a.importe, saldo: a.importe}}, { new: true})
           
            await Bancos.findByIdAndUpdate( a.bancos, { $inc: { abonos: -a.importe } },{ new: true } );
            await MovimientosBancos.updateMany( {anticipos: a._id}, { importe: 0, is_active: "No"},{ new: true } );
           })

        Anticipos.findByIdAndUpdate(req.params.id, {importe: 0, saldo: 0, is_active: "No", utilizado:0}, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editAplicarAbono: (req, res)=>{
        const { body } = req
        Anticipos.findByIdAndUpdate(req.params.id, {$inc:{utilizado:body.utilizado, saldo:-body.saldo}}, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}