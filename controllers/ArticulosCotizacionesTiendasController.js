const { ArticulosCotizacionesTiendas, Inventarios, Surtidos } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        ArticulosCotizacionesTiendas.find()
        .populate({path: 'cotizacionesTiendas', populate:{path: 'clientes'}})
        .populate({path: 'cotizacionesTiendas', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'marcas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ArticulosCotizacionesTiendas.findById(id)
        .populate({path: 'cotizacionesTiendas', populate:{path: 'clientes'}})
        .populate({path: 'cotizacionesTiendas', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'marcas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    }, 
    findOneNota: (req, res)=>{
        const { id } = req.params
        ArticulosCotizacionesTiendas.find({cotizacionesTiendas:id})
        .populate({path: 'cotizacionesTiendas', populate:{path: 'clientes'}})
        .populate({path: 'cotizacionesTiendas', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'marcas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },  
    findOneCotizacionesTiendas: (req, res)=>{
        const { id } = req.params
        ArticulosCotizacionesTiendas.find({ cotizacionesTiendas: id })
        .populate({path: 'cotizacionesTiendas', populate:{path: 'clientes'}})
        .populate({path: 'cotizacionesTiendas', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'marcas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findOnePedidoSurtir: async (req, res)=>{
        const { id, area } = req.params
        try{
        let AP = await ArticulosCotizacionesTiendas.find({ cotizacionesTiendas: id })
        .populate({path: 'cotizacionesTiendas', populate:{path: 'clientes'}})
        .populate({path: 'cotizacionesTiendas', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'marcas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})

            let ids = await AP.map((a) => (a.articulos[0]._id))
            

            let AI = await  Inventarios.find({
                    // "cantidad": {$gt:0},
                     "articulos" : { $in: ids}, areas: area })
              .populate('compras')
              
              .populate('areas')
              .populate({path: 'articulos', populate:{path: 'familias'}})
              .populate({path: 'articulos', populate:{path: 'lineas'}})
              .populate({path: 'articulos', populate:{path: 'marcas'}})
              .populate({path: 'articulos', populate:{path: 'colecciones'}})

              res.status(200).json({AP, AI})
            } catch (error) {
               res.status(400).json(error)
           }
    },
    findOnePedidoDevolucion: async (req, res)=>{
        const { id } = req.params
        let s = await Surtidos.findById(id)
        let p = s.pedidos
        ArticulosCotizacionesTiendas.find({ cotizacionesTiendas: p })
        .populate({path: 'cotizacionesTiendas', populate:{path: 'clientes'}})
        .populate({path: 'cotizacionesTiendas', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'marcas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findDisponible: (req, res)=>{
        ArticulosCotizacionesTiendas.find({ is_active: "Si" })
        .populate({path: 'cotizacionesTiendas', populate:{path: 'clientes'}})
        .populate({path: 'cotizacionesTiendas', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'marcas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findOnePrecio: async (req, res)=>{
        const { surtido, articulo } = req.params
        try{
            let sur = await Surtidos.findById(surtido)
            .populate({path: 'cotizacionesTiendas', populate:{path: 'clientes'}})
    
            let pedido = sur.pedidos[0]._id
    
            let AP = await ArticulosCotizacionesTiendas.find({ cotizacionesTiendas: pedido, articulos: articulo })
            .populate({path: 'cotizacionesTiendas', populate:{path: 'clientes'}})
            .populate({path: 'cotizacionesTiendas', populate:{path: 'colaboradores'}})
            .populate({path: 'articulos', populate:{path: 'familias'}})
            .populate({path: 'articulos', populate:{path: 'lineas'}})
            .populate({path: 'articulos', populate:{path: 'marcas'}})
            .populate({path: 'articulos', populate:{path: 'colecciones'}})

            res.status(200).json(AP)
            } catch (error) {
               res.status(400).json(error)
           }
    },   
    findOneSurtido: async (req, res)=>{
        const { id } = req.params
        try{
        let AP = await ArticulosCotizacionesTiendas.find({ cotizacionesTiendas: id, is_active:"Si" })
        .populate({path: 'cotizacionesTiendas', populate:{path: 'clientes'}})
        .populate({path: 'cotizacionesTiendas', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'marcas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})

            let ids = await AP.map((a) => (a.articulos[0]._id))
            let idC = await AP.map((a) => ({"articulo": a.articulos[0]._id}))
            
            let idDany = await AP.map((a) =>{
                return  a.articulos[0]._id 
            })

            let AI = await  Inventarios.find({
                    vendido: "No", "articulos" : { $in: ids}
                    })
              .populate('compras')
              
              .populate({path: 'articulos', populate:{path: 'familias'}})
              .populate({path: 'articulos', populate:{path: 'lineas'}})
              .populate({path: 'articulos', populate:{path: 'marcas'}})
              .populate({path: 'articulos', populate:{path: 'colecciones'}})

              let idDany2 = await AI.map((a) =>{
                  return {"comparar": a.articulos[0]._id,
                          "_id":a._id,
                          "is_active":a.is_active,
                           "articulo": a.articulos[0].codigo + " / " + a.articulos[0].nombre,
                           "idArticulo": a.articulos[0]._id,
                           "unidadArticulo": a.articulos[0].unidad,
                           "cantidad": a.cantidad,
                           "tono": a.tono,
                        }
              })


              let otra2 = idDany2.map((w)=>{
                  if(idDany.includes(w.comparar)){
                  return w}
              })
              .filter(function (el) {
                return el != null;
              })


              res.status(200).json(otra2)
            } catch (error) {
               res.status(400).json(error)
           }
      
    },
    create: async (req, res)=>{
        const { body } = req
        try{

        const newArticulosCotizacionesTiendas = new ArticulosCotizacionesTiendas(body)
        const articulo = newArticulosCotizacionesTiendas.save()
        
        res.status(200).json({ message: "Se guardo la cotizacion" });
          } catch (error) {
            res.status(400).json(error);
          }
    },
    delete: (req, res)=>{
        ArticulosCotizacionesTiendas.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        ArticulosCotizacionesTiendas.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editBaja: (req, res)=>{
        const { body } = req
        ArticulosCotizacionesTiendas.updateMany({ cotizacionesTiendas: req.params.id}, {is_active:body.is_active})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}