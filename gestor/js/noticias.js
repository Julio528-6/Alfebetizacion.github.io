/* ==========================================================================
   GESTOR DE CONTENIDOS WEB — NOTICIAS.JS
   Lógica del Módulo de Noticias (Carga + Guardado Directo a Disco)
   ========================================================================== */

function cargarImagenNoticia(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        mostrarAlerta('El archivo seleccionado no es una imagen válida. Por favor selecciona una imagen (JPG, PNG, WEBP).');
        return;
    }

    EstadoApp.datosNoticias.imagenBlob = file;
    EstadoApp.datosNoticias.nombreArchivo = file.name;

    const reader = new FileReader();
    reader.onload = function (e) {
        EstadoApp.datosNoticias.imagenDataUrl = e.target.result;

        const imgPrev = document.getElementById('noticias-img-preview');
        if (imgPrev) {
            imgPrev.src = e.target.result;
        }

        ocultarAlerta();
        mostrarSubPaso('noticias', 2);
    };

    reader.readAsDataURL(file);
}

function irAPasoNoticias(paso) {
    mostrarSubPaso('noticias', paso);
}

function confirmarNoticias() {
    if (!EstadoApp.datosNoticias.imagenDataUrl) {
        mostrarAlerta('Por favor selecciona una imagen antes de continuar.');
        return;
    }

    const nombreNormalizado = EstadoApp.datosNoticias.nombreArchivo || 'novedad.jpg';
    const codigoFragmento = `<div class="novedad-placeholder">\n    <img src="./img/${nombreNormalizado}" alt="Novedad">\n</div>`;

    const cajaCodigo = document.getElementById('noticias-codigo-output');
    if (cajaCodigo) {
        cajaCodigo.textContent = codigoFragmento;
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

    const nombreFoto = EstadoApp.datosNoticias.nombreArchivo || 'novedad.jpg';
    const blobFoto = EstadoApp.datosNoticias.imagenBlob;
    const codigoHTML = `<div class="novedad-placeholder">\n    <img src="./img/${nombreFoto}" alt="Novedad">\n</div>`;

    const exitoImagen = await guardarArchivoEnSubcarpeta(['img'], nombreFoto, blobFoto);
    const exitoHTML = await actualizarHTMLDirecto('index.html', '<h1 class="TN">Centro de Novedades</h1>', codigoHTML, 'después');

    if (exitoImagen && exitoHTML) {
        mostrarAlerta(`🎉 ¡ÉXITO! La foto "${nombreFoto}" fue guardada en "img/" e insertada directamente en "index.html".`, 'success');
    } else {
        mostrarAlerta('Ocurrió un problema al escribir los archivos en tu repositorio local.');
    }
}

function descargarImagenNoticia() {
    if (!EstadoApp.datosNoticias.imagenDataUrl) return;
    const nombre = EstadoApp.datosNoticias.nombreArchivo || 'novedad_noticia.jpg';
    descargarArchivo(EstadoApp.datosNoticias.imagenDataUrl, nombre);
}
