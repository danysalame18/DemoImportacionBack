const mongoose = require ('mongoose')

const { Schema } = mongoose;

const composicionSchema = new Schema({
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

const Composiciones = mongoose.model('Composiciones', composicionSchema)
module.exports = Composiciones