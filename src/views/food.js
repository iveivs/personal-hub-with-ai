import { barChart, dayLabels } from '../components/chart.js';
import { empty, head, opt } from '../components/common.js';
import { MEALS, SOURCES } from '../config.js';
import { fmtDate, lastDays, today } from '../lib/dates.js';
import { esc } from '../lib/dom.js';
import { fmt0, labelOf } from '../lib/format.js';
import { foodTotals, mealsOf } from '../model.js';
import { UI } from '../state.js';

function dayNav(d) {
  const isToday = d === today();
  return `<div class="daynav"><button type="button" class="btn sm" data-action="foodDay" data-val="-1" aria-label="Предыдущий день">←</button><b>${esc(fmtDate(d))}</b><button type="button" class="btn sm" data-action="foodDay" data-val="1" aria-label="Следующий день" ${d >= today() ? 'disabled' : ''}>→</button>${isToday ? '' : '<button type="button" class="btn sm ghost" data-action="foodDay" data-val="0">К сегодня</button>'}</div>`;
}

function tiles(d) {
  const ft = foodTotals(d);
  const v = (x, unit) => (ft.n ? fmt0(x) + `<small> ${unit}</small>` : '—');
  return `<div class="tiles">
      <div class="tile"><div class="k">Калории</div><div class="v">${v(ft.kcal, 'ккал')}</div><div class="d">≈ оценка</div></div>
      <div class="tile"><div class="k">Белки</div><div class="v">${v(ft.p, 'г')}</div></div>
      <div class="tile"><div class="k">Жиры</div><div class="v">${v(ft.f, 'г')}</div></div>
      <div class="tile"><div class="k">Углеводы</div><div class="v">${v(ft.c, 'г')}</div></div>
    </div>`;
}

function row(m) {
  return `<li class="item"><div class="item-main" data-action="editMeal" data-id="${m.id}">
        <div class="item-title">${esc(m.title)}</div>
        <div class="chips"><span class="chip ctx">${esc(labelOf(MEALS, m.meal) || 'Приём')}${m.time ? ' · ' + esc(m.time) : ''}</span>${m.grams ? `<span class="chip num">${fmt0(m.grams)} г</span>` : ''}${m.kcal != null ? `<span class="chip num">${fmt0(m.kcal)} ккал</span>` : ''}<span class="chip num">Б ${fmt0(m.protein || 0)} · Ж ${fmt0(m.fat || 0)} · У ${fmt0(m.carbs || 0)}</span>${m.source && m.source !== 'manual' ? `<span class="chip">≈ ${esc(labelOf(SOURCES, m.source))}</span>` : ''}</div>
      </div></li>`;
}

function addForm() {
  const n = (id, name, label) =>
    `<div class="field"><label for="${id}">${label}</label><input id="${id}" name="${name}" inputmode="decimal"></div>`;
  return `<div class="panel"><h3>Добавить приём пищи</h3>
      <form data-form="addMeal" autocomplete="off">
        <div class="field"><label for="mlTitle">Блюдо</label><input id="mlTitle" name="title" required placeholder="Например: курица с картошкой"></div>
        <div class="form-grid">
          <div class="field"><label for="mlMeal">Приём</label><select id="mlMeal" name="meal">${opt(MEALS, 'lunch')}</select></div>
          <div class="field"><label for="mlTime">Время</label><input type="time" id="mlTime" name="time"></div>
          ${n('mlGrams', 'grams', 'Вес, г')}${n('mlKcal', 'kcal', 'Ккал')}${n('mlP', 'protein', 'Белки, г')}${n('mlF', 'fat', 'Жиры, г')}${n('mlC', 'carbs', 'Углеводы, г')}
        </div>
        <button class="btn primary" type="submit">Добавить</button></form></div>`;
}

function chart() {
  const days = lastDays(14);
  const series = [{ name: 'Ккал', color: 'var(--warn)', values: days.map((x) => foodTotals(x).kcal) }];
  return `<div class="panel"><h3>Калории по дням</h3>${barChart(dayLabels(days), series, (v) => fmt0(v))}</div>`;
}

export function foodView() {
  const d = UI.foodDate || today();
  const arr = mealsOf(d);
  let h = head('food') + dayNav(d) + tiles(d);
  h += arr.length
    ? '<ul class="list">' + arr.map(row).join('') + '</ul>'
    : empty('🍽', 'За этот день еды нет.<br>Пришли Claude фото или описание, или добавь вручную ниже.');
  return h + addForm() + chart();
}
