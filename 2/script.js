// The VALE – partner page, draft 2: scroll-driven scenes.
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const range = (p, from, to) => clamp((p - from) / (to - from));

  // Split word-fill paragraphs into spans
  document.querySelectorAll('.words').forEach(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  });

  // Page colour follows whichever section sits in the middle of the screen
  const themed = document.querySelectorAll('[data-theme]:not(body)');
  const setTheme = () => {
    const mid = window.innerHeight * .5;
    for (const s of themed) {
      const r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) { document.body.dataset.theme = s.dataset.theme; break; }
    }
  };

  // Reveals
  const reveals = document.querySelectorAll('.reveal');
  if (calm || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const sib = [...e.target.parentElement.children].filter(c => c.classList.contains('reveal'));
      e.target.style.transitionDelay = `${Math.max(0, sib.indexOf(e.target)) * 90}ms`;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }), { threshold: .15 });
    reveals.forEach(el => io.observe(el));
  }

  // Count-up numbers
  const fmt = (n, d) => n.toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d });
  if (!calm && 'IntersectionObserver' in window) {
    const co = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, d = +(el.dataset.decimals || 0), suf = el.dataset.suffix || '';
      const t0 = performance.now();
      const tick = now => {
        const t = Math.min(1, (now - t0) / 1800);
        el.textContent = fmt(target * (1 - Math.pow(1 - t, 4)), d) + (t === 1 ? suf : '');
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      co.unobserve(el);
    }), { threshold: .6 });
    document.querySelectorAll('[data-count]').forEach(el => co.observe(el));
  }

  // Impact story: the step crossing the middle of the screen picks the big figure
  const story = document.querySelector('.impact__story');
  const steps = [...story.querySelectorAll('.impact__steps li')];
  const setStage = n => {
    story.dataset.stage = n;
    steps.forEach(s => s.classList.toggle('is-active', s.dataset.step === n));
  };
  setStage('1');
  if ('IntersectionObserver' in window) {
    const so = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) setStage(e.target.dataset.step);
    }), { rootMargin: window.matchMedia('(max-width: 900px)').matches ? '-70% 0px -25% 0px' : '-45% 0px -45% 0px' });
    steps.forEach(s => so.observe(s));
  }

  window.addEventListener('scroll', setTheme, { passive: true });
  setTheme();
  if (calm) return;

  // ---- Scroll-scrubbed scenes ----
  const hero = document.querySelector('.hero');
  const statement = document.querySelector('.statement');
  const quote = document.querySelector('.quote');
  const why = document.querySelector('.why');
  const track = document.querySelector('.why__track');
  const tiers = [...document.querySelectorAll('.tier')];
  const bar = document.querySelector('.progress');

  // How far through a pinned section we are (0 at pin start, 1 at pin end)
  const progress = el => {
    const r = el.getBoundingClientRect();
    return clamp(-r.top / (r.height - window.innerHeight));
  };

  const sizeWhy = () => {
    const extra = track.scrollWidth - window.innerWidth;
    why.style.height = `${window.innerHeight + Math.max(0, extra) * 1.1}px`;
  };
  sizeWhy();
  window.addEventListener('resize', sizeWhy);

  const fillWords = (el, p) => {
    const words = el.querySelectorAll('.w');
    const lit = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < lit));
  };

  // Marquees: drift constantly, faster while scrolling
  const marquees = [...document.querySelectorAll('.marquee')].map(m => {
    const t = m.querySelector('.marquee__track');
    const items = [...t.children];
    for (let k = 0; k < 3; k++) items.forEach(li => {
      const c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.querySelector('img').alt = '';
      t.appendChild(c);
    });
    return { t, dir: +m.dataset.dir, x: 0, loop: 0 };
  });
  const measure = () => marquees.forEach(m => { m.loop = m.t.scrollWidth / 4; });
  window.addEventListener('load', measure);
  window.addEventListener('resize', measure);
  measure();

  let lastY = window.scrollY, velocity = 0;

  const frame = () => {
    const y = window.scrollY;
    velocity += ((y - lastY) - velocity) * .1;
    lastY = y;

    const max = root.scrollHeight - window.innerHeight;
    bar.style.setProperty('--scroll', max > 0 ? y / max : 0);

    const hp = progress(hero);
    hero.style.setProperty('--a', range(hp, 0, .45).toFixed(4));
    hero.style.setProperty('--b', range(hp, .15, .75).toFixed(4));
    hero.style.setProperty('--c', range(hp, .6, .85).toFixed(4));

    fillWords(statement, range(progress(statement), .05, .85));
    fillWords(quote, range(progress(quote), .05, .8));

    const extra = track.scrollWidth - window.innerWidth;
    track.style.setProperty('--x', `${-progress(why) * Math.max(0, extra)}px`);

    // Earlier tier cards shrink slightly as the next one slides over them
    tiers.forEach((t, i) => {
      const next = tiers[i + 1];
      if (!next) return;
      const r = next.getBoundingClientRect();
      const s = clamp(1 - (r.top - 120) / (window.innerHeight * .7));
      t.style.setProperty('--s', s.toFixed(3));
    });

    marquees.forEach(m => {
      if (!m.loop) return;
      m.x -= (0.6 + Math.abs(velocity) * .25) * m.dir;
      if (m.x <= -m.loop) m.x += m.loop;
      if (m.x > 0) m.x -= m.loop;
      m.t.style.transform = `translate3d(${m.x}px,0,0)`;
    });

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // ---- Water lines in the call-to-action, bending towards the pointer ----
  const canvas = document.querySelector('.talk__water');
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, mx = .5, my = .5, visible = false;
  const size = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  window.addEventListener('resize', size);
  canvas.parentElement.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width;
    my = (e.clientY - r.top) / r.height;
  });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const water = t => {
    if (visible) {
      ctx.clearRect(0, 0, w, h);
      const lines = 22;
      for (let i = 0; i < lines; i++) {
        const baseY = (i + .5) / lines * h;
        const near = Math.exp(-Math.pow((baseY / h - my) * 4, 2));
        ctx.beginPath();
        for (let x = 0; x <= w; x += 12) {
          const d = Math.exp(-Math.pow((x / w - mx) * 3.2, 2)) * near;
          const y = baseY
            + Math.sin(x * .008 + t * .0009 + i * .6) * 8
            + Math.sin(x * .02 - t * .0014 + i) * 3
            + d * 38 * Math.sin(t * .003 + i * .4);
          x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.strokeStyle = `rgba(255,255,255,${.25 + near * .5})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }
    requestAnimationFrame(water);
  };
  requestAnimationFrame(water);
})();
