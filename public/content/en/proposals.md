# Latest Proposals

This chapter covers proposals that have not yet reached the standard but show strong promise.

## do expression

At its core, a block scope is a statement that groups several operations together and does not return a value.

```javascript
{
  let t = f();
  t = t * t + 1;
}
```

In the code above, the block scope groups two statements. But outside the block there is no way to get the value of `t`, because a block does not return anything (unless `t` is global).

There is a [proposal](https://github.com/tc39/proposal-do-expressions) that lets a block become an expression by prefixing it with `do`, so it can return a value. It returns the value of the last executed expression inside the block.

```javascript
let x = do {
  let t = f();
  t * t + 1;
};
```

Here, `x` receives the return value of the block (i.e. `t * t + 1`).

The idea is simple: the block returns whatever it wraps.

```javascript
// Same as <expression>
do { <expression>; }

// Same as <statement>
do { <statement> }
```

`do` expressions make it easier to encapsulate multiple statements and structure programs like building blocks.

```javascript
let x = do {
  if (foo()) { f() }
  else if (bar()) { g() }
  else { h() }
};
```

The block chooses which function to call based on `foo()` and assigns the result to `x`. It also gives a separate scope so internal variables stay isolated.

`do` expressions work well in JSX:

```javascript
return (
  <nav>
    <Home />
    {
      do {
        if (loggedIn) {
          <LogoutButton />
        } else {
          <LoginButton />
        }
      }
    }
  </nav>
)
```

Without `do`, you would need the ternary operator (`?:`). With more complex logic, that quickly becomes hard to read.

## throw expression

In JavaScript, `throw` is a statement for throwing errors and cannot be used as an expression.

```javascript
// Error
console.log(throw new Error());
```

Here, the argument to `console.log` must be an expression; a `throw` statement is invalid.

There is a [proposal](https://github.com/tc39/proposal-throw-expressions) to allow `throw` in expressions:

```javascript
// Default parameter value
function save(filename = throw new TypeError("Argument required")) {
}

// Arrow function return value
lint(ast, {
  with: () => throw new Error("avoid using 'with' statements.")
});

// Conditional expression
function getEncoder(encoding) {
  const encoder = encoding === "utf8" ?
    new UTF8Encoder() :
    encoding === "utf16le" ?
      new UTF16Encoder(false) :
      encoding === "utf16be" ?
        new UTF16Encoder(true) :
        throw new Error("Unsupported encoding");
}

// Logical expression
class Product {
  get id() {
    return this._id;
  }
  set id(value) {
    this._id = value || throw new Error("Invalid value");
  }
}
```

In each case, `throw` appears inside an expression.

Syntactically, when used in an expression, `throw` is treated as an operator. To avoid confusion with the statement, `throw` at the beginning of a line is always parsed as the `throw` statement, not as the expression form.

## Partial application of functions

### Syntax

Sometimes you need to bind one or more parameters of a multi-parameter function and return a new function.

```javascript
function add(x, y) { return x + y; }
function add7(x) { return x + 7; }
```

Here, `add7` is a specialization of `add` with one parameter fixed to 7.

```javascript
// bind method
const add7 = add.bind(null, 7);

// Arrow function
const add7 = x => add(x, 7);
```

Both approaches are a bit redundant. `bind` is more limited: it must provide `this`, and parameters can only be bound from left to right.

There is a [proposal](https://github.com/tc39/proposal-partial-application) for partial application that simplifies this:

```javascript
const add = (x, y) => x + y;
const addOne = add(1, ?);

const maxGreaterThanZero = Math.max(0, ...);
```

In this proposal, `?` is a placeholder for a single parameter and `...` for multiple parameters. All of the following are valid partial applications:

```javascript
f(x, ?)
f(x, ...)
f(?, x)
f(..., x)
f(?, x, ?)
f(..., x, ...)
```

`?` and `...` can only appear in function calls and they return a new function.

```javascript
const g = f(?, 1, ...);
// Same as
const g = (x, ...y) => f(x, 1, ...y);
```

Partial application works with object methods too:

```javascript
let obj = {
  f(x, y) { return x + y; },
};

const g = obj.f(?, 3);
g(1) // 4
```

### Notes

There are some important points about partial application:

(1) Partial application is tied to the original function. If the original function changes, the partially applied function reflects that immediately.

```javascript
let f = (x, y) => x + y;

const g = f(?, 3);
g(1); // 4

// Replace function f
f = (x, y) => x * y;

g(1); // 3
```

(2) If a pre-bound value is an expression, it is evaluated at each call, not at definition time.

```javascript
let a = 3;
const f = (x, y) => x + y;

const g = f(?, a);
g(1); // 4

// Change value of a
a = 10;
g(1); // 11
```

(3) If the new function receives more arguments than there are placeholders, extra arguments are ignored.

```javascript
const f = (x, ...y) => [x, ...y];
const g = f(?, 1);
g(2, 3, 4); // [2, 1]
```

To accept more arguments, add `...`:

```javascript
const f = (x, ...y) => [x, ...y];
const g = f(?, 1, ...);
g(2, 3, 4); // [2, 1, 3, 4];
```

(4) `...` is only captured once. If a partial application uses multiple `...`, each one gets the same value.

```javascript
const f = (...x) => x;
const g = f(..., 9, ...);
g(1, 2, 3); // [1, 2, 3, 9, 1, 2, 3]
```

## Pipeline operator

Unix has a pipeline that passes the output of one command as input to the next. This pattern is common in many languages. There is a [proposal](https://github.com/tc39/proposal-pipeline-operator) to add a similar pipeline to JavaScript.

The pipeline operator is written `|>`. Its left side is an expression and its right side is a function. The operator passes the left-hand value into the right-hand function and returns the result.

```javascript
x |> f
// Same as
f(x)
```

The main benefit is turning nested function calls into left-to-right chains:

```javascript
function doubleSay (str) {
  return str + ", " + str;
}

function capitalize (str) {
  return str[0].toUpperCase() + str.substring(1);
}

function exclaim (str) {
  return str + '!';
}
```

Traditional vs. pipeline style:

```javascript
// Traditional style
exclaim(capitalize(doubleSay('hello')))
// "Hello, hello!"

// Pipeline style
'hello'
  |> doubleSay
  |> capitalize
  |> exclaim
// "Hello, hello!"
```

The pipeline passes a single value, so the function on the right must take one argument. For multi-argument functions, curry or wrap them:

```javascript
function double (x) { return x + x; }
function add (x, y) { return x + y; }

let person = { score: 25 };
person.score
  |> double
  |> (_ => add(7, _))
// 57
```

The underscore here is just a placeholder name.

The pipeline operator works with `await`:

```javascript
x |> await f
// Same as
await f(x)

const userAge = userId |> await fetchUserById |> getAgeFromUser;
// Same as
const userAge = getAgeFromUser(await fetchUserById(userId));
```

Pipelines are useful for multi-step data processing:

```javascript
const numbers = [10, 20, 30, 40, 50];

const processedNumbers = numbers
  |> (_ => _.map(n => n / 2)) // [5, 10, 15, 20, 25]
  |> (_ => _.filter(n => n > 10)); // [15, 20, 25]
```

## Math.signbit()

JavaScript represents numbers with 64-bit floating point (IEEE 754). IEEE 754 uses the first bit as the sign: 0 for positive, 1 for negative. So there are two zeros: `+0` (sign bit 0) and `-0` (sign bit 1). Distinguishing them in code is tricky because they compare equal:

```javascript
+0 === -0 // true
```

ES6’s `Math.sign()` indicates sign but not the sign bit: for `-0` it returns `-0`, which doesn’t directly tell you the sign bit.

```javascript
Math.sign(-0) // -0
```

There is a [proposal](https://github.com/tc39/proposal-Math.signbit) for `Math.signbit()` to test whether the sign bit is set:

```javascript
Math.signbit(2) //false
Math.signbit(-2) //true
Math.signbit(0) //false
Math.signbit(-0) //true
```

This correctly reports that `-0` has its sign bit set.

Behavior:

- If the argument is `NaN`, return `false`
- If the argument is `-0`, return `true`
- If the argument is negative, return `true`
- Otherwise return `false`

## Double colon operator

Arrow functions can bind `this`, reducing the need for `call()`, `apply()`, and `bind()`. But they don’t fit every use case, so there is a [proposal](https://github.com/zenparsing/es-function-bind) for a “function bind” operator: two colons (`::`).

With `foo::bar`, the left side is an object and the right side is a function. The operator binds the left-hand object as `this` for the right-hand function:

```javascript
foo::bar;
// Same as
bar.bind(foo);

foo::bar(...arguments);
// Same as
bar.apply(foo, arguments);

const hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(obj, key) {
  return obj::hasOwnProperty(key);
}
```

If the left side is empty and the right side is an object method, the method is bound to that object:

```javascript
var method = obj::obj.foo;
// Same as
var method = ::obj.foo;

let log = ::console.log;
// Same as
var log = console.log.bind(console);
```

The result of `::` can be chained if it is still an object:

```javascript
import { map, takeWhile, forEach } from "iterlib";

getPlayers()
::map(x => x.character())
::takeWhile(x => x.strength > 100)
::forEach(x => console.log(x));
```

## Realm API

The [Realm API](https://github.com/tc39/proposal-realms) provides a sandbox for isolating code and preventing it from accessing the global object.

Previously, `<iframe>` was often used as a sandbox:

```javascript
const globalOne = window;
let iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const globalTwo = iframe.contentWindow;
```

Here, the iframe’s global object is separate. The Realm API can replace this:

```javascript
const globalOne = window;
const globalTwo = new Realm().global;
```

`Realm()` is a constructor that creates a Realm object whose `global` property points to a new top-level object similar to the original.

```javascript
const globalOne = window;
const globalTwo = new Realm().global;

globalOne.evaluate('1 + 2') // 3
globalTwo.evaluate('1 + 2') // 3
```

The Realm’s `evaluate()` method runs code. The following shows that the Realm’s top-level object is distinct from the original:

```javascript
let a1 = globalOne.evaluate('[1,2,3]');
let a2 = globalTwo.evaluate('[1,2,3]');
a1.prototype === a2.prototype; // false
a1 instanceof globalTwo.Array; // false
a2 instanceof globalOne.Array; // false
```

A Realm sandbox only runs ECMAScript APIs, not host APIs:

```javascript
globalTwo.evaluate('console.log(1)')
// throw an error: console is undefined
```

To fix this, you can assign host objects:

```javascript
globalTwo.console = globalOne.console;
```

`Realm()` can accept an options object. If `intrinsics` is `'inherit'`, the Realm inherits intrinsics from the original:

```javascript
const r1 = new Realm();
r1.global === this;
r1.global.JSON === JSON; // false

const r2 = new Realm({ intrinsics: 'inherit' });
r2.global === this; // false
r2.global.JSON === JSON; // true
```

You can subclass `Realm` to customize the sandbox:

```javascript
class FakeWindow extends Realm {
  init() {
    super.init();
    let global = this.global;

    global.document = new FakeDocument(...);
    global.alert = new Proxy(fakeAlert, { ... });
    // ...
  }
}
```
