const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            traspasosSalida: Joi.string().required(),
            observaciones: Joi.string().required(),
            user: Joi.string().required(),
            total: Joi.number().required()
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            traspasosSalida: Joi.string(),
            observaciones: Joi.string(),
            user: Joi.string(),
            total: Joi.number()
        }),
    }),
};
