# Understanding the ECMAScript Specification

## Overview

The specification document is the official standard for a computer language, detailing syntax rules and implementation methods.

Generally speaking, there is no need to read the specification unless you are writing a compiler. Because the specification is written very abstractly and concisely, lacks examples, and is not easy to understand—and for solving practical application problems, it provides little help. However, if you encounter a difficult syntax question and cannot find an answer anywhere else, you can consult the specification to see what the language standard says. The specification is the "last resort" for solving problems.

This is especially necessary for JavaScript. Its usage scenarios are complex, syntax rules are inconsistent, there are many exceptions, and various runtime environments behave differently—leading to endless strange syntax issues. No syntax book can cover all cases. Consulting the specification can be considered the most reliable and authoritative way to resolve syntax problems.

This chapter explains how to read the ECMAScript 6 specification.

The ECMAScript 6 specification can be downloaded for free and read online on the ECMA International website ([www.ecma-international.org/ecma-262/6.0/](https://www.ecma-international.org/ecma-262/6.0/)).

This specification document is quite large, with a total of 26 chapters—545 pages if printed on A4. Its characteristic is that it specifies things in great detail; every syntactic behavior and every function implementation is described clearly and exhaustively. Essentially, compiler authors need only translate each step into code. This largely ensures that all ES6 implementations behave consistently.

Of the 26 chapters in the ECMAScript 6 specification, chapters 1–3 are introductions to the document itself and have little to do with the language. Chapter 4 describes the overall design of the language; interested readers may read it. Chapters 5–8 describe the language at a macro level. Chapter 5 explains the terminology and notation used in the specification; chapter 6 introduces data types; chapter 7 introduces abstract operations used internally by the language; chapter 8 describes how code is executed. Chapters 9–26 introduce specific syntax.

For general users, aside from chapter 4, the other chapters all involve details of particular aspects. There is no need to read them through; you can consult the relevant chapter when needed.

## Terminology

The ES6 specification uses some specialized terminology. Understanding these terms helps you read the specification. This section introduces several of them.

### Abstract operations

"Abstract operations" are internal methods of the engine that cannot be called from outside. The specification defines a series of abstract operations, specifies their behavior, and leaves the implementation to various engines.

For example, the algorithm for `Boolean(value)` has a first step like this:

> 1. Let `b` be `ToBoolean(value)`.

Here `ToBoolean` is an abstract operation: the engine's internal algorithm for producing a boolean value.

Many functions reuse the same steps, so the ES6 specification extracts them into "abstract operations" for convenience.

### Record and field

The ES6 specification calls the key-value map data structure a Record, and each key-value pair is a field. Thus, a Record consists of multiple fields, and each field contains a key name and a key value.

### [[Notation]]

The ES6 specification uses the `[[Notation]]` style widely, e.g. `[[Value]]`, `[[Writable]]`, `[[Get]]`, `[[Set]]`, etc. It refers to field key names.

For example, `obj` is a Record with a `Prototype` property. The ES6 specification would not write `obj.Prototype` but rather `obj.[[Prototype]]`. Generally, properties written in `[[Notation]]` are internal object properties.

All JavaScript functions have an internal property `[[Call]]` for running that function.

```javascript
F.[[Call]](V, argumentsList)
```

In the code above, `F` is a function object, `[[Call]]` is its internal method; `F.[[call]]()` means run the function; `V` is the value of `this` when `[[Call]]` runs; `argumentsList` is the list of arguments passed when calling the function.

### Completion Record

Every statement returns a Completion Record representing the result of execution. Each Completion Record has a `[[Type]]` property indicating the type of the result.

The `[[Type]]` property has five possible values:

- normal
- return
- throw
- break
- continue

If `[[Type]]` is `normal`, it is called normal completion (execution succeeded). All other values are abrupt completion. For developers, only `[[Type]]` equal to `throw` (an error) needs attention; the values `break`, `continue`, and `return` only appear in specific contexts and can be ignored.

## Standard flow of abstract operations

The execution flow of abstract operations generally follows this pattern:

> 1. Let `result` be `AbstractOp()`.
> 1. If `result` is an abrupt completion, return `result`.
> 1. Set `result` to `result.[[Value]]`.
> 1. return `result`.

Step 1 calls the abstract operation `AbstractOp()` and gets `result`, a Completion Record. Step 2 returns immediately if `result` is abrupt completion. If execution continues, `result` is normal completion. Step 3 sets `result` to `resultCompletionRecord.[[Value]]`. Step 4 returns `result`.

The ES6 specification expresses this standard flow in shorthand:

> 1. Let `result` be `AbstractOp()`.
> 1. `ReturnIfAbrupt(result)`.
> 1. return `result`.

Here `ReturnIfAbrupt(result)` stands for the previous steps 2 and 3: if there is an error, return it; otherwise extract the value.

There is an even more concise form:

> 1. Let `result` be `? AbstractOp()`.
> 1. return `result`.

The `?` means `AbstractOp()` may throw. If it does, the error is returned; otherwise the value is extracted.

Besides `?`, the ES6 specification uses another shorthand symbol `!`:

> 1. Let `result` be `! AbstractOp()`.
> 1. return `result`.

Here `!` means `AbstractOp()` will not throw; it always returns normal completion, so the value can always be extracted.

## Equality operator

The next section illustrates how to use the specification with some examples.

The equality operator (`==`) is notorious for its varied, unintuitive behavior. This section looks at what the specification says about it.

Consider this expression and its value:

```javascript
0 == null
```

If you are unsure of the answer or want to know how the language handles it internally, consult the specification. [Section 7.2.12](https://www.ecma-international.org/ecma-262/6.0/#sec-abstract-equality-comparison) describes the equality operator (`==`).

The description of each syntactic behavior is split into two parts: an overall description and the detailed algorithm. The overall description for the equality operator is a single sentence:

> "The comparison `x == y`, where `x` and `y` are values, produces `true` or `false`."

This means the equality operator compares two values and returns `true` or `false`.

The algorithmic details are:

> 1. ReturnIfAbrupt(x).
> 1. ReturnIfAbrupt(y).
> 1. If `Type(x)` is the same as `Type(y)`, then
>    1. Return the result of performing Strict Equality Comparison `x === y`.
> 1. If `x` is `null` and `y` is `undefined`, return `true`.
> 1. If `x` is `undefined` and `y` is `null`, return `true`.
> 1. If `Type(x)` is Number and `Type(y)` is String,
>    return the result of the comparison `x == ToNumber(y)`.
> 1. If `Type(x)` is String and `Type(y)` is Number,
>    return the result of the comparison `ToNumber(x) == y`.
> 1. If `Type(x)` is Boolean, return the result of the comparison `ToNumber(x) == y`.
> 1. If `Type(y)` is Boolean, return the result of the comparison `x == ToNumber(y)`.
> 1. If `Type(x)` is either String, Number, or Symbol and `Type(y)` is Object, then
>    return the result of the comparison `x == ToPrimitive(y)`.
> 1. If `Type(x)` is Object and `Type(y)` is either String, Number, or Symbol, then
>    return the result of the comparison `ToPrimitive(x) == y`.
> 1. Return `false`.

Translated, the algorithm is:

> 1. If `x` is not a normal value (e.g. throws), halt.
> 1. If `y` is not a normal value, halt.
> 1. If `Type(x)` equals `Type(y)`, perform strict equality `x === y`.
> 1. If `x` is `null` and `y` is `undefined`, return `true`.
> 1. If `x` is `undefined` and `y` is `null`, return `true`.
> 1. If `Type(x)` is Number and `Type(y)` is String, return `x == ToNumber(y)`.
> 1. If `Type(x)` is String and `Type(y)` is Number, return `ToNumber(x) == y`.
> 1. If `Type(x)` is Boolean, return `ToNumber(x) == y`.
> 1. If `Type(y)` is Boolean, return `x == ToNumber(y)`.
> 1. If `Type(x)` is String or Number or Symbol and `Type(y)` is Object, return `x == ToPrimitive(y)`.
> 1. If `Type(x)` is Object and `Type(y)` is String or Number or Symbol, return `ToPrimitive(x) == y`.
> 1. Return `false`.

Since `0` has type Number and `null` has type Null (as in [section 4.3.13](https://www.ecma-international.org/ecma-262/6.0/#sec-terms-and-definitions-null-type) of the spec—this is the internal Type operation, separate from `typeof`), none of the first 11 steps apply. Step 12 returns `false`.

```javascript
0 == null // false
```

## Array holes

Here is another example.

```javascript
const a1 = [undefined, undefined, undefined];
const a2 = [, , ,];

a1.length // 3
a2.length // 3

a1[0] // undefined
a2[0] // undefined

a1[0] === a2[0] // true
```

Above, `a1` has three `undefined` elements; `a2` has three holes. Both arrays have length 3, and reading each index yields `undefined`.

But they behave differently:

```javascript
0 in a1 // true
0 in a2 // false

a1.hasOwnProperty(0) // true
a2.hasOwnProperty(0) // false

Object.keys(a1) // ["0", "1", "2"]
Object.keys(a2) // []

a1.map(n => 1) // [1, 1, 1]
a2.map(n => 1) // [, , ,]
```

`in`, `hasOwnProperty`, and `Object.keys` show that `a2` does not have property names for those indices. `map` shows that `a2` does not iterate over holes.

Why do holes and `undefined` elements behave differently? [Section 12.2.5 (Array initialization)](https://www.ecma-international.org/ecma-262/6.0/#sec-array-initializer) says:

> "Array elements may be elided at the beginning, middle or end of the element list. Whenever a comma in the element list is not preceded by an AssignmentExpression (i.e., a comma at the beginning or after another comma), the missing array element contributes to the length of the Array and increases the index of subsequent elements. Elided array elements are not defined. If an element is elided at the end of an array, that element does not contribute to the length of the Array."

Translation:

> "Array elements may be omitted. Whenever a comma is not preceded by any expression, the array’s `length` is incremented and the index of later elements increases accordingly. Elided elements are not defined. If the elided element is at the end, it does not increase `length`."

So holes contribute to `length` and occupy positions, but those positions have no defined value. Reading them returns `undefined` (the JavaScript value meaning "absent").

That explains why `in`, `hasOwnProperty`, and `Object.keys` do not see hole indices: those indices simply do not exist as properties; the spec does not assign property names to holes, only increments the next element’s index.

As for why `map` skips holes, see the next section.

## Array map method

[Section 22.1.3.15](https://www.ecma-international.org/ecma-262/6.0/#sec-array.prototype.map) defines the `map` method. The overview does not mention holes.

The algorithm:

> 1. Let `O` be `ToObject(this value)`.
> 1. `ReturnIfAbrupt(O)`.
> 1. Let `len` be `ToLength(Get(O, "length"))`.
> 1. `ReturnIfAbrupt(len)`.
> 1. If `IsCallable(callbackfn)` is `false`, throw a TypeError exception.
> 1. If `thisArg` was supplied, let `T` be `thisArg`; else let `T` be `undefined`.
> 1. Let `A` be `ArraySpeciesCreate(O, len)`.
> 1. `ReturnIfAbrupt(A)`.
> 1. Let `k` be 0.
> 1. Repeat, while `k` < `len`
>    1. Let `Pk` be `ToString(k)`.
>    1. Let `kPresent` be `HasProperty(O, Pk)`.
>    1. `ReturnIfAbrupt(kPresent)`.
>    1. If `kPresent` is `true`, then
>       1. Let `kValue` be `Get(O, Pk)`.
>       1. `ReturnIfAbrupt(kValue)`.
>       1. Let `mappedValue` be `Call(callbackfn, T, «kValue, k, O»)`.
>       1. `ReturnIfAbrupt(mappedValue)`.
>       1. Let `status` be `CreateDataPropertyOrThrow (A, Pk, mappedValue)`.
>       1. `ReturnIfAbrupt(status)`.
>    1. Increase `k` by 1.
> 1. Return `A`.

Translated:

> 1. Get the current array’s `this` object.
> 1. If error, return.
> 1. Get the current array’s `length`.
> 1. If error, return.
> 1. If `callbackfn` is not callable, throw.
> 1. If `thisArg` was provided, set `T` to it; else `T` is `undefined`.
> 1. Create a new array `A` with the same length as the current array.
> 1. If error, return.
> 1. Set `k` to 0.
> 1. While `k` < length:
>    1. Set `Pk` to `ToString(k)`.
>    1. Set `kPresent` to `HasProperty(O, Pk)` (does this index exist?).
>    1. If error, return.
>    1. If `kPresent` is `true`:
>       1. Set `kValue` to `Get(O, Pk)`.
>       1. If error, return.
>       1. Set `mappedValue` to `Call(callbackfn, T, «kValue, k, O»)`.
>       1. If error, return.
>       1. Set `status` to `CreateDataPropertyOrThrow(A, Pk, mappedValue)`.
>       1. If error, return.
>    1. Increment `k`.
> 1. Return `A`.

In step 10.2, for arrays with holes, `kPresent` is `false` for those indices, because holes have no property. So the callback is never run for holes.

```javascript
const arr = [, , ,];
arr.map(n => {
  console.log(n);
  return 1;
}) // [, , ,]
```

The V8 implementation of `map` matches this algorithm exactly: [array.js](https://github.com/v8/v8/blob/44c44521ae11859478b42004f57ea93df52526ee/src/js/array.js#L1347).

```javascript
function ArrayMap(f, receiver) {
  CHECK_OBJECT_COERCIBLE(this, "Array.prototype.map");

  // Pull out the length so that modifications to the length in the
  // loop will not affect the looping and side effects are visible.
  var array = TO_OBJECT(this);
  var length = TO_LENGTH_OR_UINT32(array.length);
  return InnerArrayMap(f, receiver, array, length);
}

function InnerArrayMap(f, receiver, array, length) {
  if (!IS_CALLABLE(f)) throw MakeTypeError(kCalledNonCallable, f);

  var accumulator = new InternalArray(length);
  var is_array = IS_ARRAY(array);
  var stepping = DEBUG_IS_STEPPING(f);
  for (var i = 0; i < length; i++) {
    if (HAS_INDEX(array, i, is_array)) {
      var element = array[i];
      // Prepare break slots for debugger step in.
      if (stepping) %DebugPrepareStepInIfStepping(f);
      accumulator[i] = %_Call(f, receiver, element, i, array);
    }
  }
  var result = new GlobalArray();
  %MoveArrayContents(accumulator, result);
  return result;
}
```
