# Destructuring Assignment

## Array Destructuring

### Basic Usage

ES6 allows extracting values from arrays and objects and assigning them to variables based on a pattern. This is called destructuring.

Previously, assigning values to variables required direct specification.

```javascript
let a = 1;
let b = 2;
let c = 3;
```

ES6 allows the following syntax.

```javascript
let [a, b, c] = [1, 2, 3];
```

The code above extracts values from the array and assigns them to variables by position.

In essence, this is "pattern matching": as long as the patterns on both sides of the equals sign match, the variables on the left are assigned the corresponding values. Below are examples using nested arrays.

```javascript
let [foo, [[bar], baz]] = [1, [[2], 3]];
foo // 1
bar // 2
baz // 3

let [ , , third] = ["foo", "bar", "baz"];
third // "baz"

let [x, , y] = [1, 2, 3];
x // 1
y // 3

let [head, ...tail] = [1, 2, 3, 4];
head // 1
tail // [2, 3, 4]

let [x, y, ...z] = ['a'];
x // "a"
y // undefined
z // []
```

If destructuring fails, the variable gets the value `undefined`.

```javascript
let [foo] = [];
let [bar, foo] = [1];
```

In both cases above, destructuring fails and `foo` equals `undefined`.

Another case is partial destructuring: the pattern on the left matches only part of the array on the right. In this case, destructuring can still succeed.

```javascript
let [x, y] = [1, 2, 3];
x // 1
y // 2

let [a, [b], d] = [1, [2, 3], 4];
a // 1
b // 2
d // 4
```

Both examples above are partial destructuring but succeed.

If the right side is not an array (or, more precisely, not an iterable structure; see the Iterator chapter), an error is thrown.

```javascript
// Error
let [foo] = 1;
let [foo] = false;
let [foo] = NaN;
let [foo] = undefined;
let [foo] = null;
let [foo] = {};
```

The statements above all throw errors because the right-hand value either lacks an Iterator interface after being converted to an object (the first five), or does not have an Iterator interface (the last one).

Array destructuring also works with Set structures.

```javascript
let [x, y, z] = new Set(['a', 'b', 'c']);
x // "a"
```

In fact, any data structure that implements the Iterator interface can use array destructuring.

```javascript
function* fibs() {
  let a = 0;
  let b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

let [first, second, third, fourth, fifth, sixth] = fibs();
sixth // 5
```

In the code above, `fibs` is a Generator function (see the Generator chapter). It has the Iterator interface natively. Destructuring assignment reads values sequentially from this interface.

### Default Values

Destructuring assignment allows default values.

```javascript
let [foo = true] = [];
foo // true

let [x, y = 'b'] = ['a']; // x='a', y='b'
let [x, y = 'b'] = ['a', undefined]; // x='a', y='b'
```

Note: ES6 uses the strict equality operator (`===`) to check whether a position has a value. Default values are used only when an array element is strictly equal to `undefined`.

```javascript
let [x = 1] = [undefined];
x // 1

let [x = 1] = [null];
x // null
```

In the code above, if an array element is `null`, the default value is not used, because `null` is not strictly equal to `undefined`.

If the default value is an expression, it is evaluated lazily—only when it is used.

```javascript
function f() {
  console.log('aaa');
}

let [x = f()] = [1];
```

In the code above, since `x` has a value, function `f` is never called. The code is equivalent to:

```javascript
let x;
if ([1][0] === undefined) {
  x = f();
} else {
  x = [1][0];
}
```

A default value can refer to other variables in the destructuring, but those variables must already be declared.

```javascript
let [x = 1, y = x] = [];     // x=1; y=1
let [x = 1, y = x] = [2];    // x=2; y=2
let [x = 1, y = x] = [1, 2]; // x=1; y=2
let [x = y, y = 1] = [];     // ReferenceError: y is not defined
```

The last expression throws because when `x` uses `y` as its default, `y` is not yet declared.

## Object Destructuring

### Introduction

Destructuring works with objects as well as arrays.

```javascript
let { foo, bar } = { foo: 'aaa', bar: 'bbb' };
foo // "aaa"
bar // "bbb"
```

Object destructuring differs from array destructuring in one important way. Array elements are ordered, so variable values depend on position. Object properties have no order, so variables must match property names to get the right values.

```javascript
let { bar, foo } = { foo: 'aaa', bar: 'bbb' };
foo // "aaa"
bar // "bbb"

let { baz } = { foo: 'aaa', bar: 'bbb' };
baz // undefined
```

In the first example, the variable order on the left does not match the property order on the right, but it does not affect the result. In the second example, the variable has no matching property, so it ends up `undefined`.

If destructuring fails, the variable is `undefined`.

```javascript
let {foo} = {bar: 'baz'};
foo // undefined
```

Here, the object on the right has no `foo` property, so `foo` is `undefined`.

Object destructuring is convenient for assigning methods from existing objects to variables.

```javascript
// Example 1
let { log, sin, cos } = Math;

// Example 2
const { log } = console;
log('hello') // hello
```

Example 1 assigns the `Math` log, sine, and cosine methods to variables. Example 2 assigns `console.log` to `log`.

When the variable name differs from the property name, use this form:

```javascript
let { foo: baz } = { foo: 'aaa', bar: 'bbb' };
baz // "aaa"

let obj = { first: 'hello', last: 'world' };
let { first: f, last: l } = obj;
f // 'hello'
l // 'world'
```

This shows that object destructuring is shorthand for the following form (see the Object extensions chapter).

```javascript
let { foo: foo, bar: bar } = { foo: 'aaa', bar: 'bbb' };
```

That is, the mechanism first finds the matching property name, then assigns it to the variable. The variable (on the right of the colon) is what gets assigned, not the pattern (on the left).

```javascript
let { foo: baz } = { foo: 'aaa', bar: 'bbb' };
baz // "aaa"
foo // error: foo is not defined
```

Here, `foo` is the matching pattern and `baz` is the variable. Only `baz` is assigned, not `foo`.

Like arrays, destructuring works with nested objects.

```javascript
let obj = {
  p: [
    'Hello',
    { y: 'World' }
  ]
};

let { p: [x, { y }] } = obj;
x // "Hello"
y // "World"
```

Note: here `p` is the pattern, not a variable, so it is not assigned. To assign `p` as well, write:

```javascript
let obj = {
  p: [
    'Hello',
    { y: 'World' }
  ]
};

let { p, p: [x, { y }] } = obj;
x // "Hello"
y // "World"
p // ["Hello", {y: "World"}]
```

Another example:

```javascript
const node = {
  loc: {
    start: {
      line: 1,
      column: 5
    }
  }
};

let { loc, loc: { start }, loc: { start: { line }} } = node;
line // 1
loc  // Object {start: Object}
start // Object {line: 1, column: 5}
```

There are three destructuring assignments here: for `loc`, `start`, and `line`. In the last one, only `line` is a variable; `loc` and `start` are patterns.

Nested assignment example:

```javascript
let obj = {};
let arr = [];

({ foo: obj.prop, bar: arr[0] } = { foo: 123, bar: true });

obj // {prop:123}
arr // [true]
```

If the destructuring pattern is a nested object and the parent property does not exist, an error is thrown.

```javascript
// Error
let {foo: {bar}} = {baz: 'baz'};
```

Here the `foo` property on the left expects a nested object. Destructuring the `bar` property of that object fails because `foo` is `undefined`.

Note: object destructuring can access inherited properties.

```javascript
const obj1 = {};
const obj2 = { foo: 'bar' };
Object.setPrototypeOf(obj1, obj2);

const { foo } = obj1;
foo // "bar"
```

`obj1`'s prototype is `obj2`. The `foo` property is not on `obj1` itself but inherited from `obj2`; destructuring still extracts it.

### Default Values

Object destructuring supports default values.

```javascript
var {x = 3} = {};
x // 3

var {x, y = 5} = {x: 1};
x // 1
y // 5

var {x: y = 3} = {};
y // 3

var {x: y = 3} = {x: 5};
y // 5

var { message: msg = 'Something went wrong' } = {};
msg // "Something went wrong"
```

Default values apply when the property value is strictly equal to `undefined`.

```javascript
var {x = 3} = {x: undefined};
x // 3

var {x = 3} = {x: null};
x // null
```

In the last case, `x` is `null`, and since `null !== undefined`, the default `3` is not used.

### Caveats

(1) When using an already declared variable in destructuring, be careful.

```javascript
// Wrong
let x;
{x} = {x: 1};
// SyntaxError: syntax error
```

This fails because the engine treats `{x}` as a block. Avoid putting the opening brace at the start of the line so it is not parsed as a block.

```javascript
// Correct
let x;
({x} = {x: 1});
```

Wrapping the whole assignment in parentheses makes it parse correctly. See below for parentheses and destructuring.

(2) Destructuring patterns can omit variable names, so odd-looking assignments are possible.

```javascript
({} = [true, false]);
({} = 'abc');
({} = []);
```

These are valid but have no practical effect.

(3) Since arrays are objects, you can destructure array indices as object properties.

```javascript
let arr = [1, 2, 3];
let {0 : first, [arr.length - 1] : last} = arr;
first // 1
last // 3
```

Here the array is destructured by index. Index `0` gives `1`, and `[arr.length - 1]` is index `2`, giving `3`. The bracket notation is an "attribute name expression" (see the Object extensions chapter).

## String Destructuring

Strings can be destructured too, because they are converted to array-like objects.

```javascript
const [a, b, c, d, e] = 'hello';
a // "h"
b // "e"
c // "l"
d // "l"
e // "o"
```

Array-like objects have a `length` property, which can also be destructured.

```javascript
let {length : len} = 'hello';
len // 5
```

## Number and Boolean Destructuring

When the right-hand side is a number or boolean, it is converted to an object first.

```javascript
let {toString: s} = 123;
s === Number.prototype.toString // true

let {toString: s} = true;
s === Boolean.prototype.toString // true
```

Numbers and booleans have wrapper objects with `toString`, so `s` is assigned correctly.

The rule is: if the right side is not an object or array, it is converted to an object. `undefined` and `null` cannot be converted, so destructuring them throws.

```javascript
let { prop: x } = undefined; // TypeError
let { prop: y } = null; // TypeError
```

## Function Parameter Destructuring

Function parameters can use destructuring.

```javascript
function add([x, y]){
  return x + y;
}

add([1, 2]); // 3
```

`add`'s parameter looks like an array, but when it is passed, it is destructured into `x` and `y`. Inside the function, the effective parameters are `x` and `y`.

Another example:

```javascript
[[1, 2], [3, 4]].map(([a, b]) => a + b);
// [ 3, 7 ]
```

Function parameter destructuring supports default values.

```javascript
function move({x = 0, y = 0} = {}) {
  return [x, y];
}

move({x: 3, y: 8}); // [3, 8]
move({x: 3}); // [3, 0]
move({}); // [0, 0]
move(); // [0, 0]
```

`move` takes an object and destructures it for `x` and `y`. If destructuring fails, they fall back to the defaults.

The following variant gives different results:

```javascript
function move({x, y} = { x: 0, y: 0 }) {
  return [x, y];
}

move({x: 3, y: 8}); // [3, 8]
move({x: 3}); // [3, undefined]
move({}); // [undefined, undefined]
move(); // [0, 0]
```

Here the default is on the function parameter, not on `x` and `y`, so the behavior changes.

`undefined` triggers the function parameter default.

```javascript
[1, undefined, 3].map((x = 'yes') => x);
// [ 1, 'yes', 3 ]
```

## Parentheses

Destructuring is convenient but not trivial to parse. The compiler cannot tell from the start whether a token is a pattern or an expression; it may need to see the equals sign. For this reason, ES6 disallows parentheses anywhere they might introduce ambiguity. In practice, it is best to avoid parentheses in patterns when possible.

### Cases Where Parentheses Are Not Allowed

(1) Variable declarations

```javascript
// All error
let [(a)] = [1];

let {x: (c)} = {};
let ({x: c}) = {};
let {(x: c)} = {};
let {(x): c} = {};

let { o: ({ p: p }) } = { o: { p: 2 } };
```

These all fail because they are variable declarations and the pattern cannot use parentheses.

(2) Function parameters

Parameters are also declarations, so they cannot use parentheses.

```javascript
// Error
function f([(z)]) { return z; }
// Error
function f([z,(x)]) { return x; }
```

(3) Pattern part of assignment

```javascript
// All error
({ p: a }) = { p: 42 };
([a]) = [5];
```

Putting the whole pattern in parentheses causes an error.

```javascript
// Error
[({ p: a }), { x: c }] = [{}, {}];
```

Putting part of the pattern in parentheses also causes an error.

### Cases Where Parentheses Are Allowed

Parentheses are allowed only for the non-pattern part of an assignment:

```javascript
[(b)] = [3]; // Correct
({ p: (d) } = {}); // Correct
[(parseInt.prop)] = [3]; // Correct
```

These are all valid. They are assignments, not declarations, and the parentheses are not part of the pattern. In the first line, the pattern is the first element of the array; in the second, the pattern is `p`, not `d`; the third is similar to the first.

## Use Cases

Destructuring is widely useful.

**(1) Swapping variables**

```javascript
let x = 1;
let y = 2;

[x, y] = [y, x];
```

This swaps `x` and `y` in a clear, readable way.

**(2) Returning multiple values**

Functions can return only one value. To return several, put them in an array or object. Destructuring makes it easy to extract them.

```javascript
// Return an array

function example() {
  return [1, 2, 3];
}
let [a, b, c] = example();

// Return an object

function example() {
  return {
    foo: 1,
    bar: 2
  };
}
let { foo, bar } = example();
```

**(3) Function parameter mapping**

Destructuring maps a set of parameters to named variables.

```javascript
// Ordered parameters
function f([x, y, z]) { ... }
f([1, 2, 3]);

// Unordered parameters
function f({x, y, z}) { ... }
f({z: 3, y: 2, x: 1});
```

**(4) Extracting JSON data**

Destructuring is useful for pulling values from JSON objects.

```javascript
let jsonData = {
  id: 42,
  status: "OK",
  data: [867, 5309]
};

let { id, status, data: number } = jsonData;

console.log(id, status, number);
// 42, "OK", [867, 5309]
```

**(5) Default parameter values**

```javascript
jQuery.ajax = function (url, {
  async = true,
  beforeSend = function () {},
  cache = true,
  complete = function () {},
  crossDomain = false,
  global = true,
  // ... more config
} = {}) {
  // ... do stuff
};
```

This avoids writing `var foo = config.foo || 'default foo';` inside the function body.

**(6) Iterating over Map**

Any object with an Iterator can be used with `for...of`. Map has an Iterator, so destructuring makes it easy to get keys and values.

```javascript
const map = new Map();
map.set('first', 'hello');
map.set('second', 'world');

for (let [key, value] of map) {
  console.log(key + " is " + value);
}
// first is hello
// second is world
```

To get only keys or only values:

```javascript
// Keys only
for (let [key] of map) {
  // ...
}

// Values only
for (let [,value] of map) {
  // ...
}
```

**(7) Importing module methods**

When loading modules, you often need to choose which exports to use. Destructuring keeps import statements clear.

```javascript
const { SourceMapConsumer, SourceNode } = require("source-map");
```
