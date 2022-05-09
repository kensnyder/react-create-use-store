const { useMemo } = require('react');
const useStoreState = require('../useStoreState/useStoreState.js');
const storeRegistry = require('../storeRegistry/storeRegistry.js');

/**
 * @param {Object} storeIdOrObj - A store created with createStore()
 * @param {Function} [mapState] - Function that returns a slice of data
 * @param {Function} [equalityFn] - Custom equality function that checks if state has change
 * @return {Object} - state and tools for working with the store
 * @property {*} state - The value in the store
 * @property {Object} actions - functions defined by createStore
 * @property {Function} reset - function to reset the store's state to its initial value
 * @property {Function} nextState - function that returns a Promise that resolves on next state value
 */
function useStore(storeIdOrObj, mapState = null, equalityFn = null) {
  const store = useMemo(() => storeRegistry.get(storeIdOrObj), [storeIdOrObj]);
  const state = useStoreState(store, mapState, equalityFn);

  // make sure returned value is stable
  const used = useMemo(
    () => ({
      actions: store.actions,
      reset: store.reset,
      nextState: store.nextState,
      getOptions: store.getOptions,
      setOptions: store.setOptions,
      getMountCount: store.getMountCount,
    }),
    [store]
  );

  // but its "state" property will change when state is updated
  used.state = state;

  return used;
}

module.exports = useStore;
