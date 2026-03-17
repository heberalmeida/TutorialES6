# Promise Object

## Meaning of Promise

Promise is a solution for asynchronous programming that is more rational and powerful than traditional approaches—callbacks and events. It was first proposed and implemented by the community, and ES6 wrote it into the language standard, unified its usage, and provides the `Promise` object natively.

In short, a `Promise` is a container that holds the result of some future event (usually an async operation). Syntactically, a Promise is an object from which you can obtain messages about the async operation. Promise provides a unified API so that different async operations can be handled the same way.

A `Promise` object has two characteristics:

(1) Its state is independent of the outside world. A `Promise` represents an async operation and has three states: `pending` (in progress), `fulfilled` (success), and `rejected` (failure). Only the result of the async operation can determine the current state; nothing else can change it. This is the origin of the name "Promise"—its English meaning is "commitment," indicating that other means cannot change it.

(2) Once the state changes, it does not change again. You can always get the result at any time. A Promise's state can only transition in two ways: from `pending` to `fulfilled` or from `pending` to `rejected`. Once either happens, the state is frozen and will keep that result; this is called resolved (settled). If the change has already happened, adding a callback to the Promise will still immediately receive that result. This is completely different from events—with events, if you miss one, listening later will not give you the result.

Note: For convenience, the term `resolved` in this chapter refers only to the `fulfilled` state, not `rejected`.

With `Promise` objects, async operations can be expressed in a synchronous flow, avoiding deeply nested callbacks. Promise also provides a unified interface, making it easier to control async operations.

`Promise` has some drawbacks. First, you cannot cancel a Promise; once created it runs immediately and cannot be cancelled midway. Second, if you do not set callback functions, errors thrown inside a Promise will not surface outside. Third, when in the `pending` state, you cannot tell which stage it has reached (just started or about to finish).

For events that occur repeatedly, using the [Stream](https://nodejs.org/api/stream.html) pattern is generally a better choice than using Promises.

## Basic Usage

ES6 specifies that the `Promise` object is a constructor used to create Promise instances.

The code below creates a Promise instance:

```javascript
const promise = new Promise(function(resolve, reject) {
  // ... some code

  if (/* async operation succeeded */){
    resolve(value);
  } else {
    reject(error);
  }
});
```

The `Promise` constructor takes a function as an argument. That function receives two parameters: `resolve` and `reject`. They are provided by the JavaScript engine and need not be defined yourself.

The `resolve` function changes the Promise state from "unfinished" to "success" (pending to resolved) and is called when the async operation succeeds, passing the result as an argument. The `reject` function changes the state from "unfinished" to "failure" (pending to rejected) and is called when the async operation fails, passing the error as an argument.

After a Promise instance is created, you can use the `then` method to specify callbacks for the `resolved` and `rejected` states.

```javascript
promise.then(function(value) {
  // success
}, function(error) {
  // failure
});
```

The `then` method accepts two callback functions. The first is called when the Promise becomes `resolved`; the second when it becomes `rejected`. Both are optional. Each receives the value passed out by the Promise as an argument.

Below is a simple example:

```javascript
function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms, 'done');
  });
}

timeout(100).then((value) => {
  console.log(value);
});
```

In the code above, `timeout` returns a Promise instance that represents a result to occur after some time. After the specified time (`ms`), the Promise state becomes `resolved` and the `then` callback runs.

A Promise executes immediately once created.

```javascript
let promise = new Promise(function(resolve, reject) {
  console.log('Promise');
  resolve();
});

promise.then(function() {
  console.log('resolved');
});

console.log('Hi!');

// Promise
// Hi!
// resolved
```

In the code above, the Promise runs immediately after creation, so `Promise` is output first. The `then` callback runs only after all synchronous tasks in the current script finish, so `resolved` is output last.

Below is an async image-loading example:

```javascript
function loadImageAsync(url) {
  return new Promise(function(resolve, reject) {
    const image = new Image();

    image.onload = function() {
      resolve(image);
    };

    image.onerror = function() {
      reject(new Error('Could not load image at ' + url));
    };

    image.src = url;
  });
}
```

The code above wraps image loading in a Promise. On success it calls `resolve`, otherwise `reject`.

Below is an Ajax example using Promise:

```javascript
const getJSON = function(url) {
  const promise = new Promise(function(resolve, reject){
    const handler = function() {
      if (this.readyState !== 4) {
        return;
      }
      if (this.status === 200) {
        resolve(this.response);
      } else {
        reject(new Error(this.statusText));
      }
    };
    const client = new XMLHttpRequest();
    client.open("GET", url);
    client.onreadystatechange = handler;
    client.responseType = "json";
    client.setRequestHeader("Accept", "application/json");
    client.send();

  });

  return promise;
};

getJSON("/posts.json").then(function(json) {
  console.log('Contents: ' + json);
}, function(error) {
  console.error('error', error);
});
```

The code above uses `getJSON` to wrap XMLHttpRequest for JSON HTTP requests and returns a Promise. Note that both `resolve` and `reject` in `getJSON` are called with arguments.

Arguments passed to `resolve` and `reject` are forwarded to the callbacks. `reject` usually receives an `Error` instance. `resolve` can receive another Promise instance:

```javascript
const p1 = new Promise(function (resolve, reject) {
  // ...
});

const p2 = new Promise(function (resolve, reject) {
  // ...
  resolve(p1);
})
```

In the code above, `p1` and `p2` are both Promise instances, but `p2`'s `resolve` receives `p1`—one async operation's result is another async operation.

When this happens, `p1`'s state is passed to `p2`. If `p1` is `pending`, `p2`'s callbacks wait for `p1`. If `p1` is already `resolved` or `rejected`, `p2`'s callbacks run immediately.

```javascript
const p1 = new Promise(function (resolve, reject) {
  setTimeout(() => reject(new Error('fail')), 3000)
})

const p2 = new Promise(function (resolve, reject) {
  setTimeout(() => resolve(p1), 1000)
})

p2
  .then(result => console.log(result))
  .catch(error => console.log(error))
// Error: fail
```

In the code above, `p1` becomes `rejected` after 3 seconds. `p2`'s state changes after 1 second when `resolve` receives `p1`. Since `p2` resolves to another Promise, `p2`'s own state no longer applies; `p1`'s state determines `p2`'s. The following `then` is effectively attached to `p1`. After 2 more seconds, `p1` becomes `rejected`, triggering the `catch` callback.

Note: Calling `resolve` or `reject` does not end execution of the Promise's executor function.

```javascript
new Promise((resolve, reject) => {
  resolve(1);
  console.log(2);
}).then(r => {
  console.log(r);
});
// 2
// 1
```

After `resolve(1)`, `console.log(2)` still runs and runs first. A Promise that resolves immediately runs at the end of the current event loop, always after synchronous tasks.

Generally, once `resolve` or `reject` is called, the Promise's work is done. Follow-up logic should go in `then`, not after `resolve` or `reject`. Prefer adding a `return` before them to avoid surprises.

```javascript
new Promise((resolve, reject) => {
  return resolve(1);
  // following statements will not run
  console.log(2);
})
```

## Promise.prototype.then()

A Promise instance has a `then` method defined on `Promise.prototype`. It adds callbacks for state changes. The first argument is the callback for `resolved`, the second for `rejected`. Both are optional.

`then` returns a new Promise instance (not the original). So you can chain calls:

```javascript
getJSON("/posts.json").then(function(json) {
  return json.post;
}).then(function(post) {
  // ...
});
```

The code above chains two callbacks. The result of the first is passed as an argument to the second.

With chained `then`, you can sequence callbacks. The previous callback may return another Promise (i.e. another async operation); the next callback then waits for that Promise to settle before running.

```javascript
getJSON("/post/1.json").then(function(post) {
  return getJSON(post.commentURL);
}).then(function (comments) {
  console.log("resolved: ", comments);
}, function (err){
  console.log("rejected: ", err);
});
```

In the code above, the first `then` callback returns a Promise. The second `then` callbacks wait for it. If it becomes `resolved`, the first runs; if `rejected`, the second runs.

Using arrow functions, the code can be simplified:

```javascript
getJSON("/post/1.json").then(
  post => getJSON(post.commentURL)
).then(
  comments => console.log("resolved: ", comments),
  err => console.log("rejected: ", err)
);
```

## Promise.prototype.catch()

`Promise.prototype.catch()` is an alias for `.then(null, rejection)` or `.then(undefined, rejection)` and is used to specify the error callback.

```javascript
getJSON('/posts.json').then(function(posts) {
  // ...
}).catch(function(error) {
  // handle errors from getJSON and prior callback
  console.log('Error occurred!', error);
});
```

When `getJSON()` returns a Promise: if it becomes `resolved`, the `then` callback runs; if the async operation throws, it becomes `rejected` and the `catch` callback handles it. Errors thrown in the `then` callback are also caught by `catch`.

```javascript
p.then((val) => console.log('fulfilled:', val))
  .catch((err) => console.log('rejected', err));

// Same as
p.then((val) => console.log('fulfilled:', val))
  .then(null, (err) => console.log("rejected:", err));
```

Example:

```javascript
const promise = new Promise(function(resolve, reject) {
  throw new Error('test');
});
promise.catch(function(error) {
  console.log(error);
});
// Error: test
```

The error thrown in the executor is caught by `catch`. The above is equivalent to:

```javascript
// Style 1
const promise = new Promise(function(resolve, reject) {
  try {
    throw new Error('test');
  } catch(e) {
    reject(e);
  }
});
promise.catch(function(error) {
  console.log(error);
});

// Style 2
const promise = new Promise(function(resolve, reject) {
  reject(new Error('test'));
});
promise.catch(function(error) {
  console.log(error);
});
```

So `reject()` is equivalent to throwing an error.

If the Promise is already `resolved`, throwing an error later has no effect.

```javascript
const promise = new Promise(function(resolve, reject) {
  resolve('ok');
  throw new Error('test');
});
promise
  .then(function(value) { console.log(value) })
  .catch(function(error) { console.log(error) });
// ok
```

The thrown error after `resolve` is not caught. A Promise's state, once changed, stays that way.

Promise errors "bubble" to the next `catch`:

```javascript
getJSON('/post/1.json').then(function(post) {
  return getJSON(post.commentURL);
}).then(function(comments) {
  // some code
}).catch(function(error) {
  // handle errors from the three Promises
});
```

There are three Promises here. Any error from any of them is caught by the final `catch`.

Generally, avoid using the second parameter of `then` for rejection; use `catch` instead.

```javascript
// bad
promise
  .then(function(data) {
    // success
  }, function(err) {
    // error
  });

// good
promise
  .then(function(data) { //cb
    // success
  })
  .catch(function(err) {
    // error
  });
```

The second style is better because it catches errors from the `then` callback as well and is closer to `try/catch`.

Without `catch`, Promise errors do not reach outer code:

```javascript
const someAsyncThing = function() {
  return new Promise(function(resolve, reject) {
    // next line errors, x not declared
    resolve(x + 2);
  });
};

someAsyncThing().then(function() {
  console.log('everything is great');
});

setTimeout(() => { console.log(123) }, 2000);
// Uncaught (in promise) ReferenceError: x is not defined
// 123
```

On the server, the exit code would still be `0`. Node.js has an `unhandledRejection` event for uncaught rejections:

```javascript
process.on('unhandledRejection', function (err, p) {
  throw err;
});
```

Note: Node plans to change behavior around `unhandledRejection`; unhandled errors may terminate the process with a non-zero exit code.

Another example:

```javascript
const promise = new Promise(function (resolve, reject) {
  resolve('ok');
  setTimeout(function () { throw new Error('test') }, 0)
});
promise.then(function (value) { console.log(value) });
// ok
// Uncaught Error: test
```

The error is thrown in the next event loop, after the Promise has settled, so it is not caught by the Promise.

It is generally recommended to always add `catch` to a Promise. `catch` returns a Promise, so you can chain `then` after it:

```javascript
someAsyncThing()
.catch(function(error) {
  console.log('oh no', error);
})
.then(function() {
  console.log('carry on');
});
// oh no [ReferenceError: x is not defined]
// carry on
```

If there is no error, `catch` is skipped:

```javascript
Promise.resolve()
.catch(function(error) {
  console.log('oh no', error);
})
.then(function() {
  console.log('carry on');
});
// carry on
```

Errors can be thrown inside `catch`:

```javascript
someAsyncThing().then(function() {
  return someOtherAsyncThing();
}).catch(function(error) {
  console.log('oh no', error);
  // next line errors, y not declared
  y + 2;
}).catch(function(error) {
  console.log('carry on', error);
});
// oh no [ReferenceError: x is not defined]
// carry on [ReferenceError: y is not defined]
```

## Promise.prototype.finally()

`finally()` runs regardless of the Promise's final state. It was added in ES2018.

```javascript
promise
.then(result => {···})
.catch(error => {···})
.finally(() => {···});
```

The `finally` callback takes no arguments and should not depend on the Promise's result.

`finally` is essentially a special case of `then`:

```javascript
promise
.finally(() => {
  // statement
});

// Same as
promise
.then(
  result => {
    // statement
    return result;
  },
  error => {
    // statement
    throw error;
  }
);
```

A simple implementation:

```javascript
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value  => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};
```

`finally` always returns the original value:

```javascript
// resolve value is undefined
Promise.resolve(2).then(() => {}, () => {})

// resolve value is 2
Promise.resolve(2).finally(() => {})

// reject value is undefined
Promise.reject(3).then(() => {}, () => {})

// reject value is 3
Promise.reject(3).finally(() => {})
```

## Promise.all()

`Promise.all()` wraps multiple Promise instances into a single new Promise.

```javascript
const p = Promise.all([p1, p2, p3]);
```

If any argument is not a Promise, it is converted with `Promise.resolve`. The argument can be any iterable of Promises.

The new Promise's state is determined by `p1`, `p2`, `p3`:

(1) All must become `fulfilled` for `p` to be `fulfilled`. Their return values form an array passed to `p`'s callback.

(2) If any becomes `rejected`, `p` becomes `rejected` with that instance's rejection reason.

```javascript
const promises = [2, 3, 5, 7, 11, 13].map(function (id) {
  return getJSON('/post/' + id + ".json");
});

Promise.all(promises).then(function (posts) {
  // ...
}).catch(function(reason){
  // ...
});
```

If a Promise in the array has its own `catch`, that `catch` runs instead of `Promise.all`'s:

```javascript
const p1 = new Promise((resolve, reject) => {
  resolve('hello');
})
.then(result => result)
.catch(e => e);

const p2 = new Promise((resolve, reject) => {
  throw new Error('error');
})
.then(result => result)
.catch(e => e);

Promise.all([p1, p2])
.then(result => console.log(result))
.catch(e => console.log(e));
// ["hello", Error: error]
```

Without its own `catch`, `Promise.all`'s `catch` is used:

```javascript
const p1 = new Promise((resolve, reject) => {
  resolve('hello');
})
.then(result => result);

const p2 = new Promise((resolve, reject) => {
  throw new Error('error');
})
.then(result => result);

Promise.all([p1, p2])
.then(result => console.log(result))
.catch(e => console.log(e));
// Error: error
```

## Promise.race()

`Promise.race()` also wraps multiple Promises into one. The first to settle determines the result.

```javascript
const p = Promise.race([
  fetch('/resource-that-may-take-a-while'),
  new Promise(function (resolve, reject) {
    setTimeout(() => reject(new Error('request timeout')), 5000)
  })
]);

p
.then(console.log)
.catch(console.error);
```

## Promise.allSettled()

Sometimes you want to wait for all async operations to finish, whether they succeed or fail. `Promise.all()` fails as soon as one fails. [ES2020](https://github.com/tc39/proposal-promise-allSettled) adds `Promise.allSettled()` for this.

```javascript
const promises = [
  fetch('/api-1'),
  fetch('/api-2'),
  fetch('/api-3'),
];

await Promise.allSettled(promises);
removeLoadingIndicator();
```

The returned Promise is always `fulfilled` with an array of results:

```javascript
const resolved = Promise.resolve(42);
const rejected = Promise.reject(-1);

const allSettledPromise = Promise.allSettled([resolved, rejected]);

allSettledPromise.then(function (results) {
  console.log(results);
});
// [
//    { status: 'fulfilled', value: 42 },
//    { status: 'rejected', reason: -1 }
// ]
```

Each result is either `{status: 'fulfilled', value}` or `{status: 'rejected', reason}`.

## Promise.any()

[ES2021](https://github.com/tc39/proposal-promise-any) adds `Promise.any()`. It returns a Promise that fulfills when any input fulfills, and rejects only when all reject.

```javascript
Promise.any([
  fetch('https://v8.dev/').then(() => 'home'),
  fetch('https://v8.dev/blog').then(() => 'blog'),
  fetch('https://v8.dev/docs').then(() => 'docs')
]).then((first) => {
  console.log(first);
}).catch((error) => {
  console.log(error);
});
```

`Promise.any()` and `await`:

```javascript
try {
  const first = await Promise.any(promises);
  console.log(first);
} catch (error) {
  console.log(error);
}
```

`Promise.any()` rejects with an AggregateError whose `errors` array contains all rejection reasons.

## Promise.resolve()

`Promise.resolve()` converts values to Promises:

```javascript
const jsPromise = Promise.resolve($.ajax('/whatever.json'));
```

`Promise.resolve('foo')` is equivalent to `new Promise(resolve => resolve('foo'))`.

Parameter cases:

(1) If the argument is a Promise, it is returned unchanged.

(2) If it is a thenable (has `then`), it is converted and its `then` is run.

(3) If it is a plain value or non-thenable object, a fulfilled Promise is returned with that value.

(4) Called with no argument, it returns a fulfilled Promise.

Immediate `resolve()` runs at the end of the current event loop:

```javascript
setTimeout(function () {
  console.log('three');
}, 0);

Promise.resolve().then(function () {
  console.log('two');
});

console.log('one');

// one
// two
// three
```

## Promise.reject()

`Promise.reject(reason)` returns a rejected Promise:

```javascript
const p = Promise.reject('error');
// Same as
const p = new Promise((resolve, reject) => reject('error'))
```

The rejection reason is passed through to subsequent handlers.

## Applications

### Loading Images

```javascript
const preloadImage = function (path) {
  return new Promise(function (resolve, reject) {
    const image = new Image();
    image.onload  = resolve;
    image.onerror = reject;
    image.src = path;
  });
};
```

### Generator and Promise

When using Generator functions with async logic, Promises are commonly returned:

```javascript
function getFoo () {
  return new Promise(function (resolve, reject){
    resolve('foo');
  });
}

const g = function* () {
  try {
    const foo = yield getFoo();
    console.log(foo);
  } catch (e) {
    console.log(e);
  }
};

function run (generator) {
  const it = generator();

  function go(result) {
    if (result.done) return result.value;

    return result.value.then(function (value) {
      return go(it.next(value));
    }, function (error) {
      return go(it.throw(error));
    });
  }

  go(it.next());
}

run(g);
```

## Promise.try()

In practice you often want to use Promise for a function `f` without caring whether it is sync or async, so you can use `then` and `catch` consistently. A naive approach is `Promise.resolve().then(f)`, but that runs sync functions at the end of the event loop.

```javascript
const f = () => console.log('now');
Promise.resolve().then(f);
console.log('next');
// next
// now
```

One approach is an async IIFE:

```javascript
const f = () => console.log('now');
(async () => f())();
console.log('next');
// now
// next
```

[ES2025](https://github.com/ljharb/proposal-promise-try) provides `Promise.try()`:

```javascript
const f = () => console.log('now');
Promise.try(f);
console.log('next');
// now
// next
```

Libraries like Bluebird, Q, and when have long offered this. `Promise.try` gives a single handling mechanism for sync and async code, improving error management:

```javascript
Promise.try(() => database.users.get({id: userId}))
  .then(...)
  .catch(...)
```
