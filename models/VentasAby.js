const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const ventasAbySchema = new Schema(
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
ventasAbySchema.plugin(AutoIncrement, {inc_field: 'idVentasAby'});
const ventasAby = mongoose.model("ventasAby", ventasAbySchema);
module.exports = ventasAby;
