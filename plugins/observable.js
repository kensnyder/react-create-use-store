//
// .subscribe()
// call next(newState)
//
function observable() {
  return function plugin(store) {
    store.subscribe = function (observer) {
      store.on('AfterUpdate', event => {
        observer.next(event.data.next);
      });
    };
    // store.unsubscribe = function (observer) {
    //   store.off('AfterUpdate', ?);
    // };
  };
}

module.exports = observable;
