# react-create-use-store

Simple state management for React using hooks

## Features

1. Instead of reducers or observables, define "actions": 
   functions that take current state and optionally set new state 
1. Store actions are easily testable
1. Stores can respond to lifecycle events including unmount (e.g. to abort fetching data)
1. A store can be used by one component or many components
1. Stores are included by only the components that need them
1. Stores allow defining middleware to intercept, modify or block actions

## Try it

[CodeSandbox Example](https://codesandbox.io/s/rlm4k281mq)

## Use

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
export function showView([state, setState], view) {
  setState(old => ({ ...old, view }));
}

export async function searchStories([state, setState], term = '') {
  setState(old => ({...old, isLoading: true}));
  const stories = await api.get('/api/stories', { term });
  setState(old => ({...old, isLoading: false, stories }));
}

export async function deleteStory([state, setState], story) {
  const stories = state.stories.filter(s => s !== story);
  setState(old => ({...old, stories }));
  const deletedOk = await api.delete(`/api/stories/${story.id}`);
  if (!deletedOk) {
    setState(old => ({...old, stories: [...old.stories, story]}));
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

export function StoryListing() {
	const { state, actions: { setView } } = useStore(storyStore);
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
                <StoryItem key={story.id} story={story} />
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

export function StoryItem({ story }) {
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

## Credits
 
inspired by [@jhonnymichel](https://github.com/jhonnymichel/react-hookstore/blob/6d23d2fcb0e7cf8a3929a01e0c543fe5e05ecf05/src/index.js)