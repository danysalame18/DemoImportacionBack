// Ayudas de las herramientas del MCP de AmericanFly.
const { z } = require('zod')

// Railway corre en UTC: en la noche de Mexico ya seria manana
const hoyStr = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date())
const inicioMes = () => `${hoyStr().slice(0, 7)}-01`
// Suma dias a una fecha AAAA-MM-DD
const sumaDias = (f, n) => {
  const d = new Date(`${f}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
const r = (n) => Math.round(Number(n || 0))
const idDe = (v) => String((v && v._id) || v || '')
const corto = (t, n = 38) => {
  const s = String(t || '').replace(/\s+/g, ' ').trim()
  return s.length > n ? `${s.slice(0, n - 1)}…` : s
}
const normaliza = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
// Todas las palabras, sin acentos ni mayusculas, en cualquier orden
const coincide = (q, ...campos) => {
  const t = normaliza(campos.join(' '))
  return normaliza(q).split(/\s+/).filter(Boolean).every((p) => t.includes(p))
}

const celda = (v) => String(v ?? '').replace(/[|\n\r]+/g, '/').trim()

// Tabla compacta: encabezado y renglones con "|". Mucho mas corta que JSON (no repite llaves).
// Las columnas vacias en todo el trozo se quitan (un 0 si se queda: es dato).
function tabla(cols, filas, { limite = 25, saltar = 0, pie = '' } = {}) {
  const trozo = filas.slice(saltar, saltar + limite).map((f) => f.map(celda))
  const resto = filas.length - saltar - trozo.length
  const vivas = cols.map((_, i) => !trozo.length || trozo.some((f) => f[i] !== ''))
  const solo = (f) => f.filter((_, i) => vivas[i]).join('|')
  const lineas = [solo(cols), ...trozo.map(solo)]
  lineas.push(`${trozo.length} de ${filas.length}${resto > 0 ? ` · saltar=${saltar + trozo.length} para ver ${resto} más` : ''}`)
  if (pie) lineas.push(pie)
  return lineas.join('\n')
}

// Corre un handler de Express tal cual, para que los numeros cuadren con la pantalla
function llamar(handler, req = {}) {
  return new Promise((resolve, reject) => {
    const res = {
      codigo: 200,
      status(c) { this.codigo = c; return this },
      json(d) { this.codigo < 400 ? resolve(d) : reject(new Error((d && d.message) || `Error ${this.codigo}`)) },
    }
    Promise.resolve(handler({ params: {}, query: {}, body: {}, ...req }, res)).catch(reject)
  })
}

function errorUsuario(mensaje) {
  const err = new Error(mensaje)
  err.paraUsuario = true
  return err
}

// Esquemas cortos: cada caracter viaja en cada mensaje. El formato de fecha se valida en server.js
const limite = (d = 25) => z.number().int().min(1).max(300).default(d)
const saltar = () => z.number().int().min(0).default(0)
const fecha = (d) => z.string().optional().describe(d || 'AAAA-MM-DD')
const FECHA_OK = /^\d{4}-\d{2}-\d{2}$/

module.exports = { FECHA_OK, hoyStr, inicioMes, sumaDias, celda, r, idDe, corto, normaliza, coincide, tabla, llamar, errorUsuario, limite, saltar, fecha }
