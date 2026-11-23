const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            proveedores: Joi.string().required(),
            areas: Joi.string().required(),
            observaciones: Joi.string().required(),
            total_general: Joi.number().required(),
            total_cantidad: Joi.number().required(),
            subTotal: Joi.number().required(),
            iva: Joi.number().required(),
            impuestos: Joi.number().required(),
            aplicada: Joi.string().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            proveedores: Joi.string(),
            areas: Joi.string(),
            observaciones: Joi.string(),
            total_general: Joi.number(),
            total_cantidad: Joi.number(),
            subTotal: Joi.number(),
            iva: Joi.number(),
            impuestos: Joi.number(),
            aplicada: Joi.string(),
        }),
    }),
};
