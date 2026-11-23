const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            traspasosSalida: Joi.string().required(),
            articulos: Joi.string().required(),
            inventarios: Joi.string().required(),
            cantidad: Joi.number().required(),
            surtido: Joi.number().required(),
            traspasosSolicitudV2: Joi.string(),
            articulosTraspaso: Joi.string(),
            areas: Joi.string(),
            areaDestino: Joi.string(),
            costoUnitario: Joi.number(),
            precio: Joi.number().required(),
            total: Joi.number().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            traspasosSalida: Joi.string(),
            articulos: Joi.string(),
            inventarios: Joi.string(),
            cantidad: Joi.number(),
            surtido: Joi.number(),
            cantidadDiferencia: Joi.number(),
            traspasosSolicitudV2: Joi.string(),
            articulosTraspaso: Joi.string(),
            areas: Joi.string(),
            areaDestino: Joi.string(),
            costoUnitario: Joi.number(),
            precio: Joi.number(),
            total: Joi.number(),
        }),
    }),
};
