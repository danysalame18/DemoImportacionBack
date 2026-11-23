const {
  Abonos,
  AbonosTraspasos,
  TraspasosSalida,
  Anticipos,
  NotasCargo,
  Surtidos,
  AbonosTiendas,
  VentasTiendas,
  AbonosProveedores,
  NotasCxP,
  ComprasHab,
  Clientes,
  ProcesosEntrada,
  SaldoInicial,
  NotasCredito,
  DevolucionesFiscal,
  Facturas,
  CompPago,
  ArticulosSurtidos
} = require("../models");

// Observaciones de la nota en el estado de cuenta; si trae guia real se agrega
const obsNota = (a) => {
  const valido = (v) => v && !["NA", "SIN GUIA"].includes(String(v).trim().toUpperCase());
  const texto = [a.observaciones, a.noGuia]
    .filter(valido)
    .map((v) => String(v).trim().replace(/\s*\n\s*/g, " "))
    .join(" / ");
  return texto || "NA";
};

module.exports = {
  findOneCliente: async (req, res) => {
    const { cliente } = req.params;
    try {
      let abonos = await Abonos.find({ clientes: cliente, importe: {$gt : 0} })
        .populate({
          path: "surtidos",
          populate: { path: "pedidos"},
        })
        .populate({ path: "notasCargo"})
        .populate("bancos")
        
      let arrayAbonos = abonos
        .map((a) => {
          if (a.surtidos != "") {
            return {
              fecha: a.fecha,
              abono: a.importe,
              movimiento: a.concepto,
              cargo: 0,
              numero: a.idAbono,
              saldo: 0,
              observaciones: a.observaciones,
              banco: a.bancos[0].banco
            };
          } else if (a.notasCargo != "") {
            return {
              fecha: a.fecha,
              abono: a.importe,
              movimiento: a.concepto,
              cargo: 0,
              numero: a.idAbono,
              saldo: 0,
              observaciones: a.observaciones,
              banco: a.bancos[0].banco
            };
          } else if (a.saldoInicial != "") {
            return {
              fecha: a.fecha,
              abono: a.importe,
              movimiento: a.concepto,
              cargo: 0,
              numero: a.idAbono,
              saldo: 0,
              observaciones: a.observaciones,
              banco: a.bancos[0].banco
            };
          }
        })
        .filter(function (el) {
          return el != null;
        });

      let anticipos = await Anticipos.find({
        clientes: cliente,
        // saldo: { $gt: 0 },
        importe: {$gt : 0}
      });
      let arrayAnticipos = anticipos
        .map((a) => {
          return {
            fecha: a.fecha,
            abono: a.saldo,
            movimiento: "Anticipo",
            cargo: 0,
            numero: a.idAnticipo,
            saldo: 0,
            observaciones: "NA",
            banco: a.bancos[0].banco
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let notasCargo = await NotasCargo.find({ clientes: cliente, importe: {$gt : 0}  })
      let arrayNotasCargo = notasCargo
        .map((a) => {
          return {
            fecha: a.fecha,
            abono: 0,
            movimiento: "Nota Cargo",
            cargo: a.importe,
            numero: a.idNotaCargo,
            saldo: a.saldo,
            observaciones: a.observaciones,
            banco: "NA"
          };
        })
        .filter(function (el) {
          return el != null;
        });

        let si = await SaldoInicial.find({ clientes: cliente, importe: {$gt : 0}  })
        let arraySi = si
          .map((a) => {
            return {
              fecha: a.fecha,
              abono: 0,
              movimiento: "Saldo Inicial",
              cargo: a.importe,
              numero: a.idSaldoInicial,
              saldo: a.saldo,
              observaciones: a.observaciones,
              banco: "NA"
            };
          })
          .filter(function (el) {
            return el != null;
          });

      let surtidos = await Surtidos.find({ clientes: cliente,  is_active:"Si"
        // , $or: [{ impuestos: 0 }, { impuestos: 16, facturado: { $in: ["NA", null] } }], 
      })
      .populate({
        path: "pedidos",
      });
      let arraySurtidos = surtidos
        .map((a) => {
          return {
            fecha: a.fecha,
            abono: 0,
            movimiento: "Nota",
            cargo: a.total_general,
            numero: a.idSurtido,
            idSurtidoMongo: a._id, // para abrir el detalle del surtido desde el estado de cuenta
            saldo: a.saldo,
            observaciones: obsNota(a),
            banco: "NA"
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let concat = arrayAbonos
        .concat(arrayAnticipos, arrayNotasCargo, arraySurtidos, arraySi)
        .sort((a, b) => (a.fecha > b.fecha ? 1 : -1));

      let dataFinal = Object.values(concat);

      res.status(200).json(dataFinal);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  findOneClienteAgrupado: async (req, res) => {
    const { cliente } = req.params;
    try {
     const abonos = await Abonos.find({ clientes: cliente, importe: { $gt: 0 } })
  .populate({ path: "surtidos", populate: { path: "pedidos" } })
  .populate({ path: "notasCargo" })
  .populate("bancos");

const arrayAbonos = abonos
  .map((a) => {
    const banco = a.bancos?.[0]?.banco ?? "NA";
    const base = {
      fecha: a.fecha,
      cargo: 0,
      numero: a.idAbono,
      saldo: 0,
      codigoAgrupado: a.codigoAgrupado,
      observaciones: a.observaciones ?? "",
      banco,
    };

    if (a.concepto === "Bonificacion") {
      return {
        ...base,
        movimiento: "Bonificacion",
        abono: 0,
        bonificacion: a.importe ?? 0,
        devolucion: 0,
      };
    } else if (a.concepto === "Devolucion") {
      return {
        ...base,
        movimiento: "Devolucion",
        abono: 0,
        bonificacion: 0,
        devolucion: a.importe ?? 0,
      };
    }
    return {
      ...base,
      movimiento: "Abono",
      abono: a.importe ?? 0,
      bonificacion: 0,
      devolucion: 0,
    };
  })
  .filter(Boolean);

// Normaliza fecha a día calendario para la clave
const fmtDia = (f) => {
  const d = new Date(f);
  // YYYY-MM-DD sin zona ambigua
  return isNaN(d) ? String(f) : d.toISOString().slice(0, 10);
};

const abonosAgrupadoObj = arrayAbonos.reduce((groups, item) => {
  const key = `${item.codigoAgrupado || ""}|${fmtDia(item.fecha)}|${item.movimiento}`;

  if (!groups[key]) {
    groups[key] = {
      codigoAgrupado: item.codigoAgrupado,
      movimiento: item.movimiento,
      fecha: item.fecha,
      abono: 0,
      bonificacion: 0,
      devolucion: 0,
      cargo: 0,
      numero: item.numero,
      saldo: 0,
      observaciones: item.observaciones,
      banco: item.banco,
    };
  }

  groups[key].abono = (groups[key].abono || 0) + (item.abono || 0);
  groups[key].bonificacion = (groups[key].bonificacion || 0) + (item.bonificacion || 0);
  groups[key].devolucion = (groups[key].devolucion || 0) + (item.devolucion || 0);

  // Si quieres conservar la última fecha/observaciones, opcional:
  groups[key].fecha = item.fecha ?? groups[key].fecha;
  groups[key].observaciones = item.observaciones ?? groups[key].observaciones;

  return groups;
}, {});

const abonosAgrupado2 = Object.values(abonosAgrupadoObj);
      let anticipos = await Anticipos.find({
        clientes: cliente,
        // saldo: { $gt: 0 },
        importe: {$gt : 0}
      });
      let arrayAnticipos = anticipos
        .map((a) => {
          return {
            fecha: a.fecha,
            abono: a.saldo,
            bonificacion: 0,
            devolucion: 0,
            movimiento: "Anticipo",
            cargo: 0,
            numero: a.idAnticipo,
            saldo: 0,
            observaciones: "NA",
            banco: a.bancos[0].banco
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let notasCargo = await NotasCargo.find({ clientes: cliente, importe: {$gt : 0}  })
      let arrayNotasCargo = notasCargo
        .map((a) => {
          return {
            fecha: a.fecha,
            abono: 0,
            bonificacion: 0,
            devolucion: 0,
            movimiento: "Nota Cargo",
            cargo: a.importe,
            numero: a.idNotaCargo,
            saldo: a.saldo,
            observaciones: a.observaciones,
            banco: "NA"
          };
        })
        .filter(function (el) {
          return el != null;
        });

        let Si = await SaldoInicial.find({ clientes: cliente, importe: {$gt : 0}  })
        let arraySi = Si
          .map((a) => {
            return {
              fecha: a.fecha,
              abono: 0,
              bonificacion: 0,
              devolucion: 0,
              movimiento: "Saldo  Inicial",
              cargo: a.importe,
              numero: a.idSaldoInicial,
              saldo: a.saldo,
              observaciones: "NA",
              banco: "NA"
            };
          })
          .filter(function (el) {
            return el != null;
          });

      let surtidos = await Surtidos.find({
        clientes: cliente,
        is_active: "Si",
        // $or: [{ impuestos: 0 }, { impuestos: 16, facturado: { $in: ["NA", null] } }],
      })
      .populate({
        path: "pedidos",
      });
      let arraySurtidos = surtidos
        .map((a) => {
          return {
            fecha: a.fecha,
            abono: 0,
            bonificacion: 0,
            devolucion: 0,
            movimiento: "Nota",
            cargo: a.total_general,
            numero: a.idSurtido,
            idSurtidoMongo: a._id, // para abrir el detalle del surtido desde el estado de cuenta
            saldo: a.saldo,
            observaciones: obsNota(a),
            banco: "NA"
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let concat = abonosAgrupado2
        .concat(arrayAnticipos, arrayNotasCargo, arraySurtidos, arraySi)
        .sort((a, b) => (a.fecha > b.fecha ? 1 : -1));

      let dataFinal = Object.values(concat);

      res.status(200).json(dataFinal);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  findOneClienteGlobal: async (req, res) => {
    const { cliente } = req.params;
    try {
      let abonos = await Abonos.find({ clientes: cliente, importe: {$gt : 0} })
        .populate({
          path: "surtidos",
          populate: { path: "pedidos"},
        })
        .populate({ path: "notasCargo"})
        .populate("bancos")

      let arrayAbonos = abonos
      .map((a) => {
        let movimiento = a.concepto;
        if (a.concepto === "Bonificacion") {
          movimiento += ` - ${a.observaciones}`;
        }
            return {
              fecha: a.fecha,
              abono: a.importe,
              movimiento: movimiento,
              cargo: 0,
              numero: a.idAbono,
              saldo: 0,
              codigoAgrupado: a.codigoAgrupado,
              observaciones: a.observaciones,
              banco: a.bancos[0].banco
            };
        })
        .filter(function (el) {
          return el != null;
        });

      let abonosAgrupado = arrayAbonos.reduce(function (groups, item) {
        const val = item["codigoAgrupado"] + item["fecha"];
        groups[val] = groups[val] || {
          codigoAgrupado: item.codigoAgrupado,
          fecha: item.fecha,
          abono: 0,
        };
        groups[val].abono += item.abono;
        groups[val].fecha = item.fecha;
        groups[val].movimiento = item.movimiento;
        groups[val].cargo = item.cargo;
        groups[val].numero = item.numero;
        groups[val].saldo = item.saldo;
        groups[val].codigoAgrupado = item.codigoAgrupado;
        groups[val].observaciones = item.observaciones;
        groups[val].banco = item.banco;
        return groups;
      }, []);

      let abonosAgrupado2 = Object.values(abonosAgrupado);

      let anticipos = await Anticipos.find({
        clientes: cliente,
        // saldo: { $gt: 0 },
        importe: {$gt : 0}
      });
      let arrayAnticipos = anticipos
        .map((a) => {
          return {
            fecha: a.fecha,
            abono: a.saldo,
            movimiento: "Anticipo",
            cargo: 0,
            numero: a.idAnticipo,
            saldo: 0,
            observaciones: "NA",
            banco: a.bancos[0].banco
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let notasCargo = await NotasCargo.find({ clientes: cliente, importe: {$gt : 0}  })
      let arrayNotasCargo = notasCargo
        .map((a) => {
          return {
            fecha: a.fecha,
            abono: 0,
            movimiento: "Nota Cargo",
            cargo: a.importe,
            numero: a.idNotaCargo,
            saldo: a.saldo,
            observaciones: a.observaciones,
            banco: "NA"
          };
        })
        .filter(function (el) {
          return el != null;
        });

        let Si = await SaldoInicial.find({ clientes: cliente, importe: {$gt : 0}  })
        let arraySi = Si
          .map((a) => {
            return {
              fecha: a.fecha,
              abono: 0,
              movimiento: "Saldo  Inicial",
              cargo: a.importe,
              numero: a.idSaldoInicial,
              saldo: a.saldo,
              observaciones: "NA",
              banco: "NA"
            };
          })
          .filter(function (el) {
            return el != null;
          });

      let surtidos = await Surtidos.find({
        clientes: cliente,
        is_active: "Si",
        // $or: [{ impuestos: 0 }, { impuestos: 16, facturado: { $in: ["NA", null] } }],
      })
      .populate({
        path: "pedidos",
      });
      let arraySurtidos = surtidos
        .map((a) => {
          return {
            fecha: a.fecha,
            abono: 0,
            movimiento: "Nota",
            cargo: a.total_general,
            numero: a.idSurtido,
            idSurtidoMongo: a._id, // para abrir el detalle del surtido desde el estado de cuenta
            saldo: a.saldo,
            observaciones: obsNota(a),
            banco: "NA"
          };
        })
        .filter(function (el) {
          return el != null;
        });

        let fact = await Facturas.find({ clientes: cliente, total: {$gt : 0},  is_active:"Si", timbre:"Si" })

      let arrayFact = fact
        .map((a) => {
          return {
            fecha: a.fecha,
            abono: 0,
            movimiento: "Factura",
            cargo: a.total,
            numero: a.serie + " " + a.folio,
            saldo: a.saldo,
            observaciones: "NA",
            banco: "NA",
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let comp = await CompPago.find({ clientes: cliente, total: {$gt : 0},  is_active:"Si", timbre:"Si" })

      let arrayComp = comp
        .map((a) => {
            return {
              fecha: a.fecha,
              abono: a.total,
              movimiento: "Comp. Pago",
              cargo: 0,
              numero: a.serie + " " + a.folio,
              saldo: 0,
              observaciones: "NA",
              banco: "NA",
            };
        })
        .filter(function (el) {
          return el != null;
        });

      let ncFis = await NotasCredito.find({ clientes: cliente, total: {$gt : 0},  is_active:"Si", timbre:"Si"  })

      let arrayNCFis = ncFis
        .map((a) => {
          return {
            fecha: a.fecha,
            abono: a.total,
            movimiento: "Nota Credito",
            cargo: 0,
            numero: a.serie + " " + a.folio,
            saldo: 0,
            observaciones: "NA",
            banco: "NA",
          };
        })
        .filter(function (el) {
          return el != null;
        });


        let devFis = await DevolucionesFiscal.find({ clientes: cliente, total: {$gt : 0},  is_active:"Si", timbre:"Si" })

        let arrayDevFic = devFis
          .map((a) => {
            return {
              fecha: a.fecha,
              abono: a.total,
              movimiento: "Devolucion",
              cargo: 0,
              numero: a.serie + " " + a.folio,
              saldo: 0,
              observaciones: "NA",
              banco: "NA",
            };
          })
          .filter(function (el) {
            return el != null;
          });

      let concat = arraySurtidos
        .concat(arrayAnticipos, arrayNotasCargo, abonosAgrupado2, arraySi, arrayFact, arrayComp, arrayNCFis, arrayDevFic)
        .sort((a, b) => (a.fecha > b.fecha ? 1 : -1));

      let dataFinal = Object.values(concat);

      res.status(200).json(dataFinal);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  findOneTiendaAgrupado: async (req, res) => {
    const { area } = req.params;
    try {
      let abonos = await AbonosTraspasos.find({ areas: area, importe: {$gt : 0} })

      let arrayAbonos = abonos
        .map((a) => {
            return {
              fecha: a.fecha,
              abono: a.importe,
              movimiento: a.concepto,
              cargo: 0,
              numero: a.idAbonoTraspaso,
              saldo: 0,
              codigoAgrupado: a.codigoAgrupado,
            };
        })
        .filter(function (el) {
          return el != null;
        });

      let abonosAgrupado = arrayAbonos.reduce(function (groups, item) {
        const val = item["codigoAgrupado"] + item["fecha"];
        groups[val] = groups[val] || {
          codigoAgrupado: item.codigoAgrupado,
          fecha: item.fecha,
          abono: 0,
        };
        groups[val].abono += item.abono;
        groups[val].fecha = item.fecha;
        groups[val].movimiento = item.movimiento;
        groups[val].cargo = item.cargo;
        groups[val].numero = item.numero;
        groups[val].saldo = item.saldo;
        groups[val].codigoAgrupado = item.codigoAgrupado;
        return groups;
      }, []);

      let abonosAgrupado2 = Object.values(abonosAgrupado);

     
      let surtidos = await TraspasosSalida.find({ areaDestino: area })
      let arraySurtidos = surtidos
        .map((a) => {
          return {
            fecha: a.fecha,
            abono: 0,
            movimiento: "Nota",
            cargo: a.total_general,
            numero: a.idTraspasoSalida,
            saldo: a.saldo,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let concat = abonosAgrupado2
        .concat(arraySurtidos)
        .sort((a, b) => (a.fecha > b.fecha ? 1 : -1));

      let dataFinal = Object.values(concat);

      res.status(200).json(dataFinal);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  findOneClienteTienda: async (req, res) => {
    const { cliente } = req.params;
    try {
      let abonos = await AbonosTiendas.find({ clientes: cliente, is_active:"Si" });

      let arrayAbonos = abonos
        .map((a) => {
          return {
            fecha: a.fecha,
            abono: a.total,
            movimiento: "Abono",
            cargo: 0,
            numero: a.idAbonoTiendas,
            saldo: 0,
          };
        })
        .filter(function (el) {
          return el != null;
        });

        let notasCargo = await NotasCargo.find({ clientes: cliente })
        let arrayNotasCargo = notasCargo
          .map((a) => {
            return {
              fecha: a.fecha,
              abono: 0,
              movimiento: "Nota Cargo",
              cargo: a.importe,
              numero: a.idNotaCargo,
              saldo: a.saldo,
            };
          })
          .filter(function (el) {
            return el != null;
          });


      let ventas = await VentasTiendas.find({ clientes: cliente, is_active:"Si"});
      let arrayVentas = ventas
        .map((a) => {
          return {
            fecha: a.fecha,
            abono: 0,
            movimiento: "Nota",
            cargo: a.total_general,
            numero: a.prefijo + a.consecutivo,
            saldo: a.saldo,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let concat = arrayAbonos
        .concat(arrayVentas, arrayNotasCargo)
        .sort((a, b) => (a.fecha > b.fecha ? 1 : -1));

      let dataFinal = Object.values(concat);

      res.status(200).json(dataFinal);
    } catch (error) {
      res.status(400).json(error);
    }
  },



  findOneProveedor: async (req, res) => {
    const { proveedor } = req.params;
    try {
      let abonosProveedores = await AbonosProveedores.find({ proveedores: proveedor, importe: {$gt : 0} })
      .populate("bancos")
      let arrayAbonosProveedores = abonosProveedores
        .map((a) => {
            return {
              fecha: a.fecha,
              abono: a.importe,
              movimiento: a.concepto,
              banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
              tipoCambio: a.tipoCambio,
              cargo: 0,
              numero: a.idAbonoProveedor,
              saldo: 0,
          }
        })
        .filter(function (el) {
          return el != null;
        });

    
       let notasCxP = await NotasCxP.find({ proveedores: proveedor, total_costo: {$gt : 0} })
       .populate('embarques')

      let arrayNotasCxP = notasCxP
        .map((a) => {
          return {
            fecha: a.fecha,
            abono: 0,
            banco: "NA",
            tipoCambio: 1,
            // movimiento: "Nota" + "/ Embarque " ,
            movimiento: a.embarques.length > 0 ? "Nota" + "/ Embarque " + a.embarques[0].idEmbarques : "Nota " + a.idNotasCxP,
            cargo: a.total_costo,
            numero: a.idNotasCxP,
            saldo: a.saldo,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let concat = arrayAbonosProveedores
        .concat(arrayNotasCxP)
        .sort((a, b) => (a.fecha > b.fecha ? 1 : -1));

      let dataFinal = Object.values(concat);

      res.status(200).json(dataFinal);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  findOneProveedorHab: async (req, res) => {
    const { proveedor } = req.params;
    try {
      let abonosProveedores = await AbonosProveedores.find({ proveedores: proveedor, importe: {$gt : 0} })

      let arrayAbonosProveedores = abonosProveedores
        .map((a) => {
            return {
              fecha: a.fecha,
              abono: a.importe,
              movimiento: "Abono",
              cargo: 0,
              numero: a.idAbonoProveedor,
              banco: a.bancos[0].banco + " " + a.bancos[0].cuenta,
              tipoCambio: a.tipoCambio,
              saldo: 0,
          }
        })
        .filter(function (el) {
          return el != null;
        });

    
       let notasCxP = await ComprasHab.find({ proveedores: proveedor, total_costo: {$gt : 0} })

      let arrayNotasCxP = notasCxP
        .map((a) => {
          return {
            fecha: a.fecha,
            abono: 0,
            movimiento: "Compra",
            banco: "NA",
            tipoCambio: 1,
            cargo: a.total_costo,
            numero: a.idComprasHab,
            saldo: a.saldo,
          };
        })
        .filter(function (el) {
          return el != null;
        });

        let entradas = await ProcesosEntrada.find({ proveedores: proveedor, totalGeneral: {$gt : 0} })

        let arrayentradas = entradas
          .map((a) => {
            return {
              fecha: a.fecha,
              abono: 0,
              movimiento: "Procesos Maquila",
              banco: "NA",
              tipoCambio: 1,
              cargo: a.totalGeneral,
              numero: a.idProcesoEntrada,
              saldo: a.totalGeneral,
            };
          })
          .filter(function (el) {
            return el != null;
          });

      let concat = arrayAbonosProveedores
        .concat(arrayNotasCxP, arrayentradas)
        .sort((a, b) => (a.fecha > b.fecha ? 1 : -1));

      let dataFinal = Object.values(concat);

      res.status(200).json(dataFinal);
    } catch (error) {
      res.status(400).json(error);
    }
  },


  findOneClienteKasher: async (req, res) => {
    const { cliente } = req.params;
    try {


      let surtidos = await Facturas.find({ clientes: cliente, total: {$gt : 0},  is_active:"Si", timbre:"Si" })
      .populate("empresas");

      let arraySurtidos = surtidos
        .map((a) => {
          return {
            createdAt: a.createdAt,
            fecha: a.fecha,
            abono: 0,
            movimiento: "Factura",
            cargo: a.total,
            numero: a.serie + " " + a.folio,
            saldo: a.saldo,
            empresa: a.empresas[0].name
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let abonos = await CompPago.find({ clientes: cliente, total: {$gt : 0},  is_active:"Si", timbre:"Si" })
      .populate("empresas")

      let arrayAbonos = abonos
        .map((a) => {
            return {
              createdAt: a.createdAt,
              fecha: a.fecha,
              abono: a.total,
              movimiento: "Comp. Pago",
              cargo: 0,
              numero: a.serie + " " + a.folio,
              saldo: 0,
              empresa: a.empresas[0].name
            };
        })
        .filter(function (el) {
          return el != null;
        });

      let notasCredito = await NotasCredito.find({ clientes: cliente, total: {$gt : 0},  is_active:"Si", timbre:"Si"  })
        .populate("empresas")
      let arrayNotasCredito = notasCredito
        .map((a) => {
          return {
            createdAt: a.createdAt,
            fecha: a.fecha,
            abono: a.total,
            movimiento: "Nota Credito",
            cargo: 0,
            numero: a.serie + " " + a.folio,
            saldo: 0,
            empresa: a.empresas[0].name
          };
        })
        .filter(function (el) {
          return el != null;
        });



        let devoluciones = await DevolucionesFiscal.find({ clientes: cliente, total: {$gt : 0},  is_active:"Si", timbre:"Si" })
        .populate("empresas");
        let arrayDevoluciones = devoluciones
          .map((a) => {
            return {
              createdAt: a.createdAt,
              fecha: a.fecha,
              abono: a.total,
              movimiento: "Devolucion",
              cargo: 0,
              numero: a.serie + " " + a.folio,
              saldo: 0,
              empresa: a.empresas[0].name
            };
          })
          .filter(function (el) {
            return el != null;
          });

      let concat = arraySurtidos
        .concat(arrayNotasCredito,arrayAbonos, arrayDevoluciones)
        .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

      let dataFinal = Object.values(concat);

      res.status(200).json(dataFinal);
    } catch (error) {
      res.status(400).json(error);
    }
  },

  findOneClienteRelacionadoKasher: async (req, res) => {
    const { cliente } = req.params;
    try {

      let surtidos = await Facturas.find({ clientes: cliente, total: {$gt : 0},  is_active:"Si", timbre:"Si" })
      .populate("empresas")

      let arraySurtidos = surtidos
        .map((a) => {
          return {
            createdAt: a.createdAt,
            id: a._id,
            fecha: a.fecha,
            abono: a.abonos,
            movimiento: "Factura",
            cargo: a.total,
            numero: a.serie + " " + a.folio,
            saldo: a.saldo,
            subTotal: a.subTotal,
            iva: a.iva,
            empresa: a.empresas[0].name,
            idEmpresa: a.empresas[0]._id,
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let dataFinal = Object.values(arraySurtidos);

      res.status(200).json(dataFinal);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  analisisClientesTiendas: async (req, res) => {

    try {

       // Clientes
       let clientes = await Clientes.find()
 
       let arrayClientes = clientes
         .map((a) => {
           return {
             abono: 0,
             cargo: 0,
             saldo: 0,
             abonoCliente: a.abonos,
             cargoCliente: a.cargos,
             saldoCliente: a.saldo,
             idCliente: a._id,
             cliente: a.nombre_comercial
           };
         })
         .filter(function (el) {
           return el != null;
         });

              // Anticipos
       let anticipos = await Anticipos.find({is_active:"Si"})
 
       let arrayAnticipos = anticipos
         .map((a) => {
           return {
            abono: a.saldo,
            cargo: 0,
            saldo: -a.saldo,
            abonoCliente: 0,
            cargoCliente: 0,
            saldoCliente: 0,
            idCliente: a.clientes[0]._id,
            cliente: a.clientes[0].nombre_comercial
           };
         })
         .filter(function (el) {
           return el != null;
         });


      // Abonos Oficina
      let abonosOf = await Abonos.find({ is_active:"Si" })
      .populate("clientes")

      let arrayAbonosOf = abonosOf
        .map((a) => {
          return {
            abono: a.importe,
            cargo: 0,
            saldo: -a.importe,
            abonoCliente: 0,
            cargoCliente: 0,
            saldoCliente: 0,
            idCliente: a.clientes[0]._id,
            cliente: a.clientes[0].nombre_comercial
          };
        })
        .filter(function (el) {
          return el != null;
        });

      // Abonos Tiendas
      let abonos = await AbonosTiendas.find({ is_active:"Si" })
      .populate("clientes")

      let arrayAbonos = abonos
        .map((a) => {
          return {
            abono: a.total,
            cargo: 0,
            saldo: -a.total,
            abonoCliente: 0,
            cargoCliente: 0,
            saldoCliente: 0,
            idCliente: a.clientes[0]._id,
            cliente: a.clientes[0].nombre_comercial
          };
        })
        .filter(function (el) {
          return el != null;
        });

        // Notas Cargo
        let notasCargo = await NotasCargo.find()
        .populate("clientes")

        let arrayNotasCargo = notasCargo
          .map((a) => {
            return {
              abono: 0,
              cargo: a.importe,
              saldo: a.importe,
              abonoCliente: 0,
              cargoCliente: 0,
              saldoCliente: 0,
            idCliente: a.clientes[0]._id,
            cliente: a.clientes[0].nombre_comercial
            };
          })
          .filter(function (el) {
            return el != null;
          });

      // Ventas Tiendas
      let ventas = await VentasTiendas.find({ is_active:"Si"})
      .populate("clientes")

      let arrayVentas = ventas
        .map((a) => {
          return {
            abono: 0,
            cargo: a.total_general,
            saldo: a.total_general,
            abonoCliente: 0,
            cargoCliente: 0,
            saldoCliente: 0,
            idCliente: a.clientes[0]._id,
            cliente: a.clientes[0].nombre_comercial
          };
        })
        .filter(function (el) {
          return el != null;
        });

              // Surtidos
      let ventasOf = await Surtidos.find({ is_active:"Si"
        // , iva:0
      })
      .populate("clientes")

      let arrayVentasOf = ventasOf
        .map((a) => {
          return {
            abono: 0,
            cargo: a.total_general,
            saldo: a.total_general,
            abonoCliente: 0,
            cargoCliente: 0,
            saldoCliente: 0,
            idCliente: a.clientes[0]._id,
            cliente: a.clientes[0].nombre_comercial
          };
        })
        .filter(function (el) {
          return el != null;
        });

      let concat = arrayAbonos
        .concat(arrayVentas, arrayNotasCargo, arrayAbonosOf, arrayVentasOf, arrayClientes, arrayAnticipos )
        .sort((a, b) => (a.fecha > b.fecha ? 1 : -1));

      let dataFinal = Object.values(concat);

      let agrupado = dataFinal.reduce(function (groups, item) {
        const val = item["idCliente"] ;
        groups[val] = groups[val] || {
          idCliente: item.idCliente,
          abono: 0,
          cargo: 0,
          saldo: 0,
          abonoCliente: 0,
          cargoCliente: 0,
          saldoCliente: 0,
        };
        groups[val].abono += item.abono;
        groups[val].cargo += item.cargo;
        groups[val].saldo += item.saldo;
        groups[val].abonoCliente += item.abonoCliente;
        groups[val].cargoCliente += item.cargoCliente;
        groups[val].saldoCliente += item.saldoCliente;
        groups[val].idCliente = item.idCliente;
        groups[val].cliente = item.cliente;
        return groups;
      }, []);
      let agrupado2 = Object.values(agrupado);

      // Actualiza los valores en Clientes con lo nuevo calculado, ignorando lo que ya tenía
for (const c of agrupado2) {
  await Clientes.findByIdAndUpdate(
    c.idCliente,
    {
      $set: {
        abonos: c.abono,
        cargos: c.cargo,
        saldo: c.saldo,
      },
    },
    { new: true }
  );
}

      res.status(200).json(agrupado2);
    } catch (error) {
      res.status(400).json(error);
    }
  },


  analisisNotas: async (req, res) => {

    try {
       // Surtidos
       let surt = await Surtidos.find({is_active:"Si", iva:0})
       let arraySurtidos = surt
         .map((a) => {
           return {
            idSurtido: a._id,
            surtido: a.idSurtido,
             total: a.total_general,
             abonos: 0,
             saldo: 0,
             saldoSistema: a.saldo
           };
         })
         .filter(function (el) {
           return el != null;
         });

              // Abonos
       let abn = await Abonos.find({is_active:"Si", surtidos:{$ne:[]}})
       .populate("surtidos")
 
       let arrayAbonos = abn
         .map((a) => {
           return {
            idSurtido: a.surtidos[0]._id,
            surtido: a.surtidos[0].idSurtido,
              total: 0,
             abonos: a.importe,
             saldo: 0,
             saldoSistema: 0
           };
         })
         .filter(function (el) {
           return el != null;
         });
     

      let concat = arraySurtidos
        .concat(arrayAbonos)

      let dataFinal = Object.values(concat);

      let agrupado = dataFinal.reduce(function (groups, item) {
        const val = item["idSurtido"] ;
        groups[val] = groups[val] || {
          idSurtido: item.idSurtido,
          abonos: 0,
          total: 0,
          saldo: 0,
          saldoSistema: 0
        };
        groups[val].abonos += item.abonos;
        groups[val].total += item.total;
        groups[val].saldo += item.saldo;
        groups[val].saldoSistema += item.saldoSistema;
        groups[val].idSurtido = item.idSurtido;
        groups[val].surtido = item.surtido;
        return groups;
      }, []);
      let agrupado2 = Object.values(agrupado);

      res.status(200).json(agrupado2);
    } catch (error) {
      res.status(400).json(error);
    }
  },
analisisSurtidos: async (req, res) => {
  try {
    const surtidos = await Surtidos.find({ is_active: "Si" });

    const surtidosMap = {};
    surtidos.forEach((s) => {
      surtidosMap[s._id.toString()] = {
        idSurtido: s._id,
        surtido: s.idSurtido,
        fecha: s.fecha,
        totalRegistrado: s.total_cantidad,
        totalArticulos: 0, // suma se hace después
      };
    });

    const articulos = await ArticulosSurtidos.find()
    .populate("surtidos");
    for (const art of articulos) {
      const surtido = art.surtidos?.[0]; // solo tomamos el primero si hay varios
      if (!surtido || surtido.is_active !== "Si") continue;

      const id = surtido._id.toString();
      if (surtidosMap[id]) {
        surtidosMap[id].totalArticulos += art.cantidad;
      }
    }

    const resultado = Object.values(surtidosMap).map((s) => ({
      idSurtido: s.idSurtido,
      surtido: s.surtido,
      fecha: s.fecha,
      totalRegistrado: s.totalRegistrado,
      totalArticulos: s.totalArticulos,
      diferencia: s.totalRegistrado - s.totalArticulos,
    }));

    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
},

    analisisVentasTiendas: async (req, res) => {

    try {
       // Surtidos
       let surt = await VentasTiendas.find({is_active:"Si"})
       let arraySurtidos = surt
         .map((a) => {
           return {
            idSurtido: a._id,
            surtido: a.idVentaTienda,
             total: a.total_general,
             abonos: 0,
             saldo: 0,
             saldoSistema: a.saldo
           };
         })
         .filter(function (el) {
           return el != null;
         });

              // Abonos
       let abn = await AbonosTiendas.find({is_active:"Si", ventasTiendas:{$ne:[]}})
       .populate("ventasTiendas")
 
       let arrayAbonos = abn
         .map((a) => {
           return {
            idSurtido: a.ventasTiendas[0]._id,
            surtido: a.ventasTiendas[0].idVentaTienda,
              total: 0,
             abonos: a.total,
             saldo: 0,
             saldoSistema: 0
           };
         })
         .filter(function (el) {
           return el != null;
         });
     

      let concat = arraySurtidos
        .concat(arrayAbonos)

      let dataFinal = Object.values(concat);

      let agrupado = dataFinal.reduce(function (groups, item) {
        const val = item["idSurtido"] ;
        groups[val] = groups[val] || {
          idSurtido: item.idSurtido,
          abonos: 0,
          total: 0,
          saldo: 0,
          saldoSistema: 0
        };
        groups[val].abonos += item.abonos;
        groups[val].total += item.total;
        groups[val].saldo += item.saldo;
        groups[val].saldoSistema += item.saldoSistema;
        groups[val].idSurtido = item.idSurtido;
        groups[val].surtido = item.surtido;
        return groups;
      }, []);
      let agrupado2 = Object.values(agrupado);

      res.status(200).json(agrupado2);
    } catch (error) {
      res.status(400).json(error);
    }
  },

      analisisNotasCargo: async (req, res) => {

    try {
       // Surtidos
       let surt = await NotasCargo.find()
       let arraySurtidos = surt
         .map((a) => {
           return {
            idSurtido: a._id,
            surtido: a.idNotaCargo,
             total: a.importe,
             abonos: 0,
             saldo: 0,
             saldoSistema: a.saldo
           };
         })
         .filter(function (el) {
           return el != null;
         });

              // Abonos
       let abntd = await AbonosTiendas.find({is_active:"Si", notasCargo:{$ne:[]}})
       .populate("notasCargo")
 
       let arrayAbonosTd = abntd
         .map((a) => {
           return {
            idSurtido: a.notasCargo[0]._id,
            surtido: a.notasCargo[0].idNotaCargo,
              total: 0,
             abonos: a.total,
             saldo: 0,
             saldoSistema: 0
           };
         })
         .filter(function (el) {
           return el != null;
         });

                      // Abonos
       let abn = await Abonos.find({is_active:"Si", notasCargo:{$ne:[]}})
       .populate("notasCargo")
 
       let arrayAbonos = abn
         .map((a) => {
           return {
            idSurtido: a.notasCargo[0]._id,
            surtido: a.notasCargo[0].idNotaCargo,
              total: 0,
             abonos: a.importe,
             saldo: 0,
             saldoSistema: 0
           };
         })
         .filter(function (el) {
           return el != null;
         });
     

      let concat = arraySurtidos
        .concat(arrayAbonos, arrayAbonosTd)

      let dataFinal = Object.values(concat);

      let agrupado = dataFinal.reduce(function (groups, item) {
        const val = item["idSurtido"] ;
        groups[val] = groups[val] || {
          idSurtido: item.idSurtido,
          abonos: 0,
          total: 0,
          saldo: 0,
          saldoSistema: 0
        };
        groups[val].abonos += item.abonos;
        groups[val].total += item.total;
        groups[val].saldo += item.saldo;
        groups[val].saldoSistema += item.saldoSistema;
        groups[val].idSurtido = item.idSurtido;
        groups[val].surtido = item.surtido;
        return groups;
      }, []);
      let agrupado2 = Object.values(agrupado);

      res.status(200).json(agrupado2);
    } catch (error) {
      res.status(400).json(error);
    }
  },
};
