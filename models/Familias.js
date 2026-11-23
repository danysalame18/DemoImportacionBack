const mongoose = require ('mongoose')

const { Schema } = mongoose;

const familiaSchema = new Schema({
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

const Familias = mongoose.model('Familias', familiaSchema)
module.exports = Familias