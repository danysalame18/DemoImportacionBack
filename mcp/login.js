// Pantalla donde el usuario autoriza a Claude con su correo y contraseña del sistema.
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const { Logs } = require('../models')
const UserService = require('../services/UserService')
const { comparePasswords } = require('../utils')
const { usuarioApto } = require('./tools')

const VIDA_FLUJO = 10 * 60 * 1000
const NOMBRE = () => process.env.REACT_APP_NOMBRE_INSTITUCION || 'Lynqro'
// Para que correo inexistente y contraseña mala tarden lo mismo
const HASH_FALSO = bcrypt.hashSync(crypto.randomUUID(), 10)

// Lleva los datos del flujo firmados. Se firma con HMAC y NO con jwt.sign: un JWT
// con JWT_SECRET lo aceptaría verifyToken como si fuera una sesión del sistema.
const llaveFlujo = () => crypto.createHmac('sha256', process.env.JWT_SECRET).update('mcp-flujo').digest()
const firma = (texto) => crypto.createHmac('sha256', llaveFlujo()).update(texto).digest('base64url')

function firmarFlujo(datos) {
  const texto = Buffer.from(JSON.stringify({ ...datos, exp: Date.now() + VIDA_FLUJO })).toString('base64url')
  return `${texto}.${firma(texto)}`
}

function leerFlujo(valor) {
  if (typeof valor !== 'string') return null
  const [texto, recibida] = valor.split('.')
  if (!texto || !recibida) return null
  const a = Buffer.from(firma(texto))
  const b = Buffer.from(recibida)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  const datos = JSON.parse(Buffer.from(texto, 'base64url').toString())
  return datos.exp > Date.now() ? datos : null
}

const html = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

const hostDe = (uri) => {
  try {
    return new URL(uri).host
  } catch (e) {
    return ''
  }
}

function pagina({ flujo, error, aviso, email }) {
  const logo = process.env.REACT_APP_LINK_SISTEMA ? `${process.env.REACT_APP_LINK_SISTEMA}logoInstitucion.png` : ''
  const destino = flujo ? `${flujo.cliente || 'Claude'} (${hostDe(flujo.redirectUri)})` : ''
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Conectar Claude</title>
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px;background:#f3f4f6;color:#1f2937;font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
main{width:100%;max-width:380px;background:#fff;border-radius:12px;padding:32px 28px;box-shadow:0 8px 24px rgba(0,0,0,.08)}
img{display:block;max-width:160px;max-height:72px;margin:0 auto 20px}
h1{font-size:19px;margin:0 0 8px;text-align:center}
p{margin:0 0 16px;color:#4b5563;font-size:14px}
label{display:block;font-size:13px;font-weight:600;margin-bottom:4px}
input{width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font:inherit;margin-bottom:14px}
input:focus{outline:2px solid #2563eb;outline-offset:-1px;border-color:#2563eb}
button{width:100%;padding:11px;border:0;border-radius:8px;background:#111827;color:#fff;font:inherit;font-weight:600;cursor:pointer}
button:hover{background:#374151}
.error{background:#fef2f2;color:#b91c1c;border-radius:8px;padding:9px 12px;font-size:14px;margin-bottom:14px}
small{display:block;margin-top:14px;text-align:center;color:#6b7280;font-size:12px}
</style></head><body><main>
${logo ? `<img src="${html(logo)}" alt="">` : ''}
<h1>Conectar Claude con ${html(NOMBRE())}</h1>
${aviso ? `<p>${html(aviso)}</p>` : `
<p>Entra con tu usuario del sistema. Claude sólo podrá consultar los módulos que ya tienes y no puede capturar ni modificar nada.</p>
${error ? `<div class="error" role="alert">${html(error)}</div>` : ''}
<form method="post" action="/oauth/login">
<input type="hidden" name="flujo" value="${html(firmarFlujo(flujo))}">
<label for="email">Correo</label>
<input id="email" name="email" type="email" autocomplete="username" value="${html(email)}" required autofocus>
<label for="password">Contraseña</label>
<input id="password" name="password" type="password" autocomplete="current-password" required>
<button type="submit">Conectar</button>
</form>
<small>Conexión para ${html(destino)}</small>`}
</main></body></html>`
}

function enviar(res, status, contenido) {
  res.set({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src https: data:; base-uri 'none'; frame-ancestors 'none'",
  })
  res.status(status).send(contenido)
}

function pantallaLogin(client, params, res) {
  const flujo = {
    client_id: client.client_id,
    cliente: client.client_name,
    redirectUri: params.redirectUri,
    codeChallenge: params.codeChallenge,
    state: params.state,
    scopes: params.scopes,
  }
  enviar(res, 200, pagina({ flujo }))
}

async function procesarLogin(req, res, emitirCodigo) {
  try {
    const flujo = leerFlujo(req.body?.flujo)
    if (!flujo) return enviar(res, 400, pagina({ aviso: 'La conexión venció. Vuelve a iniciarla desde Claude.' }))

    // El body acepta objetos anidados: sin esto email podría ser un filtro de Mongo
    const { email, password } = req.body
    const textos = typeof email === 'string' && typeof password === 'string'
    const user = textos ? await UserService.findOneLogin(email) : null
    const correcta = textos && comparePasswords(password, user?.password || HASH_FALSO)
    if (!user || !correcta) return enviar(res, 401, pagina({ flujo, email: textos ? email : '', error: 'Correo o contraseña incorrectos.' }))

    if (!usuarioApto(user)) {
      return enviar(res, 403, pagina({ flujo, email, error: 'Tu usuario no tiene módulos disponibles para conectar Claude.' }))
    }

    const codigo = await emitirCodigo(user, flujo)
    await new Logs({
      tipo: 'MCP',
      detalle: `Conectó ${flujo.cliente || 'Claude'}: ${user.nombre} ${user.apellido}`,
      user: user._id,
    }).save()

    const destino = new URL(flujo.redirectUri)
    destino.searchParams.set('code', codigo)
    if (flujo.state) destino.searchParams.set('state', flujo.state)
    return res.redirect(303, destino.href)
  } catch (err) {
    console.error('MCP login:', err?.message || err)
    return enviar(res, 500, pagina({ aviso: 'No se pudo completar la conexión. Intenta de nuevo.' }))
  }
}

const demasiadosIntentos = (req, res) => enviar(res, 429, pagina({ aviso: 'Demasiados intentos. Espera unos minutos.' }))

module.exports = { pantallaLogin, procesarLogin, demasiadosIntentos }
