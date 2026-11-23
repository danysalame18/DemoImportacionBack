const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            subtotal: Joi.number().required(),
            iva: Joi.number().required(),
            total: Joi.number().required(),
            descripcion: Joi.string().required(),
            concepto: Joi.string().required(),
            conceptosGastosTiendas: Joi.string(),
            areas: Joi.string().required(),
            bancos: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string(),
            subtotal: Joi.number(),
            iva: Joi.number(),
            total: Joi.number(),
            descripcion: Joi.string(),
            concepto: Joi.string(),
            conceptosGastosTiendas: Joi.string(),
            areas: Joi.string(),
            bancos: Joi.string(),
            fotoEvidencia: Joi.string(),
        }),
    }),
};
