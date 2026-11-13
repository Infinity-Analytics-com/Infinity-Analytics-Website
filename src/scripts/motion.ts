import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { startInfinity } from './infinity';
import { campaign, initAnalytics, track } from './analytics';

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];

/* ---- smooth scrolling ---- */
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ duration: 1.1, anchors: { offset: -80 } });
  const l = lenis;
  l.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => l.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---- nav: glass on scroll, hide on scroll down ---- */
const nav = document.querySelector<HTMLElement>('.nav');
if (nav) {
  let last = 0;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    nav.classList.toggle('is-hidden', y > 600 && y > last && !document.body.classList.contains('menu-open'));
    last = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

initAnalytics();

/* ---- theme toggle ---- */
const root = document.documentElement;
const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
const applyTheme = (t: string) => {
  root.dataset.theme = t;
  themeMeta?.setAttribute('content', t === 'light' ? '#f6f4ff' : '#07051a');
  $$('[data-theme-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(t === 'light')));
};
applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark');
$$('[data-theme-toggle]').forEach((b) =>
  b.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* storage unavailable: the choice lasts for this page only */
    }
  }),
);

/* ---- mobile menu ---- */
const menu = document.querySelector<HTMLElement>('.mobile-menu');
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
if (menu && toggle) {
  const set = (open: boolean) => {
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    toggle.setAttribute('aria-expanded', String(open));
    menu.toggleAttribute('inert', !open);
  };
  set(false);
  toggle.addEventListener('click', () => set(!menu.classList.contains('is-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', (e) => e.key === 'Escape' && set(false));
}

/* ---- headline word reveal ---- */
$$('.split').forEach((el) => {
  // wrap each word of each text node in <span class="w"><span>word</span></span>
  const walk = (node: Node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        (n.textContent ?? '').split(/(\s+)/).forEach((part) => {
          if (!part.trim()) return frag.append(part);
          const w = document.createElement('span');
          w.className = 'w';
          const inner = document.createElement('span');
          inner.textContent = part;
          w.append(inner);
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n instanceof HTMLElement && !n.classList.contains('w')) {
        // keep gradient spans intact: animate them as a single word
        if (n.classList.contains('em')) {
          const w = document.createElement('span');
          w.className = 'w';
          n.replaceWith(w);
          const inner = document.createElement('span');
          inner.append(n);
          w.append(inner);
        } else walk(n);
      }
    });
  };
  walk(el);
  if (reduced) return;
  gsap.to($$('.w > span', el), {
    y: 0,
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.045,
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
  });
});

/* ---- generic reveal ---- */
if (!reduced) {
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    once: true,
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
  });
}

/* ---- counters ---- */
$$('[data-count]').forEach((el) => {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix ?? '';
  if (reduced) return void (el.textContent = target + suffix);
  const o = { v: 0 };
  gsap.to(o, {
    v: target,
    duration: 2.2,
    ease: 'expo.out',
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    onUpdate: () => (el.textContent = Math.round(o.v) + suffix),
  });
});

/* ---- process rail ---- */
const steps = document.querySelector<HTMLElement>('.steps');
if (steps) {
  const items = $$('.step', steps);
  const fill = steps.querySelector('.steps-fill');
  if (reduced) items.forEach((s) => s.classList.add('is-active'));
  else {
    if (fill)
      gsap.to(fill, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: steps, start: 'top 62%', end: 'bottom 62%', scrub: 0.4 },
      });
    items.forEach((s) =>
      ScrollTrigger.create({
        trigger: s,
        start: 'top 62%',
        onEnter: () => s.classList.add('is-active'),
        onLeaveBack: () => s.classList.remove('is-active'),
      }),
    );
  }
}

/* ---- parallax ---- */
if (!reduced)
  $$('[data-parallax]').forEach((el) =>
    gsap.to(el, {
      yPercent: Number(el.dataset.parallax) || -12,
      ease: 'none',
      scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
    }),
  );

/* ---- cursor spotlight on cards + magnetic buttons ---- */
if (finePointer) {
  $$('.card').forEach((c) =>
    c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', `${e.clientX - r.left}px`);
      c.style.setProperty('--my', `${e.clientY - r.top}px`);
    }),
  );
  if (!reduced)
    $$('[data-magnetic]').forEach((b) => {
      const x = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' });
      const y = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * 0.25);
        y((e.clientY - r.top - r.height / 2) * 0.35);
      });
      b.addEventListener('pointerleave', () => (x(0), y(0)));
    });
}

/* ---- showcase carousel ---- */
$$('[data-showcase]').forEach((sc) => {
  const track = sc.querySelector<HTMLElement>('[data-sc-track]')!;
  const prev = sc.querySelector<HTMLButtonElement>('[data-sc-prev]')!;
  const next = sc.querySelector<HTMLButtonElement>('[data-sc-next]')!;
  const step = () => (track.querySelector<HTMLElement>('.sc-slide')?.offsetWidth ?? 600) + 24;
  const update = () => {
    prev.disabled = track.scrollLeft < 8;
    next.disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 8;
  };
  // On desktop the carousel is driven by the page scroll: the section pins while the slides pass.
  const SPEED = 0.55; // page pixels scrolled per pixel of carousel travel
  const linked = !reduced && finePointer && matchMedia('(min-width: 64rem)').matches && track.scrollWidth - track.clientWidth > 40;
  const go = (dir: number) => {
    if (!linked) return track.scrollBy({ left: dir * step(), behavior: reduced ? 'auto' : 'smooth' });
    const y = scrollY + dir * step() * SPEED;
    if (lenis) lenis.scrollTo(y, { duration: 0.9 });
    else scrollTo({ top: y });
  };
  if (linked) {
    track.classList.add('is-linked');
    const max = () => track.scrollWidth - track.clientWidth;
    ScrollTrigger.create({
      trigger: track,
      start: 'center center',
      end: () => `+=${max() * SPEED}`,
      pin: sc,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => (track.scrollLeft = self.progress * max()),
    });
  }
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', update, { passive: true });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') (e.preventDefault(), go(1));
    if (e.key === 'ArrowLeft') (e.preventDefault(), go(-1));
  });
  // drag to scroll with a mouse
  let down = false, startX = 0, startLeft = 0;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || linked) return;
    down = true; startX = e.clientX; startLeft = track.scrollLeft;
  });
  addEventListener('pointermove', (e) => {
    if (!down) return;
    if (Math.abs(e.clientX - startX) > 4) track.classList.add('is-dragging');
    track.scrollLeft = startLeft - (e.clientX - startX);
  });
  addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    if (track.classList.contains('is-dragging')) {
      track.classList.remove('is-dragging');
      const i = Math.round(track.scrollLeft / step());
      track.scrollTo({ left: i * step(), behavior: reduced ? 'auto' : 'smooth' });
    }
  });
  update();
});

/* ---- live clocks ---- */
const clocks = $$('[data-tz]');
if (clocks.length) {
  const tick = () =>
    clocks.forEach((c) => {
      try {
        c.textContent = new Intl.DateTimeFormat(document.documentElement.lang, {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: c.dataset.tz,
        }).format(new Date());
      } catch {
        /* unsupported time zone: leave blank */
      }
    });
  tick();
  setInterval(tick, 15_000);
}

/* ---- hero canvas ---- */
const canvas = document.querySelector<HTMLCanvasElement>('#infinity');
if (canvas) startInfinity(canvas, reduced);

/* ---- contact form ---- */
const form = document.querySelector<HTMLFormElement>('#contact-form');
if (form) {
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const btn = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const label = btn.querySelector('span')!;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (data.website) return; // honeypot
    delete data.website;
    Object.assign(data, campaign(), { page: location.href });
    const endpoint = form.dataset.endpoint;
    const idle = label.textContent;
    const done = (ok: boolean) => {
      status.hidden = false;
      status.dataset.state = ok ? 'ok' : 'error';
      status.querySelector('[data-ok]')!.toggleAttribute('hidden', !ok);
      status.querySelector('[data-error]')!.toggleAttribute('hidden', ok);
      label.textContent = idle;
      btn.disabled = false;
      if (ok) {
        form.reset();
        track('generate_lead', { interest: data.interest });
        // the thank-you page is what ad platforms count as a conversion
        if (form.dataset.thanks) location.href = form.dataset.thanks;
      }
    };
    if (!endpoint) {
      // No backend configured: hand over to the visitor's mail client.
      track('contact_email', { page: location.pathname, via: 'form' });
      const body = `${data.message}\n\n${data.name}\n${data.company ?? ''}\n${data.email}`;
      location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent(
        `[${data.interest ?? 'Website'}] ${data.company || data.name}`,
      )}&body=${encodeURIComponent(body)}`;
      return;
    }
    btn.disabled = true;
    label.textContent = form.dataset.sending ?? '…';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      done(res.ok);
    } catch {
      done(false);
    }
  });
}
