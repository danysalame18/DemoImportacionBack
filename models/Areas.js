const mongoose = require ('mongoose')

const { Schema } = mongoose;

const areaSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    name:{
        type: String,
        required: true
    },
    mail:{
        type: String,
        // required: true
    }, 
    cargos:{
        type: Number,
    },
    abonos:{
        type: Number,
    },
    saldo:{
        type: Number,
    },
},
    {
    timestamps: true,
    versionKey: false
});

const Areas = mongoose.model('Areas', areaSchema)
module.exports = Areas