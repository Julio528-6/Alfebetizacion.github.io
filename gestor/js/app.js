/* ==========================================================================
   GESTOR DE CONTENIDOS WEB — APP.JS
   Controlador Global de Navegación, Estado de la App, Utilidades UI y
   Sistema de Guardado Directo en Disco (File System Access API)
   ========================================================================== */

// Estado global de la aplicación
const EstadoApp = {
    moduloActivo: null, // 'noticias', 'andragogia', 'social'
    pasoActual: 1,      // 1, 2, 3
    dirHandle: null,    // Handle de la carpeta raíz del repositorio en disco
    datosNoticias: {
        imagenBlob: null,
        imagenDataUrl: null,
        nombreArchivo: ''
    },
    datosAndragogia: {
        imagenesBlobs: [null, null, null, null],
        imagenesDataUrls: [null, null, null, null],
        textos: ['', '', '', ''],
        nombresArchivos: ['', '', '', '']
    },
    datosSocial: []
};

// Evento Inicial
document.addEventListener('DOMContentLoaded', () => {
    // Evitar que arrastrar archivos abra la imagen en la pestaña
    window.addEventListener('dragover', (e) => e.preventDefault(), false);
    window.addEventListener('drop', (e) => e.preventDefault(), false);

    // Configurar listener para volver a inicio
    const btnInicioNav = document.getElementById('btn-inicio-nav');
    if (btnInicioNav) {
        btnInicioNav.addEventListener('click', () => {
            if (confirm('¿Deseas volver al inicio? Se perderán las modificaciones no confirmadas.')) {
                reiniciarFlujo();
            }
        });
    }

    // Configurar drag and drop en noticias
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
                cargarImagenNoticia(e.dataTransfer.files[0]);
            }
        });
    }

    // Inicializar tarjeta social por defecto
    if (typeof agregarTarjetaFotoSocial === 'function') {
        agregarTarjetaFotoSocial();
    }
});

// ── VINCULACIÓN DE CARPETA LOCAL (File System Access API) ──
async function vincularCarpetaProyecto() {
    if (window.location.protocol === 'file:') {
        mostrarAlerta('ℹ️ Estás abriendo el gestor directamente como un archivo local (file://). Los navegadores (Chrome/Edge) deshabilitan la vinculación automática de carpetas por seguridad salvo que uses un servidor local (ej. Live Server). ¡El modo MANUAL (Copiar Código y Descargar Fotos) funciona al 100%!');
        return;
    }

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
        actualizarIndicadorCarpeta(handle.name);
        mostrarAlerta(`✅ ¡Carpeta "${handle.name}" vinculada con éxito! Ahora puedes usar la opción de Guardar Automáticamente.`, 'success');

    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Error al vincular carpeta:', err);
            mostrarAlerta('No se pudo vincular la carpeta. Puedes continuar usando el botón de Copiar Código y Descargar Fotos.');
        }
    }
}

function actualizarIndicadorCarpeta(nombreCarpeta) {
    const btnVincular = document.getElementById('btn-vincular-carpeta');
    const badgeEstado = document.getElementById('badge-estado-carpeta');

    if (btnVincular && badgeEstado) {
        btnVincular.className = 'btn-gestor btn-gestor-warning btn-sm';
        btnVincular.innerHTML = '📁 Re-vincular Carpeta';
        badgeEstado.className = 'badge bg-success ms-2 p-2';
        badgeEstado.innerHTML = `🟢 Conectado: ${nombreCarpeta}`;
    }
}

// ── HELPER: Guardar archivo binario/texto en subcarpetas ──
async function guardarArchivoEnSubcarpeta(rutaSubcarpetasArray, nombreArchivo, contenidoBlobOrText) {
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

// ── Copiar Código al Portapapeles ──
function copiarCodigo(idElementoCodigo) {
    const elemento = document.getElementById(idElementoCodigo);
    if (!elemento) return;

    const codigo = elemento.textContent;
    navigator.clipboard.writeText(codigo).then(() => {
        alert('✅ ¡Código copiado con éxito al portapapeles!');
    }).catch(err => {
        console.error('Error al copiar: ', err);
        mostrarAlerta('No se pudo copiar automáticamente. Por favor, selecciona el texto y cópialo manualmente.');
    });
}

// ── Reiniciar Flujo Global ──
function reiniciarFlujo() {
    EstadoApp.moduloActivo = null;
    EstadoApp.pasoActual = 1;

    ocultarAlerta();

    EstadoApp.datosNoticias = { imagenBlob: null, imagenDataUrl: null, nombreArchivo: '' };
    const imgPrevNoticias = document.getElementById('noticias-img-preview');
    if (imgPrevNoticias) imgPrevNoticias.src = '';

    EstadoApp.datosAndragogia = {
        imagenesBlobs: [null, null, null, null],
        imagenesDataUrls: [null, null, null, null],
        textos: ['', '', '', ''],
        nombresArchivos: ['', '', '', '']
    };
    [1, 2, 3, 4].forEach(i => {
        const thumb = document.getElementById(`andro-preview-thumb-${i}`);
        const txt = document.getElementById(`andro-texto-${i}`);
        if (thumb) thumb.textContent = '📷 Sin imagen seleccionada';
        if (txt) txt.value = '';
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
