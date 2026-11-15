import { ENERGY, TIMES } from '../config.js';

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/** Русское склонение: plural(3, 'день', 'дня', 'дней') → 'дня'. */
export function plural(n, one, few, many) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}

/** Число из пользовательского ввода, запятая тоже считается разделителем. */
export const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return isFinite(n) ? n : null;
};

export const fmt1 = (n) => (Math.round(n * 10) / 10).toLocaleString('ru-RU');
export const fmt0 = (n) => Math.round(n).toLocaleString('ru-RU');

/** Подпись по ключу из справочника вида [[value, label], …]. */
export const labelOf = (arr, v) => (arr.find((t) => t[0] === v) || [v, v])[1];
export const timeLabel = (v) => (TIMES.find((t) => t[0] === v) || [])[1];
export const energyLabel = (v) => (ENERGY.find((t) => t[0] === v) || [])[1];

/** JSON с отсортированными ключами: одинаковые объекты дают одинаковую строку. */
export function stable(v) {
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  if (v && typeof v === 'object') {
    return (
      '{' +
      Object.keys(v)
        .filter((k) => v[k] !== undefined)
        .sort()
        .map((k) => JSON.stringify(k) + ':' + stable(v[k]))
        .join(',') +
      '}'
    );
  }
  return JSON.stringify(v === undefined ? null : v);
}
