const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const notasCxPSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    embarques: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Embarques",
        },
      ],
      compras: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Compras",
          },
        ],
      proveedores: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Proveedores",
        },
      ],
    total_cantidad:{
        type: Number,
        required: true
    },
    total_costo:{
        type: Number,
        required: true
    },
    saldo:{
        type: Number,
        required: true
    },
    calidad:{
      type: String,
      default: "No"
  }, 
  compraDirecta:{
    type: String,
    default: "No"
}, 
    fecha:{
    type: String,
},
},
    {
    timestamps: true,
    versionKey: false
});

notasCxPSchema.plugin(AutoIncrement, {inc_field: 'idNotasCxP'});

const NotasCxP = mongoose.model('NotasCxP', notasCxPSchema)
module.exports = NotasCxP