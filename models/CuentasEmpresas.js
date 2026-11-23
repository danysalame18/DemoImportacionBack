const mongoose = require ('mongoose')

const { Schema } = mongoose;

const cuentasEmpresasSchema = new Schema({
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
    empresas:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Empresas'
        }],
    },
    {
    timestamps: true,
    versionKey: false
});

const CuentasEmpresas = mongoose.model('CuentasEmpresas', cuentasEmpresasSchema)
module.exports = CuentasEmpresas