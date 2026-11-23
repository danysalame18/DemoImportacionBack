const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            importe: Joi.number().required(),
            tipo: Joi.string().required(),
            bancos: Joi.string().required(),
            abonos: Joi.string(),
            abonosTiendas: Joi.string(),
            abonosTraspasos: Joi.string(),
            abonosProveedores: Joi.string(),
            gastosGeneral: Joi.string(),
            gastosTiendas: Joi.string(),
            bancosTraspasos: Joi.string(),
            comisiones: Joi.string(),
            anticipos: Joi.string(),
            moneda: Joi.string().required(),
            tipoCambio: Joi.number().required(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            importe: Joi.number(),
            tipo: Joi.string(),
            bancos: Joi.string(),
            abonos: Joi.string(),
            abonosTiendas: Joi.string(),
            abonosTraspasos: Joi.string(),
            abonosProveedores: Joi.string(),
            gastosGeneral: Joi.string(),
            gastosTiendas: Joi.string(),
            bancosTraspasos: Joi.string(),
            comisiones: Joi.string(),
            anticipos: Joi.string(),
            moneda: Joi.string(),
            tipoCambio: Joi.number(),
        }),
    }),
};
