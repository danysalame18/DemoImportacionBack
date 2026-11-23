const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            autorizadoApartado: Joi.string().required(),
            autorizadoSurtido: Joi.string().required(),
            areaDestino: Joi.string().required(),
            observaciones: Joi.string().required(),
            total_general: Joi.number().required(),
            total_cantidad: Joi.number().required(),
            areaSalida: Joi.string().required(),
            autorizoApartado: Joi.string(),
            autorizoSurtido: Joi.string(),
            editPedido: Joi.string(),
            editArticulos: Joi.string(),
            subTotal: Joi.number().required(),
            iva: Joi.number().required(),
            impuestos: Joi.number().required(),
            surtido: Joi.string().required(),
            editado: Joi.string().required(),
            fechaModificado: Joi.string()
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            autorizadoApartado: Joi.string(),
            autorizadoSurtido: Joi.string(),
            areaDestino: Joi.string(),
            observaciones: Joi.string(),
            total_general: Joi.number(),
            total_cantidad: Joi.number(),
            status: Joi.string(),
            areaSalida: Joi.string(),
            autorizoApartado: Joi.string(),
            autorizoSurtido: Joi.string(),
            editPedido: Joi.string(),
            editArticulos: Joi.string(),
            subTotal: Joi.number(),
            iva: Joi.number(),
            impuestos: Joi.number(),
            surtido: Joi.string(),
            editado: Joi.string(),
            fechaModificado: Joi.string()
        }),
    }),
};
