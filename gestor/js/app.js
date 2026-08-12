/* ==========================================================================
   GESTOR DE CONTENIDOS WEB — APP.JS
   Controlador Global de Navegación, Estado de la App y Utilidades UI
   ========================================================================== */

// Estado global de la aplicación
const EstadoApp = {
    moduloActivo: null, // 'noticias', 'andragogia', 'social'
    pasoActual: 1,      // 1, 2, 3
    datosNoticias: {
        imagen: null,
        nombreArchivo: ''
    },
    datosAndragogia: {
        imagenes: [null, null, null, null],
        textos: ['', '', '', ''],
        nombresArchivos: ['', '', '', '']
    },
    datosSocial: [
        // { id: 1, imagen: null, texto: '', nombreArchivo: '' }
    ]
};

// Evento Inicial
document.addEventListener('DOMContentLoaded', () => {
    // Configurar listener para volver a inicio con botón nav
    const btnInicioNav = document.getElementById('btn-inicio-nav');
    if (btnInicioNav) {
        btnInicioNav.addEventListener('click', () => {
            if (confirm('¿Deseas volver al inicio? Se perderán las modificaciones no confirmadas.')) {
                reiniciarFlujo();
            }
        });
    }

    // Inicializar tarjeta social por defecto
    if (typeof agregarTarjetaFotoSocial === 'function') {
        agregarTarjetaFotoSocial();
    }
});

// ── Iniciar un Módulo (Noticias, Andragogía, Social) ──
function iniciarModulo(nombreModulo) {
    EstadoApp.moduloActivo = nombreModulo;
    EstadoApp.pasoActual = 1;

    // Ocultar todas las secciones principales
    document.querySelectorAll('.seccion-flujo').forEach(sec => sec.classList.remove('activa'));

    // Mostrar sección del módulo
    const secDestino = document.getElementById(`seccion-${nombreModulo}`);
    if (secDestino) {
        secDestino.classList.add('activa');
    }

    // Mostrar barra de pasos
    const barraPasos = document.getElementById('barra-pasos');
    if (barraPasos) {
        barraPasos.style.display = 'flex';
    }

    actualizarBarraPasos(1);

    // Activar sub-paso 1 de ese módulo
    mostrarSubPaso(nombreModulo, 1);
}

// ── Actualizar la Barra de Pasos Visual ──
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

// ── Mostrar Alertas en Lenguaje Cotidiano ──
function mostrarAlerta(mensaje) {
    const contenedor = document.getElementById('alerta-mensaje');
    const texto = document.getElementById('alerta-texto');

    if (contenedor && texto) {
        texto.textContent = mensaje;
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

    // Ocultar alerta
    ocultarAlerta();

    // Reset datos noticias
    EstadoApp.datosNoticias = { imagen: null, nombreArchivo: '' };
    const imgPrevNoticias = document.getElementById('noticias-img-preview');
    if (imgPrevNoticias) imgPrevNoticias.src = '';

    // Reset datos andragogia
    EstadoApp.datosAndragogia = {
        imagenes: [null, null, null, null],
        textos: ['', '', '', ''],
        nombresArchivos: ['', '', '', '']
    };
    [1, 2, 3, 4].forEach(i => {
        const thumb = document.getElementById(`andro-preview-thumb-${i}`);
        const txt = document.getElementById(`andro-texto-${i}`);
        if (thumb) thumb.textContent = '📷 Sin imagen seleccionada';
        if (txt) txt.value = '';
    });

    // Reset datos social
    EstadoApp.datosSocial = [];
    const contenedorSocial = document.getElementById('contenedor-fotos-social');
    if (contenedorSocial) contenedorSocial.innerHTML = '';
    if (typeof agregarTarjetaFotoSocial === 'function') {
        agregarTarjetaFotoSocial();
    }

    // Ocultar barra de pasos
    const barraPasos = document.getElementById('barra-pasos');
    if (barraPasos) barraPasos.style.display = 'none';

    // Volver a inicio
    document.querySelectorAll('.seccion-flujo').forEach(sec => sec.classList.remove('activa'));
    const secInicio = document.getElementById('seccion-inicio');
    if (secInicio) secInicio.classList.add('activa');
}

// ── Función Helper para Descargar Data URL o Blob ──
function descargarArchivo(dataUrl, nombreArchivo) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
