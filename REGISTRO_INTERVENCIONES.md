# Registro de Intervenciones y Memoria del Proyecto

**Proyecto:** Alfabetización ENS — Escuela Normal Superior Nuestra Señora de la Candelaria  
**Documento:** Historial de Intervenciones, Diseño y Lenguaje  

---

## 1. Intervención 1: Extensión y Desarrollo de Hojas para la Página de Andragogía

- **Fecha de Intervención:** 3 - 4 de Agosto de 2026
- **Archivos Intervenidos:** 
  - `andragogia.html`
  - Recopilación desde `social.html` e imágenes de `img/social/`

### ¿Qué se hizo?
Se desarrollaron **2 nuevos pares de hojas (4 páginas adicionales)** en el libro interactivo 3D y en su versión responsiva móvil dentro de la página `andragogia.html`.
- **Página 3:** *El Despertar de la Lectura* (Imagen principal `img/social/1.jpeg` y texto reflexivo extenso).
- **Página 4:** *Procesos de Literacidad* (Cuadrícula de 3 imágenes pequeñas: `img/social/2.jpeg`, `img/social/3.jpeg`, `img/social/4.jpeg`).
- **Página 5:** *El Libro de Mi Propia Vida* (Imagen principal `img/social/9.jpeg` y texto sobre memoria autobiográfica).
- **Página 6:** *Aprendizaje Activo y Convivencia* (Cuadrícula de 3 imágenes pequeñas: `img/social/7.jpeg`, `img/social/8.jpeg`, `img/social/12.jpeg`).
- Se reestructuró la hoja final para que la **Contraportada** ocupe el reverso de la nueva Hoja 3.
- Se actualizó el contador móvil de páginas a 8 slides.

### ¿Cómo se hizo?
1. **Estructura HTML 3D:** Se clonó la arquitectura de nodos `.hoja`, `.cara.frente`, `.cara.atras`, `.pagina-izquierda` y `.pagina-derecha`, manteniendo el apilamiento de capas por `z-index` decreciente para permitir el giro natural en `rotateY(-180deg)`.
2. **Consolidación de Contenidos:** Se leyeron las leyendas explicativas de la galería en `social.html`. Se tomaron esos núcleos conceptuales (ej. lectura guiada de la letra "i", rastro natural en la naturaleza, planas de don Adán, el libro de vida, el juego del UNO, el reloj de propósitos y el origami) y se organizaron en explicaciones más profundas y articuladas.
3. **Versión Móvil:** Se agregaron las estructuras `.pagina-movil` correspondientes en el contenedor `#trackMovil`, ajustando el control deslizante táctil y el indicador.

### Criterios de Diseño
- **Molde Visual Fiel:** Mantenimiento estricto del estilo de encuadernación en verde institucional (`#0e5b37`), filigranas doradas/amarillas (`#FCF876`), bordes dobles, texturas vintage de hojas impresas y tipografía mixta (titulares en *Gloria Hallelujah* y cuerpo en *Comic Neue*).
- **Paginación Simétrica:** Alternate entre páginas de diseño amplio (una sola foto enmarcándola como una polaroid/marco físico con su síntesis reflexiva) y páginas de detalles (tarjetas en fondo beige `#F5F5DC` con miniaturas con ligeras rotaciones aleatorias).

### Enfoque de Lenguaje y Redacción
- **Rigor Pedagógico e Integridad de la Información:** No se inventó ningún hecho ni persona. Se conservaron los nombres (don Adán, etc.) y los ejercicios exactos reportados en la reseña social.
- **Tono Andragógico Enriquecido:** Se expresaron los ejercicios en términos del modelo andragógico (autonomía del adulto mayor, dignidad a través de la escritura, conciencia fonológica, memoria autobiográfica y construcción colectiva de la comunidad de aprendizaje).

---

## 2. Intervención 2: Sistema Global de Animaciones Elaboradas (Estilo Apple)

- **Fecha de Intervención:** 4 de Agosto de 2026
- **Archivos Intervenidos / Creados:**
  - `animaciones.js` (Nuevo motor de animaciones micro-interactivas)
  - `estilo.css` (Adición del sistema global de keyframes y utilidades)
  - `index.html`, `andragogia.html`, `social.html`, `referentes.html`, `QSomos.html`, `información.html` (Vincular script y atributos de animación)

### ¿Qué se hizo?
Se diseñó e implementó un **sistema de animación integral inspirado en las guías de interfaz de Apple (WWDC & Human Interface Guidelines)** para todo el sitio web:
- **Efecto Ripple (Onda física de presión):** Respuesta táctil al hacer clic en botones principales, tarjetas y enlaces.
- **Scroll Reveal con Staggering:** Aparición progresiva y escalonada de elementos (cards, listas, videos, polaroids) a medida que el usuario desplaza la pantalla.
- **Efecto Magnético (Floating Hover):** Los botones de la barra de navegación atraen levemente su posición hacia el cursor.
- **Micro-interacciones en Controles:** Rotación con spring en iconos, elevación con sombras dinámicas de profundidad en cards, brillo diagonal (*shimmer*) sobre las portadas del libro 3D y subrayados animados que nacen desde el centro.

### ¿Cómo se hizo?
1. **Creación del Motor JS (`animaciones.js`):**
   - Utilización de `IntersectionObserver` con margen negativo de activación para detectar visibilidad de elementos.
   - Algoritmo de retraso automático (*stagger delay*) calculando `i * 60ms` o `i * 70ms` para elementos hijos.
   - Creación dinámica de elementos `span.ripple-wave` con `animation: rippleExpand` que se autodestruyen en 500ms.
   - Manejadores de eventos `mousemove` y `mouseleave` para calcular el desplazamiento del cursor respecto al centro de los botones de la barra institucional.

2. **Sistema en CSS (`estilo.css`):**
   - Definición de 14 `@keyframes` (`fadeUpIn`, `scaleSpring`, `logoEntrada`, `tituloEntrada`, `menuSlideDown`, `pulseRing`, `polaroidEntrada`, `libroShimmer`, `numPagEntrada`, etc.).
   - Implementación de curvas de aceleración personalizadas (*Bezier Curves*) propias de Apple:
     - `cubic-bezier(0.25, 0.46, 0.45, 0.94)` para desplazamientos fluidos y naturales.
     - `cubic-bezier(0.34, 1.56, 0.64, 1)` para rebotes suaves tipo muelle (*spring*).
   - Inclusión de regla `@media (prefers-reduced-motion: reduce)` para garantizar la accesibilidad de usuarios con sensibilidad al movimiento.

### Criterios de Diseño (Inspiración Apple)
- **Brevedad y Propósito:** Animaciones ultrarrápidas (entre 150ms y 420ms). Ninguna animación distrae o retrasa la interacción del usuario.
- **Física Visual:** Sensación de masa y volumen. Los botones responden al toque expandiéndose y volviendo a su lugar con soltura.
- **Elegancia Sobria:** Uso de opacidad progresiva (`opacity`), escalado proporcional (`scale(0.97)` a `scale(1)`) e iluminación suave.

### Enfoque de Lenguaje en el Código y Documentación
- **Modular y Limpio:** Código JavaScript autoejecutable `(function(){ ... })()` para evitar contaminación del ámbito global.
- **Comentarios Descriptivos:** Código completamente comentado en español, explicando la razón física y pedagógica de cada animación.

---

## 3. Intervención 3: Reorganización y Duplicación de Recursos Visuales en `media/` e `img/`

- **Fecha de Intervención:** 4 de Agosto de 2026
- **Directorios Intervenidos:**
  - `media/andragogia/` (subcarpetas `pagina1/` a `pagina6/`)
  - `media/img/` (copia completa espejo de `img/`)
  - `img/andragogia/` (copia espejo de `media/andragogia/`)

### ¿Qué se hizo?
1. Se organizaron las imágenes utilizadas en las hojas 3 a 6 del libro de `andragogia.html` en subcarpetas estructuradas dentro de `media/andragogia/`:
   - `media/andragogia/pagina3/` (`principal.jpeg` y `1.jpeg`)
   - `media/andragogia/pagina4/` (`2.jpeg`, `3.jpeg`, `4.jpeg`)
   - `media/andragogia/pagina5/` (`principal.jpeg` y `9.jpeg`)
   - `media/andragogia/pagina6/` (`7.jpeg`, `8.jpeg`, `12.jpeg`)
2. Se realizó la copia espejo completa del directorio `img/` dentro de `media/img/` y de `media/andragogia/` dentro de `img/andragogia/`.
3. Se actualizaron las referencias dentro de `andragogia.html` tanto en la versión desktop como móvil para apuntar a la ruta normalizada `media/andragogia/paginaX/...`.

### ¿Cómo se hizo?
- Mediante comandos de sistema operando con `Copy-Item` recursivo y forzado para garantizar la integridad binaria de cada archivo de imagen JPEG y PNG.

---

## 4. Intervención 4: Corrección y Optimización del Comportamiento de Animaciones (Persistencia y Nav)

- **Fecha de Intervención:** 4 de Agosto de 2026
- **Archivos Intervenidos:**
  - `animaciones.js`

### ¿Qué se hizo?
1. **Control de Frecuencia del Navegador (`sessionStorage`):** Se restringió la animación de entrada de la barra de navegación (`.logo-container`, `.botones-container .boton-nav`, `.titulo-principal`) para que se ejecute únicamente **una vez por sesión de usuario**. Al navegar entre páginas dentro de la misma sesión, el menú de navegación permanece estático y visible de inmediato sin reiniciar ni parpadear.
2. **Limpieza Automática de Animaciones Inline (`animationend` / `setTimeout`):** Se solucionó el problema en el cual interactuar o hacer clic en elementos relanzaba las animaciones. Al culminar la animación de entrada (scroll-reveal, polaroids, botones), el motor borra los estilos `animation` e `inline opacity/transform`, permitiendo que las pseudo-clases CSS `:hover` y los eventos de clic respondan de forma fluida sin reiniciar las animaciones de entrada.

---

## 5. Cuadro Resumen de Intervenciones

| Fecha | Ámbito | Acción Principal | Método / Herramientas | Enfoque de Diseño | Lenguaje / Tono |
|---|---|---|---|---|---|
| **03-08-2026** | Andragogía (Libro 3D) | Creación de 2 pares de hojas (Págs 3 a 6) | HTML5 3D, CSS Transform (`rotateY`), JS Carousel | Molde clásico del libro, verde/dorado, galerías mixtas | Reflexivo, andragógico, dándole dignidad a la voz del adulto mayor |
| **04-08-2026** | Sitio Completo (Animaciones) | Motor de animaciones estilo Apple | CSS Keyframes (`cubic-bezier`), JS `IntersectionObserver`, Ripple Effect | Micro-interacciones sutiles, física de movimiento, elegancia visual | Código limpio, modular, accesible y con foco en experiencia de usuario (UX) |
| **04-08-2026** | Gestión de Medios | Copia y organización de imágenes en `media/` e `img/` | PowerShell CLI (`Copy-Item`), reestructuración de rutas en HTML | Consistencia de rutas y duplicación redundante para prevención de errores | Técnico, estructurado y orientado a la preservación de activos digitales |
| **04-08-2026** | UX & Animaciones | Optimización de frecuencia del Nav y prevención de reinicios | `sessionStorage`, limpieza de inline styles post-animación | Persistencia visual del nav y fluidez de interacción en hovers y clics | Código reactivo, defensivo y centrado en la continuidad de la experiencia |


