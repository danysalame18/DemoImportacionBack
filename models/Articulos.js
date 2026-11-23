const mongoose = require("mongoose");

const { Schema } = mongoose;

const articulosSchema = new Schema(
  {
    is_active: {
      type: String,
      default: "Si",
    },
    foto: {
      type: String,
      default: "No",
    },
    urlFoto: {
      type: String,
      default: "No",
    },
    codigo: {
      type: String,
      required: true,
    },
    nombre: {
      type: String,
      required: true,
    },
    descripcion: {
      type: String,
      required: true,
    },
    piezasPorCaja: {
      type: Number,
      required: true,
    },
    costoUSD: {
      type: Number,
      required: true,
    },
    costoMX: {
      type: Number,
      required: true,
    },
    venta: {
      type: Number,
      required: true,
    },
    observaciones: {
      type: String,
      required: true,
    },
    ano: {
      type: String,
      required: true,
    },
    EAN: {
      type: String,
    },
    lineas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lineas",
      },
    ],
    marcas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Marcas",
      },
    ],
    familias: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Familias",
      },
    ],
    colecciones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Colecciones",
      },
    ],
    composiciones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Composiciones",
      },
    ],
    proveedores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proveedores",
      },
    ],
    empresas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Empresas",
      },
    ],
    pesoCaja: {
      type: Number,
      default: 0,
    },
    tamanoCaja: {
      type: String,
      default: 0,
    },
    vendedores: {
      type: String,
    },
    visibleInventario: {
      type: String,
      default: "Si",
    },
    colores:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Colores'
        }],
    tallas:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tallas'
        }],
      precioTienda: {
        type: Number,
        required: true,
      },
      codigoSAT:{
          type: String,
          defauelt: "NA"
      },
      codigoUnidad:{
          type: String,
          defauelt: "NA"
      },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Articulos = mongoose.model("Articulos", articulosSchema);
module.exports = Articulos;
