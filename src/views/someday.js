import { empty, head } from '../components/common.js';
import { itemRow } from '../components/item.js';
import { byCreated, items } from '../model.js';

export function somedayView() {
  const arr = items('someday').sort(byCreated);
  const h = head('someday');
  if (!arr.length) return h + empty('💭', 'Тут будут идеи «может, когда-нибудь».');
  const side = (i) =>
    `<button type="button" class="btn sm" data-action="activate" data-id="${i.id}" title="Вернуть во Входящие и разобрать заново">Пора делать</button>`;
  return h + '<ul class="list">' + arr.map((i) => itemRow(i, { noCheck: true, side: side(i) })).join('') + '</ul>';
}
