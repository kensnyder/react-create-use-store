import React from 'react';
import { renderHook, act as hookAct } from '@testing-library/react-hooks';
import { render, fireEvent, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import useStore from './useStore.js';
import createStore from '../createStore/createStore.js';

describe('useStore()', () => {
  // define store before each test
  let store;
  let mountDetails;
  let Component;
  beforeEach(() => {
    const state = { view: 'grid' };
    const actions = {
      setView(view) {
        store.setState(old => ({ ...old, view }));
      },
    };
    const afterFirstMount = () => {
      mountDetails.firstMount = true;
    };
    const afterEachMount = () => {
      mountDetails.mountCount++;
    };
    const afterEachUnmount = () => {
      mountDetails.unmountCount++;
    };
    const afterLastUnmount = () => {
      mountDetails.lastUnmount = true;
    };
    Component = () => {
      const { state, actions, reset } = useStore(store);
      return (
        <>
          <button onClick={() => actions.setView('list')}>Show List</button>
          <button onClick={reset}>Reset</button>
          <span>view={state.view}</span>
        </>
      );
    };
    mountDetails = {
      firstMount: false,
      mountCount: 0,
      unmountCount: 0,
      lastUnmount: false,
    };
    store = createStore({
      state,
      actions,
      afterFirstMount,
      afterEachMount,
      afterEachUnmount,
      afterLastUnmount,
    });
  });
  it('should have state state', async () => {
    // set up
    const useIt = () => useStore(store);
    const { result } = renderHook(useIt);
    // check state state
    expect(result.current.state.view).toBe('grid');
  });
  it('should respond to actions', async () => {
    // set up
    const useIt = () => useStore(store);
    const { result } = renderHook(useIt);
    // call an action
    await hookAct(async () => {
      result.current.actions.setView('list');
      await result.current.nextState();
    });
    expect(result.current.state.view).toBe('list');
  });
  it('should respond to clicks', async () => {
    const { getByText } = render(<Component />);
    expect(getByText('view=grid')).toBeInTheDocument();
    fireEvent.click(getByText('Show List'));
    const report = await screen.findByText('view=list');
    expect(report).toHaveTextContent('view=list');
  });
  it('should allow resetting', async () => {
    const { getByText, findByText } = render(<Component />);
    expect(getByText('view=grid')).toBeInTheDocument();
    fireEvent.click(getByText('Show List'));
    await findByText('view=list');
    fireEvent.click(getByText('Reset'));
    await findByText('view=grid');
    expect(getByText('view=grid')).toBeInTheDocument();
  });
  it('should call afterFirstMount', () => {
    render(<Component />);
    expect(mountDetails.firstMount).toBe(true);
  });
  it('should call afterEachMount', () => {
    render(<Component />);
    expect(mountDetails.mountCount).toBe(1);
  });
  it('should call afterEachUnmount', () => {
    const { unmount } = render(<Component />);
    expect(mountDetails.unmountCount).toBe(0);
    unmount();
    expect(mountDetails.unmountCount).toBe(1);
  });
  it('should call afterLastUnmount', () => {
    const { unmount: unmount1 } = render(<Component />);
    const { unmount: unmount2 } = render(<Component />);
    expect(mountDetails.lastUnmount).toBe(false);
    unmount1();
    expect(mountDetails.lastUnmount).toBe(false);
    unmount2();
    expect(mountDetails.lastUnmount).toBe(true);
  });
  it('should properly count mounts', () => {
    const { unmount: unmount1 } = render(<Component />);
    expect(store.getMountCount()).toBe(1);
    const { unmount: unmount2 } = render(<Component />);
    expect(store.getMountCount()).toBe(2);
    unmount1();
    expect(store.getMountCount()).toBe(1);
    unmount2();
    expect(store.getMountCount()).toBe(0);
  });
});
describe('useStore() with autoReset', () => {
  it('should autoReset on unmount', async () => {
    const state = 0;
    const actions = {
      increment() {
        store.setState(old => old + 1);
      },
    };
    const Component = () => {
      const { state, actions } = useStore(store);
      return (
        <>
          <button onClick={actions.increment}>Increment</button>
          <span>Count: {state}</span>
        </>
      );
    };
    const store = createStore({
      state,
      actions,
      autoReset: true,
    });
    const { getByText, unmount } = render(<Component />);
    expect(getByText('Count: 0')).toBeInTheDocument();
    expect(getByText('Increment')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(getByText('Increment'));
      await store.nextState();
    });
    expect(getByText('Count: 1')).toBeInTheDocument();
    unmount();
    await store.nextState();
    expect(store.state).toBe(0);
  });
});
describe('useStore() with exception', () => {
  it('should handle exceptions', done => {
    const state = null;
    const actions = {
      thrower() {
        store.setState(() => {
          throw new Error('test');
        });
      },
    };
    const Component = () => {
      const { actions } = useStore(store);
      return <button onClick={actions.thrower}>Throw</button>;
    };
    const store = createStore({
      state,
      actions,
      onException: error => {
        expect(error.message).toBe('test');
        done();
      },
    });
    const { getByText } = render(<Component />);
    fireEvent.click(getByText('Throw'));
  });
});
