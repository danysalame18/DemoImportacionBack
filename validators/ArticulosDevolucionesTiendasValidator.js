const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            devolucionesTiendas: Joi.string().required(),
            articulos: Joi.string().required(),
            areas: Joi.string(),
            cantidad: Joi.number().required(),
            precio: Joi.number().required(),
            total: Joi.number().required(),
            areas: Joi.string().required(),
            costoUnitario: Joi.number(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            devolucionesTiendas: Joi.string(),
            articulos: Joi.string(),
            areas: Joi.string(),
            cantidad: Joi.number(),
            precio: Joi.number(),
            total: Joi.number(),
            areas: Joi.string(),
            costoUnitario: Joi.number(),
        }),
    }),
};
