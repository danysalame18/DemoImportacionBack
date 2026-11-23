const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const ventasBenySchema = new Schema(
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
ventasBenySchema.plugin(AutoIncrement, {inc_field: 'idVentasBeny'});
const ventasBeny = mongoose.model("ventasBeny", ventasBenySchema);
module.exports = ventasBeny;
