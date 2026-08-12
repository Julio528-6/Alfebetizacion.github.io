/* ==========================================================================
   GESTOR DE CONTENIDOS WEB — SOCIAL.JS
   Lógica del Módulo Social (Álbum de Memoria Fotográfica Polaroid)
   ========================================================================== */

let contadorFotosSocial = 0;

function agregarTarjetaFotoSocial() {
    contadorFotosSocial++;
    const idUnico = contadorFotosSocial;

    const nuevaFotoObj = {
        id: idUnico,
        imagen: null,
        texto: '',
        nombreArchivo: ''
    };

    EstadoApp.datosSocial.push(nuevaFotoObj);

    const contenedor = document.getElementById('contenedor-fotos-social');
    if (!contenedor) return;

    const divTarjeta = document.createElement('div');
    divTarjeta.className = 'tarjeta-foto-edicion';
    divTarjeta.id = `tarjeta-social-${idUnico}`;

    divTarjeta.innerHTML = `
        <div class="tarjeta-foto-header">
            <span class="foto-num-badge">Fotografía</span>
            <button type="button" class="btn-gestor btn-gestor-danger btn-sm" onclick="eliminarTarjetaSocial(${idUnico})">🗑️ Eliminar</button>
        </div>
        <div class="campo-grupo mb-3">
            <div class="dropzone-container p-3" onclick="document.getElementById('social-file-${idUnico}').click()">
                <div id="social-thumb-${idUnico}" class="mb-2">📷 Seleccionar Imagen</div>
                <button type="button" class="btn-gestor btn-gestor-secondary btn-sm">Cargar Foto</button>
                <input type="file" id="social-file-${idUnico}" class="input-file-oculto" accept="image/*" onchange="cargarFotoSocial(${idUnico}, this.files[0])">
            </div>
        </div>
        <div class="campo-grupo">
            <label class="campo-label">Descripción de la situación observada:</label>
            <textarea id="social-text-${idUnico}" class="campo-textarea" placeholder="Escribe aquí la descripción de esta fotografía..."></textarea>
        </div>
    `;

    contenedor.appendChild(divTarjeta);
}

function eliminarTarjetaSocial(id) {
    if (EstadoApp.datosSocial.length <= 1) {
        mostrarAlerta('Debes conservar al menos una fotografía en el álbum.');
        return;
    }

    EstadoApp.datosSocial = EstadoApp.datosSocial.filter(item => item.id !== id);
    const el = document.getElementById(`tarjeta-social-${id}`);
    if (el) el.remove();
}

function cargarFotoSocial(id, file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        mostrarAlerta('El archivo seleccionado no es una imagen válida.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const item = EstadoApp.datosSocial.find(f => f.id === id);
        if (item) {
            item.imagen = e.target.result;
            item.nombreArchivo = file.name;
        }

        const thumb = document.getElementById(`social-thumb-${id}`);
        if (thumb) {
            thumb.innerHTML = `✅ <strong>${file.name}</strong> cargada.`;
        }
    };
    reader.readAsDataURL(file);
}

function validarYVistaPreviaSocial() {
    // Recoger textos actualizados
    EstadoApp.datosSocial.forEach(item => {
        const txtArea = document.getElementById(`social-text-${item.id}`);
        if (txtArea) {
            item.texto = txtArea.value.trim();
        }
    });

    // Validaciones
    if (EstadoApp.datosSocial.length === 0) {
        mostrarAlerta('Por favor agrega al menos una fotografía.');
        return;
    }

    for (let i = 0; i < EstadoApp.datosSocial.length; i++) {
        const item = EstadoApp.datosSocial[i];
        if (!item.imagen) {
            mostrarAlerta(`Falta seleccionar la imagen de la fotografía número ${i + 1}.`);
            return;
        }
        if (!item.texto) {
            mostrarAlerta(`Falta escribir la descripción de la fotografía número ${i + 1}.`);
            return;
        }
    }

    ocultarAlerta();

    // Renderizar Galería Polaroid (Paso 2)
    const galeriaPreview = document.getElementById('galeria-preview-social');
    if (galeriaPreview) {
        galeriaPreview.innerHTML = '';
        EstadoApp.datosSocial.forEach((item, index) => {
            const article = document.createElement('article');
            article.className = 'polaroid-preview-item';
            article.onclick = () => abrirLightbox(item.imagen, item.texto);

            article.innerHTML = `
                <img src="${item.imagen}" alt="Foto ${index + 1}" class="polaroid-preview-img">
                <p class="polaroid-preview-txt">${item.texto}</p>
            `;
            galeriaPreview.appendChild(article);
        });
    }

    mostrarSubPaso('social', 2);
}

function irAPasoSocial(paso) {
    mostrarSubPaso('social', paso);
}

function abrirLightbox(imgSrc, txt) {
    const modal = document.getElementById('modal-lightbox');
    const targetImg = document.getElementById('lightbox-img-target');
    const targetTxt = document.getElementById('lightbox-txt-target');

    if (modal && targetImg && targetTxt) {
        targetImg.src = imgSrc;
        targetTxt.textContent = txt;
        modal.classList.add('activo');
    }
}

function cerrarLightbox() {
    const modal = document.getElementById('modal-lightbox');
    if (modal) modal.classList.remove('activo');
}

function confirmarSocial() {
    // Generar fragmentos HTML polaroid exactamente como en social.html
    let htmlResultado = `<!-- NUEVAS FOTOGRAFÍAS PARA LA RESEÑA SOCIAL (social.html) -->\n`;

    EstadoApp.datosSocial.forEach((item) => {
        const nombreImg = item.nombreArchivo || 'foto.jpg';
        htmlResultado += `<article class="foto-polaroid">\n    <img src="./img/social/${nombreImg}" alt="Descripción de la foto" class="polaroid-img">\n    <p class="polaroid-texto">${item.texto}</p>\n</article>\n`;
    });

    const cajaCodigo = document.getElementById('social-codigo-output');
    if (cajaCodigo) {
        cajaCodigo.textContent = htmlResultado;
    }

    mostrarSubPaso('social', 3);
}

function descargarFotosSocial() {
    EstadoApp.datosSocial.forEach((item, index) => {
        if (item.imagen) {
            const nombre = item.nombreArchivo || `social_foto_${index + 1}.jpg`;
            setTimeout(() => {
                descargarArchivo(item.imagen, nombre);
            }, index * 300);
        }
    });
}
