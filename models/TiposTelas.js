const mongoose = require ('mongoose')

const { Schema } = mongoose;

const tipoTelaSchema = new Schema({
    name:{
        type: String,
        required: true
    }
},
    {
    timestamps: true,
    versionKey: false
});

const TiposTelas = mongoose.model('TiposTelas', tipoTelaSchema)
module.exports = TiposTelas