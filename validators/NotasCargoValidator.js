const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            importe: Joi.number().required(),
            saldo: Joi.number().required(),
            clientes: Joi.string().required(), 
            observaciones: Joi.string().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string(),
            importe: Joi.number(),
            saldo: Joi.number(),
            clientes: Joi.string(), 
            observaciones: Joi.string(),
        }),
    }),
};
