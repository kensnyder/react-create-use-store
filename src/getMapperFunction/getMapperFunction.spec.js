const getMapperFunction = require('./getMapperFunction.js');

describe('getMapperFunction', () => {
  it('should pass through functions', () => {
    const fn = state => state.count;
    const mapper = getMapperFunction(fn);
    expect(mapper).toBe(fn);
  });
  it('should accept strings', () => {
    const mapper = getMapperFunction('phone');
    const slice = mapper({ name: 'John', phone: '867-5309' });
    expect(slice).toEqual('867-5309');
  });
  it('should accept integers', () => {
    const mapper = getMapperFunction(1);
    const slice = mapper(['red', 'blue', 'green']);
    expect(slice).toEqual('blue');
  });
  it('should accept arrays', () => {
    const mapper = getMapperFunction(['phone']);
    const slice = mapper({ name: 'John', phone: '867-5309' });
    expect(slice).toEqual({ phone: '867-5309' });
  });
  it('should return an identity function on null', () => {
    const mapper = getMapperFunction(null);
    const slice = mapper(5);
    expect(slice).toBe(5);
  });
  it('should return an identity function on undefined', () => {
    const mapper = getMapperFunction(undefined);
    const slice = mapper(6);
    expect(slice).toBe(6);
  });
  it('should throw errors on boolean', () => {
    const tryIt = () => {
      getMapperFunction(false);
    };
    expect(tryIt).toThrowError();
  });
});
