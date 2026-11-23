const mongoose = require ('mongoose')

const { Schema } = mongoose;

const logSchema = new Schema({
    tipo:{
        type: String,
        required: true
    },
    detalle:{
        type: String,
        required: true
    },
    user: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
},
    {
    timestamps: true,
    versionKey: false
});


const Logs = mongoose.model('Logs', logSchema)
module.exports = Logs;