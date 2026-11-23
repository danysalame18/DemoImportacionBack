const mongoose = require ('mongoose')

const { Schema } = mongoose;

const lineaSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    name:{
        type: String,
        required: true
    }
},
    {
    timestamps: true,
    versionKey: false
});

const Lineas = mongoose.model('Lineas', lineaSchema)
module.exports = Lineas