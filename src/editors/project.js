import { opt } from '../components/common.js';
import { esc } from '../lib/dom.js';
import { project } from '../model.js';
import { openModal } from '../ui/modal.js';

const PROJECT_STATUS = [
  ['active', 'Активный'],
  ['someday', 'Отложен (когда-нибудь)'],
  ['done', 'Завершён'],
];

export function openEditProject(id) {
  const p = project(id);
  if (!p) return;
  openModal(
    'editProject',
    `<div class="sheet-top"><span>Проект</span><button type="button" class="btn sm ghost x" data-action="close" aria-label="Закрыть">✕</button></div>
    <div class="field"><label for="pTitleE">Название</label><input id="pTitleE" value="${esc(p.title)}"></div>
    <div class="field"><label for="pOutE">Как выглядит «готово»</label><input id="pOutE" value="${esc(p.outcome || '')}"></div>
    <div class="field"><label for="pStatE">Статус</label><select id="pStatE">${opt(PROJECT_STATUS, p.status)}</select></div>
    <div class="sheet-actions">
      <button type="button" class="btn danger" data-action="deleteProject" data-id="${p.id}">Удалить проект</button>
      <span class="spacer"></span>
      <button type="button" class="btn" data-action="close">Отмена</button>
      <button type="button" class="btn primary" data-action="saveProject" data-id="${p.id}">Сохранить</button>
    </div>`,
  );
}
