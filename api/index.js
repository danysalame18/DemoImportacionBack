const express = require('express');
const app = express();
const cors = require('cors');
const config = require('../config');
const mongoose = require('mongoose');
require("dotenv").config();

const WhatsAppService = require('../services/WhatsAppService');
WhatsAppService.create();
// if(process.env.NODE_ENV == 'production'){
// WhatsAppService.create();
// }


// SET HERE YOUR CORS POLICY
// `origin: true` refleja el Origin de la petición en Access-Control-Allow-Origin.
// Es OBLIGATORIO cuando credentials:true (con "*" el navegador bloquea la respuesta).
const corsOptions ={
  origin: true,
  credentials:true,            //access-control-allow-credentials:true
  optionsSuccessStatus:200,
}

app.use(cors(corsOptions))

app.use(express.urlencoded({ extended: true , limit: '50mb'}));
// `verify` guarda el cuerpo crudo para validar la firma del webhook de Meta (X-Hub-Signature-256)
app.use(express.json({ extended: true , limit: '50mb', verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use('/public', express.static(`./storage/fotosAlumnos`))


// zlib: Atlas manda los documentos comprimidos; los listados grandes bajan ~10x (medido en CavannaImportacion)
mongoose.connect(
    config.db_url,
    { compression: { compressors: ['zlib'] } }
)
.then(()=> console.log('Connected to DB'))
.catch((err)=> console.log('Error on connection', err))

app.get('/', (request, response)=>{
    response.json({message: 'OK'})
})
app.use('/api/v1', require('../routes'))

// Conector MCP de consulta para Claude: solo se monta si existe MCP_PUBLIC_URL
require('../mcp')(app);

module.exports = { app }
