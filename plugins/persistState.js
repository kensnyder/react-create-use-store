//
// TO USE:
// store.plugin(persistState(localStorage));
//
function persistState(storage) {
  if (
    typeof storage.getItem !== 'function' ||
    typeof storage.setItem !== 'function'
  ) {
    throw new Error(
      'storekeeper: persistState must receive a storage object such as localStorage or sessionStorage'
    );
  }
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
