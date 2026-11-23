const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            traspasosSolicitudV2: Joi.string().required(),
            articulos: Joi.string().required(),
            cantidad: Joi.number().required(),
            surtido: Joi.number().required(),
            pendiente_surtir: Joi.number().required(),
            precio: Joi.number().required(),
            total: Joi.number().required(),
            autorizadoApartado: Joi.string(),
            autorizadoSurtido: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            autorizadoApartado: Joi.string(),
            autorizadoSurtido: Joi.string(),
            traspasosSolicitudV2: Joi.string(),
            articulos: Joi.string(),
            cantidad: Joi.number(),
            surtido: Joi.number(),
            pendiente_surtir: Joi.number(),
            precio: Joi.number(),
            total: Joi.number(),
        }),
    }),
};
