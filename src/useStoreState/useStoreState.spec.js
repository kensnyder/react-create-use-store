// import React from 'react';
// import { renderHook, act as hookAct } from '@testing-library/react-hooks';
// import { render, fireEvent, screen, act } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import useStoreSelector from './useStoreSelector.js';
// import createStore from '../createStore/createStore.js';
//
// describe('useStore()', () => {
//     // define store before each test
//     let store;
//     let PlanetComponent;
//     let RocketComponent;
//     beforeEach(() => {
//         const state = { planet: 'Jupiter', rocket: 12 };
//         const actions = {
//             visit(planet) {
//                 store.setState(old => ({ ...old, planet }));
//             },
//             upgradeRocket() {
//                store.setState(old => ({...old, rocket: old.rocket + 1 }))
//             }
//         };
//         PlanetComponent = () => {
//             const { state, actions, reset } = useStoreSelector(store, state => ({ planet: state.planet }));
//             return (
//                 <>
//                     <button onClick={() => actions.upgradeRocket()}>Upgrade Rocket</button>
//                     <button onClick={() => actions.visit('Mars')}>Visit Mars</button>
//                     <button onClick={() => actions.visit('Saturn')}>Visit Saturn</button>
//                     <button onClick={reset}>Reset</button>
//                     <span>rocket={state.rocket}</span>
//                     <span>planet={state.planet}</span>
//                 </>
//             );
//         };
//         RocketComponent = () => {
//             const { state, actions, reset } = useStoreSelector(store, state => ({ rocket: state.rocket }));
//             return (
//                 <>
//                     <button onClick={() => actions.upgradeRocket()}>Upgrade Rocket</button>
//                     <button onClick={() => actions.visit('Mars')}>Visit Mars</button>
//                     <button onClick={() => actions.visit('Saturn')}>Visit Saturn</button>
//                     <button onClick={reset}>Reset</button>
//                     <span>rocket={state.rocket}</span>
//                     <span>planet={state.planet}</span>
//                 </>
//             );
//         };
//         store = createStore({
//             state,
//             actions
//         });
//     });
//     it('should have state state', async () => {
//         // set up
//         const useIt = () => useStoreSelector(store, state => ());
//         const { result } = renderHook(useIt);
//         // check state state
//         expect(result.current.state.view).toBe('grid');
//     });
//     });
