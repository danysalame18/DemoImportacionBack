const { Inventarios, ArticulosPedido, ArticulosSurtidos, ArticulosDevoluciones, ComprasAcumulados, ArticulosTSolV2, ArticulosEmbarques, ArticulosOC, Embarques} = require('../models')

module.exports = {
  findAll: (req, res) => {
    Inventarios.find()
    .populate({ path: "articulos", populate: { path: "lineas" } })
    .populate({ path: "articulos", populate: { path: "marcas" } })
    .populate({ path: "articulos", populate: { path: "familias" } })
    .populate({ path: "articulos", populate: { path: "colecciones" } })
    .populate({ path: "articulos", populate: { path: "proveedores" } })
    .populate("areas")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findAllAcumulado: async (req, res) => {
    try {
      let inv = await Inventarios.find({ is_active: "Si", cantidad: { $ne: 0 } })

        .populate("areas")
        .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate({ path: "articulos", populate: { path: "marcas" } })
        .populate({ path: "articulos", populate: { path: "familias" } })
        .populate({ path: "articulos", populate: { path: "colecciones" } })
        .populate({ path: "articulos", populate: { path: "proveedores" } })
      let arrayInv = inv
  .filter((a) => a.articulos[0]?.visibleInventario === "Si")
        .map((a) => {
          return {
            _id: a._id,
            activo: a.is_active,
            cantidad: a.cantidad,
            codigo: a.articulos[0].codigo,
            nombre: a.articulos[0].nombre,
            idArticulo: a.articulos[0]._id,
            costoUSD: a.articulos[0].costoUSD,
            costoMX: a.articulos[0].costoMX,
            venta: a.articulos[0].venta,
            observaciones: a.articulos[0].observaciones,
            piezasPorCaja: a.articulos[0].piezasPorCaja,
            linea: a.articulos[0].lineas[0].name,
            idLinea: a.articulos[0].lineas[0]._id,
            marca: a.articulos[0].marcas[0].name,
            idMarca: a.articulos[0].marcas[0]._id,
            familia: a.articulos[0].familias[0].name,
            idFamilia: a.articulos[0].familias[0]._id,
            coleccion: a.articulos[0].colecciones[0].name,
            idColeccion: a.articulos[0].colecciones[0]._id,
            proveedor: a.articulos[0].proveedores[0].nombre_comercial,
            idProveedor: a.articulos[0].proveedores[0]._id,
            ano: a.articulos[0].ano,
            area: a.areas[0].name,
            idArea: a.areas[0]._id,
            urlFoto: a.articulos[0].urlFoto
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let dataFinal = Object.values(arrayInv);


      let agrupado = dataFinal.reduce(function (groups, item) {
        const val = item["idArticulo"] + item["idArea"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val]._id = item._id;
        groups[val].activo = item.activo;
        groups[val].nombre = item.nombre;
        groups[val].codigo = item.codigo;
        groups[val].idArticulo = item.idArticulo;
        groups[val].costoUSD = item.costoUSD;
        groups[val].costoMX = item.costoMX;
        groups[val].venta = item.venta;
        groups[val].observaciones = item.observaciones;
        groups[val].piezasPorCaja = item.piezasPorCaja;
        groups[val].linea = item.linea;
        groups[val].idLinea = item.idLinea;
        groups[val].marca = item.marca;
        groups[val].idMarca = item.idMarca;
        groups[val].familia = item.familia;
        groups[val].idFamilia = item.idFamilia;
        groups[val].coleccion = item.coleccion;
        groups[val].idColeccion = item.idColeccion;
        groups[val].proveedor = item.proveedor;
        groups[val].idProveedor = item.idProveedor;
        groups[val].ano = item.ano;
        groups[val].area = item.area;
        groups[val].idArea = item.idArea;
        groups[val].urlFoto = item.urlFoto;
        return groups;
      }, []);

      let computedComments = Object.values(agrupado);
      res.status(200).json(computedComments);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  findAllAcumuladoAdmin: async (req, res) => {
    try {
      let inv = await Inventarios.find({ is_active: "Si"})

        .populate("areas")
        .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate({ path: "articulos", populate: { path: "marcas" } })
        .populate({ path: "articulos", populate: { path: "familias" } })
        .populate({ path: "articulos", populate: { path: "colecciones" } })
        .populate({ path: "articulos", populate: { path: "proveedores" } })

      let arrayInv = inv
  .filter((a) => a.articulos[0]?.visibleInventario === "Si")
        .map((a) => {
          return {
            _id: a._id,
            activo: a.is_active,
            cantidad: a.cantidad,
            codigo: a.articulos[0].codigo,
            nombre: a.articulos[0].nombre,
            idArticulo: a.articulos[0]._id,
            costoUSD: a.articulos[0].costoUSD,
            costoMX: a.articulos[0].costoMX,
            venta: a.articulos[0].venta,
            observaciones: a.articulos[0].observaciones,
            piezasPorCaja: a.articulos[0].piezasPorCaja,
            linea: a.articulos[0].lineas[0].name,
            idLinea: a.articulos[0].lineas[0]._id,
            marca: a.articulos[0].marcas[0].name,
            idMarca: a.articulos[0].marcas[0]._id,
            familia: a.articulos[0].familias[0].name,
            idFamilia: a.articulos[0].familias[0]._id,
            coleccion: a.articulos[0].colecciones[0].name,
            idColeccion: a.articulos[0].colecciones[0]._id,
            proveedor: a.articulos[0].proveedores[0].nombre_comercial,
            idProveedor: a.articulos[0].proveedores[0]._id,
            area: a.areas[0].name,
            idArea: a.areas[0]._id,
            valor: parseFloat(a.articulos[0].costoMX) * parseFloat(a.cantidad)
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let dataFinal = Object.values(arrayInv);


      let agrupado = dataFinal.reduce(function (groups, item) {
        const val = item["idArticulo"] + item["idArea"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          idArea: item.idArea,
          cantidad: 0,
          valor:0
        };
        groups[val].cantidad += item.cantidad;
        groups[val].valor += item.valor;
        groups[val]._id = item._id;
        groups[val].activo = item.activo;
        groups[val].nombre = item.nombre;
        groups[val].codigo = item.codigo;
        groups[val].idArticulo = item.idArticulo;
        groups[val].costoUSD = item.costoUSD;
        groups[val].costoMX = item.costoMX;
        groups[val].venta = item.venta;
        groups[val].observaciones = item.observaciones;
        groups[val].piezasPorCaja = item.piezasPorCaja;
        groups[val].linea = item.linea;
        groups[val].idLinea = item.idLinea;
        groups[val].marca = item.marca;
        groups[val].idMarca = item.idMarca;
        groups[val].familia = item.familia;
        groups[val].idFamilia = item.idFamilia;
        groups[val].coleccion = item.coleccion;
        groups[val].idColeccion = item.idColeccion;
        groups[val].proveedor = item.proveedor;
        groups[val].idProveedor = item.idProveedor;
        groups[val].area = item.area;
        groups[val].idArea = item.idArea;
        return groups;
      }, []);

      let computedComments = Object.values(agrupado);
      res.status(200).json(computedComments);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  findAllAcumuladoAlmacen: async (req, res) => {
    const { almacen } = req.params;
    try {
      let inv = await Inventarios.find({ is_active: "Si", areas: almacen
      // , cantidad: {$gt:0} 
    })

        .populate("areas")
        .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate({ path: "articulos", populate: { path: "marcas" } })
        .populate({ path: "articulos", populate: { path: "familias" } })
        .populate({ path: "articulos", populate: { path: "colecciones" } })
        .populate({ path: "articulos", populate: { path: "proveedores" } });

      let arrayInv = inv
  .filter((a) => a.articulos[0]?.visibleInventario === "Si")
        .map((a) => {
          return {
            _id: a._id,
            activo: a.is_active,
            cantidad: a.cantidad,
            codigo: a.articulos[0].codigo,
            nombre: a.articulos[0].nombre,
            idArticulo: a.articulos[0]._id,
            costoUSD: a.articulos[0].costoUSD,
            costoMX: a.articulos[0].costoMX,
            venta: a.articulos[0].venta,
            observaciones: a.articulos[0].observaciones,
            piezasPorCaja: a.articulos[0].piezasPorCaja,
            linea: a.articulos[0].lineas[0].name,
            idLinea: a.articulos[0].lineas[0]._id,
            marca: a.articulos[0].marcas[0].name,
            idMarca: a.articulos[0].marcas[0]._id,
            familia: a.articulos[0].familias[0].name,
            idFamilia: a.articulos[0].familias[0]._id,
            coleccion: a.articulos[0].colecciones[0].name,
            idColeccion: a.articulos[0].colecciones[0]._id,
            proveedor: a.articulos[0].proveedores[0].nombre_comercial,
            idProveedor: a.articulos[0].proveedores[0]._id,
            area: a.areas[0].name,
            idArea: a.areas[0]._id,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let dataFinal = Object.values(arrayInv);

      let agrupado = dataFinal.reduce(function (groups, item) {
        const val = item["idArticulo"] + item["idArea"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val]._id = item._id;
        groups[val].activo = item.activo;
        groups[val].nombre = item.nombre;
        groups[val].codigo = item.codigo;
        groups[val].idArticulo = item.idArticulo;
        groups[val].costoUSD = item.costoUSD;
        groups[val].costoMX = item.costoMX;
        groups[val].venta = item.venta;
        groups[val].observaciones = item.observaciones;
        groups[val].piezasPorCaja = item.piezasPorCaja;
        groups[val].linea = item.linea;
        groups[val].idLinea = item.idLinea;
        groups[val].marca = item.marca;
        groups[val].idMarca = item.idMarca;
        groups[val].familia = item.familia;
        groups[val].idFamilia = item.idFamilia;
        groups[val].coleccion = item.coleccion;
        groups[val].idColeccion = item.idColeccion;
        groups[val].proveedor = item.proveedor;
        groups[val].idProveedor = item.idProveedor;
        groups[val].area = item.area;
        groups[val].idArea = item.idArea;
        return groups;
      }, []);

      let computedComments = Object.values(agrupado);
      res.status(200).json(computedComments);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  findDisponibleAlmacen: async (req, res) => {
    const { almacen } = req.params;
    try {
      let AP = await ArticulosPedido.find({
        is_active: "Si",
        // pendiente_surtir: { $gte: 0 },
        autorizadoSurtido: "Si",
      })
        .populate({ path: "pedidos", populate: { path: "areas" } })
        .populate("articulos")

      let idDany = await AP.map((a) => {
        // Solo restar pedidos pendientes que pertenecen al ALMACÉN consultado.
        // (Antes restaba los pedidos de todas las áreas contra el inventario de
        //  un solo almacén, lo que bajaba de más el disponible en Venta Directa.)
        const pedidoEsDeEsteAlmacen = (a.pedidos?.[0]?.areas || []).some(
          (ar) => String(ar?._id) === String(almacen)
        );
        if (a.pedidos?.[0]?.surtido === "No" && pedidoEsDeEsteAlmacen) {
          return {
            codigo: a.articulos[0].codigo,
            nombre: a.articulos[0].nombre,
            idArticulo: a.articulos[0]._id,
            disponible: -a.pendiente_surtir,
            pedido: a.pendiente_surtir,
            inventario: 0,
            traspaso: 0,
            porRecibir: 0,
            piezasPorCaja: a.articulos[0].piezasPorCaja,
            costoUnitario:0,
            venta: a.articulos[0].venta,
            fotoArticulo: a.articulos[0].foto,
            idInv: null
            
          };
        }
      }).filter(function (el) {
        return el != null;
      });


      let AI = await Inventarios.find({
        is_active: "Si",
        areas: almacen,
        cantidad: { $gte: 0 },
      })
        .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate("articulos")

      let idDany2 = await AI
  .filter((a) => a.articulos[0]?.visibleInventario === "Si")
      .map((a) => {
        return {
          codigo: a.articulos[0].codigo,
          nombre: a.articulos[0].nombre,
          idArticulo: a.articulos[0]._id,
          disponible: a.cantidad,
          pedido: 0,
          inventario: a.cantidad,
          traspaso: 0,
          porRecibir: 0,
          articulosNombre: a.articulos[0].nombre,
          piezasPorCaja: a.articulos[0].piezasPorCaja,
          costoUnitario:a.costoUnitario,
          venta: a.articulos[0].venta,
          idInv:a._id,
          fotoArticulo: a.articulos[0].foto,
        };
      });
   
     
      let otra2 = await idDany2.concat(idDany);

      let agrupado = otra2.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          disponible: 0,
          pedido: 0,
          inventario: 0,
          traspaso: 0,
          porRecibir: 0,
          costoUnitario:0,
          idInv: null
        };
        groups[val].disponible += item.disponible;
        groups[val].pedido += item.pedido;
        groups[val].traspaso += item.traspaso;
        groups[val].inventario += item.inventario;
        groups[val].porRecibir += item.porRecibir;
        groups[val].codigo = item.codigo;
        groups[val].nombre = item.nombre;
        groups[val].idArticulo = item.idArticulo;
        groups[val].costoUnitario += item.costoUnitario;
        groups[val].articulosNombre = item.articulosNombre;
        groups[val].piezasPorCaja = item.piezasPorCaja;
        groups[val].venta = item.venta;
        // groups[val].idInv = item.idInv;
        groups[val].fotoArticulo = item.fotoArticulo;
        if (item.idInv) {
          groups[val].idInv = item.idInv; // Set idInv only from inventory items
        }
        return groups;
      }, []);

      let otra3 = Object.values(agrupado);

      res.status(200).json(otra3);
    } catch (error) {
      res.status(400).json(error);
    }
  },
 
  findTraspasos: async (req, res) => {
    const { areas } = req.params;
    try {
      let inv = await Inventarios.find({
        is_active: "Si",
        areas: areas,
        // cantidad: { $gt: 0 },
      })
        .populate("articulos")
        .populate("areas");


      let arrayInv = await inv
  .filter((a) => a.articulos[0]?.visibleInventario === "Si")
        .map((a) => {
          return {
            _id: a._id,
            activo: a.is_active,
            cantidad: a.cantidad,
            codigo: a.articulos[0].codigo,
            nombre: a.articulos[0].nombre,
            idArticulo: a.articulos[0]._id,
            area: a.areas[0].name,
            idArea: a.areas[0]._id,
            piezasPorCaja: a.articulos[0].piezasPorCaja,
            precio: a.articulos[0].venta,
            precioTienda: a.articulos[0].precioTienda,
            costoUnitario: a.costoUnitario,
            costoMX: a.articulos[0].costoMX || 0, // costo del ARTÍCULO (para valuar traspasos)
          };
        })
        .filter(function (el) {
          return el != null;
        });



      let dataFinal = Object.values(arrayInv);
      res.status(200).json(dataFinal);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  findSurtirCEDIS: async (req, res) => {
    try {
      let inv = await Inventarios.find({
        is_active: "Si",
        areas: process.env.REACT_APP_AREAS_CEDIS,
        cantidad: { $gt: 0 },
      })
        .populate("articulos")
        .populate("areas");


      let arrayInv = await inv
  .filter((a) => a.articulos[0]?.visibleInventario === "Si")
        .map((a) => {
          return {
            _id: a._id,
            activo: a.is_active,
            cantidad: a.cantidad,
            codigo: a.articulos[0].codigo,
            nombre: a.articulos[0].nombre,
            idArticulo: a.articulos[0]._id,
            area: a.areas[0].name,
            idArea: a.areas[0]._id,
            piezasPorCaja: a.articulos[0].piezasPorCaja,
            precio: a.articulos[0].venta
          };
        })
        .filter(function (el) {
          return el != null;
        });



      let dataFinal = Object.values(arrayInv);
      res.status(200).json(dataFinal);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  findOne: (req, res) => {
    const { id } = req.params;
    Inventarios.findById(id)
      .populate({ path: "surtidos", populate: { path: "pedidos" } })
      .populate({
        path: "devoluciones",
        populate: { path: "surtidos", populate: { path: "pedidos" } },
      })
      
      .populate({path: 'articulos', populate:{path: 'lineas'}})
      .populate({path: 'articulos', populate:{path: 'marcas'}})
      .populate({path: 'articulos', populate:{path: 'familias'}})
      .populate({path: 'articulos', populate:{path: 'colecciones'}})
      .populate({path: 'articulos', populate:{path: 'proveedores'}})
      .populate({
        path: "articulosPedido",
        populate: { path: "pedidos", populate: { path: "clientes" } },
      })
      .populate("articulosOC")
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneArticulo: (req, res) => {
    const { idArticulo, idColor, tono } = req.params;
    Inventarios.find({
      articulos: idArticulo,
      tono: tono,
      vendido: "No",
    })
      .populate({ path: "surtidos", populate: { path: "pedidos" } })
      .populate({
        path: "devoluciones",
        populate: { path: "surtidos", populate: { path: "pedidos" } },
      })
      
      .populate({ path: "articulos", populate: { path: "tiposTelas" } })
      .populate({
        path: "articulosPedido",
        populate: { path: "pedidos", populate: { path: "clientes" } },
      })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneCompra: (req, res) => {
    const { id } = req.params;
    Inventarios.find({ compras: id })
      .populate({ path: "surtidos", populate: { path: "pedidos" } })
      .populate({
        path: "devoluciones",
        populate: { path: "surtidos", populate: { path: "pedidos" } },
      })
      
      .populate({ path: "articulos", populate: { path: "tiposTelas" } })
      .populate({
        path: "articulosPedido",
        populate: { path: "pedidos", populate: { path: "clientes" } },
      })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneSurtido: (req, res) => {
    const { id } = req.params;
    Inventarios.find({ surtidos: id })
      .populate({ path: "surtidos", populate: { path: "pedidos" } })
      .populate({
        path: "devoluciones",
        populate: { path: "surtidos", populate: { path: "pedidos" } },
      })
      
      .populate({ path: "articulos", populate: { path: "tiposTelas" } })
      .populate({
        path: "articulosPedido",
        populate: { path: "pedidos", populate: { path: "clientes" } },
      })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneDevolucion: (req, res) => {
    const { id } = req.params;
    Inventarios.find({ devoluciones: id })
      .populate({ path: "surtidos", populate: { path: "pedidos" } })
      .populate({
        path: "devoluciones",
        populate: { path: "surtidos", populate: { path: "pedidos" } },
      })
      
      .populate({ path: "articulos", populate: { path: "tiposTelas" } })
      .populate({
        path: "articulosPedido",
        populate: { path: "pedidos", populate: { path: "clientes" } },
      })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneSurtidoDevolucion: async (req, res) => {
    const { id } = req.params;
    try {
      let AI = await Inventarios.find({ surtidos: id, vendido: "Si" })

        .populate({ path: "surtidos", populate: { path: "pedidos" } })
        .populate({
          path: "devoluciones",
          populate: { path: "surtidos", populate: { path: "pedidos" } },
        })
        
        .populate({ path: "articulos", populate: { path: "tiposTelas" } })
        .populate({
          path: "articulosPedido",
          populate: { path: "pedidos", populate: { path: "clientes" } },
        })

      let idDany2 = await AI.map((a) => {
        return {
          _id: a._id,
          is_active: a.is_active,
          articulo:
            a.articulos[0].codigo +
            " / " +
            a.articulos[0].nombre,
          idArticulo: a.articulos[0]._id,
          unidadArticulo: a.articulos[0].unidad,
          cantidad: a.cantidad,
          tono: a.tono,
          articulosPedido: a.articulosPedido[0]._id,
        };
      });
      res.status(200).json(idDany2);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  findOneExistencia: (req, res) => {
    Inventarios.find({ is_active: "Si", vendido: "No", cantidad: { $gt: 0 } })
      .populate({ path: "surtidos", populate: { path: "pedidos" } })
      .populate({
        path: "devoluciones",
        populate: { path: "surtidos", populate: { path: "pedidos" } },
      })
      
      .populate({ path: "articulos", populate: { path: "tiposTelas" } })
      .populate({
        path: "articulosPedido",
        populate: { path: "pedidos", populate: { path: "clientes" } },
      })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
  findOneExistenciaSurtido: (req, res) => {
    const array = req.params.id.split(",");
    Inventarios.find({ vendido: "No", articulos: { $in: array } })
      .populate({ path: "surtidos", populate: { path: "pedidos" } })
      .populate({
        path: "devoluciones",
        populate: { path: "surtidos", populate: { path: "pedidos" } },
      })
      
      .populate({ path: "articulos", populate: { path: "tiposTelas" } })
      .populate({
        path: "articulosPedido",
        populate: { path: "pedidos", populate: { path: "clientes" } },
      })
      .then((respDB) => res.status(200).json(respDB))
      .catch((err) => console.log(err));
  },
findDisponible: async (req, res) => {
  try {
    const AP = await ArticulosPedido.find({
      is_active: "Si",
      autorizadoSurtido: "Si",
    })
      .populate({ path: "articulos", populate: { path: "lineas" } })
      .populate({ path: "articulos", populate: { path: "colecciones" } })
      .populate({ path: "articulos", populate: { path: "familias" } })
      .populate({ path: "articulos", populate: { path: "marcas" } })
      .populate({ path: "pedidos", populate: { path: "areas" } });

    const idDany = AP
      .filter((a) => a.pedidos?.[0]?.surtido === "No")
      .map((a) => {
        const art = a.articulos?.[0];
        if (!art?._id) return null;

        return {
          codigo: art.codigo || "",
          nombre: `${art.codigo || ""} ${art.nombre || ""}`,
          idArticulo: art._id,
          disponible: -a.pendiente_surtir || 0,
          pedido: a.pendiente_surtir || 0,
          inventario: 0,
          traspaso: 0,
          porRecibir: 0,
          precio: art.venta || 0,
          linea: art.lineas?.[0]?.name || "",
          idLinea: art.lineas?.[0]?._id || null,
          coleccion: art.colecciones?.[0]?.name || "",
          idColeccion: art.colecciones?.[0]?._id || null,
          familia: art.familias?.[0]?.name || "",
          idFamilia: art.familias?.[0]?._id || null,
          marca: art.marcas?.[0]?.name || "",
          idMarca: art.marcas?.[0]?._id || null,
          piezasPorCaja: art.piezasPorCaja || 0,
        };
      })
      .filter((el) => el !== null);

    const AI = await Inventarios.find({ is_active: "Si", cantidad: { $gt: 0 } })
      .populate({ path: "articulos", populate: { path: "lineas" } })
      .populate({ path: "articulos", populate: { path: "colecciones" } })
      .populate({ path: "articulos", populate: { path: "marcas" } })
      .populate({ path: "articulos", populate: { path: "familias" } });

    const idDany2 = AI
  .filter((a) => a.articulos[0]?.visibleInventario === "Si")
    .map((a) => {
      const art = a.articulos?.[0];
      if (!art?._id) return null;

      return {
        codigo: art.codigo || "",
        nombre: `${art.codigo || ""} ${art.nombre || ""}`,
        idArticulo: art._id,
        disponible: a.cantidad || 0,
        pedido: 0,
        traspaso: 0,
        porRecibir: 0,
        inventario: a.cantidad || 0,
        precio: art.venta || 0,
        linea: art.lineas?.[0]?.name || "",
        idLinea: art.lineas?.[0]?._id || null,
        coleccion: art.colecciones?.[0]?.name || "",
        idColeccion: art.colecciones?.[0]?._id || null,
        familia: art.familias?.[0]?.name || "",
        idFamilia: art.familias?.[0]?._id || null,
        marca: art.marcas?.[0]?.name || "",
        idMarca: art.marcas?.[0]?._id || null,
        piezasPorCaja: art.piezasPorCaja || 0,
      };
    }).filter((el) => el !== null);

    const PR = await ArticulosEmbarques.find({
      is_active: "Si",
      pendiente_recibir: { $gte: 0 },
    })
      .populate({ path: "articulos", populate: { path: "lineas" } })
      .populate({ path: "articulos", populate: { path: "colecciones" } })
      .populate({ path: "articulos", populate: { path: "marcas" } })
      .populate({ path: "articulos", populate: { path: "familias" } });

    const PR2 = PR.map((a) => {
      const art = a.articulos?.[0];
      if (!art?._id) return null;

      return {
        codigo: art.codigo || "",
        nombre: `${art.codigo || ""} ${art.nombre || ""}`,
        idArticulo: art._id,
        disponible: a.pendiente_recibir || 0,
        pedido: 0,
        inventario: 0,
        porRecibir: a.pendiente_recibir || 0,
        traspaso: 0,
        precio: art.venta || 0,
        linea: art.lineas?.[0]?.name || "",
        idLinea: art.lineas?.[0]?._id || null,
        coleccion: art.colecciones?.[0]?.name || "",
        idColeccion: art.colecciones?.[0]?._id || null,
        familia: art.familias?.[0]?.name || "",
        idFamilia: art.familias?.[0]?._id || null,
        marca: art.marcas?.[0]?.name || "",
        idMarca: art.marcas?.[0]?._id || null,
        piezasPorCaja: art.piezasPorCaja || 0,
      };
    }).filter((el) => el !== null);

    const PROC = await ArticulosOC.find({
      is_active: "Si",
      pendiente_embarcar: { $gte: 0 },
    })
      .populate({ path: "articulos", populate: { path: "lineas" } })
      .populate({ path: "articulos", populate: { path: "colecciones" } })
      .populate({ path: "articulos", populate: { path: "marcas" } })
      .populate({ path: "articulos", populate: { path: "familias" } });

    const PROC2 = PROC.map((a) => {
      const art = a.articulos?.[0];
      if (!art?._id) return null;

      return {
        codigo: art.codigo || "",
        nombre: `${art.codigo || ""} ${art.nombre || ""}`,
        idArticulo: art._id,
        disponible: a.pendiente_embarcar || 0,
        pedido: 0,
        inventario: 0,
        porRecibir: a.pendiente_embarcar || 0,
        traspaso: 0,
        precio: art.venta || 0,
        linea: art.lineas?.[0]?.name || "",
        idLinea: art.lineas?.[0]?._id || null,
        coleccion: art.colecciones?.[0]?.name || "",
        idColeccion: art.colecciones?.[0]?._id || null,
        familia: art.familias?.[0]?.name || "",
        idFamilia: art.familias?.[0]?._id || null,
        marca: art.marcas?.[0]?.name || "",
        idMarca: art.marcas?.[0]?._id || null,
        piezasPorCaja: art.piezasPorCaja || 0,
      };
    }).filter((el) => el !== null);

    // Pendiente de TRASPASO (todas las áreas): mercancía comprometida a salir por
    // solicitudes de traspaso aún no surtidas. Se RESTA del disponible y se
    // refleja en la columna "Pendiente Traspaso" (antes siempre quedaba en 0).
    const TS = await ArticulosTSolV2.find({
      is_active: "Si",
      pendiente_surtir: { $gt: 0 },
    })
      .populate({ path: "articulos", populate: { path: "lineas" } })
      .populate({ path: "articulos", populate: { path: "colecciones" } })
      .populate({ path: "articulos", populate: { path: "marcas" } })
      .populate({ path: "articulos", populate: { path: "familias" } });

    const TS2 = TS.map((a) => {
      const art = a.articulos?.[0];
      if (!art?._id) return null;

      return {
        codigo: art.codigo || "",
        nombre: `${art.codigo || ""} ${art.nombre || ""}`,
        idArticulo: art._id,
        disponible: -(a.pendiente_surtir || 0),
        pedido: 0,
        inventario: 0,
        porRecibir: 0,
        traspaso: a.pendiente_surtir || 0,
        precio: art.venta || 0,
        linea: art.lineas?.[0]?.name || "",
        idLinea: art.lineas?.[0]?._id || null,
        coleccion: art.colecciones?.[0]?.name || "",
        idColeccion: art.colecciones?.[0]?._id || null,
        familia: art.familias?.[0]?.name || "",
        idFamilia: art.familias?.[0]?._id || null,
        marca: art.marcas?.[0]?.name || "",
        idMarca: art.marcas?.[0]?._id || null,
        piezasPorCaja: art.piezasPorCaja || 0,
      };
    }).filter((el) => el !== null);

    const otra2 = [...idDany, ...idDany2, ...PR2, ...PROC2, ...TS2];

    const agrupado = otra2.reduce((groups, item) => {
      const val = item.idArticulo;
      groups[val] = groups[val] || {
        idArticulo: item.idArticulo,
        disponible: 0,
        pedido: 0,
        porRecibir: 0,
        traspaso: 0,
        inventario: 0,
      };

      groups[val].disponible += item.disponible;
      groups[val].porRecibir += item.porRecibir;
      groups[val].pedido += item.pedido;
      groups[val].traspaso += item.traspaso;
      groups[val].inventario += item.inventario;

      groups[val].codigo = item.codigo;
      groups[val].nombre = item.nombre;
      groups[val].precio = item.precio;
      groups[val].linea = item.linea;
      groups[val].idLinea = item.idLinea;
      groups[val].coleccion = item.coleccion;
      groups[val].idColeccion = item.idColeccion;
      groups[val].familia = item.familia;
      groups[val].idFamilia = item.idFamilia;
      groups[val].marca = item.marca;
      groups[val].idMarca = item.idMarca;
      groups[val].piezasPorCaja = item.piezasPorCaja;

      return groups;
    }, {});

    const otra3 = Object.values(agrupado);
    res.status(200).json(otra3);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
},

findDisponiblePedidos: async (req, res) => {
  try {
    const AP = await ArticulosPedido.find({
      is_active: "Si",
      autorizadoSurtido: "Si",
    })
      .populate({ path: "articulos", populate: { path: "lineas" } })
      .populate({ path: "articulos", populate: { path: "colecciones" } })
      .populate({ path: "articulos", populate: { path: "familias" } })
      .populate({ path: "articulos", populate: { path: "marcas" } })
      .populate({ path: "pedidos", populate: { path: "areas" } });

    const idDany = AP
      .filter((a) => a.pedidos?.[0]?.surtido === "No")
      .map((a) => {
        const art = a.articulos?.[0];
        if (!art?._id) return null;

        return {
          codigo: art.codigo || "",
          nombre: `${art.codigo || ""} ${art.nombre || ""}`,
          idArticulo: art._id,
          disponible: -a.pendiente_surtir || 0,
          pedido: a.pendiente_surtir || 0,
          inventario: 0,
          traspaso: 0,
          porRecibir: 0,
          precio: art.venta || 0,
          linea: art.lineas?.[0]?.name || "",
          idLinea: art.lineas?.[0]?._id || null,
          coleccion: art.colecciones?.[0]?.name || "",
          idColeccion: art.colecciones?.[0]?._id || null,
          familia: art.familias?.[0]?.name || "",
          idFamilia: art.familias?.[0]?._id || null,
          marca: art.marcas?.[0]?.name || "",
          idMarca: art.marcas?.[0]?._id || null,
          piezasPorCaja: art.piezasPorCaja || 0,
        };
      })
      .filter((el) => el !== null);

    const AI = await Inventarios.find({ is_active: "Si", cantidad: { $gt: 0 } })
      .populate({ path: "articulos", populate: { path: "lineas" } })
      .populate({ path: "articulos", populate: { path: "colecciones" } })
      .populate({ path: "articulos", populate: { path: "marcas" } })
      .populate({ path: "articulos", populate: { path: "familias" } });

    const idDany2 = AI
  .filter((a) => a.articulos[0]?.visibleInventario === "Si")
    .map((a) => {
      const art = a.articulos?.[0];
      if (!art?._id) return null;

      return {
        codigo: art.codigo || "",
        nombre: `${art.codigo || ""} ${art.nombre || ""}`,
        idArticulo: art._id,
        disponible: a.cantidad || 0,
        pedido: 0,
        traspaso: 0,
        porRecibir: 0,
        inventario: a.cantidad || 0,
        precio: art.venta || 0,
        linea: art.lineas?.[0]?.name || "",
        idLinea: art.lineas?.[0]?._id || null,
        coleccion: art.colecciones?.[0]?.name || "",
        idColeccion: art.colecciones?.[0]?._id || null,
        familia: art.familias?.[0]?.name || "",
        idFamilia: art.familias?.[0]?._id || null,
        marca: art.marcas?.[0]?.name || "",
        idMarca: art.marcas?.[0]?._id || null,
        piezasPorCaja: art.piezasPorCaja || 0,
      };
    }).filter((el) => el !== null);

    // const PR = await ArticulosEmbarques.find({
    //   is_active: "Si",
    //   pendiente_recibir: { $gte: 0 },
    // })
    //   .populate({ path: "articulos", populate: { path: "lineas" } })
    //   .populate({ path: "articulos", populate: { path: "colecciones" } })
    //   .populate({ path: "articulos", populate: { path: "marcas" } })
    //   .populate({ path: "articulos", populate: { path: "familias" } });

    // const PR2 = PR.map((a) => {
    //   const art = a.articulos?.[0];
    //   if (!art?._id) return null;

    //   return {
    //     codigo: art.codigo || "",
    //     nombre: `${art.codigo || ""} ${art.nombre || ""}`,
    //     idArticulo: art._id,
    //     disponible: a.pendiente_recibir || 0,
    //     pedido: 0,
    //     inventario: 0,
    //     porRecibir: a.pendiente_recibir || 0,
    //     traspaso: 0,
    //     precio: art.venta || 0,
    //     linea: art.lineas?.[0]?.name || "",
    //     idLinea: art.lineas?.[0]?._id || null,
    //     coleccion: art.colecciones?.[0]?.name || "",
    //     idColeccion: art.colecciones?.[0]?._id || null,
    //     familia: art.familias?.[0]?.name || "",
    //     idFamilia: art.familias?.[0]?._id || null,
    //     marca: art.marcas?.[0]?.name || "",
    //     idMarca: art.marcas?.[0]?._id || null,
    //     piezasPorCaja: art.piezasPorCaja || 0,
    //   };
    // }).filter((el) => el !== null);

    // const PROC = await ArticulosOC.find({
    //   is_active: "Si",
    //   pendiente_embarcar: { $gte: 0 },
    // })
    //   .populate({ path: "articulos", populate: { path: "lineas" } })
    //   .populate({ path: "articulos", populate: { path: "colecciones" } })
    //   .populate({ path: "articulos", populate: { path: "marcas" } })
    //   .populate({ path: "articulos", populate: { path: "familias" } });

    // const PROC2 = PROC.map((a) => {
    //   const art = a.articulos?.[0];
    //   if (!art?._id) return null;

    //   return {
    //     codigo: art.codigo || "",
    //     nombre: `${art.codigo || ""} ${art.nombre || ""}`,
    //     idArticulo: art._id,
    //     disponible: a.pendiente_embarcar || 0,
    //     pedido: 0,
    //     inventario: 0,
    //     porRecibir: a.pendiente_embarcar || 0,
    //     traspaso: 0,
    //     precio: art.venta || 0,
    //     linea: art.lineas?.[0]?.name || "",
    //     idLinea: art.lineas?.[0]?._id || null,
    //     coleccion: art.colecciones?.[0]?.name || "",
    //     idColeccion: art.colecciones?.[0]?._id || null,
    //     familia: art.familias?.[0]?.name || "",
    //     idFamilia: art.familias?.[0]?._id || null,
    //     marca: art.marcas?.[0]?.name || "",
    //     idMarca: art.marcas?.[0]?._id || null,
    //     piezasPorCaja: art.piezasPorCaja || 0,
    //   };
    // }).filter((el) => el !== null);

    const otra2 = [...idDany, ...idDany2
      // , ...PR2, ...PROC2
    ];

    const agrupado = otra2.reduce((groups, item) => {
      const val = item.idArticulo;
      groups[val] = groups[val] || {
        idArticulo: item.idArticulo,
        disponible: 0,
        pedido: 0,
        porRecibir: 0,
        traspaso: 0,
        inventario: 0,
      };

      groups[val].disponible += item.disponible;
      groups[val].porRecibir += item.porRecibir;
      groups[val].pedido += item.pedido;
      groups[val].traspaso += item.traspaso;
      groups[val].inventario += item.inventario;

      groups[val].codigo = item.codigo;
      groups[val].nombre = item.nombre;
      groups[val].precio = item.precio;
      groups[val].linea = item.linea;
      groups[val].idLinea = item.idLinea;
      groups[val].coleccion = item.coleccion;
      groups[val].idColeccion = item.idColeccion;
      groups[val].familia = item.familia;
      groups[val].idFamilia = item.idFamilia;
      groups[val].marca = item.marca;
      groups[val].idMarca = item.idMarca;
      groups[val].piezasPorCaja = item.piezasPorCaja;

      return groups;
    }, {});

    const otra3 = Object.values(agrupado);
    res.status(200).json(otra3);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
},

  findDisponibleArticulo: async (req, res) => {
    const { articulo, cantidad } = req.params;
    try {
      let AP = await ArticulosPedido.find({
        articulos: articulo,
        is_active: "Si",
        // pendiente_surtir: { $gte: 0 },
        autorizadoSurtido: "Si",
      })
      .populate({path: 'articulos', populate:{path: 'lineas'}})
      .populate({path: 'pedidos', populate:{path: 'areas'}})


      let idDany = await AP.map((a) => {
        // if(a.pedidos[0].areas[0]._id == process.env.REACT_APP_AREAS_CEDIS ){
        return {
          idArticulo: a.articulos[0]._id,
          disponible: -a.pendiente_surtir,
        }
      // }
      }).filter(function (el) {
        return el != null;
      })

      // let AS = await ArticulosTSolV2.find({
      //   articulos: articulo,
      //   is_active: "Si",
      //   autorizadoApartado: "Si",
      // })
      // .populate({path: 'articulos', populate:{path: 'lineas'}})
      // .populate({path: 'traspasosSolicitudV2', populate:{path: 'areaSalida'}})


      // let idDany3 = await AS.map((a) => {
      //   if(a.traspasosSolicitudV2[0].areaSalida[0]._id == process.env.REACT_APP_AREAS_CEDIS ){
      //   return {
      //     idArticulo: a.articulos[0]._id,
      //     disponible: -a.pendiente_surtir,
      //   }}
      // }).filter(function (el) {
      //   return el != null;
      // })

      let AI = await Inventarios.find({ is_active: "Si", cantidad: { $gt: 0 }, areas: process.env.REACT_APP_AREAS_CEDIS, articulos: articulo})
      .populate({path: 'articulos', populate:{path: 'lineas'}})

      let idDany2 = await AI
  .filter((a) => a.articulos[0]?.visibleInventario === "Si")
      .map((a) => {
        return {
          idArticulo: a.articulos[0]._id,
          disponible: a.cantidad,
        };
      });

      let otra2 = await idDany.concat(idDany2
        // , idDany3
      );

      let agrupado = otra2.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          disponible: 0,
        };
        groups[val].disponible += item.disponible;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let otra3 = Object.values(agrupado);


      if((otra3[0].disponible - cantidad) >=0 ){
        res.status(200).json({ message: "Si tiene Disponible" });
      }else{
        res.status(400).json({ message: "Algun articulo No tiene Disponible, por favor refresca la pagina" });
      }

      // res.status(200).json(otra3);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  findTracking: async (req, res) => {
    const { articulo } = req.params;
    try {
      let AP = await ArticulosPedido.find({
        articulos: articulo,
        is_active: "Si",
        // pendiente_surtir: { $gte: 0 },
      })
        .populate("pedidos")
        .populate("articulos");

      let ids = await AP.map((a) => a.articulos[0]._id);
      let idC = await AP.map((a) => ({
        articulo: a.articulos[0]._id,
      }));

      let idDany = await AP.map((a) => {
        return {
          codigo: a.articulos[0].codigo,
          nombre: a.articulos[0].nombre,
          idArticulo: a.articulos[0]._id,
          disponible: -a.pendiente_surtir,
          pedido: a.pendiente_surtir,
          inventario: 0,
        };
      });

      let AI = await Inventarios.find({
        articulos: articulo,
        is_active: "Si",
      })

        .populate({ path: "surtidos", populate: { path: "pedidos" } })
        .populate({
          path: "devoluciones",
          populate: { path: "surtidos", populate: { path: "pedidos" } },
        })
        .populate({
          path: "articulosPedido",
          populate: { path: "pedidos", populate: { path: "clientes" } },
        })
        .populate("articulos")
        .populate("articulosOC")

      let idDany2 = await AI
  .filter((a) => a.articulos[0]?.visibleInventario === "Si")
  .map((a) => {
        return {
          codigo: a.articulos[0].codigo,
          nombre: a.articulos[0].nombre,
          idArticulo: a.articulos[0]._id,
          disponible: a.cantidad,
          pedido: 0,
          inventario: a.cantidad,
        };
      });

      let otra2 = await idDany.concat(idDany2);

      let agrupado = otra2.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          disponible: 0,
          pedido: 0,
          inventario: 0,
        };
        groups[val].disponible += item.disponible;
        groups[val].pedido += item.pedido;
        groups[val].inventario += item.inventario;
        groups[val].codigo = item.codigo;
        groups[val].nombre = item.nombre;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let otra3 = Object.values(agrupado);

      res.status(200).json(otra3);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  findDesarrolloPendRecibir: async (req, res) => {
    try {
      let AI = await Inventarios.find().populate({
        path: "articulosOC"
      });

      let temp = await AI
  .filter((a) => a.articulos[0]?.visibleInventario === "Si")
  .map((a) => {
        return {
          idArticulosOC: a.articulosOC[0]._id,
          recibido: a.cantidad,
          pendiente_recibir: 0,
          cantidad: 0,
        };
      });

      let agrupado1 = temp.reduce(function (groups, item) {
        const val = item["idArticulosOC"];
        groups[val] = groups[val] || {
          idArticulosOC: item.idArticulosOC,
          recibido: 0,
          pendiente_recibir: 0,
          cantidad: 0,
        };
        groups[val].recibido += item.recibido;
        groups[val].cantidad += item.cantidad;
        groups[val].idArticulosOC = item.idArticulosOC;
        groups[val].pendiente_recibir = item.pendiente_recibir;
        return groups;
      }, []);

      let otra1 = Object.values(agrupado1);

      let AOC = await ArticulosOC.find();

      let temp2 = await AOC.map((a) => {
        return {
          idArticulosOC: a._id,
          cantidad: a.cantidad,
          recibido: 0,
          pendiente_recibir: 0,
        };
      });
      let otra2 = Object.values(temp2);

      let otra3 = otra1.concat(otra2);

      let agrupado2 = otra3.reduce(function (groups, item) {
        const val = item["idArticulosOC"];
        groups[val] = groups[val] || {
          idArticulosOC: item.idArticulosOC,
          recibido: 0,
          cantidad: 0,
          pendiente_recibir: 0,
        };
        groups[val].recibido += item.recibido;
        groups[val].idArticulosOC = item.idArticulosOC;
        groups[val].pendiente_recibir += item.pendiente_recibir;
        groups[val].cantidad += item.cantidad;
        return groups;
      }, []);
      let otra4 = Object.values(agrupado2);

      res.status(200).json(otra4);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  create: (req, res) => {
    const { body } = req;
    const newInventarios = new Inventarios(body);
    const inventario = newInventarios
      .save()
      .then((respDB) => res.status(201).json(respDB))
      .catch((err) => console.log(err));
  },
  delete: (req, res) => {
    Inventarios.findByIdAndDelete(req.params.id)
      .then((resDB) => res.status(204).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  edit: async (req, res) => {
    const { body } = req;
    let rollo = await Inventarios.findById(req.params.id);
    let cantidadOriginal = rollo.cantidad;
    let cantidadNueva = body.cantidad;

    // Editamos ArticulosOC
    let idArticulosOC = rollo.articulosOC;
    let AOC = await ArticulosOC.findById(idArticulosOC);
    if (AOC != null) {
      let recibidoAOCOriginal = AOC.recibido;
      let recibidoAOCNueva =
        recibidoAOCOriginal - cantidadOriginal + cantidadNueva;
      let pendienteRecibirAOCOriginal = AOC.pendiente_recibir;
      let pendienteRecibirAOCNueva =
        pendienteRecibirAOCOriginal + cantidadOriginal - cantidadNueva;
      let AOCFin = await ArticulosOC.findByIdAndUpdate(
        idArticulosOC,
        {
          recibido: recibidoAOCNueva,
          pendiente_recibir: pendienteRecibirAOCNueva,
        },
        { new: true }
      );
    }

    // Editamos ComprasAcumulados
    let CA = await ComprasAcumulados.find({ articulosOC: idArticulosOC });
    if (CA.length > 0) {
      let cantidadCAOriginal = CA[0].cantidad;
      let cantidadCANueva =
        cantidadCAOriginal - cantidadOriginal + cantidadNueva;
      let CAFin = await ComprasAcumulados.findByIdAndUpdate(
        CA[0]._id,
        { cantidad: cantidadCANueva },
        { new: true }
      );
    }


    Inventarios.findByIdAndUpdate(req.params.id, body, { new: true })
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },
  editSurtido: async (req, res) => {
    const { body } = req;
    try {
      const inv = await Inventarios.findByIdAndUpdate(
        req.params.id,
        {
          surtidos: body.surtidos,
          vendido: body.vendido,
          devoluciones: [],
          articulosPedido: body.articulosPedido,
        },
        { new: true }
      );
      const newAS = new ArticulosSurtidos({
        surtidos: body.surtidos,
        inventarios: req.params.id,
      });
      newAS.save();
      res.status(200).json({ message: "Se guardo el Surtido" });
    } catch (error) {
      res.status(400).json(error);
    }
  },
  editDevolucion: async (req, res) => {
    const { body } = req;
    try {
      const inv = await Inventarios.findByIdAndUpdate(
        req.params.id,
        {
          devoluciones: body.devoluciones,
          vendido: body.vendido,
          surtidos: [],
          articulosPedido: [],
        },
        { new: true }
      );
      const newAS = new ArticulosDevoluciones({
        devoluciones: body.devoluciones,
        inventarios: req.params.id,
      });
      newAS.save();
      res.status(200).json({ message: "Se guardo la devolucion" });
    } catch (error) {
      res.status(400).json(error);
    }
  },
  editBaja: (req, res) => {
    const { body } = req;
    Inventarios.updateMany(
      { compras: req.params.id },
      { is_active: body.is_active }
    )
      .then((resDB) => res.status(201).json(resDB))
      .catch((err) => res.status(400).json(err));
  },

  editCompra: async (req, res) => {
    const { body } = req;
    try {
      // let emb = await Embarques.findById(body.embarques);
      // let piezas = emb.total_cantidad;
      // let gastoTotal = emb.total_gasto;

      // var gastoXPieza = gastoTotal / piezas;

      // let artEmb = await ArticulosEmbarques.find({
      //   embarques: body.embarques,
      //   articulos: body.articulos,
      // });

      // let costoPieza = body.precioMX + gastoXPieza;
      // await ArticulosEmbarques.findByIdAndUpdate(artEmb[0]._id, {
      //   costoUnitario: costoPieza,
      // });

      // let artInv = await Inventarios.find({
      //   articulos: artEmb[0].articulos,
      //   cantidad: { $gte: 0 },
      // });

      // let CA = artInv.map((c) => parseFloat(c.cantidad));
      // let CA2 = CA.reduce((t, total, index) => t + total, 0);

      // if (CA2 > 0) {
      //   let costoTotalPrevio = CA2 * artInv[0].costoUnitario;
      //   let costoTotalNuevo = costoPieza * body.cantidad;

      //   let sumaTotal = costoTotalPrevio + costoTotalNuevo;
      //   let sumaCantidad = CA2 + body.cantidad;

      //   let gastoNuevo = sumaTotal / sumaCantidad;

      //   await Inventarios.updateMany(
      //     { articulos: artEmb[0].articulos },
      //     { costoUnitario: gastoNuevo }
      //   );

      //   let inv = await Inventarios.findOneAndUpdate(
      //     { areas: [body.areas], articulos: [body.articulos] },
      //     {
      //       $inc: { cantidad: body.cantidad },
      //       is_active: "Si",
      //       costoUnitario: gastoNuevo,
      //     },
      //     { new: true, upsert: true }
      //   );
      // } else {
      //   await Inventarios.updateMany(
      //     { articulos: artEmb[0].articulos },
      //     { costoUnitario: costoPieza }
      //   );

      // Quite el costo unitario, no se si esta bien, no se si lo ocupan y agregue la comrpa directa q no tiene embarques, por lo tanto no tiene gastos emabarques
        let inv = await Inventarios.findOneAndUpdate(
          { areas: [body.areas], articulos: [body.articulos] },
          {
            $inc: { cantidad: body.cantidad },
            is_active: "Si",
            costoUnitario: 0,
          },
          { new: true, upsert: true }
        )
      // }

      res.status(200).json({ message: "Se guardo la compra" });
    } catch (error) {
      res.status(400).json(error);
    }
  },
  edit: (req, res)=>{
    const { body } = req
    Inventarios.findByIdAndUpdate(req.params.id, body, { new: true})
    .then((resDB)=> res.status(201).json(resDB))
    .catch((err)=> res.status(400).json(err))
},
  cargaInicial: async (req, res) => {
  const { body } = req;
  try {
    let inv = await Inventarios.findOneAndUpdate( { areas: [body.areas],articulos: [body.articulos], },
      { $inc: { cantidad: body.cantidad }, is_active: "Si"}, { new: true, upsert: true } );
    res.status(200).json({ message: "Se guardo" });
  } catch (error) {
    res.status(400).json(error);
  }
},
// desarrollo: async (req, res) => {
//   const { body } = req;
//   let a = await AbonosProveedores.updateMany(
//     { bancos: "6498f70f7bf6ed07248df59e" },
//   )
//   let b = await AbonosTiendas.updateMany(
//     { bancos: "6498f70f7bf6ed07248df59e" },
//   )
//   let c = await Comisiones.updateMany(
//     { bancos: "6498f70f7bf6ed07248df59e" },
//   )
//   let d = await GastosGeneral.updateMany(
//     { bancos: "6498f70f7bf6ed07248df59e" },
//   )
//   let e = await GastosTiendas.updateMany(
//     { bancos: "6498f70f7bf6ed07248df59e" },
//   )
//     .then((resDB) => res.status(200).json({ message: "Listo" }))
//     .catch((err) => res.status(400).json(err));
// },
};