// Даты хранятся строками 'YYYY-MM-DD' в локальном времени.

export const pad = (n) => String(n).padStart(2, '0');

export function dateStr(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

export function today() {
  return dateStr(new Date());
}

export function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(n, from) {
  const d = from ? parseDate(from) : new Date();
  d.setDate(d.getDate() + n);
  return dateStr(d);
}

/** Последние n дней, от старого к сегодняшнему. */
export function lastDays(n) {
  const out = [];
  for (let k = n - 1; k >= 0; k--) out.push(addDays(-k));
  return out;
}

export function daysAgo(ts) {
  return Math.floor((Date.now() - ts) / 86400000);
}

export function fmtDate(s) {
  if (!s) return '';
  if (s === today()) return 'сегодня';
  if (s === addDays(1)) return 'завтра';
  if (s === addDays(-1)) return 'вчера';
  const dt = parseDate(s);
  const opts = { day: 'numeric', month: 'short' };
  if (dt.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
  return dt.toLocaleDateString('ru-RU', opts);
}

export function fmtLong(s) {
  return parseDate(s).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** 'HH:MM' из ISO-строки вида 2026-11-15T23:40. */
export function hm(iso) {
  return iso ? String(iso).slice(11, 16) : '';
}

export function fmtHours(h) {
  const m = Math.round(h * 60);
  return Math.floor(m / 60) + ' ч ' + pad(m % 60) + ' мин';
}
