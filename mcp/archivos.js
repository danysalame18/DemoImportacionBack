// (2026-11) PDFs generados para Claude: se guardan en memoria y se descargan con un
// enlace de un solo uso por token (vence en 30 minutos). No requiere sesión: el token
// es aleatorio y largo. Un reinicio del back borra los enlaces; se vuelven a pedir.
const crypto = require('crypto')

const VIGENCIA_MS = 30 * 60 * 1000
const MAXIMO = 200
const ARCHIVOS = new Map()

function limpia() {
  const ahora = Date.now()
  for (const [t, a] of ARCHIVOS) if (a.expira < ahora) ARCHIVOS.delete(t)
  while (ARCHIVOS.size > MAXIMO) ARCHIVOS.delete(ARCHIVOS.keys().next().value)
}

function guarda(buffer, nombre) {
  limpia()
  const token = crypto.randomBytes(24).toString('hex')
  ARCHIVOS.set(token, { buffer, nombre, expira: Date.now() + VIGENCIA_MS })
  return token
}

function sirve(req, res) {
  const a = ARCHIVOS.get(String(req.params.token || ''))
  if (!a || a.expira < Date.now()) {
    return res.status(404).type('text/plain; charset=utf-8').send('El enlace ya venció. Pídele a Claude el PDF otra vez.')
  }
  res.set('Content-Type', 'application/pdf')
  res.set('Content-Disposition', `inline; filename="${a.nombre.replace(/[^\w.\- ]/g, '_')}"`)
  res.set('Cache-Control', 'no-store')
  res.send(a.buffer)
}

module.exports = { guarda, sirve, VIGENCIA_MS }
