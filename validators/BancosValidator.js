const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            banco: Joi.string().required(),
            cuenta: Joi.string().required(),
            cargos: Joi.number(),
            abonos: Joi.number(),
            moneda: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            banco: Joi.string(),
            cuenta: Joi.string(),
            cargos: Joi.number(),
            abonos: Joi.number(),
            moneda: Joi.string(),
        }),
    }),
};
