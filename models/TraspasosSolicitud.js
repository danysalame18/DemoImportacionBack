const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const traspasosSolicitudSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    fecha:{
        type: String,
        required: true
    },
    salida:{
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
    autorizadoApartado:{
        type: String,
        default: "Si"
    },
},
    {
    timestamps: true,
    versionKey: false
});

traspasosSolicitudSchema.plugin(AutoIncrement, {inc_field: 'idTraspasosSolicitud'});

const TraspasosSolicitud = mongoose.model('TraspasosSolicitud', traspasosSolicitudSchema)
module.exports = TraspasosSolicitud