const mongoose = require ('mongoose')

const { Schema } = mongoose;

const proveedorSchema = new Schema({
    is_active:{
        type: String,
        default: "Si" 
    },
    nombre_comercial:{
        type: String,
        required: true  
    },
    razon_social:{
        type: String,
        required: true
    },
    RFC:{
        type: String,
        required: true  
    },
    calle:{
        type: String,
        required: true  
    },
    numero_ext:{
        type: String,
        required: true 
    },
    numero_int:{
        type: String,
        required: false  
    },
    delegacion:{
        type: String,
        required: true  
    },
    estado:{
        type: String,
        required: true  
    },
    pais:{
        type: String,
        required: true  
    },
    cp:{
        type: Number,
        required: true  
    },
    colonia:{
        type: String,
        required: true  
    },
    ciudad:{
        type: String,
        required: true  
    },
    contacto:{
        type: String,
        required: true  
    },
    telefono:{
        type: Number,
        required: true  
    },
    email:{
        type: String,
        required: true  
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
    tipo:{
        type: String,
    },
    subTipo:{
        type: String,
    },
    moneda:{
        type: String,
        required: true
    },
    codigo:{
        type: String,
        required: true  
    },
},
    {
    timestamps: true,
    versionKey: false
});

const Proveedores = mongoose.model('Proveedores', proveedorSchema)
module.exports = Proveedores;