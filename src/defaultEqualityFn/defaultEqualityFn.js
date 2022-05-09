const scalarTypes = [
  'bigint',
  'boolean',
  'number',
  'string',
  'symbol',
  'undefined',
];

/**
 * A default way to check if two slices of state are equal
 * Used to determine if a component should rerender or not
 * @param {*} prev - The previous value of the state
 * @param {*} next - The next value of the state
 * @return {Boolean} - True if values are shallowly equal
 */
function defaultEqualityFn(prev, next) {
  if (prev === null && next === null) {
    // both null
    return true;
  } else if (prev === null || next === null) {
    // one is null but not both
    return false;
  }
  if (scalarTypes.includes(typeof prev)) {
    return next === prev;
  }
  if (Array.isArray(prev)) {
    if (!Array.isArray(next)) {
      // one array and one non-array
      return false;
    }
    if (prev.length !== next.length) {
      // array cannot be the same because it has different lengths
      return false;
    }
    // shallow array comparison
    for (let i = 0, len = prev.length; i < len; i++) {
      if (prev[i] !== next[i]) {
        return false;
      }
    }
    return true;
  } else if (typeof prev === 'object') {
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    if (prevKeys.length !== nextKeys.length) {
      return false;
    }
    // shallow object comparison
    for (const key of prevKeys) {
      if (next[key] !== prev[key]) {
        return false;
      }
    }
    return true;
  }
  return false;
}

module.exports = defaultEqualityFn;
