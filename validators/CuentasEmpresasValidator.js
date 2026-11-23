const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            banco: Joi.string().required(),
            cuenta: Joi.string().required(),
            rfc: Joi.string().required(),
            empresas: Joi.string().required()
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            banco: Joi.string(),
            cuenta: Joi.string(),
            rfc: Joi.string(),
            empresas: Joi.string()
        }),
    }),
};
