const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            importe: Joi.number().required(),
            areas: Joi.string().required(),
            traspasosSalida: Joi.string(),
            formaPago: Joi.string().required(),
            bancos: Joi.string().required(),
            observaciones: Joi.string().required(),
            concepto: Joi.string().required(),
            codigoAgrupado: Joi.string().required(),
            editado: Joi.string(),
            observaciones: Joi.string().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            importe: Joi.number(),
            areas: Joi.string(),
            traspasosSalida: Joi.string(),
            formaPago: Joi.string(),
            bancos: Joi.string(),
            observaciones: Joi.string(),
            concepto: Joi.string(),
            codigoAgrupado: Joi.string(),
            editado: Joi.string(),
            observaciones: Joi.string(),
        }),
    }),
};
