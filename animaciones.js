/* ═══════════════════════════════════════════════════════════════
   animaciones.js — Motor de animaciones estilo Apple (Optimizado)
   - Nav se anima SOLO 1 vez por sesión de usuario (sessionStorage)
   - Limpieza automática de estilos inline tras animación para evitar reinicios al hacer clic o interactuar
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. RIPPLE EFFECT (presión física en botones) ───────────── */
  function crearRipple(e) {
    const btn = e.currentTarget;
    const rippleAnterior = btn.querySelector('.ripple-wave');
    if (rippleAnterior) rippleAnterior.remove();

    const rect   = btn.getBoundingClientRect();
    const x      = e.clientX - rect.left;
    const y      = e.clientY - rect.top;
    const tam    = Math.max(rect.width, rect.height) * 2.2;

    const onda = document.createElement('span');
    onda.classList.add('ripple-wave');
    onda.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.32);
      width: ${tam}px;
      height: ${tam}px;
      left: ${x - tam / 2}px;
      top: ${y - tam / 2}px;
      transform: scale(0);
      animation: rippleExpand 0.45s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
      pointer-events: none;
    `;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(onda);
    setTimeout(() => onda.remove(), 500);
  }

  function inicializarRipple() {
    const selectores = [
      '.btn-libro', '.btn-movil', '.btn-enviar-info',
      '.recurso-enlace', '.boton-nav', '.btn-cerrar-visor',
      '[data-ripple]'
    ];
    document.querySelectorAll(selectores.join(',')).forEach(btn => {
      btn.addEventListener('click', crearRipple);
    });
  }

  /* ── 2. SCROLL-REVEAL (Solo 1 vez, limpia animación al terminar) ── */
  function inicializarScrollReveal() {
    const elementos = document.querySelectorAll('.anim-reveal');
    if (!elementos.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const delay = parseInt(el.dataset.delay || 0);
          setTimeout(() => {
            el.classList.add('anim-visible');
            // Limpiar inline style tras la animación para no interferir con hover/clic
            setTimeout(() => {
              el.style.opacity = '1';
              el.style.transform = 'none';
              el.style.animation = 'none';
            }, 450);
          }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    elementos.forEach(el => observer.observe(el));
  }

  /* ── 3. STAGGER AUTOMÁTICO para grupos de hijos ──────────────── */
  function inicializarStagger() {
    document.querySelectorAll('.anim-stagger-parent').forEach(padre => {
      const hijos = padre.querySelectorAll(':scope > *, :scope > li');
      hijos.forEach((hijo, i) => {
        hijo.classList.add('anim-reveal');
        hijo.dataset.delay = i * 60;
      });
    });
  }

  /* ── 4. NAV — Animación SOLO en la primera visita de sesión ──── */
  function animarNav() {
    const yaAnimado = sessionStorage.getItem('navAnimada');
    const botones = document.querySelectorAll('.botones-container .boton-nav');
    const logo = document.querySelector('.logo-container');
    const titulo = document.querySelector('.titulo-principal');

    if (yaAnimado) {
      // Si ya visitó la página en esta sesión, asegurar visibilidad inmediata y limpia
      if (logo) { logo.style.opacity = '1'; logo.style.animation = 'none'; }
      if (titulo) { titulo.style.opacity = '1'; titulo.style.animation = 'none'; }
      botones.forEach(btn => {
        btn.style.opacity = '1';
        btn.style.transform = 'none';
        btn.style.transition = '';
      });
      return;
    }

    // Primera vez en la sesión: ejecutar animación suave
    if (logo) {
      logo.style.animation = 'logoEntrada 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards';
    }
    botones.forEach((btn, i) => {
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        btn.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)';
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0)';
        // Limpiar inline styles al finalizar para no chocar con hovers
        setTimeout(() => {
          btn.style.opacity = '';
          btn.style.transform = '';
          btn.style.transition = '';
        }, 400);
      }, 80 + i * 50);
    });
    if (titulo) {
      titulo.style.animation = 'tituloEntrada 0.6s cubic-bezier(0.25,0.46,0.45,0.94) 0.1s both';
    }

    // Marcar como animado para el resto de la sesión de navegación
    sessionStorage.setItem('navAnimada', 'true');
  }

  /* ── 5. MENÚ MÓVIL ─────────────────────────────────────────── */
  function mejorarMenuMovil() {
    const menu = document.getElementById('menuMovil');
    if (!menu) return;

    const obs = new MutationObserver(() => {
      if (menu.classList.contains('show')) {
        menu.style.animation = 'menuSlideDown 0.3s cubic-bezier(0.25,0.46,0.45,0.94) forwards';
        const btns = menu.querySelectorAll('.boton-nav');
        btns.forEach((b, i) => {
          b.style.opacity = '0';
          b.style.transform = 'translateX(-14px)';
          setTimeout(() => {
            b.style.transition = 'opacity 0.25s ease, transform 0.28s cubic-bezier(0.34,1.56,0.64,1)';
            b.style.opacity = '1';
            b.style.transform = 'translateX(0)';
            setTimeout(() => {
              b.style.opacity = '';
              b.style.transform = '';
              b.style.transition = '';
            }, 300);
          }, 40 + i * 40);
        });
      }
    });
    obs.observe(menu, { attributes: true, attributeFilter: ['class'] });
  }

  /* ── 6. HOVER MAGNÉTICO (Suave sin romper estilos) ───────────── */
  function magnetismo() {
    document.querySelectorAll('.botones-container .boton-nav').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = (e.clientX - cx) * 0.15;
        const dy   = (e.clientY - cy) * 0.15;
        btn.style.transform = `translate(${dx}px, ${dy - 3}px) scale(1.03)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease';
        btn.style.transform  = '';
      });
    });
  }

  /* ── 7. SUBNAV TABS ─────────────────────────────────────────── */
  function animarSubnavIndicador() {
    const tabs = document.querySelectorAll('.subnav-tab');
    if (!tabs.length) return;
    tabs.forEach(tab => {
      tab.addEventListener('mouseenter', () => {
        tab.style.transition = 'color 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)';
        tab.style.transform = 'translateY(-2px)';
      });
      tab.addEventListener('mouseleave', () => {
        tab.style.transform = '';
      });
    });
  }

  /* ── 8. POLAROIDS (Entrada y limpieza para permitir hover) ────── */
  function animarPolaroids() {
    const polaroids = document.querySelectorAll('.foto-polaroid');
    if (!polaroids.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const idx = parseInt(el.dataset.idx || 0);
          setTimeout(() => {
            el.classList.add('polaroid-visible');
            setTimeout(() => {
              el.style.opacity = '1';
              el.style.animation = 'none';
            }, 500);
          }, idx * 50);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.05 });
    polaroids.forEach((p, i) => {
      p.dataset.idx = i;
      obs.observe(p);
    });
  }

  /* ── 9. VISOR LATERAL ───────────────────────────────────────── */
  function mejorarVisor() {
    const btnCerrar = document.getElementById('btn-cerrar-visor');
    if (!btnCerrar) return;
    btnCerrar.addEventListener('mouseenter', () => {
      btnCerrar.style.transition = 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), color 0.2s';
      btnCerrar.style.transform = 'rotate(90deg) scale(1.15)';
    });
    btnCerrar.addEventListener('mouseleave', () => {
      btnCerrar.style.transform = 'rotate(0deg) scale(1)';
    });
  }

  /* ── 10. LIBRO ──────────────────────────────────────────────── */
  function animarBotonesLibro() {
    document.querySelectorAll('.btn-libro, .btn-movil').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        if (!btn.disabled) {
          btn.style.transition = 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, background 0.25s ease';
        }
      });
    });
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    inicializarStagger();
    inicializarScrollReveal();
    inicializarRipple();
    animarNav();
    mejorarMenuMovil();
    magnetismo();
    animarSubnavIndicador();
    animarPolaroids();
    mejorarVisor();
    animarBotonesLibro();
  });

})();

