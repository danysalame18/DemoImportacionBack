const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            ajustesInventario: Joi.string().required(),
            articulos: Joi.string().required(),
            areas: Joi.string(),
            cantidad: Joi.number().required(),
            areas: Joi.string(),
            inventarios: Joi.string().required()
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            ajustesInventario: Joi.string(),
            articulos: Joi.string(),
            areas: Joi.string(),
            cantidad: Joi.number(),
            areas: Joi.string(),
            inventarios: Joi.string()
        }),
    }),
};
