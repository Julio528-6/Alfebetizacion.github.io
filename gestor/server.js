/* ==========================================================================
   GESTOR DE CONTENIDOS WEB — SERVER.JS
   Servidor Local Ligero (localhost) para Habilitar Acceso Directo al Disco
   ========================================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const ROOT_DIR = path.join(__dirname, '..');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.json': 'application/json',
    '.ico': 'image/x-icon'
};

/* --------------------------------------------------------------------------
   Cabeceras CORS — se aplican a todas las respuestas de la API
   -------------------------------------------------------------------------- */
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

/* --------------------------------------------------------------------------
   Utilidad: responder JSON con cabeceras CORS
   -------------------------------------------------------------------------- */
function responderJSON(res, statusCode, obj) {
    res.writeHead(statusCode, {
        ...CORS_HEADERS,
        'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify(obj));
}

/* --------------------------------------------------------------------------
   Utilidad: validar que una ruta resuelta permanezca dentro de ROOT_DIR
   -------------------------------------------------------------------------- */
function rutaSegura(rutaResuelta) {
    const normalizada = path.resolve(rutaResuelta);
    return normalizada.startsWith(ROOT_DIR);
}

/* --------------------------------------------------------------------------
   Utilidad: leer todo el cuerpo de la petición como Buffer
   -------------------------------------------------------------------------- */
function leerCuerpo(req) {
    return new Promise((resolve, reject) => {
        const partes = [];
        req.on('data', (chunk) => partes.push(chunk));
        req.on('end', () => resolve(Buffer.concat(partes)));
        req.on('error', reject);
    });
}

/* --------------------------------------------------------------------------
   Parser multipart/form-data simplificado (sin dependencias externas).
   Soporta campos de texto y un campo binario ("archivo").
   -------------------------------------------------------------------------- */
function parsearMultipart(buffer, boundary) {
    const campos = {};       // campos de texto
    let archivoBuf = null;   // contenido binario del campo "archivo"

    // El delimitador de cada parte es: --boundary
    const delimitador = Buffer.from('--' + boundary);
    const finDelimitador = Buffer.from('--' + boundary + '--');

    // Buscar todas las posiciones del delimitador en el buffer
    const posiciones = [];
    let inicio = 0;
    while (inicio < buffer.length) {
        const idx = buffer.indexOf(delimitador, inicio);
        if (idx === -1) break;
        posiciones.push(idx);
        inicio = idx + delimitador.length;
    }

    // Cada "parte" está entre dos delimitadores consecutivos
    for (let i = 0; i < posiciones.length - 1; i++) {
        // Contenido entre delimitadores (saltando el delimitador + CRLF)
        const parteInicio = posiciones[i] + delimitador.length + 2; // +2 para saltar \r\n
        const parteFin = posiciones[i + 1];
        const parte = buffer.slice(parteInicio, parteFin);

        // Separar cabeceras del cuerpo de la parte (doble CRLF)
        const separador = Buffer.from('\r\n\r\n');
        const sepIdx = parte.indexOf(separador);
        if (sepIdx === -1) continue;

        const cabeceraStr = parte.slice(0, sepIdx).toString('utf-8');
        // El cuerpo termina antes del último \r\n previo al siguiente delimitador
        const cuerpoParte = parte.slice(sepIdx + 4, parte.length - 2); // -2 quita \r\n final

        // Extraer el nombre del campo desde Content-Disposition
        const matchNombre = cabeceraStr.match(/name="([^"]+)"/);
        if (!matchNombre) continue;
        const nombreCampo = matchNombre[1];

        // Si tiene filename es un archivo binario; si no, es texto
        const esArchivo = /filename="/.test(cabeceraStr);
        if (esArchivo) {
            archivoBuf = cuerpoParte;
        } else {
            campos[nombreCampo] = cuerpoParte.toString('utf-8');
        }
    }

    return { campos, archivoBuf };
}

/* --------------------------------------------------------------------------
   Handler API: GET /api/status
   Indica al frontend que el servidor local está activo.
   -------------------------------------------------------------------------- */
function manejarStatus(req, res) {
    responderJSON(res, 200, { ok: true, mode: 'servidor-local' });
}

/* --------------------------------------------------------------------------
   Handler API: POST /api/guardar-archivo
   Recibe multipart/form-data con: archivo (binario), subcarpeta, nombre.
   Guarda el archivo en ROOT_DIR/subcarpeta/nombre.
   -------------------------------------------------------------------------- */
async function manejarGuardarArchivo(req, res) {
    try {
        // Extraer boundary del Content-Type de forma robusta
        const contentType = req.headers['content-type'] || '';
        const matchBoundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        if (!matchBoundary) {
            return responderJSON(res, 400, { ok: false, error: 'Falta boundary en Content-Type' });
        }
        const boundary = (matchBoundary[1] || matchBoundary[2] || '').trim();

        const cuerpo = await leerCuerpo(req);
        const { campos, archivoBuf } = parsearMultipart(cuerpo, boundary);

        const subcarpeta = (campos.subcarpeta || '').trim();
        const nombre = (campos.nombre || '').trim();

        if (!nombre) {
            return responderJSON(res, 400, { ok: false, error: 'El campo "nombre" es obligatorio' });
        }
        if (!archivoBuf) {
            return responderJSON(res, 400, { ok: false, error: 'No se recibió el archivo' });
        }

        // Construir ruta destino y validar seguridad
        const dirDestino = path.join(ROOT_DIR, subcarpeta);
        const rutaCompleta = path.join(dirDestino, nombre);

        if (!rutaSegura(dirDestino) || !rutaSegura(rutaCompleta)) {
            return responderJSON(res, 403, { ok: false, error: 'Ruta fuera del directorio permitido' });
        }

        // Crear subdirectorios si no existen
        fs.mkdirSync(dirDestino, { recursive: true });

        // Escribir el archivo
        fs.writeFileSync(rutaCompleta, archivoBuf);

        responderJSON(res, 200, { ok: true });
    } catch (err) {
        responderJSON(res, 500, { ok: false, error: err.message });
    }
}

/* --------------------------------------------------------------------------
   Handler API: POST /api/actualizar-html
   Recibe JSON: { archivoHTML, patronInsercion, htmlFragmento, posicion }
   Inserta el fragmento HTML antes o después del patrón en el archivo.
   -------------------------------------------------------------------------- */
async function manejarActualizarHTML(req, res) {
    try {
        const cuerpo = await leerCuerpo(req);
        let datos;
        try {
            datos = JSON.parse(cuerpo.toString('utf-8'));
        } catch (e) {
            return responderJSON(res, 400, { ok: false, error: 'JSON inválido en el cuerpo de la petición' });
        }

        const { archivoHTML, patronInsercion, htmlFragmento, posicion } = datos;

        if (!archivoHTML || !patronInsercion || !htmlFragmento) {
            return responderJSON(res, 400, { ok: false, error: 'Faltan campos obligatorios: archivoHTML, patronInsercion, htmlFragmento' });
        }

        // Construir ruta y validar seguridad
        const rutaArchivo = path.join(ROOT_DIR, archivoHTML);
        if (!rutaSegura(rutaArchivo)) {
            return responderJSON(res, 403, { ok: false, error: 'Ruta fuera del directorio permitido' });
        }

        // Leer el archivo HTML existente
        if (!fs.existsSync(rutaArchivo)) {
            return responderJSON(res, 404, { ok: false, error: `Archivo no encontrado: ${archivoHTML}` });
        }

        let contenidoHTML = fs.readFileSync(rutaArchivo, 'utf-8');

        // Buscar el patrón de inserción
        const idxPatron = contenidoHTML.indexOf(patronInsercion);
        if (idxPatron === -1) {
            return responderJSON(res, 400, { ok: false, error: `Patrón de inserción no encontrado en ${archivoHTML}` });
        }

        // Insertar el fragmento antes o después del patrón
        if (posicion === 'antes') {
            contenidoHTML =
                contenidoHTML.slice(0, idxPatron) +
                htmlFragmento +
                contenidoHTML.slice(idxPatron);
        } else {
            // Por defecto: "después"
            const finPatron = idxPatron + patronInsercion.length;
            contenidoHTML =
                contenidoHTML.slice(0, finPatron) +
                htmlFragmento +
                contenidoHTML.slice(finPatron);
        }

        // Escribir el archivo modificado
        fs.writeFileSync(rutaArchivo, contenidoHTML, 'utf-8');

        responderJSON(res, 200, { ok: true });
    } catch (err) {
        responderJSON(res, 500, { ok: false, error: err.message });
    }
}

/* ==========================================================================
   SERVIDOR HTTP — Maneja tanto la API REST como los archivos estáticos
   ========================================================================== */
const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];

    /* ------------------------------------------------------------------
       Preflight CORS (OPTIONS) — responder inmediatamente
       ------------------------------------------------------------------ */
    if (req.method === 'OPTIONS') {
        res.writeHead(204, CORS_HEADERS);
        res.end();
        return;
    }

    /* ------------------------------------------------------------------
       Rutas de la API REST
       ------------------------------------------------------------------ */
    if (reqUrl === '/api/status' && req.method === 'GET') {
        return manejarStatus(req, res);
    }

    if (reqUrl === '/api/guardar-archivo' && req.method === 'POST') {
        return manejarGuardarArchivo(req, res);
    }

    if (reqUrl === '/api/actualizar-html' && req.method === 'POST') {
        return manejarActualizarHTML(req, res);
    }

    /* ------------------------------------------------------------------
       Servir archivos estáticos (funcionalidad original)
       ------------------------------------------------------------------ */
    if (reqUrl === '/') reqUrl = '/gestor/index.html';

    let filePath = path.join(ROOT_DIR, reqUrl);

    if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403);
        res.end('Acceso denegado');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404 - Archivo no encontrado</h1>');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache'
        });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    const url = `http://localhost:${PORT}/gestor/index.html`;
    console.log(`===================================================`);
    console.log(`🚀 GESTOR DE CONTENIDOS - SERVIDOR LOCAL ACTIVO`);
    console.log(`🌐 Abriendo automaticamente: ${url}`);
    console.log(`===================================================`);

    const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${startCmd} ${url}`);
});
