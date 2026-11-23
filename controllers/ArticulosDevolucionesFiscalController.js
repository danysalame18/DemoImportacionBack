const { ArticulosDevolucionesFiscal, Inventarios } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        ArticulosDevolucionesFiscal.find()
        .populate({path: 'devolucionesFiscal', populate:{path: 'clientes'}})
        .populate({path: 'devolucionesFiscal', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        // .populate({path: 'articulos', populate:{path: 'colecciones'}})
        .populate({path: 'articulos', populate:{path: 'composiciones'}})
        .populate("tallas")
        .populate("colores")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ArticulosDevolucionesFiscal.findById(id)
        .populate({path: 'devolucionesFiscal', populate:{path: 'clientes'}})
        .populate({path: 'devolucionesFiscal', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        // .populate({path: 'articulos', populate:{path: 'colecciones'}})
        .populate({path: 'articulos', populate:{path: 'composiciones'}})
        .populate("tallas")
        .populate("colores")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findOneDevolucion: (req, res)=>{
        const { id } = req.params
        ArticulosDevolucionesFiscal.find({ devolucionesFiscal: id })
        .populate({path: 'devolucionesFiscal', populate:{path: 'clientes'}})
        .populate({path: 'devolucionesFiscal', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        // .populate({path: 'articulos', populate:{path: 'colecciones'}})
        .populate({path: 'articulos', populate:{path: 'composiciones'}})
        .populate("tallas")
        .populate("colores")
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    create: async (req, res)=>{
        const { body } = req
        try{
        

        const newArticulosDevolucionesFiscal = new ArticulosDevolucionesFiscal(body)
        const articulo = newArticulosDevolucionesFiscal.save()
        
        res.status(200).json({ message: "Se guardo la devolucion" });
          } catch (error) {
            res.status(400).json(error);
          }
    },
    delete: (req, res)=>{
        ArticulosDevolucionesFiscal.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        ArticulosDevolucionesFiscal.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}