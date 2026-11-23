const { ArticulosPedido, Inventarios, ArticulosTSolV2, Surtidos, Areas } = require('../models')
const mongoose = require('mongoose')

// Toma el primer elemento si el campo es arreglo (en la base conviven ambos formatos)
const primero = (campo) => ({ $cond: [{ $isArray: campo }, { $arrayElemAt: [campo, 0] }, campo] })

module.exports = { 
    findAll: (req, res)=>{
        ArticulosPedido.find()
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'pedidos', populate:{path: 'colaboradores'}})
        .populate({path: 'pedidos', populate:{path: 'areas'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },
    findOne: (req, res)=>{
        const { id } = req.params
        ArticulosPedido.findById(id)
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'pedidos', populate:{path: 'colaboradores'}})
        .populate({path: 'pedidos', populate:{path: 'areas'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    // Analisis de pedidos: TODOS los renglones activos de pedidos no cancelados,
    // en un solo golpe y ligero (solo los campos de la tabla). Se resuelve con
    // aggregate porque hidratar 9,000+ docs con populate tarda demasiado.
    findAnalisis: async (req, res)=>{
      try {
        const filas = await ArticulosPedido.aggregate([
          { $match: { is_active: "Si" } },
          { $lookup: { from: "pedidos", localField: "pedidos", foreignField: "_id", as: "ped" } },
          { $unwind: "$ped" },
          { $match: { "ped.is_active": "Si" } },
          { $lookup: { from: "clientes", localField: "ped.clientes", foreignField: "_id", as: "cli" } },
          { $lookup: { from: "articulos", localField: "articulos", foreignField: "_id", as: "art" } },
          { $project: {
              idPedido: "$ped.idPedido",
              fecha: "$ped.fecha",
              status: "$ped.status",
              cliente: { $arrayElemAt: ["$cli.nombre_comercial", 0] },
              idArticulo: { $arrayElemAt: ["$art._id", 0] },
              codigo: { $arrayElemAt: ["$art.codigo", 0] },
              articulo: { $arrayElemAt: ["$art.nombre", 0] },
              autorizadoApartado: 1,
              autorizadoSurtido: 1,
              cantidad: 1,
              surtido: 1,
              pendiente_surtir: 1,
          } },
          { $sort: { idPedido: -1 } },
        ])
        res.status(200).json(filas)
      } catch (err) {
        console.log("Error en findAnalisis:", err)
        res.status(400).json(err)
      }
    },
    findOneArticulo: (req, res)=>{
      const { id } = req.params
      ArticulosPedido.find({articulos:id})
      .populate({path: 'pedidos', populate:{path: 'clientes'}})
      .populate({path: 'pedidos', populate:{path: 'colaboradores'}})
      .populate({path: 'pedidos', populate:{path: 'areas'}})
      .populate({path: 'articulos', populate:{path: 'familias'}})
      .populate({path: 'articulos', populate:{path: 'lineas'}})
      .populate({path: 'articulos', populate:{path: 'colecciones'}})
          .then((respDB)=> res.status(200).json(respDB))
          .catch((err)=> console.log(err))
  },  
  findOneFechas: (req, res)=>{
    const { inicio, fin } = req.params
        ArticulosPedido.find({fecha:{$gte: inicio, $lte: fin}, clientes:{$ne: "650a334ab99f0b3555a8cf16"}})
    .populate({ path: 'pedidos', populate: { path: 'clientes' } })
    .populate({ path: 'pedidos', populate: { path: 'areas' } })
    .populate({ path: 'pedidos', populate: { path: 'colaboradores' } })
    .populate({ path: 'articulos', populate: { path: 'familias' } })
    .populate({ path: 'articulos', populate: { path: 'lineas' } })
    .populate({ path: 'articulos', populate: { path: 'colecciones' } })
    .then((respDB) => {
        if (respDB.length === 0) {
            console.log("No se encontraron resultados");
            return res.status(404).json({ message: "No se encontraron resultados" });
        }
        res.status(200).json(respDB);
    })
    .catch((err) => {
        console.log("Error:", err);
        res.status(500).json({ error: 'An error occurred' });
    });
}, 
    findOnePedido: (req, res)=>{
        const { id } = req.params
        ArticulosPedido.find({ pedidos: id })
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'pedidos', populate:{path: 'colaboradores'}})
        .populate({path: 'pedidos', populate:{path: 'areas'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findOnePedidoSurtir2: (req, res)=>{
        const { id } = req.params
        ArticulosPedido.find({ pedidos: id, is_active:"Si"
        // , pendiente_surtir:{$gt:0} 
      })
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'pedidos', populate:{path: 'colaboradores'}})
        .populate({path: 'pedidos', populate:{path: 'areas'}})
        .populate({path: 'pedidos', populate:{path: 'autorizoApartado'}})
        .populate({path: 'pedidos', populate:{path: 'autorizoSurtido'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findOnePedidoSurtir: async (req, res)=>{
        const { id } = req.params
        try{
        let AP = await ArticulosPedido.find({ pedidos: id, is_active:"Si"
        // , pendiente_surtir:{$gt:0}
      })
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'pedidos', populate:{path: 'colaboradores'}})
        .populate({path: 'pedidos', populate:{path: 'areas'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})

            let ids = await AP.map((a) => (a.articulos[0]._id))
            

            let AI = await  Inventarios.find({
                    "cantidad": {$gt:0},
                     "articulos" : { $in: ids} })
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
    findOnePedidoSurtir3: async (req, res)=>{
        const { id, area } = req.params
        try{
        let AP = await ArticulosPedido.find({ pedidos: id, is_active:"Si", pendiente_surtir:{$gt:0}})
        .populate('articulos')
        .populate('pedidos')


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
                    articuloCodigo:a.articulos[0].codigo,
                    articuloSoloNombre:a.articulos[0].nombre
                }
            })
            


            let AP3 = Object.values(AP2);
            

            let AI = await  Inventarios.find({
                    // "cantidad": {$gt:0}, 
                    "articulos" : { $in: ids}, areas: area })
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
                    articuloCodigo:a.articulos[0].codigo,
                    articuloSoloNombre:a.articulos[0].nombre,
                    costoUnitario: a.costoUnitario
                }
            })

            let AI3 = Object.values(AI2);

            let AIP = AP3.concat(AI3)


            let agrupado = AIP.reduce(function (groups, item) {
                const val = item["articulos"]
                groups[val] = groups[val] || {
                  articulos: item.articulos,
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
                groups[val].articuloCodigo = item.articuloCodigo;
                groups[val].articuloSoloNombre = item.articuloSoloNombre;
                groups[val].costoUnitario = item.costoUnitario;
                return groups;
              }, []);
        
              let agrupado2 = Object.values(agrupado);
  

              res.status(200).json(agrupado2)
            } catch (error) {
               res.status(400).json(error)
           }
    },

    findOnePedidoSurtir4: async (req, res)=>{
        const { id, area } = req.params
        try{

            let AP = await ArticulosPedido.find({ pedidos: id, is_active:"Si"
            // , pendiente_surtir:{$gt:0}
          })
            .populate({ path: "articulos", populate: { path: "lineas" } })

            let ids = await AP.map((a) => (a.articulos[0]._id))

            let APInfo = await AP.map((a) => {
                return {
                  articulos: a.articulos[0]._id,
                  articuloNombre: a.articulos[0].nombre + " " + a.articulos[0].codigo,
                  disponible: 0,
                  cantidadPedido:a.pendiente_surtir,
                }
              }).filter(function (el) {
                return el != null;
              })

              let valuesAPInfo = Object.values(APInfo);


            let APTodos = await ArticulosPedido.find({
                articulos : { $in: ids},
                is_active: "Si",
                // pendiente_surtir: { $gte: 0 },
                autorizadoApartado: "Si",
              })
                .populate({ path: "articulos", populate: { path: "lineas" } })
                .populate({ path: "pedidos", populate: { path: "areas" } })
        
              let APTodosInfo = await APTodos.map((a) => {
                // if(a.pedidos[0].areas[0]._id == area ){
                return {
                  articulos: a.articulos[0]._id,
                  articuloNombre: a.articulos[0].nombre + " " + a.articulos[0].codigo,
                  disponible: -a.pendiente_surtir,
                  cantidadPedido:0
                }
              // }
              }).filter(function (el) {
                return el != null;
              })

              let valuesAPTodosInfo = Object.values(APTodosInfo);

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
                  cantidadPedido:0
                }}
              }).filter(function (el) {
                return el != null;
              })

              let valuesATTodosInfo = Object.values(ATTodosInfo);

        
              let AI = await Inventarios.find({ is_active: "Si", areas: area
              , cantidad: { $gt: 0 }
              , articulos : { $in: ids} })
                .populate({ path: "articulos", populate: { path: "lineas" } })

        
              let AIInfo = await AI.map((a) => {
                return {
                  articulos: a.articulos[0]._id,
                  articuloNombre: a.articulos[0].nombre + " " + a.articulos[0].codigo,
                  disponible:a.cantidad,
                  cantidadPedido:0
                };
              }).filter(function (el) {
                return el != null;
              })

              let valuesAIInfo = Object.values(AIInfo);

        
              let concatTotdo = await valuesAPInfo.concat(valuesAPTodosInfo, valuesATTodosInfo, valuesAIInfo);

        
              let agrupado = concatTotdo.reduce(function (groups, item) {
                const val = item["articulos"]
                groups[val] = groups[val] || {
                  articulos: item.articulos,
                  disponible:0,
                  cantidadPedido:0
                };
                groups[val].cantidadPedido += item.cantidadPedido;
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
    findOnePedidoDevolucion: async (req, res)=>{
        const { id } = req.params
        let s = await Surtidos.findById(id)
        let p = s.pedidos
        ArticulosPedido.find({ pedidos: p })
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'pedidos', populate:{path: 'colaboradores'}})
        .populate({path: 'pedidos', populate:{path: 'areas'}})
        .populate({path: 'articulos', populate:{path: 'familias'}})
        .populate({path: 'articulos', populate:{path: 'lineas'}})
        .populate({path: 'articulos', populate:{path: 'colecciones'}})
            .then((respDB)=> res.status(200).json(respDB))
            .catch((err)=> console.log(err))
    },   
    findDisponible: (req, res)=>{
        ArticulosPedido.find({ is_active: "Si" })
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'pedidos', populate:{path: 'colaboradores'}})
        .populate({path: 'pedidos', populate:{path: 'areas'}})
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
            .populate({path: 'pedidos', populate:{path: 'clientes'}})
    
            let pedido = sur.pedidos[0]._id
    
            let AP = await ArticulosPedido.find({ pedidos: pedido, articulos: articulo })
            .populate({path: 'pedidos', populate:{path: 'clientes'}})
            .populate({path: 'pedidos', populate:{path: 'colaboradores'}})
            .populate({path: 'pedidos', populate:{path: 'areas'}})
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
        let AP = await ArticulosPedido.find({ pedidos: id, is_active:"Si" })
        .populate({path: 'pedidos', populate:{path: 'clientes'}})
        .populate({path: 'pedidos', populate:{path: 'colaboradores'}})
        .populate({path: 'pedidos', populate:{path: 'areas'}})
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
    // Listo para Surtir por bodega: pendiente de surtir de pedidos ABIERTOS y
    // ACTIVOS (por defecto solo autorizados), con la existencia desglosada por
    // bodega. Las tiendas no cuentan: su mercancia no se usa para surtir pedidos.
    // ?autorizados=No incluye tambien lo pendiente sin autorizar.
    findListoSurtirBodegas: async (req, res)=>{
      try {
        const soloAutorizados = req.query.autorizados !== "No"
        const tiendas = [process.env.REACT_APP_AREAS_ABY, process.env.REACT_APP_AREAS_MAYA]
          .filter(Boolean)
          .map((id) => new mongoose.Types.ObjectId(id))

        const matchRenglon = { is_active: "Si", pendiente_surtir: { $gt: 0 } }
        const matchPedido = { "ped.is_active": "Si", "ped.status": "Abierto" }
        if (soloAutorizados) {
          matchRenglon.autorizadoSurtido = "Si"
          matchPedido["ped.autorizadoSurtido"] = "Si"
        }

        const pendientes = await ArticulosPedido.aggregate([
          { $match: matchRenglon },
          { $lookup: { from: "pedidos", localField: "pedidos", foreignField: "_id", as: "ped" } },
          { $unwind: "$ped" },
          { $match: matchPedido },
          { $addFields: { art1: primero("$articulos") } },
          { $group: {
              _id: "$art1",
              cantPed: { $sum: "$cantidad" },
              pendSurtir: { $sum: "$pendiente_surtir" },
              pedidos: { $addToSet: "$ped._id" },
          } },
          { $lookup: { from: "articulos", localField: "_id", foreignField: "_id", as: "art" } },
          { $project: {
              codigo: { $arrayElemAt: ["$art.codigo", 0] },
              nombre: { $arrayElemAt: ["$art.nombre", 0] },
              piezasPorCaja: { $arrayElemAt: ["$art.piezasPorCaja", 0] },
              cantPed: 1,
              pendSurtir: 1,
              numPedidos: { $size: "$pedidos" },
          } },
        ])

        const ids = pendientes.map((p) => p._id)
        const existencias = await Inventarios.aggregate([
          { $match: { is_active: "Si", cantidad: { $gt: 0 } } },
          { $addFields: { art1: primero("$articulos"), area1: primero("$areas") } },
          { $match: { art1: { $in: ids }, area1: { $nin: tiendas } } },
          { $group: { _id: { art: "$art1", area: "$area1" }, cantidad: { $sum: "$cantidad" } } },
        ])

        const nombres = new Map(
          (await Areas.find({}).select("name").lean()).map((a) => [String(a._id), a.name])
        )
        const porArticulo = new Map()
        const bodegasUsadas = new Set()
        for (const e of existencias) {
          const bodega = nombres.get(String(e._id.area)) || "Sin nombre"
          bodegasUsadas.add(bodega)
          const k = String(e._id.art)
          if (!porArticulo.has(k)) porArticulo.set(k, {})
          const m = porArticulo.get(k)
          m[bodega] = (m[bodega] || 0) + e.cantidad
        }

        const filas = pendientes.map((p) => {
          const porBodega = porArticulo.get(String(p._id)) || {}
          const disponible = Object.values(porBodega).reduce((t, n) => t + n, 0)
          return {
            idArticulo: p._id,
            codigo: p.codigo || "",
            nombre: p.nombre || "",
            piezasPorCaja: p.piezasPorCaja || 0,
            numPedidos: p.numPedidos,
            cantPed: p.cantPed,
            pendSurtir: p.pendSurtir,
            porBodega,
            disponible,
            falta: Math.max(0, p.pendSurtir - disponible),
          }
        })

        res.status(200).json({ bodegas: [...bodegasUsadas].sort(), filas })
      } catch (error) {
        console.log("Error en findListoSurtirBodegas:", error)
        res.status(400).json(error)
      }
    },
    findListoSurtir: async (req, res)=>{

      try{
      let AP = await ArticulosPedido.find({ is_active:"Si", pendiente_surtir:{$gt:0}})
      .populate('articulos')

          let ids = await AP.map((a) => (a.articulos[0]._id))

          let AP2 = AP.map((a)=>{
              return{
                  articulos: a.articulos[0]._id,
                  cantInv: 0,
                  cantPed: a.cantidad,
                  pendSurtir: a.pendiente_surtir,
                  articuloNombre: a.articulos[0].codigo,
                  piezasPorCaja: a.articulos[0].piezasPorCaja,
                  cajas: a.cantidad / a.articulos[0].piezasPorCaja,
                  areas:""
              }
          })
          
          let AP3 = Object.values(AP2);
          

          let AI = await  Inventarios.find({
                  "cantidad": {$gt:0}, 
                  "articulos" : { $in: ids} })
                  .populate('articulos')
                  .populate('areas')

          let AI2 = AI.map((a)=>{
              return{
                  articulos: a.articulos[0]._id,
                  cantInv: a.cantidad,
                  cantPed:0,
                  pendSurtir: 0,
                  articuloNombre: a.articulos[0].codigo,
                  piezasPorCaja: a.articulos[0].piezasPorCaja,
                  cajas:0,
                  area: a.areas[0].name + ", "
              }
          })

          let AI3 = Object.values(AI2);

          let AIP = AP3.concat(AI3)


          let agrupado = AIP.reduce(function (groups, item) {
              const val = item["articulos"]
              groups[val] = groups[val] || {
                articulos: item.articulos,
                cantInv: 0,
                pendSurtir:0,
                cantPed:0,
                cajas:0,
                area:""
              };
              groups[val].cantInv += item.cantInv;
              groups[val].cantPed += item.cantPed;
              groups[val].cajas += item.cajas;
              groups[val].pendSurtir += item.pendSurtir;
              groups[val].articulos = item.articulos;
              groups[val].area += item.area;
              groups[val].articuloNombre = item.articuloNombre;
              groups[val].piezasPorCaja = item.piezasPorCaja;
              return groups;
            }, []);
      
            let agrupado2 = Object.values(agrupado);

            let activos = agrupado2.filter((e) => e.cantInv > 0 );

            res.status(200).json(activos)
          } catch (error) {
             res.status(400).json(error)
         }
  },
  findListoSurtirCliente: async (req, res)=>{
    const { cliente } = req.params
    try{
    let AP = await ArticulosPedido.find({ is_active:"Si", pendiente_surtir:{$gt:0}, clientes:cliente})
    .populate('articulos')
    // console.log(AP)
        let ids = await AP.map((a) => (a.articulos[0]._id))

        let AP2 = AP.map((a)=>{
            return{
                articulos: a.articulos[0]._id,
                cantInv: 0,
                cantPed: a.cantidad,
                pendSurtir: a.pendiente_surtir,
                articuloNombre: a.articulos[0].codigo,
                piezasPorCaja: a.articulos[0].piezasPorCaja,
                cajas: a.cantidad / a.articulos[0].piezasPorCaja,
                area: ""
            }
        })
        
        let AP3 = Object.values(AP2);
        

        let AI = await  Inventarios.find({
                "cantidad": {$gt:0}, 
                "articulos" : { $in: ids} })
                .populate('articulos')
                .populate('areas')

        let AI2 = AI.map((a)=>{
            return{
                articulos: a.articulos[0]._id,
                cantInv: a.cantidad,
                cantPed:0,
                pendSurtir: 0,
                articuloNombre: a.articulos[0].codigo,
                piezasPorCaja: 0,
                cajas: 0,
                area: a.areas[0].name + ", "
            }
        })

        let AI3 = Object.values(AI2);

        let AIP = AP3.concat(AI3)


        let agrupado = AIP.reduce(function (groups, item) {
            const val = item["articulos"]
            groups[val] = groups[val] || {
              articulos: item.articulos,
              cantInv: 0,
              pendSurtir:0,
              cantPed:0,
              cajas: 0,
              piezasPorCaja:0,
              area:""
            };
            groups[val].cantInv += item.cantInv;
            groups[val].cantPed += item.cantPed;
            groups[val].cajas += item.cajas;
            groups[val].piezasPorCaja += item.piezasPorCaja;
            groups[val].pendSurtir += item.pendSurtir;
            groups[val].articulos = item.articulos;
            groups[val].area += item.area;
            groups[val].articuloNombre = item.articuloNombre;
            return groups;
          }, []);
    
          let agrupado2 = Object.values(agrupado);

          let activos = agrupado2.filter((e) => e.cantInv > 0 );

          res.status(200).json(activos)
        } catch (error) {
           res.status(400).json(error)
       }
},
    create: (req, res)=>{
        const { body } = req
        const newArticulosPedido = new ArticulosPedido(body)
        const articulo = newArticulosPedido.save()
            .then((respDB)=> res.status(201).json(respDB))
            .catch((err)=> console.log(err))
    },
    delete: (req, res)=>{
        ArticulosPedido.findByIdAndDelete(req.params.id)
            .then((resDB)=> res.status(204).json(resDB))
            .catch((err)=> res.status(400).json(err))
    },
    edit: (req, res)=>{
        const { body } = req
        ArticulosPedido.findByIdAndUpdate(req.params.id, body, { new: true})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editBaja: (req, res)=>{
        const { body } = req
        ArticulosPedido.updateMany({ pedidos: req.params.id}, {is_active:body.is_active})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editAutorizadoApartado: (req, res)=>{
        const { body } = req
        ArticulosPedido.updateMany({ pedidos: req.params.id, is_active:"Si"}, {autorizadoApartado:body.autorizadoApartado, autorizadoSurtido:body.autorizadoSurtido})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    },
    editAutorizadoSurtido: (req, res)=>{
        const { body } = req
        ArticulosPedido.updateMany({ pedidos: req.params.id, is_active:"Si"}, {autorizadoSurtido:body.autorizadoSurtido})
        .then((resDB)=> res.status(201).json(resDB))
        .catch((err)=> res.status(400).json(err))
    }
}