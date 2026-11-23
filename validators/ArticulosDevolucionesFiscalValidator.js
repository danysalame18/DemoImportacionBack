const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            devolucionesFiscal: Joi.string().required(),
            articulos: Joi.string().required(),
            areas: Joi.string().required(),
            articulosSurtidos: Joi.string().required(),
            cantidad: Joi.number().required(),
            precio: Joi.number().required(),
            total: Joi.number().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            devolucionesFiscal: Joi.string(),
            articulos: Joi.string(),
            areas: Joi.string(),
            articulosSurtidos: Joi.string(),
            cantidad: Joi.number(),
            precio: Joi.number(),
            total: Joi.number(),
        }),
    }),
};
