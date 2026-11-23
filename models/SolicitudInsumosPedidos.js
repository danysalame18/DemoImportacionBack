const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const { Schema } = mongoose;

const solicitudInsumosPedidosSchema = new Schema({
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
},
    {
    timestamps: true,
    versionKey: false
});

solicitudInsumosPedidosSchema.plugin(AutoIncrement, {inc_field: 'idSolicitudInsumosPedidos'});

const SolicitudInsumosPedidos = mongoose.model('SolicitudInsumosPedidos', solicitudInsumosPedidosSchema)
module.exports = SolicitudInsumosPedidos