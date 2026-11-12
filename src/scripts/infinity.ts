// Hero animation: a stream of data particles flowing along an infinity curve
// (lemniscate of Bernoulli). Plain 2D canvas, no dependencies.

type P = { t: number; speed: number; off: number; depth: number; size: number; hot: boolean };

export function startInfinity(canvas: HTMLCanvasElement, reduced: boolean) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let w = 0,
    h = 0,
    cx = 0,
    cy = 0,
    a = 0;
  let particles: P[] = [];
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, px: -9999, py: -9999 };

  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

  function resize() {
    const r = canvas.getBoundingClientRect();
    w = r.width;
    h = r.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const wide = w >= 1024;
    cx = wide ? w * 0.72 : w * 0.5;
    cy = wide ? h * 0.5 : h * 0.84;
    a = wide ? Math.min(w * 0.215, 380) : Math.min(w * 0.44, 260);
    const count = Math.round(Math.min(2200, Math.max(700, (w * h) / 650)));
    particles = Array.from({ length: count }, () => ({
      t: Math.random() * Math.PI * 2,
      speed: 0.0016 + Math.random() * 0.0034,
      off: gauss(),
      depth: gauss(),
      size: 0.5 + Math.random() * 1.5,
      hot: Math.random() < 0.035,
    }));
  }

  function frame(time: number) {
    ctx!.clearRect(0, 0, w, h);
    const light = document.documentElement.dataset.theme === 'light';
    // additive glow on dark; solid, deeper colours on light
    ctx!.globalCompositeOperation = light ? 'source-over' : 'lighter';
    const c0 = light ? [94, 44, 237] : [124, 92, 255];
    const c1 = light ? [224, 122, 16] : [254, 184, 93];
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    const tilt = mouse.x * 0.18;
    const breathe = 1 + Math.sin(time * 0.0005) * 0.025;
    const band = a * 0.085;

    for (const p of particles) {
      if (!reduced) p.t += p.speed;
      const s = Math.sin(p.t),
        c = Math.cos(p.t);
      const d = 1 + s * s;
      let x = (a * breathe * c) / d;
      let y = (a * breathe * s * c) / d;
      // normal offset gives the ribbon its thickness; wobble makes it feel alive
      const wob = Math.sin(p.t * 3 + time * 0.0008 + p.depth * 4) * 0.35;
      const nx = -s,
        ny = c * (1 - s * s) * 0.9;
      const o = (p.off + wob) * band;
      x += nx * o;
      y += ny * o + p.depth * band * 0.9;
      // fake 3D: rotate around the vertical axis with the mouse
      const z = Math.sin(p.t) * 0.5 + p.depth * 0.2;
      const persp = 1 + z * tilt * 0.6;
      let sx = cx + x * persp + mouse.x * 18;
      let sy = cy + y * persp + mouse.y * 14;
      // pointer repulsion
      const dx = sx - mouse.px,
        dy = sy - mouse.py;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < 14000) {
        const f = (1 - dist2 / 14000) * 26;
        const dist = Math.sqrt(dist2) || 1;
        sx += (dx / dist) * f;
        sy += (dy / dist) * f;
      }
      // colour: violet on the left lobe, warm amber on the right
      const mix = (c + 1) / 2;
      const r = Math.round(c0[0] + (c1[0] - c0[0]) * mix * mix);
      const g = Math.round(c0[1] + (c1[1] - c0[1]) * mix * mix);
      const b = Math.round(c0[2] + (c1[2] - c0[2]) * mix * mix);
      const alpha = (p.hot ? 0.95 : light ? 0.62 : 0.5) * (0.55 + 0.45 * Math.abs(Math.sin(p.t * 2 + p.depth)));
      const size = p.size * (p.hot ? 1.9 : 1) * persp;
      ctx!.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx!.beginPath();
      ctx!.arc(sx, sy, size, 0, 6.2832);
      ctx!.fill();
      if (p.hot) {
        ctx!.fillStyle = `rgba(${r},${g},${b},0.07)`;
        ctx!.beginPath();
        ctx!.arc(sx, sy, size * 3.2, 0, 6.2832);
        ctx!.fill();
      }
    }
    ctx!.globalCompositeOperation = 'source-over';
  }

  let raf = 0;
  let visible = true;
  const loop = (t: number) => {
    frame(t);
    if (visible && !reduced) raf = requestAnimationFrame(loop);
  };

  resize();
  addEventListener('resize', () => {
    resize();
    if (reduced) frame(0);
  });
  addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / innerHeight - 0.5) * 2;
    mouse.px = e.clientX - r.left;
    mouse.py = e.clientY - r.top;
  });
  new IntersectionObserver(([entry]) => {
    const was = visible;
    visible = entry.isIntersecting;
    if (visible && !was && !reduced) raf = requestAnimationFrame(loop);
    if (!visible) cancelAnimationFrame(raf);
  }).observe(canvas);
  raf = requestAnimationFrame(loop);
}
