const {
  ArticulosOC,
  ArticulosPedido,
  Inventarios,
  ComprasAcumulados,
  ArticulosSurtidos,
  ArticulosDevoluciones,
  ArticulosDevolucionesFiscal,
  ArticulosTSolV2,
  ArticulosTS,
  ArticulosTE,
  ArticulosVentasTiendas,
  ArticulosAjustesInv,
  ArticulosDevolucionesTiendas,
  ArticulosME,
  ArticulosMS
} = require("../models");
const moment = require('moment')
const mongoose = require("mongoose");

module.exports = {
  findAll: async (req, res) => {
    const { articulo } = req.params;
    try {

   // Ajustes Inventario
   let Aajus = await ArticulosAjustesInv.find({
    articulos: articulo,
  })
    .populate({ path: "ajustesInventario", populate: { path: "areas" } })
    .populate("articulos");

  let arrayAajus = await Aajus.map((a) => {
    return {
      fecha: a.ajustesInventario[0].fecha,
      tipoMov: "Ajuste de Inventario",
      numMov: a.ajustesInventario[0].idAjustesInventario,
      destino: a.ajustesInventario[0].areas[0].name,
      idMov: a.ajustesInventario[0]._id,
      cantidad: a.cantidad,
      idArticulo: a.articulos[0]._id,
    }
})
.filter(function (el) {
  return el != null;
})


// Muestras Salida
      let AMS = await ArticulosMS.find({
        articulos: articulo,
      })
        .populate({ path: "muestrasSalida", populate: { path: "clientes" } })
        .populate("articulos");
      // muestrasSalida
      let arrayAMS = await AMS.map((a) => {
        return {
          fecha: a.muestrasSalida[0].fecha,
          tipoMov: "Salida de Muestra",
          numMov: a.muestrasSalida[0].idMuestrasSalida,
          destino: a.muestrasSalida[0].clientes[0].nombre_comercial,
          idMov: a.muestrasSalida[0]._id,
          cantidad: a.cantidad,
          idArticulo: a.articulos[0]._id,
        };
      });

// Muestras entrada
      let AME = await ArticulosME.find({
        articulos: articulo,
      })
        .populate({ path: "muestrasEntrada", populate: { path: "clientes" } })
        .populate("articulos");
      // muestrasEntrada
      let arrayAME = await AME.map((a) => {
        return {
          fecha: a.muestrasEntrada[0].fecha,
          tipoMov: "Entrada de Muestra",
          numMov: a.muestrasEntrada[0].idMuestrasEntrada,
          destino: a.muestrasEntrada[0].clientes[0].nombre_comercial,
          idMov: a.muestrasEntrada[0]._id,
          cantidad: a.cantidad,
          idArticulo: a.articulos[0]._id,
        };
      });

      let AP = await ArticulosPedido.find({
        articulos: articulo,
        is_active: "Si",
      })
        .populate({ path: "pedidos", populate: { path: "clientes" } })
        .populate("articulos");
      // Pedidos
      let arrayAP = await AP.map((a) => {
        if(a.pedidos[0].is_active == "Si"){
        return {
          fecha: a.pedidos[0].fecha,
          tipoMov: "Pedido",
          numMov: a.pedidos[0].idPedido,
          destino: a.pedidos[0].clientes[0].nombre_comercial,
          idMov: a.pedidos[0]._id,
          cantidad: a.cantidad,
          idArticulo: a.articulos[0]._id,
        }} else{    
        return {
          fecha: a.pedidos[0].fecha,
          tipoMov: "Pedido Cancelado",
          numMov: a.pedidos[0].idPedido,
          destino: a.pedidos[0].clientes[0].nombre_comercial,
          idMov: a.pedidos[0]._id,
          cantidad: a.cantidad,
          idArticulo: a.articulos[0]._id,
        };
        }
      });

      let comp = await ComprasAcumulados.find({ articulos: articulo })
        .populate({
          path: "articulosEmbarques",
          populate: {
            path: "articulosOC",
            populate: {
              path: "ordenesCompra",
              populate: { path: "proveedores" },
            },
          },
        })
        .populate("compras")
        .populate("articulos");

      //   Compras
      let arrayCompras = await comp.map((a) => {
        return {
          fecha: a.compras[0].fecha,
          tipoMov: "Compra",
          numMov: a.compras[0].idCompras,
          destino: "NA",
            // a.articulosEmbarques[0].articulosOC[0].ordenesCompra[0]
            //   .proveedores[0].nombre_comercial,
          idMov: a.compras[0]._id,
          cantidad: a.cantidad,
          idArticulo: a.articulos[0]._id,
        };
      });

      let agrupadoCompras = arrayCompras.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let dataCompras = Object.values(agrupadoCompras);

      //   Ordenes Compras
      let AOC = await ArticulosOC.find({ articulos: articulo })
        .populate({ path: "ordenesCompra", populate: { path: "proveedores" } })
        .populate("articulos");

      let arrayAOC = await AOC.map((a) => {
        return {
          fecha: a.ordenesCompra[0].fecha,
          tipoMov: "Orden de Compra",
          numMov: a.ordenesCompra[0].idOrdenCompra,
          destino: a.ordenesCompra[0].proveedores[0].nombre_comercial,
          idMov: a.ordenesCompra[0]._id,
          cantidad: a.cantidad,
          idArticulo: a.articulos[0]._id,
        };
      });

      //   Surtidos

      let sur = await ArticulosSurtidos.find({ articulos: articulo })
        .populate({
          path: "surtidos",
          populate: { path: "pedidos", populate: { path: "clientes" } },
        })
        .populate("articulos");

      let arraySurtidos = await sur
        .map((a) => {
          return {
            fecha: a.surtidos[0].fecha,
            tipoMov: `Surtido (Pedido ${a.surtidos[0].pedidos[0].idPedido})`,
            numMov: a.surtidos[0].idSurtido,
            destino: a.surtidos[0].pedidos[0].clientes[0].nombre_comercial,
            idMov: a.surtidos[0]._id,
            cantidad: a.cantidad,
            idArticulo: a.articulos[0]._id,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoSurtidos = arraySurtidos.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let dataSurtidos = Object.values(agrupadoSurtidos);

      //   Devoluciones
      let dev = await ArticulosDevoluciones.find({ articulos: articulo })
        .populate({ path: "devoluciones", populate: { path: "clientes"}, })
        .populate("articulos");

      let arrayDevoluciones = await dev
        .map((a) => {
          return {
            fecha: a.devoluciones[0].fecha,
            tipoMov: "Devolucion",
            numMov: a.devoluciones[0].idDevolucion,
            destino: a.devoluciones[0].clientes[0].nombre_comercial,
            idMov: a.devoluciones[0]._id,
            cantidad: a.cantidad,
            idArticulo: a.articulos[0]._id,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoDevoluciones = arrayDevoluciones.reduce(function (
        groups,
        item
      ) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      },
      []);

      let dataDevoluciones = Object.values(agrupadoDevoluciones);

       //   Devoluciones Fiscal
      let devFis = await ArticulosDevolucionesFiscal.find({ articulos: articulo })
        .populate({ path: "devolucionesFiscal", populate: { path: "clientes"}, })
        .populate("articulos");

      let arrayDevolucionesFis = await devFis
        .map((a) => {
          return {
            fecha: a.devolucionesFiscal[0].fecha,
            tipoMov: "Devolucion",
            numMov: a.devolucionesFiscal[0].idDevolucion,
            destino: a.devolucionesFiscal[0].clientes[0].nombre_comercial,
            idMov: a.devolucionesFiscal[0]._id,
            cantidad: a.cantidad,
            idArticulo: a.articulos[0]._id,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoDevolucionesFis = arrayDevolucionesFis.reduce(function (
        groups,
        item
      ) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      },
      []);

      let dataDevolucionesFis = Object.values(agrupadoDevolucionesFis);

      //   Traspasos Solicitud
      let tsol = await ArticulosTSolV2.find({ articulos: articulo })
        .populate({
          path: "traspasosSolicitudV2",
          populate: { path: "areaSalida" },
        })
        .populate({
          path: "traspasosSolicitudV2",
          populate: { path: "areaDestino" },
        })
        .populate("articulos");

      let arrayTSol = await tsol
        .map((a) => {
          return {
            fecha: a.traspasosSolicitudV2[0].fecha,
            tipoMov: "Traspaso Solicitud",
            numMov: a.traspasosSolicitudV2[0].idTraspasosSolicitudV2,
            destino: a.traspasosSolicitudV2[0].areaSalida[0].name,
            idMov: a.traspasosSolicitudV2[0]._id,
            cantidad: a.cantidad,
            idArticulo: a.articulos[0]._id,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoTSol = arrayTSol.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let dataTSol = Object.values(agrupadoTSol);

      //   Traspasos Salida
      let ts = await ArticulosTS.find({ articulos: articulo })
        .populate({ path: "traspasosSalida", populate: { path: "areaSalida" } })
        .populate({
          path: "traspasosSalida",
          populate: { path: "areaDestino" },
        })
        .populate("articulos");

      let arrayTS = await ts
        .map((a) => {
          return {
            fecha: a.traspasosSalida[0].fecha,
            tipoMov: "Traspaso Salida",
            numMov: a.traspasosSalida[0].idTraspasosSalida,
            destino: a.traspasosSalida[0].areaSalida[0].name,
            idMov: a.traspasosSalida[0]._id,
            cantidad: a.cantidad,
            idArticulo: a.articulos[0]._id,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoTS = arrayTS.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let dataTS = Object.values(agrupadoTS);

      //   Traspasos Entreda
      let te = await ArticulosTE.find({ articulos: articulo })
        .populate({
          path: "traspasosEntrada",
          populate: { path: "areaEntrada" },
        })
        .populate({
          path: "traspasosEntrada",
          populate: {
            path: "traspasosSalida",
            populate: { path: "areaDestino" },
          },
        })
        .populate("articulos");

      let arrayTE = await te
        .map((a) => {
          return {
            fecha: a.traspasosEntrada[0].fecha,
            tipoMov: "Traspaso Entrada",
            numMov: a.traspasosEntrada[0].idTraspasosEntrada,
            destino:
              a.traspasosEntrada[0].traspasosSalida[0].areaDestino[0].name,
            idMov: a.traspasosEntrada[0]._id,
            cantidad: a.cantidad,
            idArticulo: a.articulos[0]._id,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoTE = arrayTE.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let dataTE = Object.values(agrupadoTE);

      let data = arrayAP
        .concat(
          dataCompras,
          arrayAOC,
          dataSurtidos,
          dataDevoluciones,
          dataDevolucionesFis,
          dataTSol,
          dataTS,
          dataTE,
          arrayAME,
          arrayAMS,
          arrayAajus
        )
        .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

      res.status(200).json(data);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  findKardex: async (req, res) => {
    const { articulo, area } = req.params;
    try {

            // Ajustes Inventario
            let Aajus = await ArticulosAjustesInv.find({
              articulos: articulo, areas: area
            })
              .populate({ path: "ajustesInventario", populate: { path: "areas" } })
              .populate("articulos");
       
            let arrayAajus = await Aajus.map((a) => {
              return {
                createdAt: a.createdAt,
                fecha: a.ajustesInventario[0].fecha,
                tipoMov: "Ajuste de Inventario",
                numMov: a.ajustesInventario[0].idAjustesInventario,
                destino: "NA",
                idMov: a.ajustesInventario[0]._id,
                cantidad: a.cantidad,
                idArticulo: a.articulos[0]._id,
              }
          })
          .filter(function (el) {
            return el != null;
          })

      // Muestras Salida
      let AMS = await ArticulosMS.find({
        articulos: articulo,
      })
        .populate({ path: "muestrasSalida", populate: { path: "clientes" } })
        .populate({ path: "muestrasSalida", populate: { path: "areas" } })
        .populate("articulos");
      // muestrasSalida
      let arrayAMS = await AMS.map((a) => {
        if (area == a.muestrasSalida[0].areas[0]._id) {
        return {
          createdAt: a.createdAt,
          fecha: a.muestrasSalida[0].fecha,
          tipoMov: "Salida de Muestra",
          numMov: a.muestrasSalida[0].idMuestrasSalida,
          destino: a.muestrasSalida[0].clientes[0].nombre_comercial,
          idMov: a.muestrasSalida[0]._id,
          cantidad: -a.cantidad,
          idArticulo: a.articulos[0]._id,
        }
      }
    })
    .filter(function (el) {
      return el != null;
    })

      // Muestras entrada
      let AME = await ArticulosME.find({
        articulos: articulo,
      })
        .populate({ path: "muestrasEntrada", populate: { path: "clientes" } })
        .populate({ path: "muestrasEntrada", populate: { path: "areas" } })
        .populate("articulos");
      // muestrasEntrada
      let arrayAME = await AME.map((a) => {
        if (area == a.muestrasEntrada[0].areas[0]._id) {
        return {
          createdAt: a.createdAt,
          fecha: a.muestrasEntrada[0].fecha,
          tipoMov: "Entrada de Muestra",
          numMov: a.muestrasEntrada[0].idMuestrasEntrada,
          destino: a.muestrasEntrada[0].clientes[0].nombre_comercial,
          idMov: a.muestrasEntrada[0]._id,
          cantidad: a.cantidad,
          idArticulo: a.articulos[0]._id,
        }
      }
    })
    .filter(function (el) {
      return el != null;
    })


      let comp = await ComprasAcumulados.find({
        articulos: articulo,
        areas: area,
      })
        .populate({
          path: "articulosEmbarques",
          populate: {
            path: "articulosOC",
            populate: {
              path: "ordenesCompra",
              populate: { path: "proveedores" },
            },
          },
        })
        .populate("compras")
        .populate("articulos")
        .populate("areas");

      //   Compras
      let arrayCompras = await comp
        .map((a) => {
          return {
            fecha: a.compras[0].fecha,
            createdAt: a.createdAt,
            tipoMov: "Compra",
            numMov: a.compras[0].idCompras,
            destino: "NA",
              // a.articulosEmbarques[0].articulosOC[0].ordenesCompra[0]
              //   .proveedores[0].nombre_comercial,
            idMov: a.compras[0]._id,
            cantidad: a.cantidad,
            idArticulo: a.articulos[0]._id,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoCompras = arrayCompras.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let dataCompras = Object.values(agrupadoCompras);

      //   Surtidos

      let sur = await ArticulosSurtidos.find({ articulos: articulo, areas:area })
        .populate({
          path: "surtidos",
          populate: { path: "pedidos", populate: { path: "clientes" } },
        })
        .populate({ path: "surtidos", populate: { path: "areas" } })
        .populate("articulos");

      let arraySurtidos = await sur
        .map((a) => {
            return {
              fecha: a.surtidos[0].fecha,
              createdAt: a.createdAt,
              tipoMov: `Surtido (Pedido ${a.surtidos[0].pedidos[0].idPedido})`,
              numMov: a.surtidos[0].idSurtido,
              destino: a.surtidos[0].pedidos[0].clientes[0].nombre_comercial,
              idMov: a.surtidos[0]._id,
              cantidad: -a.cantidad,
              idArticulo: a.articulos[0]._id,
            };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoSurtidos = arraySurtidos.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let dataSurtidos = Object.values(agrupadoSurtidos);

      //   Devoluciones Fiscal
      let devFis = await ArticulosDevolucionesFiscal.find({ articulos: articulo })
        .populate({ path: "devolucionesFiscal", populate: { path: "clientes"}, })
        .populate("articulos")
        .populate({ path: "devolucionesFiscal", populate: { path: "areas" } });

      let arrayDevolucionesFis = await devFis
        .map((a) => {
          if(a.devolucionesFiscal[0].areas[0]._id == area){
            return {
              fecha: a.devolucionesFiscal[0].fecha,
              createdAt: a.createdAt,
              tipoMov: "Devolucion",
              numMov: a.devolucionesFiscal[0].idDevolucion,
              destino: a.devolucionesFiscal[0].clientes[0] .nombre_comercial,
              idMov: a.devolucionesFiscal[0]._id,
              cantidad: a.cantidad,
              idArticulo: a.articulos[0]._id,
            }
          }
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoDevolucionesFis = arrayDevolucionesFis.reduce(function (
        groups,
        item
      ) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      },
      []);

      let dataDevolucionesFis = Object.values(agrupadoDevolucionesFis);

       //   Devoluciones
      let dev = await ArticulosDevoluciones.find({ articulos: articulo })
        .populate({ path: "devoluciones", populate: { path: "clientes"}, })
        .populate("articulos")
        .populate({ path: "devoluciones", populate: { path: "areas" } });

      let arrayDevoluciones = await dev
        .map((a) => {
          if(a.devoluciones[0].areas[0]._id == area){
            return {
              fecha: a.devoluciones[0].fecha,
              createdAt: a.createdAt,
              tipoMov: "Devolucion",
              numMov: a.devoluciones[0].idDevolucion,
              destino: a.devoluciones[0].clientes[0] .nombre_comercial,
              idMov: a.devoluciones[0]._id,
              cantidad: a.cantidad,
              idArticulo: a.articulos[0]._id,
            }
          }
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoDevoluciones = arrayDevoluciones.reduce(function (
        groups,
        item
      ) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      },
      []);

      let dataDevoluciones = Object.values(agrupadoDevoluciones);

      //   Traspasos Salida
      let ts = await ArticulosTS.find({ articulos: articulo, areas: area })
        .populate({ path: "traspasosSalida", populate: { path: "areaSalida" } })
        .populate({
          path: "traspasosSalida",
          populate: { path: "areaDestino" },
        })
        .populate("articulos");

      let arrayTS = await ts
        .map((a) => {
            return {
              fecha: a.traspasosSalida[0].fecha,
              createdAt: a.createdAt,
              tipoMov: "Traspaso Salida",
              numMov: a.traspasosSalida[0].idTraspasosSalida,
              destino: a.traspasosSalida[0].areaDestino[0].name,
              idMov: a.traspasosSalida[0]._id,
              cantidad: -a.cantidad,
              idArticulo: a.articulos[0]._id,
            };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoTS = arrayTS.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let dataTS = Object.values(agrupadoTS);

      //   Traspasos Entreda
      let te = await ArticulosTE.find({ articulos: articulo, areas: area })
        .populate({
          path: "traspasosEntrada",
          populate: {
            path: "traspasosSalida",
            populate: { path: "areaSalida" },
          },
        })
        .populate({
          path: "traspasosEntrada",
          populate: {
            path: "traspasosSalida",
            populate: { path: "areaDestino" },
          },
        })
        .populate("articulos");

      let arrayTE = await te
        .map((a) => {
            return {
              fecha: a.traspasosEntrada[0].fecha,
              createdAt: a.createdAt,
              tipoMov: "Traspaso Entrada",
              numMov: a.traspasosEntrada[0].idTraspasosEntrada,
              destino:
                a.traspasosEntrada[0].traspasosSalida[0].areaDestino[0].name,
              idMov: a.traspasosEntrada[0]._id,
              cantidad: a.cantidad,
              idArticulo: a.articulos[0]._id,
            };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoTE = arrayTE.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let dataTE = Object.values(agrupadoTE);

      let vt = await ArticulosVentasTiendas.find({ articulos: articulo, areas: area })
        .populate({ path: "ventasTiendas", populate: { path: "areas" } })
        .populate({ path: "ventasTiendas", populate: { path: "clientes" } })
        .populate("articulos");

      let arrayVT = await vt
        .map((a) => {
            const venta = a.ventasTiendas[0];
            return {
              fecha: venta.fecha,
              createdAt: a.createdAt,
              tipoMov: "Venta Tienda",
              // Mismo folio que el Reporte de Ventas de tiendas (ej. BN822),
              // no el consecutivo interno idVentaTienda
              numMov: venta.prefijo && venta.consecutivo != null
                ? `${venta.prefijo}${venta.consecutivo}`
                : venta.idVentaTienda,
              destino: (venta.clientes && venta.clientes[0] && venta.clientes[0].nombre_comercial) || venta.areas[0].name,
              idMov: a.ventasTiendas[0]._id,
              cantidad: -a.cantidad,
              idArticulo: a.articulos[0]._id,
            };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoVT = arrayVT.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let dataVT = Object.values(agrupadoVT);

      let dt = await ArticulosDevolucionesTiendas.find({ articulos: articulo, areas: area })
        .populate({ path: "devolucionesTiendas", populate: { path: "areas" } })
        .populate({ path: "devolucionesTiendas", populate: { path: "clientes" } })
        .populate("articulos");

      let arrayDT = await dt
        .map((a) => {
            const dev = a.devolucionesTiendas[0];
            return {
              fecha: dev.fecha,
              createdAt: a.createdAt,
              tipoMov: "Devolucion Tienda",
              numMov: dev.idDevolucionTienda,
              destino: (dev.clientes && dev.clientes[0] && dev.clientes[0].nombre_comercial) || dev.areas[0].name,
              idMov: a.devolucionesTiendas[0]._id,
              cantidad: a.cantidad,
              idArticulo: a.articulos[0]._id,
            };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoDT = arrayDT.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let dataDT = Object.values(agrupadoDT);

      let data = dataCompras
        .concat(dataSurtidos, dataDevoluciones, dataDevolucionesFis, dataTS, dataTE, dataVT, dataDT, arrayAME, arrayAMS, arrayAajus)
        .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

      res.status(200).json(data);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  findSellThru: async (req, res) => {
    const { articulo } = req.params;
    try {
      let comp = await ComprasAcumulados.find({ articulos: articulo }).populate(
        "articulos"
      );

      //   Compras
      let arrayCompras = await comp
        .map((a) => {
          return {
            entrada: a.cantidad,
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            ventas: 0,
            devoluciones: 0,
            existencia: 0,
            ajustes: 0,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoCompras = arrayCompras.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
        };
        groups[val].entrada += item.entrada;
        groups[val].ventas += item.ventas;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataCompras = Object.values(agrupadoCompras);

      //   Surtidos

      let sur = await ArticulosSurtidos.find({ articulos: articulo }).populate(
        "articulos"
      );

      let arraySurtidos = await sur
        .map((a) => {
          return {
            ventas: a.cantidad,
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            devoluciones: 0,
            existencia: 0,
            ajustes: 0,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoSurtidos = arraySurtidos.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
        };
        groups[val].entrada += item.entrada;
        groups[val].ventas += item.ventas;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataSurtidos = Object.values(agrupadoSurtidos);

      //   Devoluciones
      let dev = await ArticulosDevoluciones.find({
        articulos: articulo,
      }).populate("articulos");

      let arrayDevoluciones = await dev
        .map((a) => {
          return {
            devoluciones: a.cantidad,
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            ventas: 0,
            existencia: 0,
            ajustes: 0,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoDevoluciones = arrayDevoluciones.reduce(function (
        groups,
        item
      ) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
        };
        groups[val].entrada += item.entrada;
        groups[val].ventas += item.ventas;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      },
      []);

      let dataDevoluciones = Object.values(agrupadoDevoluciones);

      //   Devoluciones Tiendas
      let devT = await ArticulosDevolucionesTiendas.find({
        articulos: articulo,
      }).populate("articulos");

      let arrayDevolucionesT = await devT
        .map((a) => {
          return {
            devoluciones: a.cantidad,
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            ventas: 0,
            existencia: 0,
            ajustes: 0,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoDevolucionesT = arrayDevolucionesT.reduce(function (
        groups,
        item
      ) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
        };
        groups[val].entrada += item.entrada;
        groups[val].ventas += item.ventas;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      },
      []);

      let dataDevolucionesT = Object.values(agrupadoDevolucionesT);

      let vt = await ArticulosVentasTiendas.find({
        articulos: articulo,
      }).populate("articulos");

      let arrayVT = await vt
        .map((a) => {
          return {
            ventas: a.cantidad,
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            devoluciones: 0,
            existencia: 0,
            ajustes: 0,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoVT = arrayVT.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
        };
        groups[val].entrada += item.entrada;
        groups[val].ventas += item.ventas;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataVT = Object.values(agrupadoVT);

      let inv = await Inventarios.find({ articulos: articulo }).populate(
        "articulos"
      );

      let arrayInv = await inv
        .map((a) => {
          return {
            existencia: a.cantidad,
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            devoluciones: 0,
            ventas: 0,
            ajustes: 0,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoInv = arrayInv.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
        };
        groups[val].entrada += item.entrada;
        groups[val].ventas += item.ventas;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataInv = Object.values(agrupadoInv);

      let ajus = await ArticulosAjustesInv.find({
        articulos: articulo,
      }).populate("articulos");

      let arrayAjus = await ajus
        .map((a) => {
          return {
            ajustes: a.cantidad,
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            devoluciones: 0,
            ventas: 0,
            existencia: 0,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoAjus = arrayAjus.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
        };
        groups[val].entrada += item.entrada;
        groups[val].ventas += item.ventas;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataAjus = Object.values(agrupadoAjus);

      let data = dataCompras.concat(
        dataSurtidos,
        dataDevoluciones,
        dataDevolucionesT,
        dataVT,
        dataInv,
        dataAjus,
      );

      let agrupadoTodo = data.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
        };
        groups[val].entrada += item.entrada;
        groups[val].ventas += item.ventas;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataFin = Object.values(agrupadoTodo);

      res.status(200).json(dataFin);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  findSellThruArea: async (req, res) => {
    const { area, articulo } = req.params;
    try {

      //   Compras

          let comp = await ComprasAcumulados.find({ articulos: articulo }).populate(
        "articulos"
      );


      let arrayCompras = await comp
        .map((a) => {
          return {
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            compras: a.cantidad,
            ventas: 0,
            devoluciones: 0,
            existencia: 0,
            ajustes: 0,
            entrada: 0,
            salida:0
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoCompras = arrayCompras.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataCompras = Object.values(agrupadoCompras);


      //   Traspasos Entrada
      let ent = await ArticulosTE.find({ articulos: articulo, areas:area }).populate(
        "articulos"
      );


      let arrayEntrada = await ent
        .map((a) => {
          return {
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            compras:0,
            ventas: 0,
            devoluciones: 0,
            existencia: 0,
            ajustes: 0,
            entrada: a.cantidad,
            salida:0
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoEntrada = arrayEntrada.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataEntrada = Object.values(agrupadoEntrada);


      let sal = await ArticulosTS.find({ articulos: articulo, areas:area }).populate(
        "articulos"
      );

      //   Traspasos Salida
      let arraySalida = await sal
        .map((a) => {
          return {
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            ventas: 0,
            devoluciones: 0,
            existencia: 0,
            ajustes: 0,
            entrada: 0,
            salida: a.cantidad,
            compras:0
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoSalida = arraySalida.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataSalida = Object.values(agrupadoSalida);

      //   Surtidos

      let sur = await ArticulosSurtidos.find({ articulos: articulo, areas:area }).populate(
        "articulos"
      );

      let arraySurtidos = await sur
        .map((a) => {
          return {
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            devoluciones: 0,
            existencia: 0,
            ajustes: 0,
            salida: 0,
            ventas: a.cantidad,
            compras: 0
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoSurtidos = arraySurtidos.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataSurtidos = Object.values(agrupadoSurtidos);

      //   Devoluciones
      let dev = await ArticulosDevoluciones.find({
        articulos: articulo, areas:area
      }).populate("articulos");

      let arrayDevoluciones = await dev
        .map((a) => {
          return {
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            ventas: 0,
            devoluciones: a.cantidad,
            existencia: 0,
            ajustes: 0,
            salida: 0,
            compras: 0
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoDevoluciones = arrayDevoluciones.reduce(function (
        groups,
        item
      ) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      },
      []);

      let dataDevoluciones = Object.values(agrupadoDevoluciones);

      //   Devoluciones Tiendas
      let devT = await ArticulosDevolucionesTiendas.find({
        articulos: articulo, areas:area
      }).populate("articulos");

      let arrayDevolucionesT = await devT
        .map((a) => {
          return {
            devoluciones: a.cantidad,
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            ventas: 0,
            existencia: 0,
            ajustes: 0,
            salida: 0,
            compras: 0
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoDevolucionesT = arrayDevolucionesT.reduce(function (
        groups,
        item
      ) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      },
      []);

      let dataDevolucionesT = Object.values(agrupadoDevolucionesT);

      let vt = await ArticulosVentasTiendas.find({
        articulos: articulo, areas:area
      }).populate("articulos");

      let arrayVT = await vt
        .map((a) => {
          return {
            ventas: a.cantidad,
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            devoluciones: 0,
            existencia: 0,
            ajustes: 0,
            salida: 0,
            compras: 0
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoVT = arrayVT.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataVT = Object.values(agrupadoVT);

      let inv = await Inventarios.find({ articulos: articulo, areas:area }).populate(
        "articulos"
      );

      let arrayInv = await inv
        .map((a) => {
          return {
            existencia: a.cantidad,
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            devoluciones: 0,
            ventas: 0,
            ajustes: 0,
            salida: 0,
            compras: 0
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoInv = arrayInv.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataInv = Object.values(agrupadoInv);

      let ajus = await ArticulosAjustesInv.find({
        articulos: articulo, areas:area
      }).populate("articulos");

      let arrayAjus = await ajus
        .map((a) => {
          return {
            ajustes: a.cantidad,
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            devoluciones: 0,
            ventas: 0,
            existencia: 0,
            salida: 0,
            compras: 0
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoAjus = arrayAjus.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataAjus = Object.values(agrupadoAjus);

      let data = dataEntrada.concat(
        dataCompras,
        dataSalida,
        dataSurtidos,
        dataDevoluciones,
        dataDevolucionesT,
        dataVT,
        dataInv,
        dataAjus
      );

      let agrupadoTodo = data.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataFin = Object.values(agrupadoTodo);

      res.status(200).json(dataFin);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  
  findSellThruAreaGlobal: async (req, res) => {
    const { inicio, fin, area } = req.params;

    let startDate = moment(inicio).format("YYYY-MM-DDTHH:mm:ss.SSSZ"); 
    let endDate   = moment(fin).format("YYYY-MM-DDTHH:mm:ss.SSSZ"); 

    try {

        
      //   Traspasos Entrada
      let ent = await ArticulosTE.find({ areas:area, createdAt:{$gte:  new Date(startDate).toISOString(),
        $lte:  new Date(endDate).toISOString()} }).populate(
        "articulos"
      );


      let arrayEntrada = await ent
        .map((a) => {
          return {
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            compras:0,
            ventas: 0,
            devoluciones: 0,
            existencia: 0,
            ajustes: 0,
            entrada: a.cantidad,
            salida:0
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoEntrada = arrayEntrada.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataEntrada = Object.values(agrupadoEntrada);


      let sal = await ArticulosTS.find({ areas:area, createdAt:{$gte:  new Date(startDate).toISOString(),
        $lte:  new Date(endDate).toISOString()} }).populate(
        "articulos"
      );

      //   Traspasos Salida
      let arraySalida = await sal
        .map((a) => {
          return {
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            ventas: 0,
            devoluciones: 0,
            existencia: 0,
            ajustes: 0,
            entrada: 0,
            salida: a.cantidad,
            compras:0
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoSalida = arraySalida.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataSalida = Object.values(agrupadoSalida);

      //   Surtidos

      let sur = await ArticulosSurtidos.find({ areas:area, createdAt:{$gte:  new Date(startDate).toISOString(),
        $lte:  new Date(endDate).toISOString()} }).populate(
        "articulos"
      );

      let arraySurtidos = await sur
        .map((a) => {
          return {
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            devoluciones: 0,
            existencia: 0,
            ajustes: 0,
            salida: 0,
            ventas: a.cantidad,
            compras: 0
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoSurtidos = arraySurtidos.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataSurtidos = Object.values(agrupadoSurtidos);

      //   Devoluciones
      let dev = await ArticulosDevoluciones.find({ areas:area, createdAt:{$gte:  new Date(startDate).toISOString(),
        $lte:  new Date(endDate).toISOString()} }).populate("articulos");

      let arrayDevoluciones = await dev
        .map((a) => {
          return {
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            ventas: 0,
            devoluciones: a.cantidad,
            existencia: 0,
            ajustes: 0,
            salida: 0,
            compras: 0
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoDevoluciones = arrayDevoluciones.reduce(function (
        groups,
        item
      ) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      },
      []);

      let dataDevoluciones = Object.values(agrupadoDevoluciones);

      //   Devoluciones Tiendas
      let devT = await ArticulosDevolucionesTiendas.find({ areas:area, createdAt:{$gte:  new Date(startDate).toISOString(),
        $lte:  new Date(endDate).toISOString()} }).populate("articulos");

      let arrayDevolucionesT = await devT
        .map((a) => {
          return {
            devoluciones: a.cantidad,
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            ventas: 0,
            existencia: 0,
            ajustes: 0,
            salida: 0,
            compras: 0
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoDevolucionesT = arrayDevolucionesT.reduce(function (
        groups,
        item
      ) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      },
      []);

      let dataDevolucionesT = Object.values(agrupadoDevolucionesT);

      let vt = await ArticulosVentasTiendas.find({ areas:area, createdAt:{$gte:  new Date(startDate).toISOString(),
        $lte:  new Date(endDate).toISOString()} }).populate("articulos");

      let arrayVT = await vt
        .map((a) => {
          return {
            ventas: a.cantidad,
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            devoluciones: 0,
            existencia: 0,
            ajustes: 0,
            salida: 0,
            compras: 0
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoVT = arrayVT.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataVT = Object.values(agrupadoVT);


      let ajus = await ArticulosAjustesInv.find({ areas:area, createdAt:{$gte:  new Date(startDate).toISOString(),
        $lte:  new Date(endDate).toISOString()} }).populate("articulos");

      let arrayAjus = await ajus
        .map((a) => {
          return {
            ajustes: a.cantidad,
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            devoluciones: 0,
            ventas: 0,
            existencia: 0,
            salida: 0,
            compras: 0
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoAjus = arrayAjus.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataAjus = Object.values(agrupadoAjus);

      let data = dataEntrada.concat(
        // dataCompras,
        dataSalida,
        dataSurtidos,
        dataDevoluciones,
        dataDevolucionesT,
        dataVT,
        dataAjus
      )

      let ids = await data.map((a) => (a.idArticulo))

      // Inventarios
      
      let inv = await Inventarios.find({ areas:area, articulos:{ $in: ids} })
      .populate("articulos");

      let arrayInv = await inv
        .map((a) => {
          return {
            existencia: a.cantidad,
            idArticulo: a.articulos[0]._id,
            articuloNombre: a.articulos[0].nombre,
            entrada: 0,
            devoluciones: 0,
            ventas: 0,
            ajustes: 0,
            salida: 0,
            compras: 0
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoInv = arrayInv.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, []);

      let dataInv = Object.values(agrupadoInv);


      // Compras
      let comp = await ComprasAcumulados.find({articulos:{ $in: ids} }).populate(
    "articulos"
  );

  let arrayCompras = await comp
    .map((a) => {
      return {
        idArticulo: a.articulos[0]._id,
        articuloNombre: a.articulos[0].nombre,
        compras: a.cantidad,
        ventas: 0,
        devoluciones: 0,
        existencia: 0,
        ajustes: 0,
        entrada: 0,
        salida:0
      };
    })
    .filter(function (el) {
      return el != null;
    });

  let agrupadoCompras = arrayCompras.reduce(function (groups, item) {
    const val = item["idArticulo"];
    groups[val] = groups[val] || {
      idArticulo: item.idArticulo,
      compras:0,
      entrada: 0,
      ventas: 0,
      devoluciones: 0,
      existencia: 0,
      ajustes: 0,
      salida:0
    };
    groups[val].entrada += item.entrada;
    groups[val].salida += item.salida;
    groups[val].ventas += item.ventas;
    groups[val].compras += item.compras;
    groups[val].devoluciones += item.devoluciones;
    groups[val].existencia += item.existencia;
    groups[val].ajustes += item.ajustes;
    groups[val].idArticulo = item.idArticulo;
    groups[val].articuloNombre = item.articuloNombre;
    return groups;
  }, []);

  let dataCompras = Object.values(agrupadoCompras);

      let data2 = data.concat(dataInv, dataCompras)
      .sort((a, b) => (a.articuloNombre > b.articuloNombre ? 1 : -1))


      let agrupadoTodo = data2.reduce(function (groups, item) {
        const val = item["idArticulo"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          compras:0,
          entrada: 0,
          ventas: 0,
          devoluciones: 0,
          existencia: 0,
          ajustes: 0,
          salida:0
        };
        groups[val].entrada += item.entrada;
        groups[val].salida += item.salida;
        groups[val].ventas += item.ventas;
        groups[val].compras += item.compras;
        groups[val].devoluciones += item.devoluciones;
        groups[val].existencia += item.existencia;
        groups[val].ajustes += item.ajustes;
        groups[val].idArticulo = item.idArticulo;
        groups[val].articuloNombre = item.articuloNombre;
        return groups;
      }, [])

      let dataFin = Object.values(agrupadoTodo);

      res.status(200).json(dataFin);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  findUltimoPrecio: async (req, res) => {
    const { cliente } = req.params;
    try {
      //   Surtidos
      let sur = await ArticulosSurtidos.find({ clientes: cliente })
        .populate({
          path: "surtidos",
          populate: { path: "pedidos", populate: { path: "clientes" } },
        })
        .populate({ path: "surtidos", populate: { path: "areas" } })
        .populate("articulos")
        .populate("articulosPedido");

      let arraySurtidos = await sur
        .map((a) => {
            return {
              fecha: a.surtidos[0].fecha,
              createdAt: a.createdAt,
              tipoMov: `Surtido (Pedido ${a.surtidos[0].pedidos[0].idPedido})`,
              numMov: a.surtidos[0].idSurtido,
              destino: a.surtidos[0].pedidos[0].clientes[0].nombre_comercial,
              idMov: a.surtidos[0]._id,
              cantidad: a.cantidad,
              idArticulo: a.articulos[0]._id,
              articulo: a.articulos[0].codigo + " " + a.articulos[0].nombre,
              precio: a.articulosPedido[0].precio,
            };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoSurtidos = arraySurtidos.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        groups[val].precio = item.precio;
        groups[val].articulo = item.articulo;
        return groups;
      }, []);

      let dataSurtidos = Object.values(agrupadoSurtidos);
      // console.log("dataSurtidos", dataSurtidos.length)
      //   Ventas tiendas
//       let vt = await ArticulosVentasTiendas.find({ articulos: articulo })
//         .populate({ path: "ventasTiendas", populate: { path: "clientes" } })
//         .populate({ path: "ventasTiendas", populate: { path: "areas" } })
//         .populate("articulos");

//       let arrayVT = await vt
//         .map((a) => {
//           if (cliente == a.ventasTiendas[0].clientes[0]._id) {
//             return {
//               fecha: a.ventasTiendas[0].fecha,
//               createdAt: a.createdAt,
//               tipoMov: `Venta Tienda ${a.ventasTiendas[0].areas[0].name}`,
//               numMov: a.ventasTiendas[0].idVentaTienda,
//               destino: a.ventasTiendas[0].clientes[0].nombre_comercial,
//               idMov: a.ventasTiendas[0]._id,
//               cantidad: a.cantidad,
//               idArticulo: a.articulos[0]._id,
//               articulo: a.articulos[0].codigo + " " + a.articulos[0].nombre,
//               precio: a.precio,
//             };
//           }
//         })
//         .filter(function (el) {
//           return el != null;
//         });
// console.log("arrayVT", arrayVT.length)
//       let agrupadoVT = arrayVT.reduce(function (groups, item) {
//         const val = item["idMov"];
//         groups[val] = groups[val] || {
//           idMov: item.idMov,
//           cantidad: 0,
//         };
//         groups[val].cantidad += item.cantidad;
//         groups[val].fecha = item.fecha;
//         groups[val].createdAt = item.createdAt;
//         groups[val].tipoMov = item.tipoMov;
//         groups[val].numMov = item.numMov;
//         groups[val].destino = item.destino;
//         groups[val].idMov = item.idMov;
//         groups[val].idArticulo = item.idArticulo;
//         groups[val].articulo = item.articulo;
//         groups[val].precio = item.precio;
//         return groups;
//       }, []);

//       let dataVT = Object.values(agrupadoVT);
// console.log("dataVT", dataVT.length)
//       let data = dataSurtidos
//         .concat(dataVT)
//         .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

      res.status(200).json(dataSurtidos);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  findUltimoPrecioArticulo: async (req, res) => {
    const { articulo } = req.params;
    try {
      //   Surtidos
      let sur = await ArticulosSurtidos.find({ articulos: articulo })
        .populate({
          path: "surtidos",
          populate: { path: "pedidos", populate: { path: "clientes" } },
        })
        .populate({ path: "surtidos", populate: { path: "areas" } })
        .populate("articulos")
        .populate("articulosPedido");

      let arraySurtidos = await sur
        .map((a) => {
          return {
            fecha: a.surtidos[0].fecha,
            createdAt: a.createdAt,
            tipoMov: `Surtido (Pedido ${a.surtidos[0].pedidos[0].idPedido})`,
            numMov: a.surtidos[0].idSurtido,
            destino: a.surtidos[0].pedidos[0].clientes[0].nombre_comercial,
            idMov: a.surtidos[0]._id,
            cantidad: a.cantidad,
            idArticulo: a.articulos[0]._id,
            precio: a.articulosPedido[0].precio,
            pxc:
              parseFloat(a.articulosPedido[0].precio) * parseFloat(a.cantidad),
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoSurtidos = arraySurtidos.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
          pxc: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        groups[val].precio = item.precio;
        groups[val].pxc += item.pxc;
        return groups;
      }, []);

      let dataSurtidos = Object.values(agrupadoSurtidos);

      //   Ventas tiendas
      let vt = await ArticulosVentasTiendas.find({ articulos: articulo })
        .populate({ path: "ventasTiendas", populate: { path: "clientes" } })
        .populate({ path: "ventasTiendas", populate: { path: "areas" } })
        .populate("articulos");

      let arrayVT = await vt
        .map((a) => {
          return {
            fecha: a.ventasTiendas[0].fecha,
            createdAt: a.createdAt,
            tipoMov: `Venta Tienda ${a.ventasTiendas[0].areas[0].name}`,
            numMov: a.ventasTiendas[0].idVentaTienda,
            destino: a.ventasTiendas[0].clientes[0].nombre_comercial,
            idMov: a.ventasTiendas[0]._id,
            cantidad: a.cantidad,
            idArticulo: a.articulos[0]._id,
            precio: a.precio,
            pxc: parseFloat(a.precio) * parseFloat(a.cantidad),
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoVT = arrayVT.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
          pxc: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        groups[val].precio = item.precio;
        groups[val].pxc += item.pxc;
        return groups;
      }, []);

      let dataVT = Object.values(agrupadoVT);

      let data = dataSurtidos
        .concat(dataVT)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

      res.status(200).json(data);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  verificarInventario: async (req, res) => {
    const { area } = req.params;
    try {


            //  Inventario
          //   let Inv = await Inventarios.find({ areas: area
          //   })
          //     .populate({ path: "ajustesInventario", populate: { path: "areas" } })
          //     .populate("articulos");
       
          //   let arrayInv = await Inv.map((a) => {
          //     if (area == a.ajustesInventario[0].areas[0]._id) {
          //     return {
          //       createdAt: a.createdAt,
          //       fecha: a.ajustesInventario[0].fecha,
          //       tipoMov: "Ajuste de Inventario",
          //       numMov: a.ajustesInventario[0].idAjustesInventario,
          //       destino: "NA",
          //       idMov: a.ajustesInventario[0]._id,
          //       cantidad: a.cantidad,
          //       idArticulo: a.articulos[0]._id,
          //     }
          //   }
          // })
          // .filter(function (el) {
          //   return el != null;
          // })

            // Ajustes Inventario
            let Aajus = await ArticulosAjustesInv.find({
            })
              .populate({ path: "ajustesInventario", populate: { path: "areas" } })
              .populate("articulos");
       
            let arrayAajus = await Aajus.map((a) => {
              if (area == a.ajustesInventario[0].areas[0]._id) {
              return {
                createdAt: a.createdAt,
                fecha: a.ajustesInventario[0].fecha,
                tipoMov: "Ajuste de Inventario",
                numMov: a.ajustesInventario[0].idAjustesInventario,
                destino: "NA",
                idMov: a.ajustesInventario[0]._id,
                cantidad: a.cantidad,
                idArticulo: a.articulos[0]._id,
              }
            }
          })
          .filter(function (el) {
            return el != null;
          })

      // Muestras Salida
      let AMS = await ArticulosMS.find({
      })
        .populate({ path: "muestrasSalida", populate: { path: "clientes" } })
        .populate({ path: "muestrasSalida", populate: { path: "areas" } })
        .populate("articulos");
      // muestrasSalida
      let arrayAMS = await AMS.map((a) => {
        if (area == a.muestrasSalida[0].areas[0]._id) {
        return {
          createdAt: a.createdAt,
          fecha: a.muestrasSalida[0].fecha,
          tipoMov: "Salida de Muestra",
          numMov: a.muestrasSalida[0].idMuestrasSalida,
          destino: a.muestrasSalida[0].clientes[0].nombre_comercial,
          idMov: a.muestrasSalida[0]._id,
          cantidad: -a.cantidad,
          idArticulo: a.articulos[0]._id,
        }
      }
    })
    .filter(function (el) {
      return el != null;
    })

      // Muestras entrada
      let AME = await ArticulosME.find({
      })
        .populate({ path: "muestrasEntrada", populate: { path: "clientes" } })
        .populate({ path: "muestrasEntrada", populate: { path: "areas" } })
        .populate("articulos");
      // muestrasEntrada
      let arrayAME = await AME.map((a) => {
        if (area == a.muestrasEntrada[0].areas[0]._id) {
        return {
          createdAt: a.createdAt,
          fecha: a.muestrasEntrada[0].fecha,
          tipoMov: "Entrada de Muestra",
          numMov: a.muestrasEntrada[0].idMuestrasEntrada,
          destino: a.muestrasEntrada[0].clientes[0].nombre_comercial,
          idMov: a.muestrasEntrada[0]._id,
          cantidad: a.cantidad,
          idArticulo: a.articulos[0]._id,
        }
      }
    })
    .filter(function (el) {
      return el != null;
    })


      let comp = await ComprasAcumulados.find({
        areas: area,
      })
        .populate({
          path: "articulosEmbarques",
          populate: {
            path: "articulosOC",
            populate: {
              path: "ordenesCompra",
              populate: { path: "proveedores" },
            },
          },
        })
        .populate("compras")
        .populate("articulos")
        .populate("areas");

      //   Compras
      let arrayCompras = await comp
        .map((a) => {
          return {
            fecha: a.compras[0].fecha,
            createdAt: a.createdAt,
            tipoMov: "Compra",
            numMov: a.compras[0].idCompras,
            destino: "NA",
              // a.articulosEmbarques[0].articulosOC[0].ordenesCompra[0]
              //   .proveedores[0].nombre_comercial,
            idMov: a.compras[0]._id,
            cantidad: a.cantidad,
            idArticulo: a.articulos[0]._id,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoCompras = arrayCompras.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let dataCompras = Object.values(agrupadoCompras);

      //   Surtidos

      let sur = await ArticulosSurtidos.find({})
        .populate({
          path: "surtidos",
          populate: { path: "pedidos", populate: { path: "clientes" } },
        })
        .populate({ path: "surtidos", populate: { path: "areas" } })
        .populate("articulos");

      let arraySurtidos = await sur
        .map((a) => {
          if (area == a.surtidos[0].areas[0]._id) {
            return {
              fecha: a.surtidos[0].fecha,
              createdAt: a.createdAt,
              tipoMov: `Surtido (Pedido ${a.surtidos[0].pedidos[0].idPedido})`,
              numMov: a.surtidos[0].idSurtido,
              destino: a.surtidos[0].pedidos[0].clientes[0].nombre_comercial,
              idMov: a.surtidos[0]._id,
              cantidad: -a.cantidad,
              idArticulo: a.articulos[0]._id,
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoSurtidos = arraySurtidos.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let dataSurtidos = Object.values(agrupadoSurtidos);

      //   Devoluciones
      let dev = await ArticulosDevoluciones.find({ })
        .populate({ path: "devoluciones", populate: { path: "clientes"}, })
        .populate("articulos")
        .populate({ path: "devoluciones", populate: { path: "areas" } });

      let arrayDevoluciones = await dev
        .map((a) => {
          if (area == a.devoluciones[0].areas[0]._id) {
            return {
              fecha: a.devoluciones[0].fecha,
              createdAt: a.createdAt,
              tipoMov: "Devolucion",
              numMov: a.devoluciones[0].idDevolucion,
              destino: a.devoluciones[0].clientes[0].nombre_comercial,
              idMov: a.devoluciones[0]._id,
              cantidad: a.cantidad,
              idArticulo: a.articulos[0]._id,
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoDevoluciones = arrayDevoluciones.reduce(function (
        groups,
        item
      ) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      },
      []);

      let dataDevoluciones = Object.values(agrupadoDevoluciones);

      //   Traspasos Salida
      let ts = await ArticulosTS.find({ })
        .populate({ path: "traspasosSalida", populate: { path: "areaSalida" } })
        .populate({
          path: "traspasosSalida",
          populate: { path: "areaDestino" },
        })
        .populate("articulos");

      let arrayTS = await ts
        .map((a) => {
          if (area == a.traspasosSalida[0].areaSalida[0]._id) {
            return {
              fecha: a.traspasosSalida[0].fecha,
              createdAt: a.createdAt,
              tipoMov: "Traspaso Salida",
              numMov: a.traspasosSalida[0].idTraspasosSalida,
              destino: a.traspasosSalida[0].areaSalida[0].name,
              idMov: a.traspasosSalida[0]._id,
              cantidad: -a.cantidad,
              idArticulo: a.articulos[0]._id,
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoTS = arrayTS.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let dataTS = Object.values(agrupadoTS);

      //   Traspasos Entreda
      let te = await ArticulosTE.find({  })
        .populate({
          path: "traspasosEntrada",
          populate: {
            path: "traspasosSalida",
            populate: { path: "areaSalida" },
          },
        })
        .populate({
          path: "traspasosEntrada",
          populate: {
            path: "traspasosSalida",
            populate: { path: "areaDestino" },
          },
        })
        .populate("articulos");

      let arrayTE = await te
        .map((a) => {
          if (
            area == a.traspasosEntrada[0].traspasosSalida[0].areaDestino[0]._id
          ) {
            return {
              fecha: a.traspasosEntrada[0].fecha,
              createdAt: a.createdAt,
              tipoMov: "Traspaso Entrada",
              numMov: a.traspasosEntrada[0].idTraspasosEntrada,
              destino:
                a.traspasosEntrada[0].traspasosSalida[0].areaDestino[0].name,
              idMov: a.traspasosEntrada[0]._id,
              cantidad: a.cantidad,
              idArticulo: a.articulos[0]._id,
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoTE = arrayTE.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let dataTE = Object.values(agrupadoTE);

      let vt = await ArticulosVentasTiendas.find({ })
        .populate({ path: "ventasTiendas", populate: { path: "areas" } })
        .populate("articulos");

      let arrayVT = await vt
        .map((a) => {
          if (area == a.ventasTiendas[0].areas[0]._id) {
            return {
              fecha: a.ventasTiendas[0].fecha,
              createdAt: a.createdAt,
              tipoMov: "Venta Tienda",
              numMov: a.ventasTiendas[0].idVentaTienda,
              destino: a.ventasTiendas[0].areas[0].name,
              idMov: a.ventasTiendas[0]._id,
              cantidad: -a.cantidad,
              idArticulo: a.articulos[0]._id,
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoVT = arrayVT.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let dataVT = Object.values(agrupadoVT);

      let dt = await ArticulosDevolucionesTiendas.find({ })
        .populate({ path: "devolucionesTiendas", populate: { path: "areas" } })
        .populate("articulos");

      let arrayDT = await dt
        .map((a) => {
          if (area == a.devolucionesTiendas[0].areas[0]._id) {
            return {
              fecha: a.devolucionesTiendas[0].fecha,
              createdAt: a.createdAt,
              tipoMov: "Devolucion Tienda",
              numMov: a.devolucionesTiendas[0].idDevolucionTienda,
              destino: a.devolucionesTiendas[0].areas[0].name,
              idMov: a.devolucionesTiendas[0]._id,
              cantidad: a.cantidad,
              idArticulo: a.articulos[0]._id,
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });

      let agrupadoDT = arrayDT.reduce(function (groups, item) {
        const val = item["idMov"];
        groups[val] = groups[val] || {
          idMov: item.idMov,
          cantidad: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].fecha = item.fecha;
        groups[val].createdAt = item.createdAt;
        groups[val].tipoMov = item.tipoMov;
        groups[val].numMov = item.numMov;
        groups[val].destino = item.destino;
        groups[val].idMov = item.idMov;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let dataDT = Object.values(agrupadoDT);

      let data = dataCompras
        .concat(dataSurtidos, dataDevoluciones, dataTS, dataTE, dataVT, dataDT, arrayAME, arrayAMS, arrayAajus)
        .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

      res.status(200).json(data);
    } catch (error) {
      res.status(400).json(error);
    }
  },

cuadrarInventario: async (req, res) => {
  const { area } = req.params;

  try {

    let areaId;
    try {
      areaId = new mongoose.Types.ObjectId(area);
    } catch (e) {
      console.error("❌ Area inválida, no es ObjectId:", area);
      return res.status(400).json({
        message: "Area inválida",
        error: e.message,
      });
    }

    // Helpers básicos
    const regMov = (idArticulo, nombreArticulo, cantidad, idInv = "") => ({
      inventario: 0,
      cantidad: cantidad ?? 0,
      idArticulo,
      nombreArticulo: nombreArticulo || "",
      idInv,
    });

    // Helper para registros que vienen con populate de articulos
    const makeFromDoc = (doc, origen, cantidad, idInv = "") => {
      const art = doc.articulos?.[0];
      if (!art) {
        console.warn(`⚠️ [${origen}] registro sin articulos[0]. _id:`, doc._id);
        return null;
      }
      return regMov(art._id, art.codigo || art.SKU, cantidad, idInv);
    };

    // Helper específico para inventario (incluye campo inventario)
    const makeInvFromDoc = (doc, origen) => {
      const art = doc.articulos?.[0];
      if (!art) {
        console.warn(`⚠️ [${origen}] Inventario sin articulos[0]. _id:`, doc._id);
        return null;
      }
      return {
        inventario: doc.cantidad ?? 0,
        cantidad: 0,
        idArticulo: art._id,
        nombreArticulo: art.codigo || art.SKU || "",
        idInv: doc._id,
      };
    };

    // =========================
    // 1) Fetch en paralelo
    // =========================
    const [
      inv,
      comp,
      sur,
      dev,
      devFis,
      devT,
      muesSal,
      muesEnt,
      ts,
      te,
      vt,
      aju,
    ] = await Promise.all([
      Inventarios.find({ areas: areaId })
        .select("cantidad articulos")
        .populate({ path: "articulos", select: "_id codigo SKU" })
        .lean(),

      // Compras (+) — igual que el kardex
      ComprasAcumulados.find({ areas: areaId })
        .select("cantidad articulos")
        .populate({ path: "articulos", select: "_id codigo SKU" })
        .lean(),

      // Surtidos (-) — por el area de la LINEA (ArticulosSurtidos.areas), como el kardex
      ArticulosSurtidos.find({ areas: areaId })
        .select("cantidad articulos")
        .populate({ path: "articulos", select: "_id codigo SKU" })
        .lean(),

      // Devoluciones cliente (+) — filtra por area del padre
      ArticulosDevoluciones.find({})
        .select("cantidad articulos devoluciones")
        .populate({ path: "devoluciones", populate: { path: "areas", select: "_id" }, select: "areas" })
        .populate({ path: "articulos", select: "_id codigo SKU" })
        .lean(),

      // Devoluciones Fiscal (+) — filtra por area del padre (ref devolucionesFiscal)
      ArticulosDevolucionesFiscal.find({})
        .select("cantidad articulos devolucionesFiscal")
        .populate({ path: "devolucionesFiscal", populate: { path: "areas", select: "_id" }, select: "areas" })
        .populate({ path: "articulos", select: "_id codigo SKU" })
        .lean(),

      // Devoluciones Tiendas (+) — por el area de la LINEA, como el kardex
      ArticulosDevolucionesTiendas.find({ areas: areaId })
        .select("cantidad articulos")
        .populate({ path: "articulos", select: "_id codigo SKU" })
        .lean(),

      // Muestras Salida (-) — filtra por area del padre
      ArticulosMS.find({})
        .select("cantidad articulos muestrasSalida")
        .populate({ path: "muestrasSalida", populate: { path: "areas", select: "_id" }, select: "areas" })
        .populate({ path: "articulos", select: "_id codigo SKU" })
        .lean(),

      // Muestras Entrada (+) — filtra por area del padre
      ArticulosME.find({})
        .select("cantidad articulos muestrasEntrada")
        .populate({ path: "muestrasEntrada", populate: { path: "areas", select: "_id" }, select: "areas" })
        .populate({ path: "articulos", select: "_id codigo SKU" })
        .lean(),

      // Traspaso Salida (-) — por el area de la LINEA (ArticulosTS.areas), como el kardex
      ArticulosTS.find({ areas: areaId })
        .select("cantidad articulos")
        .populate({ path: "articulos", select: "_id codigo SKU" })
        .lean(),

      // Traspaso Entrada (+) — entradas REALES recibidas del area, como el kardex
      ArticulosTE.find({ areas: areaId })
        .select("cantidad articulos")
        .populate({ path: "articulos", select: "_id codigo SKU" })
        .lean(),

      // Ventas Tiendas (-) — por el area de la LINEA, como el kardex (sin filtro is_active)
      ArticulosVentasTiendas.find({ areas: areaId })
        .select("cantidad articulos")
        .populate({ path: "articulos", select: "_id codigo SKU" })
        .lean(),

      // Ajustes (+ con signo) — por el area de la LINEA, como el kardex
      ArticulosAjustesInv.find({ areas: areaId })
        .select("cantidad articulos")
        .populate({ path: "articulos", select: "_id codigo SKU" })
        .lean(),
    ]);

    // =========================
    // 2) Normalización
    // =========================

    // Inventario actual
    const dataInv = inv
      .map((a) => makeInvFromDoc(a, "Inventarios"))
      .filter((x) => x != null);

    // Compras (entradas +)
    const dataCompras = comp
      .map((a) => makeFromDoc(a, "ComprasAcumulados", +a.cantidad))
      .filter((x) => x != null);

    // === MISMAS FUENTES, FILTROS Y SIGNOS QUE listadoKardex (findKardex) ===

    // Surtidos (-) — ya filtrado por area de la linea en el query
    const dataSurtidos = sur
      .map((a) => makeFromDoc(a, "ArticulosSurtidos", -(+a.cantidad || 0)))
      .filter((x) => x != null);

    // Devoluciones cliente (+) — filtra por area del padre
    const dataDevoluciones = dev
      .filter((a) => {
        const ar = a?.devoluciones?.[0]?.areas?.[0]?._id;
        return ar && String(ar) === String(areaId);
      })
      .map((a) => makeFromDoc(a, "ArticulosDevoluciones", +(+a.cantidad || 0)))
      .filter((x) => x != null);

    // Devoluciones Fiscal (+) — filtra por area del padre (ref devolucionesFiscal)
    const dataDevolucionesFis = devFis
      .filter((a) => {
        const ar = a?.devolucionesFiscal?.[0]?.areas?.[0]?._id;
        return ar && String(ar) === String(areaId);
      })
      .map((a) => makeFromDoc(a, "ArticulosDevolucionesFiscal", +(+a.cantidad || 0)))
      .filter((x) => x != null);

    // Devoluciones Tiendas (+) — ya filtrado por area de la linea
    const dataDevolucionesT = devT
      .map((a) => makeFromDoc(a, "ArticulosDevolucionesTiendas", +(+a.cantidad || 0)))
      .filter((x) => x != null);

    // Muestras Salida (-) — filtra por area del padre
    const dataMuestrasSal = muesSal
      .filter((a) => {
        const ar = a?.muestrasSalida?.[0]?.areas?.[0]?._id;
        return ar && String(ar) === String(areaId);
      })
      .map((a) => makeFromDoc(a, "ArticulosMS", -(+a.cantidad || 0)))
      .filter((x) => x != null);

    // Muestras Entrada (+) — igual que el kardex (antes estaba en -)
    const dataMuestrasEnt = muesEnt
      .filter((a) => {
        const ar = a?.muestrasEntrada?.[0]?.areas?.[0]?._id;
        return ar && String(ar) === String(areaId);
      })
      .map((a) => makeFromDoc(a, "ArticulosME", +(+a.cantidad || 0)))
      .filter((x) => x != null);

    // Traspaso Salida (-) — ya filtrado por area de la linea (ArticulosTS.areas)
    const dataTS = ts
      .map((a) => makeFromDoc(a, "ArticulosTS_Salida", -(+a.cantidad || 0)))
      .filter((x) => x != null);

    // Traspaso Entrada (+) — ArticulosTE, entradas reales recibidas (como el kardex)
    const dataTE = te
      .map((a) => makeFromDoc(a, "ArticulosTE_Entrada", +(+a.cantidad || 0)))
      .filter((x) => x != null);

    // Ventas Tiendas (-) — ya filtrado por area de la linea
    const dataVT = vt
      .map((a) => makeFromDoc(a, "ArticulosVentasTiendas", -(+a.cantidad || 0)))
      .filter((x) => x != null);

    // Ajustes (+ con signo) — ya filtrado por area de la linea
    const dataAju = aju
      .map((a) => makeFromDoc(a, "ArticulosAjustesInv", +(+a.cantidad || 0)))
      .filter((x) => x != null);

    // =========================
    // 3) Unificar y agrupar
    // =========================
    const data = [].concat(
      dataCompras,
      dataSurtidos,
      dataDevoluciones,
      dataDevolucionesFis,
      dataDevolucionesT,
      dataMuestrasSal,
      dataMuestrasEnt,
      dataTS,
      dataTE,
      dataVT,
      dataInv,
      dataAju
    );

    const byArt = data.reduce((acc, it) => {
      const key = String(it.idArticulo);
      if (!acc[key]) {
        acc[key] = {
          idArticulo: it.idArticulo,
          nombreArticulo: it.nombreArticulo || "",
          cantidad: 0,
          inventario: 0,
          diferencia: 0,
          idInv: "",
        };
      }
      acc[key].cantidad += Number(it.cantidad) || 0;
      acc[key].inventario += Number(it.inventario) || 0;
      if (!acc[key].idInv && it.idInv) acc[key].idInv = it.idInv;
      return acc;
    }, {});

    const dataFin = Object.values(byArt).map((r) => ({
      ...r,
      diferencia: (r.cantidad || 0) - (r.inventario || 0),
    }));

    // =========================
    // 4) BulkWrite
    // =========================
    const ops = dataFin
      .filter((r) => (r.diferencia || 0) !== 0)
      .map((r) => ({
        updateOne: {
          filter: {
            articulos: new mongoose.Types.ObjectId(r.idArticulo),
            areas: areaId,
          },
          update: {
            $set: {
              cantidad: r.cantidad,
              is_active: "Si",
            },
          },
          upsert: true,
        },
      }));

    if (ops.length > 0) {
      await Inventarios.bulkWrite(ops, { ordered: false });
    }

    return res.status(200).json(dataFin);
  } catch (error) {
    console.error("❌ Error en cuadrarInventario:", error); // 👈 LOG COMPLETO
    return res.status(400).json({
      message: "Error en cuadrarInventario",
      error: error?.message || error,
      stack: error?.stack, // si quieres ver stack en el front mientras debuggeas
    });
  }
}

};
