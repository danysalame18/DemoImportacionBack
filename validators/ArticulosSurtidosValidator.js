const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            surtidos: Joi.string().required(),
            inventarios: Joi.string(),
            articulos: Joi.string().required(),
            areas: Joi.string(),
            articulosPedido: Joi.string().required(),
            cantidad: Joi.number().required(),
            pedidos: Joi.string().required(),
            clientes: Joi.string(),
            fecha: Joi.string(),
            costoUnitario: Joi.number(),
            facturas: Joi.string(),
            facturado: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            surtidos: Joi.string(),
            inventarios: Joi.string(),
            articulos: Joi.string(),
            areas: Joi.string(),
            articulosPedido: Joi.string(),
            cantidad: Joi.number(),
            pedidos: Joi.string(),
            clientes: Joi.string(),
            fecha: Joi.string(),
            costoUnitario: Joi.number(),
            facturas: Joi.string(),
            facturado: Joi.string(),
        }),
    }),
};
