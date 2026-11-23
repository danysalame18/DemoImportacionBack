const mongoose = require ('mongoose')
const { config } = require ('../config')


const { Schema } = mongoose;

const faltasColaboradorSchema = new Schema({
    colaboradores: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Colaboradores'
        }
    ],
    fecha:{
        type: String,
        required: true
    },
    justificada:{
        type: String,
        required: true
    },
    observaciones:{
        type: String,
        default: 'Sin observaciones'
    }
},
    {
    timestamps: true,
    versionKey: false
});

const FaltasColaboradores = mongoose.model('FaltasColaboradores', faltasColaboradorSchema)
module.exports = FaltasColaboradores;