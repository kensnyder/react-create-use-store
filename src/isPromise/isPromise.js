// from https://github.com/then/is-promise/blob/master/index.js
function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}
module.exports = isPromise;
