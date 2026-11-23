const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            areas: Joi.string().required(),
            clientes: Joi.string().required(),
            observaciones: Joi.string().required(),
            user: Joi.string().required(),
            total: Joi.number().required()
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string(),
            areas: Joi.string(),
            clientes: Joi.string(),
            observaciones: Joi.string(),
            user: Joi.string(),
            total: Joi.number(),
        }),
    }),
};
