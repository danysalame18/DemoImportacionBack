const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            traspasosSolicitud: Joi.string().required(),
            articulos: Joi.string().required(),
            cantidad: Joi.number().required(),
            autorizadoApartado: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            traspasosSolicitud: Joi.string(),
            articulos: Joi.string(),
            cantidad: Joi.number(),
            cantidadDiferencia: Joi.number(),
            autorizadoApartado: Joi.string(),
        }),
    }),
};
