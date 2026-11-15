import { empty, head } from '../components/common.js';
import { itemRow } from '../components/item.js';
import { plural } from '../lib/format.js';
import { byCreated, items } from '../model.js';

export function inboxView() {
  const arr = items('inbox').sort(byCreated);
  let h = head('inbox');
  if (!arr.length) {
    return (
      h + empty('🎉', 'Входящие пусты. Голова свободна.<br>Как только что-то придёт в голову, запиши в поле сверху.')
    );
  }
  h += `<div class="cta"><p><b>${arr.length} ${plural(arr.length, 'пункт ждёт', 'пункта ждут', 'пунктов ждут')} разбора.</b><br><span style="color:var(--muted);font-size:14px">Мастер задаст 2–4 вопроса про каждый пункт.</span></p>
        <button type="button" class="btn primary" data-action="process">Разобрать →</button></div>`;
  const side = (i) =>
    `<button type="button" class="btn sm ghost" data-action="process" data-id="${i.id}">Разобрать</button>`;
  h += '<ul class="list">' + arr.map((i) => itemRow(i, { side: side(i) })).join('') + '</ul>';
  return h;
}
