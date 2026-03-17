# Object New Methods

This chapter covers the new methods added to the `Object` object.

## Object.is()

ES5 compared two values for equality with two operators: the equality operator (`==`) and the strict equality operator (`===`). Both have drawbacks: the former coerces types, and the latter treats `NaN` as not equal to itself and `+0` as equal to `-0`. JavaScript lacked a way to express "same value" equality across environments.

ES6 introduces the "Same-value equality" algorithm to address this. `Object.is` is the new method that implements it. It compares two values for strict equality and behaves like the strict comparison operator (`===`) in most cases.

```javascript
Object.is('foo', 'foo')
// true
Object.is({}, {})
// false
```

The only differences are: `+0` is not equal to `-0`, and `NaN` equals itself.

```javascript
+0 === -0 //true
NaN === NaN // false

Object.is(+0, -0) // false
Object.is(NaN, NaN) // true
```

ES5 can implement `Object.is` with code like this:

```javascript
Object.defineProperty(Object, 'is', {
  value: function(x, y) {
    if (x === y) {
      // when +0 !== -0
      return x !== 0 || 1 / x === 1 / y;
    }
    // when NaN
    return x !== x && y !== y;
  },
  configurable: true,
  enumerable: false,
  writable: true
});
```

## Object.assign()

### Basic Usage

`Object.assign()` merges objects by copying all enumerable properties from source objects to the target object.

```javascript
const target = { a: 1 };

const source1 = { b: 2 };
const source2 = { c: 3 };

Object.assign(target, source1, source2);
target // {a:1, b:2, c:3}
```

The first argument is the target; the rest are sources. If the target and a source share a property, or if multiple sources share a property, later values override earlier ones.

```javascript
const target = { a: 1, b: 1 };

const source1 = { b: 2, c: 2 };
const source2 = { c: 3 };

Object.assign(target, source1, source2);
target // {a:1, b:2, c:3}
```

With a single argument, `Object.assign()` returns that argument:

```javascript
const obj = {a: 1};
Object.assign(obj) === obj // true
```

If the argument is not an object, it is converted to one, then returned:

```javascript
typeof Object.assign(2) // "object"
```

`undefined` and `null` cannot be converted to objects, so passing them as the first argument throws an error:

```javascript
Object.assign(undefined) // Error
Object.assign(null) // Error
```

If non-object values appear in source positions (i.e., not the first argument), the rules differ. They are converted to objects, and if conversion fails, they are skipped. Thus, `undefined` and `null` as non-first arguments do not throw:

```javascript
let obj = {a: 1};
Object.assign(obj, undefined) === obj // true
Object.assign(obj, null) === obj // true
```

Numeric, string, and boolean values in source positions also do not throw. Only strings produce effects, by being copied into the target as array-like indices:

```javascript
const v1 = 'abc';
const v2 = true;
const v3 = 10;

const obj = Object.assign({}, v1, v2, v3);
console.log(obj); // { "0": "a", "1": "b", "2": "c" }
```

In the code above, `v1`, `v2`, and `v3` are a string, boolean, and number. Only the string is merged (as character indices); numbers and booleans are skipped. Only string wrapper objects yield enumerable properties:

```javascript
Object(true) // {[[PrimitiveValue]]: true}
Object(10)  //  {[[PrimitiveValue]]: 10}
Object('abc') // {0: "a", 1: "b", 2: "c", length: 3, [[PrimitiveValue]]: "abc"}
```

When converting booleans, numbers, and strings to wrapper objects, the primitive is stored in an internal `[[PrimitiveValue]]` property, which `Object.assign()` does not copy. Only the string wrapper produces enumerable properties, and those are copied.

`Object.assign()` only copies own enumerable properties; it does not copy inherited or non-enumerable properties:

```javascript
Object.assign({b: 'c'},
  Object.defineProperty({}, 'invisible', {
    enumerable: false,
    value: 'hello'
  })
)
// { b: 'c' }
```

In the code above, the source has a single non-enumerable property `invisible`, which is not copied.

Properties with Symbol keys are also copied by `Object.assign()`:

```javascript
Object.assign({ a: 'b' }, { [Symbol('c')]: 'd' })
// { a: 'b', Symbol(c): 'd' }
```

### Caveats

**(1)Shallow Copy**

`Object.assign()` performs a shallow copy. If a source property’s value is an object, the target gets a reference to that object, not a copy:

```javascript
const obj1 = {a: {b: 1}};
const obj2 = Object.assign({}, obj1);

obj1.a.b = 2;
obj2.a.b // 2
```

In the code above, `obj1.a` is an object. `Object.assign()` copies a reference; changes to that object affect both `obj1` and `obj2`.

**(2)Replacement of Same-Name Properties**

For nested objects, when the same property exists in target and source, `Object.assign()` replaces, it does not merge:

```javascript
const target = { a: { b: 'c', d: 'e' } }
const source = { a: { b: 'hello' } }
Object.assign(target, source)
// { a: { b: 'hello' } }
```

In the code above, `target.a` is fully replaced by `source.a`; the result is not `{ a: { b: 'hello', d: 'e' } }`. Libraries like Lodash’s `_.defaultsDeep()` provide deep merge alternatives.

**(3)Array Handling**

`Object.assign()` can work on arrays, but treats them as objects with numeric keys:

```javascript
Object.assign([1, 2, 3], [4, 5])
// [4, 5, 3]
```

Here, the source indices 0 and 1 overwrite the target indices 0 and 1.

**(4)Getter Handling**

`Object.assign()` copies property values. If a source property is a getter, the value is read and that value is copied:

```javascript
const source = {
  get foo() { return 1 }
};
const target = {};

Object.assign(target, source)
// { foo: 1 }
```

The getter itself is not copied; only its return value is assigned.

### Common Uses

**(1)Adding Properties to Objects**

```javascript
class Point {
  constructor(x, y) {
    Object.assign(this, {x, y});
  }
}
```

`Object.assign()` adds `x` and `y` to the `Point` instance.

**(2)Adding Methods to Objects**

```javascript
Object.assign(SomeClass.prototype, {
  someMethod(arg1, arg2) {
    ···
  },
  anotherMethod() {
    ···
  }
});

// Same as below
SomeClass.prototype.someMethod = function (arg1, arg2) {
  ···
};
SomeClass.prototype.anotherMethod = function () {
  ···
};
```

The example uses shorthand property syntax to add two methods to `SomeClass.prototype`.

**(3)Cloning Objects**

```javascript
function clone(origin) {
  return Object.assign({}, origin);
}
```

This clones the origin’s own properties into an empty object.

To preserve the prototype chain:

```javascript
function clone(origin) {
  let originProto = Object.getPrototypeOf(origin);
  return Object.assign(Object.create(originProto), origin);
}
```

**(4)Merging Multiple Objects**

```javascript
const merge =
  (target, ...sources) => Object.assign(target, ...sources);
```

To merge into a new object instead of mutating the target:

```javascript
const merge =
  (...sources) => Object.assign({}, ...sources);
```

**(5)Specifying Default Values**

```javascript
const DEFAULTS = {
  logLevel: 0,
  outputFormat: 'html'
};

function processContent(options) {
  options = Object.assign({}, DEFAULTS, options);
  console.log(options);
  // ...
}
```

`DEFAULTS` supplies defaults; `options` overrides them when merged.

Because the merge is shallow, avoid using nested objects in defaults:

```javascript
const DEFAULTS = {
  url: {
    host: 'example.com',
    port: 7070
  },
};

processContent({ url: {port: 8000} })
// {
//   url: {port: 8000}
// }
```

Here, the intent was to change only `url.port`, but `options.url` replaces the entire `DEFAULTS.url`, so `url.host` is lost.

## Object.getOwnPropertyDescriptors()

ES5’s `Object.getOwnPropertyDescriptor()` returns the descriptor of a single property. ES2017 adds `Object.getOwnPropertyDescriptors()`, which returns the descriptors of all own (non-inherited) properties:

```javascript
const obj = {
  foo: 123,
  get bar() { return 'abc' }
};

Object.getOwnPropertyDescriptors(obj)
// { foo:
//    { value: 123,
//      writable: true,
//      enumerable: true,
//      configurable: true },
//   bar:
//    { get: [Function: get bar],
//      set: undefined,
//      enumerable: true,
//      configurable: true } }
```

The returned object maps each property name to its descriptor.

A simple implementation:

```javascript
function getOwnPropertyDescriptors(obj) {
  const result = {};
  for (let key of Reflect.ownKeys(obj)) {
    result[key] = Object.getOwnPropertyDescriptor(obj, key);
  }
  return result;
}
```

`Object.getOwnPropertyDescriptors()` mainly addresses the fact that `Object.assign()` does not correctly copy getters and setters:

```javascript
const source = {
  set foo(value) {
    console.log(value);
  }
};

const target1 = {};
Object.assign(target1, source);

Object.getOwnPropertyDescriptor(target1, 'foo')
// { value: undefined,
//   writable: true,
//   enumerable: true,
//   configurable: true }
```

Here, `source.foo` is a setter, but `Object.assign` copies only the value, turning it into a plain property.

Using `Object.getOwnPropertyDescriptors()` with `Object.defineProperties()` preserves accessors:

```javascript
const source = {
  set foo(value) {
    console.log(value);
  }
};

const target2 = {};
Object.defineProperties(target2, Object.getOwnPropertyDescriptors(source));
Object.getOwnPropertyDescriptor(target2, 'foo')
// { get: undefined,
//   set: [Function: set foo],
//   enumerable: true,
//   configurable: true }
```

Shallow merge with correct descriptor handling:

```javascript
const shallowMerge = (target, source) => Object.defineProperties(
  target,
  Object.getOwnPropertyDescriptors(source)
);
```

Another use: cloning an object (shallow) while preserving descriptors:

```javascript
const clone = Object.create(Object.getPrototypeOf(obj),
  Object.getOwnPropertyDescriptors(obj));

// Or

const shallowClone = (obj) => Object.create(
  Object.getPrototypeOf(obj),
  Object.getOwnPropertyDescriptors(obj)
);
```

This can also express inheritance:

```javascript
const obj = {
  __proto__: prot,
  foo: 123,
};
```

ES6 specifies that `__proto__` need only exist in browsers. Without it:

```javascript
const obj = Object.create(prot);
obj.foo = 123;

// Or

const obj = Object.assign(
  Object.create(prot),
  {
    foo: 123,
  }
);
```

With `Object.getOwnPropertyDescriptors()`:

```javascript
const obj = Object.create(
  prot,
  Object.getOwnPropertyDescriptors({
    foo: 123,
  })
);
```

Mixin pattern:

```javascript
let mix = (object) => ({
  with: (...mixins) => mixins.reduce(
    (c, mixin) => Object.create(
      c, Object.getOwnPropertyDescriptors(mixin)
    ), object)
});

// multiple mixins example
let a = {a: 'a'};
let b = {b: 'b'};
let c = {c: 'c'};
let d = mix(c).with(a, b);

d.c // "c"
d.b // "b"
d.a // "a"
```

Here `d` is an object that mixes `a` and `b` into `c`.

## `__proto__`, Object.setPrototypeOf(), Object.getPrototypeOf()

JavaScript uses the prototype chain for inheritance. ES6 adds more ways to work with prototypes.

### `__proto__` Property

The `__proto__` property (double underscores on each side) reads or sets the object’s prototype. Browsers (including IE11) support it.

```javascript
// ES5 style
const obj = {
  method: function() { ... }
};
obj.__proto__ = someOtherObj;

// ES6 style
var obj = Object.create(someOtherObj);
obj.method = function() { ... };
```

`__proto__` is in the ES6 annex, not the main spec, because it is an internal property. It was included for browser compatibility. Prefer `Object.setPrototypeOf()` (write), `Object.getPrototypeOf()` (read), and `Object.create()` (create) instead.

`__proto__` is implemented via `Object.prototype.__proto__`:

```javascript
Object.defineProperty(Object.prototype, '__proto__', {
  get() {
    let _thisObj = Object(this);
    return Object.getPrototypeOf(_thisObj);
  },
  set(proto) {
    if (this === undefined || this === null) {
      throw new TypeError();
    }
    if (!isObject(this)) {
      return undefined;
    }
    if (!isObject(proto)) {
      return undefined;
    }
    let status = Reflect.setPrototypeOf(this, proto);
    if (!status) {
      throw new TypeError();
    }
  },
});

function isObject(value) {
  return Object(value) === value;
}
```

If an object defines its own `__proto__`, that value is its prototype:

```javascript
Object.getPrototypeOf({ __proto__: null })
// null
```

### Object.setPrototypeOf()

`Object.setPrototypeOf` sets an object’s prototype and returns the object. It is the recommended way in ES6:

```javascript
// format
Object.setPrototypeOf(object, prototype)

// usage
const o = Object.setPrototypeOf({}, null);
```

Equivalent to:

```javascript
function setPrototypeOf(obj, proto) {
  obj.__proto__ = proto;
  return obj;
}
```

Example:

```javascript
let proto = {};
let obj = { x: 10 };
Object.setPrototypeOf(obj, proto);

proto.y = 20;
proto.z = 40;

obj.x // 10
obj.y // 20
obj.z // 40
```

`proto` is set as the prototype of `obj`, so `obj` can access `proto`’s properties.

If the first argument is a primitive, it is converted to an object. The return value is still the first argument, so the operation has no practical effect:

```javascript
Object.setPrototypeOf(1, {}) === 1 // true
Object.setPrototypeOf('foo', {}) === 'foo' // true
Object.setPrototypeOf(true, {}) === true // true
```

`undefined` and `null` cannot be converted to objects, so using them as the first argument throws:

```javascript
Object.setPrototypeOf(undefined, {})
// TypeError: Object.setPrototypeOf called on null or undefined

Object.setPrototypeOf(null, {})
// TypeError: Object.setPrototypeOf called on null or undefined
```

### Object.getPrototypeOf()

This method reads an object’s prototype:

```javascript
Object.getPrototypeOf(obj);
```

Example:

```javascript
function Rectangle() {
  // ...
}

const rec = new Rectangle();

Object.getPrototypeOf(rec) === Rectangle.prototype
// true

Object.setPrototypeOf(rec, Object.prototype);
Object.getPrototypeOf(rec) === Rectangle.prototype
// false
```

If the argument is not an object, it is converted:

```javascript
// Same as Object.getPrototypeOf(Number(1))
Object.getPrototypeOf(1)
// Number {[[PrimitiveValue]]: 0}

// Same as Object.getPrototypeOf(String('foo'))
Object.getPrototypeOf('foo')
// String {length: 0, [[PrimitiveValue]]: ""}

// Same as Object.getPrototypeOf(Boolean(true))
Object.getPrototypeOf(true)
// Boolean {[[PrimitiveValue]]: false}

Object.getPrototypeOf(1) === Number.prototype // true
Object.getPrototypeOf('foo') === String.prototype // true
Object.getPrototypeOf(true) === Boolean.prototype // true
```

`undefined` and `null` cannot be converted and will throw:

```javascript
Object.getPrototypeOf(null)
// TypeError: Cannot convert undefined or null to object

Object.getPrototypeOf(undefined)
// TypeError: Cannot convert undefined or null to object
```

## Object.keys(), Object.values(), Object.entries()

### Object.keys()

ES5 introduced `Object.keys`, which returns an array of the object’s own enumerable property keys:

```javascript
var obj = { foo: 'bar', baz: 42 };
Object.keys(obj)
// ["foo", "baz"]
```

ES2017 [added](https://github.com/tc39/proposal-object-values-entries) `Object.values` and `Object.entries` to complement `Object.keys` for use with `for...of`:

```javascript
let {keys, values, entries} = Object;
let obj = { a: 1, b: 2, c: 3 };

for (let key of keys(obj)) {
  console.log(key); // 'a', 'b', 'c'
}

for (let value of values(obj)) {
  console.log(value); // 1, 2, 3
}

for (let [key, value] of entries(obj)) {
  console.log([key, value]); // ['a', 1], ['b', 2], ['c', 3]
}
```

### Object.values()

`Object.values` returns an array of the object’s own enumerable property values:

```javascript
const obj = { foo: 'bar', baz: 42 };
Object.values(obj)
// ["bar", 42]
```

Property order follows the same rules as property traversal (numeric keys first, then string keys, then Symbol keys):

```javascript
const obj = { 100: 'a', 2: 'b', 7: 'c' };
Object.values(obj)
// ["b", "c", "a"]
```

`Object.values` returns only own enumerable properties:

```javascript
const obj = Object.create({}, {p: {value: 42}});
Object.values(obj) // []
```

By default, `Object.create`’s second-parameter properties have `enumerable: false`, so they are not included. Set `enumerable: true` to include them:

```javascript
const obj = Object.create({}, {p:
  {
    value: 42,
    enumerable: true
  }
});
Object.values(obj) // [42]
```

`Object.values` skips Symbol-keyed properties:

```javascript
Object.values({ [Symbol()]: 123, foo: 'abc' });
// ['abc']
```

If the argument is a string, it returns an array of characters:

```javascript
Object.values('foo')
// ['f', 'o', 'o']
```

If the argument is not an object, it is converted. Numbers and booleans have no enumerable own properties, so they yield an empty array:

```javascript
Object.values(42) // []
Object.values(true) // []
```

### Object.entries()

`Object.entries()` returns an array of `[key, value]` pairs for all own enumerable properties:

```javascript
const obj = { foo: 'bar', baz: 42 };
Object.entries(obj)
// [ ["foo", "bar"], ["baz", 42] ]
```

It behaves like `Object.values` except for the return format. Symbol-keyed properties are skipped:

```javascript
Object.entries({ [Symbol()]: 123, foo: 'abc' });
// [ [ 'foo', 'abc' ] ]
```

Basic use—iterating over properties:

```javascript
let obj = { one: 1, two: 2 };
for (let [k, v] of Object.entries(obj)) {
  console.log(
    `${JSON.stringify(k)}: ${JSON.stringify(v)}`
  );
}
// "one": 1
// "two": 2
```

Converting an object to a `Map`:

```javascript
const obj = { foo: 'bar', baz: 42 };
const map = new Map(Object.entries(obj));
map // Map { foo: "bar", baz: 42 }
```

Simple implementation:

```javascript
// Generator function version
function* entries(obj) {
  for (let key of Object.keys(obj)) {
    yield [key, obj[key]];
  }
}

// Non-Generator function version
function entries(obj) {
  let arr = [];
  for (let key of Object.keys(obj)) {
    arr.push([key, obj[key]]);
  }
  return arr;
}
```

## Object.fromEntries()

`Object.fromEntries()` is the inverse of `Object.entries()`, turning an array of key-value pairs into an object:

```javascript
Object.fromEntries([
  ['foo', 'bar'],
  ['baz', 42]
])
// { foo: "bar", baz: 42 }
```

It is especially useful for converting a `Map` to an object:

```javascript
// Example 1
const entries = new Map([
  ['foo', 'bar'],
  ['baz', 42]
]);

Object.fromEntries(entries)
// { foo: "bar", baz: 42 }

// Example 2
const map = new Map().set('foo', true).set('bar', false);
Object.fromEntries(map)
// { foo: true, bar: false }
```

Another use: converting a query string to an object with `URLSearchParams`:

```javascript
Object.fromEntries(new URLSearchParams('foo=bar&baz=qux'))
// { foo: "bar", baz: "qux" }
```

## Object.hasOwn()

Object properties can be own or inherited. The `hasOwnProperty()` instance method checks for own properties. ES2022 adds the static method [`Object.hasOwn()`](https://github.com/tc39/proposal-accessible-object-hasownproperty) for the same purpose.

`Object.hasOwn()` takes two arguments: the object and the property name:

```javascript
const foo = Object.create({ a: 123 });
foo.b = 456;

Object.hasOwn(foo, 'a') // false
Object.hasOwn(foo, 'b') // true
```

In the example above, `a` is inherited and `b` is own. `Object.hasOwn()` returns `false` for `a` and `true` for `b`.

`Object.hasOwn()` does not throw for objects that do not inherit from `Object.prototype`, unlike `hasOwnProperty()`:

```javascript
const obj = Object.create(null);

obj.hasOwnProperty('foo') // Error
Object.hasOwn(obj, 'foo') // false
```

`Object.create(null)` creates an object with no prototype. Calling `obj.hasOwnProperty()` throws, but `Object.hasOwn()` handles it correctly.
