const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const muestrasEntradaSchema = new Schema({
    fecha:{
        type: String,
        required: true
    },
    areas:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Areas'
        }],
    clientes:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clientes'
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

muestrasEntradaSchema.plugin(AutoIncrement, {inc_field: 'idMuestrasEntrada'});

const MuestrasEntrada = mongoose.model('MuestrasEntrada', muestrasEntradaSchema)
module.exports = MuestrasEntrada