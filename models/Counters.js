const mongoose = require ('mongoose')

const { Schema } = mongoose;

const counterSchema = new Schema({
    id:{
        type: String
    },
    seq:{
        type: Number
    }
},
    {
    timestamps: true,
    versionKey: false
});

const Counters = mongoose.model('Counters', counterSchema)
module.exports = Counters