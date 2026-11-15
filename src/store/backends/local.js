// Хранилище в localStorage браузера: для локальной разработки и работы без claude.ai.
// Данные живут только на этом устройстве. Изменения из других вкладок подхватываются.

const KEY = 'hub.local.v1';

export function localBackend() {
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch {
      return {};
    }
  };
  const write = (all) => localStorage.setItem(KEY, JSON.stringify(all));

  const watchers = new Set();
  const notify = () => queueMicrotask(() => watchers.forEach((w) => w()));
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) notify();
  });

  const collection = (all, name) =>
    Object.keys(all)
      .filter((p) => p.startsWith(name + '/') && p.indexOf('/', name.length + 1) < 0)
      .map((p) => ({ id: p.slice(name.length + 1), data: all[p] }));

  return {
    name: 'local',

    async set(path, data) {
      const all = read();
      all[path] = data;
      write(all);
      notify();
    },

    async delete(path) {
      const all = read();
      delete all[path];
      write(all);
      notify();
    },

    watchCollection(name, onDocs) {
      const fire = () => onDocs(collection(read(), name));
      watchers.add(fire);
      queueMicrotask(fire);
    },

    watchDoc(path, onDoc) {
      const fire = () => onDoc(read()[path] ?? null);
      watchers.add(fire);
      queueMicrotask(fire);
    },
  };
}
