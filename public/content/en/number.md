# Number Extensions

## Binary and Octal Literals

ES6 adds new literal forms for binary and octal numbers, using the prefixes `0b` (or `0B`) and `0o` (or `0O`).

```javascript
0b111110111 === 503 // true
0o767 === 503 // true
```

Since ES5 strict mode, octal can no longer use the prefix `0`. ES6 specifies that octal must use the `0o` prefix instead.

```javascript
// non-strict mode
(function(){
  console.log(0o11 === 011);
})() // true

// strict mode
(function(){
  'use strict';
  console.log(0o11 === 011);
})() // Uncaught SyntaxError: Octal literals are not allowed in strict mode.
```

To convert binary or octal string literals to decimal, use `Number`:

```javascript
Number('0b111')  // 7
Number('0o10')  // 8
```

## Numeric Separators

In many languages, long numbers use a separator (often a comma) every three digits, e.g. `1,000` instead of `1000`. [ES2021](https://github.com/tc39/proposal-numeric-separator) allows JavaScript to use underscores (`_`) as numeric separators.

```javascript
let budget = 1_000_000_000_000;
budget === 10 ** 12 // true
```

The separator can be placed at any digit grouping; it need not be every three digits.

```javascript
123_00 === 12_300 // true

12345_00 === 123_4500 // true
12345_00 === 1_234_500 // true
```

Decimals and scientific notation can use separators too:

```javascript
0.000_001

1e10_000
```

Rules:

- Cannot appear at the very start or end of the number
- Cannot have two or more consecutive separators
- Cannot appear immediately before or after the decimal point
- Cannot appear immediately before or after `e` or `E` in scientific notation

These are invalid:

```javascript
3_.141
3._141
1_e12
1e_12
123__456
_1464301
1464301_
```

Other bases (binary, hex, etc.) can use separators:

```javascript
0b1010_0001_1000_0101
0xA0_B0_C0
```

Numeric separators cannot appear immediately after the base prefix (`0b`, `0B`, `0o`, `0O`, `0x`, `0X`):

```javascript
0_b111111000   // error
0b_111111000   // error
```

Separators are for readability only; they do not affect storage or output:

```javascript
let num = 12_345;

num // 12345
num.toString() // 12345
```

The functions that parse strings to numbers do not support numeric separators:

- `Number()`
- `parseInt()`
- `parseFloat()`

```javascript
Number('123_456') // NaN
parseInt('123_456') // 123
```

## Number.isFinite(), Number.isNaN()

ES6 adds `Number.isFinite()` and `Number.isNaN()`.

`Number.isFinite()` checks whether a value is a finite number (not `Infinity`):

```javascript
Number.isFinite(15); // true
Number.isFinite(0.8); // true
Number.isFinite(NaN); // false
Number.isFinite(Infinity); // false
Number.isFinite(-Infinity); // false
Number.isFinite('foo'); // false
Number.isFinite('15'); // false
Number.isFinite(true); // false
```

If the argument is not a number, `Number.isFinite` returns `false`.

`Number.isNaN()` checks whether a value is `NaN`:

```javascript
Number.isNaN(NaN) // true
Number.isNaN(15) // false
Number.isNaN('15') // false
Number.isNaN(true) // false
Number.isNaN(9/NaN) // true
Number.isNaN('true' / 0) // true
Number.isNaN('true' / 'true') // true
```

If the argument is not `NaN`, `Number.isNaN` returns `false`.

The difference from the global `isFinite()` and `isNaN()`: the global functions coerce non-numeric values with `Number()` before checking. `Number.isFinite` returns `false` for non-numbers; `Number.isNaN` returns `true` only for `NaN`.

```javascript
isFinite(25) // true
isFinite("25") // true
Number.isFinite(25) // true
Number.isFinite("25") // false

isNaN(NaN) // true
isNaN("NaN") // true
Number.isNaN(NaN) // true
Number.isNaN("NaN") // false
Number.isNaN(1) // false
```

## Number.parseInt(), Number.parseFloat()

ES6 adds `Number.parseInt` and `Number.parseFloat`, delegating to the global functions. Behavior is identical.

```javascript
Number.parseInt('12.34') // 12
Number.parseFloat('123.45#') // 123.45

Number.parseInt === parseInt // true
Number.parseFloat === parseFloat // true
```

## Number.isInteger()

`Number.isInteger()` checks whether a value is an integer:

```javascript
Number.isInteger(25) // true
Number.isInteger(25.1) // false
```

In JavaScript, integers and floats share the same storage format, so 25 and 25.0 are the same:

```javascript
Number.isInteger(25) // true
Number.isInteger(25.0) // true
```

Non-numeric values return `false`.

Due to IEEE 754, numbers are stored in 64-bit double precision. Beyond 53 significant bits, trailing digits are lost. This can cause `Number.isInteger` to misreport:

```javascript
Number.isInteger(3.0000000000000002) // true
```

Values smaller than `Number.MIN_VALUE` (5E-324) are rounded to 0:

```javascript
Number.isInteger(5E-324) // false
Number.isInteger(5E-325) // true
```

For high-precision requirements, avoid relying on `Number.isInteger()` alone.

## Number.EPSILON

ES6 adds `Number.EPSILON`, a tiny constant. It represents the difference between 1 and the smallest representable value greater than 1.

For 64-bit floats, that smallest value has the form `1.00..001` (51 zeros). So `Number.EPSILON` equals 2<sup>-52</sup>.

```javascript
Number.EPSILON === Math.pow(2, -52)
// true
Number.EPSILON.toFixed(20)
// "0.00000000000000022204"
```

`Number.EPSILON` can define an acceptable error margin for float comparisons:

```javascript
0.1 + 0.2
// 0.30000000000000004

0.1 + 0.2 === 0.3 // false
```

A simple tolerance check:

```javascript
function withinErrorMargin(left, right) {
  return Math.abs(left - right) < Number.EPSILON * Math.pow(2, 2);
}

withinErrorMargin(0.1 + 0.2, 0.3) // true
withinErrorMargin(1.1 + 1.3, 2.4) // true
```

## Safe Integers and Number.isSafeInteger()

JavaScript can exactly represent integers in the range -(2<sup>53</sup>) to 2<sup>53</sup> (exclusive). Outside this range, precision is lost.

```javascript
Math.pow(2, 53) === Math.pow(2, 53) + 1
// true
```

ES6 adds `Number.MAX_SAFE_INTEGER` and `Number.MIN_SAFE_INTEGER` for these limits.

`Number.isSafeInteger()` checks whether an integer is within this range.

When validating arithmetic, check both the operands and the result, not just the result:

```javascript
Number.isSafeInteger(9007199254740993 - 990) // true
9007199254740993 - 990
// 9007199254740002 (incorrect; correct is 9007199254740003)
```

Because `9007199254740993` exceeds the safe range, it is stored as `9007199254740992`, so the subtraction is already wrong. A safer approach:

```javascript
function trusty(left, right, result) {
  if (
    Number.isSafeInteger(left) &&
    Number.isSafeInteger(right) &&
    Number.isSafeInteger(result)
  ) {
    return result;
  }
  throw new RangeError('Operation cannot be trusted!');
}
```

## Math Extensions

ES6 adds 17 new static methods to `Math`.

### Math.trunc()

`Math.trunc` removes the fractional part and returns the integer part:

```javascript
Math.trunc(4.1) // 4
Math.trunc(4.9) // 4
Math.trunc(-4.1) // -4
Math.trunc(-4.9) // -4
Math.trunc(-0.1234) // -0
```

Non-numeric values are coerced via `Number`:

```javascript
Math.trunc('123.456') // 123
Math.trunc(true) // 1
Math.trunc(false) // 0
Math.trunc(null) // 0
```

For empty or non-numeric values, it returns `NaN`:

```javascript
Math.trunc(NaN);      // NaN
Math.trunc('foo');    // NaN
Math.trunc();         // NaN
Math.trunc(undefined) // NaN
```

Simple polyfill:

```javascript
Math.trunc = Math.trunc || function(x) {
  return x < 0 ? Math.ceil(x) : Math.floor(x);
};
```

### Math.sign()

`Math.sign` returns the sign of a number:

- Positive: `+1`
- Negative: `-1`
- Zero: `0`
- Negative zero: `-0`
- Otherwise: `NaN`

```javascript
Math.sign(-5) // -1
Math.sign(5) // +1
Math.sign(0) // +0
Math.sign(-0) // -0
Math.sign(NaN) // NaN
```

For non-numeric values, it coerces first:

```javascript
Math.sign('')  // 0
Math.sign(true)  // +1
Math.sign(false)  // 0
Math.sign(null)  // 0
Math.sign('9')  // +1
Math.sign('foo')  // NaN
Math.sign()  // NaN
Math.sign(undefined)  // NaN
```

Simple polyfill:

```javascript
Math.sign = Math.sign || function(x) {
  x = +x;
  if (x === 0 || isNaN(x)) {
    return x;
  }
  return x > 0 ? 1 : -1;
};
```

### Math.cbrt()

`Math.cbrt()` returns the cube root:

```javascript
Math.cbrt(-1) // -1
Math.cbrt(0)  // 0
Math.cbrt(1)  // 1
Math.cbrt(2)  // 1.2599210498948732
```

Non-numeric values are coerced. Simple polyfill:

```javascript
Math.cbrt = Math.cbrt || function(x) {
  var y = Math.pow(Math.abs(x), 1/3);
  return x < 0 ? -y : y;
};
```

### Math.clz32()

`Math.clz32()` converts the argument to a 32-bit unsigned integer and returns the count of leading zero bits:

```javascript
Math.clz32(0) // 32
Math.clz32(1) // 31
Math.clz32(1000) // 22
Math.clz32(0b01000000000000000000000000000000) // 1
```

The name comes from "count leading zero bits in 32-bit binary representation." It relates to the left shift operator: `Math.clz32(1 << n)` decreases as `n` increases.

### Math.imul()

`Math.imul` returns the product of two numbers as a 32-bit signed integer:

```javascript
Math.imul(2, 4)   // 8
Math.imul(-1, 8)  // -8
Math.imul(-2, -2) // 4
```

For most cases, it behaves like `(a * b)|0`. It matters when multiplying very large numbers: JavaScript has limited precision, and `Math.imul` returns the correct lower 32 bits when the full product exceeds 2<sup>53</sup>.

### Math.fround()

`Math.fround` returns the 32-bit single-precision float form of the argument. For integers in the range -2<sup>24</sup> to 2<sup>24</sup> (exclusive), the result equals the argument. Beyond that, precision is lost.

### Math.hypot()

`Math.hypot` returns the square root of the sum of the squares of its arguments:

```javascript
Math.hypot(3, 4) // 5
```

### Math.f16round()

ES2025 adds `Math.f16round()`, which returns the nearest 16-bit half-precision float:

```javascript
Math.f16round(5) // 5
Math.f16round(5.05) // 5.05078125
```

16-bit floats use 5 bits for exponent, 1 for sign, and 10 for mantissa, so they can represent values up to about ±65,504. Values beyond that return `Infinity`.

### Logarithm Methods

- `Math.expm1(x)`: returns e<sup>x</sup> - 1
- `Math.log1p(x)`: returns ln(1 + x); returns NaN if x < -1
- `Math.log10(x)`: base-10 logarithm
- `Math.log2(x)`: base-2 logarithm

### Hyperbolic Functions

- `Math.sinh(x)`, `Math.cosh(x)`, `Math.tanh(x)`
- `Math.asinh(x)`, `Math.acosh(x)`, `Math.atanh(x)`

## BigInt

### Introduction

JavaScript numbers are 64-bit floats. This limits precision (53 bits) and maximum magnitude (2<sup>1024</sup> returns `Infinity`). [ES2020](https://github.com/tc39/proposal-bigint) adds `BigInt` for arbitrary-precision integers.

```javascript
const a = 2172141653n;
const b = 15346349309n;

a * b // 33334444555566667777n

Number(a) * Number(b) // 33334444555566670000
```

BigInt literals use the `n` suffix:

```javascript
1234n
0b1101n
0o777n
0xFFn
```

BigInt and Number are different types:

```javascript
42n === 42 // false
typeof 123n // 'bigint'
```

BigInt can be negative with `-`, but not with `+` (to avoid conflict with asm.js).

### BigInt()

`BigInt()` converts values to BigInt. Rules are similar to `Number()`, but `BigInt` does not accept decimals or `NaN`/`Infinity`:

```javascript
BigInt(123) // 123n
BigInt('123') // 123n
BigInt(1.5) // RangeError
```

Static methods:

- `BigInt.asUintN(width, bigint)`: value modulo 2<sup>width</sup>
- `BigInt.asIntN(width, bigint)`: signed value in `-2<sup>width-1</sup>` to `2<sup>width-1</sup> - 1`

### Conversion

Use `Boolean()`, `Number()`, and `String()` to convert BigInt. Note: `Number(bigint)` may lose precision for large values.

### Arithmetic

BigInt supports `+`, `-`, `*`, `/`, `**`. Division truncates (no fractional part).

`>>>` and unary `+` are not supported for BigInt.

BigInt and Number cannot be mixed in arithmetic; convert explicitly:

```javascript
1n + 1.3 // error
Math.sqrt(4n) // error
Math.sqrt(Number(4n)) // 2
```

### Comparisons

Comparison and loose equality allow mixing BigInt and Number:

```javascript
0n < 1 // true
0n == 0 // true
0n === 0 // false
```
