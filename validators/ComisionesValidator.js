const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            importe: Joi.number().required(),
            total: Joi.number().required(),
            porcentaje: Joi.number().required(),
            colaboradores: Joi.string().required(), 
            pagada: Joi.string(), 
            bancos: Joi.string(), 
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            importe: Joi.number(),
            diferenciaImporte: Joi.number(),
            total: Joi.number(),
            porcentaje: Joi.number(),
            colaboradores: Joi.string(), 
            pagada: Joi.string(), 
            bancos: Joi.string(), 
        }),
    }),
};
