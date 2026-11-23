const { ArticulosDevolucionesTiendas, Inventarios, Surtidos } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        ArticulosDevolucionesTiendas.find()
        .populate({path: 'devolucionesTiendas', populate:{path: 'clientes'}})
        .populate({path: 'devolucionesTiendas', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ArticulosDevolucionesTiendas.findById(id)
        .populate({path: 'devolucionesTiendas', populate:{path: 'clientes'}})
        .populate({path: 'devolucionesTiendas', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findOneDevolucionesTiendas: (req, res)=>{
        const { id } = req.params
        ArticulosDevolucionesTiendas.find({ devolucionesTiendas: id })
        .populate({path: 'devolucionesTiendas', populate:{path: 'clientes'}})
        .populate({path: 'devolucionesTiendas', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    }, 
    create: async (req, res)=>{
        const { body } = req
        try{

          
            let surt = await Inventarios.findOneAndUpdate( {areas: [body.areas], articulos: [body.articulos]},
                { $inc: { cantidad: body.cantidad } }, { new: true } );

        const newArticulosDevolucionesTiendas = new ArticulosDevolucionesTiendas(body)
        const articulo = newArticulosDevolucionesTiendas.save()
        
        res.status(200).json({ message: "Se guardo la devolucion" });
          } catch (error) {
            res.status(400).json(error);
          }
    },
    delete: (req, res)=>{
        ArticulosDevolucionesTiendas.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        ArticulosDevolucionesTiendas.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
}