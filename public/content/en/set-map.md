# Set and Map Data Structures

## Set

### Basic Usage

ES6 provides a new data structure called Set. It is similar to an array, but the members' values are all unique—there are no duplicate values.

`Set` itself is a constructor function used to generate Set data structures.

```javascript
const s = new Set();

[2, 3, 5, 4, 5, 2, 2].forEach(x => s.add(x));

for (let i of s) {
  console.log(i);
}
// 2 3 5 4
```

The code above adds members to the Set structure via the `add()` method. The result shows that the Set structure does not add duplicate values.

The `Set()` function can accept an array (or other data structures with an iterable interface) as an argument for initialization.

```javascript
// Example 1
const set = new Set([1, 2, 3, 4, 4]);
[...set]
// [1, 2, 3, 4]

// Example 2
const items = new Set([1, 2, 3, 4, 5, 5, 5, 5]);
items.size // 5

// Example 3
const set = new Set(document.querySelectorAll('div'));
set.size // 56

// Similar to
const set = new Set();
document
 .querySelectorAll('div')
 .forEach(div => set.add(div));
set.size // 56
```

In the code above, Example 1 and Example 2 both pass arrays to the `Set` function. Example 3 passes an array-like object.

The code above also demonstrates one way to remove duplicate members from an array.

```javascript
// Remove duplicate array elements
[...new Set(array)]
```

This method can also be used to remove duplicate characters from a string.

```javascript
[...new Set('ababbc')].join('')
// "abc"
```

When adding values to a Set, no type conversion occurs. Thus `5` and `"5"` are two different values. The algorithm used internally by Set to determine whether two values are different is called "Same-value-zero equality." It is similar to the strict equality operator (`===`), with the main difference being that when adding values to a Set, `NaN` is considered equal to itself, whereas the strict equality operator considers `NaN` not equal to itself.

```javascript
let set = new Set();
let a = NaN;
let b = NaN;
set.add(a);
set.add(b);
set // Set {NaN}
```

The code above adds `NaN` to the Set instance twice, but only one is stored. This shows that internally, two `NaN` values are considered equal in a Set.

Additionally, two objects are always considered unequal.

```javascript
let set = new Set();

set.add({});
set.size // 1

set.add({});
set.size // 2
```

The code above shows that since two empty objects are not equal, they are treated as two distinct values.

The `Array.from()` method can convert a Set structure into an array.

```javascript
const items = new Set([1, 2, 3, 4, 5]);
const array = Array.from(items);
```

This provides another way to remove duplicate members from an array.

```javascript
function dedupe(array) {
  return Array.from(new Set(array));
}

dedupe([1, 1, 2, 3]) // [1, 2, 3]
```

### Set Instance Properties and Methods

Set structure instances have the following properties:

- `Set.prototype.constructor`: The constructor function, which defaults to the `Set` function.
- `Set.prototype.size`: Returns the total number of members in the `Set` instance.

Set instance methods fall into two categories: manipulation methods (for operating on data) and traversal methods (for iterating over members). Below are the four manipulation methods.

- `Set.prototype.add(value)`: Adds a value and returns the Set structure itself.
- `Set.prototype.delete(value)`: Deletes a value and returns a boolean indicating whether the deletion succeeded.
- `Set.prototype.has(value)`: Returns a boolean indicating whether the value is a member of the `Set`.
- `Set.prototype.clear()`: Clears all members. No return value.

Examples of the above properties and methods:

```javascript
s.add(1).add(2).add(2);
// Note: 2 was added twice

s.size // 2

s.has(1) // true
s.has(2) // true
s.has(3) // false

s.delete(2) // true
s.has(2) // false
```

The following compares how `Object` and `Set` structures check for the presence of a key:

```javascript
// Object style
const properties = {
  'width': 1,
  'height': 1
};

if (properties[someName]) {
  // do something
}

// Set style
const properties = new Set();

properties.add('width');
properties.add('height');

if (properties.has(someName)) {
  // do something
}
```

### Traversal Operations

Set structure instances have four traversal methods for iterating over members:

- `Set.prototype.keys()`: Returns an iterator for keys
- `Set.prototype.values()`: Returns an iterator for values
- `Set.prototype.entries()`: Returns an iterator for key-value pairs
- `Set.prototype.forEach()`: Iterates over each member using a callback function

It is worth noting that the traversal order of a `Set` is the insertion order. This feature is sometimes very useful, for example when using Set to store a list of callback functions—calling them will follow the order in which they were added.

**(1)`keys()`,`values()`,`entries()`**

The `keys`, `values`, and `entries` methods all return iterator objects (see the "Iterator" chapter). Since Set structure has no keys, only values (or rather, keys and values are the same), the `keys` and `values` methods behave identically.

```javascript
let set = new Set(['red', 'green', 'blue']);

for (let item of set.keys()) {
  console.log(item);
}
// red
// green
// blue

for (let item of set.values()) {
  console.log(item);
}
// red
// green
// blue

for (let item of set.entries()) {
  console.log(item);
}
// ["red", "red"]
// ["green", "green"]
// ["blue", "blue"]
```

In the code above, the iterator returned by the `entries` method includes both keys and values, so each iteration outputs an array with two identical members.

Set structure instances are iterable by default; the default iterator generator is the `values` method.

```javascript
Set.prototype[Symbol.iterator] === Set.prototype.values
// true
```

This means you can omit the `values` method and iterate over a Set directly with a `for...of` loop.

```javascript
let set = new Set(['red', 'green', 'blue']);

for (let x of set) {
  console.log(x);
}
// red
// green
// blue
```

**(2)`forEach()`**

Set structure instances have a `forEach` method like arrays, used to perform an operation on each member. It does not return a value.

```javascript
let set = new Set([1, 4, 9]);
set.forEach((value, key) => console.log(key + ' : ' + value))
// 1 : 1
// 4 : 4
// 9 : 9
```

The code above shows that the `forEach` method takes a handler function. The parameters of this function match those of array `forEach`: value, key, and the collection itself (the third parameter was omitted in the example). Note that in Set, the key and value are the same, so the first and second parameters always have the same value.

Additionally, the `forEach` method can take a second parameter to bind as the handler function's `this` object.

**(3)Traversal Applications**

The spread operator (`...`) internally uses a `for...of` loop, so it can be used with Set structures as well.

```javascript
let set = new Set(['red', 'green', 'blue']);
let arr = [...set];
// ['red', 'green', 'blue']
```

Combining the spread operator with Set structure removes duplicate array members.

```javascript
let arr = [3, 5, 2, 2, 5, 5];
let unique = [...new Set(arr)];
// [3, 5, 2]
```

Moreover, the array `map` and `filter` methods can be used indirectly on Set.

```javascript
let set = new Set([1, 2, 3]);
set = new Set([...set].map(x => x * 2));
// Returns Set: {2, 4, 6}

let set = new Set([1, 2, 3, 4, 5]);
set = new Set([...set].filter(x => (x % 2) == 0));
// Returns Set: {2, 4}
```

Therefore, Set makes it easy to implement union, intersection, and difference.

```javascript
let a = new Set([1, 2, 3]);
let b = new Set([4, 3, 2]);

// Union
let union = new Set([...a, ...b]);
// Set {1, 2, 3, 4}

// Intersection
let intersect = new Set([...a].filter(x => b.has(x)));
// set {2, 3}

// Difference (a relative to b)
let difference = new Set([...a].filter(x => !b.has(x)));
// Set {1}
```

If you want to change the original Set structure during traversal, there is no direct method. There are two workarounds: one is to map the original Set to a new structure and assign it back; the other uses the `Array.from` method.

```javascript
// Method 1
let set = new Set([1, 2, 3]);
set = new Set([...set].map(val => val * 2));
// set value is 2, 4, 6

// Method 2
let set = new Set([1, 2, 3]);
set = new Set(Array.from(set, val => val * 2));
// set value is 2, 4, 6
```

The code above provides two methods for modifying the original Set structure during traversal operations.

### Set Operations

[ES2025](https://github.com/tc39/proposal-set-methods) adds the following set operation methods to Set structure:

- Set.prototype.intersection(other): Intersection
- Set.prototype.union(other): Union
- Set.prototype.difference(other): Difference
- Set.prototype.symmetricDifference(other): Symmetric difference
- Set.prototype.isSubsetOf(other): Check whether it is a subset
- Set.prototype.isSupersetOf(other): Check whether it is a superset
- Set.prototype.isDisjointFrom(other): Check whether it is disjoint

All parameters of these methods must be Set structures or structures similar to Set (with `size` property and `keys()` and `has()` methods).

`.union()` performs union, returning a set containing all members that exist in either collection.

```javascript
const frontEnd = new Set(["JavaScript", "HTML", "CSS"]);
const backEnd = new Set(["Python", "Java", "JavaScript"]);

const all = frontEnd.union(backEnd);
// Set {"JavaScript", "HTML", "CSS", "Python", "Java"}
```

`.intersection()` performs intersection, returning a set of members that exist in both collections.

```javascript
const frontEnd = new Set(["JavaScript", "HTML", "CSS"]);
const backEnd = new Set(["Python", "Java", "JavaScript"]);

const frontAndBackEnd = frontEnd.intersection(backEnd);
// Set {"JavaScript"}
```

`.difference()` performs difference, returning a set of all members that exist in the first collection but not in the second.

```javascript
const frontEnd = new Set(["JavaScript", "HTML", "CSS"]);
const backEnd = new Set(["Python", "Java", "JavaScript"]);

const onlyFrontEnd = frontEnd.difference(backEnd);
// Set {"HTML", "CSS"}

const onlyBackEnd = backEnd.difference(frontEnd);
// Set {"Python", "Java"}
```

`.symmetricDifference()` performs symmetric difference, returning a set of all unique members from both collections (duplicates removed).

```javascript
const frontEnd = new Set(["JavaScript", "HTML", "CSS"]);
const backEnd = new Set(["Python", "Java", "JavaScript"]);

const onlyFrontEnd = frontEnd.symmetricDifference(backEnd);
// Set {"HTML", "CSS", "Python", "Java"} 

const onlyBackEnd = backEnd.symmetricDifference(frontEnd);
// Set {"Python", "Java", "HTML", "CSS"}
```

Note that the order of members in the result is determined by the order they were added to the collection.

`.isSubsetOf()` returns a boolean indicating whether the first set is a subset of the second—i.e., all members of the first set are members of the second.

```javascript
const frontEnd = new Set(["JavaScript", "HTML", "CSS"]);
const declarative = new Set(["HTML", "CSS"]);

declarative.isSubsetOf(frontEnd);
// true

frontEndLanguages.isSubsetOf(declarativeLanguages);
// false
```

Any set is a subset of itself.

```javascript
frontEnd.isSubsetOf(frontEnd);
// true
```

`isSupersetOf()` returns a boolean indicating whether the first set is a superset of the second—i.e., all members of the second set are members of the first.

```javascript
const frontEnd = new Set(["JavaScript", "HTML", "CSS"]);
const declarative = new Set(["HTML", "CSS"]);

declarative.isSupersetOf(frontEnd);
// false

frontEnd.isSupersetOf(declarative);
// true
```

Any set is a superset of itself.

```javascript
frontEnd.isSupersetOf(frontEnd);
// true
```

`.isDisjointFrom()` checks whether two sets are disjoint—i.e., have no members in common.

```javascript
const frontEnd = new Set(["JavaScript", "HTML", "CSS"]);
const interpreted = new Set(["JavaScript", "Ruby", "Python"]);
const compiled = new Set(["Java", "C++", "TypeScript"]);

interpreted.isDisjointFrom(compiled);
// true

frontEnd.isDisjointFrom(interpreted);
// false
```

## WeakSet

### Meaning

WeakSet structure is similar to Set—it is also a collection of unique values. However, it differs from Set in two ways.

First, WeakSet members can only be objects and Symbol values, not other types.

```javascript
const ws = new WeakSet();
ws.add(1) // Error
ws.add(Symbol()) // OK
```

The code above attempts to add a number and a `Symbol` value to WeakSet. The former throws an error because WeakSet can only hold objects and Symbol values.

Second, objects in WeakSet are weakly referenced. The garbage collector does not count WeakSet's references to those objects. In other words, when no other references to an object remain, the garbage collector will reclaim its memory without considering that the object still exists in WeakSet.

This is because the garbage collector decides when to reclaim based on object reachability. If an object is still reachable, the garbage collector will not free that memory. After we are done with a value, we sometimes forget to remove its reference, which can lead to memory leaks. References inside WeakSet are not counted by the garbage collector, so this problem does not occur. Therefore, WeakSet is suitable for temporarily storing a group of objects and for storing information bound to objects. When those objects disappear from the outside, their references inside WeakSet will disappear automatically.

Because of this characteristic, WeakSet members are not suitable to be referenced—they may disappear at any time. Also, the number of members in WeakSet depends on whether the garbage collector has run; the count may change before and after a run. Since when the garbage collector runs is unpredictable, ES6 specifies that WeakSet is not iterable.

These characteristics also apply to the WeakMap structure introduced later in this chapter.

### Syntax

WeakSet is a constructor and can be used with the `new` command to create WeakSet data structures.

```javascript
const ws = new WeakSet();
```

As a constructor, WeakSet can accept an array or array-like object as an argument. (In fact, any object with an Iterable interface can be passed as an argument to WeakSet.) All members of that array automatically become members of the WeakSet instance.

```javascript
const a = [[1, 2], [3, 4]];
const ws = new WeakSet(a);
// WeakSet {[1, 2], [3, 4]}
```

In the code above, `a` is an array with two members, both arrays. Passing `a` to the WeakSet constructor makes `a`'s members become WeakSet members.

Note that it is the members of array `a` that become WeakSet members, not `a` itself. This means array members must be objects.

```javascript
const b = [3, 4];
const ws = new WeakSet(b);
// Uncaught TypeError: Invalid value used in weak set(…)
```

In the code above, the members of array `b` are not objects, so adding them to WeakSet throws an error.

WeakSet structure has the following three methods:

- **WeakSet.prototype.add(value)**: Adds a new member to the WeakSet instance. Returns the WeakSet structure itself.
- **WeakSet.prototype.delete(value)**: Removes the specified member from the WeakSet instance. Returns `true` on success; returns `false` if the member is not found or is not an object.
- **WeakSet.prototype.has(value)**: Returns a boolean indicating whether a value is in the WeakSet instance.

Example:

```javascript
const ws = new WeakSet();
const obj = {};
const foo = {};

ws.add(window);
ws.add(obj);

ws.has(window); // true
ws.has(foo); // false

ws.delete(window); // true
ws.has(window); // false
```

WeakSet has no `size` property and no way to iterate over its members.

```javascript
ws.size // undefined
ws.forEach // undefined

ws.forEach(function(item){ console.log('WeakSet has ' + item)})
// TypeError: undefined is not a function
```

The code above attempts to access the `size` and `forEach` properties; neither succeeds.

WeakSet cannot be iterated because its members are weakly referenced and may disappear at any time. Iteration cannot guarantee the existence of members—they might become inaccessible right after iteration ends. One use of WeakSet is to store DOM nodes without worrying about memory leaks when those nodes are removed from the document.

Here is another WeakSet example:

```javascript
const foos = new WeakSet()
class Foo {
  constructor() {
    foos.add(this)
  }
  method () {
    if (!foos.has(this)) {
      throw new TypeError('Foo.prototype.method can only be called on instances of Foo!');
    }
  }
}
```

The code above ensures that the `Foo` instance method can only be called on `Foo` instances. Using WeakSet here means that `foos`' reference to instances is not counted by the garbage collector, so when instances are deleted, there is no need to consider `foos`, and no memory leaks occur.

## Map

### Meaning and Basic Usage

JavaScript objects (Object) are essentially collections of key-value pairs (hash structures), but traditionally only strings could be used as keys. This imposed significant limitations on their use.

```javascript
const data = {};
const element = document.getElementById('myDiv');

data[element] = 'metadata';
data['[object HTMLDivElement]'] // "metadata"
```

The code above intended to use a DOM node as the key for object `data`. However, since objects only accept strings as keys, `element` was automatically converted to the string `[object HTMLDivElement]`.

To solve this problem, ES6 provides the Map data structure. It is similar to an object—also a collection of key-value pairs—but the range of keys is not limited to strings. Values of any type, including objects, can be used as keys. Object provides "string-to-value" mapping, while Map provides "value-to-value" mapping, a more complete hash structure implementation. If you need a key-value data structure, Map is more suitable than Object.

```javascript
const m = new Map();
const o = {p: 'Hello World'};

m.set(o, 'content')
m.get(o) // "content"

m.has(o) // true
m.delete(o) // true
m.has(o) // false
```

The code above uses Map's `set` method to use object `o` as a key in `m`, then uses `get` to read that key, and `delete` to remove it.

The example above shows how to add members to a Map. As a constructor, Map can also accept an array as an argument. The array's members are arrays representing key-value pairs.

```javascript
const map = new Map([
  ['name', 'John'],
  ['title', 'Author']
]);

map.size // 2
map.has('name') // true
map.get('name') // "John"
map.has('title') // true
map.get('title') // "Author"
```

The code above specifies two keys, `name` and `title`, when creating the Map instance.

When the `Map` constructor accepts an array as an argument, it effectively executes the following algorithm:

```javascript
const items = [
  ['name', 'John'],
  ['title', 'Author']
];

const map = new Map();

items.forEach(
  ([key, value]) => map.set(key, value)
);
```

In fact, not only arrays—any data structure with an Iterator interface whose members are two-element arrays (see the "Iterator" chapter) can be passed to the `Map` constructor. This means both `Set` and `Map` can be used to generate new Maps.

```javascript
const set = new Set([
  ['foo', 1],
  ['bar', 2]
]);
const m1 = new Map(set);
m1.get('foo') // 1

const m2 = new Map([['baz', 3]]);
const m3 = new Map(m2);
m3.get('baz') // 3
```

In the code above, we use Set and Map objects as arguments to the `Map` constructor; both produce new Map objects.

If the same key is assigned multiple times, later values overwrite earlier ones.

```javascript
const map = new Map();

map
.set(1, 'aaa')
.set(1, 'bbb');

map.get(1) // "bbb"
```

The code above assigns to key `1` twice; the second value overwrites the first.

Reading an unknown key returns `undefined`.

```javascript
new Map().get('asfddfsasadf')
// undefined
```

Note that Map treats only references to the same object as the same key. This requires care.

```javascript
const map = new Map();

map.set(['a'], 555);
map.get(['a']) // undefined
```

In the code above, `set` and `get` appear to use the same key, but they are actually two different array instances with different memory addresses, so `get` cannot retrieve the value and returns `undefined`.

Similarly, two instances with the same value are treated as two different keys in Map.

```javascript
const map = new Map();

const k1 = ['a'];
const k2 = ['a'];

map
.set(k1, 111)
.set(k2, 222);

map.get(k1) // 111
map.get(k2) // 222
```

In the code above, `k1` and `k2` have the same value but are treated as two different keys in Map.

From this we see that Map keys are bound to memory addresses. Different addresses mean different keys. This avoids the problem of property name collisions when extending other people's libraries—when using objects as keys, you don't need to worry about your properties conflicting with the original author's.

If a Map key is a simple type (number, string, boolean), Map treats two strictly equal values as the same key. For example, `0` and `-0` are the same key, while boolean `true` and string `'true'` are different keys. Also, `undefined` and `null` are different keys. Although `NaN` is not strictly equal to itself, Map treats it as the same key.

```javascript
let map = new Map();

map.set(-0, 123);
map.get(+0) // 123

map.set(true, 1);
map.set('true', 2);
map.get(true) // 1

map.set(undefined, 3);
map.set(null, 4);
map.get(undefined) // 3

map.set(NaN, 123);
map.get(NaN) // 123
```

### Instance Properties and Methods

Map structure instances have the following properties and methods:

**(1)size property**

The `size` property returns the total number of members in the Map structure.

```javascript
const map = new Map();
map.set('foo', true);
map.set('bar', false);

map.size // 2
```

**(2)Map.prototype.set(key, value)**

The `set` method sets the value for key `key` to `value`, then returns the entire Map structure. If `key` already has a value, it is updated; otherwise, a new key is created.

```javascript
const m = new Map();

m.set('edition', 6)        // key is string
m.set(262, 'standard')     // key is number
m.set(undefined, 'nah')    // key is undefined
```

The `set` method returns the current `Map` object, so it supports chaining.

```javascript
let map = new Map()
  .set(1, 'a')
  .set(2, 'b')
  .set(3, 'c');
```

**(3)Map.prototype.get(key)**

The `get` method reads the value for `key`. If `key` is not found, it returns `undefined`.

```javascript
const m = new Map();

const hello = function() {console.log('hello');};
m.set(hello, 'Hello ES6!') // key is function

m.get(hello)  // Hello ES6!
```

**(4)Map.prototype.has(key)**

The `has` method returns a boolean indicating whether a key exists in the current Map object.

```javascript
const m = new Map();

m.set('edition', 6);
m.set(262, 'standard');
m.set(undefined, 'nah');

m.has('edition')     // true
m.has('years')       // false
m.has(262)           // true
m.has(undefined)     // true
```

**(5)Map.prototype.delete(key)**

The `delete()` method removes a key. Returns `true` on success, `false` on failure.

```javascript
const m = new Map();
m.set(undefined, 'nah');
m.has(undefined)     // true

m.delete(undefined)
m.has(undefined)       // false
```

**(6)Map.prototype.clear()**

The `clear()` method removes all members. No return value.

```javascript
let map = new Map();
map.set('foo', true);
map.set('bar', false);

map.size // 2
map.clear()
map.size // 0
```

### Traversal Methods

Map structure natively provides three iterator generators and one traversal method:

- `Map.prototype.keys()`: Returns an iterator for keys
- `Map.prototype.values()`: Returns an iterator for values
- `Map.prototype.entries()`: Returns an iterator for all members
- `Map.prototype.forEach()`: Iterates over all Map members

Map's traversal order is the insertion order.

```javascript
const map = new Map([
  ['F', 'no'],
  ['T',  'yes'],
]);

for (let key of map.keys()) {
  console.log(key);
}
// "F"
// "T"

for (let value of map.values()) {
  console.log(value);
}
// "no"
// "yes"

for (let item of map.entries()) {
  console.log(item[0], item[1]);
}
// "F" "no"
// "T" "yes"

// Or
for (let [key, value] of map.entries()) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"

// Same as map.entries()
for (let [key, value] of map) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"
```

The last example above shows that Map's default iterator interface (`Symbol.iterator` property) is the `entries` method.

```javascript
map[Symbol.iterator] === map.entries
// true
```

A fast way to convert Map structure to array structure is using the spread operator (`...`).

```javascript
const map = new Map([
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
]);

[...map.keys()]
// [1, 2, 3]

[...map.values()]
// ['one', 'two', 'three']

[...map.entries()]
// [[1,'one'], [2, 'two'], [3, 'three']]

[...map]
// [[1,'one'], [2, 'two'], [3, 'three']]
```

Combined with the array `map` and `filter` methods, Map traversal and filtering can be implemented (Map itself has no `map` or `filter` methods).

```javascript
const map0 = new Map()
  .set(1, 'a')
  .set(2, 'b')
  .set(3, 'c');

const map1 = new Map(
  [...map0].filter(([k, v]) => k < 3)
);
// Produces Map {1 => 'a', 2 => 'b'}

const map2 = new Map(
  [...map0].map(([k, v]) => [k * 2, '_' + v])
    );
// Produces Map {2 => '_a', 4 => '_b', 6 => '_c'}
```

Additionally, Map has a `forEach` method similar to array's, which can be used for traversal.

```javascript
map.forEach(function(value, key, map) {
  console.log("Key: %s, Value: %s", key, value);
});
```

The `forEach` method can also accept a second parameter to bind as `this`.

```javascript
const reporter = {
  report: function(key, value) {
    console.log("Key: %s, Value: %s", key, value);
  }
};

map.forEach(function(value, key, map) {
  this.report(key, value);
}, reporter);
```

In the code above, the `this` of the `forEach` callback refers to `reporter`.

### Conversion to and from Other Data Structures

**(1)Map to Array**

As mentioned, the most convenient way to convert Map to an array is the spread operator (`...`).

```javascript
const myMap = new Map()
  .set(true, 7)
  .set({foo: 3}, ['abc']);
[...myMap]
// [ [ true, 7 ], [ { foo: 3 }, [ 'abc' ] ] ]
```

**(2)Array to Map**

Passing an array to the Map constructor converts it to a Map.

```javascript
new Map([
  [true, 7],
  [{foo: 3}, ['abc']]
])
// Map {
//   true => 7,
//   Object {foo: 3} => ['abc']
// }
```

**(3)Map to Object**

If all Map keys are strings, it can be converted to an object without loss.

```javascript
function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k,v] of strMap) {
    obj[k] = v;
  }
  return obj;
}

const myMap = new Map()
  .set('yes', true)
  .set('no', false);
strMapToObj(myMap)
// { yes: true, no: false }
```

If there are non-string keys, those keys will be converted to strings before being used as object keys.

**(4)Object to Map**

Object to Map can be done via `Object.entries()`.

```javascript
let obj = {"a":1, "b":2};
let map = new Map(Object.entries(obj));
```

You can also implement a conversion function yourself.

```javascript
function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}

objToStrMap({yes: true, no: false})
// Map {"yes" => true, "no" => false}
```

**(5)Map to JSON**

Converting Map to JSON depends on the keys. If all Map keys are strings, it can be converted to object JSON.

```javascript
function strMapToJson(strMap) {
  return JSON.stringify(strMapToObj(strMap));
}

let myMap = new Map().set('yes', true).set('no', false);
strMapToJson(myMap)
// '{"yes":true,"no":false}'
```

If the Map has non-string keys, it can be converted to array JSON.

```javascript
function mapToArrayJson(map) {
  return JSON.stringify([...map]);
}

let myMap = new Map().set(true, 7).set({foo: 3}, ['abc']);
mapToArrayJson(myMap)
// '[[true,7],[{"foo":3},["abc"]]]'
```

**(6)JSON to Map**

When converting JSON to Map, keys are normally strings.

```javascript
function jsonToStrMap(jsonStr) {
  return objToStrMap(JSON.parse(jsonStr));
}

jsonToStrMap('{"yes": true, "no": false}')
// Map {'yes' => true, 'no' => false}
```

However, if the entire JSON is an array where each member is a two-element array, it can be converted one-to-one to a Map. This is often the inverse of Map-to-array JSON conversion.

```javascript
function jsonToMap(jsonStr) {
  return new Map(JSON.parse(jsonStr));
}

jsonToMap('[[true,7],[{"foo":3},["abc"]]]')
// Map {true => 7, Object { foo: 3 } => ['abc']}
```

## WeakMap

### Meaning

`WeakMap` structure is similar to `Map`—it is also for generating key-value pair collections.

```javascript
// WeakMap can add members via set
const wm1 = new WeakMap();
const key = {foo: 1};
wm1.set(key, 2);
wm1.get(key) // 2

// WeakMap can accept an array as constructor argument
const k1 = [1, 2, 3];
const k2 = [4, 5, 6];
const wm2 = new WeakMap([[k1, 'foo'], [k2, 'bar']]);
wm2.get(k2) // "bar"
```

`WeakMap` differs from `Map` in two ways.

First, `WeakMap` only accepts objects (except `null`) and [Symbol values](https://github.com/tc39/proposal-symbols-as-weakmap-keys) as keys, not other types.

```javascript
const map = new WeakMap();
map.set(1, 2) // Error
map.set(null, 2) // Error
map.set(Symbol(), 2) // OK
```

In the code above, using the number `1` or `null` as WeakMap keys throws errors; using a Symbol value does not.

Second, objects referenced by WeakMap keys are not counted by the garbage collector.

The purpose of `WeakMap` is that sometimes we want to store data on an object, but that would create a reference to that object. Consider this example:

```javascript
const e1 = document.getElementById('foo');
const e2 = document.getElementById('bar');
const arr = [
  [e1, 'foo element'],
  [e2, 'bar element'],
];
```

In the code above, `e1` and `e2` are two objects, and we add some text descriptions to them via the `arr` array. This creates references from `arr` to `e1` and `e2`.

Once we no longer need these two objects, we must manually remove these references; otherwise the garbage collector will not free the memory used by `e1` and `e2`.

```javascript
// When e1 and e2 are no longer needed, manually remove references
arr [0] = null;
arr [1] = null;
```

This approach is clearly inconvenient. Forgetting to do it can cause memory leaks.

WeakMap was created to solve this problem. Objects referenced by its keys are weakly referenced—the garbage collector does not count them. So when all other references to a referenced object are cleared, the garbage collector will free that object's memory. Once the object is no longer needed, the key in WeakMap and its associated key-value pair disappear automatically without manual reference removal.

Essentially, if you want to add data to an object without interfering with garbage collection, use WeakMap. A typical use case is adding data to DOM elements in a web page. When a DOM element is removed, its corresponding WeakMap entry is automatically removed.

```javascript
const wm = new WeakMap();

const element = document.getElementById('example');

wm.set(element, 'some information');
wm.get(element) // "some information"
```

In the code above, we create a WeakMap instance, use a DOM node as a key, store some additional information as the value, and store both in WeakMap. The reference to `element` in WeakMap is weak and is not counted by the garbage collector.

So once other references to the DOM node object are gone, the memory for that object will be freed by the garbage collector. The WeakMap key-value pair will then disappear automatically.

In summary, `WeakMap` is intended for cases where the objects corresponding to its keys may disappear in the future. `WeakMap` helps prevent memory leaks.

Note: WeakMap weakly references only keys, not values. Values are still normal references.

```javascript
const wm = new WeakMap();
let key = {};
let obj = {foo: 1};

wm.set(key, obj);
obj = null;
wm.get(key)
// Object {foo: 1}
```

In the code above, the value `obj` is a normal reference. So even after removing the reference to `obj` outside WeakMap, the reference inside WeakMap remains.

### WeakMap Syntax

The main API differences between WeakMap and Map are: (1) WeakMap has no traversal operations (no `keys()`, `values()`, or `entries()` methods) and no `size` property—there is no way to list all keys, and whether a key exists is unpredictable because it depends on garbage collection; (2) WeakMap cannot be cleared—it does not support the `clear` method. Therefore, WeakMap has only four methods: `get()`, `set()`, `has()`, and `delete()`.

```javascript
const wm = new WeakMap();

// size, forEach, clear do not exist
wm.size // undefined
wm.forEach // undefined
wm.clear // undefined
```

### WeakMap Example

WeakMap examples are hard to demonstrate because we cannot observe its references disappearing automatically. At that point, all other references are gone and nothing points to the WeakMap keys, so we cannot confirm whether those keys still exist.

A user [suggested](https://github.com/ruanyf/es6tutorial/issues/362#issuecomment-292109104) that if the referenced values occupy a lot of memory, we can observe this via Node's `process.memoryUsage` method. Following this idea, another user [provided](https://github.com/ruanyf/es6tutorial/issues/362#issuecomment-292451925) the example below.

First, open the Node command line:

```bash
$ node --expose-gc
```

The `--expose-gc` parameter allows manual execution of the garbage collector.

Then execute the following code:

```javascript
// Manually run GC once to get accurate memory state
> global.gc();
undefined

// Check initial memory, heapUsed ~4M
> process.memoryUsage();
{ rss: 21106688,
  heapTotal: 7376896,
  heapUsed: 4153936,
  external: 9059 }

> let wm = new WeakMap();
undefined

// Create key pointing to 5*1024*1024 array
> let key = new Array(5 * 1024 * 1024);
undefined

// Set WeakMap key to point at key array
// Key array is referenced twice: once by key var, once by WeakMap
// WeakMap is weak ref, so for engine ref count is still 1
> wm.set(key, 1);
WeakMap {}

> global.gc();
undefined

// heapUsed now ~45M
> process.memoryUsage();
{ rss: 67538944,
  heapTotal: 7376896,
  heapUsed: 45782816,
  external: 8945 }

// Clear key's reference to array (WeakMap key still references it)
> key = null;
null

// Run GC again
> global.gc();
undefined

// heapUsed back to ~4M; WeakMap key did not block GC
> process.memoryUsage();
{ rss: 20639744,
  heapTotal: 8425472,
  heapUsed: 3979792,
  external: 8956 }
```

In the code above, once the external reference disappears, WeakMap's internal reference is automatically cleared by the garbage collector. With WeakMap, solving memory leaks becomes much simpler.

Chrome DevTools' Memory panel has a trash can button that forces garbage collection. This can also be used to observe whether references inside WeakMap disappear.

### WeakMap Use Cases

As mentioned, a typical WeakMap use case is DOM nodes as keys. Example:

```javascript
let myWeakmap = new WeakMap();

myWeakmap.set(
  document.getElementById('logo'),
  {timesClicked: 0})
;

document.getElementById('logo').addEventListener('click', function() {
  let logoData = myWeakmap.get(document.getElementById('logo'));
  logoData.timesClicked++;
}, false);
```

In the code above, `document.getElementById('logo')` is a DOM node. Whenever a `click` event occurs, the state is updated. We store this state as the value in WeakMap with the node object as the key. Once the DOM node is removed, the state disappears automatically with no memory leak risk.

Another use of WeakMap is implementing private properties.

```javascript
const _counter = new WeakMap();
const _action = new WeakMap();

class Countdown {
  constructor(counter, action) {
    _counter.set(this, counter);
    _action.set(this, action);
  }
  dec() {
    let counter = _counter.get(this);
    if (counter < 1) return;
    counter--;
    _counter.set(this, counter);
    if (counter === 0) {
      _action.get(this)();
    }
  }
}

const c = new Countdown(2, () => console.log('DONE'));

c.dec()
c.dec()
// DONE
```

In the code above, the two internal properties `_counter` and `_action` of the `Countdown` class are weak references to the instance, so when the instance is deleted they disappear too, avoiding memory leaks.

## WeakRef

WeakSet and WeakMap are data structures based on weak references. [ES2021](https://github.com/tc39/proposal-weakrefs) goes further by providing the WeakRef object to directly create weak references to objects.

```javascript
let target = {};
let wr = new WeakRef(target);
```

In the example above, `target` is the original object. The `WeakRef()` constructor creates a new object `wr` based on `target`. Here `wr` is a WeakRef instance and a weak reference to `target`. The garbage collector does not count this reference—i.e., the existence of `wr` does not prevent `target` from being garbage collected.

WeakRef instances have a `deref()` method. If the original object exists, it returns the original object; if the original object has been garbage collected, it returns `undefined`.

```javascript
let target = {};
let wr = new WeakRef(target);

let obj = wr.deref();
if (obj) { // target not yet garbage collected
  // ...
}
```

In the example above, the `deref()` method can determine whether the original object has been cleared.

A major use of weak reference objects is caching—values can be read from cache when not cleared, and the cache invalidates automatically once cleared.

```javascript
function makeWeakCached(f) {
  const cache = new Map();
  return key => {
    const ref = cache.get(key);
    if (ref) {
      const cached = ref.deref();
      if (cached !== undefined) return cached;
    }

    const fresh = f(key);
    cache.set(key, new WeakRef(fresh));
    return fresh;
  };
}

const getImageCached = makeWeakCached(getImage);
```

In the example above, `makeWeakCached()` builds a cache that stores weak references to the original files.

Note: The standard specifies that once a weak reference is created with `WeakRef()` to an original object, the original object will definitely not be collected in the current event loop—it can only be collected in a subsequent event loop.

## FinalizationRegistry

[ES2021](https://github.com/tc39/proposal-weakrefs#finalizers) introduced FinalizationRegistry for cleanup registration. It specifies a callback to run after a target object has been garbage collected.

First, create a registry instance:

```javascript
const registry = new FinalizationRegistry(heldValue => {
  // ....
});
```

In the code above, `FinalizationRegistry()` is a built-in constructor that returns a cleanup registry instance with the callback to execute. The callback is passed as the argument to `FinalizationRegistry()` and itself receives one parameter, `heldValue`.

Then, the registry instance's `register()` method registers the target object to observe:

```javascript
registry.register(theObject, "some value");
```

In the example above, `theObject` is the target to observe. Once that object is garbage collected, the registry will call the previously registered callback after cleanup and pass `"some value"` as the argument (the earlier `heldValue`).

Note that the registry does not strongly reference the target object—it is a weak reference. A strong reference would prevent the original object from being garbage collected, defeating the purpose of the registry.

The callback's `heldValue` parameter can be any type: string, number, boolean, object, or even `undefined`.

Finally, to cancel an already-registered callback, pass a third parameter to `register()` as a token. This token must be an object, often the original object. Then use the registry instance's `unregister()` method to unregister.

```javascript
registry.register(theObject, "some value", theObject);
// ...other operations...
registry.unregister(theObject);
```

In the code above, the third parameter to `register()` is the token `theObject`. To cancel the callback, use `unregister()` with the token as its argument. The reference to the third parameter in `register()` is also weak. Without this parameter, the callback cannot be cancelled.

Since the callback is removed from the registry after being called, `unregister()` should be called before the callback is invoked.

Below, `FinalizationRegistry` is used to enhance the cache function from the previous section:

```javascript
function makeWeakCached(f) {
  const cache = new Map();
  const cleanup = new FinalizationRegistry(key => {
    const ref = cache.get(key);
    if (ref && !ref.deref()) cache.delete(key);
  });

  return key => {
    const ref = cache.get(key);
    if (ref) {
      const cached = ref.deref();
      if (cached !== undefined) return cached;
    }

    const fresh = f(key);
    cache.set(key, new WeakRef(fresh));
    cleanup.register(fresh, key);
    return fresh;
  };
}

const getImageCached = makeWeakCached(getImage);
```

Compared with the previous section's example, the code above adds a cleanup registry. Once a cached original object is garbage collected, a callback runs automatically to remove the invalid key from the cache.

Another example:

```javascript
class Thingy {
  #file;
  #cleanup = file => {
    console.error(
      `The \`release\` method was never called for the \`Thingy\` for the file "${file.name}"`
    );
  };
  #registry = new FinalizationRegistry(this.#cleanup);

  constructor(filename) {
    this.#file = File.open(filename);
    this.#registry.register(this, this.#file, this.#file);
  }

  release() {
    if (this.#file) {
      this.#registry.unregister(this.#file);
      File.close(this.#file);
      this.#file = null;
    }
  }
}
```

In the example above, if for some reason a `Thingy` instance is garbage collected without calling `release()`, the cleanup registry will call the `#cleanup()` callback and log an error.

Because we cannot know when the cleanup runs, it is best to avoid using it. Also, if the browser window closes or the process exits unexpectedly, the cleanup will not run.

## Reference Links

- [Union, intersection, difference, and more are coming to JavaScript Sets](https://www.sonarsource.com/blog/union-intersection-difference-javascript-sets/)
