// Отправка форм: быстрый ввод и формы «добавить» на экранах.
// Форма находится по id="captureForm" или по data-form="имя".

import { validSleep } from './actions/health.js';
import { fmtHours, pad, today } from './lib/dates.js';
import { $ } from './lib/dom.js';
import { num, uid } from './lib/format.js';
import { newItem, newProject, sleepHours } from './model.js';
import { S, UI } from './state.js';
import { save } from './store/sync.js';
import { render, renderNav } from './ui/render.js';
import { toast } from './ui/toast.js';

const short = (t) => (t.length > 40 ? t.slice(0, 40) + '…' : t);

export const FORMS = {
  /** Поле сверху: всё сразу во Входящие. */
  capture() {
    const input = $('#capture');
    const t = input.value.trim();
    if (!t) return;
    newItem(t);
    save();
    input.value = '';
    renderNav();
    if (UI.view === 'inbox' || UI.view === 'today') render();
    toast('Во Входящих: «' + short(t) + '»');
  },

  addProject(f) {
    const t = f.title.value.trim();
    if (!t) return;
    newProject(t);
    save();
    f.title.value = '';
    render();
    toast('Проект создан. Добавь ему первое действие');
  },

  addStep(f) {
    const t = f.title.value.trim();
    if (!t) return;
    newItem(t, { status: 'next', projectId: f.dataset.id, context: f.context.value || null });
    save();
    f.title.value = '';
    render();
    toast('Добавлено в Следующие действия');
  },

  addSleep(f) {
    const start = f.start.value;
    const end = f.end.value;
    if (!validSleep(start, end)) {
      toast('Проверь время: «встал» должно быть позже «лёг»');
      return;
    }
    S.sleep.push({
      id: uid(),
      type: f.type.value,
      start,
      end,
      day: end.slice(0, 10),
      quality: f.quality.value ? Number(f.quality.value) : null,
      notes: '',
      createdAt: Date.now(),
    });
    save();
    f.reset();
    render();
    toast('Сон записан: ' + fmtHours(sleepHours({ start, end })));
  },

  addMeal(f) {
    const title = f.title.value.trim();
    if (!title) return;
    const date = UI.foodDate || today();
    // Без указанного времени: для сегодняшнего дня ставим «сейчас», для прошлых — пусто.
    const now = new Date();
    const time = f.time.value || (date !== today() ? null : pad(now.getHours()) + ':' + pad(now.getMinutes()));
    S.meals.push({
      id: uid(),
      title,
      date,
      time,
      meal: f.meal.value,
      grams: num(f.grams.value),
      kcal: num(f.kcal.value),
      protein: num(f.protein.value),
      fat: num(f.fat.value),
      carbs: num(f.carbs.value),
      source: 'manual',
      notes: '',
      createdAt: Date.now(),
    });
    save();
    f.reset();
    render();
    toast('Добавлено: ' + title);
  },
};
