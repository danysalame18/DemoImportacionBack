const mongoose = require ('mongoose')

const { Schema } = mongoose;

const departamentoSchema = new Schema({
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

const Departamentos = mongoose.model('Departamentos', departamentoSchema)
module.exports = Departamentos