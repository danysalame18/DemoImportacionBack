const mongoose = require ('mongoose')

const { Schema } = mongoose;

const cuentasClientesSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    banco:{
        type: String,
        required: true
    },
    rfc:{
        type: String,
        required: true
    },
    cuenta:{
        type: String,
        required: true
    },
    clientes:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clientes'
        }],
    },
    {
    timestamps: true,
    versionKey: false
});

const CuentasClientes = mongoose.model('CuentasClientes', cuentasClientesSchema)
module.exports = CuentasClientes