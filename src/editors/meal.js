import { opt } from '../components/common.js';
import { MEALS, SOURCES } from '../config.js';
import { esc } from '../lib/dom.js';
import { labelOf } from '../lib/format.js';
import { S } from '../state.js';
import { openModal } from '../ui/modal.js';

/** Числовые поля приёма пищи: [ключ, подпись]. */
export const MEAL_NUMBERS = [
  ['grams', 'Вес, г'],
  ['kcal', 'Ккал'],
  ['protein', 'Белки, г'],
  ['fat', 'Жиры, г'],
  ['carbs', 'Углеводы, г'],
];

export function openEditMeal(id) {
  const m = S.meals.find((x) => x.id === id);
  if (!m) return;
  const field = ([k, label]) =>
    `<div class="field"><label for="m_${k}">${label}</label><input id="m_${k}" inputmode="decimal" value="${m[k] == null ? '' : esc(m[k])}"></div>`;
  openModal(
    'editMeal',
    `<div class="sheet-top"><span>Приём пищи</span><button type="button" class="btn sm ghost x" data-action="close" aria-label="Закрыть">✕</button></div>
    <div class="field"><label for="m_title">Блюдо</label><input id="m_title" value="${esc(m.title)}"></div>
    <div class="grid2">
      <div class="field"><label for="m_meal">Приём</label><select id="m_meal">${opt(MEALS, m.meal)}</select></div>
      <div class="field"><label for="m_date">Дата</label><input type="date" id="m_date" value="${esc(m.date || '')}"></div>
      <div class="field"><label for="m_time">Время</label><input type="time" id="m_time" value="${esc(m.time || '')}"></div>
      ${MEAL_NUMBERS.map(field).join('')}
    </div>
    <div class="field"><label for="m_notes">Заметка</label><input id="m_notes" value="${esc(m.notes || '')}"></div>
    ${m.source && m.source !== 'manual' ? `<p class="status-line">Значения — ${esc(labelOf(SOURCES, m.source).toLowerCase())}. После правки запись отметится как «вручную».</p>` : ''}
    <div class="sheet-actions">
      <button type="button" class="btn danger" data-action="deleteMeal" data-id="${m.id}">Удалить</button>
      <span class="spacer"></span>
      <button type="button" class="btn" data-action="close">Отмена</button>
      <button type="button" class="btn primary" data-action="saveMeal" data-id="${m.id}">Сохранить</button>
    </div>`,
  );
}
