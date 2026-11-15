import { empty, groupTitle, hint } from '../components/common.js';
import { list } from '../components/item.js';
import { fmtHours, fmtLong, hm, today } from '../lib/dates.js';
import { esc } from '../lib/dom.js';
import { fmt0, plural } from '../lib/format.js';
import { byCreated, foodTotals, items, sleepOf, sleepTotal } from '../model.js';
import { S } from '../state.js';

function tiles(t, day) {
  const sl = sleepOf(t);
  const ft = foodTotals(t);
  const sleepValue = sl.length
    ? fmtHours(sleepTotal(t)).replace(' мин', '<small> мин</small>').replace(' ч ', '<small> ч </small>')
    : '—';
  const energy = [1, 2, 3, 4, 5]
    .map(
      (n) =>
        `<button type="button" class="${day.energy === n ? 'on' : ''}" data-action="setEnergy" data-val="${n}" aria-pressed="${day.energy === n}">${n}</button>`,
    )
    .join('');
  return `<div class="tiles">
      <div class="tile"><div class="k">Сон за сутки</div>
        <div class="v">${sleepValue}</div>
        <div class="d">${sl.length ? sl.map((s) => `${hm(s.start)}–${hm(s.end)}`).join(' · ') : 'не внесён'}</div></div>
      <div class="tile"><div class="k">Энергия</div>
        <div class="energy" role="group" aria-label="Энергия от 1 до 5">${energy}</div>
        <div class="d">1 — нет сил, 5 — отлично</div></div>
      <div class="tile"><div class="k">Еда</div>
        <div class="v">${ft.n ? fmt0(ft.kcal) + '<small> ккал</small>' : '—'}</div>
        <div class="d">${ft.n ? `Б ${fmt0(ft.p)} · Ж ${fmt0(ft.f)} · У ${fmt0(ft.c)} г · ${ft.n} ${plural(ft.n, 'приём', 'приёма', 'приёмов')}` : 'ничего не внесено'}</div></div>
    </div>`;
}

export function todayView() {
  const t = today();
  const day = S.days[t] || {};
  let h = `<h1>☀️ Сегодня</h1><p class="sub" style="text-transform:none">${esc(fmtLong(t))}</p>${hint('today')}`;
  h += tiles(t, day);
  h += `<div class="field"><label for="dayWell">Самочувствие</label><textarea id="dayWell" class="well" placeholder="Как ты сегодня? Сохраняется само.">${esc(day.wellbeing || '')}</textarea></div>`;

  const focus = S.items
    .filter((i) => i.focus === t)
    .sort((a, b) => (a.status === 'done') - (b.status === 'done') || byCreated(a, b));
  h += groupTitle('⭐ Фокус дня', focus.filter((i) => i.status !== 'done').length);
  h += focus.length
    ? list(focus, { star: true, showStatus: true })
    : empty('⭐', 'Фокус на сегодня не выбран.<br>Отметь звёздочкой 1–3 задачи в «Следующих действиях».');

  const due = S.items
    .filter((i) => i.status !== 'done' && i.due && i.due <= t && i.focus !== t)
    .sort((a, b) => a.due.localeCompare(b.due));
  if (due.length)
    h += groupTitle('📅 Сроки: сегодня и просрочено', due.length) + list(due, { star: true, showStatus: true });

  const inbox = items('inbox').length;
  if (inbox) {
    h += `<div class="cta"><p><b>Во Входящих ${inbox} ${plural(inbox, 'пункт', 'пункта', 'пунктов')}.</b></p><button type="button" class="btn primary" data-action="process">Разобрать →</button></div>`;
  }
  if (day.summary) h += `${groupTitle('Итог дня')}<div class="panel">${esc(day.summary)}</div>`;
  return h;
}
