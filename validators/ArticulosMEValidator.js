const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            muestrasEntrada: Joi.string().required(),
            articulos: Joi.string().required(),
            cantidad: Joi.number().required(),
            areas: Joi.string()
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            muestrasEntrada: Joi.string(),
            articulos: Joi.string(),
            cantidad: Joi.number(),
            areas: Joi.string()
        }),
    }),
};
