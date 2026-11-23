const { celebrate, Joi, Segments } = require("celebrate");

module.exports = {
  create: celebrate({
    [Segments.BODY]: Joi.object()
      .keys({
        fecha: Joi.string(),
        clientes: Joi.alternatives().try(
          Joi.string(),
          Joi.array().items(Joi.string())
        ),
        colaboradores: Joi.alternatives().try(
          Joi.string(),
          Joi.array().items(Joi.string())
        ),
        empresas: Joi.alternatives().try(
          Joi.string(),
          Joi.array().items(Joi.string())
        ),

        // ✅ AHORA VARIAS FACTURAS
        facturas: Joi.array().items(Joi.string()).min(1),

        // ✅ RECOMENDADO: monto por factura (para descontar bien saldos)
    facturasDetalle: Joi.array().items(
  Joi.object({
    factura: Joi.string().required(),
    monto: Joi.number().positive().required(),
  })
),


        observaciones: Joi.string().allow(""),

        timbre: Joi.string(),
        cfdiType: Joi.string(),

        serie: Joi.string(),
        folio: Joi.number(),
        expeditionPlace: Joi.string(),

        rfcEmpresa: Joi.string(),
        nombreEmpresa: Joi.string(),
        regFiscalEmpresa: Joi.string(),
        cfdiUse: Joi.string(),

        paymentForm: Joi.string(),
        paymentMethod: Joi.string(),
        subTotal: Joi.number(),
        iva: Joi.number(),
        total: Joi.number(),
        currency: Joi.string(),

        respuestaFacturamaCancel: Joi.array(),

        idFacturama: Joi.string(),
        respuestaFacturama: Joi.array(),
      })
      .unknown(true),
  }),

  edit: celebrate({
    [Segments.BODY]: Joi.object()
      .keys({
        is_active: Joi.string(),
        fecha: Joi.string(),
        clientes: Joi.alternatives().try(
          Joi.string(),
          Joi.array().items(Joi.string())
        ),
        colaboradores: Joi.alternatives().try(
          Joi.string(),
          Joi.array().items(Joi.string())
        ),
        empresas: Joi.alternatives().try(
          Joi.string(),
          Joi.array().items(Joi.string())
        ),

        // ✅ AHORA VARIAS FACTURAS
        facturas: Joi.array().items(Joi.string()).min(1),

        // ✅ RECOMENDADO
facturasDetalle: Joi.array().items(
  Joi.object({
    factura: Joi.string().required(),
    monto: Joi.number().positive().required(),
  })
),


        observaciones: Joi.string().allow(""),

        timbre: Joi.string(),
        cfdiType: Joi.string(),

        serie: Joi.string(),
        folio: Joi.number(),
        expeditionPlace: Joi.string(),

        rfcEmpresa: Joi.string(),
        nombreEmpresa: Joi.string(),
        regFiscalEmpresa: Joi.string(),
        cfdiUse: Joi.string(),

        paymentForm: Joi.string(),
        paymentMethod: Joi.string(),
        subTotal: Joi.number(),
        iva: Joi.number(),
        total: Joi.number(),
        currency: Joi.string(),

        respuestaFacturamaCancel: Joi.array(),

        idFacturama: Joi.string(),
        respuestaFacturama: Joi.array(),
      })
      .unknown(true),
  }),
};
