const {
  Inventarios,
  ArticulosSurtidos,
  ArticulosVentasTiendas,
  Abonos,
  AbonosTiendas,
  Surtidos,
  VentasTiendas,
  ArticulosOC,
  GastosGeneral,
  Clientes,
  Proveedores,
  NotasCargo,
  ArticulosDevoluciones,
  ArticulosDevolucionesTiendas,
  DevolucionesTiendas
} = require("../models");
const moment = require("moment");

module.exports = {
  inventarios: async (req, res) => {
    try {
      let AI = await Inventarios.find({ is_active: "Si", cantidad: { $gt: 0 } })
        .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate({ path: "articulos", populate: { path: "colecciones" } })
        .populate({ path: "articulos", populate: { path: "familias" } })
        .populate({ path: "articulos", populate: { path: "proveedores" } })
        .populate("areas");

      let idDany2 = await AI.map((a) => {
        return {
          codigo: a.articulos[0].codigo,
          nombre: a.articulos[0].nombre,
          idArticulo: a.articulos[0]._id,
          disponible: a.cantidad,
          inventario: a.cantidad,
          precio: a.articulos[0].venta,
          linea: a.articulos[0].lineas[0].name,
          idLinea: a.articulos[0].lineas[0]._id,
          coleccion: a.articulos[0].colecciones[0].name,
          idColeccion: a.articulos[0].colecciones[0]._id,
          familia: a.articulos[0].familias[0].name,
          idFamilia: a.articulos[0].familias[0]._id,
          piezasPorCaja: a.articulos[0].piezasPorCaja,
          area: a.areas[0].name,
          idArea: a.areas[0]._id,
          valor: parseFloat(a.articulos[0].costoMX) * parseFloat(a.cantidad),
          proveedor: a.articulos[0].proveedores[0].nombre_comercial,
          idProveedor: a.articulos[0].proveedores[0]._id,
        };
      });

      let agrupado = idDany2.reduce(function (groups, item) {
        const val = item["idArticulo"] + item["idArea"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          idArea: item.idArea,
          disponible: 0,
          inventario: 0,
          valor: 0,
        };
        groups[val].disponible += item.disponible;
        groups[val].valor += item.valor;
        groups[val].inventario += item.inventario;
        groups[val].codigo = item.codigo;
        groups[val].nombre = item.nombre;
        groups[val].idArticulo = item.idArticulo;
        groups[val].precio = item.precio;
        groups[val].linea = item.linea;
        groups[val].idLinea = item.idLinea;
        groups[val].coleccion = item.coleccion;
        groups[val].idColeccion = item.idColeccion;
        groups[val].familia = item.familia;
        groups[val].idFamilia = item.idFamilia;
        groups[val].piezasPorCaja = item.piezasPorCaja;
        groups[val].area = item.area;
        groups[val].idArea = item.idArea;
        groups[val].proveedor = item.proveedor;
        groups[val].idProveedor = item.idProveedor;
        return groups;
      }, []);

      let otra3 = Object.values(agrupado);

      res.status(200).json(otra3);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  ventas: async (req, res) => {
    const { inicio, fin } = req.params;
    try {
      let startDate = moment(inicio).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      let endDate = moment(fin).format("YYYY-MM-DDTHH:mm:ss.SSSZ");

      let sur = await ArticulosSurtidos.find({
        fecha: { $gte: inicio, $lte: fin },
      })
        .populate("articulosPedido")
        .populate({
          path: "surtidos",
          populate: {
            path: "clientes",
            populate: { path: "departamentosClientes" },
          },
        })
        .populate({ path: "surtidos", populate: { path: "colaboradores" } })
        .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate({ path: "articulos", populate: { path: "proveedores" } })
        .populate("areas");

      let array = sur
        .map((a) => {
          if (a.surtidos[0].is_active == "Si") {
            return {
              Codigo: a.articulos[0].codigo,
              Cantidad: a.cantidad,
              Importe: a.articulosPedido[0].precio * a.cantidad,
              Mes: moment(a.fecha).format("MMMM"),
              // Mes: a.fecha.split("-")[0] + "-" + a.fecha.split("-")[1],
              DepartamentoCliente:
                a.surtidos[0].clientes[0].departamentosClientes[0].name,
              idDepartamentoCliente:
                a.surtidos[0].clientes[0].departamentosClientes[0]._id,
              Cliente: a.surtidos[0].clientes[0].nombre_comercial,
              idCliente: a.surtidos[0].clientes[0]._id,
              idVendedor: a.surtidos[0].colaboradores[0]._id,
              Vendedor:
                a.surtidos[0].colaboradores[0].nombre +
                " " +
                a.surtidos[0].colaboradores[0].apellido,
              Linea: a.articulos[0].lineas[0].name,
              idLinea: a.articulos[0].lineas[0]._id,
              Area: a.areas[0].name,
              idArea: a.areas[0]._id,
              Proveedor: a.articulos[0].proveedores[0].nombre_comercial,
              idProveedor: a.articulos[0].proveedores[0]._id,
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });
      let ventas = Object.values(array);

      let artSur = await ArticulosVentasTiendas.find({
        fecha: { $gte: inicio, $lte: fin },
        is_active: "Si",
      })

        .populate({
          path: "ventasTiendas",
          populate: {
            path: "clientes",
            populate: { path: "departamentosClientes" },
          },
        })
        .populate({
          path: "ventasTiendas",
          populate: { path: "colaboradores" },
        })
        .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate({ path: "articulos", populate: { path: "proveedores" } })
        .populate("areas");

      let array2 = artSur
        .map((a) => {
          return {
            Codigo: a.articulos[0].codigo,
            Cantidad: a.cantidad,
            Importe: a.total,
            Mes: moment(a.fecha).format("MMMM"),
            // Mes: a.ventasTiendas[0].fecha.split("-")[0] + "-" + a.ventasTiendas[0].fecha.split("-")[1],
            DepartamentoCliente:
              a.ventasTiendas[0].clientes[0].departamentosClientes[0].name,
            idDepartamentoCliente:
              a.ventasTiendas[0].clientes[0].departamentosClientes[0]._id,
            Cliente: a.ventasTiendas[0].clientes[0].nombre_comercial,
            idCliente: a.ventasTiendas[0].clientes[0]._id,
            idVendedor: a.ventasTiendas[0].colaboradores[0]._id,
            Vendedor:
              a.ventasTiendas[0].colaboradores[0].nombre +
              " " +
              a.ventasTiendas[0].colaboradores[0].apellido,
            Linea: a.articulos[0].lineas[0].name,
            idLinea: a.articulos[0].lineas[0]._id,
            Area: a.areas[0].name,
            idArea: a.areas[0]._id,
            Proveedor: a.articulos[0].proveedores[0].nombre_comercial,
            idProveedor: a.articulos[0].proveedores[0]._id,
          };
        })
        .filter(function (el) {
          return el != null;
        });
      let ventas2 = Object.values(array2);

      let arraysVentas = ventas.concat(ventas2);

      res.status(200).json(arraysVentas);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  ventasTabla: async (req, res) => {
    const { inicio, fin } = req.params;
    try {
      let startDate = moment(inicio).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      let endDate = moment(fin).format("YYYY-MM-DDTHH:mm:ss.SSSZ");

      let sur = await ArticulosSurtidos.find({
        fecha: { $gte: startDate, $lte: endDate },
      })
        .populate("articulosPedido")
        .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate("areas");

      let array = sur
        .map((a) => {
          if (a.surtidos[0].is_active == "Si") {
            return {
              idArticulo: a.articulos[0]._id,
              Codigo: a.articulos[0].nombre,
              Cantidad: a.cantidad,
              Importe: a.articulosPedido[0].precio * a.cantidad,
              Linea: a.articulos[0].lineas[0].name,
              idLinea: a.articulos[0].lineas[0]._id,
              Area: a.areas[0].name,
              idArea: a.areas[0]._id,
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });
      let ventas = Object.values(array);

      let artSur = await ArticulosVentasTiendas.find({
        createdAt: { $gte: startDate, $lte: endDate },
        is_active: "Si",
      })

        .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate("areas");

      let array2 = artSur
        .map((a) => {
          return {
            idArticulo: a.articulos[0]._id,
            Codigo: a.articulos[0].nombre,
            Cantidad: a.cantidad,
            Importe: a.total,
            Linea: a.articulos[0].lineas[0].name,
            idLinea: a.articulos[0].lineas[0]._id,
            Area: a.areas[0].name,
            idArea: a.areas[0]._id,
          };
        })
        .filter(function (el) {
          return el != null;
        });
      let ventas2 = Object.values(array2);

      let arraysVentas = ventas.concat(ventas2);

      let agrupado = arraysVentas.reduce(function (groups, item) {
        const val = item["idArticulo"] + item["idArea"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          idArea: item.idArea,
          Cantidad: 0,
          Importe: 0,
        };
        groups[val].Cantidad += item.Cantidad;
        groups[val].Importe += item.Importe;
        groups[val].Codigo = item.Codigo;
        groups[val].Linea = item.Linea;
        groups[val].idLinea = item.idLinea;
        groups[val].Area = item.Area;
        groups[val].idArea = item.idArea;
        groups[val].idArticulo = item.idArticulo;
        return groups;
      }, []);

      let computedComments = Object.values(agrupado);

      res.status(200).json(computedComments);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  cobranza: async (req, res) => {
    const { inicio, fin } = req.params;
    try {
      let abo = await Abonos.find({
        fecha: { $gte: inicio, $lte: fin },
        is_active: "Si",
      })
        .populate({ path: "clientes", populate: { path: "vendedor" } })
        .populate({ path: "clientes", populate: { path: "areas" } })
        .populate("colaboradores");

      let arrayAbo = abo
        .map((a) => {
          return {
            Concepto: a.concepto,
            Abonos: a.importe,
            Mes: moment(a.fecha).format("MMMM"),
            Area: a.clientes[0].areas[0].name,
            idArea: a.clientes[0].areas[0]._id,
            Cliente: a.clientes[0].nombre_comercial,
            idCliente: a.clientes[0]._id,
            idVendedor: a.colaboradores[0]._id,
            Vendedor:
              a.colaboradores[0].nombre + " " + a.colaboradores[0].apellido,
          };
        })
        .filter(function (el) {
          return el != null;
        });
      let pagos = Object.values(arrayAbo);

      // let aboTien = await  AbonosTiendas.find({fecha:{$gte: inicio, $lte: fin}, is_active:"Si", ventasTiendas:{$ne:[]} })
      // .populate({ path: "clientes", populate: { path: "areas" } })
      // // .populate({ path: "clientes", populate: { path: "departamentosClientes" } })
      // .populate({ path: "ventasTiendas", populate: { path: "colaboradores" } })

      // let arrayAbo2 = aboTien.map((a)=>{
      //   return{
      //     Concepto: "Abono",
      //     Abonos: a.total,
      //     Mes: moment(a.fecha).format('MMMM'),
      //     Area: a.clientes[0].areas[0].name,
      //     idArea: a.clientes[0].areas[0]._id,
      //     Cliente: a.clientes[0].nombre_comercial,
      //     idCliente: a.clientes[0]._id,
      //     idVendedor: a.ventasTiendas[0].colaboradores[0]._id,
      //     Vendedor: a.ventasTiendas[0].colaboradores[0].nombre + " " + a.ventasTiendas[0].colaboradores[0].apellido,
      //   }
      // }).filter(function (el) {
      //   return el != null;
      // });
      // let pagos2 = Object.values(arrayAbo2);

      // let arrays = pagos.concat(pagos2)

      res.status(200).json(pagos);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  tiendas: async (req, res) => {
    const { inicio, fin } = req.params;
    try {
      let aboTien = await AbonosTiendas.find({
        fecha: { $gte: inicio, $lte: fin },
        is_active: "Si",
        ventasTiendas: { $ne: [] },
      })
        .populate({ path: "clientes", populate: { path: "areas" } })
        .populate({
          path: "ventasTiendas",
          populate: { path: "colaboradores" },
        });

      let arrayAbo2 = aboTien
        .map((a) => {
          return {
            Ventas: 0,
            Abonos: a.total,
            Mes: moment(a.fecha).format("MMMM"),
            Area: a.clientes[0].areas[0].name,
            idArea: a.clientes[0].areas[0]._id,
            Cliente: a.clientes[0].nombre_comercial,
            idCliente: a.clientes[0]._id,
            idVendedor: a.ventasTiendas[0].colaboradores[0]._id,
            Vendedor:
              a.ventasTiendas[0].colaboradores[0].nombre +
              " " +
              a.ventasTiendas[0].colaboradores[0].apellido,
          };
        })
        .filter(function (el) {
          return el != null;
        });
      let pagos2 = Object.values(arrayAbo2);

      let artSur = await VentasTiendas.find({
        fecha: { $gte: inicio, $lte: fin },
        is_active: "Si",
      })
        .populate({ path: "clientes", populate: { path: "areas" } })
        .populate({ path: "colaboradores" });

      let array2 = artSur
        .map((a) => {
          return {
            Ventas: a.total_general,
            Abonos: 0,
            Mes: moment(a.fecha).format("MMMM"),
            Area: a.clientes[0].areas[0].name,
            idArea: a.clientes[0].areas[0]._id,
            Cliente: a.clientes[0].nombre_comercial,
            idCliente: a.clientes[0]._id,
            idVendedor: a.colaboradores[0]._id,
            Vendedor:
              a.colaboradores[0].nombre + " " + a.colaboradores[0].apellido,
          };
        })
        .filter(function (el) {
          return el != null;
        });
      let ventas2 = Object.values(array2);

      let arrays = ventas2.concat(pagos2);

      res.status(200).json(arrays);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  compras: async (req, res) => {
    const { inicio, fin } = req.params;
    try {
      let startDate = moment(inicio).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      let endDate = moment(fin).format("YYYY-MM-DDTHH:mm:ss.SSSZ");

      let AI = await ArticulosOC.find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
        .populate("ordenesCompra")
        .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate({ path: "articulos", populate: { path: "colecciones" } })
        .populate({ path: "articulos", populate: { path: "familias" } })
        .populate({ path: "articulos", populate: { path: "proveedores" } });

      let idDany2 = await AI.map((a) => {
        return {
          Mes: moment(a.ordenesCompra[0].fecha).format("MMMM"),
          codigo: a.articulos[0].codigo,
          nombre: a.articulos[0].nombre,
          idArticulo: a.articulos[0]._id,
          cantidad: a.cantidad,
          embarcado: a.embarcado,
          pendiente_embarcar: a.pendiente_embarcar,
          precio: a.precio,
          total: a.total,
          linea: a.articulos[0].lineas[0].name,
          idLinea: a.articulos[0].lineas[0]._id,
          coleccion: a.articulos[0].colecciones[0].name,
          idColeccion: a.articulos[0].colecciones[0]._id,
          familia: a.articulos[0].familias[0].name,
          idFamilia: a.articulos[0].familias[0]._id,
          proveedor: a.articulos[0].proveedores[0].nombre_comercial,
          idProveedor: a.articulos[0].proveedores[0]._id,
        };
      });

      let agrupado = idDany2.reduce(function (groups, item) {
        const val = item["idArticulo"] + item["Mes"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          Mes: item.Mes,
          cantidad: 0,
          embarcado: 0,
          pendiente_embarcar: 0,
          total: 0,
        };
        groups[val].cantidad += item.cantidad;
        groups[val].embarcado += item.embarcado;
        groups[val].pendiente_embarcar += item.pendiente_embarcar;
        groups[val].total += item.total;
        groups[val].Mes = item.Mes;
        groups[val].codigo = item.codigo;
        groups[val].nombre = item.nombre;
        groups[val].idArticulo = item.idArticulo;
        groups[val].precio = item.precio;
        groups[val].linea = item.linea;
        groups[val].idLinea = item.idLinea;
        groups[val].coleccion = item.coleccion;
        groups[val].idColeccion = item.idColeccion;
        groups[val].familia = item.familia;
        groups[val].idFamilia = item.idFamilia;
        groups[val].proveedor = item.proveedor;
        groups[val].idProveedor = item.idProveedor;
        return groups;
      }, []);

      let otra3 = Object.values(agrupado);

      res.status(200).json(otra3);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  gastos: async (req, res) => {
    const { inicio, fin } = req.params;
    try {
      let startDate = moment(inicio).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      let endDate = moment(fin).format("YYYY-MM-DDTHH:mm:ss.SSSZ");

      let AI = await GastosGeneral.find({ fecha: { $gte: inicio, $lte: fin } })
        .populate("bancos")
        .populate("categorias")
        .populate("subCategorias")
        .populate("solicitantes");

      let idDany2 = await AI.map((a) => {
        return {
          Mes: moment(a.fecha).format("MMMM"),
          total: a.total,
          banco: a.bancos[0].cuenta,
          idBanco: a.bancos[0]._id,
          categoria: a.categorias[0].name,
          idCategoria: a.categorias[0]._id,
          subCategoria: a.subCategorias[0].name,
          idSubCategoria: a.subCategorias[0]._id,
          solicitante: a.solicitantes[0].name,
          idSolicitante: a.solicitantes[0]._id,
        };
      });

      // let agrupado = idDany2.reduce(function (groups, item) {
      //   const val = item["Mes"]
      //   groups[val] = groups[val] || {
      //     Mes: item.Mes,
      //     cantidad: 0,
      //     embarcado: 0,
      //     pendiente_embarcar: 0,
      //     total: 0
      //   };
      //   groups[val].cantidad += item.cantidad;
      //   groups[val].embarcado += item.embarcado;
      //   groups[val].pendiente_embarcar += item.pendiente_embarcar;
      //   groups[val].total += item.total;
      //   groups[val].Mes = item.Mes;
      //   groups[val].codigo = item.codigo;
      //   groups[val].nombre = item.nombre;
      //   groups[val].idArticulo = item.idArticulo;
      //   groups[val].precio = item.precio;
      //   groups[val].linea = item.linea;
      //   groups[val].idLinea = item.idLinea;
      //   groups[val].coleccion = item.coleccion;
      //   groups[val].idColeccion = item.idColeccion;
      //   groups[val].familia = item.familia;
      //   groups[val].idFamilia = item.idFamilia;
      //   groups[val].proveedor = item.proveedor;
      //   groups[val].idProveedor = item.idProveedor;
      //   groups[val].ano = item.ano;
      //   return groups;
      // }, []);

      let otra3 = Object.values(idDany2);

      res.status(200).json(otra3);
    } catch (error) {
      res.status(400).json(error);
    }
  },
balance: async (req, res) => {
  try {
    // ===== Inventario =====
    const inventarios = await Inventarios.find({ is_active: "Si" }).populate("articulos");

    const ValorInventario = inventarios
      .map((a) => {
        const costo = Number(a?.articulos?.[0]?.costoMX ?? 0);
        const cantidad = Number(a?.cantidad ?? 0); // <-- ajusta si tu cantidad está en otro campo
        const total = costo * cantidad;
        return Number.isFinite(total) ? total : 0;
      })
      .reduce((sum, n) => sum + n, 0);

    // ===== CxC =====
    const clientes = await Clientes.find({});
    const SaldoClientes = (clientes || [])
      .map((c) => Number(c?.saldo ?? 0))
      .filter(Number.isFinite)
      .reduce((sum, n) => sum + n, 0);

    // ===== CxP (separado por moneda) =====
    const proveedores = await Proveedores.find({ is_active: "Si" }); // puedes filtrar saldo si quieres

    let SaldoProveedoresMXN = 0;
    let SaldoProveedoresUSD = 0;

    for (const p of proveedores) {
      const s = Number(p?.saldo ?? 0);
      if (!Number.isFinite(s)) continue;

      // 👉 Normaliza moneda (por si viene "usd", "Dlls", etc.)
      const mon = String(p?.moneda ?? "MXN").trim().toUpperCase();

      if (mon === "USD") SaldoProveedoresUSD += s;
      else SaldoProveedoresMXN += s; // default MXN
    }

    res.status(200).json([{
      ValorInventario,
      SaldoClientes,
      SaldoProveedoresMXN,
      SaldoProveedoresUSD,
    }]);
  } catch (error) {
    res.status(400).json(error);
  }
},


antiguedadSaldosVencido: async (req, res) => {
  try {
    const [surtidos, notasCargo] = await Promise.all([
      Surtidos.find({ is_active: "Si", saldo: { $gt: 0 } })
        .populate({ path: "clientes", populate: { path: "areas" } })
        .populate({ path: "clientes", populate: { path: "vendedor" } })
        .populate("articulos"),
      NotasCargo.find({ saldo: { $gt: 0 } })
        .populate({ path: "clientes", populate: { path: "areas" } })
        .populate({ path: "clientes", populate: { path: "vendedor" } })
    ]);

    const now = moment().startOf("day");
    const saldosPorCliente = {};
    const AREA_EXCLUIDA = "6201b1920f94f86068a741c6";

    const calcularAntiguedad = (fecha, plazo) => {
      const fechaVencimiento = moment(fecha).add(plazo || 0, "days").startOf("day");
      const diferenciaDias = fechaVencimiento.diff(now, "days");

      let rango = "otro";
      if (diferenciaDias >= 0) rango = "enTiempo";
      else if (diferenciaDias >= -30) rango = "treinta";
      else if (diferenciaDias >= -60) rango = "sesenta";
      else if (diferenciaDias >= -90) rango = "noventa";
      else if (diferenciaDias >= -120) rango = "cientoveinte";
      else if (diferenciaDias >= -180) rango = "cientoochenta";

      return { rango, fechaVencimiento };
    };

    const inicializarCliente = (cliente) => ({
      clienteId: cliente._id.toString(),
      nombreCliente: cliente.nombre_comercial,
      // Vendedor dado de alta en el cliente
      vendedor: cliente.vendedor?.[0]
        ? `${cliente.vendedor[0].nombre || ""} ${cliente.vendedor[0].apellido || ""}`.trim()
        : "",
      saldo: cliente.saldo,
      enTiempo: 0,
      treinta: 0,
      sesenta: 0,
      noventa: 0,
      cientoveinte: 0,
      cientoochenta: 0,
      otro: 0,
      surtidos: {
        enTiempo: [],
        treinta: [],
        sesenta: [],
        noventa: [],
        cientoveinte: [],
        cientoochenta: [],
        otro: [],
      },
      notasCargo: {
        enTiempo: [],
        treinta: [],
        sesenta: [],
        noventa: [],
        cientoveinte: [],
        cientoochenta: [],
        otro: [],
      },
    });

    const clienteValido = (cliente) => {
      const areas = cliente.areas || [];
      return !areas.some((area) => area._id?.toString() === AREA_EXCLUIDA);
    };

    surtidos.forEach((surtido) => {
      const cliente = surtido.clientes[0];
      if (!cliente || !clienteValido(cliente)) return;

      const clienteId = cliente._id.toString();
      if (!saldosPorCliente[clienteId]) {
        saldosPorCliente[clienteId] = inicializarCliente(cliente);
      }

      const { rango, fechaVencimiento } = calcularAntiguedad(surtido.fecha, cliente.plazo);
      saldosPorCliente[clienteId][rango] += surtido.saldo;
      saldosPorCliente[clienteId].surtidos[rango].push({
        ...surtido.toObject(),
        fechaVencimiento: fechaVencimiento.format("YYYY-MM-DD"),
      });
    });

    notasCargo.forEach((nota) => {
      const cliente = nota.clientes[0];
      if (!cliente || !clienteValido(cliente)) return;

      const clienteId = cliente._id.toString();
      if (!saldosPorCliente[clienteId]) {
        saldosPorCliente[clienteId] = inicializarCliente(cliente);
      }

      const { rango, fechaVencimiento } = calcularAntiguedad(nota.fecha, cliente.plazo);
      saldosPorCliente[clienteId][rango] += nota.saldo;
      saldosPorCliente[clienteId].notasCargo[rango].push({
        ...nota.toObject(),
        fechaVencimiento: fechaVencimiento.format("YYYY-MM-DD"),
      });
    });

    const resultadoFinal = Object.values(saldosPorCliente).map((cliente) => {
      const rangos = ["enTiempo", "treinta", "sesenta", "noventa", "cientoveinte", "cientoochenta", "otro"];
      const totalGeneral = rangos.reduce((sum, rango) => sum + cliente[rango], 0);
      return {
        ...cliente,
        totalGeneral,
      };
    });

    res.status(200).json(resultadoFinal);
  } catch (error) {
    console.log("Error en antiguedadSaldosVencido:", error);
    res.status(400).json({ message: "Error al obtener la antigüedad de saldos.", error });
  }
},


  antiguedadSaldosPorCobrar: async (req, res) => {
    try {
      let surtidos = await Surtidos.find({
        is_active: "Si",
        saldo: { $gt: 0 },
        iva: 0
      }).populate({ path: "clientes", populate: { path: "areas" } });

      let now = moment().startOf("day"); // Considera solo la parte de la fecha

      let saldosPorCliente = {};

      // Tienda Aby se migro a otra base de datos: su cartera no debe salir en
      // ningun reporte de saldos. Mismo criterio que antiguedadSaldosVencido.
      const AREA_EXCLUIDA = "6201b1920f94f86068a741c6";
      const clienteValido = (cliente) =>
        !(cliente?.areas || []).some(
          (area) => (area?._id || area)?.toString() === AREA_EXCLUIDA
        );

      surtidos.forEach((surtido) => {
        if (!surtido.clientes[0] || !clienteValido(surtido.clientes[0])) return;
        let plazoCliente = surtido.clientes[0].plazo;
        let fechaVencimiento = moment(surtido.fecha)
          .add(plazoCliente, "days")
          .startOf("day");

        let clienteId = surtido.clientes[0]._id.toString(); // Convierte el ObjectId a string

        if (!saldosPorCliente[clienteId]) {
          saldosPorCliente[clienteId] = {
            clienteId: clienteId,
            nombreCliente: surtido.clientes[0].nombre_comercial,
            saldo: surtido.clientes[0].saldo,
            vencido: 0,
            treinta: 0,
            sesenta: 0,
            noventa: 0,
            cientoveinte: 0,
            cientoochenta: 0,
            otro: 0,
          };
        }

        // Calcula la antigüedad usando diff para obtener la diferencia en días
        let diferenciaDias = fechaVencimiento.diff(now, "days");
        let antiguedad = "otro"; // Por defecto, categoría 'otro'

        if (diferenciaDias < 0) {
          antiguedad = "vencido";
        } else if (diferenciaDias <= 30) {
          antiguedad = "treinta";
        } else if (diferenciaDias <= 60) {
          antiguedad = "sesenta";
        } else if (diferenciaDias <= 90) {
          antiguedad = "noventa";
        } else if (diferenciaDias <= 120) {
          antiguedad = "cientoveinte";
        } else if (diferenciaDias <= 180) {
          antiguedad = "cientoochenta";
        }

        // Acumula el saldo en la categoría de antigüedad
        saldosPorCliente[clienteId][antiguedad] += surtido.saldo;
      });

      // Transforma el objeto en el formato final
      let resultadoFinal = Object.values(saldosPorCliente).map((cliente) => ({
        clienteId: cliente.clienteId,
        nombreCliente: cliente.nombreCliente,
        saldo: cliente.saldo,
        vencido: cliente.vencido,
        treinta: cliente.treinta,
        sesenta: cliente.sesenta,
        noventa: cliente.noventa,
        cientoveinte: cliente.cientoveinte,
        cientoochenta: cliente.cientoochenta,
        otro: cliente.otro,
      }));

      res.status(200).json(resultadoFinal);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  // antiguedadSaldosVencido: async (req, res) => {
  //   try {
  //     let surtidos = await Surtidos.find({
  //       is_active: "Si",
  //       saldo: { $gt: 0 },
  //       iva: 0
  //     }).populate("clientes");

  //     let now = moment().startOf("day"); // Considera solo la parte de la fecha

  //     let saldosPorCliente = {};

  //     surtidos.forEach((surtido) => {
  //       let plazoCliente = surtido.clientes[0].plazo;
  //       let fechaVencimiento = moment(surtido.fecha)
  //         .add(plazoCliente, "days")
  //         .startOf("day");

  //       let clienteId = surtido.clientes[0]._id.toString(); // Convierte el ObjectId a string

  //       if (!saldosPorCliente[clienteId]) {
  //         saldosPorCliente[clienteId] = {
  //           clienteId: clienteId,
  //           nombreCliente: surtido.clientes[0].nombre_comercial,
  //           saldo: surtido.clientes[0].saldo,
  //           enTiempo: 0,
  //           treinta: 0,
  //           sesenta: 0,
  //           noventa: 0,
  //           cientoveinte: 0,
  //           cientoochenta: 0,
  //           otro: 0,
  //         };
  //       }

  //       // Calcula la antigüedad usando diff para obtener la diferencia en días
  //       let diferenciaDias = fechaVencimiento.diff(now, "days");
  //       let antiguedad = "otro"; // Por defecto, categoría 'otro'

  //       if (diferenciaDias >= 0) {
  //         antiguedad = "enTiempo";
  //       } else if (diferenciaDias <= -1 && diferenciaDias >= -30) {
  //         antiguedad = "treinta";
  //       } else if (diferenciaDias <= -31 && diferenciaDias >= -60) {
  //         antiguedad = "sesenta";
  //       } else if (diferenciaDias <= -61 && diferenciaDias >= -90) {
  //         antiguedad = "noventa";
  //       } else if (diferenciaDias <= -91 && diferenciaDias >= -120) {
  //         antiguedad = "cientoveinte";
  //       } else if (diferenciaDias <= -121 && diferenciaDias >= -180) {
  //         antiguedad = "cientoochenta";
  //       }

  //       // Acumula el saldo en la categoría de antigüedad
  //       saldosPorCliente[clienteId][antiguedad] += surtido.saldo;
  //     });

  //     // Transforma el objeto en el formato final
  //     let resultadoFinal = Object.values(saldosPorCliente).map((cliente) => ({
  //       clienteId: cliente.clienteId,
  //       nombreCliente: cliente.nombreCliente,
  //       saldo: cliente.saldo,
  //       enTiempo: cliente.enTiempo,
  //       treinta: cliente.treinta,
  //       sesenta: cliente.sesenta,
  //       noventa: cliente.noventa,
  //       cientoveinte: cliente.cientoveinte,
  //       cientoochenta: cliente.cientoochenta,
  //       otro: cliente.otro,
  //     }));

  //     res.status(200).json(resultadoFinal);
  //   } catch (error) {
  //     res.status(400).json(error);
  //   }
  // },
  // antiguedadSaldosVencidoEdoCta: async (req, res) => {
  //   const { cliente } = req.params
  //   try {
  //     let surtidos = await Surtidos.find({ is_active: "Si", saldo: { $gt: 0 }, clientes: cliente })
  //       .populate("clientes")

  //     let now = moment().startOf('day');  // Considera solo la parte de la fecha

  //     let saldosPorCliente = {};

  //     surtidos.forEach((surtido) => {
  //       let plazoCliente = surtido.clientes[0].plazo;
  //       let fechaVencimiento = moment(surtido.fecha).add(plazoCliente, 'days').startOf('day');

  //       let clienteId = surtido.clientes[0]._id.toString();  // Convierte el ObjectId a string

  //       if (!saldosPorCliente[clienteId]) {
  //         saldosPorCliente[clienteId] = {
  //           clienteId: clienteId,
  //           nombreCliente: surtido.clientes[0].nombre_comercial,
  //           saldo: surtido.clientes[0].saldo,
  //           enTiempo: 0,
  //           treinta: 0,
  //           sesenta: 0,
  //           noventa: 0,
  //           cientoveinte: 0,
  //           cientoochenta: 0,
  //           otro: 0,
  //         };
  //       }

  //       // Calcula la antigüedad usando diff para obtener la diferencia en días
  //       let diferenciaDias = fechaVencimiento.diff(now, 'days');
  //       let antiguedad = 'otro';  // Por defecto, categoría 'otro'

  //       if (diferenciaDias >= 0) {
  //         antiguedad = 'enTiempo';
  //       } else if (diferenciaDias <= -1 && diferenciaDias >= -30) {
  //         antiguedad = 'treinta';
  //       } else if (diferenciaDias <= -31 && diferenciaDias >= -60) {
  //         antiguedad = 'sesenta';
  //       } else if (diferenciaDias <= -61 && diferenciaDias >= -90) {
  //         antiguedad = 'noventa';
  //       } else if (diferenciaDias <= -91 && diferenciaDias >= -120) {
  //         antiguedad = 'cientoveinte';
  //       } else if (diferenciaDias <= -121 && diferenciaDias >= -180) {
  //         antiguedad = 'cientoochenta';
  //       }

  //       // Acumula el saldo en la categoría de antigüedad
  //       saldosPorCliente[clienteId][antiguedad] += surtido.saldo;
  //     });

  //     // Transforma el objeto en el formato final
  //     let resultadoFinal = Object.values(saldosPorCliente).map((cliente) => ({
  //       clienteId: cliente.clienteId,
  //       nombreCliente: cliente.nombreCliente,
  //       saldo: cliente.saldo,
  //       enTiempo: cliente.enTiempo,
  //       treinta: cliente.treinta,
  //       sesenta: cliente.sesenta,
  //       noventa: cliente.noventa,
  //       cientoveinte: cliente.cientoveinte,
  //       cientoochenta: cliente.cientoochenta,
  //       otro: cliente.otro,
  //     }));

  //     res.status(200).json(resultadoFinal);
  //   } catch (error) {
  //     res.status(400).json(error);
  //   }
  // },

  // antiguedadSaldosVencidoEdoCta: async (req, res) => {
  //   const { cliente } = req.params;
  //   try {
  //     let surtidos = await Surtidos.find({ is_active: "Si", saldo: { $gt: 0 }, clientes: cliente })
  //       .populate("clientes");

  //     let now = moment().startOf('day');  // Considera solo la parte de la fecha

  //     let resultadoFinal = [];

  //     surtidos.forEach((surtido) => {
  //       let plazoCliente = surtido.clientes[0].plazo;
  //       let fechaVencimiento = moment(surtido.fecha).add(plazoCliente, 'days').startOf('day');

  //       // Calcula la antigüedad usando diff para obtener la diferencia en días
  //       let diferenciaDias = fechaVencimiento.diff(now, 'days');
  //       let antiguedad = 'otro';  // Por defecto, categoría 'otro'

  //       if (diferenciaDias >= 0) {
  //         antiguedad = 'enTiempo';
  //       } else if (diferenciaDias <= -1 && diferenciaDias >= -30) {
  //         antiguedad = 'treinta';
  //       } else if (diferenciaDias <= -31 && diferenciaDias >= -60) {
  //         antiguedad = 'sesenta';
  //       } else if (diferenciaDias <= -61 && diferenciaDias >= -90) {
  //         antiguedad = 'noventa';
  //       } else if (diferenciaDias <= -91 && diferenciaDias >= -120) {
  //         antiguedad = 'cientoveinte';
  //       } else if (diferenciaDias <= -121 && diferenciaDias >= -180) {
  //         antiguedad = 'cientoochenta';
  //       }

  //       // Create a new row for each surtido with its corresponding category
  //       let row = {
  //         clienteId: surtido.clientes[0]._id.toString(),
  //         nombreCliente: surtido.clientes[0].nombre_comercial,
  //         saldo: surtido.saldo,
  //         antiguedad: antiguedad,
  //         folio: surtido.idSurtido,
  //         fechaVencimiento: fechaVencimiento,
  //       };

  //       resultadoFinal.push(row);
  //     });

  //     res.status(200).json(resultadoFinal);
  //   } catch (error) {
  //     res.status(400).json(error);
  //   }
  // },


  antiguedadSaldosVencidoEdoCta: async (req, res) => {
    const { cliente } = req.params;
    try {
      let now = moment().startOf("day"); // Considera solo la parte de la fecha

      let surt = await Surtidos.find({
        is_active: "Si",
        saldo: { $gt: 0 },
        clientes: cliente,
      }).populate("clientes");

      let daSur = surt.map((a) => {
        return {
          clienteId: a.clientes[0]._id,
          nombreCliente: a.clientes[0].nombre_comercial,
          plazo: a.plazo,
          fecha: a.fecha,
          folio: a.salidaBodega,
          saldo: a.saldo,
        };
      });

      let noCar = await NotasCargo.find({
        saldo: { $gt: 0 },
        clientes: cliente,
      }).populate("clientes");
      let daNC = noCar.map((a) => {
        return {
          clienteId: a.clientes[0]._id,
          nombreCliente: a.clientes[0].nombre_comercial,
          plazo: a.clientes[0].plazo,
          fecha: a.fecha,
          folio: a.idNotaCargo,
          saldo: a.saldo,
        };
      });

      let datos = daSur.concat(noCar);

      let resultadoFinal = [];

      datos.forEach((surtido) => {
        let plazoSurtido = surtido.plazo;
        let fechaVencimiento = moment(surtido.fecha)
          .add(plazoSurtido, "days")
          .startOf("day");

        // Calcula la antigüedad usando diff para obtener la diferencia en días
        let diferenciaDias = fechaVencimiento.diff(now, "days");
        let antiguedad = "otro"; // Por defecto, categoría 'otro'

        if (diferenciaDias >= 0) {
          antiguedad = "enTiempo";
        } else if (diferenciaDias <= -1 && diferenciaDias >= -30) {
          antiguedad = "treinta";
        } else if (diferenciaDias <= -31 && diferenciaDias >= -60) {
          antiguedad = "sesenta";
        } else if (diferenciaDias <= -61 && diferenciaDias >= -90) {
          antiguedad = "noventa";
        } else if (diferenciaDias <= -91) {
          antiguedad = "masnoventa";
        }

        // Include saldo directly in the row without an array
        let row = {
          clienteId: surtido.clienteId,
          nombreCliente: surtido.nombreCliente,
          folio: surtido.folio,
          fecha: surtido.fecha,
          fechaVencimiento: moment(surtido.fecha)
            .add(surtido.plazo, "days")
            .startOf("day"),
          [antiguedad]: surtido.saldo,
        };

        resultadoFinal.push(row);
      });

      res.status(200).json(resultadoFinal);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  utilidadVenta: async (req, res) => {
    const { inicio, fin } = req.params;
    try {
      let sur = await ArticulosSurtidos.find({
        fecha: { $gte: inicio, $lte: fin },
      })
        .populate("articulosPedido")
        .populate("articulos")
        .populate({ path: "surtidos", populate: { path: "clientes" } })
        .populate({ path: "surtidos", populate: { path: "areas" } });
      let array = sur
        .map((a) => {
          if (a.surtidos[0].is_active == "Si") {
            return {
              surtido: a.surtidos[0].idSurtido,
              idSurtido: a.surtidos[0]._id,
              cliente: a.surtidos[0].clientes[0].nombre_comercial,
              idCliente: a.surtidos[0].clientes[0]._id,
              fecha: a.surtidos[0].fecha,
              precio: a.articulosPedido[0].precio,
              cantidad: a.cantidad,
              precioTotal: a.articulosPedido[0].precio * a.cantidad,
              costo: a.articulos[0].costoMX,
              costoTotal: a.articulos[0].costoMX * a.cantidad,
              area: a.surtidos[0].areas[0].name,
              idArea: a.surtidos[0].areas[0]._id,
              movimiento: "Venta",
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });
      let ventas = Object.values(array);

      let artSurTien = await ArticulosVentasTiendas.find({
        fecha: { $gte: inicio, $lte: fin },
        is_active: "Si",
        entregado: "Si",
      })
        .populate({
          path: "ventasTiendas",
          populate: {
            path: "clientes",
            populate: { path: "departamentosClientes" },
          },
        })
        .populate({ path: "ventasTiendas", populate: { path: "user" } })
        .populate({ path: "ventasTiendas", populate: { path: "areas" } })
        .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate({ path: "articulos", populate: { path: "proveedores" } });
      let array2 = artSurTien
        .map((a) => {
          if (a.ventasTiendas[0].is_active == "Si") {
            return {
              surtido: a.ventasTiendas[0].idVentaTienda,
              idSurtido: a.ventasTiendas[0]._id,
              cliente: a.ventasTiendas[0].clientes[0].nombre_comercial,
              idCliente: a.ventasTiendas[0].clientes[0]._id,
              fecha: a.ventasTiendas[0].fecha,
              precio: a.precio,
              cantidad: a.cantidad,
              precioTotal: a.total,
              costo: a.articulos[0].costoMX,
              costoTotal: a.articulos[0].costoMX * a.cantidad,
              area: a.ventasTiendas[0].areas[0].name,
              idArea: a.ventasTiendas[0].areas[0]._id,
              movimiento: "Venta",
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });
      let ventas2 = Object.values(array2);
      // Devoluciones
      let dev = await ArticulosDevoluciones.find({
        fecha: { $gte: inicio, $lte: fin },
      })
        .populate("articulos")
        .populate({ path: "devoluciones", populate: { path: "areas" } })
        .populate({ path: "devoluciones", populate: { path: "clientes" } });

      let arrayDev = dev
        .map((a) => {
          if (a.devoluciones[0].is_active == "Si") {
            return {
              surtido: a.devoluciones[0].idDevolucion,
              idSurtido: a.devoluciones[0]._id,
              cliente: a.devoluciones[0].clientes[0].nombre_comercial,
              idCliente: a.devoluciones[0].clientes[0]._id,
              fecha: a.fecha,
              precio: a.precio,
              cantidad: -a.cantidad,
              precioTotal: -(a.precio * a.cantidad),
              costo: a.articulos[0].costoMX,
              costoTotal: a.articulos[0].costoMX * a.cantidad,
              area: a.devoluciones[0].areas[0].name,
              idArea: a.devoluciones[0].areas[0]._id,
              movimiento: "Devolucion",
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });
      let devoluciones = Object.values(arrayDev);

      // Devoluciones Tiendas
      let devTiendas = await ArticulosDevolucionesTiendas.find({
        fecha: { $gte: inicio, $lte: fin },
      })
        .populate("articulos")
        .populate({ path: "devolucionesTiendas", populate: { path: "areas" } })
        .populate({
          path: "devolucionesTiendas",
          populate: { path: "clientes" },
        });

      let arrayDevTiendas = devTiendas
        .map((a) => {
          if (a.devolucionesTiendas[0].is_active == "Si") {
            return {
              surtido: a.devolucionesTiendas[0].idDevolucionTienda,
              idSurtido: a.devolucionesTiendas[0]._id,
              cliente: a.devolucionesTiendas[0].clientes[0].nombre_comercial,
              idCliente: a.devolucionesTiendas[0].clientes[0]._id,
              fecha: a.fecha,
              precio: a.precio,
              cantidad: -a.cantidad,
              precioTotal: -(a.precio * a.cantidad),
              costo: a.articulos[0].costoMX,
              costoTotal: a.articulos[0].costoMX * a.cantidad,
              area: a.devolucionesTiendas[0].areas[0].name,
              idArea: a.devolucionesTiendas[0].areas[0]._id,
              movimiento: "Devolucion",
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });
      let devolucionesTiendas = Object.values(arrayDevTiendas);

      let arraysVentas = ventas.concat(
        ventas2,
        devoluciones,
        devolucionesTiendas
      );

      let agrupado = arraysVentas.reduce(function (groups, item) {
        const val = item["idSurtido"];
        groups[val] = groups[val] || {
          idSurtido: item.idSurtido,
          precioTotal: 0,
          costoTotal: 0,
        };
        groups[val].surtido = item.surtido;
        groups[val].idSurtido = item.idSurtido;
        groups[val].cliente = item.cliente;
        groups[val].idCliente = item.idCliente;
        groups[val].fecha = item.fecha;
        groups[val].precioTotal += item.precioTotal;
        groups[val].costoTotal += item.costoTotal;
        groups[val].area = item.area;
        groups[val].idArea = item.idArea;
        groups[val].movimiento = item.movimiento;
        return groups;
      }, []);

      let dataFinal = Object.values(agrupado);
      let dataFinal2 = dataFinal
        .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
        .map((a) => {
          return {
            area: a.area,
            fecha: a.fecha,
            cliente: a.cliente,
            surtido: a.surtido,
            costoTotal: a.costoTotal,
            precioTotal: a.precioTotal,
            utilidad: a.precioTotal - a.costoTotal,
            porcentaje: ((a.precioTotal - a.costoTotal) / a.precioTotal) * 100,
            movimiento: a.movimiento,
          };
        });

      res.status(200).json(dataFinal2);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  utilidadArticulo: async (req, res) => {
    const { inicio, fin } = req.params;
    try {
      let sur = await ArticulosSurtidos.find({
        fecha: { $gte: inicio, $lte: fin },
        cantidad: { $gt: 0 },
      })
        .populate("articulosPedido")
        .populate("articulos")
        .populate({ path: "surtidos", populate: { path: "areas" } });
      let array = sur
        .map((a) => {
          if (a.surtidos[0].is_active == "Si") {
            return {
              articulo: a.articulos[0].codigo,
              idArticulo: a.articulos[0]._id,
              fecha: a.fecha,
              precio: a.articulosPedido[0].precio,
              cantidad: a.cantidad,
              precioTotal: a.articulosPedido[0].precio * a.cantidad,
              costo: a.articulos[0].costoMX,
              costoTotal: a.articulos[0].costoMX * a.cantidad,
              area: a.surtidos[0].areas[0].name,
              idArea: a.surtidos[0].areas[0]._id,
              movimiento: "Venta",
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });
      let ventas = Object.values(array);
      let artSurTien = await ArticulosVentasTiendas.find({
        fecha: { $gte: inicio, $lte: fin },
        is_active: "Si",
      })
        .populate("articulos")
        .populate({ path: "ventasTiendas", populate: { path: "areas" } });
      let array2 = artSurTien
        .map((a) => {
          // Contar TODAS las ventas de tienda activas (pagadas y a crédito),
          // para que la columna Venta cuadre con el ListadoVentasTiendas.
          if (
            a.ventasTiendas[0].is_active == "Si"
          ) {
            return {
              articulo: a.articulos[0].codigo,
              idArticulo: a.articulos[0]._id,
              fecha: a.fecha,
              precio: a.precio,
              cantidad: a.cantidad,
              precioTotal: a.total,
              costo: a.articulos[0].costoMX,
              costoTotal: a.articulos[0].costoMX * a.cantidad,
              area: a.ventasTiendas[0].areas[0].name,
              idArea: a.ventasTiendas[0].areas[0]._id,
              movimiento: "Venta",
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });
      let ventas2 = Object.values(array2);
      // Devoluciones
      let dev = await ArticulosDevoluciones.find({
        fecha: { $gte: inicio, $lte: fin },
        cantidad: { $gt: 0 },
      })
        .populate("articulos")
        .populate({ path: "devoluciones", populate: { path: "areas" } });

      let arrayDev = dev
        .map((a) => {
          if (a.devoluciones[0].is_active == "Si") {
            return {
              articulo: a.articulos[0].codigo,
              idArticulo: a.articulos[0]._id,
              fecha: a.fecha,
              precio: a.precio,
              cantidad: -a.cantidad,
              precioTotal: -a.total,
              costo: a.articulos[0].costoMX,
              costoTotal: -(a.articulos[0].costoMX * a.cantidad),
              area: a.devoluciones[0].areas[0].name,
              idArea: a.devoluciones[0].areas[0]._id,
              movimiento: "Devolucion",
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });
      let devoluciones = Object.values(arrayDev);

      // Devoluciones Tiendas
      let devTiendas = await ArticulosDevolucionesTiendas.find({
        fecha: { $gte: inicio, $lte: fin },
        cantidad: { $gt: 0 },
      })
        .populate("articulos")
        .populate({ path: "devolucionesTiendas", populate: { path: "areas" } });

      let arrayDevTiendas = devTiendas
        .map((a) => {
          if (a.devolucionesTiendas[0].is_active == "Si") {
            return {
              articulo: a.articulos[0].codigo,
              idArticulo: a.articulos[0]._id,
              fecha: a.fecha,
              precio: a.precio,
              cantidad: -a.cantidad,
              precioTotal: -a.total,
              costo: a.articulos[0].costoMX,
              costoTotal: -(a.articulos[0].costoMX * a.cantidad),
              area: a.devolucionesTiendas[0].areas[0].name,
              idArea: a.devolucionesTiendas[0].areas[0]._id,
              movimiento: "Devolucion",
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });
      let devolucionesTiendas = Object.values(arrayDevTiendas);

      let arraysVentas = ventas.concat(
        ventas2,
        devoluciones,
        devolucionesTiendas
      );

      let agrupado = arraysVentas.reduce(function (groups, item) {
        const val =
          item["idArticulo"] +
          item["idArea"] +
          item["fecha"] +
          item["movimiento"];
        groups[val] = groups[val] || {
          idArticulo: item.idArticulo,
          idArea: item.idArea,
          fecha: item.fecha,
          movimiento: item.movimiento,
          precioTotal: 0,
          costoTotal: 0,
          cantidad: 0,
        };
        groups[val].articulo = item.articulo;
        groups[val].idArticulo = item.idArticulo;
        groups[val].cliente = item.cliente;
        groups[val].idCliente = item.idCliente;
        groups[val].fecha = item.fecha;
        groups[val].precio = item.precio;
        groups[val].precioTotal += item.precioTotal;
        groups[val].costoTotal += item.costoTotal;
        groups[val].cantidad += item.cantidad;
        groups[val].area = item.area;
        groups[val].idArea = item.idArea;
        groups[val].movimiento = item.movimiento;
        return groups;
      }, []);

      let dataFinal = Object.values(agrupado);
      let dataFinal2 = dataFinal
        .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
        .map((a) => {
          if (a.precioTotal > 0 && a.costoTotal > 0) {
            return {
              area: a.area,
              idArea: a.idArea,
              fecha: a.fecha,
              articulo: a.articulo,
              idArticulo: a.idArticulo,
              costoTotal: a.costoTotal,
              cantidad: a.cantidad,
              precio: a.precio,
              precioTotal: a.precioTotal,
              utilidad: a.precioTotal - a.costoTotal,
              porcentaje:
                ((a.precioTotal - a.costoTotal) / a.precioTotal) * 100,
              movimiento: a.movimiento,
            };
          } else {
            return {
              area: a.area,
              idArea: a.idArea,
              fecha: a.fecha,
              articulo: a.articulo,
              idArticulo: a.idArticulo,
              costoTotal: a.costoTotal,
              cantidad: a.cantidad,
              precio: a.precio,
              precioTotal: a.precioTotal,
              utilidad: a.precioTotal - a.costoTotal,
              porcentaje: 0,
              movimiento: a.movimiento,
            };
          }
        });

      res.status(200).json(dataFinal2);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  utilidadLinea: async (req, res) => {
    const { inicio, fin } = req.params;
    try {
      let sur = await ArticulosSurtidos.find({
        fecha: { $gte: inicio, $lte: fin },
        cantidad: { $gt: 0 },
      })
        .populate("articulosPedido")
        .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate({ path: "surtidos", populate: { path: "areas" } });
      let array = sur
        .map((a) => {
          if (a.surtidos[0].is_active == "Si") {
            return {
              articulo: a.articulos[0].codigo,
              idArticulo: a.articulos[0]._id,
              linea: a.articulos[0].lineas[0].name,
              idLinea: a.articulos[0].lineas[0]._id,
              fecha: a.fecha,
              precio: a.articulosPedido[0].precio,
              cantidad: a.cantidad,
              precioTotal: a.articulosPedido[0].precio * a.cantidad,
              costo: a.articulos[0].costoMX,
              costoTotal: a.articulos[0].costoMX * a.cantidad,
              area: a.surtidos[0].areas[0].name,
              idArea: a.surtidos[0].areas[0]._id,
              movimiento: "Venta",
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });
      let ventas = Object.values(array);
      let artSurTien = await ArticulosVentasTiendas.find({
        fecha: { $gte: inicio, $lte: fin },
        is_active: "Si",
      })
      .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate({ path: "ventasTiendas", populate: { path: "areas" } });
      let array2 = artSurTien
        .map((a) => {
          // Contar TODAS las ventas de tienda activas (pagadas y a crédito),
          // para que la columna Venta cuadre con el ListadoVentasTiendas.
          if (
            a.ventasTiendas[0].is_active == "Si"
          ) {
            return {
              articulo: a.articulos[0].codigo,
              idArticulo: a.articulos[0]._id,
              linea: a.articulos[0].lineas[0].name,
              idLinea: a.articulos[0].lineas[0]._id,
              fecha: a.fecha,
              precio: a.precio,
              cantidad: a.cantidad,
              precioTotal: a.total,
              costo: a.articulos[0].costoMX,
              costoTotal: a.articulos[0].costoMX * a.cantidad,
              area: a.ventasTiendas[0].areas[0].name,
              idArea: a.ventasTiendas[0].areas[0]._id,
              movimiento: "Venta",
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });
      let ventas2 = Object.values(array2);
      // Devoluciones
      let dev = await ArticulosDevoluciones.find({
        fecha: { $gte: inicio, $lte: fin },
        cantidad: { $gt: 0 },
      })
      .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate({ path: "devoluciones", populate: { path: "areas" } });

      let arrayDev = dev
        .map((a) => {
          if (a.devoluciones[0].is_active == "Si") {
            return {
              articulo: a.articulos[0].codigo,
              idArticulo: a.articulos[0]._id,
              linea: a.articulos[0].lineas[0].name,
              idLinea: a.articulos[0].lineas[0]._id,
              fecha: a.fecha,
              precio: a.precio,
              cantidad: -a.cantidad,
              precioTotal: -a.total,
              costo: a.articulos[0].costoMX,
              costoTotal: -(a.articulos[0].costoMX * a.cantidad),
              area: a.devoluciones[0].areas[0].name,
              idArea: a.devoluciones[0].areas[0]._id,
              movimiento: "Devolucion",
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });
      let devoluciones = Object.values(arrayDev);

      // Devoluciones Tiendas
      let devTiendas = await ArticulosDevolucionesTiendas.find({
        fecha: { $gte: inicio, $lte: fin },
        cantidad: { $gt: 0 },
      })
      .populate({ path: "articulos", populate: { path: "lineas" } })
        .populate({ path: "devolucionesTiendas", populate: { path: "areas" } });

      let arrayDevTiendas = devTiendas
        .map((a) => {
          if (a.devolucionesTiendas[0].is_active == "Si") {
            return {
              articulo: a.articulos[0].codigo,
              idArticulo: a.articulos[0]._id,
              linea: a.articulos[0].lineas[0].name,
              idLinea: a.articulos[0].lineas[0]._id,
              fecha: a.fecha,
              precio: a.precio,
              cantidad: -a.cantidad,
              precioTotal: -a.total,
              costo: a.articulos[0].costoMX,
              costoTotal: -(a.articulos[0].costoMX * a.cantidad),
              area: a.devolucionesTiendas[0].areas[0].name,
              idArea: a.devolucionesTiendas[0].areas[0]._id,
              movimiento: "Devolucion",
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });
      let devolucionesTiendas = Object.values(arrayDevTiendas);

      let arraysVentas = ventas.concat(
        ventas2,
        devoluciones,
        devolucionesTiendas
      );

      let agrupado = arraysVentas.reduce(function (groups, item) {
        const val =
          item["idLinea"] 
          // +
          // item["idArea"] +
          // item["fecha"] +
          // item["movimiento"];
        groups[val] = groups[val] || {
          idLinea: item.idLinea,
          // idArea: item.idArea,
          // fecha: item.fecha,
          // movimiento: item.movimiento,
          precioTotal: 0,
          costoTotal: 0,
          cantidad: 0,
        };
        groups[val].articulo = item.articulo;
        groups[val].idArticulo = item.idArticulo;
        groups[val].linea = item.linea;
        groups[val].idLinea = item.idLinea;
        groups[val].cliente = item.cliente;
        groups[val].idCliente = item.idCliente;
        groups[val].fecha = item.fecha;
        groups[val].precio = item.precio;
        groups[val].precioTotal += item.precioTotal;
        groups[val].costoTotal += item.costoTotal;
        groups[val].cantidad += item.cantidad;
        groups[val].area = item.area;
        groups[val].idArea = item.idArea;
        groups[val].movimiento = item.movimiento;
        return groups;
      }, []);

      let dataFinal = Object.values(agrupado);
      let dataFinal2 = dataFinal
        .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
        .map((a) => {
          if (a.precioTotal > 0 && a.costoTotal > 0) {
            return {
              area: a.area,
              idArea: a.idArea,
              fecha: a.fecha,
              articulo: a.articulo,
              idArticulo: a.idArticulo,
              linea: a.linea,
              idLinea: a.idLinea,
              costoTotal: a.costoTotal,
              cantidad: a.cantidad,
              precio: a.precio,
              precioTotal: a.precioTotal,
              utilidad: a.precioTotal - a.costoTotal,
              porcentaje:
                ((a.precioTotal - a.costoTotal) / a.precioTotal) * 100,
              movimiento: a.movimiento,
            };
          } else {
            return {
              area: a.area,
              idArea: a.idArea,
              fecha: a.fecha,
              articulo: a.articulo,
              idArticulo: a.idArticulo,
              linea: a.linea,
              idLinea: a.idLinea,
              costoTotal: a.costoTotal,
              cantidad: a.cantidad,
              precio: a.precio,
              precioTotal: a.precioTotal,
              utilidad: a.precioTotal - a.costoTotal,
              porcentaje: 0,
              movimiento: a.movimiento,
            };
          }
        });

      res.status(200).json(dataFinal2);
    } catch (error) {
      res.status(400).json(error);
    }
  },
utilidadClientes: async (req, res) => {
  const { inicio, fin } = req.params;

  try {
    // =========================
    // VENTAS
    // =========================
    const sur = await ArticulosSurtidos.find({
      fecha: { $gte: inicio, $lte: fin },
    })
      .select("fecha cantidad articulosPedido articulos surtidos")
      .populate({
        path: "articulosPedido",
        select: "precio",
      })
      .populate({
        path: "articulos",
        select: "nombre costoMX",
      })
      .populate({
        path: "surtidos",
        select: "is_active idSurtido clientes empresas areas",
        populate: [
          { path: "clientes", select: "nombre_comercial" },
          { path: "empresas", select: "name" },
          { path: "areas", select: "name" },
        ],
      })
      .lean();

    const ventas = sur
      .map((a) => {
        const surtido = a?.surtidos?.[0];
        const articulo = a?.articulos?.[0];
        const articuloPedido = a?.articulosPedido?.[0];
        const cliente = surtido?.clientes?.[0];
        const empresa = surtido?.empresas?.[0];
        const area = surtido?.areas?.[0];

        if (
          !surtido ||
          surtido.is_active !== "Si" ||
          !articulo ||
          !articuloPedido ||
          !cliente ||
          !empresa ||
          !area
        ) {
          return null;
        }

        const precio = Number(articuloPedido.precio || 0);
        const cantidad = Number(a.cantidad || 0);
        const costo = Number(articulo.costoMX || 0);

        return {
          articulo: articulo.nombre || "NA",
          idArticulo: articulo._id,
          fecha: a.fecha,
          precio,
          cantidad,
          precioTotal: precio * cantidad,
          costo,
          costoTotal: costo * cantidad,
          area: area.name || "NA",
          idArea: area._id,
          idVentas: surtido._id,
          ventas: `Surtido ${surtido.idSurtido || ""}`,
          idClientes: cliente._id,
          clientes: cliente.nombre_comercial || "NA",
          movimiento: "Venta",
          empresa: empresa.name || "NA",
          idEmpresa: empresa._id,
        };
      })
      .filter(Boolean);

    // =========================
    // DEVOLUCIONES
    // =========================
    const dev = await ArticulosDevoluciones.find({
      fecha: { $gte: inicio, $lte: fin },
    })
      .select("fecha precio cantidad total articulos devoluciones")
      .populate({
        path: "articulos",
        select: "nombre costoMX",
      })
      .populate({
        path: "devoluciones",
        select: "is_active idDevolucion areas clientes surtidos",
        populate: [
          { path: "areas", select: "name" },
          { path: "clientes", select: "nombre_comercial" },
          {
            path: "surtidos",
            select: "empresas",
            populate: { path: "empresas", select: "name" },
          },
        ],
      })
      .lean();

    const devoluciones = dev
      .map((a) => {
        const devolucion = a?.devoluciones?.[0];
        const articulo = a?.articulos?.[0];
        const area = devolucion?.areas?.[0];
        const cliente = devolucion?.clientes?.[0];
        const surtido = devolucion?.surtidos?.[0];
        const empresa = surtido?.empresas?.[0];

        if (
          !devolucion ||
          devolucion.is_active !== "Si" ||
          !articulo ||
          !area ||
          !cliente ||
          !empresa
        ) {
          return null;
        }

        const precio = Number(a.precio || 0);
        const cantidad = Number(a.cantidad || 0);
        const total = Number(a.total || 0);
        const costo = Number(articulo.costoMX || 0);

        return {
          articulo: articulo.nombre || "NA",
          idArticulo: articulo._id,
          fecha: a.fecha,
          precio,
          cantidad: -cantidad,
          precioTotal: -total,
          costo,
          costoTotal: -(costo * cantidad),
          area: area.name || "NA",
          idArea: area._id,
          idVentas: devolucion._id,
          ventas: `Devolucion ${devolucion.idDevolucion || ""}`,
          idClientes: cliente._id,
          clientes: cliente.nombre_comercial || "NA",
          movimiento: "Devolucion",
          empresa: empresa.name || "NA",
          idEmpresa: empresa._id,
        };
      })
      .filter(Boolean);

    // =========================
    // UNIR Y AGRUPAR
    // =========================
    const arraysVentas = ventas.concat(devoluciones);

    const agrupadoMap = new Map();

    arraysVentas.forEach((item) => {
      const key = `${item.idClientes}_${item.idEmpresa}`;

      if (!agrupadoMap.has(key)) {
        agrupadoMap.set(key, {
          idClientes: item.idClientes,
          idEmpresa: item.idEmpresa,
          idVentas: item.idVentas,
          ventas: item.ventas,
          fecha: item.fecha,
          area: item.area,
          idArea: item.idArea,
          articulo: item.articulo,
          idArticulo: item.idArticulo,
          clientes: item.clientes,
          movimiento: item.movimiento,
          empresa: item.empresa,
          precioTotal: 0,
          costoTotal: 0,
          cantidad: 0,
        });
      }

      const actual = agrupadoMap.get(key);
      actual.precioTotal += Number(item.precioTotal || 0);
      actual.costoTotal += Number(item.costoTotal || 0);
      actual.cantidad += Number(item.cantidad || 0);

      // conservar la fecha más reciente
      if (item.fecha > actual.fecha) {
        actual.fecha = item.fecha;
        actual.idVentas = item.idVentas;
        actual.ventas = item.ventas;
        actual.area = item.area;
        actual.idArea = item.idArea;
        actual.articulo = item.articulo;
        actual.idArticulo = item.idArticulo;
        actual.movimiento = item.movimiento;
      }
    });

    const dataFinal2 = Array.from(agrupadoMap.values())
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
      .map((a) => {
        const utilidad = Number(a.precioTotal || 0) - Number(a.costoTotal || 0);
        const porcentaje =
          Number(a.precioTotal || 0) !== 0
            ? (utilidad / Number(a.precioTotal)) * 100
            : 0;

        return {
          clientes: a.clientes,
          idClientes: a.idClientes,
          ventas: a.ventas,
          idVentas: a.idVentas,
          area: a.area,
          idArea: a.idArea,
          fecha: a.fecha,
          articulo: a.articulo,
          idArticulo: a.idArticulo,
          costoTotal: a.costoTotal,
          cantidad: a.cantidad,
          precioTotal: a.precioTotal,
          utilidad,
          porcentaje,
          movimiento: a.movimiento,
          empresa: a.empresa,
          idEmpresa: a.idEmpresa,
        };
      });

    res.status(200).json(dataFinal2);
  } catch (error) {
    console.log("Error en utilidadClientes:", error);
    res.status(400).json({
      message: "Error al obtener utilidadClientes",
      error: error.message,
    });
  }
},
  // Utilidad de las ventas de tiendas, un renglon por articulo vendido.
  // (Los reportes de utilidad generales filtran los renglones de tienda por
  // `entregado: "Si"`, campo que solo existe en la cabecera, asi que nunca entra
  // ninguna venta de tienda.) El front agrupa por venta, modelo, linea o cliente.
  // Costo = costoMX actual del articulo, igual que los otros reportes de utilidad.
  utilidadTiendas: async (req, res) => {
    const { inicio, fin } = req.params;
    // Solo lo ven ISAAC SHUEKE, RAFA SHUEKE y Admin Lynqro
    const USUARIOS_UTILIDAD_TIENDAS = [
      "661db8938f3cb5005988712b", // ISAAC SHUEKE
      "662b063a0f8e873fc0fa6096", // RAFA SHUEKE
      "613a9434225bce3df050c220", // Admin Lynqro
    ];
    if (!USUARIOS_UTILIDAD_TIENDAS.includes(String(req.decoded && req.decoded.id))) {
      return res.status(403).json({ message: "No tienes permiso para ver la utilidad de tiendas" });
    }
    const primero = (campo) => ({
      $cond: [{ $isArray: campo }, { $arrayElemAt: [campo, 0] }, campo],
    });
    const renglones = (Modelo, coleccion, campoCabecera, movimiento, nota, signo) =>
      Modelo.aggregate([
        { $match: { fecha: { $gte: inicio, $lte: fin }, is_active: "Si" } },
        {
          $lookup: {
            from: coleccion,
            localField: "_id",
            foreignField: campoCabecera,
            as: "r",
          },
        },
        { $unwind: "$r" },
        { $match: { "r.is_active": { $ne: "No" } } },
        { $lookup: { from: "articulos", localField: "r.articulos", foreignField: "_id", as: "art" } },
        { $unwind: { path: "$art", preserveNullAndEmptyArrays: true } },
        { $lookup: { from: "lineas", localField: "art.lineas", foreignField: "_id", as: "lin" } },
        { $lookup: { from: "clientes", localField: "clientes", foreignField: "_id", as: "cli" } },
        { $lookup: { from: "areas", localField: "areas", foreignField: "_id", as: "ar" } },
        { $lookup: { from: "colaboradores", localField: "colaboradores", foreignField: "_id", as: "col" } },
        {
          $project: {
            _id: 0,
            movimiento,
            idVenta: "$_id",
            nota,
            fecha: 1,
            area: { $ifNull: [primero("$ar.name"), ""] },
            idArea: { $ifNull: [primero("$ar._id"), ""] },
            cliente: { $ifNull: [primero("$cli.nombre_comercial"), ""] },
            vendedor: {
              $trim: {
                input: {
                  $concat: [
                    { $ifNull: [primero("$col.nombre"), ""] },
                    " ",
                    { $ifNull: [primero("$col.apellido"), ""] },
                  ],
                },
              },
            },
            codigo: { $ifNull: ["$art.codigo", ""] },
            articulo: { $ifNull: ["$art.nombre", ""] },
            linea: { $ifNull: [primero("$lin.name"), ""] },
            cantidad: { $multiply: [signo, { $ifNull: ["$r.cantidad", 0] }] },
            precioTotal: {
              $multiply: [
                signo,
                { $ifNull: ["$r.cantidad", 0] },
                { $ifNull: ["$r.precio", 0] },
                { $subtract: [1, { $divide: [{ $ifNull: ["$descuento", 0] }, 100] }] },
              ],
            },
            costoTotal: {
              $multiply: [signo, { $ifNull: ["$r.cantidad", 0] }, { $ifNull: ["$art.costoMX", 0] }],
            },
          },
        },
      ]);

    try {
      const [ventas, devoluciones] = await Promise.all([
        renglones(
          VentasTiendas,
          "articulosventastiendas",
          "ventasTiendas",
          "Venta",
          {
            $concat: [
              { $ifNull: ["$prefijo", ""] },
              { $toString: { $ifNull: ["$consecutivo", "$idVentaTienda"] } },
            ],
          },
          1
        ),
        renglones(
          DevolucionesTiendas,
          "articulosdevolucionestiendas",
          "devolucionesTiendas",
          "Devolucion",
          { $concat: ["DEV ", { $toString: { $ifNull: ["$idDevolucionTienda", ""] } }] },
          -1
        ),
      ]);

      res.status(200).json(ventas.concat(devoluciones));
    } catch (error) {
      console.log("Error en utilidadTiendas:", error);
      res.status(400).json({
        message: "Error al obtener la utilidad de tiendas",
        error: error.message,
      });
    }
  },
};
