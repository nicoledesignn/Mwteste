/* ==========================================================
   MW FITNESS — script.js (JavaScript puro)
   Os arquivos de mídia vêm de manifest.js (gerado por
   build_manifest.py a partir das pastas assets/NN).
   ========================================================== */
(function () {
  'use strict';

  /* ---------- CONFIGURAÇÃO ---------- */
  // WhatsApp da academia (DDI 55 + DDD 11 + número, só dígitos)
  const WHATSAPP_NUMBER = "5511947927762";
  const WHATSAPP_MESSAGE = "Olá! Conheci a MW FITNESS e gostaria de saber mais sobre os treinos.";
  const ADDRESS = "Av. Recife, 138 - Jardim Santo Afonso, Guarulhos / SP";
  // Opcional: cole aqui a URL exata do Google Maps. Se vazio, usa busca pelo endereço.
  const MAPS_URL = "";

  // Textos alternativos por arquivo (acessibilidade). Fallback genérico se faltar.
  const ALT = {
    "assets/02/01.webp": "Mulher sorrindo, sentada em um banco de musculação, com camiseta e legging vermelhas diante de uma parede cor de âmbar",
    "assets/02/02.webp": "Mulher sentada no banco de musculação, com o rosto apoiado na mão, diante de uma parede cor de âmbar",
    "assets/05/01.webp": "Homem de regata preta sentado no banco, fazendo rosca com halter",
    "assets/05/02.webp": "Dois homens fazendo pose de braços flexionados diante da vidraça da academia",
    "assets/05/03.webp": "Homem de regata preta treinando no cabo, com a academia desfocada ao fundo"
  };

  const M = window.MW_MANIFEST || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = !!(navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || '')));

  /* ---------- Links (WhatsApp / Maps) ---------- */
  const digits = String(WHATSAPP_NUMBER).replace(/\D/g, '');
  const waHref = 'https://wa.me/' + digits + '?text=' + encodeURIComponent(WHATSAPP_MESSAGE);
  $$('[data-whatsapp]').forEach(a => { a.href = waHref; });
  const mapsHref = MAPS_URL || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(ADDRESS);
  const mapsLink = $('#mapsLink'); if (mapsLink) mapsLink.href = mapsHref;
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  const copyBtn = $('#copyAddr'), copied = $('#copied');
  if (copyBtn) copyBtn.addEventListener('click', async () => {
    let ok = false;
    try { await navigator.clipboard.writeText(ADDRESS); ok = true; } catch (e) {
      const t = document.createElement('textarea'); t.value = ADDRESS; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select(); try { ok = document.execCommand('copy'); } catch (_) {} t.remove();
    }
    copied.textContent = ok ? 'Endereço copiado.' : 'Não foi possível copiar. Selecione o texto manualmente.';
    setTimeout(() => { copied.textContent = ''; }, 3000);
  });

  /* ---------- Navbar ---------- */
  const nav = $('#nav'), menuBtn = $('#menuBtn');
  const onScroll = () => {
    nav.classList.toggle('is-solid', window.scrollY > 40);
    const fab = $('.fab'); if (fab) fab.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const closeMenu = () => { nav.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Abrir menu'); };
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  $$('#menu a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Reveal ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('in'));

  /* ---------- Vídeos: carga preguiçosa + play/pause por visibilidade ---------- */
  const videos = $$('video[data-gallery]');
  videos.forEach(v => {
    const item = (M[v.dataset.gallery] || []).find(i => i.type === 'video');
    if (item) { v.dataset.src = item.src; if (item.poster && !v.poster) v.poster = item.poster; }
  });

  const loadVideo = v => {
    if (!v.dataset.src || v.getAttribute('src')) return;
    v.src = v.dataset.src; v.load();
  };
  const hero = $('#heroVideo');
  let paused = new WeakSet();   // vídeos pausados manualmente

  if ('IntersectionObserver' in window) {
    const vio = new IntersectionObserver(es => es.forEach(en => {
      const v = en.target;
      if (en.isIntersecting) {
        if (reduceMotion || saveData) return;
        loadVideo(v);
        if (!paused.has(v)) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
      } else v.pause();
    }), { threshold: 0.35, rootMargin: '150px 0px' });
    videos.forEach(v => vio.observe(v));
  } else if (hero && !reduceMotion && !saveData) { loadVideo(hero); hero.play().catch(() => {}); }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach(v => v.pause());
  });

  // Botão pausar/retomar (vídeo de ambiente)
  $$('[data-playtoggle]').forEach(btn => {
    const v = btn.parentElement.querySelector('video');
    const label = () => { btn.textContent = v.paused ? 'Reproduzir' : 'Pausar'; };
    if (reduceMotion || saveData) btn.textContent = 'Reproduzir';
    btn.addEventListener('click', () => {
      if (v.paused) { paused.delete(v); loadVideo(v); v.play().catch(() => {}); } else { paused.add(v); v.pause(); }
      setTimeout(label, 50);
    });
    v.addEventListener('play', label); v.addEventListener('pause', label);
  });

  /* ---------- Carrossel (scroll-snap + setas + dots + teclado) ---------- */
  const ICON_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  const ICON_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

  function buildCarousel(root) {
    const key = root.dataset.carousel;
    const items = M[key] || [];
    if (!items.length) { root.hidden = true; return; }
    const label = root.dataset.label || 'Galeria';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', 'carrossel');
    root.setAttribute('aria-label', label);

    const track = document.createElement('div');
    track.className = 'carousel__track'; track.tabIndex = 0;
    track.setAttribute('aria-label', label + ' — use as setas do teclado para navegar');

    items.forEach((it, i) => {
      const fig = document.createElement('figure');
      fig.className = 'carousel__slide';
      fig.setAttribute('role', 'group'); fig.setAttribute('aria-roledescription', 'slide');
      fig.setAttribute('aria-label', (i + 1) + ' de ' + items.length);
      if (it.type === 'video') {
        const v = document.createElement('video');
        v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
        v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
        if (it.poster) v.poster = it.poster;
        v.dataset.src = it.src; v.setAttribute('aria-label', label + ' ' + (i + 1));
        fig.appendChild(v); fig._video = v;
      } else {
        const img = document.createElement('img');
        img.src = it.thumb || it.src;
        if (it.thumb) img.srcset = it.thumb + ' 640w, ' + it.src + ' 1170w';
        img.sizes = '(min-width:1100px) 520px, 78vw';
        img.alt = ALT[it.src] || (label + ' — foto ' + (i + 1));
        img.width = 1170; img.height = 1463;
        img.decoding = 'async';
        img.loading = i === 0 ? 'eager' : 'lazy';
        fig.appendChild(img);
      }
      track.appendChild(fig);
    });
    root.appendChild(track);

    // controles só se houver mais de 1 item
    let prev, next, dots = [];
    if (items.length > 1) {
      const ui = document.createElement('div'); ui.className = 'carousel__ui';
      const dwrap = document.createElement('div'); dwrap.className = 'carousel__dots';
      items.forEach((_, i) => {
        const d = document.createElement('button');
        d.type = 'button'; d.className = 'carousel__dot';
        d.setAttribute('aria-label', 'Ir para o item ' + (i + 1) + ' de ' + items.length);
        d.addEventListener('click', () => goTo(i));
        dwrap.appendChild(d); dots.push(d);
      });
      const arrows = document.createElement('div'); arrows.className = 'carousel__arrows';
      prev = document.createElement('button'); prev.type = 'button'; prev.className = 'carousel__btn'; prev.setAttribute('aria-label', 'Anterior'); prev.innerHTML = ICON_L;
      next = document.createElement('button'); next.type = 'button'; next.className = 'carousel__btn'; next.setAttribute('aria-label', 'Próximo'); next.innerHTML = ICON_R;
      prev.addEventListener('click', () => goTo(current() - 1));
      next.addEventListener('click', () => goTo(current() + 1));
      arrows.append(prev, next); ui.append(dwrap, arrows); root.appendChild(ui);
    }

    const slides = $$('.carousel__slide', track);
    const current = () => {
      const c = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bd = Infinity;
      slides.forEach((s, i) => { const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - c); if (d < bd) { bd = d; best = i; } });
      // no fim do scroll, considera o último slide
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) best = slides.length - 1;
      if (track.scrollLeft <= 4) best = 0;
      return best;
    };
    function goTo(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      const s = slides[i];
      const style = getComputedStyle(track);
      const padL = parseFloat(style.scrollPaddingLeft) || 0;
      const left = s.offsetLeft - (root.classList.contains('carousel--wide') ? padL : (track.clientWidth - s.offsetWidth) / 2);
      track.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    const sync = () => {
      const c = current();
      dots.forEach((d, i) => d.setAttribute('aria-current', String(i === c)));
      if (prev) { prev.disabled = c === 0; next.disabled = c === slides.length - 1; }
      slides.forEach((s, i) => s.setAttribute('aria-hidden', 'false'));
    };
    let tick = false;
    track.addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { sync(); tick = false; }); } }, { passive: true });
    window.addEventListener('resize', sync);
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current() + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current() - 1); }
      else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
      else if (e.key === 'End') { e.preventDefault(); goTo(slides.length - 1); }
    });
    sync();

    // vídeos dentro de carrosséis: só toca o slide visível
    const vids = slides.filter(s => s._video).map(s => s._video);
    if (vids.length && 'IntersectionObserver' in window) {
      const cio = new IntersectionObserver(es => es.forEach(en => {
        const v = en.target;
        if (en.isIntersecting && en.intersectionRatio > 0.6 && !reduceMotion && !saveData) { loadVideo(v); v.play().catch(() => {}); }
        else v.pause();
      }), { root: track, threshold: [0, 0.6] });
      vids.forEach(v => cio.observe(v));
    }
  }
  $$('[data-carousel]').forEach(buildCarousel);

  /* ---------- Horários: destaque do dia + status "aberto agora" ---------- */
  const SCHEDULE = { // 0=dom ... 6=sáb — conforme a imagem de funcionamento
    1: [['06:00', '11:00'], ['16:00', '22:00']], 2: [['06:00', '11:00'], ['16:00', '22:00']],
    3: [['06:00', '11:00'], ['16:00', '22:00']], 4: [['06:00', '11:00'], ['16:00', '22:00']],
    5: [['06:00', '11:00'], ['16:00', '22:00']], 6: [['10:00', '13:00']]
  };
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  function brNow() {
    try {
      const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      const g = t => p.find(x => x.type === t).value;
      const wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[g('weekday')];
      return { day: wd, min: (parseInt(g('hour'), 10) % 24) * 60 + parseInt(g('minute'), 10) };
    } catch (e) { const d = new Date(); return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() }; }
  }
  function updateStatus() {
    const { day, min } = brNow();
    $$('.hours__row').forEach(r => r.classList.toggle('is-today', r.dataset.days.split(',').map(Number).includes(day)));
    const el = $('#status'); if (!el) return;
    const open = (SCHEDULE[day] || []).some(([a, b]) => min >= toMin(a) && min < toMin(b));
    el.hidden = false; el.classList.toggle('is-open', open);
    $('span', el).textContent = open ? 'Aberto agora' : 'Fora dos horários de funcionamento';
  }
  updateStatus(); setInterval(updateStatus, 60000);
})();
