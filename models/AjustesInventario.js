const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const ajustesInventarioSchema = new Schema({
    fecha:{
        type: String,
        required: true
    },
    areas:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Areas'
        }],
    observaciones:{
        type: String,
        required: true
    },
    total:{
        type: Number,
        required: true
    },
    user:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
    autorizado:{
        type: String,
        required: true
    },
    is_active:{
        type: String,
        default: "Si"
    },

},
    {
    timestamps: true,
    versionKey: false
});

ajustesInventarioSchema.plugin(AutoIncrement, {inc_field: 'idAjustesInventario'});

const AjustesInventario = mongoose.model('AjustesInventario', ajustesInventarioSchema)
module.exports = AjustesInventario