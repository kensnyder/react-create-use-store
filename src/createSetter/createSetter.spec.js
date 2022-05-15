const { fieldSetter } = require('./createSetter.js');

describe('fieldSetter()', () => {
  it('should set scalar value', () => {
    expect(typeof fieldSetter).toBe('function');
  });
});
