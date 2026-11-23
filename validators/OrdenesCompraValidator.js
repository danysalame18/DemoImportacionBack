const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            moneda: Joi.string().required(),
            proveedores: Joi.string().required(),
            plazo: Joi.number().required(),
            fecha_compromiso: Joi.string().required(),
            observaciones: Joi.string().required(),
            total_general: Joi.number().required(),
            total_cantidad: Joi.number().required(),
            embarcado: Joi.number().required(),
            folioProveedor: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            moneda: Joi.string(),
            proveedores: Joi.string(),
            plazo: Joi.number(),
            fecha_compromiso: Joi.string(),
            observaciones: Joi.string(),
            total_general: Joi.number(),
            status: Joi.string(),
            total_cantidad: Joi.number(),
            embarcado: Joi.number(),
            folioProveedor: Joi.string(),
        }),
    }),
};
