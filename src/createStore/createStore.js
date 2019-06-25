import forOwn from "lodash.forown";
import isPromise from "is-promise";

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
 * @return {Object} store - Info and methods for working with the store
 * @property {Object} state - The current value of the state
 * @property {Object} actions - Methods that can be called to return a new state
 * @property {Function} reset - Reset the store's state to its original value
 * @property {Function[]} _setters - A list of setters that were added using useStore()
 * @property {Function} _subscribe - A method to add a setState callback that should be notified on changes
 * @property {Function} _unsubscribe - A method to remove a setState callback
 * @property {Function} _setAll - Directly set the store's state
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
}) {
	// define the store
	const store = {
		state,
		actions: {},
		reset: () => _setAll(state),
		_setters: [],
		_subscribe,
		_unsubscribe,
		_setAll,
		_useCount: 0,
	};

	// build the actions
	forOwn(actions, (action, name) => {
		store.actions[name] = (...args) => {
			const newState = action(store.state, ...args);
			if (isPromise(newState)) {
				newState.then(_setAll, () => {});
			} else {
				_setAll(newState);
			}
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
		if (store._useCount++ === 0) {
			onFirstUse();
		}
		if (store._setters.length === 0) {
			afterFirstMount();
		}
		if (!store._setters.indexOf(setState) > -1) {
			store._setters.push(setState);
			afterEachMount();
		}
	}

	/**
	 * Remove a setState function from notification when state changes
	 * @param {Function} setState - Function returned from the useState() inside useStore()
	 * @private
	 */
	function _unsubscribe(setState) {
		store._setters = store._setters.filter(setter => setter !== setState);
		afterEachUnmount();
		if (store._setters.length === 0) {
			if (autoReset) {
				store.state = state;
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
		store._setters.forEach(setter => setter(newState));
		store.state = newState;
	}
}
