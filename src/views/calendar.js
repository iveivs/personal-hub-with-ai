import { empty, groupTitle, head } from '../components/common.js';
import { list } from '../components/item.js';
import { addDays, today } from '../lib/dates.js';
import { items } from '../model.js';

export function calendarView() {
  const arr = items('calendar').sort((a, b) => (a.due || '').localeCompare(b.due || ''));
  let h = head('calendar');
  if (!arr.length) return h + empty('📅', 'Нет дел, привязанных к датам.');

  const t = today();
  const tm = addDays(1);
  const wk = addDays(7);
  const groups = [
    ['Просрочено', (i) => i.due < t],
    ['Сегодня', (i) => i.due === t],
    ['Завтра', (i) => i.due === tm],
    ['На этой неделе', (i) => i.due > tm && i.due <= wk],
    ['Позже', (i) => i.due > wk],
  ];
  groups.forEach(([title, fn]) => {
    const sub = arr.filter((i) => i.due && fn(i));
    if (sub.length) h += groupTitle(title, sub.length) + list(sub, { star: true });
  });
  const nodate = arr.filter((i) => !i.due);
  if (nodate.length) h += groupTitle('Без даты (поставь дату или перенеси)') + list(nodate, { star: true });
  return h;
}
