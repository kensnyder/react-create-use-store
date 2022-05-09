const { useState, useEffect, useMemo } = require('react');
const defaultEqualityFn = require('../defaultEqualityFn/defaultEqualityFn.js');
const getMapper = require('../getMapper/getMapper.js');
const storeRegistry = require('../storeRegistry/storeRegistry.js');

/**
 * @param {Object} store - A store created with createStore()
 * @param {Function} [mapState] - Function that returns a slice of data
 * @param {Function} [equalityFn] - Custom equality function that checks if state has change
 * @return {Object} - tools for working with the store
 * @property {*} state - The value in the store
 * @property {Object} actions - functions defined by createStore
 * @property {Function} reset - function to reset the store's state to its initial value
 * @property {Function} nextState - function that returns a Promise that resolves on next state value
 */
function useStoreState(storeIdOrObj, mapState = null, equalityFn = null) {
  const store = useMemo(() => storeRegistry.get(storeIdOrObj), [storeIdOrObj]);
  // derive and cache the mapState and equalityFn
  const [map, isEqual] = useMemo(() => {
    if (mapState === null && equalityFn === null) {
      return [null, null];
    }
    return [getMapper(mapState), equalityFn || defaultEqualityFn];
    // assume "mapState" and "equalityFn" args are stable like redux does
  }, []);

  // derive the initial state, if different because of mapState or equalityFn
  const initialState = useMemo(() => {
    return map ? map(store.state) : store.state;
  }, [store, map]);

  // use useState to get a method for triggering rerenders in consumer components
  const [partialState, setPartialState] = useState(initialState);

  // on first mount, save that setState method as a trigger
  useEffect(() => {
    store._subscribe(setPartialState);
    return () => store._unsubscribe(setPartialState);
  }, [store, setPartialState]);

  // update the mapState and equalityFn that are registered
  useEffect(() => {
    setPartialState.mapState = map;
    setPartialState.equalityFn = isEqual;
  }, [setPartialState, map, isEqual]);

  // return that slice or whole bit of state
  return partialState;
}

module.exports = useStoreState;
