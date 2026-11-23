const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            articulos: Joi.string().required(),
            cantidad: Joi.number(),
            costoUnitario: Joi.number(),
            areas: Joi.string().required(),
            embarques: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            articulos: Joi.string(),
            cantidad: Joi.number(),
            costoUnitario: Joi.number(),
            areas: Joi.string(),
            embarques: Joi.string(),
            precioMX: Joi.number(),
        }),
    }),
};
