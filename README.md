# react-create-use-store

Simple state management for React using hooks

```bash
npm install --save react-create-use-store
```

[CodeSandbox Demo](https://codesandbox.io/s/...)

## Table of contents
1. [Features](#features)
1. [Example Usage](#example-usage)
1. [Writing Actions](#writing-actions)
1. [Writing Middleware](#writing-middleware)
1. [All Store Options](#all-store-options)
1. [Credits](#credits)

## Features

1. Instead of reducers or observables, define "actions": functions that take 
current state and a function to set new state 
1. Store actions are easily testable
1. Stores can respond to lifecycle events including unmount (e.g. to abort 
fetching data)
1. Stores can persist data 
1. A store can be used by one component or many components
1. Stores are included by only the components that need them
1. Stores allow defining middleware to intercept, modify or block actions
1. Stores allow for natural code splitting

## Example usage

Define your store's initial state and action functions:

```jsx harmony
import { createStore } from 'react-create-use-store';

// initial state
const state = {
  view: 'list',
  isLoading: false,
  stories: [],
};

// export action functions so they can be unit testable
export function showView(state, setState, view) {
  setState(old => ({ ...old, view }));
}

export async function searchStories(state, setState, term = '') {
  setState(old => ({ ...old, isLoading: true }));
  const stories = await api.get('/api/stories', { term });
  setState(old => ({ ...old, isLoading: false, stories }));
}

export async function deleteStory(state, setState, story) {
  const stories = state.stories.filter(s => s !== story);
  setState(old => ({ ...old, stories }));
  const deletedOk = await api.delete(`/api/stories/${story.id}`);
  if (!deletedOk) {
    setState(old => ({ ...old, stories: [...old.stories, story] }));
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
export default createStore({
  state,
  actions,
  afterFirstMount: searchStories,
});
```

Then use it in one or more components.

1) A component for stories search screen
```jsx harmony
import React, { useState } from 'react';
import { useStore } from 'react-create-use-store';
import storyStore from '../Stories/storyStore.js';
import StoryItem from '../StoryItem.js';

export function StoryListing() {
  const {
    state,
    actions: { setView },
  } = useStore(storyStore);
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
    actions.searchStories(searchTerm);
  }
}
```

2) A component to display a single story
```jsx harmony
import React from 'react';
import { useStore } from 'react-create-use-store';
import storyStore from '../Stories/storyStore.js';

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

## Writing Actions

When writing an action function, the first two arguments are `state` and 
`setState`. Subsequent arguments are those that consumers should pass in. For
example, a login action might be defined with four arguments:

```jsx harmony
function login(state, setState, username, password) {}
```

But be invoked with two arguments:

```jsx harmony
export default function LoginForm() {
  const { state, actions } = useStore(authStore);
  // ...
  actions.login(username, password);
}
```

The `state, setState` pairs work exactly like `useState()` pairs. The `state`
value should not be changed directly; it is shared across all components that
consume the store through `useStore()`. The `setState` function can be called
with a value that should replace the current state or an updater function that 
will receive old state and return new state. Calling `setState` will trigger a
re-render on all components that consume the state.

Note that by default, state persists even when all consumers have unmounted.
The effect is similar to having a global state that your top level `<App />`
consumes.

Many global-state patterns like Redux do not have built-in ways to code split. 
In this library, code splitting can happen naturally because consumers must
`import` any stores they want to use.

The following are good use cases for this library. They benefit from having
state that persists after unmounting and from co-locating action functions with
state values they affect.

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
    - Let's say we need to classify the successfulness of a search
    - Some definitions:
        - A failed search is one that a user makes and clicks on nothing
        - A fruitless search is one that produces no results
        - Good search results see one click
        - Great search results see two clicks, but several seconds apart
    - Various components participate in the process including the search bar,
    the search results list, an item, a link etc.
    - A multi-step event store can track those user actions, initiate timers and 
    decide when to send a success or failure event to an API      
    - Associated actions would be search, unmount search page, click
    - And the store could contact an API after all the actions stop for several
    seconds 

## Writing Middleware

A Middleware function is invoked after a consumer calls an action and before
that defined action function runs. Practical examples of middleware include
logging, analytics, and debugging.

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
- {Function} onMiddlewareError - Callback when a middleware throws an exception
- {String} id - The id string which middleware can use to tell stores apart

All callbacks receive parameters `state, setState, store` where
    - `state` is the store's current state that will be passed to the action
    function
    - `setState` is the setter that will cause all consumers to re-render
    - `store` is the store itself that can be used to debug

## Credits
 
inspired by [@jhonnymichel](https://github.com/jhonnymichel/react-hookstore/blob/6d23d2fcb0e7cf8a3929a01e0c543fe5e05ecf05/src/index.js)