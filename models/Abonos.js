const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const abonosSchema = new Schema(
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
    clientes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clientes",
      },
    ],
    colaboradores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Colaboradores",
      },
    ],
    surtidos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Surtidos",
      },
    ],
    notasCargo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NotasCargo",
      },
    ],
    saldoInicial: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SaldoInicial",
      },
    ],
    formaPago:{
      type: String,
    },
    observaciones:{
      type: String,
    },
    bancos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bancos",
      },
    ],
    comisionPagada:{
      type: String,
      default: "No"
    },
    concepto:{
      type: String,
      required: true,
    },
    comisiones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comisiones",
      },
    ],
    codigoAgrupado:{
      type: String,
    },
    editado:{
      type:String
    },
    observaciones:{
      type:String
    },
    devoluciones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Devoluciones",
      },
    ],
    anticipos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Anticipos",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  } 
);
abonosSchema.plugin(AutoIncrement, {inc_field: 'idAbono'});
const Abonos = mongoose.model("Abonos", abonosSchema);
module.exports = Abonos;



