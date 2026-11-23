const mongoose = require ('mongoose')

const { Schema } = mongoose;

const subCategoriaSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    categorias:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Categorias'
        }],
},
    {
    timestamps: true,
    versionKey: false
});

const SubCategorias = mongoose.model('SubCategorias', subCategoriaSchema)
module.exports = SubCategorias