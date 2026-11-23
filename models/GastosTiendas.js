const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const gastoTiendasSchema = new Schema({
    fecha:{
        type: String,
        required: true
    },
    subtotal:{
        type: Number,
        required: true,
    },
    iva:{
        type: Number,
        required: true,
    },
    total:{
        type: Number,
        required: true,
    },
    descripcion:{
        type: String,
        default: 'n/a'
    },
    concepto:{
        type: String,
        required: true
    },
    conceptosGastosTiendas:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConceptosGastosTiendas'
    }],
    fotoEvidencia:{
        type: String,
        default: "No"
    },
    areas:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Areas'
    }],
    bancos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bancos",
      },
    ],
},
    {
    timestamps: true,
    versionKey: false
});

gastoTiendasSchema.plugin(AutoIncrement, {inc_field: 'idGastoTiendas'});
const GastosTiendas = mongoose.model('GastosTiendas', gastoTiendasSchema)
module.exports = GastosTiendas;