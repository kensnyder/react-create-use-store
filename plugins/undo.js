function undoable({ maxSize = 100 }) {
  return function plugin(store) {
    let currIndex = 0;
    const history = [];
    store.undo = undo;
    store.redo = redo;
    store.jump = jump;
    store.jumpTo = jumpTo;
    store.on('AfterUpdate', ({ data: { next } }) => {
      if (currIndex !== history.length) {
        history.length = currIndex;
      }
      history.push(next);
      if (history.length === maxSize) {
        history.shift();
      } else {
        currIndex++;
      }
    });
    function undo() {
      if (currIndex > 0) {
        jumpTo(currIndex - 1);
      }
    }
    function redo() {
      if (currIndex < history.length) {
        jumpTo(currIndex + 1);
      }
    }
    function jump(steps) {
      jumpTo(currIndex + steps);
    }
    function jumpTo(toIndex) {
      if (toIndex < 0 || toIndex >= history.length) {
        const idx = Number(toIndex);
        throw new Error(
          `react-storekeeper: undoable plugin invalid history index ${idx}; history size is ${history.length}.`
        );
      }
      // TODO: check if valid index?
      store.setState(history[toIndex]);
    }
  };
}

module.exports = undoable;

// class Undoable {
//   undo;
//   redo;
//   jump;
//   jumpTo;
//   attach() {}
// }
//
// const undo = new Undoable(options).attach(store);
