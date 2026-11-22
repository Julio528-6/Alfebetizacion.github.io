/* ==========================================================================
   GESTOR DE CONTENIDOS WEB — NOTICIAS.JS
   Lógica del Módulo de Noticias (Carga de Fotos y Videos + Guardado Directo a Disco)
   ========================================================================== */

function cargarArchivoNoticia(file) {
    if (!file) return;

    const esVid = esArchivoVideo(file);
    const esImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

    if (!esVid && !esImg) {
        mostrarAlerta('El archivo seleccionado no es válido. Por favor selecciona una imagen (JPG, PNG, WEBP) o un video (MP4, WEBM).');
        return;
    }

    EstadoApp.datosNoticias.archivoBlob = file;
    EstadoApp.datosNoticias.imagenBlob = file; // retrocompatibilidad
    EstadoApp.datosNoticias.nombreArchivo = file.name;
    EstadoApp.datosNoticias.esVideo = esVid;

    const imgPrev = document.getElementById('noticias-img-preview');
    const vidPrev = document.getElementById('noticias-video-preview');

    if (esVid) {
        const videoUrl = URL.createObjectURL(file);
        EstadoApp.datosNoticias.archivoDataUrl = videoUrl;
        EstadoApp.datosNoticias.imagenDataUrl = videoUrl;

        if (imgPrev) {
            imgPrev.style.display = 'none';
            imgPrev.src = '';
        }
        if (vidPrev) {
            vidPrev.src = videoUrl;
            vidPrev.style.display = 'block';
            vidPrev.load();
        }

        ocultarAlerta();
        mostrarSubPaso('noticias', 2);
    } else {
        const reader = new FileReader();
        reader.onload = function (e) {
            EstadoApp.datosNoticias.archivoDataUrl = e.target.result;
            EstadoApp.datosNoticias.imagenDataUrl = e.target.result;

            if (vidPrev) {
                vidPrev.pause();
                vidPrev.style.display = 'none';
                vidPrev.src = '';
            }
            if (imgPrev) {
                imgPrev.src = e.target.result;
                imgPrev.style.display = 'block';
            }

            ocultarAlerta();
            mostrarSubPaso('noticias', 2);
        };
        reader.readAsDataURL(file);
    }
}

// Alias para retrocompatibilidad
function cargarImagenNoticia(file) {
    cargarArchivoNoticia(file);
}

function irAPasoNoticias(paso) {
    if (paso === 1) {
        const vidPrev = document.getElementById('noticias-video-preview');
        if (vidPrev) vidPrev.pause();
    }
    mostrarSubPaso('noticias', paso);
}

function confirmarNoticias() {
    if (!EstadoApp.datosNoticias.archivoBlob && !EstadoApp.datosNoticias.imagenBlob) {
        mostrarAlerta('Por favor selecciona una imagen o un video antes de continuar.');
        return;
    }

    const vidPrev = document.getElementById('noticias-video-preview');
    if (vidPrev) vidPrev.pause();

    const esVid = EstadoApp.datosNoticias.esVideo;
    const nombreNormalizado = EstadoApp.datosNoticias.nombreArchivo || (esVid ? 'novedad.mp4' : 'novedad.jpg');
    
    let codigoFragmento = '';
    if (esVid) {
        const ext = (nombreNormalizado.split('.').pop() || 'mp4').toLowerCase();
        const mimeType = ext === 'webm' ? 'video/webm' : (ext === 'ogg' ? 'video/ogg' : 'video/mp4');
        codigoFragmento = `<div class="novedad-placeholder">\n    <video class="video-novedades" controls style="width: 100%; height: auto; border-radius: 5px;">\n        <source src="./img/${nombreNormalizado}" type="${mimeType}">\n        <source src="./media/${nombreNormalizado}" type="${mimeType}">\n        Tu navegador no soporta el formato de video.\n    </video>\n</div>`;
    } else {
        codigoFragmento = `<div class="novedad-placeholder">\n    <img src="./img/${nombreNormalizado}" alt="Novedad">\n</div>`;
    }

    const cajaCodigo = document.getElementById('noticias-codigo-output');
    if (cajaCodigo) {
        cajaCodigo.textContent = codigoFragmento;
    }

    const btnDescarga = document.getElementById('btn-descarga-noticias');
    if (btnDescarga) {
        btnDescarga.textContent = esVid ? '💾 Descargar Video' : '💾 Descargar Imagen';
    }

    const containerAuto = document.getElementById('contenedor-auto-noticias');
    if (containerAuto) {
        containerAuto.style.display = EstadoApp.dirHandle ? 'block' : 'none';
    }

    mostrarSubPaso('noticias', 3);
}

async function guardarNoticiaDirectoEnDisco() {
    if (!EstadoApp.dirHandle) {
        mostrarAlerta('Primero debes vincular la carpeta de tu proyecto con el botón 📁 Vincular Carpeta.');
        return;
    }

    const btn = document.getElementById('btn-guardar-directo-noticias');
    const textoOriginal = btn ? btn.textContent : '';
    if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Guardando contenido en el sitio...';
    }

    try {
        const esVid = EstadoApp.datosNoticias.esVideo;
        const nombreArchivo = EstadoApp.datosNoticias.nombreArchivo || (esVid ? 'novedad.mp4' : 'novedad.jpg');
        const blobArchivo = EstadoApp.datosNoticias.archivoBlob || EstadoApp.datosNoticias.imagenBlob;

        // Guardar en img/ y si es video también en media/ por redundancia
        let exitoImg = await guardarArchivoEnSubcarpeta(['img'], nombreArchivo, blobArchivo);
        if (esVid) {
            await guardarArchivoEnSubcarpeta(['media'], nombreArchivo, blobArchivo);
        }

        let codigoHTML = '';
        if (esVid) {
            const ext = (nombreArchivo.split('.').pop() || 'mp4').toLowerCase();
            const mimeType = ext === 'webm' ? 'video/webm' : (ext === 'ogg' ? 'video/ogg' : 'video/mp4');
            codigoHTML = `<div class="novedad-placeholder">\n    <video class="video-novedades" controls style="width: 100%; height: auto; border-radius: 5px;">\n        <source src="./img/${nombreArchivo}" type="${mimeType}">\n        <source src="./media/${nombreArchivo}" type="${mimeType}">\n        Tu navegador no soporta el formato de video.\n    </video>\n</div>`;
        } else {
            codigoHTML = `<div class="novedad-placeholder">\n    <img src="./img/${nombreArchivo}" alt="Novedad">\n</div>`;
        }

        const exitoHTML = await actualizarHTMLDirecto('index.html', '<h1 class="TN">Centro de Novedades</h1>', codigoHTML, 'después');

        if (exitoImg && exitoHTML) {
            const tipoEtiqueta = esVid ? 'El video' : 'La foto';
            mostrarAlerta(`🎉 ¡ÉXITO! ${tipoEtiqueta} "${nombreArchivo}" fue guardado en "img/" e insertado directamente en "index.html".`, 'success');
        } else {
            mostrarAlerta('Ocurrió un problema al escribir los archivos en tu repositorio local. Asegúrate de tener "iniciar_gestor.bat" abierto.');
        }
    } catch (err) {
        console.error('Error guardando noticia:', err);
        mostrarAlerta(`Error al guardar: ${err.message}`);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = textoOriginal;
        }
    }
}

function descargarArchivoNoticia() {
    const file = EstadoApp.datosNoticias.archivoBlob || EstadoApp.datosNoticias.imagenBlob;
    if (!file) return;

    const nombre = EstadoApp.datosNoticias.nombreArchivo || (EstadoApp.datosNoticias.esVideo ? 'novedad.mp4' : 'novedad.jpg');
    const url = EstadoApp.datosNoticias.archivoDataUrl || URL.createObjectURL(file);
    descargarArchivo(url, nombre);
}

// Alias para retrocompatibilidad
function descargarImagenNoticia() {
    descargarArchivoNoticia();
}
