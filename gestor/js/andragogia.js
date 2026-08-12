/* ==========================================================================
   GESTOR DE CONTENIDOS WEB — ANDRAGOGIA.JS
   Lógica del Módulo de Andragogía (4 Imágenes + 4 Textos -> Libro Digital)
   ========================================================================== */

function cargarFotoAndro(index, file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        mostrarAlerta(`La foto ${index + 1} no es un archivo de imagen válido.`);
        return;
    }

    EstadoApp.datosAndragogia.imagenesBlobs[index] = file;
    EstadoApp.datosAndragogia.nombresArchivos[index] = file.name;

    const reader = new FileReader();
    reader.onload = function (e) {
        EstadoApp.datosAndragogia.imagenesDataUrls[index] = e.target.result;

        const thumb = document.getElementById(`andro-preview-thumb-${index + 1}`);
        if (thumb) {
            thumb.innerHTML = `✅ <strong>${file.name}</strong> listo.`;
        }
    };
    reader.readAsDataURL(file);
}

function validarYVistaPreviaAndragogia() {
    [0, 1, 2, 3].forEach(i => {
        const campo = document.getElementById(`andro-texto-${i + 1}`);
        if (campo) {
            EstadoApp.datosAndragogia.textos[i] = campo.value.trim();
        }
    });

    for (let i = 0; i < 4; i++) {
        if (!EstadoApp.datosAndragogia.imagenesDataUrls[i]) {
            mostrarAlerta(`Falta seleccionar la fotografía número ${i + 1}.`);
            return;
        }
        if (!EstadoApp.datosAndragogia.textos[i]) {
            mostrarAlerta(`Falta escribir el texto de la fotografía número ${i + 1}.`);
            return;
        }
    }

    ocultarAlerta();

    [0, 1, 2, 3].forEach(i => {
        const imgPrev = document.getElementById(`andro-prev-img-${i + 1}`);
        const txtPrev = document.getElementById(`andro-prev-txt-${i + 1}`);

        if (imgPrev) imgPrev.src = EstadoApp.datosAndragogia.imagenesDataUrls[i];
        if (txtPrev) txtPrev.textContent = EstadoApp.datosAndragogia.textos[i];
    });

    mostrarSubPaso('andragogia', 2);
}

function irAPasoAndragogia(paso) {
    mostrarSubPaso('andragogia', paso);
}

function confirmarAndragogia() {
    const nombres = EstadoApp.datosAndragogia.nombresArchivos;
    const textos = EstadoApp.datosAndragogia.textos;

    const codigoHTML = `<!-- HOJA DE LIBRO DE ANDRAGOGÍA (4 FOTOS + 4 TEXTOS) -->
<div class="hoja">
    <!-- PÁGINA IZQUIERDA -->
    <div class="cara frente">
        <div class="pagina pagina-izquierda">
            <div class="foto-principal-container">
                <img src="./img/${nombres[0] || 'foto1.jpg'}" alt="Foto Principal" class="foto-principal">
            </div>
            <h3 class="titulo-desc">Memoria del Proceso</h3>
            <div class="descripcion-amplia">
                <p>${textos[0]}</p>
            </div>
        </div>
    </div>

    <!-- PÁGINA DERECHA -->
    <div class="cara atras">
        <div class="pagina pagina-derecha">
            <div class="grid-tres-fotos">
                <div class="foto-pequena-item">
                    <div class="foto-wrapper">
                        <img src="./img/${nombres[1] || 'foto2.jpg'}" alt="Foto 2">
                    </div>
                    <p class="desc-pequena">${textos[1]}</p>
                </div>
                <div class="foto-pequena-item">
                    <div class="foto-wrapper">
                        <img src="./img/${nombres[2] || 'foto3.jpg'}" alt="Foto 3">
                    </div>
                    <p class="desc-pequena">${textos[2]}</p>
                </div>
                <div class="foto-pequena-item">
                    <div class="foto-wrapper">
                        <img src="./img/${nombres[3] || 'foto4.jpg'}" alt="Foto 4">
                    </div>
                    <p class="desc-pequena">${textos[3]}</p>
                </div>
            </div>
        </div>
    </div>
</div>`;

    const cajaCodigo = document.getElementById('andragogia-codigo-output');
    if (cajaCodigo) {
        cajaCodigo.textContent = codigoHTML;
    }

    const containerAuto = document.getElementById('contenedor-auto-andro');
    if (containerAuto) {
        containerAuto.style.display = EstadoApp.dirHandle ? 'block' : 'none';
    }

    mostrarSubPaso('andragogia', 3);
}

async function guardarAndragogiaDirectoEnDisco() {
    if (!EstadoApp.dirHandle) {
        mostrarAlerta('Primero debes vincular la carpeta de tu proyecto con el botón 📁 Vincular Carpeta.');
        return;
    }

    const nombres = EstadoApp.datosAndragogia.nombresArchivos;
    const blobs = EstadoApp.datosAndragogia.imagenesBlobs;
    const textos = EstadoApp.datosAndragogia.textos;

    let exitoFotos = true;
    for (let i = 0; i < 4; i++) {
        const nombre = nombres[i] || `andro_foto_${i + 1}.jpg`;
        const ok = await guardarArchivoEnSubcarpeta(['img'], nombre, blobs[i]);
        if (!ok) exitoFotos = false;
    }

    const codigoHTML = `<!-- NUEVA HOJA DE LIBRO AGREGADA CON EL GESTOR -->
<div class="hoja">
    <div class="cara frente">
        <div class="pagina pagina-izquierda">
            <div class="foto-principal-container">
                <img src="./img/${nombres[0]}" alt="Foto Principal" class="foto-principal">
            </div>
            <h3 class="titulo-desc">Memoria del Proceso</h3>
            <div class="descripcion-amplia">
                <p>${textos[0]}</p>
            </div>
        </div>
    </div>
    <div class="cara atras">
        <div class="pagina pagina-derecha">
            <div class="grid-tres-fotos">
                <div class="foto-pequena-item">
                    <div class="foto-wrapper"><img src="./img/${nombres[1]}" alt="Foto 2"></div>
                    <p class="desc-pequena">${textos[1]}</p>
                </div>
                <div class="foto-pequena-item">
                    <div class="foto-wrapper"><img src="./img/${nombres[2]}" alt="Foto 3"></div>
                    <p class="desc-pequena">${textos[2]}</p>
                </div>
                <div class="foto-pequena-item">
                    <div class="foto-wrapper"><img src="./img/${nombres[3]}" alt="Foto 4"></div>
                    <p class="desc-pequena">${textos[3]}</p>
                </div>
            </div>
        </div>
    </div>
</div>`;

    const exitoHTML = await actualizarHTMLDirecto('andragogia.html', '<div class="libro-3d" id="libro">', codigoHTML, 'después');

    if (exitoFotos && exitoHTML) {
        mostrarAlerta('🎉 ¡ÉXITO! Las 4 fotografías y la nueva hoja de libro fueron guardadas e insertadas en "andragogia.html".', 'success');
    } else {
        mostrarAlerta('Ocurrió un problema al escribir los archivos en tu repositorio local.');
    }
}

function descargarImagenesAndragogia() {
    EstadoApp.datosAndragogia.imagenesDataUrls.forEach((imgData, index) => {
        if (imgData) {
            const nombre = EstadoApp.datosAndragogia.nombresArchivos[index] || `andragogia_foto_${index + 1}.jpg`;
            setTimeout(() => {
                descargarArchivo(imgData, nombre);
            }, index * 300);
        }
    });
}
