const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string(),
            clientes:Joi.string(),
            colaboradores:Joi.string(),
            empresas:Joi.string(),
            facturas:Joi.string(),
            compPago:Joi.string(),
            PartialityNumber: Joi.number(),
            PreviousBalanceAmount: Joi.number(),
            AmountPaid: Joi.number(),
            ImpSaldoInsoluto: Joi.number(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            clientes:Joi.string(),
            colaboradores:Joi.string(),
            empresas:Joi.string(),
            facturas:Joi.string(),
            compPago:Joi.string(),
            PartialityNumber: Joi.number(),
            PreviousBalanceAmount: Joi.number(),
            AmountPaid: Joi.number(),
            ImpSaldoInsoluto: Joi.number(),
        }),
    }),
};
