const mongoose = require ('mongoose')

const { Schema } = mongoose;

const departamentoClientesSchema = new Schema({
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

const DepartamentosClientes = mongoose.model('DepartamentosClientes', departamentoClientesSchema)
module.exports = DepartamentosClientes