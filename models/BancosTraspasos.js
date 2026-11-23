const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const bancosTraspasosSchema = new Schema(
  {  
    is_active:{
      type: String,
      default: "Si"
  },
  bancoOrigen:
  [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bancos'
  }],
  bancoDestino:
  [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bancos'
  }],
    importe: {
      type: Number,
      required: true,
    },
    fecha: {
      type: String,
      required: true,
    },
    user:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    monedaOrigen:{
      type: String,
    },
    monedaDestino:{
      type: String,
    },
    tipoCambio: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

bancosTraspasosSchema.plugin(AutoIncrement, {inc_field: 'idBancoTraspaso'});
const BancosTraspasos = mongoose.model("BancosTraspasos", bancosTraspasosSchema);
module.exports = BancosTraspasos;
