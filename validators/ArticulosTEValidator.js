const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            traspasosEntrada: Joi.string().required(),
            articulos: Joi.string().required(),
            articulosTS: Joi.string().required(),
            cantidad: Joi.number().required(),
            areaDestino: Joi.string().required(),
            areas: Joi.string(),
            costoUnitario: Joi.number(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            traspasosEntrada: Joi.string(),
            articulos: Joi.string(),
            articulosTS: Joi.string(),
            cantidad: Joi.number(),
            areaDestino: Joi.string(),
            areas: Joi.string(),
            costoUnitario: Joi.number(),
        }),
    }),
};
