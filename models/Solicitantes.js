const mongoose = require ('mongoose')

const { Schema } = mongoose;

const solicitanteSchema = new Schema({
    name:{
        type: String,
        required: true
    }
},
    {
    timestamps: true,
    versionKey: false
});

const Solicitantes = mongoose.model('Solicitantes', solicitanteSchema)
module.exports = Solicitantes