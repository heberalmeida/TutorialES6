# Class Inheritance

## Introduction

Classes can inherit the properties and methods of a parent class through the `extends` keyword. This syntax is much clearer and more convenient than the prototype chain inheritance of ES5.

```javascript
class Point {
}

class ColorPoint extends Point {
}
```

In the example above, `Point` is the parent class and `ColorPoint` is the child class. It inherits all properties and methods of the `Point` class through the `extends` keyword. Since no code is implemented, both classes are identical, equivalent to copying the `Point` class.

Next, we add code inside `ColorPoint`.

```javascript
class Point { /* ... */ }

class ColorPoint extends Point {
  constructor(x, y, color) {
    super(x, y); // Call parent constructor(x, y)
    this.color = color;
  }

  toString() {
    return this.color + ' ' + super.toString(); // Call parent toString()
  }
}
```

In the example above, the `super` keyword appears in both the `constructor()` and `toString()` methods. Here `super` represents the parent class constructor and is used to create a new instance of the parent class.

ES6 requires that child classes call `super()` in the `constructor()` method; otherwise an error is thrown. This is because the child class's own `this` object must first be shaped by the parent class constructor to obtain the same instance properties and methods as the parent, and only then can the child add its own instance properties and methods. Without calling `super()`, the child class cannot obtain its own `this` object.

```javascript
class Point { /* ... */ }

class ColorPoint extends Point {
  constructor() {
  }
}

let cp = new ColorPoint(); // ReferenceError
```

In the code above, `ColorPoint` inherits from parent class `Point`, but its constructor does not call `super()`, causing an error when creating a new instance.

Why must the child class constructor call `super()`? The reason lies in the ES6 inheritance mechanism, which differs fundamentally from ES5. ES5 inheritance first creates an independent child class instance object, then adds the parent class's methods to it—"instance first, inheritance second." ES6 inheritance first adds the parent class's properties and methods to an empty object, then uses that object as the child class instance—"inheritance first, instance second." This is why ES6 inheritance must call `super()` first: that step produces the `this` object that inherits from the parent; without it, inheritance fails.

Note that this means the parent constructor always runs first when creating a child class instance.

```javascript
class Foo {
  constructor() {
    console.log(1);
  }
}

class Bar extends Foo {
  constructor() {
    super();
    console.log(2);
  }
}

const bar = new Bar();
// 1
// 2
```

In the example above, when creating a new `Bar` instance, 1 and 2 are output because the child constructor calls `super()`, which executes the parent constructor.

Another important point: in the child constructor, `this` can only be used after calling `super()`; using it before causes an error. This is because the child instance must first inherit from the parent, and only `super()` makes that inheritance happen.

```javascript
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class ColorPoint extends Point {
  constructor(x, y, color) {
    this.color = color; // ReferenceError
    super(x, y);
    this.color = color; // Correct
  }
}
```

In the code above, the child's `constructor()` uses `this` before calling `super()`, which causes an error; placing it after `super()` is correct.

If the child class does not define a `constructor()` method, one is added by default, and it will call `super()`. That is, whether defined explicitly or not, every child class has a `constructor()` method.

```javascript
class ColorPoint extends Point {
}

// Same as
class ColorPoint extends Point {
  constructor(...args) {
    super(...args);
  }
}
```

With the child class defined, you can create child class instances.

```javascript
let cp = new ColorPoint(25, 8, 'green');

cp instanceof ColorPoint // true
cp instanceof Point // true
```

In the example above, instance `cp` is an instance of both `ColorPoint` and `Point`, which matches ES5 behavior.

## Inheritance of Private Properties and Methods

All properties and methods of the parent class are inherited by the child class, except for private properties and methods.

A child class cannot inherit a parent's private properties; private properties can only be used inside the class where they are defined.

```javascript
class Foo {
  #p = 1;
  #m() {
    console.log('hello');
  }
}

class Bar extends Foo {
  constructor() {
    super();
    console.log(this.#p); // Error
    this.#m(); // Error
  }
}
```

In the example above, child class Bar accessing the parent Foo's private properties or methods causes an error.

If the parent class defines getter/setter methods for private properties, the child can read and write those private properties through those methods.

```javascript
class Foo {
  #p = 1;
  getP() {
    return this.#p;
  }
}

class Bar extends Foo {
  constructor() {
    super();
    console.log(this.getP()); // 1
  }
}
```

In the example above, `getP()` is the parent method that reads the private property; through it, the child can read the parent's private property.

## Inheritance of Static Properties and Static Methods

Static properties and static methods of the parent class are inherited by the child class.

```javascript
class A {
  static hello() {
    console.log('hello world');
  }
}

class B extends A {
}

B.hello()  // hello world
```

In the code above, `hello()` is a static method of class A; B inherits from A and thus inherits A's static method.

Note that static properties are inherited via shallow copy.

```javascript
class A { static foo = 100; }
class B extends A {
  constructor() {
    super();
    B.foo--;
  }
}

const b = new B();
B.foo // 99
A.foo // 100
```

In the example above, `foo` is a static property of class A; B inherits from A, so it inherits this property. However, when B modifies `B.foo`, `A.foo` is not affected, because the child inherits static properties by shallow copy—the parent's value is copied, so `A.foo` and `B.foo` are separate properties.

Because this copy is shallow, if the parent's static property value is an object, the child's static property will point to the same object, since shallow copy only copies the object reference.

```javascript
class A {
  static foo = { n: 100 };
}

class B extends A {
  constructor() {
    super();
    B.foo.n--;
  }
}

const b = new B();
B.foo.n // 99
A.foo.n // 99
```

In the example above, `A.foo` is an object; the shallow copy makes `B.foo` and `A.foo` point to the same object. So when child B modifies a property of that object, parent A is affected as well.

## Object.getPrototypeOf()

The `Object.getPrototypeOf()` method can be used to obtain the parent class from a child class.

```javascript
class Point { /*...*/ }

class ColorPoint extends Point { /*...*/ }

Object.getPrototypeOf(ColorPoint) === Point
// true
```

Therefore, this method can be used to check whether one class inherits from another.

## The super Keyword

The `super` keyword can be used either as a function or as an object. In these two cases, its behavior is different.

**First case:** when `super` is called as a function, it represents the parent class constructor. ES6 requires the child constructor to call `super()` once.

```javascript
class A {}

class B extends A {
  constructor() {
    super();
  }
}
```

In the code above, `super()` in the child B's constructor represents a call to the parent constructor. This is required; otherwise an error is thrown.

Calling `super()` creates the child's `this` object and places the parent's instance properties and methods on it. Before calling `super()`, the child does not have a `this` object; any use of `this` must come after `super()`.

Note: although `super` here represents the parent constructor, it returns the child's `this` (the child instance). So `this` inside `super` refers to the child instance, not the parent instance. Here, `super()` is equivalent to `A.prototype.constructor.call(this)` (running the parent constructor on the child's `this`).

```javascript
class A {
  constructor() {
    console.log(new.target.name);
  }
}
class B extends A {
  constructor() {
    super();
  }
}
new A() // A
new B() // B
```

In the example above, `new.target` points to the currently executing constructor. When `super()` runs (during `new B()`), it points to child class B's constructor, not parent class A's. That is, `this` inside `super()` refers to B.

However, when `super()` executes in the child constructor, the child's properties and methods have not yet been bound to `this`. So if there are properties with the same name, the value from the parent is used at that moment.

```javascript
class A {
  name = 'A';
  constructor() {
    console.log('My name is ' + this.name);
  }
}

class B extends A {
  name = 'B';
}

const b = new B(); // My name is A
```

In the example above, the output is `A`, not `B`, because when `super()` runs, B's `name` property has not yet been bound to `this`, so `this.name` reads A's `name` property.

When used as a function, `super()` can only be used in the child constructor; using it elsewhere causes an error.

```javascript
class A {}

class B extends A {
  m() {
    super(); // Error
  }
}
```

In the code above, using `super()` in B's method `m` causes a syntax error.

**Second case:** when `super` is used as an object, in a normal method it refers to the parent's prototype; in a static method it refers to the parent class.

```javascript
class A {
  p() {
    return 2;
  }
}

class B extends A {
  constructor() {
    super();
    console.log(super.p()); // 2
  }
}

let b = new B();
```

In the code above, `super.p()` in child B uses `super` as an object. Here `super` in a normal method refers to `A.prototype`, so `super.p()` is equivalent to `A.prototype.p()`.

Note that because `super` refers to the parent's prototype, methods or properties defined on the parent instance cannot be accessed through `super`.

```javascript
class A {
  constructor() {
    this.p = 2;
  }
}

class B extends A {
  get m() {
    return super.p;
  }
}

let b = new B();
b.m // undefined
```

In the code above, `p` is a property of parent A's instance; `super.p` cannot access it.

If the property is defined on the parent's prototype, `super` can access it.

```javascript
class A {}
A.prototype.x = 2;

class B extends A {
  constructor() {
    super();
    console.log(super.x) // 2
  }
}

let b = new B();
```

In the code above, `x` is defined on `A.prototype`, so `super.x` can access its value.

ES6 specifies that when a child calls a parent method through `super` in a normal method, `this` inside that method refers to the current child instance.

```javascript
class A {
  constructor() {
    this.x = 1;
  }
  print() {
    console.log(this.x);
  }
}

class B extends A {
  constructor() {
    super();
    this.x = 2;
  }
  m() {
    super.print();
  }
}

let b = new B();
b.m() // 2
```

In the code above, `super.print()` calls `A.prototype.print()`, but `this` inside `A.prototype.print()` refers to the child B instance, so the output is `2`, not `1`. In effect, it runs like `super.print.call(this)`.

Because `this` refers to the child instance, if you assign to a property through `super`, that assignment is applied to `this`, and the property becomes a property of the child instance.

```javascript
class A {
  constructor() {
    this.x = 1;
  }
}

class B extends A {
  constructor() {
    super();
    this.x = 2;
    super.x = 3;
    console.log(super.x); // undefined
    console.log(this.x); // 3
  }
}

let b = new B();
```

In the code above, assigning to `super.x` is equivalent to assigning to `this.x`, so it becomes 3. When reading `super.x`, it reads from `A.prototype.x`, which is undefined.

If `super` is used as an object in a static method, it refers to the parent class, not the parent's prototype.

```javascript
class Parent {
  static myMethod(msg) {
    console.log('static', msg);
  }

  myMethod(msg) {
    console.log('instance', msg);
  }
}

class Child extends Parent {
  static myMethod(msg) {
    super.myMethod(msg);
  }

  myMethod(msg) {
    super.myMethod(msg);
  }
}

Child.myMethod(1); // static 1

var child = new Child();
child.myMethod(2); // instance 2
```

In the code above, `super` in a static method refers to the parent class; in a normal method it refers to the parent's prototype.

When calling a parent method through `super` in a child's static method, `this` inside that method refers to the current child class, not the child instance.

```javascript
class A {
  constructor() {
    this.x = 1;
  }
  static print() {
    console.log(this.x);
  }
}

class B extends A {
  constructor() {
    super();
    this.x = 2;
  }
  static m() {
    super.print();
  }
}

B.x = 3;
B.m() // 3
```

In the code above, inside static method `B.m`, `super.print` refers to the parent's static method. `this` inside that method refers to B, not a B instance.

Note: when using `super`, you must clearly indicate whether it is used as a function or as an object; otherwise an error is thrown.

```javascript
class A {}

class B extends A {
  constructor() {
    super();
    console.log(super); // Error
  }
}
```

In the code above, `super` in `console.log(super)` is ambiguous as a function or object, so the JavaScript engine throws an error. If the usage makes the type clear, it does not throw.

```javascript
class A {}

class B extends A {
  constructor() {
    super();
    console.log(super.valueOf() instanceof B); // true
  }
}

let b = new B();
```

In the code above, `super.valueOf()` shows that `super` is an object, so no error is thrown. Because `super` makes `this` refer to the B instance, `super.valueOf()` returns a B instance.

Finally, since objects always inherit from other objects, the `super` keyword can be used in any object.

```javascript
var obj = {
  toString() {
    return "MyObject: " + super.toString();
  }
};

obj.toString(); // MyObject: [object Object]
```

## The prototype and \_\_proto\_\_ Properties of Classes

In most ES5 implementations, every object has a `__proto__` property pointing to its constructor's `prototype`. Classes, as syntactic sugar for constructors, have both `prototype` and `__proto__`, so there are two inheritance chains:

(1) A child class's `__proto__` property, representing constructor inheritance, always points to the parent class.

(2) The `__proto__` of a child class's `prototype` property, representing method inheritance, always points to the parent class's `prototype`.

```javascript
class A {
}

class B extends A {
}

B.__proto__ === A // true
B.prototype.__proto__ === A.prototype // true
```

In the code above, child B's `__proto__` points to parent A; child B's `prototype.__proto__` points to parent A's `prototype`.

This is because class inheritance is implemented as follows:

```javascript
class A {
}

class B {
}

// B's instances inherit from A's instances
Object.setPrototypeOf(B.prototype, A.prototype);

// B inherits A's static properties
Object.setPrototypeOf(B, A);

const b = new B();
```

The Object Extensions chapter covers the implementation of `Object.setPrototypeOf`:

```javascript
Object.setPrototypeOf = function (obj, proto) {
  obj.__proto__ = proto;
  return obj;
}
```

So the results above follow.

```javascript
Object.setPrototypeOf(B.prototype, A.prototype);
// Same as
B.prototype.__proto__ = A.prototype;

Object.setPrototypeOf(B, A);
// Same as
B.__proto__ = A;
```

These two inheritance chains can be understood as: as an object, the child class (B)'s prototype (`__proto__`) is the parent class (A); as a constructor, the child class (B)'s prototype object (`prototype`) inherits from the parent's prototype object (`prototype`).

```javascript
B.prototype = Object.create(A.prototype);
// Same as
B.prototype.__proto__ = A.prototype;
```

The value after the `extends` keyword can be of several types.

```javascript
class B extends A {
}
```

In the code above, `A` only needs to be a function with a `prototype` property for B to extend it. Since most functions have `prototype` (except `Function.prototype`), A can be almost any function.

Two cases: first, when the child extends `Object`:

```javascript
class A extends Object {
}

A.__proto__ === Object // true
A.prototype.__proto__ === Object.prototype // true
```

Here A is effectively a copy of the `Object` constructor, and A instances are Object instances.

Second, when there is no inheritance:

```javascript
class A {
}

A.__proto__ === Function.prototype // true
A.prototype.__proto__ === Object.prototype // true
```

Here A, as a base class, is an ordinary function and inherits directly from `Function.prototype`. When called, it returns an empty object (an Object instance), so `A.prototype.__proto__` points to `Object`'s `prototype`.

### Instance \_\_proto\_\_ Property

The `__proto__` of a child instance's `__proto__` points to the parent instance's `__proto__`. That is, the prototype of the child's prototype is the parent's prototype.

```javascript
var p1 = new Point(2, 3);
var p2 = new ColorPoint(2, 3, 'red');

p2.__proto__ === p1.__proto__ // false
p2.__proto__.__proto__ === p1.__proto__ // true
```

In the code above, `ColorPoint` extends `Point`, so the prototype of the child's prototype is the parent's prototype.

Thus, you can modify parent instance behavior through a child instance's `__proto__.__proto__`.

```javascript
p2.__proto__.__proto__.printName = function () {
  console.log('Ha');
};

p1.printName() // "Ha"
```

The code above adds a method to `Point` via `ColorPoint` instance `p2`; this affects `Point` instance `p1`.

## Inheriting from Native Constructors

Native constructors are language-built constructors, usually used to create data structures. ECMAScript native constructors include:

- Boolean()
- Number()
- String()
- Array()
- Date()
- Function()
- RegExp()
- Error()
- Object()

Previously, these native constructors could not be extended. For example, you could not define your own Array subclass:

```javascript
function MyArray() {
  Array.apply(this, arguments);
}

MyArray.prototype = Object.create(Array.prototype, {
  constructor: {
    value: MyArray,
    writable: true,
    configurable: true,
    enumerable: true
  }
});
```

The code above defines a `MyArray` class extending Array, but its behavior is inconsistent with Array:

```javascript
var colors = new MyArray();
colors[0] = "red";
colors.length  // 0

colors.length = 0;
colors[0]  // "red"
```

This happens because the child class cannot obtain the native constructor's internal properties; neither `Array.apply()` nor assigning to the prototype works. Native constructors ignore the `this` passed to `apply`, so `this` cannot be bound and internal properties are not available.

In ES5, the child instance object `this` is created first, then parent properties are added. Since the parent's internal properties cannot be obtained, native constructors could not be properly extended. For example, the Array constructor has an internal property `[[DefineOwnProperty]]` that updates the `length` property when new properties are defined; this cannot be accessed in the child, so the child's `length` behavior is wrong.

In the next example, we try to make a plain object inherit from Error:

```javascript
var e = {};

Object.getOwnPropertyNames(Error.call(e))
// [ 'stack' ]

Object.getOwnPropertyNames(e)
// []
```

In the code above, we tried to give plain object `e` Error's instance properties via `Error.call(e)`. But `Error.call()` ignores the first argument and returns a new object; `e` itself is unchanged. This shows that `Error.call(e)` cannot extend native constructors.

ES6 allows extending native constructors because it first creates the parent instance object `this`, then modifies it with the child constructor, so all parent behavior can be inherited. Here is an example extending Array:

```javascript
class MyArray extends Array {
  constructor(...args) {
    super(...args);
  }
}

var arr = new MyArray();
arr[0] = 12;
arr.length // 1

arr.length = 0;
arr[0] // undefined
```

The code above defines a `MyArray` class extending Array; instances created from it behave like arrays. ES6 can define subclasses of native data structures (e.g. Array, String) that ES5 could not.

This also shows that `extends` can extend native constructors, not just classes, so you can build your own data structures on top of native ones. Here is a versioned array:

```javascript
class VersionedArray extends Array {
  constructor() {
    super();
    this.history = [[]];
  }
  commit() {
    this.history.push(this.slice());
  }
  revert() {
    this.splice(0, this.length, ...this.history[this.history.length - 1]);
  }
}

var x = new VersionedArray();

x.push(1);
x.push(2);
x // [1, 2]
x.history // [[]]

x.commit();
x.history // [[], [1, 2]]

x.push(3);
x // [1, 2, 3]
x.history // [[], [1, 2]]

x.revert();
x // [1, 2]
```

In the code above, `VersionedArray` uses `commit` to save a snapshot of the current state into `history`. `revert` restores the array to the last saved version. Beyond that, `VersionedArray` behaves like a normal array; all native array methods work on it.

Here is a custom Error subclass that customizes error behavior:

```javascript
class ExtendableError extends Error {
  constructor(message) {
    super();
    this.message = message;
    this.stack = (new Error()).stack;
    this.name = this.constructor.name;
  }
}

class MyError extends ExtendableError {
  constructor(m) {
    super(m);
  }
}

var myerror = new MyError('ll');
myerror.message // "ll"
myerror instanceof Error // true
myerror.name // "MyError"
myerror.stack
// Error
//     at MyError.ExtendableError
//     ...
```

Note: extending `Object` has a [behavioral difference](https://stackoverflow.com/questions/36203614/super-does-not-pass-arguments-when-instantiating-a-class-extended-from-object).

```javascript
class NewObj extends Object{
  constructor(){
    super(...arguments);
  }
}
var o = new NewObj({attr: true});
o.attr === true  // false
```

In the code above, `NewObj` extends `Object`, but arguments cannot be passed to the parent via `super`. ES6 changed the behavior of the `Object` constructor: when it is not invoked as `new Object()`, it ignores its arguments.

## Implementing the Mixin Pattern

Mixin means combining multiple objects into one new object that exposes the interfaces of each component. A minimal implementation is:

```javascript
const a = {
  a: 'a'
};
const b = {
  b: 'b'
};
const c = {...a, ...b}; // {a: 'a', b: 'b'}
```

In the code above, object `c` combines `a` and `b` and exposes both interfaces.

A more complete implementation mixes multiple class interfaces into another class:

```javascript
function mix(...mixins) {
  class Mix {
    constructor() {
      for (let mixin of mixins) {
        copyProperties(this, new mixin()); // Copy instance properties
      }
    }
  }

  for (let mixin of mixins) {
    copyProperties(Mix, mixin); // Copy static properties
    copyProperties(Mix.prototype, mixin.prototype); // Copy prototype properties
  }

  return Mix;
}

function copyProperties(target, source) {
  for (let key of Reflect.ownKeys(source)) {
    if ( key !== 'constructor'
      && key !== 'prototype'
      && key !== 'name'
    ) {
      let desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    }
  }
}
```

The `mix` function above combines multiple objects into one class. To use it, inherit from that class:

```javascript
class DistributedEdit extends mix(Loggable, Serializable) {
  // ...
}
```
