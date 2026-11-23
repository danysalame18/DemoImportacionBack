const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const traspasosDineroSchema = new Schema({
    fecha:{
        type: String,
        required: true
    },
    importe:{
        type: Number,
        required: true,
    },
    entrada:{
        type: String,
        default: 'No'
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

traspasosDineroSchema.plugin(AutoIncrement, {inc_field: 'idTraspasosDinero'});
const TraspasosDinero = mongoose.model('TraspasosDinero', traspasosDineroSchema)
module.exports = TraspasosDinero;