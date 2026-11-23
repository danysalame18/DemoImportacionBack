const { VentasBeny, VentasTiendas } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        VentasBeny.find()
            .populate('ventasTiendas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        VentasBeny.findById(id)
            .populate('ventasTiendas')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const newVentasBeny = new VentasBeny(body)
        newVentasBeny.save()
            .then(async (respDB)=>{
            
                let vt = await VentasTiendas.findByIdAndUpdate(body.ventasTiendas, {consecutivo: respDB.idVentasBeny}, { new: true})
                res.status(201).json(respDB)
            })
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        VentasBeny.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        VentasBeny.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}