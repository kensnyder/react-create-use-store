const Emitter = require('./Emitter.js');
const PreventableEvent = require('../PreventableEvent/PreventableEvent.js');

describe('Emitter', () => {
  it('should have methods', () => {
    const emitter = new Emitter();
    expect(typeof emitter.emit).toBe('function');
  });
  it('should pass events with the correct context', () => {
    const foo = {};
    const emitter = new Emitter(foo);
    emitter.on('test', evt => {
      expect(evt.target).toBe(foo);
    });
    emitter.emit('test');
  });
  it('should pass the emitted data in the event object', () => {
    const foo = {};
    const emitter = new Emitter(foo);
    emitter.on('test', evt => {
      expect(evt).toBeInstanceOf(PreventableEvent);
      expect(evt.data).toBe(foo);
    });
    emitter.emit('test', foo);
  });
  it('should return basic object from emit()', () => {
    const foo = {};
    const emitter = new Emitter(foo);
    const evt = emitter.emit('test', foo);
    expect(evt.data).toBe(foo);
    expect(evt.type).toBe('test');
  });
  it('should return a Preventable event from emit()', () => {
    const foo = {};
    const emitter = new Emitter(foo);
    emitter.on('test', () => {});
    const evt = emitter.emit('test', foo);
    expect(evt).toBeInstanceOf(PreventableEvent);
    expect(evt.target).toBe(foo);
    expect(evt.type).toBe('test');
  });
  it('should return the event from emit()', () => {
    const foo = {};
    const emitter = new Emitter(foo);
    const evt = emitter.emit('test', foo);
    expect(evt).toBeInstanceOf(Object);
    expect(evt.data).toBe(foo);
    expect(evt.type).toBe('test');
  });
  it('should allow preventing default', () => {
    const emitter = new Emitter();
    emitter.on('test', evt => evt.preventDefault());
    const evt = emitter.emit('test');
    expect(evt.defaultPrevented).toBe(true);
    expect(evt.isPropagationStopped()).toBe(false);
  });
  it('should remove handlers for off()', () => {
    const emitter = new Emitter();
    let numCalls = 0;
    const handler = () => numCalls++;
    emitter.on('test', handler);
    emitter.off('test', handler);
    emitter.emit('test');
    expect(numCalls).toBe(0);
  });
  it('should support once()', () => {
    const emitter = new Emitter();
    let numCalls = 0;
    const handler = () => numCalls++;
    emitter.once('test', handler);
    emitter.emit('test');
    expect(numCalls).toBe(1);
    emitter.emit('test');
    expect(numCalls).toBe(1);
  });
  it('should do noop when calling off() without calling on() first', () => {
    const emitter = new Emitter();
    const remove = () => {
      const handler = () => {};
      emitter.off('test', handler);
    };
    expect(remove).not.toThrowError();
  });
  it('should stop propagation', () => {
    const emitter = new Emitter();
    let numCalls = 0;
    const handler = evt => {
      numCalls++;
      evt.stopPropagation();
    };
    emitter.on('test', handler);
    emitter.on('test', handler);
    const event = emitter.emit('test');
    expect(numCalls).toBe(1);
    expect(event.isPropagationStopped()).toBe(true);
  });
  it('should stop immediate propagation', () => {
    const emitter = new Emitter();
    let numCalls = 0;
    const handler = evt => {
      numCalls++;
      evt.stopImmediatePropagation();
    };
    emitter.on('test', handler);
    emitter.on('test', handler);
    const event = emitter.emit('test');
    expect(numCalls).toBe(1);
    expect(event.isPropagationStopped()).toBe(true);
  });
});
