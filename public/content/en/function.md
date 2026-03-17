# Function Extensions

## Default Values for Function Parameters

### Basic Usage

Before ES6, you could not directly specify default values for function parameters; you had to use workarounds.

```javascript
function log(x, y) {
  y = y || 'World';
  console.log(x, y);
}

log('Hello') // Hello World
log('Hello', 'China') // Hello China
log('Hello', '') // Hello World
```

The code above checks whether the `y` parameter of `log()` is assigned. If not, it uses `World` as the default. The drawback is that if `y` is assigned but its value is falsy, the assignment has no effect—as in the last line above where `y` is an empty string but is replaced by the default.

To avoid this, you typically check whether `y` is assigned before using the default.

```javascript
if (typeof y === 'undefined') {
  y = 'World';
}
```

ES6 allows default values to be written directly in the parameter list.

```javascript
function log(x, y = 'World') {
  console.log(x, y);
}

log('Hello') // Hello World
log('Hello', 'China') // Hello China
log('Hello', '') // Hello
```

The ES6 style is much more concise and natural. Another example:

```javascript
function Point(x = 0, y = 0) {
  this.x = x;
  this.y = y;
}

const p = new Point();
p // { x: 0, y: 0 }
```

Besides brevity, this approach has two benefits: readers can immediately see which parameters are optional without reading the body or docs, and future versions can remove a parameter without breaking existing calls.

Parameters with default values are implicitly declared, so they cannot be redeclared with `let` or `const`.

```javascript
function foo(x = 5) {
  let x = 1; // error
  const x = 2; // error
}
```

Parameters cannot have the same name when defaults are used.

```javascript
// OK
function foo(x, x, y) {
  // ...
}

// Error
function foo(x, x, y = 1) {
  // ...
}
// SyntaxError: Duplicate parameter name not allowed in this context
```

Another subtle point: default values are not evaluated once at definition time. They are re-evaluated each time the default is used.

```javascript
let x = 99;
function foo(p = x + 1) {
  console.log(p);
}

foo() // 100

x = 100;
foo() // 101
```

The default for `p` is `x + 1`. Each call to `foo()` re-evaluates that expression, so `p` is not fixed at 100.

### Combining with Destructuring Default Values

Parameter defaults can be combined with destructuring default values.

```javascript
function foo({x, y = 5}) {
  console.log(x, y);
}

foo({}) // undefined 5
foo({x: 1}) // 1 5
foo({x: 1, y: 2}) // 1 2
foo() // TypeError: Cannot read property 'x' of undefined
```

Here only object destructuring defaults are used, not a function parameter default. `x` and `y` come from destructuring only when `foo()` is called with an object. Calling `foo()` without an argument means no destructuring and an error. A default for the whole parameter avoids that:

```javascript
function foo({x, y = 5} = {}) {
  console.log(x, y);
}

foo() // undefined 5
```

Another example of destructuring defaults:

```javascript
function fetch(url, { body = '', method = 'GET', headers = {} }) {
  console.log(method);
}

fetch('http://example.com', {})
// "GET"

fetch('http://example.com')
// Error
```

If the second argument is an object, you can set defaults for its properties. You cannot omit the second argument unless you add a default for it. That leads to "double defaults":

```javascript
function fetch(url, { body = '', method = 'GET', headers = {} } = {}) {
  console.log(method);
}

fetch('http://example.com')
// "GET"
```

When `fetch` is called without a second argument, the parameter default applies first, then destructuring applies, so `method` ends up as `GET`.

Once parameter defaults are in effect, destructuring still runs:

```javascript
function f({ a, b = 'world' } = { a: 'hello' }) {
  console.log(b);
}

f() // world
```

Here, `f()` is called with no arguments, so the default `{ a: 'hello' }` is used, then that object is destructured, which triggers the default for `b`.

As an exercise, consider the difference between these two styles:

```javascript
// Style 1
function m1({x = 0, y = 0} = {}) {
  return [x, y];
}

// Style 2
function m2({x, y} = { x: 0, y: 0 }) {
  return [x, y];
}

// No arguments
m1() // [0, 0]
m2() // [0, 0]

// x and y both provided
m1({x: 3, y: 8}) // [3, 8]
m2({x: 3, y: 8}) // [3, 8]

// x provided, y not
m1({x: 3}) // [3, 0]
m2({x: 3}) // [3, undefined]

// Neither x nor y provided
m1({}) // [0, 0];
m2({}) // [undefined, undefined]

m1({z: 3}) // [0, 0]
m2({z: 3}) // [undefined, undefined]
```

### Position of Parameters with Defaults

Normally, parameters with defaults should be the last ones, so it’s clear which are omitted. If a non-tail parameter has a default, you cannot omit it without also omitting later parameters.

```javascript
// Example 1
function f(x = 1, y) {
  return [x, y];
}

f() // [1, undefined]
f(2) // [2, undefined]
f(, 1) // Error
f(undefined, 1) // [1, 1]

// Example 2
function f(x, y = 5, z) {
  return [x, y, z];
}

f() // [undefined, 5, undefined]
f(1) // [1, 5, undefined]
f(1, ,2) // Error
f(1, undefined, 2) // [1, 5, 2]
```

To skip a parameter with a default and pass a later one, you must pass `undefined` explicitly.

Passing `undefined` triggers the default; `null` does not.

```javascript
function foo(x = 5, y = 6) {
  console.log(x, y);
}

foo(undefined, null)
// 5 null
```

Here, `x` gets its default because the argument is `undefined`, but `y` stays `null`.

### Function length Property

Once defaults are used, `length` returns the number of parameters that do not have defaults. In other words, `length` no longer reflects the true parameter count.

```javascript
(function (a) {}).length // 1
(function (a = 5) {}).length // 0
(function (a, b, c = 5) {}).length // 2
```

Rest parameters also don’t count toward `length`:

```javascript
(function(...args) {}).length // 0
```

If a parameter with a default is not the last one, `length` also stops counting parameters after it:

```javascript
(function (a = 0, b, c) {}).length // 0
(function (a, b = 1, c) {}).length // 1
```

### Scope

When defaults are used, parameters form their own scope during function initialization. When initialization finishes, this scope disappears. This behavior does not occur without parameter defaults.

```javascript
var x = 1;

function f(x, y = x) {
  console.log(y);
}

f(2) // 2
```

Here, `y` defaults to `x`. The parameters form their own scope; the `x` in the default refers to the parameter, not the global `x`, so the output is `2`.

Another example:

```javascript
let x = 1;

function f(y = x) {
  let x = 2;
  console.log(y);
}

f() // 1
```

When `f()` is called, `y = x` runs in the parameter scope. There is no `x` in that scope, so it uses the outer `x`. The `x` declared inside the body does not affect the default.

If the outer `x` does not exist, an error is thrown:

```javascript
function f(y = x) {
  let x = 2;
  console.log(y);
}

f() // ReferenceError: x is not defined
```

This also throws:

```javascript
var x = 1;

function foo(x = x) {
  // ...
}

foo() // ReferenceError: Cannot access 'x' before initialization
```

The parameter scope has `let x = x`, which triggers the temporal dead zone.

If the default value is a function, its scope follows the same rules:

```javascript
let foo = 'outer';

function bar(func = () => foo) {
  let foo = 'inner';
  console.log(func());
}

bar(); // outer
```

The default for `func` is an anonymous function that returns `foo`. In the parameter scope, `foo` is not defined, so it refers to the outer `foo`, hence the output.

This version throws:

```javascript
function bar(func = () => foo) {
  let foo = 'inner';
  console.log(func());
}

bar() // ReferenceError: foo is not defined
```

The outer scope has no `foo`, so the reference fails.

A more complex example:

```javascript
var x = 1;
function foo(x, y = function() { x = 2; }) {
  var x = 3;
  y();
  console.log(x);
}

foo() // 3
x // 1
```

The parameters form their own scope with `x` and `y`. The anonymous function in `y`'s default refers to the parameter `x`. Inside the body, `var x = 3` declares a different variable; it does not share the parameter scope. So calling `y()` changes the parameter `x`, not the inner one, and the inner `x` remains 3.

If you remove `var` from `var x = 3`, the inner `x` would be the parameter, and the output would be `2`:

```javascript
var x = 1;
function foo(x, y = function() { x = 2; }) {
  x = 3;
  y();
  console.log(x);
}

foo() // 2
x // 1
```

### Use Case

You can enforce that a parameter must be provided by throwing in its default:

```javascript
function throwIfMissing() {
  throw new Error('Missing parameter');
}

function foo(mustBeProvided = throwIfMissing()) {
  return mustBeProvided;
}

foo()
// Error: Missing parameter
```

The default is only evaluated when needed. If the parameter is passed, `throwIfMissing` is not called.

You can also explicitly default to `undefined` to indicate the parameter is optional:

```javascript
function foo(optional = undefined) { ··· }
```

## rest Parameters

ES6 introduces rest parameters (`...variableName`) to collect extra arguments. They replace the need for `arguments`. The variable after `...` is an array of the remaining parameters.

```javascript
function add(...values) {
  let sum = 0;

  for (var val of values) {
    sum += val;
  }

  return sum;
}

add(2, 5, 3) // 10
```

Rest parameters replace `arguments`:

```javascript
// Using arguments
function sortNumbers() {
  return Array.from(arguments).sort();
}

// Using rest parameters
const sortNumbers = (...numbers) => numbers.sort();
```

`arguments` is array-like, not an array, so array methods require `Array.from`. Rest parameters are real arrays. Example: a variant of `push`:

```javascript
function push(array, ...items) {
  items.forEach(function(item) {
    array.push(item);
    console.log(item);
  });
}

var a = [];
push(a, 1, 2, 3)
```

Rest parameters must be last; no other parameters can follow.

```javascript
// Error
function f(a, ...b, c) {
  // ...
}
```

Rest parameters are not counted in `length`:

```javascript
(function(a) {}).length  // 1
(function(...a) {}).length  // 0
(function(a, ...b) {}).length  // 1
```

## Strict Mode

Since ES5, functions can use strict mode internally:

```javascript
function doSomething(a, b) {
  'use strict';
  // code
}
```

ES2016 changes this: if a function uses default parameters, destructuring, or the spread operator in its parameters, it may not explicitly set strict mode or a syntax error occurs.

```javascript
// Error
function doSomething(a, b = a) {
  'use strict';
  // code
}

// Error
const doSomething = function ({a, b}) {
  'use strict';
  // code
};

// Error
const doSomething = (...a) => {
  'use strict';
  // code
};

const obj = {
  // Error
  doSomething({a, b}) {
    'use strict';
    // code
  }
};
```

The reason is that strict mode applies to both the body and parameters, but parameters are evaluated before the body. So the engine would need to know about strict mode before it has parsed the body. To avoid complexity, the spec forbids this combination.

```javascript
// Error
function doSomething(value = 070) {
  'use strict';
  return value;
}
```

Here, `value = 070` uses an octal literal, which is disallowed in strict mode. The parameter would run before the body, making the error hard to enforce.

Two workarounds: use global strict mode:

```javascript
'use strict';

function doSomething(a, b = a) {
  // code
}
```

Or wrap the function in an IIFE:

```javascript
const doSomething = (function () {
  'use strict';
  return function(value = 42) {
    return value;
  };
}());
```

## name Property

The `name` property returns the function’s name:

```javascript
function foo() {}
foo.name // "foo"
```

This was supported in many engines before ES6, but only standardized in ES6.

If an anonymous function is assigned to a variable, ES5 returns an empty string for `name`, ES6 returns the variable name:

```javascript
var f = function () {};

// ES5
f.name // ""

// ES6
f.name // "f"
```

For a named function expression assigned to a variable, both ES5 and ES6 use the original function name:

```javascript
const bar = function baz() {};

// ES5
bar.name // "baz"

// ES6
bar.name // "baz"
```

Functions from `Function` have `name` `"anonymous"`:

```javascript
(new Function).name // "anonymous"
```

Functions returned by `bind` get a `"bound "` prefix:

```javascript
function foo() {};
foo.bind({}).name // "bound foo"

(function(){}).bind({}).name // "bound "
```

## Arrow Functions

### Basic Usage

ES6 allows functions to be defined with the arrow (`=>`) syntax:

```javascript
var f = v => v;

// Equivalent to
var f = function (v) {
  return v;
};
```

For no parameters or multiple parameters, use parentheses:

```javascript
var f = () => 5;
// Equivalent to
var f = function () { return 5 };

var sum = (num1, num2) => num1 + num2;
// Equivalent to
var sum = function(num1, num2) {
  return num1 + num2;
};
```

For more than one statement, use braces and `return`:

```javascript
var sum = (num1, num2) => { return num1 + num2; }
```

To return an object literal directly, wrap it in parentheses:

```javascript
// Error
let getTempItem = id => { id: id, name: "Temp" };

// OK
let getTempItem = id => ({ id: id, name: "Temp" });
```

In the erroneous version, the braces are treated as a block, and the line is parsed as a labeled statement, not an object.

```javascript
let foo = () => { a: 1 };
foo() // undefined
```

To have a single statement that doesn’t return a value:

```javascript
let fn = () => void doesNotReturn();
```

Arrow functions work well with destructuring:

```javascript
const full = ({ first, last }) => first + ' ' + last;

// Equivalent to
function full(person) {
  return person.first + ' ' + person.last;
}
```

They also simplify simple helpers:

```javascript
const isEven = n => n % 2 === 0;
const square = n => n * n;
```

Arrow functions are convenient as callbacks:

```javascript
// Regular function
[1,2,3].map(function (x) {
  return x * x;
});

// Arrow function
[1,2,3].map(x => x * x);
```

Another example:

```javascript
// Regular function
var result = values.sort(function (a, b) {
  return a - b;
});

// Arrow function
var result = values.sort((a, b) => a - b);
```

Rest parameters with arrow functions:

```javascript
const numbers = (...nums) => nums;

numbers(1, 2, 3, 4, 5)
// [1,2,3,4,5]

const headAndTail = (head, ...tail) => [head, tail];

headAndTail(1, 2, 3, 4, 5)
// [1,[2,3,4,5]]
```

### Caveats

1. Arrow functions do not have their own `this` (see below).
2. They cannot be used as constructors with `new`.
3. `arguments` is not available; use rest parameters instead.
4. They cannot use `yield`, so they cannot be generators.

The most important point is that arrow functions do not have their own `this`. For regular functions, `this` is the object the function runs on. For arrow functions, `this` is taken from the enclosing scope at definition time and stays fixed.

```javascript
function foo() {
  setTimeout(() => {
    console.log('id:', this.id);
  }, 100);
}

var id = 21;

foo.call({ id: 42 });
// id: 42
```

With a regular callback, `this` would be the global object after 100ms. The arrow function captures the `this` from `foo`’s call, so it logs `42`.

```javascript
function Timer() {
  this.s1 = 0;
  this.s2 = 0;
  // Arrow function
  setInterval(() => this.s1++, 1000);
  // Regular function
  setInterval(function () {
    this.s2++;
  }, 1000);
}

var timer = new Timer();

setTimeout(() => console.log('s1: ', timer.s1), 3100);
setTimeout(() => console.log('s2: ', timer.s2), 3100);
// s1: 3
// s2: 0
```

The arrow callback binds `this` to `Timer`. The regular callback’s `this` is the global object, so `s2` never changes.

Arrow functions are useful for callbacks that need a fixed `this`:

```javascript
var handler = {
  id: '123456',

  init: function() {
    document.addEventListener('click',
      event => this.doSomething(event.type), false);
  },

  doSomething: function(type) {
    console.log('Handling ' + type  + ' for ' + this.id);
  }
};
```

Babel’s translation of arrow functions makes the behavior clear:

```javascript
// ES6
function foo() {
  setTimeout(() => {
    console.log('id:', this.id);
  }, 100);
}

// ES5
function foo() {
  var _this = this;

  setTimeout(function () {
    console.log('id:', _this.id);
  }, 100);
}
```

Consider how many different `this` values appear in:

```javascript
function foo() {
  return () => {
    return () => {
      return () => {
        console.log('id:', this.id);
      };
    };
  };
}

var f = foo.call({id: 1});

var t1 = f.call({id: 2})()(); // id: 1
var t2 = f().call({id: 3})(); // id: 1
var t3 = f()().call({id: 4}); // id: 1
```

There is only one `this`—the one from `foo`. All inner arrow functions inherit it.

In arrow functions, `arguments`, `super`, and `new.target` also refer to the enclosing scope.

```javascript
function foo() {
  setTimeout(() => {
    console.log('args:', arguments);
  }, 100);
}

foo(2, 4, 6, 8)
// args: [2, 4, 6, 8]
```

Arrow functions ignore `call()`, `apply()`, and `bind()` for `this`:

```javascript
(function() {
  return [
    (() => this.x).bind({ x: 'inner' })()
  ];
}).call({ x: 'outer' });
// ['outer']
```

### Where Not to Use Arrow Functions

Because `this` is fixed in arrow functions, avoid them in these cases.

First: object methods that use `this`:

```javascript
const cat = {
  lives: 9,
  jumps: () => {
    this.lives--;
  }
}
```

Object literals don’t create a scope for `this`, so the arrow function’s `this` is the global object.

```javascript
globalThis.s = 21;

const obj = {
  s: 42,
  m: () => console.log(this.s)
};

obj.m() // 21
```

The arrow function is created in global scope, then assigned to `obj.m`, so its `this` is global. Prefer method shorthand for object methods.

Second: when you need dynamic `this`:

```javascript
var button = document.getElementById('press');
button.addEventListener('click', () => {
  this.classList.toggle('on');
});
```

Here, `this` should be the button. Use a regular function instead.

For complex functions or many side effects, use a regular function for readability.

### Nested Arrow Functions

Arrow functions can be nested:

```javascript
// ES5
function insert(value) {
  return {into: function (array) {
    return {after: function (afterValue) {
      array.splice(array.indexOf(afterValue) + 1, 0, value);
      return array;
    }};
  }};
}

insert(2).into([1, 3]).after(1); //[1, 2, 3]
```

Arrow version:

```javascript
let insert = (value) => ({into: (array) => ({after: (afterValue) => {
  array.splice(array.indexOf(afterValue) + 1, 0, value);
  return array;
}})});

insert(2).into([1, 3]).after(1); //[1, 2, 3]
```

Pipeline example:

```javascript
const pipeline = (...funcs) =>
  val => funcs.reduce((a, b) => b(a), val);

const plus1 = a => a + 1;
const mult2 = a => a * 2;
const addThenMult = pipeline(plus1, mult2);

addThenMult(5)
// 12
```

More explicit form:

```javascript
const plus1 = a => a + 1;
const mult2 = a => a * 2;

mult2(plus1(5))
// 12
```

Arrow functions also map naturally to λ-calculus:

```javascript
// λ-calculus style
fix = λf.(λx.f(λv.x(x)(v)))(λx.f(λv.x(x)(v)))

// ES6
var fix = f => (x => f(v => x(x)(v)))
               (x => f(v => x(x)(v)));
```

## Tail Call Optimization

### What Is a Tail Call?

A tail call is when the last thing a function does is call another function.

```javascript
function f(x){
  return g(x);
}
```

These are not tail calls:

```javascript
// Case 1
function f(x){
  let y = g(x);
  return y;
}

// Case 2
function f(x){
  return g(x) + 1;
}

// Case 3
function f(x){
  g(x);
}
```

Case 3 is equivalent to:

```javascript
function f(x){
  g(x);
  return undefined;
}
```

A tail call need not be literally at the end of the function, just the last operation:

```javascript
function f(x) {
  if (x > 0) {
    return m(x)
  }
  return n(x);
}
```

### Tail Call Optimization

On a tail call, the outer frame can be discarded because its variables are no longer needed. The inner function’s frame replaces it. This reduces stack growth.

```javascript
function f() {
  let m = 1;
  let n = 2;
  return g(m + n);
}
f();

// Equivalent to
function f() {
  return g(3);
}
f();

// Equivalent to
g(3);
```

Optimization happens only when the inner call does not use the outer function’s variables:

```javascript
function addOne(a){
  var one = 1;
  function inner(b){
    return b + one;
  }
  return inner(a);
}
```

Here, `inner` uses `one`, so the outer frame cannot be removed.

Note: Only Safari currently implements tail call optimization; Chrome and Firefox do not.

### Tail Recursion

When a function calls itself in tail position, it is tail recursive. Tail recursion can be optimized to avoid stack overflow:

```javascript
function factorial(n) {
  if (n === 1) return 1;
  return n * factorial(n - 1);
}

factorial(5) // 120
```

This version keeps up to `n` frames on the stack. A tail-recursive version keeps at most one:

```javascript
function factorial(n, total) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}

factorial(5, 1) // 120
```

Fibonacci example—non–tail-recursive:

```javascript
function Fibonacci (n) {
  if ( n <= 1 ) {return 1};

  return Fibonacci(n - 1) + Fibonacci(n - 2);
}

Fibonacci(10) // 89
Fibonacci(100) // timeout
Fibonacci(500) // timeout
```

Tail-recursive version:

```javascript
function Fibonacci2 (n , ac1 = 1 , ac2 = 1) {
  if( n <= 1 ) {return ac2};

  return Fibonacci2 (n - 1, ac2, ac1 + ac2);
}

Fibonacci2(100) // 573147844013817200000
Fibonacci2(1000) // 7.0330367711422765e+208
Fibonacci2(10000) // Infinity
```

### Rewriting Recursive Functions

Tail recursion often requires passing extra state as parameters. To keep a simple API, wrap the tail-recursive function:

```javascript
function tailFactorial(n, total) {
  if (n === 1) return total;
  return tailFactorial(n - 1, n * total);
}

function factorial(n) {
  return tailFactorial(n, 1);
}

factorial(5) // 120
```

Using currying:

```javascript
function currying(fn, n) {
  return function (m) {
    return fn.call(this, m, n);
  };
}

function tailFactorial(n, total) {
  if (n === 1) return total;
  return tailFactorial(n - 1, n * total);
}

const factorial = currying(tailFactorial, 1);

factorial(5) // 120
```

Or default parameters:

```javascript
function factorial(n, total = 1) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}

factorial(5) // 120
```

### Strict Mode

Tail call optimization in ES6 is only enabled in strict mode.

In sloppy mode, `func.arguments` and `func.caller` track the call stack. Tail optimization can invalidate them, so it is disabled outside strict mode.

```javascript
function restricted() {
  'use strict';
  restricted.caller;    // Error
  restricted.arguments; // Error
}
restricted();
```

### Implementing Tail Recursion Optimization

You can simulate tail recursion with a trampoline:

```javascript
function sum(x, y) {
  if (y > 0) {
    return sum(x + 1, y - 1);
  } else {
    return x;
  }
}

sum(1, 100000)
// Uncaught RangeError: Maximum call stack size exceeded(…)
```

Trampoline version:

```javascript
function trampoline(f) {
  while (f && f instanceof Function) {
    f = f();
  }
  return f;
}

function sum(x, y) {
  if (y > 0) {
    return sum.bind(null, x + 1, y - 1);
  } else {
    return x;
  }
}

trampoline(sum(1, 100000))
// 100001
```

A full TCO-style implementation:

```javascript
function tco(f) {
  var value;
  var active = false;
  var accumulated = [];

  return function accumulator() {
    accumulated.push(arguments);
    if (!active) {
      active = true;
      while (accumulated.length) {
        value = f.apply(this, accumulated.shift());
      }
      active = false;
      return value;
    }
  };
}

var sum = tco(function(x, y) {
  if (y > 0) {
    return sum(x + 1, y - 1)
  }
  else {
    return x
  }
});

sum(1, 100000)
// 100001
```

## Trailing Commas in Function Parameters

ES2017 [allows](https://github.com/jeffmo/es-trailing-function-commas) a trailing comma after the last parameter.

```javascript
function clownsEverywhere(
  param1,
  param2
) { /* ... */ }

clownsEverywhere(
  'foo',
  'bar'
);
```

Previously, a comma after the last parameter caused a syntax error. Trailing commas make diffs cleaner when adding parameters.

```javascript
function clownsEverywhere(
  param1,
  param2,
) { /* ... */ }

clownsEverywhere(
  'foo',
  'bar',
);
```

This aligns function parameters with arrays and objects.

## Function.prototype.toString()

[ES2019](https://github.com/tc39/Function-prototype-toString-revision) changes how `toString()` works on functions.

`toString()` must return the function’s source text, including comments and whitespace.

```javascript
function /* foo comment */ foo () {}

foo.toString()
// "function /* foo comment */ foo () {}"
```

## Optional catch Binding

Previously, `catch` required a parameter for the error object.

```javascript
try {
  // ...
} catch (err) {
  // handle error
}
```

[ES2019](https://github.com/tc39/proposal-optional-catch-binding) allows omitting the parameter when it is not used:

```javascript
try {
  // ...
} catch {
  // ...
}
```
