# Programming Style

This chapter discusses how to apply ES6 syntax in practice and combine it with traditional JavaScript to write clear, maintainable code.

Several companies and organizations have published style guides. The content below is mainly based on [Airbnb](https://github.com/airbnb/javascript)'s JavaScript style guide.

## Block Scope

**(1)Prefer let over var**

ES6 introduced two new variable declaration keywords: `let` and `const`. `let` can fully replace `var` because they have the same semantics, and `let` avoids problematic side effects.

```javascript
'use strict';

if (true) {
  let x = 'hello';
}

for (let i = 0; i < 10; i++) {
  console.log(i);
}
```

If `var` were used instead of `let`, two global variables would be declared, which is usually unintended. Variables should only exist within the block where they are declared; `var` does not enforce this.

`var` is affected by hoisting; `let` is not.

```javascript
'use strict';

if (true) {
  console.log(x); // ReferenceError
  let x = 'hello';
}
```

With `var` instead of `let`, `console.log` would not throw and would output `undefined`, because the declaration would be hoisted. That violates the principle of declaring before use.

So prefer `let` over `var`.

**(2)Global constants and thread safety**

Between `let` and `const`, prefer `const`, especially in the global scope. Globals should be constants, not variables.

There are several reasons to favor `const`. First, it signals to readers that the value should not change. Second, it aligns with functional programming, where expressions compute new values rather than mutating existing ones, and it helps with future concurrency. Third, JavaScript engines optimize `const` better than `let`; using `const` can improve performance.

```javascript
// bad
var a = 1, b = 2, c = 3;

// good
const a = 1;
const b = 2;
const c = 3;

// best
const [a, b, c] = [1, 2, 3];
```

`const` also makes it clear that a value should not be modified and helps prevent accidental changes.

All functions should be declared as constants.

In the future, JavaScript may support multithreading. In that world, `let` variables should only appear in single-threaded code and not be shared across threads, to ensure thread safety.

## Strings

Use single quotes or backticks for static strings; avoid double quotes. Use template literals (backticks) for dynamic strings.

```javascript
// bad
const a = "foobar";
const b = 'foo' + a + 'bar';

// acceptable
const c = `foobar`;

// good
const a = 'foobar';
const b = `foo${a}bar`;
```

## Destructuring Assignment

Prefer destructuring when assigning from array elements:

```javascript
const arr = [1, 2, 3, 4];

// bad
const first = arr[0];
const second = arr[1];

// good
const [first, second] = arr;
```

If function parameters are object properties, use destructuring:

```javascript
// bad
function getFullName(user) {
  const firstName = user.firstName;
  const lastName = user.lastName;
}

// good
function getFullName(obj) {
  const { firstName, lastName } = obj;
}

// best
function getFullName({ firstName, lastName }) {
}
```

If a function returns multiple values, prefer destructuring an object over an array. That makes it easier to add or reorder return values later.

```javascript
// bad
function processInput(input) {
  return [left, right, top, bottom];
}

// good
function processInput(input) {
  return { left, right, top, bottom };
}

const { left, right } = processInput(input);
```

## Objects

For single-line object literals, do not add a trailing comma after the last property. For multi-line objects, add a trailing comma after the last property.

```javascript
// bad
const a = { k1: v1, k2: v2, };
const b = {
  k1: v1,
  k2: v2
};

// good
const a = { k1: v1, k2: v2 };
const b = {
  k1: v1,
  k2: v2,
};
```

Keep objects as static as possible once defined; avoid adding properties dynamically. If you must add properties, use `Object.assign`:

```javascript
// bad
const a = {};
a.x = 3;

// if reshape unavoidable
const a = {};
Object.assign(a, { x: 3 });

// good
const a = { x: null };
a.x = 3;
```

If a property name is dynamic, use computed property names when creating the object:

```javascript
// bad
const obj = {
  id: 5,
  name: 'San Francisco',
};
obj[getKey('enabled')] = true;

// good
const obj = {
  id: 5,
  name: 'San Francisco',
  [getKey('enabled')]: true,
};
```

In the example above, the last property name is computed. Using a computed property when creating `obj` keeps all properties defined in one place.

Prefer shorthand property and method syntax where possible:

```javascript
var ref = 'some value';

// bad
const atom = {
  ref: ref,

  value: 1,

  addValue: function (value) {
    return atom.value + value;
  },
};

// good
const atom = {
  ref,

  value: 1,

  addValue(value) {
    return atom.value + value;
  },
};
```

## Arrays

Use the spread operator (`...`) to copy arrays:

```javascript
// bad
const len = items.length;
const itemsCopy = [];
let i;

for (i = 0; i < len; i++) {
  itemsCopy[i] = items[i];
}

// good
const itemsCopy = [...items];
```

Use `Array.from` to convert array-like objects to arrays:

```javascript
const foo = document.querySelectorAll('.foo');
const nodes = Array.from(foo);
```

## Functions

Immediately invoked functions can be written as arrow functions:

```javascript
(() => {
  console.log('Welcome to the Internet.');
})();
```

Prefer arrow functions over anonymous functions as arguments. They are shorter and preserve `this` binding:

```javascript
// bad
[1, 2, 3].map(function (x) {
  return x * x;
});

// good
[1, 2, 3].map((x) => {
  return x * x;
});

// best
[1, 2, 3].map(x => x * x);
```

Use arrow functions instead of `Function.prototype.bind`; avoid `self`, `_this`, or `that` for binding `this`:

```javascript
// bad
const self = this;
const boundMethod = function(...params) {
  return method.apply(self, params);
}

// acceptable
const boundMethod = method.bind(this);

// best
const boundMethod = (...params) => method.apply(this, params);
```

Use arrow functions for simple, single-line functions that are not reused. For longer, more complex functions, use traditional function syntax.

Group all configuration options in a single object, passed as the last parameter. Avoid passing booleans directly as parameters; it harms readability and makes it harder to add options later:

```javascript
// bad
function divide(a, b, option = false ) {
}

// good
function divide(a, b, { option = false } = {}) {
}
```

Avoid `arguments` inside functions; use the rest operator (`...`) instead. Rest makes it explicit which parameters you want and yields a real array instead of an array-like object:

```javascript
// bad
function concatenateAll() {
  const args = Array.prototype.slice.call(arguments);
  return args.join('');
}

// good
function concatenateAll(...args) {
  return args.join('');
}
```

Use default parameter values for optional parameters:

```javascript
// bad
function handleThings(opts) {
  opts = opts || {};
}

// good
function handleThings(opts = {}) {
  // ...
}
```

## Map Structure

Use `Object` only when modeling real-world entities. For generic key-value data, use `Map`, which has built-in iteration:

```javascript
let map = new Map(arr);

for (let key of map.keys()) {
  console.log(key);
}

for (let value of map.values()) {
  console.log(value);
}

for (let item of map.entries()) {
  console.log(item[0], item[1]);
}
```

## Class

Prefer `class` over manual prototype manipulation. Classes are clearer and easier to understand:

```javascript
// bad
function Queue(contents = []) {
  this._queue = [...contents];
}
Queue.prototype.pop = function() {
  const value = this._queue[0];
  this._queue.splice(0, 1);
  return value;
}

// good
class Queue {
  constructor(contents = []) {
    this._queue = [...contents];
  }
  pop() {
    const value = this._queue[0];
    this._queue.splice(0, 1);
    return value;
  }
}
```

Use `extends` for inheritance; it is simpler and preserves correct `instanceof` behavior:

```javascript
// bad
const inherits = require('inherits');
function PeekableQueue(contents) {
  Queue.apply(this, contents);
}
inherits(PeekableQueue, Queue);
PeekableQueue.prototype.peek = function() {
  return this._queue[0];
}

// good
class PeekableQueue extends Queue {
  peek() {
    return this._queue[0];
  }
}
```

## Modules

ES6 module syntax is the standard. Prefer it over Node.js CommonJS.

First, use `import` instead of `require()`:

```javascript
// CommonJS style
const moduleA = require('moduleA');
const func1 = moduleA.func1;
const func2 = moduleA.func2;

// ES6 style
import { func1, func2 } from 'moduleA';
```

Second, use `export` instead of `module.exports`:

```javascript
// CommonJS style
var React = require('react');

var Breadcrumbs = React.createClass({
  render() {
    return <nav />;
  }
});

module.exports = Breadcrumbs;

// ES6 style
import React from 'react';

class Breadcrumbs extends React.Component {
  render() {
    return <nav />;
  }
};

export default Breadcrumbs;
```

If a module exports only one value, use `export default`. If it exports multiple values and they are of equal importance, avoid mixing `export default` with named `export`.

If the default export is a function, use a lowercase name to indicate it is a utility:

```javascript
function makeStyleGuide() {
}

export default makeStyleGuide;
```

If the default export is an object, use a capitalized name to indicate it is a configuration object:

```javascript
const StyleGuide = {
  es6: {
  }
};

export default StyleGuide;
```

## Using ESLint

ESLint checks syntax and style. Use it to keep code consistent and correct.

First, install ESLint in the project root:

```bash
$ npm install --save-dev eslint
```

Then install the Airbnb config and plugins for import, a11y, and React:

```bash
$ npm install --save-dev eslint-config-airbnb
$ npm install --save-dev eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react
```

Finally, create an `.eslintrc` file in the project root:

```javascript
{
  "extends": "eslint-config-airbnb"
}
```

You can now lint the project against the configured rules.

Example `index.js`:

```javascript
var unused = 'I have no purpose!';

function greet() {
    var message = 'Hello, World!';
    console.log(message);
}

greet();
```

ESLint will report issues:

```bash
$ npx eslint index.js
index.js
  1:1  error  Unexpected var, use let or const instead          no-var
  1:5  error  unused is defined but never used                 no-unused-vars
  4:5  error  Expected indentation of 2 characters but found 4  indent
  4:5  error  Unexpected var, use let or const instead          no-var
  5:5  error  Expected indentation of 2 characters but found 4  indent

✖ 5 problems (5 errors, 0 warnings)
```

The output shows five errors: two for using `var` instead of `let` or `const`, one for an unused variable, and two for indentation (4 spaces instead of 2).
