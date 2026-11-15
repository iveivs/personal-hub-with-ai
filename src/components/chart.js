// Столбчатая диаграмма с накоплением (SVG), без библиотек.

import { fmtDate, parseDate, today } from '../lib/dates.js';
import { esc } from '../lib/dom.js';

/** «Круглый» шаг сетки: 1, 2, 5, 10 × 10ⁿ. */
function niceStep(v) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

/** Подписи оси X для списка дат: число месяца, сегодняшний день выделен. */
export function dayLabels(days) {
  const t = today();
  return days.map((d) => ({ short: String(parseDate(d).getDate()), title: fmtDate(d), today: d === t }));
}

/**
 * @param {{short: string, title: string, today?: boolean}[]} labels
 * @param {{name: string, color: string, values: number[]}[]} series
 * @param {(v: number) => string} unitFmt
 */
export function barChart(labels, series, unitFmt) {
  const W = 640;
  const H = 200;
  const L = 36;
  const R = 8;
  const T = 10;
  const B = 24;
  const n = labels.length;
  const totals = labels.map((_, k) => series.reduce((t, s) => t + (s.values[k] || 0), 0));
  const maxV = Math.max(0, ...totals);
  const step = niceStep((maxV || 1) / 4);
  const top = Math.max(step, Math.ceil(maxV / step) * step);
  const y = (v) => T + (H - T - B) * (1 - v / top);
  const slot = (W - L - R) / n;
  const bw = Math.min(28, slot * 0.62);

  let g = '';
  for (let v = 0; v <= top + 1e-9; v += step) {
    g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--border)" stroke-width="1"/>`;
    g += `<text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${esc(unitFmt(v))}</text>`;
  }
  labels.forEach((lab, k) => {
    const x = L + slot * k + (slot - bw) / 2;
    let acc = 0;
    series.forEach((s) => {
      const v = s.values[k] || 0;
      if (v <= 0) return;
      g += `<rect x="${x}" y="${y(acc + v)}" width="${bw}" height="${Math.max(0, y(acc) - y(acc + v))}" rx="3" fill="${s.color}"><title>${esc(lab.title)}: ${esc(s.name)} ${esc(unitFmt(v))}</title></rect>`;
      acc += v;
    });
    g += `<text x="${x + bw / 2}" y="${H - 7}" text-anchor="middle"${lab.today ? ' style="fill:var(--text);font-weight:700"' : ''}>${esc(lab.short)}</text>`;
  });
  const legend =
    series.length > 1
      ? `<div class="legend">${series.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`
      : '';
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="График">${g}</svg></div>${legend}`;
}
