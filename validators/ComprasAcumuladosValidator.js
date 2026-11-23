const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            cantidad: Joi.number().required(),
            embarques: Joi.string(),
            compras: Joi.string().required(),
            articulosEmbarques: Joi.string(),
            articulos: Joi.string().required(),
            areas: Joi.string().required(),
            precio: Joi.number().required(),
            tipoCambio: Joi.number().required(),
            precioMX: Joi.number().required(),
            fecha: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string(),
            cantidad: Joi.number(),
            embarques: Joi.string(),
            compras: Joi.string(),
            articulosEmbarques: Joi.string(),
            articulos: Joi.string(),
            areas: Joi.string(),
            precio: Joi.number(),
            tipoCambio: Joi.number(),
            precioMX: Joi.number(),
            fecha: Joi.string(),
        }),
    }),
};
