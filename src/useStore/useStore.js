const { useState, useEffect, useDebugValue } = require('react');

/**
 * @param {Object} store - A store created with createStore()
 * @return {Object} - tools for working with the store
 * @property {*} state - The value in the store
 * @property {Object} actions - functions defined by createStore
 * @property {Function} reset - function to reset the store's state to its initial value
 * @property {Function} nextState - function that returns a Promise that resolves on next state value
 */
function useStore(store) {
  const [, setState] = useState(store.state);

  useDebugValue(store);

  useEffect(() => {
    store._subscribe(setState);
    return () => store._unsubscribe(setState);
  }, [store]);

  return {
    state: store.state,
    actions: store.actions,
    reset: store.reset,
    nextState: store.nextState,
  };
}

module.exports = useStore;
