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
 * @property {String} [config.id] - The id string for debugging
 * @return {Object} store - Info and methods for working with the store
 * @property {String} store.id - The id or number of the store
 * @property {Number} store.idx - The index order of the store in order of definition
 * @property {Function} store.addActions - Register more actions for this store
 * @property {Function} store.reset - Reset the store's state to its original value
 * @property {Object} store.actions - Methods that can be called to affect state
 * @property {Function} nextState - function that returns a Promise that resolves on next state value
 * @property {Function} store._subscribe - A method to add a setState callback that should be notified on changes
 * @property {Function} store._unsubscribe - A method to remove a setState callback
 * @property {Number} store._usedCount - The number of components that have ever used this store
 */
export function createStore({
  state = {},
  actions = {},
  autoReset = false,
  onFirstUse = () => {},
  afterFirstMount = () => {},
  afterEachMount = () => {},
  afterEachUnmount = () => {},
  afterLastUnmount = () => {},
  id = null,
}) {
  // list of setState functions for Components that use this store
  let _setters = [];
  // list of resolve functions for awaiting nextState
  let _nextStateResolvers = [];

  // define the store object,
  // which should normally not be consumed directly
  const store = {
    // A store's state can be reset to its original value
    reset: () => _setAll(state),
    // add more action functions to this state
    addActions,
    // the value represented
    state: state,
    // set the state and update all components that use this store
    setState: _setAll,
    // return a Promise that will be resolve on next state change
    nextState,
    // functions that receive [state, setState] as the first argument
    // and act on state
    actions: {},
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
  };

  // add any actions that are given at this time
  addActions(actions);

  // return this store
  return store;

  //
  // functions only beyond this point
  //

  /**
   * Add action functions to this state
   * @param {Object} actions
   */
  function addActions(actions) {
    // create dependency-injected versions of the given action functions
    Object.keys(actions).forEach(name => {
      const action = actions[name];
      store.actions[name] = (...args) => {
        return action([store.state, _setAll], ...args);
      };
    });
  }

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
      onFirstUse([store.state, _setAll]);
    }
    if (_setters.length === 0) {
      afterFirstMount([store.state, _setAll]);
    }
    if (_setters.indexOf(setState) === -1) {
      _setters.push(setState);
      afterEachMount([store.state, _setAll]);
    }
  }

  /**
   * Remove a setState function from notification when state changes
   * @param {Function} setState - Function returned from the useState() inside useStore()
   * @private
   */
  function _unsubscribe(setState) {
    _setters = _setters.filter(setter => setter !== setState);
    afterEachUnmount([store.state, _setAll]);
    if (_setters.length === 0) {
      if (autoReset) {
        store.reset();
      }
      afterLastUnmount([store.state, _setAll]);
    }
  }

  /**
   * Notify each of the setState functions of the new state
   * @param {*} newState
   * @private
   */
  function _setAll(newState) {
    if (typeof newState === 'function') {
      newState = newState(store.state);
    }
    // queue state update for next tick
    // see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/queueMicrotask
    Promise.resolve()
      .then(() => {
        store.state = newState;
        _setters.forEach(setter => setter(store.state));
        _nextStateResolvers.forEach(resolver => resolver(store.state));
        _nextStateResolvers = [];
      })
      .catch(e => {
        throw e;
      });
  }
}
