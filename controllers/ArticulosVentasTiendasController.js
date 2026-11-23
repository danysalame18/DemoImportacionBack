const { ArticulosVentasTiendas, Inventarios, Surtidos } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        ArticulosVentasTiendas.find()
        .populate({path: 'ventasTiendas', populate:{path: 'clientes'}})
        .populate({path: 'ventasTiendas', populate:{path: 'areas'}})
        .populate({path: 'ventasTiendas', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'marcas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ArticulosVentasTiendas.findById(id)
        .populate({path: 'ventasTiendas', populate:{path: 'clientes'}})
        .populate({path: 'ventasTiendas', populate:{path: 'areas'}})
        .populate({path: 'ventasTiendas', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'marcas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    }, 
    findOneNota: (req, res)=>{
        const { id } = req.params
        ArticulosVentasTiendas.find({ventasTiendas:id})
        .populate({path: 'ventasTiendas', populate:{path: 'clientes'}})
        .populate({path: 'ventasTiendas', populate:{path: 'areas'}})
        .populate({path: 'ventasTiendas', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'marcas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },  
    findOneVentasTiendas: (req, res)=>{
        const { id } = req.params
        ArticulosVentasTiendas.find({ ventasTiendas: id })
        .populate({path: 'ventasTiendas', populate:{path: 'clientes'}})
        .populate({path: 'ventasTiendas', populate:{path: 'areas'}})
        .populate({path: 'ventasTiendas', populate:{path: 'colaboradores'}})
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
        let AP = await ArticulosVentasTiendas.find({ ventasTiendas: id })
        .populate({path: 'ventasTiendas', populate:{path: 'clientes'}})
        .populate({path: 'ventasTiendas', populate:{path: 'areas'}})
        .populate({path: 'ventasTiendas', populate:{path: 'colaboradores'}})
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
        ArticulosVentasTiendas.find({ ventasTiendas: p })
        .populate({path: 'ventasTiendas', populate:{path: 'clientes'}})
        .populate({path: 'ventasTiendas', populate:{path: 'areas'}})
        .populate({path: 'ventasTiendas', populate:{path: 'colaboradores'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'marcas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findDisponible: (req, res)=>{
        ArticulosVentasTiendas.find({ is_active: "Si" })
        .populate({path: 'ventasTiendas', populate:{path: 'clientes'}})
        .populate({path: 'ventasTiendas', populate:{path: 'areas'}})
        .populate({path: 'ventasTiendas', populate:{path: 'colaboradores'}})
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
            .populate({path: 'ventasTiendas', populate:{path: 'clientes'}})
            .populate({path: 'ventasTiendas', populate:{path: 'areas'}})
    
            let pedido = sur.pedidos[0]._id
    
            let AP = await ArticulosVentasTiendas.find({ ventasTiendas: pedido, articulos: articulo })
            .populate({path: 'ventasTiendas', populate:{path: 'clientes'}})
            .populate({path: 'ventasTiendas', populate:{path: 'areas'}})
            .populate({path: 'ventasTiendas', populate:{path: 'colaboradores'}})
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
        let AP = await ArticulosVentasTiendas.find({ ventasTiendas: id, is_active:"Si" })
        .populate({path: 'ventasTiendas', populate:{path: 'clientes'}})
        .populate({path: 'ventasTiendas', populate:{path: 'areas'}})
        .populate({path: 'ventasTiendas', populate:{path: 'colaboradores'}})
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
          
            let surt = await Inventarios.findByIdAndUpdate( body.idInventario,
                { $inc: { cantidad: -body.cantidad }}, { new: true } );

        const newArticulosVentasTiendas = new ArticulosVentasTiendas(body)
        const articulo = newArticulosVentasTiendas.save()
        
        res.status(200).json({ message: "Se guardo la venta" });
          } catch (error) {
            res.status(400).json(error);
          }
    },
    delete: (req, res)=>{
        ArticulosVentasTiendas.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        ArticulosVentasTiendas.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editBaja: (req, res)=>{
        const { body } = req
        ArticulosVentasTiendas.updateMany({ ventasTiendas: req.params.id}, {is_active:body.is_active})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
      analisis: async (req, res) => {
    const { area, fecha } = req.params;

    try {
      let a = await ArticulosVentasTiendas.find({ fecha: fecha }).populate({
        path: "ventasTiendas",
        populate: { path: "areas" },
      });

      let b = a
        .map((a) => {
          if (
            a.ventasTiendas[0].areas[0]._id == area &&
            a.ventasTiendas[0].is_active == "Si"
          ) {
            return {
              id: a.ventasTiendas[0]._id,
              fecha: a.ventasTiendas[0].fecha,
              cantidad: a.cantidad,
              total: 0,
              numero:
                a.ventasTiendas[0].prefijo + a.ventasTiendas[0].consecutivo,
              ventaActiva: a.ventasTiendas[0].is_active,
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });

      let c = await VentasTiendas.find({
        fecha: fecha,
        areas: area,
        is_active: "Si",
      });

      let d = c
        .map((a) => {
          return {
            id: a._id,
            fecha: a.fecha,
            total: a.total_cantidad,
            cantidad: 0,
            numero: a.prefijo + a.consecutivo,
            ventaActiva: a.is_active,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let e = b.concat(d);

      let agrupado = e.reduce(function (groups, item) {
        const val = item["id"];
        groups[val] = groups[val] || {
          id: item.id,
          cantidad: 0,
          total: 0,
        };
        groups[val].id = item.id;
        groups[val].fecha = item.fecha;
        groups[val].total += item.total;
        groups[val].numero = item.numero;
        groups[val].cantidad += item.cantidad;
        groups[val].ventaActiva = item.ventaActiva;
        return groups;
      }, []);

      let otra3 = Object.values(agrupado);

      let otra4 = otra3.map((a) => {
        return {
          id: a.id,
          fecha: a.fecha,
          total: a.total,
          cantidad: a.cantidad,
          numero: a.numero,
          diferencia: a.total - a.cantidad,
          ventaActiva: a.ventaActiva,
        };
      });
      res.status(200).json(otra4);
    } catch (error) {
      res.status(400).json(error);
    }
  },
}