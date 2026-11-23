const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const traspasosSolicitudV2Schema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    autorizadoApartado:{
        type: String,
        default: "No"
    },
    autorizadoSurtido:{
        type: String,
        default: "No"
    },
    fecha:{
        type: String,
        required: true
    },
    areaDestino:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Areas'
        }],
    areaSalida:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Areas'
    }],
    observaciones:{
        type: String,
        required: true
    },
    total_general:{
        type: Number,
        required: true
    },
    total_cantidad:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        default: "Abierto"
    },
    autorizoApartado:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    autorizoSurtido:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    editPedido:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    editArticulos:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    subTotal:{
        type: Number,
        required: true
    },
    iva:{
        type: Number,
        required: true
    },
    impuestos:{
        type: Number,
        required: true
    },
    surtido:{
        type: String,
        default: "No"
    },
    editado:{
        type: String,
        default: "No"
    },
    fechaModificado:{
        type: String,
        required: true
    },

},
    {
    timestamps: true,
    versionKey: false
});

traspasosSolicitudV2Schema.plugin(AutoIncrement, {inc_field: 'idTraspasosSolicitudV2'});

const TraspasosSolicitudV2 = mongoose.model('TraspasosSolicitudV2', traspasosSolicitudV2Schema)
module.exports = TraspasosSolicitudV2