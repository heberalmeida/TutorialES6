# Iterator and for...of Loop

## The Concept of Iterator

JavaScript's original data structures for representing "collections" were mainly arrays (`Array`) and objects (`Object`). ES6 adds `Map` and `Set`. This gives us four data structures for collections, and users can combine them to define their own data structures—for example, array members as `Map`, and `Map` members as objects. This requires a unified interface mechanism to handle all different data structures.

The Iterator (traverser) is such a mechanism. It is an interface that provides a unified way to access different data structures. Any data structure that deploys the Iterator interface can be traversed (i.e., process all members of that structure one by one).

The Iterator serves three purposes: first, to provide a unified, simple access interface for various data structures; second, to enable members of data structures to be arranged in some order; and third, ES6 creates a new traversal command, the `for...of` loop, whose main consumer is the Iterator interface.

The Iterator traversal process works as follows:

(1) Create a pointer object that points to the starting position of the current data structure. That is, the iterator object is essentially a pointer object.

(2) The first call to the pointer object's `next` method moves the pointer to the first member of the data structure.

(3) The second call to the pointer object's `next` method moves the pointer to the second member of the data structure.

(4) Keep calling the pointer object's `next` method until it reaches the end of the data structure.

Each call to the `next` method returns information about the current member of the data structure. Specifically, it returns an object with two properties: `value` and `done`. The `value` property is the current member's value, and `done` is a boolean indicating whether the traversal is finished.

Here is an example that simulates the return value of the `next` method:

```javascript
var it = makeIterator(['a', 'b']);

it.next() // { value: "a", done: false }
it.next() // { value: "b", done: false }
it.next() // { value: undefined, done: true }

function makeIterator(array) {
  var nextIndex = 0;
  return {
    next: function() {
      return nextIndex < array.length ?
        {value: array[nextIndex++], done: false} :
        {value: undefined, done: true};
    }
  };
}
```

The code above defines a `makeIterator` function that returns an iterator object. Executing this function on the array `['a', 'b']` returns the iterator (pointer) object `it` for that array.

The pointer object's `next` method is used to move the pointer. Initially, the pointer points to the start of the array. Each time `next` is called, the pointer moves to the next array member: first `a`, then `b`.

The `next` method returns an object representing the current member. This object has `value` and `done` properties: `value` returns the current member, and `done` is a boolean indicating whether the traversal is finished, i.e., whether `next` needs to be called again.

In short, calling the pointer object's `next` method traverses the given data structure step by step.

For iterator objects, both `done: false` and `value: undefined` can be omitted. Therefore, the `makeIterator` function above can be simplified to:

```javascript
function makeIterator(array) {
  var nextIndex = 0;
  return {
    next: function() {
      return nextIndex < array.length ?
        {value: array[nextIndex++]} :
        {done: true};
    }
  };
}
```

Because the Iterator interface is layered on top of data structures, the iterator and the data structure it traverses are actually separate. You can write iterator objects that do not correspond to any data structure, or simulate data structures with iterators. Here is an example of an iterator that runs indefinitely:

```javascript
var it = idMaker();

it.next().value // 0
it.next().value // 1
it.next().value // 2
// ...

function idMaker() {
  var index = 0;

  return {
    next: function() {
      return {value: index++, done: false};
    }
  };
}
```

In the example above, the iterator-generating function `idMaker` returns an iterator (pointer) object with no underlying data structure—or rather, the iterator itself represents the data structure.

Using TypeScript notation, the Iterable interface, the Iterator (pointer) object, and the return value of `next` can be described as:

```javascript
interface Iterable {
  [Symbol.iterator]() : Iterator,
}

interface Iterator {
  next(value?: any) : IterationResult,
}

interface IterationResult {
  value: any,
  done: boolean,
}
```

## Default Iterator Interface

The purpose of the Iterator interface is to provide a unified access mechanism for all data structures—the `for...of` loop (see below). When you use `for...of` to traverse a data structure, the loop automatically looks for the Iterator interface.

A data structure is said to be "iterable" if it deploys the Iterator interface.

ES6 specifies that the default Iterator interface is deployed on the data structure's `Symbol.iterator` property. That is, a data structure is considered iterable if it has a `Symbol.iterator` property. `Symbol.iterator` is a function that is the default iterator generator for that structure. Executing this function returns an iterator. The property name `Symbol.iterator` is an expression that returns the `iterator` property of the `Symbol` object, a predefined special value of type Symbol, so it must be enclosed in square brackets (see the "Symbol" chapter).

```javascript
const obj = {
  [Symbol.iterator] : function () {
    return {
      next: function () {
        return {
          value: 1,
          done: true
        };
      }
    };
  }
};
```

In the code above, the object `obj` is iterable because it has a `Symbol.iterator` property. Calling this property returns an iterator object. The essential characteristic of that object is that it has a `next` method. Each call to `next` returns an object describing the current member, with `value` and `done` properties.

Some data structures in ES6 are natively iterable (e.g., arrays), meaning they can be traversed by `for...of` without extra setup. They ship with the `Symbol.iterator` property (see below). Others, like plain objects, do not. Any structure that deploys `Symbol.iterator` is said to deploy the iterator interface. Calling this interface returns an iterator object.

Data structures that natively have the Iterator interface are:

- Array
- Map
- Set
- String
- TypedArray
- The `arguments` object
- NodeList objects

Below is an example of the array `Symbol.iterator` property:

```javascript
let arr = ['a', 'b', 'c'];
let iter = arr[Symbol.iterator]();

iter.next() // { value: 'a', done: false }
iter.next() // { value: 'b', done: false }
iter.next() // { value: 'c', done: false }
iter.next() // { value: undefined, done: true }
```

In the code above, `arr` is an array and natively has the iterator interface, deployed on `arr[Symbol.iterator]`. Calling this property returns the iterator object.

For data structures that natively deploy the Iterator interface, you don't need to write an iterator generator yourself; `for...of` will traverse them automatically. For other structures (mainly objects), you must deploy the Iterator interface on the `Symbol.iterator` property to make them traversable by `for...of`.

Objects (Object) do not have the default Iterator interface because the order of properties is not guaranteed. Developers must specify it manually. At its core, iterators perform linear processing; deploying an iterator on any nonlinear structure effectively defines a linearization. That said, deploying an iterator on objects is often unnecessary, since objects are then used like Map, which ES6 provides natively.

For an object to be iterable with `for...of`, it must deploy the iterator generator on `Symbol.iterator` (or inherit it via the prototype chain).

```javascript
class RangeIterator {
  constructor(start, stop) {
    this.value = start;
    this.stop = stop;
  }

  [Symbol.iterator]() { return this; }

  next() {
    var value = this.value;
    if (value < this.stop) {
      this.value++;
      return {done: false, value: value};
    }
    return {done: true, value: undefined};
  }
}

function range(start, stop) {
  return new RangeIterator(start, stop);
}

for (var value of range(0, 3)) {
  console.log(value); // 0, 1, 2
}
```

The code above shows how to deploy the Iterator interface on a class. `Symbol.iterator` points to a function that returns the iterator for the current object.

Below is an example that implements a "linked list" structure with an iterator:

```javascript
function Obj(value) {
  this.value = value;
  this.next = null;
}

Obj.prototype[Symbol.iterator] = function() {
  var iterator = { next: next };

  var current = this;

  function next() {
    if (current) {
      var value = current.value;
      current = current.next;
      return { done: false, value: value };
    }
    return { done: true };
  }
  return iterator;
}

var one = new Obj(1);
var two = new Obj(2);
var three = new Obj(3);

one.next = two;
two.next = three;

for (var i of one){
  console.log(i); // 1, 2, 3
}
```

In the code above, `Symbol.iterator` is deployed on the constructor prototype. Calling it returns the iterator `iterator`. Each time its `next` method is called, it returns a value and moves the internal pointer to the next instance.

Here is another example of adding the Iterator interface to an object:

```javascript
let obj = {
  data: [ 'hello', 'world' ],
  [Symbol.iterator]() {
    const self = this;
    let index = 0;
    return {
      next() {
        if (index < self.data.length) {
          return {
            value: self.data[index++],
            done: false
          };
        }
        return { value: undefined, done: true };
      }
    };
  }
};
```

For array-like objects (those with numeric keys and a `length` property), there is a simple way to deploy the Iterator interface: make `Symbol.iterator` reference the array's Iterator interface.

```javascript
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
// Or
NodeList.prototype[Symbol.iterator] = [][Symbol.iterator];

[...document.querySelectorAll('div')] // can run now
```

NodeList is array-like and already has an iterator interface. Assigning the array's `Symbol.iterator` to it has no practical effect in this example.

Below is another example of an array-like object using the array's `Symbol.iterator`:

```javascript
let iterable = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3,
  [Symbol.iterator]: Array.prototype[Symbol.iterator]
};
for (let item of iterable) {
  console.log(item); // 'a', 'b', 'c'
}
```

Note: deploying the array's `Symbol.iterator` on a plain object has no effect:

```javascript
let iterable = {
  a: 'a',
  b: 'b',
  c: 'c',
  length: 3,
  [Symbol.iterator]: Array.prototype[Symbol.iterator]
};
for (let item of iterable) {
  console.log(item); // undefined, undefined, undefined
}
```

If the function referenced by `Symbol.iterator` is not an iterator generator (i.e., does not return an iterator), the engine will throw an error:

```javascript
var obj = {};

obj[Symbol.iterator] = () => 1;

[...obj] // TypeError: [] is not a function
```

In the code above, `obj[Symbol.iterator]` does not return an iterator generator, so spreading causes a TypeError.

Once the Iterator interface is deployed, the data structure can be traversed with `for...of` (see below) or a `while` loop:

```javascript
var $iterator = ITERABLE[Symbol.iterator]();
var $result = $iterator.next();
while (!$result.done) {
  var x = $result.value;
  // ...
  $result = $iterator.next();
}
```

In the code above, `ITERABLE` is an iterable data structure and `$iterator` is its iterator. Each time the iterator moves (via `next`), it checks `result.done`. If the traversal is not finished, it advances the iterator and continues the loop.

## Situations That Call the Iterator Interface

Several situations call the Iterator interface (i.e., the `Symbol.iterator` method) by default. Besides the `for...of` loop described below, there are a few others.

**(1)destructuring assignment**

When destructuring arrays and Set structures, the default `Symbol.iterator` is called.

```javascript
let set = new Set().add('a').add('b').add('c');

let [x,y] = set;
// x='a'; y='b'

let [first, ...rest] = set;
// first='a'; rest=['b','c'];
```

**(2)spread operator**

The spread operator (`...`) also calls the default Iterator interface:

```javascript
// Example 1
var str = 'hello';
[...str] //  ['h','e','l','l','o']

// Example 2
let arr = ['b', 'c'];
['a', ...arr, 'd']
// ['a', 'b', 'c', 'd']
```

The spread operator uses the Iterator interface internally.

In effect, this provides a simple way to convert any iterable structure to an array. If a structure has the Iterator interface, you can spread it into an array:

```javascript
let arr = [...iterable];
```

**(3)yield\***

`yield*` is followed by an iterable, and it calls that structure's iterator interface:

```javascript
let generator = function* () {
  yield 1;
  yield* [2,3,4];
  yield 5;
};

var iterator = generator();

iterator.next() // { value: 1, done: false }
iterator.next() // { value: 2, done: false }
iterator.next() // { value: 3, done: false }
iterator.next() // { value: 4, done: false }
iterator.next() // { value: 5, done: false }
iterator.next() // { value: undefined, done: true }
```

**(4) Other cases**

Because array traversal uses the iterator interface, any API that accepts an array effectively calls the iterator. Examples include:

- for...of
- Array.from()
- Map(), Set(), WeakMap(), WeakSet() (e.g., `new Map([['a',1],['b',2]])`)
- Promise.all()
- Promise.race()

## String Iterator Interface

Strings are array-like and also have a native Iterator interface:

```javascript
var someString = "hi";
typeof someString[Symbol.iterator]
// "function"

var iterator = someString[Symbol.iterator]();

iterator.next()  // { value: "h", done: false }
iterator.next()  // { value: "i", done: false }
iterator.next()  // { value: undefined, done: true }
```

In the code above, calling `Symbol.iterator` returns an iterator, and calling `next` on it traverses the string characters.

You can override the native `Symbol.iterator` to customize traversal behavior:

```javascript
var str = new String("hi");

[...str] // ["h", "i"]

str[Symbol.iterator] = function() {
  return {
    next: function() {
      if (this._first) {
        this._first = false;
        return { value: "bye", done: false };
      } else {
        return { done: true };
      }
    },
    _first: true
  };
};

[...str] // ["bye"]
str // "hi"
```

In the code above, `str`'s `Symbol.iterator` is modified, so the spread operator returns `"bye"` instead, while the string value remains `"hi"`.

## Iterator Interface and Generator Functions

The simplest way to implement `Symbol.iterator()` is with Generator functions (see the next chapter):

```javascript
let myIterable = {
  [Symbol.iterator]: function* () {
    yield 1;
    yield 2;
    yield 3;
  }
};
[...myIterable] // [1, 2, 3]

// Or use the concise style below

let obj = {
  * [Symbol.iterator]() {
    yield 'hello';
    yield 'world';
  }
};

for (let x of obj) {
  console.log(x);
}
// "hello"
// "world"
```

In the code above, the `Symbol.iterator()` method barely needs any code—you just use `yield` to specify each step’s return value.

## return() and throw() on Iterator Objects

In addition to `next()`, iterator objects can implement `return()` and `throw()`. For hand-written iterator generators, `next()` is required; `return()` and `throw()` are optional.

`return()` is used when a `for...of` loop exits early (for example due to an error or a `break`). If an object needs cleanup or resource release before traversal completes, you should implement `return()`:

```javascript
function readLinesSync(file) {
  return {
    [Symbol.iterator]() {
      return {
        next() {
          return { done: false };
        },
        return() {
          file.close();
          return { done: true };
        }
      };
    },
  };
}
```

In the code above, `readLinesSync` takes a file and returns an iterator that has both `next()` and `return()`. Both of the following cases will trigger `return()`:

```javascript
// Case 1
for (let line of readLinesSync(fileName)) {
  console.log(line);
  break;
}

// Case 2
for (let line of readLinesSync(fileName)) {
  console.log(line);
  throw new Error();
}
```

In case one, after outputting the first line, `return()` runs and closes the file. In case two, `return()` runs to close the file before the error is rethrown.

Note: `return()` must return an object, as required by the Generator spec.

`throw()` is mainly used with Generator functions; ordinary iterators seldom need it. See the "Generator Functions" chapter.

## for...of Loop

ES6 borrows from C++, Java, C#, and Python and introduces the `for...of` loop as a unified way to traverse all data structures.

Any structure that deploys the `Symbol.iterator` property is considered to have the iterator interface and can be traversed with `for...of`. That is, `for...of` calls the structure's `Symbol.iterator` method internally.

The `for...of` loop can be used with arrays, Set and Map structures, array-like objects (e.g., `arguments`, DOM NodeList), Generator objects (covered later), and strings.

### Arrays

Arrays natively have the iterator interface (they ship with `Symbol.iterator`). The `for...of` loop essentially uses that interface. You can verify this:

```javascript
const arr = ['red', 'green', 'blue'];

for(let v of arr) {
  console.log(v); // red green blue
}

const obj = {};
obj[Symbol.iterator] = arr[Symbol.iterator].bind(arr);

for(let v of obj) {
  console.log(v); // red green blue
}
```

In the code above, the empty object `obj` is given `arr`'s `Symbol.iterator`. As a result, `for...of` over `obj` produces the same output as over `arr`.

`for...of` can replace the array `forEach` method:

```javascript
const arr = ['red', 'green', 'blue'];

arr.forEach(function (element, index) {
  console.log(element); // red green blue
  console.log(index);   // 0 1 2
});
```

The traditional `for...in` loop in JavaScript returns property keys, not values. ES6's `for...of` allows you to iterate over values:

```javascript
var arr = ['a', 'b', 'c', 'd'];

for (let a in arr) {
  console.log(a); // 0 1 2 3
}

for (let a of arr) {
  console.log(a); // a b c d
}
```

The code above shows that `for...in` yields keys and `for...of` yields values. To get array indices with `for...of`, use the `entries` or `keys` methods (see the "Array Extensions" chapter).

`for...of` uses the iterator interface. The array iterator returns only properties with numeric indices, unlike `for...in`:

```javascript
let arr = [3, 5, 7];
arr.foo = 'hello';

for (let i in arr) {
  console.log(i); // "0", "1", "2", "foo"
}

for (let i of arr) {
  console.log(i); //  "3", "5", "7"
}
```

In the code above, `for...of` does not iterate over the `foo` property of `arr`.

### Set and Map Structures

Set and Map also natively have the Iterator interface and can be used with `for...of`:

```javascript
var engines = new Set(["Gecko", "Trident", "Webkit", "Webkit"]);
for (var e of engines) {
  console.log(e);
}
// Gecko
// Trident
// Webkit

var es6 = new Map();
es6.set("edition", 6);
es6.set("committee", "TC39");
es6.set("standard", "ECMA-262");
for (var [name, value] of es6) {
  console.log(name + ": " + value);
}
// edition: 6
// committee: TC39
// standard: ECMA-262
```

The code above illustrates traversal of Set and Map. Two points to note: traversal order follows the order in which members were added; and Set returns single values, while Map returns key-value arrays:

```javascript
let map = new Map().set('a', 1).set('b', 2);
for (let pair of map) {
  console.log(pair);
}
// ['a', 1]
// ['b', 2]

for (let [key, value] of map) {
  console.log(key + ' : ' + value);
}
// a : 1
// b : 2
```

### Computed Iteration Structures

Some structures are computed from existing ones. For example, ES6 arrays, Set, and Map deploy three methods that return iterators:

- `entries()` returns an iterator over `[key, value]` pairs. For arrays, the key is the index; for Set, key and value are the same. Map’s default iterator is `entries()`.
- `keys()` returns an iterator over all keys.
- `values()` returns an iterator over all values.

Iterators produced by these methods traverse the computed structure:

```javascript
let arr = ['a', 'b', 'c'];
for (let pair of arr.entries()) {
  console.log(pair);
}
// [0, 'a']
// [1, 'b']
// [2, 'c']
```

### Array-like Objects

Array-like structures include several types. Here `for...of` is used with strings, DOM NodeList, and `arguments`:

```javascript
// string
let str = "hello";

for (let s of str) {
  console.log(s); // h e l l o
}

// DOM NodeList object
let paras = document.querySelectorAll("p");

for (let p of paras) {
  p.classList.add("test");
}

// arguments object
function printArgs() {
  for (let x of arguments) {
    console.log(x);
  }
}
printArgs('a', 'b');
// 'a'
// 'b'
```

For strings, `for...of` correctly handles 32-bit UTF-16 characters:

```javascript
for (let x of 'a\uD83D\uDC0A') {
  console.log(x);
}
// 'a'
// '\uD83D\uDC0A'
```

Not all array-like objects have the Iterator interface. A simple workaround is `Array.from`:

```javascript
let arrayLike = { length: 2, 0: 'a', 1: 'b' };

// Error
for (let x of arrayLike) {
  console.log(x);
}

// Correct
for (let x of Array.from(arrayLike)) {
  console.log(x);
}
```

### Objects

Plain objects cannot be used directly with `for...of` and will throw an error. They must deploy the Iterator interface first. In such cases, `for...in` can still be used to iterate over keys:

```javascript
let es6 = {
  edition: 6,
  committee: "TC39",
  standard: "ECMA-262"
};

for (let e in es6) {
  console.log(e);
}
// edition
// committee
// standard

for (let e of es6) {
  console.log(e);
}
// TypeError: es6[Symbol.iterator] is not a function
```

The code above shows that `for...in` works on plain objects, while `for...of` throws.

One solution is to use `Object.keys` and iterate over the resulting array:

```javascript
for (var key of Object.keys(someObject)) {
  console.log(key + ': ' + someObject[key]);
}
```

Another approach is to wrap the object with a Generator:

```javascript
const obj = { a: 1, b: 2, c: 3 }

function* entries(obj) {
  for (let key of Object.keys(obj)) {
    yield [key, obj[key]];
  }
}

for (let [key, value] of entries(obj)) {
  console.log(key, '->', value);
}
// a -> 1
// b -> 2
// c -> 3
```

### Comparison with Other Iteration Syntax

Using arrays as an example, JavaScript offers several ways to iterate. The most basic is the `for` loop:

```javascript
for (var index = 0; index < myArray.length; index++) {
  console.log(myArray[index]);
}
```

This is verbose, so arrays provide a built-in `forEach` method:

```javascript
myArray.forEach(function (value) {
  console.log(value);
});
```

The downside is that you cannot break out of `forEach`; `break` and `return` do not exit the loop.

`for...in` iterates over array keys:

```javascript
for (var index in myArray) {
  console.log(myArray[index]);
}
```

`for...in` has several drawbacks:

- Array keys are numbers, but `for...in` returns them as strings ("0", "1", "2", etc.).
- `for...in` traverses not only numeric keys but also manually added properties and those on the prototype chain.
- In some cases, traversal order is unspecified.

Overall, `for...in` is designed for objects, not arrays.

`for...of` improves on these approaches:

```javascript
for (let value of myArray) {
  console.log(value);
}
```

- It has the same concise syntax as `for...in` without its drawbacks.
- Unlike `forEach`, it works with `break`, `continue`, and `return`.
- It provides a unified interface for traversing all data structures.

Here is an example using `break` to exit a `for...of` loop:

```javascript
for (var n of fibonacci) {
  if (n > 1000)
    break;
  console.log(n);
}
```

The example above outputs Fibonacci numbers up to 1000. When a value exceeds 1000, `break` exits the loop.

## Iterator Utility Methods

ES2025 adds utility methods to iterator objects returned by the iterator interface:

```javascript
const arr = ['a', '', 'b', '', 'c', '', 'd', '', 'e'];

arr.values() // creates an iterator
  .filter(x => x.length > 0)
  .drop(1)
  .take(3)
  .map(x => `=${x}=`)
  .toArray()
// ['=b=', '=c=', '=d=']
```

In the example above, `arr` is an array; `values()` returns an iterator. Previously you would process it with a `for...of` loop. Now you can chain utility methods directly.

Iterator methods generally mirror array methods:

- Methods that return an iterator:
  - iterator.filter(filterFn)
  - iterator.map(mapFn)
  - iterator.flatMap(mapFn)
- Methods that return a boolean:
  - iterator.some(fn)
  - iterator.every(fn)
- Methods that return other values:
  - iterator.find(fn)
  - iterator.reduce(reducer, initialValue?)
- Methods that return nothing:
  - iterator.forEach(fn)

The following methods are specific to iterators:

- iterator.drop(limit): returns an iterator that skips the first `limit` items.
- iterator.take(limit): returns an iterator containing only the first `limit` items.
- iterator.toArray(): returns an array of all items.
