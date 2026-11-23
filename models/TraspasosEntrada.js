const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const traspasosEntradaSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    fecha:{
        type: String,
        required: true
    },
    traspasosSalida:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TraspasosSalida'
        }],
    observaciones:{
        type: String,
        required: true
    },
    total:{
        type: Number,
        required: true
    },
    user:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
},
    {
    timestamps: true,
    versionKey: false
});

traspasosEntradaSchema.plugin(AutoIncrement, {inc_field: 'idTraspasosEntrada'});

const TraspasosEntrada = mongoose.model('TraspasosEntrada', traspasosEntradaSchema)
module.exports = TraspasosEntrada