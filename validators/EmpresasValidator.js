const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            name: Joi.string().required(),
            prefijo: Joi.string().required(),
            razonSocial: Joi.string().required(),
            rfc: Joi.string().required(),
            regimenFiscal: Joi.string().required(),
            direccionFiscal: Joi.string().required(),
            cp: Joi.string().required(),
            listoFacturar: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            name: Joi.string(),
            prefijo: Joi.string(),
            razonSocial: Joi.string(),
            rfc: Joi.string(),
            regimenFiscal: Joi.string(),
            direccionFiscal: Joi.string(),
            cp: Joi.string(),
            listoFacturar: Joi.string(),
        }),
    }),
};
