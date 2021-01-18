# react-create-use-store

[![Build Status](https://travis-ci.com/kensnyder/react-create-use-store.svg?branch=master&v=3.1.0)](https://travis-ci.com/kensnyder/react-create-use-store)
[![Code Coverage](https://codecov.io/gh/kensnyder/react-create-use-store/branch/master/graph/badge.svg?v=3.1.0)](https://codecov.io/gh/kensnyder/react-create-use-store)
[![ISC License](https://img.shields.io/npm/l/react-create-use-store.svg?v3.1.0)](https://opensource.org/licenses/ISC)

Simple state management for React using hooks

```bash
npm install react-create-use-store
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

1. Instead of reducers or observables, define action functions
1. Store actions are easily testable
1. Stores can respond to component lifecycle events including unmount
   (e.g. to abort fetching data)
1. Stores can persist data
1. A store can be used by one component or many components
1. Stores are included by only the components that need them
1. Stores allow for natural code splitting
1. Less than 1kb gzipped

## Example usage

### Simple example

In src/stores/adder/adderStore.js

```jsx harmony
import { createStore } from 'react-create-use-store';

// initial state
const state = { count: 0 };

// list of action functions
const actions = {
  add(addend) {
    store.setState(old => ({ ...old, count: old.count + addend }));
  },
};

// create and export the store
const store = createStore({ state, actions });
export default store;
```

In src/components/PlusTwo/PlusTwo.js

```jsx harmony
import React from 'react';
import { useStore } from 'react-create-use-store';
import adderStore from 'stores/adder/adderStore.js';

export function PlusTwo() {
  const { state, actions } = useStore(adderStore);

  return (
    <>
      <button onClick={() => actions.add(2)}>+2</button>
      <p>Count: {state.count}</p>
    </>
  );
}
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
import { createStore } from 'react-create-use-store';

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
import { useStore } from 'react-create-use-store';
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
import { useStore } from 'react-create-use-store';
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
`state.setState` will trigger a re-render on all components that consume the
state.

Note that by default, state persists even when all consumers have unmounted.
The effect is similar to having a global state that your top level `<App />`
consumes. To disable persistence, create the state with `autoReset` set to true.

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

## Credits

inspired by [@jhonnymichel](https://github.com/jhonnymichel/react-hookstore/blob/6d23d2fcb0e7cf8a3929a01e0c543fe5e05ecf05/src/index.js)
