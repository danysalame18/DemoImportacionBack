const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            ventasTiendas: Joi.string().required(),
            articulos: Joi.string().required(),
            areas: Joi.string(),
            cantidad: Joi.number().required(),
            precio: Joi.number().required(),
            total: Joi.number().required(),
            idInventario: Joi.string().required(),
            fecha: Joi.string().required(),
            costoUnitario: Joi.number(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            ventasTiendas: Joi.string(),
            articulos: Joi.string(),
            areas: Joi.string(),
            cantidad: Joi.number(),
            precio: Joi.number(),
            total: Joi.number(),
            idInventario: Joi.string(),
            fecha: Joi.string(),
            costoUnitario: Joi.number(),
        }),
    }),
};
