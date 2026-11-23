const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            total: Joi.number().required(),
            areas: Joi.string().required(),
            clientes: Joi.string().required(),
            ventasTiendas: Joi.string(),
            notasCargo: Joi.string(),
            bancos: Joi.string(),
            efectivo: Joi.number().required(),
            tdc: Joi.number().required(),
            transfer: Joi.number().required(),
            cortesia: Joi.number().required(),   
            nomina: Joi.number().required(),           
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            total: Joi.number(),
            areas: Joi.string(),
            clientes: Joi.string(),
            ventasTiendas: Joi.string(),
            notasCargo: Joi.string(),
            bancos: Joi.string(),
            efectivo: Joi.number(),
            tdc: Joi.number(),
            transfer: Joi.number(),
            cortesia: Joi.number(),   
            nomina: Joi.number()
        }),
    }),
};
