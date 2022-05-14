//
// TO USE:
// store.plugin(syncUrl({ fields: ['term', 'sort'] }));
//
function syncUrl({ fields = null, replace = false }) {
  return function plugin(store) {
    store.on('BeforeInitialState', () => {
      store.mergeSync(readUrl());
    });
    store.on('AfterUpdate', ({ data: { next } }) => {
      writeUrl(next);
    });
    store.on('AfterLastUnmount', () => {
      clearUrl();
    });
  };
  function readUrl() {
    const params = new URLSearchParams(window.location.search);
    const data = {};
    for (const field of fields || params.keys()) {
      if (params.has(field)) {
        data[field] = params.get(field);
      }
    }
    return data;
  }

  function writeUrl(fullState) {
    const params = new URLSearchParams(window.location.search);
    for (const field of fields || params.keys()) {
      params.set(field, fullState[field]);
    }
    const search = '?' + params.toString();
    if (replace) {
      window.history.replaceState({}, document.title, search);
    } else {
      window.history.pushState({}, document.title, search);
    }
  }

  function clearUrl() {
    const params = new URLSearchParams(window.location.search);
    for (const field of fields || params.keys()) {
      params.remove(field, params.get(field));
    }
    const search = '?' + params.toString();
    if (replace) {
      window.history.replaceState({}, document.title, search);
    } else {
      window.history.pushState({}, document.title, search);
    }
  }
}

module.exports = syncUrl;
