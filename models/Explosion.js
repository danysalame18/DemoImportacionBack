const mongoose = require ('mongoose')

const { Schema } = mongoose;

const explosionSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    clientes:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clientes'
        }],
    insumos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Insumos'
        }],
    cantidad:{
        type: Number,
        default: 0
    },
},
    {
    timestamps: true,
    versionKey: false
});

const Explosion = mongoose.model('Explosion', explosionSchema)
module.exports = Explosion