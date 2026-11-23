const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            ordenesCompraHab: Joi.string().required(),
            insumos: Joi.string(),
            cantidad: Joi.number().required(),
            recibido: Joi.number().required(),
            pendiente_recibir: Joi.number().required(),
            precio: Joi.number().required(),
            descuento: Joi.number().required(),
            total: Joi.number().required(),
            detalleSolicitudInsumosPedidos: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            ordenesCompraHab: Joi.string(),
            insumos: Joi.string(),
            cantidad: Joi.number(),
            recibido: Joi.number(),
            pendiente_recibir: Joi.number(),
            precio: Joi.number(),
            descuento: Joi.number(),
            total: Joi.number(),
            detalleSolicitudInsumosPedidos: Joi.string(),
        }),
    }),
};
