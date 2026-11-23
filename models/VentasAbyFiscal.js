const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const ventasAbyFiscalSchema = new Schema(
  {  
    ventasTiendas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VentasTiendas",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
ventasAbyFiscalSchema.plugin(AutoIncrement, {inc_field: 'idVentasAbyFiscal'});
const ventasAbyFiscal = mongoose.model("ventasAbyFiscal", ventasAbyFiscalSchema);
module.exports = ventasAbyFiscal;
