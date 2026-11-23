const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const abonosTraspasosSchema = new Schema(
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
    areas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Areas",
      },
    ],
    traspasosSalida: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TraspasosSalida",
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
    concepto:{
      type: String,
      required: true,
    },
    codigoAgrupado:{
      type: String,
    },
    editado:{
      type:String
    },
    observaciones:{
      type:String
    }
  },
  {
    timestamps: true,
    versionKey: false,
  } 
);
abonosTraspasosSchema.plugin(AutoIncrement, {inc_field: 'idAbonoTraspaso'});
const AbonosTraspasos = mongoose.model("AbonosTraspasos", abonosTraspasosSchema);
module.exports = AbonosTraspasos;



