const { useMemo } = require('react');
const storeRegistry = require('../storeRegistry/storeRegistry.js');

function useStoreActions(storeIdOrObj) {
  const store = useMemo(() => storeRegistry.get(storeIdOrObj), [storeIdOrObj]);
  return store.actions;
}

module.exports = useStoreActions;
