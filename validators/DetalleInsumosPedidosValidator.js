const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            cantidad: Joi.number().required(),
            insumosPedidos: Joi.string().required(),
            pedidos: Joi.string().required(),
            insumos: Joi.string().required(),
            proveedores: Joi.string(),
            fecha: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            cantidad: Joi.number(),
            insumosPedidos: Joi.string(),
            pedidos: Joi.string(),
            insumos: Joi.string(),
            proveedores: Joi.string(),
            fecha: Joi.string(),
        }),
    }),
};
