const mongoose = require('mongoose')

const { Schema } = mongoose;

// Códigos y tokens del MCP. Nunca se guarda el valor, sólo su SHA-256.
const mcpTokensSchema = new Schema({
    tipo: {
        type: String,
        enum: ['codigo', 'acceso', 'refresh'],
        required: true
    },
    hash: {
        type: String,
        required: true,
        unique: true
    },
    // Todos los tokens de una misma conexión: revocar uno corta la conexión entera
    conexion: {
        type: String,
        required: true
    },
    client_id: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scopes: [String],
    // Sólo en los códigos
    codeChallenge: String,
    redirectUri: String,
    // Cambia al cambiar la contraseña: la conexión se cae sola
    huella: {
        type: String,
        required: true
    },
    usado: {
        type: Date
    },
    revocado: {
        type: Boolean,
        default: false
    },
    expira: {
        type: Date,
        required: true
    }
},
    {
    timestamps: true,
    versionKey: false
});
mcpTokensSchema.index({ conexion: 1 });
mcpTokensSchema.index({ expira: 1 }, { expireAfterSeconds: 0 });

const McpTokens = mongoose.model('McpTokens', mcpTokensSchema)
module.exports = McpTokens;
