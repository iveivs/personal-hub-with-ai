import { STATUS } from '../config.js';
import { today } from '../lib/dates.js';
import { $ } from '../lib/dom.js';
import { plural } from '../lib/format.js';
import { getItem } from '../model.js';
import { openEditItem } from '../editors/item.js';
import { S } from '../state.js';
import { save } from '../store/sync.js';
import { askConfirm, closeModal } from '../ui/modal.js';
import { render } from '../ui/render.js';
import { toast } from '../ui/toast.js';
import { isOldDone } from '../views/done.js';
import { removeWithUndo } from './remove.js';

export const itemActions = {
  /** Кружок: отметить сделанным или вернуть обратно. */
  toggle(el) {
    const id = el.dataset.id;
    const it = getItem(id);
    if (!it) return;
    if (it.status === 'done') {
      it.status = it.prevStatus || 'next';
      it.doneAt = null;
      save();
      render();
      toast('Вернул в «' + STATUS[it.status] + '»');
      return;
    }
    const prev = it.status;
    it.prevStatus = prev;
    it.status = 'done';
    it.doneAt = Date.now();
    save();
    render();
    toast('Сделано ✓', () => {
      const x = getItem(id);
      if (!x) return;
      x.status = prev;
      x.doneAt = null;
      save();
      render();
    });
  },

  /** Звёздочка: в фокус на сегодня или из фокуса. */
  focus(el) {
    const it = getItem(el.dataset.id);
    if (!it) return;
    const t = today();
    it.focus = it.focus === t ? null : t;
    save();
    render();
    toast(it.focus ? 'В фокусе на сегодня ⭐' : 'Убрал из фокуса');
  },

  edit(el) {
    openEditItem(el.dataset.id);
  },

  saveItem(el) {
    const it = getItem(el.dataset.id);
    if (!it) {
      closeModal();
      return;
    }
    const v = (id) => $('#' + id).value;
    it.title = v('eTitle').trim() || it.title;
    const st = v('eStatus');
    if (st === 'done' && it.status !== 'done') {
      it.prevStatus = it.status;
      it.doneAt = Date.now();
    }
    if (st !== 'done') it.doneAt = null;
    it.status = st;
    it.context = v('eCtx') || null;
    it.projectId = v('eProj') || null;
    it.time = v('eTime') || null;
    it.energy = v('eEnergy') || null;
    it.due = v('eDue') || null;
    it.waitingFor = v('eWho').trim();
    it.notes = v('eNotes');
    const t = today();
    it.focus = $('#eFocus').checked ? t : it.focus === t ? null : it.focus || null;
    it.urgent = $('#eUrgent').checked;
    if (st === 'calendar' && !it.due) toast('Для Календаря лучше указать дату');
    save();
    closeModal();
  },

  deleteItem(el) {
    removeWithUndo('items', el.dataset.id);
  },

  toInbox(el) {
    const it = getItem(el.dataset.id);
    if (!it) return;
    it.status = 'inbox';
    it.doneAt = null;
    save();
    closeModal();
    toast('Вернул во Входящие');
  },

  /** «Пора делать» из «Когда-нибудь»: назад во Входящие на разбор. */
  activate(el) {
    const it = getItem(el.dataset.id);
    if (!it) return;
    it.status = 'inbox';
    save();
    render();
    toast('Во Входящих. Разбери его, чтобы определить следующий шаг');
  },

  clearDone() {
    const n = S.items.filter(isOldDone).length;
    askConfirm(
      `Удалить ${n} ${plural(n, 'сделанную задачу', 'сделанные задачи', 'сделанных задач')} старше 30 дней?`,
      'Удалить',
      () => {
        S.items = S.items.filter((i) => !isOldDone(i));
        save();
      },
    );
  },
};
