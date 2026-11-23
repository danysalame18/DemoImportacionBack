const mongoose = require ('mongoose')

const { Schema } = mongoose;

const colaboradorSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    nombre:{
        type: String,
        required: true
    },
    apellido:{
        type: String,
        required: true
    },
    identificacion:{
        type: String,
        required: true  
    },
    direccion:{
        type: String,
        required: true  
    },
    email:{
        type: String,
        required: true
    },
    puestos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Puestos'
        }
    ],
    fecha_ingreso:{
        type: String,
        required: true
    },
    fecha_nacimiento:{
        type: String,
        required: true
    },
    telefono:{
        type: Number,
        required: true
    },
    contacto_emergencia:{
        type: String,
        required: true
    },
    telefono_emergencia:{
        type: Number,
        required: true
    },
    ultimo_aumento:{
        type: String,
        required: false
    },
    sueldo_anterior:{
        type: Number,
        required: false
    },
    sueldo_actual:{
        type: Number,
        required: true
    },
    frecuencia: {
      type: String,
      required: true,
    },
    observaciones:{
        type: String,
        default: 'Sin observaciones'
    },
    banco:{
        type: String,
    },
    clabe:{
        type: String,
    },
    cobrador:{
        type: String,
        default: "No"
    },
    planteles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Planteles'
        }
    ],
    areas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Areas'
        }
    ],
    acceso_sistema:{
        type: String,
        default: "No"
    },
    vendedor:{
        type: String,
        default: "No"
    },
    comisiones:{
        type: Number,
        default:0
    },
    abonos:{
        type: Number,
        default:0
    },
},
    {
    timestamps: true,
    versionKey: false
});

const Colaboradores = mongoose.model('Colaboradores', colaboradorSchema)
module.exports = Colaboradores;