/* ==========================================================================
   GESTOR DE CONTENIDOS WEB — NOTICIAS.JS
   Lógica del Módulo de Noticias (Carga de 1 imagen para barra lateral)
   ========================================================================== */

function cargarImagenNoticia(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        mostrarAlerta('El archivo seleccionado no es una imagen válida. Por favor selecciona una imagen (JPG, PNG, WEBP).');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        EstadoApp.datosNoticias.imagen = e.target.result;
        EstadoApp.datosNoticias.nombreArchivo = file.name;

        // Asignar a la vista previa
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
    if (!EstadoApp.datosNoticias.imagen) {
        mostrarAlerta('Por favor selecciona una imagen antes de continuar.');
        return;
    }

    // Generar el código exacto según la plantilla del sitio web
    const nombreNormalizado = EstadoApp.datosNoticias.nombreArchivo || 'novedad.jpg';
    const codigoFragmento = `<div class="novedad-placeholder">\n    <img src="./img/${nombreNormalizado}" alt="Novedad">\n</div>`;

    const cajaCodigo = document.getElementById('noticias-codigo-output');
    if (cajaCodigo) {
        cajaCodigo.textContent = codigoFragmento;
    }

    mostrarSubPaso('noticias', 3);
}

function descargarImagenNoticia() {
    if (!EstadoApp.datosNoticias.imagen) return;
    const nombre = EstadoApp.datosNoticias.nombreArchivo || 'novedad_noticia.jpg';
    descargarArchivo(EstadoApp.datosNoticias.imagen, nombre);
}
