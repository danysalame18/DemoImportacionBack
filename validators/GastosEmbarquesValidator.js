const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            conceptosGastosEmbarques: Joi.string().required(),
            embarques: Joi.string().required(),
            real: Joi.number().required(),
            estimado: Joi.number().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            conceptosGastosEmbarques: Joi.string(),
            embarques: Joi.string(),
            real: Joi.number(),
            estimado: Joi.number(),
        }),
    }),
};
