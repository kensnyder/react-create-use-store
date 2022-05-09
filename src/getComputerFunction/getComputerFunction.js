function getComputerFunction(computer) {
  if (typeof computer === 'string') {
    return state => {
      if (Array.isArray(state)) {
        return state.map(item => item[computer]);
      } else if (typeof state === 'object') {
        return state[computer];
      }
      return undefined;
    };
  } else if (typeof computer === 'function') {
    return computer;
  }
  throw new Error(
    'react-storekeeper: "computer" must be a String or Function.'
  );
}

module.exports = getComputerFunction;
