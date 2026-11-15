// Модель данных: выборки из S и создание новых записей.
// Здесь нет HTML и обращений к DOM.

import { daysAgo, parseDate, today } from './lib/dates.js';
import { uid } from './lib/format.js';
import { S } from './state.js';
import { save } from './store/sync.js';

/* ---------- задачи и проекты ---------- */

export const byCreated = (a, b) => (a.createdAt || 0) - (b.createdAt || 0);
export const byDue = (a, b) => (a.due || '9999').localeCompare(b.due || '9999');

export const items = (status) => S.items.filter((i) => i.status === status);
export const getItem = (id) => S.items.find((i) => i.id === id);
export const project = (id) => S.projects.find((p) => p.id === id);

export function newItem(title, extra) {
  const it = Object.assign(
    {
      id: uid(),
      title,
      notes: '',
      status: 'inbox',
      context: null,
      time: null,
      energy: null,
      projectId: null,
      waitingFor: '',
      due: null,
      focus: null,
      createdAt: Date.now(),
      doneAt: null,
    },
    extra || {},
  );
  S.items.push(it);
  return it;
}

export function newProject(title, extra) {
  const p = Object.assign({ id: uid(), title, outcome: '', status: 'active', createdAt: Date.now() }, extra || {});
  S.projects.push(p);
  return p;
}

/** У проекта есть хотя бы одно живое действие: следующее, ожидание или в календаре. */
export function projectMoving(p) {
  return S.items.some((i) => i.projectId === p.id && ['next', 'waiting', 'calendar'].includes(i.status));
}

export const stuckProjects = () => S.projects.filter((p) => p.status === 'active' && !projectMoving(p));

export const reviewOverdue = () => !S.review.lastDone || daysAgo(S.review.lastDone) >= 7;

export function urgentItems() {
  return S.items.filter((i) => i.urgent && i.status !== 'done').sort((a, b) => byDue(a, b) || byCreated(a, b));
}

/** Сколько дней до срока: отрицательное число — просрочено. */
export const daysLeft = (due) => Math.round((parseDate(due) - parseDate(today())) / 86400000);

/* ---------- сон ---------- */

export function sleepHours(s) {
  const h = (new Date(s.end) - new Date(s.start)) / 3600000;
  return isFinite(h) && h > 0 ? h : 0;
}

/** Отрезки сна, засчитанные на день (по дате пробуждения), по времени отбоя. */
export function sleepOf(day) {
  return S.sleep.filter((s) => s.day === day).sort((a, b) => String(a.start).localeCompare(String(b.start)));
}

export const sleepTotal = (day) => sleepOf(day).reduce((t, s) => t + sleepHours(s), 0);

export const sleepOfType = (day, type) =>
  sleepOf(day)
    .filter((s) => s.type === type)
    .reduce((t, s) => t + sleepHours(s), 0);

/* ---------- еда ---------- */

export function mealsOf(day) {
  return S.meals.filter((m) => m.date === day).sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));
}

export function foodTotals(day) {
  return mealsOf(day).reduce(
    (t, m) => {
      t.kcal += m.kcal || 0;
      t.p += m.protein || 0;
      t.f += m.fat || 0;
      t.c += m.carbs || 0;
      t.n++;
      return t;
    },
    { kcal: 0, p: 0, f: 0, c: 0, n: 0 },
  );
}

/* ---------- дни ---------- */

export function setDay(day, patch) {
  S.days[day] = Object.assign({}, S.days[day] || {}, patch);
  save();
}
