const mongoose = require ('mongoose')

const { Schema } = mongoose;

const grupoSchema = new Schema({
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

const Grupos = mongoose.model('Grupos', grupoSchema)
module.exports = Grupos;