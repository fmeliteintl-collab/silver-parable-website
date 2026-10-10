(() => {
  const doc = document, root = doc.documentElement, body = doc.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');
  const ready = () => body.classList.add('ready');
  doc.readyState === 'loading' ? doc.addEventListener('DOMContentLoaded', ready) : ready();
  addEventListener('pageshow', e => { if (e.persisted) { body.classList.remove('leaving'); ready(); } });

  // Mobile menu
  const btn = doc.querySelector('.menu-btn'), nav = doc.querySelector('.nav');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      body.style.overflow = open ? 'hidden' : '';
    });
    addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) btn.click(); });
  }

  // Page transitions (fade out, then navigate)
  if (!reduce) {
    doc.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname === location.pathname || a.hasAttribute('download')) return;
      e.preventDefault();
      body.classList.add('leaving');
      setTimeout(() => (location.href = u.href), 300);
    });
  }

  // Soft cursor glow (desktop pointers only)
  if (!reduce && matchMedia('(hover: hover)').matches) {
    const g = doc.createElement('div'); g.className = 'glow'; g.setAttribute('aria-hidden', 'true'); body.appendChild(g);
    let x = 0, y = 0, tick = false;
    addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY; g.classList.add('on');
      if (!tick) { tick = true; requestAnimationFrame(() => { g.style.transform = `translate(${x}px,${y}px)`; tick = false; }); }
    }, { passive: true });
    doc.addEventListener('pointerleave', () => g.classList.remove('on'));
  }

  // Scroll reveal
  const items = doc.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .2 });
    items.forEach(el => io.observe(el));
  } else items.forEach(el => el.classList.add('in'));

  // Links not yet filled in show as "soon"
  doc.querySelectorAll('a[data-soon]').forEach(a => {
    if (a.getAttribute('href') === '#') { a.classList.add('is-soon'); a.setAttribute('aria-disabled', 'true'); a.title = 'Coming soon'; a.tabIndex = -1; }
  });

  // Newsletter is not live yet: never submit
  doc.querySelectorAll('form.signup').forEach(f => f.addEventListener('submit', e => e.preventDefault()));

  // Contact tabs
  const tabs = [...doc.querySelectorAll('[role="tab"]')];
  if (tabs.length) {
    const show = t => tabs.forEach(x => {
      const on = x === t;
      x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
      doc.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(t));
      t.addEventListener('keydown', e => {
        const n = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
        if (n > -1) { e.preventDefault(); tabs[n].focus(); show(tabs[n]); }
      });
    });
    if (location.hash === '#business') show(tabs[1]);
  }

  // Formspree forms (POST, honeypot, no double submits)
  doc.querySelectorAll('form[data-form]').forEach(f => {
    const status = f.parentElement.querySelector('.status');
    const submit = f.querySelector('[type="submit"]');
    const label = submit.textContent;
    let busy = false;
    const say = (msg, state) => { status.textContent = msg; status.className = 'status' + (state ? ' ' + state : ''); };
    const unlock = () => { busy = false; submit.disabled = false; submit.textContent = label; f.removeAttribute('aria-busy'); };
    f.addEventListener('submit', async e => {
      e.preventDefault();
      if (busy) return;
      const hp = f.querySelector('[name="_gotcha"]');
      if (hp && hp.value) { f.reset(); say(f.dataset.success, 'success'); return; }
      busy = true; submit.disabled = true; submit.textContent = 'Sending…'; f.setAttribute('aria-busy', 'true'); say('Sending…');
      let ok = false;
      try {
        const r = await fetch(f.action, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } });
        if (r.ok) { ok = true; f.reset(); say(f.dataset.success, 'success'); }
        else {
          let msg = 'Something went wrong. Please try again, or email hello@silverparable.ca.';
          try { const d = await r.json(); if (d.errors && d.errors.length) msg = d.errors.map(x => x.message).join(' '); } catch {}
          say(msg, 'error');
        }
      } catch { say('No connection. Check your internet and try again.', 'error'); }
      ok ? setTimeout(unlock, 8000) : unlock();
    });
  });

  // Audio player
  const p = doc.querySelector('.player');
  if (p) {
    const a = p.querySelector('audio'), pb = p.querySelector('.play'), r = p.querySelector('input'), cur = p.querySelector('.cur'), dur = p.querySelector('.dur'), note = doc.querySelector('.player-note');
    const fmt = s => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00';
    a.addEventListener('error', () => { pb.disabled = true; pb.style.opacity = .4; if (note) note.hidden = false; });
    a.addEventListener('loadedmetadata', () => { dur.textContent = fmt(a.duration); });
    a.addEventListener('timeupdate', () => { cur.textContent = fmt(a.currentTime); r.value = a.duration ? (a.currentTime / a.duration) * 1000 : 0; });
    a.addEventListener('ended', () => { pb.classList.remove('on'); pb.setAttribute('aria-label', 'Play RISE'); });
    pb.addEventListener('click', () => {
      if (a.paused) { a.play(); pb.classList.add('on'); pb.setAttribute('aria-label', 'Pause RISE'); }
      else { a.pause(); pb.classList.remove('on'); pb.setAttribute('aria-label', 'Play RISE'); }
    });
    r.addEventListener('input', () => { if (a.duration) a.currentTime = (r.value / 1000) * a.duration; });
  }
})();
