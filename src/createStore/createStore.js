// an internal counter for stores
let storeIdx = 0;
// list of middleware functions that augment actions
const middlewares = [];

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
 * @property {Function} [config.onMiddlewareError] - Callback when a middleware throws an exception
 * @property {String} [config.id] - The id string which middleware can use to tell stores apart
 * @return {Object} store - Info and methods for working with the store
 * @property {String} store.id - The id or number of the store
 * @property {Number} store.idx - The index order of the store in order of definition
 * @property {Function} store.addActions - Register more actions for this store
 * @property {Function} store.reset - Reset the store's state to its original value
 * @property {Object} store.actions - Methods that can be called to affect state
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
  onMiddlewareError = () => {},
  id = null,
}) {
  // list of setters subscribed to changes
  let _setters = [];

  // define the store
  const store = {
    // an identifier that middleware may be interested
    id: String(id || `store-${storeIdx}`),
    // internal counter
    idx: storeIdx,
    // A store's state can be reset to its original value
    reset: () => _setAll(state),
    // add more action functions to this state
    addActions,
    state: state,
    setState: _setAll,
    // private: functions that will act on state
    actions: {},
    // private: useStore() can subscribe to all store changes
    _subscribe,
    // private: useStore() can unsubscribe from changes
    _unsubscribe,
    // private: A count of the number of times this store has ever been used
    _usedCount: 0,
  };

  storeIdx++;

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
    // build the actions, allowing for middleware
    Object.keys(actions).forEach(name => {
      const action = actions[name];
      store.actions[name] = (...args) => {
        let idx = 0;
        // function to invoke next middleware or to invoke action
        let next = () => {
          idx++;
          const middleware = middlewares[idx - 1];
          if (middleware) {
            // one or more middlewares left to run
            const input = { store, action, name, args };
            try {
              // call this middleware
              middleware(input, next);
            } catch (error) {
              const context = {
                error,
                middleware,
                input,
              };
              console.error(
                `react-create-use-store: middleware failed during action "${name}."`,
                context
              );
              onMiddlewareError(context);
            }
          } else {
            // all middlewares have run; call the action
            action([state, _setAll], ...args);
          }
        };
        // kick off action
        next();
      };
    });
  }

  /**
   * Add a setState function to notify when state changes
   * @param {Function} setState - Function returned from the useState() inside useStore()
   * @private
   */
  function _subscribe(setState) {
    if (store._usedCount++ === 0) {
      onFirstUse(store);
    }
    if (_setters.length === 0) {
      afterFirstMount(store);
    }
    if (_setters.indexOf(setState) === -1) {
      _setters.push(setState);
      afterEachMount(store);
    }
  }

  /**
   * Remove a setState function from notification when state changes
   * @param {Function} setState - Function returned from the useState() inside useStore()
   * @private
   */
  function _unsubscribe(setState) {
    _setters = _setters.filter(setter => setter !== setState);
    afterEachUnmount(store);
    if (_setters.length === 0) {
      if (autoReset) {
        store.reset();
      }
      afterLastUnmount(store);
    }
  }

  /**
   * Notify each of the setState functions of the new state
   * @param {*} newState
   * @private
   */
  function _setAll(newState) {
    console.log('_setAll', newState);
    if (typeof newState === 'function') {
      // TODO: queue changes for next tick?
      newState = newState(store.state);
    }
    store.state = newState;
    _setters.forEach(setter => setter(newState));
  }
}

/**
 * Add a middleware function to run for every action across every store
 * @param {Function} handler
 * Middleware functions receive 2 arguments:
 * {Object} info => {
 * 		store,     // the store object
 * 		state,     // the store's current state
 * 		setState,  // a function to update the current state
 * 		action,    // the original action function passed to createStore()
 * 		name,      // the name of the action
 * 		args       // the args passed to the action function
 * }
 * {Function} next  A function to call when the middleware wishes the next middleware to run
 */
export function addMiddleware(handler) {
  middlewares.push(handler);
}

/**
 * Remove a middleware function that was added with addMiddleware()
 * @param {Function} handler
 */
export function removeMiddleware(handler) {
  const idx = middlewares.indexOf(handler);
  if (idx > -1) {
    middlewares.splice(idx, 1);
  }
}
