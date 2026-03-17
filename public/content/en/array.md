# Array Extensions

## Spread Operator

### Meaning

The spread operator (spread) is three dots (`...`). It is the inverse of rest parameters: it turns an array into a comma-separated argument sequence.

```javascript
console.log(...[1, 2, 3])
// 1 2 3

console.log(1, ...[2, 3, 4], 5)
// 1 2 3 4 5

[...document.querySelectorAll('div')]
// [<div>, <div>, <div>]
```

This operator is mainly used in function calls.

```javascript
function push(array, ...items) {
  array.push(...items);
}

function add(x, y) {
  return x + y;
}

const numbers = [4, 38];
add(...numbers) // 42
```

Here, both `array.push(...items)` and `add(...numbers)` use the spread operator to turn an array into a sequence of arguments.

The spread operator can be combined with normal function arguments:

```javascript
function f(v, w, x, y, z) { }
const args = [0, 1];
f(-1, ...args, 2, ...[3]);
```

An expression may follow the spread operator:

```javascript
const arr = [
  ...(x > 0 ? ['a'] : []),
  'b',
];
```

If the spread is followed by an empty array, it has no effect:

```javascript
[...[], 1]
// [1]
```

In function calls, the spread operator may appear inside parentheses; otherwise it causes a syntax error.

```javascript
(...[1, 2])
// Uncaught SyntaxError: Unexpected number

console.log((...[1, 2]))
// Uncaught SyntaxError: Unexpected number

console.log(...[1, 2])
// 1 2
```

### Replacing apply()

Because the spread operator expands arrays, you no longer need `apply()` to pass an array as arguments:

```javascript
// ES5
function f(x, y, z) {
  // ...
}
var args = [0, 1, 2];
f.apply(null, args);

// ES6
function f(x, y, z) {
  // ...
}
let args = [0, 1, 2];
f(...args);
```

Example with `Math.max()`:

```javascript
// ES5
Math.max.apply(null, [14, 3, 77])

// ES6
Math.max(...[14, 3, 77])

// Equivalent to
Math.max(14, 3, 77);
```

Another example—appending an array to another:

```javascript
// ES5
var arr1 = [0, 1, 2];
var arr2 = [3, 4, 5];
Array.prototype.push.apply(arr1, arr2);

// ES6
let arr1 = [0, 1, 2];
let arr2 = [3, 4, 5];
arr1.push(...arr2);
```

Using spread with constructors:

```javascript
// ES5
new (Date.bind.apply(Date, [null, 2015, 1, 1]))

// ES6
new Date(...[2015, 1, 1]);
```

### Spread Operator Uses

**(1)Copying arrays**

Arrays are reference types; assigning them copies the reference, not the data. Use spread for a shallow copy:

```javascript
const a1 = [1, 2];
// Option 1
const a2 = [...a1];
// Option 2
const [...a2] = a1;
```

**(2)Merging arrays**

```javascript
const arr1 = ['a', 'b'];
const arr2 = ['c'];
const arr3 = ['d', 'e'];

// ES5
arr1.concat(arr2, arr3);
// [ 'a', 'b', 'c', 'd', 'e' ]

// ES6
[...arr1, ...arr2, ...arr3]
// [ 'a', 'b', 'c', 'd', 'e' ]
```

Both are shallow copies; nested objects/arrays are shared.

**(3)With destructuring**

```javascript
// ES5
a = list[0], rest = list.slice(1)

// ES6
[a, ...rest] = list
```

The spread in destructuring must be the last element.

**(4)Strings**

The spread operator converts strings to arrays:

```javascript
[...'hello']
// [ "h", "e", "l", "l", "o" ]
```

This correctly handles multi-code-unit Unicode characters:

```javascript
'x\uD83D\uDE80y'.length // 4
[...'x\uD83D\uDE80y'].length // 3
```

**(5)Objects with Iterator**

Any object implementing the Iterator interface can be spread into an array:

```javascript
let nodeList = document.querySelectorAll('div');
let array = [...nodeList];
```

**(6)Map, Set, and Generator**

Map keys, Set, and Generator results can be spread:

```javascript
let map = new Map([
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
]);
let arr = [...map.keys()]; // [1, 2, 3]

const go = function*(){
  yield 1;
  yield 2;
  yield 3;
};
[...go()] // [1, 2, 3]
```

## Array.from()

`Array.from()` converts two kinds of values to arrays: array-like objects and iterables (including Set and Map).

```javascript
let arrayLike = {
    '0': 'a',
    '1': 'b',
    '2': 'c',
    length: 3
};

// ES5
var arr1 = [].slice.call(arrayLike); // ['a', 'b', 'c']

// ES6
let arr2 = Array.from(arrayLike); // ['a', 'b', 'c']
```

Common uses: NodeList and `arguments`. It supports a second `map`-like function:

```javascript
Array.from(arrayLike, x => x * x);
// Equivalent to
Array.from(arrayLike).map(x => x * x);

Array.from([1, 2, 3], (x) => x * x)
// [1, 4, 9]
```

## Array.of()

`Array.of()` creates an array from the given values:

```javascript
Array.of(3, 11, 8) // [3,11,8]
Array.of(3) // [3]
Array.of(3).length // 1
```

Unlike `Array(n)`, which creates a sparse array of length `n`, `Array.of` always returns an array of the arguments.

## Instance Methods: copyWithin()

`copyWithin(target, start = 0, end = this.length)` copies elements within the array and returns the modified array:

```javascript
[1, 2, 3, 4, 5].copyWithin(0, 3)
// [4, 5, 3, 4, 5]
```

## Instance Methods: find(), findIndex(), findLast(), findLastIndex()

`find()` returns the first element that satisfies the callback; `findIndex()` returns its index. Both accept a second argument for `this` in the callback. [ES2022](https://github.com/tc39/proposal-array-find-from-last) adds `findLast()` and `findLastIndex()` to search from the end:

```javascript
[1, 4, -5, 10].find((n) => n < 0)
// -5

const array = [
  { value: 1 },
  { value: 2 },
  { value: 3 },
  { value: 4 }
];
array.findLast(n => n.value % 2 === 1); // { value: 3 }
array.findLastIndex(n => n.value % 2 === 1); // 2
```

## Instance Methods: fill()

`fill(value, start?, end?)` fills the array (or a slice) with a value:

```javascript
['a', 'b', 'c'].fill(7)
// [7, 7, 7]

['a', 'b', 'c'].fill(7, 1, 2)
// ['a', 7, 'c']
```

## Instance Methods: entries(), keys(), values()

These return iterators for keys, values, or entries:

```javascript
for (let [index, elem] of ['a', 'b'].entries()) {
  console.log(index, elem);
}
// 0 "a"
// 1 "b"
```

## Instance Methods: includes()

`includes(value, fromIndex?)` returns whether the array contains the value. Unlike `indexOf`, it handles `NaN`:

```javascript
[1, 2, 3].includes(2)     // true
[1, 2, NaN].includes(NaN) // true
```

## Instance Methods: flat(), flatMap()

`flat(depth = 1)` flattens nested arrays; `flatMap()` maps then flattens one level:

```javascript
[1, 2, [3, 4]].flat()
// [1, 2, 3, 4]

[1, 2, [3, [4, 5]]].flat(2)
// [1, 2, 3, 4, 5]

[2, 3, 4].flatMap((x) => [x, x * 2])
// [2, 4, 3, 6, 4, 8]
```

## Instance Methods: at()

[ES2022](https://github.com/tc39/proposal-relative-indexing-method/) adds `at(index)`, which supports negative indices:

```javascript
const arr = [5, 12, 8, 130, 44];
arr.at(2)  // 8
arr.at(-2) // 130
```

## Instance Methods: toReversed(), toSorted(), toSpliced(), with()

[ES2023](https://github.com/tc39/proposal-change-array-by-copy) adds immutable counterparts to `reverse()`, `sort()`, `splice()`, and indexed assignment:

```javascript
const sequence = [1, 2, 3];
sequence.toReversed() // [3, 2, 1]
sequence // [1, 2, 3]

correctionNeeded.with(1, 2) // [1, 2, 3]
```

## Instance Methods: group(), groupToMap()

A [proposal](https://github.com/tc39/proposal-array-grouping) adds `group()` and `groupToMap()` for grouping array elements:

```javascript
const array = [1, 2, 3, 4, 5];
array.group((num) => num % 2 === 0 ? 'even' : 'odd');
// { odd: [1, 3, 5], even: [2, 4] }
```

## Array Holes

Holes (empty slots) behave inconsistently across methods. Prefer avoiding them.

## Array.prototype.sort() Stability

[ES2019](https://github.com/tc39/ecma262/pull/1340) requires `Array.prototype.sort()` to be stable. Main engines now use stable sort.
