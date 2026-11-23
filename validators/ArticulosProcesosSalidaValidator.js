const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            procesosSalida: Joi.string().required(),
            articulosPedido: Joi.string().required(),
            pedidos: Joi.string().required(),
            cantidadSalida: Joi.number().required(),
            cantidadEntrada: Joi.number().required(),
            faltantes: Joi.number().required(),
            faltantesHab: Joi.number(),
            segundas: Joi.number(),
            proveedores: Joi.string(),
            fecha: Joi.string(),
            precio: Joi.number(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            procesosSalida: Joi.string(),
            articulosPedido: Joi.string(),
            pedidos: Joi.string(),
            cantidadSalida: Joi.number(),
            cantidadEntrada: Joi.number(),
            faltantes: Joi.number(),
            faltantesHab: Joi.number(),
            segundas: Joi.number(),
            proveedores: Joi.string(),
            fecha: Joi.string(),
            precio: Joi.number(),
        }),
    }),
};
