const mongoose = require ('mongoose')
const { Schema } = mongoose;

const detalleInsumosPedidosSchema = new Schema({
    cantidad:{
        type: Number,
        required: true,
    },
    insumosPedidos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InsumosPedidos'
        }],
    insumos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Insumos'
        }],
    pedidos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pedidos'
        }],
    proveedores:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Proveedores'
        }],
    fecha:{
        type: String,
        required: true,
    },
},
    {
    timestamps: true,
    versionKey: false
});


const DetalleInsumosPedidos = mongoose.model('DetalleInsumosPedidos', detalleInsumosPedidosSchema)
module.exports = DetalleInsumosPedidos;
