const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const clienteSchema = new Schema({
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
        type: String,
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
    areas:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Areas'
    }],
    telefono:{
        type: String,
        required: true  
    },
    telefonoCompras:{
        type: String,
        required: true  
    },
    telefonoCobranza:{
        type: String,
        required: true  
    },
    encargadaPagos:{
        type: String,
        required: true  
    },
    email:{
        type: String,
        required: true  
    },
    grupos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Grupos'
        }],
    departamentosClientes:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DepartamentosClientes'
    }],
    vendedor: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Colaboradores'
        }
    ],
    observaciones:{
        type: String,
        default: 'NA'
    },
    ultimo_pago:{
        type: String,
        required: true  
    },
    forma_pago:{
        type: String,
        required: true  
    },
    // codigo:{
    //     type: String,
    //     required: true  
    // },
    calificadora:{
        type: Number,
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
    regFiscal:{
        type: Number,
        required: true  
    },
    plazo:{
        type: Number,
        required: true  
    },
    alertasVentas:{
        type: String,
    },
    alertasEdoCta:{
        type: String,
    },
    alertasMarketing:{
        type: String,
    },
    empresas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Empresas",
      },
    ],
    categoria:{
        type: String,
        default: 'Normal'
    },
    regFiscal:{
        type: Number,
        required: true, 
        default: 0  
    },
    usoCFDI:{
        type: String,
        required: true,
        default: "S01"   
    },
    formaPagoSAT:{
        type: String,
        required: true ,
        default: "99" 
    },
    condicionesPagoSAT:{
        type: String,
        required: true,
        default: "NA" 
    },
    metodoPagoSAT:{
        type: String,
        required: true ,
        default: "PPD"  
    },
    cargosk:{
        type: Number,
        default: 0
    },
    abonosk:{
        type: Number,
        default: 0
    },
    saldok:{
        type: Number,
        default: 0
    },
    fiscal:{
        type: String,
        default: 'No'
    },
    limiteCredito:{
        type: Number,
        default: 1000000
    },
    // Seguimiento de cobranza capturado desde EstadoCuenta.
    // Los dos primeros son el valor vigente (lo que se muestra en el listado);
    // historialCobranza guarda cada captura para consultarla despues.
    observacionesCobranza:{
        type: String,
        default: ""
    },
    fechaCompromiso:{
        type: String,
        default: ""
    },
    historialCobranza: [
        {
            fecha: { type: String },
            observaciones: { type: String },
            fechaCompromiso: { type: String },
            usuario: { type: String },
        }
    ],
},
    {
    timestamps: true,
    versionKey: false
});

clienteSchema.plugin(AutoIncrement, {inc_field: 'codigo'});
const Clientes = mongoose.model('Clientes', clienteSchema)
module.exports = Clientes;