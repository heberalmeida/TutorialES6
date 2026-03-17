# Operator Extensions

This chapter covers operators added in ES6 and later standards.

## Exponentiation Operator

ES2016 added the exponentiation operator (`**`).

```javascript
2 ** 2 // 4
2 ** 3 // 8
```

This operator is right-associative. When multiple exponentiation operators are chained, evaluation starts from the right:

```javascript
// equivalent to 2 ** (3 ** 2)
2 ** 3 ** 2
// 512
```

In the code above, the second `**` is evaluated first, not the first.

The exponentiation operator can be combined with assignment as `**=`:

```javascript
let a = 1.5;
a **= 2;
// Same as a = a * a;

let b = 4;
b **= 3;
// Same as b = b * b * b;
```

## Optional Chaining Operator

When accessing nested properties, you often need to check that each level exists. For example, to safely read `message.body.user.firstName`, you might write:

```javascript
// incorrect style
const  firstName = message.body.user.firstName || 'default';

// Correct style
const firstName = (message
  && message.body
  && message.body.user
  && message.body.user.firstName) || 'default';
```

Here, `firstName` is four levels deep, so four existence checks are needed.

The ternary operator `?:` is also commonly used to guard property access:

```javascript
const fooInput = myForm.querySelector('input[name=foo]')
const fooValue = fooInput ? fooInput.value : undefined
```

Here, you must check that `fooInput` exists before reading `fooInput.value`.

[ES2020](https://github.com/tc39/proposal-optional-chaining) introduces the optional chaining operator `?.` to simplify this:

```javascript
const firstName = message?.body?.user?.firstName || 'default';
const fooValue = myForm.querySelector('input[name=foo]')?.value
```

With `?.`, the chain short-circuits and returns `undefined` if the left-hand side is `null` or `undefined`, without evaluating further.

Checking whether a method exists before calling it:

```javascript
iterator.return?.()
```

If `iterator.return` is defined, it is called; otherwise the expression returns `undefined` and does not evaluate beyond `?.`.

This is especially useful for methods that might not exist:

```javascript
if (myForm.checkValidity?.() === false) {
  // form validation failed
  return;
}
```

Here, older form objects might not have `checkValidity()`. The `?.` operator returns `undefined`, so the condition becomes `undefined === false` and the block is skipped.

The optional chaining operator has three forms:

- `obj?.prop` // property access
- `obj?.[expr]` // computed property access
- `func?.(...args)` // optional method/function call

Example of `obj?.[expr]`:

```bash
let hex = "#C0FFEE".match(/#([A-Z]+)/i)?.[1];
```

Here, `match()` returns `null` on no match or an array on match; `?.` handles both cases.

Equivalents without optional chaining:

```javascript
a?.b
// Same as
a == null ? undefined : a.b

a?.[x]
// Same as
a == null ? undefined : a[x]

a?.b()
// Same as
a == null ? undefined : a.b()

a?.()
// Same as
a == null ? undefined : a()
```

For `a?.b()` and `a?.()`, if `a` is not `null`/`undefined` but `a.b` (or `a`) is not a function, calling it will still throw.

Caveats:

**(1)Short-circuiting**

`?.` short-circuits: if the left side fails the check, the right side is not evaluated:

```javascript
a?.[++x]
// Same as
a == null ? undefined : a[++x]
```

If `a` is `undefined` or `null`, `x` is not incremented.

**(2)Parentheses**

Parentheses limit the effect of `?.`:

```javascript
(a?.b).c
// equivalent to
(a == null ? undefined : a.b).c
```

Here, `?.` only affects `a.b`. The `.c` access is always evaluated, so if `a` is null/undefined, this will throw.

In general, avoid parentheses around `?.` expressions.

**(3)Invalid uses**

These patterns throw:

```javascript
// constructor
new a?.()
new a?.b()

// optional chaining right side has template string
a?.`{b}`
a?.b`{c}`

// optional chaining left side is super
super?.()
super?.foo

// optional chaining used on left of assignment
a?.b = c
```

**(4)Right side must not be a decimal**

For backward compatibility, `foo?.3:0` is parsed as `foo ? .3 : 0`. If `?.` is immediately followed by a decimal digit, `?.` is not treated as one token; the dot is parsed with the following digits.

## Nullish Coalescing Operator

When reading properties that may be `null` or `undefined`, you often want default values. A common approach uses `||`:

```javascript
const headerText = response.settings.headerText || 'Hello, world!';
const animationDuration = response.settings.animationDuration || 300;
const showSplashScreen = response.settings.showSplashScreen || true;
```

These three lines use `||` for defaults, but that is incorrect. The intent is to use the default only when the value is `null` or `undefined`. With `||`, empty string, `false`, or `0` also trigger the default.

[ES2020](https://github.com/tc39/proposal-nullish-coalescing) adds the nullish coalescing operator `??`. It behaves like `||`, but returns the right-hand side only when the left-hand side is `null` or `undefined`:

```javascript
const headerText = response.settings.headerText ?? 'Hello, world!';
const animationDuration = response.settings.animationDuration ?? 300;
const showSplashScreen = response.settings.showSplashScreen ?? true;
```

Now the default is applied only when the property is `null` or `undefined`.

`??` pairs well with optional chaining `?.`:

```javascript
const animationDuration = response.settings?.animationDuration ?? 300;
```

This checks both `response.settings` and `response.settings.animationDuration`.

`??` is useful for function parameter defaults:

```javascript
function Component(props) {
  const enable = props.enabled ?? true;
  // …
}
```

This is roughly equivalent to:

```javascript
function Component(props) {
  const {
    enabled: enable = true,
  } = props;
  // …
}
```

`??` is a logical operator. When mixed with `&&` and `||`, use parentheses to avoid ambiguity; otherwise a syntax error may occur:

```javascript
// Error
lhs && middle ?? rhs
lhs ?? middle && rhs
lhs || middle ?? rhs
lhs ?? middle || rhs
```

All four expressions above throw. You must add parentheses:

```javascript
(lhs && middle) ?? rhs;
lhs && (middle ?? rhs);

(lhs ?? middle) && rhs;
lhs ?? (middle && rhs);

(lhs || middle) ?? rhs;
lhs || (middle ?? rhs);

(lhs ?? middle) || rhs;
lhs ?? (middle || rhs);
```

## Logical Assignment Operators

ES2021 adds three [logical assignment operators](https://github.com/tc39/proposal-logical-assignment) that combine logical and assignment operators:

```javascript
// OR assignment operator
x ||= y
// Same as
x || (x = y)

// AND assignment operator
x &&= y
// Same as
x && (x = y)

// Nullish assignment operator
x ??= y
// Same as
x ?? (x = y)
```

These operators perform the logical operation first, then assign only if the result triggers assignment.

They are useful for setting defaults:

```javascript
// old style
user.id = user.id || 1;

// new style
user.id ||= 1;
```

Here, if `user.id` is falsy, it is set to `1`.

Another example:

```javascript
function example(opts) {
  opts.foo = opts.foo ?? 'bar';
  opts.baz ?? (opts.baz = 'qux');
}
```

With logical assignment:

```javascript
function example(opts) {
  opts.foo ??= 'bar';
  opts.baz ??= 'qux';
}
```

## `#!` (Hashbang)

Unix scripts support the `#!` (Shebang or Hashbang) directive on the first line to specify the interpreter.

Bash script:

```bash
#!/bin/sh
```

Python script:

```python
#!/usr/bin/env python
```

[ES2023](https://github.com/tc39/proposal-hashbang) adds `#!` support for JavaScript scripts. It can appear on the first line of a script or module file:

```javascript
// at first line of script file
#!/usr/bin/env node
'use strict';
console.log(1);

// at first line of module file
#!/usr/bin/env node
export {};
console.log(1);
```

With this line, Unix can run the script directly:

```bash
# previous way to run script
$ node hello.js

# hashbang approach
$ ./hello.js
```

To the JavaScript engine, `#!` is treated as a comment and ignored.
