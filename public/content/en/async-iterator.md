# Async Iterator

## Problem with the synchronous iterator

As covered in the Iterator chapter, the Iterator interface is a protocol for traversing data. Calling the `next` method of an iterator object returns an object that represents information about the current position of the traversal pointer. The structure of the object returned by `next` is `{value, done}`, where `value` is the current value and `done` is a boolean indicating whether traversal has ended.

```javascript
function idMaker() {
  let index = 0;

  return {
    next: function() {
      return { value: index++, done: false };
    }
  };
}

const it = idMaker();

it.next().value // 0
it.next().value // 1
it.next().value // 2
// ...
```

In the code above, `it` is an iterator. Each call to `it.next()` returns an object with information about the current position.

An implicit rule is that `it.next()` must be synchronous: a call must immediately return a value. In other words, once `it.next()` is invoked, `value` and `done` must be available synchronously. That works when the pointer targets a synchronous operation, but not for asynchronous ones.

```javascript
function idMaker() {
  let index = 0;

  return {
    next: function() {
      return new Promise(function (resolve, reject) {
        setTimeout(() => {
          resolve({ value: index++, done: false });
        }, 1000);
      });
    }
  };
}
```

In the code above, `next()` returns a Promise. That violates the Iterator protocol, which requires synchronous behavior. Any asynchronous operation inside is disallowed.

A common workaround is to wrap the async operation in a Thunk or a Promise so that the `value` in the return object is a Thunk or Promise that eventually yields the real value, while `done` is produced synchronously.

```javascript
function idMaker() {
  let index = 0;

  return {
    next: function() {
      return {
        value: new Promise(resolve => setTimeout(() => resolve(index++), 1000)),
        done: false
      };
    }
  };
}

const it = idMaker();

it.next().value.then(o => console.log(o)) // 0
it.next().value.then(o => console.log(o)) // 1
it.next().value.then(o => console.log(o)) // 2
// ...
```

Here, `value` is a Promise that holds the async result. This approach is cumbersome and less intuitive.

ES2018 [introduced](https://github.com/tc39/proposal-async-iteration) the async iterator, providing a native iterator interface for async operations where both `value` and `done` are produced asynchronously.

## Async iterator interface

The main syntactic feature of the async iterator is that calling `next` returns a Promise.

```javascript
asyncIterator
  .next()
  .then(
    ({ value, done }) => /* ... */
  );
```

Here, `asyncIterator` is an async iterator. Calling `next` returns a Promise, so `.then()` can specify a callback that runs when the Promise resolves. The callback receives an object with `value` and `done`, same as the sync iterator.

An object’s sync iterator is on `Symbol.iterator`. Similarly, the async iterator is on `Symbol.asyncIterator`. Any object with a `Symbol.asyncIterator` value is intended to be traversed asynchronously.

Example of an async iterator:

```javascript
const asyncIterable = createAsyncIterable(['a', 'b']);
const asyncIterator = asyncIterable[Symbol.asyncIterator]();

asyncIterator
.next()
.then(iterResult1 => {
  console.log(iterResult1); // { value: 'a', done: false }
  return asyncIterator.next();
})
.then(iterResult2 => {
  console.log(iterResult2); // { value: 'b', done: false }
  return asyncIterator.next();
})
.then(iterResult3 => {
  console.log(iterResult3); // { value: undefined, done: true }
});
```

The async iterator yields twice: first it returns a Promise; when that Promise resolves, it returns an object with the current item and status. So its behavior matches the sync iterator; it just interposes a Promise.

Because `next` returns a Promise, it can be used with `await`:

```javascript
async function f() {
  const asyncIterable = createAsyncIterable(['a', 'b']);
  const asyncIterator = asyncIterable[Symbol.asyncIterator]();
  console.log(await asyncIterator.next());
  // { value: 'a', done: false }
  console.log(await asyncIterator.next());
  // { value: 'b', done: false }
  console.log(await asyncIterator.next());
  // { value: undefined, done: true }
}
```

With `await`, you don’t need `.then()`. The flow is close to synchronous code.

You can call `next` multiple times without waiting for the previous Promise to resolve. In that case, calls are queued and run in order. Example with `Promise.all`:

```javascript
const asyncIterable = createAsyncIterable(['a', 'b']);
const asyncIterator = asyncIterable[Symbol.asyncIterator]();
const [{value: v1}, {value: v2}] = await Promise.all([
  asyncIterator.next(), asyncIterator.next()
]);

console.log(v1, v2); // a b
```

You can also call all `next` calls up front and `await` the last one:

```javascript
async function runner() {
  const writer = openFile('someFile.txt');
  writer.next('hello');
  writer.next('world');
  await writer.return();
}

runner();
```

## for await...of

`for...of` loops over the sync Iterator interface. The new `for await...of` loop does the same for async iterators:

```javascript
async function f() {
  for await (const x of createAsyncIterable(['a', 'b'])) {
    console.log(x);
  }
}
// a
// b
```

`createAsyncIterable()` returns an object with an async iterator. The loop calls its `next` method and gets a Promise; `await` handles that Promise, and when it resolves, the value is assigned to `x`.

A typical use of `for await...of` is with async iterable streams:

```javascript
let body = '';

async function f() {
  for await(const data of req) body += data;
  const parsed = JSON.parse(body);
  console.log('got', parsed);
}
```

`req` is an async iterable that reads data asynchronously. With `for await...of`, the logic stays concise.

If the Promise returned by `next` rejects, `for await...of` throws; use `try...catch` to handle it:

```javascript
async function () {
  try {
    for await (const x of createRejectingIterable()) {
      console.log(x);
    }
  } catch (e) {
    console.error(e);
  }
}
```

`for await...of` can also be used with sync iterators:

```javascript
(async function () {
  for await (const x of ['a', 'b']) {
    console.log(x);
  }
})();
// a
// b
```

Node v10 supports async iterators; Stream implements this interface. Here is the traditional way vs. async iterator to read a file:

```javascript
// Traditional style
function main(inputFilePath) {
  const readStream = fs.createReadStream(
    inputFilePath,
    { encoding: 'utf8', highWaterMark: 1024 }
  );
  readStream.on('data', (chunk) => {
    console.log('>>> '+chunk);
  });
  readStream.on('end', () => {
    console.log('### DONE ###');
  });
}

// Async iterator style
async function main(inputFilePath) {
  const readStream = fs.createReadStream(
    inputFilePath,
    { encoding: 'utf8', highWaterMark: 1024 }
  );

  for await (const chunk of readStream) {
    console.log('>>> '+chunk);
  }
  console.log('### DONE ###');
}
```

## Async Generator functions

Sync Generator functions return sync iterator objects. Async Generator functions return async iterator objects.

Syntactically, an async Generator is the combination of an `async` function and a Generator function:

```javascript
async function* gen() {
  yield 'hello';
}
const genObj = gen();
genObj.next().then(x => console.log(x));
// { value: 'hello', done: false }
```

`gen` is an async Generator. Calling it returns an async iterator; calling `next` on that returns a Promise.

One goal of async iterators is to allow the same interface for both sync and async Generators:

```javascript
// Sync Generator function
function* map(iterable, func) {
  const iter = iterable[Symbol.iterator]();
  while (true) {
    const {value, done} = iter.next();
    if (done) break;
    yield func(value);
  }
}

// Async Generator function
async function* map(iterable, func) {
  const iter = iterable[Symbol.asyncIterator]();
  while (true) {
    const {value, done} = await iter.next();
    if (done) break;
    yield func(value);
  }
}
```

Both versions of `map` take an iterable and a callback, and apply the callback to each value. The sync version uses `Symbol.iterator`; the async version uses `Symbol.asyncIterator` and `await iter.next()`.

Another example:

```javascript
async function* readLines(path) {
  let file = await fileOpen(path);

  try {
    while (!file.EOF) {
      yield await file.readLine();
    }
  } finally {
    await file.close();
  }
}
```

`await` marks asynchronous operations; `yield` marks where `next` suspends. The value after `yield` becomes the `value` of the object returned by `next()`, same as sync Generators.

Inside an async Generator you can use both `await` and `yield`. `await` pulls external values in; `yield` pushes internal values out.

Usage of the async Generator above:

```javascript
(async function () {
  for await (const line of readLines(filePath)) {
    console.log(line);
  }
})()
```

Async Generators work naturally with `for await...of`:

```javascript
async function* prefixLines(asyncIterable) {
  for await (const line of asyncIterable) {
    yield '> ' + line;
  }
}
```

An async Generator returns an async iterator, so each `next` call returns a Promise. If you `yield` a string as in the example above, it is wrapped in a Promise.

```javascript
function fetchRandom() {
  const url = 'https://www.random.org/decimal-fractions/'
    + '?num=1&dec=10&col=1&format=plain&rnd=new';
  return fetch(url);
}

async function* asyncGenerator() {
  console.log('Start');
  const result = await fetchRandom(); // (A)
  yield 'Result: ' + await result.text(); // (B)
  console.log('Done');
}

const ag = asyncGenerator();
ag.next().then(({value, done}) => {
  console.log(value);
})
```

`ag` is the async iterator returned by `asyncGenerator()`. Calling `ag.next()`:

1. Returns a Promise immediately.
2. `asyncGenerator` starts, logs `Start`.
3. `await` returns a Promise and the generator pauses.
4. At (A), when fulfilled, the result is stored and execution continues.
5. Execution pauses at `yield` in (B). Once the value is ready, the Promise from `ag.next()` resolves.
6. The `.then` callback runs with `{value, done}`; `value` is the yielded value, `done` is `false`.

Lines A and B are analogous to:

```javascript
return new Promise((resolve, reject) => {
  fetchRandom()
  .then(result => result.text())
  .then(result => {
     resolve({
       value: 'Result: ' + result,
       done: false,
     });
  });
});
```

If an async Generator throws, the Promise from `next` rejects and the error can be caught with `.catch`:

```javascript
async function* asyncGenerator() {
  throw new Error('Problem!');
}

asyncGenerator()
.next()
.catch(err => console.log(err)); // Error: Problem!
```

A normal `async` function returns a Promise; an async Generator returns an async iterator. Both encapsulate async work; the difference is that `async` comes with its own executor, while an async Generator is driven by `for await...of` or a custom executor. Example custom executor:

```javascript
async function takeAsync(asyncIterable, count = Infinity) {
  const result = [];
  const iterator = asyncIterable[Symbol.asyncIterator]();
  while (result.length < count) {
    const {value, done} = await iterator.next();
    if (done) break;
    result.push(value);
  }
  return result;
}
```

Each `await iterator.next()` advances the loop; when `done` is true, the loop ends.

Usage:

```javascript
async function f() {
  async function* gen() {
    yield 'a';
    yield 'b';
    yield 'c';
  }

  return await takeAsync(gen());
}

f().then(function (result) {
  console.log(result); // ['a', 'b', 'c']
})
```

With async Generators, JavaScript has four function kinds: plain function, async function, Generator function, and async Generator function. Use `async` for sequential async operations (read file, write, save). Use async Generator when you produce a stream of async values (e.g. line-by-line file reads).

Async Generators can receive data via `next`:

```javascript
const writer = openFile('someFile.txt');
writer.next('hello'); // Executes immediately
writer.next('world'); // Executes immediately
await writer.return(); // Wait for write to finish
```

Here, `openFile` is an async Generator; `next` sends data into it. Each `next` call runs synchronously; `await writer.return()` waits for the whole write to finish.

Sync data can also be turned into an async Generator:

```javascript
async function* createAsyncIterable(syncIterable) {
  for (const elem of syncIterable) {
    yield elem;
  }
}
```

No `await` is needed when there are no async operations.

## yield* statement

`yield*` can delegate to an async iterator:

```javascript
async function* gen1() {
  yield 'a';
  yield 'b';
  return 2;
}

async function* gen2() {
  // result will equal 2
  const result = yield* gen1();
}
```

Here, `result` ends up being `2`.

As with sync Generators, `for await...of` expands `yield*`:

```javascript
(async function () {
  for await (const x of gen2()) {
    console.log(x);
  }
})();
// a
// b
```
