// The VALE – partner page, draft 4: scroll reveals, counting numbers, the impact story, rotating quotes,
// the Instagram feed, drifting logo bubbles, a cursor dot and click ripples.
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

  // Impact story: the step crossing the middle of the screen sets the map's stage
  const story = document.querySelector('.impact__story');
  if (story) {
    const steps = [...story.querySelectorAll('.impact__steps li')];
    const setStage = n => {
      story.dataset.stage = n;
      steps.forEach(s => s.classList.toggle('is-active', s.dataset.step === n));
    };
    setStage('1');
    if ('IntersectionObserver' in window) {
      const so = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) setStage(e.target.dataset.step); });
      }, {
        // On phones the map sits over the top half, so the trigger line moves down to where the text is readable
        rootMargin: window.matchMedia('(max-width: 960px)').matches ? '-72% 0px -27% 0px' : '-45% 0px -45% 0px',
      });
      steps.forEach(s => so.observe(s));
    } else {
      setStage('4');
    }
  }

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
          img.addEventListener('error', () => li.remove());  // drop a tile rather than show a broken image
          img.alt = (p.prunedCaption || p.caption || 'Instagram post by The VALE').slice(0, 140);
          a.appendChild(img);
          const kind = p.mediaType === 'VIDEO' ? 'Reel' : p.mediaType === 'CAROUSEL_ALBUM' ? 'Album' : '';
          if (kind) {
            const tag = document.createElement('span');
            tag.className = 'ig-kind';
            tag.textContent = kind;
            a.appendChild(tag);
          }
          const cap = document.createElement('span');
          cap.className = 'ig-caption';
          cap.textContent = (p.prunedCaption || p.caption || '').split('\n')[0];
          a.appendChild(cap);
          li.appendChild(a);
          feed.appendChild(li);
        });
        if (feed.children.length) feed.hidden = false;
      })
      .catch(() => { /* feed unavailable: the follow buttons still stand on their own */ });
  }

  // Logo bubbles: two rows drift in opposite directions, faster while the page scrolls
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
  if (!calm && marquees.length) {
    const measure = () => marquees.forEach(m => { m.loop = m.t.scrollWidth / 4; });
    window.addEventListener('load', measure);
    window.addEventListener('resize', measure);
    measure();
    let lastY = window.scrollY, velocity = 0;
    const drift = () => {
      const y = window.scrollY;
      velocity += ((y - lastY) - velocity) * .1;
      lastY = y;
      marquees.forEach(m => {
        if (!m.loop) return;
        m.x -= (0.6 + Math.abs(velocity) * .25) * m.dir;
        if (m.x <= -m.loop) m.x += m.loop;
        if (m.x > 0) m.x -= m.loop;
        m.t.style.transform = `translate3d(${m.x}px,0,0)`;
      });
      requestAnimationFrame(drift);
    };
    requestAnimationFrame(drift);
  }

  // Cursor dot that swells over anything clickable (mouse and trackpad only)
  const cursor = document.querySelector('.cursor');
  if (cursor && !calm && window.matchMedia('(hover: hover)').matches) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    document.addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add('is-on');
      cursor.classList.toggle('is-big', !!e.target.closest('a, button, .marquee li, .tier, .stat'));
    });
    document.documentElement.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
    const follow = () => {
      cx += (tx - cx) * .22; cy += (ty - cy) * .22;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(follow);
    };
    requestAnimationFrame(follow);
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
