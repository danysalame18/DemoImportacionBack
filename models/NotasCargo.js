const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const notasCargoSchema = new Schema(
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
notasCargoSchema.plugin(AutoIncrement, {inc_field: 'idNotaCargo'});
const NotasCargo = mongoose.model("NotasCargo", notasCargoSchema);
module.exports = NotasCargo;


