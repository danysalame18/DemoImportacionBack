const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            bancoOrigen: Joi.string().required(),
            bancoDestino: Joi.string().required(),
            importe: Joi.number().required(),
            fecha: Joi.string().required(),
            user: Joi.string().required(),
            monedaOrigen: Joi.string().required(),
            monedaDestino: Joi.string().required(),
            tipoCambio: Joi.number().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            bancoOrigen: Joi.string(),
            bancoDestino: Joi.string(),
            importe: Joi.number(),
            fecha: Joi.string(),
            user: Joi.string(),
            monedaOrigen: Joi.string(),
            monedaDestino: Joi.string(),
            tipoCambio: Joi.number(),
        }),
    }),
};
