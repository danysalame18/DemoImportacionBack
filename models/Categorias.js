const mongoose = require ('mongoose')

const { Schema } = mongoose;

const categoriaSchema = new Schema({
    name:{
        type: String,
        required: true
    }
},
    {
    timestamps: true,
    versionKey: false
});

const Categorias = mongoose.model('Categorias', categoriaSchema)
module.exports = Categorias