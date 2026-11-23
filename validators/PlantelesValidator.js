const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            name: Joi.string().required(),
            direccion: Joi.string().required(),
            telefono: Joi.string().required()
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            name: Joi.string(),
            direccion: Joi.string(),
            telefono: Joi.string()
        }),
    }),
};
