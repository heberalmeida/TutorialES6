# New String Methods

This chapter covers new methods on the string object.

## String.fromCodePoint()

ES5 provides `String.fromCharCode()` to create characters from Unicode code points, but it does not support code points greater than `0xFFFF`.

```javascript
String.fromCharCode(0x20BB7)
// "ஷ"
```

In the code above, `String.fromCharCode()` cannot handle code points above `0xFFFF`, so `0x20BB7` overflows. The highest digit `2` is dropped, and it returns the character for U+0BB7 instead of U+20BB7.

ES6 adds `String.fromCodePoint()`, which handles code points above `0xFFFF`. It is the inverse of `codePointAt()`.

```javascript
String.fromCodePoint(0x20BB7)
// "𠮷"
String.fromCodePoint(0x78, 0x1f680, 0x79) === 'x\uD83D\uDE80y'
// true
```

With multiple arguments, `String.fromCodePoint()` concatenates their characters into a single string.

Note: `fromCodePoint` is defined on `String`, while `codePointAt` is an instance method on strings.

## String.raw()

ES6 also adds `raw()` to `String`. It returns a string with backslashes escaped (each backslash is preceded by another backslash). It is mainly used for template string tag functions.

```javascript
String.raw`Hi\n${2+3}!`
// Actually returns "Hi\\n5!", displays as "Hi\n5!"

String.raw`Hi\u000A!`;
// Actually returns "Hi\\u000A!", displays as "Hi\u000A!"
```

If backslashes are already escaped in the source string, `String.raw()` escapes them again.

```javascript
String.raw`Hi\\n`
// Returns "Hi\\\\n"

String.raw`Hi\\n` === "Hi\\\\n" // true
```

`String.raw()` can serve as the base for template string processing: it replaces interpolations and escapes backslashes, producing a string suitable for further use.

As a normal function, `String.raw()` expects its first argument to be an object with a `raw` property whose value is an array matching the parsed template string.

```javascript
// `foo${1 + 2}bar`
// is equivalent to
String.raw({ raw: ['foo', 'bar'] }, 1 + 2) // "foo3bar"
```

The `raw` property of the first argument corresponds to the array produced by parsing the template string.

As a function, `String.raw()` can be implemented roughly as:

```javascript
String.raw = function (strings, ...values) {
  let output = '';
  let index;
  for (index = 0; index < values.length; index++) {
    output += strings.raw[index] + values[index];
  }

  output += strings.raw[index]
  return output;
}
```

## Instance Method: codePointAt()

Internally, JavaScript stores characters in UTF-16. Each character uses 2 bytes. Characters that need 4 bytes (Unicode code points above `0xFFFF`) are treated as two characters.

```javascript
var s = "😀";

s.length // 2
s.charAt(0) // ''
s.charAt(1) // ''
s.charCodeAt(0) // 55357
s.charCodeAt(1) // 56832
```

The character "😀" (emoji) has code point `0x1F600`, encoded in UTF-16 as `0xD83D 0xDE00` (decimal 55357 56832), requiring 4 bytes. JavaScript misreports the length as 2, `charAt()` cannot read the full character, and `charCodeAt()` returns the surrogate halves separately.

ES6 adds `codePointAt()`, which correctly handles 4-byte characters and returns the full code point.

```javascript
let s = '😀a';

s.codePointAt(0) // 128512
s.codePointAt(1) // 56832

s.codePointAt(2) // 97
```

The argument to `codePointAt()` is the index of the character in the string (0-based). JavaScript treats "😀a" as three characters; at index 0, `codePointAt` correctly returns the full code point 128512 (hex 0x1F600). At index 1 ("😀" low surrogate) and 2 ("a"), the result matches `charCodeAt()`.

In short, `codePointAt()` returns the code point for 32-bit UTF-16 characters. For regular 2-byte characters, it behaves like `charCodeAt()`.

`codePointAt()` returns a decimal value. Use `toString(16)` for hex:

```javascript
let s = '😀a';

s.codePointAt(0).toString(16) // "1f600"
s.codePointAt(2).toString(16) // "61"
```

You may notice that `codePointAt()` still uses surrogate-based indices. For "a", the logical position is 1, but we must pass 2. Using `for...of` avoids this, since it respects 32-bit UTF-16 characters:

```javascript
let s = '𠮷a';
for (let ch of s) {
  console.log(ch.codePointAt(0).toString(16));
}
// 20bb7
// 61
```

You can also use the spread operator:

```javascript
let arr = [...'𠮷a']; // arr.length === 2
arr.forEach(
  ch => console.log(ch.codePointAt(0).toString(16))
);
// 20bb7
// 61
```

`codePointAt()` is a simple way to test whether a character uses 2 or 4 bytes.

```javascript
function is32Bit(c) {
  return c.codePointAt(0) > 0xFFFF;
}

is32Bit("𠮷") // true
is32Bit("a") // false
```

## Instance Method: normalize()

Many European languages use tone and accent marks. Unicode supports this in two ways: precomposed characters (e.g. `Ǒ`, `\u01D1`) and base + combining character (e.g. `O` + `ˇ` → `Ǒ`).

The two forms are visually and semantically equivalent, but JavaScript does not treat them as equal:

```javascript
'\u01D1'==='\u004F\u030C' //false

'\u01D1'.length // 1
'\u004F\u030C'.length // 2
```

JavaScript treats the decomposed form as two characters, so the two representations are not equal.

ES6 adds `normalize()` on string instances to unify different representations. This is Unicode normalization.

```javascript
'\u01D1'.normalize() === '\u004F\u030C'.normalize()
// true
```

`normalize()` accepts an optional parameter for the normalization form:

- `NFC` (default): Canonical composition. Combines base + combining characters.
- `NFD`: Canonical decomposition. Splits into base + combining characters.
- `NFKC`: Compatibility composition. Stronger equivalence; e.g. "ﬀ" (U+FB00) and "ff" are compatible.
- `NFKD`: Compatibility decomposition. Compatibility equivalent decomposed.

```javascript
'\u004F\u030C'.normalize('NFC').length // 1
'\u004F\u030C'.normalize('NFD').length // 2
```

`NFC` returns the composed form; `NFD` returns the decomposed form.

`normalize()` does not handle sequences of three or more characters. For that, use regex with Unicode ranges instead.

## Instance Method: includes(), startsWith(), endsWith()

Traditionally, JavaScript only had `indexOf()` to check if a string contains another. ES6 adds three new methods:

- **includes()**: Returns a boolean indicating whether the search string is found.
- **startsWith()**: Returns a boolean indicating whether the search string is at the start.
- **endsWith()**: Returns a boolean indicating whether the search string is at the end.

```javascript
let s = 'Hello world!';

s.startsWith('Hello') // true
s.endsWith('!') // true
s.includes('o') // true
```

All three accept a second argument for the starting index of the search.

```javascript
let s = 'Hello world!';

s.startsWith('world', 6) // true
s.endsWith('Hello', 5) // true
s.includes('Hello', 6) // false
```

With the second argument `n`, `endsWith` behaves differently: it restricts to the first `n` characters, while the others search from index `n` to the end.

## Instance Method: repeat()

`repeat` returns a new string formed by repeating the original string `n` times.

```javascript
'x'.repeat(3) // "xxx"
'hello'.repeat(2) // "hellohello"
'na'.repeat(0) // ""
```

Fractional values are floored.

```javascript
'na'.repeat(2.9) // "nana"
```

Negative numbers and `Infinity` throw:

```javascript
'na'.repeat(Infinity)
// RangeError
'na'.repeat(-1)
// RangeError
```

Values between 0 and -1 are floored to 0 (floored -0.9 is -0, which `repeat` treats as 0):

```javascript
'na'.repeat(-0.9) // ""
```

`NaN` is treated as 0:

```javascript
'na'.repeat(NaN) // ""
```

If the argument is a string, it is converted to a number first:

```javascript
'na'.repeat('na') // ""
'na'.repeat('3') // "nanana"
```

## Instance Method: padStart(), padEnd()

ES2017 adds padding for strings. `padStart()` pads at the start, `padEnd()` at the end. Both take the target length and an optional padding string.

```javascript
'x'.padStart(5, 'ab') // 'ababx'
'x'.padStart(4, 'ab') // 'abax'

'x'.padEnd(5, 'ab') // 'xabab'
'x'.padEnd(4, 'ab') // 'xaba'
```

If the string is already at least the target length, it is returned unchanged:

```javascript
'xxx'.padStart(2, 'ab') // 'xxx'
'xxx'.padEnd(2, 'ab') // 'xxx'
```

If the padding string would exceed the remaining length, it is truncated:

```javascript
'abc'.padStart(10, '0123456789')
// '0123456abc'
```

Omitting the second argument uses spaces:

```javascript
'x'.padStart(4) // '   x'
'x'.padEnd(4) // 'x   '
```

A common use of `padStart()` is padding numeric strings to a fixed width:

```javascript
'1'.padStart(10, '0') // "0000000001"
'12'.padStart(10, '0') // "0000000012"
'123456'.padStart(10, '0') // "0000123456"
```

Another use is hinting date formats:

```javascript
'12'.padStart(10, 'YYYY-MM-DD') // "YYYY-MM-12"
'09-12'.padStart(10, 'YYYY-MM-DD') // "YYYY-09-12"
```

## Instance Method: trimStart(), trimEnd()

[ES2019](https://github.com/tc39/proposal-string-left-right-trim) adds `trimStart()` and `trimEnd()` on string instances. They work like `trim()`: `trimStart()` removes leading whitespace, `trimEnd()` trailing whitespace. Both return new strings and do not modify the original.

```javascript
const s = '  abc  ';

s.trim() // "abc"
s.trimStart() // "abc  "
s.trimEnd() // "  abc"
```

They also remove leading/trailing tabs, newlines, and other whitespace.

Some browsers provide `trimLeft()` and `trimRight()` as aliases for `trimStart()` and `trimEnd()`.

## Instance Method: matchAll()

The `matchAll()` method returns all matches of a regular expression in the string. See the RegExp chapter for details.

## Instance Method: replaceAll()

Historically, `replace()` only replaced the first match:

```javascript
'aabbcc'.replace('b', '_')
// 'aa_bcc'
```

To replace all matches, you had to use a regex with the `g` flag:

```javascript
'aabbcc'.replace(/b/g, '_')
// 'aa__cc'
```

[ES2021](https://github.com/tc39/proposal-string-replaceall) adds `replaceAll()` to replace all matches:

```javascript
'aabbcc'.replaceAll('b', '_')
// 'aa__cc'
```

It behaves like `replace()` but replaces all occurrences. It returns a new string and does not modify the original.

```javascript
String.prototype.replaceAll(searchValue, replacement)
```

`searchValue` can be a string or a global regex (with `g` flag).

If `searchValue` is a regex without the `g` flag, `replaceAll()` throws. This differs from `replace()`.

```javascript
// does not throw
'aabbcc'.replace(/b/, '_')

// throws
'aabbcc'.replaceAll(/b/, '_')
```

The second parameter `replacement` can use special placeholders:

- `$&`: Matched text
- `` $` ``: Text before the match
- `$'`: Text after the match
- `$n`: Capture group `n` (1-based). Requires `searchValue` to be a regex.
- `$$`: Literal `$`

Examples:

```javascript
// $& is the matched string, so result equals the original
'abbc'.replaceAll('b', '$&')
// 'abbc'

// $` is the text before each match
'abbc'.replaceAll('b', '$`')
// 'aaabc'

// $' is the text after each match
'abbc'.replaceAll('b', `$'`)
// 'abccc'

// $1, $2 refer to capture groups
'abbc'.replaceAll(/(ab)(bc)/g, '$2$1')
// 'bcab'

// $$ is literal $
'abc'.replaceAll('b', '$$')
// 'a$c'
```

`replacement` can also be a function. Its return value replaces the matched text:

```javascript
'aabbcc'.replaceAll('b', () => '_')
// 'aa__cc'
```

The replacement function receives: the match, capture groups, the match index, and the original string.

```javascript
const str = '123abc456';
const regex = /(\d+)([a-z]+)(\d+)/g;

function replacer(match, p1, p2, p3, offset, string) {
  return [p1, p2, p3].join(' - ');
}

str.replaceAll(regex, replacer)
// 123 - abc - 456
```

Here the regex has three groups, so `replacer` receives `match` and the three captures `p1`, `p2`, `p3`.

## Instance Method: at()

The `at()` method takes an integer index and returns the character at that position. Negative indices count from the end:

```javascript
const str = 'hello';
str.at(1) // "e"
str.at(-1) // "o"
```

If the index is out of range, `at()` returns `undefined`.

This method is based on the array `at()` proposal. See the Array chapter for details.

## Instance Method: toWellFormed()

ES2024 adds `toWellFormed()` to handle Unicode surrogate pairs.

JavaScript uses UTF-16 internally. UTF-16 uses 16 bits per unit, so it can represent code points from U+0000 to U+FFFF directly. Code points above U+FFFF (U+10000 to U+10FFFF) are encoded as surrogate pairs: two UTF-16 units. The range U+D800–U+DFFF is reserved for these surrogates. The high surrogate is 0xD800–0xDBFF and the low surrogate 0xDC00–0xDFFF. For example, U+1D306 (𝌆) is encoded as 0xD834 0xDF06.

Sometimes strings contain lone surrogates (e.g. a character in U+D800–U+DFFF without a pair). These are ill-formed and can cause issues.

`toWellFormed()` returns a new string where any lone surrogate is replaced by the replacement character U+FFFD. It does not modify the original string.

```javascript
"ab\uD800".toWellFormed() // 'ab'
```

In the example, `\uD800` is a lone surrogate. `toWellFormed()` converts it to `\uFFFD`.

Functions like `encodeURI()` throw when given a string with lone surrogates:

```javascript
const illFormed = "https://example.com/search?q=\uD800";

encodeURI(illFormed) // throws
```

Using `toWellFormed()` first avoids the error:

```javascript
const illFormed = "https://example.com/search?q=\uD800";

encodeURI(illFormed.toWellFormed()) // works
```
