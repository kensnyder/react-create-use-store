const { useState, useEffect, useMemo } = require('react');

/**
 * @param {Object} store - A store created with createStore()
 * @return {Object} - tools for working with the store
 * @property {*} state - The value in the store
 * @property {Object} actions - functions defined by createStore
 * @property {Function} reset - function to reset the store's state to its initial value
 * @property {Function} nextState - function that returns a Promise that resolves on next state value
 */
function useStoreState(store) {
  // derive the initial state, in case plugins are injecting initial state
  const initialState = useMemo(() => {
    if (store.getMountCount() === 0) {
      store.emit('BeforeInitialState');
    }
    return store.getState();
  }, [store]);

  // use useState to get a method for triggering rerenders in consumer components
  const [state, setState] = useState(initialState);

  // on first mount, save that setState method as a trigger
  useEffect(() => {
    store._subscribe(setState);
    return () => store._unsubscribe(setState);
  }, [store, setState]);

  // return the current state
  return state;
}

module.exports = useStoreState;
