import { $ } from '../lib/dom.js';
import { plural } from '../lib/format.js';
import { project } from '../model.js';
import { openEditProject } from '../editors/project.js';
import { S } from '../state.js';
import { save } from '../store/sync.js';
import { askConfirm, closeModal } from '../ui/modal.js';
import { render } from '../ui/render.js';
import { toast } from '../ui/toast.js';

export const projectActions = {
  editProject(el) {
    openEditProject(el.dataset.id);
  },

  saveProject(el) {
    const p = project(el.dataset.id);
    if (!p) {
      closeModal();
      return;
    }
    p.title = $('#pTitleE').value.trim() || p.title;
    p.outcome = $('#pOutE').value.trim();
    p.status = $('#pStatE').value;
    save();
    closeModal();
  },

  /** Удалить проект; его задачи остаются, но без проекта. */
  deleteProject(el) {
    const id = el.dataset.id;
    const p = project(id);
    if (!p) return;
    const n = S.items.filter((i) => i.projectId === id && i.status !== 'done').length;
    const tail = n
      ? `\nЕго ${n} ${plural(n, 'задача останется', 'задачи останутся', 'задач останутся')} без проекта.`
      : '';
    askConfirm(`Удалить проект «${p.title}»?` + tail, 'Удалить проект', () => {
      S.projects = S.projects.filter((x) => x.id !== id);
      S.items.forEach((i) => {
        if (i.projectId === id) i.projectId = null;
      });
      save();
    });
  },

  /** Завершить проект; открытые задачи закрываются вместе с ним (после подтверждения). */
  projectDone(el) {
    const id = el.dataset.id;
    if (!project(id)) return;
    const openTasks = () =>
      S.items.filter((i) => i.projectId === id && !['done', 'reference', 'someday'].includes(i.status));
    const finish = () => {
      const p = project(id);
      if (!p) return;
      openTasks().forEach((i) => {
        i.prevStatus = i.status;
        i.status = 'done';
        i.doneAt = Date.now();
      });
      p.status = 'done';
      save();
      toast('Проект завершён 🎉');
    };
    const n = openTasks().length;
    if (n) {
      askConfirm(
        `У проекта ещё ${n} ${plural(n, 'открытая задача', 'открытые задачи', 'открытых задач')}. Отметить их сделанными и закрыть проект?`,
        'Закрыть проект',
        finish,
      );
    } else {
      finish();
      render();
    }
  },

  projectActivate(el) {
    const p = project(el.dataset.id);
    if (!p) return;
    p.status = 'active';
    save();
    render();
    toast('Проект активен. Добавь ему следующее действие');
  },
};
