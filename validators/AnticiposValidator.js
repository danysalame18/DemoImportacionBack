const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            importe: Joi.number().required(),
            utilizado: Joi.number().required(),
            saldo: Joi.number().required(),
            clientes: Joi.string().required(), 
            bancos: Joi.string().required(),
            formaPago: Joi.string().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            importe: Joi.number(),
            utilizado: Joi.number(),
            saldo: Joi.number(),
            clientes: Joi.string(),
            bancos: Joi.string(),
            formaPago: Joi.string(),
            idCliente: Joi.string(),
        }),
    }),
};
