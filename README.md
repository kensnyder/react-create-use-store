# react-create-use-store

State management for React using hooks

## Features

1. Stores are easily unit testable
1. Stores can respond to unmount events (e.g. to abort fetching data)
1. Stores are included by only the components that need them
1. Middleware to intercept, modify or block actions

## Use

Define a initial state and action functions to use in your components:

```js
const state = {
  view: 'list',
  stories: [
    { image: '/apple.png', title: 'Hello', descr: 'World' },
    { image: '/grape.png', title: 'Foo', descr: 'Bar' },
  ]
};
const actions = {
  showList,
  showGrid,
};

export const storyStore = createStore({ state, actions });

export function showList(state) {
  return { ...state, view: 'list' };
}

export function showGrid(state) {
  return { ...state, view: 'grid' };
}
```

Then use it in one or more components:

```js
import { storyStore } from '../stores/storyStore.js';

export function StoryItem({ story }) {
	const { state } = useStore(storyStore);

	const [w, h] = state.view === 'grid' ? [200, 180] : [110, 110];

	return (
		<div className={`StoryItem Component view-${state.view}`}>
			<CoverImage url={story.image} width={w} height={h} />
			<h2 className="title">{story.title}</h2>
			<div className="descr">{story.descr}</div>
		</div>
	);
}
```

## Credits
 
inspired by [@jhonnymichel](https://github.com/jhonnymichel/react-hookstore/blob/6d23d2fcb0e7cf8a3929a01e0c543fe5e05ecf05/src/index.js)