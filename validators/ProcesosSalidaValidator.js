const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            proveedores: Joi.string().required(),
            pedidos: Joi.string().required(),
            fecha: Joi.string().required(),
            fechaCompromiso: Joi.string().required(),
            observaciones: Joi.string().required(),
            status: Joi.string().required(),
            totalGeneral: Joi.number().required(),
            totalPiezas: Joi.number().required(),
            precio: Joi.number().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            proveedores: Joi.string(),
            pedidos: Joi.string(),
            fecha: Joi.string(),
            fechaCompromiso: Joi.string(),
            observaciones: Joi.string(),
            status: Joi.string(),
            totalGeneral: Joi.number(),
            totalPiezas: Joi.number(),
            precio: Joi.number(),
        }),
    }),
};
