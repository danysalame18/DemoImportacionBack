const mongoose = require ('mongoose')

const { Schema } = mongoose;

const empresaSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    name:{
        type: String,
        required: true
    },
    prefijo:{
        type: String,
        default: "NA"
    },
    razonSocial:{
        type: String,
        default: "NA"
    },
    rfc:{
        type: String,
        default: "NA"
    },
    regimenFiscal:{
        type: String,
        default: "NA"
    },
    direccionFiscal:{
        type: String,
        default: "NA"
    },
    cp:{
        type: String,
        default: "NA"
    },
    listoFacturar:{
        type: String,
        default:"No"
    }
},
    {
    timestamps: true,
    versionKey: false
});

const Empresas = mongoose.model('Empresas', empresaSchema)
module.exports = Empresas