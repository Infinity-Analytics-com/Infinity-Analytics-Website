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

export type MockId = 'exec' | 'sales' | 'finance' | 'ops' | 'pipeline' | 'capacity' | 'agent' | 'forecast' | 'mobile' | 'approvals' | 'portal';
export const mocks: Record<MockId, { title: string; kind: 'dashboard' | 'platform' | 'ai' | 'app'; svg: string }> = {
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
};

/** Which concepts appear on which page. */
export const showcaseFor: Record<string, MockId[]> = {
  home: ['exec', 'mobile', 'agent', 'pipeline', 'finance', 'forecast', 'approvals', 'ops'],
  'data-platforms': ['pipeline', 'capacity', 'ops'],
  'apps-development': ['mobile', 'approvals', 'portal'],
  'microsoft-fabric': ['capacity', 'pipeline', 'exec'],
  'power-bi': ['exec', 'sales', 'finance', 'ops'],
  'microsoft-azure': ['portal', 'pipeline', 'mobile'],
  'ai-consultancy': ['agent', 'forecast', 'sales'],
  training: ['exec', 'finance', 'capacity'],
  'power-bi-training': ['exec', 'sales', 'finance'],
  'fabric-training': ['pipeline', 'capacity', 'exec'],
  'microsoft-365-training': ['approvals', 'portal', 'mobile'],
  'sales-forecasting': ['forecast', 'sales', 'exec'],
  'ai-agents': ['agent', 'forecast', 'approvals'],
  'executive-cockpit': ['exec', 'ops', 'finance'],
  'finance-analytics': ['finance', 'forecast', 'exec'],
  'fabric-jumpstart': ['pipeline', 'capacity', 'exec'],
  'power-bi-health-check': ['capacity', 'sales', 'exec'],
};
