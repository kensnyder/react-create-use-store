const { useMemo } = require('react');
const useStoreState = require('../useStoreState/useStoreState.js');
const getComputerFunction = require('../getComputerFunction/getComputerFunction.js');
const storeRegistry = require('../storeRegistry/storeRegistry.js');

/**
 * @param {Object} storeIdOrObj - A store created with createStore()
 * @param {Function|String} [computer] - Function that takes a state and returns a single value
 * @param {Function|String|String[]} [mapState] - Function that returns a slice of data
 * @param {Function|String|String[]} [equalityFn] - Custom equality function that checks if state has change
 * @return {*} - The computed state
 */
function useStoreComputed(
  storeIdOrObj,
  computer,
  mapState = null,
  equalityFn = null
) {
  const store = useMemo(() => storeRegistry.get(storeIdOrObj), [storeIdOrObj]);
  const computerFunction = useMemo(
    () => getComputerFunction(computer),
    // assume "computer" arg is stable like redux does
    []
  );
  const state = useStoreState(store, mapState, equalityFn);
  return useMemo(() => computerFunction(state), [state, computerFunction]);
}

module.exports = useStoreComputed;
