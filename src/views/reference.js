import { empty, head } from '../components/common.js';
import { list } from '../components/item.js';
import { items } from '../model.js';

export function referenceView() {
  const arr = items('reference').sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const h = head('reference');
  if (!arr.length) return h + empty('📚', 'Справочных материалов пока нет.');
  return h + list(arr, { noCheck: true, notes: true });
}
