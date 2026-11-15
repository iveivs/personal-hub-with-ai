// Мастер разбора Входящих: по каждому пункту задаёт вопросы GTD
// и раскладывает его в нужный список.
//
// Шаги (P.step):
//   actionable → notActionable (мусор / когда-нибудь / справка)
//              → multi → project → twoMin …
//                      → twoMin → doNow (сделал) | who → delegate (ожидание)
//                                                       → when → date (календарь)
//                                                              → context (следующие действия)

import { ENERGY, TIMES } from '../config.js';
import { addDays, fmtDate, today } from '../lib/dates.js';
import { $, esc } from '../lib/dom.js';
import { byCreated, getItem, items, newProject } from '../model.js';
import { S, UI, app, saveUI } from '../state.js';
import { save } from '../store/sync.js';
import { hideModal } from '../ui/modal.js';
import { render, renderNav, renderView } from '../ui/render.js';
import { toast } from '../ui/toast.js';

const P = () => app.process;

export function startProcess(id) {
  const ids = items('inbox')
    .sort(byCreated)
    .map((i) => i.id);
  if (!ids.length) return;
  const idx = Math.max(0, id ? ids.indexOf(id) : 0);
  app.process = { ids, idx, done: 0, total: ids.length };
  resetDraft();
  app.modalKind = 'process';
  $('#modal').hidden = false;
  renderProcess();
}

/** Текущий пункт. Пропускает те, что уже разобраны (например, Claude успел). */
function curItem() {
  const p = P();
  while (p.idx < p.ids.length) {
    const it = getItem(p.ids[p.idx]);
    if (it && it.status === 'inbox') return it;
    p.idx++;
  }
  return null;
}

function resetDraft() {
  const it = curItem();
  Object.assign(P(), {
    step: it ? 'actionable' : 'empty',
    hist: [],
    trail: [],
    title: it ? it.title : '',
    newProject: null,
    sel: { context: null, time: null, energy: null },
  });
}

function readTitle() {
  const el = $('#pTitle');
  if (el) P().title = el.value;
}

function step(next, label) {
  readTitle();
  const p = P();
  p.hist.push(p.step);
  p.trail.push(label);
  p.step = next;
  renderProcess();
}

function stepBack() {
  const p = P();
  if (!p.hist.length) return;
  p.step = p.hist.pop();
  p.trail.pop();
  if (p.step === 'project') p.newProject = null;
  renderProcess();
}

/** Записать решение по текущему пункту и перейти к следующему. */
function commit(status, extra, msg) {
  readTitle();
  const p = P();
  const it = curItem();
  if (!it) return;
  if (status === 'trash') {
    S.items = S.items.filter((i) => i.id !== it.id);
  } else {
    it.title = (p.title || '').trim() || it.title;
    if (p.newProject) it.projectId = newProject(p.newProject.title, { outcome: p.newProject.outcome }).id;
    Object.assign(it, { status }, extra || {});
    if (status === 'done') it.doneAt = Date.now();
  }
  save();
  p.done++;
  p.idx++;
  resetDraft();
  renderNav();
  renderView();
  renderProcess();
  if (msg) toast(msg);
}

/* ---------- разметка ---------- */

const choice = (action, ico, title, sub, data = '') =>
  `<button type="button" class="choice" data-action="${action}" ${data}><span class="ci" aria-hidden="true">${ico}</span><span><b>${title}</b>${sub ? `<span>${sub}</span>` : ''}</span></button>`;

const go = (next, label) => `data-next="${next}" data-label="${label}"`;
const to = (status, msg) => `data-status="${status}" data-msg="${msg}"`;

/** Вопрос, подсказка и варианты для каждого шага. */
const STEPS = {
  actionable:
    () => `<div class="q">Нужно ли с этим что-то делать?</div><p class="qhint">Формулировку сверху можно исправить. Например, расшифровать, что имелось в виду.</p>
    <div class="choices">${choice('pGo', '✅', 'Да, нужно действовать', 'Есть шаг, который надо сделать (мне или кому-то)', go('multi', 'Нужно действовать'))}
    ${choice('pGo', '🚫', 'Нет', 'Это идея, информация или уже неактуально', go('notActionable', 'Действовать не нужно'))}</div>`,

  notActionable:
    () => `<div class="q">Тогда что это?</div><p class="qhint">Пункты, по которым ничего не надо делать, не должны висеть в списках дел.</p>
    <div class="choices">${choice('pCommit', '🗑', 'Мусор: удалить', 'Неактуально, уже не важно', to('trash', 'Удалено'))}
    ${choice('pCommit', '💭', 'Может быть, когда-нибудь', 'Идея, к которой стоит вернуться позже', to('someday', 'В «Когда-нибудь»'))}
    ${choice('pCommit', '📚', 'Справка', 'Полезная информация, сохранить на будущее', to('reference', 'В «Справку»'))}</div>`,

  multi:
    () => `<div class="q">Чтобы закрыть это, нужен один шаг или несколько?</div><p class="qhint">«Позвонить в банк» — один шаг. «Обновить лендинг» — много шагов, это проект.</p>
    <div class="choices">${choice('pGo', '1️⃣', 'Один шаг', 'Сделал, и вопрос закрыт', go('twoMin', 'Один шаг'))}
    ${choice('pGo', '📁', 'Несколько шагов: это проект', 'Создадим проект и определим первый шаг', go('project', 'Проект'))}</div>`,

  project: () => {
    const np = P().newProject || {};
    return `<div class="q">Создаём проект</div><p class="qhint">Проект нельзя «сделать», делаются шаги. Поэтому сразу определим первый.</p>
    <div class="field"><label for="pjTitle">Название проекта</label><input id="pjTitle" value="${esc(np.title || P().title)}"></div>
    <div class="field"><label for="pjOutcome">Как выглядит «готово»? (необязательно)</label><input id="pjOutcome" value="${esc(np.outcome || '')}" placeholder="Например: сайт открывается, на нём актуальные цены"></div>
    <div class="field"><label for="pjFirst">Самое первое физическое действие</label><input id="pjFirst" autofocus placeholder="Глагол + что именно: «Написать Ивану, какой хостинг он советует»"></div>`;
  },

  twoMin:
    () => `<div class="q">Это займёт меньше 2 минут?</div><p class="qhint">Правило двух минут: короткое дело быстрее сделать, чем записывать и потом вспоминать.</p>
    <div class="choices">${choice('pGo', '⚡', 'Да, меньше 2 минут', 'Сделаю прямо сейчас', go('doNow', 'Меньше 2 минут'))}
    ${choice('pGo', '🕐', 'Нет, дольше', '', go('who', 'Дольше 2 минут'))}</div>`,

  doNow:
    () => `<div class="q">Сделай это прямо сейчас 💪</div><p class="qhint">Окно подождёт. Когда закончишь, нажми кнопку.</p>
    <div class="choices">${choice('pCommit', '✅', 'Сделал!', '', to('done', 'Готово! Отлично'))}
    ${choice('pGo', '↪️', 'Не получилось сейчас', 'Тогда запланируем', go('who', 'Отложить'))}</div>`,

  who: () => `<div class="q">Кто должен это сделать?</div><p class="qhint">Если это работа кого-то другого, поручи и отслеживай в «Ожидании».</p>
    <div class="choices">${choice('pGo', '🙋', 'Я сам', '', go('when', 'Делаю сам'))}
    ${choice('pGo', '👤', 'Кто-то другой', 'Поручу или уже жду от него', go('delegate', 'Поручаю'))}</div>`,

  delegate:
    () => `<div class="q">От кого ждёшь?</div><p class="qhint">Не забудь реально написать человеку, если ещё не написал.</p>
    <div class="field"><label for="pWho">Кто</label><input id="pWho" autofocus placeholder="Имя"></div>`,

  when: () => `<div class="q">Это жёстко привязано к дате?</div><p class="qhint">Встреча, дедлайн, «оплатить до 25-го». Желание «сделать в среду» не считается.</p>
    <div class="choices">${choice('pGo', '📅', 'Да, к конкретному дню', 'Пойдёт в Календарь', go('date', 'Есть дата'))}
    ${choice('pGo', '▶️', 'Нет, как можно скорее', 'Пойдёт в Следующие действия', go('context', 'Без даты'))}</div>`,

  date: () => {
    const quick = [
      ['Сегодня', 0],
      ['Завтра', 1],
      ['Через неделю', 7],
    ]
      .map(
        ([l, n]) =>
          `<button type="button" class="pill" data-action="pDateQuick" data-val="${addDays(n)}">${l}</button>`,
      )
      .join('');
    return `<div class="q">Какого числа?</div>
    <div class="pills">${quick}</div>
    <div class="field"><label for="pDate">Дата</label><input type="date" id="pDate" value="${today()}"></div>`;
  },

  context: () => {
    const sel = P().sel;
    const pills = (key, arr) =>
      arr
        .map(
          ([v, l]) =>
            `<button type="button" class="pill ${sel[key] === v ? 'on' : ''}" data-action="pSel" data-key="${key}" data-val="${esc(v)}">${esc(l)}</button>`,
        )
        .join('');
    return `<div class="q">Где и в каком состоянии это можно сделать?</div><p class="qhint">Это поможет выбирать задачи: «я за компьютером, есть 15 минут и мало сил, что можно сделать?»</p>
    <div class="field"><label>Контекст: где или с чем</label><div class="pills">${pills(
      'context',
      S.contexts.map((c) => [c, c]),
    )}</div></div>
    <div class="field"><label>Сколько займёт (необязательно)</label><div class="pills">${pills('time', TIMES)}</div></div>
    <div class="field"><label>Сколько нужно сил (необязательно)</label><div class="pills">${pills('energy', ENERGY)}</div></div>`;
  },
};

/** Главная кнопка внизу для шагов с полями ввода. */
const PRIMARY = {
  project: ['pProject', 'Дальше →'],
  delegate: ['pDelegate', 'В «Ожидание»'],
  date: ['pDate', 'В Календарь'],
  context: ['pNext', 'В Следующие действия'],
};

export function renderProcess() {
  const p = P();
  if (!p) return;
  if (!curItem()) p.step = 'empty';
  const pos = Math.min(p.done + 1, p.total);
  const top = `<div class="sheet-top"><span>Разбор Входящих · ${p.step === 'empty' ? 'готово' : `пункт ${pos} из ${p.total}`}</span><button type="button" class="btn sm ghost x" data-action="close">✕ Закрыть</button></div>
    <div class="progress"><div style="width:${(p.done / p.total) * 100}%"></div></div>`;

  if (p.step === 'empty') {
    $('#sheet').innerHTML =
      top +
      `<div style="text-align:center;padding:12px 0 4px"><div style="font-size:44px" aria-hidden="true">🎉</div><div class="q">Входящие пусты!</div>
      <p class="qhint">Разобрано: ${p.done}. Теперь загляни в «Следующие действия»: там всё, что можно делать.</p>
      <div class="row" style="justify-content:center"><button type="button" class="btn primary" data-action="finishProcess" data-view="next">К Следующим действиям</button><button type="button" class="btn" data-action="close">Закрыть</button></div></div>`;
    return;
  }

  const title =
    p.step === 'actionable'
      ? `<input class="pitem-edit" id="pTitle" value="${esc(p.title)}" aria-label="Формулировка">`
      : `<div class="pitem">${esc(p.title)}</div>`;
  const trail = `<div class="trail">${p.trail.map((t) => `<span>${esc(t)}</span>`).join('')}</div>`;
  const back = p.hist.length ? '<button type="button" class="btn ghost" data-action="pBack">← Назад</button>' : '';
  const skip =
    '<button type="button" class="btn ghost" data-action="pSkip" title="Оставить во Входящих и перейти к следующему">Пропустить</button>';
  const primary = PRIMARY[p.step]
    ? `<button type="button" class="btn primary" data-action="${PRIMARY[p.step][0]}">${PRIMARY[p.step][1]}</button>`
    : '';

  $('#sheet').innerHTML =
    top +
    title +
    trail +
    STEPS[p.step]() +
    `<div class="sheet-actions">${back}<span class="spacer"></span>${primary}${skip}</div>`;
  const f = $('#sheet [autofocus]');
  if (f) f.focus();
}

/* ---------- действия (data-action) ---------- */

export const processActions = {
  process(el) {
    startProcess(el.dataset.id);
  },
  finishProcess(el) {
    hideModal();
    UI.view = el.dataset.view;
    saveUI();
    render();
  },
  pGo(el) {
    step(el.dataset.next, el.dataset.label);
  },
  pBack() {
    stepBack();
  },
  pSkip() {
    readTitle();
    const p = P();
    p.idx++;
    p.done++;
    resetDraft();
    renderProcess();
  },
  pCommit(el) {
    commit(el.dataset.status, null, el.dataset.msg);
  },
  pProject() {
    const first = $('#pjFirst').value.trim();
    if (!first) {
      $('#pjFirst').focus();
      toast('Напиши первый шаг: без него проект будет стоять');
      return;
    }
    const p = P();
    p.newProject = { title: $('#pjTitle').value.trim() || p.title, outcome: $('#pjOutcome').value.trim() };
    p.hist.push(p.step);
    p.trail.push('Проект «' + p.newProject.title + '»');
    p.title = first;
    p.step = 'twoMin';
    renderProcess();
  },
  pDelegate() {
    const who = $('#pWho').value.trim();
    commit('waiting', { waitingFor: who, createdAt: Date.now() }, 'В «Ожидание»');
  },
  pDateQuick(el) {
    $('#pDate').value = el.dataset.val;
    document.querySelectorAll('[data-action=pDateQuick]').forEach((b) => b.classList.toggle('on', b === el));
  },
  pDate() {
    const d = $('#pDate').value;
    if (!d) {
      toast('Выбери дату');
      return;
    }
    commit('calendar', { due: d }, 'В Календарь на ' + fmtDate(d));
  },
  pSel(el) {
    const { key, val } = el.dataset;
    const sel = P().sel;
    sel[key] = sel[key] === val ? null : val;
    renderProcess();
  },
  pNext() {
    const { context, time, energy } = P().sel;
    commit('next', { context, time, energy }, 'В Следующие действия');
  },
};
