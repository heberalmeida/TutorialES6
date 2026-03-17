# Proxy

## Overview

Proxy is used to modify the default behavior of certain operations, equivalent to making changes at the language level. It belongs to "meta programming"—programming the programming language itself.

Proxy can be understood as a "interception" layer in front of the target object. All external access to the object must pass through this layer, which provides a mechanism to filter and rewrite that access. The word proxy means "agent"; here it "proxies" certain operations and can be translated as "proxy handler."

```javascript
var obj = new Proxy({}, {
  get: function (target, propKey, receiver) {
    console.log(`getting ${propKey}!`);
    return Reflect.get(target, propKey, receiver);
  },
  set: function (target, propKey, value, receiver) {
    console.log(`setting ${propKey}!`);
    return Reflect.set(target, propKey, value, receiver);
  }
});
```

The code above sets up an interception layer on an empty object, redefining the behavior of property reads (`get`) and writes (`set`). We won't explain the syntax in detail yet—just the results. When reading or writing properties on object `obj` with interception behavior, you get the following:

```javascript
obj.count = 1
//  setting count!
++obj.count
//  getting count!
//  setting count!
//  2
```

The code above shows that Proxy effectively overloads the dot operator—it overrides the language's original definition with its own.

ES6 provides the Proxy constructor natively to create Proxy instances.

```javascript
var proxy = new Proxy(target, handler);
```

All Proxy usage follows this form; only the `handler` parameter changes. Here, `new Proxy()` creates a Proxy instance, the `target` parameter is the object to intercept, and the `handler` parameter is also an object that customizes the interception behavior.

Below is another example of intercepting property reads:

```javascript
var proxy = new Proxy({}, {
  get: function(target, propKey) {
    return 35;
  }
});

proxy.time // 35
proxy.name // 35
proxy.title // 35
```

In the code above, the `Proxy` constructor takes two arguments. The first is the target object to proxy (an empty object in this example)—the object that would be accessed if Proxy were not involved. The second is a configuration object. For each proxied operation, you provide a handler function that intercepts that operation. For example, the configuration object above has a `get` method that intercepts property access on the target. The `get` method takes two parameters: the target object and the property being accessed. Because the interceptor always returns `35`, accessing any property yields `35`.

Note: For Proxy to take effect, you must operate on the Proxy instance (the `proxy` object above), not the target object (the empty object).

If `handler` does not define any interception, access goes straight through to the original object.

```javascript
var target = {};
var handler = {};
var proxy = new Proxy(target, handler);
proxy.a = 'b';
target.a // "b"
```

In the code above, `handler` is empty and has no interception effect. Accessing `proxy` is equivalent to accessing `target`.

One technique is to put the Proxy object in the `object.proxy` property so it can be called on `object`.

```javascript
var object = { proxy: new Proxy(target, handler) };
```

Proxy instances can also be used as the prototype of other objects.

```javascript
var proxy = new Proxy({}, {
  get: function(target, propKey) {
    return 35;
  }
});

let obj = Object.create(proxy);
obj.time // 35
```

In the code above, `proxy` is the prototype of `obj`. Since `obj` does not have a `time` property itself, it is looked up on the prototype chain on `proxy`, which triggers the interception.

A single interceptor function can intercept multiple operations.

```javascript
var handler = {
  get: function(target, name) {
    if (name === 'prototype') {
      return Object.prototype;
    }
    return 'Hello, ' + name;
  },

  apply: function(target, thisBinding, args) {
    return args[0];
  },

  construct: function(target, args) {
    return {value: args[1]};
  }
};

var fproxy = new Proxy(function(x, y) {
  return x + y;
}, handler);

fproxy(1, 2) // 1
new fproxy(1, 2) // {value: 2}
fproxy.prototype === Object.prototype // true
fproxy.foo === "Hello, foo" // true
```

For operations that can be intercepted but are not configured, execution falls through to the target object and produces results using the original behavior.

Below is a summary of Proxy-supported interception operations—13 in total:

- **get(target, propKey, receiver)**: Intercepts property reads, e.g. `proxy.foo` and `proxy['foo']`.
- **set(target, propKey, value, receiver)**: Intercepts property writes, e.g. `proxy.foo = v` or `proxy['foo'] = v`. Returns a boolean.
- **has(target, propKey)**: Intercepts `propKey in proxy`. Returns a boolean.
- **deleteProperty(target, propKey)**: Intercepts `delete proxy[propKey]`. Returns a boolean.
- **ownKeys(target)**: Intercepts `Object.getOwnPropertyNames(proxy)`, `Object.getOwnPropertySymbols(proxy)`, `Object.keys(proxy)`, and `for...in` loops. Returns an array. This method returns all own property names of the target; `Object.keys()` returns only own enumerable properties.
- **getOwnPropertyDescriptor(target, propKey)**: Intercepts `Object.getOwnPropertyDescriptor(proxy, propKey)`. Returns a property descriptor.
- **defineProperty(target, propKey, propDesc)**: Intercepts `Object.defineProperty(proxy, propKey, propDesc)` and `Object.defineProperties(proxy, propDescs)`. Returns a boolean.
- **preventExtensions(target)**: Intercepts `Object.preventExtensions(proxy)`. Returns a boolean.
- **getPrototypeOf(target)**: Intercepts `Object.getPrototypeOf(proxy)`. Returns an object.
- **isExtensible(target)**: Intercepts `Object.isExtensible(proxy)`. Returns a boolean.
- **setPrototypeOf(target, proto)**: Intercepts `Object.setPrototypeOf(proxy, proto)`. Returns a boolean. If the target is a function, two additional operations can be intercepted:
- **apply(target, object, args)**: Intercepts Proxy instance invoked as a function, e.g. `proxy(...args)`, `proxy.call(object, ...args)`, `proxy.apply(...)`.
- **construct(target, args)**: Intercepts Proxy instance invoked as a constructor, e.g. `new proxy(...args)`.

## Proxy Instance Methods

Below are detailed descriptions of these interception methods.

### get()

The `get` method intercepts property reads. It accepts three parameters: the target object, the property name, and the proxy instance itself (strictly speaking, the object the operation is applied to). The last parameter is optional.

An example of `get` was shown above. Below is another that intercepts reads:

```javascript
var person = {
  name: "John"
};

var proxy = new Proxy(person, {
  get: function(target, propKey) {
    if (propKey in target) {
      return target[propKey];
    } else {
      throw new ReferenceError("Prop name \"" + propKey + "\" does not exist.");
    }
  }
});

proxy.name // "John"
proxy.age // throws an error
```

The code above throws an error when accessing a non-existent property on the target. Without this interceptor, accessing a non-existent property would only return `undefined`.

The `get` method can be inherited.

```javascript
let proto = new Proxy({}, {
  get(target, propertyKey, receiver) {
    console.log('GET ' + propertyKey);
    return target[propertyKey];
  }
});

let obj = Object.create(proto);
obj.foo // "GET foo"
```

In the code above, interception is defined on the `Prototype` object, so it takes effect when reading inherited properties from `obj`.

The example below uses `get` interception to implement negative array indices.

```javascript
function createArray(...elements) {
  let handler = {
    get(target, propKey, receiver) {
      let index = Number(propKey);
      if (index < 0) {
        propKey = String(target.length + index);
      }
      return Reflect.get(target, propKey, receiver);
    }
  };

  let target = [];
  target.push(...elements);
  return new Proxy(target, handler);
}

let arr = createArray('a', 'b', 'c');
arr[-1] // c
```

In the code above, an index of `-1` returns the last element.

With Proxy, property reads (`get`) can be turned into function execution, enabling chained property access.

```javascript
var pipe = function (value) {
  var funcStack = [];
  var oproxy = new Proxy({} , {
    get : function (pipeObject, fnName) {
      if (fnName === 'get') {
        return funcStack.reduce(function (val, fn) {
          return fn(val);
        },value);
      }
      funcStack.push(window[fnName]);
      return oproxy;
    }
  });

  return oproxy;
}

var double = n => n * 2;
var pow    = n => n * n;
var reverseInt = n => n.toString().split("").reverse().join("") | 0;

pipe(3).double.pow.reverseInt.get; // 63
```

The code above achieves a chain of function names via Proxy.

The example below uses `get` interception to create a generic `dom` function for generating DOM elements.

```javascript
const dom = new Proxy({}, {
  get(target, property) {
    return function(attrs = {}, ...children) {
      const el = document.createElement(property);
      for (let prop of Object.keys(attrs)) {
        el.setAttribute(prop, attrs[prop]);
      }
      for (let child of children) {
        if (typeof child === 'string') {
          child = document.createTextNode(child);
        }
        el.appendChild(child);
      }
      return el;
    }
  }
});

const el = dom.div({},
  'Hello, my name is ',
  dom.a({href: '//example.com'}, 'Mark'),
  '. I like:',
  dom.ul({},
    dom.li({}, 'The web'),
    dom.li({}, 'Food'),
    dom.li({}, '…actually that\'s it')
  )
);

document.body.appendChild(el);
```

Below is an example of the third parameter of `get`—it always points to the object where the read originated. Usually this is the Proxy instance.

```javascript
const proxy = new Proxy({}, {
  get: function(target, key, receiver) {
    return receiver;
  }
});
proxy.getReceiver === proxy // true
```

In the code above, reading the `getReceiver` property on `proxy` is intercepted by `get()`, and the return value is the `proxy` object.

```javascript
const proxy = new Proxy({}, {
  get: function(target, key, receiver) {
    return receiver;
  }
});

const d = Object.create(proxy);
d.a === d // true
```

In the code above, `d` does not have an `a` property, so reading `d.a` looks it up on `d`'s prototype `proxy`. Here `receiver` points to `d`, the object where the read originated.

If a property is non-configurable and non-writable, Proxy cannot change it; accessing that property through the Proxy will throw.

```javascript
const target = Object.defineProperties({}, {
  foo: {
    value: 123,
    writable: false,
    configurable: false
  },
});

const handler = {
  get(target, propKey) {
    return 'abc';
  }
};

const proxy = new Proxy(target, handler);

proxy.foo
// TypeError: Invariant check failed
```

### set()

The `set` method intercepts property assignments. It accepts four parameters: the target object, the property name, the property value, and the Proxy instance. The last parameter is optional.

Suppose a `Person` object has an `age` property that should be an integer not greater than 200. Proxy can enforce this:

```javascript
let validator = {
  set: function(obj, prop, value) {
    if (prop === 'age') {
      if (!Number.isInteger(value)) {
        throw new TypeError('The age is not an integer');
      }
      if (value > 200) {
        throw new RangeError('The age seems invalid');
      }
    }

    // For age and other props meeting condition, save directly
    obj[prop] = value;
    return true;
  }
};

let person = new Proxy({}, validator);

person.age = 100;

person.age // 100
person.age = 'young' // Error
person.age = 300 // Error
```

The code above uses a `set` handler for validation. Any invalid `age` assignment throws. This is one way to implement validation. `set` can also be used for data binding—e.g. updating the DOM when an object changes.

Sometimes internal properties use a leading underscore to indicate they should not be accessed externally. Combined with `get` and `set`, you can prevent these internal properties from being read or written:

```javascript
const handler = {
  get (target, key) {
    invariant(key, 'get');
    return target[key];
  },
  set (target, key, value) {
    invariant(key, 'set');
    target[key] = value;
    return true;
  }
};
function invariant (key, action) {
  if (key[0] === '_') {
    throw new Error(`Invalid attempt to ${action} private "${key}" property`);
  }
}
const target = {};
const proxy = new Proxy(target, handler);
proxy._prop
// Error: Invalid attempt to get private "_prop" property
proxy._prop = 'c'
// Error: Invalid attempt to set private "_prop" property
```

The code above throws on any read or write to properties whose first character is an underscore.

Below is an example of the fourth parameter of `set`:

```javascript
const handler = {
  set: function(obj, prop, value, receiver) {
    obj[prop] = receiver;
    return true;
  }
};
const proxy = new Proxy({}, handler);
proxy.foo = 'bar';
proxy.foo === proxy // true
```

In the code above, the fourth parameter `receiver` of `set` is the object where the operation originated—usually the proxy instance. See the next example:

```javascript
const handler = {
  set: function(obj, prop, value, receiver) {
    obj[prop] = receiver;
    return true;
  }
};
const proxy = new Proxy({}, handler);
const myObj = {};
Object.setPrototypeOf(myObj, proxy);

myObj.foo = 'bar';
myObj.foo === myObj // true
```

In the code above, when setting `myObj.foo`, `myObj` has no `foo` property, so the engine looks up `foo` on the prototype chain. `myObj`'s prototype `proxy` is a Proxy instance; setting its `foo` property triggers `set`. Here `receiver` points to `myObj`, where the assignment originated.

Note: If the target has a non-writable own property, `set` will not take effect.

```javascript
const obj = {};
Object.defineProperty(obj, 'foo', {
  value: 'bar',
  writable: false
});

const handler = {
  set: function(obj, prop, value, receiver) {
    obj[prop] = 'baz';
    return true;
  }
};

const proxy = new Proxy(obj, handler);
proxy.foo = 'baz';
proxy.foo // "bar"
```

Note: `set` must return a boolean. In strict mode, if `set` does not return `true`, it throws.

```javascript
'use strict';
const handler = {
  set: function(obj, prop, value, receiver) {
    obj[prop] = receiver;
    // Error with or without the line below
    return false;
  }
};
const proxy = new Proxy({}, handler);
proxy.foo = 'bar';
// TypeError: 'set' on proxy: trap returned falsish for property 'foo'
```

In the code above, in strict mode, returning `false` or `undefined` from `set` throws.

### apply()

The `apply` method intercepts function calls and `call`/`apply` invocations.

`apply` takes three parameters: the target object, the target's context object (`this`), and the target's argument array.

```javascript
var handler = {
  apply (target, ctx, args) {
    return Reflect.apply(...arguments);
  }
};
```

Example:

```javascript
var target = function () { return 'I am the target'; };
var handler = {
  apply: function () {
    return 'I am the proxy';
  }
};

var p = new Proxy(target, handler);

p()
// "I am the proxy"
```

In the code above, when `p` is called as a function (`p()`), it is intercepted by `apply` and returns a string.

Another example:

```javascript
var twice = {
  apply (target, ctx, args) {
    return Reflect.apply(...arguments) * 2;
  }
};
function sum (left, right) {
  return left + right;
};
var proxy = new Proxy(sum, twice);
proxy(1, 2) // 6
proxy.call(null, 5, 6) // 22
proxy.apply(null, [7, 8]) // 30
```

Each call to `proxy` (direct, `call`, or `apply`) is intercepted by `apply`.

`Reflect.apply` invoked directly is also intercepted.

```javascript
Reflect.apply(proxy, null, [9, 10]) // 38
```

### has()

The `has()` method intercepts the `HasProperty` operation—the check whether an object has a property. Typical usage is the `in` operator.

`has()` takes two parameters: the target object and the property name to check.

Example: use `has()` to hide certain properties from `in`:

```javascript
var handler = {
  has (target, key) {
    if (key[0] === '_') {
      return false;
    }
    return key in target;
  }
};
var target = { _prop: 'foo', prop: 'foo' };
var proxy = new Proxy(target, handler);
'_prop' in proxy // false
```

If the target is non-configurable or non-extensible, a `has()` that returns `false` for such properties will throw.

```javascript
var obj = { a: 10 };
Object.preventExtensions(obj);

var p = new Proxy(obj, {
  has: function(target, prop) {
    return false;
  }
});

'a' in p // TypeError is thrown
```

`has()` intercepts `HasProperty`, not `HasOwnProperty`—it does not distinguish own from inherited properties.

Also, although `for...in` uses `in`, `has()` does not affect `for...in` loops.

```javascript
let stu1 = {name: 'John', score: 59};
let stu2 = {name: 'Jane', score: 99};

let handler = {
  has(target, prop) {
    if (prop === 'score' && target[prop] < 60) {
      console.log(`${target.name} failed`);
      return false;
    }
    return prop in target;
  }
}

let oproxy1 = new Proxy(stu1, handler);
let oproxy2 = new Proxy(stu2, handler);

'score' in oproxy1
// John failed
// false

'score' in oproxy2
// true

for (let a in oproxy1) {
  console.log(oproxy1[a]);
}
// John
// 59

for (let b in oproxy2) {
  console.log(oproxy2[b]);
}
// Jane
// 99
```

In the code above, `has()` affects `in` but not `for...in`, so properties that fail the check are not excluded from `for...in` iteration.

### construct()

The `construct()` method intercepts the `new` operator. Example:

```javascript
const handler = {
  construct (target, args, newTarget) {
    return new target(...args);
  }
};
```

`construct()` takes three parameters:

- `target`: The target object.
- `args`: The constructor's argument array.
- `newTarget`: The constructor the `new` operator was applied to (e.g. `p` below).

```javascript
const p = new Proxy(function () {}, {
  construct: function(target, args) {
    console.log('called: ' + args.join(', '));
    return { value: args[0] * 10 };
  }
});

(new p(1)).value
// "called: 1"
// 10
```

`construct()` must return an object; otherwise it throws.

```javascript
const p = new Proxy(function() {}, {
  construct: function(target, argumentsList) {
    return 1;
  }
});

new p() // Error
// Uncaught TypeError: 'construct' on proxy: trap returned non-object ('1')
```

Because `construct()` intercepts constructors, the target must be a function; otherwise it throws.

```javascript
const p = new Proxy({}, {
  construct: function(target, argumentsList) {
    return {};
  }
});

new p() // Error
// Uncaught TypeError: p is not a constructor
```

In the example above, the target is an object, not a function, so it throws.

Note: In `construct()`, `this` refers to the `handler`, not the instance.

```javascript
const handler = {
  construct: function(target, args) {
    console.log(this === handler);
    return new target(...args);
  }
}

let p = new Proxy(function () {}, handler);
new p() // true
```

### deleteProperty()

The `deleteProperty` method intercepts `delete`. If it throws or returns `false`, the property cannot be deleted.

```javascript
var handler = {
  deleteProperty (target, key) {
    invariant(key, 'delete');
    delete target[key];
    return true;
  }
};
function invariant (key, action) {
  if (key[0] === '_') {
    throw new Error(`Invalid attempt to ${action} private "${key}" property`);
  }
}

var target = { _prop: 'foo' };
var proxy = new Proxy(target, handler);
delete proxy._prop
// Error: Invalid attempt to delete private "_prop" property
```

In the code above, `deleteProperty` intercepts `delete`; deleting properties starting with an underscore throws.

Note: Own non-configurable properties on the target cannot be deleted by `deleteProperty`; doing so throws.

### defineProperty()

The `defineProperty()` method intercepts `Object.defineProperty()`.

```javascript
var handler = {
  defineProperty (target, key, descriptor) {
    return false;
  }
};
var target = {};
var proxy = new Proxy(target, handler);
proxy.foo = 'bar' // won't take effect
```

In the code above, `defineProperty()` returns `false`, so adding new properties always fails. Note that `false` only signals failure; it does not prevent the property from being added.

Note: If the target is non-extensible, `defineProperty()` cannot add properties that do not exist on the target. If a target property is non-writable or non-configurable, `defineProperty()` cannot change those settings.

### getOwnPropertyDescriptor()

The `getOwnPropertyDescriptor()` method intercepts `Object.getOwnPropertyDescriptor()` and returns a property descriptor or `undefined`.

```javascript
var handler = {
  getOwnPropertyDescriptor (target, key) {
    if (key[0] === '_') {
      return;
    }
    return Object.getOwnPropertyDescriptor(target, key);
  }
};
var target = { _foo: 'bar', baz: 'tar' };
var proxy = new Proxy(target, handler);
Object.getOwnPropertyDescriptor(proxy, 'wat')
// undefined
Object.getOwnPropertyDescriptor(proxy, '_foo')
// undefined
Object.getOwnPropertyDescriptor(proxy, 'baz')
// { value: 'tar', writable: true, enumerable: true, configurable: true }
```

In the code above, `getOwnPropertyDescriptor` returns `undefined` for properties starting with an underscore.

### getPrototypeOf()

The `getPrototypeOf()` method intercepts prototype access. Specifically, it intercepts:

- `Object.prototype.__proto__`
- `Object.prototype.isPrototypeOf()`
- `Object.getPrototypeOf()`
- `Reflect.getPrototypeOf()`
- `instanceof`

Example:

```javascript
var proto = {};
var p = new Proxy({}, {
  getPrototypeOf(target) {
    return proto;
  }
});
Object.getPrototypeOf(p) === proto // true
```

`getPrototypeOf()` must return an object or `null`, or it throws. If the target is non-extensible, `getPrototypeOf()` must return the target's prototype.

### isExtensible()

The `isExtensible()` method intercepts `Object.isExtensible()`.

```javascript
var p = new Proxy({}, {
  isExtensible: function(target) {
    console.log("called");
    return true;
  }
});

Object.isExtensible(p)
// "called"
// true
```

`isExtensible()` must return a boolean (other values are coerced). Its return value must match the target's `isExtensible`; otherwise it throws.

```javascript
Object.isExtensible(proxy) === Object.isExtensible(target)
```

Example:

```javascript
var p = new Proxy({}, {
  isExtensible: function(target) {
    return false;
  }
});

Object.isExtensible(p)
// Uncaught TypeError: 'isExtensible' on proxy: trap result does not reflect extensibility of proxy target (which is 'true')
```

### ownKeys()

The `ownKeys()` method intercepts reads of an object's own property names. Specifically, it intercepts:

- `Object.getOwnPropertyNames()`
- `Object.getOwnPropertySymbols()`
- `Object.keys()`
- `for...in` loops

Example intercepting `Object.keys()`:

```javascript
let target = {
  a: 1,
  b: 2,
  c: 3
};

let handler = {
  ownKeys(target) {
    return ['a'];
  }
};

let proxy = new Proxy(target, handler);

Object.keys(proxy)
// [ 'a' ]
```

Example: intercept properties whose names start with an underscore:

```javascript
let target = {
  _bar: 'foo',
  _prop: 'bar',
  prop: 'baz'
};

let handler = {
  ownKeys (target) {
    return Reflect.ownKeys(target).filter(key => key[0] !== '_');
  }
};

let proxy = new Proxy(target, handler);
for (let key of Object.keys(proxy)) {
  console.log(target[key]);
}
// "baz"
```

When using `Object.keys()`, three kinds of properties are automatically filtered from `ownKeys()`:

- Properties that do not exist on the target
- Symbol property names
- Non-enumerable properties

```javascript
let target = {
  a: 1,
  b: 2,
  c: 3,
  [Symbol.for('secret')]: '4',
};

Object.defineProperty(target, 'key', {
  enumerable: false,
  configurable: true,
  writable: true,
  value: 'static'
});

let handler = {
  ownKeys(target) {
    return ['a', 'd', Symbol.for('secret'), 'key'];
  }
};

let proxy = new Proxy(target, handler);

Object.keys(proxy)
// ['a']
```

`ownKeys()` can also intercept `Object.getOwnPropertyNames()`:

```javascript
var p = new Proxy({}, {
  ownKeys: function(target) {
    return ['a', 'b', 'c'];
  }
});

Object.getOwnPropertyNames(p)
// [ 'a', 'b', 'c' ]
```

`for...in` is also affected by `ownKeys()`:

```javascript
const obj = { hello: 'world' };
const proxy = new Proxy(obj, {
  ownKeys: function () {
    return ['a', 'b'];
  }
});

for (let key in proxy) {
  console.log(key); // no output
}
```

The array returned by `ownKeys()` may only contain strings or Symbols. Other types or a non-array return value throw.

```javascript
var obj = {};

var p = new Proxy(obj, {
  ownKeys: function(target) {
    return [123, true, undefined, null, {}, []];
  }
});

Object.getOwnPropertyNames(p)
// Uncaught TypeError: 123 is not a valid property name
```

If the target has non-configurable own properties, those properties must be included in the array returned by `ownKeys()`, or it throws.

```javascript
var obj = {};
Object.defineProperty(obj, 'a', {
  configurable: false,
  enumerable: true,
  value: 10 }
);

var p = new Proxy(obj, {
  ownKeys: function(target) {
    return ['b'];
  }
});

Object.getOwnPropertyNames(p)
// Uncaught TypeError: 'ownKeys' on proxy: trap result did not include 'a'
```

If the target is non-extensible, `ownKeys()` must return exactly the target's own properties—no more, no less—or it throws.

```javascript
var obj = {
  a: 1
};

Object.preventExtensions(obj);

var p = new Proxy(obj, {
  ownKeys: function(target) {
    return ['a', 'b'];
  }
});

Object.getOwnPropertyNames(p)
// Uncaught TypeError: 'ownKeys' on proxy: trap returned extra keys but proxy target is non-extensible
```

### preventExtensions()

The `preventExtensions()` method intercepts `Object.preventExtensions()`. It must return a boolean (other values are coerced).

It may only return `true` when the target is non-extensible (i.e. `Object.isExtensible(proxy)` is `false`); otherwise it throws.

```javascript
var proxy = new Proxy({}, {
  preventExtensions: function(target) {
    return true;
  }
});

Object.preventExtensions(proxy)
// Uncaught TypeError: 'preventExtensions' on proxy: trap returned truish but the proxy target is extensible
```

To avoid this, typically call `Object.preventExtensions(target)` inside the trap:

```javascript
var proxy = new Proxy({}, {
  preventExtensions: function(target) {
    console.log('called');
    Object.preventExtensions(target);
    return true;
  }
});

Object.preventExtensions(proxy)
// "called"
// Proxy {}
```

### setPrototypeOf()

The `setPrototypeOf()` method intercepts `Object.setPrototypeOf()`.

Example:

```javascript
var handler = {
  setPrototypeOf (target, proto) {
    throw new Error('Changing the prototype is forbidden');
  }
};
var proto = {};
var target = function () {};
var proxy = new Proxy(target, handler);
Object.setPrototypeOf(proxy, proto);
// Error: Changing the prototype is forbidden
```

`setPrototypeOf()` must return a boolean. If the target is non-extensible, it cannot change the target's prototype.

## Proxy.revocable()

The `Proxy.revocable()` method returns a revocable Proxy instance.

```javascript
let target = {};
let handler = {};

let {proxy, revoke} = Proxy.revocable(target, handler);

proxy.foo = 123;
proxy.foo // 123

revoke();
proxy.foo // TypeError: Revoked
```

`Proxy.revocable()` returns an object with a `proxy` property (the Proxy instance) and a `revoke` function. After calling `revoke`, any access to the proxy throws.

One use case: the target must be accessed only through the proxy; once access ends, revoke the proxy so further access is disallowed.

## The `this` Problem

Although Proxy can proxy access to the target, it is not a transparent proxy. Even with no interception, behavior may differ from the target. The main reason is that when proxied, the target's internal `this` points to the Proxy.

```javascript
const target = {
  m: function () {
    console.log(this === proxy);
  }
};
const handler = {};

const proxy = new Proxy(target, handler);

target.m() // false
proxy.m()  // true
```

In the code above, when `proxy` proxies `target`, the `this` inside `target.m()` refers to `proxy`, not `target`. So even with no interception, `target.m()` and `proxy.m()` give different results.

In the next example, the change in `this` prevents Proxy from correctly proxying the target:

```javascript
const _name = new WeakMap();

class Person {
  constructor(name) {
    _name.set(this, name);
  }
  get name() {
    return _name.get(this);
  }
}

const jane = new Person('Jane');
jane.name // 'Jane'

const proxy = new Proxy(jane, {});
proxy.name // undefined
```

In the code above, the `name` property of the target `jane` is stored in the external WeakMap `_name` under the key `this`. When accessed via `proxy.name`, `this` refers to `proxy`, so the value is not found and `undefined` is returned.

Some native object internals require the correct `this`; Proxy cannot proxy these.

```javascript
const target = new Date();
const handler = {};
const proxy = new Proxy(target, handler);

proxy.getDate();
// TypeError: this is not a Date object.
```

Binding the original object as `this` fixes this:

```javascript
const target = new Date('2015-01-01');
const handler = {
  get(target, prop) {
    if (prop === 'getDate') {
      return target.getDate.bind(target);
    }
    return Reflect.get(target, prop);
  }
};
const proxy = new Proxy(target, handler);

proxy.getDate() // 1
```

Inside Proxy trap functions, `this` refers to the `handler` object.

```javascript
const handler = {
  get: function (target, key, receiver) {
    console.log(this === handler);
    return 'Hello, ' + key;
  },
  set: function (target, key, value) {
    console.log(this === handler);
    target[key] = value;
    return true;
  }
};

const proxy = new Proxy({}, handler);

proxy.foo
// true
// Hello, foo

proxy.foo = 1
// true
```

## Example: Web Service Client

Proxy can intercept any property on the target, which makes it well-suited for building web service clients.

```javascript
const service = createWebService('http://example.com/data');

service.employees().then(json => {
  const employees = JSON.parse(json);
  // ···
});
```

The code above creates a web service interface that returns various data. Proxy can intercept any property on that object, so you don't need an adapter method per resource—just a single Proxy interceptor:

```javascript
function createWebService(baseUrl) {
  return new Proxy({}, {
    get(target, propKey, receiver) {
      return () => httpGet(baseUrl + '/' + propKey);
    }
  });
}
```

Similarly, Proxy can be used to implement database ORM layers.
