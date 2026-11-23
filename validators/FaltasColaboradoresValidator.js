const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            colaboradores: Joi.string().required(),
            fecha: Joi.string().required(),
            justificada: Joi.string().required(),
            observaciones: Joi.string().required()
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            colaboradores: Joi.string(),
            fecha: Joi.string(),
            justificada: Joi.string(),
            observaciones: Joi.string()
        }),
    }),
};
