const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            ordenesCompra: Joi.string().required(),
            articulos: Joi.string().required(),
            cantidad: Joi.number().required(),
            embarcado: Joi.number().required(),
            pendiente_embarcar: Joi.number().required(),
            precio: Joi.number().required(),
            total: Joi.number().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            ordenesCompra: Joi.string(),
            articulos: Joi.string(),
            cantidad: Joi.number(),
            embarcado: Joi.number(),
            pendiente_embarcar: Joi.number(),
            precio: Joi.number(),
            total: Joi.number(),
            articulosEmbarques: Joi.string(),
        }),
    }),
};
