// Экспорт всех данных в JSON и импорт задач/проектов из файла старой GTD-версии.

import { today } from './lib/dates.js';
import { plural } from './lib/format.js';
import { getItem, project } from './model.js';
import { S } from './state.js';
import { saveFile } from './store/storage.js';
import { save } from './store/sync.js';
import { askConfirm } from './ui/modal.js';
import { toast } from './ui/toast.js';

export async function exportData() {
  const data = {
    exportedAt: new Date().toISOString(),
    items: S.items,
    projects: S.projects,
    contexts: S.contexts,
    review: S.review,
    sleep: S.sleep,
    meals: S.meals,
    days: S.days,
  };
  try {
    await saveFile('personal-hub-' + today() + '.json', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
    toast('Файл не сохранён');
  }
}

/** Добавляет только новые задачи и проекты (по id). Существующее не трогает. */
export async function importFile(file) {
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch {
    toast('Не получилось прочитать файл');
    return;
  }
  const items = (Array.isArray(data.items) ? data.items : []).filter((i) => i && i.id && !getItem(i.id));
  const projects = (Array.isArray(data.projects) ? data.projects : []).filter((p) => p && p.id && !project(p.id));
  if (!items.length && !projects.length) {
    toast('Новых задач и проектов в файле нет');
    return;
  }
  askConfirm(
    `Добавить из файла ${items.length} ${plural(items.length, 'задачу', 'задачи', 'задач')} и ${projects.length} ${plural(projects.length, 'проект', 'проекта', 'проектов')}? Существующее не изменится.`,
    'Добавить',
    () => {
      projects.forEach((p) =>
        S.projects.push(Object.assign({ outcome: '', status: 'active', createdAt: Date.now() }, p)),
      );
      items.forEach((i) => S.items.push(Object.assign({ notes: '', status: 'inbox', createdAt: Date.now() }, i)));
      if (Array.isArray(data.contexts)) {
        data.contexts.forEach((c) => {
          if (typeof c === 'string' && !S.contexts.includes(c)) S.contexts.push(c);
        });
      }
      save();
      toast('Импортировано');
    },
  );
}
