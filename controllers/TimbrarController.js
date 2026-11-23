const {
  Series,
  Surtidos,
  Facturas,
  CompPago,
  PagosFacturas,
  ArticulosSurtidos,
  NotasCredito,
  DevolucionesFiscal,
  ArticulosDevolucionesFiscal,
  SurtidosAcumulados,
  Empresas,
  Clientes,
  Inventarios
} = require("../models");
const axios = require("axios");

// Deshace un complemento de pago que NO se pudo timbrar.
// El front registra el pago en cada factura (editPago) ANTES de timbrar; si el
// SAT lo rechaza, la factura se quedaba como pagada con saldo 0 y sin un
// complemento valido. Esto devuelve el saldo, desactiva los PagosFacturas y el
// complemento, para que se pueda capturar de nuevo.
const revertirCompPagoNoTimbrado = async (compId) => {
  const pagos = await PagosFacturas.find({ compPago: compId, is_active: "Si" });
  for (const p of pagos) {
    const idFactura = p.facturas?.[0]?._id || p.facturas?.[0];
    const monto = Number(p.AmountPaid) || 0;
    if (idFactura && monto) {
      await Facturas.findByIdAndUpdate(idFactura, {
        pagado: "No",
        $inc: { abonos: -monto, saldo: monto, numeroPagos: -1 },
      });
    }
    await PagosFacturas.findByIdAndUpdate(p._id, { is_active: "No" });
  }
  await CompPago.findByIdAndUpdate(compId, { is_active: "No" });
  return pagos.length;
};

// Mensaje legible del error de Facturama/SAT (viene en formatos distintos)
const mensajeFacturama = (data) => {
  if (!data) return "";
  if (typeof data === "string") return data;
  const partes = [];
  if (data.Message) partes.push(data.Message);
  if (data.ModelState) {
    Object.values(data.ModelState).forEach((v) =>
      partes.push(...(Array.isArray(v) ? v : [String(v)]))
    );
  }
  return partes.join(" | ") || JSON.stringify(data);
};

const TOKEN_CFDI = process.env.REACT_APP_TOKEN_CFDI;
const URL_FACTURAMA = process.env.REACT_APP_URL_FACTURAMA;

// async function actualiza() {

//   let fac = await Facturas.find({});

//   fac.map(async (a) => {
//     await Facturas.findByIdAndUpdate(a._id, { saldo: a.total, abonos: 0 });
//   })
// }

module.exports = {
// timbrarFactura: async (req, res) => {
//   const { body } = req;

//   const IVA_RATE = 0.16;
//   const DIV = 1 + IVA_RATE;

//   const n6 = (x) => Number((Number(x) || 0).toFixed(6));
//   const n2 = (x) => Number((Number(x) || 0).toFixed(2));
//   const isValidSAT = (x) => /^\d{8}$/.test(String(x || "").trim());
//   const onlyCode = (v) => String(v ?? "").trim().split(" ")[0]; // "02 Cheque..." -> "02"

//   try {
//     const IVAIncluido = body.IVAIncluido === "Si";

//     // 1) Factura
//     const fac = await Facturas.findById(body.facturas).populate("clientes");
//     if (!fac) return res.status(404).json({ message: "Factura no encontrada" });

//     // ✅ leer pago desde BODY (UI) y fallback a BD si no vino
//     const bodyFP = onlyCode(body.formaPagoSATCliente);
//     const bodyMP = onlyCode(body.metodoPagoSATCliente);

//     let paymentForm = bodyFP || onlyCode(fac.formaPagoSATCliente);
//     let paymentMethod = bodyMP || onlyCode(fac.metodoPagoSATCliente);

//     // ✅ REGLAS PARA FACTURAMA:
//     // - Si MetodoPago = PPD => FormaPago debe ser 99
//     // - Si FormaPago != 99 => MetodoPago debe ser PUE (ya está definido)
//     if (paymentMethod === "PPD") {
//       paymentForm = "99";
//     } else {
//       // quieres mandar 02/03/etc => debe ser PUE
//       if (paymentForm && paymentForm !== "99") paymentMethod = "PUE";
//     }

//     // console.log("💳 BODY RECIBIDO:", {
//     //   bodyFormaPagoSATCliente: body.formaPagoSATCliente,
//     //   bodyMetodoPagoSATCliente: body.metodoPagoSATCliente,
//     //   bodyFP,
//     //   bodyMP,
//     // });

//     // console.log("💳 PAGO FINAL:", {
//     //   facFormaPago: fac.formaPagoSATCliente,
//     //   facMetodo: fac.metodoPagoSATCliente,
//     //   paymentFormFinal: paymentForm,
//     //   paymentMethodFinal: paymentMethod,
//     // });

//     // 2) Surtidos + Artículos
//     const surtidos = await Surtidos.find({ facturas: body.facturas });
//     const idsSur = surtidos.map((a) => a._id);

//     const articulos = await ArticulosSurtidos.find({
//       surtidos: { $in: idsSur },
//       cantidad: { $gt: 0 },
//     })
//       .populate("articulos")
//       .populate("articulosPedido");

//     // 3) Items
//     const temp2 = articulos
//       .filter((a) => Number(a.articulosPedido?.[0]?.precio || 0) > 0)
//       .map((a) => ({
//         codigoSAT: a.articulos?.[0]?.codigoSAT,
//         codigo: a.articulos?.[0]?.codigo,
//         descripcion: `${a.articulos?.[0]?.codigo || "Sin código"} ${a.articulos?.[0]?.descripcion || ""}`.trim(),
//         idArticulo: a.articulos?.[0]?._id,
//         unidadFacturada: "PZ",
//         cantidadFacturada: Number(a.cantidad) || 0,
//         precio: Number(a.articulosPedido?.[0]?.precio || 0),
//       }))
//       .filter((a) => a.cantidadFacturada > 0);

//     if (temp2.length === 0) {
//       return res.status(400).json({
//         message: "No hay conceptos para timbrar (sin precio/cantidad válida).",
//       });
//     }

//     // 4) Validación SAT
//     const invalidSAT = temp2.filter((a) => !isValidSAT(a.codigoSAT));
//     if (invalidSAT.length) {
//       return res.status(400).json({
//         message: "Hay artículos con clave SAT inválida (debe ser 8 dígitos numéricos).",
//         invalidSAT: invalidSAT.map((a) => ({
//           codigo: a.codigo,
//           codigoSAT: a.codigoSAT,
//           descripcion: a.descripcion,
//           idArticulo: a.idArticulo,
//         })),
//       });
//     }

//     // 5) Descuento proporcional
//     const totalBruto = temp2.reduce((sum, a) => sum + a.cantidadFacturada * a.precio, 0);
//     const descuentoGlobal = Number(fac.descuentoNumero1 || 0);

//     // 6) Items Facturama
//     const dataArt = temp2.map((a) => {
//       const cantidad = a.cantidadFacturada;
//       const unitarioOriginal = Number(a.precio || 0);
//       const subtotalOriginal = cantidad * unitarioOriginal;

//       const descuentoProporcional =
//         totalBruto > 0 ? (subtotalOriginal / totalBruto) * descuentoGlobal : 0;

//       const subtotalDespuesDescuento = subtotalOriginal - descuentoProporcional;

//       const base = IVAIncluido ? (subtotalDespuesDescuento / DIV) : subtotalDespuesDescuento;

//       const base6 = n6(base);
//       const iva6 = n6(base6 * IVA_RATE);
//       const unit6 = n6(base6 / cantidad);
//       const total6 = n6(base6 + iva6);

//       return {
//         ProductCode: String(a.codigoSAT).trim(),
//         IdentificationNumber: a.codigo,
//         Description: a.descripcion,
//         Unit: a.unidadFacturada,
//         UnitCode: "PZ",
//         UnitPrice: unit6,
//         Quantity: cantidad,
//         Subtotal: base6,
//         TaxObject: "02",
//         Taxes: [
//           {
//             Total: iva6,
//             Name: "IVA",
//             Base: base6,
//             Rate: IVA_RATE,
//             IsRetention: false,
//           },
//         ],
//         Total: total6,
//       };
//     });

//     const debugItems = dataArt.map((it, idx) => ({
//       idx,
//       ProductCode: it.ProductCode,
//       IdentificationNumber: it.IdentificationNumber,
//       Description: it.Description,
//       UnitPrice: it.UnitPrice,
//       Quantity: it.Quantity,
//       Subtotal: it.Subtotal,
//       TaxTotal: it.Taxes?.[0]?.Total,
//       Total: it.Total,
//     }));

//     // 7) Observaciones
//     let observaciones = `Cantidad Total: ${fac.totalCantidad}`;
//     if (fac.observaciones && String(fac.observaciones).trim() !== "") {
//       observaciones += ` | Observaciones: ${fac.observaciones}`;
//     }
//     if (descuentoGlobal > 0) {
//       observaciones += ` | Descuento aplicado: $${n2(descuentoGlobal)}`;
//     }
//     if (observaciones.length > 400) observaciones = observaciones.slice(0, 400);

//     // 8) Payload
//     const payload = {
//       Folio: fac.folio,
//       Serie: fac.serie,
//       Currency: fac.currency,
//       ExpeditionPlace: fac.expeditionPlace,
//       PaymentConditions: fac.condicionesPagoSATCliente,
//       CfdiType: "I",
//       PaymentForm: paymentForm,
//       PaymentMethod: paymentMethod,
//       LogoUrl: `${process.env.REACT_APP_LINK_SISTEMA}logoInstitucion.png`,
//       Observations: observaciones,
//       Issuer: {
//         Rfc: fac.rfcEmpresa,
//         Name: fac.nombreEmpresa,
//         FiscalRegime: String(fac.regFiscalEmpresa),
//       },
//       Receiver: {
//         Rfc: fac.rfcCliente,
//         CfdiUse: fac.usoCFDICliente,
//         Name: fac.nombreCliente,
//         FiscalRegime: String(fac.regFiscalCliente),
//         TaxZipCode: fac.cpCliente,
//       },
//       Items: dataArt,
//     };

//     // console.log("🧾 Payload pago:", {
//     //   PaymentForm: payload.PaymentForm,
//     //   PaymentMethod: payload.PaymentMethod,
//     // });

//     // 9) Facturama
//     const respDB = await axios.post(`${URL_FACTURAMA}api-lite/3/cfdis`, payload, {
//       headers: { Authorization: `Basic ${TOKEN_CFDI}` },
//       validateStatus: () => true,
//       timeout: 30000,
//     });

//     if (respDB.status >= 400) {
//       const ms = respDB.data?.ModelState || {};
//       const badIdx = Object.keys(ms)
//         .map((k) => k.match(/items\[(\d+)\]/)?.[1])
//         .filter(Boolean)
//         .map((n) => Number(n));

//       // console.log("❌ Facturama HTTP error:", respDB.status, respDB.data);

//       return res.status(400).json({
//         message: "Facturama respondió error HTTP",
//         httpStatus: respDB.status,
//         facturama: respDB.data,
//         badItems: badIdx.map((i) => debugItems[i]).filter(Boolean),
//       });
//     }

//     if (respDB.data?.Status !== "active") {
//       return res.status(400).json({
//         message: "Facturama no timbró (Status != active)",
//         facturama: respDB.data,
//       });
//     }

//     // 10) Éxito
//     await Facturas.findByIdAndUpdate(fac._id, {
//       timbre: "Si",
//       respuestaFacturama: respDB.data,
//       idFacturama: respDB.data.Id,
//       folioFiscal: respDB.data.Complement?.TaxStamp?.Uuid,
//       fechaCertificacion: respDB.data.Complement?.TaxStamp?.Date,
//       selloDigital: respDB.data.Complement?.TaxStamp?.CfdiSign,
//       numeroSerieCertificadoSAT: respDB.data.Complement?.TaxStamp?.SatCertNumber,
//       cadenaSAT: respDB.data.OriginalString,
//       selloDigitalSAT: respDB.data.Complement?.TaxStamp?.SatSign,
//       rfcProvCertif: respDB.data.Complement?.TaxStamp?.RfcProvCertif,
//       status: respDB.data.Status,
//     });

//     await Series.updateMany({ serie: "TIMBRES" }, { $inc: { folio: -1 } });

//     const clienteId = fac?.clientes?.[0]?._id;
//     const facTotal = Number(fac.total || 0);
//     if (clienteId && facTotal > 0) {
//       await Clientes.findByIdAndUpdate(clienteId, {
//         $inc: { cargosk: facTotal, saldok: facTotal },
//       });
//     }

// await Surtidos.updateMany(
//   { facturas: fac._id },
//   { facturado: "Si", noFactura: `${fac.serie || ""}${fac.folio || ""}` }
// );

//     return res.status(200).json({
//       message: "Se timbró la factura",
//       IVAIncluido: body.IVAIncluido,
//       idFacturama: respDB.data.Id,
//       PaymentForm: payload.PaymentForm,
//       PaymentMethod: payload.PaymentMethod,
//     });
//   } catch (err) {
//     const debug = {
//       message: err?.message,
//       code: err?.code,
//       isAxiosError: !!err?.isAxiosError,
//       facturamaHttpStatus: err?.response?.status,
//       facturamaData: err?.response?.data,
//     };

//     // console.log("❌ Error al timbrar la factura:", debug);

//     try { await Facturas.findByIdAndUpdate(body.facturas, { timbre: "No" }); } catch {}
//     try { await Surtidos.updateMany({ facturas: body.facturas }, { facturado: "No" }); } catch {}

//     return res.status(400).json({
//       message: "Error al timbrar (catch)",
//       debug,
//     });
//   }
// },
timbrarFactura: async (req, res) => {
  const { body } = req;

  const IVA_RATE = 0.16;
  const DIV = 1 + IVA_RATE;

  const n6 = (x) => Number((Number(x) || 0).toFixed(6));
  const n2 = (x) => Number((Number(x) || 0).toFixed(2));
  const isValidSAT = (x) => /^\d{8}$/.test(String(x || "").trim());
  const onlyCode = (v) => String(v ?? "").trim().split(" ")[0]; // "02 Cheque..." -> "02"

  try {
    const IVAIncluido = body.IVAIncluido === "Si";

    // 1) Factura
    const fac = await Facturas.findById(body.facturas).populate("clientes");
    if (!fac) return res.status(404).json({ message: "Factura no encontrada" });

    // Todas las facturas usan la unidad SAT H87 (Pieza), la clave estandar
    // para piezas. Antes era "PZ" salvo para un cliente, y esa excepcion nunca
    // funciono por un error en el ID.
    const usarH87 = true;

    // ✅ leer pago desde BODY (UI) y fallback a BD si no vino
    const bodyFP = onlyCode(body.formaPagoSATCliente);
    const bodyMP = onlyCode(body.metodoPagoSATCliente);

    let paymentForm = bodyFP || onlyCode(fac.formaPagoSATCliente);
    let paymentMethod = bodyMP || onlyCode(fac.metodoPagoSATCliente);

    // ✅ REGLAS PARA FACTURAMA:
    // - Si MetodoPago = PPD => FormaPago debe ser 99
    // - Si FormaPago != 99 => MetodoPago debe ser PUE
    if (paymentMethod === "PPD") {
      paymentForm = "99";
    } else {
      // quieres mandar 02/03/etc => debe ser PUE
      if (paymentForm && paymentForm !== "99") paymentMethod = "PUE";
    }

    // 2) Surtidos + Artículos
    const surtidos = await Surtidos.find({ facturas: body.facturas });
    const idsSur = surtidos.map((a) => a._id);

    const articulos = await ArticulosSurtidos.find({
      surtidos: { $in: idsSur },
      cantidad: { $gt: 0 },
    })
      .populate("articulos")
      .populate("articulosPedido");

    // 3) Items
    const temp2 = articulos
      .filter((a) => Number(a.articulosPedido?.[0]?.precio || 0) > 0)
      .map((a) => ({
        codigoSAT: a.articulos?.[0]?.codigoSAT,
        codigo: a.articulos?.[0]?.codigo,
        ean: a.articulos?.[0]?.EAN,
        descripcion: `${a.articulos?.[0]?.codigo || "Sin código"} ${a.articulos?.[0]?.descripcion || ""}`.trim(),
        idArticulo: a.articulos?.[0]?._id,
        unidadFacturada: usarH87 ? "PIEZA" : "PZ",
        unitCode: usarH87 ? "H87" : "PZ",
        cantidadFacturada: Number(a.cantidad) || 0,
        precio: Number(a.articulosPedido?.[0]?.precio || 0),
      }))
      .filter((a) => a.cantidadFacturada > 0);

    if (temp2.length === 0) {
      return res.status(400).json({
        message: "No hay conceptos para timbrar (sin precio/cantidad válida).",
      });
    }

    // 4) Validación SAT
    const invalidSAT = temp2.filter((a) => !isValidSAT(a.codigoSAT));
    if (invalidSAT.length) {
      return res.status(400).json({
        message: "Hay artículos con clave SAT inválida (debe ser 8 dígitos numéricos).",
        invalidSAT: invalidSAT.map((a) => ({
          codigo: a.codigo,
          codigoSAT: a.codigoSAT,
          descripcion: a.descripcion,
          idArticulo: a.idArticulo,
        })),
      });
    }

    // 5) Descuento proporcional
    const totalBruto = temp2.reduce((sum, a) => sum + a.cantidadFacturada * a.precio, 0);
    const descuentoGlobal = Number(fac.descuentoNumero1 || 0);

    // 6) Items Facturama
    const dataArt = temp2.map((a) => {
      const cantidad = a.cantidadFacturada;
      const unitarioOriginal = Number(a.precio || 0);
      const subtotalOriginal = cantidad * unitarioOriginal;

      const descuentoProporcional =
        totalBruto > 0 ? (subtotalOriginal / totalBruto) * descuentoGlobal : 0;

      const subtotalDespuesDescuento = subtotalOriginal - descuentoProporcional;

      const base = IVAIncluido ? (subtotalDespuesDescuento / DIV) : subtotalDespuesDescuento;

      const base6 = n6(base);
      const iva6 = n6(base6 * IVA_RATE);
      const unit6 = n6(base6 / cantidad);
      const total6 = n6(base6 + iva6);

      return {
        ProductCode: String(a.codigoSAT).trim(),
        // EAN en su propia columna (No. Identificacion). El codigo interno
        // sigue al inicio de la descripcion. Si el articulo no tiene un EAN
        // valido (8, 12, 13 o 14 digitos) se usa el codigo como antes.
        IdentificationNumber: /^(\d{8}|\d{12,14})$/.test(String(a.ean || "").trim())
          ? String(a.ean).trim()
          : a.codigo,
        Description: a.descripcion,
        Unit: a.unidadFacturada,
        UnitCode: a.unitCode,
        UnitPrice: unit6,
        Quantity: cantidad,
        Subtotal: base6,
        TaxObject: "02",
        Taxes: [
          {
            Total: iva6,
            Name: "IVA",
            Base: base6,
            Rate: IVA_RATE,
            IsRetention: false,
          },
        ],
        Total: total6,
      };
    });

    const debugItems = dataArt.map((it, idx) => ({
      idx,
      ProductCode: it.ProductCode,
      IdentificationNumber: it.IdentificationNumber,
      Description: it.Description,
      Unit: it.Unit,
      UnitCode: it.UnitCode,
      UnitPrice: it.UnitPrice,
      Quantity: it.Quantity,
      Subtotal: it.Subtotal,
      TaxTotal: it.Taxes?.[0]?.Total,
      Total: it.Total,
    }));

    // 7) Observaciones
    let observaciones = `Cantidad Total: ${fac.totalCantidad}`;
    if (fac.observaciones && String(fac.observaciones).trim() !== "") {
      observaciones += ` | Observaciones: ${fac.observaciones}`;
    }
    if (descuentoGlobal > 0) {
      observaciones += ` | Descuento aplicado: $${n2(descuentoGlobal)}`;
    }
    if (observaciones.length > 400) observaciones = observaciones.slice(0, 400);

    // 8) Payload
    const payload = {
      Folio: fac.folio,
      Serie: fac.serie,
      Currency: fac.currency,
      ExpeditionPlace: fac.expeditionPlace,
      PaymentConditions: fac.condicionesPagoSATCliente,
      CfdiType: "I",
      PaymentForm: paymentForm,
      PaymentMethod: paymentMethod,
      LogoUrl: `${process.env.REACT_APP_LINK_SISTEMA}logoInstitucion.png`,
      Observations: observaciones,
      Issuer: {
        Rfc: fac.rfcEmpresa,
        Name: fac.nombreEmpresa,
        FiscalRegime: String(fac.regFiscalEmpresa),
      },
      Receiver: {
        Rfc: fac.rfcCliente,
        CfdiUse: fac.usoCFDICliente,
        Name: fac.nombreCliente,
        FiscalRegime: String(fac.regFiscalCliente),
        TaxZipCode: fac.cpCliente,
      },
      Items: dataArt,
    };

    // 9) Facturama
    const respDB = await axios.post(`${URL_FACTURAMA}api-lite/3/cfdis`, payload, {
      headers: { Authorization: `Basic ${TOKEN_CFDI}` },
      validateStatus: () => true,
      timeout: 30000,
    });

    if (respDB.status >= 400) {
      const ms = respDB.data?.ModelState || {};
      const badIdx = Object.keys(ms)
        .map((k) => k.match(/items\[(\d+)\]/)?.[1])
        .filter(Boolean)
        .map((n) => Number(n));

      return res.status(400).json({
        message: "Facturama respondió error HTTP",
        httpStatus: respDB.status,
        facturama: respDB.data,
        badItems: badIdx.map((i) => debugItems[i]).filter(Boolean),
      });
    }

    if (respDB.data?.Status !== "active") {
      return res.status(400).json({
        message: "Facturama no timbró (Status != active)",
        facturama: respDB.data,
      });
    }

    // 10) Éxito
    await Facturas.findByIdAndUpdate(fac._id, {
      timbre: "Si",
      respuestaFacturama: respDB.data,
      idFacturama: respDB.data.Id,
      folioFiscal: respDB.data.Complement?.TaxStamp?.Uuid,
      fechaCertificacion: respDB.data.Complement?.TaxStamp?.Date,
      selloDigital: respDB.data.Complement?.TaxStamp?.CfdiSign,
      numeroSerieCertificadoSAT: respDB.data.Complement?.TaxStamp?.SatCertNumber,
      cadenaSAT: respDB.data.OriginalString,
      selloDigitalSAT: respDB.data.Complement?.TaxStamp?.SatSign,
      rfcProvCertif: respDB.data.Complement?.TaxStamp?.RfcProvCertif,
      status: respDB.data.Status,
    });

    await Series.updateMany({ serie: "TIMBRES" }, { $inc: { folio: -1 } });

    const clienteIdUpdate = fac?.clientes?.[0]?._id;
    const facTotal = Number(fac.total || 0);
    if (clienteIdUpdate && facTotal > 0) {
      await Clientes.findByIdAndUpdate(clienteIdUpdate, {
        $inc: { cargosk: facTotal, saldok: facTotal },
      });
    }

    await Surtidos.updateMany(
      { facturas: fac._id },
      { facturado: "Si", noFactura: `${fac.serie || ""}${fac.folio || ""}` }
    );

    return res.status(200).json({
      message: "Se timbró la factura",
      IVAIncluido: body.IVAIncluido,
      idFacturama: respDB.data.Id,
      PaymentForm: payload.PaymentForm,
      PaymentMethod: payload.PaymentMethod,
    });
  } catch (err) {
    const debug = {
      message: err?.message,
      code: err?.code,
      isAxiosError: !!err?.isAxiosError,
      facturamaHttpStatus: err?.response?.status,
      facturamaData: err?.response?.data,
    };

    try {
      await Facturas.findByIdAndUpdate(body.facturas, { timbre: "No" });
    } catch {}

    try {
      await Surtidos.updateMany({ facturas: body.facturas }, { facturado: "No" });
    } catch {}

    return res.status(400).json({
      message: "Error al timbrar (catch)",
      debug,
    });
  }
},

 registrarEmpresa: async (req, res) => {
  const { body } = req;
  console.log("Enviando datos a Facturama:", body);

  const rfc = body.rfc.trim().toUpperCase();
  const payload = {
    Rfc: rfc,
    Certificate: body.certificado.replace(/\r?\n/g, ""),
    PrivateKey: body.privateKey.replace(/\r?\n/g, ""),
    PrivateKeyPassword: body.privateKeyPassword.trim(),
  };

  const config = {
    headers: {
      Authorization: `Basic ${TOKEN_CFDI}`,
      "Content-Type": "application/json",
    },
  };

  try {
    // 1) Intentar crear el CSD
    await axios.post(`${URL_FACTURAMA}api-lite/csds`, payload, config);

    // Si se creó sin problema, marcamos la empresa como lista para facturar
    await Empresas.findByIdAndUpdate(
      body.empresa,
      { listoFacturar: "Si" },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Se registró la empresa y CSD correctamente (POST)." });
  } catch (error) {
    const data = error.response?.data;
    console.error("Error al registrar empresa (POST):", data || error.message);

    const mensajeRfc =
      data?.ModelState?.Rfc?.[0] || data?.Message || "";

    // 2) Si ya existe un CSD para ese RFC, intentamos actualizarlo con PUT
    if (mensajeRfc.includes("Ya existe un CSD asociado a este RFC")) {
      try {
        await axios.put(
          `${URL_FACTURAMA}api-lite/csds/${rfc}`,
          payload,
          config
        );

        await Empresas.findByIdAndUpdate(
          body.empresa,
          { listoFacturar: "Si" },
          { new: true }
        );

        return res.status(200).json({
          message:
            "El CSD ya existía, se actualizó correctamente (PUT) y la empresa quedó lista para facturar.",
        });
      } catch (errorPut) {
        console.error(
          "Error al actualizar CSD (PUT):",
          errorPut.response?.data || errorPut.message
        );
        return res
          .status(400)
          .json(errorPut.response?.data || { error: "Error al actualizar CSD" });
      }
    }

    // 3) Si el error fue otra cosa, lo regresamos tal cual
    return res.status(400).json(data || { error: "Error desconocido" });
  }
},

  
  obtenerPDF: async (req, res) => {
    const { idFacturama } = req.params;

    await axios
      .get(`${URL_FACTURAMA}cfdi/pdf/issuedLite/${idFacturama}`, {
        headers: {
          Authorization: `Basic ${TOKEN_CFDI}`,
        },
      })
      .then((respDB) => {
        res.status(200).json({ respuesta: respDB.data });
        // console.log(respDB)
      })
      .catch((err) => {
        console.log(err);
        // Mensaje entendible: distingue falla de conexion con Facturama
        // (timeout / sin red) del rechazo del propio SAT/Facturama.
        const esRed =
          err?.code === "ETIMEDOUT" ||
          err?.code === "ECONNABORTED" ||
          err?.code === "ENOTFOUND" ||
          err?.code === "ECONNREFUSED";
        const mensaje = esRed
          ? "No se pudo conectar con Facturama (sin respuesta). Revisa la conexion a internet e intenta de nuevo. NO se cancelo el documento."
          : err?.response?.data?.Message ||
            err?.response?.data?.message ||
            "Error al cancelar en Facturama";
        res.status(400).json(mensaje);
      });
  },
  obtenerXML: async (req, res) => {
    const { idFacturama } = req.params;

    await axios
      .get(`${URL_FACTURAMA}cfdi/xml/issuedLite/${idFacturama}`, {
        headers: {
          Authorization: `Basic ${TOKEN_CFDI}`,
        },
      })
      .then((respDB) => {
        res.status(200).json({ respuesta: respDB.data });
        // console.log(respDB)
      })
      .catch((err) => {
        console.log(err);
        // Mensaje entendible: distingue falla de conexion con Facturama
        // (timeout / sin red) del rechazo del propio SAT/Facturama.
        const esRed =
          err?.code === "ETIMEDOUT" ||
          err?.code === "ECONNABORTED" ||
          err?.code === "ENOTFOUND" ||
          err?.code === "ECONNREFUSED";
        const mensaje = esRed
          ? "No se pudo conectar con Facturama (sin respuesta). Revisa la conexion a internet e intenta de nuevo. NO se cancelo el documento."
          : err?.response?.data?.Message ||
            err?.response?.data?.message ||
            "Error al cancelar en Facturama";
        res.status(400).json(mensaje);
      });
  },

  cancelFactura: async (req, res) => {
    const { id, idFacturama, motivo } = req.params;
    const { body } = req;

    await axios
      .delete(
        // `${URL_FACTURAMA}api-lite/cfdis/${idFacturama}?motive=${motivo}&uuidReplacement=null`, {
        `${URL_FACTURAMA}api-lite/cfdis/${idFacturama}?motive=02`,
        {
          headers: {
            Authorization: `Basic ${TOKEN_CFDI}`,
          },
          // Sin timeout la peticion se queda colgada varios minutos cuando
          // Facturama no responde, y el front nunca muestra el error.
          timeout: 60000,
        }
      )
      .then(async (respDB) => {
        const actTimbres = await Series.updateMany(
          { serie: "TIMBRES" },
          { $inc: { folio: -1 } },
          { new: true }
        );

        const actSaldoCliente = await Clientes.findByIdAndUpdate(
          body.clientes,
          { $inc: { cargosk: -body.total, saldok: -body.total } },
          { new: true }
        );

        let actFact = await Facturas.findByIdAndUpdate(
          id,
          {
            is_active: "No",
            respuestaFacturamaCancel: respDB.data,
            status: respDB.data.Status,
          },
          { new: true }
        );

        let surtido = await Surtidos.updateMany(
          { facturas: id },
          { facturado: "No" },
          { new: true }
        );
        let art = await ArticulosSurtidos.updateMany(
          { facturas: id },
          { facturado: "No" },
          { new: true }
        );

        res.status(200).json({ message: "Se cancelo la factura" });
      })
      .catch((err) => {
        console.log(err);
        // Mensaje entendible: distingue falla de conexion con Facturama
        // (timeout / sin red) del rechazo del propio SAT/Facturama.
        const esRed =
          err?.code === "ETIMEDOUT" ||
          err?.code === "ECONNABORTED" ||
          err?.code === "ENOTFOUND" ||
          err?.code === "ECONNREFUSED";
        const mensaje = esRed
          ? "No se pudo conectar con Facturama (sin respuesta). Revisa la conexion a internet e intenta de nuevo. NO se cancelo el documento."
          : err?.response?.data?.Message ||
            err?.response?.data?.message ||
            "Error al cancelar en Facturama";
        res.status(400).json(mensaje);
      });
  },

timbrarCompPago: async (req, res) => {
  const { body } = req;

  const round2 = (num) =>
    Math.round((Number(num || 0) + Number.EPSILON) * 100) / 100;

  const trunc6 = (num) =>
    Math.trunc(Number(num || 0) * 1000000) / 1000000;

  const toMicros = (num) =>
    Math.round(Number(num || 0) * 1000000);

  const fromMicros = (num) =>
    Number((Number(num || 0) / 1000000).toFixed(6));

  // Si el SAT ya timbro, NUNCA se revierte el pago aunque falle algo despues
  let timbrado = false;

  try {
    const comp = await CompPago.findById(body.compPago)
      .populate("clientes")
      .populate("cuentasClientes")
      .populate("cuentasEmpresas");

    if (!comp) {
      return res.status(404).json({
        message: "No se encontró el complemento de pago",
      });
    }

    const facturas = await PagosFacturas.find({
      compPago: body.compPago,
    }).populate("facturas");

    if (!facturas.length) {
      return res.status(400).json({
        message: "No hay facturas relacionadas al complemento",
      });
    }

    const dataFacs = facturas.map((a) => {
      const factura = a.facturas?.[0];

      const amountPaid = round2(a.AmountPaid);
      const porcentajeIVA = Number(factura?.impuestos ?? 16);
      const tasaIVA = porcentajeIVA / 100;

      const baseDR =
        tasaIVA > 0 ? amountPaid / (1 + tasaIVA) : amountPaid;

      const baseTrunc = trunc6(baseDR);
      const rateTrunc = trunc6(tasaIVA);
      const ivaTrunc = trunc6(baseTrunc * rateTrunc);

      return {
        TaxObject: "02",
        Uuid: factura.folioFiscal,
        PartialityNumber: Number(a.PartialityNumber || 1),
        Serie: factura.serie,
        Folio: String(factura.folio),
        Currency: factura.currency || "MXN",
        PaymentMethod: factura.metodoPagoSATCliente || "PPD",
        PreviousBalanceAmount: round2(a.PreviousBalanceAmount),
        AmountPaid: amountPaid,
        ImpSaldoInsoluto: round2(a.ImpSaldoInsoluto),
        Taxes: [
          {
            Name: "IVA",
            Base: baseTrunc,
            Rate: rateTrunc,
            Total: ivaTrunc,
            IsRetention: false,
          },
        ],
      };
    });

    const totalPagado = round2(
      facturas.reduce((sum, a) => sum + Number(a.AmountPaid || 0), 0)
    );

    const impuestosAgrupados = {};

    dataFacs.forEach((doc) => {
      doc.Taxes.forEach((tax) => {
        const key = `${tax.Name}_${tax.Rate}_${tax.IsRetention}`;

        if (!impuestosAgrupados[key]) {
          impuestosAgrupados[key] = {
            Name: tax.Name,
            BaseMicros: 0,
            Rate: tax.Rate,
            TotalMicros: 0,
            IsRetention: tax.IsRetention,
          };
        }

        impuestosAgrupados[key].BaseMicros += toMicros(tax.Base);
        impuestosAgrupados[key].TotalMicros += toMicros(tax.Total);
      });
    });

    const taxesPago = Object.values(impuestosAgrupados).map((tax) => ({
      Name: tax.Name,
      Base: fromMicros(tax.BaseMicros),
      Rate: tax.Rate,
      Total: fromMicros(tax.TotalMicros),
      IsRetention: tax.IsRetention,
    }));

    const payload = {
      CfdiType: "P",
      NameId: "14",
      Folio: `${comp.serie}-${comp.folio}`,
      ExpeditionPlace: String(comp.expeditionPlace),

      Issuer: {
        Rfc: comp.rfcEmpresa,
        Name: comp.nombreEmpresa,
        FiscalRegime: String(comp.regFiscalEmpresa),
      },

      Receiver: {
        Rfc: comp.clientes?.[0]?.RFC,
        Name: comp.clientes?.[0]?.razon_social,
        FiscalRegime: String(comp.clientes?.[0]?.regFiscal),
        TaxZipCode: String(comp.clientes?.[0]?.cp),
        CfdiUse: comp.cfdiUse || "CP01",
      },

      Complemento: {
        Payments: [
          {
            Date: comp.fecha,
            PaymentForm: comp.paymentForm,
            Amount: totalPagado,
            Currency: comp.currency || "MXN",

            RfcReceiverBeneficiaryAccount:
              comp.paymentForm === "03"
                ? comp.cuentasEmpresas?.[0]?.rfc
                : undefined,

            BeneficiaryAccount:
              comp.paymentForm === "03"
                ? comp.cuentasEmpresas?.[0]?.cuenta
                : undefined,

            RelatedDocuments: dataFacs,
            Taxes: taxesPago,
          },
        ],
      },
    };

    console.log("Payload complemento pago:", JSON.stringify(payload, null, 2));

    const respDB = await axios.post(
      `${URL_FACTURAMA}api-lite/3/cfdis`,
      payload,
      {
        headers: {
          Authorization: `Basic ${TOKEN_CFDI}`,
        },
      }
    );

    if (respDB.data.Status === "active") {
      timbrado = true;

      await Series.updateMany(
        { serie: "TIMBRES" },
        { $inc: { folio: -1 } }
      );

      await Clientes.findByIdAndUpdate(
        comp.clientes[0]._id,
        {
          $inc: {
            abonosk: totalPagado,
            saldok: -totalPagado,
          },
        },
        { new: true }
      );

      await CompPago.findByIdAndUpdate(
        comp._id,
        {
          timbre: "Si",
          respuestaFacturama: respDB.data,
          idFacturama: respDB.data.Id,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "Se timbró el complemento",
        data: respDB.data,
      });
    }

    const revertidas = await revertirCompPagoNoTimbrado(body.compPago);
    return res.status(400).json({
      message: `Facturama no timbró el complemento. Se revirtió el pago de ${revertidas} factura(s); puedes capturarlo de nuevo.`,
      data: respDB.data,
    });
  } catch (err) {
    console.log("Error timbrarCompPago:", err?.response?.data || err);

    if (timbrado) {
      // Ya hay CFDI valido en el SAT: no se toca el pago
      return res.status(500).json({
        message: "El complemento SI se timbró, pero falló un paso posterior. No se revirtió nada; revisa el complemento.",
        error: err.message,
      });
    }

    let revertidas = 0;
    try {
      revertidas = await revertirCompPagoNoTimbrado(body.compPago);
    } catch (e) {
      console.log("Error revirtiendo complemento:", e);
    }

    const motivo = mensajeFacturama(err?.response?.data) || err.message;
    return res.status(400).json({
      message: `No se timbró el complemento: ${motivo}. Se revirtió el pago de ${revertidas} factura(s); puedes capturarlo de nuevo.`,
      error: err?.response?.data || err.message,
    });
  }
},

  cancelCompPago: async (req, res) => {
    const { id, idFacturama, motivo } = req.params;
    const { body } = req;

    await axios
      .delete(
        // `${URL_FACTURAMA}api-lite/cfdis/${idFacturama}?motive=${motivo}&uuidReplacement=null`, {
        `${URL_FACTURAMA}api-lite/cfdis/${idFacturama}?motive=02`,
        {
          headers: {
            Authorization: `Basic ${TOKEN_CFDI}`,
          },
          // Sin timeout la peticion se queda colgada varios minutos cuando
          // Facturama no responde, y el front nunca muestra el error.
          timeout: 60000,
        }
      )
      .then(async (respDB) => {
        const actTimbres = await Series.updateMany(
          { serie: "TIMBRES" },
          { $inc: { folio: -1 } },
          { new: true }
        );
        const actSaldoCliente = await Clientes.findByIdAndUpdate(
          body.clientes,
          { $inc: { abonosk: -body.total, saldok: body.total } },
          { new: true }
        );

        let actComp = await CompPago.findByIdAndUpdate(
          id,
          { is_active: "No", respuestaFacturamaCancel: respDB.data },
          { new: true }
        );

        let p = await PagosFacturas.find({ compPago: id });

        p.map(async (a) => {
          await PagosFacturas.findByIdAndUpdate(
            a._id,
            { is_active: "No" },
            { new: true }
          );
          await Facturas.findByIdAndUpdate(
            a.facturas,
            {
              pagado: "No",
              $inc: {
                abonos: -a.AmountPaid,
                saldo: a.AmountPaid,
                numeroPagos: -1,
              },
            },
            { new: true }
          );
        });

        res.status(200).json({ message: "Se cancelo la factura" });
      })
      .catch((err) => {
        console.log(err);
        // Mensaje entendible: distingue falla de conexion con Facturama
        // (timeout / sin red) del rechazo del propio SAT/Facturama.
        const esRed =
          err?.code === "ETIMEDOUT" ||
          err?.code === "ECONNABORTED" ||
          err?.code === "ENOTFOUND" ||
          err?.code === "ECONNREFUSED";
        const mensaje = esRed
          ? "No se pudo conectar con Facturama (sin respuesta). Revisa la conexion a internet e intenta de nuevo. NO se cancelo el documento."
          : err?.response?.data?.Message ||
            err?.response?.data?.message ||
            "Error al cancelar en Facturama";
        res.status(400).json(mensaje);
      });
  },
timbrarNotaCredito: async (req, res) => {
  const { body } = req;

  try {
    const nc = await NotasCredito.findById(body.notasCredito)
      .populate("clientes")
      .populate("facturas")
      .populate({ path: "facturasDetalle.factura" });

    if (!nc) {
      return res.status(404).json({
        message: "Nota de crédito no encontrada",
      });
    }

    const toNum = (v) => {
      const n = Number(String(v ?? "").replace(/,/g, "").trim());
      return Number.isFinite(n) ? n : 0;
    };

    const round2 = (n) => {
      const x = Number(n);
      return Number.isFinite(x) ? Number(x.toFixed(2)) : 0;
    };

    const round6 = (n) => {
      const x = Number(n);
      return Number.isFinite(x) ? Number(x.toFixed(6)) : 0;
    };

    const cliente = Array.isArray(nc.clientes) ? nc.clientes[0] : nc.clientes;

    if (!cliente) {
      return res.status(400).json({
        message: "La nota de crédito no tiene cliente asignado.",
      });
    }

    if (!cliente.RFC || !cliente.razon_social || !cliente.regFiscal || !cliente.cp) {
      return res.status(400).json({
        message: "Faltan datos fiscales del cliente.",
        cliente: {
          RFC: cliente.RFC,
          razon_social: cliente.razon_social,
          regFiscal: cliente.regFiscal,
          cp: cliente.cp,
        },
      });
    }

    const facturasRelacionadas = Array.isArray(nc.facturas) ? nc.facturas : [];

    if (!facturasRelacionadas.length) {
      return res.status(400).json({
        message: "La nota de crédito no tiene facturas relacionadas.",
      });
    }

    const facturasSinUuid = facturasRelacionadas.filter((f) => !f?.folioFiscal);

    if (facturasSinUuid.length) {
      return res.status(400).json({
        message: "No se puede timbrar: hay facturas relacionadas sin folioFiscal.",
        facturasSinUuid: facturasSinUuid.map((f) => ({
          id: f?._id,
          folio: f?.folio,
          serie: f?.serie,
        })),
      });
    }

    const cfdisRel = facturasRelacionadas.map((f) => ({
      Uuid: f.folioFiscal,
    }));

    if (!Array.isArray(nc.facturasDetalle) || !nc.facturasDetalle.length) {
      return res.status(400).json({
        message: "La nota de crédito no tiene facturasDetalle.",
      });
    }

    const detalleValido = nc.facturasDetalle.filter((d) => {
      const idFactura = d?.factura?._id || d?.factura;
      const monto = toNum(d?.monto);
      return idFactura && monto > 0;
    });

    if (!detalleValido.length) {
      return res.status(400).json({
        message: "La nota de crédito no tiene montos válidos.",
      });
    }

    const idsFacturasRelacionadas = new Set(
      facturasRelacionadas.map((f) => String(f?._id))
    );

    const detalleConFacturaInvalida = detalleValido.filter((d) => {
      const idFactura = String(d?.factura?._id || d?.factura || "");
      return !idsFacturasRelacionadas.has(idFactura);
    });

    if (detalleConFacturaInvalida.length) {
      return res.status(400).json({
        message:
          "Hay registros en facturasDetalle que no pertenecen a las facturas relacionadas.",
      });
    }

    const formaPagoNC = String(nc.paymentForm || "").trim();

    if (!formaPagoNC) {
      return res.status(400).json({
        message: "La nota de crédito no tiene forma de pago seleccionada.",
      });
    }

    const totalIngresado = round6(
      detalleValido.reduce((acc, d) => acc + toNum(d.monto), 0)
    );

    if (totalIngresado <= 0) {
      return res.status(400).json({
        message: "La nota de crédito no tiene total válido.",
      });
    }

    // ✅ CÁLCULO CORRECTO PARA CFDI
    const sub6 = round6(totalIngresado / 1.16);
    const iva6 = round6(sub6 * 0.16);
    const tot6 = round6(sub6 + iva6);

    if (!nc.rfcEmpresa || !nc.nombreEmpresa || !nc.regFiscalEmpresa || !nc.expeditionPlace) {
      return res.status(400).json({
        message: "Faltan datos fiscales del emisor.",
        emisor: {
          rfcEmpresa: nc.rfcEmpresa,
          nombreEmpresa: nc.nombreEmpresa,
          regFiscalEmpresa: nc.regFiscalEmpresa,
          expeditionPlace: nc.expeditionPlace,
        },
      });
    }

    const payload = {
      CfdiType: "E",
      NameId: "2",
      Folio: `${nc.serie}-${nc.folio}`,
      ExpeditionPlace: String(nc.expeditionPlace || "").trim(),
      PaymentForm: formaPagoNC,
      PaymentMethod: String(nc.paymentMethod || "PUE").trim(),
      Currency: String(nc.currency || "MXN").trim(),
      Observations: (nc.observaciones || "NOTA DE CREDITO").slice(0, 999),

      Issuer: {
        Rfc: String(nc.rfcEmpresa || "").trim(),
        Name: String(nc.nombreEmpresa || "").trim(),
        FiscalRegime: String(nc.regFiscalEmpresa || "").trim(),
      },

      Receiver: {
        Rfc: String(cliente.RFC || "").trim(),
        Name: String(cliente.razon_social || "").trim(),
        FiscalRegime: String(cliente.regFiscal || "").trim(),
        TaxZipCode: String(cliente.cp || "").trim(),
        CfdiUse: String(nc.cfdiUse || "G02").trim(),
      },

      Relations: {
        Type: "01",
        Cfdis: cfdisRel,
      },

      Items: [
        {
          Quantity: 1,
          ProductCode: "84111506",
          UnitCode: "ACT",
          Unit: "Actividad",
          Description: (nc.observaciones || "NOTA DE CREDITO").slice(0, 999),
          UnitPrice: sub6,
          Subtotal: sub6,
          Discount: 0,
          TaxObject: "02",
          Taxes: [
            {
              Name: "IVA",
              Rate: 0.16,
              Base: sub6,
              Total: iva6,
              IsRetention: false,
              IsFederalTax: true,
            },
          ],
          Total: tot6,
        },
      ],
    };

    console.log("Payload Facturama NC =>", JSON.stringify(payload, null, 2));

    const respDB = await axios.post(
      `${URL_FACTURAMA}api-lite/3/cfdis`,
      payload,
      {
        headers: {
          Authorization: `Basic ${TOKEN_CFDI}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (respDB?.data?.Status !== "active") {
      return res.status(400).json({
        message: "No se timbró la nota de crédito",
        respuesta: respDB?.data,
      });
    }

    await Promise.all(
      detalleValido.map(async (d) => {
        const idFactura = d?.factura?._id || d?.factura;
        const monto = round2(toNum(d?.monto));

        if (!idFactura || monto <= 0) return;

        const fac = await Facturas.findById(idFactura);
        if (!fac) return;

        const saldoActual = round2(toNum(fac.saldo));
        const saldoNuevo = round2(saldoActual - monto);
        const pagado = saldoNuevo <= 0 ? "Si" : "No";

        await Facturas.findByIdAndUpdate(
          idFactura,
          {
            pagado,
            $inc: {
              abonos: monto,
              saldo: -monto,
              numeroPagos: 1,
            },
          },
          { new: true }
        );
      })
    );

    await Series.updateMany(
      { serie: "TIMBRES" },
      { $inc: { folio: -1 } }
    );

    await Clientes.findByIdAndUpdate(
      cliente._id,
      {
        $inc: {
          abonosk: round2(tot6),
          saldok: -round2(tot6),
        },
      },
      { new: true }
    );

    const ncActualizada = await NotasCredito.findByIdAndUpdate(
      nc._id,
      {
        timbre: "Si",
        respuestaFacturama: respDB.data,
        idFacturama: respDB.data.Id,
        paymentForm: formaPagoNC,
        paymentMethod: "PUE",
        subTotal: sub6,
        iva: iva6,
        total: tot6,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Se timbró la nota de crédito",
      notaCredito: ncActualizada,
      respuestaFacturama: respDB.data,
    });
  } catch (err) {
    console.log("Error timbrarNotaCredito =>", err?.response?.data || err);

    return res.status(400).json({
      message: "Error al timbrar la nota de crédito",
      error: err?.response?.data || err?.message || err,
    });
  }
},
cancelNotaCredito: async (req, res) => {
  const { id, idFacturama, motivo } = req.params;
  const { body } = req;

  try {
    const respDB = await axios.delete(
      `${URL_FACTURAMA}api-lite/cfdis/${idFacturama}?motive=${motivo || "02"}`,
      {
        headers: {
          Authorization: `Basic ${TOKEN_CFDI}`,
        },
      }
    );

    const nota = await NotasCredito.findById(id);

    if (!nota) {
      return res.status(404).json({ message: "No se encontró la nota de crédito" });
    }

    if (nota.is_active === "No") {
      return res.status(400).json({ message: "Esta nota de crédito ya está cancelada" });
    }

    const totalNota = Number(nota.total || body.total || 0);

    await Series.updateMany(
      { serie: "TIMBRES" },
      { $inc: { folio: -1 } }
    );

    await Clientes.findByIdAndUpdate(
      body.clientes || nota.clientes?.[0],
      {
        $inc: {
          abonosk: -totalNota,
          saldok: totalNota,
        },
      },
      { new: true }
    );

    await NotasCredito.findByIdAndUpdate(
      id,
      {
        is_active: "No",
        respuestaFacturamaCancel: respDB.data,
      },
      { new: true }
    );

    const detalles = Array.isArray(nota.facturasDetalle)
      ? nota.facturasDetalle
      : [];

    if (detalles.length > 0) {
      const operacionesFacturas = detalles
        .filter((det) => det.factura && Number(det.monto || 0) > 0)
        .map((det) => ({
          updateOne: {
            filter: { _id: det.factura },
            update: {
              pagado: "No",
              $inc: {
                abonos: -Number(det.monto || 0),
                saldo: Number(det.monto || 0),
                numeroPagos: -1,
              },
            },
          },
        }));

      if (operacionesFacturas.length > 0) {
        await Facturas.bulkWrite(operacionesFacturas);
      }
    } else {
      await Facturas.updateMany(
        { _id: { $in: nota.facturas || [] } },
        {
          pagado: "No",
          $inc: {
            abonos: -totalNota,
            saldo: totalNota,
            numeroPagos: -1,
          },
        }
      );
    }

    res.status(200).json({
      message: "Se canceló la nota de crédito y se ajustaron las facturas",
    });
  } catch (err) {
    console.log("Error cancelNotaCredito:", err?.response?.data || err);
    res.status(400).json(err?.response?.data || err);
  }
},

  timbrarDevolucionesFiscal: async (req, res) => {
    const { body } = req;

    const df = await DevolucionesFiscal.findById(body.devolucionesFiscal)
      .populate("clientes")
      .populate("facturas");

    let artsSur = await ArticulosDevolucionesFiscal.find({
      devolucionesFiscal: body.devolucionesFiscal,
    })
      .populate("articulos")

    const arts = artsSur.map((a) => {
      let u = "";
      if (a.unidad == "Metros") {
        u = "MTR";
      } else {
        u = "KGM";
      }
      return {
        Quantity: a.cantidad,
        ProductCode: a.articulos[0].codigoSAT,
        Unit: a.unidad,
        UnitCode: u,
        Description: a.articulos[0].nombre,
        UnitPrice: a.precio,
        Subtotal: (a.cantidad * a.precio).toFixed(6),
        TaxObject: "02",
        Taxes: [
          {
            Name: "IVA",
            Rate: "0.16",
            Total: (a.cantidad * a.precio * 0.16).toFixed(6),
            Base: (a.cantidad * a.precio).toFixed(6),
            IsRetention: "false",
            IsFederalTax: "true",
          },
        ],
        Total: (a.cantidad * a.precio * 1.16).toFixed(6),
      };
    });
    dataArt = Object.values(arts);

    axios
      .post(
        `${URL_FACTURAMA}api-lite/3/cfdis`,
        {
          CfdiType: "E",
          NameId: "2",
          Folio: df.serie + "-" + df.folio,
          ExpeditionPlace: df.expeditionPlace,
          PaymentForm: df.paymentForm,
          PaymentMethod: "PUE",
          Issuer: {
            Rfc: df.rfcEmpresa,
            Name: df.nombreEmpresa,
            FiscalRegime: df.regFiscalEmpresa,
          },
          Receiver: {
            Rfc: df.clientes[0].RFC,
            Name: df.clientes[0].razon_social,
            FiscalRegime: df.clientes[0].regFiscal,
            TaxZipCode: df.clientes[0].cp,
            CfdiUse: df.cfdiUse,
          },
          Relations: {
            Type: "01",
            Cfdis: [
              {
                Uuid: df.facturas[0].folioFiscal,
              },
            ],
          },
          Items: dataArt,
        },
        {
          headers: {
            Authorization: `Basic ${TOKEN_CFDI}`,
          },
        }
      )
      .then(async (respDB) => {
        if (respDB.data.Status == "active") {
          let pagado;
          let a = await Facturas.findById(df.facturas[0]._id);

          if (a.saldo - df.total > 0) {
            pagado = "No";
          } else {
            pagado = "Si";
          }

          let fa = await Facturas.findByIdAndUpdate(
            df.facturas[0]._id,
            {
              pagado: pagado,
              $inc: { abonos: df.total, saldo: -df.total, numeroPagos: 1 },
            },
            { new: true }
          );

          const actTimbres = await Series.updateMany(
            { serie: "TIMBRES" },
            { $inc: { folio: -1 } },
            { new: true }
          );
          const actSaldoCliente = await Clientes.findByIdAndUpdate(
            df.clientes[0]._id,
            { $inc: { abonosk: df.total, saldok: -df.total } },
            { new: true }
          );

// for (const art of artsSur) {
//   await Inventarios.findOneAndUpdate(
//     { areas: [art.areas], articulos: [art.articulos] },
//     { $inc: { cantidad: art.cantidad }, is_active: "Si" },
//     { new: true, upsert: true }
//   );
// }

          let actDF = await DevolucionesFiscal.findByIdAndUpdate(
            df._id,
            {
              timbre: "Si",
              respuestaFacturama: respDB.data,
              idFacturama: respDB.data.Id,
            },
            { new: true }
          );
          res.status(200).json({ message: "Se timbro la devolucion" });
        } else {
          res.status(400).json({ message: "No se timbro la devolucion" });
        }
      })
      .catch((err) => {
        console.log(err);
        // Mensaje entendible: distingue falla de conexion con Facturama
        // (timeout / sin red) del rechazo del propio SAT/Facturama.
        const esRed =
          err?.code === "ETIMEDOUT" ||
          err?.code === "ECONNABORTED" ||
          err?.code === "ENOTFOUND" ||
          err?.code === "ECONNREFUSED";
        const mensaje = esRed
          ? "No se pudo conectar con Facturama (sin respuesta). Revisa la conexion a internet e intenta de nuevo. NO se cancelo el documento."
          : err?.response?.data?.Message ||
            err?.response?.data?.message ||
            "Error al cancelar en Facturama";
        res.status(400).json(mensaje);
      });
  },
  cancelDevolucionFiscal: async (req, res) => {
    const { id, idFacturama, motivo } = req.params;
    const { body } = req;

    await axios
      .delete(
        // `${URL_FACTURAMA}api-lite/cfdis/${idFacturama}?motive=${motivo}&uuidReplacement=null`, {
        `${URL_FACTURAMA}api-lite/cfdis/${idFacturama}?motive=02`,
        {
          headers: {
            Authorization: `Basic ${TOKEN_CFDI}`,
          },
          // Sin timeout la peticion se queda colgada varios minutos cuando
          // Facturama no responde, y el front nunca muestra el error.
          timeout: 60000,
        }
      )
      .then(async (respDB) => {
        const actTimbres = await Series.updateMany(
          { serie: "TIMBRES" },
          { $inc: { folio: -1 } },
          { new: true }
        );
        const actSaldoCliente = await Clientes.findByIdAndUpdate(
          body.clientes,
          { $inc: { abonosk: -body.total, saldok: body.total } },
          { new: true }
        );

        let actComp = await DevolucionesFiscal.findByIdAndUpdate(
          id,
          { is_active: "No", respuestaFacturamaCancel: respDB.data },
          { new: true }
        );

        let a = await DevolucionesFiscal.findById(id);
        await Facturas.findByIdAndUpdate(
          a.facturas,
          {
            pagado: "No",
            $inc: { abonos: -a.total, saldo: a.total, numeroPagos: -1 },
          },
          { new: true }
        );

        res.status(200).json({ message: "Se cancelo la factura" });
      })
      .catch((err) => {
        console.log(err);
        // Mensaje entendible: distingue falla de conexion con Facturama
        // (timeout / sin red) del rechazo del propio SAT/Facturama.
        const esRed =
          err?.code === "ETIMEDOUT" ||
          err?.code === "ECONNABORTED" ||
          err?.code === "ENOTFOUND" ||
          err?.code === "ECONNREFUSED";
        const mensaje = esRed
          ? "No se pudo conectar con Facturama (sin respuesta). Revisa la conexion a internet e intenta de nuevo. NO se cancelo el documento."
          : err?.response?.data?.Message ||
            err?.response?.data?.message ||
            "Error al cancelar en Facturama";
        res.status(400).json(mensaje);
      });
  },
};
