import { head } from '../components/common.js';
import { dateStr, daysAgo, fmtDate } from '../lib/dates.js';
import { esc } from '../lib/dom.js';
import { items, stuckProjects } from '../model.js';
import { S } from '../state.js';

/**
 * Шаги еженедельного обзора: [фаза, [[id, заголовок, текст, куда ведёт кнопка]]].
 * Кнопка: 'process' — мастер разбора, id экрана — переход на экран, пусто — без кнопки.
 */
function steps() {
  const n = {
    inbox: items('inbox').length,
    next: items('next').length,
    waiting: items('waiting').length,
    someday: items('someday').length,
    stuck: stuckProjects().length,
  };
  return [
    [
      'Очистить',
      [
        [
          'collect',
          'Собрать всё в одно место',
          'Бумажки, заметки в телефоне, сообщения «напомни мне», открытые вкладки. Всё, что требует внимания, запиши в поле сверху.',
        ],
        [
          'mind',
          'Выгрузить голову',
          'Пробегись по сферам: работа, Ритмология, дом, здоровье, деньги, люди, обещания. Что «висит»? Запиши во Входящие.',
        ],
        [
          'inbox',
          `Разобрать Входящие до нуля${n.inbox ? ` (сейчас ${n.inbox})` : ''}`,
          'Мастер разбора задаст вопросы по каждому пункту.',
          n.inbox ? 'process' : '',
        ],
      ],
    ],
    [
      'Актуализировать',
      [
        [
          'calendar',
          'Посмотреть календарь',
          'Прошлая неделя: остались ли хвосты? Следующие две недели: что нужно подготовить заранее?',
          'calendar',
        ],
        [
          'next',
          `Пройтись по Следующим действиям (${n.next})`,
          'Отметь сделанное, удали неактуальное. Каждая формулировка должна быть понятным физическим действием.',
          'next',
        ],
        ['waiting', `Проверить Ожидание (${n.waiting})`, 'Кому пора напомнить?', 'waiting'],
        [
          'projects',
          `Проекты${n.stuck ? `: ${n.stuck} без следующего шага` : ''}`,
          'У каждого активного проекта должно быть следующее действие. Закрой завершённые.',
          'projects',
        ],
      ],
    ],
    [
      'Подумать',
      [
        [
          'someday',
          `Просмотреть «Когда-нибудь» (${n.someday})`,
          'Что-то пора начать? Что-то уже неактуально? Удали.',
          'someday',
        ],
        ['new', 'Новые идеи', 'Что хочется начать? Какие проекты появились? Запиши во Входящие.'],
      ],
    ],
  ];
}

function button(link) {
  if (link === 'process') return '<button type="button" class="btn sm" data-action="process">Разобрать</button>';
  if (link) return `<button type="button" class="btn sm" data-action="go" data-view="${link}">Открыть</button>`;
  return '';
}

export function reviewView() {
  const last = S.review.lastDone;
  let h = head(
    'review',
    last
      ? `Последний обзор: ${fmtDate(dateStr(new Date(last)))} (${daysAgo(last)} дн. назад)`
      : 'Ты ещё ни разу не проводил обзор.',
  );
  let k = 0;
  let total = 0;
  steps().forEach(([phase, arr]) => {
    h += `<div class="rphase">${phase}</div>`;
    arr.forEach(([id, title, text, link]) => {
      k++;
      total++;
      const done = !!S.review.checks[id];
      h += `<div class="rstep ${done ? 'done' : ''}">
          <button type="button" class="check ${done ? 'on' : ''}" data-action="reviewCheck" data-id="${id}" aria-label="Отметить шаг" aria-pressed="${done}"></button>
          <div class="rbody"><div class="rtitle">${k}. ${esc(title)}</div><div class="rtext">${esc(text)}</div>${button(link)}</div></div>`;
    });
  });
  const cnt = Object.values(S.review.checks).filter(Boolean).length;
  h += `<div class="row" style="margin-top:16px"><button type="button" class="btn primary" data-action="reviewFinish">Завершить обзор (${cnt}/${total})</button>
      <button type="button" class="btn ghost" data-action="reviewReset">Сбросить галочки</button></div>`;
  return h;
}
