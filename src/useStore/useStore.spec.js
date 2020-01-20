import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import {
  render,
  fireEvent,
  screen,
  waitForElement,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { useStore } from './useStore.js';
import {
  createStore,
  addMiddleware,
  removeMiddleware,
} from '../createStore/createStore.js';

describe('useStore() state management', () => {
  // define store before each test
  let store;
  let mountDetails;
  let Component;
  beforeEach(() => {
    const state = { view: 'grid' };
    const actions = {
      setView([, setState], view) {
        setState(old => ({ ...old, view }));
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
  it('should have initial state', () => {
    // set up
    const useIt = () => useStore(store);
    const { result } = renderHook(useIt);
    // check initial state
    expect(result.current.state.view).toBe('grid');
  });
  it('should respond to actions', async () => {
    // set up
    const useIt = () => useStore(store);
    const { result } = renderHook(useIt);
    // call an action
    act(() => {
      result.current.actions.setView('list');
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
    const { getByText } = render(<Component />);
    expect(getByText('view=grid')).toBeInTheDocument();
    fireEvent.click(getByText('Show List'));
    await waitForElement(() => getByText('view=list'));
    fireEvent.click(getByText('Reset'));
    await waitForElement(() => getByText('view=grid'));
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
});
describe('useStore() middleware', () => {
  // define store before each test
  let store;
  let Component;
  let context;
  let actions;
  const middlewareThatAdds3 = ({ store, action, name, args }, next) => {
    context = { store, action, name };
    args[0] += 3;
    next();
  };
  beforeEach(() => {
    const state = { foo: 'bar', result: 0 };
    actions = {
      add([, setState], addend) {
        setState(old => ({ ...old, result: old.result + addend }));
      },
    };
    addMiddleware(middlewareThatAdds3);
    Component = () => {
      const { state, actions } = useStore(store);
      return (
        <>
          <button onClick={() => actions.add(2)}>Add 2</button>
          <button onClick={() => actions.add(7)}>Add 7</button>
          <span>result={state.result}</span>
        </>
      );
    };
    store = createStore({
      state,
      actions,
    });
  });
  it('should be called and be removeable', async () => {
    const { getByText } = render(<Component />);
    fireEvent.click(getByText('Add 2'));
    const span = await screen.findByText('result=5');
    expect(span).toHaveTextContent('result=5');
    expect(context.store).toBe(store);
    expect(context.action).toBe(actions.add);
    expect(context.name).toBe('add');
    removeMiddleware(middlewareThatAdds3);
    fireEvent.click(getByText('Add 7'));
    const span2 = await screen.findByText('result=12');
    expect(span2).toBeInTheDocument();
  });
});
