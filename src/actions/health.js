// Сон, еда, энергия.

import { addDays, today } from '../lib/dates.js';
import { $ } from '../lib/dom.js';
import { num, stable } from '../lib/format.js';
import { setDay } from '../model.js';
import { MEAL_NUMBERS, openEditMeal } from '../editors/meal.js';
import { openEditSleep } from '../editors/sleep.js';
import { S, UI } from '../state.js';
import { save } from '../store/sync.js';
import { closeModal } from '../ui/modal.js';
import { render } from '../ui/render.js';
import { toast } from '../ui/toast.js';
import { removeWithUndo } from './remove.js';

/** «Встал» позже «лёг»? */
export const validSleep = (start, end) => !!(start && end && new Date(end) > new Date(start));

export const healthActions = {
  /** Энергия дня 1–5; повторное нажатие снимает оценку. */
  setEnergy(el) {
    const t = today();
    const n = Number(el.dataset.val);
    setDay(t, { energy: (S.days[t] || {}).energy === n ? null : n });
    render();
  },

  /** Листать дни на экране «Питание»: -1, +1, 0 — к сегодня. */
  foodDay(el) {
    const d = Number(el.dataset.val);
    UI.foodDate = d === 0 ? today() : addDays(d, UI.foodDate || today());
    if (UI.foodDate > today()) UI.foodDate = today();
    render();
  },

  editSleep(el) {
    openEditSleep(el.dataset.id);
  },

  saveSleep(el) {
    const s = S.sleep.find((x) => x.id === el.dataset.id);
    if (!s) {
      closeModal();
      return;
    }
    const start = $('#sStart').value;
    const end = $('#sEnd').value;
    if (!validSleep(start, end)) {
      toast('Проверь время: «встал» должно быть позже «лёг»');
      return;
    }
    Object.assign(s, {
      type: $('#sType').value,
      start,
      end,
      day: end.slice(0, 10), // сон засчитывается на день пробуждения
      quality: $('#sQ').value ? Number($('#sQ').value) : null,
      notes: $('#sNotes').value.trim(),
    });
    save();
    closeModal();
  },

  deleteSleep(el) {
    removeWithUndo('sleep', el.dataset.id);
  },

  editMeal(el) {
    openEditMeal(el.dataset.id);
  },

  saveMeal(el) {
    const m = S.meals.find((x) => x.id === el.dataset.id);
    if (!m) {
      closeModal();
      return;
    }
    const fingerprint = () => stable([m.grams, m.kcal, m.protein, m.fat, m.carbs, m.title]);
    const before = fingerprint();
    m.title = $('#m_title').value.trim() || m.title;
    m.meal = $('#m_meal').value;
    m.date = $('#m_date').value || m.date;
    m.time = $('#m_time').value || null;
    MEAL_NUMBERS.forEach(([k]) => (m[k] = num($('#m_' + k).value)));
    m.notes = $('#m_notes').value.trim();
    // Поправили цифры или название — это уже не оценка Claude, а ручная запись.
    if (fingerprint() !== before) m.source = 'manual';
    save();
    closeModal();
  },

  deleteMeal(el) {
    removeWithUndo('meals', el.dataset.id);
  },
};
