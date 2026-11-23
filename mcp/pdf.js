// (2026-11) PDFs desde Claude (MCP): el documento con sus renglones ("PDFOC") o el
// listado de un módulo con sus filtros y totales ("PDF"). Formato estándar para todos
// los módulos; los PDF de cada pantalla del sistema no cambian.
const { jsPDF } = require('jspdf')
const { applyPlugin } = require('jspdf-autotable')

applyPlugin(jsPDF)

const AZUL = [194, 94, 22]
const FONDO = [254, 243, 232]
const BORDE = [203, 213, 225]

const SIGLAS = { id: 'ID', op: 'OP', oc: 'OC', rfc: 'RFC', iva: 'IVA', cp: 'CP', pdf: 'PDF', pt: 'PT' }
// las claves vienen sin acentos
const ACENTOS = {
  cancelacion: 'cancelación', confirmacion: 'confirmación', composicion: 'composición', habilitacion: 'habilitación', articulo: 'artículo',
  articulos: 'artículos', almacen: 'almacén', numero: 'número', codigo: 'código', linea: 'línea', descripcion: 'descripción',
  autorizacion: 'autorización', direccion: 'dirección', telefono: 'teléfono', credito: 'crédito', ultimo: 'último', dias: 'días', antiguedad: 'antigüedad', vencidos: 'vencidos',
  coleccion: 'colección', razon: 'razón', compania: 'compañía', ubicacion: 'ubicación', produccion: 'producción', categoria: 'categoría',
}
// folio_pedido / fechaCancelacion → "Folio pedido" / "Fecha cancelacion"
function etiqueta(clave) {
  const palabras = String(clave)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim()
    .split(/\s+/)
    .map((p) => SIGLAS[p.toLowerCase()] || ACENTOS[p.toLowerCase()] || p.toLowerCase())
  if (!palabras.length) return ''
  palabras[0] = palabras[0].charAt(0).toUpperCase() + palabras[0].slice(1)
  return palabras.join(' ')
}

const num = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 })
// con decimales siempre dos (importes): 19,209.60 y no 19,209.6
const num2 = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
function valor(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'number') return Number.isInteger(v) ? num.format(v) : num2.format(v)
  if (typeof v === 'boolean') return v ? 'Sí' : 'No'
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  if (Array.isArray(v)) return v.map(valor).filter(Boolean).join(', ')
  if (typeof v === 'object') {
    return Object.entries(v)
      .filter(([, x]) => x !== '' && x !== null && x !== undefined)
      .map(([k, x]) => `${k}: ${valor(x)}`)
      .join(' · ')
  }
  return String(v)
}

const esNumero = (filas, c) => filas.some((f) => typeof f[c] === 'number') && filas.every((f) => f[c] === null || f[c] === undefined || f[c] === '' || typeof f[c] === 'number')

function columnasDe(filas) {
  const cols = []
  filas.forEach((f) => Object.keys(f || {}).forEach((c) => !cols.includes(c) && cols.push(c)))
  // sin columnas vacías en todo el reporte
  return cols.filter((c) => filas.some((f) => valor(f[c]) !== ''))
}

function nuevoDoc(horizontal) {
  return new jsPDF({ orientation: horizontal ? 'landscape' : 'portrait', unit: 'mm', format: 'letter' })
}

function encabezado(doc, { empresa, titulo, subtitulo }) {
  const W = doc.internal.pageSize.getWidth()
  doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(...AZUL)
  doc.text(String(empresa || '').toUpperCase(), 12, 14)
  doc.setFontSize(12)
  doc.text(String(titulo || ''), W - 12, 14, { align: 'right' })
  doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(90, 90, 90)
  if (subtitulo) doc.text(doc.splitTextToSize(String(subtitulo), W - 24), 12, 20)
  doc.setDrawColor(...AZUL).setLineWidth(0.5).line(12, 23.5, W - 12, 23.5)
  doc.setTextColor(0)
  return 27
}

function pie(doc, texto) {
  const n = doc.internal.getNumberOfPages()
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  for (let i = 1; i <= n; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(110, 110, 110)
    doc.text(texto, 12, H - 7)
    doc.text(`Página ${i} de ${n}`, W - 12, H - 7, { align: 'right' })
  }
}

function tabla(doc, y, { titulo, filas, totales }) {
  const W = doc.internal.pageSize.getWidth()
  if (titulo) {
    if (y > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage()
      y = 14
    }
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...AZUL)
    doc.text(titulo, 12, y + 4)
    doc.setTextColor(0)
    y += 6
  }
  if (!filas.length) {
    doc.setFont('helvetica', 'italic').setFontSize(8.5).setTextColor(110, 110, 110)
    doc.text('Sin renglones', 12, y + 4)
    doc.setTextColor(0)
    return y + 9
  }
  const cols = columnasDe(filas)
  const numericas = new Set(cols.filter((c) => esNumero(filas, c)))
  // columna con algun decimal (importes): todos sus numeros con dos decimales, total incluido
  const conDecimales = new Set(cols.filter((c) => filas.some((f) => typeof f[c] === 'number' && !Number.isInteger(f[c]))))
  const celda = (c, v) => (conDecimales.has(c) && typeof v === 'number' ? num2.format(v) : valor(v))
  const fuente = cols.length > 12 ? 6.2 : cols.length > 8 ? 7 : 8
  const foot = totales && Object.keys(totales).length
    ? [cols.map((c, i) => (totales[c] !== undefined ? celda(c, totales[c]) : i === 0 ? 'TOTAL' : ''))]
    : undefined
  doc.autoTable({
    startY: y,
    margin: { left: 12, right: 12, bottom: 14 },
    tableWidth: W - 24,
    head: [cols.map(etiqueta)],
    body: filas.map((f) => cols.map((c) => celda(c, f[c]))),
    foot,
    theme: 'grid',
    styles: { fontSize: fuente, cellPadding: 1.4, overflow: 'linebreak', lineColor: BORDE, lineWidth: 0.2, valign: 'middle' },
    headStyles: { fillColor: AZUL, textColor: 255, fontStyle: 'bold', fontSize: fuente },
    footStyles: { fillColor: FONDO, textColor: AZUL, fontStyle: 'bold' },
    columnStyles: Object.fromEntries(cols.map((c, i) => [i, numericas.has(c) ? { halign: 'right' } : {}])),
    showFoot: 'lastPage',
  })
  return doc.lastAutoTable.finalY + 6
}

// datos generales en una cuadrícula de 2 pares etiqueta/valor por renglón
function datosGenerales(doc, y, datos) {
  // escalares con valor y listas no vacías (los objetos anidados van en sus tablas)
  const pares = Object.entries(datos || {}).filter(([, v]) => (Array.isArray(v) ? v.length > 0 : typeof v !== 'object' && valor(v) !== ''))
  if (!pares.length) return y
  const W = doc.internal.pageSize.getWidth()
  const body = []
  for (let i = 0; i < pares.length; i += 2) {
    const [a, b] = [pares[i], pares[i + 1]]
    body.push([etiqueta(a[0]), valor(a[1]), b ? etiqueta(b[0]) : '', b ? valor(b[1]) : ''])
  }
  doc.autoTable({
    startY: y,
    margin: { left: 12, right: 12 },
    tableWidth: W - 24,
    body,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.4, lineColor: BORDE, lineWidth: 0.2 },
    columnStyles: {
      0: { fillColor: FONDO, textColor: AZUL, fontStyle: 'bold', cellWidth: 34 },
      2: { fillColor: FONDO, textColor: AZUL, fontStyle: 'bold', cellWidth: 34 },
    },
  })
  return doc.lastAutoTable.finalY + 6
}

const anchas = (secciones) => secciones.some((s) => columnasDe(s.filas || []).length > 7)

// Documento: datos generales + una o varias tablas (renglones, notas, órdenes...)
function pdfDocumento({ empresa, titulo, subtitulo, datos, secciones = [], pieTexto }) {
  const doc = nuevoDoc(anchas(secciones))
  let y = encabezado(doc, { empresa, titulo, subtitulo })
  y = datosGenerales(doc, y, datos)
  secciones.forEach((s) => { y = tabla(doc, y, s) })
  pie(doc, pieTexto)
  return { buffer: Buffer.from(doc.output('arraybuffer')), paginas: doc.internal.getNumberOfPages() }
}

// Listado: una tabla con totales
function pdfListado({ empresa, titulo, subtitulo, filas, totales, pieTexto }) {
  const doc = nuevoDoc(columnasDe(filas).length > 6)
  const y = encabezado(doc, { empresa, titulo, subtitulo })
  tabla(doc, y, { filas, totales })
  pie(doc, pieTexto)
  return { buffer: Buffer.from(doc.output('arraybuffer')), paginas: doc.internal.getNumberOfPages() }
}

module.exports = { pdfDocumento, pdfListado, etiqueta }
