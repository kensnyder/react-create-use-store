import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { useStore } from './useStore.js';
import { createStore } from '../createStore/createStore.js';

describe('useStore()', () => {
	// set up enzyme
	configure({ adapter: new Adapter() });

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
});
