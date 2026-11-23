const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const gastoGeneralSchema = new Schema({
    is_active:{
        type: String,
        default:"Si"
    },
    fecha:{
        type: String,
        required: true
    },
    subtotal:{
        type: Number,
        required: true,
    },
    iva:{
        type: Number,
        required: true,
    },
    total:{
        type: Number,
        required: true,
    },
    descripcion:{
        type: String,
        default: 'n/a'
    },
    areas:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Areas'
    }],
    conceptosGastos:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConceptosGastos'
    }],
    categorias:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categorias'
    }],
    empresas:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresas'
    }],
    subCategorias:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategorias'
    }],
    solicitantes:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Solicitantes'
    }],
    bancos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bancos",
      },
    ],
    fotoEvidencia:{
        type: String,
        default: "No"
      },
},
    {
    timestamps: true,
    versionKey: false
});

gastoGeneralSchema.plugin(AutoIncrement, {inc_field: 'idGastoGeneral'});
const GastosGeneral = mongoose.model('GastosGeneral', gastoGeneralSchema)
module.exports = GastosGeneral;