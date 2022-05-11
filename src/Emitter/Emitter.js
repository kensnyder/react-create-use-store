const PreventableEvent = require('../PreventableEvent/PreventableEvent.js');

class Emitter {
  constructor(context = null) {
    this._handlers = {};
    this._context = context;
  }

  on(name, handler) {
    if (!this._handlers[name]) {
      this._handlers[name] = [];
    }
    this._handlers[name].push(handler);
  }

  off(name, handler) {
    if (!this._handlers[name]) {
      this._handlers[name] = [];
    }
    this._handlers[name] = this._handlers[name].filter(h => h !== handler);
  }

  once(name, handler) {
    const onceHandler = event => {
      this.off(name, onceHandler);
      handler.call(this._context, event);
    };
    this.on(name, onceHandler);
  }

  emit(name, data) {
    if (!this._handlers[name] || this._handlers[name].length === 0) {
      return {};
    }
    const event = new PreventableEvent(this._context, name, data);
    for (const handler of this._handlers) {
      handler.call(this._context, event);
      if (event.propagationStopped) {
        break;
      }
    }
    return event;
  }
}

module.exports = Emitter;
