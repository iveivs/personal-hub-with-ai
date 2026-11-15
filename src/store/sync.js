// Синхронизация состояния S с хранилищем.
//
// Подписки: при любом изменении в хранилище (своём, из другой вкладки или от Claude)
// соответствующая часть S заменяется целиком, и интерфейс перерисовывается.
//
// Запись: save() сравнивает S с последним известным состоянием хранилища (SYNC)
// и отправляет только изменившиеся документы. Операции над одним документом
// выстраиваются в очередь, чтобы не обгонять друг друга.

import { DEFAULT_CONTEXTS } from '../config.js';
import { stable } from '../lib/format.js';
import { S } from '../state.js';
import { pickBackend } from './storage.js';

const KINDS = ['items', 'projects', 'sleep', 'meals'];
const NEEDED = [...KINDS, 'days', 'meta'];

let backend = null;
let dbState = 'loading'; // loading | ready | off
let metaExists = false;
const loaded = {};
const SYNC = { items: {}, projects: {}, sleep: {}, meals: {}, days: {}, meta: null };
const QUEUE = {};

// Колбэки задаёт main.js при подключении — так модуль не зависит от интерфейса.
let hooks = { onChange: () => {}, onFail: () => {}, onMessage: () => {} };

export const isReady = () => dbState === 'ready' && NEEDED.every((k) => loaded[k]);
export const isOff = () => dbState === 'off';
export const hasMeta = () => metaExists;

const clone = (o) => JSON.parse(JSON.stringify(o || {}));
const bodyOf = (o) => {
  const b = Object.assign({}, o);
  delete b.id;
  return b;
};
const metaOf = () => ({ contexts: S.contexts, review: S.review, started: true });

function errorText(e) {
  const c = e && e.code;
  if (c === 'quota_exceeded') return 'Место в базе закончилось. Удали старые записи в «Сделано».';
  if (c === 'invalid_argument') return 'Не сохранилось: у этого просмотра нет прав на запись.';
  if (c === 'revoked') return 'Доступ к базе закрыт. Обнови страницу.';
  return 'Не сохранилось. Проверь интернет и повтори.';
}

function enqueue(path, op) {
  const prev = QUEUE[path] || Promise.resolve();
  const p = prev.then(op).catch((err) => {
    console.error(err);
    hooks.onMessage(errorText(err));
  });
  QUEUE[path] = p;
  return p;
}

function put(path, json) {
  const data = JSON.parse(json);
  enqueue(path, () => backend.set(path, data));
}

/** Отправить в хранилище всё, что изменилось в S с последней синхронизации. */
export function save() {
  if (!backend) {
    hooks.onMessage('База недоступна: изменения не сохранятся');
    return;
  }
  KINDS.forEach((k) => {
    const seen = new Set();
    S[k].forEach((o) => {
      seen.add(o.id);
      const j = stable(bodyOf(o));
      if (SYNC[k][o.id] !== j) {
        SYNC[k][o.id] = j;
        put(k + '/' + o.id, j);
      }
    });
    Object.keys(SYNC[k]).forEach((id) => {
      if (seen.has(id)) return;
      delete SYNC[k][id];
      const path = k + '/' + id;
      enqueue(path, () => backend.delete(path));
    });
  });
  Object.keys(S.days).forEach((d) => {
    const j = stable(S.days[d]);
    if (SYNC.days[d] !== j) {
      SYNC.days[d] = j;
      put('days/' + d, j);
    }
  });
  const mj = stable(metaOf());
  if (SYNC.meta !== mj) {
    SYNC.meta = mj;
    metaExists = true;
    put('meta/state', mj);
  }
}

function lost(key) {
  return (err) => {
    if (err) console.error(err);
    loaded[key] = true;
    if (KINDS.includes(key)) hooks.onMessage('Связь с базой оборвалась. Обнови страницу.');
    hooks.onChange();
  };
}

function watchKind(k) {
  backend.watchCollection(
    k,
    (docs) => {
      const arr = [];
      const map = {};
      docs.forEach(({ id, data }) => {
        const o = clone(data);
        o.id = id;
        arr.push(o);
        map[id] = stable(bodyOf(o));
      });
      S[k] = arr;
      SYNC[k] = map;
      loaded[k] = true;
      hooks.onChange();
    },
    lost(k),
  );
}

function watchDays() {
  backend.watchCollection(
    'days',
    (docs) => {
      const days = {};
      const map = {};
      docs.forEach(({ id, data }) => {
        days[id] = clone(data);
        map[id] = stable(days[id]);
      });
      S.days = days;
      SYNC.days = map;
      loaded.days = true;
      hooks.onChange();
    },
    lost('days'),
  );
}

function watchMeta() {
  backend.watchDoc(
    'meta/state',
    (data) => {
      if (data) {
        const m = clone(data);
        S.contexts = Array.isArray(m.contexts) && m.contexts.length ? m.contexts : DEFAULT_CONTEXTS.slice();
        S.review = m.review || { checks: {}, lastDone: null };
        S.review.checks = S.review.checks || {};
        metaExists = true;
        SYNC.meta = stable(metaOf());
      }
      loaded.meta = true;
      hooks.onChange();
    },
    lost('meta'),
  );
}

/**
 * Подключиться к хранилищу и подписаться на все коллекции.
 * @param {{ onChange: Function, onFail: Function, onMessage: (text: string) => void }} h
 */
export async function connect(h) {
  hooks = Object.assign(hooks, h);
  try {
    backend = await pickBackend();
  } catch (err) {
    console.error(err);
    backend = null;
  }
  if (!backend) {
    dbState = 'off';
    hooks.onFail();
    return;
  }
  dbState = 'ready';
  KINDS.forEach(watchKind);
  watchDays();
  watchMeta();
}
