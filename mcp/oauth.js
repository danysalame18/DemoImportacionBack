// Servidor OAuth 2.1 del MCP sobre Mongo. El SDK resuelve el protocolo (metadata,
// registro, PKCE, errores); aquí sólo vive dónde se guardan clientes y tokens.
// Los tokens son aleatorios y opacos: NO son el JWT del sistema.
const crypto = require('crypto')
const {
  InvalidClientMetadataError,
  InvalidGrantError,
  InvalidTokenError,
} = require('@modelcontextprotocol/sdk/server/auth/errors.js')
const { McpClientes, McpTokens, User } = require('../models')
const { pantallaLogin } = require('./login')
const { usuarioApto } = require('./tools')

const MINUTOS = 60 * 1000
const VIDA_CODIGO = 5 * MINUTOS
const VIDA_ACCESO = 60 * MINUTOS
const VIDA_REFRESH = 30 * 24 * 60 * MINUTOS
// Si Claude reintenta un refresh ya usado (carrera o corte de red) no se tira la
// conexión; pasado este margen se trata como robo y se revoca toda.
const GRACIA_REFRESH = 60 * 1000

const SCOPE = 'erp.read'
const MAX_REGISTRO = 4000

const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex')
const aleatorio = () => crypto.randomBytes(32).toString('base64url')
const huellaDe = (user) => sha256(String(user.password)).slice(0, 32)

// Registrarse es público, así que sólo se acepta regresar a Claude o a una app
// local. Sin esto, una app falsa podría pedir el login real y quedarse el código.
const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]'])
function redirectPermitido(uri) {
  let u
  try {
    u = new URL(uri)
  } catch (e) {
    return false
  }
  if (u.protocol === 'http:') return LOOPBACK.has(u.hostname)
  return u.protocol === 'https:'
    && ['claude.ai', 'claude.com'].includes(u.hostname)
    && u.pathname === '/api/mcp/auth_callback'
}

async function guardarToken(tipo, vida, datos) {
  const valor = aleatorio()
  await McpTokens.create({ ...datos, tipo, hash: sha256(valor), expira: new Date(Date.now() + vida) })
  return valor
}

async function emitirTokens({ conexion, client_id, user, scopes, huella }) {
  const base = { conexion, client_id, user, scopes, huella }
  const [access_token, refresh_token] = await Promise.all([
    guardarToken('acceso', VIDA_ACCESO, base),
    guardarToken('refresh', VIDA_REFRESH, base),
  ])
  return {
    access_token,
    refresh_token,
    token_type: 'bearer',
    expires_in: VIDA_ACCESO / 1000,
    scope: scopes.join(' '),
  }
}

const revocarConexion = (conexion) => McpTokens.updateMany({ conexion }, { revocado: true })

// Lo llama la pantalla de login cuando la contraseña fue correcta
const emitirCodigo = (user, flujo) => guardarToken('codigo', VIDA_CODIGO, {
  conexion: crypto.randomUUID(),
  client_id: flujo.client_id,
  user: user._id,
  scopes: flujo.scopes?.length ? flujo.scopes : [SCOPE],
  codeChallenge: flujo.codeChallenge,
  redirectUri: flujo.redirectUri,
  huella: huellaDe(user),
})

const proveedor = {
  clientsStore: {
    getClient: async (clientId) => (await McpClientes.findOne({ client_id: clientId }).lean())?.datos,
    registerClient: async (cliente) => {
      if (!cliente.redirect_uris?.length || !cliente.redirect_uris.every(redirectPermitido)) {
        throw new InvalidClientMetadataError('redirect_uri no permitido')
      }
      // Este registro es público y sin login: que no sirva para llenar la base
      if (JSON.stringify(cliente).length > MAX_REGISTRO) {
        throw new InvalidClientMetadataError('Registro demasiado grande')
      }
      await McpClientes.create({ client_id: cliente.client_id, datos: cliente })
      return cliente
    },
  },

  authorize: async (client, params, res) => pantallaLogin(client, params, res),

  challengeForAuthorizationCode: async (client, codigo) => {
    const fila = await McpTokens.findOne({ hash: sha256(codigo), tipo: 'codigo', client_id: client.client_id }).lean()
    if (!fila) throw new InvalidGrantError('Código inválido')
    return fila.codeChallenge
  },

  exchangeAuthorizationCode: async (client, codigo, _verifier, redirectUri) => {
    // Atómico: dos peticiones con el mismo código no pueden ganar las dos
    const fila = await McpTokens.findOneAndUpdate(
      { hash: sha256(codigo), tipo: 'codigo', client_id: client.client_id, usado: null, revocado: false, expira: { $gt: new Date() } },
      { usado: new Date() },
      { new: true }
    ).lean()
    if (!fila) throw new InvalidGrantError('Código inválido o ya usado')
    if (redirectUri && redirectUri !== fila.redirectUri) throw new InvalidGrantError('redirect_uri no coincide')
    return emitirTokens(fila)
  },

  exchangeRefreshToken: async (client, refreshToken) => {
    const hash = sha256(refreshToken)
    const fila = await McpTokens.findOneAndUpdate(
      { hash, tipo: 'refresh', client_id: client.client_id, usado: null, revocado: false, expira: { $gt: new Date() } },
      { usado: new Date() },
      { new: true }
    ).lean()
    if (!fila) {
      const previo = await McpTokens.findOne({ hash, tipo: 'refresh', client_id: client.client_id }).lean()
      if (previo?.usado && Date.now() - new Date(previo.usado).getTime() > GRACIA_REFRESH) {
        await revocarConexion(previo.conexion)
      }
      throw new InvalidGrantError('Refresh token inválido')
    }
    const user = await User.findById(fila.user).lean()
    if (!usuarioApto(user) || huellaDe(user) !== fila.huella) {
      await revocarConexion(fila.conexion)
      throw new InvalidGrantError('El usuario ya no tiene acceso')
    }
    return emitirTokens(fila)
  },

  // Se consulta el usuario en cada petición: si le quitan un permiso, lo desactivan
  // o cambia su contraseña, surte efecto de inmediato y no hasta que venza el token.
  verifyAccessToken: async (token) => {
    const fila = await McpTokens.findOne({
      hash: sha256(token), tipo: 'acceso', revocado: false, expira: { $gt: new Date() },
    }).lean()
    if (!fila) throw new InvalidTokenError('Token inválido')
    const user = await User.findById(fila.user).lean()
    if (!usuarioApto(user) || huellaDe(user) !== fila.huella) {
      await revocarConexion(fila.conexion)
      throw new InvalidTokenError('El usuario ya no tiene acceso')
    }
    return {
      token,
      clientId: fila.client_id,
      scopes: fila.scopes,
      expiresAt: Math.floor(new Date(fila.expira).getTime() / 1000),
      extra: { user },
    }
  },

  revokeToken: async (client, { token }) => {
    const fila = await McpTokens.findOne({ hash: sha256(token), client_id: client.client_id }).lean()
    if (fila) await revocarConexion(fila.conexion)
  },
}

module.exports = { proveedor, emitirCodigo, SCOPE }
