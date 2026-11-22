/* ==========================================================================
   GESTOR DE CONTENIDOS WEB — ANDRAGOGIA.JS
   Lógica del Módulo de Andragogía (4 Archivos Fotos/Videos + 4 Textos -> Libro Digital)
   ========================================================================== */

function cargarFotoAndro(index, file) {
    if (!file) return;

    const esVid = esArchivoVideo(file);
    const esImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

    if (!esVid && !esImg) {
        mostrarAlerta(`El archivo para el bloque ${index + 1} no es válido. Selecciona una imagen (JPG, PNG, WEBP) o un video (MP4, WEBM).`);
        return;
    }

    EstadoApp.datosAndragogia.archivosBlobs[index] = file;
    EstadoApp.datosAndragogia.imagenesBlobs[index] = file; // retrocompatibilidad
    EstadoApp.datosAndragogia.nombresArchivos[index] = file.name;
    EstadoApp.datosAndragogia.esVideo[index] = esVid;

    const thumb = document.getElementById(`andro-preview-thumb-${index + 1}`);

    if (esVid) {
        const videoUrl = URL.createObjectURL(file);
        EstadoApp.datosAndragogia.archivosDataUrls[index] = videoUrl;
        EstadoApp.datosAndragogia.imagenesDataUrls[index] = videoUrl;

        if (thumb) {
            thumb.innerHTML = `🎬 <strong>${file.name}</strong> (Video listo).`;
        }
    } else {
        const reader = new FileReader();
        reader.onload = function (e) {
            EstadoApp.datosAndragogia.archivosDataUrls[index] = e.target.result;
            EstadoApp.datosAndragogia.imagenesDataUrls[index] = e.target.result;

            if (thumb) {
                thumb.innerHTML = `📷 <strong>${file.name}</strong> (Foto lista).`;
            }
        };
        reader.readAsDataURL(file);
    }
}

function validarYVistaPreviaAndragogia() {
    [0, 1, 2, 3].forEach(i => {
        const campo = document.getElementById(`andro-texto-${i + 1}`);
        if (campo) {
            EstadoApp.datosAndragogia.textos[i] = campo.value.trim();
        }
    });

    for (let i = 0; i < 4; i++) {
        if (!EstadoApp.datosAndragogia.archivosBlobs[i] && !EstadoApp.datosAndragogia.imagenesBlobs[i]) {
            mostrarAlerta(`Falta seleccionar la fotografía o video número ${i + 1}.`);
            return;
        }
        if (!EstadoApp.datosAndragogia.textos[i]) {
            mostrarAlerta(`Falta escribir el texto o descripción del número ${i + 1}.`);
            return;
        }
    }

    ocultarAlerta();

    [0, 1, 2, 3].forEach(i => {
        const imgPrev = document.getElementById(`andro-prev-img-${i + 1}`);
        const vidPrev = document.getElementById(`andro-prev-vid-${i + 1}`);
        const txtPrev = document.getElementById(`andro-prev-txt-${i + 1}`);
        const esVid = EstadoApp.datosAndragogia.esVideo[i];
        const src = EstadoApp.datosAndragogia.archivosDataUrls[i];

        if (txtPrev) {
            txtPrev.textContent = EstadoApp.datosAndragogia.textos[i];
        }

        if (esVid) {
            if (imgPrev) { imgPrev.style.display = 'none'; imgPrev.src = ''; }
            if (vidPrev) {
                vidPrev.src = src;
                vidPrev.style.display = 'block';
                vidPrev.load();
            }
        } else {
            if (vidPrev) { vidPrev.pause(); vidPrev.style.display = 'none'; vidPrev.src = ''; }
            if (imgPrev) {
                imgPrev.src = src;
                imgPrev.style.display = 'block';
            }
        }
    });

    mostrarSubPaso('andragogia', 2);
}

function irAPasoAndragogia(paso) {
    if (paso === 1) {
        [1, 2, 3, 4].forEach(i => {
            const vidPrev = document.getElementById(`andro-prev-vid-${i}`);
            if (vidPrev) vidPrev.pause();
        });
    }
    mostrarSubPaso('andragogia', paso);
}

function generarHTMLHojaAndragogia() {
    const nombres = EstadoApp.datosAndragogia.nombresArchivos;
    const textos = EstadoApp.datosAndragogia.textos;
    const esVideo = EstadoApp.datosAndragogia.esVideo;

    // Renderizado para bloque 1 (Principal)
    let bloque1HTML = '';
    const nom1 = nombres[0] || (esVideo[0] ? 'video1.mp4' : 'foto1.jpg');
    if (esVideo[0]) {
        bloque1HTML = `<video src="./img/${nom1}" controls class="foto-principal" style="width: 100%; height: 100%; object-fit: cover; background: #000;"></video>`;
    } else {
        bloque1HTML = `<img src="./img/${nom1}" alt="Foto Principal" class="foto-principal">`;
    }

    // Renderizado para bloques 2, 3, 4
    const bloquesDerHTML = [1, 2, 3].map(idx => {
        const nom = nombres[idx] || (esVideo[idx] ? `video${idx + 1}.mp4` : `foto${idx + 1}.jpg`);
        let elementoMedia = '';
        if (esVideo[idx]) {
            elementoMedia = `<video src="./img/${nom}" controls style="width: 100%; height: 100%; object-fit: cover; background: #000;"></video>`;
        } else {
            elementoMedia = `<img src="./img/${nom}" alt="Foto ${idx + 1}">`;
        }
        return `                <div class="foto-pequena-item">\n                    <div class="foto-wrapper">\n                        ${elementoMedia}\n                    </div>\n                    <p class="desc-pequena">${textos[idx]}</p>\n                </div>`;
    }).join('\n');

    return `<!-- HOJA DE LIBRO DE ANDRAGOGÍA (4 FOTOS/VIDEOS + 4 TEXTOS) -->
<div class="hoja">
    <!-- PÁGINA IZQUIERDA -->
    <div class="cara frente">
        <div class="pagina pagina-izquierda">
            <div class="foto-principal-container">
                ${bloque1HTML}
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
${bloquesDerHTML}
            </div>
        </div>
    </div>
</div>`;
}

function confirmarAndragogia() {
    [1, 2, 3, 4].forEach(i => {
        const vidPrev = document.getElementById(`andro-prev-vid-${i}`);
        if (vidPrev) vidPrev.pause();
    });

    const codigoHTML = generarHTMLHojaAndragogia();

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

    const btn = document.getElementById('btn-guardar-directo-andro');
    const textoOriginal = btn ? btn.textContent : '';
    if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Guardando publicaciones del libro...';
    }

    try {
        const nombres = EstadoApp.datosAndragogia.nombresArchivos;
        const blobs = EstadoApp.datosAndragogia.archivosBlobs;
        const esVideo = EstadoApp.datosAndragogia.esVideo;

        let exitoArchivos = true;
        for (let i = 0; i < 4; i++) {
            const esVid = esVideo[i];
            const nombre = nombres[i] || (esVid ? `andro_video_${i + 1}.mp4` : `andro_foto_${i + 1}.jpg`);
            // Guardar en img/ y si es video también en media/andragogia/
            const ok = await guardarArchivoEnSubcarpeta(['img'], nombre, blobs[i]);
            if (esVid) {
                await guardarArchivoEnSubcarpeta(['media', 'andragogia'], nombre, blobs[i]);
            }
            if (!ok) exitoArchivos = false;
        }

        const codigoHTML = generarHTMLHojaAndragogia();
        const exitoHTML = await actualizarHTMLDirecto('andragogia.html', '<div class="libro-3d" id="libro">', codigoHTML, 'después');

        if (exitoArchivos && exitoHTML) {
            mostrarAlerta('🎉 ¡ÉXITO! Los 4 contenidos (fotos/videos) y la nueva hoja de libro fueron guardados en "img/" e insertados en "andragogia.html".', 'success');
        } else {
            mostrarAlerta('Ocurrió un problema al escribir los archivos en tu repositorio local. Verifica que "iniciar_gestor.bat" esté activo.');
        }
    } catch (err) {
        console.error('Error guardando andragogia:', err);
        mostrarAlerta(`Error al guardar: ${err.message}`);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = textoOriginal;
        }
    }
}

function descargarImagenesAndragogia() {
    EstadoApp.datosAndragogia.archivosBlobs.forEach((blob, index) => {
        if (blob) {
            const esVid = EstadoApp.datosAndragogia.esVideo[index];
            const nombre = EstadoApp.datosAndragogia.nombresArchivos[index] || (esVid ? `andragogia_video_${index + 1}.mp4` : `andragogia_foto_${index + 1}.jpg`);
            const url = EstadoApp.datosAndragogia.archivosDataUrls[index] || URL.createObjectURL(blob);
            setTimeout(() => {
                descargarArchivo(url, nombre);
            }, index * 300);
        }
    });
}
