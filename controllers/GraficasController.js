const { Surtidos, VentasTiendas } = require('../models')
const moment = require('moment')

module.exports = { 
    findGraficaVentaMensual: async (req, res)=>{
      const { fechaInicio, fechaFin } = req.params
        try{

    let sur = await  Surtidos.find({fecha:{$gte: fechaInicio, $lte: fechaFin}, is_active:"Si"})

            let array = sur.map((a)=>{
              return{
                Importe: a.total_general,
                Mes: a.fecha.split("-")[0] + "-" + a.fecha.split("-")[1]
              }
            }).filter(function (el) {
              return el != null;
            });
            let ventas = Object.values(array);

            let vt = await VentasTiendas.find({fecha:{$gte: fechaInicio, $lte: fechaFin}, is_active:"Si"})
            .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})

            let arrayVT = vt.map((a)=>{
              return{
                Importe: a.total_general,
                Mes: a.fecha.split("-")[0] + "-" + a.fecha.split("-")[1]
              }
            }).filter(function (el) {
              return el != null;
            });
            let ventasVT = Object.values(arrayVT);

      let arraysVentas = ventas.concat(ventasVT)

            let agrupadoCompras = arraysVentas.reduce(function (groups, item) {
              const val = item["Mes"];
              groups[val] = groups[val] || {
                Mes: item.Mes,
                Importe: 0,
              };
              groups[val].Importe += item.Importe;
              groups[val].Mes = item.Mes;
              return groups;
            },[])

            let data = Object.values(agrupadoCompras)


          res.status(200).json(data)
        } catch (error) {
           res.status(400).json(error)
            }
    },

    findGraficaVentaMensualComparativa: async (req, res)=>{
      const { fechaInicio, fechaFin } = req.params

      var dateStringInicio  = fechaInicio
      var yearInicio        = dateStringInicio.substring(0,4);
      var monthInicio       = dateStringInicio.substring(5,7);
      var dayInicio         = dateStringInicio.substring(8,10);
      var fechaInicioAnt       = new Date(yearInicio, monthInicio-1, dayInicio);
      fechaInicioAnt.setDate(fechaInicioAnt.getDate()-365)     
      let fechaInicioAnt2   = moment(fechaInicioAnt).format("YYYY-MM-DD"); 
      var dateStringFin  = fechaFin
      var yearFin        = dateStringFin.substring(0,4);
      var monthFin       = dateStringFin.substring(5,7);
      var dayFin         = dateStringFin.substring(8,10);
      var fechaFinAnt       = new Date(yearFin, monthFin-1, dayFin);
      fechaFinAnt.setDate(fechaFinAnt.getDate()-365)     
      let fechaFinAnt2   = moment(fechaFinAnt).format("YYYY-MM-DD"); 

        try{

          // Anterior
          let surAnt = await  Surtidos.find({fecha:{$gte: fechaInicioAnt2, $lte: fechaFinAnt2}, is_active:"Si"})

          let arrayAnt = surAnt.map((a)=>{
            return{
              ImpActual: 0,
              MesAct: "",
              Mes: moment(a.fecha).format('MMMM'),
              ImpAnterior: a.total_general,
              MesAnt:moment(a.fecha).format('MMMM-YY')
            }
          }).filter(function (el) {
            return el != null;
          });
          let ventasAnt = Object.values(arrayAnt);

          let vtAnt = await VentasTiendas.find({fecha:{$gte: fechaInicioAnt2, $lte: fechaFinAnt2}, is_active:"Si"})
          .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})

          let arrayVTAnt = vtAnt.map((a)=>{
            return{
              ImpActual: 0,
              MesAct: "",
              Mes: moment(a.fecha).format('MMMM'),
              ImpAnterior: a.total_general,
              MesAnt:moment(a.fecha).format('MMMM-YY')
            }
          }).filter(function (el) {
            return el != null;
          });
          let ventasVTAnt = Object.values(arrayVTAnt);

          //Actual

    let sur = await  Surtidos.find({fecha:{$gte: fechaInicio, $lte: fechaFin}, is_active:"Si"})

            let array = sur.map((a)=>{
              return{
                ImpActual: a.total_general,
                MesAct: moment(a.fecha).format('MMMM-YY'),
                Mes: moment(a.fecha).format('MMMM'),
                ImpAnterior:0,
                MesAnt:""
              }
            }).filter(function (el) {
              return el != null;
            });
            let ventas = Object.values(array);

            let vt = await VentasTiendas.find({fecha:{$gte: fechaInicio, $lte: fechaFin}, is_active:"Si"})
            .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})

            let arrayVT = vt.map((a)=>{
              return{
                ImpActual: a.total_general,
                MesAct: moment(a.fecha).format('MMMM-YY'),
                Mes: moment(a.fecha).format('MMMM'),
                ImpAnterior:0,
                MesAnt:""
              }
            }).filter(function (el) {
              return el != null;
            });
            let ventasVT = Object.values(arrayVT);

      let arraysVentas = ventas.concat(ventasVT, ventasAnt, ventasVTAnt)

            let agrupadoVentas = arraysVentas.reduce(function (groups, item) {
              const val = item["Mes"];
              groups[val] = groups[val] || {
                Mes: item.Mes,
                ImpActual: 0,
                ImpAnterior: 0,
              };
              groups[val].ImpActual += item.ImpActual;
              groups[val].ImpAnterior += item.ImpAnterior;
              groups[val].Mes = item.Mes;
              groups[val].MesAct = item.MesAct;
              groups[val].MesAnt = item.MesAnt;
              return groups;
            },[])

            let data = Object.values(agrupadoVentas)


          res.status(200).json(data)
        } catch (error) {
           res.status(400).json(error)
            }
    },

    findGraficaVentaMensualCliente: async (req, res)=>{
      const { cliente, fechaInicio, fechaFin } = req.params
        try{

    let sur = await  Surtidos.find({fecha:{$gte: fechaInicio, $lte: fechaFin}, clientes:cliente, is_active:"Si"})

            let array = sur.map((a)=>{
              return{
                Importe: a.total_general,
                Mes: a.fecha.split("-")[0] + "-" + a.fecha.split("-")[1]
              }
            }).filter(function (el) {
              return el != null;
            });
            let ventas = Object.values(array);

            let vt = await VentasTiendas.find({fecha:{$gte: fechaInicio, $lte: fechaFin}, clientes:cliente, is_active:"Si"})
            .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})

            let arrayVT = vt.map((a)=>{
              return{
                Importe: a.total_general,
                Mes: a.fecha.split("-")[0] + "-" + a.fecha.split("-")[1]
              }
            }).filter(function (el) {
              return el != null;
            });
            let ventasVT = Object.values(arrayVT);

      let arraysVentas = ventas.concat(ventasVT)

            let agrupadoCompras = arraysVentas.reduce(function (groups, item) {
              const val = item["Mes"];
              groups[val] = groups[val] || {
                Mes: item.Mes,
                Importe: 0,
              };
              groups[val].Importe += item.Importe;
              groups[val].Mes = item.Mes;
              return groups;
            },[])

            let data = Object.values(agrupadoCompras)


          res.status(200).json(data)
        } catch (error) {
           res.status(400).json(error)
            }
    },

    findGraficaVentasDepartamento: async (req, res)=>{
      const { fechaInicio, fechaFin } = req.params
        try{

    let sur = await  Surtidos.find({fecha:{$gte: fechaInicio, $lte: fechaFin}, is_active:"Si"})
                      .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})

            let array = sur.map((a)=>{
              return{
                Importe: a.total_general,
                idDepartamento: a.clientes[0].departamentosClientes[0]._id,
                Departamento: a.clientes[0].departamentosClientes[0].name
              }
            }).filter(function (el) {
              return el != null;
            });
            let ventas = Object.values(array);


        let vt = await VentasTiendas.find({fecha:{$gte: fechaInicio, $lte: fechaFin}, is_active:"Si"})
                .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})

                let arrayVT = vt.map((a)=>{
                  return{
                    Importe: a.total_general,
                    idDepartamento: a.clientes[0].departamentosClientes[0]._id,
                    Departamento: a.clientes[0].departamentosClientes[0].name
                  }
                }).filter(function (el) {
                  return el != null;
                });
                let ventasVT = Object.values(arrayVT);

          let arraysVentas = ventas.concat(ventasVT)

            let agrupadoCompras = arraysVentas.reduce(function (groups, item) {
              const val = item["idDepartamento"];
              groups[val] = groups[val] || {
                idDepartamento: item.idDepartamento,
                Importe: 0,
              };
              groups[val].Importe += item.Importe;
              groups[val].idDepartamento = item.idDepartamento;
              groups[val].Departamento = item.Departamento;
              return groups;
            },[])

            let data = Object.values(agrupadoCompras)
            .sort((a, b) => (a.Departamento > b.Departamento ? 1 : -1))


          res.status(200).json(data)
        } catch (error) {
           res.status(400).json(error)
            }
    },

    findGraficaVentaDesgloce: async (req, res)=>{
      const { fechaInicio, fechaFin } = req.params
        try{

    let sur = await  Surtidos.find({fecha:{$gte: fechaInicio, $lte: fechaFin}, is_active:"Si"})
                      .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})
                      .populate({path: 'pedidos', populate:{path: 'colaboradores'}})

            let array = sur.map((a)=>{
              return{
                Importe: a.total_general,
                idDepartamento: a.clientes[0].departamentosClientes[0]._id,
                Departamento: a.clientes[0].departamentosClientes[0].name,  
                idVendedor: a.pedidos[0].colaboradores[0]._id,
                Vendedor: a.pedidos[0].colaboradores[0].nombre + " " + a.pedidos[0].colaboradores[0].apellido,
                idCliente: a.clientes[0]._id,
                Cliente: a.clientes[0].nombre_comercial, 
                Mes:moment(a.fecha).format('MMMM-YY')          
              }
            }).filter(function (el) {
              return el != null;
            });
            let ventas = Object.values(array);


        // let vt = await VentasTiendas.find({fecha:{$gte: fechaInicio, $lte: fechaFin}})
        //         .populate({path: 'clientes', populate:{path: 'departamentosClientes'}})
        //         .populate("colaboradores")

        //         let arrayVT = vt.map((a)=>{
        //           return{
        //             Importe: a.total_general,
        //             idDepartamento: a.clientes[0].departamentosClientes[0]._id,
        //             Departamento: a.clientes[0].departamentosClientes[0].name,
        //             idVendedor: a.colaboradores[0]._id,
        //             Vendedor: a.colaboradores[0].nombre + " " + a.colaboradores[0].apellido,
        //             idCliente: a.clientes[0]._id,
        //             Cliente: a.clientes[0].nombre_comercial, 
        //             Mes:moment(a.fecha).format('MMMM-YY')          

        //           }
        //         }).filter(function (el) {
        //           return el != null;
        //         });
        //         let ventasVT = Object.values(arrayVT);

        //   let arraysVentas = ventas.concat(ventasVT)

            let agrupadoCompras = ventas.reduce(function (groups, item) {
              const val = item["Mes"] + item["idDepartamento"] + item["idVendedor"] + item["idCliente"]
              groups[val] = groups[val] || {
                Mes: item.Mes,
                idDepartamento: item.idDepartamento,
                idVendedor: item.idVendedor,
                idCliente: item.idCliente,
                Importe: 0,
              };
              groups[val].Importe += item.Importe;
              groups[val].Mes = item.Mes;
              groups[val].idDepartamento = item.idDepartamento;
              groups[val].Departamento = item.Departamento;
              groups[val].idVendedor = item.idVendedor;
              groups[val].Vendedor = item.Vendedor;
              groups[val].idCliente = item.idCliente;
              groups[val].Cliente = item.Cliente;
              return groups;
            },[])

            let data = Object.values(agrupadoCompras)

          res.status(200).json(data)
        } catch (error) {
           res.status(400).json(error)
            }
    },

    findGraficaVentasGrupo: async (req, res)=>{
      const { fechaInicio, fechaFin } = req.params
        try{

    let sur = await  Surtidos.find({fecha:{$gte: fechaInicio, $lte: fechaFin}, is_active:"Si"})
                      .populate({path: 'clientes', populate:{path: 'grupos'}})

            let array = sur.map((a)=>{
              return{
                Importe: a.total_general,
                idGrupo: a.clientes[0].grupos[0]._id,
                Grupo: a.clientes[0].grupos[0].name
              }
            }).filter(function (el) {
              return el != null;
            });
            let ventas = Object.values(array);


        let vt = await VentasTiendas.find({fecha:{$gte: fechaInicio, $lte: fechaFin}, is_active:"Si"})
                .populate({path: 'clientes', populate:{path: 'grupos'}})

                let arrayVT = vt.map((a)=>{
                  return{
                    Importe: a.total_general,
                    idGrupo: a.clientes[0].grupos[0]._id,
                    Grupo: a.clientes[0].grupos[0].name
                  }
                }).filter(function (el) {
                  return el != null;
                });
                let ventasVT = Object.values(arrayVT);

          let arraysVentas = ventas.concat(ventasVT)

            let agrupadoCompras = arraysVentas.reduce(function (groups, item) {
              const val = item["idGrupo"];
              groups[val] = groups[val] || {
                idGrupo: item.idGrupo,
                Importe: 0,
              };
              groups[val].Importe += item.Importe;
              groups[val].idGrupo = item.idGrupo;
              groups[val].Grupo = item.Grupo;
              return groups;
            },[])

            let data = Object.values(agrupadoCompras)
            .sort((a, b) => (a.Grupo > b.Grupo ? 1 : -1))


          res.status(200).json(data)
        } catch (error) {
           res.status(400).json(error)
            }
    },

    findGraficaVentasVendedor: async (req, res)=>{
      const { fechaInicio, fechaFin } = req.params
        try{

    let sur = await  Surtidos.find({fecha:{$gte: fechaInicio, $lte: fechaFin}, is_active:"Si"})
                      .populate({path: 'pedidos', populate:{path: 'colaboradores'}})

            let array = sur.map((a)=>{
              return{
                Importe: a.total_general,
                idVendedor: a.pedidos[0].colaboradores[0]._id,
                Vendedor: a.pedidos[0].colaboradores[0].nombre + " " + a.pedidos[0].colaboradores[0].apellido
              }
            }).filter(function (el) {
              return el != null;
            });
            let ventas = Object.values(array);


        let vt = await VentasTiendas.find({fecha:{$gte: fechaInicio, $lte: fechaFin}, is_active:"Si"})
                .populate('colaboradores')

                let arrayVT = vt.map((a)=>{
                  return{
                    Importe: a.total_general,
                    idVendedor: a.colaboradores[0]._id,
                    Vendedor: a.colaboradores[0].nombre + " " + a.colaboradores[0].apellido
                  }
                }).filter(function (el) {
                  return el != null;
                });
                let ventasVT = Object.values(arrayVT);

          let arraysVentas = ventas.concat(ventasVT)

            let agrupadoCompras = arraysVentas.reduce(function (groups, item) {
              const val = item["idVendedor"];
              groups[val] = groups[val] || {
                idVendedor: item.idVendedor,
                Importe: 0,
              };
              groups[val].Importe += item.Importe;
              groups[val].idVendedor = item.idVendedor;
              groups[val].Vendedor = item.Vendedor;
              return groups;
            },[])

            let data = Object.values(agrupadoCompras)
            .sort((a, b) => (a.Vendedor > b.Vendedor ? 1 : -1))


          res.status(200).json(data)
        } catch (error) {
           res.status(400).json(error)
            }
    },

    findGraficaVentasVendedorMensual: async (req, res)=>{
      const { fechaInicio, fechaFin } = req.params
        try{

    let sur = await  Surtidos.find({fecha:{$gte: fechaInicio, $lte: fechaFin}, is_active:"Si"})
                      .populate({path: 'pedidos', populate:{path: 'colaboradores'}})

            let array = sur.map((a)=>{
              return{
                Importe: a.total_general,
                Mes: a.fecha.split("-")[0] + "-" + a.fecha.split("-")[1],
                idVendedor: a.pedidos[0].colaboradores[0]._id,
                Vendedor: a.pedidos[0].colaboradores[0].nombre + " " + a.pedidos[0].colaboradores[0].apellido
              }
            }).filter(function (el) {
              return el != null;
            });
            let ventas = Object.values(array);


        // let vt = await VentasTiendas.find({fecha:{$gte: fechaInicio, $lte: fechaFin}})
        //         .populate('colaboradores')

        //         let arrayVT = vt.map((a)=>{
        //           return{
        //             Importe: a.total_general,
        //             Mes: a.fecha.split("-")[0] + "-" + a.fecha.split("-")[1],
        //             idVendedor: a.colaboradores[0]._id,
        //             Vendedor: a.colaboradores[0].nombre + " " + a.colaboradores[0].apellido
        //           }
        //         }).filter(function (el) {
        //           return el != null;
        //         });
        //         let ventasVT = Object.values(arrayVT);

        //   let arraysVentas = ventas.concat(ventasVT)

            let agrupadoCompras = ventas.reduce(function (groups, item) {
              const val = item["idVendedor"] + item["Mes"];
              groups[val] = groups[val] || {
                Mes: item.Mes,
                idVendedor: item.idVendedor,
                Importe: 0,
              };
              groups[val].Importe += item.Importe;
              groups[val].idVendedor = item.idVendedor;
              groups[val].Vendedor = item.Vendedor;
              groups[val].Mes = item.Mes;
              return groups;
            },[])

            let data = Object.values(agrupadoCompras)

            let agrupadoCompras2 = data.reduce(function (groups, item) {
              const val = item["Mes"];
              groups[val] = groups[val] || {
                Mes: item.Mes,
              };
              // groups[val].Importe += item.Importe;
              groups[val].Mes = item.Mes;
              groups[val][item.Vendedor] = item.Importe
              return groups;
            },[])

            let data2 = Object.values(agrupadoCompras2)
            .sort((a, b) => (a.Mes > b.Mes ? 1 : -1))


          res.status(200).json({data, data2})
        } catch (error) {
           res.status(400).json(error)
            }
    },

    findGraficaVentasEstado: async (req, res)=>{
      const { fechaInicio, fechaFin } = req.params
        try{

    let sur = await  Surtidos.find({fecha:{$gte: fechaInicio, $lte: fechaFin}, is_active:"Si"})
                      .populate('clientes')
                      .populate('areas')

            let array = sur.map((a)=>{
              return{
                Importe: a.total_general,
                Estado: a.clientes[0].estado,
                Area: a.areas[0].name,
                idArea: a.areas[0]._id
              }
            }).filter(function (el) {
              return el != null;
            });
            let ventas = Object.values(array);


        let vt = await VentasTiendas.find({fecha:{$gte: fechaInicio, $lte: fechaFin}, is_active:"Si"})
                .populate('clientes')
                .populate('areas')

                let arrayVT = vt.map((a)=>{
                  return{
                    Importe: a.total_general,
                    Estado: a.clientes[0].estado,
                    Area: a.areas[0].name,
                    idArea: a.areas[0]._id
                  }
                }).filter(function (el) {
                  return el != null;
                });
                let ventasVT = Object.values(arrayVT);

          let arraysVentas = ventas.concat(ventasVT)

            let agrupadoCompras = arraysVentas.reduce(function (groups, item) {
              const val = item["Estado"];
              groups[val] = groups[val] || {
                Estado: item.Estado,
                Importe: 0,
              };
              groups[val].Importe += item.Importe;
              groups[val].Estado = item.Estado;
              groups[val].Area = item.Area;
              groups[val].idArea = item.idArea;
              return groups;
            },[])

            let data = Object.values(agrupadoCompras)
            .sort((a, b) => (a.Estado > b.Estado ? 1 : -1))


          res.status(200).json(data)
        } catch (error) {
           res.status(400).json(error)
            }
    }
}