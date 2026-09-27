// The VALE – partner page, draft 1: gentle reveals and counting numbers.
(() => {
  document.documentElement.classList.add('js');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const nav = document.querySelector('.nav');
  const hero = document.querySelector('.hero');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > hero.offsetHeight - 80);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const reveals = document.querySelectorAll('.reveal');
  if (calm || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        el.style.transitionDelay = `${Math.max(0, siblings.indexOf(el)) * 120}ms`;
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(el => io.observe(el));
  }

  const fmt = (n, d) => n.toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d });
  const countUp = el => {
    const target = parseFloat(el.dataset.count);
    const d = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const start = performance.now();
    const tick = now => {
      const t = Math.min(1, (now - start) / 2400);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(target * eased, d) + (t === 1 ? suffix : '');
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!calm && 'IntersectionObserver' in window) {
    const co = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        co.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(el => co.observe(el));
  }
  // Participant quotes take turns; pauses while hovered
  const quotes = [...document.querySelectorAll('.quotes figure')];
  const dots = [...document.querySelectorAll('.quotes__dots i')];
  if (!calm && quotes.length > 1) {
    let i = 0, paused = false;
    const box = quotes[0].parentElement;
    box.addEventListener('mouseenter', () => { paused = true; });
    box.addEventListener('mouseleave', () => { paused = false; });
    setInterval(() => {
      if (paused || document.hidden) return;
      quotes[i].classList.remove('is-active');
      dots[i]?.classList.remove('is-active');
      i = (i + 1) % quotes.length;
      quotes[i].classList.add('is-active');
      dots[i]?.classList.add('is-active');
    }, 7000);
  }
})();
