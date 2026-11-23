const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            cantidad: Joi.number().required(),
            ordenesCompraHab: Joi.string().required(),
            comprasHab: Joi.string().required(),
            proveedores: Joi.string().required(),
            habOC: Joi.string().required(),
            insumos: Joi.string(),
            total: Joi.number(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string(),
            cantidad: Joi.number(),
            ordenesCompraHab: Joi.string(),
            comprasHab: Joi.string(),
            proveedores: Joi.string(),
            habOC: Joi.string(),
            insumos: Joi.string(),
            total: Joi.number(),
        }),
    }),
};
