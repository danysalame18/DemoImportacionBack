const mongoose = require ('mongoose')

const { Schema } = mongoose;

const inventariosSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    articulos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Articulos'
        }],
    cantidad:{
        type: Number,
        default: 0
    },
    costoUnitario:{
        type: Number,
        default: 0
    },
    areas:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Areas'
    }],
},
    {
    timestamps: true,
    versionKey: false
});

const Inventarios = mongoose.model('Inventarios', inventariosSchema)
module.exports = Inventarios