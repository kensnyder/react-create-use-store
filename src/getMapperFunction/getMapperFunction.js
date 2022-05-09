const identity = k => k;

function getMapperFunction(mapState) {
  if (typeof mapState === 'string') {
    return state => state[mapState];
  } else if (Array.isArray(mapState)) {
    return state => {
      const sliced = {};
      for (const field of mapState) {
        sliced[field] = state[field];
      }
      return sliced;
    };
  } else if (typeof mapState === 'function') {
    return mapState;
  } else if (mapState === null) {
    return identity;
  } else {
    throw new Error(
      'react-storekeeper: "mapState" function must be a function, string, array, or null.'
    );
  }
}
module.exports = getMapperFunction;
