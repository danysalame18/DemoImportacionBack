const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            articulos: Joi.string(),
            cantidad: Joi.number(),
            colores: Joi.string(),
            tallas: Joi.string(),
            EAN: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            articulos: Joi.string(),
            cantidad: Joi.number(),
            colores: Joi.string(),
            tallas: Joi.string(),
            EAN: Joi.string(),
        }),
    }),
};
