# Basic Class Syntax

## Origins of Classes

In JavaScript, the traditional way to create instance objects was through constructor functions. Here is an example.

```javascript
function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.toString = function () {
  return '(' + this.x + ', ' + this.y + ')';
};

var p = new Point(1, 2);
```

This approach differs significantly from traditional object-oriented languages (such as C++ and Java) and can be confusing for programmers new to the language.

ES6 provides a syntax that is closer to traditional languages by introducing the concept of Class as a template for objects. You can define a class using the `class` keyword.

Essentially, ES6 `class` can be seen as syntactic sugar; most of its functionality could be achieved in ES5. The new `class` syntax mainly makes object prototype patterns clearer and more similar to traditional object-oriented syntax. The code above rewritten with ES6 `class` looks like this:

```javascript
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return '(' + this.x + ', ' + this.y + ')';
  }
}
```

The code above defines a "class". It has a `constructor()` method, which is the constructor, and the `this` keyword refers to the instance object. This new Class syntax is essentially equivalent to the ES5 constructor `Point` at the beginning of this chapter.

Besides the constructor, the `Point` class defines a `toString()` method. Note that when defining `toString()`, you do not need to add the `function` keyword; the function definition goes directly inside. In addition, methods do not need to be separated by commas, and adding commas will cause an error.

In ES6, classes can be seen as another way to write constructors.

```javascript
class Point {
  // ...
}

typeof Point // "function"
Point === Point.prototype.constructor // true
```

The code above shows that the data type of a class is a function, and the class itself points to the constructor.

When using it, you use the `new` command directly on the class, exactly like with constructors.

```javascript
class Bar {
  doStuff() {
    console.log('stuff');
  }
}

const b = new Bar();
b.doStuff() // "stuff"
```

The `prototype` property of constructors continues to exist in ES6 "classes". In fact, all methods of a class are defined on the class's `prototype` property.

```javascript
class Point {
  constructor() {
    // ...
  }

  toString() {
    // ...
  }

  toValue() {
    // ...
  }
}

// Same as

Point.prototype = {
  constructor() {},
  toString() {},
  toValue() {},
};
```

In the code above, the three methods `constructor()`, `toString()`, and `toValue()` are all defined on `Point.prototype`.

Therefore, when calling a method on a class instance, you are effectively calling the method on the prototype.

```javascript
class B {}
const b = new B();

b.constructor === B.prototype.constructor // true
```

In the code above, `b` is an instance of class `B`; its `constructor()` method is the `constructor()` method on the `B` class prototype.

Because all class methods are defined on the `prototype` object, new methods can be added to the `prototype` object. The `Object.assign()` method can conveniently add multiple methods to a class at once.

```javascript
class Point {
  constructor(){
    // ...
  }
}

Object.assign(Point.prototype, {
  toString(){},
  toValue(){}
});
```

The `constructor` property of the `prototype` object points directly to the "class" itself, which is consistent with ES5 behavior.

```javascript
Point.prototype.constructor === Point // true
```

Additionally, all methods defined inside a class are non-enumerable.

```javascript
class Point {
  constructor(x, y) {
    // ...
  }

  toString() {
    // ...
  }
}

Object.keys(Point.prototype)
// []
Object.getOwnPropertyNames(Point.prototype)
// ["constructor","toString"]
```

In the code above, the `toString()` method is a method defined inside the `Point` class and is non-enumerable. This differs from ES5 behavior.

```javascript
var Point = function (x, y) {
  // ...
};

Point.prototype.toString = function () {
  // ...
};

Object.keys(Point.prototype)
// ["toString"]
Object.getOwnPropertyNames(Point.prototype)
// ["constructor","toString"]
```

In the code above using ES5 syntax, the `toString()` method is enumerable.

## The constructor() Method

The `constructor()` method is the default method of a class. It is automatically called when generating object instances with the `new` command. A class must have a `constructor()` method; if none is defined, an empty `constructor()` is added by default.

```javascript
class Point {
}

// Same as
class Point {
  constructor() {}
}
```

In the code above, an empty `Point` class is defined, and the JavaScript engine will automatically add an empty `constructor()` method.

The `constructor()` method returns the instance object (i.e., `this`) by default, but you can specify that it returns another object.

```javascript
class Foo {
  constructor() {
    return Object.create(null);
  }
}

new Foo() instanceof Foo
// false
```

In the code above, the `constructor()` returns a completely new object, so the instance is not an instance of the `Foo` class.

Classes must be called with `new`, otherwise an error is thrown. This is a major difference from ordinary constructors, which can be invoked without `new`.

```javascript
class Foo {
  constructor() {
    return Object.create(null);
  }
}

Foo()
// TypeError: Class constructor Foo cannot be invoked without 'new'
```

## Class Instances

The way to create class instances is exactly the same as in ES5: use the `new` command. As mentioned earlier, if you forget `new` and call `Class()` like a function, an error will be thrown.

```javascript
class Point {
  // ...
}

// Error
var point = Point(2, 3);

// Correct
var point = new Point(2, 3);
```

Class properties and methods are defined on the prototype (i.e., on the `class`) unless they are explicitly defined on the instance itself (i.e., on the `this` object).

```javascript
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return '(' + this.x + ', ' + this.y + ')';
  }
}

var point = new Point(2, 3);

point.toString() // (2, 3)

point.hasOwnProperty('x') // true
point.hasOwnProperty('y') // true
point.hasOwnProperty('toString') // false
point.__proto__.hasOwnProperty('toString') // true
```

In the code above, `x` and `y` are properties of the instance object `point` (because they are defined on `this`), so `hasOwnProperty()` returns `true`. `toString()` is a property of the prototype object (because it is defined on the `Point` class), so `hasOwnProperty()` returns `false`. This is consistent with ES5 behavior.

As in ES5, all instances of a class share the same prototype object.

```javascript
var p1 = new Point(2,3);
var p2 = new Point(3,2);

p1.__proto__ === p2.__proto__
//true
```

In the code above, `p1` and `p2` are both instances of `Point`, so their prototypes are both `Point.prototype`, and their `__proto__` properties are equal.

This also means you can add methods to a "class" through an instance's `__proto__` property.

> `__proto__` is not part of the language itself; it is a private property added by implementations. Although many modern browsers' JS engines provide this property, it is still not recommended for production use to avoid environment dependencies. In production, you can use `Object.getPrototypeOf()` to get the prototype of an instance object and then add methods or properties to the prototype.

```javascript
var p1 = new Point(2,3);
var p2 = new Point(3,2);

p1.__proto__.printName = function () { return 'Oops' };

p1.printName() // "Oops"
p2.printName() // "Oops"

var p3 = new Point(4,2);
p3.printName() // "Oops"
```

The code above adds a `printName()` method on `p1`'s prototype. Because `p1`'s prototype is also `p2`'s prototype, `p2` can call this method too. Furthermore, newly created instances like `p3` can also call it. This means that modifying the prototype through an instance's `__proto__` must be done with great care; it is not recommended, as it changes the original class definition and affects all instances.

## New Syntax for Instance Properties

[ES2022](https://github.com/tc39/proposal-class-fields) introduced a new way to define class instance properties. Instance properties can now be defined at the top level inside the class, in addition to being defined on `this` inside the `constructor()` method.

```javascript
// Original style
class IncreasingCounter {
  constructor() {
    this._count = 0;
  }
  get value() {
    console.log('Getting the current value!');
    return this._count;
  }
  increment() {
    this._count++;
  }
}
```

In the example above, the instance property `_count` is defined on `this` inside the `constructor()` method.

With the new syntax, this property can be defined at the top level of the class instead; everything else stays the same.

```javascript
class IncreasingCounter {
  _count = 0;
  get value() {
    console.log('Getting the current value!');
    return this._count;
  }
  increment() {
    this._count++;
  }
}
```

In the code above, the instance property `_count` is at the same level as the getter `value()` and the `increment()` method. Here, you do not need to add `this` before the instance property.

Note that properties defined with this new syntax are own properties of the instance object, not properties on the instance prototype.

The benefit of this new syntax is that all own properties of an instance are defined at the top of the class, making it easy to see what instance properties a class has.

```javascript
class foo {
  bar = 'hello';
  baz = 'world';

  constructor() {
    // ...
  }
}
```

The code above makes it clear at a glance that the `foo` class has two instance properties. In addition, it is more concise.

## Getter and Setter Methods

As in ES5, you can use the `get` and `set` keywords inside a "class" to define getters and setters for a property and intercept its access behavior.

```javascript
class MyClass {
  constructor() {
    // ...
  }
  get prop() {
    return 'getter';
  }
  set prop(value) {
    console.log('setter: '+value);
  }
}

let inst = new MyClass();

inst.prop = 123;
// setter: 123

inst.prop
// 'getter'
```

In the code above, the `prop` property has both a getter and a setter, so its read and write behavior are customized.

Getters and setters are defined on the property's Descriptor object.

```javascript
class CustomHTMLElement {
  constructor(element) {
    this.element = element;
  }

  get html() {
    return this.element.innerHTML;
  }

  set html(value) {
    this.element.innerHTML = value;
  }
}

var descriptor = Object.getOwnPropertyDescriptor(
  CustomHTMLElement.prototype, "html"
);

"get" in descriptor  // true
"set" in descriptor  // true
```

In the code above, the getter and setter are defined on the descriptor object of the `html` property, which is fully consistent with ES5.

## Computed Property Names

Class property names can use expressions.

```javascript
let methodName = 'getArea';

class Square {
  constructor(length) {
    // ...
  }

  [methodName]() {
    // ...
  }
}
```

In the code above, the method name `getArea` of the `Square` class comes from an expression.

## Class Expressions

Like functions, classes can also be defined using expressions.

```javascript
const MyClass = class Me {
  getClassName() {
    return Me.name;
  }
};
```

The code above defines a class using an expression. Note that the class name is `Me`, but `Me` is only available inside the class and refers to the current class. Outside the class, you can only reference it as `MyClass`.

```javascript
let inst = new MyClass();
inst.getClassName() // Me
Me.name // ReferenceError: Me is not defined
```

The code above shows that `Me` is only defined inside the class.

If `Me` is not used inside the class, it can be omitted, so you can write:

```javascript
const MyClass = class { /* ... */ };
```

With class expressions, you can write immediately-invoked classes.

```javascript
let person = new class {
  constructor(name) {
    this.name = name;
  }

  sayName() {
    console.log(this.name);
  }
}('John');

person.sayName(); // "John"
```

In the code above, `person` is an instance of an immediately-invoked class.

## Static Methods

A class serves as the prototype for instances; all methods defined in the class are inherited by instances. If you add the `static` keyword before a method, that method is not inherited by instances and is instead called directly on the class. Such methods are called "static methods".

```javascript
class Foo {
  static classMethod() {
    return 'hello';
  }
}

Foo.classMethod() // 'hello'

var foo = new Foo();
foo.classMethod()
// TypeError: foo.classMethod is not a function
```

In the code above, the `classMethod` method of class `Foo` has the `static` keyword, indicating it is a static method. It can be called directly on the `Foo` class (`Foo.classMethod()`), not on instances of `Foo`. Calling a static method on an instance throws an error because the method does not exist there.

Note that if a static method contains `this`, it refers to the class, not the instance.

```javascript
class Foo {
  static bar() {
    this.baz();
  }
  static baz() {
    console.log('hello');
  }
  baz() {
    console.log('world');
  }
}

Foo.bar() // hello
```

In the code above, the static method `bar` calls `this.baz`; here `this` refers to class `Foo`, not a `Foo` instance, so it is equivalent to calling `Foo.baz`. This example also shows that static methods can share names with instance methods.

Static methods of a parent class can be inherited by child classes.

```javascript
class Foo {
  static classMethod() {
    return 'hello';
  }
}

class Bar extends Foo {
}

Bar.classMethod() // 'hello'
```

In the code above, the parent class `Foo` has a static method, and the child class `Bar` can call it.

Static methods can also be called from the `super` object.

```javascript
class Foo {
  static classMethod() {
    return 'hello';
  }
}

class Bar extends Foo {
  static classMethod() {
    return super.classMethod() + ', too';
  }
}

Bar.classMethod() // "hello, too"
```

## Static Properties

Static properties refer to properties on the Class itself, i.e., `Class.propName`, not properties defined on instance objects (`this`).

```javascript
class Foo {
}

Foo.prop = 1;
Foo.prop // 1
```

The code above defines a static property `prop` for the `Foo` class.

Currently, this is the only supported way, because ES6 clearly specifies that a Class has only static methods, not static properties. A [proposal](https://github.com/tc39/proposal-class-fields) adds static properties for classes, using the `static` keyword before the property.

```javascript
class MyClass {
  static myStaticProp = 42;

  constructor() {
    console.log(MyClass.myStaticProp); // 42
  }
}
```

This new syntax makes static properties much easier to express.

```javascript
// Old style
class Foo {
  // ...
}
Foo.prop = 1;

// New style
class Foo {
  static prop = 1;
}
```

In the code above, the old syntax defines the static property outside the class, after the class has been created. This makes the static property easy to overlook and does not follow the principle of keeping related code together. The new syntax is declarative and has clearer semantics.

## Private Methods and Private Properties

### Early Solutions

Private methods and private properties are methods and properties that can only be accessed inside the class. They are a common need for encapsulation, but early ES6 did not provide them, so they had to be simulated with workarounds.

One approach was to use naming conventions.

```javascript
class Widget {

  // Public method
  foo (baz) {
    this._bar(baz);
  }

  // Private method
  _bar(baz) {
    return this.snaf = baz;
  }

  // ...
}
```

In the code above, the leading underscore on `_bar()` indicates it is a private method for internal use. However, this convention is not reliable, as the method can still be called from outside the class.

Another approach was to move the private method outside the class, since all methods inside a class are visible externally.

```javascript
class Widget {
  foo (baz) {
    bar.call(this, baz);
  }

  // ...
}

function bar(baz) {
  return this.snaf = baz;
}
```

In the code above, `foo` is a public method that calls `bar.call(this, baz)` internally. This effectively makes `bar()` a private method of the current class.

Another approach was to use the uniqueness of `Symbol` values by naming the private method with a `Symbol` value.

```javascript
const bar = Symbol('bar');
const snaf = Symbol('snaf');

export default class myClass{

  // Public method
  foo(baz) {
    this[bar](baz);
  }

  // Private method
  [bar](baz) {
    return this[snaf] = baz;
  }

  // ...
};
```

In the code above, `bar` and `snaf` are `Symbol` values, which are generally inaccessible from outside, achieving the effect of private methods and properties. However, it is not absolute: `Reflect.ownKeys()` can still retrieve them.

```javascript
const inst = new myClass();

Reflect.ownKeys(myClass.prototype)
// [ 'constructor', 'foo', Symbol(bar) ]
```

In the code above, property names using Symbol values can still be obtained from outside the class.

### Formal Private Property Syntax

[ES2022](https://github.com/tc39/proposal-class-fields) formally added private properties to `class` by prefixing the property name with `#`.

```javascript
class IncreasingCounter {
  #count = 0;
  get value() {
    console.log('Getting the current value!');
    return this.#count;
  }
  increment() {
    this.#count++;
  }
}
```

In the code above, `#count` is a private property and can only be used inside the class (`this.#count`). Using it outside the class will cause an error.

```javascript
const counter = new IncreasingCounter();
counter.#count // Error
counter.#count = 42 // Error
```

In the example above, reading or writing the private property `#count` outside the class both cause errors.

Note: [Starting in Chrome 111](https://developer.chrome.com/blog/new-in-devtools-111/#misc), developer tools can read and write private properties without errors; the Chrome team considers this useful for debugging.

Also, whether inside or outside the class, reading a non-existent private property causes an error. This is completely different from public properties: reading a non-existent public property does not throw, it just returns `undefined`.

```javascript
class IncreasingCounter {
  #count = 0;
  get value() {
    console.log('Getting the current value!');
    return this.#myCount; // Error
  }
  increment() {
    this.#count++;
  }
}

const counter = new IncreasingCounter();
counter.#myCount // Error
```

In the example above, `#myCount` is a non-existent private property; reading it inside or outside the function causes an error.

Note that the private property name must include `#`; without it, it is treated as a different property.

```javascript
class Point {
  #x;

  constructor(x = 0) {
    this.#x = +x;
  }

  get x() {
    return this.#x;
  }

  set x(value) {
    this.#x = +value;
  }
}
```

In the code above, `#x` is the private property and cannot be read from outside the `Point` class. Because `#` is part of the property name, it must be used together with `#`, so `#x` and `x` are two different properties.

This syntax can also be used for private methods.

```javascript
class Foo {
  #a;
  #b;
  constructor(a, b) {
    this.#a = a;
    this.#b = b;
  }
  #sum() {
    return this.#a + this.#b;
  }
  printSum() {
    console.log(this.#sum());
  }
}
```

In the example above, `#sum()` is a private method.

Private properties can also have getter and setter methods.

```javascript
class Counter {
  #xValue = 0;

  constructor() {
    console.log(this.#x);
  }

  get #x() { return this.#xValue; }
  set #x(value) {
    this.#xValue = value;
  }
}
```

In the code above, `#x` is a private property; its getter and setter (`get #x()` and `set #x()`) operate on another private property `#xValue`.

Private properties are not limited to references from `this`; within the class, instances can reference private properties as well.

```javascript
class Foo {
  #privateValue = 42;
  static getPrivateValue(foo) {
    return foo.#privateValue;
  }
}

Foo.getPrivateValue(new Foo()); // 42
```

The code above allows referencing the private property from instance `foo`.

The `static` keyword can also be added before private properties and private methods to indicate a static private property or method.

```javascript
class FakeMath {
  static PI = 22 / 7;
  static #totallyRandomNumber = 4;

  static #computeRandomNumber() {
    return FakeMath.#totallyRandomNumber;
  }

  static random() {
    console.log('I heard you like random numbers…')
    return FakeMath.#computeRandomNumber();
  }
}

FakeMath.PI // 3.142857142857143
FakeMath.random()
// I heard you like random numbers…
// 4
FakeMath.#totallyRandomNumber // Error
FakeMath.#computeRandomNumber() // Error
```

In the code above, `#totallyRandomNumber` is a private property and `#computeRandomNumber()` is a private method; they can only be called inside the `FakeMath` class. Calling them from outside causes an error.

### The in Operator

As mentioned earlier, directly accessing a non-existent private property of a class throws an error, but accessing a non-existent public property does not. This behavior can be used to check whether an object is an instance of a class.

```javascript
class C {
  #brand;

  static isC(obj) {
    try {
      obj.#brand;
      return true;
    } catch {
      return false;
    }
  }
}
```

In the example above, the static method `isC()` of class `C` checks whether an object is an instance of `C` by accessing its private property `#brand`. If it does not throw, it returns `true`; if it throws, the object is not an instance of the current class, so the `catch` block returns `false`.

Thus, `try...catch` can be used to check whether a private property exists. However, this approach is cumbersome and reduces readability. [ES2022](https://github.com/tc39/proposal-private-fields-in-in) extended the `in` operator so it can also test for private properties.

```javascript
class C {
  #brand;

  static isC(obj) {
    if (#brand in obj) {
      // Private property #brand exists
      return true;
    } else {
      // Private property #brand does not exist
      return false;
    }
  }
}
```

In the example above, the `in` operator checks whether an object has the private property `#brand`. It does not throw; it returns a boolean.

This use of `in` can also be combined with `this`.

```javascript
class A {
  #foo = 0;
  m() {
    console.log(#foo in this); // true
  }
}
```

Note that when checking for private properties, `in` can only be used inside the class. Also, the private property being tested must be declared first; otherwise, an error is thrown.

```javascript
class A {
  m() {
    console.log(#foo in this); // Error
  }
}
```

In the example above, the private property `#foo` is not declared before being used in the `in` check, which causes an error.

## Static Blocks

One issue with static properties is that if they have initialization logic, that logic must either be written outside the class or inside the `constructor()` method.

```javascript
class C {
  static x = 234;
  static y;
  static z;
}

try {
  const obj = doSomethingWith(C.x);
  C.y = obj.y
  C.z = obj.z;
} catch {
  C.y = ...;
  C.z = ...;
}
```

In the example above, the values of static properties `y` and `z` depend on computations involving static property `x`; this initialization logic is written outside the class (the `try...catch` block). The alternative is to put it in the `constructor()` method. Neither approach is ideal: the first pushes internal class logic outside, and the second runs on every new instance.

To address this, ES2022 introduced [static blocks](https://github.com/tc39/proposal-class-static-block), which allow a block of code inside the class that runs once when the class is created, mainly for initializing static properties. When new instances are created later, this block does not run.

```javascript
class C {
  static x = ...;
  static y;
  static z;

  static {
    try {
      const obj = doSomethingWith(this.x);
      this.y = obj.y;
      this.z = obj.z;
    }
    catch {
      this.y = ...;
      this.z = ...;
    }
  }
}
```

In the code above, there is a static block inside the class. Its advantage is that the initialization logic for static properties `y` and `z` is kept inside the class and runs only once.

Each class can have multiple static blocks. Each block can only access previously declared static properties. Also, static blocks cannot contain `return` statements.

Inside a static block, the class name or `this` can be used to refer to the current class.

```javascript
class C {
  static x = 1;
  static {
    this.x; // 1
    // Or
    C.x; // 1
  }
}
```

In the example above, both `this.x` and `C.x` access the static property `x`.

Besides initializing static properties, static blocks can also be used to share private properties with code outside the class.

```javascript
let getX;

export class C {
  #x = 1;
  static {
    getX = obj => obj.#x;
  }
}

console.log(getX(new C())); // 1
```

In the example above, `#x` is a private property of the class. If the external `getX()` function needs to access it, previously it had to be defined in the class's `constructor()` method, so every new instance would redefine `getX()`. Now it can be placed in a static block, so it is only defined once when the class is created.

## Class Considerations

### Strict Mode

Inside classes and modules, strict mode is enabled by default, so you do not need to add `"use strict"` at the top. Any code inside a class or module runs in strict mode. Since future code will effectively run inside modules, ES6 effectively upgraded the entire language to strict mode.

### No Hoisting

Classes are not hoisted, which is different from ES5.

```javascript
new Foo(); // ReferenceError
class Foo {}
```

In the code above, `Foo` is used before it is defined, which causes an error, because ES6 does not hoist class declarations to the top of the code. This rule exists in part due to inheritance: the child class must be defined after the parent class.

```javascript
{
  let Foo = class {};
  class Bar extends Foo {
  }
}
```

The code above does not throw, because when `Bar` extends `Foo`, `Foo` is already defined. If classes were hoisted, it would fail, since the class would be hoisted but the line that defines `Foo` would not, so `Foo` would not be defined when `Bar` inherits from it.

### The name Property

Because ES6 classes are essentially a wrapper around ES5 constructors, many function characteristics are inherited by classes, including the `name` property.

```javascript
class Point {}
Point.name // "Point"
```

The `name` property always returns the class name that follows the `class` keyword.

### Generator Methods

If you add an asterisk (`*`) before a method, it becomes a Generator function.

```javascript
class Foo {
  constructor(...args) {
    this.args = args;
  }
  * [Symbol.iterator]() {
    for (let arg of this.args) {
      yield arg;
    }
  }
}

for (let x of new Foo('hello', 'world')) {
  console.log(x);
}
// hello
// world
```

In the code above, the `Symbol.iterator` method of class `Foo` has an asterisk, making it a Generator function. The `Symbol.iterator` method returns the default iterator for `Foo` instances, and the `for...of` loop automatically uses this iterator.

### Binding of this

If a class method contains `this`, it normally refers to the class instance. However, you must be careful: if the method is used on its own, it can easily throw.

```javascript
class Logger {
  printName(name = 'there') {
    this.print(`Hello ${name}`);
  }

  print(text) {
    console.log(text);
  }
}

const logger = new Logger();
const { printName } = logger;
printName(); // TypeError: Cannot read property 'print' of undefined
```

In the code above, `this` in `printName` normally refers to the `Logger` instance. But when the method is extracted and called on its own, `this` refers to the runtime environment (in strict mode inside a class, `this` is `undefined`), so `print` cannot be found and an error is thrown.

One simple fix is to bind `this` in the constructor so `print` is always found.

```javascript
class Logger {
  constructor() {
    this.printName = this.printName.bind(this);
  }

  // ...
}
```

Another approach is to use arrow functions.

```javascript
class Obj {
  constructor() {
    this.getThis = () => this;
  }
}

const myObj = new Obj();
myObj.getThis() === myObj // true
```

Inside an arrow function, `this` always refers to the object where the function was defined. In the code above, the arrow function is in the constructor; it is defined when the constructor runs, so its environment is the instance object and `this` will always refer to that instance.

Another approach is to use a `Proxy` to automatically bind `this` when methods are accessed.

```javascript
function selfish (target) {
  const cache = new WeakMap();
  const handler = {
    get (target, key) {
      const value = Reflect.get(target, key);
      if (typeof value !== 'function') {
        return value;
      }
      if (!cache.has(value)) {
        cache.set(value, value.bind(target));
      }
      return cache.get(value);
    }
  };
  const proxy = new Proxy(target, handler);
  return proxy;
}

const logger = selfish(new Logger());
```

## The new.target Property

`new` is the command that creates instance objects from constructors. ES6 introduced a `new.target` property for the `new` command. It is typically used inside constructors and returns the constructor on which `new` was called. If the constructor was not invoked with `new` or `Reflect.construct()`, `new.target` is `undefined`, so this property can be used to determine how the constructor was called.

```javascript
function Person(name) {
  if (new.target !== undefined) {
    this.name = name;
  } else {
    throw new Error('must use new to create instance');
  }
}

// Alternative
function Person(name) {
  if (new.target === Person) {
    this.name = name;
  } else {
    throw new Error('must use new to create instance');
  }
}

var person = new Person('John'); // Correct
var notAPerson = Person.call(person, 'John');  // Error
```

The code above ensures the constructor can only be called with `new`.

Inside a Class, `new.target` returns the current Class.

```javascript
class Rectangle {
  constructor(length, width) {
    console.log(new.target === Rectangle);
    this.length = length;
    this.width = width;
  }
}

var obj = new Rectangle(3, 4); // output: true
```

Note that when a child class inherits from a parent class, `new.target` returns the child class.

```javascript
class Rectangle {
  constructor(length, width) {
    console.log(new.target === Rectangle);
    // ...
  }
}

class Square extends Rectangle {
  constructor(length, width) {
    super(length, width);
  }
}

var obj = new Square(3); // output: false
```

In the code above, `new.target` returns the child class.

This can be used to write classes that cannot be instantiated directly and must be inherited before use.

```javascript
class Shape {
  constructor() {
    if (new.target === Shape) {
      throw new Error('this class cannot be instantiated');
    }
  }
}

class Rectangle extends Shape {
  constructor(length, width) {
    super();
    // ...
  }
}

var x = new Shape();  // Error
var y = new Rectangle(3, 4);  // Correct
```

In the code above, the `Shape` class cannot be instantiated directly; it can only be used as a base for inheritance.

Note: using `new.target` outside a function throws an error.
