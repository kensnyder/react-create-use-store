import forOwn from "lodash.forown";
import isPromise from "is-promise";

let storeIdx = 0;
const middlewares = [];

/**
 * Creates a new store
 * @param {Object} [config] - An object containing the store setup
 * @property {Object} [config.state] - The store's initial state. It can be of any type.
 * @property {Object} [config.actions] - Named functions that can be dispatched by name and payload.
 * @property {Boolean} [config.autoReset] - If true, reset the store when all user components unmount
 * @property {Function} [config.onFirstUse] - Callback the very first time a component calls useStore()
 * @property {Function} [config.afterFirstMount] - Callback when a useStore() component mounts when no other are mounted
 * @property {Function} [config.afterEachMount] - Callback every time a component calls useStore()
 * @property {Function} [config.afterEachUnmount] - Callback when any useStore() component unmounts
 * @property {Function} [config.afterLastUnmount] - Callback when all user components unmount
 * @property {Function} [config.onActionPromiseReject] - Callback when an action returns a promise that rejects
 * @property {String} [config.id] - The id string which middleware can use to
 * @return {Object} store - Info and methods for working with the store
 * @property {String} store.id - The id or number of the store
 * @property {Function} store.getState - Get the current state of the store
 * @property {Object} store.actions - Methods that can be called to affect state
 * @property {Function} store.reset - Reset the store's state to its original value
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
	onActionPromiseReject = () => {},
	id = null,
}) {

	// initialize current state
	let currState = state;
	// list of setters subscribed to changes
	let _setters = [];

	// define the store
	const store = {
		// an identifier that middleware may be interested
		id: String(id || `store-${storeIdx++}`),
		// A store's state can only be set by actions and middleware
		// A store's state can be read at any time
		getState: () => currState,
		// functions that will act on state
		actions: {},
		// A store's state can be reset to its original value
		reset: () => _setAll(state),
		// store users should not directly set state, but a store might
		setState: _setAll,
		// private: useStore() can subscribe to all store changes
		_subscribe,
		// private: useStore() can unsubscribe from changes
		_unsubscribe,
		// private: A count of the number of times this store has ever been used
		_usedCount: 0,
	};

	// build the actions, allowing for middleware
	forOwn(actions, (action, name) => {
		store.actions[name] = (...args) => {
			// only middleware can directly set state
			const setState = newState => currState = newState;
			let idx = 0;
			// function to invoke next middleware or to invoke action
			let next = () => {
				if (middlewares[idx]) {
					idx++;
					// call this middleware
					middlewares[idx - 1]({ store, state: currState, setState, action, name, args }, next);
				}
				else {
					// no more middlewares to run
					const newState = action(currState, ...args);
					if (isPromise(newState)) {
						// handle actions that return a Promise
						newState.then(_setAll, onActionPromiseReject);
					} else {
						// treat action's output as the new state
						_setAll(newState);
					}
				}
			};
			next();
		};
	});

	// return this store
	return store;

	//
	// functions only beyond this point
	//

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
		if (!_setters.indexOf(setState) > -1) {
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
		_setters = _setters.filter(setter => setter !== setState);
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
	function _setAll(newState) {
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