/* ==========================================================================
   GESTOR DE CONTENIDOS WEB — SOCIAL.JS
   Lógica del Módulo Social (Álbum Polaroid de Fotos y Videos + Guardado Directo)
   ========================================================================== */

let contadorFotosSocial = 0;

function agregarTarjetaFotoSocial() {
    contadorFotosSocial++;
    const idUnico = contadorFotosSocial;

    const nuevoItemObj = {
        id: idUnico,
        archivoBlob: null,
        imagenBlob: null, // compatibilidad
        archivoDataUrl: null,
        imagenDataUrl: null, // compatibilidad
        texto: '',
        nombreArchivo: '',
        esVideo: false
    };

    EstadoApp.datosSocial.push(nuevoItemObj);

    const contenedor = document.getElementById('contenedor-fotos-social');
    if (!contenedor) return;

    const divTarjeta = document.createElement('div');
    divTarjeta.className = 'tarjeta-foto-edicion';
    divTarjeta.id = `tarjeta-social-${idUnico}`;

    divTarjeta.innerHTML = `
        <div class="tarjeta-foto-header">
            <span class="foto-num-badge">Elemento ${EstadoApp.datosSocial.length} (Foto o Video)</span>
            <button type="button" class="btn-gestor btn-gestor-danger btn-sm" onclick="eliminarTarjetaSocial(${idUnico})">🗑️ Eliminar</button>
        </div>
        <div class="campo-grupo mb-3">
            <div class="dropzone-container p-3">
                <div id="social-thumb-${idUnico}" class="mb-2">📷🎬 Seleccionar Fotografía o Video</div>
                <button type="button" class="btn-gestor btn-gestor-secondary btn-sm">Cargar Foto o Video</button>
                <input type="file" id="social-file-${idUnico}" class="input-file-oculto" accept="image/*,video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi,.3gp" onchange="cargarFotoSocial(${idUnico}, this.files[0])">
            </div>
        </div>
        <div class="campo-grupo">
            <label class="campo-label">Descripción de la situación observada:</label>
            <textarea id="social-text-${idUnico}" class="campo-textarea" placeholder="Escribe aquí la descripción de esta fotografía o video..."></textarea>
        </div>
    `;

    contenedor.appendChild(divTarjeta);
}

function eliminarTarjetaSocial(id) {
    if (EstadoApp.datosSocial.length <= 1) {
        mostrarAlerta('Debes conservar al menos una fotografía o video en el álbum.');
        return;
    }

    EstadoApp.datosSocial = EstadoApp.datosSocial.filter(item => item.id !== id);
    const el = document.getElementById(`tarjeta-social-${id}`);
    if (el) el.remove();
}

function cargarFotoSocial(id, file) {
    if (!file) return;

    const esVid = esArchivoVideo(file);
    const esImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

    if (!esVid && !esImg) {
        mostrarAlerta('El archivo seleccionado no es válido. Selecciona una imagen (JPG, PNG, WEBP) o un video (MP4, WEBM).');
        return;
    }

    const item = EstadoApp.datosSocial.find(f => f.id === id);
    if (!item) return;

    item.archivoBlob = file;
    item.imagenBlob = file; // compatibilidad
    item.nombreArchivo = file.name;
    item.esVideo = esVid;

    const thumb = document.getElementById(`social-thumb-${id}`);

    if (esVid) {
        const videoUrl = URL.createObjectURL(file);
        item.archivoDataUrl = videoUrl;
        item.imagenDataUrl = videoUrl;

        if (thumb) {
            thumb.innerHTML = `🎬 <strong>${file.name}</strong> (Video listo).`;
        }
    } else {
        const reader = new FileReader();
        reader.onload = function (e) {
            item.archivoDataUrl = e.target.result;
            item.imagenDataUrl = e.target.result;

            if (thumb) {
                thumb.innerHTML = `📷 <strong>${file.name}</strong> (Foto lista).`;
            }
        };
        reader.readAsDataURL(file);
    }
}

function validarYVistaPreviaSocial() {
    EstadoApp.datosSocial.forEach(item => {
        const txtArea = document.getElementById(`social-text-${item.id}`);
        if (txtArea) {
            item.texto = txtArea.value.trim();
        }
    });

    if (EstadoApp.datosSocial.length === 0) {
        mostrarAlerta('Por favor agrega al menos una fotografía o video.');
        return;
    }

    for (let i = 0; i < EstadoApp.datosSocial.length; i++) {
        const item = EstadoApp.datosSocial[i];
        if (!item.archivoDataUrl && !item.imagenDataUrl) {
            mostrarAlerta(`Falta seleccionar el archivo de la tarjeta número ${i + 1}.`);
            return;
        }
        if (!item.texto) {
            mostrarAlerta(`Falta escribir la descripción del contenido número ${i + 1}.`);
            return;
        }
    }

    ocultarAlerta();

    const galeriaPreview = document.getElementById('galeria-preview-social');
    if (galeriaPreview) {
        galeriaPreview.innerHTML = '';
        EstadoApp.datosSocial.forEach((item, index) => {
            const article = document.createElement('article');
            article.className = 'polaroid-preview-item';
            
            const textoLimpio = (item.texto || '').replace(/"/g, '&quot;');

            if (item.esVideo) {
                article.innerHTML = `
                    <video src="${item.archivoDataUrl}" controls class="polaroid-preview-img" style="object-fit: cover; background: #000;"></video>
                    <p class="polaroid-preview-txt">${textoLimpio}</p>
                `;
                // Al hacer clic en el texto o contenedor abre el lightbox
                article.addEventListener('click', (e) => {
                    if (e.target.tagName !== 'VIDEO') {
                        abrirLightbox(item.archivoDataUrl, item.texto, true);
                    }
                });
            } else {
                article.onclick = () => abrirLightbox(item.archivoDataUrl, item.texto, false);
                article.innerHTML = `
                    <img src="${item.archivoDataUrl}" alt="Foto ${index + 1}" class="polaroid-preview-img">
                    <p class="polaroid-preview-txt">${textoLimpio}</p>
                `;
            }

            galeriaPreview.appendChild(article);
        });
    }

    mostrarSubPaso('social', 2);
}

function irAPasoSocial(paso) {
    if (paso === 1) {
        cerrarLightbox();
        // Pausar todos los videos de la preview
        document.querySelectorAll('#galeria-preview-social video').forEach(v => v.pause());
    }
    mostrarSubPaso('social', paso);
}

function abrirLightbox(mediaSrc, txt, esVideo = false) {
    const modal = document.getElementById('modal-lightbox');
    const targetImg = document.getElementById('lightbox-img-target');
    const targetVid = document.getElementById('lightbox-video-target');
    const targetTxt = document.getElementById('lightbox-txt-target');

    if (!modal) return;

    if (esVideo) {
        if (targetImg) { targetImg.style.display = 'none'; targetImg.src = ''; }
        if (targetVid) {
            targetVid.src = mediaSrc;
            targetVid.style.display = 'block';
            targetVid.play().catch(() => {});
        }
    } else {
        if (targetVid) { targetVid.pause(); targetVid.style.display = 'none'; targetVid.src = ''; }
        if (targetImg) {
            targetImg.src = mediaSrc;
            targetImg.style.display = 'block';
        }
    }

    if (targetTxt) targetTxt.textContent = txt;
    modal.classList.add('activo');
}

function cerrarLightbox() {
    const modal = document.getElementById('modal-lightbox');
    const targetVid = document.getElementById('lightbox-video-target');
    if (targetVid) {
        targetVid.pause();
        targetVid.src = '';
    }
    if (modal) modal.classList.remove('activo');
}

function confirmarSocial() {
    // Pausar reproducciones
    cerrarLightbox();
    document.querySelectorAll('#galeria-preview-social video').forEach(v => v.pause());

    let htmlResultado = `<!-- NUEVOS CONTENIDOS PARA LA RESEÑA SOCIAL (social.html) -->\n`;

    EstadoApp.datosSocial.forEach((item, idx) => {
        const esVid = item.esVideo;
        const nombreArchivo = item.nombreArchivo || (esVid ? `video_${idx + 1}.mp4` : `foto_${idx + 1}.jpg`);
        
        if (esVid) {
            htmlResultado += `<article class="foto-polaroid">\n    <video src="./img/social/${nombreArchivo}" controls class="polaroid-img" style="object-fit: cover; background: #000;"></video>\n    <p class="polaroid-texto">${item.texto}</p>\n</article>\n`;
        } else {
            htmlResultado += `<article class="foto-polaroid">\n    <img src="./img/social/${nombreArchivo}" alt="Descripción de la foto" class="polaroid-img">\n    <p class="polaroid-texto">${item.texto}</p>\n</article>\n`;
        }
    });

    const cajaCodigo = document.getElementById('social-codigo-output');
    if (cajaCodigo) {
        cajaCodigo.textContent = htmlResultado;
    }

    const containerAuto = document.getElementById('contenedor-auto-social');
    if (containerAuto) {
        containerAuto.style.display = EstadoApp.dirHandle ? 'block' : 'none';
    }

    mostrarSubPaso('social', 3);
}

async function guardarSocialDirectoEnDisco() {
    if (!EstadoApp.dirHandle) {
        mostrarAlerta('Primero debes vincular la carpeta de tu proyecto con el botón 📁 Vincular Carpeta.');
        return;
    }

    const btn = document.getElementById('btn-guardar-directo-social');
    const textoOriginal = btn ? btn.textContent : '';
    if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Guardando álbum en el sitio...';
    }

    try {
        let exitoArchivos = true;
        let htmlResultado = `<!-- NUEVOS CONTENIDOS AGREGADOS CON EL GESTOR DE CONTENIDOS -->\n`;

        for (let i = 0; i < EstadoApp.datosSocial.length; i++) {
            const item = EstadoApp.datosSocial[i];
            const esVid = item.esVideo;
            const nombreArchivo = item.nombreArchivo || (esVid ? `social_video_${i + 1}.mp4` : `social_foto_${i + 1}.jpg`);

            const ok = await guardarArchivoEnSubcarpeta(['img', 'social'], nombreArchivo, item.archivoBlob || item.imagenBlob);
            if (esVid) {
                await guardarArchivoEnSubcarpeta(['media', 'img', 'social'], nombreArchivo, item.archivoBlob || item.imagenBlob);
            }
            if (!ok) exitoArchivos = false;

            if (esVid) {
                htmlResultado += `<article class="foto-polaroid">\n    <video src="./img/social/${nombreArchivo}" controls class="polaroid-img" style="object-fit: cover; background: #000;"></video>\n    <p class="polaroid-texto">${item.texto}</p>\n</article>\n`;
            } else {
                htmlResultado += `<article class="foto-polaroid">\n    <img src="./img/social/${nombreArchivo}" alt="Descripción de la foto" class="polaroid-img">\n    <p class="polaroid-texto">${item.texto}</p>\n</article>\n`;
            }
        }

        const exitoHTML = await actualizarHTMLDirecto('social.html', '<section class="galeria-grid">', htmlResultado, 'después');

        if (exitoArchivos && exitoHTML) {
            mostrarAlerta(`🎉 ¡ÉXITO! Los ${EstadoApp.datosSocial.length} contenidos (fotos/videos) fueron guardados en "img/social/" y agregados a "social.html".`, 'success');
        } else {
            mostrarAlerta('Ocurrió un problema al escribir los archivos en tu repositorio local. Verifica que "iniciar_gestor.bat" esté activo.');
        }
    } catch (err) {
        console.error('Error guardando social:', err);
        mostrarAlerta(`Error al guardar: ${err.message}`);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = textoOriginal;
        }
    }
}

function descargarFotosSocial() {
    EstadoApp.datosSocial.forEach((item, index) => {
        const file = item.archivoBlob || item.imagenBlob;
        if (file) {
            const esVid = item.esVideo;
            const nombre = item.nombreArchivo || (esVid ? `social_video_${index + 1}.mp4` : `social_foto_${index + 1}.jpg`);
            const url = item.archivoDataUrl || URL.createObjectURL(file);
            setTimeout(() => {
                descargarArchivo(url, nombre);
            }, index * 300);
        }
    });
}
