// an internal counter for stores
let storeIdx = 1;

/**
 * Creates a new store
 * @param {Object} [config] - An object containing the store setup
 * @property {Object} [config.state] - The store's initial state. It can be of any type.
 * @property {Object} [config.actions] - Named functions that can be dispatched by name and payload.
 * @property {Boolean} [config.autoReset] - If true, reset the store when all consumer components unmount
 * @property {Function} [config.onFirstUse] - Callback the very first time a component calls useStore()
 * @property {Function} [config.afterFirstMount] - Callback when a useStore() component mounts when no other are mounted
 * @property {Function} [config.afterEachMount] - Callback every time a component first calls useStore()
 * @property {Function} [config.afterEachUnmount] - Callback when any useStore() component unmounts
 * @property {Function} [config.afterLastUnmount] - Callback when all user components unmount
 * @property {Function} [config.onException] - Callback when an updater function throws an Error
 * @property {String} [config.id] - The id string for debugging
 * @return {Object} store - Info and methods for working with the store
 * @property {Function} store.state - the current state value
 * @property {Object} store.actions - Methods that can be called to affect state
 * @property {Function} store.setState - function to set a new state value
 * @property {Function} store.nextState - function that returns a Promise that resolves on next state value
 * @property {Function} store.reset - Reset the store's state to its original value
 * @property {String} store.id - The id or number of the store
 * @property {Number} store.idx - The index order of the store in order of definition
 * @property {Function} store._subscribe - A method to add a setState callback that should be notified on changes
 * @property {Function} store._unsubscribe - A method to remove a setState callback
 * @property {Number} store._usedCount - The number of components that have ever used this store
 */
function createStore({
  state = {},
  actions = {},
  autoReset = false,
  onFirstUse = () => {},
  afterFirstMount = () => {},
  afterEachMount = () => {},
  afterEachUnmount = () => {},
  afterLastUnmount = () => {},
  onException = () => {},
  id = null,
}) {
  // list of setState functions for Components that use this store
  const _setters = [];
  // list of resolve functions for awaiting nextState
  const _nextStateResolvers = [];
  // list of functions that will manipulate state in the next tick
  const _updaterFunctionQueue = [];

  // define the store object,
  // which should normally not be consumed directly
  const store = {
    // A store's state can be reset to its original value
    reset: () => _setAll(state),
    // the value represented
    state: state,
    // set the state and update all components that use this store
    setState: _setAll,
    // return a Promise that will be resolve on next state change
    nextState,
    // synchronously update state
    flushState,
    // functions that act on state
    actions,
    // options that a component can pass to store without re-rendering
    options: null,
    // a function that sets any options
    setOptions: _setOptions,
    // an identifier for debugging
    id: String(id || `store-${storeIdx}`),
    // internal counter
    idx: storeIdx++,
    // private: useStore() can subscribe to all store changes
    _subscribe,
    // private: useStore() can unsubscribe from changes
    _unsubscribe,
    // private: A count of the number of times this store has ever been used
    _usedCount: 0,
    _updaterFunctionQueue: [],
  };

  // return this store
  return store;

  //
  // functions only beyond this point
  //

  /**
   * Return a promise that resolves after the state is next updated for all components
   * @return {Promise<Object>}  Promise that resolves to the new state
   */
  function nextState() {
    return new Promise(resolve => {
      _nextStateResolvers.push(resolve);
    });
  }

  /**
   * Add a setState function to notify when state changes
   * @param {Function} setState - Function returned from the useState() inside useStore()
   * @private
   */
  function _subscribe(setState) {
    if (store._usedCount++ === 0) {
      onFirstUse();
    }
    if (_setters.length === 0) {
      afterFirstMount();
    }
    if (_setters.indexOf(setState) === -1) {
      _setters.push(setState);
      afterEachMount();
    }
  }

  /**
   * Remove a setState function from notification when state changes
   * @param {Function} setState - Function returned from the useState() inside useStore()
   * @private
   */
  function _unsubscribe(setState) {
    const idx = _setters.indexOf(setState);
    if (idx > -1) {
      _setters.splice(idx, 1);
    }
    afterEachUnmount();
    if (_setters.length === 0) {
      if (autoReset) {
        store.reset();
      }
      afterLastUnmount();
    }
  }

  /**
   * Notify each of the setState functions of the new state
   * @param {*} newState
   * @private
   */
  function _setAll(newState, options = { flush: false }) {
    let updater;
    if (typeof newState === 'function') {
      updater = newState;
    } else {
      updater = () => newState;
    }
    _updaterFunctionQueue.push(updater);
    if (options.flush) {
      flushState();
    } else if (_updaterFunctionQueue.length === 1) {
      _scheduleUpdates();
    }
  }

  /**
   * Set any additional options the store may respond to.
   * Options are state values that do not cause re-renders.
   * @param {*} [options]
   * @private
   */
  function _setOptions(options = null) {
    store.options = options;
  }

  /**
   * Update state on next tick
   * @private
   */
  function _scheduleUpdates() {
    // queue state update for next tick
    // see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/queueMicrotask
    Promise.resolve().then(flushState);
  }

  /**
   * Update state
   */
  function flushState() {
    try {
      // run all updaters
      _updaterFunctionQueue.forEach(
        updater => (store.state = updater(store.state))
      );
      _updaterFunctionQueue.length = 0;
      // update all components
      _setters.forEach(setter => setter(store.state));
      // resolve all `await store.nextState()` calls
      _nextStateResolvers.forEach(resolver => resolver(store.state));
      _nextStateResolvers.length = 0;
    } catch (e) {
      onException(e);
    }
  }
}

module.exports = createStore;
