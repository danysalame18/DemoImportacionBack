const { ArticulosDevolucionesProveedores, Inventarios } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        ArticulosDevolucionesProveedores.find()
        .populate({path: 'devolucionesProveedores', populate:{path: 'clientes'}})
        .populate({path: 'devolucionesProveedores', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ArticulosDevolucionesProveedores.findById(id)
        .populate({path: 'devolucionesProveedores', populate:{path: 'clientes'}})
        .populate({path: 'devolucionesProveedores', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findOneDevolucion: (req, res)=>{
        const { id } = req.params
        ArticulosDevolucionesProveedores.find({ devolucionesProveedores: id })
        .populate({path: 'devolucionesProveedores', populate:{path: 'clientes'}})
        .populate({path: 'devolucionesProveedores', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    create: async (req, res)=>{
        const { body } = req
        try{
          
            let surt = await Inventarios.findOneAndUpdate( {areas: [body.areas], articulos: [body.articulos]} ,
                { $inc: { cantidad: - body.cantidad }, is_active: "Si"}, { new: true, upsert: true }  );

            // let surt2 = await Inventarios.findOneAndUpdate( {areas: [body.areas], articulos: [process.env.REACT_APP_ARTICULO_DEFECTO]} ,
            //     { $inc: { cantidad: body.defectos } }, { new: true, upsert: true }  );

        const newArticulosDevolucionesProveedores = new ArticulosDevolucionesProveedores(body)
        const articulo = newArticulosDevolucionesProveedores.save()
        
        res.status(200).json({ message: "Se guardo la devolucion" });
          } catch (error) {
            res.status(400).json(error);
          }
    },
    delete: (req, res)=>{
        ArticulosDevolucionesProveedores.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        ArticulosDevolucionesProveedores.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}