const { ArticulosTSolV2, Inventarios, Surtidos, ArticulosPedido } = require('../models')

module.exports = { 
    findAll: (req, res)=>{
        ArticulosTSolV2.find()
        .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaDestino'}})
        .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaSalida'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ArticulosTSolV2.findById(id)
        .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaDestino'}})
        .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaSalida'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findOneArticulo: (req, res)=>{
      const { id } = req.params
      ArticulosTSolV2.find({articulos:id})
      .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaDestino'}})
      .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaSalida'}})
      .populate({path: 'articulos', populate:{path: 'familias'}})
      .populate({path: 'articulos', populate:{path: 'lineas'}})
          .then((respDB)=> res.status(200).json(respDB))
          .catch((err)=> console.log(err))
  },  
    findOneTraspasosSolicitud: (req, res)=>{
        const { id } = req.params
        ArticulosTSolV2.find({ traspasosSolicitudV2: id })
        .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaDestino'}})
        .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaSalida'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findOneTraspasosSolicitudSurtir2: (req, res)=>{
        const { id } = req.params
        ArticulosTSolV2.find({ traspasosSolicitudV2: id, is_active:"Si"
        // , pendiente_surtir:{$gt:0} 
      })
        .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaDestino'}})
        .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaSalida'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findOneTraspasosSolicitudSurtir: async (req, res)=>{
        const { id, area } = req.params
        try{
        let AP = await ArticulosTSolV2.find({ traspasosSolicitudV2: id, is_active:"Si"
        // , pendiente_surtir:{$gt:0}
      })
        .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaDestino'}})
        .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaSalida'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})

            let ids = await AP.map((a) => (a.articulos[0]._id))
            

            let AI = await  Inventarios.find({
                    // "cantidad": {$gt:0}, 
                    "articulos" : { $in: ids}, areas: area })
              .populate('compras')
              .populate('areas')
              .populate({path: 'articulos', populate:{path: 'familias'}})
              .populate({path: 'articulos', populate:{path: 'lineas'}})
              .populate({path: 'articulos', populate:{path: 'colecciones'}})

              res.status(200).json({AP, AI})
            } catch (error) {
               res.status(400).json(error)
           }
    },
    findOneTraspasosSolicitudSurtir3: async (req, res)=>{
        const { id, area } = req.params
        try{
        let AP = await ArticulosTSolV2.find({ traspasosSolicitudV2: id, is_active:"Si" , pendiente_surtir:{$gt:0} })
        .populate('articulos')
        .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaSalida'}})


            let ids = await AP.map((a) => (a.articulos[0]._id))


            let AP2 = AP.map((a)=>{
                return{
                    articulos: a.articulos[0]._id,
                    cantidad: 0,
                    cantInv: 0,
                    cantPed: a.cantidad,
                    idInv: "",
                    idArtPed: a._id,
                    cajas: 0,
                    piezasPorCaja: a.articulos[0].piezasPorCaja,
                    precio: a.precio,
                    total: 0,
                    pendSurtir: a.pendiente_surtir,
                    articuloNombre: a.articulos[0].nombre + " " + a.articulos[0].codigo,
                    idArea: a.traspasosSolicitudV2[0].areaSalida[0]._id,
                }
            })
            


            let AP3 = Object.values(AP2);
            

            let AI = await  Inventarios.find({
                    // "cantidad": {$gt:0}, 
                    articulos : { $in: ids}, areas: area })
                    .populate('articulos')
                    .populate('areas')

            let AI2 = AI.map((a)=>{
                return{
                    articulos: a.articulos[0]._id,
                    cantidad: 0,
                    cantInv: a.cantidad,
                    cantPed:0,
                    idInv: a._id,
                    cajas: 0,
                    piezasPorCaja: a.articulos[0].piezasPorCaja,
                    precio: 0,
                    total: 0,
                    pendSurtir: 0,
                    articuloNombre: a.articulos[0].nombre + " " + a.articulos[0].codigo,
                    idArea: a.areas[0]._id,
                }
            })

            let AI3 = Object.values(AI2);

            let AIP = AP3.concat(AI3)


            let agrupado = AIP.reduce(function (groups, item) {
                const val = item["articulos"] + item["idArea"];
                groups[val] = groups[val] || {
                  articulos: item.articulos,
                  idArea: item.idArea,
                  idArtPed:item.idArtPed,
                  cantInv: 0,
                  pendSurtir:0,
                  precio:0,
                  cantPed:0
                };
                groups[val].cantInv += item.cantInv;
                groups[val].cantPed += item.cantPed;
                groups[val].cantidad += item.cantidad;
                groups[val].idInv = item.idInv;
                groups[val].cajas = item.cajas;
                groups[val].piezasPorCaja = item.piezasPorCaja;
                groups[val].precio += item.precio;
                groups[val].total = item.total;
                groups[val].pendSurtir += item.pendSurtir;
                groups[val].articulos = item.articulos;
                groups[val].articuloNombre = item.articuloNombre;
                groups[val].idArea = item.idArea;
                return groups;
              }, []);
        
              let agrupado2 = Object.values(agrupado);

              res.status(200).json(agrupado2)
            } catch (error) {
               res.status(400).json(error)
           }
    },

    findOneTraspasosSolicitudSurtir4: async (req, res)=>{
        const { id, area } = req.params
        try{

            let AT = await ArticulosTSolV2.find({ traspasosSolicitudV2: id, is_active:"Si"
            // , pendiente_surtir:{$gt:0}
          })
            .populate({ path: "articulos", populate: { path: "lineas" } })

            let ids = await AT.map((a) => (a.articulos[0]._id))

            let ATInfo = await AT.map((a) => {
                return {
                  articulos: a.articulos[0]._id,
                  articuloNombre: a.articulos[0].nombre + " " + a.articulos[0].codigo,
                  disponible: 0,
                  cantidadTraspasosSolicitud:a.pendiente_surtir,
                }
              }).filter(function (el) {
                return el != null;
              })

              let valuesATInfo = Object.values(ATInfo);


            let ATTodos = await ArticulosTSolV2.find({
                articulos : { $in: ids},
                is_active: "Si",
                // pendiente_surtir: { $gte: 0 },
                autorizadoApartado: "Si",
              })
                .populate({ path: "articulos", populate: { path: "lineas" } })
                .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaSalida'}})
                .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaDestino'}})
        
              let ATTodosInfo = await ATTodos.map((a) => {
                if(a.traspasosSolicitudV2[0].areaSalida[0]._id == area ){
                return {
                  articulos: a.articulos[0]._id,
                  articuloNombre: a.articulos[0].nombre + " " + a.articulos[0].codigo,
                  disponible: -a.pendiente_surtir,
                  cantidadTraspasosSolicitud:0
                }}
              }).filter(function (el) {
                return el != null;
              })

              let valuesATTodosInfo = Object.values(ATTodosInfo);

              let APTodos = await ArticulosPedido.find({
                articulos : { $in: ids},
                is_active: "Si",
                // pendiente_surtir: { $gte: 0 },
                autorizadoApartado: "Si",
              })
                .populate({ path: "articulos", populate: { path: "lineas" } })
                .populate({path: 'pedidos', populate:{path: 'areas'}})
        
              let APTodosInfo = await APTodos.map((a) => {
                // if(a.pedidos[0].areas[0]._id == area ){
                return {
                  articulos: a.articulos[0]._id,
                  articuloNombre: a.articulos[0].nombre + " " + a.articulos[0].codigo,
                  disponible: -a.pendiente_surtir,
                  cantidadTraspasosSolicitud:0
                }
              // }
              }).filter(function (el) {
                return el != null;
              })

              let valuesAPTodosInfo = Object.values(APTodosInfo);

        
              let AI = await Inventarios.find({ is_active: "Si", areas: area
              , cantidad: { $gt: 0 }
              , articulos : { $in: ids} })
                .populate({ path: "articulos", populate: { path: "lineas" } })

        
              let AIInfo = await AI.map((a) => {
                return {
                  articulos: a.articulos[0]._id,
                  articuloNombre: a.articulos[0].nombre + " " + a.articulos[0].codigo,
                  disponible:a.cantidad,
                  cantidadTraspasosSolicitud:0
                };
              }).filter(function (el) {
                return el != null;
              })

              let valuesAIInfo = Object.values(AIInfo);

        
              let concatTotdo = await valuesATInfo.concat(valuesAPTodosInfo, valuesATTodosInfo, valuesAIInfo);

        
              let agrupado = concatTotdo.reduce(function (groups, item) {
                const val = item["articulos"]
                groups[val] = groups[val] || {
                  articulos: item.articulos,
                  disponible:0,
                  cantidadTraspasosSolicitud:0
                };
                groups[val].cantidadTraspasosSolicitud += item.cantidadTraspasosSolicitud;
                groups[val].disponible += item.disponible;
                groups[val].articuloNombre = item.articuloNombre;
                return groups;
              }, []);
        
              let valuesAgrupado = Object.values(agrupado);


              res.status(200).json(valuesAgrupado)
            } catch (error) {
               res.status(400).json(error)
           }
    },
    findOneTraspasosSolicitudDevolucion: async (req, res)=>{
        const { id } = req.params
        let s = await Surtidos.findById(id)
        let p = s.traspasosSolicitud
        ArticulosTSolV2.find({ traspasosSolicitudV2: p })
        .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaDestino'}})
        .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaSalida'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findDisponible: (req, res)=>{
        ArticulosTSolV2.find({ is_active: "Si" })
        .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaDestino'}})
        .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaSalida'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findOnePrecio: async (req, res)=>{
        const { surtido, articulo } = req.params
        try{
            let sur = await Surtidos.findById(surtido)
            .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaDestino'}})
    
            let traspasosSolicitud = sur.traspasosSolicitudV2[0]._id
    
            let AP = await ArticulosTSolV2.find({ traspasosSolicitudV2: traspasosSolicitud, articulos: articulo })
            .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaDestino'}})
    
            .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaSalida'}})
            .populate({path: 'articulos', populate:{path: 'familias'}})
            .populate({path: 'articulos', populate:{path: 'lineas'}})
            .populate({path: 'articulos', populate:{path: 'colecciones'}})

            res.status(200).json(AP)
            } catch (error) {
               res.status(400).json(error)
           }
    },   
    findOneSurtido: async (req, res)=>{
        const { id } = req.params
        try{
        let AP = await ArticulosTSolV2.find({ traspasosSolicitudV2: id, is_active:"Si" })
        .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaDestino'}})
        .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaSalida'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
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
    create: (req, res)=>{
        const { body } = req
        const newArticulosTSolV2 = new ArticulosTSolV2(body)
        const articulo = newArticulosTSolV2.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        ArticulosTSolV2.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        ArticulosTSolV2.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editBaja: (req, res)=>{
        const { body } = req
        ArticulosTSolV2.updateMany({ traspasosSolicitudV2: req.params.id}, {is_active:body.is_active})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editAutorizadoApartado: (req, res)=>{
        const { body } = req
        ArticulosTSolV2.updateMany({ traspasosSolicitudV2: req.params.id}, {autorizadoApartado:body.autorizadoApartado, autorizadoSurtido:body.autorizadoSurtido})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editAutorizadoSurtido: (req, res)=>{
        const { body } = req
        ArticulosTSolV2.updateMany({ traspasosSolicitudV2: req.params.id}, {autorizadoSurtido:body.autorizadoSurtido})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}