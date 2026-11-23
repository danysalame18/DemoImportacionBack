const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const bancosSchema = new Schema(
  {  
    is_active:{
      type: String,
      default: "Si"
  },
    banco: {
      type: String,
      required: true,
    },
    cuenta:{
      type: String,
    },
    cargos: {
      type: Number,
    },
    abonos: {
      type: Number,
    },
    moneda:{
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Bancos = mongoose.model("Bancos", bancosSchema);
module.exports = Bancos;
