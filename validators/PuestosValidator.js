const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            name: Joi.string().required(),
            colaboradores: Joi.string().required(),
            areas: Joi.string().required(),
            planteles: Joi.string().required()
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            name: Joi.string(),
            colaboradores: Joi.string(),
            areas: Joi.string(),
            planteles: Joi.string()
        }),
    }),
};
