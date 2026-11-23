const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string(),
            clientes:Joi.string(),
            colaboradores:Joi.string(),
            empresas:Joi.string(),
            facturas:Joi.string(),
            observaciones: Joi.string(),

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
            subTotal: Joi.number(),
            iva: Joi.number(),
            total: Joi.number(),
            currency: Joi.string(),

            respuestaFacturamaCancel: Joi.array(),

            idFacturama: Joi.string(),
            respuestaFacturama: Joi.array(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            clientes:Joi.string(),
            colaboradores:Joi.string(),
            empresas:Joi.string(),
            facturas:Joi.string(),
            observaciones: Joi.string(),

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
            subTotal: Joi.number(),
            iva: Joi.number(),
            total: Joi.number(),
            currency: Joi.string(),

            respuestaFacturamaCancel: Joi.array(),
            
            idFacturama: Joi.string(),
            respuestaFacturama: Joi.array(),
        }),
    }),
};
