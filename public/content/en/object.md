# Object Extensions

The object is the most important data structure in JavaScript. ES6 made significant upgrades to it. This chapter covers changes to the data structure itself; the next chapter introduces the new methods added to the `Object` object.

## Shorthand Property Syntax

ES6 allows writing variables and functions directly inside curly braces as object properties and methods. This makes the syntax more concise.

```javascript
const foo = 'bar';
const baz = {foo};
baz // {foo: "bar"}

// Same as
const baz = {foo: foo};
```

In the code above, the variable `foo` is written directly inside the curly braces. The property name becomes the variable name, and the property value becomes the variable value. Below is another example.

```javascript
function f(x, y) {
  return {x, y};
}

// Same as

function f(x, y) {
  return {x: x, y: y};
}

f(1, 2) // Object {x: 1, y: 2}
```

Besides property shorthand, methods can also use shorthand.

```javascript
const o = {
  method() {
    return "Hello!";
  }
};

// Same as

const o = {
  method: function() {
    return "Hello!";
  }
};
```

Below is a practical example.

```javascript
let birth = '2000/01/01';

const Person = {

  name: 'John',

  //same as birth: birth
  birth,

  // Same ashello: function ()...
  hello() { console.log('My name is', this.name); }

};
```

This syntax is very convenient for function return values.

```javascript
function getPoint() {
  const x = 1;
  const y = 10;
  return {x, y};
}

getPoint()
// {x:1, y:10}
```

When a CommonJS module exports a set of variables, the shorthand syntax is well suited.

```javascript
let ms = {};

function getItem (key) {
  return key in ms ? ms[key] : null;
}

function setItem (key, value) {
  ms[key] = value;
}

function clear () {
  ms = {};
}

module.exports = { getItem, setItem, clear };
// Same as
module.exports = {
  getItem: getItem,
  setItem: setItem,
  clear: clear
};
```

Setters and getters also use this shorthand.

```javascript
const cart = {
  _wheels: 4,

  get wheels () {
    return this._wheels;
  },

  set wheels (value) {
    if (value < this._wheels) {
      throw new Error('Value too small!');
    }
    this._wheels = value;
  }
}
```

Shorthand is also useful when logging objects.

```javascript
let user = {
  name: 'test'
};

let foo = {
  bar: 'baz'
};

console.log(user, foo)
// {name: "test"} {bar: "baz"}
console.log({user, foo})
// {user: {name: "test"}, foo: {bar: "baz"}}
```

In the code above, when `console.log` outputs `user` and `foo` directly, you get two groups of key-value pairs, which can be confusing. Outputting them inside curly braces produces the shorthand notation, with object names printed before each group, making it clearer.

Note that shorthand object methods cannot be used as constructors; doing so will throw an error.

```javascript
const obj = {
  f() {
    this.foo = 'bar';
  }
};

new obj.f() // Error
```

In the code above, `f` is a shorthand object method, so `obj.f` cannot be used as a constructor.

## Property Name Expressions

There are two ways to define object properties in JavaScript.

```javascript
// Method 1
obj.foo = true;

// Method 2
obj['a' + 'bc'] = 123;
```

The first method uses an identifier directly as the property name; the second uses an expression as the property name, which must be placed inside square brackets.

However, when defining objects with object literals (curly braces), ES5 only allowed method one (identifiers) for property names.

```javascript
var obj = {
  foo: true,
  abc: 123
};
```

ES6 allows using method two (expressions) for property names when defining objects with literals—put the expression inside square brackets.

```javascript
let propKey = 'foo';

let obj = {
  [propKey]: true,
  ['a' + 'bc']: 123
};
```

Below is another example.

```javascript
let lastWord = 'last word';

const a = {
  'first word': 'hello',
  [lastWord]: 'world'
};

a['first word'] // "hello"
a[lastWord] // "world"
a['last word'] // "world"
```

Expressions can also be used for method names.

```javascript
let obj = {
  ['h' + 'ello']() {
    return 'hi';
  }
};

obj.hello() // hi
```

Note: property name expressions and shorthand syntax cannot be used together; doing so will throw an error.

```javascript
// Error
const foo = 'bar';
const bar = 'abc';
const baz = { [foo] };

// Correct
const foo = 'bar';
const baz = { [foo]: 'abc'};
```

Note: if a property name expression is an object, it will automatically be converted to the string `[object Object]`, which can be problematic.

```javascript
const keyA = {a: 1};
const keyB = {b: 2};

const myObject = {
  [keyA]: 'valueA',
  [keyB]: 'valueB'
};

myObject // Object {[object Object]: "valueB"}
```

In the code above, both `[keyA]` and `[keyB]` resolve to `[object Object]`, so `[keyB]` overwrites `[keyA]`, and `myObject` ends up with only one `[object Object]` property.

## The name Property of Methods

The `name` property of a function returns the function name. Object methods are functions, so they also have a `name` property.

```javascript
const person = {
  sayName() {
    console.log('hello!');
  },
};

person.sayName.name   // "sayName"
```

In the code above, the method's `name` property returns the function name (i.e., the method name).

For getters and setters, the `name` property is not on the method itself but on the descriptor's `get` and `set` properties, prefixed with `get` and `set`.

```javascript
const obj = {
  get foo() {},
  set foo(x) {}
};

obj.foo.name
// TypeError: Cannot read property 'name' of undefined

const descriptor = Object.getOwnPropertyDescriptor(obj, 'foo');

descriptor.get.name // "get foo"
descriptor.set.name // "set foo"
```

There are two special cases: functions created by `bind` have a `name` that returns `bound` plus the original function name; functions created with the `Function` constructor have `name` returning `anonymous`.

```javascript
(new Function()).name // "anonymous"

var doSomething = function() {
  // ...
};
doSomething.bind().name // "bound doSomething"
```

If an object method is a Symbol value, the `name` property returns the description of that Symbol.

```javascript
const key1 = Symbol('description');
const key2 = Symbol();
let obj = {
  [key1]() {},
  [key2]() {},
};
obj[key1].name // "[description]"
obj[key2].name // ""
```

In the code above, the Symbol for `key1` has a description; `key2` does not.

## Enumerability and Traversal of Properties

### Enumerability

Each property of an object has a descriptor that controls its behavior. `Object.getOwnPropertyDescriptor` can retrieve that descriptor.

```javascript
let obj = { foo: 123 };
Object.getOwnPropertyDescriptor(obj, 'foo')
//  {
//    value: 123,
//    writable: true,
//    enumerable: true,
//    configurable: true
//  }
```

The descriptor's `enumerable` property, called "enumerability," indicates whether certain operations will ignore the property when it is `false`.

Four operations ignore properties with `enumerable` set to `false`:

- `for...in` loop: iterates only over own and inherited enumerable properties.
- `Object.keys()`: returns the keys of all own enumerable properties.
- `JSON.stringify()`: serializes only own enumerable properties.
- `Object.assign()`: ignores properties with `enumerable` set to `false` and copies only own enumerable properties.

Of these, the first three existed in ES5; `Object.assign()` is new in ES6. Only `for...in` returns inherited properties; the other three work only on own properties. The original purpose of "enumerability" was to let some properties be skipped by `for...in` so that internal properties and methods would not appear. For example, `Object.prototype.toString` and the `length` property of arrays have `enumerable: false` and are thus not iterated by `for...in`.

```javascript
Object.getOwnPropertyDescriptor(Object.prototype, 'toString').enumerable
// false

Object.getOwnPropertyDescriptor([], 'length').enumerable
// false
```

In the code above, both `toString` and `length` have `enumerable: false`, so `for...in` does not include them.

ES6 also specifies that all prototype methods of classes are non-enumerable.

```javascript
Object.getOwnPropertyDescriptor(class {foo() {}}.prototype, 'foo').enumerable
// false
```

In general, including inherited properties complicates operations. In most cases we only care about own properties, so prefer `Object.keys()` over `for...in`.

### Property Traversal

ES6 provides five ways to traverse object properties.

**(1)for...in**

`for...in` loops over own and inherited enumerable properties (excluding Symbol properties).

**(2)Object.keys(obj)**

`Object.keys` returns an array of the object's own (non-inherited) enumerable property keys (excluding Symbol properties).

**(3)Object.getOwnPropertyNames(obj)**

`Object.getOwnPropertyNames` returns an array of all own property keys (excluding Symbol properties, but including non-enumerable ones).

**(4)Object.getOwnPropertySymbols(obj)**

`Object.getOwnPropertySymbols` returns an array of all own Symbol property keys.

**(5)Reflect.ownKeys(obj)**

`Reflect.ownKeys` returns an array of all own (non-inherited) keys, whether Symbol or string and whether enumerable or not.

These five methods all follow the same traversal order:

- First, all numeric keys in ascending order.
- Then, all string keys in order of addition.
- Finally, all Symbol keys in order of addition.

```javascript
Reflect.ownKeys({ [Symbol()]:0, b:0, 10:0, 2:0, a:0 })
// ['2', '10', 'b', 'a', Symbol()]
```

In the code above, `Reflect.ownKeys` returns an array with all properties of the argument object: numeric keys `2` and `10`, then string keys `b` and `a`, then Symbol properties.

## The super Keyword

The `this` keyword always refers to the current object. ES6 adds another keyword, `super`, which refers to the current object's prototype.

```javascript
const proto = {
  foo: 'hello'
};

const obj = {
  foo: 'world',
  find() {
    return super.foo;
  }
};

Object.setPrototypeOf(obj, proto);
obj.find() // "hello"
```

In the code above, inside `obj.find()`, `super.foo` refers to the `foo` property on the prototype `proto`.

Note: when `super` refers to the prototype, it can only be used inside object methods; using it elsewhere will throw an error.

```javascript
// Error
const obj = {
  foo: super.foo
}

// Error
const obj = {
  foo: () => super.foo
}

// Error
const obj = {
  foo: function () {
    return super.foo
  }
}
```

All three uses of `super` above throw errors because the engine treats them as not inside object methods. The first uses `super` in a property; the second and third use `super` inside a function assigned to `foo`. Only the shorthand object method syntax lets the engine reliably identify object methods.

Internally, `super.foo` is equivalent to `Object.getPrototypeOf(this).foo` (for properties) or `Object.getPrototypeOf(this).foo.call(this)` (for methods).

```javascript
const proto = {
  x: 'hello',
  foo() {
    console.log(this.x);
  },
};

const obj = {
  x: 'world',
  foo() {
    super.foo();
  }
}

Object.setPrototypeOf(obj, proto);

obj.foo() // "world"
```

In the code above, `super.foo` points to `proto.foo`, but `this` is still bound to `obj`, so the output is `world`.

## Object Spread Operator

The spread operator (`...`) was introduced in the chapter on array extensions. [ES2018](https://github.com/sebmarkbage/ecmascript-rest-spread) added it to objects.

### Destructuring Assignment

Object destructuring extracts values from an object, assigning all own enumerable properties that have not yet been read to the specified object. All keys and their values are copied to the new object.

```javascript
let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };
x // 1
y // 2
z // { a: 3, b: 4 }
```

In the code above, `z` is the target of the spread destructuring. It receives all unread keys (`a` and `b`) and copies them with their values.

The right side of destructuring must be an object. If it is `undefined` or `null`, an error is thrown because they cannot be converted to objects.

```javascript
let { ...z } = null; // runtime error
let { ...z } = undefined; // runtime error
```

The spread in destructuring must be the last parameter; otherwise a syntax error occurs.

```javascript
let { ...x, y, z } = someObject; // syntax error
let { x, ...y, ...z } = someObject; // syntax error
```

In the code above, the spread is not the last parameter, so it throws an error.

Note: spread destructuring performs a shallow copy. If a property value is a compound type (array, object, function), the copy is a reference, not a clone.

```javascript
let obj = { a: { b: 1 } };
let { ...x } = obj;
obj.a.b = 2;
x.a.b // 2
```

In the code above, `x` is the target of the spread and receives a reference to `obj.a`. Changes to that object affect `x` as well.

Spread destructuring does not copy inherited properties.

```javascript
let o1 = { a: 1 };
let o2 = { b: 2 };
o2.__proto__ = o1;
let { ...o3 } = o2;
o3 // { b: 2 }
o3.a // undefined
```

In the code above, `o3` copies `o2` but only own properties; inherited properties from `o1` are not copied.

Another example:

```javascript
const o = Object.create({ x: 1, y: 2 });
o.z = 3;

let { x, ...newObj } = o;
let { y, z } = newObj;
x // 1
y // undefined
z // 3
```

In the code above, `x` is plain destructuring and can read inherited properties. `y` and `z` come from spread destructuring and can only read own properties, so `z` gets a value but `y` does not. ES6 requires that in variable declarations, when using spread destructuring, what follows `...` must be a variable name, not another destructuring expression. That is why `newObj` is used; the following would throw:

```javascript
let { x, ...{ y, z } } = o;
// SyntaxError: ... must be followed by an identifier in declaration contexts
```

One use of spread destructuring is to extend a function's parameters while delegating the rest.

```javascript
function baseFunction({ a, b }) {
  // ...
}
function wrapperFunction({ x, y, ...restConfig }) {
  // Use x and y params
  // rest passed to original function
  return baseFunction(restConfig);
}
```

In the code above, `baseFunction` expects `a` and `b`. `wrapperFunction` extends it by accepting extra parameters while preserving the original behavior.

### Spread Operator

The object spread operator (`...`) copies all enumerable properties from the source object into the current object.

```javascript
let z = { a: 3, b: 4 };
let n = { ...z };
n // { a: 3, b: 4 }
```

Arrays are objects, so the spread operator works with them too.

```javascript
let foo = { ...['a', 'b', 'c'] };
foo
// {0: "a", 1: "b", 2: "c"}
```

If the operand after the spread is an empty object, nothing is added.

```javascript
{...{}, a: 1}
// { a: 1 }
```

If the operand is not an object, it is converted to one.

```javascript
// Same as {...Object(1)}
{...1} // {}
```

In the code above, the integer `1` is converted to the wrapper object `Number{1}`. It has no own properties, so the result is an empty object.

Similar logic applies in these examples:

```javascript
// Same as {...Object(true)}
{...true} // {}

// Same as {...Object(undefined)}
{...undefined} // {}

// Same as {...Object(null)}
{...null} // {}
```

If the operand is a string, it is converted to an array-like object, so the result is not empty:

```javascript
{...'hello'}
// {0: "h", 1: "e", 2: "l", 3: "l", 4: "o"}
```

The object spread operator returns only own enumerable properties. This matters especially when spreading class instances.

```javascript
class C {
  p = 12;
  m() {}
}

let c = new C();
let clone = { ...c };

clone.p; // ok
clone.m(); // Error
```

In the example above, `c` is an instance of `C`. Spreading it only includes the own property `c.p`, not the method `c.m()`, which is on the prototype (see the Class chapter).

The object spread operator is equivalent to `Object.assign()`:

```javascript
let aClone = { ...a };
// Same as
let aClone = Object.assign({}, a);
```

The above example copies only instance properties. To fully clone an object including prototype properties, use:

```javascript
// Style 1
const clone1 = {
  __proto__: Object.getPrototypeOf(obj),
  ...obj
};

// Style 2
const clone2 = Object.assign(
  Object.create(Object.getPrototypeOf(obj)),
  obj
);

// Style 3
const clone3 = Object.create(
  Object.getPrototypeOf(obj),
  Object.getOwnPropertyDescriptors(obj)
)
```

In the code above, `__proto__` may not be available in non-browser environments, so approach two or three is preferred.

Spread can merge two objects:

```javascript
let ab = { ...a, ...b };
// Same as
let ab = Object.assign({}, a, b);
```

Properties placed after the spread override those inside it:

```javascript
let aWithOverrides = { ...a, x: 1, y: 2 };
// Same as
let aWithOverrides = { ...a, ...{ x: 1, y: 2 } };
// Same as
let x = 1, y = 2, aWithOverrides = { ...a, x, y };
// Same as
let aWithOverrides = Object.assign({}, a, { x: 1, y: 2 });
```

In the code above, `x` and `y` from `a` are overridden in the result.

This is handy for overriding selected properties:

```javascript
let newVersion = {
  ...previousVersion,
  name: 'New Name' // Override the name property
};
```

In the code above, `newVersion` overrides `name`; all other properties come from `previousVersion`.

If custom properties come before the spread, they act as defaults:

```javascript
let aWithDefaults = { x: 1, y: 2, ...a };
// Same as
let aWithDefaults = Object.assign({}, { x: 1, y: 2 }, a);
// Same as
let aWithDefaults = Object.assign({ x: 1, y: 2 }, a);
```

Like the array spread, the object spread can be followed by an expression:

```javascript
const obj = {
  ...(x > 1 ? {a: 1} : {}),
  b: 2,
};
```

If the operand has a getter, that getter is invoked during spreading:

```javascript
let a = {
  get x() {
    throw new Error('not throw yet');
  }
}

let aWithXGetter = { ...a }; // Error
```

In the example above, the getter runs when spreading `a` and causes the error.

## AggregateError

ES2021 introduces the `AggregateError` object to support the new `Promise.any()` method (see the Promise chapter). It is covered here for completeness.

`AggregateError` wraps multiple errors in a single object. When one operation triggers several errors and they must all be thrown together, use `AggregateError`.

`AggregateError` is a constructor for `AggregateError` instances:

```javascript
AggregateError(errors[, message])
```

It accepts two arguments:

- `errors`: array of error objects (required).
- `message`: optional string with the overall error message.

```javascript
const error = new AggregateError([
  new Error('ERROR_11112'),
  new TypeError('First name must be a string'),
  new RangeError('Transaction value must be at least 1'),
  new URIError('User profile link must be https'),
], 'Transaction cannot be processed')
```

In the example above, the first argument is an array of four errors; the second is the overall message.

An `AggregateError` instance has three properties:

- `name`: error name, defaults to `"AggregateError"`.
- `message`: the error message.
- `errors`: array of error objects.

Example:

```javascript
try {
  throw new AggregateError([
    new Error("some error"),
  ], 'Hello');
} catch (e) {
  console.log(e instanceof AggregateError); // true
  console.log(e.message);                   // "Hello"
  console.log(e.name);                      // "AggregateError"
  console.log(e.errors);                    // [ Error: "some error" ]
}
```

## Error cause Property

The `Error` object represents runtime exceptions, but the context it provides is often hard to interpret. [ES2022](https://github.com/tc39/proposal-error-cause) adds a `cause` property so you can attach the reason when creating errors.

Pass an options object to `new Error()` with a `cause` property:

```javascript
const actual = new Error('an error!', { cause: 'Error cause' });
actual.cause; // 'Error cause'
```

In the example above, the `cause` option stores the reason; you can read it from the error instance.

`cause` can hold any value, not just strings:

```javascript
try {
  maybeWorks();
} catch (err) {
  throw new Error('maybeWorks failed!', { cause: err });
}
```

In the example above, `cause` holds another error object.
