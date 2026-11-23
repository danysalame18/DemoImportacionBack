const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            name: Joi.string().required(),
            mail: Joi.string(),
            cargos: Joi.number(),
            abonos: Joi.number(),
            saldo: Joi.number(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            name: Joi.string(),
            mail: Joi.string(),
            cargos: Joi.number(),
            abonos: Joi.number(),
            saldo: Joi.number(),
        }),
    }),
};
