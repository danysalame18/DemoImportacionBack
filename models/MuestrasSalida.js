const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const muestrasSalidaSchema = new Schema({
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

muestrasSalidaSchema.plugin(AutoIncrement, {inc_field: 'idMuestrasSalida'});

const MuestrasSalida = mongoose.model('MuestrasSalida', muestrasSalidaSchema)
module.exports = MuestrasSalida