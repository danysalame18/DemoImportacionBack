const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const pedidosSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    autorizadoApartado:{
        type: String,
        default: "Si"
    },
    autorizadoSurtido:{
        type: String,
        default: "Si"
    },
    fecha:{
        type: String,
        required: true
    },
    clientes:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clientes'
        }],
    colaboradores:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Colaboradores'
        }],
    paqueteria:{
        type: String,
        required: true
    },
    areas:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Areas'
        }],
    observaciones:{
        type: String,
        required: true
    },
    total_general:{
        type: Number,
        required: true
    },
    total_cantidad:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        default: "Abierto"
    },
    comisionTDC:{
        type: Number,
        required: true
    },
    comisionFlete:{
        type: Number,
        required: true
    },
    autorizoApartado:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    autorizoSurtido:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    editPedido:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    editArticulos:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    subTotal:{
        type: Number,
        required: true
    },
    iva:{
        type: Number,
        required: true
    },
    impuestos:{
        type: Number,
        required: true
    },
    surtido:{
        type: String,
        default: "No"
    },
    editado:{
        type: String,
        default: "No"
    },
    fechaModificado:{
        type: String,
        required: true
    },
    creado:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
    departamentosClientes:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DepartamentosClientes'
        }],
    fecha_estimada:{
        type: String,
    },
    fecha_entrega:{
        type: String,
    },
    entregaInsumos:{
        type: String,
        default:"No"
    },
    fechaInicio:{
        type: String,
    },
    fechaCancelacion:{
        type: String,
    },
    piezasEntregadas:{
        type: Number,
    },
    piezasPendientes:{
        type: Number,
    },
    descuento:{
        type: Number,
        default: 0
    },
},
    {
    timestamps: true,
    versionKey: false
});

pedidosSchema.plugin(AutoIncrement, {inc_field: 'idPedido'});

const Pedidos = mongoose.model('Pedidos', pedidosSchema)
module.exports = Pedidos