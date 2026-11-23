const mongoose = require ('mongoose')

const { Schema } = mongoose;

const brokerSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    name:{
        type: String,
        required: true
    },
},
    {
    timestamps: true,
    versionKey: false
});

const Brokers = mongoose.model('Brokers', brokerSchema)
module.exports = Brokers