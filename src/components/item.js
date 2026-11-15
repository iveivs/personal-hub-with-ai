// Строка задачи в списке.

import { STATUS } from '../config.js';
import { daysAgo, fmtDate, today } from '../lib/dates.js';
import { esc } from '../lib/dom.js';
import { energyLabel, timeLabel } from '../lib/format.js';
import { project } from '../model.js';

/**
 * @param {object} it задача
 * @param {object} [opts]
 * @param {boolean} [opts.star]       звёздочка «в фокус на сегодня»
 * @param {boolean} [opts.noCheck]    без кружка «сделано»
 * @param {boolean} [opts.noProject]  не показывать чип проекта (уже внутри карточки проекта)
 * @param {boolean} [opts.showStatus] показывать список, в котором лежит задача
 * @param {boolean} [opts.notes]      показывать заметки
 * @param {boolean} [opts.age]        сколько дней ждём (для «Ожидания»)
 * @param {string}  [opts.side]       дополнительная разметка справа
 */
export function itemRow(it, opts = {}) {
  const t = today();
  const done = it.status === 'done';
  const chips = [];
  if (it.urgent && !done) chips.push('<span class="chip urgent">🔥 Срочно</span>');
  if (it.context) chips.push(`<span class="chip ctx">${esc(it.context)}</span>`);
  if (it.due) {
    const cls = !done && it.due < t ? 'due-over' : !done && it.due === t ? 'due-today' : '';
    chips.push(`<span class="chip ${cls}">📅 ${esc(fmtDate(it.due))}</span>`);
  }
  if (it.waitingFor) chips.push(`<span class="chip">👤 ${esc(it.waitingFor)}</span>`);
  if (it.time) chips.push(`<span class="chip">⏱ ${esc(timeLabel(it.time))}</span>`);
  if (it.energy) chips.push(`<span class="chip">⚡ ${esc(energyLabel(it.energy))}</span>`);
  const p = !opts.noProject && it.projectId && project(it.projectId);
  if (p) chips.push(`<span class="chip">📁 ${esc(p.title)}</span>`);
  if (opts.showStatus && !done && it.status !== 'next') {
    chips.push(`<span class="chip">${esc(STATUS[it.status] || it.status)}</span>`);
  }
  if (opts.age && it.status === 'waiting') chips.push(`<span class="chip">ждёшь ${daysAgo(it.createdAt)} дн.</span>`);

  const on = it.focus === t;
  const star =
    opts.star && !done
      ? `<button type="button" class="star ${on ? 'on' : ''}" data-action="focus" data-id="${it.id}" aria-pressed="${on}" title="${on ? 'Убрать из фокуса дня' : 'В фокус на сегодня'}" aria-label="Фокус на сегодня">${on ? '★' : '☆'}</button>`
      : '';
  const side = opts.side || star ? `<div class="item-side">${star}${opts.side || ''}</div>` : '';
  const check = opts.noCheck
    ? ''
    : `<button type="button" class="check" data-action="toggle" data-id="${it.id}" aria-label="Отметить сделанным" title="Сделано"></button>`;

  return `<li class="item ${done ? 'is-done' : ''}">
    ${check}
    <div class="item-main" data-action="edit" data-id="${it.id}">
      <div class="item-title">${esc(it.title)}</div>
      ${it.notes && opts.notes ? `<div class="item-notes">${esc(it.notes)}</div>` : ''}
      ${chips.length ? `<div class="chips">${chips.join('')}</div>` : ''}
    </div>${side}</li>`;
}

export function list(arr, opts) {
  return arr.length ? `<ul class="list">${arr.map((i) => itemRow(i, opts)).join('')}</ul>` : '';
}
