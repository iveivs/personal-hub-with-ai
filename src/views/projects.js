import { empty, groupTitle, head } from '../components/common.js';
import { list } from '../components/item.js';
import { esc } from '../lib/dom.js';
import { projectMoving } from '../model.js';
import { S } from '../state.js';

function card(p) {
  const tasks = S.items.filter((i) => i.projectId === p.id && i.status !== 'done' && i.status !== 'inbox');
  const stuck = !projectMoving(p);
  return `<div class="proj ${stuck ? 'stuck' : ''}">
        <div class="proj-head">
          <div style="flex:1;min-width:0">
            <div class="proj-title" data-action="editProject" data-id="${p.id}">${esc(p.title)}</div>
            ${p.outcome ? `<div class="proj-outcome">🎯 ${esc(p.outcome)}</div>` : ''}
          </div>
          <button type="button" class="btn sm" data-action="projectDone" data-id="${p.id}">Завершить</button>
        </div>
        ${stuck ? '<div class="proj-warn">⚠️ Нет следующего действия, проект стоит. Какой самый первый шаг можно сделать прямо сейчас?</div>' : ''}
        ${tasks.length ? list(tasks, { noProject: true, star: true }) : ''}
        <form class="inline-add" data-form="addStep" data-id="${p.id}">
          <input name="title" id="step-${p.id}" placeholder="Следующее действие: глагол + что именно" aria-label="Следующее действие">
          <select name="context" aria-label="Контекст">
            <option value="">контекст</option>${S.contexts.map((c) => `<option>${esc(c)}</option>`).join('')}
          </select>
          <button class="btn sm" type="submit">Добавить</button></form>
      </div>`;
}

/** Короткая строка проекта для отложенных и завершённых. */
function row(p, side = '') {
  return `<li class="item${p.status === 'done' ? ' is-done' : ''}"><div class="item-main" data-action="editProject" data-id="${p.id}"><div class="item-title">${esc(p.title)}</div></div>${side}</li>`;
}

export function projectsView() {
  let h = head('projects');
  h += `<form class="inline-add" data-form="addProject" style="margin-bottom:16px">
      <input name="title" id="newProjectTitle" placeholder="Новый проект: например, «Запустить лендинг»" aria-label="Название проекта">
      <button class="btn primary" type="submit">Создать</button></form>`;

  const active = S.projects.filter((p) => p.status === 'active');
  const stuck = active.filter((p) => !projectMoving(p));
  const ok = active.filter((p) => projectMoving(p));
  if (!active.length) {
    h += empty(
      '📁',
      'Активных проектов нет.<br>Они появляются при разборе, когда пункту нужно больше одного шага, или их можно создать здесь.',
    );
  }
  if (stuck.length) h += groupTitle('Требуют внимания', stuck.length) + stuck.map(card).join('');
  if (ok.length) h += groupTitle('В работе', ok.length) + ok.map(card).join('');

  const later = S.projects.filter((p) => p.status === 'someday');
  if (later.length) {
    const start = (p) =>
      `<div class="item-side"><button type="button" class="btn sm" data-action="projectActivate" data-id="${p.id}">Начать</button></div>`;
    h += `${groupTitle('Отложенные (когда-нибудь)')}<ul class="list">${later.map((p) => row(p, start(p))).join('')}</ul>`;
  }
  const done = S.projects.filter((p) => p.status === 'done');
  if (done.length)
    h += `${groupTitle('Завершённые', done.length)}<ul class="list">${done.map((p) => row(p)).join('')}</ul>`;
  return h;
}
