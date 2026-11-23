const mongoose = require ('mongoose')

const { Schema } = mongoose;

const tallaSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    name:{
        type: String,
        required: true
    },
},
    {
    timestamps: true,
    versionKey: false
});

const Tallas = mongoose.model('Tallas', tallaSchema)
module.exports = Tallas