const Emitter = require('tiny-emitter');
const isPromise = require('is-promise');

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
  state: initialState = {},
  actions = {},
  autoReset = false,
  id = null,
}) {
  // list of setState functions for Components that use this store
  const _setters = [];
  // list of resolve functions for awaiting nextState
  const _nextStateResolvers = [];
  // list of functions that will manipulate state in the next tick
  const _updateQueue = [];
  // state maintained by the store that does not trigger re-renders
  let _options = null;

  // define the store object,
  // which should normally not be consumed directly
  const store = Object.assign(new Emitter(), {
    // the value represented
    state: initialState,
    // functions that act on state
    actions,
    // an identifier for debugging
    id: String(id || `store-${storeIdx}`),
    // internal counter
    idx: storeIdx++,
    // set the state and update all components that use this store
    setState,
    // setSync: (values) => store.state = values;
    // mergeSync: (values) => store.state = ({...store.state, ...values});
    // set partial state
    mergeState,
    // utility for create an action function that sets a single value
    createSetter,
    // create a new store with the same initial state and options
    clone,
    // A store's state can be reset to its original value
    reset,
    // return a Promise that will resolve on next state change
    nextState,
    // get the number of mounted components using this state
    getMountCount,
    // set options that a component can pass to store without causing a re-render
    getOptions,
    // a function that sets any options
    setOptions,
    // register a plugin
    plugin,
    // number of components that are currently using this store
    mountCount: 0,
    // private: useStore() can subscribe to all store changes
    _subscribe,
    // private: useStore() can unsubscribe from changes
    _unsubscribe,
    // private: A count of the number of times this store has ever been used
    _usedCount: 0,
  });

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
      store.emit('AfterFirstUse');
    }
    if (_setters.length === 0) {
      store.emit('AfterFirstMount');
    }
    if (_setters.indexOf(setState) === -1) {
      _setters.push(setState);
      store.emit('AfterMount');
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
    store.emit('AfterUnmount');
    if (_setters.length === 0) {
      if (autoReset) {
        store.reset();
      }
      store.emit('AfterLastUnmount');
    }
  }

  function clone(overrides = {}) {
    return createStore({
      e: { ...store.e }, // events that have been registered
      state: initialState,
      actions,
      autoReset,
      ...overrides,
    });
  }

  function reset() {
    setState(initialState);
  }

  /**
   *
   * @return {number}
   * @private
   */
  function getMountCount() {
    return _setters.length;
  }

  /**
   * Notify each of the setState functions of the new state
   * @param {*} newState
   * @private
   */
  function setState(newState) {
    _updateQueue.push(newState);
    if (_updateQueue.length === 1) {
      _scheduleUpdates();
    }
  }

  function setSync(newState) {
    if (typeof newState === 'function') {
      newState = newState(store.state);
    }
    store.state = newState;
  }

  function mergeState(newState) {
    let updater;
    if (typeof newState === 'function') {
      updater = async old => {
        let partial = newState(old);
        if (isPromise(partial)) {
          partial = await partial;
        }
        return { ...old, ...partial };
      };
    } else {
      updater = old => ({ ...old, ...newState });
    }
    _updateQueue.push(updater);
    if (_updateQueue.length === 1) {
      _scheduleUpdates();
    }
  }

  function mergeSync(newState) {
    if (typeof newState === 'function') {
      newState = newState(store.state);
    }
    store.state = { ...store.state, ...newState };
  }

  function createSetter(propName) {
    return function merger(newValue) {
      if (typeof newValue === 'function') {
        store.setState(async state => {
          newValue = newValue(state[propName]);
          if (isPromise(newValue)) {
            newValue = await newValue;
          }
          return { ...store.state, [propName]: newValue };
        });
      } else {
        store.setState({ ...store.state, [propName]: newValue });
      }
    };
  }

  /**
   * Get the current value of options
   * Options are state values that do not cause re-renders.
   * @returns {*}
   * @private
   */
  function getOptions() {
    return _options;
  }

  /**
   * Set any additional options the store may respond to.
   * Options are state values that do not cause re-renders.
   * @param {*} [options]
   * @private
   */
  function setOptions(options = null) {
    _options = options;
  }

  function plugin(thing) {
    store.emit('BeforePlugin', thing);
    thing(store);
    store.emit('AfterPlugin', thing);
  }

  /**
   *
   * @param prev
   * @param next
   * @return {(function(*): void)|*}
   * @private
   */
  function _updateAffectedComponents(prev, next) {
    return function _maybeSetState(setter) {
      if (typeof setter.mapState === 'function') {
        // component wants only a slice of state
        const prevSelected = setter.mapState(prev);
        const nextSelected = setter.mapState(next);
        if (!setter.equalityFn(prevSelected, nextSelected)) {
          // the slice of state is not equal so rerender component
          setter(nextSelected);
        }
      } else if (typeof setter.equalityFn === 'function') {
        // component wants updates when equalityFn returns false
        if (!setter.equalityFn(prev, next)) {
          setter(next);
        }
      } else {
        // no mapState; always rerender component
        setter(next);
      }
    };
  }

  async function _getNextState() {
    let nextState = store.state;
    // process all updates or update functions
    // use while and shift in case setters trigger more setting
    let failsafe = 10000;
    while (_updateQueue.length > 0) {
      if (--failsafe === 0) {
        throw new Error(
          `react-storekeeper: Too many setState calls in queue; probably an infinite loop.`
        );
      }
      const updatedState = _updateQueue.shift();
      if (typeof updatedState === 'function') {
        nextState = updatedState(nextState);
        if (isPromise(nextState)) {
          nextState = await nextState;
        }
      } else {
        nextState = updatedState;
      }
    }
    return nextState;
  }

  /**
   *
   * @private
   */
  function _scheduleUpdates() {
    // queue state update for next tick
    // see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/queueMicrotask
    Promise.resolve()
      .then(async () => {
        const prevState = store.state;
        store.emit('BeforeSet', prevState);
        const nextState = _getNextState();
        store.emit('BeforeUpdate', nextState);
        // save final state result
        store.state = nextState;
        // update components with no selector or with matching selector
        _setters.forEach(_updateAffectedComponents(prevState, store.state));
        // resolve all `await store.nextState()` calls
        _nextStateResolvers.forEach(resolver => resolver(store.state));
        // clear out list of those awaiting
        _nextStateResolvers.length = 0;
        store.emit('AfterUpdate', prevState, store.state);
      })
      .catch(err => store.emit('SetterException', err));
  }
}

module.exports = createStore;
