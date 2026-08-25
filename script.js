document.addEventListener('DOMContentLoaded', () => {
  initFooterYear();
  initMenu();
  initMatrixRain();
  initEmailJS();
  initContactForm();
});

/* ---------- Año automático en el footer ---------- */
function initFooterYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- Menú móvil ---------- */
function initMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const mainMenu = document.getElementById('mainMenu');
  if (!menuToggle || !mainMenu) return;

  menuToggle.addEventListener('click', () => {
    const isOpen = mainMenu.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', isOpen);
    menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  document.querySelectorAll('.nav-menu a').forEach((link) => {
    link.addEventListener('click', () => {
      mainMenu.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menú');
    });
  });
}

/* ---------- EmailJS: configuración ---------- */
const EMAILJS_PUBLIC_KEY = '2NeuI4YlGIf-vfuNh';
const EMAILJS_SERVICE_ID = 'service_jkbb8j9';
const EMAILJS_TEMPLATE_NOTIFY_ME = 'template_i7qyrgp';   // Notificación para mí
const EMAILJS_TEMPLATE_THANK_USER = 'template_ja7ms48';  // Agradecimiento al usuario

function initEmailJS() {
  if (typeof emailjs === 'undefined') return;
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

/* ---------- Formulario de contacto (envío vía EmailJS) ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const toast = document.getElementById('toast');
  if (!form || !toast) return;

  const toastTitle = toast.querySelector('.toast-title');
  const toastBody = toast.querySelector('.toast-body');
  const submitBtn = form.querySelector('.form-submit');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    // Sincroniza los alias que espera la plantilla Auto-Reply (From_name / From_email)
    form.From_name.value = name;
    form.From_email.value = email;

    if (!name || !email || !message) {
      showToast(toast, toastTitle, toastBody, 'Faltan datos', 'Completa nombre, correo y comentario antes de enviar.', false);
      return;
    }

    if (typeof emailjs === 'undefined') {
      showToast(toast, toastTitle, toastBody, 'No disponible', 'El servicio de correo no cargó correctamente. Intenta de nuevo.', false);
      return;
    }

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Enviando...';

    // 1. Notificación para mí, luego 2. agradecimiento al usuario, en secuencia.
    emailjs
      .sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_NOTIFY_ME, form)
      .then(() => emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_THANK_USER, form))
      .then(() => {
        showToast(
          toast,
          toastTitle,
          toastBody,
          'Mensaje enviado ✓',
          `Gracias, ${name}. Tu mensaje fue enviado y te llegará una confirmación a ${email}.`,
          true
        );
        form.reset();
      })
      .catch((error) => {
        console.error('EmailJS error:', error);
        showToast(toast, toastTitle, toastBody, 'No se pudo enviar', 'Hubo un problema al enviar tu mensaje. Intenta de nuevo.', false);
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      });
  });
}

function showToast(toast, titleEl, bodyEl, title, body, success) {
  titleEl.textContent = title;
  bodyEl.textContent = body;
  toast.style.borderColor = success ? 'var(--accent-green)' : 'var(--accent-rose)';
  titleEl.style.color = success ? 'var(--accent-green)' : 'var(--accent-rose)';

  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

/* ---------- Lluvia de código estilo Matrix (canvas de fondo) ---------- */
function initMatrixRain() {
  const canvas = document.getElementById('matrix-rain');
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');
  const chars = 'アイウエオカキクケコサシスセソタチツテト01アイウエオ$#@%&';
  const glyphs = chars.split('');
  const fontSize = 15;
  let columns = 0;
  let drops = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * -40));
  }

  function draw() {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

    for (let i = 0; i < drops.length; i++) {
      const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillStyle = 'rgba(134, 239, 172, 0.85)';
      ctx.fillText(glyph, x, y);

      const trailColor = i % 5 === 0 ? 'rgba(6, 182, 212, 0.5)' : 'rgba(16, 185, 129, 0.4)';
      ctx.fillStyle = trailColor;
      ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], x, y - fontSize);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  resize();
  window.addEventListener('resize', resize);

  let rafId;
  let lastFrame = 0;
  const frameInterval = 55;

  function loop(timestamp) {
    if (timestamp - lastFrame >= frameInterval) {
      draw();
      lastFrame = timestamp;
    }
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(loop);
    }
  });
}
