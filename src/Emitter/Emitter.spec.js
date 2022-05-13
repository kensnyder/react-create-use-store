const Emitter = require('./Emitter.js');
describe('Emitter', () => {
  it('should have methods', () => {
    const emitter = new Emitter();
    expect(typeof emitter.emit).toBe('function');
  });
});
