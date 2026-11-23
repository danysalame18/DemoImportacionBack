const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            importe: Joi.number().required(),
            tipoCambio: Joi.number(),
            proveedores: Joi.string().required(),
            observaciones: Joi.string(),
            concepto: Joi.string(),
            bancos: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string(),
            importe: Joi.number(),
            tipoCambio: Joi.number(),
            proveedores: Joi.string(),
            observaciones: Joi.string(),
            concepto: Joi.string(),
            bancos: Joi.string(),
        }),
    }),
};
