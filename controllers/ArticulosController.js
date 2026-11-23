const { Articulos } = require('../models')
const { ArticulosService } = require('../services')

module.exports = { 
    // Version ligera para llenar selects: solo los campos que necesita un
    // <option> y sin populates. El findAll completo devuelve ~12 MB y tarda
    // ~11 s, lo que hacia que las vistas con selector de articulo parecieran
    // no cargar.
    findAllSelect: (req, res)=>{
        Articulos.find({}, "codigo nombre is_active")
            .sort({ codigo: 1 })
            .lean()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> res.status(400).json(err))
    },
    findAll: (req, res)=>{
        Articulos.find()
        .populate("lineas")
        .populate("marcas")
        .populate("familias")
        .populate("colecciones")
        .populate("composiciones")
        .populate("proveedores")
        .populate("colores")
        .populate("tallas")
        .populate("empresas")
            .lean()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findAllActivos: (req, res)=>{
        Articulos.find({is_active: 'Si'})
        .populate("lineas")
        .populate("marcas")
        .populate("familias")
        .populate("colecciones")
        .populate("composiciones")
        .populate("proveedores")
        .populate("colores")
        .populate("tallas")
        .populate("empresas")
            .lean()
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        Articulos.findById(id)
        .populate("lineas")
        .populate("marcas")
        .populate("familias")
        .populate("colecciones")
        .populate("composiciones")
        .populate("proveedores")
        .populate("colores")
        .populate("tallas")
        .populate("empresas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findVendedores: (req, res)=>{
        const { vendedores } = req.params
        Articulos.find({vendedores: vendedores})
        .populate("lineas")
        .populate("marcas")
        .populate("familias")
        .populate("colecciones")
        .populate("composiciones")
        .populate("proveedores")
        .populate("colores")
        .populate("tallas")
        .populate("empresas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findProveedor: (req, res)=>{
        const { proveedor } = req.params
        Articulos.find({proveedores: proveedor})
        .populate("lineas")
        .populate("marcas")
        .populate("familias")
        .populate("colecciones")
        .populate("composiciones")
        .populate("proveedores")
        .populate("colores")
        .populate("tallas")
        .populate("empresas")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: async (req, res)=>{
        const { body } = req
       try {
        const articulosExists = await ArticulosService.findOneByName(body.name)
        if (articulosExists) {res.status(400).json({message: 'Este articulo ya esta registrado'})}
        else{
        const newArticulos = new Articulos(body)
        const articulos = await newArticulos.save()
        res.status(201).json(articulos)
        }
       } catch (error) {
           res.status(400).json(error)
           console.log(error)
       }
    },
    delete: (req, res)=>{
        Articulos.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        Articulos.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}