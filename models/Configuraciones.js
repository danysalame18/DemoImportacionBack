const mongoose = require ('mongoose')

const { Schema } = mongoose;

const configuracionSchema = new Schema({
    emailCorteDiario:{
        type: Array,
        default:null
    }
},
    {
    timestamps: true,
    versionKey: false
});

const Configuraciones = mongoose.model('Configuraciones', configuracionSchema)
module.exports = Configuraciones