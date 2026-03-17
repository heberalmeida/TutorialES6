# Symbol

## Overview

In ES5, object property names were always strings, which could lead to conflicts. For example, when extending someone else's object (mixin pattern), your new property might clash with existing ones. ES6 introduces `Symbol` to ensure unique property names and avoid collisions.

`Symbol` is a new primitive type for unique values. It is one of JavaScript's built-in types, alongside `undefined`, `null`, Boolean, String, Number, BigInt, and Object.

Symbols are created with `Symbol()`. Object keys can now be strings or Symbols; Symbol keys are always unique.

```javascript
let s = Symbol();

typeof s
// "symbol"
```

The variable `s` is a unique value. `typeof` shows it is a Symbol.

`Symbol()` cannot be used with `new`; it returns a primitive, not an object. Symbols are similar to strings but immutable and unique.

`Symbol()` accepts an optional string description for display and debugging:

```javascript
let s1 = Symbol('foo');
let s2 = Symbol('bar');

s1 // Symbol(foo)
s2 // Symbol(bar)

s1.toString() // "Symbol(foo)"
s2.toString() // "Symbol(bar)"
```

Without a description, both would display as `Symbol()`, making them hard to tell apart. The description helps identify them.

If the argument is an object, its `toString()` is called to produce the description:

```javascript
const obj = {
  toString() {
    return 'abc';
  }
};
const sym = Symbol(obj);
sym // Symbol(abc)
```

The argument is only a description; `Symbol()` with the same argument still returns different values:

```javascript
// no arguments
let s1 = Symbol();
let s2 = Symbol();

s1 === s2 // false

// with arguments
let s1 = Symbol('foo');
let s2 = Symbol('foo');

s1 === s2 // false
```

Each call to `Symbol()` returns a unique value, even with the same argument.

Symbols cannot be used in arithmetic or string concatenation:

```javascript
let sym = Symbol('My symbol');

"your symbol is " + sym
// TypeError: can't convert symbol to string
`your symbol is ${sym}`
// TypeError: can't convert symbol to string
```

Symbols can be explicitly converted to strings:

```javascript
let sym = Symbol('My symbol');

String(sym) // 'Symbol(My symbol)'
sym.toString() // 'Symbol(My symbol)'
```

Symbols can be converted to booleans but not to numbers:

```javascript
let sym = Symbol();
Boolean(sym) // true
!sym  // false

if (sym) {
  // ...
}

Number(sym) // TypeError
sym + 2 // TypeError
```

## Symbol.prototype.description

`Symbol()` can take a description string. Before ES2019, you had to use `toString()` to read it. [ES2019](https://github.com/tc39/proposal-Symbol-description) adds the `description` property:

```javascript
const sym = Symbol('foo');
```

Previously:

```javascript
const sym = Symbol('foo');

String(sym) // "Symbol(foo)"
sym.toString() // "Symbol(foo)"
```

Now:

```javascript
const sym = Symbol('foo');

sym.description // "foo"
```

## Using Symbols as Property Keys

Because every Symbol is unique, using Symbols as property keys prevents name collisions, which is useful when multiple modules contribute to one object.

```javascript
let mySymbol = Symbol();

// style 1
let a = {};
a[mySymbol] = 'Hello!';

// style 2
let a = {
  [mySymbol]: 'Hello!'
};

// style 3
let a = {};
Object.defineProperty(a, mySymbol, { value: 'Hello!' });

// all yield same result
a[mySymbol] // "Hello!"
```

Use brackets or `Object.defineProperty` to use a Symbol as a key. Dot notation does not work:

```javascript
const mySymbol = Symbol();
const a = {};

a.mySymbol = 'Hello!';
a[mySymbol] // undefined
a['mySymbol'] // "Hello!"
```

With dot notation, the key is always a string `"mySymbol"`, not the Symbol.

Inside object literals, Symbol keys must be in brackets:

```javascript
let s = Symbol();

let obj = {
  [s]: function (arg) { ... }
};

obj[s](123);
```

Without brackets, the key would be the string `"s"`. With shorthand:

```javascript
let obj = {
  [s](arg) { ... }
};
```

Symbols work well for constants that must be distinct:

```javascript
const log = {};

log.levels = {
  DEBUG: Symbol('debug'),
  INFO: Symbol('info'),
  WARN: Symbol('warn')
};
console.log(log.levels.DEBUG, 'debug message');
console.log(log.levels.INFO, 'info message');
```

Another example:

```javascript
const COLOR_RED    = Symbol();
const COLOR_GREEN  = Symbol();

function getComplement(color) {
  switch (color) {
    case COLOR_RED:
      return COLOR_GREEN;
    case COLOR_GREEN:
      return COLOR_RED;
    default:
      throw new Error('Undefined color');
    }
}
```

Using Symbols guarantees the `switch` works as intended; no other value can equal them.

Note: Symbol keys are public, not private; they can be enumerated with `Object.getOwnPropertySymbols()`.

## Example: Removing Magic Strings

Magic strings are repeated literal values that create tight coupling. Good style favors variables with clear meaning.

```javascript
function getArea(shape, options) {
  let area = 0;

  switch (shape) {
    case 'Triangle': // magic string
      area = .5 * options.width * options.height;
      break;
    /* ... more code ... */
  }

  return area;
}

getArea('Triangle', { width: 100, height: 100 }); // magic string
```

The string `'Triangle'` is a magic string. A common fix is to use a variable:

```javascript
const shapeType = {
  triangle: 'Triangle'
};

function getArea(shape, options) {
  let area = 0;
  switch (shape) {
    case shapeType.triangle:
      area = .5 * options.width * options.height;
      break;
  }
  return area;
}

getArea(shapeType.triangle, { width: 100, height: 100 });
```

The exact value of `shapeType.triangle` does not matter as long as it is unique. Symbols fit well:

```javascript
const shapeType = {
  triangle: Symbol()
};
```

Only `shapeType.triangle` changes; the rest stays the same.

## Property Enumeration

Symbol keys are not returned by `for...in`, `for...of`, `Object.keys()`, `Object.getOwnPropertyNames()`, or `JSON.stringify()`.

They are not private either. `Object.getOwnPropertySymbols()` returns all Symbol keys:

```javascript
const obj = {};
let a = Symbol('a');
let b = Symbol('b');

obj[a] = 'Hello';
obj[b] = 'World';

const objectSymbols = Object.getOwnPropertySymbols(obj);

objectSymbols
// [Symbol(a), Symbol(b)]
```

Comparison:

```javascript
const obj = {};
const foo = Symbol('foo');

obj[foo] = 'bar';

for (let i in obj) {
  console.log(i); // no output
}

Object.getOwnPropertyNames(obj) // []
Object.getOwnPropertySymbols(obj) // [Symbol(foo)]
```

`Reflect.ownKeys()` returns all keys, including Symbol keys:

```javascript
let obj = {
  [Symbol('my_key')]: 1,
  enum: 2,
  nonEnum: 3
};

Reflect.ownKeys(obj)
//  ["enum", "nonEnum", Symbol(my_key)]
```

Because Symbol keys are skipped by normal enumeration, they can simulate “internal” properties:

```javascript
let size = Symbol('size');

class Collection {
  constructor() {
    this[size] = 0;
  }

  add(item) {
    this[this[size]] = item;
    this[size]++;
  }

  static sizeOf(instance) {
    return instance[size];
  }
}

let x = new Collection();
Collection.sizeOf(x) // 0

x.add('foo');
Collection.sizeOf(x) // 1

Object.keys(x) // ['0']
Object.getOwnPropertyNames(x) // ['0']
Object.getOwnPropertySymbols(x) // [Symbol(size)]
```

`size` is a Symbol, so `Object.keys` and `Object.getOwnPropertyNames` do not include it.

## Symbol.for(), Symbol.keyFor()

To reuse the same Symbol across code, use `Symbol.for()`. It takes a string key, looks for an existing Symbol with that key in a global registry, and returns it or creates and registers a new one:

```javascript
let s1 = Symbol.for('foo');
let s2 = Symbol.for('foo');

s1 === s2 // true
```

Both `s1` and `s2` refer to the same Symbol because they share the key `'foo'`.

`Symbol.for()` registers Symbols globally; `Symbol()` does not. Multiple calls to `Symbol.for('cat')` return the same Symbol; multiple calls to `Symbol('cat')` return different Symbols:

```javascript
Symbol.for("bar") === Symbol.for("bar")
// true

Symbol("bar") === Symbol("bar")
// false
```

`Symbol.keyFor()` returns the key for a registered Symbol:

```javascript
let s1 = Symbol.for("foo");
Symbol.keyFor(s1) // "foo"

let s2 = Symbol("foo");
Symbol.keyFor(s2) // undefined
```

`s2` is unregistered, so `Symbol.keyFor` returns `undefined`.

`Symbol.for()` uses a global registry, regardless of the current scope:

```javascript
function foo() {
  return Symbol.for('bar');
}

const x = foo();
const y = Symbol.for('bar');
console.log(x === y); // true
```

`Symbol.for('bar')` inside `foo` is the same Symbol as in the outer scope.

This allows the same Symbol to be shared across iframes and service workers:

```javascript
iframe = document.createElement('iframe');
iframe.src = String(window.location);
document.body.appendChild(iframe);

iframe.contentWindow.Symbol.for('foo') === Symbol.for('foo')
// true
```

## Example: Module Singleton

A singleton ensures a class always returns the same instance. In Node, each module can act like a class; you want the same instance every time the module is loaded.

One approach is to store the instance on `global`:

```javascript
// mod.js
function A() {
  this.foo = 'hello';
}

if (!global._foo) {
  global._foo = new A();
}

module.exports = global._foo;
```

Then:

```javascript
const a = require('./mod.js');
console.log(a.foo);
```

The problem: `global._foo` is writable, so any file can overwrite it:

```javascript
global._foo = { foo: 'world' };

const a = require('./mod.js');
console.log(a.foo);
```

Using a Symbol key reduces accidental overwrites:

```javascript
// mod.js
const FOO_KEY = Symbol.for('foo');

function A() {
  this.foo = 'hello';
}

if (!global[FOO_KEY]) {
  global[FOO_KEY] = new A();
}

module.exports = global[FOO_KEY];
```

`global[FOO_KEY]` is harder to accidentally overwrite, but still can be:

```javascript
global[Symbol.for('foo')] = { foo: 'world' };

const a = require('./mod.js');
```

With `Symbol()` (not `Symbol.for()`), the key is not globally discoverable, so external code cannot easily overwrite it. The downside: each require gets a different Symbol, so the singleton breaks if the module is reloaded.

## Built-in Symbols

ES6 defines 11 built-in Symbols used by the language internals.

### Symbol.hasInstance

`Symbol.hasInstance` points to the method used by `instanceof`. For `foo instanceof Foo`, the engine calls `Foo[Symbol.hasInstance](foo)`:

```javascript
class MyClass {
  [Symbol.hasInstance](foo) {
    return foo instanceof Array;
  }
}

[1, 2, 3] instanceof new MyClass() // true
```

`new MyClass()` returns an instance whose `Symbol.hasInstance` customizes `instanceof`.

Another example:

```javascript
class Even {
  static [Symbol.hasInstance](obj) {
    return Number(obj) % 2 === 0;
  }
}

// Same as
const Even = {
  [Symbol.hasInstance](obj) {
    return Number(obj) % 2 === 0;
  }
};

1 instanceof Even // false
2 instanceof Even // true
12345 instanceof Even // false
```

### Symbol.isConcatSpreadable

`Symbol.isConcatSpreadable` is a boolean that controls whether an object is spread when passed to `Array.prototype.concat()`:

```javascript
let arr1 = ['c', 'd'];
['a', 'b'].concat(arr1, 'e') // ['a', 'b', 'c', 'd', 'e']
arr1[Symbol.isConcatSpreadable] // undefined

let arr2 = ['c', 'd'];
arr2[Symbol.isConcatSpreadable] = false;
['a', 'b'].concat(arr2, 'e') // ['a', 'b', ['c','d'], 'e']
```

Arrays spread by default; `Symbol.isConcatSpreadable` is `undefined`. Setting it to `false` prevents spreading.

Array-like objects do not spread by default. Set `Symbol.isConcatSpreadable = true` to spread them:

```javascript
let obj = {length: 2, 0: 'c', 1: 'd'};
['a', 'b'].concat(obj, 'e') // ['a', 'b', obj, 'e']

obj[Symbol.isConcatSpreadable] = true;
['a', 'b'].concat(obj, 'e') // ['a', 'b', 'c', 'd', 'e']
```

Can be defined on a class:

```javascript
class A1 extends Array {
  constructor(args) {
    super(args);
    this[Symbol.isConcatSpreadable] = true;
  }
}
class A2 extends Array {
  constructor(args) {
    super(args);
  }
  get [Symbol.isConcatSpreadable] () {
    return false;
  }
}
let a1 = new A1();
a1[0] = 3;
a1[1] = 4;
let a2 = new A2();
a2[0] = 5;
a2[1] = 6;
[1, 2].concat(a1).concat(a2)
// [1, 2, 3, 4, [5, 6]]
```

### Symbol.species

`Symbol.species` points to the constructor used when creating derived objects:

```javascript
class MyArray extends Array {
}

const a = new MyArray(1, 2, 3);
const b = a.map(x => x);
const c = a.filter(x => x > 1);

b instanceof MyArray // true
c instanceof MyArray // true
```

By default, methods like `map` and `filter` return instances of the subclass. `Symbol.species` lets you return the base class instead:

```javascript
class MyArray extends Array {
  static get [Symbol.species]() { return Array; }
}

const a = new MyArray();
const b = a.map(x => x);

b instanceof MyArray // false
b instanceof Array // true
```

Default behavior:

```javascript
static get [Symbol.species]() {
  return this;
}
```

With `Promise` subclasses:

```javascript
class T1 extends Promise {
}

class T2 extends Promise {
  static get [Symbol.species]() {
    return Promise;
  }
}

new T1(r => r()).then(v => v) instanceof T1 // true
new T2(r => r()).then(v => v) instanceof T2 // false
```

`Symbol.species` is used when derived instances (e.g. from `then`, `map`, `filter`) should be created with a specific constructor.

### Symbol.match

`Symbol.match` is the method invoked when an object is used as the argument to `String.prototype.match`:

```javascript
String.prototype.match(regexp)
// Same as
regexp[Symbol.match](this)

class MyMatcher {
  [Symbol.match](string) {
    return 'hello world'.indexOf(string);
  }
}

'e'.match(new MyMatcher()) // 1
```

### Symbol.replace

`Symbol.replace` is used by `String.prototype.replace`:

```javascript
String.prototype.replace(searchValue, replaceValue)
// Same as
searchValue[Symbol.replace](this, replaceValue)
```

Example:

```javascript
const x = {};
x[Symbol.replace] = (...s) => console.log(s);

'Hello'.replace(x, 'World') // ["Hello", "World"]
```

The first argument is the string being replaced; the second is the replacement.

### Symbol.search

`Symbol.search` is used by `String.prototype.search`:

```javascript
String.prototype.search(regexp)
// Same as
regexp[Symbol.search](this)

class MySearch {
  constructor(value) {
    this.value = value;
  }
  [Symbol.search](string) {
    return string.indexOf(this.value);
  }
}
'foobar'.search(new MySearch('foo')) // 0
```

### Symbol.split

`Symbol.split` is used by `String.prototype.split`:

```javascript
String.prototype.split(separator, limit)
// Same as
separator[Symbol.split](this, limit)
```

Example:

```javascript
class MySplitter {
  constructor(value) {
    this.value = value;
  }
  [Symbol.split](string) {
    let index = string.indexOf(this.value);
    if (index === -1) {
      return string;
    }
    return [
      string.substr(0, index),
      string.substr(index + this.value.length)
    ];
  }
}

'foobar'.split(new MySplitter('foo'))
// ['', 'bar']

'foobar'.split(new MySplitter('bar'))
// ['foo', '']

'foobar'.split(new MySplitter('baz'))
// 'foobar'
```

### Symbol.iterator

`Symbol.iterator` points to the default iterator method used by `for...of` and the spread operator:

```javascript
const myIterable = {};
myIterable[Symbol.iterator] = function* () {
  yield 1;
  yield 2;
  yield 3;
};

[...myIterable] // [1, 2, 3]
```

See the Iterator chapter for details.

```javascript
class Collection {
  *[Symbol.iterator]() {
    let i = 0;
    while(this[i] !== undefined) {
      yield this[i];
      ++i;
    }
  }
}

let myCollection = new Collection();
myCollection[0] = 1;
myCollection[1] = 2;

for(let value of myCollection) {
  console.log(value);
}
// 1
// 2
```

### Symbol.toPrimitive

`Symbol.toPrimitive` is the method called when an object is converted to a primitive. It receives a hint: `'number'`, `'string'`, or `'default'`:

```javascript
let obj = {
  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case 'number':
        return 123;
      case 'string':
        return 'str';
      case 'default':
        return 'default';
      default:
        throw new Error();
     }
   }
};

2 * obj // 246
3 + obj // '3default'
obj == 'default' // true
String(obj) // 'str'
```

### Symbol.toStringTag

`Symbol.toStringTag` customizes the string returned by `Object.prototype.toString()`:

```javascript
// Example 1
({[Symbol.toStringTag]: 'Foo'}.toString())
// "[object Foo]"

// Example 2
class Collection {
  get [Symbol.toStringTag]() {
    return 'xxx';
  }
}
let x = new Collection();
Object.prototype.toString.call(x) // "[object xxx]"
```

ES6 built-in `Symbol.toStringTag` values: `'JSON'`, `'Math'`, `'Module'`, `'ArrayBuffer'`, `'DataView'`, `'Map'`, `'Promise'`, `'Set'`, `'Uint8Array'` (etc.), `'WeakMap'`, `'WeakSet'`, `'Map Iterator'`, `'Set Iterator'`, `'String Iterator'`, `'Symbol'`, `'Generator'`, `'GeneratorFunction'`.

### Symbol.unscopables

`Symbol.unscopables` defines which properties are excluded from `with` scope lookup:

```javascript
Array.prototype[Symbol.unscopables]
// {
//   copyWithin: true,
//   entries: true,
//   fill: true,
//   find: true,
//   findIndex: true,
//   includes: true,
//   keys: true
// }

Object.keys(Array.prototype[Symbol.unscopables])
// ['copyWithin', 'entries', 'fill', 'find', 'findIndex', 'includes', 'keys']
```

Without unscopables:

```javascript
// without unscopables
class MyClass {
  foo() { return 1; }
}

var foo = function () { return 2; };

with (MyClass.prototype) {
  foo(); // 1
}

// with unscopables
class MyClass {
  foo() { return 1; }
  get [Symbol.unscopables]() {
    return { foo: true };
  }
}

var foo = function () { return 2; };

with (MyClass.prototype) {
  foo(); // 2
}
```

With `Symbol.unscopables`, `foo` in the `with` block refers to the outer `foo`, not `MyClass.prototype.foo`.
