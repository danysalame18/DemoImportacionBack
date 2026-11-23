const { ArticulosEmbarques, ArticulosOC, Embarques, OrdenesCompra } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        ArticulosEmbarques.find()
        .populate('embarques')
        .populate('proveedores')
        .populate('articulos')
        .populate('notasCxP')
        .populate({path: 'articulosOC', populate:{path: 'articulos'}})
        .populate({path: 'articulosOC', populate:{path: 'ordenesCompra'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ArticulosEmbarques.findById(id)
        .populate('embarques')
        .populate('proveedores')
        .populate('articulos')
        .populate('notasCxP')
        .populate({path: 'articulosOC', populate:{path: 'articulos'}})
        .populate({path: 'articulosOC', populate:{path: 'ordenesCompra'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    }, 
    findAllPendRecibir: async (req, res)=>{
        try{

        let temp = await ArticulosEmbarques.find({is_active:"Si"})

        .populate({path: 'articulosOC', populate:{path: 'ordenesCompra', populate:{path: 'proveedores'}}})
        .populate('articulos')
        .populate('embarques')
        .populate('proveedores')
        .populate('notasCxP')

        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'marcas'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
        .populate({path: 'articulos', populate:{path: 'proveedores'}})

        let temp2 = await temp.map((a) =>{
            if(a.embarques[0].recibido == "No" && a.cantidad > 0){
            return {
                     "codigo": a.articulos[0].codigo + " " + a.articulos[0].nombre,
                     "nombre": a.articulos[0].nombre,
                     "idArticulo": a.articulos[0]._id,
                     "cantidad": a.cantidad,
                     "recibido": a.recibido,
                     "pendiente_recibir": a.pendiente_recibir,
                     "lineas":a.articulos[0].lineas[0].name,
                     "idLineas":a.articulos[0].lineas[0]._id, 
                     "familias":a.articulos[0].familias[0].name,
                     "idFamilias":a.articulos[0].familias[0]._id,
                     "marcas":a.articulos[0].marcas[0].name,
                     "idMarcas":a.articulos[0].marcas[0]._id,
                     "colecciones":a.articulos[0].colecciones[0].name,
                     "idColecciones":a.articulos[0].colecciones[0]._id,
                     "proveedor": a.proveedores[0].nombre_comercial,
                     "idProveedor": a.proveedores[0]._id,
                  }
                  }
        })
        .filter(function (el) {
          return el != null;
        })


        let agrupado = temp2.reduce(function (groups, item) {
                const val = item["idArticulo"] 
            groups[val] = groups[val] || {
              idArticulo: item.idArticulo,
              cantidad: 0,
              recibido: 0,
              pendiente_recibir: 0
            };
            groups[val].cantidad += item.cantidad;
            groups[val].recibido += item.recibido;
            groups[val].pendiente_recibir += item.pendiente_recibir;
            groups[val].nombre = item.nombre;
            groups[val].codigo = item.codigo;
            groups[val].idArticulo = item.idArticulo;
            groups[val].lineas = item.lineas;
            groups[val].idLineas = item.idLineas;
            groups[val].familias = item.familias;
            groups[val].idFamilias = item.idFamilias;
            groups[val].marcas = item.marcas;
            groups[val].idMarcas = item.idMarcas;
            groups[val].colecciones = item.colecciones;
            groups[val].idColecciones = item.idColecciones;
            groups[val].proveedor = item.proveedor;
            groups[val].idProveedor = item.idProveedor;
            return groups;
          },[])
      

          let computedComments= Object.values(agrupado)
          res.status(200).json(computedComments)
        } catch (error) {
           res.status(400).json(error)
            }
    },  
    findAllPendRecibirDash: async (req, res)=>{
        try{

        let temp = await ArticulosEmbarques.find({is_active:"Si", pendiente_recibir:{$gt:0}})
        .populate('embarques')
        .populate('proveedores')

        let temp2 = await temp.map((a) =>{
            if(a.embarques[0].recibido == "No" && a.cantidad > 0){
            return {
                     "pendiente_recibir": a.pendiente_recibir,
                   "idProveedor": a.proveedores[0]._id,
                   "proveedor": a.proveedores[0].nombre_comercial,
                  }
                  }
        })
        .filter(function (el) {
          return el != null;
        })


        let agrupado = temp2.reduce(function (groups, item) {
                const val = item["idProveedor"] 
            groups[val] = groups[val] || {
              idProveedor: item.idProveedor,
              pendiente_recibir: 0
            };
            groups[val].pendiente_recibir += item.pendiente_recibir;
            groups[val].idProveedor = item.idProveedor;
            groups[val].proveedor = item.proveedor;
            return groups;
          },[])
      

          let computedComments= Object.values(agrupado)
          res.status(200).json(computedComments)
        } catch (error) {
           res.status(400).json(error)
            }
    },  
 
    findAllPendRecibirArticulo: async (req, res)=>{
        const { articulo } = req.params
        try{

        let temp = await ArticulosEmbarques.find({is_active:"Si", articulos:articulo, "pendiente_recibir"  : {$gte : 0}})

        .populate({path: 'articulosOC', populate:{path: 'ordenesCompra', populate:{path: 'proveedores'}}})
        .populate('articulos')
        .populate('embarques')
        .populate('proveedores')
        .populate('notasCxP')

        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'marcas'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})

        let temp2 = await temp.map((a) =>{
            return {
                     "codigo": a.articulos[0].codigo + " " + a.articulos[0].nombre,
                     "nombre": a.articulos[0].nombre,
                     "idArticulo": a.articulos[0]._id,
                     "cantidad": a.cantidad,
                     "recibido": a.recibido,
                     "pendiente_recibir": a.pendiente_recibir,
                     "fechaEstimada": a.embarques[0].fechaEstimada,
                     "idEmbarques": a.embarques[0].idEmbarques,
                     "contenedor": a.embarques[0].contenedor,
                  }
        })
      

          let computedComments= Object.values(temp2)
          res.status(200).json(computedComments)
        } catch (error) {
           res.status(400).json(error)
            }
    }, 
    findOneEmbarque: (req, res)=>{
        const { id } = req.params
        ArticulosEmbarques.find({ embarques: id })
        .populate('embarques')
        .populate('proveedores')
        .populate('articulos')
        .populate('notasCxP')
        .populate({path: 'articulosOC', populate:{path: 'articulos'}})
        .populate({path: 'articulosOC', populate:{path: 'ordenesCompra'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneControlCalidad: (req, res)=>{
        const { id } = req.params
        ArticulosEmbarques.find({ controlCalidad: id, calidad:"Si" })
        .populate('embarques')
        .populate('proveedores')
        .populate('articulos')
        .populate('notasCxP')
        .populate({path: 'controlCalidad', populate:{path: 'proveedores'}})
        .populate({path: 'articulosOC', populate:{path: 'articulos'}})
        .populate({path: 'articulosOC', populate:{path: 'ordenesCompra'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOneNota: (req, res)=>{
        const { id } = req.params
        ArticulosEmbarques.find({ notasCxP: id })
        .populate('articulos')
        .populate('embarques')
        .populate('proveedores')
        .populate('notasCxP')
        .populate({path: 'articulosOC', populate:{path: 'articulos'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findControlCalidadCreate: (req, res)=>{
        ArticulosEmbarques.find({ $or:[{faltanteTotal:{$gt:0}}, {danadoTotal:{$gt:0}}], calidad:"No" })
        .populate('articulos')
        .populate('embarques')
        .populate('proveedores')
        .populate('notasCxP')
        .populate({path: 'articulosOC', populate:{path: 'articulos'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    create: (req, res)=>{
        const { body } = req
        const newArticulosEmbarques = new ArticulosEmbarques(body)
        const articulo = newArticulosEmbarques.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        ArticulosEmbarques.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    editEmbarcado: (req, res)=>{
        const { body } = req
        ArticulosEmbarques.findByIdAndUpdate(req.params.id, { $inc: { recibido:body.cantidad, pendiente_recibir: -body.cantidad}}, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editCant: (req, res)=>{
        const { body } = req
        ArticulosEmbarques.findByIdAndUpdate(req.params.id, { total_costo:body.total_costo, $inc: { cantidad:body.cantidad, pendiente_recibir: body.cantidad}}, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    edit: async (req, res)=>{
        const { id } = req.params
        const { body } = req

        let AE = await ArticulosEmbarques.findByIdAndUpdate(id, {cantidad:body.cantidad, pendiente_recibir:body.pendiente_recibir, total_costo: body.total_costo}, { new: true})

        let AOC = await ArticulosOC.findByIdAndUpdate({_id:body.articulosOC}, { $inc: { embarcado:body.difCantidad, pendiente_embarcar: -body.difCantidad}}, {new: true})

        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editCalidad: (req, res)=>{
        const { body } = req
        ArticulosEmbarques.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },

  //     desarrollo: async (req, res) => {
  //   try {
  //     let art = await ArticulosEmbarques.find()
  //     .populate("embarques")
  //     .populate("proveedores")

  //     art.map(async(a)=>{
  //       await Embarques.findByIdAndUpdate(a.embarques[0]._id, {proveedores: a.proveedores[0]._id})
  //     })

  //   } catch (error) {
  //     res.status(400).json(error);
  //   }
  // },

  //     desarrollo: async (req, res) => {
  //   try {
  //     let art = await ArticulosEmbarques.find()
  //     .populate("embarques")
  //     .populate("proveedores")
  //     .populate({path: 'articulosOC', populate:{path: 'ordenesCompra'}})

  //     art.map(async(a)=>{
  //       await OrdenesCompra.findByIdAndUpdate(a.articulosOC[0].ordenesCompra[0]._id, {$inc: { embarcado:a.cantidad }}, {new: true})
  //     })

  //   } catch (error) {
  //     res.status(400).json(error);
  //   }
  // },
}