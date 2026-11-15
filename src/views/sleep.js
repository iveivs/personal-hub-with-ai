import { barChart, dayLabels } from '../components/chart.js';
import { empty, head, opt } from '../components/common.js';
import { SLEEP_QUALITY, SLEEP_TYPES } from '../config.js';
import { addDays, fmtDate, fmtHours, hm, lastDays, pad, today } from '../lib/dates.js';
import { esc } from '../lib/dom.js';
import { fmt1, labelOf, plural } from '../lib/format.js';
import { sleepHours, sleepOf, sleepOfType, sleepTotal } from '../model.js';
import { S } from '../state.js';

/** Среднее время отбоя по ночным снам за неделю, 'HH:MM'. Время до полудня считается «после полуночи». */
function averageBedtime() {
  const nights = S.sleep.filter((s) => s.type === 'night' && s.day >= addDays(-6) && s.start);
  if (!nights.length) return null;
  const mins = nights.map((s) => {
    const m = Number(s.start.slice(11, 13)) * 60 + Number(s.start.slice(14, 16));
    return m < 12 * 60 ? m + 1440 : m;
  });
  const a = Math.round(mins.reduce((x, y) => x + y, 0) / mins.length) % 1440;
  return pad(Math.floor(a / 60)) + ':' + pad(a % 60);
}

function tiles() {
  const t = today();
  const todays = sleepOf(t);
  const last7 = lastDays(7).filter((d) => sleepOf(d).length);
  const avg = last7.length ? last7.reduce((s, d) => s + sleepTotal(d), 0) / last7.length : null;
  const bed = averageBedtime();
  return `<div class="tiles">
      <div class="tile"><div class="k">Сегодня</div><div class="v">${todays.length ? esc(fmtHours(sleepTotal(t))) : '—'}</div><div class="d">${todays.length ? todays.length + ' ' + plural(todays.length, 'отрезок', 'отрезка', 'отрезков') : 'не внесён'}</div></div>
      <div class="tile"><div class="k">В среднем за 7 дней</div><div class="v">${avg != null ? esc(fmtHours(avg)) : '—'}</div><div class="d">${last7.length ? 'по ' + last7.length + ' ' + plural(last7.length, 'дню', 'дням', 'дням') + ' с записями' : 'нет данных'}</div></div>
      <div class="tile"><div class="k">Средний отбой</div><div class="v">${bed || '—'}</div><div class="d">цель: 00:00–01:00, не позже 02:00</div></div>
    </div>`;
}

function chart() {
  const days = lastDays(14);
  const series = [
    ['night', 'Ночной', 'var(--accent)'],
    ['nap', 'Досып после садика', 'var(--nap)'],
    ['day', 'Днём', 'var(--warn)'],
  ].map(([type, name, color]) => ({ name, color, values: days.map((d) => sleepOfType(d, type)) }));
  return `<div class="panel"><h3>Сон по дням, часов</h3>${barChart(dayLabels(days), series, (v) => fmt1(v))}</div>`;
}

function addForm() {
  return `<div class="panel"><h3>Добавить отрезок сна</h3>
      <form data-form="addSleep" autocomplete="off"><div class="form-grid">
        <div class="field"><label for="slType">Тип</label><select id="slType" name="type">${opt(SLEEP_TYPES, 'night')}</select></div>
        <div class="field"><label for="slStart">Лёг</label><input type="datetime-local" id="slStart" name="start" required></div>
        <div class="field"><label for="slEnd">Встал</label><input type="datetime-local" id="slEnd" name="end" required></div>
        <div class="field"><label for="slQ">Качество</label><select id="slQ" name="quality"><option value="">—</option>${opt(SLEEP_QUALITY, '')}</select></div>
      </div><button class="btn primary" type="submit">Добавить</button></form></div>`;
}

function row(s) {
  return `<li class="item"><div class="item-main" data-action="editSleep" data-id="${s.id}">
        <div class="item-title num">${hm(s.start)} → ${hm(s.end)} <span style="color:var(--muted)">· ${esc(fmtHours(sleepHours(s)))}</span></div>
        <div class="chips"><span class="chip ${s.type === 'night' ? 'ctx' : ''}">${esc(labelOf(SLEEP_TYPES, s.type))}</span>${s.quality ? `<span class="chip">качество ${s.quality}/5</span>` : ''}${s.notes ? `<span class="chip">${esc(s.notes)}</span>` : ''}</div>
        </div></li>`;
}

export function sleepView() {
  let h = head('sleep') + tiles() + chart() + addForm();
  const days = [...new Set(S.sleep.map((s) => s.day))].filter(Boolean).sort().reverse().slice(0, 21);
  if (!days.length) {
    return (
      h + empty('🌙', 'Записей сна пока нет.<br>Добавь отрезок выше или расскажи Claude утром, во сколько лёг и встал.')
    );
  }
  days.forEach((d) => {
    h +=
      `<div class="group-title">${esc(fmtDate(d))} <span class="n num">${esc(fmtHours(sleepTotal(d)))}</span></div><ul class="list">` +
      sleepOf(d).map(row).join('') +
      '</ul>';
  });
  return h;
}
