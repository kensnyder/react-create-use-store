// store.plugin(persistWith(localStorage));

function persistWith(storage) {
  return function plugin(store) {
    store.on('BeforeInitialState', () => {
      store.state = storage.getItem(store.id);
      // OR
      store.setStateSync(storage.getItem(store.id));
    });
    store.on('AfterUpdate', (prev, next) => {
      storage.setItem(store.id, next);
    });
  };
}
