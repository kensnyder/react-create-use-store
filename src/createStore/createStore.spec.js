import { createStore } from './createStore.js';

describe('createStore()', () => {
  it('should have required properties', () => {
    const store = createStore({});
    expect(typeof store.reset).toBe('function');
    expect(typeof store._actions).toBe('object');
    expect(typeof store._getState()).toBe('object');
  });
  it('should save state', () => {
    const state = { count: 5 };
    const store = createStore({ state });
    console.log('l13', store._getState());
    expect(store._getState()).toBe(state);
  });
  it('should build actions', () => {
    const add = () => {};
    const store = createStore({ actions: { add } });
    expect(typeof store._actions.add).toBe('function');
  });
  it('should build actions and manipulate state', () => {
    const add = (state, setState, addend) => {
      setState({ ...state, count: state.count + addend });
    };
    const state = { count: 5 };
    const actions = { add };
    const store = createStore({ state, actions });
    store._actions.add(3);
    expect(store._getState().count).toBe(8);
  });
  it('should allow resetting', () => {
    const add = (state, setState, addend) => {
      setState({ ...state, count: state.count + addend });
    };
    const state = { count: 5 };
    const actions = { add };
    const store = createStore({ state, actions });
    store._actions.add(3);
    store.reset();
    expect(store._getState()).toBe(state);
  });
  it('should allow async setState', done => {
    const add = (state, setState, addend) => {
      Promise.resolve(state.total + addend).then(total => {
        setState(old => ({ ...old, total }));
      });
    };
    const state = { foo: 'bar', total: 5 };
    const actions = { add };
    const store = createStore({ state, actions });
    store._actions.add(3);
    setTimeout(() => {
      expect(store._getState()).toEqual({ foo: 'bar', total: 8 });
      done();
    }, 500);
  });
});
