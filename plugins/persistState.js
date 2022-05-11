// store.plugin(persistState(localStorage));

function persistState(storage) {
  return function plugin(store) {
    store.on('BeforeInitialState', () => {
      store.setSync(storage.getItem(store.id));
    });
    store.on('AfterUpdate', ({ data: { next } }) => {
      storage.setItem(store.id, next);
    });
  };
}

module.exports = persistState;
