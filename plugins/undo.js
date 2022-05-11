function undoable() {
  return function plugin(store) {
    let currIndex = 0;
    const history = [];
    store.undo = undo;
    store.redo = redo;
    store.jump = jump;
    store.jumpTo = jumpTo;
    store.on('AfterUpdate', (prev, next) => {
      if (currIndex !== history.length) {
        history.length = currIndex;
      }
      history.push(next);
      currIndex++;
    });
    function undo() {
      jumpTo(currIndex - 1);
    }
    function redo() {
      jumpTo(currIndex + 1);
    }
    function jump(steps) {
      jumpTo(currIndex + steps);
    }
    function jumpTo(toIndex) {
      // TODO: check if valid?
      store.setState(history[toIndex]);
    }
  };
}

// class Undoable {
//   undo;
//   redo;
//   jump;
//   jumpTo;
//   attach() {}
// }
//
// const undo = new Undoable(options).attach(store);
