const mongoose = require ('mongoose')

const { Schema } = mongoose;

const conceptosGastoSchema = new Schema({
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

const ConceptosGastos = mongoose.model('ConceptosGastos', conceptosGastoSchema)
module.exports = ConceptosGastos