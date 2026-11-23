const { HabOC, DetalleSolicitudInsumosPedidos } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        HabOC.find()
        .populate({path: 'ordenesCompraHab', populate:{path: 'proveedores'}})
        .populate('insumos')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        HabOC.findById(id)
        .populate('ordenesCompraHab')
        .populate('insumos')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findOneOrden: (req, res)=>{
        const { id } = req.params
        HabOC.find({ ordenesCompraHab: id })
        .populate('ordenesCompraHab')
        .populate('insumos')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req

        let sol = await DetalleSolicitudInsumosPedidos.findByIdAndUpdate(body.detalleSolicitudInsumosPedidos,  { $inc: { pedido: body.cantidad, pendientePedir: -body.cantidad } }, { new: true } );
        const newHabOC = new HabOC(body)
        const telas = newHabOC.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        HabOC.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        HabOC.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editRecibido: async (req, res)=>{
        const { id } = req.params
        const { body } = req
        let AC = await HabOC.findById(id)
        let recibido = AC.recibido + body.cantidad
        let pendiente_recibir = AC.pendiente_recibir -body.cantidad

        HabOC.findByIdAndUpdate(id, {recibido:recibido, pendiente_recibir: pendiente_recibir}, { new: true})

        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editBaja: (req, res)=>{
        const { body } = req
        HabOC.updateMany({ ordenesCompraHab: req.params.id}, { is_active: body.is_active})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}