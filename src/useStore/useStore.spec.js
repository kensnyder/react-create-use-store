import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { useStore } from './useStore.js';
import { createStore } from '../createStore/createStore.js';

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
describe('useStore() mount/unmount', () => {
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
