const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            proveedores: Joi.string().required(),
            pedidos: Joi.string().required(),
            fecha: Joi.string().required(),
            // procesosSalida: Joi.string().required(),
            observaciones: Joi.string().required(),
            totalGeneral: Joi.number().required(),
            totalPiezas: Joi.number(),
            totalPiezasFaltantes: Joi.number(),
            totalPiezasSegundas: Joi.number(),
            // precio: Joi.number().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            proveedores: Joi.string(),
            pedidos: Joi.string(),
            fecha: Joi.string(),
            // procesosSalida: Joi.string(),
            observaciones: Joi.string(),
            totalGeneral: Joi.number(),
            totalPiezas: Joi.number(),
            totalPiezasFaltantes: Joi.number(),
            totalPiezasSegundas: Joi.number(),
            // precio: Joi.number(),
        }),
    }),
};
