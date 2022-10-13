const createStore = require('./createStore.js');

describe('createStore()', () => {
  it('should have required properties', () => {
    const store = createStore({});
    expect(typeof store.reset).toBe('function');
    expect(typeof store.actions).toBe('object');
    expect(typeof store.state).toBe('object');
  });
  it('should save state', () => {
    const state = { count: 5 };
    const store = createStore({ state });
    expect(store.state).toBe(state);
  });
  it('should build actions', () => {
    const add = () => {};
    const store = createStore({ actions: { add } });
    expect(typeof store.actions.add).toBe('function');
  });
  it('should build actions and manipulate state', async () => {
    const add = addend => {
      store.setState({ ...store.state, count: store.state.count + addend });
    };
    const state = { count: 5 };
    const actions = { add };
    const store = createStore({ state, actions });
    store.actions.add(3);
    await store.nextState();
    expect(store.state.count).toBe(8);
  });
  it('should build and queue actions and manipulate state', async () => {
    const add = addend => {
      store.setState(() => ({
        ...store.state,
        count: store.state.count + addend,
      }));
    };
    const state = { count: 5 };
    const actions = { add };
    const store = createStore({ state, actions });
    store.actions.add(3);
    store.actions.add(2);
    await store.nextState();
    expect(store.state.count).toBe(10);
  });
  it('should allow resetting', async () => {
    const add = addend => {
      store.setState({ ...store.state, count: store.state.count + addend });
    };
    const state = { count: 2 };
    const actions = { add };
    const store = createStore({ state, actions });
    store.actions.add(1);
    await store.nextState();
    store.reset();
    await store.nextState();
    expect(store.state).toBe(state);
  });
  it('should allow async setState', done => {
    const add = addend => {
      Promise.resolve(store.state.total + addend).then(total => {
        store.setState(old => ({ ...old, total }));
      });
    };
    const state = { foo: 'bar', total: 5 };
    const actions = { add };
    const store = createStore({ state, actions });
    store.actions.add(3);
    setTimeout(() => {
      expect(store.state).toEqual({ foo: 'bar', total: 8 });
      done();
    }, 50);
  });
  it('should allow flushing synchronously', () => {
    const add = addend => {
      const updater = old => ({ ...old, total: old.total + addend });
      store.setState(updater, { flush: true });
    };
    const state = { foo: 'bar', total: 5 };
    const actions = { add };
    const store = createStore({ state, actions });
    store.actions.add(3);
    expect(store.state).toEqual({ foo: 'bar', total: 8 });
  });
});
