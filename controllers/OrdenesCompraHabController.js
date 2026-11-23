const { OrdenesCompraHab, ComprasAcumuladosHab } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        OrdenesCompraHab.find()
        .populate('proveedores')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        OrdenesCompraHab.findById(id)
        .populate('proveedores')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newOrdenesCompraHab = new OrdenesCompraHab(body)
        const orden = newOrdenesCompraHab.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        OrdenesCompraHab.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: async (req, res)=>{
        const { body } = req
        let comp = await ComprasAcumuladosHab.updateMany({ ordenesCompraHab: req.params.id}, { proveedores: body.proveedores})
        let ord = await OrdenesCompraHab.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}