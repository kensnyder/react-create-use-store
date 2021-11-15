const { useState, useEffect, useMemo } = require('react');

/**
 * @param {Object} store - A store created with createStore()
 * @param {*} [options] - Options that the store may respond to
 * @return {Object} - tools for working with the store
 * @property {*} state - The value in the store
 * @property {Object} actions - functions defined by createStore
 * @property {Function} reset - function to reset the store's state to its initial value
 * @property {Function} nextState - function that returns a Promise that resolves on next state value
 */
function useStore(store, options = null) {
  const [, setState] = useState(store.state);

  useEffect(() => {
    store._subscribe(setState);
    return () => store._unsubscribe(setState);
  }, [store]);

  useEffect(() => {
    store.setOptions(options);
  }, [store, options]);

  return useMemo(
    () => ({
      state: store.state,
      actions: store.actions,
      reset: store.reset,
      nextState: store.nextState,
      setOptions: store.setOptions,
    }),
    [store.state]
  );
}

module.exports = useStore;
