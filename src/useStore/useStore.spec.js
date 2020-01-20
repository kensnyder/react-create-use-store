import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
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
      setView([state, setState], view) {
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
    result.current.actions.setView('list');
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
// describe('useStore() basic middleware', () => {
//   // set up enzyme
//   configure({ adapter: new Adapter() });
//   let logs, store;
//   // define a test middleware
//   const logger = ({state, setState}, { action, name, args }, next) => {
//     logs.push({ total: state.total, name, args });
//     next();
//   };
//   beforeAll(() => {
//     logs = [];
//     // define store before each test
//     addMiddleware(logger);
//     const state = { total: 0 };
//     const actions = {
//       add({state, setState}, amount) {
//         setState({ ...state, total: state.total + amount });
//       },
//       sub({state, setState}, amount) {
//         setState({ ...state, total: state.total - amount });
//       },
//     };
//     store = createStore({ state, actions });
//   });
//   afterAll(() => {
//     removeMiddleware(logger);
//   });
//   it('should allow middleware', () => {
//     const Component = () => {
//       const {
//         state,
//         actions: { add, sub },
//       } = useStore(store);
//       return (
//         <div>
//           <button id="add2" onClick={() => add(2)}>
//             +2
//           </button>
//           <button id="sub1" onClick={() => sub(1)}>
//             -1
//           </button>
//           <span>{state.total}</span>
//         </div>
//       );
//     };
//     const rendered = mount(<Component />);
//     expect(logs).toHaveLength(0);
//     expect(rendered.find('span').text()).toBe('0');
//     act(() => {
//       rendered.find('#add2').simulate('click');
//     });
//     rendered.update();
//     expect(logs).toHaveLength(1);
//     expect(logs).toEqual([
//       {
//         total: 0,
//         name: 'add',
//         args: [2],
//       },
//     ]);
//     expect(rendered.find('span').text()).toBe('2');
//     act(() => {
//       rendered.find('#sub1').simulate('click');
//     });
//     rendered.update();
//     expect(logs).toHaveLength(2);
//     expect(logs[1]).toEqual({
//       total: 2,
//       name: 'sub',
//       args: [1],
//     });
//   });
// });
// describe('useStore() asynchronous middleware', () => {
//   // set up enzyme
//   configure({ adapter: new Adapter() });
//   let store;
//   // define an asynchronous middleware
//   const doubler = ({state, setState}, { action, name, args }, next) => {
//     setTimeout(() => {
//       setState({ ...state, total: state.total * 2 });
//       act(next);
//     }, 50);
//   };
//   beforeAll(() => {
//     // define store before each test
//     addMiddleware(doubler);
//     const state = { total: 3 };
//     const actions = {
//       add({state, setState}, amount) {
//         act(() => {
//           setState({ ...state, total: state.total + amount });
//         });
//       },
//       sub({state, setState}, amount) {
//         act(() => {
//           setState({ ...state, total: state.total - amount });
//         });
//       },
//     };
//     store = createStore({ state, actions });
//   });
//   afterAll(() => {
//     removeMiddleware(doubler);
//   });
//   it('should process middleware', done => {
//     const Component = () => {
//       const {
//         state,
//         actions: { add, sub },
//       } = useStore(store);
//       return (
//         <div>
//           <button id="add1" onClick={() => add(1)}>
//             +1
//           </button>
//           <button id="sub1" onClick={() => sub(1)}>
//             -1
//           </button>
//           <span>{state.total}</span>
//         </div>
//       );
//     };
//     let rendered;
//     act(() => {
//       rendered = mount(<Component />);
//     });
//     expect(rendered.find('span').text()).toBe('3');
//     act(() => {
//       rendered.find('#add1').simulate('click');
//     });
//     rendered.update();
//     // middleware hasn't fired yet
//     expect(rendered.find('span').text()).toBe('3');
//     setTimeout(() => {
//       rendered.update();
//       // middleware fired and doubled 3 to equal 6
//       // then add() added 1 more to equal 7
//       expect(rendered.find('span').text()).toBe('7');
//       done();
//     }, 100);
//   });
// });
