import React from 'react';
import { configure, mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import Adapter from 'enzyme-adapter-react-16';
import { useStore } from './useStore.js';
import { createStore, addMiddleware, removeMiddleware } from '../createStore/createStore.js';

describe('useStore() state management', () => {
	// set up enzyme
	configure({ adapter: new Adapter() });
	// define store before each test
	let store;
	beforeEach(() => {
		const state = { view: 'grid' };
		const actions = {
			setView(state, view) {
				return { ...state, view };
			}
		};
		store = createStore({ state, actions });
	});
	it('should have initial state', () => {
		const Component = () => {
			const { state } = useStore(store);
			return <div>{state.view}</div>
		};
		const rendered = mount(<Component />);
		expect(rendered.text()).toBe('grid');
	});
	it('should respond to actions', () => {
		const Component = () => {
			const { state, actions } = useStore(store);
			return (
				<div>
					<button onClick={() => actions.setView('list')}>Show List</button>
					<span>{state.view}</span>
				</div>
			);
		};
		const rendered = mount(<Component />);
		expect(rendered.find('span').text()).toBe('grid');
		rendered.find('button').simulate('click');
		expect(rendered.find('span').text()).toBe('list');
	});
	it('should allow resetting', () => {
		const Component = () => {
			const { state, actions, reset } = useStore(store);
			return (
				<div>
					<button onClick={() => actions.setView('list')}>Show List</button>
					<a href={null} onClick={reset}>Reset</a>
					<span>{state.view}</span>
				</div>
			);
		};
		const rendered = mount(<Component />);
		expect(rendered.find('span').text()).toBe('grid');
		rendered.find('button').simulate('click');
		expect(rendered.find('span').text()).toBe('list');
		rendered.find('a').simulate('click');
		expect(rendered.find('span').text()).toBe('grid');
	});
	it('should call afterFirstMount', () => {
		const Component = () => {
			const { state, actions, reset } = useStore(store);
			return (
				<div>
					<button onClick={() => actions.setView('list')}>Show List</button>
					<a href={null} onClick={reset}>Reset</a>
					<span>{state.view}</span>
				</div>
			);
		};
		const rendered = mount(<Component />);
		expect(rendered.find('span').text()).toBe('grid');
		rendered.find('button').simulate('click');
		expect(rendered.find('span').text()).toBe('list');
		rendered.find('a').simulate('click');
		expect(rendered.find('span').text()).toBe('grid');
	});
});
describe('useStore() first mount, last unmount', () => {
	// set up enzyme
	configure({ adapter: new Adapter() });
	// define store before each test
	let store, mountCount, unmountCount;
	beforeEach(() => {
		mountCount = 0;
		unmountCount = 0;
		const afterFirstMount = () => mountCount++;
		const afterLastUnmount = () => unmountCount++;
		store = createStore({ afterFirstMount, afterLastUnmount });
	});
	it('should use proper callbacks', () => {
		const Component1 = () => {
			useStore(store);
			return <div>One</div>
		};
		const Component2 = () => {
			useStore(store);
			return <div>Two</div>
		};
		// first mount
		const rendered1a = mount(<Component1 />);
		expect(mountCount).toBe(1);
		const rendered2a = mount(<Component2 />);
		expect(mountCount).toBe(1);
		rendered1a.unmount();
		expect(unmountCount).toBe(0);
		rendered2a.unmount();
		expect(unmountCount).toBe(1);
		// second mount
		const rendered1b = mount(<Component1 />);
		expect(mountCount).toBe(2);
		const rendered2b = mount(<Component2 />);
		expect(mountCount).toBe(2);
		rendered1a.mount();
		expect(mountCount).toBe(2);
		rendered1b.unmount();
		expect(unmountCount).toBe(1);
		rendered2b.unmount();
		expect(unmountCount).toBe(1);
		rendered1a.unmount();
		expect(unmountCount).toBe(2);
	});
});
describe('useStore() each mount/unmount', () => {
	// set up enzyme
	configure({ adapter: new Adapter() });
	// define store before each test
	let store, mountCount, unmountCount;
	beforeEach(() => {
		mountCount = 0;
		unmountCount = 0;
		const afterEachMount = () => mountCount++;
		const afterEachUnmount = () => unmountCount++;
		store = createStore({ afterEachMount, afterEachUnmount });
	});
	it('should use proper callbacks', () => {
		const Component1 = () => {
			useStore(store);
			return <div>One</div>
		};
		const Component2 = () => {
			useStore(store);
			return <div>Two</div>
		};
		const rendered1a = mount(<Component1 />);
		expect(mountCount).toBe(1);
		const rendered2a = mount(<Component2 />);
		expect(mountCount).toBe(2);
		rendered1a.unmount();
		expect(unmountCount).toBe(1);
		rendered2a.unmount();
		expect(unmountCount).toBe(2);
	});
});
describe('useStore() onFirstUse', () => {
	// set up enzyme
	configure({ adapter: new Adapter() });
	// define store before each test
	let store, callbackCount;
	beforeEach(() => {
		callbackCount = 0;
		const onFirstUse = () => callbackCount++;
		store = createStore({ onFirstUse });
	});
	it('should use proper callbacks', () => {
		const Component1 = () => {
			useStore(store);
			return <div>One</div>
		};
		const Component2 = () => {
			useStore(store);
			return <div>Two</div>
		};
		mount(<Component1 />);
		expect(callbackCount).toBe(1);
		mount(<Component2 />);
		expect(callbackCount).toBe(1);
	});
});
describe('useStore() basic middleware', () => {
	// set up enzyme
	configure({ adapter: new Adapter() });
	let logs, store;
	// define a test middleware
	const logger = ({store, action, name, args}, next) => {
		logs.push({ total: store.getState().total, name, args });
		next();
	};
	beforeAll(() => {
		logs = [];
		// define store before each test
		addMiddleware(logger);
		const state = { total: 0 };
		const actions = {
			add(state, amount) {
				return { ...state, total: state.total + amount };
			},
			sub(state, amount) {
				return { ...state, total: state.total - amount };
			}
		};
		store = createStore({ state, actions });
	});
	afterAll(() => {
		removeMiddleware(logger);
	});
	it('should allow middleware', () => {
		const Component = () => {
			const { state, actions: { add, sub } } = useStore(store);
			return (
				<div>
					<button id="add2" onClick={() => add(2)}>+2</button>
					<button id="sub1" onClick={() => sub(1)}>-1</button>
					<span>{state.total}</span>
				</div>
			);
		};
		const rendered = mount(<Component />);
		expect(logs).toHaveLength(0);
		expect(rendered.find('span').text()).toBe('0');
		rendered.find('#add2').simulate('click');
		expect(logs).toHaveLength(1);
		expect(logs).toEqual([{
			total: 0,
			name: 'add',
			args: [2],
		}]);
		expect(rendered.find('span').text()).toBe('2');
		rendered.find('#sub1').simulate('click');
		expect(logs).toHaveLength(2);
		expect(logs[1]).toEqual({
			total: 2,
			name: 'sub',
			args: [1],
		});
	});
});
describe('useStore() asynchronous middleware', () => {
	// set up enzyme
	configure({ adapter: new Adapter() });
	let store;
	// define an asynchronous middleware
	const incrementer = ({ store, state, setState, action, name, args }, next) => {
		setState({ ...state, total: state.total + 1 });
		setTimeout(() => {
			act(next);
		}, 50);
	};
	beforeAll(() => {
		// define store before each test
		addMiddleware(incrementer);
		const state = { total: 0 };
		const actions = {
			add(state, amount) {
				return { ...state, total: state.total + amount };
			},
			sub(state, amount) {
				return { ...state, total: state.total - amount };
			}
		};
		store = createStore({ state, actions });
	});
	afterAll(() => {
		removeMiddleware(incrementer);
	});
	it('should process middleware', (done) => {
		const Component = () => {
			const { state, actions: { add, sub } } = useStore(store);
			return (
				<div>
					<button id="add2" onClick={() => add(2)}>+2</button>
					<button id="sub1" onClick={() => sub(1)}>-1</button>
					<span>{state.total}</span>
				</div>
			);
		};
		const rendered = mount(<Component />);
		expect(rendered.find('span').text()).toBe('0');
		rendered.find('#add2').simulate('click');
		expect(rendered.find('span').text()).toBe('0');
		setTimeout(() => {
			expect(rendered.find('span').text()).toBe('3');
			done();
		}, 100);
	});
});
