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

  // Impact box: pointing at a step lights its ring
  const rings = document.querySelectorAll('.impact__rings .iring');
  document.querySelectorAll('.impact__steps li').forEach(step => {
    const n = step.dataset.ring;
    const light = on => {
      step.classList.toggle('is-lit', on);
      rings.forEach(r => r.classList.toggle('is-lit', on && r.classList.contains(`iring--${n}`)));
    };
    step.addEventListener('mouseenter', () => light(true));
    step.addEventListener('mouseleave', () => light(false));
    step.addEventListener('focus', () => light(true));
    step.addEventListener('blur', () => light(false));
  });

  // Participant quotes take turns; pauses while hovered
  const quotes = [...document.querySelectorAll('.quotes figure')];
  if (!calm && quotes.length > 1) {
    let i = 0, paused = false;
    const box = quotes[0].parentElement;
    box.addEventListener('mouseenter', () => { paused = true; });
    box.addEventListener('mouseleave', () => { paused = false; });
    setInterval(() => {
      if (paused || document.hidden) return;
      quotes[i].classList.remove('is-active');
      i = (i + 1) % quotes.length;
      quotes[i].classList.add('is-active');
    }, 6500);
  }

  // Live Instagram: renders posts from a JSON feed (Behold format, v1 array or v2 { posts })
  const feed = document.querySelector('.ig-feed');
  if (feed && feed.dataset.feed) {
    fetch(feed.dataset.feed)
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(data => {
        const posts = (Array.isArray(data) ? data : data.posts || []).slice(0, +feed.dataset.limit || 6);
        posts.forEach(p => {
          const src = p.sizes?.medium?.mediaUrl || (p.mediaType === 'VIDEO' ? p.thumbnailUrl : p.mediaUrl);
          if (!src || !p.permalink) return;
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = p.permalink;
          a.target = '_blank';
          a.rel = 'noopener';
          const img = document.createElement('img');
          img.src = src;
          img.loading = 'lazy';
          img.alt = (p.prunedCaption || p.caption || 'Instagram post by The VALE').slice(0, 140);
          a.appendChild(img);
          li.appendChild(a);
          feed.appendChild(li);
        });
        if (feed.children.length) feed.hidden = false;
      })
      .catch(() => { /* feed unavailable: the follow buttons still stand on their own */ });
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
