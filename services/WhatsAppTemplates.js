/**
 * WhatsAppTemplates.js
 * ---------------------------------------------------------------------------
 * Catálogo canónico de PLANTILLAS (Message Templates / HSM) de WhatsApp Cloud API.
 *
 * Meta exige plantillas pre-aprobadas para TODO mensaje proactivo
 * (iniciado por el negocio fuera de la ventana de 24 h de atención al cliente).
 * Los mensajes del chatbot que responden a un mensaje entrante NO necesitan
 * plantilla porque viajan dentro de la ventana de 24 h como mensajes de sesión.
 *
 * Este archivo cumple dos funciones:
 *   1) Definir el nombre/idioma/categoría exactos de cada plantilla, para que
 *      el código siempre envíe usando el identificador correcto.
 *   2) Documentar el contenido EXACTO que se debe dar de alta y enviar a Meta
 *      para verificación (ver `CATALOGO_PARA_META` al final).
 *
 * Idioma por defecto: es_MX. Cámbialo con WA_DEFAULT_LANG si tu plantilla
 * fue aprobada en otro código de idioma (p. ej. "es").
 * ---------------------------------------------------------------------------
 */

const LANG = (process.env.WA_DEFAULT_LANG || "es_MX").trim();

/**
 * Identificadores de cada plantilla tal como deben quedar dadas de alta en Meta.
 * El `name` debe coincidir EXACTAMENTE con el nombre aprobado en el WhatsApp
 * Manager (solo minúsculas, números y guion bajo).
 */
const TEMPLATES = {
  // Recordatorio de saldo (cron). Proactivo => requiere plantilla.
  // OJO: Contacta la dio de alta como "saldo_recordatorio_v1".
  SALDO_RECORDATORIO: { name: "saldo_recordatorio_v1", language: LANG, category: "UTILITY" },

  // Entrega de Estado de Cuenta en PDF. Proactivo / fallback fuera de ventana.
  ENVIO_ESTADO_CUENTA: { name: "envio_estado_cuenta", language: LANG, category: "UTILITY", header: "document" },

  // Entrega de cualquier documento PDF (inventario, disponible, corte, notas...).
  ENVIO_DOCUMENTO: { name: "envio_documento", language: LANG, category: "UTILITY", header: "document" },

  // Notificación de texto genérica (fallback de SendMsg proactivo fuera de ventana).
  NOTIFICACION_GENERAL: { name: "notificacion_general", language: LANG, category: "UTILITY" },

  // Menú de servicios para re-enganche proactivo (opcional).
  MENU_SERVICIOS: { name: "menu_servicios", language: LANG, category: "UTILITY" },
};

/* ===========================================================================
 *  CONSTRUCTORES DE `components`
 *  Devuelven el arreglo `components` que pide el endpoint de Graph API:
 *    POST /{phoneNumberId}/messages  con  template: { name, language, components }
 * =========================================================================== */

/** Variable de texto para el BODY ({{1}}, {{2}}, ...) */
function bodyParams(values = []) {
  if (!values.length) return [];
  return [
    {
      type: "body",
      parameters: values.map((v) => ({ type: "text", text: String(v ?? "") })),
    },
  ];
}

/** Header tipo DOCUMENT usando un media_id ya subido a Meta. */
function documentHeader(mediaId, fileName = "documento.pdf") {
  return {
    type: "header",
    parameters: [
      { type: "document", document: { id: mediaId, filename: fileName } },
    ],
  };
}

// ---- Builders por plantilla -------------------------------------------------

// saldo_recordatorio: body {{1}}=nombre, {{2}}=saldo
function buildSaldoRecordatorio(nombre, saldo) {
  return bodyParams([nombre, saldo]);
}

// envio_estado_cuenta: header DOCUMENT, body {{1}}=nombre
function buildEnvioEstadoCuenta(nombre, mediaId, fileName) {
  return [documentHeader(mediaId, fileName), ...bodyParams([nombre])];
}

// envio_documento: header DOCUMENT, body {{1}}=nombre, {{2}}=tipo de documento
function buildEnvioDocumento(nombre, tipoDocumento, mediaId, fileName) {
  return [documentHeader(mediaId, fileName), ...bodyParams([nombre, tipoDocumento])];
}

// notificacion_general: body {{1}}=mensaje
function buildNotificacionGeneral(mensaje) {
  return bodyParams([mensaje]);
}

// menu_servicios: sin variables (los botones son fijos en la plantilla)
function buildMenuServicios() {
  return [];
}

/* ===========================================================================
 *  CATÁLOGO PARA META (referencia de alta/verificación)
 *  Esto es lo que el cliente debe capturar en WhatsApp Manager > Plantillas.
 *  Se exporta para poder imprimirlo o exponerlo por un endpoint si se desea.
 * =========================================================================== */

const CATALOGO_PARA_META = [
  {
    nombre: "saldo_recordatorio",
    categoria: "UTILITY",
    idioma: LANG,
    encabezado: "Ninguno",
    cuerpo:
      'Hola {{1}}, te informamos que tu saldo actual es de {{2}}.\n' +
      'Si deseas recibir tu estado de cuenta, responde a este mensaje con la palabra "Estado de cuenta".',
    pie: "Demo Importacion",
    botones: [{ tipo: "QUICK_REPLY", texto: "Estado de cuenta" }],
    ejemplo: { "{{1}}": "Dani Salame", "{{2}}": "$15,000.00 USD" },
    usadaEn: "Cron saldoSemanal / saldoSemanalMorosos (ClientesController.js)",
  },
  {
    nombre: "envio_estado_cuenta",
    categoria: "UTILITY",
    idioma: LANG,
    encabezado: "DOCUMENTO (PDF)",
    cuerpo:
      "Hola {{1}}, adjuntamos tu Estado de Cuenta actualizado. " +
      "Si tienes alguna duda, estamos a tus órdenes.",
    pie: "Demo Importacion",
    botones: [],
    ejemplo: { "{{1}}": "Dani Salame", header: "EdoCta.pdf" },
    usadaEn: "Entrega de Estado de Cuenta (chatbot fuera de ventana / front SendPDF)",
  },
  {
    nombre: "envio_documento",
    categoria: "UTILITY",
    idioma: LANG,
    encabezado: "DOCUMENTO (PDF)",
    // Meta no permite que el cuerpo termine en variable: cerramos con texto fijo.
    cuerpo: "Hola {{1}}, te compartimos el documento solicitado: {{2}}. Quedamos atentos a cualquier duda.",
    pie: "Demo Importacion",
    botones: [],
    ejemplo: { "{{1}}": "Dani Salame", "{{2}}": "Inventario", header: "Inventario.pdf" },
    usadaEn:
      "Entrega de PDFs proactivos: inventario, disponible, corte, notas, abonos (front SendPDF/SendPDFFront, fallback chatbot)",
  },
  {
    nombre: "notificacion_general",
    categoria: "UTILITY",
    idioma: LANG,
    encabezado: "Ninguno",
    // Meta no permite "todo el mensaje en una variable" ni empezar/terminar con
    // variable: el dato dinámico va en {{1}}, enmarcado con texto fijo.
    cuerpo: "Hola, te informamos lo siguiente: {{1}}. Para cualquier duda, estamos a tus órdenes.",
    pie: "Demo Importacion",
    botones: [],
    ejemplo: { "{{1}}": "tu pedido #1234 ya está listo para entrega" },
    usadaEn: "Fallback de SendMsg proactivo fuera de la ventana de 24 h",
  },
  {
    nombre: "menu_servicios",
    categoria: "UTILITY",
    idioma: LANG,
    encabezado: "Ninguno",
    cuerpo:
      "Hola, gracias por contactar a Demo Importacion. " +
      "Selecciona una opción o escríbela:\n\n" +
      "• Saldo\n• Estado de cuenta\n• Existencia\n• Inventario\n• Disponible",
    pie: "Demo Importacion",
    botones: [
      { tipo: "QUICK_REPLY", texto: "Saldo" },
      { tipo: "QUICK_REPLY", texto: "Estado de cuenta" },
      { tipo: "QUICK_REPLY", texto: "Disponible" },
    ],
    ejemplo: {},
    usadaEn: "Re-enganche proactivo opcional (no se usa en respuestas del chatbot)",
  },
];

module.exports = {
  LANG,
  TEMPLATES,
  // builders
  buildSaldoRecordatorio,
  buildEnvioEstadoCuenta,
  buildEnvioDocumento,
  buildNotificacionGeneral,
  buildMenuServicios,
  // helpers de bajo nivel
  bodyParams,
  documentHeader,
  // referencia
  CATALOGO_PARA_META,
};
