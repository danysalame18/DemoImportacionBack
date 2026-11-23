const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const traspasosSalidaSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    fecha:{
        type: String,
        required: true
    },
    recibida:{
        type: String,
        default:"No"
    },
    areaSalida:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Areas'
        }],
    areaDestino:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Areas'
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
    fotoEvidencia:{
        type: String,
        default: "No"
        },
    total_general:{
        type: Number,
        required: true
    },
    saldo:{
        type: Number,
        required: true
    },
},
    {
    timestamps: true,
    versionKey: false
});

traspasosSalidaSchema.plugin(AutoIncrement, {inc_field: 'idTraspasosSalida'});

const TraspasosSalida = mongoose.model('TraspasosSalida', traspasosSalidaSchema)
module.exports = TraspasosSalida