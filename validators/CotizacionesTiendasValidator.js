const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            clientes: Joi.string().required(),
            colaboradores: Joi.string().required(),
            observaciones: Joi.string().required(),
            total_general: Joi.number().required(),
            total_cantidad: Joi.number().required(),
            areas: Joi.string().required(),
            comisionTDC: Joi.number().required(),
            comisionFlete: Joi.number().required(),
            subTotal: Joi.number().required(),
            iva: Joi.number().required(),
            impuestos: Joi.number().required(),
            vendido: Joi.string().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            clientes: Joi.string(),
            colaboradores: Joi.string(),
            observaciones: Joi.string(),
            total_general: Joi.number(),
            total_cantidad: Joi.number(),
            status: Joi.string(),
            areas: Joi.string(),
            comisionTDC: Joi.number(),
            comisionFlete: Joi.number(),
            subTotal: Joi.number(),
            iva: Joi.number(),
            impuestos: Joi.number(),
            vendido: Joi.string(),
        }),
    }),
};
