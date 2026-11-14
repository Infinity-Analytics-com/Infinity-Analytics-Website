// Showcase concepts: dashboards, apps and AI experiences drawn as SVG at build time.
// They are illustrative designs with sample data, not client deliverables.
// To show real project screenshots instead, see src/components/Showcase.astro.

type Pal = { bg: string; panel: string; line: string; text: string; mute: string; a: string; b: string; c: string; d: string; ok: string; bad: string };
const DARK: Pal = { bg: '#0b0822', panel: '#15112f', line: 'rgba(255,255,255,.08)', text: '#f3f1ff', mute: '#8f89b3', a: '#8B5CFF', b: '#FEB85D', c: '#2DD4BF', d: '#F472B6', ok: '#34D399', bad: '#FB7185' };
const LIGHT: Pal = { bg: '#f3f2fa', panel: '#ffffff', line: 'rgba(20,12,60,.09)', text: '#150e38', mute: '#6b668a', a: '#5E2CED', b: '#E8912A', c: '#0FA68F', d: '#DB2777', ok: '#059669', bad: '#E11D48' };

const W = 800, H = 500;
const f = (n: number) => +n.toFixed(1);

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function series(n: number, seed: number, base = 50, vol = 10, trend = 1): number[] {
  const r = rng(seed); const out: number[] = []; let v = base;
  for (let i = 0; i < n; i++) { v += (r() - 0.45) * vol + trend; out.push(Math.max(2, v)); }
  return out;
}
function pts(vals: number[], x: number, y: number, w: number, h: number, min?: number, max?: number) {
  const lo = min ?? Math.min(...vals), hi = max ?? Math.max(...vals);
  return vals.map((v, i) => [f(x + (i / (vals.length - 1)) * w), f(y + h - ((v - lo) / (hi - lo || 1)) * h)] as const);
}
const line = (p: readonly (readonly [number, number])[]) => p.map(([px, py], i) => `${i ? 'L' : 'M'}${px} ${py}`).join(' ');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

type TO = { size?: number; fill?: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; mono?: boolean; op?: number };
const txt = (x: number, y: number, s: string, o: TO = {}) =>
  `<text x="${x}" y="${y}" font-size="${o.size ?? 11}" fill="${o.fill ?? '#fff'}" font-weight="${o.weight ?? 400}" text-anchor="${o.anchor ?? 'start'}"${o.mono ? ' font-family="Geist Mono Variable,monospace"' : ''}${o.op ? ` opacity="${o.op}"` : ''}>${esc(s)}</text>`;
const rect = (x: number, y: number, w: number, h: number, fill: string, r = 6, extra = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(Math.max(0, w))}" height="${f(Math.max(0, h))}" rx="${r}" fill="${fill}" ${extra}/>`;
const panel = (p: Pal, x: number, y: number, w: number, h: number, title?: string) =>
  rect(x, y, w, h, p.panel, 12, `stroke="${p.line}"`) + (title ? txt(x + 16, y + 24, title, { fill: p.mute, size: 10.5, weight: 500 }) : '');
const pill = (x: number, y: number, s: string, bg: string, fg: string, w?: number) => {
  const pw = w ?? s.length * 5.6 + 16;
  return rect(x, y, pw, 18, bg, 9) + txt(x + pw / 2, y + 12.5, s, { size: 9, fill: fg, anchor: 'middle', weight: 500 });
};
function spark(vals: number[], x: number, y: number, w: number, h: number, color: string, fill = true) {
  const p = pts(vals, x, y, w, h);
  return (fill ? `<path d="${line(p)} L${x + w} ${y + h} L${x} ${y + h} Z" fill="${color}" opacity=".14"/>` : '') +
    `<path d="${line(p)}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function kpi(p: Pal, x: number, y: number, w: number, label: string, value: string, delta: string, seed: number, color: string) {
  const down = delta.startsWith('-') || delta.startsWith('↓');
  const good = !delta.startsWith('-');
  return panel(p, x, y, w, 84) + txt(x + 14, y + 22, label, { fill: p.mute, size: 10 }) + txt(x + 14, y + 50, value, { fill: p.text, size: 21, weight: 600 }) +
    txt(x + 14, y + 70, (down ? '▼ ' : '▲ ') + delta.replace(/^[-↓]/, ''), { fill: good ? p.ok : p.bad, size: 9.5, weight: 500 }) + spark(series(14, seed, 40, 14, 2), x + w - 78, y + 34, 64, 34, color);
}
function bars(vals: number[], x: number, y: number, w: number, h: number, color: string, hi = -1, hiColor = '') {
  const max = Math.max(...vals), bw = w / vals.length;
  return vals.map((v, i) => { const bh = (v / max) * h; return rect(x + i * bw + bw * 0.18, y + h - bh, bw * 0.64, bh, i === hi ? hiColor : color, 3, `class="bar" style="animation-delay:${(i * 0.12).toFixed(2)}s"${i === hi ? '' : ' opacity=".8"'}`); }).join('');
}
function hbars(p: Pal, items: [string, number][], x: number, y: number, w: number, rowH: number, color: string) {
  const max = Math.max(...items.map((i) => i[1]));
  return items.map(([l, v], i) => txt(x, y + i * rowH + 11, l, { fill: p.text, size: 10 }) + rect(x + 92, y + i * rowH + 2, w - 132, 10, p.line, 5) +
    rect(x + 92, y + i * rowH + 2, ((w - 132) * v) / max, 10, color, 5, `opacity="${f(1 - i * 0.12)}"`) + txt(x + w, y + i * rowH + 11, String(v), { fill: p.mute, size: 9.5, anchor: 'end', mono: true })).join('');
}
function donut(cx: number, cy: number, r: number, parts: [number, string][], sw = 16) {
  const total = parts.reduce((s, q) => s + q[0], 0), C = 2 * Math.PI * r; let off = 0;
  return parts.map(([v, c]) => { const len = (v / total) * C; const s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-dasharray="${f(len - 3)} ${f(C - len + 3)}" stroke-dashoffset="${f(-off)}" transform="rotate(-90 ${cx} ${cy})"/>`; off += len; return s; }).join('');
}
const grid = (p: Pal, x: number, y: number, w: number, h: number, n = 4) => Array.from({ length: n }, (_, i) => `<line x1="${x}" x2="${x + w}" y1="${f(y + (h / (n - 1)) * i)}" y2="${f(y + (h / (n - 1)) * i)}" stroke="${p.line}"/>`).join('');
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const xlabels = (p: Pal, labels: string[], x: number, y: number, w: number) => labels.map((l, i) => txt(f(x + (i / (labels.length - 1)) * w), y, l, { fill: p.mute, size: 8.5, anchor: 'middle' })).join('');

/** App shell: icon rail on the left, title and filters on top. Content area starts at x=68, y=58. */
function shell(p: Pal, title: string, filters: string[], active = 0) {
  let s = rect(0, 0, W, H, p.bg, 0) + rect(0, 0, 52, H, p.panel, 0) + `<line x1="52" x2="52" y1="0" y2="${H}" stroke="${p.line}"/>`;
  s += `<path d="M26 26c-3-5-5.5-7-8.500-7a7 7 0 1 0 0 14c3 0 5.500-2 8.500-7Zm0 0c3 5 5.500 7 8.500 7a7 7 0 1 0 0-14c-3 0-5.500 2-8.500 7Z" fill="none" stroke="${p.a}" stroke-width="2.6" stroke-linecap="round" transform="translate(5.200 5.200) scale(.8)"/>`;
  for (let i = 0; i < 5; i++) s += rect(15, 70 + i * 38, 22, 22, i === active ? p.a : p.line, 7, i === active ? '' : 'opacity=".9"');
  s += `<circle cx="26" cy="${H - 30}" r="11" fill="${p.b}" opacity=".9"/>`;
  s += txt(68, 36, title, { fill: p.text, size: 17, weight: 600 });
  let fx = W - 16;
  for (const fl of [...filters].reverse()) { const pw = fl.length * 5.6 + 22; fx -= pw; s += rect(fx, 20, pw, 22, p.panel, 11, `stroke="${p.line}"`) + txt(fx + pw / 2, 34.5, fl, { fill: p.mute, size: 9.5, anchor: 'middle' }); fx -= 8; }
  return s;
}
const wrap = (inner: string) => `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Geist Variable,system-ui,sans-serif" role="img" aria-hidden="true">${inner}</svg>`;

/* ------------------------------------------------------------------ */

function exec() {
  const p = DARK; let s = shell(p, 'Executive Overview', ['FY 2026', 'All regions', 'EUR']);
  const k: [string, string, string, string][] = [['Revenue', '€48.2M', '12.4%', p.a], ['Gross margin', '38.6%', '2.1 pts', p.c], ['Orders', '12,840', '8.9%', p.b], ['Churn', '2.3%', '↓0.4 pts', p.d]];
  k.forEach((q, i) => (s += kpi(p, 68 + i * 180, 58, 170, q[0], q[1], q[2], 11 + i, q[3])));
  s += panel(p, 68, 154, 460, 210, 'Revenue vs target');
  const a = series(12, 3, 30, 9, 4), b = a.map((v, i) => v * (0.9 + (i % 3) * 0.04));
  const lo = 15, hi = Math.max(...a) * 1.05;
  s += grid(p, 88, 194, 420, 130) + `<path d="${line(pts(a, 88, 194, 420, 130, lo, hi))} L508 324 L88 324 Z" fill="${p.a}" opacity=".18"/>` +
    `<path class="draw" d="${line(pts(a, 88, 194, 420, 130, lo, hi))}" fill="none" stroke="${p.a}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:900;stroke-dashoffset:900"/>` +
    `<path d="${line(pts(b, 88, 194, 420, 130, lo, hi))}" fill="none" stroke="${p.b}" stroke-width="1.6" stroke-dasharray="4 5"/>` + xlabels(p, months, 88, 346, 420);
  s += panel(p, 538, 154, 246, 210, 'Revenue by segment') + donut(606, 268, 44, [[42, p.a], [27, p.c], [19, p.b], [12, p.d]]) + txt(606, 265, '€48.2M', { fill: p.text, size: 12, weight: 600, anchor: 'middle' }) + txt(606, 279, 'total', { fill: p.mute, size: 8.5, anchor: 'middle' });
  [['Enterprise', '42%', p.a], ['Mid-market', '27%', p.c], ['SMB', '19%', p.b], ['Public', '12%', p.d]].forEach(([l, v, c], i) => (s += rect(676, 222 + i * 26, 8, 8, c, 2) + txt(690, 230 + i * 26, l, { fill: p.text, size: 9.5 }) + txt(772, 230 + i * 26, v, { fill: p.mute, size: 9.5, anchor: 'end', mono: true })));
  s += panel(p, 68, 374, 350, 110, 'Orders by month') + bars(series(12, 8, 40, 16, 2), 84, 404, 318, 66, p.a, 10, p.b);
  s += panel(p, 428, 374, 356, 110, 'Top regions') + hbars(p, [['North America', 184], ['Europe', 142], ['MENA', 96], ['Africa', 61]], 444, 406, 324, 18, p.c);
  return wrap(s);
}

function sales() {
  const p = DARK; let s = shell(p, 'Sales Performance', ['Q3 2026', 'Team: All'], 1);
  const k: [string, string, string, string][] = [['Pipeline', '€21.7M', '18.2%', p.a], ['Win rate', '31.4%', '3.2 pts', p.c], ['Avg deal size', '€64k', '5.1%', p.b]];
  k.forEach((q, i) => (s += kpi(p, 68 + i * 240, 58, 230, q[0], q[1], q[2], 31 + i, q[3])));
  s += panel(p, 68, 154, 300, 330, 'Sales funnel');
  [['Leads', 2480, 260], ['Qualified', 1310, 216], ['Proposal', 620, 170], ['Negotiation', 284, 124], ['Won', 131, 84]].forEach(([l, v, w], i) => {
    const y = 192 + i * 56, cx = 218, nw = [216, 170, 124, 84, 60][i];
    s += `<path d="M${cx - (w as number) / 2} ${y} H${cx + (w as number) / 2} L${cx + nw / 2} ${y + 44} H${cx - nw / 2} Z" fill="${p.a}" opacity="${f(1 - i * 0.16)}"/>` + txt(cx, y + 20, String(l), { size: 10, anchor: 'middle', weight: 500 }) + txt(cx, y + 34, (v as number).toLocaleString('en-US'), { size: 10, anchor: 'middle', mono: true, op: 0.8 });
  });
  s += panel(p, 378, 154, 406, 170, 'Bookings by region');
  s += grid(p, 398, 190, 366, 100);
  [[41, p.a], [42, p.c], [43, p.b]].forEach(([sd, c]) => (s += `<path d="${line(pts(series(12, sd as number, 30, 12, 3), 398, 190, 366, 100, 10, 110))}" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`));
  s += xlabels(p, months, 398, 312, 366);
  s += panel(p, 378, 334, 406, 150, 'Top products') + hbars(p, [['Analytics Suite', 412], ['Data Platform', 356], ['AI Assistant', 281], ['Training', 174], ['Support', 122]], 394, 366, 374, 21, p.b);
  return wrap(s);
}

function finance() {
  const p = LIGHT; let s = shell(p, 'P&L Analysis', ['YTD Sep 2026', 'Group', 'vs Budget'], 2);
  const k: [string, string, string, string][] = [['Revenue', '€36.4M', '6.8%', p.a], ['Gross margin', '41.2%', '1.4 pts', p.c], ['EBITDA', '€7.9M', '11.3%', p.b], ['Cash', '€12.1M', '-3.2%', p.d]];
  k.forEach((q, i) => (s += kpi(p, 68 + i * 180, 58, 170, q[0], q[1], q[2], 51 + i, q[3])));
  s += panel(p, 68, 154, 716, 180, 'Revenue to net income bridge (€M)');
  const steps: [string, number, 'tot' | 'neg' | 'pos'][] = [['Revenue', 36.4, 'tot'], ['COGS', -21.4, 'neg'], ['Gross profit', 15.0, 'tot'], ['Sales & mkt', -3.6, 'neg'], ['R&D', -2.1, 'neg'], ['G&A', -1.4, 'neg'], ['EBITDA', 7.9, 'tot'], ['D&A', -1.2, 'neg'], ['Tax', -1.6, 'neg'], ['Net income', 5.1, 'tot']];
  let run = 0; const sc = 110 / 36.4, base = 304, bw = 52;
  steps.forEach(([l, v, t], i) => {
    const x = 90 + i * 69; let top: number, hh: number;
    if (t === 'tot') { run = v; top = base - v * sc; hh = v * sc; } else { top = base - run * sc; hh = -v * sc; run += v; }
    s += rect(x, top, bw, hh, t === 'tot' ? p.a : p.bad, 4, t === 'tot' ? '' : 'opacity=".85"') + txt(x + bw / 2, top - 5, (v > 0 ? '' : '−') + Math.abs(v).toFixed(1), { fill: p.text, size: 9, anchor: 'middle', mono: true }) + txt(x + bw / 2, 322, l, { fill: p.mute, size: 8.5, anchor: 'middle' });
  });
  s += panel(p, 68, 344, 716, 140, 'Variance by business unit');
  ['Business unit', 'Actual', 'Budget', 'Variance'].forEach((hd, i) => (s += txt([84, 330, 430, 540][i], 386, hd, { fill: p.mute, size: 9 })));
  [['Industrial', '14.2', '13.1', 0.7], ['Retail', '9.8', '10.4', -0.45], ['Services', '7.6', '6.9', 0.55], ['Public sector', '4.8', '4.9', -0.1]].forEach(([n, a, b, v], i) => {
    const y = 406 + i * 19;
    s += `<line x1="84" x2="768" y1="${y - 12}" y2="${y - 12}" stroke="${p.line}"/>` + txt(84, y, String(n), { fill: p.text, size: 10 }) + txt(330, y, '€' + a + 'M', { fill: p.text, size: 10, mono: true }) + txt(430, y, '€' + b + 'M', { fill: p.mute, size: 10, mono: true });
    const vv = v as number, bx = 650; s += `<line x1="${bx}" x2="${bx}" y1="${y - 9}" y2="${y + 2}" stroke="${p.mute}" opacity=".5"/>` + rect(vv > 0 ? bx : bx + vv * 120, y - 8, Math.abs(vv) * 120, 9, vv > 0 ? p.ok : p.bad, 3) + txt(540, y, (vv > 0 ? '+' : '−') + (Math.abs(vv) * 2).toFixed(1) + 'M', { fill: vv > 0 ? p.ok : p.bad, size: 10, mono: true });
  });
  return wrap(s);
}

function ops() {
  const p = DARK; let s = shell(p, 'Operations Control Tower', ['● Live', 'Plant: Casablanca', 'Shift B'], 3);
  const g: [string, number, string][] = [['OEE', 0.84, p.a], ['Availability', 0.92, p.c], ['Quality', 0.97, p.b]];
  g.forEach(([l, v, c], i) => {
    const x = 68 + i * 160, cx = x + 75, cy = 142, r = 48, C = Math.PI * r;
    s += panel(p, x, 58, 150, 120, l) + `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="${p.line}" stroke-width="10" stroke-linecap="round"/>` +
      `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${f(C * v)} ${f(C)}"/>` + txt(cx, cy - 6, Math.round(v * 100) + '%', { fill: p.text, size: 19, weight: 600, anchor: 'middle' });
  });
  s += panel(p, 548, 58, 236, 120, 'Active alerts');
  [['Line 3 temperature drift', p.bad], ['Packaging micro-stops', p.b], ['Supplier delay · resin', p.b]].forEach(([l, c], i) => (s += `<circle cx="568" cy="${101 + i * 24}" r="4" fill="${c}"/>` + txt(580, 104.500 + i * 24, l, { fill: p.text, size: 10 })));
  s += panel(p, 68, 188, 440, 296, 'Throughput by hour and line');
  const r = rng(77); const lines = ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5', 'Line 6', 'Line 7'];
  lines.forEach((l, row) => { s += txt(84, 238 + row * 33, l, { fill: p.mute, size: 9.5 }); for (let c = 0; c < 12; c++) { const v = r(); const bad = row === 2 && c > 7; s += rect(130 + c * 30.500, 222 + row * 33, 27, 26, bad ? p.bad : p.a, 5, `opacity="${f(bad ? 0.55 + v * 0.4 : 0.14 + v * 0.8)}"`); } });
  s += xlabels(p, ['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17'], 143.500, 468, 335.500);
  s += panel(p, 518, 188, 266, 140, 'Units produced') + txt(534, 246, '18,420', { fill: p.text, size: 24, weight: 600 }) + txt(634, 246, '▲ 6.2% vs plan', { fill: p.ok, size: 9.5 }) + spark(series(24, 5, 40, 12, 1.500), 534, 262, 234, 50, p.c);
  s += panel(p, 518, 338, 266, 146, 'Downtime by cause (min)') + hbars(p, [['Changeover', 42], ['Material', 31], ['Breakdown', 24], ['Planned', 18]], 534, 372, 234, 25, p.d);
  return wrap(s);
}

function pipeline() {
  const p = DARK; let s = shell(p, 'Pipeline Monitor', ['Workspace: Production', 'Last 24h'], 1);
  s += panel(p, 68, 58, 716, 226, 'Lakehouse lineage');
  const node = (x: number, y: number, l: string, sub: string, c: string, st = p.ok) => rect(x, y, 104, 44, p.bg, 9, `stroke="${c}" stroke-opacity=".7"`) + txt(x + 12, y + 19, l, { fill: p.text, size: 10, weight: 500 }) + txt(x + 12, y + 33, sub, { fill: p.mute, size: 8.5, mono: true }) + `<circle cx="${x + 92}" cy="${y + 13}" r="3.500" fill="${st}"/>`;
  const link = (x1: number, y1: number, x2: number, y2: number, c: string) => `<path class="dash" d="M${x1} ${y1} C${(x1 + x2) / 2} ${y1},${(x1 + x2) / 2} ${y2},${x2} ${y2}" fill="none" stroke="${c}" stroke-width="1.5" opacity=".8"/>`;
  [['ERP · SAP', '1.2M rows'], ['CRM', '86k rows'], ['Web events', 'stream'], ['Files · SFTP', '42 files']].forEach(([l, sub], i) => { s += node(84, 92 + i * 47, l, sub, p.mute, i === 3 ? p.b : p.ok) + link(188, 114 + i * 47, 232, 184, p.mute); });
  [['Bronze', 'raw · 214 tables', '#C68A4E'], ['Silver', 'clean · 96 tables', '#C9CEDA'], ['Gold', 'model · 31 tables', p.b]].forEach(([l, sub, c], i) => { s += node(232 + i * 140, 162, l, sub, c) + (i < 2 ? link(336 + i * 140, 184, 372 + i * 140, 184, c) : ''); });
  s += link(616, 184, 660, 130, p.a) + link(616, 184, 660, 238, p.a) + node(660, 108, 'Power BI', 'Direct Lake model', p.a) + node(660, 216, 'AI agents', '3 endpoints', p.a);
  s += panel(p, 68, 294, 350, 190, 'Run history');
  const r = rng(9); for (let i = 0; i < 28; i++) { const v = r(); const c = v > 0.93 ? p.bad : v > 0.85 ? p.b : p.ok; s += rect(84 + i * 11.500, 400 - 20 - v * 50, 8, 20 + v * 50, c, 3, 'opacity=".85"'); }
  s += txt(84, 432, '99.2%', { fill: p.text, size: 22, weight: 600 }) + txt(84, 450, 'success rate', { fill: p.mute, size: 9.5 }) + txt(200, 432, '14m 08s', { fill: p.text, size: 22, weight: 600 }) + txt(200, 450, 'avg duration', { fill: p.mute, size: 9.5 }) + txt(320, 432, '312', { fill: p.text, size: 22, weight: 600 }) + txt(320, 450, 'runs', { fill: p.mute, size: 9.5 });
  s += panel(p, 428, 294, 356, 190, 'Latest runs');
  [['pl_sales_daily', 'Succeeded', '12m 41s', p.ok], ['pl_finance_gl', 'Succeeded', '08m 02s', p.ok], ['nb_customer_360', 'Running', '03m 17s', p.a], ['pl_files_sftp', 'Retrying', '00m 54s', p.b], ['df_inventory', 'Succeeded', '05m 30s', p.ok]].forEach(([n, st, d, c], i) => {
    const y = 342 + i * 28; s += `<line x1="444" x2="768" y1="${y - 17}" y2="${y - 17}" stroke="${p.line}"/>` + txt(444, y, n, { fill: p.text, size: 10, mono: true }) + pill(600, y - 13, st, c + '26', c, 70) + txt(768, y, d, { fill: p.mute, size: 9.5, anchor: 'end', mono: true });
  });
  return wrap(s);
}

function capacity() {
  const p = DARK; let s = shell(p, 'Fabric Capacity & Cost', ['F64 · West Europe', '14 days'], 4);
  const k: [string, string, string, string][] = [['CU utilisation', '71%', '↓9 pts', p.a], ['Throttling', '0 min', '↓100%', p.c], ['Cost / month', '€7.4k', '↓22%', p.b]];
  k.forEach((q, i) => (s += kpi(p, 68 + i * 240, 58, 230, q[0], q[1], q[2], 61 + i, q[3])));
  s += panel(p, 68, 154, 716, 190, 'Capacity units: interactive vs background');
  const a = series(40, 21, 30, 10, 0.200), b = series(40, 22, 22, 7, 0.100), top = a.map((v, i) => v + b[i]);
  const pa = pts(b, 88, 190, 676, 130, 0, 100), pb = pts(top, 88, 190, 676, 130, 0, 100);
  s += grid(p, 88, 190, 676, 130) + `<path d="${line(pb)} L764 320 L88 320 Z" fill="${p.a}" opacity=".35"/><path d="${line(pa)} L764 320 L88 320 Z" fill="${p.c}" opacity=".45"/><path d="${line(pb)}" fill="none" stroke="${p.a}" stroke-width="1.8"/>` +
    `<line x1="88" x2="764" y1="203" y2="203" stroke="${p.bad}" stroke-dasharray="5 5"/>` + txt(764, 198, '100% capacity', { fill: p.bad, size: 9, anchor: 'end' }) + rect(600, 162, 8, 8, p.a, 2) + txt(612, 170, 'Interactive', { fill: p.mute, size: 9 }) + rect(680, 162, 8, 8, p.c, 2) + txt(692, 170, 'Background', { fill: p.mute, size: 9 });
  s += panel(p, 68, 354, 350, 130, 'Top workspaces by CU') + hbars(p, [['Finance', 318], ['Sales', 264], ['Supply chain', 201], ['Data science', 142]], 84, 388, 318, 22, p.a);
  s += panel(p, 428, 354, 356, 130, 'Optimisation actions');
  [['Direct Lake migration · 6 models', 'Done', p.ok], ['Refresh schedule staggered', 'Done', p.ok], ['Autoscale rule for month-end', 'Planned', p.b]].forEach(([l, st, c], i) => (s += txt(444, 400 + i * 26, l, { fill: p.text, size: 10 }) + pill(712, 387 + i * 26, st, c + '26', c, 56)));
  return wrap(s);
}

function agent() {
  const p = DARK; let s = rect(0, 0, W, H, p.bg, 0) + rect(0, 0, 190, H, p.panel, 0) + `<line x1="190" x2="190" y1="0" y2="${H}" stroke="${p.line}"/>`;
  s += txt(20, 36, 'Data Agent', { fill: p.text, size: 15, weight: 600 }) + rect(20, 54, 150, 30, p.a, 9) + txt(95, 73.500, '+ New question', { size: 10.5, anchor: 'middle', weight: 500 });
  s += txt(20, 114, 'RECENT', { fill: p.mute, size: 8.500, mono: true });
  ['Q3 margin by region', 'Late deliveries this week', 'Top churn risks', 'Budget vs actual · Opex', 'Stock cover by warehouse'].forEach((l, i) => (s += (i === 0 ? rect(12, 124, 166, 26, p.line, 8) : '') + txt(22, 141 + i * 30, l, { fill: i === 0 ? p.text : p.mute, size: 10 })));
  s += rect(20, H - 56, 150, 36, p.bg, 9, `stroke="${p.line}"`) + `<circle cx="38" cy="${H - 38}" r="9" fill="${p.b}"/>` + txt(54, H - 34, 'Finance team', { fill: p.text, size: 10 });
  s += rect(430, 30, 340, 34, p.a, 14) + txt(446, 51.500, 'Why did gross margin drop in Q3 compared with Q2?', { size: 11 });
  s += `<circle cx="222" cy="98" r="11" fill="${p.a}" opacity=".25"/><path d="M222 98c-1.500-2.500-2.700-3.500-4.200-3.500a3.500 3.500 0 1 0 0 7c1.500 0 2.700-1 4.200-3.500Zm0 0c1.500 2.500 2.700 3.500 4.200 3.500a3.500 3.500 0 1 0 0-7c-1.500 0-2.700 1-4.200 3.500Z" fill="none" stroke="${p.a}" stroke-width="1.500"/>`;
  s += panel(p, 242, 82, 528, 300);
  s += txt(260, 108, 'Gross margin fell 2.1 points to 36.5%. Three drivers explain 90% of the change:', { fill: p.text, size: 11 });
  [['Freight costs', '−1.1 pts', 'EMEA lanes up 12% after carrier renewal', p.bad], ['Product mix', '−0.6 pts', 'More entry-level units in North America', p.b], ['Discounting', '−0.2 pts', 'Quarter-end promotions in Retail', p.b]].forEach(([l, v, d, c], i) => {
    const y = 124 + i * 36; s += rect(260, y, 492, 30, p.bg, 8) + `<circle cx="276" cy="${y + 15}" r="4" fill="${c}"/>` + txt(290, y + 19, l, { fill: p.text, size: 10.5, weight: 500 }) + txt(384, y + 19, d, { fill: p.mute, size: 10 }) + txt(740, y + 19, v, { fill: c, size: 10.5, anchor: 'end', mono: true });
  });
  s += txt(260, 252, 'Gross margin % by month', { fill: p.mute, size: 9.5 }) + bars([38.6, 38.9, 38.4, 38.7, 38.6, 38.5, 37.2, 36.4, 36.0].map((v) => v - 33), 260, 262, 300, 70, p.a, 8, p.bad) + xlabels(p, months.slice(0, 9), 276.500, 346, 267);
  s += rect(580, 262, 172, 74, p.bg, 9) + txt(594, 282, 'Suggested action', { fill: p.mute, size: 9 }) + txt(594, 300, 'Re-quote EMEA freight:', { fill: p.text, size: 10 }) + txt(594, 315, 'est. +0.7 pts margin', { fill: p.ok, size: 10, weight: 500 });
  s += txt(260, 368, 'Sources', { fill: p.mute, size: 9 }) + pill(302, 355, 'Finance model', p.line, p.text) + pill(398, 355, 'Logistics lakehouse', p.line, p.text) + pill(528, 355, 'Row-level security applied', p.ok + '26', p.ok);
  ['Show freight cost by lane', 'Compare with last year', 'Draft a note for the CFO'].forEach((l, i) => { const w = [150, 140, 150][i]; const x = 242 + [0, 160, 310][i]; s += rect(x, 396, w, 26, 'none', 13, `stroke="${p.line}"`) + txt(x + w / 2, 413, l, { fill: p.text, size: 9.5, anchor: 'middle' }); });
  s += rect(242, 438, 528, 42, p.panel, 14, `stroke="${p.line}"`) + txt(262, 463, 'Ask a question about your data…', { fill: p.mute, size: 11 }) + `<circle cx="746" cy="459" r="13" fill="${p.a}"/><path d="M741 459h10m0 0-4-4m4 4-4 4" stroke="#fff" stroke-width="1.600" fill="none" stroke-linecap="round"/>`;
  return wrap(s);
}

function forecast() {
  const p = DARK; let s = shell(p, 'Demand Forecast', ['Category: All', 'Horizon: 6 months'], 2);
  s += panel(p, 68, 58, 520, 300, 'Units sold: actual and forecast');
  const hist = series(18, 14, 40, 12, 2.200), last = hist[hist.length - 1];
  const fc = [last, ...series(8, 15, last, 7, 2.600)];
  const all = [...hist, ...fc.slice(1)], lo = Math.min(...all) - 12, hi = Math.max(...all) + 22, n = all.length;
  const X = (i: number) => f(88 + (i / (n - 1)) * 480), Y = (v: number) => f(96 + 220 - ((v - lo) / (hi - lo)) * 220);
  const hp = hist.map((v, i) => [X(i), Y(v)] as const), fp = fc.map((v, i) => [X(hist.length - 1 + i), Y(v)] as const);
  const up = fc.map((v, i) => [X(hist.length - 1 + i), Y(v + i * 3.200)] as const), dn = fc.map((v, i) => [X(hist.length - 1 + i), Y(v - i * 3.200)] as const);
  s += grid(p, 88, 96, 480, 220, 5) + `<path d="${line(up)} ${[...dn].reverse().map(([x, y]) => `L${x} ${y}`).join(' ')} Z" fill="${p.b}" opacity=".16"/>` +
    `<path d="${line(hp)}" fill="none" stroke="${p.a}" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"/><path class="dash" d="${line(fp)}" fill="none" stroke="${p.b}" stroke-width="2.400" stroke-linecap="round"/>` +
    `<line x1="${X(hist.length - 1)}" x2="${X(hist.length - 1)}" y1="90" y2="322" stroke="${p.mute}" stroke-dasharray="3 4"/>` + pill(X(hist.length - 1) - 22, 76, 'Today', p.line, p.text, 44) + `<circle class="pulse" cx="${X(hist.length - 1)}" cy="${Y(last)}" r="4.500" fill="#fff"/>`;
  s += xlabels(p, ['Jan 25', 'Jul 25', 'Jan 26', 'Jul 26', 'Jan 27'], 88, 344, 480);
  [['Forecast accuracy', '93.8%', p.ok], ['Next 6 months', '+14.2%', p.b], ['Stock-out risk', '3 SKUs', p.bad]].forEach(([l, v, c], i) => (s += panel(p, 598, 58 + i * 102, 186, 92) + txt(614, 84 + i * 102, l, { fill: p.mute, size: 10 }) + txt(614, 122 + i * 102, v, { fill: c, size: 24, weight: 600 })));
  s += panel(p, 68, 368, 716, 116, 'Scenarios');
  [['Conservative', '€18.4M', '−6% demand, no promo', p.mute], ['Base case', '€20.9M', 'Seasonality + pipeline', p.a], ['Optimistic', '€23.6M', 'New channel launch in Q1', p.c]].forEach(([l, v, d, c], i) => {
    const x = 84 + i * 232; s += rect(x, 402, 220, 66, p.bg, 10, `stroke="${i === 1 ? p.a : p.line}"`) + txt(x + 14, 424, l, { fill: c, size: 10, weight: 500 }) + txt(x + 14, 448, v, { fill: p.text, size: 17, weight: 600 }) + txt(x + 100, 448, d, { fill: p.mute, size: 9 });
  });
  return wrap(s);
}

function phone(p: Pal, x: number, y: number, inner: string) {
  return rect(x, y, 196, 404, '#000', 30, `stroke="${p.line}" stroke-width="2"`) + rect(x + 7, y + 7, 182, 390, p.bg, 24) + rect(x + 70, y + 14, 56, 12, '#000', 6) + inner;
}
function mobile() {
  const p = DARK; let s = rect(0, 0, W, H, '#0b0822', 0) + `<circle cx="400" cy="520" r="330" fill="${p.a}" opacity=".16"/><circle cx="660" cy="80" r="160" fill="${p.b}" opacity=".07"/>`;
  // screen 1: task list
  let a = txt(118, 100, 'Today', { fill: p.text, size: 17, weight: 600 }) + txt(118, 116, '6 inspections · 2 overdue', { fill: p.mute, size: 9 });
  [['Site A · Boiler room', 'Due 09:30', p.bad], ['Site A · Roof access', 'Due 11:00', p.b], ['Depot 4 · Loading bay', 'Due 14:00', p.c], ['Site C · Fire exits', 'Due 16:30', p.c]].forEach(([l, d, c], i) => (a += rect(112, 130 + i * 58, 172, 50, p.panel, 12) + rect(112, 130 + i * 58, 4, 50, c, 2) + txt(126, 151 + i * 58, l, { fill: p.text, size: 10, weight: 500 }) + txt(126, 167 + i * 58, d, { fill: p.mute, size: 9 }) + `<path d="M270 ${152 + i * 58}l5 5-5 5" stroke="${p.mute}" fill="none" stroke-width="1.500"/>`));
  a += rect(112, 372, 172, 36, p.a, 12) + txt(198, 394.500, 'Start next inspection', { size: 10.5, anchor: 'middle', weight: 500 });
  s += phone(p, 100, 48, a);
  // screen 2: form
  let b = txt(320, 100, 'Boiler room', { fill: p.text, size: 15, weight: 600 }) + rect(320, 110, 172, 4, p.line, 2) + rect(320, 110, 112, 4, p.a, 2) + txt(320, 130, 'Step 4 of 6', { fill: p.mute, size: 9 });
  [['Pressure within range', true], ['Safety valve tested', true], ['Leak detected', false]].forEach(([l, on], i) => { b += rect(314, 142 + i * 44, 172, 36, p.panel, 10) + txt(326, 164 + i * 44, String(l), { fill: p.text, size: 10 }) + rect(446, 151 + i * 44, 30, 17, on ? p.ok : p.line, 9) + `<circle cx="${on ? 467.500 : 454.500}" cy="${159.500 + i * 44}" r="6.500" fill="#fff"/>`; });
  b += rect(314, 276, 82, 62, p.panel, 10, `stroke="${p.line}" stroke-dasharray="4 4"`) + txt(355, 311, '+ Photo', { fill: p.mute, size: 9.5, anchor: 'middle' }) + rect(404, 276, 82, 62, p.a, 10, 'opacity=".35"') + `<path d="M414 326l18-22 14 14 10-8 20 16Z" fill="${p.a}"/>`;
  b += rect(314, 348, 172, 22, p.panel, 8) + txt(326, 363, 'Add a note…', { fill: p.mute, size: 9.5 }) + rect(314, 380, 172, 34, p.a, 12) + txt(400, 401.500, 'Next', { size: 10.5, anchor: 'middle', weight: 500 });
  s += phone(p, 302, 28, b);
  // screen 3: summary
  let c = txt(522, 100, 'This week', { fill: p.text, size: 17, weight: 600 }) + rect(516, 114, 172, 96, p.panel, 12) + donut(562, 162, 28, [[86, p.a], [14, p.line]], 9) + txt(562, 166, '86%', { fill: p.text, size: 12, weight: 600, anchor: 'middle' }) + txt(604, 152, 'Compliance', { fill: p.mute, size: 9 }) + txt(604, 172, '▲ 4 pts', { fill: p.ok, size: 10, weight: 500 });
  c += rect(516, 218, 82, 60, p.panel, 12) + txt(528, 240, 'Completed', { fill: p.mute, size: 8.500 }) + txt(528, 264, '42', { fill: p.text, size: 18, weight: 600 }) + rect(606, 218, 82, 60, p.panel, 12) + txt(618, 240, 'Issues', { fill: p.mute, size: 8.500 }) + txt(618, 264, '5', { fill: p.b, size: 18, weight: 600 });
  c += rect(516, 286, 172, 122, p.panel, 12) + txt(528, 306, 'Inspections per day', { fill: p.mute, size: 9 }) + bars([6, 9, 7, 11, 9, 4, 2], 524, 316, 156, 68, p.a, 3, p.b) + xlabels(p, ['M', 'T', 'W', 'T', 'F', 'S', 'S'], 535, 400, 134);
  s += phone(p, 504, 48, c);
  return wrap(s);
}

function approvals() {
  const p = DARK; let s = shell(p, 'Purchase Approvals', ['My team', 'This month'], 0);
  const cols: [string, string, [string, string, string, string][]][] = [
    ['Submitted', p.mute, [['Laptops · 12 units', '€18,400', 'IT', p.c], ['Trade show booth', '€9,750', 'Marketing', p.d], ['Forklift maintenance', '€3,120', 'Ops', p.b]]],
    ['In review', p.b, [['Cloud capacity upgrade', '€7,400 / mo', 'Data', p.a], ['Safety equipment', '€5,280', 'Ops', p.b]]],
    ['Approved', p.ok, [['Annual licences', '€42,000', 'IT', p.c], ['Training programme', '€11,600', 'HR', p.d], ['Warehouse racking', '€26,300', 'Ops', p.b]]],
    ['Paid', p.a, [['Fleet insurance', '€14,900', 'Finance', p.a], ['Office fit-out', '€31,200', 'Admin', p.c]]],
  ];
  cols.forEach(([name, c, cards], ci) => {
    const x = 68 + ci * 180;
    s += rect(x, 58, 170, 426, p.panel, 12, `stroke="${p.line}"`) + `<circle cx="${x + 18}" cy="80" r="4" fill="${c}"/>` + txt(x + 30, 84, name, { fill: p.text, size: 11, weight: 500 }) + txt(x + 156, 84, String(cards.length), { fill: p.mute, size: 10, anchor: 'end', mono: true });
    cards.forEach(([t, amt, team, tc], i) => {
      const y = 100 + i * 108;
      s += rect(x + 10, y, 150, 98, p.bg, 10, `stroke="${p.line}"`) + txt(x + 22, y + 22, t, { fill: p.text, size: 10, weight: 500 }) + txt(x + 22, y + 46, amt, { fill: p.text, size: 15, weight: 600 }) + pill(x + 22, y + 66, team, tc + '26', tc) + `<circle cx="${x + 142}" cy="${y + 75}" r="9" fill="${tc}" opacity=".85"/><circle cx="${x + 128}" cy="${y + 75}" r="9" fill="${p.panel}" stroke="${p.line}"/>`;
    });
  });
  return wrap(s);
}

function portal() {
  const p = LIGHT; let s = rect(0, 0, W, H, p.bg, 0) + rect(0, 0, W, 50, p.panel, 0) + `<line x1="0" x2="${W}" y1="50" y2="50" stroke="${p.line}"/>`;
  s += `<path d="M34 25c-3-5-5.500-7-8.500-7a7 7 0 1 0 0 14c3 0 5.500-2 8.500-7Zm0 0c3 5 5.500 7 8.500 7a7 7 0 1 0 0-14c-3 0-5.500 2-8.500 7Z" fill="none" stroke="${p.a}" stroke-width="2.600" stroke-linecap="round"/>`;
  ['Overview', 'Orders', 'Invoices', 'Support'].forEach((l, i) => (s += txt(80 + i * 76, 30, l, { fill: i === 0 ? p.a : p.mute, size: 11, weight: i === 0 ? 600 : 400 })));
  s += `<circle cx="${W - 34}" cy="25" r="13" fill="${p.a}"/>` + txt(W - 34, 29, 'SK', { size: 9.5, anchor: 'middle', weight: 600 });
  s += txt(28, 86, 'Good morning, Salma', { fill: p.text, size: 20, weight: 600 }) + txt(28, 104, 'Here is what is happening with your account today.', { fill: p.mute, size: 10.5 });
  [['Open orders', '14', p.a], ['In transit', '6', p.c], ['Outstanding', '€82,400', p.b], ['On-time delivery', '96.4%', p.ok]].forEach(([l, v, c], i) => (s += panel(p, 28 + i * 190, 120, 178, 76) + rect(28 + i * 190, 132, 4, 52, c, 2) + txt(46 + i * 190, 146, l, { fill: p.mute, size: 10 }) + txt(46 + i * 190, 176, v, { fill: p.text, size: 21, weight: 600 })));
  s += panel(p, 28, 208, 500, 272, 'Recent orders');
  ['Order', 'Date', 'Amount', 'Status'].forEach((hd, i) => (s += txt([44, 164, 274, 390][i], 254, hd, { fill: p.mute, size: 9 })));
  [['SO-10482', '12 Nov', '€18,240', 'In transit', p.c], ['SO-10479', '11 Nov', '€6,910', 'Processing', p.b], ['SO-10471', '09 Nov', '€31,500', 'Delivered', p.ok], ['SO-10466', '07 Nov', '€4,280', 'Delivered', p.ok], ['SO-10460', '05 Nov', '€12,760', 'Delivered', p.ok], ['SO-10452', '02 Nov', '€9,340', 'Delayed', p.bad]].forEach(([o, d, a, st, c], i) => {
    const y = 284 + i * 32; s += `<line x1="44" x2="512" y1="${y - 19}" y2="${y - 19}" stroke="${p.line}"/>` + txt(44, y, o, { fill: p.text, size: 10.5, weight: 500, mono: true }) + txt(164, y, d, { fill: p.mute, size: 10.5 }) + txt(274, y, a, { fill: p.text, size: 10.5, mono: true }) + pill(390, y - 13, st, c + '22', c, 74);
  });
  s += panel(p, 540, 208, 232, 272, 'Tracking · SO-10482');
  [['Order confirmed', '08 Nov', true], ['Picked and packed', '10 Nov', true], ['Left warehouse', '11 Nov', true], ['Out for delivery', 'Today', false], ['Delivered', 'Est. 13 Nov', false]].forEach(([l, d, done], i) => {
    const y = 252 + i * 44; s += (i < 4 ? `<line x1="564" x2="564" y1="${y + 8}" y2="${y + 36}" stroke="${i < 2 ? p.a : p.line}" stroke-width="2"/>` : '') + `<circle cx="564" cy="${y}" r="7" fill="${done ? p.a : p.panel}" stroke="${done ? p.a : p.mute}" stroke-width="2"${i === 3 ? ' class="pulse"' : ''}/>` + txt(584, y + 1, String(l), { fill: p.text, size: 10.5, weight: done ? 500 : 400 }) + txt(584, y + 15, String(d), { fill: p.mute, size: 9 });
  });
  return wrap(s);
}

/* ------------------------------------------------------------------ */
/* Reusable layouts. Each page gets its own designs by feeding these different content. */

type Tone = 'a' | 'b' | 'c' | 'd' | 'ok' | 'bad' | 'mute';
type Item = [string, number | string, Tone?];
type Blk = [title: string, type: 'hbars' | 'bars' | 'list' | 'donut', data: Item[] | number, tone?: Tone];
type Main = [title: string, type: 'area' | 'bars' | 'lines' | 'stack', seed: number];
const dot = (x: number, y: number, r: number, fill: string, extra = '') => `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${fill}" ${extra}/>`;
const tick = (x: number, y: number, c = '#fff') => `<path d="M${f(x - 4)} ${f(y)}l3 3 5-6" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;

function blk(p: Pal, b: Blk, x: number, y: number, w: number, h: number) {
  const [title, type, data, tone = 'a'] = b; let s = panel(p, x, y, w, h, title);
  if (type === 'bars') return s + bars(series(12, data as number, 40, 16, 2), x + 16, y + 34, w - 32, h - 48, p[tone], 9, p.b);
  const items = data as Item[];
  if (type === 'hbars') return s + hbars(p, items.map(([l, v]) => [l, v as number] as [string, number]), x + 16, y + 34, w - 32, Math.min(24, (h - 40) / items.length), p[tone]);
  if (type === 'donut') {
    const cols = [p.a, p.c, p.b, p.d], cy = y + h / 2 + 10, tot = items.reduce((t, i) => t + (i[1] as number), 0), y0 = cy - items.length * 13;
    s += donut(x + 66, cy, 42, items.map(([, v], i) => [v as number, cols[i % 4]] as [number, string]));
    items.forEach(([l, v], i) => (s += rect(x + 126, y0 + i * 26 + 5, 8, 8, cols[i % 4], 2) + txt(x + 140, y0 + i * 26 + 13, l, { fill: p.text, size: 9.5 }) + txt(x + w - 14, y0 + i * 26 + 13, Math.round(((v as number) / tot) * 100) + '%', { fill: p.mute, size: 9.5, anchor: 'end', mono: true })));
    return s;
  }
  const rh = Math.min(26, (h - 40) / items.length);
  items.forEach(([l, v, t = 'mute'], i) => { const yy = y + 48 + i * rh; s += dot(x + 22, yy - 3.5, 3.5, p[t]) + txt(x + 34, yy, l, { fill: p.text, size: 10 }) + txt(x + w - 16, yy, String(v), { fill: p[t], size: 9.5, anchor: 'end', mono: true }); });
  return s;
}

function chart(p: Pal, m: Main, x: number, y: number, w: number, h: number) {
  const [title, type, seed] = m; let s = panel(p, x, y, w, h, title);
  const gx = x + 20, gy = y + 40, gw = w - 40, gh = h - 80, B = `L${gx + gw} ${gy + gh} L${gx} ${gy + gh} Z`;
  s += grid(p, gx, gy, gw, gh);
  if (type === 'area') {
    const a = series(12, seed, 30, 9, 4), b = a.map((v, i) => v * (0.9 + (i % 3) * 0.04)), lo = Math.min(...a, ...b) - 8, hi = Math.max(...a) * 1.05, pa = pts(a, gx, gy, gw, gh, lo, hi);
    s += `<path d="${line(pa)} ${B}" fill="${p.a}" opacity=".18"/><path class="draw" d="${line(pa)}" fill="none" stroke="${p.a}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:1400;stroke-dashoffset:1400"/>` +
      `<path d="${line(pts(b, gx, gy, gw, gh, lo, hi))}" fill="none" stroke="${p.b}" stroke-width="1.6" stroke-dasharray="4 5"/>`;
  } else if (type === 'bars') {
    s += bars(series(12, seed, 40, 14, 3), gx, gy, gw, gh, p.a, 11, p.b);
    return s + xlabels(p, months, gx + gw / 24, y + h - 18, gw - gw / 12);
  } else if (type === 'lines') {
    const all = [0, 1, 2].map((i) => series(12, seed + i, 30 + i * 6, 12, 3)), lo = Math.min(...all.flat()) - 5, hi = Math.max(...all.flat()) + 5;
    all.forEach((v, i) => (s += `<path d="${line(pts(v, gx, gy, gw, gh, lo, hi))}" fill="none" stroke="${[p.a, p.c, p.b][i]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`));
  } else {
    const a = series(40, seed, 30, 10, 0.2), b = series(40, seed + 1, 22, 7, 0.1), top = a.map((v, i) => v + b[i]), hi = Math.max(...top) * 1.15;
    const pa = pts(b, gx, gy, gw, gh, 0, hi), pb = pts(top, gx, gy, gw, gh, 0, hi);
    s += `<path d="${line(pb)} ${B}" fill="${p.a}" opacity=".35"/><path d="${line(pa)} ${B}" fill="${p.c}" opacity=".45"/><path d="${line(pb)}" fill="none" stroke="${p.a}" stroke-width="1.8"/>`;
  }
  return s + xlabels(p, months, gx, y + h - 18, gw);
}

type DashSpec = { title: string; filters: string[]; light?: boolean; nav?: number; seed: number; kpis: [string, string, string][]; main: Main; side?: Blk; bl: Blk; br: Blk };
function dash(o: DashSpec) {
  const p = o.light ? LIGHT : DARK; let s = shell(p, o.title, o.filters, o.nav ?? 0);
  const n = o.kpis.length, kw = n === 4 ? 170 : 230, st = n === 4 ? 180 : 240, cols = [p.a, p.c, p.b, p.d];
  o.kpis.forEach((q, i) => (s += kpi(p, 68 + i * st, 58, kw, q[0], q[1], q[2], o.seed * 7 + i, cols[i])));
  if (o.side) s += chart(p, o.main, 68, 154, 460, 210) + blk(p, o.side, 538, 154, 246, 210) + blk(p, o.bl, 68, 374, 350, 110) + blk(p, o.br, 428, 374, 356, 110);
  else s += chart(p, o.main, 68, 154, 716, 190) + blk(p, o.bl, 68, 354, 350, 130) + blk(p, o.br, 428, 354, 356, 130);
  return wrap(s);
}

type ChatSpec = { title: string; button: string; recent: string[]; user: string; q: string; intro: string; rows: [string, string, string, Tone][]; lines?: string[]; mono?: boolean; chart?: [string, number[], number, Tone]; tip?: [string, string, string]; pills: string[]; sugg: string[]; ask: string; light?: boolean };
function chat(o: ChatSpec) {
  const p = o.light ? LIGHT : DARK; let s = rect(0, 0, W, H, p.bg, 0) + rect(0, 0, 190, H, p.panel, 0) + `<line x1="190" x2="190" y1="0" y2="${H}" stroke="${p.line}"/>`;
  s += txt(20, 36, o.title, { fill: p.text, size: 15, weight: 600 }) + rect(20, 54, 150, 30, p.a, 9) + txt(95, 73.5, o.button, { size: 10.5, anchor: 'middle', weight: 500 });
  s += txt(20, 114, 'RECENT', { fill: p.mute, size: 8.5, mono: true });
  o.recent.forEach((l, i) => (s += (i === 0 ? rect(12, 124, 166, 26, p.line, 8) : '') + txt(22, 141 + i * 30, l, { fill: i === 0 ? p.text : p.mute, size: 10 })));
  s += rect(20, H - 56, 150, 36, p.bg, 9, `stroke="${p.line}"`) + dot(38, H - 38, 9, p.b) + txt(54, H - 34, o.user, { fill: p.text, size: 10 });
  const qw = o.q.length * 5.7 + 32; s += rect(770 - qw, 30, qw, 34, p.a, 14) + txt(770 - qw + 16, 51.5, o.q, { size: 11 });
  s += dot(222, 98, 11, p.a, 'opacity=".25"') + dot(222, 98, 4, p.a);
  s += panel(p, 242, 82, 528, 300) + txt(260, 108, o.intro, { fill: p.text, size: 11 });
  o.rows.forEach(([l, d, v, c], i) => { const y = 124 + i * 36; s += rect(260, y, 492, 30, p.bg, 8) + dot(276, y + 15, 4, p[c]) + txt(290, y + 19, l, { fill: p.text, size: 10.5, weight: 500 }) + txt(404, y + 19, d, { fill: p.mute, size: 10 }) + txt(740, y + 19, v, { fill: p[c], size: 10.5, anchor: 'end', mono: true }); });
  const top = 124 + o.rows.length * 36 + 8;
  if (o.lines) {
    s += rect(260, top, 492, 340 - top, p.bg, 9, `stroke="${p.line}"`);
    o.lines.forEach((l, i) => (s += txt(274, top + 20 + i * 16, l, { fill: i === 0 ? p.b : l.startsWith('+') ? p.ok : l.startsWith('-') ? p.bad : p.text, size: o.mono ? 9.5 : 10, mono: o.mono, weight: i === 0 ? 500 : 400 })));
  } else if (o.chart) {
    const [ct, vals, hi, tone] = o.chart;
    s += txt(260, top + 12, ct, { fill: p.mute, size: 9.5 }) + bars(vals, 260, top + 20, 300, 304 - top, p.a, hi, p[tone]) + xlabels(p, months.slice(0, vals.length), 260 + 150 / vals.length, 338, 300 - 300 / vals.length);
    if (o.tip) s += rect(580, top + 16, 172, 70, p.bg, 9) + txt(594, top + 36, o.tip[0], { fill: p.mute, size: 9 }) + txt(594, top + 54, o.tip[1], { fill: p.text, size: 10 }) + txt(594, top + 69, o.tip[2], { fill: p.ok, size: 10, weight: 500 });
  }
  let px = 302; s += txt(260, 368, 'Sources', { fill: p.mute, size: 9 });
  o.pills.forEach((l, i) => { const w = l.length * 5.6 + 16; s += pill(px, 355, l, i === o.pills.length - 1 ? p.ok + '26' : p.line, i === o.pills.length - 1 ? p.ok : p.text); px += w + 8; });
  let sx = 242; o.sugg.forEach((l) => { const w = l.length * 5.3 + 26; s += rect(sx, 396, w, 26, 'none', 13, `stroke="${p.line}"`) + txt(sx + w / 2, 413, l, { fill: p.text, size: 9.5, anchor: 'middle' }); sx += w + 10; });
  s += rect(242, 438, 528, 42, p.panel, 14, `stroke="${p.line}"`) + txt(262, 463, o.ask, { fill: p.mute, size: 11 }) + dot(746, 459, 13, p.a) + `<path d="M741 459h10m0 0-4-4m4 4-4 4" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  return wrap(s);
}

type BoardSpec = { title: string; filters: string[]; nav?: number; light?: boolean; cols: [string, Tone, [string, string, string, Tone][]][] };
function board(o: BoardSpec) {
  const p = o.light ? LIGHT : DARK; let s = shell(p, o.title, o.filters, o.nav ?? 0);
  o.cols.forEach(([name, c, cards], ci) => {
    const x = 68 + ci * 180;
    s += rect(x, 58, 170, 426, p.panel, 12, `stroke="${p.line}"`) + dot(x + 18, 80, 4, p[c]) + txt(x + 30, 84, name, { fill: p.text, size: 11, weight: 500 }) + txt(x + 156, 84, String(cards.length), { fill: p.mute, size: 10, anchor: 'end', mono: true });
    cards.forEach(([t, big, tag, tc], i) => {
      const y = 100 + i * 108;
      s += rect(x + 10, y, 150, 98, p.bg, 10, `stroke="${p.line}"`) + txt(x + 22, y + 22, t, { fill: p.text, size: 10, weight: 500 }) + txt(x + 22, y + 46, big, { fill: p.text, size: 15, weight: 600 }) + pill(x + 22, y + 66, tag, p[tc] + '26', p[tc]) + dot(x + 142, y + 75, 9, p[tc], 'opacity=".85"');
    });
  });
  return wrap(s);
}

type FlowSpec = { title: string; filters: string[]; nav?: number; heading: string; sources: [string, string][]; stages: [string, string, Tone][]; outs: [string, string][]; stats: [string, string][]; histTitle: string; listTitle: string; runs: [string, string, string, Tone][] };
function flow(o: FlowSpec) {
  const p = DARK; let s = shell(p, o.title, o.filters, o.nav ?? 1);
  s += panel(p, 68, 58, 716, 226, o.heading);
  const node = (x: number, y: number, l: string, sub: string, c: string, st = p.ok) => rect(x, y, 104, 44, p.bg, 9, `stroke="${c}" stroke-opacity=".7"`) + txt(x + 12, y + 19, l, { fill: p.text, size: l.length > 13 ? 8.6 : 10, weight: 500 }) + txt(x + 12, y + 33, sub, { fill: p.mute, size: sub.length > 15 ? 7 : 8.5, mono: true }) + dot(x + 94, y + 11, 3, st);
  const link = (x1: number, y1: number, x2: number, y2: number, c: string) => `<path class="dash" d="M${x1} ${y1} C${(x1 + x2) / 2} ${y1},${(x1 + x2) / 2} ${y2},${x2} ${y2}" fill="none" stroke="${c}" stroke-width="1.5" opacity=".8"/>`;
  o.sources.forEach(([l, sub], i) => { s += node(84, 92 + i * 47, l, sub, p.mute, i === 3 ? p.b : p.ok) + link(188, 114 + i * 47, 232, 184, p.mute); });
  o.stages.forEach(([l, sub, c], i) => { s += node(232 + i * 140, 162, l, sub, p[c]) + (i < 2 ? link(336 + i * 140, 184, 372 + i * 140, 184, p[c]) : ''); });
  s += link(616, 184, 660, 130, p.a) + link(616, 184, 660, 238, p.a) + node(660, 108, o.outs[0][0], o.outs[0][1], p.a) + node(660, 216, o.outs[1][0], o.outs[1][1], p.a);
  s += panel(p, 68, 294, 350, 190, o.histTitle);
  const r = rng(o.title.length * 13 + o.heading.length); for (let i = 0; i < 28; i++) { const v = r(); const c = v > 0.93 ? p.bad : v > 0.85 ? p.b : p.ok; s += rect(84 + i * 11.5, 400 - 20 - v * 50, 8, 20 + v * 50, c, 3, 'opacity=".85"'); }
  o.stats.forEach(([v, l], i) => (s += txt(84 + i * 116, 432, v, { fill: p.text, size: 21, weight: 600 }) + txt(84 + i * 116, 450, l, { fill: p.mute, size: 9.5 })));
  s += panel(p, 428, 294, 356, 190, o.listTitle);
  o.runs.forEach(([n, st, d, c], i) => { const y = 342 + i * 28; s += `<line x1="444" x2="768" y1="${y - 17}" y2="${y - 17}" stroke="${p.line}"/>` + txt(444, y, n, { fill: p.text, size: 10, mono: true }) + pill(610, y - 13, st, p[c] + '26', p[c], 70) + txt(768, y, d, { fill: p.mute, size: 9.5, anchor: 'end', mono: true }); });
  return wrap(s);
}

type PhonesSpec = { title: string; s1: { title: string; sub: string; items: [string, string, Tone][]; cta: string }; s2: { title: string; step: string; progress: number; toggles: [string, boolean][]; note: string; cta: string }; s3: { title: string; ring: [string, number, string]; t1: [string, string]; t2: [string, string]; barsTitle: string; vals: number[] } };
function phones(o: PhonesSpec) {
  const p = DARK; let s = rect(0, 0, W, H, '#0b0822', 0) + `<circle cx="400" cy="520" r="330" fill="${p.c}" opacity=".12"/><circle cx="120" cy="60" r="160" fill="${p.a}" opacity=".1"/>`;
  let a = txt(118, 100, o.s1.title, { fill: p.text, size: 17, weight: 600 }) + txt(118, 116, o.s1.sub, { fill: p.mute, size: 9 });
  o.s1.items.forEach(([l, d, c], i) => (a += rect(112, 130 + i * 58, 172, 50, p.panel, 12) + rect(112, 130 + i * 58, 4, 50, p[c], 2) + txt(126, 151 + i * 58, l, { fill: p.text, size: 10, weight: 500 }) + txt(126, 167 + i * 58, d, { fill: p.mute, size: 9 }) + `<path d="M270 ${152 + i * 58}l5 5-5 5" stroke="${p.mute}" fill="none" stroke-width="1.5"/>`));
  a += rect(112, 372, 172, 36, p.a, 12) + txt(198, 394.5, o.s1.cta, { size: 10.5, anchor: 'middle', weight: 500 });
  s += phone(p, 100, 48, a);
  let b = txt(320, 100, o.s2.title, { fill: p.text, size: 15, weight: 600 }) + rect(320, 110, 172, 4, p.line, 2) + rect(320, 110, 172 * o.s2.progress, 4, p.a, 2) + txt(320, 130, o.s2.step, { fill: p.mute, size: 9 });
  o.s2.toggles.forEach(([l, on], i) => { b += rect(314, 142 + i * 44, 172, 36, p.panel, 10) + txt(326, 164 + i * 44, l, { fill: p.text, size: 10 }) + rect(446, 151 + i * 44, 30, 17, on ? p.ok : p.line, 9) + dot(on ? 467.5 : 454.5, 159.5 + i * 44, 6.5, '#fff'); });
  b += rect(314, 276, 172, 62, p.panel, 10, `stroke="${p.line}" stroke-dasharray="4 4"`) + txt(400, 311, o.s2.note, { fill: p.mute, size: 9.5, anchor: 'middle' });
  b += rect(314, 348, 172, 22, p.panel, 8) + txt(326, 363, 'Add a note…', { fill: p.mute, size: 9.5 }) + rect(314, 380, 172, 34, p.a, 12) + txt(400, 401.5, o.s2.cta, { size: 10.5, anchor: 'middle', weight: 500 });
  s += phone(p, 302, 28, b);
  const [rl, rv, rd] = o.s3.ring;
  let c = txt(522, 100, o.s3.title, { fill: p.text, size: 17, weight: 600 }) + rect(516, 114, 172, 96, p.panel, 12) + donut(562, 162, 28, [[rv, p.a], [100 - rv, p.line]], 9) + txt(562, 166, rv + '%', { fill: p.text, size: 12, weight: 600, anchor: 'middle' }) + txt(604, 152, rl, { fill: p.mute, size: 9 }) + txt(604, 172, rd, { fill: p.ok, size: 10, weight: 500 });
  c += rect(516, 218, 82, 60, p.panel, 12) + txt(528, 240, o.s3.t1[0], { fill: p.mute, size: 8.5 }) + txt(528, 264, o.s3.t1[1], { fill: p.text, size: 18, weight: 600 }) + rect(606, 218, 82, 60, p.panel, 12) + txt(618, 240, o.s3.t2[0], { fill: p.mute, size: 8.5 }) + txt(618, 264, o.s3.t2[1], { fill: p.b, size: 18, weight: 600 });
  c += rect(516, 286, 172, 122, p.panel, 12) + txt(528, 306, o.s3.barsTitle, { fill: p.mute, size: 9 }) + bars(o.s3.vals, 524, 316, 156, 68, p.a, 3, p.b) + xlabels(p, ['M', 'T', 'W', 'T', 'F', 'S', 'S'], 535, 400, 134);
  s += phone(p, 504, 48, c);
  return wrap(s);
}

type WebSpec = { title: string; light?: boolean; tabs: string[]; initials: string; hello: string; sub: string; tiles: [string, string, Tone][]; tableTitle: string; cols: string[]; rows: [string, string, string, string, Tone][]; sideTitle: string; steps: [string, string, boolean][] };
function web(o: WebSpec) {
  const p = o.light === false ? DARK : LIGHT; let s = rect(0, 0, W, H, p.bg, 0) + rect(0, 0, W, 50, p.panel, 0) + `<line x1="0" x2="${W}" y1="50" y2="50" stroke="${p.line}"/>`;
  s += `<path d="M34 25c-3-5-5.5-7-8.5-7a7 7 0 1 0 0 14c3 0 5.5-2 8.5-7Zm0 0c3 5 5.5 7 8.5 7a7 7 0 1 0 0-14c-3 0-5.5 2-8.5 7Z" fill="none" stroke="${p.a}" stroke-width="2.6" stroke-linecap="round"/>`;
  let tx = 80; o.tabs.forEach((l, i) => { s += txt(tx, 30, l, { fill: i === 0 ? p.a : p.mute, size: 11, weight: i === 0 ? 600 : 400 }); tx += l.length * 6.2 + 26; });
  s += dot(W - 34, 25, 13, p.a) + txt(W - 34, 29, o.initials, { size: 9.5, anchor: 'middle', weight: 600 });
  s += txt(28, 86, o.hello, { fill: p.text, size: 20, weight: 600 }) + txt(28, 104, o.sub, { fill: p.mute, size: 10.5 });
  o.tiles.forEach(([l, v, c], i) => (s += panel(p, 28 + i * 190, 120, 178, 76) + rect(28 + i * 190, 132, 4, 52, p[c], 2) + txt(46 + i * 190, 146, l, { fill: p.mute, size: 10 }) + txt(46 + i * 190, 176, v, { fill: p.text, size: 21, weight: 600 })));
  s += panel(p, 28, 208, 500, 272, o.tableTitle);
  o.cols.forEach((hd, i) => (s += txt([44, 214, 304, 400][i], 254, hd, { fill: p.mute, size: 9 })));
  o.rows.forEach(([a, b, c, st, tone], i) => { const y = 284 + i * 32; s += `<line x1="44" x2="512" y1="${y - 19}" y2="${y - 19}" stroke="${p.line}"/>` + txt(44, y, a, { fill: p.text, size: 10.5, weight: 500 }) + txt(214, y, b, { fill: p.mute, size: 10.5 }) + txt(304, y, c, { fill: p.text, size: 10.5, mono: true }) + pill(400, y - 13, st, p[tone] + '22', p[tone], 84); });
  s += panel(p, 540, 208, 232, 272, o.sideTitle);
  o.steps.forEach(([l, d, done], i) => { const y = 252 + i * 44; s += (i < o.steps.length - 1 ? `<line x1="564" x2="564" y1="${y + 8}" y2="${y + 36}" stroke="${done ? p.a : p.line}" stroke-width="2"/>` : '') + `<circle cx="564" cy="${y}" r="7" fill="${done ? p.a : p.panel}" stroke="${done ? p.a : p.mute}" stroke-width="2"/>` + txt(584, y + 1, l, { fill: p.text, size: 10.5, weight: done ? 500 : 400 }) + txt(584, y + 15, d, { fill: p.mute, size: 9 }); });
  return wrap(s);
}

type CourseSpec = { title: string; filters: string[]; light?: boolean; modules: [string, string][]; done: number; lesson: string; desc: [string, string]; code: string[]; checks: string[]; cta: string; skills: [string, number][] };
function course(o: CourseSpec) {
  const p = o.light ? LIGHT : DARK; let s = shell(p, o.title, o.filters, 3);
  s += panel(p, 68, 58, 230, 426, 'Learning path');
  o.modules.forEach(([n, sub], i) => {
    const y = 96 + i * 62, now = i === o.done, dn = i < o.done;
    s += (now ? rect(78, y - 6, 210, 54, p.bg, 10, `stroke="${p.a}"`) : '') + `<circle cx="98" cy="${y + 20}" r="11" fill="${dn ? p.ok : now ? p.a : 'none'}" stroke="${dn ? p.ok : now ? p.a : p.mute}" stroke-width="1.5"/>` +
      (dn ? tick(98, y + 20) : txt(98, y + 23.5, String(i + 1), { fill: now ? '#fff' : p.mute, size: 9.5, anchor: 'middle', weight: 600 })) + txt(118, y + 17, n, { fill: dn || now ? p.text : p.mute, size: 10.5, weight: 500 }) + txt(118, y + 32, sub, { fill: p.mute, size: 9 });
  });
  s += panel(p, 308, 58, 290, 426, `Module ${o.done + 1} · Hands-on lab`) + txt(324, 108, o.lesson, { fill: p.text, size: 15, weight: 600 });
  o.desc.forEach((d, i) => (s += txt(324, 128 + i * 15, d, { fill: p.mute, size: 10 })));
  const bh = 22 + o.code.length * 17; s += rect(324, 160, 258, bh, p.bg, 10, `stroke="${p.line}"`);
  o.code.forEach((l, i) => (s += txt(336, 181 + i * 17, l, { fill: i === 0 ? p.b : p.text, size: 9, mono: true })));
  const cy0 = 160 + bh + 22; s += txt(324, cy0, 'CHECKS', { fill: p.mute, size: 8.5, mono: true });
  o.checks.forEach((c, i) => (s += dot(332, cy0 + 20 + i * 24, 8, i < o.checks.length - 1 ? p.ok : p.line) + (i < o.checks.length - 1 ? tick(332, cy0 + 20 + i * 24) : '') + txt(348, cy0 + 23.5 + i * 24, c, { fill: p.text, size: 10 })));
  s += rect(324, 436, 258, 34, p.a, 12) + txt(453, 457.5, o.cta, { size: 10.5, anchor: 'middle', weight: 500 });
  const pct = Math.round((o.done / o.modules.length) * 100);
  s += panel(p, 608, 58, 176, 200, 'Progress') + donut(696, 162, 44, [[Math.max(pct, 4), p.a], [100 - pct, p.line]], 11) + txt(696, 168, pct + '%', { fill: p.text, size: 19, weight: 600, anchor: 'middle' }) + txt(696, 240, `${o.done} of ${o.modules.length} modules`, { fill: p.mute, size: 9.5, anchor: 'middle' });
  s += panel(p, 608, 268, 176, 216, 'Skills');
  o.skills.forEach(([l, v], i) => (s += txt(624, 312 + i * 42, l, { fill: p.text, size: 10 }) + txt(768, 312 + i * 42, v + '%', { fill: p.mute, size: 9.5, anchor: 'end', mono: true }) + rect(624, 320 + i * 42, 144, 7, p.line, 3.5) + rect(624, 320 + i * 42, (144 * v) / 100, 7, [p.a, p.c, p.b, p.d][i % 4], 3.5)));
  return wrap(s);
}

type ScoreSpec = { title: string; filters: string[]; light?: boolean; radarTitle: string; overall: string; overallLabel: string; axes: [string, number][]; areasTitle: string; roadTitle: string; steps: [string, string, string, Tone][] };
function score(o: ScoreSpec) {
  const p = o.light ? LIGHT : DARK; let s = shell(p, o.title, o.filters, 2);
  const n = o.axes.length, cx = 233, cy = 292, R = 84, ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n, pt = (i: number, r: number) => `${f(cx + Math.cos(ang(i)) * r)} ${f(cy + Math.sin(ang(i)) * r)}`;
  const poly = (r: (i: number) => number) => o.axes.map((_, i) => `${i ? 'L' : 'M'}${pt(i, r(i))}`).join(' ') + ' Z';
  s += panel(p, 68, 58, 330, 426, o.radarTitle) + txt(84, 118, o.overall, { fill: p.text, size: 26, weight: 600 }) + txt(84, 136, o.overallLabel, { fill: p.mute, size: 9.5 });
  [0.25, 0.5, 0.75, 1].forEach((k) => (s += `<path d="${poly(() => R * k)}" fill="none" stroke="${p.line}"/>`));
  o.axes.forEach(([l], i) => { const c = Math.cos(ang(i)), sn = Math.sin(ang(i)); s += `<line x1="${cx}" y1="${cy}" x2="${f(cx + c * R)}" y2="${f(cy + sn * R)}" stroke="${p.line}"/>` + txt(f(cx + c * (R + 12)), f(cy + sn * (R + 12) + (sn > 0.3 ? 9 : sn < -0.3 ? -2 : 3)), l, { fill: p.mute, size: 9, anchor: Math.abs(c) < 0.3 ? 'middle' : c > 0 ? 'start' : 'end' }); });
  s += `<path d="${poly((i) => R * o.axes[i][1])}" fill="${p.a}" fill-opacity=".25" stroke="${p.a}" stroke-width="2" stroke-linejoin="round"/>`;
  o.axes.forEach(([, v], i) => { const [x, y] = pt(i, R * v).split(' ').map(Number); s += dot(x, y, 3.5, v < 0.5 ? p.bad : v < 0.75 ? p.b : p.a); });
  s += txt(84, 464, `Assessed across ${n} areas`, { fill: p.mute, size: 9 });
  s += panel(p, 408, 58, 376, 200, o.areasTitle);
  const rh = Math.min(27, 152 / n);
  o.axes.forEach(([l, v], i) => { const y = 102 + i * rh, c = v < 0.5 ? p.bad : v < 0.75 ? p.b : p.ok; s += txt(424, y, l, { fill: p.text, size: 10 }) + rect(520, y - 8, 140, 8, p.line, 4) + rect(520, y - 8, 140 * v, 8, c, 4) + txt(692, y, String(Math.round(v * 100)), { fill: p.mute, size: 9.5, anchor: 'end', mono: true }) + pill(708, y - 13, v < 0.5 ? 'Risk' : v < 0.75 ? 'Gap' : 'Ready', c + '26', c, 60); });
  s += panel(p, 408, 268, 376, 216, o.roadTitle);
  o.steps.forEach(([l, when, st, tone], i) => { const y = 314 + i * 42; s += dot(432, y, 10, p.bg, `stroke="${p[tone]}" stroke-width="1.5"`) + txt(432, y + 3.5, String(i + 1), { fill: p.text, size: 9.5, anchor: 'middle', weight: 600 }) + txt(452, y - 1, l, { fill: p.text, size: 10.5, weight: 500 }) + txt(452, y + 13, when, { fill: p.mute, size: 9 }) + pill(700, y - 9, st, p[tone] + '26', p[tone], 68); });
  return wrap(s);
}

/* ------------------------------------------------------------------ */

type Kind = 'dashboard' | 'platform' | 'ai' | 'app';
export type Mock = { title: string; kind: Kind; svg: string };
const D = (o: DashSpec, kind: Kind = 'dashboard'): Mock => ({ title: o.title, kind, svg: dash(o) });
const C = (o: ChatSpec): Mock => ({ title: o.title, kind: 'ai', svg: chat(o) });
const B = (o: BoardSpec, kind: Kind = 'app'): Mock => ({ title: o.title, kind, svg: board(o) });
const F = (o: FlowSpec, kind: Kind = 'platform'): Mock => ({ title: o.title, kind, svg: flow(o) });
const P = (o: PhonesSpec): Mock => ({ title: o.title, kind: 'app', svg: phones(o) });
const Wb = (o: WebSpec): Mock => ({ title: o.title, kind: 'app', svg: web(o) });
const L = (o: CourseSpec): Mock => ({ title: o.title, kind: 'app', svg: course(o) });
const S = (o: ScoreSpec, kind: Kind = 'dashboard'): Mock => ({ title: o.title, kind, svg: score(o) });

const base = {
  exec: { title: 'Executive Overview', kind: 'dashboard', svg: exec() },
  sales: { title: 'Sales Performance', kind: 'dashboard', svg: sales() },
  finance: { title: 'P&L Analysis', kind: 'dashboard', svg: finance() },
  ops: { title: 'Operations Control Tower', kind: 'dashboard', svg: ops() },
  pipeline: { title: 'Pipeline Monitor', kind: 'platform', svg: pipeline() },
  capacity: { title: 'Fabric Capacity & Cost', kind: 'platform', svg: capacity() },
  agent: { title: 'Data Agent', kind: 'ai', svg: agent() },
  forecast: { title: 'Demand Forecast', kind: 'ai', svg: forecast() },
  mobile: { title: 'Field Inspection App', kind: 'app', svg: mobile() },
  approvals: { title: 'Purchase Approvals', kind: 'app', svg: approvals() },
  portal: { title: 'Customer Portal', kind: 'app', svg: portal() },
} satisfies Record<string, Mock>;

/** Which concepts appear on which page. Every design is used on one page only; the home page shows a selection of its own. */
export const showcase: Record<string, Mock[]> = {
  home: [base.exec, base.mobile, base.agent, base.pipeline, base.finance, base.forecast, base.approvals, base.ops],

  'data-platforms': [
    F({ title: 'Ingestion Hub', filters: ['Environment: Prod', 'Today'], heading: 'From source systems to a governed serving layer', sources: [['POS · stores', '3.4M rows'], ['E-commerce', '412k rows'], ['IoT sensors', 'stream'], ['Finance GL', '18 files']], stages: [['Landing', 'raw · 128 tables', 'mute'], ['Curated', 'clean · 74 tables', 'c'], ['Serving', 'marts · 22 tables', 'b']], outs: [['Semantic model', '14 measures'], ['Data API', '6 endpoints']], stats: [['99.6%', 'on-time loads'], ['09m 12s', 'avg duration'], ['486', 'runs today']], histTitle: 'Load history', listTitle: 'Latest loads', runs: [['ld_pos_stores', 'Succeeded', '06m 20s', 'ok'], ['ld_ecom_orders', 'Succeeded', '04m 48s', 'ok'], ['st_iot_sensors', 'Streaming', 'live', 'a'], ['ld_finance_gl', 'Waiting', 'file 17/18', 'b'], ['ld_customers', 'Succeeded', '02m 05s', 'ok']] }),
    D({ title: 'Data Quality Monitor', filters: ['Domain: All', 'Last 30 days'], nav: 2, seed: 3, kpis: [['Quality score', '96.8%', '1.9 pts'], ['Rules passing', '1,284', '4.2%'], ['Open issues', '23', '↓38%'], ['Freshness SLA', '99.1%', '0.6 pts']], main: ['Quality score by domain', 'lines', 71], side: ['Issues by type', 'donut', [['Completeness', 41], ['Validity', 27], ['Duplicates', 19], ['Timeliness', 13]]], bl: ['Failing rules by table', 'hbars', [['dim_customer', 9], ['fact_orders', 6], ['dim_product', 5], ['stg_invoices', 3]], 'd'], br: ['Latest incidents', 'list', [['Null emails in CRM extract', 'Open', 'bad'], ['Late file: supplier prices', 'Watching', 'b'], ['Currency codes normalised', 'Fixed', 'ok']]] }, 'platform'),
    D({ title: 'Platform Cost & Usage', filters: ['Subscription: Data', 'Month to date'], nav: 4, seed: 5, kpis: [['Spend', '€18.6k', '↓14%'], ['Cost per query', '€0.004', '↓21%'], ['Active users', '412', '9.3%']], main: ['Compute and storage consumption', 'stack', 33], bl: ['Spend by workload', 'hbars', [['Ingestion', 62], ['Transformation', 48], ['Reporting', 37], ['Data science', 21]], 'a'], br: ['Savings actions', 'list', [['Auto-pause idle compute', 'Done', 'ok'], ['Archive cold tables to cool tier', 'Done', 'ok'], ['Right-size nightly cluster', 'Planned', 'b']]] }, 'platform'),
  ],

  'apps-development': [
    base.portal,
    P({ title: 'Sales Rep App', s1: { title: 'My visits', sub: '5 customers · 1 priority', items: [['Atlas Pharma', '09:00 · Renewal', 'bad'], ['Nord Distribution', '11:30 · Demo', 'b'], ['Maison Verte', '14:00 · Follow-up', 'c'], ['Sahara Foods', '16:15 · New lead', 'c']], cta: 'Start route' }, s2: { title: 'Atlas Pharma', step: 'Order · 3 of 4', progress: 0.75, toggles: [['Stock checked', true], ['Promo applied', true], ['Needs approval', false]], note: '12 lines · €8,420', cta: 'Send order' }, s3: { title: 'My month', ring: ['Target', 78, '▲ 6 pts'], t1: ['Orders', '64'], t2: ['New leads', '11'], barsTitle: 'Visits per day', vals: [5, 7, 6, 9, 8, 2, 0] } }),
    B({ title: 'HR Requests', filters: ['All teams', 'November'], nav: 2, cols: [['New', 'mute', [['Annual leave · 5 days', 'S. Benali', 'Leave', 'c'], ['Remote work · Fridays', 'J. Martin', 'Policy', 'd'], ['Expense claim', '€340', 'Finance', 'b']]], ['Manager review', 'b', [['Training budget', '€1,200', 'Learning', 'a'], ['Parental leave', 'L. Haddad', 'Leave', 'c']]], ['HR review', 'a', [['Contract change', 'K. Idrissi', 'Contract', 'd'], ['Equipment · laptop', '€1,480', 'IT', 'c']]], ['Done', 'ok', [['Sick leave · 2 days', 'A. Dupont', 'Leave', 'c'], ['Certificate request', 'M. Alaoui', 'Admin', 'b'], ['Expense claim', '€92', 'Finance', 'b']]]] }),
  ],

  'ai-consultancy': [
    C({ title: 'Contract Assistant', button: '+ New review', recent: ['MSA · Nord Distribution', 'NDA · Atlas Pharma', 'Lease renewal · HQ', 'Supplier terms · resin', 'SLA · hosting provider'], user: 'Legal team', q: 'What are the risky clauses in this supplier contract?', intro: 'I found three clauses that differ from your standard terms. Page references are included.', rows: [['Liability cap', 'Capped at 50% of fees, your standard is 100%', 'p. 14', 'bad'], ['Auto-renewal', '24-month renewal, 90 days notice', 'p. 6', 'b'], ['Payment terms', '30 days, your standard is 60', 'p. 9', 'b']], lines: ['Suggested redline · clause 11.2', '- Liability shall not exceed fifty percent (50%) of the fees paid.', '+ Liability shall not exceed one hundred percent (100%) of the fees', '+ paid in the twelve months preceding the claim.', 'Based on 42 previously approved supplier contracts.'], pills: ['Contract library', 'Legal playbook', 'Access: Legal only'], sugg: ['Draft the reply to the supplier', 'Compare with last year', 'Summarise for the CFO'], ask: 'Ask about this contract…' }),
    D({ title: 'Churn Prediction', filters: ['Segment: SMB', 'Next 90 days'], nav: 1, seed: 9, kpis: [['Customers at risk', '184', '↓12%'], ['Revenue at risk', '€1.9M', '↓8%'], ['Model precision', '87%', '3 pts'], ['Saved this quarter', '61', '22%']], main: ['Predicted vs actual churn', 'area', 44], side: ['Risk drivers', 'donut', [['Usage drop', 38], ['Support tickets', 26], ['Late payment', 21], ['Contract end', 15]]], bl: ['Highest risk accounts', 'list', [['Maison Verte', '0.91', 'bad'], ['Nord Distribution', '0.84', 'bad'], ['Atlas Pharma', '0.72', 'b']]], br: ['Risk by plan', 'hbars', [['Starter', 74], ['Team', 58], ['Business', 33], ['Enterprise', 19]], 'd'] }, 'ai'),
    F({ title: 'Agent Orchestration', filters: ['Environment: Prod', 'Last 24h'], nav: 3, heading: 'How a question is routed, grounded and checked', sources: [['Teams chat', '1,240 msgs'], ['Web portal', '860 msgs'], ['Email inbox', '312 msgs'], ['Mobile app', '95 msgs']], stages: [['Router', 'intent · 12 skills', 'a'], ['Retrieval', 'search · 3 indexes', 'c'], ['Guardrails', 'policy · 9 checks', 'b']], outs: [['Answer', 'with citations'], ['Handover', 'to a person']], stats: [['94.1%', 'resolved'], ['2.8s', 'avg response'], ['2,507', 'questions']], histTitle: 'Answer quality', listTitle: 'Latest evaluations', runs: [['groundedness', 'Passed', '0.96', 'ok'], ['answer_relevance', 'Passed', '0.93', 'ok'], ['pii_leak_check', 'Passed', '0 found', 'ok'], ['tone_of_voice', 'Review', '0.81', 'b'], ['latency_p95', 'Passed', '4.1s', 'ok']] }, 'ai'),
  ],

  'ai-readiness': [
    S({ title: 'AI Readiness Scorecard', filters: ['Assessment: 2026', 'Group'], radarTitle: 'Overall readiness', overall: '68 / 100', overallLabel: 'Ready for pilots, not yet for scale', axes: [['Data quality', 0.74], ['Access', 0.62], ['Security', 0.81], ['Governance', 0.46], ['Skills', 0.58], ['Use cases', 0.86]], areasTitle: 'Score by area', roadTitle: 'Recommended roadmap', steps: [['Fix sharing and sensitivity labels', 'Weeks 1 to 3', 'Now', 'bad'], ['Certify the core sales and finance data', 'Weeks 2 to 6', 'Next', 'b'], ['Pilot two use cases with one team', 'Weeks 5 to 10', 'Next', 'b'], ['Train champions and scale', 'From week 10', 'Later', 'mute']] }),
    D({ title: 'Data Estate Inventory', filters: ['All systems', 'Snapshot: Nov'], nav: 1, light: true, seed: 12, kpis: [['Data sources', '47', '6.8%'], ['AI-ready tables', '38%', '11 pts'], ['Sensitive sites', '126', '↓4%'], ['Owners assigned', '71%', '9 pts']], main: ['Documented and certified data over time', 'bars', 52], side: ['Where data lives', 'donut', [['ERP and CRM', 36], ['SharePoint', 29], ['File shares', 22], ['SaaS apps', 13]]], bl: ['Overshared content by site', 'hbars', [['HR documents', 84], ['Finance team', 61], ['Projects', 47], ['Sales', 22]], 'd'], br: ['Blocking gaps', 'list', [['No owner for customer master', 'High', 'bad'], ['Duplicate product codes', 'Medium', 'b'], ['Unlabelled contracts library', 'High', 'bad']]] }),
    B({ title: 'AI Use-case Backlog', filters: ['Ranked by value', 'All functions'], nav: 3, cols: [['Ideas', 'mute', [['Invoice matching', 'Value: high', 'Finance', 'b'], ['Tender summaries', 'Value: medium', 'Sales', 'c'], ['CV screening notes', 'Value: low', 'HR', 'd']]], ['Assessing', 'b', [['Customer email triage', 'Effort: low', 'Service', 'a'], ['Demand forecasting', 'Effort: medium', 'Supply', 'c']]], ['Pilot', 'a', [['Sales meeting prep', '18 users', 'Sales', 'c'], ['Policy Q&A agent', '40 users', 'HR', 'd']]], ['Live', 'ok', [['Contract review', '6 hrs saved/wk', 'Legal', 'a'], ['Report narratives', '4 hrs saved/wk', 'Finance', 'b']]]] }, 'ai'),
  ],

  'ai-adoption': [
    D({ title: 'Copilot Adoption', filters: ['All departments', 'Last 8 weeks'], nav: 0, seed: 15, kpis: [['Active users', '612', '18.4%'], ['Weekly active', '74%', '9 pts'], ['Hours saved', '1,940', '26%'], ['Licences unused', '38', '↓41%']], main: ['Weekly active users vs licences', 'area', 61], side: ['Usage by app', 'donut', [['Teams', 34], ['Outlook', 27], ['Word', 22], ['Excel', 17]]], bl: ['Adoption by department', 'hbars', [['Sales', 88], ['Finance', 76], ['Operations', 59], ['HR', 52]], 'c'], br: ['Top prompts this week', 'list', [['Summarise this meeting', '2,140', 'a'], ['Draft a reply to this email', '1,865', 'a'], ['Explain this spreadsheet', '912', 'a']]] }, 'ai'),
    B({ title: 'Adoption Waves', filters: ['Programme: Copilot', 'Q4'], nav: 1, cols: [['Preparing', 'mute', [['Wave 4 · Operations', '140 people', 'Dec', 'b'], ['Wave 5 · Plants', '210 people', 'Jan', 'b']]], ['Onboarding', 'b', [['Wave 3 · Finance', '85 people', 'Week 2', 'a'], ['Champions cohort 2', '24 people', 'Week 1', 'd']]], ['Embedded', 'a', [['Wave 2 · Sales', '120 people', '71% weekly', 'c'], ['Wave 1 · Leadership', '32 people', '88% weekly', 'c']]], ['Measured', 'ok', [['Meeting notes', '3.1 hrs/wk', 'Saved', 'ok'], ['Proposal drafts', '2.4 hrs/wk', 'Saved', 'ok'], ['Email triage', '1.6 hrs/wk', 'Saved', 'ok']]]] }),
    Wb({ title: 'AI Champions Hub', tabs: ['Overview', 'Playbooks', 'Office hours', 'Policy'], initials: 'YB', hello: 'Welcome back, Yasmine', sub: 'Your team used AI on 412 tasks this week. Here is what to share next.', tiles: [['Champions', '36', 'a'], ['Playbooks', '48', 'c'], ['Questions open', '7', 'b'], ['Satisfaction', '4.6 / 5', 'ok']], tableTitle: 'Most used playbooks', cols: ['Playbook', 'Team', 'Uses', 'Status'], rows: [['Meeting to action list', 'All', '1,204', 'Approved', 'ok'], ['Tender first draft', 'Sales', '386', 'Approved', 'ok'], ['Month-end commentary', 'Finance', '241', 'Approved', 'ok'], ['Job description', 'HR', '118', 'In review', 'b'], ['Supplier comparison', 'Purchasing', '97', 'Approved', 'ok'], ['Incident summary', 'Operations', '64', 'Draft', 'mute']], sideTitle: 'This month', steps: [['Kick-off with leadership', '03 Nov', true], ['Champions training', '10 Nov', true], ['Finance wave goes live', '17 Nov', true], ['Usage review', '28 Nov', false], ['Operations wave', '08 Dec', false]] }),
  ],

  'microsoft-fabric': [
    base.capacity,
    F({ title: 'Real-Time Intelligence', filters: ['Workspace: Operations', '● Live'], nav: 2, heading: 'Events to decisions in seconds', sources: [['Eventstream', '4.2k ev/s'], ['IoT Hub', '860 devices'], ['Clickstream', '1.1k ev/s'], ['Orders API', 'webhook']], stages: [['Eventhouse', 'KQL · 9 tables', 'a'], ['Transform', 'update policies', 'c'], ['Activator', '14 rules', 'b']], outs: [['Live dashboard', '5s refresh'], ['Teams alerts', '3 channels']], stats: [['1.8s', 'end-to-end'], ['5.3k/s', 'events'], ['27', 'alerts today']], histTitle: 'Event throughput', listTitle: 'Triggered rules', runs: [['temp_above_threshold', 'Fired', 'Line 3', 'bad'], ['order_spike_detected', 'Fired', 'Web shop', 'b'], ['device_offline', 'Resolved', 'Depot 4', 'ok'], ['stock_below_min', 'Fired', 'SKU 4471', 'b'], ['latency_sla', 'Healthy', '1.8s', 'ok']] }),
    D({ title: 'Workspace Governance', filters: ['Tenant', 'Last 30 days'], nav: 3, seed: 18, kpis: [['Workspaces', '64', '4.9%'], ['Certified items', '212', '17%'], ['Sensitivity labelled', '89%', '12 pts']], main: ['Items created by type', 'lines', 23], side: ['Items by domain', 'donut', [['Finance', 33], ['Sales', 28], ['Supply chain', 24], ['HR', 15]]], bl: ['Unused items by workspace', 'hbars', [['Sandbox', 46], ['Marketing', 31], ['Legacy BI', 27], ['Projects', 12]], 'b'], br: ['Policy checks', 'list', [['External sharing disabled', 'Pass', 'ok'], ['Workspaces without owner', '3 found', 'b'], ['Unlabelled lakehouses', '5 found', 'b']]] }, 'platform'),
  ],

  'power-bi': [
    base.sales,
    D({ title: 'Supply Chain Overview', filters: ['Network: EMEA', 'Week 46'], nav: 1, seed: 21, kpis: [['On-time in full', '93.7%', '2.2 pts'], ['Stock cover', '34 days', '↓6%'], ['Backorders', '412', '↓18%'], ['Freight cost', '€1.2M', '↓5%']], main: ['Inbound vs outbound volume', 'area', 37], side: ['Stock by warehouse', 'donut', [['Casablanca', 38], ['Lyon', 27], ['Rotterdam', 21], ['Tunis', 14]]], bl: ['Late deliveries by carrier', 'hbars', [['Carrier A', 48], ['Carrier B', 31], ['Carrier C', 17], ['Carrier D', 9]], 'd'], br: ['Units shipped by month', 'bars', 14] }),
    D({ title: 'HR Analytics', filters: ['Group', 'YTD 2026'], nav: 4, light: true, seed: 24, kpis: [['Headcount', '1,486', '5.2%'], ['Turnover', '8.4%', '↓1.3 pts'], ['Time to hire', '36 days', '↓11%'], ['Engagement', '7.8 / 10', '0.4 pts']], main: ['Hires and leavers by month', 'bars', 29], side: ['Headcount by function', 'donut', [['Operations', 44], ['Sales', 23], ['Tech', 19], ['Support', 14]]], bl: ['Absence rate by site', 'hbars', [['Plant 1', 62], ['Plant 2', 48], ['HQ', 27], ['Remote', 14]], 'b'], br: ['Open positions', 'list', [['Data engineer', '21 days', 'a'], ['Plant supervisor', '48 days', 'b'], ['Key account manager', '12 days', 'a']]] }),
  ],

  'microsoft-azure': [
    D({ title: 'Azure Cost Management', filters: ['All subscriptions', 'Month to date'], nav: 4, seed: 27, kpis: [['Spend', '€24.8k', '↓9%'], ['Forecast', '€31.2k', '↓6%'], ['Budget used', '62%', '↓3 pts']], main: ['Daily cost by service group', 'stack', 47], bl: ['Cost by resource group', 'hbars', [['rg-apps-prod', 96], ['rg-data-prod', 81], ['rg-shared', 34], ['rg-dev', 22]], 'a'], br: ['Advisor recommendations', 'list', [['Reserve App Service plan · 1 yr', '−€310/mo', 'ok'], ['Shut down dev VMs at night', '−€180/mo', 'ok'], ['Move logs to archive tier', '−€95/mo', 'ok']]] }, 'platform'),
    F({ title: 'Application Architecture', filters: ['Region: West Europe', 'Prod'], nav: 0, heading: 'A secure, scalable app on Azure', sources: [['Web app', 'React'], ['Mobile app', 'iOS · Android'], ['Partner API', 'OAuth 2.0'], ['Admin portal', 'Entra ID']], stages: [['API gateway', '24 APIs', 'a'], ['App Service', '3 instances', 'c'], ['Azure SQL', 'zone redundant', 'b']], outs: [['Key Vault', '18 secrets'], ['Monitor', 'logs · alerts']], stats: [['99.98%', 'availability'], ['182ms', 'p95 latency'], ['1.4M', 'requests']], histTitle: 'Deployments', listTitle: 'Release pipeline', runs: [['build · api', 'Succeeded', '03m 12s', 'ok'], ['tests · 412 cases', 'Succeeded', '05m 40s', 'ok'], ['deploy · staging', 'Succeeded', '02m 06s', 'ok'], ['approval · prod', 'Waiting', '1 reviewer', 'b'], ['deploy · prod', 'Queued', '—', 'mute']] }),
    D({ title: 'Application Health', filters: ['● Live', 'App: Orders'], nav: 2, seed: 30, kpis: [['Availability', '99.98%', '0.02 pts'], ['Response time', '182ms', '↓14%'], ['Error rate', '0.12%', '↓0.3 pts'], ['Active users', '3,214', '11%']], main: ['Requests and response time', 'lines', 58], side: ['Requests by client', 'donut', [['Web', 52], ['Mobile', 31], ['Partner API', 12], ['Admin', 5]]], bl: ['Slowest endpoints (ms)', 'hbars', [['/orders/search', 412], ['/reports/export', 388], ['/customers', 164], ['/auth/token', 92]], 'b'], br: ['Open alerts', 'list', [['SQL DTU above 80% for 10 min', 'Warning', 'b'], ['Certificate expires in 21 days', 'Info', 'a'], ['Failed logins spike', 'Resolved', 'ok']]] }, 'app'),
  ],

  'sales-forecasting': [
    D({ title: 'Forecast Accuracy', filters: ['Category: All', 'Rolling 12 months'], nav: 2, seed: 42, kpis: [['Accuracy', '93.8%', '4.1 pts'], ['Bias', '+1.2%', '↓2.4 pts'], ['Stock-outs', '14', '↓36%'], ['Excess stock', '€0.8M', '↓19%']], main: ['Forecast vs actual sales', 'area', 97], side: ['Error by category', 'donut', [['Seasonal', 39], ['New products', 28], ['Promotions', 21], ['Core range', 12]]], bl: ['Accuracy by region (%)', 'hbars', [['Europe', 96], ['North America', 94], ['MENA', 91], ['Africa', 88]], 'c'], br: ['Model notes', 'list', [['Ramadan calendar added', '+2.1 pts', 'ok'], ['Weather signal for seasonal', '+0.9 pts', 'ok'], ['New store openings', 'In test', 'a']]] }, 'ai'),
    D({ title: 'Inventory Planning', filters: ['Warehouse: All', 'Next 8 weeks'], nav: 3, seed: 45, kpis: [['Stock cover', '31 days', '↓9%'], ['Reorder alerts', '27', '↓22%'], ['Service level', '97.2%', '1.4 pts']], main: ['Projected stock versus demand', 'stack', 77], bl: ['Reorder now (units)', 'hbars', [['SKU 4471', 840], ['SKU 2093', 620], ['SKU 7718', 410], ['SKU 1156', 260]], 'b'], br: ['Planner actions', 'list', [['Bring forward PO 8841 by 1 week', 'Suggested', 'a'], ['Reduce safety stock · slow movers', 'Suggested', 'a'], ['Transfer Lyon to Casablanca', 'Approved', 'ok']]] }, 'ai'),
    D({ title: 'Pipeline Forecast', filters: ['Team: All', 'Quarter: Q4'], nav: 1, light: true, seed: 48, kpis: [['Forecast', '€8.4M', '6.3%'], ['Committed', '€5.1M', '11%'], ['Gap to target', '€0.6M', '↓28%'], ['Confidence', '82%', '5 pts']], main: ['Weighted pipeline by close month', 'bars', 35], side: ['Forecast by stage', 'donut', [['Commit', 46], ['Best case', 29], ['Pipeline', 17], ['Upside', 8]]], bl: ['Deals most likely to slip', 'list', [['Atlas Pharma · renewal', '62%', 'b'], ['Nord Distribution · new', '48%', 'bad'], ['Sahara Foods · upsell', '71%', 'b']]], br: ['Forecast by rep (€k)', 'hbars', [['Salma K.', 1840], ['Youssef B.', 1620], ['Claire D.', 1390], ['Amine R.', 1105]], 'a'] }, 'ai'),
  ],

  'ai-agents': [
    C({ title: 'HR Policy Agent', button: '+ New question', recent: ['Parental leave rules', 'Remote work abroad', 'Expense limits', 'Notice period', 'Training budget'], user: 'Employee · Operations', q: 'How many days of parental leave do I get, and how do I request it?', intro: 'Based on the current HR policy (updated September), here is what applies to you:', rows: [['Entitlement', '14 weeks paid, plus 4 optional weeks unpaid', 'policy 4.2', 'a'], ['Notice', 'Tell your manager at least 8 weeks before', 'policy 4.5', 'b'], ['Request', 'Submit the form in the HR portal, I can pre-fill it', '2 min', 'ok']], lines: ['Pre-filled request, ready for your review', 'Type: Parental leave      Start: 02 February      Duration: 14 weeks', 'Manager: K. Idrissi        Cover: to be agreed', 'Nothing is sent until you confirm.'], pills: ['HR policy handbook', 'Your contract', 'Only you can see this'], sugg: ['Open the form', 'What about pay?', 'Talk to HR'], ask: 'Ask an HR question…', light: true }),
    C({ title: 'Supply Chain Agent', button: '+ New question', recent: ['Late deliveries this week', 'Stock cover by warehouse', 'Carrier performance', 'Open purchase orders', 'Supplier risk'], user: 'Planning team', q: 'Which deliveries are at risk this week and why?', intro: 'Seven deliveries are at risk, worth €212k. Three causes explain all of them:', rows: [['Port congestion', 'Tangier Med, 4 containers delayed 3 days', '€128k', 'bad'], ['Supplier delay', 'Resin shipment moved to next week', '€61k', 'b'], ['Missing paperwork', 'Customs documents for 2 orders', '€23k', 'b']], chart: ['Late deliveries by week', [6, 4, 5, 3, 4, 2, 3, 7], 7, 'bad'], tip: ['Suggested action', 'Reroute 2 containers', 'via Casablanca: −2 days'], pills: ['Logistics lakehouse', 'Carrier feeds', 'Live data · 4 min ago'], sugg: ['Notify the customers', 'Show by carrier', 'Create tasks'], ask: 'Ask about your supply chain…' }),
    D({ title: 'Agent Analytics', filters: ['All agents', 'Last 30 days'], nav: 3, seed: 51, kpis: [['Questions answered', '18,420', '31%'], ['Resolved without help', '86%', '7 pts'], ['Avg response', '2.4s', '↓18%'], ['Satisfaction', '4.6 / 5', '0.3 pts']], main: ['Questions per day by agent', 'lines', 88], side: ['Questions by topic', 'donut', [['HR and policy', 34], ['Orders', 29], ['Finance', 22], ['IT help', 15]]], bl: ['Handed to a person (%)', 'hbars', [['Finance', 21], ['Orders', 14], ['IT help', 11], ['HR and policy', 8]], 'd'], br: ['Quality checks', 'list', [['Answers with a source', '99.2%', 'ok'], ['Blocked by guardrails', '142', 'b'], ['Flagged for review', '37', 'a']]] }, 'ai'),
  ],

  'executive-dashboards': [
    D({ title: 'CEO Scorecard', filters: ['Group', 'October 2026'], nav: 0, light: true, seed: 54, kpis: [['Revenue', '€62.4M', '9.6%'], ['EBITDA margin', '18.2%', '1.1 pts'], ['Cash', '€21.7M', '4.3%'], ['NPS', '54', '6 pts']], main: ['Revenue vs plan', 'area', 12], side: ['Revenue by business', 'donut', [['Industrial', 37], ['Retail', 28], ['Services', 22], ['Export', 13]]], bl: ['Strategic priorities', 'list', [['Open two new markets', 'On track', 'ok'], ['Digital sales to 30%', 'At risk', 'b'], ['Cut delivery time by 20%', 'On track', 'ok']]], br: ['Margin by business (%)', 'hbars', [['Services', 31], ['Industrial', 22], ['Export', 17], ['Retail', 12]], 'c'] }),
    D({ title: 'Group Performance', filters: ['All subsidiaries', 'YTD'], nav: 1, seed: 57, kpis: [['Group revenue', '€412M', '7.8%'], ['Operating profit', '€46.3M', '10.2%'], ['Headcount', '3,860', '3.4%']], main: ['Revenue by subsidiary over time', 'lines', 16], bl: ['Revenue by country (€M)', 'hbars', [['Morocco', 148], ['France', 121], ['Canada', 84], ['Senegal', 59]], 'a'], br: ['Board watch list', 'list', [['Canada: margin below plan', '−2.1 pts', 'bad'], ['Senegal: growth ahead', '+14%', 'ok'], ['France: churn rising', '+0.8 pts', 'b']]] }),
    P({ title: 'Executive Mobile View', s1: { title: 'This morning', sub: '4 things need your attention', items: [['Revenue vs plan', '+3.2% this month', 'c'], ['Cash position', '€21.7M · stable', 'c'], ['Canada margin', '2.1 pts below plan', 'bad'], ['Top deal', 'Atlas Pharma · €1.4M', 'b']], cta: 'Open full scorecard' }, s2: { title: 'Alerts', step: 'Notify me when', progress: 1, toggles: [['Margin below plan', true], ['Cash under €15M', true], ['Daily summary', false]], note: 'Delivered at 07:30', cta: 'Save' }, s3: { title: 'Quarter', ring: ['Plan achieved', 91, '▲ 3 pts'], t1: ['Revenue', '€62M'], t2: ['At risk', '2'], barsTitle: 'Orders this week', vals: [14, 18, 16, 21, 19, 6, 3] } }),
  ],

  'finance-dashboards': [
    D({ title: 'Cash Flow Forecast', filters: ['Entity: Group', '13 weeks'], nav: 2, seed: 60, kpis: [['Cash today', '€12.1M', '3.8%'], ['Lowest point', '€8.4M', '-6%'], ['DSO', '47 days', '↓5 days'], ['Covenant headroom', '31%', '4 pts']], main: ['Cash balance: actual and forecast', 'area', 26], side: ['Outflows by type', 'donut', [['Suppliers', 46], ['Payroll', 31], ['Tax', 14], ['Capex', 9]]], bl: ['Largest receipts due', 'list', [['Atlas Pharma', '€420k', 'ok'], ['Nord Distribution', '€310k', 'b'], ['Maison Verte', '€185k', 'bad']]], br: ['Weekly net cash flow', 'bars', 41] }),
    D({ title: 'Budget vs Actual', filters: ['Cost centre: All', 'October'], nav: 1, light: true, seed: 63, kpis: [['Revenue vs budget', '+2.4%', '2.4%'], ['Opex vs budget', '−1.8%', '↓1.8%'], ['Forecast FY', '€44.2M', '1.6%']], main: ['Actual, budget and forecast by month', 'lines', 73], side: ['Opex by nature', 'donut', [['Staff', 52], ['IT', 18], ['Marketing', 16], ['Travel', 14]]], bl: ['Over budget (€k)', 'hbars', [['Marketing', 84], ['IT projects', 61], ['Logistics', 37], ['Facilities', 12]], 'd'], br: ['Commentary', 'list', [['Marketing: trade show moved to Q4', 'Timing', 'a'], ['IT: licence true-up', 'One-off', 'b'], ['Staff: hiring behind plan', 'Saving', 'ok']]] }),
    D({ title: 'Receivables Ageing', filters: ['All customers', 'As of today'], nav: 3, seed: 66, kpis: [['Outstanding', '€6.8M', '↓4.2%'], ['Overdue', '€1.3M', '↓11%'], ['Over 90 days', '€240k', '↓23%']], main: ['Overdue balance by week', 'bars', 68], bl: ['Ageing buckets (€k)', 'hbars', [['Not due', 5480], ['1 to 30 days', 720], ['31 to 90 days', 360], ['Over 90 days', 240]], 'a'], br: ['Collection priorities', 'list', [['Maison Verte · 3 invoices', '€185k', 'bad'], ['Sahara Foods · disputed', '€96k', 'b'], ['Nord Distribution · promise to pay', '€74k', 'ok']]] }),
  ],

  'fabric-jumpstart': [
    S({ title: 'Fabric Readiness', filters: ['Jumpstart · week 1', 'Current state'], radarTitle: 'Where you start from', overall: '61 / 100', overallLabel: 'Good foundations, three gaps to close', axes: [['Sources', 0.78], ['Modelling', 0.66], ['Security', 0.52], ['Capacity', 0.44], ['Skills', 0.57], ['Governance', 0.7]], areasTitle: 'Readiness by area', roadTitle: 'Four-step jumpstart', steps: [['Size and set up the capacity', 'Step 1', 'Done', 'ok'], ['Land two priority sources in OneLake', 'Step 2', 'Now', 'a'], ['Build the first gold model and report', 'Step 3', 'Next', 'b'], ['Handover, runbook and training', 'Step 4', 'Later', 'mute']] }, 'platform'),
    B({ title: 'Jumpstart Plan', filters: ['Sprint board', 'Fixed scope'], nav: 1, cols: [['Discover', 'ok', [['Source inventory', '12 systems', 'Done', 'ok'], ['Security design', 'Workspaces', 'Done', 'ok'], ['Capacity sizing', 'F64', 'Done', 'ok']]], ['Build', 'a', [['ERP ingestion', '18 tables', 'Pipeline', 'a'], ['CRM ingestion', '9 tables', 'Pipeline', 'a'], ['Sales gold model', '31 measures', 'Model', 'c']]], ['Validate', 'b', [['Reconcile to finance', '99.97%', 'Testing', 'b'], ['Performance test', '0.6s visuals', 'Testing', 'b']]], ['Handover', 'mute', [['Runbook', '24 pages', 'Docs', 'd'], ['Team training', '2 days', 'Enablement', 'd']]]] }, 'platform'),
    D({ title: 'Migration Tracker', filters: ['From: legacy BI', 'To: Fabric'], nav: 4, seed: 69, kpis: [['Reports migrated', '64 / 90', '18%'], ['Refresh time', '11 min', '↓72%'], ['Legacy cost removed', '€9.2k/mo', '41%']], main: ['Reports migrated per week', 'bars', 55], bl: ['Remaining by team', 'hbars', [['Finance', 11], ['Sales', 8], ['Supply chain', 5], ['HR', 2]], 'b'], br: ['Cut-over checklist', 'list', [['Numbers reconciled with old reports', 'Done', 'ok'], ['Users retrained on new workspace', 'In progress', 'a'], ['Legacy server switched off', '15 Dec', 'b']]] }, 'platform'),
  ],

  'power-bi-health-check': [
    S({ title: 'Power BI Health Score', filters: ['Tenant audit', '312 reports'], radarTitle: 'Overall health', overall: '58 / 100', overallLabel: 'Works, but slow and costly to run', axes: [['Performance', 0.42], ['Data models', 0.55], ['Governance', 0.48], ['Security', 0.76], ['Adoption', 0.68], ['Cost', 0.58]], areasTitle: 'Health by area', roadTitle: 'Prioritised action plan', steps: [['Fix the 12 slowest reports', 'Quick win · 1 week', 'High', 'bad'], ['Replace 40 duplicate datasets', '2 to 4 weeks', 'High', 'bad'], ['Introduce certified models', '4 to 6 weeks', 'Medium', 'b'], ['Archive 96 unused reports', 'Quick win · 2 days', 'Easy', 'ok']] }),
    D({ title: 'Report Performance', filters: ['All workspaces', 'Last 14 days'], nav: 2, seed: 72, kpis: [['Avg load time', '6.8s', '↓12%'], ['Reports over 10s', '37', '↓21%'], ['Heavy DAX queries', '214', '↓9%'], ['Unused reports', '96', '↓4%']], main: ['Load time before and after tuning', 'area', 49], side: ['Cause of slow visuals', 'donut', [['DAX measures', 41], ['Model size', 27], ['Visual count', 19], ['Source queries', 13]]], bl: ['Slowest reports (s)', 'hbars', [['Sales detail', 24], ['Stock by SKU', 19], ['Group P&L', 14], ['HR overview', 11]], 'd'], br: ['Fixes applied', 'list', [['Star schema for Sales detail', '24s to 3s', 'ok'], ['Aggregations on stock table', '19s to 4s', 'ok'], ['Removed bidirectional filters', '−31% CPU', 'ok']]] }),
    D({ title: 'Refresh Reliability', filters: ['Capacity: P1', 'Last 30 days'], nav: 4, light: true, seed: 75, kpis: [['Refresh success', '91.4%', '-3.2%'], ['Failed refreshes', '148', '↓18%'], ['Avg refresh time', '14 min', '↓9%']], main: ['Refresh load across the day', 'stack', 13], bl: ['Failures by cause', 'hbars', [['Gateway timeout', 61], ['Credentials', 38], ['Memory limit', 31], ['Source offline', 18]], 'b'], br: ['Recommendations', 'list', [['Stagger the 06:00 refresh window', 'High impact', 'bad'], ['Move 8 models to incremental', 'High impact', 'bad'], ['Add a second gateway node', 'Medium', 'b']]] }),
  ],
};
