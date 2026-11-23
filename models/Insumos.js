const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const insumosSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    nombre:{
        type: String,
        required: true
    },
    descripcion:{
        type: String,
        required: true
    },
    unidad:{
        type: String,
        required: true
    },
    costo:{
        type: Number,
        required: true
    },
    observaciones:{
        type: String,
        required: true
    },
},
    {
    timestamps: true,
    versionKey: false
});

const Insumos = mongoose.model('Insumos', insumosSchema)
module.exports = Insumos