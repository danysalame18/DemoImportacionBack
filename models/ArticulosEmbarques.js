const mongoose = require("mongoose");

const { Schema } = mongoose;

const articulosEmbarquesSchema = new Schema(
  {
    is_active: {
      type: String,
      default: "Si",
    },
    articulosOC: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ArticulosOC",
      },
    ],
    articulos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Articulos",
      },
    ],
    embarques: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Embarques",
      },
    ],
    proveedores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proveedores",
      },
    ],
    notasCxP: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NotasCxP",
      },
    ],
    controlCalidad: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ControlCalidad",
      },
    ],
    calidad: {
      type: String,
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
    },
    recibido: {
      type: Number,
      required: true,
    },
    pendiente_recibir: {
      type: Number,
      required: true,
    },
    total_costo: {
      type: Number,
      required: true,
    },
    costo: {
      type: Number,
      required: true,
    },
    costoUSD: {
      type: Number,
      required: true,
    },
    faltante: {
      type: Number,
      required: true,
    },
    danado: {
      type: Number,
      required: true,
    },
    impuestos: {
      type: Number,
      required: true,
    },
    revisarFaltante: {
      type: Number,
      required: true,
    },
    revisarDanado: {
      type: Number,
      required: true,
    },
    pedirFaltante: {
      type: Number,
      required: true,
    },
    pedirDanado: {
      type: Number,
      required: true,
    },
    faltanteTotal: {
      type: Number,
      required: true,
    },
    danadoTotal: {
      type: Number,
      required: true,
    },
    descuentoFaltante: {
      type: Number,
      required: true,
    },
    descuentoDanado: {
      type: Number,
      required: true,
    },
    descuentoTotal: {
      type: Number,
      required: true,
    },
    sup: {
      type: String,
      required: true,
    },
    familias: {
      type: String,
      required: true,
    },
    observaciones: {
      type: String,
    },
    costoUnitario:{
        type: Number,
        default: 0
    },
    precio:{
        type: Number,
        default: 0
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ArticulosEmbarques = mongoose.model(
  "ArticulosEmbarques",
  articulosEmbarquesSchema
);
module.exports = ArticulosEmbarques;
