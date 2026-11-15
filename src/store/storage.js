// Интерфейс хранилища. Остальной код работает только с ним и не знает, где лежат данные.
//
// Хранилище — набор документов по путям 'коллекция/id' (например 'items/abc123', 'meta/state').
// Любая реализация (backend) обязана уметь:
//
//   set(path, data)                          → Promise   записать документ целиком
//   delete(path)                             → Promise   удалить документ
//   watchCollection(name, onDocs, onError)               подписка на коллекцию;
//                                                        onDocs([{ id, data }]) зовётся сразу
//                                                        и после каждого изменения
//   watchDoc(path, onDoc, onError)                       подписка на документ; onDoc(data | null)
//
// Чтобы переехать на свой сервер, достаточно написать backends/api.js с этими же
// четырьмя методами и вернуть его из pickBackend().

import { claudeBackend } from './backends/claude.js';
import { localBackend } from './backends/local.js';

/** Внутри артефакта на claude.ai есть window.claude. */
export const inClaude = () => !!(window.claude && window.claude.use);

/**
 * Выбирает хранилище для текущего окружения.
 * Возвращает null, если внутри claude.ai база недоступна (например, открыто без входа).
 */
export async function pickBackend() {
  if (inClaude()) {
    const db = await window.claude.use('db');
    return db ? claudeBackend(db) : null;
  }
  return localBackend();
}

/** Сохранить файл на устройство пользователя (экспорт). */
export async function saveFile(filename, text) {
  if (inClaude()) {
    const dl = await window.claude.use('downloads');
    if (!dl) throw new Error('downloads unavailable');
    await dl.save({ filename, data: text });
    return;
  }
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
