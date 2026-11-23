const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            muestrasSalida: Joi.string().required(),
            articulos: Joi.string().required(),
            inventarios: Joi.string().required(),
            cantidad: Joi.number().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            muestrasSalida: Joi.string(),
            articulos: Joi.string(),
            inventarios: Joi.string(),
            cantidad: Joi.number(),
        }),
    }),
};
