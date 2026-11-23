const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            cotizacionesTiendas: Joi.string().required(),
            articulos: Joi.string().required(),
            cantidad: Joi.number().required(),
            precio: Joi.number().required(),
            total: Joi.number().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            cotizacionesTiendas: Joi.string(),
            articulos: Joi.string(),
            cantidad: Joi.number(),
            precio: Joi.number(),
            total: Joi.number(),
        }),
    }),
};
