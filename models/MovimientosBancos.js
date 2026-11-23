const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const movimientosBancosSchema = new Schema(
  {  
    is_active:{
      type: String,
      default: "Si"
  },
    fecha:{
      type: String,
    },
    importe: {
      type: Number,
      required: true,
    },
    tipo:{
      type: String,
    },
    bancos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bancos",
      },
    ],
    abonos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Abonos",
      },
    ],
    abonosTiendas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AbonosTiendas",
      },
    ],
    abonosTraspasos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AbonosTraspasos",
      },
    ],
    abonosProveedores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AbonosProveedores",
      },
    ],
    gastosGeneral: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GastosGeneral",
      },
    ],
    bancosTraspasos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BancosTraspasos",
      },
    ],
    comisiones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comisiones",
      },
    ],
    anticipos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Anticipos",
      },
    ],
    gastosTiendas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GastosTiendas",
      },
    ],
    moneda:{
      type: String,
    },
    tipoCambio: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  } 
);
movimientosBancosSchema.plugin(AutoIncrement, {inc_field: 'idMovBanco'});
const MovimientosBancos = mongoose.model("MovimientosBancos", movimientosBancosSchema);
module.exports = MovimientosBancos;



