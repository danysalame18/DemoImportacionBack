const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string().required(),
            proveedores: Joi.string().required(),
            familia: Joi.string().required(),
            descripcion: Joi.string().required(),
            total: Joi.number().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            proveedores: Joi.string(),
            familia: Joi.string(),
            descripcion: Joi.string(),
            total: Joi.number()
        }),
    }),
};
