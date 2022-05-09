const lookup = {};

const storeRegistry = { add, get, remove };

function add(id, store) {
  lookup[id] = store;
}
function get(idOrObj) {
  if (typeof idOrObj === 'object') {
    return idOrObj;
  } else if (lookup[idOrObj]) {
    return lookup[idOrObj];
  }
  throw new Error(
    `react-storekeeper: Unable to find a store with id "${idOrObj}".`
  );
}
function remove(id) {
  lookup[id] = undefined;
}

module.exports = storeRegistry;
