const mongoose = require("mongoose");

const { Schema } = mongoose;

const articulosProporcionSchema = new Schema(
  {
    articulos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Articulos",
      },
    ],
    cantidad: {
      type: String,
      default: 0,
    },
    EAN: {
      type: String,
      default: "NA",
    },
    colores:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Colores'
        }],
    tallas:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tallas'
        }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ArticulosProporcion = mongoose.model("ArticulosProporcion", articulosProporcionSchema);
module.exports = ArticulosProporcion;
