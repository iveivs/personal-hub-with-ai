// Делегирование событий: один обработчик на документ вместо обработчиков на каждой кнопке.
// Интерфейс перерисовывается целиком через innerHTML, поэтому так надёжнее.

import { ACTIONS } from './actions/index.js';
import { FORMS } from './forms.js';
import { importFile } from './io.js';
import { today } from './lib/dates.js';
import { $, autoGrow } from './lib/dom.js';
import { setDay } from './model.js';
import { app } from './state.js';
import { isReady } from './store/sync.js';
import { closeModal } from './ui/modal.js';
import { flushDeferredRender } from './ui/render.js';
import { toast } from './ui/toast.js';

function onClick(e) {
  const el = e.target.closest('[data-action]');
  if (!el) {
    if (e.target === $('#modal')) closeModal(); // клик по затемнению вокруг окна
    return;
  }
  if (el.disabled) return;
  const fn = ACTIONS[el.dataset.action];
  if (fn) {
    e.preventDefault();
    fn(el, e);
  }
}

function onSubmit(e) {
  e.preventDefault();
  if (!isReady()) {
    toast('Данные ещё загружаются');
    return;
  }
  const f = e.target;
  const name = f.id === 'captureForm' ? 'capture' : f.dataset.form;
  const fn = FORMS[name];
  if (fn) fn(f);
}

function onChange(e) {
  const el = e.target;
  if (el.id === 'dayWell') {
    setDay(today(), { wellbeing: el.value.trim() });
    toast('Самочувствие сохранено');
    return;
  }
  if (el.id === 'importFile') {
    const file = el.files[0];
    el.value = '';
    if (file) importFile(file);
  }
}

function onKeydown(e) {
  if (e.key === 'Escape' && app.modalKind) {
    closeModal();
    return;
  }
  const tag = (e.target.tagName || '').toLowerCase();
  const typing = tag === 'input' || tag === 'textarea' || tag === 'select';
  // N (или Т в русской раскладке) и / — курсор в поле быстрого ввода.
  if (!typing && !app.modalKind && !e.metaKey && !e.ctrlKey && (e.key === 'n' || e.key === 'т' || e.key === '/')) {
    e.preventDefault();
    $('#capture').focus();
  }
  // Enter в поле мастера разбора нажимает главную кнопку шага.
  if (e.key === 'Enter' && app.modalKind === 'process' && tag === 'input') {
    e.preventDefault();
    const primary = $('#sheet .btn.primary');
    if (primary) primary.click();
  }
}

export function bindEvents() {
  document.addEventListener('click', onClick);
  document.addEventListener('submit', onSubmit);
  document.addEventListener('change', onChange);
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('input', (e) => autoGrow(e.target));
  document.addEventListener('focusout', flushDeferredRender);
}
