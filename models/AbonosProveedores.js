const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const abonosProveedoresSchema = new Schema(
  {  
    fecha:{
      type: String,
    },
    importe: {
      type: Number,
      required: true,
    },
    tipoCambio: {
      type: Number,
      default: 1,
    },
    proveedores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proveedores",
      },
    ],
    observaciones:{
      type: String,
      default:"NA"
    },
    concepto:{
      type: String,
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
abonosProveedoresSchema.plugin(AutoIncrement, {inc_field: 'idAbonoProveedor'});
const AbonosProveedores = mongoose.model("AbonosProveedores", abonosProveedoresSchema);
module.exports = AbonosProveedores;



