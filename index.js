const createStore = require('./src/createStore/createStore.js');
const useStoreSelector = require('./src/useStoreSelector/useStoreSelector.js');
const useStoreState = require('./src/useStoreState/useStoreState.js');
const {
  fieldSetter,
  fieldListSetter,
  fieldToggler,
  fieldAdder,
  fieldAppender,
  fieldRemover,
  fieldMapper,
} = require('./src/createSetter/createSetter.js');

module.exports = {
  createStore,
  useStoreSelector,
  useStoreState,
  fieldSetter,
  fieldListSetter,
  fieldToggler,
  fieldAdder,
  fieldAppender,
  fieldRemover,
  fieldMapper,
};
