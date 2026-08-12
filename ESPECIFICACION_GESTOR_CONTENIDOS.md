# ESPECIFICACIÓN CONCEPTUAL Y PLAN DE DESARROLLO — GESTOR DE CONTENIDOS WEB

> **Nota de Trazabilidad y Control de Sesión:** Este documento reside permanentemente en la raíz del proyecto (`ESPECIFICACION_GESTOR_CONTENIDOS.md`). Sirve como guía de requerimientos, especificación técnica y registro de estado para continuar el desarrollo en cualquier momento.

---

## 📌 REGISTRO DE ESTADO Y CONTINUIDAD DEL PROYECTO

| Paso / Fase | Componente / Archivo | Estado Actual | Notas / Próximo Paso |
| :--- | :--- | :---: | :--- |
| **0. Especificación** | `ESPECIFICACION_GESTOR_CONTENIDOS.md` | ✅ **Completado** | Documento creado en la raíz del repositorio. |
| **1. Estructura HTML** | `gestor/index.html` | ✅ **Completado** | Interfaz general con botón de Vincular Carpeta Local y Guardado Automático Directo. |
| **2. Estilos CSS** | `gestor/css/gestor.css` | ✅ **Completado** | Estilos limpios e institucionales, dropzones, previsualizaciones y tarjetas. |
| **3. Núcleo JavaScript** | `gestor/js/app.js` | ✅ **Completado** | Persistencia en IndexedDB para autoconectar la carpeta vinculada entre sesiones. |
| **4. Módulo Noticias** | `gestor/js/noticias.js` | ✅ **Completado** | Guardado directo de foto en `img/` e inserción automática de fragmento en `index.html`. |
| **5. Módulo Andragogía** | `gestor/js/andragogia.js` | ✅ **Completado** | Guardado directo de 4 fotos en `img/` e inserción automática de hoja en `andragogia.html`. |
| **6. Módulo Social** | `gestor/js/social.js` | ✅ **Completado** | Guardado directo de fotos en `img/social/` e inserción automática de polaroids en `social.html`. |
| **7. Verificación** | Pruebas de integración | ✅ **Completado** | Persistencia entre sesiones probada y lista para uso continuo. |

---

## 1. Propósito general

Desarrollar una aplicación web sencilla, intuitiva y visual que permita a una persona sin conocimientos de programación preparar contenidos para tres espacios específicos de un sitio web institucional:

1. **Noticias**
2. **Andragogía**
3. **Social**

La aplicación funcionará como una herramienta auxiliar de carga y preparación de contenidos. **No debe modificar automáticamente el repositorio de GitHub, no debe requerir conocimientos de programación y no debe alterar el diseño CSS ni la estructura visual existente del sitio.**

El usuario solamente debe proporcionar las imágenes y los textos correspondientes. La aplicación debe generar los archivos, fragmentos de código o estructura de contenido necesarios para incorporarlos posteriormente al proyecto.

---

## 2. Principio fundamental

La aplicación debe trabajar sobre una estructura visual ya existente.

Por lo tanto:

* No rediseñar las páginas existentes.
* No modificar los estilos CSS originales.
* No cambiar las dimensiones establecidas por el sitio.
* No alterar Bootstrap ni sus clases existentes.
* No modificar la estructura general de las páginas.
* No permitir que el usuario tenga que escribir código.
* La herramienta debe adaptarse al formato que ya utiliza cada sección.

La aplicación debe encargarse únicamente de **preparar el contenido**.

---

## 3. Interfaz general

La interfaz debe conservar un diseño simple, limpio y profesional.

La pantalla inicial debe presentar claramente las tres opciones principales:

```text
┌─────────────────────────────────────────────┐
│             GESTOR DE CONTENIDOS             │
│                                             │
│  Selecciona el espacio que deseas actualizar│
│                                             │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │  NOTICIAS  │ │ ANDRAGOGÍA │ │  SOCIAL  │ │
│  │    📰      │ │     📖     │ │    📷    │ │
│  └────────────┘ └────────────┘ └──────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

Cada opción debe abrir su propio flujo de trabajo.

La navegación debe ser intuitiva y debe existir siempre una opción para:

* Volver al inicio.
* Volver al paso anterior.
* Reiniciar el proceso.
* Cancelar la carga actual.

---

## 4. MÓDULO DE NOTICIAS

### 4.1. Función

El módulo de Noticias está destinado a preparar las imágenes que aparecerán en el espacio lateral de noticias del sitio web.

La sección de Noticias ya posee:

* Diseño.
* Distribución.
* Estilos CSS.
* Estructura Bootstrap.
* Tamaños.
* Posicionamiento.

La aplicación **NO debe crear ni modificar estos elementos**.

Su única función es preparar la imagen que será publicada.

### 4.2. Datos requeridos

El usuario únicamente debe:

1. Seleccionar una imagen desde el computador.
2. Visualizar una vista previa.
3. Confirmar la imagen.

No es necesario solicitar:

* Título.
* Descripción.
* Categoría.
* Fecha.
* Estilos.
* Tamaños manuales.

### 4.3. Flujo

#### Paso 1
Mostrar: "Selecciona la imagen de la noticia"
Botón: `[ SELECCIONAR IMAGEN ]`
También debe permitirse arrastrar y soltar una imagen.

#### Paso 2
Mostrar una vista previa de la imagen.
Opciones: `[ CAMBIAR IMAGEN ]` `[ CONFIRMAR ]`

#### Paso 3
Generar el contenido correspondiente al formato utilizado actualmente por el espacio de Noticias.
El sistema debe conservar exactamente la estructura existente:
```html
<div class="novedad-placeholder">
    <img src="./img/nombre_imagen.jpg" alt="Novedad">
</div>
```

---

## 5. MÓDULO DE ANDRAGOGÍA

### 5.1. Función

El módulo de Andragogía corresponde a una página independiente de la página principal `index`.

Esta sección utiliza una representación visual de un libro digital.

El usuario debe poder crear el contenido de una nueva publicación respetando exactamente la estructura visual del libro existente.

Este módulo es más complejo que Noticias porque cada publicación está compuesta por **cuatro imágenes y cuatro textos**.

### 5.2. Estructura del libro

La publicación debe estar formada por páginas.

#### Primera página
La primera página debe contener:
* Una imagen grande.
* Un texto asociado.

Distribución equivalente:
```text
┌───────────────────────────────┐
│                               │
│          IMAGEN GRANDE        │
│                               │
│                               │
├───────────────────────────────┤
│ Texto explicativo o breve     │
│ descripción de la imagen.     │
└───────────────────────────────┘
```
El usuario debe poder:
* Cargar la imagen.
* Escribir el texto.
* Visualizar una vista previa.

#### Segunda página
La segunda página debe contener tres bloques.
Cada bloque debe tener:
* Una descripción a la izquierda.
* Una imagen a la derecha.

Estructura conceptual:
```text
┌────────────────────────────────────┐
│ Descripción 1     │    Imagen 1   │
├────────────────────────────────────┤
│ Descripción 2     │    Imagen 2   │
├────────────────────────────────────┤
│ Descripción 3     │    Imagen 3   │
└────────────────────────────────────┘
```
Por lo tanto, esta página requiere:
* Imagen 2 + descripción 2.
* Imagen 3 + descripción 3.
* Imagen 4 + descripción 4.

La primera página utiliza:
* Imagen 1.
* Descripción 1.

En total: **4 imágenes + 4 textos.**

### 5.3. Ajuste automático

Las imágenes deben adaptarse automáticamente al espacio disponible.

El usuario no debe tener que:
* Cambiar dimensiones.
* Escribir CSS.
* Recortar manualmente.
* Modificar HTML.
* Calcular tamaños.

La aplicación debe conservar las proporciones de las imágenes y adaptarlas al espacio definido por el diseño existente.

Debe evitarse que una imagen desborde su contenedor, rompa la estructura del libro, modifique la altura de las páginas o desplace elementos.

### 5.4. Vista previa del libro

Antes de generar el contenido definitivo, la aplicación debe mostrar una vista previa del libro.
Debe permitir visualizar:
* Primera página.
* Segunda página.
* Distribución de las cuatro imágenes.
* Los cuatro textos.

Navegación: `[ ← ANTERIOR ]` `[ SIGUIENTE → ]`

### 5.5. Generación

Una vez confirmada la publicación, la aplicación debe generar el contenido correspondiente al formato actual de la página de Andragogía.

```html
<!-- PÁGINA IZQUIERDA -->
<div class="foto-principal-container">
    <img src="./img/andragogia/foto1.jpg" alt="Imagen Principal" class="foto-principal">
</div>
<h3 class="titulo-desc">MEMORIA</h3>
<div class="descripcion-amplia">
    <p>TEXTO 1</p>
</div>

<!-- PÁGINA DERECHA -->
<div class="grid-tres-fotos">
    <div class="foto-pequena-item">
        <div class="foto-wrapper">
            <img src="./img/andragogia/foto2.jpg" alt="Foto 2">
        </div>
        <p class="desc-pequena">TEXTO 2</p>
    </div>
    <div class="foto-pequena-item">
        <div class="foto-wrapper">
            <img src="./img/andragogia/foto3.jpg" alt="Foto 3">
        </div>
        <p class="desc-pequena">TEXTO 3</p>
    </div>
    <div class="foto-pequena-item">
        <div class="foto-wrapper">
            <img src="./img/andragogia/foto4.jpg" alt="Foto 4">
        </div>
        <p class="desc-pequena">TEXTO 4</p>
    </div>
</div>
```

---

## 6. MÓDULO SOCIAL

### 6.1. Función

El espacio Social corresponde a un álbum de fotografías.
Las fotografías se agregan individualmente.
Cada elemento del álbum está compuesto únicamente por:
1. Una imagen.
2. Una descripción.

### 6.2. Carga de fotografías

La interfaz debe permitir agregar fotografías una por una con el botón `[ + AGREGAR FOTOGRAFÍA ]`.
Cada foto genera una tarjeta de edición:
```text
┌──────────────────────────────┐
│                              │
│          IMAGEN              │
│                              │
├──────────────────────────────┤
│ Descripción:                 │
│                              │
│ [__________________________] │
│                              │
│ [Cambiar imagen] [Eliminar]  │
└──────────────────────────────┘
```

### 6.3. Descripción

Cada fotografía debe tener un campo de texto para escribir su descripción.

### 6.4. Vista previa y Lightbox

Vista previa del álbum en Polaroid con ventana ampliada (Lightbox) al hacer clic.

```html
<article class="foto-polaroid">
    <img src="./img/social/foto.jpg" alt="Descripción de la foto" class="polaroid-img">
    <p class="polaroid-texto">TEXTO_DESCRIPTIVO</p>
</article>
```

---

## 7. GENERACIÓN DEL CONTENIDO

Separación clara de:
* **Contenido variable**: Imágenes, Textos, Descripciones.
* **Estructura fija**: HTML base, Clases CSS, Bootstrap, Estructura institucional.

---

## 8. SALIDA DEL PROGRAMA

Opciones finales:
* `[ COPIAR CÓDIGO ]`
* `[ DESCARGAR ARCHIVOS ]`
* `[ VER RESULTADO ]`
* `[ NUEVO CONTENIDO ]`

---

## 9. MANEJO DE IMÁGENES

* Procesamiento en navegador (`FileReader` / Data URL / Blob).
* Validación de formato e imagen.
* Preservación de calidad sin envío a servidores externos.

---

## 10. EXPERIENCIA DEL USUARIO

Lenguaje 100% cotidiano sin jerga técnica (sin "HTML", "CSS", "ID", "Alt").

---

## 11. VALIDACIONES

* **Noticias**: Imagen válida presente.
* **Andragogía**: 4 imágenes y 4 textos completados.
* **Social**: Imagen y descripción para cada foto agregada.

---

## 12. ARQUITECTURA DE ARCHIVOS PROPUESTA

```text
gestor/
├── index.html
├── css/
│   └── gestor.css
├── js/
│   ├── app.js
│   ├── noticias.js
│   ├── andragogia.js
│   └── social.js
└── assets/
    ├── iconos/
    └── recursos/
```

---

## 13. REGLA PRINCIPAL PARA EL DESARROLLO

La aplicación es un **editor de contenido**, no un editor del sitio. Adapta automáticamente el contenido del usuario a la estructura visual y diseño institucional existente.
