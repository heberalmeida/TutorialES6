# let and const Commands

## let Command

### Basic Usage

ES6 adds the `let` command for declaring variables. Its usage is similar to `var`, but variables declared with `let` are only valid within the block where the `let` command appears.

```javascript
{
  let a = 10;
  var b = 1;
}

a // ReferenceError: a is not defined.
b // 1
```

In the code above, two variables are declared with `let` and `var` inside a block. When they are accessed outside the block, the variable declared with `let` throws an error, while the one declared with `var` returns the correct value. This shows that variables declared with `let` are only valid in their block.

The loop counter in a `for` loop is well-suited for `let`.

```javascript
for (let i = 0; i < 10; i++) {
  // ...
}

console.log(i);
// ReferenceError: i is not defined
```

In the code above, the counter `i` is only valid inside the `for` loop body; referencing it outside throws an error.

If `var` were used in the following code, the output would be `10`.

```javascript
var a = [];
for (var i = 0; i < 10; i++) {
  a[i] = function () {
    console.log(i);
  };
}
a[6](); // 10
```

Here, `i` is declared with `var`, so it is valid in the global scope and there is only one `i`. Each loop iteration changes `i`, and the `console.log(i)` inside the functions assigned to array `a` refers to this global `i`. In other words, all members of array `a` use the same `i`, so at runtime they output the value of `i` from the last iteration, which is 10.

With `let`, the variable is only valid in the block scope, so the output is 6.

```javascript
var a = [];
for (let i = 0; i < 10; i++) {
  a[i] = function () {
    console.log(i);
  };
}
a[6](); // 6
```

Here, `i` is declared with `let`, so the current `i` is only valid for that iteration. Each loop effectively creates a new `i`, hence the output is `6`. You might wonder: if `i` is re-declared each iteration, how does it know the previous value to compute the current one? The JavaScript engine internally remembers the previous iteration’s value and uses it when initializing the current `i`.

Another detail of `for` loops: the part that sets the loop variable is in a parent scope, while the loop body is in a separate child scope.

```javascript
for (let i = 0; i < 3; i++) {
  let i = 'abc';
  console.log(i);
}
// abc
// abc
// abc
```

The code above runs correctly and outputs `abc` three times. This shows that the inner `i` and the loop variable `i` are in different scopes (within the same scope, you cannot declare the same variable twice with `let`).

### No Variable Hoisting

With `var`, “variable hoisting” occurs: a variable can be used before its declaration, with value `undefined`. This behavior is somewhat odd; typically, a variable should only be usable after its declaration.

To fix this, `let` changes the behavior: variables declared with `let` must be used only after their declaration, otherwise an error is thrown.

```javascript
// var case
console.log(foo); // outputundefined
var foo = 2;

// let case
console.log(bar); // ErrorReferenceError
let bar = 2;
```

With `var`, hoisting occurs: when the script runs, `foo` exists but has no value yet, so `undefined` is printed. With `let`, there is no hoisting. Before its declaration, `bar` does not exist; using it throws an error.

### Temporal Dead Zone

As long as a block contains a `let` declaration, that variable is “bound” to that block and is not affected by outer scopes.

```javascript
var tmp = 123;

if (true) {
  tmp = 'abc'; // ReferenceError
  let tmp;
}
```

There is a global `tmp`, but inside the block `let` declares a local `tmp`. The local one is bound to that block, so assigning to `tmp` before its `let` declaration throws an error.

ES6 specifies that if a block contains `let` or `const`, that block forms a closed scope for those variables from the start. Using them before their declaration throws an error.

In other words, within a block, variables declared with `let` are unavailable until their declaration. This is called the “temporal dead zone” (TDZ).

```javascript
if (true) {
  // TDZ starts
  tmp = 'abc'; // ReferenceError
  console.log(tmp); // ReferenceError

  let tmp; // TDZ ends
  console.log(tmp); // undefined

  tmp = 123;
  console.log(tmp); // 123
}
```

In the code above, everything before the `let` declaration of `tmp` is the variable’s “dead zone.”

The temporal dead zone also means `typeof` is no longer always safe.

```javascript
typeof x; // ReferenceError
let x;
```

`x` is declared with `let`, so before its declaration it is in the dead zone and any use throws an error. Hence `typeof` throws `ReferenceError`.

In contrast, if a variable is never declared, `typeof` does not throw:

```javascript
typeof undeclared_variable // "undefined"
```

Here, `undeclared_variable` does not exist, and the result is `"undefined"`. Before `let`, `typeof` was always safe. That no longer holds, by design, to encourage declaring variables before use.

Some dead zones are subtle:

```javascript
function bar(x = y, y = 2) {
  return [x, y];
}

bar(); // Error
```

Calling `bar` throws because the default value of parameter `x` is the other parameter `y`, which is not yet declared and is in the dead zone. If `y`’s default were `x`, it would be fine, since `x` is already declared:

```javascript
function bar(x = 2, y = x) {
  return [x, y];
}
bar(); // [2, 2]
```

The following also throws, unlike with `var`:

```javascript
// OK
var x = x;

// Error
let x = x;
// ReferenceError: x is not defined
```

This fails because of the temporal dead zone. With `let`, using the variable before its declaration is complete throws an error. Here, we try to read `x` before its declaration has finished executing.

ES6 introduces the temporal dead zone and the fact that `let` and `const` are not hoisted mainly to reduce runtime errors and prevent using variables before they are declared. Such mistakes were common in ES5; with these rules, they are easier to avoid.

In short, the temporal dead zone means that as soon as you enter the current scope, the variable exists but cannot be accessed until the line where it is declared.

### No Duplicate Declarations

`let` does not allow the same variable to be declared more than once in the same scope.

```javascript
// Error
function func() {
  let a = 10;
  var a = 1;
}

// Error
function func() {
  let a = 10;
  let a = 1;
}
```

You also cannot re-declare function parameters inside the function:

```javascript
function func(arg) {
  let arg;
}
func() // Error

function func(arg) {
  {
    let arg;
  }
}
func() // OK
```

## Block Scope

### Why Block Scope?

ES5 has only global and function scope, no block scope, which leads to many awkward situations.

First, inner variables can shadow outer ones:

```javascript
var tmp = new Date();

function f() {
  console.log(tmp);
  if (false) {
    var tmp = 'hello world';
  }
}

f(); // undefined
```

The intent was to use the outer `tmp` outside the `if` and the inner `tmp` inside. But because of hoisting, the inner `tmp` shadows the outer one, and the output is `undefined`.

Second, loop counters leak into the global scope:

```javascript
var s = 'hello';

for (var i = 0; i < s.length; i++) {
  console.log(s[i]);
}

console.log(i); // 5
```

Here, `i` is only for the loop, but after the loop it still exists as a global variable.

### Block Scope in ES6

`let` effectively adds block scope to JavaScript.

```javascript
function f1() {
  let n = 5;
  if (true) {
    let n = 10;
  }
  console.log(n); // 5
}
```

This function has two blocks, both declaring `n`. The output is 5, so the inner block does not affect the outer. If both used `var`, the output would be 10.

ES6 allows arbitrarily nested block scopes:

```javascript
{{{{
  {let insane = 'Hello World'}
  console.log(insane); // Error
}}}};
```

There are five levels of block scope, each separate. The fourth level cannot read the inner variable of the fifth.

Inner scopes can define variables with the same name as outer ones:

```javascript
{{{{
  let insane = 'Hello World';
  {let insane = 'Hello World'}
}}}};
```

With block scope, the widely used anonymous IIFE is often no longer needed:

```javascript
// IIFE style
(function () {
  var tmp = ...;
  ...
}());

// block scope style
{
  let tmp = ...;
  ...
}
```

### Block Scope and Function Declarations

Can functions be declared inside block scope? This is a confusing question.

ES5 says functions can only be declared at the top level or inside function scope, not in block scope:

```javascript
// Case 1
if (true) {
  function f() {}
}

// Case 2
try {
  function f() {}
} catch(e) {
  // ...
}
```

Under ES5, both of these are illegal.

Browsers, however, did not follow this rule and still allowed function declarations in block scope for compatibility, so both actually run without error.

ES6 introduces block scope and explicitly allows function declarations in blocks. In ES6, function declarations in block scope behave like `let` and are not accessible outside the block.

```javascript
function f() { console.log('I am outside!'); }

(function () {
  if (false) {
    // redeclare function f
    function f() { console.log('I am inside!'); }
  }

  f();
}());
```

In ES5, this prints "I am inside!" because the function `f` declared in the `if` is hoisted to the top of the function. In effect:

```javascript
// ES5 environment
function f() { console.log('I am outside!'); }

(function () {
  function f() { console.log('I am inside!'); }
  if (false) {
  }
  f();
}());
```

In ES6 it should behave differently and print "I am outside!", because the function in the block would behave like `let`. However, in real ES6 browsers, the code above throws an error. Why?

```javascript
// Browser ES6 environment
function f() { console.log('I am outside!'); }

(function () {
  if (false) {
    // redeclare function f
    function f() { console.log('I am inside!'); }
  }

  f();
}());
// Uncaught TypeError: f is not a function
```

To reduce breaking changes, ES6 [Annex B](https://www.ecma-international.org/ecma-262/6.0/index.html#sec-block-level-function-declarations-web-legacy-compatibility-semantics) allows browser implementations to diverge. They can [behave differently](https://stackoverflow.com/questions/31419897/what-are-the-precise-semantics-of-block-level-functions-in-es6):

- Allow function declarations in block scope.
- Treat them like `var`, i.e. hoist to global or function scope.
- Also hoist them to the top of their block.

These rules apply only to ES6 browser implementations; other environments may treat block-scoped function declarations like `let`.

Under these rules, in browser ES6, functions declared in blocks behave like variables declared with `var`. The example effectively runs as:

```javascript
// Browser ES6 environment
function f() { console.log('I am outside!'); }
(function () {
  var f = undefined;
  if (false) {
    function f() { console.log('I am inside!'); }
  }

  f();
}());
// Uncaught TypeError: f is not a function
```

Because behavior differs across environments, avoid declaring functions inside block scope. If needed, use function expressions instead:

```javascript
// Avoid function declarations inside block scope
{
  let a = 'secret';
  function f() {
    return a;
  }
}

// Prefer function expressions inside block scope
{
  let a = 'secret';
  let f = function () {
    return a;
  };
}
```

Note: ES6 block scope must have braces. Without them, the engine does not treat it as block scope:

```javascript
// style 1, Error
if (true) let x = 1;

// Style 2, OK
if (true) {
  let x = 1;
}
```

Without braces there is no block scope, and `let` can only appear at the top level of the current scope, so it throws. With braces, the block exists.

Function declarations follow the same rule: in strict mode, functions can only be declared at the top of the current scope:

```javascript
// OK
'use strict';
if (true) {
  function f() {}
}

// Error
'use strict';
if (true)
  function f() {}
```

## const Command

### Basic Usage

`const` declares a read-only constant. Once declared, the value cannot change.

```javascript
const PI = 3.1415;
PI // 3.1415

PI = 3;
// TypeError: Assignment to constant variable.
```

Changing the value throws an error.

`const` must be initialized at declaration; you cannot assign later:

```javascript
const foo;
// SyntaxError: Missing initializer in const declaration
```

`const` has the same scope as `let`: only within the block where it is declared.

```javascript
if (true) {
  const MAX = 5;
}

MAX // Uncaught ReferenceError: MAX is not defined
```

`const` is also not hoisted and has a temporal dead zone; it can only be used after its declaration:

```javascript
if (true) {
  console.log(MAX); // ReferenceError
  const MAX = 5;
}
```

`const` also cannot be re-declared:

```javascript
var message = "Hello!";
let age = 25;

// Both lines below error
const message = "Goodbye!";
const age = 30;
```

### Essence

`const` does not guarantee that the value itself is immutable, but that the data at the memory address the variable points to cannot change. For primitive types (number, string, boolean), the value is stored at that address, so it acts as a true constant. For composite types (objects and arrays), the address holds a pointer to the actual data. `const` only ensures the pointer is fixed; the underlying structure can still be mutated. Be careful when declaring objects as constants.

```javascript
const foo = {};

// add property to foo, succeeds
foo.prop = 123;
foo.prop // 123

// Point foo to another object, errors
foo = {}; // TypeError: "foo" is read-only
```

The constant `foo` holds an address to an object. Only the address is fixed; you cannot reassign `foo`, but the object can be modified.

```javascript
const a = [];
a.push('Hello'); // executable
a.length = 0;    // executable
a = ['Dave'];    // Error
```

`a` is an array and the array can be mutated, but assigning another array to `a` throws.

To truly freeze an object, use `Object.freeze`:

```javascript
const foo = Object.freeze({});

// In sloppy mode, next line has no effect;
// In strict mode, that line errors
foo.prop = 123;
```

Here, `foo` points to a frozen object, so adding properties has no effect, and in strict mode it throws.

To freeze an object deeply, freeze its properties as well:

```javascript
var constantize = (obj) => {
  Object.freeze(obj);
  Object.keys(obj).forEach( (key, i) => {
    if ( typeof obj[key] === 'object' ) {
      constantize( obj[key] );
    }
  });
};
```

### Six Ways to Declare Variables in ES6

ES5 had only `var` and `function`. ES6 adds `let` and `const`, and later chapters cover `import` and `class`. So ES6 has six ways to declare variables.

## Top-Level Object Properties

The top-level object is `window` in the browser and `global` in Node. In ES5, its properties were equivalent to global variables.

```javascript
window.a = 1;
a // 1

a = 2;
window.a // 2
```

Assigning to a top-level property was the same as assigning to a global variable.

This design was considered one of JavaScript’s major flaws. It meant: variable undeclaration could not be detected at compile time, only at runtime; it was easy to accidentally create globals; and top-level properties could be read and written anywhere, harming modularity. Also, `window` has a concrete meaning (the browser window), so using it as the top-level object was inappropriate.

ES6 changes this: for compatibility, `var` and `function` globals still become top-level properties, but `let`, `const`, and `class` globals do not. Global variables are gradually decoupled from the top-level object.

```javascript
var a = 1;
// In Node REPL, can use global.a
// Or use this.a
window.a // 1

let b = 1;
window.b // undefined
```

`a` is declared with `var`, so it is a top-level property; `b` is declared with `let`, so it is not, and `window.b` is `undefined`.

## The globalThis Object

JavaScript has a top-level object that provides the global environment (global scope). All code runs in this environment, but the top-level object differs across implementations:

- In the browser it is `window`, but Node and Web Worker do not have `window`.
- In the browser and Web Worker, `self` also refers to the top-level object, but Node does not have `self`.
- In Node it is `global`, which is not available elsewhere.

To get the top-level object in any environment, people often use `this`, but it has limitations:

- In the global environment, `this` is the top-level object. But in Node.js modules `this` is the current module, and in ES6 modules `this` is `undefined`.
- In a function, if it is called as a plain function (not as a method), `this` may be the top-level object. In strict mode, it is `undefined`.
- In both strict and non-strict mode, `new Function('return this')()` returns the global object. However, with CSP (Content Security Policy), `eval` and `new Function` may be disabled.

There was no reliable way to get the top-level object in all cases. Here are two workarounds:

```javascript
// Method 1
(typeof window !== 'undefined'
   ? window
   : (typeof process === 'object' &&
      typeof require === 'function' &&
      typeof global === 'object')
     ? global
     : this);

// Method 2
var getGlobal = function () {
  if (typeof self !== 'undefined') { return self; }
  if (typeof window !== 'undefined') { return window; }
  if (typeof global !== 'undefined') { return global; }
  throw new Error('unable to locate global object');
};
```

[ES2020](https://github.com/tc39/proposal-global) introduces `globalThis` as the standard way to access the top-level object. In any environment, `globalThis` exists and refers to the global `this`.

The polyfill [`global-this`](https://github.com/ungap/global-this) implements this proposal so you can use `globalThis` in all environments.
