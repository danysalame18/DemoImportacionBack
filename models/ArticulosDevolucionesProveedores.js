const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosDevolucionesProveedoresSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    devolucionesProveedores:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DevolucionesProveedores'
        }],
    articulos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Articulos'
        }],
    cantidad:{
        type: Number,
        required: true
    },
    precio:{
        type: Number,
        required: true
    },
    total:{
        type: Number,
        required: true
    },
},
    {
    timestamps: true,
    versionKey: false
});

const ArticulosDevolucionesProveedores = mongoose.model('ArticulosDevolucionesProveedores', articulosDevolucionesProveedoresSchema)
module.exports = ArticulosDevolucionesProveedores