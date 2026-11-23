const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const nominaSchema = new Schema({
    fecha:{
        type: String,
        required: true
    },
    pagado:{
        type: String,
        default: "No",
        required: true
    },
    importe:{
        type: Number,
        required: true,
    },
    comentarios:{
        type: String,
        default: 'n/a'
    },
    colaboradores:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Colaboradores'
        }],
    planteles:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Planteles'
    }],
    areas:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Areas'
    }]
},
    {
    timestamps: true,
    versionKey: false
});

nominaSchema.plugin(AutoIncrement, {inc_field: 'idNomina'});

const Nominas = mongoose.model('Nominas', nominaSchema)
module.exports = Nominas;