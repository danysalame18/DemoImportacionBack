const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            emailCorteDiario: Joi.array().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            emailCorteDiario: Joi.array(),
        }),
    }),
};
