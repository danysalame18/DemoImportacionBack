const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            pagado: Joi.string().required(),
            importe: Joi.number().required(),
            colaboradores: Joi.string().required(),
            comentarios: Joi.string(),
            planteles: Joi.string().required(),
            areas: Joi.string().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string(),
            pagado: Joi.string(),
            importe: Joi.number(),
            colaboradores: Joi.string(),
            comentarios: Joi.string(),
            planteles: Joi.string(),
            areas: Joi.string(),
        }),
    }),
};
