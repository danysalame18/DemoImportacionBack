const { VentasAby, VentasTiendas } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        VentasAby.find()
            .populate('ventasTiendas')
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        VentasAby.findById(id)
            .populate('ventasTiendas')
        .then((respDB)=> res.status(200).json(respDB))
        .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
        const newVentasAby = new VentasAby(body)
        newVentasAby.save()
        .then( async (respDB)=>{
            
            let vt = await VentasTiendas.findByIdAndUpdate(body.ventasTiendas, {consecutivo: respDB.idVentasAby}, { new: true})
            res.status(201).json(respDB)
        })
        .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        VentasAby.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        VentasAby.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}