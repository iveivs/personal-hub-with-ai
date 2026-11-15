import { empty, head } from '../components/common.js';
import { list } from '../components/item.js';
import { byCreated, items } from '../model.js';

export function waitingView() {
  const arr = items('waiting').sort(byCreated);
  const h = head('waiting');
  if (!arr.length) return h + empty('⏳', 'Ты ничего ни от кого не ждёшь.');
  return h + list(arr, { age: true });
}
