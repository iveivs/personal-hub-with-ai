import { S } from '../state.js';
import { save } from '../store/sync.js';
import { closeModal } from '../ui/modal.js';
import { render } from '../ui/render.js';
import { toast } from '../ui/toast.js';

/** Удалить запись из S[kind], закрыть окно и предложить «Отменить». */
export function removeWithUndo(kind, id) {
  const idx = S[kind].findIndex((x) => x.id === id);
  if (idx < 0) return;
  const [removed] = S[kind].splice(idx, 1);
  save();
  closeModal();
  toast('Удалено', () => {
    S[kind].push(removed);
    save();
    render();
  });
}
