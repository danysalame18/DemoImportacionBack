// Arma el servidor MCP de un usuario: solo ve las herramientas de sus modulos.
// Para gastar pocos tokens las herramientas regresan texto en tabla ("col|col"), no JSON.
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js')
const { Logs } = require('../models')
const { HERRAMIENTAS } = require('./tools')
const { FECHA_OK } = require('./util')

const MAX_CARACTERES = 40000

const instrucciones = () =>
  `ERP de ${process.env.REACT_APP_NOMBRE_INSTITUCION || 'Demo Importacion'} (ropa al mayoreo y tiendas). ` +
  'Mayoreo: pedido → nota (surtido); Tiendas: ventas de mostrador (Mixcalco). Montos MXN sin centavos; ' +
  'Venta = sin IVA y con descuento, menos devoluciones. Tienda Aby ya no se maneja aquí. ' +
  'Respuestas en tabla "col|col"; celda vacía = 0; si dicen saltar=N hay más renglones. Para "¿cómo vamos?" usa resumen. ' +
  'Para un PDF usa descargar_pdf y da el enlace tal cual (vence en 30 minutos). Solo consulta.'

function registrarUso(user, nombre, args) {
  new Logs({ tipo: 'MCP', detalle: `${nombre} ${JSON.stringify(args || {})}`.slice(0, 500), user: user._id })
    .save()
    .catch((err) => console.error('MCP log:', err?.message || err))
}

const texto = (t, isError) => ({ content: [{ type: 'text', text: t }], ...(isError ? { isError: true } : {}) })

function crearServidor(user) {
  const server = new McpServer(
    { name: 'demoimportacion-erp', title: process.env.REACT_APP_NOMBRE_INSTITUCION || 'Demo Importacion', version: '1.0.0' },
    { instructions: instrucciones() }
  )
  HERRAMIENTAS.filter((h) => !h.permiso || h.permiso(user)).forEach((h) => {
    server.registerTool(
      h.nombre,
      {
        title: h.titulo,
        // descripcion y entrada pueden depender del usuario (consultar solo lista sus modulos)
        description: typeof h.descripcion === 'function' ? h.descripcion(user) : h.descripcion,
        inputSchema: typeof h.entrada === 'function' ? h.entrada(user) : h.entrada,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      },
      async (args) => {
        registrarUso(user, h.nombre, args)
        const malas = ['desde', 'hasta'].filter((k) => args && args[k] !== undefined && !FECHA_OK.test(args[k]))
        if (malas.length) return texto(`${malas.join(' y ')}: usa AAAA-MM-DD`, true)
        try {
          const salida = await h.correr(args || {}, user)
          // PDF para descargar: texto corto con el enlace + el recurso
          if (salida && salida.__enlace) {
            return { content: [{ type: 'text', text: salida.texto }, { type: 'resource_link', ...salida.__enlace }] }
          }
          const t = typeof salida === 'string' ? salida : JSON.stringify(salida)
          if (t.length > MAX_CARACTERES) return texto('Resultado demasiado grande: usa un filtro o un límite menor.', true)
          return texto(t)
        } catch (err) {
          console.error(`MCP ${h.nombre}:`, err?.message || err)
          return texto(err?.paraUsuario ? err.message : 'No se pudo consultar. Intenta de nuevo.', true)
        }
      }
    )
  })
  return server
}

module.exports = { crearServidor }
