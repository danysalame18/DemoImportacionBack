const { celebrate, Joi, Segments } = require('celebrate')

module.exports = {
    create: celebrate({
        [Segments.BODY]: Joi.object().keys({
            fecha: Joi.string().required(),
            ordenesCompraHab: Joi.string().required(),
            factura_proveedor: Joi.string().required(),
            user: Joi.string().required(),
            pais_origen: Joi.string().required(),
            observaciones: Joi.string().required(),
            total_kilos: Joi.number().required(),
            total_metros: Joi.number().required(),
            total_piezas: Joi.number().required(),
            total_costo: Joi.number(),
            saldo: Joi.number(),
            proveedores: Joi.string(),
        }),
    }),
    edit: celebrate({
        [Segments.BODY]: Joi.object().keys({
            is_active: Joi.string(),
            fecha: Joi.string(),
            ordenesCompraHab: Joi.string(),
            factura_proveedor: Joi.string(),
            user: Joi.string(),
            pais_origen: Joi.string(),
            observaciones: Joi.string(),
            total_kilos: Joi.number(),
            total_metros: Joi.number(),
            total_piezas: Joi.number(),
            unidadEdit: Joi.string(),
            cantidadNuevo: Joi.number(),
            cantidadAnterior: Joi.number(),
            total_costo: Joi.number(),
            saldo: Joi.number(),
            proveedores: Joi.string(),
        }),
    }),
};
