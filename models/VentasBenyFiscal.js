const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const ventasBenyFiscalSchema = new Schema(
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
ventasBenyFiscalSchema.plugin(AutoIncrement, {inc_field: 'idVentasBenyFiscal'});
const ventasBenyFiscal = mongoose.model("ventasBenyFiscal", ventasBenyFiscalSchema);
module.exports = ventasBenyFiscal;
