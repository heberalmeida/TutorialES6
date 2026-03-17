# Generator Functions for Asynchronous Application

Asynchronous programming is crucial for JavaScript. The execution environment is single-threaded; without async programming, applications would freeze. This chapter explains how Generator functions can handle asynchronous operations.

## Traditional Methods

Before ES6, asynchronous programming typically used:

- Callback functions
- Event listeners
- Publish/subscribe
- Promise objects

Generator functions brought JavaScript async programming to a new level.

## Basic Concepts

### Asynchronous

"Asynchronous" means a task is not completed in one continuous run. Think of it as split into two parts: run the first part, then switch to other tasks, and when ready, come back and run the second part.

For example, a task might be to read a file and process it. The first part is requesting the OS to read the file. The program then does other work until the OS returns the file, after which it runs the second part (processing). This non-continuous execution is asynchronous.

"Synchronous" means continuous execution: nothing else can run in between, so while the OS reads from disk, the program simply waits.

### Callback Functions

JavaScript implements async programming through callbacks. A callback is the second part of a task written as a function, invoked when the task is ready to continue. "Callback" literally means "call again."

Reading and processing a file looks like this:

```javascript
fs.readFile('/etc/passwd', 'utf-8', function (err, data) {
  if (err) throw err;
  console.log(data);
});
```

The third argument to `readFile` is the callback—the second part of the task. It runs only after the OS returns the file.

Why does Node.js conventionally put an error object `err` as the first argument of callbacks (or `null` if there is no error)?

Because execution is split into two phases. Once the first phase finishes, its execution context is gone. Any error thrown afterward cannot be caught in that context, so it must be passed as a parameter to the second phase.

### Promise

Callbacks themselves are fine; the problem appears with nested callbacks. Suppose you read file A, then file B:

```javascript
fs.readFile(fileA, 'utf-8', function (err, data) {
  fs.readFile(fileB, 'utf-8', function (err, data) {
    // ...
  });
});
```

For more files, nesting grows horizontally and quickly becomes hard to manage. Multiple async operations become tightly coupled; changing one often forces changes in callers and callees. This is often called "callback hell."

Promises address this by turning nested callbacks into chained calls. They are not new syntax but a different pattern. With Promises, chained reads look like:

```javascript
var readFile = require('fs-readfile-promise');

readFile(fileA)
.then(function (data) {
  console.log(data.toString());
})
.then(function () {
  return readFile(fileB);
})
.then(function (data) {
  console.log(data.toString());
})
.catch(function (err) {
  console.log(err);
});
```

The `fs-readfile-promise` module provides a Promise-based `readFile`. Promises use `then` for success and `catch` for errors.

Promises improve clarity: the two phases of async tasks are easier to see. Beyond that, they do not change the model.

The main drawback of Promises is verbosity. The original logic gets wrapped in Promises, so operations end up behind `then`, and the original intent can be obscured.

Is there a better way?

## Generator Functions

### Coroutines

Traditional languages long had solutions for async (or multi-task) programming. One approach is "coroutines"—multiple threads (or functions) cooperating to complete async work.

Coroutines resemble both functions and threads. Rough flow:

- Step 1: Coroutine A starts.
- Step 2: A runs halfway, pauses, and yields control to Coroutine B.
- Step 3: (Later) B yields control back.
- Step 4: A resumes.

Coroutine A here is an async task because it runs in multiple phases.

Example: reading a file in coroutine style:

```javascript
function* asyncJob() {
  // ...other code
  var f = yield readFile(fileA);
  // ...other code
}
```

`asyncJob` is a coroutine. The key is `yield`: it means "pause here and hand control to another coroutine." So `yield` separates the two phases of the async operation.

When a coroutine hits `yield`, it pauses; when control returns, it resumes from that point. The advantage is that the code looks almost like synchronous flow; remove `yield` and it could pass for sync code.

### Coroutines Implemented with Generators

Generator functions are ES6's implementation of coroutines. Their main trait is the ability to yield execution (pause).

A Generator function is a container for an async task. Each place that needs to pause is marked with `yield`. Execution works like this:

```javascript
function* gen(x) {
  var y = yield x + 2;
  return y;
}

var g = gen(1);
g.next() // { value: 3, done: false }
g.next() // { value: undefined, done: true }
```

Calling the Generator returns an internal pointer (an iterator) `g`. Unlike normal functions, it does not return a result; it returns that pointer. Calling `g.next()` advances the pointer (runs the first phase of the async task) until the first `yield`, here `x + 2`.

So `next` runs the Generator in phases. Each call returns an object with `value` and `done`: `value` is the expression after `yield`; `done` indicates whether the Generator has finished.

### Data Exchange and Error Handling in Generators

Generators can pause and resume, which is why they can encapsulate async tasks. They also support data exchange and error handling across the function boundary:

- The `value` of `next`'s return is how the Generator outputs data.
- `next` can take an argument, which becomes the return value of the previous `yield` and thus injects data into the Generator.

```javascript
function* gen(x){
  var y = yield x + 2;
  return y;
}

var g = gen(1);
g.next() // { value: 3, done: false }
g.next(2) // { value: 2, done: true }
```

Here, the first `next` returns `x + 2` = 3. The second `next(2)` passes 2 as the result of the previous async phase, so `y` becomes 2 and the final return is 2.

Generator bodies can use `try/catch` to catch errors thrown from outside (e.g., via the iterator's `throw` method):

```javascript
function* gen(x){
  try {
    var y = yield x + 2;
  } catch (e){
    console.log(e);
  }
  return y;
}

var g = gen(1);
g.next();
g.throw('error');
// error
```

Here, an error thrown from outside with the iterator's `throw` is caught inside. Error and handler can be separated in time and space, which is useful for async flows.

### Encapsulating Async Tasks

Example of a real async task with Generators:

```javascript
var fetch = require('node-fetch');

function* gen(){
  var url = 'https://api.github.com/users/github';
  var result = yield fetch(url);
  console.log(result.bio);
}
```

The Generator encapsulates an async operation: fetch a remote API and parse the result. The code looks almost synchronous except for the `yield`.

To run it:

```javascript
var g = gen();
var result = g.next();

result.value.then(function(data){
  return data.json();
}).then(function(data){
  g.next(data);
});
```

`gen()` returns the iterator. The first `next` runs the first phase. Because `fetch` returns a Promise, you chain `then` to call the next `next` when the request completes.

Generators make async logic compact, but you still need a way to manage the flow (when to run each phase). That is where tools like Thunk and co come in.

## Thunk Function

Thunk functions are one way to run Generator functions automatically.

### Parameter Evaluation Strategy

The idea of Thunk dates to the 1960s.

At the time, language designers debated "evaluation strategy"—when to evaluate function arguments.

```javascript
var x = 1;

function f(m) {
  return m * 2;
}

f(x + 5)
```

Should `x + 5` be evaluated before or when used?

**Call by value**: Evaluate `x + 5` (to 6) before entering the function. C uses this.

```javascript
f(x + 5)
// call-by-value, same as
f(6)
```

**Call by name**: Pass the expression into the function and evaluate only when it is used. Haskell uses this.

```javascript
f(x + 5)
// call-by-name, same as
(x + 5) * 2
```

Each has trade-offs. Call by value is simpler but may evaluate unused arguments. Call by name avoids that but complicates implementation.

```javascript
function f(a, b){
  return b;
}

f(3 * x * x - 2 * x - 1, x);
```

Here the first argument is never used; evaluating it is wasteful. Some prefer call by name for such cases.

### Meaning of Thunk

In call-by-name implementations, parameters are often replaced by a temporary function that the body calls when it needs the value. That temporary function is a Thunk.

```javascript
function f(m) {
  return m * 2;
}

f(x + 5);

// Same as

var thunk = function () {
  return x + 5;
};

function f(thunk) {
  return thunk() * 2;
}
```

The argument `x + 5` is replaced by a function. Where the original argument was used, the Thunk is called. So a Thunk is a way to replace an expression in call-by-name style.

### Thunk in JavaScript

JavaScript uses call by value. Here, Thunk means something else: a function that turns a multi-argument function (with a callback) into a single-argument function that only takes the callback.

```javascript
// normal readFile (multi-arg)
fs.readFile(fileName, callback);

// Thunk readFile (single-arg)
var Thunk = function (fileName) {
  return function (callback) {
    return fs.readFile(fileName, callback);
  };
};

var readFileThunk = Thunk(fileName);
readFileThunk(callback);
```

`fs.readFile` takes a path and a callback. The Thunk version first takes the path and returns a function that only takes the callback. Any function with a callback can be turned into this form. A simple Thunk converter:

```javascript
// ES5 version
var Thunk = function(fn){
  return function (){
    var args = Array.prototype.slice.call(arguments);
    return function (callback){
      args.push(callback);
      return fn.apply(this, args);
    }
  };
};

// ES6 version
const Thunk = function(fn) {
  return function (...args) {
    return function (callback) {
      return fn.call(this, ...args, callback);
    }
  };
};
```

Example for `fs.readFile`:

```javascript
var readFileThunk = Thunk(fs.readFile);
readFileThunk(fileA)(callback);
```

Another example:

```javascript
function f(a, cb) {
  cb(a);
}
const ft = Thunk(f);

ft(1)(console.log) // 1
```

### Thunkify Module

For production, use the Thunkify module.

Install:

```bash
$ npm install thunkify
```

Usage:

```javascript
var thunkify = require('thunkify');
var fs = require('fs');

var read = thunkify(fs.readFile);
read('package.json')(function(err, str){
  // ...
});
```

Thunkify’s source is similar to the simple converter above, with an extra check: the variable `called` ensures the callback runs only once. That matters when the callback is used to resume a Generator.

Example:

```javascript
function f(a, b, callback){
  var sum = a + b;
  callback(sum);
  callback(sum);
}

var ft = thunkify(f);
var print = console.log.bind(console);
ft(1, 2)(print);
// 3
```

### Flow Control for Generators with Thunk

Thunk is useful for automatically running Generator functions.

A Generator can be stepped manually:

```javascript
function* gen() {
  // ...
}

var g = gen();
var res = g.next();

while(!res.done){
  console.log(res.value);
  res = g.next();
}
```

That works for sync steps but not when steps must run in order and some are async. Thunk helps there. Example: a Generator with two async reads:

```javascript
var fs = require('fs');
var thunkify = require('thunkify');
var readFileThunk = thunkify(fs.readFile);

var gen = function* (){
  var r1 = yield readFileThunk('/etc/fstab');
  console.log(r1.toString());
  var r2 = yield readFileThunk('/etc/shells');
  console.log(r2.toString());
};
```

`yield` yields control. We need a way to return control to the Generator—that is what the Thunk’s callback does. Manual execution:

```javascript
var g = gen();

var r1 = g.next();
r1.value(function (err, data) {
  if (err) throw err;
  var r2 = g.next(data);
  r2.value(function (err, data) {
    if (err) throw err;
    g.next(data);
  });
});
```

`g` is the Generator’s internal pointer. `next` advances it and returns the current step’s `value` (a Thunk) and `done`. The pattern is always: pass a callback to `value`; when it runs, call `next` again (and pass data). That can be automated with recursion.

### Automatic Flow Management with Thunk

Here is a Thunk-based runner for Generators:

```javascript
function run(fn) {
  var gen = fn();

  function next(err, data) {
    var result = gen.next(data);
    if (result.done) return;
    result.value(next);
  }

  next();
}

function* g() {
  // ...
}

run(g);
```

`run` starts the Generator and defines `next` as the Thunk callback. `next` advances the Generator, checks `result.done`, and if not done, passes itself to the next Thunk. With this runner, any Generator whose `yield`s produce Thunks can be executed automatically:

```javascript
var g = function* (){
  var f1 = yield readFileThunk('fileA');
  var f2 = yield readFileThunk('fileB');
  // ...
  var fn = yield readFileThunk('fileN');
};

run(g);
```

Thunk is not the only option. Callbacks or Promises can also drive Generators. The important part is having a mechanism that yields control and resumes it when async work completes.

## co Module

### Basic Usage

The [co module](https://github.com/tj/co) by TJ Holowaychuk (June 2013) runs Generator functions automatically.

Example: read two files in sequence:

```javascript
var gen = function* () {
  var f1 = yield readFile('/etc/fstab');
  var f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

co runs the Generator for you:

```javascript
var co = require('co');
co(gen);
```

`co` returns a Promise, so you can add callbacks with `then`:

```javascript
co(gen).then(function (){
  console.log('Generator function finished');
});
```

### How co Works

How does co run Generators automatically?

A Generator is a container for async work. Its auto-runner needs a way to resume it when async work completes. Two approaches:

1. **Callbacks**: Wrap async work in Thunks; the callback calls `next` to resume.
2. **Promises**: Wrap async work in Promises; use `then` to resume.

co supports both. The `yield` expression must be followed by a Thunk or a Promise. Arrays or objects whose members are all Promises are also supported.

The previous section showed the Thunk-based runner. The Promise-based runner is similar:

### Promise-based Auto-run

Wrap `fs.readFile` in a Promise:

```javascript
var fs = require('fs');

var readFile = function (fileName){
  return new Promise(function (resolve, reject){
    fs.readFile(fileName, function(error, data){
      if (error) return reject(error);
      resolve(data);
    });
  });
};

var gen = function* (){
  var f1 = yield readFile('/etc/fstab');
  var f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

Manual execution:

```javascript
var g = gen();

g.next().value.then(function(data){
  g.next(data).value.then(function(data){
    g.next(data);
  });
});
```

`then` chains callbacks. An automatic runner follows the same pattern:

```javascript
function run(gen){
  var g = gen();

  function next(data){
    var result = g.next(data);
    if (result.done) return result.value;
    result.value.then(function(data){
      next(data);
    });
  }

  next();
}

run(gen);
```

As long as the Generator is not done, `next` keeps calling itself.

### co Source

co extends this pattern. Its core logic is short:

1. `co` takes a Generator function and returns a Promise.
2. It checks that the argument is a Generator; if so, it runs it and gets the iterator.
3. It wraps each `next` in an `onFulfilled` to catch errors.
4. The `next` helper advances the iterator; if not done, it ensures the `value` is a Promise, chains `then`, and calls `onFulfilled` again; if the `value` is invalid, it rejects.

### Concurrent Async Operations

co supports concurrent work: yield an array or object of Promises, and it waits for all of them:

```javascript
// array style
co(function* () {
  var res = yield [
    Promise.resolve(1),
    Promise.resolve(2)
  ];
  console.log(res);
}).catch(onerror);

// object style
co(function* () {
  var res = yield {
    1: Promise.resolve(1),
    2: Promise.resolve(2),
  };
  console.log(res);
}).catch(onerror);
```

Another example:

```javascript
co(function* () {
  var values = [n1, n2, n3];
  yield values.map(somethingAsync);
});

function* somethingAsync(x) {
  // do something async
  return y
}
```

### Example: Handling Streams

Node’s Stream API processes data in chunks. It emits:

- `data`: next chunk ready
- `end`: stream finished
- `error`: error

Using `Promise.race()`, you can detect which event fires first. By racing on `data`, `end`, and `error`, you can read all chunks in a loop. The example counts occurrences of "valjean" in a text file:

```javascript
const co = require('co');
const fs = require('fs');

const stream = fs.createReadStream('./les_miserables.txt');
let valjeanCount = 0;

co(function*() {
  while(true) {
    const res = yield Promise.race([
      new Promise(resolve => stream.once('data', resolve)),
      new Promise(resolve => stream.once('end', resolve)),
      new Promise((resolve, reject) => stream.once('error', reject))
    ]);
    if (!res) {
      break;
    }
    stream.removeAllListeners('data');
    stream.removeAllListeners('end');
    stream.removeAllListeners('error');
    valjeanCount += (res.toString().match(/valjean/ig) || []).length;
  }
  console.log('count:', valjeanCount); // count: 1120
});
```
