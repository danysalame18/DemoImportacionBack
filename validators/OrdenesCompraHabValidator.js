const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            proveedores: Joi.string().required(),
            plazo: Joi.number().required(),
            fecha_compromiso: Joi.string().required(),
            observaciones: Joi.string().required(),
            total_general: Joi.number().required(),
            total_kilos: Joi.number().required(),
            total_metros: Joi.number().required(),
            total_piezas: Joi.number().required(),
            autorizado: Joi.string().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            proveedores: Joi.string(),
            plazo: Joi.number(),
            fecha_compromiso: Joi.string(),
            observaciones: Joi.string(),
            total_general: Joi.number(),
            total_kilos: Joi.number(),
            total_metros: Joi.number(),
            total_piezas: Joi.number(),
            status: Joi.string(),
            autorizado: Joi.string(),
        }),
    }),
};
