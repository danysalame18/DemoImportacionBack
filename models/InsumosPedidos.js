const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const { Schema } = mongoose;

const insumosPedidosSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    pedidos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pedidos'
        }],
    fecha:{
        type: String,
    },
    clientes:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clientes'
    }],
    procesosSalida:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProcesosSalida'
    }],
    proveedores:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedores'
    }],
},
    {
    timestamps: true,
    versionKey: false
});

insumosPedidosSchema.plugin(AutoIncrement, {inc_field: 'idInsumosPedidos'});

const InsumosPedidos = mongoose.model('InsumosPedidos', insumosPedidosSchema)
module.exports = InsumosPedidos