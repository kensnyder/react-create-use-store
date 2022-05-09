const scalar = ['undefined', 'boolean', 'string', 'number', 'bigint'];

function defaultEqualityFn(prev, next) {
  if (prev === null && next === null) {
    return true;
  }
  if (scalar.includes(typeof prev)) {
    return next === prev;
  }
  if (Array.isArray(prev)) {
    if (!Array.isArray(next)) {
      return false;
    }
    if (prev.length === next.length) {
      return true;
    }
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
