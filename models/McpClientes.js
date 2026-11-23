const mongoose = require('mongoose')

const { Schema } = mongoose;

// Aplicaciones registradas por OAuth (Dynamic Client Registration) para el MCP.
const mcpClientesSchema = new Schema({
    client_id: {
        type: String,
        required: true,
        unique: true
    },
    // Registro completo tal como lo pide el protocolo
    datos: {
        type: Schema.Types.Mixed,
        required: true
    }
},
    {
    timestamps: true,
    versionKey: false
});

const McpClientes = mongoose.model('McpClientes', mcpClientesSchema)
module.exports = McpClientes;
