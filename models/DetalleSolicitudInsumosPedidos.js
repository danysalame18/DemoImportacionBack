const mongoose = require ('mongoose')
const { Schema } = mongoose;

const detalleSolicitudInsumosPedidosSchema = new Schema({
    cantidad:{
        type: Number,
        required: true,
    },
    pedido:{
        type: Number,
        default:0,
    },
    pendientePedir:{
        type: Number,
        default:0,
    },
    solicitudInsumosPedidos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SolicitudInsumosPedidos'
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
   
},
    {
    timestamps: true,
    versionKey: false
});


const DetalleSolicitudInsumosPedidos = mongoose.model('DetalleSolicitudInsumosPedidos', detalleSolicitudInsumosPedidosSchema)
module.exports = DetalleSolicitudInsumosPedidos;
