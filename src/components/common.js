// Мелкие общие куски разметки.

import { HINTS, VIEWS } from '../config.js';
import { esc } from '../lib/dom.js';
import { UI } from '../state.js';

export function empty(icon, text) {
  return `<div class="empty"><span class="big" aria-hidden="true">${icon}</span>${text}</div>`;
}

/** Подсказка вверху экрана, пока пользователь её не скрыл. */
export function hint(id) {
  if (UI.hidden[id] || !HINTS[id]) return '';
  return `<div class="hint"><button type="button" class="hint-close" data-action="hideHint" data-id="${id}" title="Скрыть подсказку" aria-label="Скрыть подсказку">✕</button>${HINTS[id]}</div>`;
}

/** Заголовок экрана: иконка + название, подзаголовок, подсказка. */
export function head(id, sub) {
  const v = VIEWS.find((x) => x.id === id);
  return `<h1>${v.ico} ${esc(v.title)}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}${hint(id)}`;
}

/** <option>-ы из справочника [[value, label], …]. */
export const opt = (arr, cur) =>
  arr
    .map(
      ([v, l]) => `<option value="${esc(v)}" ${String(cur ?? '') === String(v) ? 'selected' : ''}>${esc(l)}</option>`,
    )
    .join('');

export const groupTitle = (title, n) =>
  `<div class="group-title">${esc(title)}${n != null ? ` <span class="n">${n}</span>` : ''}</div>`;
