const isPromise = require('is-promise');

module.exports = {
  fieldSetter,
  fieldListSetter,
  fieldToggler,
  fieldAdder,
  fieldAppender,
  fieldRemover,
  fieldMapper,
};

/**
 * Helper function to create a mergeState function that directly sets one or more props
 * @param {String|Number} propName  The name of the property to merge
 * @return {Function}  A function suitable for passing to store.setState()
 */
function fieldSetter(propName) {
  return async function merger(newValue) {
    this.mergeState(async old => {
      if (typeof newValue === 'function') {
        newValue = newValue(old[propName]);
        if (isPromise(newValue)) {
          newValue = await newValue;
        }
      }
      return { [propName]: newValue };
    });
  };
}
/**
 * Helper function to create a mergeState function that directly sets one or more props
 * @param {String[]|Number[]} propNames  The name of the property to merge
 * @return {Function}  A function suitable for passing to store.setState()
 */
function fieldListSetter(propNames) {
  return async function merger(...newValues) {
    this.mergeState(async old => {
      const toAwait = [];
      for (let i = 0, len = propNames.length; i < len; i++) {
        if (typeof newValues[i] === 'function') {
          toAwait.push(newValues[i](old[propNames[i]]));
        } else {
          toAwait.push(newValues[i]);
        }
      }
      const awaited = await Promise.all(toAwait);
      const toMerge = {};
      for (let i = 0, len = propNames.length; i < len; i++) {
        toMerge[propNames[i]] = awaited[i];
      }
      return toMerge;
    });
  };
}

function fieldToggler(propName) {
  return function merger() {
    return this.mergeState(old => ({
      [propName]: !old[propName],
    }));
  };
}

function fieldAdder(propName) {
  return function merger(amount) {
    return this.mergeState(old => ({
      [propName]: old[propName] + amount,
    }));
  };
}

function fieldAppender(propName) {
  return function merger(...newItems) {
    return this.mergeState(old => ({
      [propName]: [...old[propName], ...newItems],
    }));
  };
}
function fieldRemover(propName) {
  return function merger(...itemsToRemove) {
    return this.mergeState(old => ({
      [propName]: old[propName].filter(val => !itemsToRemove.includes(val)),
    }));
  };
}
function fieldMapper(propName) {
  return function merger(mapper) {
    return this.mergeState(old => ({
      [propName]: old[propName].map(mapper),
    }));
  };
}
