const PreventableEvent = require('../PreventableEvent/PreventableEvent.js');

class Emitter {
  constructor(context = null) {
    this._handlers = {};
    this._context = context;
  }

  on(type, handler) {
    if (!this._handlers[type]) {
      this._handlers[type] = [];
    }
    this._handlers[type].push(handler);
  }

  off(type, handler) {
    if (!this._handlers[type]) {
      this._handlers[type] = [];
    }
    this._handlers[type] = this._handlers[type].filter(h => h !== handler);
  }

  once(type, handler) {
    const onceHandler = event => {
      this.off(type, onceHandler);
      handler.call(this._context, event);
    };
    this.on(type, onceHandler);
  }

  emit(type, data = null) {
    if (!this._handlers[type] || this._handlers[type].length === 0) {
      return { type, data };
    }
    const event = new PreventableEvent(this._context, type, data);
    for (const handler of this._handlers[type]) {
      handler.call(this._context, event);
      if (event.propagationStopped) {
        break;
      }
    }
    return event;
  }
}

module.exports = Emitter;
