const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const comisionesSchema = new Schema(
  {  
    is_active:{
      type: String,
      default: "Si",
    },
    fecha:{
      type: String,
      required: true,
    },
    importe: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    colaboradores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Colaboradores",
      },
    ],
    porcentaje: {
      type: Number,
      required: true,
    },
    pagada:{
      type: String,
      default: "No"
    },
    bancos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bancos",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  } 
);
comisionesSchema.plugin(AutoIncrement, {inc_field: 'idComision'});
const Comisiones = mongoose.model("Comisiones", comisionesSchema);
module.exports = Comisiones;


