const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            pedidos: Joi.string().required(),
            clientes: Joi.string().required(),
            fecha: Joi.string().required(),
            procesosSalida: Joi.string().required(),
            proveedores: Joi.string().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            pedidos: Joi.string(),
            clientes: Joi.string(),
            fecha: Joi.string(),
            procesosSalida: Joi.string(),
            proveedores: Joi.string(),
        }),
    }),
};
