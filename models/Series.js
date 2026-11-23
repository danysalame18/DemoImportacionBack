const mongoose = require ('mongoose')

const { Schema } = mongoose;

const SeriesSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    serie:{
        type: String,
    },
    folio:{
        type: Number,
    }
},
    {
    timestamps: true,
    versionKey: false
});

const Series = mongoose.model('Series', SeriesSchema)
module.exports = Series