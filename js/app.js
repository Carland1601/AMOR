/* Lógica de la experiencia. Los textos y datos se editan en js/config.js */
(() => {
  const $ = id => document.getElementById(id);
  const scenes = [...document.querySelectorAll('.scene')];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0, locked = false;

  /* ---------- Fondo: corazones flotantes ---------- */
  const bg = $('bg');
  for (let i = 0; i < (RM ? 0 : 10); i++) {
    const s = document.createElement('span');
    s.textContent = ['❤', '💗', '💕'][i % 3];
    s.style.cssText = `left:${Math.random() * 100}%;font-size:${14 + Math.random() * 20}px;animation-duration:${12 + Math.random() * 14}s;animation-delay:${-Math.random() * 20}s`;
    bg.append(s);
  }

  /* ---------- Navegación entre escenas ---------- */
  function go(n) {
    if (n === cur || locked) return;
    locked = true;
    scenes[cur].classList.remove('on'); scenes[cur].classList.add('out');
    const prev = scenes[cur];
    setTimeout(() => prev.classList.remove('out'), 900);
    cur = n;
    scenes[n].classList.add('on'); scenes[n].scrollTop = 0;
    $('bar').firstElementChild.style.width = (n / (scenes.length - 1) * 100) + '%';
    $('back').hidden = n === 0;
    if (n === 2) { updateDays(true); }
    setTimeout(() => locked = false, 700);
  }
  $('back').onclick = () => go(Math.max(0, cur - 1));
  $('n1').onclick = () => go(2); $('n2').onclick = () => go(3); $('n3').onclick = () => go(4);

  /* ---------- Escena 0: sobre ---------- */
  const env = $('env'); let opened = false, y0 = null;
  function envAction() {
    if (!opened) {
      opened = true; env.classList.add('open'); $('h0').hidden = true;
      setTimeout(() => $('h0b').hidden = false, 1800);
    } else if (!$('h0b').hidden) go(1);
  }
  env.addEventListener('pointerdown', e => y0 = e.clientY);
  env.addEventListener('pointerup', e => { if (y0 !== null) { envAction(); y0 = null; } });
  env.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); envAction(); } });
  $('h0b').onclick = () => go(1);
  let ty = null;   // deslizar hacia arriba en la escena
  scenes[0].addEventListener('pointerdown', e => ty = e.clientY);
  scenes[0].addEventListener('pointerup', e => { if (ty !== null && ty - e.clientY > 40) envAction(); ty = null; });

  /* ---------- Partículas decorativas ---------- */
  const EM = ['❤️', '💖', '💕', '✨', '💗', '😍', '🥰'];
  function burst(x, y, n) {
    n = RM ? Math.min(n, 8) : n;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span'); s.className = 'pt';
      s.textContent = EM[Math.random() * EM.length | 0];
      s.style.left = x + 'px'; s.style.top = y + 'px'; document.body.append(s);
      const a = Math.random() * 6.283, d = 90 + Math.random() * innerWidth * .55;
      s.animate([{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px),calc(-50% + ${Math.sin(a) * d}px)) scale(${1 + Math.random() * 1.3}) rotate(${Math.random() * 360}deg)`, opacity: 0 }],
        { duration: 1100 + Math.random() * 900, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => s.remove();
    }
  }
  function sideEmojis() {            // emojis que cruzan por los laterales
    for (let i = 0; i < 12; i++) {
      const s = document.createElement('span'); s.className = 'pt';
      s.textContent = ['😍', '🥰', '❤️', '💕'][i % 4];
      const left = i % 2 === 0; s.style.top = (10 + Math.random() * 80) + '%'; s.style.left = left ? '-40px' : 'auto'; s.style.right = left ? 'auto' : '-40px';
      document.body.append(s); const dx = (left ? 1 : -1) * (innerWidth * .35);
      s.animate([{ transform: 'translateX(0)', opacity: 0 }, { opacity: 1, offset: .2 }, { transform: `translateX(${dx}px)`, opacity: 0 }],
        { duration: 2500 + Math.random() * 1500, delay: i * 180 }).onfinish = () => s.remove();
    }
  }

  /* ---------- Escena 1: control del corazón ---------- */
  const trk = $('trk'), thumb = $('thumb'), fill = $('fill'), big = $('big');
  let p = 0, drag = false, done = false;
  function setP(v) {
    p = Math.max(0, Math.min(1, v));
    const w = trk.clientWidth;
    thumb.style.transform = `translateX(${p * w}px) scale(${1 + p * 1.6})`;
    thumb.style.color = `hsl(345 ${60 + p * 40}% ${78 - p * 30}%)`;
    fill.style.width = p * 100 + '%'; $('pct').textContent = Math.round(p * 100) + '%';
    if (!RM && Math.random() < p * .35) { const r = thumb.getBoundingClientRect(); burst(r.left + 24, r.top + 24, 1); }
  }
  const fromEvent = e => { const r = trk.getBoundingClientRect(); setP((e.clientX - r.left) / r.width); };
  trk.addEventListener('pointerdown', e => { if (done) return; drag = true; trk.setPointerCapture(e.pointerId); fromEvent(e); });
  trk.addEventListener('pointermove', e => { if (drag && !done) { fromEvent(e); if (p >= .985) boom(); } });
  const release = () => { drag = false; if (!done && p < .985) setP(p); };
  trk.addEventListener('pointerup', release); trk.addEventListener('pointercancel', release);
  function boom() {
    done = true; drag = false; setP(1);
    big.className = ''; void big.offsetWidth; big.classList.add('grow');
    setTimeout(() => {
      big.classList.add('pop'); burst(innerWidth / 2, innerHeight / 2, 46); sideEmojis();
      $('msg').hidden = false; trk.style.visibility = 'hidden';
    }, RM ? 50 : 750);
  }
  $('retry').onclick = () => {
    done = false; big.className = ''; $('msg').hidden = true; trk.style.visibility = 'visible'; setP(0);
  };
  addEventListener('resize', () => setP(p));
  setP(0);

  /* ---------- Escena 2: contadores por fecha de calendario ---------- */
  // Se comparan fechas "de calendario" en UTC para evitar errores por zona horaria o cambio de hora.
  function daysSince([y, m, d]) {
    const n = new Date();
    return Math.max(0, Math.round((Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()) - Date.UTC(y, m - 1, d)) / 864e5));
  }
  function countTo(el, v, anim) {
    if (!anim || RM) { el.textContent = v; return; }
    const t0 = performance.now();
    (function f(t) { const k = Math.min(1, (t - t0) / 1600); el.textContent = Math.round(v * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  function updateDays(anim) {
    countTo($('d1'), daysSince(CONFIG.fechaConocernos), anim);
    countTo($('d2'), daysSince(CONFIG.fechaHistoria), anim);
  }
  updateDays(false);
  setInterval(() => updateDays(false), 60000);                 // recalcula al cambiar el día
  document.addEventListener('visibilitychange', () => !document.hidden && updateDays(false));

  /* ---------- Escena 3: reproductor (un único Audio global) ---------- */
  $('song').textContent = CONFIG.cancion; $('artist').textContent = CONFIG.artista;
  const au = new Audio(); au.preload = 'metadata'; au.src = CONFIG.audio; au.volume = .8;
  const fmt = s => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '--:--';
  const toggle = () => { if (au.error) { $('amsg').hidden = false; return; } au.paused ? au.play().catch(() => $('amsg').hidden = false) : au.pause(); };
  $('play').onclick = $('mus').onclick = toggle;
  const sync = () => { const on = !au.paused; $('pl').classList.toggle('playing', on); $('play').textContent = on ? '❚❚' : '▶'; $('mus').classList.toggle('on', on); $('mus').textContent = on ? '🔊' : '🎵'; };
  au.addEventListener('play', sync); au.addEventListener('pause', sync); au.addEventListener('ended', sync);
  au.addEventListener('error', () => $('amsg').hidden = false);
  au.addEventListener('loadedmetadata', () => $('dur').textContent = fmt(au.duration));
  au.addEventListener('timeupdate', () => { if (!seeking) $('seek').value = au.duration ? au.currentTime / au.duration * 100 : 0; $('cur').textContent = fmt(au.currentTime); });
  let seeking = false;
  $('seek').addEventListener('input', e => { seeking = true; if (au.duration) au.currentTime = e.target.value / 100 * au.duration; });
  $('seek').addEventListener('change', () => seeking = false);
  $('vol').oninput = e => au.volume = e.target.value;
  const ci = $('coverImg');
  ci.onload = () => $('cover').classList.add('ok'); ci.onerror = () => $('cover').classList.add('no');
  if (ci.complete) (ci.naturalWidth ? ci.onload : ci.onerror)();

  /* ---------- Escena 4: carta ---------- */
  CONFIG.carta.flatMap(t => t.split(/\n\s*\n/)).map(t => t.trim()).filter(Boolean).forEach(t => { const q = document.createElement('p'); q.textContent = t; $('cuerpo').append(q); });
  $('firma').textContent = CONFIG.firma;
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } }), { root: scenes[4], threshold: 0 })
    .observe(document.querySelector('.rv'));
})();