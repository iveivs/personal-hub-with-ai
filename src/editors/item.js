import { opt } from '../components/common.js';
import { ENERGY, STATUS, TIMES } from '../config.js';
import { today } from '../lib/dates.js';
import { esc } from '../lib/dom.js';
import { getItem } from '../model.js';
import { S } from '../state.js';
import { openModal } from '../ui/modal.js';

export function openEditItem(id) {
  const it = getItem(id);
  if (!it) return;
  const ctxs = S.contexts.map((c) => [c, c]);
  if (it.context && !S.contexts.includes(it.context)) ctxs.push([it.context, it.context]);
  const projects = S.projects.filter((p) => p.status !== 'done' || p.id === it.projectId).map((p) => [p.id, p.title]);

  openModal(
    'edit',
    `<div class="sheet-top"><span>Задача</span><button type="button" class="btn sm ghost x" data-action="close" aria-label="Закрыть">✕</button></div>
    <div class="field"><label for="eTitle">Что сделать</label><input id="eTitle" value="${esc(it.title)}"></div>
    <div class="field"><label for="eStatus">Список</label><select id="eStatus">${opt(Object.entries(STATUS), it.status)}</select></div>
    <label class="checkline"><input type="checkbox" id="eFocus" ${it.focus === today() ? 'checked' : ''}> ⭐ В фокусе на сегодня</label>
    <label class="checkline"><input type="checkbox" id="eUrgent" ${it.urgent ? 'checked' : ''}> 🔥 Срочно: висит красной плашкой на всех экранах, пока не сделаешь</label>
    <div class="grid2">
      <div class="field"><label for="eCtx">Контекст</label><select id="eCtx"><option value="">—</option>${opt(ctxs, it.context)}</select></div>
      <div class="field"><label for="eProj">Проект</label><select id="eProj"><option value="">—</option>${opt(projects, it.projectId)}</select></div>
      <div class="field"><label for="eTime">Время</label><select id="eTime"><option value="">—</option>${opt(TIMES, it.time)}</select></div>
      <div class="field"><label for="eEnergy">Силы</label><select id="eEnergy"><option value="">—</option>${opt(ENERGY, it.energy)}</select></div>
      <div class="field"><label for="eDue">Дата (только жёсткая)</label><input type="date" id="eDue" value="${esc(it.due || '')}"></div>
      <div class="field"><label for="eWho">Жду от</label><input id="eWho" value="${esc(it.waitingFor || '')}"></div>
    </div>
    <div class="field"><label for="eNotes">Заметки</label><textarea id="eNotes">${esc(it.notes || '')}</textarea></div>
    <div class="sheet-actions">
      <button type="button" class="btn danger" data-action="deleteItem" data-id="${it.id}">Удалить</button>
      ${it.status !== 'inbox' ? `<button type="button" class="btn ghost" data-action="toInbox" data-id="${it.id}" title="Вернуть во Входящие и разобрать заново">Разобрать заново</button>` : ''}
      <span class="spacer"></span>
      <button type="button" class="btn" data-action="close">Отмена</button>
      <button type="button" class="btn primary" data-action="saveItem" data-id="${it.id}">Сохранить</button>
    </div>`,
  );
}
