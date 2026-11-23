const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            tipo: Joi.string().required(),
            detalle: Joi.string().required(),
            user: Joi.string().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            tipo: Joi.string(),
            detalle: Joi.string(),
            user: Joi.string(),
        }),
    }),
};
