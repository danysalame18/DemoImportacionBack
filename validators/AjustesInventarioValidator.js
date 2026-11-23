const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            areas: Joi.string().required(),
            observaciones: Joi.string().required(),
            user: Joi.string().required(),
            total: Joi.number().required(),
            autorizado: Joi.string().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string(),
            areas: Joi.string(),
            observaciones: Joi.string(),
            user: Joi.string(),
            total: Joi.number(),
            autorizado: Joi.string(),
            is_active: Joi.string()
        }),
    }),
};
