const mongoose = require ('mongoose')

const { Schema } = mongoose;

const colorSchema = new Schema({
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

const Colores = mongoose.model('Colores', colorSchema)
module.exports = Colores