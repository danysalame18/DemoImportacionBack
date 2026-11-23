const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            nombre: Joi.string().required(),
            descripcion: Joi.string().required(),
            costo: Joi.number().required(),
            observaciones: Joi.string().required(),
            unidad: Joi.string().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            nombre: Joi.string(),
            descripcion: Joi.string(),
            costo: Joi.number(),
            observaciones: Joi.string(),
            unidad: Joi.string(),
        }),
    }),
};
