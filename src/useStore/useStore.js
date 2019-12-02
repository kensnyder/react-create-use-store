import { useState, useEffect, useDebugValue } from 'react';

/**
 * @param {Object} store - A store created with createStore()
 * @return {Object} - tools for working with the store
 * @property {*} state - The values in the store
 * @property {Object} actions - functions defined by createStore
 * @property {Function} reset - function to reset the store's state to its initial value
 */
export function useStore(store) {
  const [state, setState] = useState(store._getState());
  useDebugValue({ storeIdx: store.idx, storeId: store.id, state });

  useEffect(() => {
    store._subscribe(setState);
    return () => store._unsubscribe(setState);
  }, [store]);

  return {
    state,
    actions: store._actions,
    reset: store.reset,
  };
}
