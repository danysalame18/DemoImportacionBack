const mongoose = require ('mongoose')

const { Schema } = mongoose;

const plantelSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    name:{
        type: String,
        required: true
    },
    direccion:{
        type: String,
        required: true
    },
    telefono:{
        type: String,
        required: true
    }
},
    {
    timestamps: true,
    versionKey: false
});

const Planteles = mongoose.model('Planteles', plantelSchema)
module.exports = Planteles;