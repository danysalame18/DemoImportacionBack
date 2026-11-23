# WhatsApp — Configuración y plantillas

> **TRANSPORTE ACTUAL: Contacta (OneChat) — BSP.** El cliente opera WhatsApp a
> través del proveedor **Contacta**, no directo con Meta. El transporte activo en
> `services/WhatsAppService.js` habla con la API de Contacta. Respaldos:
> `_backup_WhatsAppService.baileys.js` (no oficial) y
> `_backup_WhatsAppService.metacloud.js` (Meta directo).

## 0. Configuración Contacta (.env) — ACTIVA

```
WA_CONTACTA_URL=https://hub.onechat.mx/wab   # endpoint (default ya configurado)
WA_CONTACTA_USER=...                          # usuario (Basic auth) — lo da Contacta
WA_CONTACTA_PASS=...                          # contraseña (Basic auth) — lo da Contacta
WA_CONTACTA_AGENT=5215XXXXXXXXXX              # número de WhatsApp del negocio (campo "agent") — PENDIENTE
WA_DEFAULT_LANG=es_MX                         # idioma de plantillas (confirmar con Contacta: es_MX o es)
WA_MX_PREFIX=52                               # prefijo a destinatarios MX
API_KEY_CLOUDINARY=...                        # ya existe (se usa para subir PDFs y mandar su URL)
API_SECRET_CLOUDINARY=...                     # ya existe
```

- **Webhook:** configura en Contacta la URL `https://TU_DOMINIO/api/v1/whatsAppWebhook` (POST, **sin verificación**).
- **Documentos:** Contacta no recibe el archivo; el sistema sube el PDF a Cloudinary y manda la URL (`url` en sesión / `mediaUrl` en plantilla).
- **Plantillas:** darlas de alta vía soporte de Contacta (recomendado) o en Meta Suite (tarda en reflejarse por el polling). Mismo contenido del documento `Checklist_WhatsApp_Meta`.
- **Pendiente del cliente:** el número del negocio para `WA_CONTACTA_AGENT`.
- Formatos de Contacta: texto `{type:"text",agent,number,message}`, archivo `{type:"file",agent,number,url,filename}`, plantilla `{type:"template",...,templateData:{body:{placeholders:[...]},header:{type:"DOCUMENT",mediaUrl,filename}}}`.

---

## (Referencia) Meta Cloud API directo — NO activo

La sección siguiente describe la integración directa con Meta (respaldada en
`_backup_WhatsAppService.metacloud.js`), por si en el futuro se conecta sin BSP.

## 1. Variables de entorno (.env)

```
WA_CLOUD_TOKEN=EAAG...            # Token permanente del System User (Meta)
WA_PHONE_NUMBER_ID=1234567890     # Phone Number ID del número de WhatsApp
WA_WABA_ID=1234567890             # (opcional) WhatsApp Business Account ID
WA_API_VERSION=v21.0             # (opcional) versión de Graph API
WA_VERIFY_TOKEN=mi_token_secreto  # Token que tú inventas para verificar el webhook
WA_APP_SECRET=                    # (recomendado) App Secret para validar la firma del webhook
WA_DEFAULT_LANG=es_MX            # (opcional) idioma de las plantillas aprobadas
WA_MX_PREFIX=52                  # (opcional) prefijo al enviar a México
WA_MAX_RETRIES=2                 # (opcional) reintentos ante errores transitorios (red/5xx/429)
```

> Si defines `WA_APP_SECRET`, el webhook **rechaza** cualquier POST cuya firma
> `X-Hub-Signature-256` no coincida (recomendado en producción). Si lo dejas
> vacío, la validación se omite (útil sólo para pruebas).

> Si las plantillas se aprueban con el código de idioma `es` (en lugar de `es_MX`),
> cambia `WA_DEFAULT_LANG=es`. Debe coincidir EXACTAMENTE con el idioma aprobado.

## 2. Webhook

En **Meta > WhatsApp > Configuración > Webhooks**:

- **Callback URL:** `https://TU_DOMINIO/api/v1/whatsAppWebhook`
- **Verify token:** el mismo valor de `WA_VERIFY_TOKEN`
- **Campos suscritos:** `messages`

El endpoint `GET /api/v1/whatsAppWebhook` responde la verificación y
`POST /api/v1/whatsAppWebhook` recibe los mensajes entrantes (alimenta al chatbot).
Ambos son públicos (Meta los llama directamente, sin JWT).

## 3. Qué requiere plantilla y qué no

- **Chatbot (reactivo):** responde a un mensaje del cliente → viaja dentro de la
  ventana de 24 h como **mensaje de sesión libre**. NO requiere plantilla.
  Opciones soportadas: `hola`, `saldo`, `existencia`, `inventario`, `disponible`,
  `estado de cuenta`, `corte`.
- **Crons y envíos desde la UI (proactivos):** fuera de la ventana de 24 h →
  **requieren plantilla aprobada**. El código ya cae automáticamente a la plantilla
  correcta cuando un envío de sesión es rechazado por Meta.

## 4. Plantillas a dar de alta y enviar a Meta para verificación

Captúralas en **WhatsApp Manager > Plantillas de mensajes**. Categoría sugerida
para todas: **UTILITY** (Utilidad), idioma **Español (MX)**.

### 4.1 `saldo_recordatorio`  *(REQUERIDA — la usan los crons de saldo)*
- **Categoría:** UTILITY
- **Encabezado:** Ninguno
- **Cuerpo:**
  ```
  Hola {{1}}, te informamos que tu saldo actual es de {{2}}.
  Si deseas recibir tu estado de cuenta, responde a este mensaje con la palabra "Estado de cuenta".
  ```
- **Pie de página:** `American Fly`
- **Botones:** Respuesta rápida → `Estado de cuenta`
- **Ejemplos:** {{1}} = `Dani Salame`, {{2}} = `$15,000.00 USD`

### 4.2 `envio_estado_cuenta`  *(REQUERIDA — entrega de Estado de Cuenta en PDF)*
- **Categoría:** UTILITY
- **Encabezado:** **Documento** (PDF)
- **Cuerpo:**
  ```
  Hola {{1}}, adjuntamos tu Estado de Cuenta actualizado. Si tienes alguna duda, estamos a tus órdenes.
  ```
- **Pie de página:** `American Fly`
- **Ejemplos:** {{1}} = `Dani Salame`, documento de muestra `EdoCta.pdf`

### 4.3 `envio_documento`  *(REQUERIDA — entrega proactiva de PDFs: inventario, disponible, corte, notas, abonos…)*
- **Categoría:** UTILITY
- **Encabezado:** **Documento** (PDF)
- **Cuerpo:**
  ```
  Hola {{1}}, te compartimos el documento solicitado: {{2}}.
  ```
- **Pie de página:** `American Fly`
- **Ejemplos:** {{1}} = `Dani Salame`, {{2}} = `Inventario`, documento `Inventario.pdf`

### 4.4 `notificacion_general`  *(RECOMENDADA — respaldo de avisos de texto proactivos)*
- **Categoría:** UTILITY
- **Encabezado:** Ninguno
- **Cuerpo:**
  ```
  Hola, {{1}}
  ```
- **Pie de página:** `American Fly`
- **Ejemplos:** {{1}} = `tu pedido #1234 ya está listo para entrega.`

### 4.5 `menu_servicios`  *(OPCIONAL — re-enganche proactivo con el menú)*
- **Categoría:** UTILITY
- **Encabezado:** Ninguno
- **Cuerpo:**
  ```
  Hola, gracias por contactar a American Fly. Selecciona una opción o escríbela:

  • Saldo
  • Estado de cuenta
  • Existencia
  • Inventario
  • Disponible
  ```
- **Pie de página:** `American Fly`
- **Botones:** Respuesta rápida → `Saldo`, `Estado de cuenta`, `Disponible`

> El catálogo también está en código en `services/WhatsAppTemplates.js`
> (constante `CATALOGO_PARA_META`), por si quieres exponerlo en un endpoint.

## 5. Endpoints disponibles
- `GET  /api/v1/whatsAppWebhook`  — verificación del webhook (Meta, público)
- `POST /api/v1/whatsAppWebhook`  — recepción de mensajes (Meta, público, con firma)
- `GET  /api/v1/whatsAppStatus`   — estado (state=2 si está configurado)
- `GET  /api/v1/whatsAppTemplates`— catálogo de plantillas a dar de alta (JWT)
- `POST /api/v1/whatsAppSendMsg`  — texto (sesión, fallback a plantilla)
- `POST /api/v1/whatsAppSendPDF`  — documento (sesión, fallback a plantilla)
- `POST /api/v1/whatsAppSendPDFFront` — documento + caption (sesión, fallback)

## 6. Seguridad
- ✅ Implementado: validación de firma `X-Hub-Signature-256` del webhook
  (actívala definiendo `WA_APP_SECRET`).
- Pendiente recomendado: restringir CORS (hoy `origin:'*'`) al dominio del front.
