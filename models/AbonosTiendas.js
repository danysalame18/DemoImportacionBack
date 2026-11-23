const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const abonosTiendasSchema = new Schema(
  {  
    is_active:{
      type: String,
      default: "Si"
    },
    fecha:{
      type: String,
    },
    total: {
      type: Number,
      required: true,
    },
    areas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Areas",
      },
    ],
    clientes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clientes",
      },
    ],
    ventasTiendas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VentasTiendas",
      },
    ],
    notasCargo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NotasCargo",
      },
    ],
    bancos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bancos",
      },
    ],
    efectivo:{
      type: Number,
      required: true,
    },
    tdc:{
      type: Number,
      required: true,
    },
    transfer:{
      type: Number,
      required: true,
    },
    cortesia:{
      type: Number,
      required: true,
    },
    nomina:{
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
abonosTiendasSchema.plugin(AutoIncrement, {inc_field: 'idAbonoTiendas'});
const AbonosTiendas = mongoose.model("AbonosTiendas", abonosTiendasSchema);
module.exports = AbonosTiendas;
