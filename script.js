// The VALE – partner page interactions: scroll reveals, counting numbers, click ripples.
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sticky nav border once the page moves
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Reveal on scroll, with a small stagger for siblings
  const reveals = document.querySelectorAll('.reveal');
  if (calm || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        el.style.transitionDelay = `${Math.max(0, siblings.indexOf(el)) * 70}ms`;
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  }

  // Count the numbers up when they come into view
  const fmt = (n, decimals) => n.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const countUp = el => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    const tick = now => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = fmt(target * eased, decimals) + (t === 1 ? suffix : '');
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!calm && 'IntersectionObserver' in window) {
    const counters = document.querySelectorAll('[data-count]');
    const co = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        co.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => co.observe(el));
  }

  // Every click makes a ripple – small ones, like the ones we hope to start
  if (!calm) {
    document.addEventListener('pointerdown', e => {
      for (let i = 0; i < 2; i++) {
        const r = document.createElement('span');
        r.className = i ? 'click-ripple click-ripple--late' : 'click-ripple';
        r.style.left = `${e.clientX}px`;
        r.style.top = `${e.clientY}px`;
        document.body.appendChild(r);
        r.addEventListener('animationend', () => r.remove());
      }
    });
  }
})();
