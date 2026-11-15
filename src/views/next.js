import { empty, groupTitle, head } from '../components/common.js';
import { list } from '../components/item.js';
import { TIMES } from '../config.js';
import { esc } from '../lib/dom.js';
import { byCreated, byDue, items } from '../model.js';
import { S, UI } from '../state.js';

const NO_CTX = 'Без контекста';
const ENERGY_RANK = { low: 1, mid: 2, high: 3 };

const pill = (key, val, label) =>
  `<button type="button" class="pill ${UI[key] === val ? 'on' : ''}" data-action="filter" data-key="${key}" data-val="${esc(val)}">${esc(label)}</button>`;

function filters() {
  return `<div class="filters">
      <div class="frow"><span class="flabel">Где я сейчас:</span>${pill('ctx', 'all', 'Везде')}${S.contexts.map((c) => pill('ctx', c, c)).join('')}${pill('ctx', 'none', NO_CTX)}</div>
      <div class="frow"><span class="flabel">Есть времени:</span>${pill('time', 'any', 'Сколько угодно')}${TIMES.slice(
        0,
        3,
      )
        .map((t) => pill('time', t[0], 'до ' + t[1]))
        .join('')}</div>
      <div class="frow"><span class="flabel">Сил:</span>${pill('energy', 'any', 'Любые')}${pill('energy', 'low', 'Мало')}${pill('energy', 'mid', 'Средне')}</div>
    </div>`;
}

/** Подходит ли задача под выбранные «где я», «сколько времени» и «сколько сил». */
function matches(i) {
  if (UI.ctx === 'none' && i.context) return false;
  if (UI.ctx !== 'all' && UI.ctx !== 'none' && i.context !== UI.ctx && i.context !== '@везде') return false;
  if (UI.time !== 'any' && i.time && Number(i.time) > Number(UI.time)) return false;
  if (UI.energy !== 'any' && i.energy && ENERGY_RANK[i.energy] > ENERGY_RANK[UI.energy]) return false;
  return true;
}

export function nextView() {
  const all = items('next');
  const ctxs = S.contexts;
  const h = head('next') + filters();
  if (!all.length) return h + empty('🌱', 'Пока нет следующих действий.<br>Они появятся, когда разберёшь Входящие.');
  const filtered = all.filter(matches);
  if (!filtered.length) {
    return h + empty('🔍', 'Под эти условия ничего не подходит.<br>Попробуй другой контекст или сними фильтры.');
  }

  const groups = {};
  filtered.forEach((i) => (groups[i.context || NO_CTX] ||= []).push(i));
  const known = [...ctxs, NO_CTX].filter((c) => groups[c]);
  const other = Object.keys(groups).filter((c) => !ctxs.includes(c) && c !== NO_CTX);

  return (
    h +
    [...known, ...other]
      .map((c) => {
        const arr = groups[c].sort((a, b) => byDue(a, b) || byCreated(a, b));
        return groupTitle(c, arr.length) + list(arr, { star: true });
      })
      .join('')
  );
}
