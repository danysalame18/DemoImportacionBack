const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            concepto: Joi.string().required(),
            estimado: Joi.number().required(),
            fijo: Joi.string().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            concepto: Joi.string(),
            estimado: Joi.number(),
            fijo: Joi.string()
        }),
    }),
};
