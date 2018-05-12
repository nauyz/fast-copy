// test
import test from 'ava';
import sinon from 'sinon';

// src
import * as utils from 'src/utils';
import * as constants from 'src/constants';

test.serial('if getNewCache will return a new WeakSet when support is present', (t) => {
  const result = utils.getNewCache();

  t.true(result instanceof WeakSet);
});

test.serial('if getNewCache will return a new WeakSet-like object when support is not present', (t) => {
  const support = constants.HAS_WEAKSET_SUPPORT;

  constants.HAS_WEAKSET_SUPPORT = false;

  const result = utils.getNewCache();

  t.false(result instanceof WeakSet);
  t.deepEqual(result._values, []);

  const value = {foo: 'bar'};

  result.add(value);

  t.deepEqual(result._values, [value]);
  t.true(result.has(value));

  constants.HAS_WEAKSET_SUPPORT = support;
});

test('if getRegExpFlags will return an empty string when no flags are on the regExp', (t) => {
  const regExp = /foo/;

  const result = utils.getRegExpFlags(regExp);

  t.is(result, '');
});

test('if getRegExpFlags will add the g flag when one is on the regExp', (t) => {
  const regExp = /foo/g;

  const result = utils.getRegExpFlags(regExp);

  t.is(result, 'g');
});

test('if getRegExpFlags will add the i flag when one is on the regExp', (t) => {
  const regExp = /foo/i;

  const result = utils.getRegExpFlags(regExp);

  t.is(result, 'i');
});

test('if getRegExpFlags will add the m flag when one is on the regExp', (t) => {
  const regExp = /foo/m;

  const result = utils.getRegExpFlags(regExp);

  t.is(result, 'm');
});

test('if getRegExpFlags will add multiple flags when they are all on the regExp', (t) => {
  const regExp = /foo/gim;

  const result = utils.getRegExpFlags(regExp);

  t.is(result, 'gim');
});

test.serial('if getSymbols will get the symbols that are enumerable on the object', (t) => {
  const symbol = Symbol('enumerable');

  const object = {
    [symbol]: 'present'
  };

  Object.defineProperty(object, Symbol('non-enumerable'), {
    enumerable: false,
    value: 'hidden'
  });

  const result = utils.getSymbols(object);

  t.deepEqual(result, [symbol]);
});

test.serial('if getSymbols will return an empty array when the getOwnPropertySymbols method does not exist', (t) => {
  const support = constants.HAS_PROPERTY_SYMBOL_SUPPORT;

  constants.HAS_PROPERTY_SYMBOL_SUPPORT = false;

  const symbol = Symbol('enumerable');

  const object = {
    [symbol]: 'present'
  };

  Object.defineProperty(object, Symbol('non-enumerable'), {
    enumerable: false,
    value: 'hidden'
  });

  const result = utils.getSymbols(object);

  t.deepEqual(result, []);

  constants.HAS_PROPERTY_SYMBOL_SUPPORT = support;
});

test('if isObjectCopyable will return false when the object passed is not an object type', (t) => {
  const object = 'foo';
  const cache = new WeakSet();

  const result = utils.isObjectCopyable(object, cache);

  t.false(result);
});

test('if isObjectCopyable will return false when the object passed is null', (t) => {
  const object = null;
  const cache = new WeakSet();

  const result = utils.isObjectCopyable(object, cache);

  t.false(result);
});

test('if isObjectCopyable will return false when the object passed is in the cache already', (t) => {
  const object = {foo: 'bar'};
  const cache = new WeakSet([object]);

  const result = utils.isObjectCopyable(object, cache);

  t.false(result);
});

test('if isObjectCopyable will return false when the object passed is thenable', (t) => {
  const object = {foo: 'bar', then() {}};
  const cache = new WeakSet();

  const result = utils.isObjectCopyable(object, cache);

  t.false(result);
});

test('if isObjectCopyable will return false when the object passed is an Error', (t) => {
  const object = new Error('boom');
  const cache = new WeakSet();

  const result = utils.isObjectCopyable(object, cache);

  t.false(result);
});

test('if isObjectCopyable will return false when the object passed is a WeakMap', (t) => {
  const object = new WeakMap();
  const cache = new WeakSet();

  const result = utils.isObjectCopyable(object, cache);

  t.false(result);
});

test('if isObjectCopyable will return false when the object passed is a WeakSet', (t) => {
  const object = new WeakSet();
  const cache = new WeakSet();

  const result = utils.isObjectCopyable(object, cache);

  t.false(result);
});

test('if isObjectCopyable will return true when all conditions are met', (t) => {
  const object = {should: 'pass'};
  const cache = new WeakSet();

  const result = utils.isObjectCopyable(object, cache);

  t.true(result);
});

test('if copyArray will copy the array to a new array', (t) => {
  const array = ['foo', {bar: 'baz'}];
  const copy = sinon.stub().returnsArg(0);

  const result = utils.copyArray(array, copy);

  t.not(result, array);
  t.is(copy.callCount, array.length);
  t.deepEqual(result, array);
});

test('if copyArrayBuffer will copy the arrayBuffer to a new arrayBuffer', (t) => {
  const arrayBuffer = new ArrayBuffer(8);

  const result = utils.copyArrayBuffer(arrayBuffer);

  t.not(result, arrayBuffer);
  t.deepEqual(result, arrayBuffer);
});

test.serial('if copyBuffer will copy the buffer to a new buffer', (t) => {
  const buffer = new Buffer('this is a test buffer');

  const result = utils.copyBuffer(buffer);

  t.not(result, buffer);
  t.is(result.toString(), buffer.toString());
});

test.serial('if copyBuffer will copy the buffer to a new buffer for older node systems', (t) => {
  const allocUnsafe = Buffer.allocUnsafe;
  const buffer = new Buffer('this is a test buffer');

  Buffer.allocUnsafe = undefined;

  const result = utils.copyBuffer(buffer);

  t.not(result, buffer);
  t.is(result.toString(), buffer.toString());

  Buffer.allocUnsafe = allocUnsafe;
});

test('if copyIterable will copy the map to a new map', (t) => {
  const iterable = new Map([['foo', 'bar'], ['bar', 'baz']]);
  const copy = sinon.stub().returnsArg(0);
  const isMap = true;

  const result = utils.copyIterable(iterable, copy, isMap);

  t.not(result, iterable);
  t.deepEqual(result, iterable);
  t.is(copy.callCount, iterable.size);
});

test('if copyIterable will copy the set to a new set', (t) => {
  const iterable = new Set(['foo', 'bar']);
  const copy = sinon.stub().returnsArg(0);
  const isMap = false;

  const result = utils.copyIterable(iterable, copy, isMap);

  t.not(result, iterable);
  t.deepEqual(result, iterable);
  t.is(copy.callCount, iterable.size);
});

test('if copyObject will copy the object to a new object', (t) => {
  const object = {foo: 'bar', bar: {baz: 'quz'}};
  const copy = sinon.stub().returnsArg(0);
  const isPlainObject = true;

  const result = utils.copyObject(object, copy, isPlainObject);

  t.not(result, object);
  t.deepEqual(result, object);
  t.is(copy.callCount, Object.keys(object).length);
});

test('if copyObject will copy the object to a new object when there are symbols', (t) => {
  const object = {foo: 'bar', bar: {baz: 'quz'}, [Symbol('blah')]: 'why not'};
  const copy = sinon.stub().returnsArg(0);
  const isPlainObject = true;

  const result = utils.copyObject(object, copy, isPlainObject);

  t.not(result, object);
  t.deepEqual(result, object);
  t.is(copy.callCount, Object.keys(object).length + Object.getOwnPropertySymbols(object).length);
});

test('if copyObject will copy the object to a new object when there are only symbols', (t) => {
  const object = {[Symbol('blah')]: 'why not'};
  const copy = sinon.stub().returnsArg(0);
  const isPlainObject = true;

  const result = utils.copyObject(object, copy, isPlainObject);

  t.not(result, object);
  t.deepEqual(result, object);
  t.is(copy.callCount, Object.getOwnPropertySymbols(object).length);
});

test('if copyObject will copy the pure object to a new pure object', (t) => {
  const object = Object.create(null);

  object.foo = 'bar';
  object.bar = {baz: 'quz'};

  const copy = sinon.stub().returnsArg(0);
  const isPlainObject = false;

  const result = utils.copyObject(object, copy, isPlainObject);

  t.not(result, object);
  t.is(Object.getPrototypeOf(result), null);
  t.deepEqual(result, object);
  t.is(copy.callCount, Object.keys(object).length);
});

test('if copyObject will copy the non-standard object to a new object of the same type', (t) => {
  function Foo(values) {
    Object.assign(this, values);

    return this;
  }

  const object = new Foo({foo: 'bar', bar: {baz: 'quz'}});
  const copy = sinon.stub().returnsArg(0);
  const isPlainObject = false;

  const result = utils.copyObject(object, copy, isPlainObject);

  t.not(result, object);
  t.true(result instanceof Foo);
  t.deepEqual(result, object);
  t.is(copy.callCount, Object.keys(object).length);
});

test('if copyRegExp will copy the regExp to a new regExp', (t) => {
  const regExp = /foo/gi;

  const result = utils.copyRegExp(regExp);

  t.not(result, regExp);
  t.deepEqual(result, regExp);
});

test('if copyTypedArray will copy the dataView to a new arrayBuffer', (t) => {
  const dataView = new DataView(new ArrayBuffer(16));

  const result = utils.copyTypedArray(dataView);

  t.not(result, dataView);
  t.deepEqual(result, dataView);
});
