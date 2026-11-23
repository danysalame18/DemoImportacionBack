// // app.js
// const { app } = require('./api');

// const PORT = process.env.PORT || 8080;
// const server = app.listen(PORT, () => {
//   console.log(`Listening on port ${PORT}`);
// });

// // Inicializa WhatsApp sin bloquear el arranque del server
// try {
//   const WhatsAppService = require('./services/WhatsAppService');
//   // llamar de forma asíncrona y tolerante a fallos:
//   setImmediate(() => {
//     WhatsAppService.create().catch(err => {
//       console.error('WA create() falló (no tumba el server):', err?.message || err);
//     });
//   });
// } catch (e) {
//   console.error('No se pudo cargar WhatsAppService (no crítico):', e?.message || e);
// }


const { app } = require("./api");
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));