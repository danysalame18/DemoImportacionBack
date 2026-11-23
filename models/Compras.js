const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const comprasSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    fecha:{
        type: String,
        required: true
    },
    factura:{
        type: String,
        required: true
    },
    embarques:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Embarques'
        }],
    user:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
    areas:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Areas'
    }],
    observaciones:{
        type: String,
        required: true
    },
    total_cantidad:{
        type: Number,
        required: true
    },
    tipoCambio:{
        type: Number,
        required: true
    },
    reciboDeposito:{
        type: String,
        required: true
    },
    fotoEvidencia:{
        type: String,
        default: "No"
      },
},
    {
    timestamps: true,
    versionKey: false
});

comprasSchema.plugin(AutoIncrement, {inc_field: 'idCompras'});

const Compras = mongoose.model('Compras', comprasSchema)
module.exports = Compras