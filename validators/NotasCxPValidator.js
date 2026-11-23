const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            proveedores: Joi.string().required(),
            embarques: Joi.string(),
            compras: Joi.string(),
            total_cantidad: Joi.number().required(),
            total_costo: Joi.number().required(),
            saldo: Joi.number().required(),
            calidad: Joi.string(),
            fecha: Joi.string(),
            compraDirecta: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            proveedores: Joi.string(),
            embarques: Joi.string(),
            compras: Joi.string(),
            total_cantidad: Joi.number(),
            total_costo: Joi.number(),
            saldo: Joi.number(),
            calidad: Joi.string(),
            fecha: Joi.string(),
            compraDirecta: Joi.string(),
            difSaldo: Joi.number()
        }),
    }),
};
