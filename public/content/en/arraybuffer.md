# ArrayBuffer

The `ArrayBuffer` object, `TypedArray` views, and `DataView` views form the JavaScript interface for manipulating binary data. These objects have existed for some time as part of a separate specification (published February 2011); ES6 brought them into the ECMAScript specification and added new methods. They all handle binary data using array syntax, so they are collectively referred to as typed arrays.

The original design goal of this interface was related to the WebGL project. WebGL is the communication interface between the browser and the GPU. To support large amounts of real-time data exchange between JavaScript and the GPU, their data communication must be binary, not in traditional text format. Transmitting a 32-bit integer in text format requires both the JavaScript script and the GPU to convert the format at each end, which is very time-consuming. If there were a mechanism to operate on bytes directly (like in C), sending a 4-byte 32-bit integer unchanged in binary form to the GPU would greatly improve script performance.

Typed arrays were born in this context. They resemble C arrays, allowing developers to operate on memory directly using array subscript notation, significantly enhancing JavaScript's ability to process binary data and enabling communication with the operating system's native interfaces through JavaScript.

Typed arrays consist of three types of objects.

**(1) `ArrayBuffer` object**: Represents a block of binary data in memory that can be manipulated through "views." Views implement the array interface, meaning memory can be operated on using array methods.

**(2) `TypedArray` views**: A total of 9 view types, including `Uint8Array` (unsigned 8-bit integer) array view, `Int16Array` (16-bit integer) array view, `Float32Array` (32-bit floating-point) array view, etc.

**(3) `DataView` view**: Allows custom composite format views. For example, the first byte could be Uint8 (unsigned 8-bit integer), bytes 2–3 could be Int16 (16-bit integer), from the fourth byte onward could be Float32 (32-bit floating-point), etc. Byte order can also be customized.

In short, the `ArrayBuffer` object represents raw binary data; `TypedArray` views read and write simple types of binary data; and `DataView` views read and write complex types of binary data.

There are 12 data types supported by `TypedArray` views.

| Data Type | Byte Length | Meaning | Corresponding C Type |
| --------- | ----------- | ------- | -------------------- |
| Int8 | 1 | 8-bit signed integer | signed char |
| Uint8 | 1 | 8-bit unsigned integer | unsigned char |
| Uint8C | 1 | 8-bit unsigned integer (clamps overflow) | unsigned char |
| Int16 | 2 | 16-bit signed integer | short |
| Uint16 | 2 | 16-bit unsigned integer | unsigned short |
| Int32 | 4 | 32-bit signed integer | int |
| Uint32 | 4 | 32-bit unsigned integer | unsigned int |
| BigInt64 | 8 | 64-bit signed integer |   |
| BigUint64 | 8 | 64-bit unsigned integer |   |
| Float16 | 2 | 16-bit floating-point |   |
| Float32 | 4 | 32-bit floating-point | float |
| Float64 | 8 | 64-bit floating-point | double |

Note that typed arrays are not real arrays; they are array-like objects.

Many browser APIs use typed arrays to manipulate binary data. A few examples:

- [Canvas](#canvas)
- [Fetch API](#fetch-api)
- [File API](#file-api)
- [WebSockets](#websocket)
- [XMLHttpRequest](#ajax)

## ArrayBuffer Object

### Overview

The `ArrayBuffer` object represents a block of memory that stores binary data. It cannot be read or written directly; it must be accessed through views (`TypedArray` views or `DataView` views), which interpret the binary data in a specified format.

`ArrayBuffer` is also a constructor used to allocate a contiguous region of memory for storing data.

```javascript
const buf = new ArrayBuffer(32);
```

The code above creates a 32-byte memory region, with each byte defaulting to 0. The `ArrayBuffer` constructor takes the required memory size (in bytes) as its argument.

To read or write this memory, you must create a view. The `DataView` view requires an `ArrayBuffer` instance as its argument.

```javascript
const buf = new ArrayBuffer(32);
const dataView = new DataView(buf);
dataView.getUint8(0) // 0
```

The code above creates a `DataView` over 32 bytes of memory and reads the first 8 bits as an unsigned 8-bit integer, which is 0 because the default value of each bit in the original `ArrayBuffer` is 0.

Unlike `DataView`, `TypedArray` is not a single constructor but a set of constructors representing different data formats.

```javascript
const buffer = new ArrayBuffer(12);

const x1 = new Int32Array(buffer);
x1[0] = 1;
const x2 = new Uint8Array(buffer);
x2[0]  = 2;

x1[0] // 2
```

The code above creates two views over the same memory: a 32-bit signed integer view (`Int32Array`) and an 8-bit unsigned integer view (`Uint8Array`). Because both views share the same underlying memory, modifications in one view affect the other.

`TypedArray` constructors can also accept plain arrays. In that case, they allocate memory, create the underlying `ArrayBuffer`, and populate it in one step.

```javascript
const typedArray = new Uint8Array([0,1,2]);
typedArray.length // 3

typedArray[0] = 5;
typedArray // [5, 1, 2]
```

The code above creates an unsigned 8-bit integer view using the `Uint8Array` constructor and a plain array. The underlying memory is both allocated and initialized in one operation.

### ArrayBuffer.prototype.byteLength

The `byteLength` property of an `ArrayBuffer` instance returns the length in bytes of the allocated memory region.

```javascript
const buffer = new ArrayBuffer(32);
buffer.byteLength
// 32
```

For large allocations, allocation can fail if there is not enough contiguous free memory, so it is important to check for success.

```javascript
if (buffer.byteLength === n) {
  // success
} else {
  // failure
}
```

### ArrayBuffer.prototype.slice()

The `ArrayBuffer` instance has a `slice` method that copies a portion of the memory region and returns a new `ArrayBuffer`.

```javascript
const buffer = new ArrayBuffer(8);
const newBuffer = buffer.slice(0, 3);
```

The code above copies the first 3 bytes of `buffer` (from index 0, up to but not including index 3) into a new `ArrayBuffer`. The `slice` method effectively does two steps: first allocate new memory, then copy from the original `ArrayBuffer`.

`slice` takes two arguments: the start byte index (inclusive) and the end byte index (exclusive). If the second argument is omitted, it defaults to the end of the original `ArrayBuffer`.

`ArrayBuffer` provides no other direct read/write methods. Memory must be accessed via views.

### ArrayBuffer.isView()

`ArrayBuffer` has a static method `isView` that returns a boolean indicating whether the argument is an `ArrayBuffer` view instance. It is roughly equivalent to checking if the argument is a `TypedArray` or `DataView` instance.

```javascript
const buffer = new ArrayBuffer(8);
ArrayBuffer.isView(buffer) // false

const v = new Int32Array(buffer);
ArrayBuffer.isView(v) // true
```

## TypedArray Views

### Overview

The `ArrayBuffer` object, as a memory region, can hold various data types. The same memory can be interpreted in different ways depending on the data type; that interpretation is called a "view." There are two kinds of views: `TypedArray` views and `DataView` views. In `TypedArray` views, all elements share the same data type; in `DataView` views, elements can have different types.

Currently, there are 9 `TypedArray` view types, each implemented as a constructor.

- **`Int8Array`**: 8-bit signed integer, 1 byte.
- **`Uint8Array`**: 8-bit unsigned integer, 1 byte.
- **`Uint8ClampedArray`**: 8-bit unsigned integer, 1 byte, with different overflow handling.
- **`Int16Array`**: 16-bit signed integer, 2 bytes.
- **`Uint16Array`**: 16-bit unsigned integer, 2 bytes.
- **`Int32Array`**: 32-bit signed integer, 4 bytes.
- **`Uint32Array`**: 32-bit unsigned integer, 4 bytes.
- **`BigInt64Array`**: 64-bit signed integer, 8 bytes.
- **`BigUint64Array`**: 64-bit unsigned integer, 8 bytes.
- **`Float16Array`**: 16-bit floating-point, 2 bytes.
- **`Float32Array`**: 32-bit floating-point, 4 bytes.
- **`Float64Array`**: 64-bit floating-point, 8 bytes.

Arrays created by these 12 constructors are collectively called `TypedArray` views. They behave much like regular arrays: they have a `length` property, support bracket notation (`[]`) to access elements, and most array methods work on them. Main differences from regular arrays:

- All elements in a TypedArray are of the same type.
- TypedArray elements are contiguous; there are no holes.
- TypedArray elements default to 0. For example, `new Array(10)` returns an array with 10 empty slots; `new Uint8Array(10)` returns a TypedArray with 10 elements, all 0.
- A TypedArray is only a view; it does not store data itself. Data is stored in the underlying `ArrayBuffer`, which can be accessed via the `buffer` property.

### Constructors

TypedArray provides 12 constructors for creating instances of each type.

Constructors can be used in several ways.

**(1)TypedArray(buffer, byteOffset=0, length?)**

Multiple views can be created over the same `ArrayBuffer` with different data types.

```javascript
// Create 8-byte ArrayBuffer
const b = new ArrayBuffer(8);

// Create Int32 view of b, byte 0 to end
const v1 = new Int32Array(b);

// Create Uint8 view of b, byte 2 to end
const v2 = new Uint8Array(b, 2);

// Create Int16 view of b, byte 2, length 2
const v3 = new Int16Array(b, 2, 2);
```

The code above creates three views (`v1`, `v2`, and `v3`) over 8 bytes of memory (`b`).

The view constructors accept three parameters:

- First (required): The underlying `ArrayBuffer` object.
- Second (optional): The byte offset at which the view starts; defaults to 0.
- Third (optional): The number of elements in the view; defaults to the rest of the buffer.

Thus, `v1`, `v2`, and `v3` overlap: `v1[0]` is a 32-bit integer covering bytes 0–3; `v2[0]` is an 8-bit unsigned integer at byte 2; `v3[0]` is a 16-bit integer covering bytes 2–3. Changes made through any view are visible in the others.

Note that `byteOffset` must be aligned to the view’s element size; otherwise an error is thrown.

```javascript
const buffer = new ArrayBuffer(8);
const i16 = new Int16Array(buffer, 1);
// Uncaught RangeError: start offset of Int16Array should be a multiple of 2
```

In the code above, a 16-bit integer view is created starting at byte 1 of an 8-byte `ArrayBuffer`, which throws an error because 16-bit integers require 2-byte alignment, so `byteOffset` must be divisible by 2.

To interpret an `ArrayBuffer` at arbitrary byte boundaries, use a `DataView` view, since `TypedArray` views only support fixed layouts.

**(2)TypedArray(length)**

Views can also be created by allocating memory directly, without an existing `ArrayBuffer`.

```javascript
const f64a = new Float64Array(8);
f64a[0] = 10;
f64a[1] = 20;
f64a[2] = f64a[0] + f64a[1];
```

The code above creates a `Float64Array` of 8 elements (64 bytes) and assigns each element. Here the constructor argument is the number of elements. View arrays are used much like regular arrays.

**(3)TypedArray(typedArray)**

A TypedArray constructor can accept another `TypedArray` instance as an argument.

```javascript
const typedArray = new Int8Array(new Uint8Array(4));
```

Here, the `Int8Array` constructor receives a `Uint8Array` instance.

Note that the new array copies the values; the underlying memory is different. The new array allocates its own storage; it does not create a view over the original array’s memory.

```javascript
const x = new Int8Array([1, 1]);
const y = new Int8Array(x);
x[0] // 1
y[0] // 1

x[0] = 2;
y[0] // 1
```

In the code above, `y` is built from `x`, but when `x` changes, `y` does not.

To create different views over the same memory, use:

```javascript
const x = new Int8Array([1, 1]);
const y = new Int8Array(x.buffer);
x[0] // 1
y[0] // 1

x[0] = 2;
y[0] // 2
```

**(4)TypedArray(arrayLikeObject)**

The constructor can also accept a plain array, which creates the TypedArray and populates it.

```javascript
const typedArray = new Uint8Array([1, 2, 3, 4]);
```

In this case, the TypedArray allocates new memory; it does not create a view over the original array.

The code above creates an 8-bit unsigned integer TypedArray from a plain array.

TypedArrays can be converted back to plain arrays:

```javascript
const normalArray = [...typedArray];
// or
const normalArray = Array.from(typedArray);
// or
const normalArray = Array.prototype.slice.call(typedArray);
```

### Array Methods

The same methods and properties used on plain arrays apply to TypedArrays.

- `TypedArray.prototype.copyWithin(target, start[, end = this.length])`
- `TypedArray.prototype.entries()`
- `TypedArray.prototype.every(callbackfn, thisArg?)`
- `TypedArray.prototype.fill(value, start=0, end=this.length)`
- `TypedArray.prototype.filter(callbackfn, thisArg?)`
- `TypedArray.prototype.find(predicate, thisArg?)`
- `TypedArray.prototype.findIndex(predicate, thisArg?)`
- `TypedArray.prototype.forEach(callbackfn, thisArg?)`
- `TypedArray.prototype.indexOf(searchElement, fromIndex=0)`
- `TypedArray.prototype.join(separator)`
- `TypedArray.prototype.keys()`
- `TypedArray.prototype.lastIndexOf(searchElement, fromIndex?)`
- `TypedArray.prototype.map(callbackfn, thisArg?)`
- `TypedArray.prototype.reduce(callbackfn, initialValue?)`
- `TypedArray.prototype.reduceRight(callbackfn, initialValue?)`
- `TypedArray.prototype.reverse()`
- `TypedArray.prototype.slice(start=0, end=this.length)`
- `TypedArray.prototype.some(callbackfn, thisArg?)`
- `TypedArray.prototype.sort(comparefn)`
- `TypedArray.prototype.toLocaleString(reserved1?, reserved2?)`
- `TypedArray.prototype.toString()`
- `TypedArray.prototype.values()`

For usage of these methods, refer to the array documentation.

Note that TypedArray has no `concat` method. To concatenate multiple TypedArrays, use:

```javascript
function concatenate(resultConstructor, ...arrays) {
  let totalLength = 0;
  for (let arr of arrays) {
    totalLength += arr.length;
  }
  let result = new resultConstructor(totalLength);
  let offset = 0;
  for (let arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

concatenate(Uint8Array, Uint8Array.of(1, 2), Uint8Array.of(3, 4))
// Uint8Array [1, 2, 3, 4]
```

TypedArrays also implement the Iterator interface and can be iterated over.

```javascript
let ui8 = Uint8Array.of(0, 1, 2);
for (let byte of ui8) {
  console.log(byte);
}
// 0
// 1
// 2
```

### Byte Order

Byte order refers to how numeric values are represented in memory.

```javascript
const buffer = new ArrayBuffer(16);
const int32View = new Int32Array(buffer);

for (let i = 0; i < int32View.length; i++) {
  int32View[i] = i * 2;
}
```

The code above creates a 16-byte `ArrayBuffer` and a 32-bit integer view. Since each 32-bit integer occupies 4 bytes, four integers (0, 2, 4, 6) are written.

If a 16-bit integer view is then created over the same memory, the results read back will be different.

```javascript
const int16View = new Int16Array(buffer);

for (let i = 0; i < int16View.length; i++) {
  console.log("Entry " + i + ": " + int16View[i]);
}
// Entry 0: 0
// Entry 1: 0
// Entry 2: 2
// Entry 3: 0
// Entry 4: 4
// Entry 5: 0
// Entry 6: 6
// Entry 7: 0
```

Since each 16-bit integer occupies 2 bytes, the buffer is divided into 8 segments. On x86 systems (little-endian), the least significant byte is stored at the lower address and the most significant at the higher address, which explains the output.

For example, for the 4-byte hexadecimal value `0x12345678`, the most significant byte is `12` and the least significant is `78`. In little-endian, the least significant byte comes first: `78563412`. In big-endian it is the opposite: `12345678`. Most PCs are little-endian, so TypedArrays read and write in little-endian (or more precisely, in the host system’s byte order).

Big-endian is still common in network devices and some operating systems. This creates a problem: if data is big-endian, TypedArrays will not interpret it correctly because they assume the host order. The `DataView` object addresses this by allowing the byte order to be specified.

Here is another example.

```javascript
// Assume buffer contains bytes [0x02, 0x01, 0x03, 0x07]
const buffer = new ArrayBuffer(4);
const v1 = new Uint8Array(buffer);
v1[0] = 2;
v1[1] = 1;
v1[2] = 3;
v1[3] = 7;

const uInt16View = new Uint16Array(buffer);

// Little-endian byte order
// First two bytes equal 258
if (uInt16View[0] === 258) {
  console.log('OK'); // "OK"
}

// Assignment
uInt16View[0] = 255;    // bytes become [0xFF, 0x00, 0x03, 0x07]
uInt16View[0] = 0xff05; // bytes become [0x05, 0xFF, 0x03, 0x07]
uInt16View[1] = 0x0210; // bytes become [0x05, 0xFF, 0x10, 0x02]
```

The following function detects whether the platform uses little-endian or big-endian.

```javascript
const BIG_ENDIAN = Symbol('BIG_ENDIAN');
const LITTLE_ENDIAN = Symbol('LITTLE_ENDIAN');

function getPlatformEndianness() {
  let arr32 = Uint32Array.of(0x12345678);
  let arr8 = new Uint8Array(arr32.buffer);
  switch ((arr8[0]*0x1000000) + (arr8[1]*0x10000) + (arr8[2]*0x100) + (arr8[3])) {
    case 0x12345678:
      return BIG_ENDIAN;
    case 0x78563412:
      return LITTLE_ENDIAN;
    default:
      throw new Error('Unknown endianness');
  }
}
```

Compared with plain arrays, the main advantage of TypedArrays is that they operate directly on memory without type conversion, which makes them much faster.

### BYTES_PER_ELEMENT Property

Each view constructor has a `BYTES_PER_ELEMENT` property indicating the number of bytes per element.

```javascript
Int8Array.BYTES_PER_ELEMENT // 1
Uint8Array.BYTES_PER_ELEMENT // 1
Uint8ClampedArray.BYTES_PER_ELEMENT // 1
Int16Array.BYTES_PER_ELEMENT // 2
Uint16Array.BYTES_PER_ELEMENT // 2
Int32Array.BYTES_PER_ELEMENT // 4
Uint32Array.BYTES_PER_ELEMENT // 4
Float32Array.BYTES_PER_ELEMENT // 4
Float64Array.BYTES_PER_ELEMENT // 8
```

This property is also available on TypedArray instances via `TypedArray.prototype.BYTES_PER_ELEMENT`.

### Converting ArrayBuffer and String

To convert between `ArrayBuffer` and string, use the native `TextEncoder` and `TextDecoder`. For clarity, the code below includes TypeScript-style type annotations.

```javascript
/**
 * Convert ArrayBuffer/TypedArray to String via TextDecoder
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder
 */
function ab2str(
  input: ArrayBuffer | Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array,
  outputEncoding: string = 'utf8',
): string {
  const decoder = new TextDecoder(outputEncoding)
  return decoder.decode(input)
}

/**
 * Convert String to ArrayBuffer via TextEncoder
 *
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/TextEncoder
 */
function str2ab(input: string): ArrayBuffer {
  const view = str2Uint8Array(input)
  return view.buffer
}

/** Convert String to Uint8Array */
function str2Uint8Array(input: string): Uint8Array {
  const encoder = new TextEncoder()
  const view = encoder.encode(input)
  return view
}
```

The second parameter `outputEncoding` of `ab2str()` specifies the output encoding (default `utf-8`). For other options, see the [WHATWG spec](https://encoding.spec.whatwg.org) or [Node.js docs](https://nodejs.org/api/util.html#util_whatwg_supported_encodings).

### Overflow

Each view type has a fixed numeric range. Values outside that range overflow. For example, an 8-bit view can only hold an 8-bit binary value; storing a 9-bit value causes overflow.

TypedArray overflow handling discards the overflowed bits and then interprets the result according to the view type.

```javascript
const uint8 = new Uint8Array(1);

uint8[0] = 256;
uint8[0] // 0

uint8[0] = -1;
uint8[0] // 255
```

In the code above, `uint8` is an 8-bit view, and 256 in binary is `100000000` (9 bits), so overflow occurs. Only the lower 8 bits are kept: `00000000`. Interpreted as an unsigned 8-bit integer, that is 0.

Negative numbers are represented in two’s complement. The complement of the positive value is computed, then 1 is added. For `-1`, the positive form is `1`; its bitwise negation is `11111110`; adding 1 yields `11111111`. `uint8` interprets that as unsigned 8-bit, which is 255.

A simple rule can be summarized as:

- Positive overflow: When the input is greater than the maximum, the result is the minimum plus the remainder, minus 1.
- Negative overflow (underflow): When the input is less than the minimum, the result is the maximum minus the absolute value of the remainder, plus 1.

The "remainder" here is the result of the modulo operation (the `%` operator in JavaScript).

```javascript
12 % 4 // 0
12 % 5 // 2
```

12 divided by 4 has no remainder; divided by 5 the remainder is 2.

Example:

```javascript
const int8 = new Int8Array(1);

int8[0] = 128;
int8[0] // -128

int8[0] = -129;
int8[0] // 127
```

Here `int8` is a signed 8-bit integer view: max 127, min -128. For 128 (positive overflow by 1), the rule yields -128. For -129 (negative overflow by 1), the rule yields 127.

The `Uint8ClampedArray` view uses different overflow rules. On positive overflow, the value is clamped to the maximum (255); on negative overflow, to the minimum (0).

```javascript
const uint8c = new Uint8ClampedArray(1);

uint8c[0] = 256;
uint8c[0] // 255

uint8c[0] = -1;
uint8c[0] // 0
```

In this example, `uint8C` is a `Uint8ClampedArray`; positive overflow yields 255 and negative overflow yields 0.

### TypedArray.prototype.buffer

The `buffer` property of a TypedArray instance returns the underlying `ArrayBuffer` object. It is read-only.

```javascript
const a = new Float32Array(64);
const b = new Uint8Array(a.buffer);
```

Here `a` and `b` share the same `ArrayBuffer`, i.e. the same block of memory.

### TypedArray.prototype.byteLength, TypedArray.prototype.byteOffset

The `byteLength` property returns the length of the TypedArray in bytes. The `byteOffset` property returns the byte offset into the underlying `ArrayBuffer` where the view starts. Both are read-only.

```javascript
const b = new ArrayBuffer(8);

const v1 = new Int32Array(b);
const v2 = new Uint8Array(b, 2);
const v3 = new Int16Array(b, 2, 2);

v1.byteLength // 8
v2.byteLength // 6
v3.byteLength // 4

v1.byteOffset // 0
v2.byteOffset // 2
v3.byteOffset // 2
```

### TypedArray.prototype.length

The `length` property is the number of elements in the TypedArray. It differs from `byteLength`, which is the length in bytes.

```javascript
const a = new Int16Array(8);

a.length // 8
a.byteLength // 16
```

### TypedArray.prototype.set()

The `set` method of a TypedArray copies data from a plain array or another TypedArray into the underlying memory.

```javascript
const a = new Uint8Array(8);
const b = new Uint8Array(8);

b.set(a);
```

The code above copies `a` into `b` as a block copy, which is much faster than copying element by element.

`set` can take a second argument, the index in the target array where copying starts.

```javascript
const a = new Uint16Array(8);
const b = new Uint16Array(10);

b.set(a, 2)
```

Here `b` is larger than `a`, so copying starts at `b[2]`.

### TypedArray.prototype.subarray()

The `subarray` method creates a new view over a portion of a TypedArray.

```javascript
const a = new Uint16Array(8);
const b = a.subarray(2,3);

a.byteLength // 16
b.byteLength // 2
```

The first argument is the start index, the second is the end index (exclusive). If the second is omitted, the rest of the array is included. So `a.subarray(2,3)` gives a view containing only `a[2]`, with byte length 2.

### TypedArray.prototype.slice()

The `slice` method of a TypedArray instance returns a new TypedArray with a copy of the specified region.

```javascript
let ui8 = Uint8Array.of(0, 1, 2);
ui8.slice(-1)
// Uint8Array [ 2 ]
```

The `slice` arguments specify where the new view starts (and optionally ends). Negative indices count from the end: -1 is the last element, -2 the second-to-last, etc.

### TypedArray.of()

All TypedArray constructors have a static `of` method that turns its arguments into a TypedArray instance.

```javascript
Float32Array.of(0.151, -8, 3.7)
// Float32Array [ 0.151, -8, 3.7 ]
```

These three approaches all create the same TypedArray:

```javascript
// Method 1
let tarr = new Uint8Array([1,2,3]);

// Method 2
let tarr = Uint8Array.of(1,2,3);

// Method 3
let tarr = new Uint8Array(3);
tarr[0] = 1;
tarr[1] = 2;
tarr[2] = 3;
```

### TypedArray.from()

The static `from` method accepts an iterable (e.g. an array) and returns a TypedArray instance based on it.

```javascript
Uint16Array.from([0, 1, 2])
// Uint16Array [ 0, 1, 2 ]
```

It can also convert one TypedArray type to another.

```javascript
const ui16 = Uint16Array.from(Uint8Array.of(0, 1, 2));
ui16 instanceof Uint16Array // true
```

`from` can take a second argument, a function applied to each element (similar to `map`).

```javascript
Int8Array.of(127, 126, 125).map(x => 2 * x)
// Int8Array [ -2, -4, -6 ]

Int16Array.from(Int8Array.of(127, 126, 125), x => 2 * x)
// Int16Array [ 254, 252, 250 ]
```

In the example above, `from` does not overflow because the mapping is not done on the original 8-bit array. `from` copies the first argument into new memory, processes it, then converts to the target TypedArray format.

## Composite Views

Because view constructors can specify start position and length, different data types can be laid out sequentially in the same memory region. This is called a "composite view."

```javascript
const buffer = new ArrayBuffer(24);

const idView = new Uint32Array(buffer, 0, 1);
const usernameView = new Uint8Array(buffer, 4, 16);
const amountDueView = new Float32Array(buffer, 20, 1);
```

The code above divides a 24-byte `ArrayBuffer` into three parts:

- Bytes 0–3: one 32-bit unsigned integer
- Bytes 4–19: sixteen 8-bit integers
- Bytes 20–23: one 32-bit floating-point number

In C, this could be described as:

```c
struct someStruct {
  unsigned long id;
  char username[16];
  float amountDue;
};
```

## DataView View

For data that mixes multiple types (e.g. HTTP responses), you can use either composite TypedArray views or a `DataView` view.

`DataView` offers more control and supports configurable byte order. `TypedArray` views were designed for sending data to local devices (e.g. network card, sound card) and therefore use the host byte order. `DataView` was designed for data from network devices where byte order may need to be specified.

`DataView` is a constructor that takes an `ArrayBuffer` and creates a view.

```javascript
new DataView(ArrayBuffer buffer [, byteOffset [, length]]);
```

Example:

```javascript
const buffer = new ArrayBuffer(24);
const dv = new DataView(buffer);
```

`DataView` instances have these properties, with the same meaning as on TypedArray:

- `DataView.prototype.buffer`: Returns the underlying ArrayBuffer
- `DataView.prototype.byteLength`: Returns the length in bytes
- `DataView.prototype.byteOffset`: Returns the byte offset into the ArrayBuffer

`DataView` provides 11 methods for reading memory:

- **`getInt8`**: Read 1 byte, return an 8-bit integer
- **`getUint8`**: Read 1 byte, return an unsigned 8-bit integer
- **`getInt16`**: Read 2 bytes, return a 16-bit integer
- **`getUint16`**: Read 2 bytes, return an unsigned 16-bit integer
- **`getInt32`**: Read 4 bytes, return a 32-bit integer
- **`getUint32`**: Read 4 bytes, return an unsigned 32-bit integer
- **`getBigInt64`**: Read 8 bytes, return a 64-bit integer
- **`getBigUint64`**: Read 8 bytes, return an unsigned 64-bit integer
- **`getFloat16`**: Read 2 bytes, return a 16-bit float
- **`getFloat32`**: Read 4 bytes, return a 32-bit float
- **`getFloat64`**: Read 8 bytes, return a 64-bit float

Each `get` method takes a byte index (non-negative) as the starting position.

```javascript
const buffer = new ArrayBuffer(24);
const dv = new DataView(buffer);

// Read 8-bit uint from byte 1
const v1 = dv.getUint8(0);

// Read 16-bit uint from byte 2
const v2 = dv.getUint16(1);

// Read 16-bit uint from byte 4
const v3 = dv.getUint16(3);
```

The code above reads the first 5 bytes: one 8-bit integer and two 16-bit integers.

For reads of 2 or more bytes, the storage format (little-endian or big-endian) must be known. By default, `DataView`’s `get` methods use big-endian. To use little-endian, pass `true` as the second argument.

```javascript
// Little-endian
const v1 = dv.getUint16(1, true);

// Big-endian
const v2 = dv.getUint16(3, false);

// Big-endian
const v3 = dv.getUint16(3);
```

DataView provides 11 methods for writing memory:

- **`setInt8`**: Write 1 byte (8-bit integer)
- **`setUint8`**: Write 1 byte (unsigned 8-bit integer)
- **`setInt16`**: Write 2 bytes (16-bit integer)
- **`setUint16`**: Write 2 bytes (unsigned 16-bit integer)
- **`setInt32`**: Write 4 bytes (32-bit integer)
- **`setUint32`**: Write 4 bytes (unsigned 32-bit integer)
- **`setBigInt64`**: Write 8 bytes (64-bit integer)
- **`setBigUint64`**: Write 8 bytes (unsigned 64-bit integer)
- **`setFloat16`**: Write 2 bytes (16-bit float)
- **`setFloat32`**: Write 4 bytes (32-bit float)
- **`setFloat64`**: Write 8 bytes (64-bit float)

Each `set` method takes a byte index and the value to write. For methods that write 2 or more bytes, a third parameter specifies byte order: `false` or `undefined` for big-endian, `true` for little-endian.

```javascript
// Write 32-bit int 25 at byte 1, big-endian
dv.setInt32(0, 25, false);

// Write 32-bit int 25 at byte 5, big-endian
dv.setInt32(4, 25);

// Write 32-bit float 2.5 at byte 9, little-endian
dv.setFloat32(8, 2.5, true);
```

To detect the host’s byte order:

```javascript
const littleEndian = (function() {
  const buffer = new ArrayBuffer(2);
  new DataView(buffer).setInt16(0, 256, true);
  return new Int16Array(buffer)[0] === 256;
})();
```

If it returns `true`, the host is little-endian; if `false`, big-endian.

## Applications of Typed Arrays

Many Web APIs use `ArrayBuffer` and its view objects.

### AJAX

Traditionally, AJAX could only return text (`responseType` default `text`). XMLHttpRequest Level 2 allows binary responses: set `responseType` to `arraybuffer` when the type is known, or `blob` when it is not.

```javascript
let xhr = new XMLHttpRequest();
xhr.open('GET', someUrl);
xhr.responseType = 'arraybuffer';

xhr.onload = function () {
  let arrayBuffer = xhr.response;
  // ···
};

xhr.send();
```

For 32-bit integer responses:

```javascript
xhr.onreadystatechange = function () {
  if (req.readyState === 4 ) {
    const arrayResponse = xhr.response;
    const dataView = new DataView(arrayResponse);
    const ints = new Uint32Array(dataView.byteLength / 4);

    xhrDiv.style.backgroundColor = "#00FF00";
    xhrDiv.innerText = "Array is " + ints.length + "uints long";
  }
}
```

### Canvas

The `Canvas` element outputs pixel data as TypedArrays.

```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const uint8ClampedArray = imageData.data;
```

Note: `uint8ClampedArray` is a TypedArray of the special type `Uint8ClampedArray`, which clamps values to 0–255 and handles overflow automatically. This is convenient for image processing.

With `Uint8Array`, gamma correction must be done like this:

```javascript
u8[i] = Math.min(255, Math.max(0, u8[i] * gamma));
```

Because `Uint8Array` wraps values (e.g. 0xFF + 1 becomes 0x00), clamping is needed. With `Uint8ClampedArray`, the code is simpler:

```javascript
pixels[i] *= gamma;
```

`Uint8ClampedArray` clamps values below 0 to 0 and above 255 to 255. Note: IE 10 does not support this type.

### WebSocket

WebSocket can send and receive binary data via `ArrayBuffer`.

```javascript
let socket = new WebSocket('ws://127.0.0.1:8081');
socket.binaryType = 'arraybuffer';

// Wait until socket is open
socket.addEventListener('open', function (event) {
  // Send binary data
  const typedArray = new Uint8Array(4);
  socket.send(typedArray.buffer);
});

// Receive binary data
socket.addEventListener('message', function (event) {
  const arrayBuffer = event.data;
  // ···
});
```

### Fetch API

The Fetch API returns data as `ArrayBuffer`.

```javascript
fetch(url)
.then(function(response){
  return response.arrayBuffer()
})
.then(function(arrayBuffer){
  // ...
});
```

### File API

If the binary type of a file is known, it can be read as an `ArrayBuffer`.

```javascript
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
const reader = new FileReader();
reader.readAsArrayBuffer(file);
reader.onload = function () {
  const arrayBuffer = reader.result;
  // ···
};
```

Example: processing a BMP file. Assume `file` is a file object pointing to a BMP. First read the file:

```javascript
const reader = new FileReader();
reader.addEventListener("load", processimage, false);
reader.readAsArrayBuffer(file);
```

Then define the image processing callback: create a `DataView` over the binary data, a `bitmap` object for the processed data, and render to a Canvas.

```javascript
function processimage(e) {
  const buffer = e.target.result;
  const datav = new DataView(buffer);
  const bitmap = {};
  // Specific processing steps
}
```

First process the BMP file header (refer to BMP documentation for the format):

```javascript
bitmap.fileheader = {};
bitmap.fileheader.bfType = datav.getUint16(0, true);
bitmap.fileheader.bfSize = datav.getUint32(2, true);
bitmap.fileheader.bfReserved1 = datav.getUint16(6, true);
bitmap.fileheader.bfReserved2 = datav.getUint16(8, true);
bitmap.fileheader.bfOffBits = datav.getUint32(10, true);
```

Then process the image info header:

```javascript
bitmap.infoheader = {};
bitmap.infoheader.biSize = datav.getUint32(14, true);
bitmap.infoheader.biWidth = datav.getUint32(18, true);
bitmap.infoheader.biHeight = datav.getUint32(22, true);
bitmap.infoheader.biPlanes = datav.getUint16(26, true);
bitmap.infoheader.biBitCount = datav.getUint16(28, true);
bitmap.infoheader.biCompression = datav.getUint32(30, true);
bitmap.infoheader.biSizeImage = datav.getUint32(34, true);
bitmap.infoheader.biXPelsPerMeter = datav.getUint32(38, true);
bitmap.infoheader.biYPelsPerMeter = datav.getUint32(42, true);
bitmap.infoheader.biClrUsed = datav.getUint32(46, true);
bitmap.infoheader.biClrImportant = datav.getUint32(50, true);
```

Finally, process the pixel data:

```javascript
const start = bitmap.fileheader.bfOffBits;
bitmap.pixels = new Uint8Array(buffer, start);
```

The image data is now fully parsed. You can transform, convert, or render it on a Canvas as needed.

## SharedArrayBuffer

JavaScript is single-threaded. Web Workers introduce multiple threads: the main thread handles user interaction, worker threads handle computation. Each thread has its own data; they communicate via `postMessage()`.

```javascript
// Main thread
const w = new Worker('myworker.js');
```

The main thread creates a worker. Communication is one-way: the main thread uses `w.postMessage` to send messages and listens for responses via the `message` event.

```javascript
// Main thread
w.postMessage('hi');
w.onmessage = function (ev) {
  console.log(ev.data);
}
```

The main thread sends "hi" and logs the worker’s response.

The worker receives messages via the `message` event:

```javascript
// Worker thread
onmessage = function (ev) {
  console.log(ev.data);
  postMessage('ho');
}
```

Data can be any type (strings, binary, etc.). `postMessage` uses copying: the sender copies data and sends it to the receiver. For large data, this is inefficient. Shared memory—a region both the main thread and workers can read and write—would be faster and simpler.

ES2017 introduces [`SharedArrayBuffer`](https://github.com/tc39/ecmascript_sharedmem/blob/master/TUTORIAL.md), which allows the main thread and workers to share memory. Its API matches `ArrayBuffer`; the difference is that its contents can be shared.

```javascript
// Main thread

// Allocate 1KB of shared memory
const sharedBuffer = new SharedArrayBuffer(1024);

// Share it with the worker
w.postMessage(sharedBuffer);

// Create a view for writing
const sharedArray = new Int32Array(sharedBuffer);
```

The worker receives the shared buffer in the event’s `data` property:

```javascript
// Worker thread
onmessage = function (ev) {
  const sharedBuffer = ev.data;
  const sharedArray = new Int32Array(sharedBuffer);
  // ...
};
```

Shared memory can also be created in a worker and sent to the main thread.

`SharedArrayBuffer` cannot be read or written directly; it must be used through a view.

```javascript
// Allocate space for 100,000 32-bit integers
const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 100000);
const ia = new Int32Array(sab);  // ia.length == 100000

const primes = new PrimeGenerator();
for ( let i=0 ; i < ia.length ; i++ )
  ia[i] = primes.next();

w.postMessage(ia);
```

Worker receives and uses the data:

```javascript
// Worker thread
let ia;
onmessage = function (ev) {
  ia = ev.data;
  console.log(ia.length); // 100000
  console.log(ia[37]); // 163 (38th prime)
};
```

## Atomics Object

With shared memory, the main challenge is preventing two threads from modifying the same location at once, and ensuring updates are visible to other threads. The SharedArrayBuffer API provides the `Atomics` object to make operations atomic and synchronized across all threads.

What is an atomic operation? A single statement in a high-level language may compile to multiple machine instructions. In a single-threaded program this is fine. With shared memory and multiple threads, another thread’s instructions can interleave, leading to incorrect results.

```javascript
// Main thread
ia[42] = 314159;  // originally 191
ia[37] = 123456;  // originally 163

// Worker thread
console.log(ia[37]);
console.log(ia[42]);
// Possible output:
// 123456
// 191
```

The main thread may reorder these assignments, and the worker might read in the middle, seeing mixed values.

Another example:

```javascript
// Main thread
const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 100000);
const ia = new Int32Array(sab);

for (let i = 0; i < ia.length; i++) {
  ia[i] = primes.next(); // put primes into ia
}

// worker thread
ia[112]++; // incorrect
Atomics.add(ia, 112, 1); // correct
```

Directly modifying shared memory with `ia[112]++` is unsafe because it compiles to multiple instructions that can be interleaved with another thread’s instructions. Use `Atomics.add(ia, 112, 1)` instead.

`Atomics` guarantees that an operation runs as a single, uninterruptible unit, avoiding races and making shared-memory updates safe.

**(1)Atomics.store(), Atomics.load()**

`store()` writes to shared memory; `load()` reads. Both guarantee atomic read/write.

They also help with synchronization: when multiple threads use a shared location as a flag, the write must complete after all preceding writes, and the read must happen before any subsequent reads. `store()` and `load()` prevent the compiler from reordering these operations.

```javascript
Atomics.load(typedArray, index)
Atomics.store(typedArray, index, value)
```

`store()` takes a TypedArray view of a SharedArrayBuffer, an index, and a value; it returns the stored value. `load()` takes the view and index; it returns the value at that index.

```javascript
// Main thread main.js
ia[42] = 314159;  // originally 191
Atomics.store(ia, 37, 123456);  // originally 163

// Worker thread worker.js
while (Atomics.load(ia, 37) == 163);
console.log(ia[37]);  // 123456
console.log(ia[42]);  // 314159
```

Here, the main thread’s store to index 37 happens after the store to 42. The worker waits until index 37 changes, then reads; the reads occur after the load.

Another example:

```javascript
// Main thread
const worker = new Worker('worker.js');
const length = 10;
const size = Int32Array.BYTES_PER_ELEMENT * length;
const sharedBuffer = new SharedArrayBuffer(size);
const sharedArray = new Int32Array(sharedBuffer);
for (let i = 0; i < 10; i++) {
  Atomics.store(sharedArray, i, 0);
}
worker.postMessage(sharedBuffer);
```

Worker reads with `Atomics.load()`:

```javascript
// worker.js
self.addEventListener('message', (event) => {
  const sharedArray = new Int32Array(event.data);
  for (let i = 0; i < 10; i++) {
    const arrayValue = Atomics.load(sharedArray, i);
    console.log(`The item at array index ${i} is ${arrayValue}`);
  }
}, false);
```

**(2)Atomics.exchange()**

Workers can write with `Atomics.store()` or `Atomics.exchange()`. `store()` returns the value written; `exchange()` returns the previous value.

```javascript
// Worker thread
self.addEventListener('message', (event) => {
  const sharedArray = new Int32Array(event.data);
  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
      const storedValue = Atomics.store(sharedArray, i, 1);
      console.log(`The item at array index ${i} is now ${storedValue}`);
    } else {
      const exchangedValue = Atomics.exchange(sharedArray, i, 2);
      console.log(`The item at array index ${i} was ${exchangedValue}, now 2`);
    }
  }
}, false);
```

This sets even indices to 1 and odd indices to 2.

**(3)Atomics.wait(), Atomics.notify()**

A busy `while` loop is inefficient and can block the main thread. `Atomics.wait()` and `Atomics.notify()` provide wait/notify semantics. They effectively lock a location: one thread waits while others may run; when notified, waiting threads wake.

`Atomics.notify()` was formerly named `Atomics.wake()`.

```javascript
// Worker thread
self.addEventListener('message', (event) => {
  const sharedArray = new Int32Array(event.data);
  const arrayIndex = 0;
  const expectedStoredValue = 50;
  Atomics.wait(sharedArray, arrayIndex, expectedStoredValue);
  console.log(Atomics.load(sharedArray, arrayIndex));
}, false);
```

`Atomics.wait()` makes the worker sleep until `sharedArray[0]` equals 50.

The main thread can wake the worker by changing the value and calling `notify`:

```javascript
// Main thread
const newArrayValue = 100;
Atomics.store(sharedArray, 0, newArrayValue);
const arrayIndex = 0;
const queuePos = 1;
Atomics.notify(sharedArray, arrayIndex, queuePos);
```

`sharedArray[0]` is set to 100, then `Atomics.notify()` wakes one waiting thread.

`Atomics.wait()` signature:

```javascript
Atomics.wait(sharedArray, index, value, timeout)
```

- sharedArray: A TypedArray view of shared memory
- index: Element index
- value: Expected value; if actual value equals this, the thread sleeps
- timeout: Optional; max wait in ms; default `Infinity` (sleep until `notify`)

`Atomics.wait()` returns: `"not-equal"` if the value did not match; `"ok"` if woken by `notify`; `"timed-out"` if woken by timeout.

`Atomics.notify()` signature:

```javascript
Atomics.notify(sharedArray, index, count)
```

- sharedArray: TypedArray view of shared memory
- index: Element index
- count: Number of waiting workers to wake; default `Infinity`

When workers are woken, they continue execution.

Example:

```javascript
// Main thread
console.log(ia[37]);  // 163
Atomics.store(ia, 37, 123456);
Atomics.notify(ia, 37, 1);

// Worker thread
Atomics.wait(ia, 37, 163);
console.log(ia[37]);  // 123456
```

`ia[37]` starts as 163. The worker waits until it changes. The main thread writes 123456 and notifies; the worker then reads the new value.

For lock implementations based on `wait` and `notify`, see [js-lock-and-condition](https://github.com/lars-t-hansen/js-lock-and-condition) by Lars T Hansen.

Note: Avoid calling `Atomics.wait()` on the main thread; it would freeze the UI. The main thread may refuse to enter the wait state.

**(4)Arithmetic methods**

Some operations on shared memory must not be interleaved with writes from other threads. Atomics provides arithmetic methods for this:

```javascript
Atomics.add(sharedArray, index, value)
```

Adds `value` to `sharedArray[index]`, returns the previous value.

```javascript
Atomics.sub(sharedArray, index, value)
```

Subtracts `value` from `sharedArray[index]`, returns the previous value.

```javascript
Atomics.and(sharedArray, index, value)
```

Performs bitwise AND with `sharedArray[index]`, stores result, returns previous value.

```javascript
Atomics.or(sharedArray, index, value)
```

Performs bitwise OR with `sharedArray[index]`, stores result, returns previous value.

```javascript
Atomics.xor(sharedArray, index, value)
```

Performs bitwise XOR with `sharedArray[index]`, stores result, returns previous value.

**(5)Other methods**

- `Atomics.compareExchange(sharedArray, index, oldval, newval)`: If `sharedArray[index] === oldval`, write `newval`. Returns the old value.
- `Atomics.isLockFree(size)`: Returns a boolean indicating whether Atomics can handle locking for the given `size` without an explicit lock. If `false`, the application must implement locking.

`Atomics.compareExchange` is useful for read-modify-write: read a value, modify it, then check if it was changed by another thread. If not, write back; otherwise retry.
