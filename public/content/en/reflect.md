# Reflect

## Overview

The `Reflect` object, like the `Proxy` object, is a new API provided by ES6 for operating on objects. The design goals of `Reflect` are:

(1) Move some `Object` methods that are clearly internal to the language (such as `Object.defineProperty`) onto the `Reflect` object. For now, some methods exist on both `Object` and `Reflect`. New methods in the future will be deployed only on `Reflect`. That is, language-internal methods can be obtained from the `Reflect` object.

(2) Change the return values of some `Object` methods so they are more reasonable. For example, `Object.defineProperty(obj, name, desc)` throws when it cannot define a property, while `Reflect.defineProperty(obj, name, desc)` returns `false`.

```javascript
// old style
try {
  Object.defineProperty(target, property, attributes);
  // success
} catch (e) {
  // failure
}

// new style
if (Reflect.defineProperty(target, property, attributes)) {
  // success
} else {
  // failure
}
```

(3) Turn `Object` operations into function behavior. Some `Object` operations are imperative, like `name in obj` and `delete obj[name]`, while `Reflect.has(obj, name)` and `Reflect.deleteProperty(obj, name)` make them functional.

```javascript
// old style
'assign' in Object // true

// new style
Reflect.has(Object, 'assign') // true
```

(4) `Reflect` methods correspond one-to-one with `Proxy` methods. Any method on `Proxy` has a corresponding method on `Reflect`. This lets `Proxy` easily call the corresponding `Reflect` method to perform the default behavior and use it as a base for modified behavior. In other words, no matter how `Proxy` modifies the default behavior, you can always obtain the default behavior from `Reflect`.

```javascript
Proxy(target, {
  set: function(target, name, value, receiver) {
    var success = Reflect.set(target, name, value, receiver);
    if (success) {
      console.log('property ' + name + ' on ' + target + ' set to ' + value);
    }
    return success;
  }
});
```

In the code above, `Proxy` intercepts the `target` object's property assignment. It uses `Reflect.set` to assign the value, ensuring the original behavior runs, and then adds its own logic.

Another example:

```javascript
var loggedObj = new Proxy(obj, {
  get(target, name) {
    console.log('get', target, name);
    return Reflect.get(target, name);
  },
  deleteProperty(target, name) {
    console.log('delete' + name);
    return Reflect.deleteProperty(target, name);
  },
  has(target, name) {
    console.log('has' + name);
    return Reflect.has(target, name);
  }
});
```

In the code above, each Proxy interception (`get`, `delete`, `has`) internally calls the corresponding `Reflect` method so that the default behavior executes. The added work is logging each operation.

With `Reflect`, many operations become more readable:

```javascript
// old style
Function.prototype.apply.call(Math.floor, undefined, [1.75]) // 1

// new style
Reflect.apply(Math.floor, undefined, [1.75]) // 1
```

## Static Methods

The `Reflect` object has 13 static methods:

- Reflect.apply(target, thisArg, args)
- Reflect.construct(target, args)
- Reflect.get(target, name, receiver)
- Reflect.set(target, name, value, receiver)
- Reflect.defineProperty(target, name, desc)
- Reflect.deleteProperty(target, name)
- Reflect.has(target, name)
- Reflect.ownKeys(target)
- Reflect.isExtensible(target)
- Reflect.preventExtensions(target)
- Reflect.getOwnPropertyDescriptor(target, name)
- Reflect.getPrototypeOf(target)
- Reflect.setPrototypeOf(target, prototype)

Most of these have the same effect as the corresponding methods on `Object`, and they correspond one-to-one with `Proxy` methods. Below are explanations.

### Reflect.get(target, name, receiver)

The `Reflect.get` method looks up and returns the `name` property of the `target` object. If the property does not exist, it returns `undefined`.

```javascript
var myObject = {
  foo: 1,
  bar: 2,
  get baz() {
    return this.foo + this.bar;
  },
}

Reflect.get(myObject, 'foo') // 1
Reflect.get(myObject, 'bar') // 2
Reflect.get(myObject, 'baz') // 3
```

If the `name` property has a getter, the getter's `this` is bound to `receiver`.

```javascript
var myObject = {
  foo: 1,
  bar: 2,
  get baz() {
    return this.foo + this.bar;
  },
};

var myReceiverObject = {
  foo: 4,
  bar: 4,
};

Reflect.get(myObject, 'baz', myReceiverObject) // 8
```

If the first argument is not an object, `Reflect.get` throws.

```javascript
Reflect.get(1, 'foo') // Error
Reflect.get(false, 'foo') // Error
```

### Reflect.set(target, name, value, receiver)

The `Reflect.set` method sets the `name` property of `target` to `value`.

```javascript
var myObject = {
  foo: 1,
  set bar(value) {
    return this.foo = value;
  },
}

myObject.foo // 1

Reflect.set(myObject, 'foo', 2);
myObject.foo // 2

Reflect.set(myObject, 'bar', 3)
myObject.foo // 3
```

If the `name` property has a setter, the setter's `this` is bound to `receiver`.

```javascript
var myObject = {
  foo: 4,
  set bar(value) {
    return this.foo = value;
  },
};

var myReceiverObject = {
  foo: 0,
};

Reflect.set(myObject, 'bar', 1, myReceiverObject);
myObject.foo // 4
myReceiverObject.foo // 1
```

Note: When `Proxy` and `Reflect` are used together, if the former intercepts assignment and the latter performs the default assignment with a `receiver` argument, `Reflect.set` will trigger `Proxy.defineProperty` interception.

```javascript
let p = {
  a: 'a'
};

let handler = {
  set(target, key, value, receiver) {
    console.log('set');
    Reflect.set(target, key, value, receiver)
  },
  defineProperty(target, key, attribute) {
    console.log('defineProperty');
    Reflect.defineProperty(target, key, attribute);
  }
};

let obj = new Proxy(p, handler);
obj.a = 'A';
// set
// defineProperty
```

In the code above, `Proxy.set` uses `Reflect.set` with `receiver`, which triggers `Proxy.defineProperty`. This is because `Proxy.set`'s `receiver` always points to the current Proxy instance (e.g. `obj`), and when `Reflect.set` receives `receiver`, it assigns the property on `receiver` (i.e. `obj`), which triggers `defineProperty`. If `Reflect.set` is called without `receiver`, `defineProperty` is not triggered.

```javascript
let p = {
  a: 'a'
};

let handler = {
  set(target, key, value, receiver) {
    console.log('set');
    Reflect.set(target, key, value)
  },
  defineProperty(target, key, attribute) {
    console.log('defineProperty');
    Reflect.defineProperty(target, key, attribute);
  }
};

let obj = new Proxy(p, handler);
obj.a = 'A';
// set
```

If the first argument is not an object, `Reflect.set` throws.

```javascript
Reflect.set(1, 'foo', {}) // Error
Reflect.set(false, 'foo', {}) // Error
```

### Reflect.has(obj, name)

The `Reflect.has` method corresponds to the `in` operator: `name in obj`.

```javascript
var myObject = {
  foo: 1,
};

// old style
'foo' in myObject // true

// new style
Reflect.has(myObject, 'foo') // true
```

If the first argument to `Reflect.has()` is not an object, it throws.

### Reflect.deleteProperty(obj, name)

The `Reflect.deleteProperty` method is equivalent to `delete obj[name]` and is used to delete object properties.

```javascript
const myObj = { foo: 'bar' };

// old style
delete myObj.foo;

// new style
Reflect.deleteProperty(myObj, 'foo');
```

This method returns a boolean. It returns `true` on success or when the property does not exist; it returns `false` when deletion fails and the property still exists.

If the first argument to `Reflect.deleteProperty()` is not an object, it throws.

### Reflect.construct(target, args)

The `Reflect.construct` method is equivalent to `new target(...args)`. It provides a way to call a constructor without using `new`.

```javascript
function Greeting(name) {
  this.name = name;
}

// new style
const instance = new Greeting('John');

// Reflect.construct style
const instance = Reflect.construct(Greeting, ['John']);
```

If the first argument to `Reflect.construct()` is not a function, it throws.

### Reflect.getPrototypeOf(obj)

The `Reflect.getPrototypeOf` method reads an object's `__proto__` property and corresponds to `Object.getPrototypeOf(obj)`.

```javascript
const myObj = new FancyThing();

// old style
Object.getPrototypeOf(myObj) === FancyThing.prototype;

// new style
Reflect.getPrototypeOf(myObj) === FancyThing.prototype;
```

A difference: if the argument is not an object, `Object.getPrototypeOf` coerces it to an object first, while `Reflect.getPrototypeOf` throws.

```javascript
Object.getPrototypeOf(1) // Number {[[PrimitiveValue]]: 0}
Reflect.getPrototypeOf(1) // Error
```

### Reflect.setPrototypeOf(obj, newProto)

The `Reflect.setPrototypeOf` method sets the prototype of the target object, corresponding to `Object.setPrototypeOf(obj, newProto)`. It returns a boolean indicating success.

```javascript
const myObj = {};

// old style
Object.setPrototypeOf(myObj, Array.prototype);

// new style
Reflect.setPrototypeOf(myObj, Array.prototype);

myObj.length // 0
```

If the target's prototype cannot be set (e.g. the object is non-extensible), `Reflect.setPrototypeOf` returns `false`.

```javascript
Reflect.setPrototypeOf({}, null)
// true
Reflect.setPrototypeOf(Object.freeze({}), null)
// false
```

If the first argument is not an object, `Object.setPrototypeOf` returns the first argument, while `Reflect.setPrototypeOf` throws.

```javascript
Object.setPrototypeOf(1, {})
// 1

Reflect.setPrototypeOf(1, {})
// TypeError: Reflect.setPrototypeOf called on non-object
```

If the first argument is `undefined` or `null`, both `Object.setPrototypeOf` and `Reflect.setPrototypeOf` throw.

```javascript
Object.setPrototypeOf(null, {})
// TypeError: Object.setPrototypeOf called on null or undefined

Reflect.setPrototypeOf(null, {})
// TypeError: Reflect.setPrototypeOf called on non-object
```

### Reflect.apply(func, thisArg, args)

The `Reflect.apply` method is equivalent to `Function.prototype.apply.call(func, thisArg, args)` and executes the given function with `this` bound.

To bind a function's `this`, you would normally write `fn.apply(obj, args)`, but if the function defines its own `apply`, you need `Function.prototype.apply.call(fn, obj, args)`. Using `Reflect` simplifies this:

```javascript
const ages = [11, 33, 12, 54, 18, 96];

// old style
const youngest = Math.min.apply(Math, ages);
const oldest = Math.max.apply(Math, ages);
const type = Object.prototype.toString.call(youngest);

// new style
const youngest = Reflect.apply(Math.min, Math, ages);
const oldest = Reflect.apply(Math.max, Math, ages);
const type = Reflect.apply(Object.prototype.toString, youngest, []);
```

### Reflect.defineProperty(target, propertyKey, attributes)

The `Reflect.defineProperty` method is largely equivalent to `Object.defineProperty` and is used to define object properties. The latter may be deprecated over time; prefer `Reflect.defineProperty`.

```javascript
function MyDate() {
  /*…*/
}

// old style
Object.defineProperty(MyDate, 'now', {
  value: () => Date.now()
});

// new style
Reflect.defineProperty(MyDate, 'now', {
  value: () => Date.now()
});
```

If the first argument to `Reflect.defineProperty` is not an object, it throws (e.g. `Reflect.defineProperty(1, 'foo')`).

This method can be used with `Proxy.defineProperty`:

```javascript
const p = new Proxy({}, {
  defineProperty(target, prop, descriptor) {
    console.log(descriptor);
    return Reflect.defineProperty(target, prop, descriptor);
  }
});

p.foo = 'bar';
// {value: "bar", writable: true, enumerable: true, configurable: true}

p.foo // "bar"
```

In the code above, `Proxy.defineProperty` intercepts property assignment, then `Reflect.defineProperty` completes the assignment.

### Reflect.getOwnPropertyDescriptor(target, propertyKey)

The `Reflect.getOwnPropertyDescriptor` method is largely equivalent to `Object.getOwnPropertyDescriptor` and is used to get a property's descriptor. It will eventually replace the latter.

```javascript
var myObject = {};
Object.defineProperty(myObject, 'hidden', {
  value: true,
  enumerable: false,
});

// old style
var theDescriptor = Object.getOwnPropertyDescriptor(myObject, 'hidden');

// new style
var theDescriptor = Reflect.getOwnPropertyDescriptor(myObject, 'hidden');
```

A difference: if the first argument is not an object, `Object.getOwnPropertyDescriptor(1, 'foo')` returns `undefined`, while `Reflect.getOwnPropertyDescriptor(1, 'foo')` throws.

### Reflect.isExtensible (target)

The `Reflect.isExtensible` method corresponds to `Object.isExtensible` and returns a boolean indicating whether the object is extensible.

```javascript
const myObject = {};

// old style
Object.isExtensible(myObject) // true

// new style
Reflect.isExtensible(myObject) // true
```

If the argument is not an object, `Object.isExtensible` returns `false` (non-objects are non-extensible), while `Reflect.isExtensible` throws.

```javascript
Object.isExtensible(1) // false
Reflect.isExtensible(1) // Error
```

### Reflect.preventExtensions(target)

The `Reflect.preventExtensions` method corresponds to `Object.preventExtensions` and makes an object non-extensible. It returns a boolean indicating success.

```javascript
var myObject = {};

// old style
Object.preventExtensions(myObject) // Object {}

// new style
Reflect.preventExtensions(myObject) // true
```

If the argument is not an object, `Object.preventExtensions` behaves differently in ES5 vs ES6, while `Reflect.preventExtensions` always throws.

```javascript
// ES5 environment
Object.preventExtensions(1) // Error

// ES6 environment
Object.preventExtensions(1) // 1

// new style
Reflect.preventExtensions(1) // Error
```

### Reflect.ownKeys (target)

The `Reflect.ownKeys` method returns all own properties of an object and is equivalent to `Object.getOwnPropertyNames` plus `Object.getOwnPropertySymbols`.

```javascript
var myObject = {
  foo: 1,
  bar: 2,
  [Symbol.for('baz')]: 3,
  [Symbol.for('bing')]: 4,
};

// old style
Object.getOwnPropertyNames(myObject)
// ['foo', 'bar']

Object.getOwnPropertySymbols(myObject)
//[Symbol(baz), Symbol(bing)]

// new style
Reflect.ownKeys(myObject)
// ['foo', 'bar', Symbol(baz), Symbol(bing)]
```

If the first argument to `Reflect.ownKeys()` is not an object, it throws.

## Example: Observer Pattern with Proxy

The observer pattern (Observer mode) means that functions automatically observe a data object; when the object changes, the functions run automatically.

```javascript
const person = observable({
  name: 'John',
  age: 20
});

function print() {
  console.log(`${person.name}, ${person.age}`)
}

observe(print);
person.name = 'Jane';
// output
// Jane, 20
```

In the code above, the data object `person` is the observed target and the function `print` is the observer. When the data changes, `print` runs automatically.

Below is a minimal implementation of the observer pattern with Proxy, i.e. `observable` and `observe`. The idea: `observable` returns a Proxy of the original object that intercepts assignments and triggers all observer functions.

```javascript
const queuedObservers = new Set();

const observe = fn => queuedObservers.add(fn);
const observable = obj => new Proxy(obj, {set});

function set(target, key, value, receiver) {
  const result = Reflect.set(target, key, value, receiver);
  queuedObservers.forEach(observer => observer());
  return result;
}
```

In the code above, a `Set` is defined and all observer functions are added to it. The `observable` function returns a proxy of the original object that intercepts assignments. The `set` handler runs all observers automatically.
