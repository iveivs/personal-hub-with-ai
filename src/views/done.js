import { empty, groupTitle, head } from '../components/common.js';
import { list } from '../components/item.js';
import { dateStr, daysAgo, fmtDate } from '../lib/dates.js';
import { items } from '../model.js';

/** Сделанное старше этого срока можно удалить одной кнопкой. */
export const DONE_KEEP_DAYS = 30;

export const isOldDone = (i) => i.status === 'done' && i.doneAt && daysAgo(i.doneAt) > DONE_KEEP_DAYS;

export function doneView() {
  const arr = items('done').sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  let h = head('done');
  if (!arr.length) return h + empty('✅', 'Тут появится всё сделанное.');

  const groups = {};
  arr.forEach((i) => {
    const k = i.doneAt ? fmtDate(dateStr(new Date(i.doneAt))) : 'раньше';
    (groups[k] ||= []).push(i);
  });
  Object.keys(groups).forEach((k) => {
    h += groupTitle(k, groups[k].length) + list(groups[k]);
  });

  const old = arr.filter(isOldDone).length;
  if (old) {
    h += `<button type="button" class="btn sm ghost" data-action="clearDone">Удалить сделанное старше ${DONE_KEEP_DAYS} дней (${old})</button>`;
  }
  return h;
}
