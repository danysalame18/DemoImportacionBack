const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            serie: Joi.string().required(),
            folio: Joi.string().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            serie: Joi.string(),
            folio: Joi.string(),
        }),
    }),
};
