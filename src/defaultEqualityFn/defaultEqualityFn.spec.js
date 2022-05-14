const isEqual = require('./defaultEqualityFn.js');

describe('defaultEqualityFn', () => {
  it('should consider nulls to be equal', () => {
    const res = isEqual(null, null);
    expect(res).toBe(true);
  });
  it('should consider null to be unequal to anything else', () => {
    const res = isEqual(null, 5);
    expect(res).toBe(false);
  });
  it('should consider undefined to be equal', () => {
    const res = isEqual(undefined, undefined);
    expect(res).toBe(true);
  });
  it('should consider undefined to be unequal to anything else', () => {
    const res = isEqual(undefined, 5);
    expect(res).toBe(false);
  });
  it('should handle equal bigints', () => {
    const res = isEqual(1n, 1n);
    expect(res).toBe(true);
  });
  it('should handle unequal bigints', () => {
    const res = isEqual(1n, 42n);
    expect(res).toBe(false);
  });
  it('should handle equal booleans', () => {
    const res = isEqual(true, true);
    expect(res).toBe(true);
  });
  it('should handle unequal booleans', () => {
    const res = isEqual(true, false);
    expect(res).toBe(false);
  });
  it('should handle equal numbers', () => {
    const res = isEqual(1, 1);
    expect(res).toBe(true);
  });
  it('should handle unequal numbers', () => {
    const res = isEqual(1, 42);
    expect(res).toBe(false);
  });
  it('should handle equal strings', () => {
    const res = isEqual('string', 'string');
    expect(res).toBe(true);
  });
  it('should handle unequal strings', () => {
    const res = isEqual('', 'a');
    expect(res).toBe(false);
  });
  it('should handle equal symbols', () => {
    const sym = Symbol('a');
    const res = isEqual(sym, sym);
    expect(res).toBe(true);
  });
  it('should handle unequal symbols', () => {
    const res = isEqual(Symbol('a'), Symbol('a'));
    expect(res).toBe(false);
  });
  it('should handle equal undefined', () => {
    const res = isEqual(undefined, undefined);
    expect(res).toBe(true);
  });
  it('should handle unequal undefined', () => {
    const res = isEqual(undefined, null);
    expect(res).toBe(false);
  });
  it('should handle equal array', () => {
    const res = isEqual([1, 2, 3], [1, 2, 3]);
    expect(res).toBe(true);
  });
  it('should handle arrays, non-array', () => {
    const res = isEqual([1, 2, 3], false);
    expect(res).toBe(false);
  });
  it('should handle arrays of different sizes', () => {
    const res = isEqual([1, 2, 3], []);
    expect(res).toBe(false);
  });
  it('should handle arrays of different scalar values', () => {
    const res = isEqual([1, 2, 3], [4, 5, 6]);
    expect(res).toBe(false);
  });
  it('should handle equal arrays of same objects', () => {
    const obj1 = {};
    const obj2 = {};
    const res = isEqual([obj1, obj2], [obj1, obj2]);
    expect(res).toBe(true);
  });
  it('should handle equal object', () => {
    const res = isEqual({ a: 1 }, { a: 1 });
    expect(res).toBe(true);
  });
  it('should handle objects with different sizes', () => {
    const res = isEqual({ a: 1 }, {});
    expect(res).toBe(false);
  });
  it('should handle objects with different scalar values', () => {
    const res = isEqual({ a: 1 }, { a: 2 });
    expect(res).toBe(false);
  });
  it('should handle equal object of same objects', () => {
    const obj1 = {};
    const obj2 = {};
    const res = isEqual({ a: obj1, b: obj2 }, { a: obj1, b: obj2 });
    expect(res).toBe(true);
  });
  it('should handle object and non-object', () => {
    const res = isEqual({ a: 1, b: 2 }, null);
    expect(res).toBe(false);
  });
  it('should handle object and array', () => {
    const res = isEqual({}, []);
    expect(res).toBe(false);
  });
  it('should say functions are equal', () => {
    const fn = () => {};
    const res = isEqual(fn, fn);
    expect(res).toBe(true);
  });
  it('should say symbols are', () => {
    const fn = () => {};
    const res = isEqual(fn, fn);
    expect(res).toBe(true);
  });
});
