const { ArticulosProporcion } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        ArticulosProporcion.find()
        .populate("articulos")
        .populate("colores")
        .populate("tallas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ArticulosProporcion.findById(id)
        .populate("articulos")
        .populate("colores")
        .populate("tallas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneArticulo: (req, res)=>{
        const { articulo } = req.params
        ArticulosProporcion.find({articulos: articulo})
        // .populate("articulos")
        .populate("colores")
        .populate("tallas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newArticulosProporcion = new ArticulosProporcion(body)
        const color = newArticulosProporcion.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        ArticulosProporcion.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        ArticulosProporcion.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    eliminarColor: async (req, res)=>{
        const { id } = req.params
        let prop = await ArticulosProporcion.findById(id)

        let articulo = prop.articulos
        let color = prop.colores

        let a = await ArticulosProporcion.deleteMany({articulos: articulo, colores: color})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
        
    }
}