// Состояние приложения.
//
// S   — данные (задачи, проекты, сон, еда, дни). Синхронизируются с хранилищем.
// UI  — настройки интерфейса этого устройства (экран, фильтры). Живут в localStorage.
// app — временное состояние сессии: открытое окно, мастер разбора, подтверждение.
//
// Все три — объекты, поэтому модули меняют их свойства, а не переприсваивают сами переменные.

import { DEFAULT_CONTEXTS, UI_KEY } from './config.js';

export const S = {
  items: [],
  projects: [],
  sleep: [],
  meals: [],
  days: {},
  contexts: DEFAULT_CONTEXTS.slice(),
  review: { checks: {}, lastDone: null },
};

export const UI = loadUI();

export const app = {
  modalKind: null, // какое окно открыто: edit, process, confirm, welcome…
  process: null, // состояние мастера разбора Входящих
  confirmFn: null, // что выполнить по «ОК» в окне подтверждения
};

function loadUI() {
  const def = { view: 'today', ctx: 'all', time: 'any', energy: 'any', hidden: {} };
  try {
    return Object.assign(def, JSON.parse(localStorage.getItem(UI_KEY) || '{}'));
  } catch {
    return def;
  }
}

export function saveUI() {
  try {
    const u = Object.assign({}, UI);
    delete u.foodDate; // дата на экране «Питание» не запоминается между сессиями
    localStorage.setItem(UI_KEY, JSON.stringify(u));
  } catch {
    /* localStorage недоступен — просто не запоминаем */
  }
}
