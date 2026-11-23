const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            devoluciones: Joi.string().required(),
            articulos: Joi.string().required(),
            cantidad: Joi.number().required(),
            defectos: Joi.number().required(),
            totalPiezas: Joi.number().required(),
            precio: Joi.number().required(),
            total: Joi.number().required(),
            areas: Joi.string().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            devoluciones: Joi.string(),
            articulos: Joi.string(),
            cantidad: Joi.number(),
            defectos: Joi.number(),
            totalPiezas: Joi.number(),
            precio: Joi.number(),
            total: Joi.number(),
            areas: Joi.string(),
        }),
    }),
};
