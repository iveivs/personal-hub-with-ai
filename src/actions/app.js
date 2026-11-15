// Навигация, фильтры, подсказки, окна, тема, экспорт.

import { exportData } from '../io.js';
import { UI, app, saveUI } from '../state.js';
import { save } from '../store/sync.js';
import { closeModal, hideModal } from '../ui/modal.js';
import { render } from '../ui/render.js';
import { toggleTheme } from '../ui/theme.js';
import { toast } from '../ui/toast.js';

export const appActions = {
  /** Перейти на экран. Открытое окно (кроме приветствия) закрывается. */
  go(el) {
    UI.view = el.dataset.view;
    saveUI();
    if (app.modalKind && app.modalKind !== 'welcome') hideModal();
    render();
    window.scrollTo(0, 0);
  },
  filter(el) {
    UI[el.dataset.key] = el.dataset.val;
    saveUI();
    render();
  },
  hideHint(el) {
    UI.hidden[el.dataset.id] = true;
    saveUI();
    render();
  },
  showHints() {
    UI.hidden = {};
    saveUI();
    toast('Подсказки снова видны');
  },

  close() {
    closeModal();
  },
  confirmOk() {
    const fn = app.confirmFn;
    hideModal();
    if (fn) fn();
    render();
  },
  /** Кнопка «Начать» в приветствии: создаёт пустую систему. */
  startEmpty() {
    save();
    hideModal();
    UI.view = 'today';
    saveUI();
    render();
  },

  export() {
    exportData();
  },
  theme() {
    toggleTheme();
  },
};
