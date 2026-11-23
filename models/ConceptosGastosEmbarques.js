const mongoose = require ('mongoose')

const { Schema } = mongoose;

const conceptosGastosEmbarquesSchema = new Schema({
    concepto:{
        type: String,
        required: true
    },
    estimado:{
        type: Number,
        required: true
    },
    fijo:{
        type: String,
        required: true
    },
},
    {
    timestamps: true,
    versionKey: false
});

const ConceptosGastosEmbarques = mongoose.model('ConceptosGastosEmbarques', conceptosGastosEmbarquesSchema)
module.exports = ConceptosGastosEmbarques