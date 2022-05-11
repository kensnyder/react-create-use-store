class PreventableEvent {
  constructor(target, type, data) {
    this.target = target;
    this.type = type;
    this.data = data;
    this.defaultPrevented = false;
    this.propagationStopped = false;
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
  stopPropagation() {
    this.propagationStopped = true;
  }
  stopImmediatePropagation() {
    this.propagationStopped = true;
  }
  isPropagationStopped() {
    return this.propagationStopped;
  }
}

module.exports = PreventableEvent;
