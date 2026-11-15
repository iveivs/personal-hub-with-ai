// Перерисовка интерфейса: меню слева, текущий экран, плашка срочного.

import { empty } from '../components/common.js';
import { VIEWS } from '../config.js';
import { fmtDate, today } from '../lib/dates.js';
import { $, esc, growAll, isTypingIn } from '../lib/dom.js';
import { daysLeft, items, reviewOverdue, stuckProjects, urgentItems } from '../model.js';
import { plural } from '../lib/format.js';
import { renderProcess } from '../process/wizard.js';
import { S, UI, app } from '../state.js';
import { hasMeta, isOff, isReady } from '../store/sync.js';
import { VIEW_RENDER } from '../views/index.js';
import { openWelcome } from './modal.js';

export function renderNav() {
  const t = today();
  const counts = {
    today: S.items.filter((i) => i.focus === t && i.status !== 'done').length,
    inbox: items('inbox').length,
    next: items('next').length,
    calendar: items('calendar').filter((i) => i.due && i.due <= t).length,
    waiting: items('waiting').length,
    projects: stuckProjects().length,
    someday: items('someday').length,
    reference: items('reference').length,
  };
  const alerts = { calendar: counts.calendar > 0, projects: counts.projects > 0, review: reviewOverdue() };
  $('#nav').innerHTML = VIEWS.map((v) => {
    if (v.sep) return '<div class="nav-sep"></div>';
    let c = counts[v.id];
    if (v.id === 'projects') c = c || S.projects.filter((p) => p.status === 'active').length || '';
    if (v.id === 'review') c = alerts.review ? '!' : '';
    const cls = 'count' + (alerts[v.id] && c ? ' alert' : '');
    const active = UI.view === v.id;
    return `<button type="button" data-action="go" data-view="${v.id}" class="${active ? 'active' : ''}"${active ? ' aria-current="page"' : ''}>
      <span class="ico" aria-hidden="true">${v.ico}</span>${esc(v.title)}${c ? `<span class="${cls}">${c}</span>` : ''}</button>`;
  }).join('');
}

function daysLeftLabel(due) {
  if (!due) return '';
  const n = daysLeft(due);
  if (n < 0) return 'просрочено на ' + -n + ' ' + plural(-n, 'день', 'дня', 'дней');
  if (n === 0) return 'срок сегодня';
  if (n === 1) return 'срок завтра';
  return 'осталось ' + n + ' ' + plural(n, 'день', 'дня', 'дней');
}

/** Красная плашка «Срочно» — видна на всех экранах, пока задача не сделана. */
function renderUrgent() {
  const bar = $('#urgentBar');
  if (!bar) return;
  const arr = urgentItems();
  bar.hidden = !arr.length;
  bar.innerHTML = arr
    .map((it) => {
      const near = it.due && daysLeft(it.due) <= 1;
      return `<div class="urgent-row ${near ? 'pulse' : ''}">
      <button type="button" class="check" data-action="toggle" data-id="${it.id}" aria-label="Отметить сделанным" title="Сделано"></button>
      <div class="ut" data-action="edit" data-id="${it.id}"><b>🔥 Срочно:</b> ${esc(it.title)}</div>
      ${it.due ? `<span class="ud">${esc(fmtDate(it.due))} · ${esc(daysLeftLabel(it.due))}</span>` : ''}
    </div>`;
    })
    .join('');
}

/** Перерисовать только текущий экран (без меню и окон). */
export function renderView() {
  $('#view').innerHTML = (VIEW_RENDER[UI.view] || VIEW_RENDER.today)();
}

export function render() {
  if (isOff()) {
    $('#nav').innerHTML = '';
    $('#view').innerHTML = empty(
      '🔌',
      'База данных недоступна в этом окне.<br>Открой Personal Hub по ссылке на claude.ai, войдя в свой аккаунт.',
    );
    return;
  }
  if (!isReady()) {
    $('#view').innerHTML = '<div class="loading">Загружаю данные…</div>';
    return;
  }
  const fresh = !hasMeta() && !S.items.length && !S.projects.length && !S.sleep.length && !S.meals.length;
  renderNav();
  if (fresh) {
    $('#view').innerHTML = '';
    if (app.modalKind !== 'welcome') openWelcome();
    return;
  }
  if (app.modalKind === 'welcome') {
    app.modalKind = null;
    $('#modal').hidden = true;
  }
  renderView();
  growAll($('#view'));
  renderUrgent();
  if (app.modalKind === 'process') renderProcess();
}

/* ---------- отложенная перерисовка ----------
 * Данные из хранилища приходят пачками — склеиваем их в одну перерисовку.
 * Если пользователь что-то печатает на экране, ждём, пока он уйдёт с поля,
 * чтобы не потерять набранный текст. */

let queued = false;
let deferred = false;

export function scheduleRender() {
  if (queued) return;
  queued = true;
  setTimeout(() => {
    queued = false;
    if (isTypingIn($('#view'))) {
      deferred = true;
      renderNav();
      return;
    }
    render();
  }, 30);
}

export function flushDeferredRender() {
  if (!deferred) return;
  setTimeout(() => {
    if (isTypingIn($('#view'))) return;
    deferred = false;
    render();
  }, 0);
}
