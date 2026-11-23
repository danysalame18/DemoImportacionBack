const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const controlCalidadSchema = new Schema(
  {  
    is_active:{
      type: String,
      default: "Si"
  },
    fecha:{
      type: String,
    },
    proveedores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proveedores",
      },
    ],
    familia:{
      type: String,
    },
    descripcion:{
      type: String,
    },
    total:{
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  } 
);
controlCalidadSchema.plugin(AutoIncrement, {inc_field: 'idControlCalidad'});
const ControlCalidad = mongoose.model("ControlCalidad", controlCalidadSchema);
module.exports = ControlCalidad;



