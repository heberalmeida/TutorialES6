# Generator Function Syntax

## Introduction

### Basic Concepts

Generator functions are an asynchronous programming solution provided by ES6. Their syntax and behavior differ significantly from traditional functions. This chapter covers Generator syntax and API in detail; for asynchronous use, see the "Generator Functions for Asynchronous Application" chapter.

Generator functions can be understood from several angles. Syntactically, you can think of a Generator as a state machine that encapsulates multiple internal states.

Calling a Generator function returns an iterator object. So a Generator is both a state machine and an iterator generator. The returned iterator can step through each internal state of the Generator.

In form, a Generator looks like a normal function but has two features: there is an asterisk between the `function` keyword and the function name, and the body uses `yield` expressions to define internal states (`yield` means "produce" in English).

```javascript
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}

var hw = helloWorldGenerator();
```

The code above defines a Generator `helloWorldGenerator` with two `yield` expressions (`hello` and `world`). That gives it three states: hello, world, and the return (end).

Generator functions are called like regular functions (with parentheses after the name). Unlike regular functions, calling a Generator does not run it immediately; it returns a pointer to the internal state—an iterator object.

The next step is to call `next` on the iterator to move to the next state. Each `next` call starts from the beginning or from where the Generator last paused, runs until the next `yield` (or `return`), and then stops. In other words, Generators run in segments; `yield` marks where execution pauses, and `next` resumes it.

```javascript
hw.next()
// { value: 'hello', done: false }

hw.next()
// { value: 'world', done: false }

hw.next()
// { value: 'ending', done: true }

hw.next()
// { value: undefined, done: true }
```

The code above calls `next` four times:

- **First call**: The Generator runs until the first `yield`. The returned object has `value: 'hello'` and `done: false`.
- **Second call**: Execution resumes from the previous `yield` and continues to the next one. Returns `value: 'world'`, `done: false`.
- **Third call**: Runs from the previous `yield` to the `return` (or end). Returns `value: 'ending'`, `done: true`.
- **Fourth call**: The Generator is already finished. Returns `value: undefined`, `done: true`.

In summary: calling a Generator returns an iterator that acts as an internal pointer. Each call to `next` returns an object with `value` and `done`. `value` is the current state (the expression after `yield`); `done` indicates whether iteration has ended.

ES6 does not fix where the asterisk goes; all of these are valid:

```javascript
function * foo(x, y) { ··· }
function *foo(x, y) { ··· }
function* foo(x, y) { ··· }
function*foo(x, y) { ··· }
```

Since Generators are still ordinary functions, the third style (asterisk after `function`) is common. This book uses that style.

### yield Expression

Because the iterator advances only when `next` is called, Generators effectively allow pausable execution. `yield` is the pause marker.

The logic of `next` is:

1. At a `yield`, execution pauses. The expression right after `yield` is used as the returned object's `value`.
2. On the next `next`, execution resumes from that point and runs until the next `yield`.
3. If no further `yield` is reached, execution continues to the `return` (or end). The value of the `return` expression becomes the returned `value`.
4. If there is no `return`, the returned `value` is `undefined`.

Note: the expression after `yield` is evaluated only when the internal pointer reaches that statement (when `next` is called). This gives JavaScript a form of manual "lazy evaluation".

```javascript
function* gen() {
  yield  123 + 456;
}
```

In the code above, `123 + 456` is not evaluated immediately; it is evaluated when `next` moves to that line.

`yield` and `return` both hand back the value of the following expression. The difference: each `yield` pauses the function and later resumes at that point, whereas `return` does not; a function can have multiple `yield`s but only one `return`. Normal functions return a single value; Generators can produce many values (one per `yield`), hence the name "generator".

A Generator without any `yield` is simply a deferred function:

```javascript
function* f() {
  console.log('executed!')
}

var generator = f();

setTimeout(function () {
  generator.next()
}, 2000);
```

If `f` were a normal function, it would run when assigned to `generator`. As a Generator, `f` runs only when `next` is called.

`yield` can only be used inside a Generator. Using it elsewhere causes a syntax error:

```javascript
(function (){
  yield 1;
})()
// SyntaxError: Unexpected number
```

Another example:

```javascript
var arr = [1, [[2, 3], 4], [5, 6]];

var flat = function* (a) {
  a.forEach(function (item) {
    if (typeof item !== 'number') {
      yield* flat(item);
    } else {
      yield item;
    }
  });
};

for (var f of flat(arr)){
  console.log(f);
}
```

This also causes a syntax error: `forEach`’s callback is a normal function, so `yield` inside it is invalid. Use a `for` loop instead:

```javascript
var arr = [1, [[2, 3], 4], [5, 6]];

var flat = function* (a) {
  var length = a.length;
  for (var i = 0; i < length; i++) {
    var item = a[i];
    if (typeof item !== 'number') {
      yield* flat(item);
    } else {
      yield item;
    }
  }
};

for (var f of flat(arr)) {
  console.log(f);
}
// 1, 2, 3, 4, 5, 6
```

If `yield` appears inside another expression, it must be in parentheses:

```javascript
function* demo() {
  console.log('Hello' + yield); // SyntaxError
  console.log('Hello' + yield 123); // SyntaxError

  console.log('Hello' + (yield)); // OK
  console.log('Hello' + (yield 123)); // OK
}
```

When `yield` is used as a function argument or on the right side of an assignment, parentheses are not required:

```javascript
function* demo() {
  foo(yield 'a', yield 'b'); // OK
  let input = yield; // OK
}
```

### Relation to Iterator Interface

Any object’s `Symbol.iterator` method is its iterator generator. Calling it returns an iterator for that object.

Generators are iterator generators, so you can assign a Generator to an object’s `Symbol.iterator` to make it iterable:

```javascript
var myIterable = {};
myIterable[Symbol.iterator] = function* () {
  yield 1;
  yield 2;
  yield 3;
};

[...myIterable] // [1, 2, 3]
```

In the code above, assigning a Generator to `Symbol.iterator` makes `myIterable` iterable and usable with the spread operator.

The object returned by a Generator has a `Symbol.iterator` that returns itself:

```javascript
function* gen(){
  // some code
}

var g = gen();

g[Symbol.iterator]() === g
// true
```

`gen` is a Generator; calling it returns the iterator `g`. Its `Symbol.iterator` is also an iterator generator; invoking it returns `g` itself.

## next Method Parameter

`yield` itself has no return value (or always returns `undefined`). `next` can take one argument; that argument becomes the return value of the previous `yield`.

```javascript
function* f() {
  for(var i = 0; true; i++) {
    var reset = yield i;
    if(reset) { i = -1; }
  }
}

var g = f();

g.next() // { value: 0, done: false }
g.next() // { value: 1, done: false }
g.next(true) // { value: 0, done: false }
```

In the infinite Generator above, if `next` is called without arguments, `reset` at each `yield` is `undefined`. When `next(true)` is called, `reset` becomes `true`, so `i` is set to `-1` and the next loop starts from `-1`.

This is important: it lets you inject values into a Generator from outside, at different stages, and thus adjust its behavior.

Another example:

```javascript
function* foo(x) {
  var y = 2 * (yield (x + 1));
  var z = yield (y / 3);
  return (x + y + z);
}

var a = foo(5);
a.next() // Object{value:6, done:false}
a.next() // Object{value:NaN, done:false}
a.next() // Object{value:NaN, done:true}

var b = foo(5);
b.next() // { value:6, done:false }
b.next(12) // { value:8, done:false }
b.next(13) // { value:42, done:true }
```

When the second `next` is called without an argument, `y` becomes `2 * undefined` (NaN). Without an argument on the third call, `z` is `undefined`, so the final return is `5 + NaN + undefined` = NaN.

When arguments are passed: first `next` returns `x+1` = 6; second `next(12)` sets the previous `yield`’s value to 12, so `y = 24` and the return is `8`; third `next(13)` sets `z = 13`, giving `return 5 + 24 + 13 = 42`.

Note: the first `next` call does not accept an argument (it’s used to start the iterator). V8 ignores the first argument; only the second and later `next` arguments are used.

Here’s an example of feeding values into a Generator via `next`:

```javascript
function* dataConsumer() {
  console.log('Started');
  console.log(`1. ${yield}`);
  console.log(`2. ${yield}`);
  return 'result';
}

let genObj = dataConsumer();
genObj.next();
// Started
genObj.next('a')
// 1. a
genObj.next('b')
// 2. b
```

To accept a value on the first `next` call, wrap the Generator in another function:

```javascript
function wrapper(generatorFunction) {
  return function (...args) {
    let generatorObject = generatorFunction(...args);
    generatorObject.next();
    return generatorObject;
  };
}

const wrapped = wrapper(function* () {
  console.log(`First input: ${yield}`);
  return 'DONE';
});

wrapped().next('hello!')
// First input: hello!
```

## for...of Loop

`for...of` can iterate over the Iterator produced by a Generator without calling `next` manually:

```javascript
function* foo() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
  return 6;
}

for (let v of foo()) {
  console.log(v);
}
// 1 2 3 4 5
```

When the return object’s `done` is `true`, `for...of` stops and does not include that value. So the `6` from `return` is not logged.

Fibonacci example:

```javascript
function* fibonacci() {
  let [prev, curr] = [0, 1];
  for (;;) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

for (let n of fibonacci()) {
  if (n > 1000) break;
  console.log(n);
}
```

You can use a Generator to make any object iterable. Plain objects have no iterator, so you can add one via a Generator:

```javascript
function* objectEntries(obj) {
  let propKeys = Reflect.ownKeys(obj);

  for (let propKey of propKeys) {
    yield [propKey, obj[propKey]];
  }
}

let jane = { first: 'Jane', last: 'Doe' };

for (let [key, value] of objectEntries(jane)) {
  console.log(`${key}: ${value}`);
}
// first: Jane
// last: Doe
```

Alternatively, assign the Generator to `Symbol.iterator`:

```javascript
function* objectEntries() {
  let propKeys = Object.keys(this);

  for (let propKey of propKeys) {
    yield [propKey, this[propKey]];
  }
}

let jane = { first: 'Jane', last: 'Doe' };

jane[Symbol.iterator] = objectEntries;

for (let [key, value] of jane) {
  console.log(`${key}: ${value}`);
}
// first: Jane
// last: Doe
```

Spread, destructuring, and `Array.from` also use the iterator interface, so they work with Generators:

```javascript
function* numbers () {
  yield 1
  yield 2
  return 3
  yield 4
}

// spread operator
[...numbers()] // [1, 2]

// Array.from method
Array.from(numbers()) // [1, 2]

// destructuring assignment
let [x, y] = numbers();
x // 1
y // 2

// for...of loop
for (let n of numbers()) {
  console.log(n)
}
// 1
// 2
```

## Generator.prototype.throw()

The iterator returned by a Generator has a `throw` method that throws an error from outside, which can be caught inside the Generator:

```javascript
var g = function* () {
  try {
    yield;
  } catch (e) {
    console.log('inner catch', e);
  }
};

var i = g();
i.next();

try {
  i.throw('a');
  i.throw('b');
} catch (e) {
  console.log('outer catch', e);
}
// inner catch a
// outer catch b
```

Here, `i` throws two errors. The first is caught by the inner `catch`. The second is not, because that `catch` has already run, so it propagates to the outer `try/catch`.

`throw` can take a parameter passed to the `catch` block. Prefer passing an `Error` instance:

```javascript
var g = function* () {
  try {
    yield;
  } catch (e) {
    console.log(e);
  }
};

var i = g();
i.next();
i.throw(new Error('error!'));
// Error: error! (...)
```

Do not confuse the iterator’s `throw` with the global `throw` statement. The above uses the iterator’s `throw`, which can be caught inside the Generator. The global `throw` is only caught by outer `try/catch`:

```javascript
var g = function* () {
  while (true) {
    try {
      yield;
    } catch (e) {
      if (e != 'a') throw e;
      console.log('inner catch', e);
    }
  }
};

var i = g();
i.next();

try {
  throw new Error('a');
  throw new Error('b');
} catch (e) {
  console.log('outer catch', e);
}
// outer catch [Error: a]
```

If the Generator has no `try/catch`, errors from `throw` are caught by the outer `try/catch`:

```javascript
var g = function* () {
  while (true) {
    yield;
    console.log('inner catch', e);
  }
};

var i = g();
i.next();

try {
  i.throw('a');
  i.throw('b');
} catch (e) {
  console.log('outer catch', e);
}
// outer catch a
```

If there is no `try/catch` anywhere, the program throws and exits:

```javascript
var gen = function* gen(){
  yield console.log('hello');
  yield console.log('world');
}

var g = gen();
g.next();
g.throw();
// hello
// Uncaught undefined
```

For an error to be caught inside, `next` must have been called at least once:

```javascript
function* gen() {
  try {
    yield 1;
  } catch (e) {
    console.log('inner catch');
  }
}

var g = gen();
g.throw(1);
// Uncaught 1
```

`throw` caught inside behaves like one `next`; execution continues to the next `yield`:

```javascript
var gen = function* gen(){
  try {
    yield 1;
  } catch (e) {
    yield 2;
  }
  yield 3;
}

var g = gen();
g.next() // { value:1, done:false }
g.throw() // { value:2, done:false }
g.next() // { value:3, done:false }
g.next() // { value:undefined, done:true }
```

The global `throw` and `g.throw` are independent:

```javascript
var gen = function* gen(){
  yield console.log('hello');
  yield console.log('world');
}

var g = gen();
g.next();

try {
  throw new Error();
} catch (e) {
  g.next();
}
// hello
// world
```

This inside/outside error handling simplifies async flows: multiple `yield`s can share a single `try/catch` instead of repeating error handling in each callback.

Errors thrown inside can be caught outside, and vice versa:

```javascript
function* foo() {
  var x = yield 3;
  var y = x.toUpperCase();
  yield y;
}

var it = foo();

it.next(); // { value:3, done:false }

try {
  it.next(42);
} catch (err) {
  console.log(err);
}
```

If an error is thrown and not caught, the Generator stops. Further `next` calls return `{ value: undefined, done: true }`:

```javascript
function* g() {
  yield 1;
  console.log('throwing an exception');
  throw new Error('generator broke!');
  yield 2;
  yield 3;
}

function log(generator) {
  var v;
  console.log('starting generator');
  try {
    v = generator.next();
    console.log('first next() call', v);
  } catch (err) {
    console.log('catch error', v);
  }
  try {
    v = generator.next();
    console.log('second next() call', v);
  } catch (err) {
    console.log('catch error', v);
  }
  try {
    v = generator.next();
    console.log('third next() call', v);
  } catch (err) {
    console.log('catch error', v);
  }
  console.log('caller done');
}

log(g());
// starting generator
// first next() call { value: 1, done: false }
// throwing an exception
// catch error { value: 1, done: false }
// third next() call { value: undefined, done: true }
// caller done
```

## Generator.prototype.return()

The iterator has a `return()` method that ends iteration and returns a given value:

```javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

var g = gen();

g.next()        // { value: 1, done: false }
g.return('foo') // { value: "foo", done: true }
g.next()        // { value: undefined, done: true }
```

If `return()` is called without an argument, the returned `value` is `undefined`:

```javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

var g = gen();

g.next() // { value: 1, done: false }
g.return() // { value: undefined, done: true }
```

If the Generator is inside a `try...finally`, `return()` runs the `finally` block first, then completes:

```javascript
function* numbers () {
  yield 1;
  try {
    yield 2;
    yield 3;
  } finally {
    yield 4;
    yield 5;
  }
  yield 6;
}
var g = numbers();
g.next() // { value: 1, done: false }
g.next() // { value: 2, done: false }
g.return(7) // { value: 4, done: false }
g.next() // { value: 5, done: false }
g.next() // { value: 7, done: true }
```

## Common Ground of next(), throw(), and return()

`next()`, `throw()`, and `return()` all resume the Generator and replace the `yield` expression with something else:

- `next(value)` replaces `yield` with a value:

```javascript
const g = function* (x, y) {
  let result = yield x + y;
  return result;
};

const gen = g(1, 2);
gen.next(); // Object {value: 3, done: false}

gen.next(1); // Object {value: 1, done: true}
// equivalent to let result = yield x + y
// replace with let result = 1;
```

- `throw(err)` replaces `yield` with `throw err`.
- `return(value)` replaces `yield` with `return value`.

## yield* Expression

To call another Generator from inside a Generator, you must iterate it manually:

```javascript
function* foo() {
  yield 'a';
  yield 'b';
}

function* bar() {
  yield 'x';
  // manually iterate foo()
  for (let i of foo()) {
    console.log(i);
  }
  yield 'y';
}

for (let v of bar()){
  console.log(v);
}
// x
// a
// b
// y
```

ES6 provides `yield*` to delegate to another Generator:

```javascript
function* bar() {
  yield 'x';
  yield* foo();
  yield 'y';
}

// Same as
function* bar() {
  yield 'x';
  yield 'a';
  yield 'b';
  yield 'y';
}

// Same as
function* bar() {
  yield 'x';
  for (let v of foo()) {
    yield v;
  }
  yield 'y';
}

for (let v of bar()){
  console.log(v);
}
// "x"
// "a"
// "b"
// "y"
```

Compare with and without `yield*`:

```javascript
function* inner() {
  yield 'hello!';
}

function* outer1() {
  yield 'open';
  yield inner();
  yield 'close';
}

var gen = outer1()
gen.next().value // "open"
gen.next().value // returns iterator object
gen.next().value // "close"

function* outer2() {
  yield 'open'
  yield* inner()
  yield 'close'
}

var gen = outer2()
gen.next().value // "open"
gen.next().value // "hello!"
gen.next().value // "close"
```

`yield` with a `*` indicates delegation to another iterator. If `yield*` is followed by an array, it iterates the array. Any structure with an Iterator interface can follow `yield*`:

```javascript
function* gen(){
  yield* ["a", "b", "c"];
}

gen().next() // { value:"a", done:false }
```

If the delegated Generator has a `return`, its value can be received:

```javascript
function* foo() {
  yield 2;
  yield 3;
  return "foo";
}

function* bar() {
  yield 1;
  var v = yield* foo();
  console.log("v: " + v);
  yield 4;
}
```

`yield*` is handy for flattening nested arrays:

```javascript
function* iterTree(tree) {
  if (Array.isArray(tree)) {
    for(let i=0; i < tree.length; i++) {
      yield* iterTree(tree[i]);
    }
  } else {
    yield tree;
  }
}
```

## Generator as Object Property

Shorthand for a Generator method:

```javascript
let obj = {
  * myGeneratorMethod() {
    ···
  }
};
```

Equivalent long form:

```javascript
let obj = {
  myGeneratorMethod: function* () {
    // ···
  }
};
```

## this in Generator Functions

Generators return iterators. Per ES6, that iterator is an instance of the Generator and inherits from `prototype`:

```javascript
function* g() {}

g.prototype.hello = function () {
  return 'hi!';
};

let obj = g();

obj instanceof g // true
obj.hello() // 'hi!'
```

But using `g` as a normal constructor does not work: it always returns the iterator, not `this`:

```javascript
function* g() {
  this.a = 11;
}

let obj = g();
obj.next();
obj.a // undefined
```

Generator functions cannot be used with `new`:

```javascript
function* F() {
  yield this.x = 2;
  yield this.y = 3;
}

new F()
// TypeError: F is not a constructor
```

Workaround: bind an object with `call`:

```javascript
function* F() {
  this.a = 1;
  yield this.b = 2;
  yield this.c = 3;
}
var obj = {};
var f = F.call(obj);

f.next();  // Object {value: 2, done: false}
f.next();  // Object {value: 3, done: false}
f.next();  // Object {value: undefined, done: true}

obj.a // 1
obj.b // 2
obj.c // 3
```

Using `F.prototype` instead of `obj` lets the iterator serve as the instance. Wrapping in a constructor enables `new`.

## Meaning

### Generator and State Machines

Generators are ideal for state machines. A ticking clock without a Generator needs external state; with a Generator, state is internal and cleaner.

### Generator and Coroutines

Coroutines are a way to run tasks in a cooperative manner. They can be single- or multi-threaded. In single-threaded form, they are a kind of subroutine with suspension points.

Generator functions are ES6’s way of implementing coroutines, but only partially ("semi-coroutines"): only the caller can resume them.

### Generator and Context

Normal functions push and pop a call stack. Generators can pause and retain their execution context; when resumed with `next`, that context is restored. That’s why local variables and control flow are preserved across `yield`s.

## Applications

Generators pause and yield arbitrary values, which supports several use cases:

### (1) Synchronous-style Async Code

Put async work in `yield`; the logic after `yield` runs when `next` is called, so you avoid callback nesting.

### (2) Control Flow

Generator code can express multi-step workflows in a linear style, with `yield` marking each step. (For truly async flows, use the "Asynchronous Application" chapter or async/await.)

### (3) Deploy Iterator Interface

Use Generators to make any object iterable by implementing `Symbol.iterator` or a helper that yields entries.

### (4) Data Structure

Generators can act as lazy sequences, yielding values on demand, similar to an array-like interface for arbitrary expressions.
