const mongoose = require ('mongoose')

const { Schema } = mongoose;

const inventariosHabSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    insumos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Insumos'
        }],
    cantidad:{
        type: Number,
        required: true
    },
},
    {
    timestamps: true,
    versionKey: false
});

const InventariosHab = mongoose.model('InventariosHab', inventariosHabSchema)
module.exports = InventariosHab