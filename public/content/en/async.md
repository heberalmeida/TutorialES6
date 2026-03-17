# async Function

## Meaning

The ES2017 standard introduces the async function, making asynchronous operations easier to work with.

What is an async function? In short, it is syntactic sugar over Generator functions.

Earlier we had a Generator that reads two files in sequence:

```javascript
const fs = require('fs');

const readFile = function (fileName) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fileName, function(error, data) {
      if (error) return reject(error);
      resolve(data);
    });
  });
};

const gen = function* () {
  const f1 = yield readFile('/etc/fstab');
  const f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

Written as an async function:

```javascript
const asyncReadFile = async function () {
  const f1 = await readFile('/etc/fstab');
  const f2 = await readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

The change is simple: replace `*` with `async` and `yield` with `await`.

Compared to Generators, async functions improve in four ways:

(1) **Built-in executor.** Generator execution needs an executor (e.g., the co module). Async functions execute like normal functions—just call them.

```javascript
asyncReadFile();
```

(2) **Clearer semantics.** `async` and `await` are more descriptive than `*` and `yield`. `async` indicates the function performs async work; `await` indicates the following expression must be awaited.

(3) **Wider applicability.** The co module requires `yield` to be followed by a Thunk or Promise. Async functions allow `await` to be followed by Promises or primitive values (number, string, boolean); primitives are wrapped in immediately resolved Promises.

(4) **Return value is a Promise.** Async functions return a Promise, which is easier to chain than the Iterator returned by Generators.

You can view an async function as a Promise that wraps several async operations; `await` is syntactic sugar for internal `then` calls.

## Basic Usage

Async functions return a Promise. Add callbacks with `then`. When execution hits `await`, the function returns and waits; when the awaited operation completes, execution resumes.

Example:

```javascript
async function getStockPriceByName(name) {
  const symbol = await getStockSymbol(name);
  const stockPrice = await getStockPrice(symbol);
  return stockPrice;
}

getStockPriceByName('goog').then(function (result) {
  console.log(result);
});
```

Another example: print a value after a delay:

```javascript
function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function asyncPrint(value, ms) {
  await timeout(ms);
  console.log(value);
}

asyncPrint('hello world', 50);
```

Because async functions return Promises, they can be used as `await` targets. So the example can also be written as:

```javascript
async function timeout(ms) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function asyncPrint(value, ms) {
  await timeout(ms);
  console.log(value);
}

asyncPrint('hello world', 50);
```

Async functions can be declared in several forms:

```javascript
// Function declaration
async function foo() {}

// Function expression
const foo = async function () {};

// Object method
let obj = { async foo() {} };
obj.foo().then(...)

// Class method
class Storage {
  constructor() {
    this.cachePromise = caches.open('avatars');
  }

  async getAvatar(name) {
    const cache = await this.cachePromise;
    return cache.match(`/avatars/${name}.jpg`);
  }
}

const storage = new Storage();
storage.getAvatar('jake').then(…);

// Arrow function
const foo = async () => {};
```

## Syntax

The rules for async functions are mostly straightforward. The main subtlety is error handling.

### Returning a Promise

Async functions return a Promise. The value of an internal `return` becomes the argument to the `then` callback:

```javascript
async function f() {
  return 'hello world';
}

f().then(v => console.log(v))
// "hello world"
```

If the function throws, the returned Promise is rejected. The error is passed to the `catch` callback:

```javascript
async function f() {
  throw new Error('error');
}

f().then(
  v => console.log('resolve', v),
  e => console.log('reject', e)
)
// reject Error: error
```

### Promise State

The Promise returned by an async function settles only after all internal `await`ed Promises resolve (or after a `return` or thrown error). That is, the async work must finish before `then` runs.

### await Command

Normally, `await` is followed by a Promise. It returns that Promise’s result. If it is not a Promise, the value is returned as-is:

```javascript
async function f() {
  // Same as
  // return 123;
  return await 123;
}

f().then(v => console.log(v))
// 123
```

If `await` is followed by a thenable (object with a `then` method), it is treated like a Promise:

```javascript
class Sleep {
  constructor(timeout) {
    this.timeout = timeout;
  }
  then(resolve, reject) {
    const startTime = Date.now();
    setTimeout(
      () => resolve(Date.now() - startTime),
      this.timeout
    );
  }
}

(async () => {
  const sleepTime = await new Sleep(1000);
  console.log(sleepTime);
})();
// 1000
```

This pattern can be used to implement a simple sleep:

```javascript
function sleep(interval) {
  return new Promise(resolve => {
    setTimeout(resolve, interval);
  })
}

// Usage
async function one2FiveInAsync() {
  for(let i = 1; i <= 5; i++) {
    console.log(i);
    await sleep(1000);
  }
}

one2FiveInAsync();
```

If the awaited Promise rejects, the error is passed to `catch`:

```javascript
async function f() {
  await Promise.reject('error');
}

f()
.then(v => console.log(v))
.catch(e => console.log(e))
// error
```

If one `await` rejects, the function stops. Later `await`s do not run:

```javascript
async function f() {
  await Promise.reject('error');
  await Promise.resolve('hello world'); // Won't execute
}
```

To keep running even when one operation fails, wrap it in `try...catch`:

```javascript
async function f() {
  try {
    await Promise.reject('error');
  } catch(e) {
  }
  return await Promise.resolve('hello world');
}

f()
.then(v => console.log(v))
// hello world
```

Or chain a `catch` on the Promise:

```javascript
async function f() {
  await Promise.reject('error')
    .catch(e => console.log(e));
  return await Promise.resolve('hello world');
}

f()
.then(v => console.log(v))
// error
// hello world
```

### Error Handling

If an error is thrown inside an awaited operation, the async function’s returned Promise is rejected.

Best practice: wrap `await` in `try...catch`, or use `.catch()` on the awaited Promise.

For multiple `await`s, you can wrap them in one `try...catch`.

Example: retry logic:

```javascript
const superagent = require('superagent');
const NUM_RETRIES = 3;

async function test() {
  let i;
  for (i = 0; i < NUM_RETRIES; ++i) {
    try {
      await superagent.get('http://google.com/this-throws-an-error');
      break;
    } catch(err) {}
  }
  console.log(i); // 3
}

test();
```

### Usage Notes

**First:** Since awaited Promises can reject, prefer wrapping `await` in `try...catch` or using `.catch()`.

**Second:** If multiple `await`s do not depend on each other, run them concurrently:

```javascript
// Bad: sequential
let foo = await getFoo();
let bar = await getBar();

// Style 1
let [foo, bar] = await Promise.all([getFoo(), getBar()]);

// Style 2
let fooPromise = getFoo();
let barPromise = getBar();
let foo = await fooPromise;
let bar = await barPromise;
```

**Third:** `await` can only appear inside an async function. Using it in a normal function causes an error.

```javascript
async function dbFuc(db) {
  let docs = [{}, {}, {}];

  // Error
  docs.forEach(function (doc) {
    await db.post(doc);
  });
}
```

Making the callback `async` does not serialize the calls; they run concurrently. Use a `for` loop for sequential execution:

```javascript
async function dbFuc(db) {
  let docs = [{}, {}, {}];

  for (let doc of docs) {
    await db.post(doc);
  }
}
```

Or `reduce`:

```javascript
async function dbFuc(db) {
  let docs = [{}, {}, {}];

  await docs.reduce(async (_, doc) => {
    await _;
    await db.post(doc);
  }, undefined);
}
```

For concurrent execution, use `Promise.all`:

```javascript
async function dbFuc(db) {
  let docs = [{}, {}, {}];
  let promises = docs.map((doc) => db.post(doc));

  let results = await Promise.all(promises);
  console.log(results);
}
```

**Fourth:** Async functions preserve the call stack. When `b()` runs in `await b()`, `a()` is paused but its context remains. Errors from `b()` or `c()` will include `a()` in the stack, unlike callback-based code where the original stack may be gone.

## Implementation

Async functions are implemented by wrapping a Generator and an executor in a single function. Conceptually:

```javascript
async function fn(args) {
  // ...
}

// Same as

function fn(args) {
  return spawn(function* () {
    // ...
  });
}
```

`spawn` is the executor. Its implementation follows the pattern of the earlier Promise-based Generator runner.

## Comparison with Other Async Styles

Promise style: chained `then`/`catch`, verbose.

Generator style: linear flow, but needs an executor and `yield` must be followed by Promises.

Async style: same linear flow, executor built into the language, and `await` can be used with Promises or primitives. Usually the most readable option.

## Example: Sequential Async Operations

Example: read several URLs in sequence and log them in order. With Promises you chain `reduce` and `then`. With async:

```javascript
async function logInOrder(urls) {
  for (const url of urls) {
    const response = await fetch(url);
    console.log(await response.text());
  }
}
```

This is sequential. For concurrent requests with ordered output:

```javascript
async function logInOrder(urls) {
  // Concurrently read remote URLs
  const textPromises = urls.map(async url => {
    const response = await fetch(url);
    return response.text();
  });

  // Output in order
  for (const textPromise of textPromises) {
    console.log(await textPromise);
  }
}
```

## Top-level await

Originally, `await` had to appear inside an async function. From ES2022, [top-level await](https://github.com/tc39/proposal-top-level-await) is allowed in modules, so you can use `await` at module scope.

Top-level await helps with async module loading. A module can wait for async work before exporting values, and consumers can import normally:

```javascript
// awaiting.js
const dynamic = import(someMission);
const data = fetch(url);
export const output = someProcess((await dynamic).default, await data);
```

```javascript
// usage.js
import { output } from "./awaiting.js";
function outputPlusValue(value) { return output + value }

console.log(outputPlusValue(100));
```

Top-level `await` only works in ES modules, not CommonJS.

Examples:

```javascript
// import() method loading
const strings = await import(`/i18n/${navigator.language}`);

// Database operation
const connection = await dbConnector();

// Dependency rollback
let jQuery;
try {
  jQuery = await import('https://cdn-a.com/jQuery');
} catch {
  jQuery = await import('https://cdn-b.com/jQuery');
}
```

When multiple modules use top-level `await`, loading is still synchronous: imports are processed first, then each module runs. Modules that use top-level `await` yield to other loading work until their async operations complete.
