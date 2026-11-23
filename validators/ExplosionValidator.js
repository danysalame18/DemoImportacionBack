const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            clientes: Joi.string().required(),
            insumos: Joi.string(),
            cantidad: Joi.number()
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            clientes: Joi.string(),
            insumos: Joi.string(),
            cantidad: Joi.number()
        }),
    }),
};
