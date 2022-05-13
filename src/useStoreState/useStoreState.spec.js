// import React from 'react';
// import { renderHook, act as hookAct } from '@testing-library/react-hooks';
// import { render, fireEvent, screen, act } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import useStoreState from './useStoreState.js';
import createStore from '../createStore/createStore.js';
// import useStoreActions from '../useStoreActions/useStoreActions.js';
// import useStore from '../useStore/useStore.js';
//
describe('useStoreState(obj)', () => {
  //   // define store before each test
  let store;
  //   let PlanetComponent;
  //   let RocketComponent;
  //   let TripComponent;
  //   let TripWithEqualityFnComponent;
  //   let renderCounts;
  beforeEach(() => {
    const state = { planet: 'Jupiter', rocket: 12 };
    const actions = {
      visit(planet) {
        store.setState(old => ({ ...old, planet }));
      },
      upgradeRocket() {
        store.setState(old => ({ ...old, rocket: old.rocket + 1 }));
      },
    };
    store = createStore({
      state,
      actions,
      id: 'space',
      seats: ['a', 'b', 'c'],
    });
    //     renderCounts = {
    //       planet: 0,
    //       rocket: 0,
    //       trip: 0,
    //       trip2: 0,
    //     };
    //     PlanetComponent = () => {
    //       renderCounts.planet++;
    //       const planet = useStoreState(store, state => state.planet);
    //       const actions = useStoreActions(store);
    //       return (
    //         <div className="Planet">
    //           <button onClick={() => actions.visit('Mars')}>Visit Mars</button>
    //           <button onClick={() => actions.visit('Saturn')}>Visit Saturn</button>
    //           <span>planet={planet}</span>
    //         </div>
    //       );
    //     };
    //     RocketComponent = () => {
    //       renderCounts.rocket++;
    //       const rocket = useStoreState(store, state => state.rocket);
    //       const actions = useStoreActions(store);
    //       return (
    //         <div className="Rocket">
    //           <button onClick={actions.upgradeRocket}>Upgrade Rocket</button>
    //           <span>rocket={rocket}</span>
    //         </div>
    //       );
    //     };
    //     TripComponent = () => {
    //       renderCounts.trip++;
    //       const state = useStoreState(store);
    //       return (
    //         <div className="Trip">
    //           <span>trip on {state.rocket}</span>
    //           <span>trip to {state.planet}</span>
    //         </div>
    //       );
    //     };
    //     TripWithEqualityFnComponent = () => {
    //       renderCounts.trip2++;
    //       // const state = useStoreState(store, {
    //       //   mapState: null,
    //       //   equalityFn: (prev, next) => {},
    //       // });
    //       const state = useStoreState(store, null, (prev, next) => true);
    //       return (
    //         <div className="TripWithEqualityFnComponent">
    //           <span>trip2 on {state.rocket}</span>
    //           <span>trip2 to {state.planet}</span>
    //         </div>
    //       );
    //     };
  });
  //   it('should have initial state', () => {
  //     const { getByText } = render(<TripComponent />);
  //     expect(getByText('trip on 12')).toBeInTheDocument();
  //     expect(getByText('trip to Jupiter')).toBeInTheDocument();
  //     expect(renderCounts.planet).toBe(0);
  //     expect(renderCounts.rocket).toBe(0);
  //     expect(renderCounts.trip).toBe(1);
  //   });
  //   it('should have initial state mapped', () => {
  //     const { getByText } = render(<PlanetComponent />);
  //     expect(getByText('planet=Jupiter')).toBeInTheDocument();
  //     expect(renderCounts.planet).toBe(1);
  //     expect(renderCounts.rocket).toBe(0);
  //     expect(renderCounts.trip).toBe(0);
  //   });
  //   it('should rerender only selected components', async () => {
  //     const { getByText, findByText } = render(
  //       <>
  //         <PlanetComponent />
  //         <RocketComponent />
  //         <TripComponent />
  //         <TripWithEqualityFnComponent />
  //       </>
  //     );
  //     expect(renderCounts.planet).toBe(1);
  //     expect(renderCounts.rocket).toBe(1);
  //     expect(renderCounts.trip).toBe(1);
  //     expect(renderCounts.trip2).toBe(1);
  //     fireEvent.click(getByText('Visit Mars'));
  //     await findByText('trip to Mars');
  //     expect(renderCounts.planet).toBe(2);
  //     expect(renderCounts.rocket).toBe(1);
  //     expect(renderCounts.trip2).toBe(1);
  //     expect(getByText('planet=Mars')).toBeInTheDocument();
  //     expect(getByText('trip2 to Jupiter')).toBeInTheDocument();
  //   });
  //   // it('should equality check array shallowly', async () => {
  //   //
  //   // });
  //   it('should grab store by id', async () => {
  //     const useIt = () => useStore('space');
  //     const { result } = renderHook(useIt);
  //     expect(result.current.actions).toBe(store.actions);
  //   });
  it('should be a function', () => {
    expect(typeof store.useState).toBe('function');
  });
});
