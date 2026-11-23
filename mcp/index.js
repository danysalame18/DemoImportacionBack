// Conector MCP: permite conectar Claude al sistema. Sólo se monta si existe
// MCP_PUBLIC_URL (la URL pública del back, sin diagonal final).
const { rateLimit } = require('express-rate-limit')
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js')
const { mcpAuthRouter, getOAuthProtectedResourceMetadataUrl } = require('@modelcontextprotocol/sdk/server/auth/router.js')
const { requireBearerAuth } = require('@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js')
const { proveedor, emitirCodigo, SCOPE } = require('./oauth')
const { procesarLogin, demasiadosIntentos } = require('./login')
const { crearServidor } = require('./server')
const archivos = require('./archivos')

function montarMcp(app) {
  // Tolera un espacio, diagonal o punto de más al pegar la variable: Claude exige que
  // el recurso anunciado sea idéntico a la URL del conector y con eso rechaza la conexión.
  const base = String(process.env.MCP_PUBLIC_URL || '').trim().replace(/[/.]+$/, '')
  if (!base) return

  const urlBase = new URL(base)
  const urlMcp = new URL(`${base}/mcp`)

  // Railway va detrás de un proxy: sin esto todos los intentos de login contarían
  // como la misma IP y uno solo bloquearía a todos.
  app.set('trust proxy', 1)

  app.use(mcpAuthRouter({
    provider: proveedor,
    issuerUrl: urlBase,
    resourceServerUrl: urlMcp,
    scopesSupported: [SCOPE],
    resourceName: process.env.REACT_APP_NOMBRE_INSTITUCION || 'Lynqro',
  }))

  app.post('/oauth/login', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    handler: demasiadosIntentos,
  }), (req, res) => procesarLogin(req, res, emitirCodigo))

  const autenticar = requireBearerAuth({
    verifier: proveedor,
    resourceMetadataUrl: getOAuthProtectedResourceMetadataUrl(urlMcp),
  })

  // Sin sesiones en memoria: cada petición arma su servidor con los permisos
  // vigentes del usuario, así un reinicio de Railway no tira a nadie.
  app.post('/mcp', autenticar, async (req, res) => {
    const server = crearServidor(req.auth.extra.user)
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
    // server.close también cierra el transporte. Un rechazo sin atrapar tumbaría el back.
    res.on('close', () => server.close().catch(() => {}))
    try {
      await server.connect(transport)
      await transport.handleRequest(req, res, req.body)
    } catch (err) {
      console.error('MCP:', err?.message || err)
      if (!res.headersSent) {
        res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Error interno' }, id: null })
      }
    }
  })

  // PDFs generados con descargar_pdf: enlace temporal por token (30 min, sin sesion)
  app.get('/mcp/archivo/:token', rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false }), archivos.sirve)

  // Sin sesiones no hay canal de avisos (GET) ni sesión que cerrar (DELETE)
  app.all('/mcp', autenticar, (req, res) => {
    res.set('Allow', 'POST').status(405).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Método no permitido' }, id: null })
  })

  console.log(`MCP activo en ${urlMcp.href}`)
}

module.exports = montarMcp
