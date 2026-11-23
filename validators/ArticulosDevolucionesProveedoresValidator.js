const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            devolucionesProveedores: Joi.string().required(),
            articulos: Joi.string().required(),
            cantidad: Joi.number().required(),
            precio: Joi.number().required(),
            total: Joi.number().required(),
            areas: Joi.string().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            devolucionesProveedores: Joi.string(),
            articulos: Joi.string(),
            cantidad: Joi.number(),
            precio: Joi.number(),
            total: Joi.number(),
            areas: Joi.string(),
        }),
    }),
};
