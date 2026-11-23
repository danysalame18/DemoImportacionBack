const mongoose = require ('mongoose')

const { Schema } = mongoose;

const gastosEmbarquesSchema = new Schema({
    conceptosGastosEmbarques:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConceptosGastosEmbarques'
    }],
    embarques:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Embarques'
    }],
    real:{
        type: Number,
        required: true
    },
    estimado:{
        type: Number,
        required: true
    },
},
    {
    timestamps: true,
    versionKey: false
});

const GastosEmbarques = mongoose.model('GastosEmbarques', gastosEmbarquesSchema)
module.exports = GastosEmbarques