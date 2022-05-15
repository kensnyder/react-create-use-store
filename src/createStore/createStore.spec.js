/**
 * @jest-environment jsdom
 */
import React, { useState } from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import useStoreState from '../useStoreState/useStoreState.js';
import { fieldSetter, fieldListSetter } from '../createSetter/createSetter.js';
const createStore = require('./createStore.js');

describe('createStore()', () => {
  it('should have required properties', () => {
    const store = createStore({});
    expect(typeof store.reset).toBe('function');
    expect(typeof store.actions).toBe('object');
    expect(typeof store.getState).toBe('function');
  });
  it('should make setters from actions', async () => {
    const store = createStore({
      actions: {
        setAge: fieldSetter('age'),
        setName: fieldListSetter(['fname', 'lname']),
      },
    });
    const { setAge, setName } = store.actions;
    expect(typeof setAge).toBe('function');
    expect(typeof setName).toBe('function');
    setAge(15);
    await store.nextState();
    expect(store.getState()).toEqual({ age: 15 });
    setName('John', 'Doe');
    await store.nextState();
    expect(store.getState()).toEqual({
      age: 15,
      fname: 'John',
      lname: 'Doe',
    });
  });
  it('should reset state', async () => {
    const store = createStore({
      state: { age: 10 },
      actions: {
        setAge: fieldSetter('age'),
      },
    });
    const { setAge } = store.actions;
    setAge(11);
    await store.nextState();
    store.reset();
    await store.nextState();
    expect(store.getState()).toEqual({ age: 10 });
  });
  it('should setState with Promise', async () => {
    const state = 42;
    const store = createStore({ state });
    expect(store.getState()).toBe(state);
    store.setState(old => Promise.resolve(old + 1));
    await store.nextState();
    expect(store.getState()).toBe(43);
  });
  it('should mergeState with Promise', async () => {
    const state = { count: 42, view: 'list' };
    const store = createStore({ state });
    expect(store.getState()).toBe(state);
    store.mergeState(old => Promise.resolve({ count: old.count + 1 }));
    await store.nextState();
    expect(store.getState()).toEqual({ count: 43, view: 'list' });
  });
  it('should setSync', () => {
    const state = { count: 5 };
    const store = createStore({ state });
    expect(store.getState()).toBe(state);
    store.setSync({ count: 6 });
    expect(store.getState()).toEqual({ count: 6 });
  });
  it('should setSync with function', () => {
    const state = 42;
    const store = createStore({ state });
    expect(store.getState()).toBe(state);
    store.setSync(old => old + 1);
    expect(store.getState()).toBe(43);
  });
  it('should mergeSync', () => {
    const state = { count: 5, mode: 'up' };
    const store = createStore({ state });
    expect(store.getState()).toBe(state);
    store.mergeSync({ count: 6 });
    expect(store.getState()).toEqual({ count: 6, mode: 'up' });
  });
  it('should setSync with function', () => {
    const state = { count: 5, mode: 'up' };
    const store = createStore({ state });
    expect(store.getState()).toBe(state);
    store.mergeSync(old => ({ count: old.count + 1 }));
    expect(store.getState()).toEqual({ count: 6, mode: 'up' });
  });
  it('should get and set options', () => {
    const options = { debug: false };
    const store = createStore({ options });
    expect(store.getOptions()).toEqual({ debug: false });
    expect(store.setOptions({ debug: true })).toBe(store);
    expect(store.getOptions()).toEqual({ debug: true });
    store.setOptions({ another: 1 });
    expect(store.getOptions()).toEqual({ debug: true, another: 1 });
  });
  it('should allow plugins', async () => {
    let pluggedInto;
    const store = createStore({});
    store.plugin(s => (pluggedInto = s));
    expect(pluggedInto).toBe(store);
  });
  it('should allow blocking plugins', async () => {
    let pluggedInto;
    const store = createStore({});
    store.on('BeforePlugin', evt => evt.preventDefault());
    store.plugin(s => (pluggedInto = s));
    expect(pluggedInto).toBe(undefined);
  });
});

describe('createStore(specs)', () => {
  // define store before each test
  let store;
  let ListComponent;
  let PageComponent;
  beforeEach(() => {
    const state = { page: 1, sort: '-date' };
    const actions = {
      setPage: fieldSetter('page'),
      setSort: fieldSetter('sort'),
    };
    store = createStore({
      state,
      actions,
      autoReset: true,
    });
    ListComponent = () => {
      const state = useStoreState(store);
      const { setPage } = store.actions;
      return (
        <div className="List">
          <span>page={state.page}</span>
          <span onClick={() => setPage(old => old + 1)}>Next</span>
        </div>
      );
    };
    PageComponent = () => {
      const [show, setShow] = useState(true);
      return (
        <div className="MaybeSearchComponent">
          <button onClick={() => setShow(true)}>Show</button>
          <button onClick={() => setShow(false)}>Hide</button>
          {show && <ListComponent />}
        </div>
      );
    };
  });
  it('should auto reset', async () => {
    const { getByText } = render(<PageComponent />);
    expect(store.getState().page).toBe(1);
    await act(() => {
      fireEvent.click(getByText('Next'));
    });
    expect(store.getState().page).toBe(2);
    await act(() => {
      fireEvent.click(getByText('Hide'));
    });
    await act(() => {
      fireEvent.click(getByText('Show'));
    });
    expect(store.getState().page).toBe(1);
  });
  it('should fire BeforeReset and AfterReset', async () => {
    let before = false;
    let after = false;
    store.on('BeforeReset', () => (before = true));
    store.on('AfterReset', () => (after = true));
    const { getByText } = render(<PageComponent />);
    expect(before).toBe(false);
    expect(after).toBe(false);
    await act(() => {
      fireEvent.click(getByText('Next'));
    });
    await act(() => {
      fireEvent.click(getByText('Hide'));
    });
    expect(before).toBe(true);
    expect(after).toBe(true);
  });
  it('should allow preventing reset', async () => {
    let before = false;
    let after = false;
    store.on('BeforeReset', evt => {
      before = true;
      evt.preventDefault();
    });
    store.on('AfterReset', () => (after = true));
    const { getByText } = render(<PageComponent />);
    expect(before).toBe(false);
    expect(after).toBe(false);
    await act(() => {
      fireEvent.click(getByText('Next'));
    });
    await act(() => {
      fireEvent.click(getByText('Hide'));
    });
    expect(before).toBe(true);
    expect(after).toBe(false);
  });
});
