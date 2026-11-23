const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            factura: Joi.string().required(),
            embarques: Joi.string(),
            user: Joi.string().required(),
            observaciones: Joi.string().required(),
            total_cantidad: Joi.number().required(),
            tipoCambio: Joi.number().required(),
            areas: Joi.string().required(),
            reciboDeposito: Joi.string(),
            fotoEvidencia: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            factura: Joi.string(),
            embarques: Joi.string(),
            user: Joi.string(),
            observaciones: Joi.string(),
            total_cantidad: Joi.number(),
            tipoCambio: Joi.number(),
            unidadEdit: Joi.string(),
            cantidadNuevo: Joi.number(),
            cantidadAnterior: Joi.number(),
            areas: Joi.string(),
            reciboDeposito: Joi.string(),
            fotoEvidencia: Joi.string(),
        }),
    }),
};
