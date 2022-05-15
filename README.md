# react-store-glider

[![Build Status](https://travis-ci.com/kensnyder/react-store-glider.svg?branch=master&v=3.2.0)](https://travis-ci.com/kensnyder/react-store-glider)
[![Code Coverage](https://codecov.io/gh/kensnyder/react-store-glider/branch/master/graph/badge.svg?v=3.2.0)](https://codecov.io/gh/kensnyder/react-store-glider)
[![ISC License](https://img.shields.io/npm/l/react-store-glider.svg?v3.2.0)](https://opensource.org/licenses/ISC)

Simple state management for React using hooks

```bash
npm install react-store-glider
```

## Table of contents

1. [Features](#features)
1. [Simple example](#simple-example)
1. [Complex example](#complex-example)
1. [Writing Actions](#writing-actions)
1. [All Store Options](#all-store-options)
1. [Suggested File Structure](#suggested-file-structure)
1. [Credits](#credits)

## Features

1. Instead of reducers or observables, define simple action functions with no boilerplate
1. Store actions are easily testable
1. Stores can respond to component lifecycle events including unmount
   (e.g. to abort fetching data)
1. A store can be used by one component or many components
1. Stores are included by only the components that need them
1. Stores can persist data even if all consumers unmount
1. Stores allow for natural code splitting
1. Less than 3kb gzipped

## Example usage

### Simple example

In src/stores/adder/adderStore.js

```jsx harmony
import { createStore } from 'react-store-glider';

// initial state
const state = { count: 0 };

// list of action functions
const actions = {
  add(addend) {
    store.setState(old => ({ ...old, count: old.count + addend }));
    // OR use mergeState to update a slice of state
    store.mergeState(old => ({ count: old.count + addend }));
  },
};

// create and export the store
const store = createStore({ state, actions });
export default store;
```

In src/components/PlusTwo/PlusTwo.js

```jsx harmony
import React from 'react';
import adderStore from 'stores/adder/adderStore.js';

export function PlusTwo() {
  const state = adderStore.useState();
  const { add } = adderStore.actions;

  return (
    <>
      <button onClick={() => add(2)}>+2</button>
      <p>Count: {state.count}</p>
    </>
  );
}
```

Or use a mapState function to rerender only when a subset of state changes.

```jsx harmony
import React from 'react';
import adderStore from 'stores/adder/adderStore.js';

export function PlusTwo() {
  const count = useStoreSelector(adderStore, state => state.count);
  const { add } = adderStore.actions;

  return (
    <>
      <button onClick={() => add(2)}>+2</button>
      <p>Count: {count}</p>
    </>
  );
}
```

```js
// I'm creating a successor to react-create-use-store package.
//
//The main new feature is the ability to pass a "mapState" function like Redux where
//   you define a subset of the store state you care about. That allows avoiding
//   re-rendering a component when irrelevant parts of state change.
// The example mapState function below is "state => state.count". If the store had a
//   property called "count" (i.e. number of times a button is clicked) then the
//   component would only get the integer value of the count.
// Other examples of mapState functions:
//   state => ({ fname: state.fname, lname: state.lname })
//   state => ({ name: `${state.fname} ${state.lname}`, age: state.age })
//   state => state.age
// Redux also has a concept of equalityFn where you can pass a custom function that
//   should return true when the slice of state is equivalent even if shallowly
//   unequal. You would use that once in a blue moon.
// A second improvement is that you can useStore() to get the state and actions of a
//   store, or use useStoreState()/useStoreActions() to grab one or the other
// Since this is a brand-new library, I'm rethinking architecture and API. I need
//   your thoughts on whether to use approach 1, 2, or 3.
//
// Approach 1 is to add mapState and equalityFn as 2nd and 3rd args.
// Approach 2 is to add a use() function on the store itself so that mapState and
//   equalityFn become 1st and 2nd args
// Approach 3 is to pass mapState and equalityFn in an object
//
// Below are code examples of four different use cases.

// Use Case A) Using the whole store, no mapState, no equalityFn
/* 1 */ const { state, actions } = useStore(adderStore);
/* 2 */ const { state, actions } = adderStore.use();
/* 3 */ const { state, actions } = useStore(adderStore);

// Use Case B) Using the whole store with mapState, no equalityFn
/* 1 */ const { state: count, actions } = useStore(
  adderStore,
  state => state.count
);
/* 2 */ const { state: count, actions } = adderStore.use(state => state.count);
/* 3 */ const { state: count, actions } = useStore(adderStore, {
  mapState: state => state.count,
});

// Use Case C) Using a slice of store with mapState, no equalityFn
/* 1 */ const count = useStoreState(adderStore, state => state.count);
/* 2 */ const count = adderStore.useState(state => state.count);
/* 3 */ const count = useStoreState(adderStore, {
  mapState: state => state.count,
});

// Use Case D) The rare case of using a slice of store with mapState and equalityFn
/* 1 */ const count = useStoreState(
  adderStore,
  state => state.count,
  equalityFn
);
/* 2 */ const count = adderStore.useState(state => state.count, equalityFn);
/* 3 */ const count = useStoreState(adderStore, {
  mapState: state => state.count,
  equalityFn: equalityFn,
});

// Let me know your thoughts.
//
// Some other features that I made:
// a) mapState can be a string. "name" will become state => state.name
// b) mapState can be an array. ["name","age"] will become state => ({ name: state.name, age: state.age })
// c) The store emitted events that allowed me to write and include some plugins:
//    undo/redo plugin
//    persist to localStorage plugin
//    sync state with URL
```

In src/stores/adder/adderStore.spec.js

```jsx harmony
import React from 'react';
import adderStore from './adderStore.js';

describe('AdderStore', () => {
  it('should add numbers', () => {
    adderStore.state = { count: 5 };
    adderStore.actions.add(4);
    expect(adderStore.state.count).toBe(9);
  });
});
```

## Complex example

In src/stores/story/storyStore.js

```jsx harmony
import { createStore } from 'react-store-glider';

// initial state
const state = {
  view: 'list',
  isLoading: false,
  stories: [],
};

// define action functions
function showView(view) {
  setState(old => ({ ...old, view }));
}

async function searchStories(term = '') {
  store.setState(old => ({ ...old, isLoading: true, stories: [] }));
  const stories = await api.get('/api/stories', { term });
  store.setState(old => ({ ...old, isLoading: false, stories }));
}

async function deleteStory(story) {
  const stories = store.state.stories.filter(s => s !== story);
  store.setState(old => ({ ...old, stories }));
  const deletedOk = await api.delete(`/api/stories/${story.id}`);
  if (!deletedOk) {
    alert('Server error deleting story');
  }
}

// list of action functions
const actions = {
  showView,
  searchStories,
  deleteStory,
};

// create and export the store
const store = createStore({
  state,
  actions,
  afterFirstMount: searchStories,
});

export default store;
```

In src/components/StoryListing/StoryListing.js

```jsx harmony
import React, { useState } from 'react';
import { useStore } from 'react-store-glider';
import storyStore from 'stores/StoryStore/StoryStore.js';
import StoryItem from '../StoryItem.js';

export function StoryListing() {
  const { state, actions } = useStore(storyStore);
  const { setView, searchStories } = actions;
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="Component StoryListing">
      <h1>Stories</h1>
      <form onSubmit={runSearch}>
        <input value={searchTerm} onChange={updateSearchTerm} />
        <button>Search</button>
      </form>
      <button onClick={() => setView('list')}>list view</button>
      <button onClick={() => setView('grid')}>grid view</button>
      {state.stories.map(story => {
        <StoryItem key={story.id} story={story} />;
      })}
    </div>
  );

  function updateSearchTerm(event) {
    setSearchTerm(event.target.value);
  }

  function runSearch(event) {
    event.preventDefault();
    searchStories(searchTerm);
  }
}
```

In src/components/StoryItem/StoryItem.js

```jsx harmony
import React from 'react';
import { useStore } from 'react-store-glider';
import storyStore from 'stores/story/storyStore.js';

export default function StoryItem({ story }) {
  const { state, actions } = useStore(storyStore);

  const [w, h] = state.view === 'list' ? [110, 110] : [200, 180];

  return (
    <div className={`StoryItem Component view-${state.view}`}>
      <img url={story.image} width={w} height={h} />
      <h2 className="title">{story.title}</h2>
      <div className="descr">{story.descr}</div>
      <button onClick={() => actions.deleteStory(story)}>[Delete]</button>
    </div>
  );
}
```

## Writing actions

`store.state` and `store.setState` work exactly like `useState()` pairs. The
`store.state` value should not be changed directly; it is shared across all
components that consume the store through `useStore()`. The `store.setState`
function can be called with a value that should replace the current state or an
updater function that will receive old state and return new state. Calling
`state.setState` will trigger a rerender on all components that consume any
part of the state that changes.

Note that by default, state persists even when all consumers have unmounted.
The effect is similar to having a global state that your top level `<App />`
consumes. To disable persistence, create the state with `autoReset` set to
`true`.

Many global-state patterns like Redux do not have built-in ways to code split.
In this library, code splitting can happen naturally because consumers must
`import` any stores they want to use.

The following are especially good use cases for this library. They benefit from
having state that persists after unmounting and from co-locating action
functions with state values they affect.

- Authentication
  - Only some routes care about logged-in status
  - Associated actions include login and logout
- Authorization
  - Only some components care about user's abilities
  - Associated actions include fetching abilities and clearing abilities on
    logout
- Theme
  - Only some components care about the current theme
  - Associated actions include loading theme, changing theme, adding a theme
- Multi-step events (e.g. user path analytics)
  - Let's say we need to classify the success of a search
  - Some definitions:
    - A "failed search" is one that elicits no clicks
    - A "fruitless search" is one that produces no results
    - Good search results see one click
    - Great search results see two clicks, but several seconds apart
  - Various components participate in the process including the search bar,
    the search results list, an item, a link etc.
  - A multi-step event store can track those user actions, initiate timers and
    decide when to send a success or failure event to an API
  - Associated actions would be search, unmount search page, click
  - And the store could contact an API after all the actions stop for several
    seconds

## All Store Options

The `createStore()` function takes an object with the following properties:

- {Object} state - The store's initial state. It can be of any type.
- {Object} actions - Named functions that can be dispatched by name and
  arguments.
- {Boolean} autoReset - If true, reset the store when all consumer components
  unmount
- {Function} onFirstUse - Callback the very first time a component calls
  useStore()
- {Function} afterFirstMount - Callback when a consumer component mounts when
  no other are mounted
- {Function} afterEachMount - Callback every time a component first calls
  useStore()
- {Function} afterEachUnmount - Callback when any consumer component unmounts
- {Function} afterLastUnmount - Callback when all consumer components unmount

All callbacks receive the store as a parameter.

## Suggested File Structure

For shared stores, e.g. a theme store:

- src/stores/theme/themeStore.js
- src/stores/theme/themeStore.spec.js

For reusable components or pages with private state, e.g. a header:

- src/components/Header/Header.js
- src/components/Header/Header.spec.js
- src/components/Header/store/headerStore.js
- src/components/Header/store/headerStore.spec.js

## Special store properties

Once you create a store, you can access a few properties directly.

## Events

Stores fire a series of lifecycle events. For example:

```js
store.on('BeforeInitialState', () => {
  store.setSync({ my: 'new', initial: 'state' });
});
store.on('BeforeUpdate', evt => {
  if (evt.data.name.length < 4) {
    alert('name must be at least 4 characters');
    evt.preventDefault();
  }
});
```

| Event              | Description                                                 | Cancelable? |
| ------------------ | ----------------------------------------------------------- | ----------- |
| BeforeInitialState | Can alter initial state for first component that uses state | No          |
| AfterFirstUse      | Fires after store has been used by the first time           | No          |
| AfterFirstMount    | Fires after first component mounts                          | No          |
| AfterMount         | Fires after each component mounts                           | No          |
| AfterUnmount       | Fires after each component unmounts                         | No          |
| AfterLastUnmount   | Fires when last component unmounts                          | No          |
| SetterException    | Fires if a setter function throws an exception              | No          |
| BeforeSet          | Fires before any queued setter functions run                | Yes         |
| BeforeUpdate       | Fires before newly calculated state is propagated           | Yes         |
| AfterUpdate        | Fires after state is finalized but before React re-renders  | Yes         |
| BeforeReset        | Fires before state is reset (by reset() or by autoReset)    | Yes         |
| BeforePlugin       | Fires before a plugin is registered                         | Yes         |
| AfterPlugin        | Fires after a plugin is registered                          | No          |

## Plugins

## Credits

inspired by [@jhonnymichel's react-hookstore](https://github.com/jhonnymichel/react-hookstore/blob/6d23d2fcb0e7cf8a3929a01e0c543fe5e05ecf05/src/index.js)
