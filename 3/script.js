// The VALE – partner page, draft 3: cursor, magnetic button, reveals, counters.
(() => {
  document.documentElement.classList.add('js');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const reveals = document.querySelectorAll('.reveal');
  if (calm || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const sib = [...e.target.parentElement.children].filter(c => c.classList.contains('reveal'));
      e.target.style.transitionDelay = `${Math.max(0, sib.indexOf(e.target)) * 80}ms`;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }), { threshold: .15 });
    reveals.forEach(el => io.observe(el));
  }

  const fmt = (n, d) => n.toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d });
  if (!calm && 'IntersectionObserver' in window) {
    const co = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, d = +(el.dataset.decimals || 0), suf = el.dataset.suffix || '';
      const t0 = performance.now();
      const tick = now => {
        const t = Math.min(1, (now - t0) / 1300);
        el.textContent = fmt(target * (1 - Math.pow(1 - t, 5)), d) + (t === 1 ? suf : '');
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      co.unobserve(el);
    }), { threshold: .5 });
    document.querySelectorAll('[data-count]').forEach(el => co.observe(el));
  }

  if (calm || !window.matchMedia('(hover: hover)').matches) return;

  // Cursor dot that swells over anything clickable
  const cursor = document.querySelector('.cursor');
  let cx = 0, cy = 0, tx = 0, ty = 0;
  document.addEventListener('pointermove', e => {
    tx = e.clientX; ty = e.clientY;
    cursor.classList.add('is-on');
    cursor.classList.toggle('is-big', !!e.target.closest('a, .logo, .stat, .why__list li'));
  });
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
  const follow = () => {
    cx += (tx - cx) * .22; cy += (ty - cy) * .22;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);

  // The big call button leans towards the pointer
  const blob = document.querySelector('.blob');
  const zone = blob.parentElement;
  zone.addEventListener('pointermove', e => {
    const r = blob.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    blob.style.transform = `translate(${dx * .25}px, ${dy * .25}px) rotate(${dx * .03}deg)`;
  });
  zone.addEventListener('pointerleave', () => { blob.style.transform = ''; });
})();
