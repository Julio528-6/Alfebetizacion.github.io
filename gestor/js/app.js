/* ==========================================================================
   GESTOR DE CONTENIDOS WEB — APP.JS
   Controlador Global, Estado de la App, Persistencia en IndexedDB
   y Sistema de Guardado Directo en Disco (File System Access API)
   ========================================================================== */

// Estado global de la aplicación
const EstadoApp = {
    moduloActivo: null, // 'noticias', 'andragogia', 'social'
    pasoActual: 1,      // 1, 2, 3
    dirHandle: null,    // Handle de la carpeta raíz del repositorio en disco
    datosNoticias: {
        archivoBlob: null,
        imagenBlob: null, // compatibilidad
        archivoDataUrl: null,
        imagenDataUrl: null, // compatibilidad
        nombreArchivo: '',
        esVideo: false
    },
    datosAndragogia: {
        archivosBlobs: [null, null, null, null],
        imagenesBlobs: [null, null, null, null], // compatibilidad
        archivosDataUrls: [null, null, null, null],
        imagenesDataUrls: [null, null, null, null], // compatibilidad
        textos: ['', '', '', ''],
        nombresArchivos: ['', '', '', ''],
        esVideo: [false, false, false, false]
    },
    datosSocial: []
};

// Helper: Determinar si un archivo o nombre es video
function esArchivoVideo(archivoOFilename) {
    if (!archivoOFilename) return false;
    const patronExtensiones = /\.(mp4|webm|ogg|mov|m4v|mkv|avi|3gp|wmv|flv)$/i;
    if (typeof archivoOFilename === 'string') {
        return patronExtensiones.test(archivoOFilename);
    }
    if (archivoOFilename.type) {
        if (archivoOFilename.type.startsWith('video/')) return true;
    }
    if (archivoOFilename.name) {
        return patronExtensiones.test(archivoOFilename.name);
    }
    return false;
}

// ── DETECCIÓN AUTOMÁTICA DEL SERVIDOR LOCAL ──
// Cuando el gestor se sirve desde localhost (Node.js), se activa
// automáticamente el guardado directo via API sin necesidad de vincular carpeta.
const ServidorLocal = {
    disponible: false,
    baseUrl: '' // Se detecta dinámicamente
};

// ── API: Guardar archivo via servidor local ──
async function guardarArchivoViaServidor(subcarpeta, nombreArchivo, blob) {
    try {
        // Enviar con streaming binario puro (libre de fallos para videos pesados)
        const resp = await fetch(`${ServidorLocal.baseUrl}/api/guardar-archivo`, {
            method: 'POST',
            headers: {
                'x-subcarpeta': encodeURIComponent(subcarpeta),
                'x-nombre': encodeURIComponent(nombreArchivo),
                'Content-Type': 'application/octet-stream'
            },
            body: blob
        });
        const data = await resp.json();
        return Boolean(data && data.ok);
    } catch (err) {
        console.error('Error guardando archivo vía servidor:', err);
        return false;
    }
}

// ── API: Actualizar HTML via servidor local ──
async function actualizarHTMLViaServidor(archivoHTML, patronInsercion, htmlFragmento, posicion) {
    try {
        const resp = await fetch(`${ServidorLocal.baseUrl}/api/actualizar-html`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ archivoHTML, patronInsercion, htmlFragmento, posicion })
        });
        const data = await resp.json();
        return Boolean(data && data.ok);
    } catch (err) {
        console.error('Error actualizando HTML vía servidor:', err);
        return false;
    }
}

// ── API: Detectar si el servidor local está disponible ──
async function detectarServidorLocal() {
    // 1. Si la página se abrió vía HTTP/HTTPS (por ejemplo, desde iniciar_gestor.bat)
    if (window.location.protocol.startsWith('http')) {
        try {
            const resp = await fetch('/api/status', { method: 'GET' });
            const data = await resp.json();
            if (data.ok && data.mode === 'servidor-local') {
                ServidorLocal.disponible = true;
                ServidorLocal.baseUrl = window.location.origin;
                return true;
            }
        } catch (e) {
            // Continuar con sondeo de puertos
        }
    }

    // 2. Si se abrió por file:/// o el puerto cambió dinámicamente, probar puertos habituales
    const puertos = [3001, 3000, 3002, 3003, 3004, 3005];
    for (const p of puertos) {
        try {
            const resp = await fetch(`http://localhost:${p}/api/status`, { method: 'GET' });
            const data = await resp.json();
            if (data.ok && data.mode === 'servidor-local') {
                ServidorLocal.disponible = true;
                ServidorLocal.baseUrl = `http://localhost:${p}`;
                return true;
            }
        } catch (e) {
            // Probar siguiente puerto
        }
    }

    return false;
}

// ── INDEXEDDB PARA RECORDAR CARPETA ENTRE SESIONES ──
const DB_NAME = 'GestorContenidosDB';
const STORE_NAME = 'carpetas';

function abrirDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
    });
}

async function guardarHandleEnDB(handle) {
    try {
        const db = await abrirDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(handle, 'rootDirectory');
    } catch (err) {
        console.error('Error guardando handle en IndexedDB:', err);
    }
}

async function obtenerHandleDeDB() {
    try {
        const db = await abrirDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const req = tx.objectStore(STORE_NAME).get('rootDirectory');
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
    } catch (err) {
        return null;
    }
}

// ── Evento Inicial ──
document.addEventListener('DOMContentLoaded', async () => {
    window.addEventListener('dragover', (e) => e.preventDefault(), false);
    window.addEventListener('drop', (e) => e.preventDefault(), false);

    const btnInicioNav = document.getElementById('btn-inicio-nav');
    if (btnInicioNav) {
        btnInicioNav.addEventListener('click', () => {
            if (confirm('¿Deseas volver al inicio? Se perderán las modificaciones no confirmadas.')) {
                reiniciarFlujo();
            }
        });
    }

    const noticiasDropzone = document.getElementById('noticias-dropzone');
    if (noticiasDropzone) {
        noticiasDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            noticiasDropzone.classList.add('dragover');
        });
        noticiasDropzone.addEventListener('dragleave', () => {
            noticiasDropzone.classList.remove('dragover');
        });
        noticiasDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            noticiasDropzone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                if (typeof cargarArchivoNoticia === 'function') {
                    cargarArchivoNoticia(e.dataTransfer.files[0]);
                } else if (typeof cargarImagenNoticia === 'function') {
                    cargarImagenNoticia(e.dataTransfer.files[0]);
                }
            }
        });
    }

    if (typeof agregarTarjetaFotoSocial === 'function') {
        agregarTarjetaFotoSocial();
    }

    // ── Intentar detectar servidor local antes de intentar IndexedDB ──
    const servidorDetectado = await detectarServidorLocal();

    if (servidorDetectado) {
        // Servidor local detectado: modo automático sin necesidad de vincular carpeta
        const btnVincular = document.getElementById('btn-vincular-carpeta');
        const badgeEstado = document.getElementById('badge-estado-carpeta');

        if (btnVincular) {
            btnVincular.style.display = 'none';
        }
        if (badgeEstado) {
            badgeEstado.className = 'badge bg-success ms-2 p-2';
            badgeEstado.innerHTML = '🟢 Modo Automático (Servidor Local)';
        }

        // Valor truthy para que los módulos (noticias.js, andragogia.js, social.js)
        // muestren el contenedor automático (comprueban EstadoApp.dirHandle ? 'block' : 'none')
        EstadoApp.dirHandle = 'servidor-local';
    } else {
        // Servidor no disponible: usar el flujo normal con File System Access API
        recuperarCarpetaGuardada();
    }
});

// ── Autoconectar Carpeta Guardada ──
async function recuperarCarpetaGuardada() {
    if (!('showDirectoryPicker' in window)) return;

    const savedHandle = await obtenerHandleDeDB();
    if (savedHandle) {
        try {
            const state = await savedHandle.queryPermission({ mode: 'readwrite' });
            if (state === 'granted') {
                EstadoApp.dirHandle = savedHandle;
                actualizarIndicadorCarpeta(savedHandle.name);
            } else {
                mostrarBotonReconectar(savedHandle);
            }
        } catch (e) {
            mostrarBotonReconectar(savedHandle);
        }
    }
}

function mostrarBotonReconectar(savedHandle) {
    const btnVincular = document.getElementById('btn-vincular-carpeta');
    const badgeEstado = document.getElementById('badge-estado-carpeta');

    if (btnVincular && badgeEstado) {
        btnVincular.className = 'btn-gestor btn-gestor-warning btn-sm';
        btnVincular.innerHTML = `⚡ Activar Carpeta "${savedHandle.name}"`;
        btnVincular.onclick = async () => {
            try {
                const perm = await savedHandle.requestPermission({ mode: 'readwrite' });
                if (perm === 'granted') {
                    EstadoApp.dirHandle = savedHandle;
                    actualizarIndicadorCarpeta(savedHandle.name);
                    mostrarAlerta(`✅ ¡Acceso a "${savedHandle.name}" reactivado!`, 'success');
                }
            } catch (err) {
                console.error(err);
                vincularCarpetaProyecto();
            }
        };

        badgeEstado.className = 'badge bg-warning text-dark ms-2 p-2';
        badgeEstado.innerHTML = `🟡 Reactivación requerida: ${savedHandle.name}`;
    }
}

// ── VINCULACIÓN DE CARPETA LOCAL (File System Access API) ──
async function vincularCarpetaProyecto() {
    if (!('showDirectoryPicker' in window)) {
        mostrarAlerta('Tu navegador no soporta el acceso directo a carpetas. Te recomendamos usar Google Chrome, Microsoft Edge u Opera. El modo MANUAL (Copiar Código y Descargar Fotos) sigue completamente disponible.');
        return;
    }

    try {
        const handle = await window.showDirectoryPicker({
            mode: 'readwrite'
        });

        let esValida = false;
        for await (const entry of handle.values()) {
            if (entry.name === 'index.html' || entry.name === 'andragogia.html' || entry.name === 'social.html') {
                esValida = true;
                break;
            }
        }

        if (!esValida) {
            mostrarAlerta('La carpeta seleccionada no parece ser la raíz del proyecto. Por favor selecciona la carpeta principal donde están index.html, andragogia.html y social.html.');
            return;
        }

        EstadoApp.dirHandle = handle;
        await guardarHandleEnDB(handle);

        actualizarIndicadorCarpeta(handle.name);
        mostrarAlerta(`✅ ¡Carpeta "${handle.name}" vinculada y guardada con éxito! La herramienta la recordará automáticamente.`, 'success');

    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Error al vincular carpeta:', err);
            mostrarAlerta('No se pudo vincular la carpeta directamente. Te sugerimos ejecutar "iniciar_gestor.bat" en la carpeta de tu proyecto o usar el modo de Copiar Código y Descargar Fotos.');
        }
    }
}

function actualizarIndicadorCarpeta(nombreCarpeta) {
    const btnVincular = document.getElementById('btn-vincular-carpeta');
    const badgeEstado = document.getElementById('badge-estado-carpeta');

    if (btnVincular && badgeEstado) {
        btnVincular.className = 'btn-gestor btn-gestor-warning btn-sm';
        btnVincular.innerHTML = '📁 Cambiar Carpeta Vinculada';
        btnVincular.onclick = vincularCarpetaProyecto;
        badgeEstado.className = 'badge bg-success ms-2 p-2';
        badgeEstado.innerHTML = `🟢 Conectado: ${nombreCarpeta}`;
    }
}

// ── HELPER: Guardar archivo binario/texto en subcarpetas ──
async function guardarArchivoEnSubcarpeta(rutaSubcarpetasArray, nombreArchivo, contenidoBlobOrText) {
    // Preferir servidor local si está disponible
    if (ServidorLocal.disponible) {
        return guardarArchivoViaServidor(rutaSubcarpetasArray.join('/'), nombreArchivo, contenidoBlobOrText);
    }

    // Fallback a File System Access API
    if (!EstadoApp.dirHandle) return false;

    try {
        let currentDir = EstadoApp.dirHandle;

        for (const sub of rutaSubcarpetasArray) {
            currentDir = await currentDir.getDirectoryHandle(sub, { create: true });
        }

        const fileHandle = await currentDir.getFileHandle(nombreArchivo, { create: true });
        const writable = await fileHandle.createWritable();

        await writable.write(contenidoBlobOrText);
        await writable.close();

        return true;
    } catch (err) {
        console.error(`Error guardando ${nombreArchivo}:`, err);
        return false;
    }
}

// ── HELPER: Modificar e Insertar HTML directamente en archivos ──
async function actualizarHTMLDirecto(nombreArchivoHTML, patronInsercion, htmlFragmento, posicion = 'después') {
    // Preferir servidor local si está disponible
    if (ServidorLocal.disponible) {
        return actualizarHTMLViaServidor(nombreArchivoHTML, patronInsercion, htmlFragmento, posicion);
    }

    // Fallback a File System Access API
    if (!EstadoApp.dirHandle) return false;

    try {
        const fileHandle = await EstadoApp.dirHandle.getFileHandle(nombreArchivoHTML, { create: true });
        const file = await fileHandle.getFile();
        let contenidoHTML = await file.text();

        if (posicion === 'después') {
            const indexPatron = contenidoHTML.indexOf(patronInsercion);
            if (indexPatron === -1) {
                console.error(`No se encontró el patrón "${patronInsercion}" en ${nombreArchivoHTML}`);
                return false;
            }
            const offset = indexPatron + patronInsercion.length;
            contenidoHTML = contenidoHTML.slice(0, offset) + '\n' + htmlFragmento + contenidoHTML.slice(offset);
        } else if (posicion === 'antes') {
            const indexPatron = contenidoHTML.indexOf(patronInsercion);
            if (indexPatron === -1) return false;
            contenidoHTML = contenidoHTML.slice(0, indexPatron) + htmlFragmento + '\n' + contenidoHTML.slice(indexPatron);
        }

        const writable = await fileHandle.createWritable();
        await writable.write(contenidoHTML);
        await writable.close();

        return true;
    } catch (err) {
        console.error(`Error actualizando ${nombreArchivoHTML}:`, err);
        return false;
    }
}

// ── Iniciar un Módulo ──
function iniciarModulo(nombreModulo) {
    EstadoApp.moduloActivo = nombreModulo;
    EstadoApp.pasoActual = 1;

    document.querySelectorAll('.seccion-flujo').forEach(sec => sec.classList.remove('activa'));

    const secDestino = document.getElementById(`seccion-${nombreModulo}`);
    if (secDestino) {
        secDestino.classList.add('activa');
    }

    const barraPasos = document.getElementById('barra-pasos');
    if (barraPasos) {
        barraPasos.style.display = 'flex';
    }

    actualizarBarraPasos(1);
    mostrarSubPaso(nombreModulo, 1);
}

// ── Actualizar Barra de Pasos Visual ──
function actualizarBarraPasos(numeroPaso) {
    EstadoApp.pasoActual = numeroPaso;

    [1, 2, 3].forEach(i => {
        const item = document.getElementById(`paso-${i}`);
        const linea = document.getElementById(`linea-${i}`);

        if (item) {
            item.classList.remove('activo', 'completado');
            if (i === numeroPaso) {
                item.classList.add('activo');
            } else if (i < numeroPaso) {
                item.classList.add('completado');
            }
        }

        if (linea) {
            linea.classList.remove('activo');
            if (i < numeroPaso) {
                linea.classList.add('activo');
            }
        }
    });
}

// ── Mostrar Sub-Paso dentro de un módulo ──
function mostrarSubPaso(modulo, paso) {
    actualizarBarraPasos(paso);

    const contenedorModulo = document.getElementById(`seccion-${modulo}`);
    if (contenedorModulo) {
        contenedorModulo.querySelectorAll('.flujo-paso-sub').forEach(el => {
            el.style.display = 'none';
        });

        const pasoTarget = document.getElementById(`${modulo}-paso-${paso}`);
        if (pasoTarget) {
            pasoTarget.style.display = 'block';
        }
    }
}

// ── Mostrar Alertas ──
function mostrarAlerta(mensaje, tipo = 'warning') {
    const contenedor = document.getElementById('alerta-mensaje');
    const texto = document.getElementById('alerta-texto');

    if (contenedor && texto) {
        texto.textContent = mensaje;
        contenedor.className = `alert alert-${tipo} alert-dismissible fade show`;
        contenedor.style.display = 'block';
        contenedor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function ocultarAlerta() {
    const contenedor = document.getElementById('alerta-mensaje');
    if (contenedor) {
        contenedor.style.display = 'none';
    }
}

// ── Copiar Código al Portapapeles con Fallback Anti-Fallos ──
function copiarCodigo(idElementoCodigo) {
    const elemento = document.getElementById(idElementoCodigo);
    if (!elemento) return;

    const text = elemento.textContent;

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            alert('✅ ¡Código copiado con éxito al portapapeles!');
        }).catch(() => {
            usarFallbackCopiado(text);
        });
    } else {
        usarFallbackCopiado(text);
    }
}

function usarFallbackCopiado(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
        const exitoso = document.execCommand('copy');
        if (exitoso) {
            alert('✅ ¡Código copiado con éxito al portapapeles!');
        } else {
            prompt('Copia manualmente este código:', text);
        }
    } catch (err) {
        prompt('Copia manualmente este código:', text);
    }
    document.body.removeChild(textarea);
}

// ── Reiniciar Flujo Global ──
function reiniciarFlujo() {
    EstadoApp.moduloActivo = null;
    EstadoApp.pasoActual = 1;

    ocultarAlerta();

    EstadoApp.datosNoticias = {
        archivoBlob: null,
        imagenBlob: null,
        archivoDataUrl: null,
        imagenDataUrl: null,
        nombreArchivo: '',
        esVideo: false
    };
    const imgPrevNoticias = document.getElementById('noticias-img-preview');
    const vidPrevNoticias = document.getElementById('noticias-video-preview');
    if (imgPrevNoticias) { imgPrevNoticias.src = ''; imgPrevNoticias.style.display = 'none'; }
    if (vidPrevNoticias) { vidPrevNoticias.pause(); vidPrevNoticias.src = ''; vidPrevNoticias.style.display = 'none'; }

    EstadoApp.datosAndragogia = {
        archivosBlobs: [null, null, null, null],
        imagenesBlobs: [null, null, null, null],
        archivosDataUrls: [null, null, null, null],
        imagenesDataUrls: [null, null, null, null],
        textos: ['', '', '', ''],
        nombresArchivos: ['', '', '', ''],
        esVideo: [false, false, false, false]
    };
    [1, 2, 3, 4].forEach(i => {
        const thumb = document.getElementById(`andro-preview-thumb-${i}`);
        const txt = document.getElementById(`andro-texto-${i}`);
        const imgP = document.getElementById(`andro-prev-img-${i}`);
        const vidP = document.getElementById(`andro-prev-vid-${i}`);
        if (thumb) thumb.textContent = '📷🎬 Sin archivo seleccionado';
        if (txt) txt.value = '';
        if (imgP) { imgP.src = ''; imgP.style.display = 'none'; }
        if (vidP) { vidP.pause(); vidP.src = ''; vidP.style.display = 'none'; }
    });

    EstadoApp.datosSocial = [];
    const contenedorSocial = document.getElementById('contenedor-fotos-social');
    if (contenedorSocial) contenedorSocial.innerHTML = '';
    if (typeof agregarTarjetaFotoSocial === 'function') {
        agregarTarjetaFotoSocial();
    }

    const barraPasos = document.getElementById('barra-pasos');
    if (barraPasos) barraPasos.style.display = 'none';

    document.querySelectorAll('.seccion-flujo').forEach(sec => sec.classList.remove('activa'));
    const secInicio = document.getElementById('seccion-inicio');
    if (secInicio) secInicio.classList.add('activa');
}

// ── Helper para Descargas ──
function descargarArchivo(dataUrl, nombreArchivo) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
