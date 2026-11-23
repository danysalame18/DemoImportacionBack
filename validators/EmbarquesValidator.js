const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fechaEmbarque: Joi.string().required(),
            fechaEstimada: Joi.string().required(),
            contenedor: Joi.string().required(),
            observaciones: Joi.string().required(),
            total_cantidad: Joi.number().required(),
            recibido: Joi.string().required(),
            total_costo: Joi.number().required(),
            total_gasto: Joi.number(),
            saldo: Joi.number().required(),
            creado: Joi.string(),
            brokers: Joi.string(),
            tipoCambioUSDMXN: Joi.number(),
            tipoCambioCNYUSD: Joi.number(),
            bultos: Joi.number().required(),
            noFactura: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fechaEmbarque: Joi.string(),
            fechaEstimada: Joi.string(),
            contenedor: Joi.string(),
            observaciones: Joi.string(),
            total_cantidad: Joi.number(),
            recibido: Joi.string(),
            total_costo: Joi.number(),
            total_gasto: Joi.number(),
            saldo: Joi.number(),
            creado: Joi.string(),
            brokers: Joi.string(),
            tipoCambioUSDMXN: Joi.number(),
            tipoCambioCNYUSD: Joi.number(),
            bultos: Joi.number(),
            noFactura: Joi.string(),
        }),
    }),
};
