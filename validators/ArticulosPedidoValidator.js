const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            pedidos: Joi.string().required(),
            articulos: Joi.string().required(),
            cantidad: Joi.number().required(),
            cantidadProcesos: Joi.number(),
            surtido: Joi.number().required(),
            pendiente_surtir: Joi.number().required(),
            precio: Joi.number().required(),
            total: Joi.number().required(),
            autorizadoApartado: Joi.string(),
            autorizadoSurtido: Joi.string(),
            clientes: Joi.string(),
            fecha: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            autorizadoApartado: Joi.string(),
            autorizadoSurtido: Joi.string(),
            pedidos: Joi.string(),
            articulos: Joi.string(),
            cantidad: Joi.number(),
            cantidadProcesos: Joi.number(),
            surtido: Joi.number(),
            pendiente_surtir: Joi.number(),
            precio: Joi.number(),
            total: Joi.number(),
            clientes: Joi.string(),
            fecha: Joi.string(),
        }),
    }),
};
