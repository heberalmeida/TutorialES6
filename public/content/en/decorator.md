# Decorators

[Note] The Decorator proposal has undergone significant syntax changes and is currently in Stage 3. It is unclear whether further changes will occur before it is finalized. This chapter is currently in draft form. Sections labeled "new syntax" are based on the current syntax but have not been fully organized—they are raw materials. Sections not labeled "new syntax" are based on the previous syntax and are legacy content. These earlier sections are retained for two reasons: first, TypeScript decorators use this syntax; second, they contain valuable material. Once the standard is fully finalized, this chapter will be completely rewritten: removing outdated content, supplementing materials, and adding explanations. (June 2022)

## Introduction (new syntax)

Decorators are used to enhance the functionality of JavaScript classes. Many object-oriented languages have this syntax, and there is a [proposal](https://github.com/tc39/proposal-decorators) to introduce it into ECMAScript.

A decorator is a function written as `@ + function name`. It can be used to decorate four types of values:

- Classes
- Class properties
- Class methods
- Property accessors

The following example shows decorators placed before the class name and class method names, so you can get a feel for the syntax.

```javascript
@frozen class Foo {
  @configurable(false)
  @enumerable(true)
  method() {}

  @throttle(500)
  expensiveMethod() {}
}
```

The above code uses four decorators: one on the class itself (`@frozen`), and three on class methods (`@configurable()`, `@enumerable()`, and `@throttle()`). They not only improve code readability and clearly express intent, but also provide a convenient way to add or modify class functionality.

## Decorator API (new syntax)

A decorator is a function. The type description of the API is as follows (TypeScript syntax).

```typescript
type Decorator = (value: Input, context: {
  kind: string;
  name: string | symbol;
  access: {
    get?(): unknown;
    set?(value: unknown): void;
  };
  private?: boolean;
  static?: boolean;
  addInitializer?(initializer: () => void): void;
}) => Output | void;
```

A decorator function takes two parameters. At runtime, the JavaScript engine supplies these two parameters.

- `value`: The value being decorated; in some cases it may be `undefined` (when decorating properties).
- `context`: The context information object.

The return value of the decorator function is a new version of the decorated object, but it can also return nothing (void).

The `context` object has many properties. The `kind` property indicates which type of decorator it is. The meanings of the other properties are as follows:

- `kind`: A string indicating the decorator type. Possible values are `class`, `method`, `getter`, `setter`, `field`, and `accessor`.
- `name`: The name of the decorated value, or in the case of private elements the description of it (e.g. the readable name).
- `access`: An object containing methods to access this value, i.e., the setter and getter.
- `static`: A boolean indicating whether the value is a static element.
- `private`: A boolean indicating whether the value is a private element.
- `addInitializer`: A function that allows users to add initialization logic.

The execution steps of decorators are as follows:

1. Compute the value of each decorator, in order from left to right and top to bottom.
1. Call method decorators.
1. Call the class decorator.

## Decorating Classes

Decorators can be used to decorate an entire class.

```javascript
@testable
class MyTestableClass {
  // ...
}

function testable(target) {
  target.isTestable = true;
}

MyTestableClass.isTestable // true
```

In the above code, `@testable` is a decorator. It modifies the behavior of the `MyTestableClass` class by adding the static property `isTestable` to it. The `target` parameter of the `testable` function is the `MyTestableClass` class itself.

Essentially, a decorator behaves as follows:

```javascript
@decorator
class A {}

// equivalent to

class A {}
A = decorator(A) || A;
```

That is, a decorator is a function that processes a class. The first parameter of the decorator function is the target class being decorated.

```javascript
function testable(target) {
  // ...
}
```

In the code above, the `target` parameter of the `testable` function is the class that will be decorated.

If one parameter is not enough, you can wrap another function around the decorator.

```javascript
function testable(isTestable) {
  return function(target) {
    target.isTestable = isTestable;
  }
}

@testable(true)
class MyTestableClass {}
MyTestableClass.isTestable // true

@testable(false)
class MyClass {}
MyClass.isTestable // false
```

In the above code, the `testable` decorator can accept parameters, which allows the decorator's behavior to be modified.

The previous example added a static property to the class. To add an instance property instead, you can work through the target class's `prototype` object.

```javascript
function testable(target) {
  target.prototype.isTestable = true;
}

@testable
class MyTestableClass {}

let obj = new MyTestableClass();
obj.isTestable // true
```

In the above code, the decorator function `testable` adds a property to the target class's `prototype` object, so it can be called on the instance.

Here is another example.

```javascript
// mixins.js
export function mixins(...list) {
  return function (target) {
    Object.assign(target.prototype, ...list)
  }
}

// main.js
import { mixins } from './mixins.js'

const Foo = {
  foo() { console.log('foo') }
};

@mixins(Foo)
class MyClass {}

let obj = new MyClass();
obj.foo() // 'foo'
```

The above code uses the `mixins` decorator to add the methods of the `Foo` object to instances of `MyClass`. You can use `Object.assign()` to simulate this functionality:

```javascript
const Foo = {
  foo() { console.log('foo') }
};

class MyClass {}

Object.assign(MyClass.prototype, Foo);

let obj = new MyClass();
obj.foo() // 'foo'
```

In real-world development, when using React together with the Redux library, you often need to write something like this:

```javascript
class MyReactComponent extends React.Component {}

export default connect(mapStateToProps, mapDispatchToProps)(MyReactComponent);
```

With decorators, the above code can be rewritten as:

```javascript
@connect(mapStateToProps, mapDispatchToProps)
export default class MyReactComponent extends React.Component {}
```

The latter style is relatively easier to understand.

## Class Decorators (new syntax)

The type description of a class decorator is as follows.

```typescript
type ClassDecorator = (value: Function, context: {
  kind: "class";
  name: string | undefined;
  addInitializer(initializer: () => void): void;
}) => Function | void;
```

The first parameter of a class decorator is the class being decorated. The second parameter is the context object. If the decorated class is anonymous, the `name` property will be `undefined`.

A class decorator can return a new class that replaces the original, or it can return nothing. If it returns something that is not a constructor, an error will be thrown.

Here is an example:

```javascript
function logged(value, { kind, name }) {
  if (kind === "class") {
    return class extends value {
      constructor(...args) {
        super(...args);
        console.log(`constructing an instance of ${name} with arguments ${args.join(", ")}`);
      }
    }
  }

  // ...
}

@logged
class C {}

new C(1);
// constructing an instance of C with arguments 1
```

Without using decorator syntax, a class decorator effectively executes as follows:

```javascript
class C {}

C = logged(C, {
  kind: "class",
  name: "C",
}) ?? C;

new C(1);
```

## Method Decorators (new syntax)

Method decorators modify class methods.

```javascript
class C {
  @trace
  toString() {
    return 'C';
  }
}

// equivalent to
C.prototype.toString = trace(C.prototype.toString);
```

In the above example, the `@trace` decorator decorates the `toString()` method, which is equivalent to modifying that method.

The type of a method decorator described in TypeScript is as follows:

```typescript
type ClassMethodDecorator = (value: Function, context: {
  kind: "method";
  name: string | symbol;
  access: { get(): unknown };
  static: boolean;
  private: boolean;
  addInitializer(initializer: () => void): void;
}) => Function | void;
```

The first parameter `value` of a method decorator is the method being decorated.

A method decorator can return a new function that replaces the original method, or it can return nothing to indicate that the original method should still be used. Returning any other type of value will throw an error. Here is an example:

```javascript
function replaceMethod() {
  return function () {
    return `How are you, ${this.name}?`;
  }
}

class Person {
  constructor(name) {
    this.name = name;
  }
  @replaceMethod
  hello() {
    return `Hi ${this.name}!`;
  }
}

const robin = new Person('Robin');

robin.hello(), 'How are you, Robin?'
```

In the above example, `@replaceMethod` returns a new function that replaces the original `hello()` method.

```typescript
function logged(value, { kind, name }) {
  if (kind === "method") {
    return function (...args) {
      console.log(`starting ${name} with arguments ${args.join(", ")}`);
      const ret = value.call(this, ...args);
      console.log(`ending ${name}`);
      return ret;
    };
  }
}

class C {
  @logged
  m(arg) {}
}

new C().m(1);
// starting m with arguments 1
// ending m
```

In the above example, the `@logged` decorator returns a function that replaces the original `m()` method.

Here the decorator is essentially syntactic sugar. The actual operation is to modify the `m()` method on the prototype chain, like this:

```javascript
class C {
  m(arg) {}
}

C.prototype.m = logged(C.prototype.m, {
  kind: "method",
  name: "m",
  static: false,
  private: false,
}) ?? C.prototype.m;
```

## Decorating Methods

Decorators can decorate not only classes but also class properties.

```javascript
class Person {
  @readonly
  name() { return `${this.first} ${this.last}` }
}
```

In the above code, the `readonly` decorator is used to decorate the `name` method of the "class".

The decorator function `readonly` can accept three parameters in total:

```javascript
function readonly(target, name, descriptor){
  // descriptor object's original value is as follows
  // {
  //   value: specifiedFunction,
  //   enumerable: false,
  //   configurable: true,
  //   writable: true
  // };
  descriptor.writable = false;
  return descriptor;
}

readonly(Person.prototype, 'name', descriptor);
// similar to
Object.defineProperty(Person.prototype, 'name', descriptor);
```

The first parameter of the decorator is the prototype object of the class—in the example above, `Person.prototype`. The intent of the decorator is to "decorate" class instances, but at this point the instance has not yet been created, so it can only decorate the prototype (this differs from class decorators, where the `target` parameter refers to the class itself). The second parameter is the name of the property being decorated, and the third parameter is the descriptor object of that property.

Additionally, the code above shows that the decorator (`readonly`) modifies the property descriptor object, and the modified descriptor is then used to define the property.

Here is another example that modifies the `enumerable` property of the descriptor object so that the property cannot be enumerated:

```javascript
class Person {
  @nonenumerable
  get kidCount() { return this.children.length; }
}

function nonenumerable(target, name, descriptor) {
  descriptor.enumerable = false;
  return descriptor;
}
```

The `@log` decorator below can be used to output logs:

```javascript
class Math {
  @log
  add(a, b) {
    return a + b;
  }
}

function log(target, name, descriptor) {
  var oldValue = descriptor.value;

  descriptor.value = function() {
    console.log(`Calling ${name} with`, arguments);
    return oldValue.apply(this, arguments);
  };

  return descriptor;
}

const math = new Math();

// passed parameters should get logged now
math.add(2, 4);
```

In the above code, the `@log` decorator causes `console.log` to run before the original operation, thereby outputting logs.

Decorators serve a documentary purpose.

```javascript
@testable
class Person {
  @readonly
  @nonenumerable
  name() { return `${this.first} ${this.last}` }
}
```

From the code above, we can see at a glance that the `Person` class is testable and that the `name` method is readonly and non-enumerable.

The following is a [component](https://github.com/ionic-team/stencil) written using the Decorator syntax—it is clear at a glance:

```javascript
@Component({
  tag: 'my-component',
  styleUrl: 'my-component.scss'
})
export class MyComponent {
  @Prop() first: string;
  @Prop() last: string;
  @State() isVisible: boolean = true;

  render() {
    return (
      <p>Hello, my name is {this.first} {this.last}</p>
    );
  }
}
```

If the same method has multiple decorators, they execute like peeling an onion: first applied from outside to inside, then executed from inside to outside.

```javascript
function dec(id){
  console.log('evaluated', id);
  return (target, property, descriptor) => console.log('executed', id);
}

class Example {
    @dec(1)
    @dec(2)
    method(){}
}
// evaluated 1
// evaluated 2
// executed 2
// executed 1
```

In the above code, the outer decorator `@dec(1)` is applied first, but the inner decorator `@dec(2)` executes first.

Besides documentation, decorators can also be used for type checking. For classes, this is quite useful. In the long term, it will be an important tool for static analysis of JavaScript code.

## Why Can't Decorators Be Used on Functions?

Decorators can only be used on classes and class methods, not on functions, because of function hoisting.

```javascript
var counter = 0;

var add = function () {
  counter++;
};

@add
function foo() {
}
```

The intent of the code above is for `counter` to equal 1 after execution, but in practice the result is `counter` equal to 0. Because of function hoisting, the code that actually runs is:

```javascript
var counter;
var add;

@add
function foo() {
}

counter = 0;

add = function () {
  counter++;
};
```

Here is another example:

```javascript
var readOnly = require("some-decorator");

@readOnly
function foo() {
}
```

This code also has problems because the actual execution is:

```javascript
var readOnly;

@readOnly
function foo() {
}

readOnly = require("some-decorator");
```

In summary, because of function hoisting, decorators cannot be used on functions. Classes are not hoisted, so there is no such problem.

On the other hand, if you must decorate a function, you can use the form of a higher-order function and call it directly:

```javascript
function doSomething(name) {
  console.log('Hello, ' + name);
}

function loggingDecorator(wrapped) {
  return function() {
    console.log('Starting');
    const result = wrapped.apply(this, arguments);
    console.log('Finished');
    return result;
  }
}

const wrapped = loggingDecorator(doSomething);
```

## Accessor Decorators (new syntax)

The type description of accessor decorators in TypeScript is as follows:

```typescript
type ClassGetterDecorator = (value: Function, context: {
  kind: "getter";
  name: string | symbol;
  access: { get(): unknown };
  static: boolean;
  private: boolean;
  addInitializer(initializer: () => void): void;
}) => Function | void;

type ClassSetterDecorator = (value: Function, context: {
  kind: "setter";
  name: string | symbol;
  access: { set(value: unknown): void };
  static: boolean;
  private: boolean;
  addInitializer(initializer: () => void): void;
}) => Function | void;
```

The first parameter of an accessor decorator is the original setter or getter.

If the return value of an accessor decorator is a function, it replaces the original accessor. Essentially, like method decorators, the modification happens on the class's prototype object. It can also return nothing and continue using the original accessor. Returning any other type of value will throw an error.

Accessor decorators apply separately to setters and getters. In the example below, `@foo` only decorates `get x()`, not `set x()`:

```javascript
class C {
  @foo
  get x() {
    // ...
  }

  set x(val) {
    // ...
  }
}
```

The `@logged` decorator from the previous section can be adapted for accessor decorators:

```javascript
function logged(value, { kind, name }) {
  if (kind === "method" || kind === "getter" || kind === "setter") {
    return function (...args) {
      console.log(`starting ${name} with arguments ${args.join(", ")}`);
      const ret = value.call(this, ...args);
      console.log(`ending ${name}`);
      return ret;
    };
  }
}

class C {
  @logged
  set x(arg) {}
}

new C().x = 1
// starting x with arguments 1
// ending x
```

Without the syntactic sugar, the equivalent traditional syntax modifies the class's prototype chain:

```javascript
class C {
  set x(arg) {}
}

let { set } = Object.getOwnPropertyDescriptor(C.prototype, "x");
set = logged(set, {
  kind: "setter",
  name: "x",
  static: false,
  private: false,
}) ?? set;

Object.defineProperty(C.prototype, "x", { set });
```

## Property Decorators (new syntax)

The type description of a property decorator is as follows:

```typescript
type ClassFieldDecorator = (value: undefined, context: {
  kind: "field";
  name: string | symbol;
  access: { get(): unknown, set(value: unknown): void };
  static: boolean;
  private: boolean;
}) => (initialValue: unknown) => unknown | void;
```

The first parameter of a property decorator is `undefined`—no value is passed in. Users can choose to have the decorator return an initialization function. When the property is assigned, this initialization function will run automatically. It receives the property's initial value and returns a new initial value. A property decorator can also return nothing. Returning any other type of value will throw an error.

Here is an example:

```javascript
function logged(value, { kind, name }) {
  if (kind === "field") {
    return function (initialValue) {
      console.log(`initializing ${name} with value ${initialValue}`);
      return initialValue;
    };
  }

  // ...
}

class C {
  @logged x = 1;
}

new C();
// initializing x with value 1
```

Without decorator syntax, a property decorator effectively works like this:

```javascript
let initializeX = logged(undefined, {
  kind: "field",
  name: "x",
  static: false,
  private: false,
}) ?? (initialValue) => initialValue;

class C {
  x = initializeX.call(this, 1);
}
```

## The `accessor` Keyword (new syntax)

The class decorator proposal introduces a new keyword `accessor` that is used as a prefix for properties.

```javascript
class C {
  accessor x = 1;
}
```

It is a shorthand that is equivalent to declaring property `x` as the access interface for private property `#x`. The code above is equivalent to:

```javascript
class C {
  #x = 1;

  get x() {
    return this.#x;
  }

  set x(val) {
    this.#x = val;
  }
}
```

The `accessor` keyword can be preceded by `static` and `private`:

```javascript
class C {
  static accessor x = 1;
  accessor #y = 2;
}
```

The `accessor` keyword can also accept property decorators:

```javascript
function logged(value, { kind, name }) {
  if (kind === "accessor") {
    let { get, set } = value;

    return {
      get() {
        console.log(`getting ${name}`);

        return get.call(this);
      },

      set(val) {
        console.log(`setting ${name} to ${val}`);

        return set.call(this, val);
      },

      init(initialValue) {
        console.log(`initializing ${name} with value ${initialValue}`);
        return initialValue;
      }
    };
  }

  // ...
}

class C {
  @logged accessor x = 1;
}

let c = new C();
// initializing x with value 1
c.x;
// getting x
c.x = 123;
// setting x to 123
```

The above example is equivalent to using the `@logged` decorator to modify the getter and setter methods of the `accessor` property.

The type description of a property decorator for `accessor` is as follows:

```typescript
type ClassAutoAccessorDecorator = (
  value: {
    get: () => unknown;
    set(value: unknown) => void;
  },
  context: {
    kind: "accessor";
    name: string | symbol;
    access: { get(): unknown, set(value: unknown): void };
    static: boolean;
    private: boolean;
    addInitializer(initializer: () => void): void;
  }
) => {
  get?: () => unknown;
  set?: (value: unknown) => void;
  initialize?: (initialValue: unknown) => unknown;
} | void;
```

The first parameter received by the `accessor` decorator is an object containing the getter and setter of the accessor property defined by the `accessor` keyword. The property decorator can return a new object containing new accessors to replace the originals, which effectively intercepts them. Additionally, the returned object can include an `initialize` function to change the initial value of the private property. The decorator can also return nothing. Returning any other type of value or an object with other properties will throw an error.

## The `addInitializer()` Method (new syntax)

Except for property decorators, the context object of other decorators also includes an `addInitializer()` method for initialization.

When it runs:

- Class decorators: After the class is fully defined.
- Method decorators: During class construction, before property initialization.
- Static method decorators: During class definition, after class method definitions but before static property definitions.

Here is an example:

```javascript
function customElement(name) {
  return (value, { addInitializer }) => {
    addInitializer(function() {
      customElements.define(name, this);
    });
  }
}

@customElement('my-element')
class MyElement extends HTMLElement {
  static get observedAttributes() {
    return ['some', 'attrs'];
  }
}
```

The above code is equivalent to this code without decorators:

```javascript
class MyElement {
  static get observedAttributes() {
    return ['some', 'attrs'];
  }
}

let initializersForMyElement = [];

MyElement = customElement('my-element')(MyElement, {
  kind: "class",
  name: "MyElement",
  addInitializer(fn) {
    initializersForMyElement.push(fn);
  },
}) ?? MyElement;

for (let initializer of initializersForMyElement) {
  initializer.call(MyElement);
}
```

Here is an example of a method decorator:

```javascript
function bound(value, { name, addInitializer }) {
  addInitializer(function () {
    this[name] = this[name].bind(this);
  });
}

class C {
  message = "hello!";

  @bound
  m() {
    console.log(this.message);
  }
}

let { m } = new C();

m(); // hello!
```

The above code is equivalent to this code without decorators:

```javascript
class C {
  constructor() {
    for (let initializer of initializersForM) {
      initializer.call(this);
    }

    this.message = "hello!";
  }

  m() {}
}

let initializersForM = []

C.prototype.m = bound(
  C.prototype.m,
  {
    kind: "method",
    name: "m",
    static: false,
    private: false,
    addInitializer(fn) {
      initializersForM.push(fn);
    },
  }
) ?? C.prototype.m;
```

## core-decorators.js

[core-decorators.js](https://github.com/jayphelps/core-decorators.js) is a third-party module that provides several common decorators. It can help you understand decorators better.

**(1)@autobind**

The `autobind` decorator binds the `this` object in the method to the original object.

```javascript
import { autobind } from 'core-decorators';

class Person {
  @autobind
  getPerson() {
    return this;
  }
}

let person = new Person();
let getPerson = person.getPerson;

getPerson() === person;
// true
```

**(2)@readonly**

The `readonly` decorator makes a property or method non-writable.

```javascript
import { readonly } from 'core-decorators';

class Meal {
  @readonly
  entree = 'steak';
}

var dinner = new Meal();
dinner.entree = 'salmon';
// Cannot assign to read only property 'entree' of [object Object]
```

**(3)@override**

The `override` decorator checks whether a subclass method correctly overrides a parent class method of the same name; it throws an error if not.

```javascript
import { override } from 'core-decorators';

class Parent {
  speak(first, second) {}
}

class Child extends Parent {
  @override
  speak() {}
  // SyntaxError: Child#speak() does not properly override Parent#speak(first, second)
}

// or

class Child extends Parent {
  @override
  speaks() {}
  // SyntaxError: No descriptor matching Child#speaks() was found on the prototype chain.
  //
  //   Did you mean "speak"?
}
```

**(4)@deprecate (alias @deprecated)**

The `deprecate` or `deprecated` decorator displays a warning in the console indicating that the method will be removed.

```javascript
import { deprecate } from 'core-decorators';

class Person {
  @deprecate
  facepalm() {}

  @deprecate('We stopped facepalming')
  facepalmHard() {}

  @deprecate('We stopped facepalming', { url: 'http://knowyourmeme.com/memes/facepalm' })
  facepalmHarder() {}
}

let person = new Person();

person.facepalm();
// DEPRECATION Person#facepalm: This function will be removed in future versions.

person.facepalmHard();
// DEPRECATION Person#facepalmHard: We stopped facepalming

person.facepalmHarder();
// DEPRECATION Person#facepalmHarder: We stopped facepalming
//
//     See http://knowyourmeme.com/memes/facepalm for more details.
//
```

**(5)@suppressWarnings**

The `suppressWarnings` decorator suppresses `console.warn()` calls triggered by the `deprecated` decorator. However, calls issued by asynchronous code are not suppressed.

```javascript
import { suppressWarnings } from 'core-decorators';

class Person {
  @deprecated
  facepalm() {}

  @suppressWarnings
  facepalmWithoutWarning() {
    this.facepalm();
  }
}

let person = new Person();

person.facepalmWithoutWarning();
// no warning is logged
```

## Using Decorators to Auto-Publish Events

We can use decorators so that when a method of an object is called, an event is automatically emitted.

```javascript
const postal = require("postal/lib/postal.lodash");

export default function publish(topic, channel) {
  const channelName = channel || '/';
  const msgChannel = postal.channel(channelName);
  msgChannel.subscribe(topic, v => {
    console.log('Channel: ', channelName);
    console.log('Event: ', topic);
    console.log('Data: ', v);
  });

  return function(target, name, descriptor) {
    const fn = descriptor.value;

    descriptor.value = function() {
      let value = fn.apply(this, arguments);
      msgChannel.publish(topic, value);
    };
  };
}
```

The above code defines a decorator named `publish` that modifies `descriptor.value` so that when the original method is called, an event is automatically emitted. It uses [Postal.js](https://github.com/postaljs/postal.js) as the event publish/subscribe library.

Usage example:

```javascript
// index.js
import publish from './publish';

class FooComponent {
  @publish('foo.some.message', 'component')
  someMethod() {
    return { my: 'data' };
  }
  @publish('foo.some.other')
  anotherMethod() {
    // ...
  }
}

let foo = new FooComponent();

foo.someMethod();
foo.anotherMethod();
```

From then on, whenever `someMethod` or `anotherMethod` is called, an event will be automatically emitted.

```bash
$ bash-node index.js
Channel:  component
Event:  foo.some.message
Data:  { my: 'data' }

Channel:  /
Event:  foo.some.other
Data:  undefined
```

## Mixin

On top of decorators, the Mixin pattern can be implemented. The Mixin pattern is an alternative to object inheritance—it means to mix another object's methods into one object.

Consider the following example:

```javascript
const Foo = {
  foo() { console.log('foo') }
};

class MyClass {}

Object.assign(MyClass.prototype, Foo);

let obj = new MyClass();
obj.foo() // 'foo'
```

In the code above, the object `Foo` has a `foo` method. Using the `Object.assign` method, the `foo` method can be "mixed into" the `MyClass` class, so that instances of `MyClass` have the `foo` method. This is a simple implementation of the "mixin" pattern.

Next, we will deploy a general script `mixins.js` that writes Mixin as a decorator:

```javascript
export function mixins(...list) {
  return function (target) {
    Object.assign(target.prototype, ...list);
  };
}
```

Then we can use this decorator to "mix in" various methods to a class:

```javascript
import { mixins } from './mixins.js';

const Foo = {
  foo() { console.log('foo') }
};

@mixins(Foo)
class MyClass {}

let obj = new MyClass();
obj.foo() // "foo"
```

With the `mixins` decorator, the `foo` method of the `Foo` object is "mixed into" the `MyClass` class.

However, the above approach mutates the `prototype` object of the `MyClass` class. If you prefer not to do that, you can also implement Mixin through class inheritance:

```javascript
class MyClass extends MyBaseClass {
  /* ... */
}
```

In the code above, `MyClass` extends `MyBaseClass`. If we want to "mix in" a `foo` method into `MyClass`, one approach is to insert a mixin class between `MyClass` and `MyBaseClass`. This class has the `foo` method and inherits all methods from `MyBaseClass`, and then `MyClass` extends this class:

```javascript
let MyMixin = (superclass) => class extends superclass {
  foo() {
    console.log('foo from MyMixin');
  }
};
```

In the code above, `MyMixin` is a mixin class generator that accepts `superclass` as a parameter and returns a subclass that extends `superclass` and includes a `foo` method.

Then, if the target class extends this mixin class, the goal of "mixing in" the `foo` method is achieved:

```javascript
class MyClass extends MyMixin(MyBaseClass) {
  /* ... */
}

let c = new MyClass();
c.foo(); // "foo from MyMixin"
```

If you need to "mix in" multiple methods, create multiple mixin classes:

```javascript
class MyClass extends Mixin1(Mixin2(MyBaseClass)) {
  /* ... */
}
```

One advantage of this approach is that you can call `super`, which helps avoid overwriting a parent class's method of the same name during the "mixin" process:

```javascript
let Mixin1 = (superclass) => class extends superclass {
  foo() {
    console.log('foo from Mixin1');
    if (super.foo) super.foo();
  }
};

let Mixin2 = (superclass) => class extends superclass {
  foo() {
    console.log('foo from Mixin2');
    if (super.foo) super.foo();
  }
};

class S {
  foo() {
    console.log('foo from S');
  }
}

class C extends Mixin1(Mixin2(S)) {
  foo() {
    console.log('foo from C');
    super.foo();
  }
}
```

In the code above, each time a "mix in" occurs, the parent class's `super.foo` method is called, so the parent class's method of the same name is not overwritten and its behavior is preserved.

```javascript
new C().foo()
// foo from C
// foo from Mixin1
// foo from Mixin2
// foo from S
```

## Trait

A Trait is also a type of decorator with an effect similar to Mixin, but it provides more features, such as preventing conflicts between methods with the same name, excluding certain methods from being mixed in, and aliasing mixed-in methods.

The following example uses the [traits-decorator](https://github.com/CocktailJS/traits-decorator) third-party module. The `traits` decorator provided by this module can accept not only objects but also ES6 classes as parameters.

```javascript
import { traits } from 'traits-decorator';

class TFoo {
  foo() { console.log('foo') }
}

const TBar = {
  bar() { console.log('bar') }
};

@traits(TFoo, TBar)
class MyClass { }

let obj = new MyClass();
obj.foo() // foo
obj.bar() // bar
```

In the above code, the `traits` decorator "mixes in" the `foo` method of the `TFoo` class and the `bar` method of the `TBar` object into the `MyClass` class.

Trait does not allow "mixing in" methods with the same name:

```javascript
import { traits } from 'traits-decorator';

class TFoo {
  foo() { console.log('foo') }
}

const TBar = {
  bar() { console.log('bar') },
  foo() { console.log('foo') }
};

@traits(TFoo, TBar)
class MyClass { }
// Error
// throw new Error('Method named: ' + methodName + ' is defined twice.');
//        ^
// Error: Method named: foo is defined twice.
```

In the above code, both `TFoo` and `TBar` have a `foo` method, so the `traits` decorator throws an error.

One solution is to exclude the `foo` method from `TBar`:

```javascript
import { traits, excludes } from 'traits-decorator';

class TFoo {
  foo() { console.log('foo') }
}

const TBar = {
  bar() { console.log('bar') },
  foo() { console.log('foo') }
};

@traits(TFoo, TBar::excludes('foo'))
class MyClass { }

let obj = new MyClass();
obj.foo() // foo
obj.bar() // bar
```

The code above uses the bind operator (`::`) to exclude the `foo` method from `TBar`, so no error is thrown during mixin.

Another approach is to give the `foo` method of `TBar` an alias:

```javascript
import { traits, alias } from 'traits-decorator';

class TFoo {
  foo() { console.log('foo') }
}

const TBar = {
  bar() { console.log('bar') },
  foo() { console.log('foo') }
};

@traits(TFoo, TBar::alias({foo: 'aliasFoo'}))
class MyClass { }

let obj = new MyClass();
obj.foo() // foo
obj.aliasFoo() // foo
obj.bar() // bar
```

The code above gives the `foo` method of `TBar` the alias `aliasFoo`, so `MyClass` can also mix in the `foo` method of `TBar`.

The `alias` and `excludes` methods can be used together:

```javascript
@traits(TExample::excludes('foo','bar')::alias({baz:'exampleBaz'}))
class MyClass {}
```

The code above excludes the `foo` and `bar` methods of `TExample` and gives the `baz` method the alias `exampleBaz`.

The `as` method provides another way to write the above:

```javascript
@traits(TExample::as({excludes:['foo', 'bar'], alias: {baz: 'exampleBaz'}}))
class MyClass {}
```
