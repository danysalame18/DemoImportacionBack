const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const devolucionesProveedoresSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    fecha:{
        type: String,
        required: true
    },
    proveedores:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Proveedores'
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
    total_general:{
        type: Number,
        required: true
    },
    total_cantidad:{
        type: Number,
        required: true
    },
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
    aplicada:{
        type: String,
        default: "No"
    }
},
    {
    timestamps: true,
    versionKey: false
});

devolucionesProveedoresSchema.plugin(AutoIncrement, {inc_field: 'idDevolucionProveedor'});

const DevolucionesProveedores = mongoose.model('DevolucionesProveedores', devolucionesProveedoresSchema)
module.exports = DevolucionesProveedores