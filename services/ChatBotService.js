const { Clientes, Articulos, Inventarios, ArticulosPedido, ArticulosEmbarques, ArticulosOC, Abonos, Anticipos, NotasCargo, Surtidos, Devoluciones  } = require("../models");
const TelefonosWhatsAppService = require("./TelefonosWhatsAppService");
const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
require("jspdf-autotable");
const logoSistemify = require("../librerias/LogoSistemify");
const logoInstitucion = require("../librerias/LogoInstitucion");
const moment = require("moment");
const { Buffer } = require('buffer');
const axios = require("axios");
const WhatsAppService = require("./WhatsAppService");

WhatsAppService.getMessageEmitter().on('message', (message) => {
  handleMessage(message);
})

let date = new Date();
let hoy = moment(date).format("YYYY-MM-DD");

async function handleBienvenido(client, from, body) {
  let tel = from.slice(3, from.length).replace("@s.whatsapp.net", "");

  const messageContent = 
  `Bienvenido a ${process.env.REACT_APP_NOMBRE_INSTITUCION}!

  Por favor seleccione una opción

  - Saldo
  - Estado de cuenta
  - Existencia
  - Inventario
  - Disponible`;

  await WhatsAppService.sendMsg(from, messageContent);;
}
async function handleSaldo(client, from, body) {
  let tel = from.slice(3, from.length).replace("@s.whatsapp.net", "");

  const cli = await Clientes.find({ telefono: tel });

  if (cli.length == 0) {
    await WhatsAppService.sendMsg(from, "El número no está registrado");
    return;
  }

  let saldo = cli[0].saldo;
  await WhatsAppService.sendMsg(from, "Su saldo actual es: " + new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(saldo));
}

// async function handleEstadoCuenta(client, from, body) {
//   let tel = from.slice(3, from.length).replace("@s.whatsapp.net", "");

//   const cli = await Clientes.find({ telefono: tel });

//   if (cli.length == 0) {
//     await WhatsAppService.sendMsg(from, "El número no está registrado");
//     return;
//   }

//   let cliente = cli[0]._id

//   let notasCargo = await NotasCargo.find({ clientes: cliente, importe: {$gt : 0}  })
//   let arrayNotasCargo = notasCargo
//     .map((a) => {
//       return {
//         createdAt: a.createdAt,
//         id: a._id,
//         fecha: a.fecha,
//         abono: a.importe - a.saldo,
//         movimiento: "Nota Cargo",
//         cargo: a.importe,
//         numero: a.idNotaCargo,
//         saldo: a.saldo,
//         observaciones: a.observaciones,
//         subTotal: 0,
//         iva: 0,
//       };
//     })
//     .filter(function (el) {
//       return el != null;
//     });

//   let surtidos = await Surtidos.find({ clientes: cliente,  is_active:"Si" })
//   .populate("pedidos");
//   let arraySurtidos = surtidos
//     .map((a) => {
//       return {
//         createdAt: a.createdAt,
//         id: a._id,
//         fecha: a.fecha,
//         abono: a.total_general - a.saldo,
//         movimiento: "Nota",
//         cargo: a.total_general,
//         numero: a.idSurtido,
//         saldo: a.saldo,
//         observaciones: "NA",
//         subTotal: a.subTotal,
//         iva: a.iva,
//       };
//     })
//     .filter(function (el) {
//       return el != null;
//     });


//     let anticipos = await Anticipos.find({
//       clientes: cliente,
//       // saldo: { $gt: 0 },
//       importe: {$gt : 0}
//     });
//     let arrayAnticipos = anticipos
//       .map((a) => {
//         return {
//           createdAt: a.createdAt,
//           id: a._id,
//           fecha: a.fecha,
//           abono:  a.saldo,
//           movimiento: "Anticipo",
//           cargo: 0,
//           numero: a.idAnticipo,
//           saldo: a.saldo,
//           observaciones: "NA",
//           subTotal: 0,
//           iva: 0,
//         };
//       })
//       .filter(function (el) {
//         return el != null;
//       });


//   let concat = arraySurtidos
//     .concat(arrayNotasCargo, arrayAnticipos)
//     .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

//   let dataFinal = Object.values(concat);

//   let totalCargosEdoCte = 0;
//   let totalAbonosEdoCte = 0;
//   let saldoParcial = 0;

//   const data = dataFinal.map((a) => {
//       totalCargosEdoCte = totalCargosEdoCte + a.cargo;
//       totalAbonosEdoCte = totalAbonosEdoCte + a.abono;
//       saldoParcial = saldoParcial + a.cargo - a.abono;
//       return [
//         a.fecha,
//         a.movimiento,
//         a.numero,
//         a.observaciones,
//         new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2, }).format(a.cargo),
//         new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2, }).format(a.abono),
//         new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2, }).format(a.cargo - a.abono),
//         new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2, }).format(saldoParcial),
//       ];
//   });
//   const dataPDF = Object.values(data);
//   const dataPDFLimpia = dataPDF.filter(function (el) {
//     return el != null;
//   });
//   const doc = new jsPDF();
//   var img = logoSistemify.base64File;
//   doc.addImage(img, "png", 15, 10, 25, 10);

//   var img2 = logoInstitucion.base64File;
//   doc.addImage(img2, "png", 155, 15, 25, 25);

//   doc.setFontSize(14)
//   doc.text(`Estado de Cuenta`, 15, 30);
//   doc.text(`Cliente ${cli[0].nombre_comercial}`, 15, 37);
//   doc.autoTable({
//     styles: {
//       fontSize: 9,
//     },
//     head: [
//       [
//         "Fecha",
//         "Movimiento",
//         "Numero",
//         "Observaciones",
//         "Cargos",
//         "Abonos",
//         "Saldo",
//         "Saldo Total",
//       ],
//     ],
//     body: dataPDFLimpia,
//     startY: 45,
//     foot: [
//       [
//         "",
//         "",
//         "",
//         "",
//         "",
//         {
//           content: "Cargos del Periodo",
//           colSpan: 2,
//           styles: { halign: "left" },
//         },
//         new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2, }).format(totalCargosEdoCte),
//       ],
//       [
//         "",
//         "",
//         "",
//         "",
//         "",
//         {
//           content: "Abonos del Periodo",
//           colSpan: 2,
//           styles: { halign: "left" },
//         },
//         new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2, }).format(totalAbonosEdoCte),
//       ],
//       [
//         "",
//         "",
//         "",
//         "",
//         "",
//         { content: "Saldo Actual", colSpan: 2, styles: { halign: "left" } },
//         new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2, }).format(saldoParcial),
//       ],
//     ],
//     showFoot: "lastPage",
//   });

//   // Mandar Mensaje
//   var att = doc.output("arraybuffer");
//   var base64File = encode.encode(att, "base64");

//   const sizeInBytes = Buffer.from(base64File, "utf8").length;


//  await WhatsAppService.sendMsg(
//     from,
// `Hola ${cli[0].nombre_comercial},
// Aqui te enviamos tu Estado de Cuenta`,
//   );

//   await WhatsAppService.sendPDF(
//     from, att, `EstadoCuenta.pdf`,"application/pdf"
//   );

// }

async function handleEstadoCuenta(client, from, body) {
  let tel = from.slice(3).replace("@s.whatsapp.net", "");

  const cli = await Clientes.find({ telefono: tel });
  if (cli.length === 0) {
    await WhatsAppService.sendMsg(from, "El número no está registrado");
    return;
  }

  const clienteId = cli[0]._id;

  // ===== helpers =====
  const money = (v) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(Number(v || 0));

  const moneyBlankIfZero = (v) => (Number(v || 0) > 0 ? money(v) : "");

  // ===== DATA =====
  let notasCargo = await NotasCargo.find({
    clientes: clienteId,
    importe: { $gt: 0 },
  });

  let arrayNotasCargo = notasCargo
    .map((a) => ({
      createdAt: a.createdAt,
      id: a._id,
      fecha: a.fecha,
      movimiento: "Nota Cargo",
      numero: a.idNotaCargo,
      observaciones: a.observaciones || "NA",
      banco: a.banco || "NA",
      cargo: Number(a.importe || 0),
      abono: Number((a.importe || 0) - (a.saldo || 0)),
      bonificacion: 0,
      devolucion: 0,
    }))
    .filter(Boolean);

  let surtidos = await Surtidos.find({ clientes: clienteId, is_active: "Si" }).populate("pedidos");

  let arraySurtidos = surtidos
    .map((a) => ({
      createdAt: a.createdAt,
      id: a._id,
      fecha: a.fecha,
      movimiento: "Nota",
      numero: a.idSurtido,
      observaciones: "NA",
      banco: a.banco || "NA",
      cargo: Number(a.total_general || 0),
      abono: Number((a.total_general || 0) - (a.saldo || 0)),
      bonificacion: 0,
      devolucion: 0,
    }))
    .filter(Boolean);

  let anticipos = await Anticipos.find({
    clientes: clienteId,
    importe: { $gt: 0 },
  });

  let arrayAnticipos = anticipos
    .map((a) => ({
      createdAt: a.createdAt,
      id: a._id,
      fecha: a.fecha,
      movimiento: "Anticipo",
      numero: a.idAnticipo,
      observaciones: "NA",
      banco: a.banco || "NA",
      cargo: 0,
      abono: Number(a.saldo || 0),
      bonificacion: 0,
      devolucion: 0,
    }))
    .filter(Boolean);

  // Orden + union
  let dataFinal = arraySurtidos
    .concat(arrayNotasCargo, arrayAnticipos)
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

  // ===== TOTALES + SALDO PARCIAL (igual que PDFOC) =====
  let saldoInicial = 0; // si tienes saldo inicial real del cliente, cámbialo aquí
  let saldoParcial = saldoInicial;

  let totalCargosEdoCte = 0;
  let totalAbonosEdoCte = 0;
  let totalBonificacionesEdoCte = 0;
  let totalDevolucionesEdoCte = 0;
  let totalSaldoEdoCte = 0;

  const bodyRows = dataFinal.map((a) => {
    totalCargosEdoCte += Number(a.cargo || 0);
    totalAbonosEdoCte += Number(a.abono || 0);
    totalBonificacionesEdoCte += Number(a.bonificacion || 0);
    totalDevolucionesEdoCte += Number(a.devolucion || 0);

    totalSaldoEdoCte =
      totalCargosEdoCte -
      totalAbonosEdoCte -
      totalBonificacionesEdoCte -
      totalDevolucionesEdoCte;

    saldoParcial =
      saldoParcial +
      Number(a.cargo || 0) -
      Number(a.abono || 0) -
      Number(a.bonificacion || 0) -
      Number(a.devolucion || 0);

    // Columnas IGUAL que tu PDFOC() del front
    return [
      a.numero,
      a.fecha,
      a.movimiento,
      a.observaciones,
      a.banco,
      moneyBlankIfZero(a.cargo),
      moneyBlankIfZero(a.abono),
      moneyBlankIfZero(a.bonificacion),
      moneyBlankIfZero(a.devolucion),
      money(saldoParcial),
    ];
  });

  const dataPDFLimpia = bodyRows.filter(Boolean);

  // ===== PDF (MISMA CONFIG QUE PDFOC) =====
  const doc = new jsPDF("landscape", "mm", "a4", true);

  const backgroundColor = ["#d1d2d4"];
  const backgroundColorBoxBlack = ["#231f20"];
  const backgroundColorBoxPurple = ["#f28029"];
  const margins = { left: 5, right: 5 };

  // Logos (usa base64 en backend)
  // OJO: si alguno viene vacío, evita truene
  try {
    if (logoInstitucion?.base64File) {
      doc.addImage(logoInstitucion.base64File, "png", 15, 5, 33, 33);
    }
  } catch (e) {}

  // Cabecera gris
  doc.setFillColor(...backgroundColor);
  doc.rect(5, 40, 287, 6, "F");
  doc.setFontSize(12);
  doc.setTextColor("#000000");
  doc.text(`Tel: 55 1234 5678`, 8, 44);
  doc.text(`Cliente: ${cli[0].nombre_comercial}`, 8, 52);
  doc.text(`Clave: ${cli[0].clave || ""}`, 260, 52);

  // Caja superior negra y naranja
  doc.setFillColor(...backgroundColorBoxBlack);
  doc.rect(160, 4, 135, 22, "F");
  doc.setFillColor(...backgroundColorBoxPurple);
  doc.rect(125, 4, 35, 22, "F");
  doc.setTextColor("#ffffff");
  doc.setFontSize(14);
  doc.text(`Estado de Cuenta`, 180, 15);

  // ColumnStyles (igual que el front)
  const columnStyles = {
    0: { fontSize: 9, textColor: "#000000", halign: "center" },
    1: { fontSize: 9, textColor: "#000000", halign: "center" },
    2: { fontSize: 9, textColor: "#000000", halign: "center" },
    3: { fontSize: 9, textColor: "#000000", halign: "center", cellWidth: 40 },
    4: { fontSize: 9, textColor: "#000000", halign: "center", cellWidth: 35 },
    5: { fontSize: 9, textColor: "#000000", halign: "right" },
    6: { fontSize: 9, textColor: "#f40903", halign: "right" },
    7: { fontSize: 9, textColor: "#f40903", halign: "right" },
    8: { fontSize: 9, textColor: "#f40903", halign: "right" },
    9: { fontSize: 9, textColor: "#030af4", halign: "right" },
  };

  doc.autoTable({
    head: [
      [
        "FOLIO",
        "FECHA",
        "MOVIMIENTO",
        "OBSERVACIONES",
        "BANCO",
        "CARGOS",
        "ABONOS",
        "BONIFICACIONES",
        "DEVOLUCIONES",
        "SALDO",
      ],
    ],
    body: dataPDFLimpia,
    startY: 58,
    headStyles: {
      fillColor: ["#f28029"],
      lineWidth: 0,
      halign: "center",
      valign: "middle",
      fontSize: 8,
    },
    columnStyles,
    margin: margins,
    theme: "grid",

    // Footer con totales (si lo quieres igual siempre visible)
    foot: [
      ["", "", "", "", "Totales", money(totalCargosEdoCte), money(totalAbonosEdoCte), money(totalBonificacionesEdoCte), money(totalDevolucionesEdoCte), money(saldoParcial)],
    ],
    showFoot: "lastPage",
  });

  // ===== Enviar por WhatsApp =====
  const att = doc.output("arraybuffer");

  await WhatsAppService.sendMsg(
    from,
    `Hola ${cli[0].nombre_comercial},\nAqui te enviamos tu Estado de Cuenta`
  );

  await WhatsAppService.sendPDF(from, att, `EdoCtaCliente-${cli[0].nombre_comercial}.pdf`, "application/pdf");
}

async function handleExistencia(client, from, body) {
  let tel = from.slice(3, from.length).replace("@s.whatsapp.net", "");

  // const cli = await Clientes.find({ telefono: tel });

  // if (cli.length == 0) {
  //   await WhatsAppService.sendMsg(from, "El número no está registrado");
  //   return;
  // }

  const TelefonosWhatsAppExists = await TelefonosWhatsAppService.findOneByTelefonoActivo(tel);
  if (!TelefonosWhatsAppExists || !process.env.REACT_APP_TELEFONO_SUPER_ADMIN) {
    await WhatsAppService.sendMsg(from, "El número no está registrado");
    return;
  }

  let modelo = body.slice(11, body.length);
  let art = await Articulos.find({ codigo: modelo });

  if (art.length == 0) {
    await WhatsAppService.sendMsg(from, "El modelo no está registrado");
    return;
  }

  let inv = await Inventarios.find({ articulos: art[0]._id, is_active: "Si" });

  let tot = inv.map((c) => parseFloat(c.cantidad));
  let existencia = tot.reduce((t, total, index) => t + total, 0);

  await WhatsAppService.sendMsg(
    from,
    `Hola ${TelefonosWhatsAppExists.name}, 
    La existencia del modelo ${modelo} es: ${new Intl.NumberFormat("en-US").format(existencia)}`
  );
}

async function handleInventario(client, from, body) {
  let tel = from.slice(3, from.length).replace("@s.whatsapp.net", "");

  // const cli = await Clientes.find({ telefono: tel });

  // if (cli.length == 0) {
  //   await WhatsAppService.sendMsg(from, "El número no está registrado");
  //   return;
  // }

  const TelefonosWhatsAppExists = await TelefonosWhatsAppService.findOneByTelefonoActivo(tel);
  if (!TelefonosWhatsAppExists || !process.env.REACT_APP_TELEFONO_SUPER_ADMIN) {
    await WhatsAppService.sendMsg(from, "El número no está registrado");
    return;
  }

  let inv = await Inventarios.find({ is_active: "Si" })

    .populate("areas")
    .populate({ path: "articulos", populate: { path: "lineas" } })
    .populate({ path: "articulos", populate: { path: "marcas" } })
    .populate({ path: "articulos", populate: { path: "familias" } })
    .populate({ path: "articulos", populate: { path: "colecciones" } })
    .populate({ path: "articulos", populate: { path: "proveedores" } });

  let arrayInv = inv
    .map((a) => {
      return {
        _id: a._id,
        activo: a.is_active,
        cantidad: a.cantidad,
        codigo: a.articulos[0].codigo,
        nombre: a.articulos[0].nombre,
        idArticulo: a.articulos[0]._id,
        costoUSD: a.costoUnitario,
        costoMX: a.costoUnitario,
        venta: a.articulos[0].venta,
        observaciones: a.articulos[0].observaciones,
        piezasPorCaja: a.articulos[0].piezasPorCaja,
        ano: a.articulos[0].ano,
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
        valor: parseFloat(a.costoUnitario).toFixed(2) * parseFloat(a.cantidad),
        cajas: (a.cantidad / a.articulos[0].piezasPorCaja).toFixed(2),
      };
    })
    .filter(function (el) {
      return el != null;
    });

  let dataFinal = Object.values(arrayInv);

  let total_general = 0;
  let total_cajas = 0;

  let agrupado = dataFinal.reduce(function (groups, item) {
    const val = item["idArticulo"] + item["idArea"];
    groups[val] = groups[val] || {
      idArticulo: item.idArticulo,
      cantidad: 0,
      valor: 0,
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
    groups[val].ano = item.ano;
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
    groups[val].cajas = item.cajas;
    return groups;
  }, []);

  let computedComments = Object.values(agrupado);

  const data = computedComments.map((a) => {
    total_general = parseFloat(total_general) + parseFloat(a.cantidad);
    total_cajas = parseFloat(total_cajas) + parseFloat(a.cajas);
    return [
      a.codigo,
      a.nombre,
      a.linea,
      a.marca,
      a.familia,
      a.coleccion,
      a.ano,
      a.piezasPorCaja,
      new Intl.NumberFormat("en-US").format(a.cajas),
      new Intl.NumberFormat("en-US").format(a.cantidad),
      a.area,
    ];
  });

  const dataPDF = Object.values(data);
  const dataPDFLimpia = dataPDF.filter(function (el) {
    return el != null;
  });
  const doc = new jsPDF("landscape");

  var img = logoSistemify.base64File;
  doc.addImage(img, "png", 230, 30, 45, 15);

  var img2 = logoInstitucion.base64File;
  doc.addImage(img2, "png", 140, 15, 25, 25);

  doc.text(`Inventario`, 20, 40);
  doc.autoTable({
    head: [
      [
        "Codigo",
        "Nombre",
        "Linea",
        "Marca",
        "Familia",
        "Coleccion",
        "Año",
        "PxC",
        "Cajas",
        "Cantidad",
        "Almacen",
      ],
    ],
    body: dataPDFLimpia,
    startY: 45,
    foot: [
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Totales",
        new Intl.NumberFormat("en-US").format(total_cajas),
        new Intl.NumberFormat("en-US").format(total_general),
      ],
    ],
    showFoot: "lastPage",
  });

  var att = doc.output("arraybuffer");


  await WhatsAppService.sendMsg(
    from,
    `Hola ${TelefonosWhatsAppExists.name}, Aqui te mostramos la información de tu Inventario`,
  );

  await WhatsAppService.sendPDF(
    from, att, `Inventario.pdf`,"application/pdf"
  );

}

async function handleDisponible(client, from, body) {
  let tel = from.slice(3, from.length).replace("@s.whatsapp.net", "");

  // const cli = await Clientes.find({ telefono: tel });

  // if (cli.length == 0) {
  //   await WhatsAppService.sendMsg(from, "El número no está registrado");
  //   return;
  // }

  const TelefonosWhatsAppExists = await TelefonosWhatsAppService.findOneByTelefonoActivo(tel);
  if (!TelefonosWhatsAppExists || !process.env.REACT_APP_TELEFONO_SUPER_ADMIN) {
    await WhatsAppService.sendMsg(from, "El número no está registrado");
    return;
  }

  let AP = await ArticulosPedido.find({
    is_active: "Si",
    autorizadoApartado: "Si",
  })
    .populate({ path: "pedidos", populate: { path: "areas" } })
    .populate("articulos")

    let idDany = await AP.map((a) => {
      return {
        codigo: a.articulos[0].codigo,
        nombre: a.articulos[0].nombre,
        idArticulo: a.articulos[0]._id,
        disponible: -a.pendiente_surtir,
        pedido: a.pendiente_surtir,
        inventario: 0,
        porRecibir: 0,
      };
  }).filter(function (el) {
    return el != null;
  });


  let AI = await Inventarios.find({
    is_active: "Si",
  })
  .populate("articulos")
  let idDany2 = await AI.map((a) => {
    return {
      codigo: a.articulos[0].codigo,
      nombre: a.articulos[0].nombre,
      idArticulo: a.articulos[0]._id,
      disponible: a.cantidad,
      pedido: 0,
      inventario: a.cantidad,
      porRecibir: 0,
    };
  });

  let PR = await ArticulosEmbarques.find({ is_active: "Si", pendiente_recibir: {$gte:0} })
  .populate("articulos")

  let PR2 = await PR.map((a) => {
    return {
      codigo: a.articulos[0].codigo,
      nombre: a.articulos[0].nombre,
      idArticulo: a.articulos[0]._id,
      disponible: a.pendiente_recibir,
      pedido: 0,
      inventario: 0,
      porRecibir: a.pendiente_recibir,
    };
  });

  let PROC = await ArticulosOC.find({ is_active: "Si", pendiente_embarcar: {$gte:0} })
  .populate("articulos")


  let PROC2 = await PROC.map((a) => {
    return {
      codigo: a.articulos[0].codigo,
      nombre: a.articulos[0].nombre,
      idArticulo: a.articulos[0]._id,
      disponible: a.pendiente_embarcar,
      pedido: 0,
      inventario: 0,
      porRecibir: a.pendiente_embarcar,
    };
  });

  let otra2 = await idDany.concat(idDany2, PR2, PROC2 );

  let agrupado = otra2.reduce(function (groups, item) {
    const val = item["idArticulo"];
    groups[val] = groups[val] || {
      idArticulo: item.idArticulo,
      disponible: 0,
      pedido: 0,
      inventario: 0,
      traspaso: 0,
      porRecibir: 0,
    };
    groups[val].disponible += item.disponible;
    groups[val].pedido += item.pedido;
    groups[val].inventario += item.inventario;
    groups[val].porRecibir += item.porRecibir;
    groups[val].codigo = item.codigo;
    groups[val].nombre = item.nombre;
    groups[val].idArticulo = item.idArticulo;
    return groups;
  }, []);


  let total_inventario = 0;
  let total_porRecibir = 0;
  let total_pedido = 0;
  let total_disponible = 0;


  let computedComments = Object.values(agrupado);

  const data = computedComments.map((a) => {
    total_inventario = parseFloat(total_inventario) + parseFloat(a.inventario);
    total_porRecibir = parseFloat(total_porRecibir) + parseFloat(a.porRecibir);
    total_pedido = parseFloat(total_pedido) + parseFloat(a.pedido);
    total_disponible = parseFloat(total_disponible) + parseFloat(a.disponible);
    return [
      a.codigo,
      a.nombre,
      new Intl.NumberFormat("en-US").format(a.inventario),
      new Intl.NumberFormat("en-US").format(a.porRecibir),
      new Intl.NumberFormat("en-US").format(a.pedido),
      new Intl.NumberFormat("en-US").format(a.disponible),
    ];
  });

  const dataPDF = Object.values(data);
  const dataPDFLimpia = dataPDF.filter(function (el) {
    return el != null;
  });
  const doc = new jsPDF("landscape");

  var img = logoSistemify.base64File;
  doc.addImage(img, "png", 230, 30, 45, 15);

  var img2 = logoInstitucion.base64File;
  doc.addImage(img2, "png", 140, 15, 25, 25);

  doc.text(`Disponible`, 20, 40);
  doc.autoTable({
    head: [
      [
        "Codigo",
        "Nombre",
        "Inventario",
        "Por Recibir",
        "Pedido",
        "Disponible",
      ],
    ],
    body: dataPDFLimpia,
    startY: 45,
    foot: [
      [
        "",
        "Totales",
        new Intl.NumberFormat("en-US").format(total_inventario),
        new Intl.NumberFormat("en-US").format(total_porRecibir),
        new Intl.NumberFormat("en-US").format(total_pedido),
        new Intl.NumberFormat("en-US").format(total_disponible),
      ],
    ],
    showFoot: "lastPage",
  });

  var att = doc.output("arraybuffer");


  await WhatsAppService.sendMsg(
    from,
    `Hola ${TelefonosWhatsAppExists.name}, Aqui te mostramos la información de tu inventario disponible`,
  );

  await WhatsAppService.sendPDF(
    from, att, `Disponible.pdf`,"application/pdf"
  );

}


async function handleCorte(client, from, body) {
  let tel = from.slice(3, from.length).replace("@s.whatsapp.net", "");

  if (tel != process.env.REACT_APP_TELEFONO_SUPER_ADMIN) {
    await WhatsAppService.sendMsg(from, "El número no está registrado");
    return;
  }

// Surtidos

const surtidos = await Surtidos.find({fecha:{$gte: hoy, $lte: hoy}, is_active:"Si"})
.populate('clientes')

let arraySurtidos = surtidos
.sort((a, b) => (a.idSurtido > b.idSurtido ? 1 : -1))
.map((a) => {
  return {
    _id: a._id,
    numero: a.idSurtido,
    consecutivo: a.idSurtido,
    activo: a.is_active,
    fecha: a.fecha,
    observaciones: a.observaciones,
    subTotal: a.subTotal,
    iva: a.iva,
    total_general: a.total_general,
    clientes: a.clientes[0].nombre_comercial,
    idClientes: a.clientes[0]._id,
    total_cantidad: a.total_cantidad,
    comisionTDC: a.comisionTDC,
    comisionFlete: a.comisionFlete,
    impuestos: a.impuestos,
    movimiento: "Nota",
    condPago: a.cond_pago,
  };
})
.filter(function (el) {
  return el != null;
});
let dataSurtidos = Object.values(arraySurtidos);

const abonos = await Abonos.find({fecha:{$gte: hoy, $lte: hoy}, is_active:"Si"})
.populate('clientes')
.populate('surtidos')
.populate('notasCargo')

let arrayAbonos = abonos
.sort((a, b) => (a.idAbono > b.idAbono ? 1 : -1))
.map((a) => {
  if(a.concepto == "Abono"){
  if(a.surtidos!=""){
    if(a.surtidos[0].is_active == "Si" ){
  return {
    _id: a._id,
    numero: a.idAbono,
    fecha: a.fecha,
    fechaTransfer: a.fechaTransfer,
    observaciones: a.surtidos[0].observaciones,
    clientes: a.clientes[0].nombre_comercial,
    idClientes: a.clientes[0]._id,
    total_general: a.total,
    efectivo: a.efectivo,
    tdc: a.tdc,
    transfer: a.transfer,
    consecutivo: a.surtidos[0].idSurtido,
    movimiento: "Abono",
    condPago: a.condPago,
    numeroNota: a.surtidos[0].idSurtido,
    destino: a.destino,
    terminal: a.terminal,
    codigoAgrupado: a.codigoAgrupado,
    createdAt: moment(a.createdAt).utcOffset('-0600').format("DD-MM-YYYY") + " " + moment(a.createdAt).utcOffset('-0600').format("HH:mm"),
  }
}
}
  else{
    return {
      _id: a._id,
      numero: a.idAbono,
      fecha: a.fecha,
      clientes: a.clientes[0].nombre_comercial,
      idClientes: a.clientes[0]._id,
      total_general: a.total,
      efectivo: a.efectivo,
      tdc: a.tdc,
      transfer: a.transfer,
      fechaTransfer: a.fechaTransfer,
      consecutivo: "NC" + " " + a.notasCargo[0].idNotaCargo,
      movimiento: "Abono",
      condPago: "Credito",
      numeroNota: "NC" + " " + a.notasCargo[0].idNotaCargo,
      destino: a.destino,
      terminal: a.terminal,
      codigoAgrupado: a.codigoAgrupado,
      createdAt: moment(a.createdAt).utcOffset('-0600').format("DD-MM-YYYY") + " " + moment(a.createdAt).utcOffset('-0600').format("HH:mm"),
    }}}
})
.filter(function (el) {
  return el != null;
});

let dataAbonos = Object.values(arrayAbonos);


let agrupadoAbonos = dataAbonos.reduce(function (groups, item) {
const val = item["codigoAgrupado"]
groups[val] = groups[val] || {
  codigoAgrupado: item.codigoAgrupado,
  createdAt: item.createdAt,
  efectivo: 0,
  tdc: 0,
  transfer: 0,
  total_general: 0
};
groups[val].tdc += item.tdc;
groups[val].transfer += item.transfer;
groups[val].efectivo += item.efectivo;
groups[val].consecutivo = item.consecutivo;
groups[val].clientes = item.clientes;
groups[val].total_general += item.total_general;
groups[val].condPago = item.condPago;
groups[val].terminal = item.terminal;
groups[val].destino = item.destino;
groups[val].fechaTransfer = item.fechaTransfer;
return groups;
}, []);

let agrupadoAbonosValues = Object.values(agrupadoAbonos);

const devo = await  Devoluciones.find({fecha:{$gte: hoy, $lte: hoy}})
.populate('clientes')

let arrayDevoluciones = devo
.sort((a, b) =>
  a.idDevolucion > b.idDevolucion ? 1 : -1
)
.map((a) => {
  return {
    _id: a._id,
    numero: a.idDevolucion,
    activo: a.is_active,
    fecha: a.fecha,
    observaciones: a.observaciones,
    subTotal: a.subTotal,
    iva: a.iva,
    total_general: a.total_general,
    clientes: a.clientes[0].nombre_comercial,
    idClientes: a.clientes[0]._id,
    total_cantidad: a.total_cantidad,
    impuestos: a.impuestos,
    movimiento: "Devolucion",
    // fiscal: a.fiscal,
  };
})
.filter(function (el) {
  return el != null;
});

let dataDevoluciones = Object.values(arrayDevoluciones);

 // Empezamos PDF
    // Ventas Credito
    let TotalTablaVentasCredito = 0;
    let TotalPiezasVentasCredito = 0;
    const ventasCredito = dataSurtidos.map((a) => {
      if (a.condPago == "Credito") {
        TotalTablaVentasCredito = TotalTablaVentasCredito + a.total_general;
        TotalPiezasVentasCredito =
          TotalPiezasVentasCredito + a.total_cantidad;
        return [
          a.consecutivo,
          a.clientes,
          a.total_cantidad,
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(a.total_general),
        ];
      }
    });
    const ventasPDFCredito = Object.values(ventasCredito);
    const ventasPDFCreditoLimpia = ventasPDFCredito.filter(function (el) {
      return el != null;
    });

    // Devoluciones Contado
    let TotalTablaDevoluciones = 0;
    let TotalPiezasDevoluciones = 0;
    const devoluciones = dataDevoluciones.map((a) => {
      // if (a. == "Si") {
        TotalTablaDevoluciones =
          TotalTablaDevoluciones + a.total_general;
        TotalPiezasDevoluciones =
          TotalPiezasDevoluciones + a.total_cantidad;
        return [
          a.numero,
          a.total_cantidad,
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(a.total_general),
        ];
      // }
    });
    const devolucionesPDF = Object.values(devoluciones);
    const devolucionesPDFLimpia = devolucionesPDF.filter(function (
      el
    ) {
      return el != null;
    });

    // Abonos Credito
    let TotalTablaAbonosCreditoEfectivo = 0;
    let TotalTablaAbonosCreditoTDC = 0;
    let TotalTablaAbonosCreditoTransfer = 0;
    let TotalTablaAbonosCreditoTotal = 0;

    const abonosCredito = agrupadoAbonosValues.map((a) => {
      if (a.condPago == "Credito") {
        TotalTablaAbonosCreditoEfectivo =
          TotalTablaAbonosCreditoEfectivo + a.efectivo;
        TotalTablaAbonosCreditoTDC = TotalTablaAbonosCreditoTDC + a.tdc;
        TotalTablaAbonosCreditoTransfer =
          TotalTablaAbonosCreditoTransfer + a.transfer;
        TotalTablaAbonosCreditoTotal =
          TotalTablaAbonosCreditoTotal + a.total_general

        return [
          a.consecutivo,
          a.clientes,
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(a.efectivo),
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(a.tdc),
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(a.transfer),
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(a.total_general),
        ];
      }
    });
    const abonosPDFCredito = Object.values(abonosCredito);
    const abonosPDFCreditoLimpia = abonosPDFCredito.filter(function (el) {
      return el != null;
    });


    // Abonos Contado
    let TotalTablaAbonosContadoEfectivo = 0;
    let TotalTablaAbonosContadoTDC = 0;
    let TotalTablaAbonosContadoTransfer = 0;
    let TotalTablaAbonosContadoTotal = 0;

    const abonosContado = agrupadoAbonosValues.map((a) => {
      if (a.condPago == "Contado") {
        TotalTablaAbonosContadoEfectivo =
          TotalTablaAbonosContadoEfectivo + a.efectivo;
        TotalTablaAbonosContadoTDC = TotalTablaAbonosContadoTDC + a.tdc;
        TotalTablaAbonosContadoTransfer =
          TotalTablaAbonosContadoTransfer + a.transfer;
        TotalTablaAbonosContadoTotal =
          TotalTablaAbonosContadoTotal + a.total_general;

        return [
          a.consecutivo,
          a.clientes,
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(a.efectivo),
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(a.tdc),
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(a.transfer),
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(a.total_general),
        ];
      }
    });
    const abonosPDFContado = Object.values(abonosContado);

    const abonosPDFContadoLimpia = abonosPDFContado.filter(function (el) {
      return el != null;
    });

      // Abonos TDC
      const abonosTDC = agrupadoAbonosValues.map((a)=>{
        if(a.tdc > 0){
        return {
          importe: a.tdc,
          terminal: a.terminal
        }
      }
      })
      .filter(function (el) {
        return el != null;
      });
    
      const dataAbonosTDC = Object.values(abonosTDC);

    
      let abonosTDCAgrupado = dataAbonosTDC.reduce(function (groups, item) {
        const val = item["terminal"];
        groups[val] = groups[val] || {
          terminal: item.terminal,
          importe: 0,
        };
        groups[val].importe += item.importe;
        groups[val].terminal = item.terminal;
        return groups;
      }, []);
    
      let abonosTDCAgrupado2 = Object.values(abonosTDCAgrupado);
    


      const abnTDCPDF = abonosTDCAgrupado2.map((a)=>{
        return[
          a.terminal,
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(a.importe),
        ]
      })
      const abonosTDCPDF = Object.values(abnTDCPDF);
      const abonosTDCPDFLimpia = abonosTDCPDF.filter(function (
        el
      ) {
        return el != null;
      });

       // Abonos Transfer
       const abonosTransfer = agrupadoAbonosValues.map((a)=>{
        if(a.transfer > 0){
        return {
          importe: a.transfer,
          destino: a.destino
        }
      }
      })
      .filter(function (el) {
        return el != null;
      });
    
      let dataAbonosTransfer = Object.values(abonosTransfer);
 
      // Agrupado Transfer
      let abonosTransferAgrupado = dataAbonosTransfer.reduce(function (groups, item) {
        const val = item["destino"];
        groups[val] = groups[val] || {
          destino: item.destino,
          importe: 0,
        };
        groups[val].importe += item.importe;
        groups[val].destino = item.destino;
        return groups;
      }, []);
    
      let abonosTransferAgrupado2 = Object.values(abonosTransferAgrupado);
    
      // setAbonosTransferTiendas(abonosTransferAgrupado2);

      const abnTransferPDF = abonosTransferAgrupado2.map((a)=>{
        return[
          a.destino,
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(a.importe),
        ]
      })
      const abonosTransferPDF = Object.values(abnTransferPDF);
      const abonosTransferPDFLimpia = abonosTransferPDF.filter(function (
        el
      ) {
        return el != null;
      });

// Desgloce TDC
let TotalTablaDesgloceTDC = 0
let TotalTablaDesgloceTDCAbonos = 0
let TotalTablaDesgloceTDCDin = 0
const desgloceTDCAbonos = agrupadoAbonosValues.map((a) => {
  if(a.tdc > 0){
    TotalTablaDesgloceTDCAbonos = TotalTablaDesgloceTDCAbonos + a.tdc;
    return [
      a.consecutivo,
      a.clientes,
      a.terminal,
      new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(a.tdc),
    ]
    }
})
.filter(function (el) {
  return el != null;
})
const desgloceTDCPDF = Object.values(desgloceTDCAbonos);


const desgloceTDCPDFLimpia = desgloceTDCPDF.filter(function (el) {
  return el != null;
});

// Desgloce Transfer
let TotalTablaDesgloceTransfer = 0
let TotalTablaDesgloceTransferAbonos = 0
let TotalTablaDesgloceTransferDin = 0
const desgloceTransferAbonos = agrupadoAbonosValues.map((a) => {
  if(a.transfer > 0){
    TotalTablaDesgloceTransferAbonos = TotalTablaDesgloceTransferAbonos + a.transfer;
    return [
      a.consecutivo,
      a.clientes,
      a.destino,
      a.fechaTransfer,
      new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(a.transfer),
    ]
    }
})
.filter(function (el) {
  return el != null;
})
const desgloceTransferPDF = Object.values(desgloceTransferAbonos);



const desgloceTransferPDFLimpia = desgloceTransferPDF.filter(function (el) {
  return el != null;
});



    // Totales
    let TotalEfectivo = TotalTablaAbonosCreditoEfectivo + TotalTablaAbonosContadoEfectivo 
    let TotalTDC = TotalTablaAbonosCreditoTDC + TotalTablaAbonosContadoTDC 
    let TotalTransfer = TotalTablaAbonosCreditoTransfer + TotalTablaAbonosContadoTransfer 
    let TotalTotal = TotalTablaAbonosCreditoTotal + TotalTablaAbonosContadoTotal 

    const doc = new jsPDF();

    doc.text(`Corte - ${hoy}`, 15, 10);


    // Abonos Contado
    doc.text(`Ventas Contado`, 15, 18);
    doc.autoTable({
      head: [["Numero", "Cliente", "Efectivo", "TDC", "Transfer", "Total"]],
      body: abonosPDFContadoLimpia,
      startY: 20,
      foot: [
        [
          "",
          "Totales",
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(
              TotalTablaAbonosContadoEfectivo
            ),
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(TotalTablaAbonosContadoTDC),
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(
              TotalTablaAbonosContadoTransfer
            ),
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(TotalTablaAbonosContadoTotal),
        ],
      ],
    });

    // Ventas Credito
    doc.text(`Ventas Credito`,15, doc.autoTable.previous.finalY + 10);
    doc.autoTable({
      head: [["Numero", "Cliente", "Cantidad", "Total"]],
      body: ventasPDFCreditoLimpia,
      startY: doc.autoTable.previous.finalY + 13,
      foot: [
        [
          "",
          "Totales",
          new Intl.NumberFormat("en-US").format(TotalPiezasVentasCredito),
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(TotalTablaVentasCredito),
        ],
      ],
    });

    // Abonos Credito
    doc.text(`Pagos Credito`, 15, doc.autoTable.previous.finalY + 10);
    doc.autoTable({
      head: [["Numero", "Cliente", "Efectivo", "TDC", "Transfer", "Total"]],
      body: abonosPDFCreditoLimpia,
      startY: doc.autoTable.previous.finalY + 13,
      foot: [
        [
          "",
          "Totales",
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(
              TotalTablaAbonosCreditoEfectivo
            ),
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(TotalTablaAbonosCreditoTDC),
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(
              TotalTablaAbonosCreditoTransfer
            ),
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(
              TotalTablaAbonosCreditoTotal
            ),
        ],
      ],
    });

     


    // Devoluciones Contado
    doc.text(`Devoluciones`, 15, doc.autoTable.previous.finalY + 10);
    doc.autoTable({
      head: [["Numero", "Cantidad", "Total"]],
      body: devolucionesPDFLimpia,
      startY: doc.autoTable.previous.finalY + 13,
      foot: [
        [
          "Totales",
          new Intl.NumberFormat("en-US").format(TotalPiezasDevoluciones),
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(TotalTablaDevoluciones),
        ],
      ],
    });

   
    // Resumen
    doc.text(`Resumen`, 15, doc.autoTable.previous.finalY + 10);
    doc.autoTable({
      head: [
        [
          "Efectivo",
          "TDC",
          "Transfer",
          "Total Total",
          // "Efectivo - Gastos",
        ],
      ],
      body: [
        [
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(TotalEfectivo),
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(TotalTDC),
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(TotalTransfer),
          new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 2}).format(TotalEfectivo + TotalTDC + TotalTransfer),
        ],
      ],
      startY: doc.autoTable.previous.finalY + 13,
    });

     // Desgloce TDC
     doc.text(`Desgloce TDC`, 15, doc.autoTable.previous.finalY + 10);
     doc.autoTable({
       head: [
         [
           "Numero",
           "Cliente",
           "Terminal",
           "Importe",
         ],
       ],
       body: desgloceTDCPDFLimpia,
       startY: doc.autoTable.previous.finalY + 13,
     });

    // Resumen TDC
    doc.text(`Resumen TDC`, 15, doc.autoTable.previous.finalY + 10);
    doc.autoTable({
      head: [
        [
          "Terminal",
          "Importe",
        ],
      ],
      body: abonosTDCPDFLimpia,
      startY: doc.autoTable.previous.finalY + 13,
    });
   
     // Desgloce Transfer
     doc.text(`Desgloce Transfer`, 15, doc.autoTable.previous.finalY + 10);
     doc.autoTable({
       head: [
         [
           "Numero",
           "Cliente",
           "Destino",
           "FechaTransfer",
           "Importe",
         ],
       ],
       body: desgloceTransferPDFLimpia,
       startY: doc.autoTable.previous.finalY + 13,
     }); 

     // Resumen Transfer
     doc.text(`Resumen Transfer`, 15, doc.autoTable.previous.finalY + 10);
     doc.autoTable({
       head: [
         [
           "Destino",
           "Importe",
         ],
       ],
       body: abonosTransferPDFLimpia,
       startY: doc.autoTable.previous.finalY + 13,
     });

  var att = doc.output("arraybuffer");


  await WhatsAppService.sendMsg(
    from,
    `Hola, Aquí te enviamos el Corte del Día ${hoy}`,
  );

  

  await WhatsAppService.sendPDF(
    from, att, `Corte-${hoy}.pdf`,"application/pdf"
  );

}


async function handleMessage  (message) {

  const from =  message.key.remoteJid;

    // Si no es un mensaje de WhatsApp personal, salir
  if (!from.includes("@s.whatsapp.net")) {
    return;
  }
  
  let body = "";
  
  // Check if message and message.message exist before accessing properties
  const conversationText = message && message.message && message.message.conversation ? message.message.conversation : "";
  const extendedText = message && message.message && message.message.extendedTextMessage ? message.message.extendedTextMessage.text || "" : "";
  
  // Check if the message is not a GIF before assigning to `body`
  const isNotGif = !message || !message.message || !message.message.extendedTextMessage || message.message.extendedTextMessage.mimetype !== 'image/gif';
  
  // Check if the extended text contains only emojis
  const containsOnlyEmojis = !/[^\uD800-\uDFFF]/.test(extendedText);
  
  if (typeof conversationText === "string" && conversationText.trim() !== "" && isNotGif) {
    body = conversationText;
  } else if (typeof extendedText === "string" && extendedText.trim() !== "" && isNotGif && !containsOnlyEmojis) {
    body = extendedText;
  } else {
    console.log("Neither conversation nor extendedText has a valid string or is a GIF or contains only emojis.");
    return;
  }
  

  let tel = from.slice(3, from.length).replace("@s.whatsapp.net", "");

  if(tel == "tus@broadcast"){
    return;
  }

  // Comparación insensible a mayúsculas/acentos para que "Saldo", "ESTADO DE CUENTA"
  // o el botón de respuesta rápida de la plantilla disparen la función correcta.
  // Se conserva `body` original porque handleExistencia extrae de él el código del modelo.
  const bodyLower = (body || "").toLowerCase();

  // "estado de cuenta" debe tener prioridad sobre "saldo"/menú: si coincide, se atiende y se sale.
  if (bodyLower.includes("estado de cuenta")) {
    await handleEstadoCuenta(from, body);
    return;
  }
  if (bodyLower.includes("saldo")) {
    await handleSaldo(from, body);
    return;
  }
  if (bodyLower.includes("existencia")) {
    await handleExistencia(from, body);
    return;
  }
  if (bodyLower.includes("inventario")) {
    await handleInventario(from, body);
    return;
  }
  if (bodyLower.includes("disponible")) {
    await handleDisponible(from, body);
    return;
  }
  if (bodyLower.includes("corte")) {
    await handleCorte(from, body);
    return;
  }

  // Cualquier otro texto (incluido "hola") muestra el menú de bienvenida.
  await handleBienvenido(from, body);

  return;
  // }


}


module.exports = {
  handleMessage: async (client, message) => {
    const from = message.from;
    const body = message.body.toLowerCase();
    if (body.includes("hola")) {
      handleBienvenido(client, from, body);
    }
    if (body.includes("saldo")) {
      handleSaldo(client, from, body);
    }
    if (body.includes("existencia")) {
      handleExistencia(client, from, body);
    }
    if (body.includes("inventario")) {
      handleInventario(client, from, body);
    }
    if (body.includes("disponible")) {
      handleDisponible(client, from, body);
    }
    if (body.includes("estado de cuenta")) {
      handleEstadoCuenta(client, from, body);
    }
    if (body.includes("corte")) {
      handleCorte(client, from, body);
    }
  },
};
