const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const saldoInicialSchema = new Schema(
  {  
    fecha:{
      type: String,
      required: true,
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
    observaciones:{
      type: String,
      required: true,
    },
    saldo:{
      type: Number,
      required: true
    },
  },
  {
    timestamps: true,
    versionKey: false,
  } 
);
saldoInicialSchema.plugin(AutoIncrement, {inc_field: 'idSaldoInicial'});
const SaldoInicial = mongoose.model("SaldoInicial", saldoInicialSchema);
module.exports = SaldoInicial;


