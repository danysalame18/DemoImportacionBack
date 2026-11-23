const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            name: Joi.string().required(),
            telefono: Joi.number().required(),
            tipo: Joi.string().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            name: Joi.string(),
            telefono: Joi.number(),
            tipo: Joi.string(),
        }),
    }),
};
