const mongoose = require ('mongoose')

const { Schema } = mongoose;

const puestoSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    name:{
        type: String,
        required: true
    },
    colaboradores:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colaboradores'
    }],
    areas:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Areas'
        }],
    planteles:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Planteles'
        }]
},
    {
    timestamps: true,
    versionKey: false
});

const Puestos = mongoose.model('Puestos', puestoSchema)
module.exports = Puestos;