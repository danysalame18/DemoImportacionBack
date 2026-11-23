const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            cantidad: Joi.number().required(),
            pedido: Joi.number().required(),
            pendientePedir: Joi.number().required(),
            solicitudInsumosPedidos: Joi.string().required(),
            pedidos: Joi.string().required(),
            insumos: Joi.string().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            cantidad: Joi.number(),
            pedido: Joi.number(),
            pendientePedir: Joi.number(),
            solicitudInsumosPedidos: Joi.string(),
            pedidos: Joi.string(),
            insumos: Joi.string(),
        }),
    }),
};
