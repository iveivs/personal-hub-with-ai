import { opt } from '../components/common.js';
import { SLEEP_QUALITY, SLEEP_TYPES } from '../config.js';
import { esc } from '../lib/dom.js';
import { S } from '../state.js';
import { openModal } from '../ui/modal.js';

export function openEditSleep(id) {
  const s = S.sleep.find((x) => x.id === id);
  if (!s) return;
  openModal(
    'editSleep',
    `<div class="sheet-top"><span>Отрезок сна</span><button type="button" class="btn sm ghost x" data-action="close" aria-label="Закрыть">✕</button></div>
    <div class="field"><label for="sType">Тип</label><select id="sType">${opt(SLEEP_TYPES, s.type)}</select></div>
    <div class="grid2">
      <div class="field"><label for="sStart">Лёг</label><input type="datetime-local" id="sStart" value="${esc(String(s.start || '').slice(0, 16))}"></div>
      <div class="field"><label for="sEnd">Встал</label><input type="datetime-local" id="sEnd" value="${esc(String(s.end || '').slice(0, 16))}"></div>
    </div>
    <div class="field"><label for="sQ">Качество</label><select id="sQ"><option value="">—</option>${opt(SLEEP_QUALITY, s.quality)}</select></div>
    <div class="field"><label for="sNotes">Заметка</label><input id="sNotes" value="${esc(s.notes || '')}"></div>
    <div class="sheet-actions">
      <button type="button" class="btn danger" data-action="deleteSleep" data-id="${s.id}">Удалить</button>
      <span class="spacer"></span>
      <button type="button" class="btn" data-action="close">Отмена</button>
      <button type="button" class="btn primary" data-action="saveSleep" data-id="${s.id}">Сохранить</button>
    </div>`,
  );
}
