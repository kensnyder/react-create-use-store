/**
 * @jest-environment jsdom
 */
import React, { useState } from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import createStore from '../createStore/createStore.js';

describe('useStoreState(obj)', () => {
  // define store before each test
  let store;
  let PlanetComponent;
  let RocketComponent;
  let TripComponent;
  let TripWithEqualityFnComponent;
  let renderCounts;
  beforeEach(() => {
    const state = { planet: 'Jupiter', rocket: 12 };
    const actions = {
      visit(planet) {
        store.setState(old => ({ ...old, planet }));
      },
      upgradeRocket() {
        store.mergeState(old => ({ rocket: old.rocket + 1 }));
      },
    };
    store = createStore({
      state,
      actions,
      seats: ['a', 'b', 'c'],
    });
    renderCounts = {
      planet: 0,
      rocket: 0,
      trip: 0,
      trip2: 0,
    };
    PlanetComponent = () => {
      renderCounts.planet++;
      const planet = store.useSelector(state => state.planet);
      const { visit } = store.actions;
      return (
        <div className="Planet">
          <button onClick={() => visit('Mars')}>Visit Mars</button>
          <button onClick={() => visit('Saturn')}>Visit Saturn</button>
          <span>planet={planet}</span>
        </div>
      );
    };
    RocketComponent = () => {
      renderCounts.rocket++;
      const rocket = store.useSelector(state => state.rocket);
      const { upgradeRocket } = store.actions;
      return (
        <div className="Rocket">
          <button onClick={upgradeRocket}>Upgrade Rocket</button>
          <span>rocket={rocket}</span>
        </div>
      );
    };
    TripComponent = () => {
      renderCounts.trip++;
      const state = store.useState();
      return (
        <div className="Trip">
          <span>trip on {state.rocket}</span>
          <span>trip to {state.planet}</span>
        </div>
      );
    };
    TripWithEqualityFnComponent = () => {
      renderCounts.trip2++;
      const state = store.useSelector(null, (prev, next) => true);
      return (
        <div className="TripWithEqualityFnComponent">
          <span>trip2 on {state.rocket}</span>
          <span>trip2 to {state.planet}</span>
        </div>
      );
    };
  });
  it('should have initial state', () => {
    const { getByText } = render(<TripComponent />);
    expect(getByText('trip on 12')).toBeInTheDocument();
    expect(getByText('trip to Jupiter')).toBeInTheDocument();
    expect(renderCounts.planet).toBe(0);
    expect(renderCounts.rocket).toBe(0);
    expect(renderCounts.trip).toBe(1);
  });
  it('should have initial state mapped', () => {
    const { getByText } = render(<PlanetComponent />);
    expect(getByText('planet=Jupiter')).toBeInTheDocument();
    expect(renderCounts.planet).toBe(1);
    expect(renderCounts.rocket).toBe(0);
    expect(renderCounts.trip).toBe(0);
  });
  it('should rerender only selected components', async () => {
    const { getByText, findByText } = render(
      <>
        <PlanetComponent />
        <RocketComponent />
        <TripComponent />
        <TripWithEqualityFnComponent />
      </>
    );
    expect(renderCounts.planet).toBe(1);
    expect(renderCounts.rocket).toBe(1);
    expect(renderCounts.trip).toBe(1);
    expect(renderCounts.trip2).toBe(1);
    fireEvent.click(getByText('Visit Mars'));
    await findByText('trip to Mars');
    expect(renderCounts.trip).toBe(2);
    expect(renderCounts.planet).toBe(2);
    expect(renderCounts.rocket).toBe(1);
    expect(renderCounts.trip2).toBe(1);
    expect(getByText('planet=Mars')).toBeInTheDocument();
    expect(getByText('trip2 to Jupiter')).toBeInTheDocument();
  });
});
describe('store.on(type, handler)', () => {
  // define store before each test
  let store;
  let TelescopeComponent;
  let Toggleable;
  let renderCounts;
  beforeEach(() => {
    const state = { target: 'moon', zoom: 10 };
    const actions = {
      pointAt(target) {
        store.mergeState({ target });
      },
      zoomIn(factor) {
        store.mergeState(old => ({ zoom: old.zoom * factor }));
      },
      throw(message) {
        store.setState(() => {
          throw new Error(message);
        });
      },
    };
    store = createStore({
      state,
      actions,
      seats: ['a', 'b', 'c'],
    });
    renderCounts = {
      telescope: 0,
      toggle: 0,
    };
    TelescopeComponent = () => {
      renderCounts.telescope++;
      const state = store.useState();
      const { pointAt, zoomIn } = store.actions;
      return (
        <div className="Telescope">
          <button onClick={() => pointAt('Mars')}>Look at Mars</button>
          <button onClick={() => zoomIn(2)}>Zoom 2x</button>
          <span>current target={state.target}</span>
        </div>
      );
    };
    Toggleable = ({ id, children }) => {
      const [isVisible, setIsVisible] = useState(false);
      renderCounts.toggle++;
      return (
        <div className="Toggleable">
          <button onClick={() => setIsVisible(true)}>Show {id}</button>
          <button onClick={() => setIsVisible(false)}>Hide {id}</button>
          {isVisible && children}
        </div>
      );
    };
  });
  it('should allow modifying initial state', () => {
    store.on('BeforeInitialState', () => {
      store.mergeSync({ target: 'Venus' });
    });
    const { getByText } = render(<TelescopeComponent />);
    expect(getByText('current target=Venus')).toBeInTheDocument();
  });
  // TODO: AfterFirstUse
  it('should fire mount/unmount events properly', async () => {
    let firstMountCount = 0;
    let mountCount = 0;
    let unmountCount = 0;
    let lastUnmountCount = 0;
    store.on('AfterFirstMount', () => firstMountCount++);
    store.on('AfterMount', () => mountCount++);
    store.on('AfterUnmount', () => unmountCount++);
    store.on('AfterLastUnmount', () => lastUnmountCount++);
    const { getByText } = render(
      <>
        <Toggleable id={1}>
          <TelescopeComponent />
        </Toggleable>
        <Toggleable id={2}>
          <TelescopeComponent />
        </Toggleable>
      </>
    );
    expect(firstMountCount).toBe(0);
    expect(mountCount).toBe(0);
    expect(unmountCount).toBe(0);
    expect(lastUnmountCount).toBe(0);
    await act(() => {
      fireEvent.click(getByText('Show 1'));
    });
    expect(firstMountCount).toBe(1);
    expect(mountCount).toBe(1);
    expect(unmountCount).toBe(0);
    expect(lastUnmountCount).toBe(0);
    await act(() => {
      fireEvent.click(getByText('Show 2'));
    });
    expect(firstMountCount).toBe(1);
    expect(mountCount).toBe(2);
    expect(unmountCount).toBe(0);
    expect(lastUnmountCount).toBe(0);
    await act(() => {
      fireEvent.click(getByText('Hide 2'));
    });
    expect(firstMountCount).toBe(1);
    expect(mountCount).toBe(2);
    expect(unmountCount).toBe(1);
    expect(lastUnmountCount).toBe(0);
    await act(() => {
      fireEvent.click(getByText('Hide 1'));
    });
    expect(firstMountCount).toBe(1);
    expect(mountCount).toBe(2);
    expect(unmountCount).toBe(2);
    expect(lastUnmountCount).toBe(1);
  });
  it('should fire on setter exceptions', async () => {
    const { getByText } = render(
      <>
        <button onClick={() => store.actions.throw('foobar')}>Throw</button>
        <TelescopeComponent />
      </>
    );
    let caught = null;
    store.on('SetterException', evt => (caught = evt.data.message));
    await act(() => {
      fireEvent.click(getByText('Throw'));
    });
    await new Promise(r => setTimeout(r, 1000));
    expect(caught).toBe('foobar');
  });
  it('should fire before set', async () => {
    const { getByText } = render(
      <>
        <button onClick={() => store.actions.pointAt('Mercury')}>
          Look at Mercury
        </button>
        <TelescopeComponent />
      </>
    );
    await act(() => {
      fireEvent.click(getByText('Look at Mercury'));
    });
    store.on('BeforeSet', evt => {
      expect(evt.data).toEqual({ target: 'moon', zoom: 10 });
    });
  });
});
