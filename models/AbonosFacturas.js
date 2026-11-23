const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const abonosFacturasSchema = new Schema(
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
    facturas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Facturas",
      },
    ],
    notasCargo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NotasCargo",
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
    }
  },
  {
    timestamps: true,
    versionKey: false,
  } 
);
abonosFacturasSchema.plugin(AutoIncrement, {inc_field: 'idAbonoFactura'});
const AbonosFacturas = mongoose.model("AbonosFacturas", abonosFacturasSchema);
module.exports = AbonosFacturas;



