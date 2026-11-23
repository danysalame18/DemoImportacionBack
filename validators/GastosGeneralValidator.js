const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string().required(),
            subtotal: Joi.number().required(),
            iva: Joi.number().required(),
            total: Joi.number().required(),
            descripcion: Joi.string().required(),
            areas: Joi.string().required(),
            conceptosGastos: Joi.string(),
            categorias: Joi.string(),
            subCategorias: Joi.string(),
            solicitantes: Joi.string(),
            bancos: Joi.string(),
            empresas: Joi.string(),
            fotoEvidencia: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            subtotal: Joi.number(),
            iva: Joi.number(),
            total: Joi.number(),
            descripcion: Joi.string(),
            areas: Joi.string(),
            conceptosGastos: Joi.string(),
            categorias: Joi.string(),
            subCategorias: Joi.string(),
            solicitantes: Joi.string(),
            bancos: Joi.string(),
            empresas: Joi.string(),
            fotoEvidencia: Joi.string(),
        }),
    }),
};
