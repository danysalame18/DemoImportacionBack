const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            areaSalida: Joi.string().required(),
            areaDestino: Joi.string().required(),
            observaciones: Joi.string().required(),
            user: Joi.string().required(),
            total: Joi.number().required(),
            autorizadoApartado: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            areaSalida: Joi.string(),
            areaDestino: Joi.string(),
            observaciones: Joi.string(),
            user: Joi.string(),
            total: Joi.number(),
            salida: Joi.string(),
            autorizadoApartado: Joi.string(),
        }),
    }),
};
