const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const anticiposSchema = new Schema(
  {  
    is_active:{
      type: String,
      default: "Si"
  },
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
    bancos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bancos",
      },
    ],
    formaPago:{
      type: String,
    },
    utilizado: {
      type: Number,
      required: true,
    },
    saldo: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  } 
);
anticiposSchema.plugin(AutoIncrement, {inc_field: 'idAnticipo'});
const Anticipos = mongoose.model("Anticipos", anticiposSchema);
module.exports = Anticipos;


