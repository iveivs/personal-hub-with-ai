// Хранилище в базе артефакта claude.ai (window.claude.use('db')).
// Эту же базу читает и пишет Claude в чате, поэтому изменения видны обоим.

export function claudeBackend(db) {
  return {
    name: 'claude',

    set: (path, data) => db.doc(path).set(data),

    delete: (path) => db.doc(path).delete(),

    watchCollection(name, onDocs, onError) {
      db.collection(name).onSnapshot((snap) => onDocs(snap.docs.map((d) => ({ id: d.id, data: d.data() }))), onError);
    },

    watchDoc(path, onDoc, onError) {
      db.doc(path).onSnapshot((d) => onDoc(d.exists ? d.data() : null), onError);
    },
  };
}
