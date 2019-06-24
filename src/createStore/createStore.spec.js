import { createStore } from './createStore.js';

describe('createStore()', () => {
	it('should have required properties', () => {
		const store = createStore({});
		expect(typeof store.state).toBe('object');
		expect(typeof store.actions).toBe('object');
		expect(typeof store.reset).toBe('function');
	});
	it('should save state', () => {
		const state = { count: 5 };
		const store = createStore({ state });
		expect(store.state).toBe(state);
	});
	it('should build actions', () => {
		const add = () => {};
		const store = createStore({ actions: { add }});
		expect(typeof store.actions.add).toBe('function');
	});
	it('should build actions and manipulate state', () => {
		const add = (state, addend) => {
			return { ...state, count: state.count + addend };
		};
		const state = { count: 5 };
		const actions = { add };
		const store = createStore({ state, actions });
		store.actions.add(3);
		expect(store.state.count).toBe(8);
	});
	it('should allow resetting', () => {
		const add = (state, addend) => {
			return { ...state, count: state.count + addend };
		};
		const state = { count: 5 };
		const actions = { add };
		const store = createStore({ state, actions });
		store.actions.add(3);
		store.reset();
		expect(store.state).toBe(state);
	});
	it('should handle promises', (done) => {
		const add = (state, addend) => {
			return Promise.resolve(state + addend);
		};
		const state = 5;
		const actions = { add };
		const store = createStore({ state, actions });
		store.actions.add(3);
		setTimeout(() => {
			expect(store.state).toBe(8);
			done();
		}, 0);
	});
});
