const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            procesosEntrada: Joi.string().required(),
            articulosPedido: Joi.string().required(),
            articulosProcesosSalida: Joi.string().required(),
            pedidos: Joi.string().required(),
            cantidadEntrada: Joi.number(),
            cantidadFaltantes: Joi.number(),
            cantidadSegundas: Joi.number(),
            proveedores: Joi.string(),
            fecha: Joi.string(),
            precio: Joi.number(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            procesosEntrada: Joi.string(),
            articulosPedido: Joi.string(),
            articulosProcesosSalida: Joi.string(),
            pedidos: Joi.string(),
            cantidadEntrada: Joi.number(),
            cantidadFaltantes: Joi.number(),
            cantidadSegundas: Joi.number(),
            proveedores: Joi.string(),
            fecha: Joi.string(),
            precio: Joi.number(),
        }),
    }),
};
