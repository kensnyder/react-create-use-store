const directlyCompariable = [
  'bigint',
  'boolean',
  'function',
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
  // handle null specially since typeof null === 'object'
  if (prev === null && next === null) {
    // both null
    return true;
  } else if (prev === null || next === null) {
    // one is null but not both
    return false;
  }
  if (directlyCompariable.includes(typeof prev)) {
    return prev === next;
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
    if (!next || typeof next !== 'object' || Array.isArray(next)) {
      // one object and one non-object
      return false;
    }
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
  // some future data type we don't know about
  /* istanbul ignore next */
  return false;
}

module.exports = defaultEqualityFn;
