# RegExp Extensions

## RegExp Constructor

In ES5, the `RegExp` constructor takes two kinds of arguments.

First: two arguments — a string (the pattern) and a second string for the flags:

```javascript
var regex = new RegExp('xyz', 'i');
// equivalent to
var regex = /xyz/i;
```

Second: a single regex argument, which returns a copy of the original regex:

```javascript
var regex = new RegExp(/xyz/i);
// equivalent to
var regex = /xyz/i;
```

However, ES5 does not allow passing a second argument when the first is a regex, and would throw:

```javascript
var regex = new RegExp(/xyz/, 'i');
// Uncaught TypeError: Cannot supply flags when constructing one RegExp from another
```

ES6 changes this: when the first argument is a regex, the second can specify flags. The new regex ignores the original flags and uses only the new ones.

```javascript
new RegExp(/abc/ig, 'i').flags
// "i"
```

The original regex had flags `ig`, but they are overridden by the second argument `i`.

## String RegExp Methods

Before ES6, there were four string methods that used regular expressions: `match()`, `replace()`, `search()`, and `split()`.

ES6 makes these call the corresponding `RegExp` prototype methods internally, so all regex behavior is defined on `RegExp`:

- `String.prototype.match` calls `RegExp.prototype[Symbol.match]`
- `String.prototype.replace` calls `RegExp.prototype[Symbol.replace]`
- `String.prototype.search` calls `RegExp.prototype[Symbol.search]`
- `String.prototype.split` calls `RegExp.prototype[Symbol.split]`

## u Modifier

ES6 adds the `u` modifier to regular expressions, meaning "Unicode mode," which correctly handles characters above `\uFFFF` (four-byte UTF-16 encoding).

```javascript
/^\uD83D/u.test('\uD83D\uDC2A') // false
/^\uD83D/.test('\uD83D\uDC2A') // true
```

`\uD83D\uDC2A` is a four-byte UTF-16 encoding for one character. ES5 treats it as two characters, so the second line is `true`. With `u`, ES6 treats it as one character, so the first line is `false`.

With `u`, the following regex behaviors change:

**1. Dot (`.`)**

The dot matches any single character except newlines. For code points above `0xFFFF`, the dot fails unless `u` is used.

```javascript
var s = '𠮷';

/^.$/.test(s) // false
/^.$/u.test(s) // true
```

**2. Unicode escape**

ES6 supports curly-brace Unicode escapes (e.g. `\u{61}`) in regexes. With `u`, the braces are recognized; without it, they may be interpreted as quantifiers.

```javascript
/\u{61}/.test('a') // false
/\u{61}/u.test('a') // true
/\u{20BB7}/u.test('𠮷') // true
```

Without `u`, `\u{61}` is not recognized and might be read as 61 consecutive `u`s.

**3. Quantifiers**

With `u`, quantifiers correctly count code points above `0xFFFF`:

```javascript
/a{2}/.test('aa') // true
/a{2}/u.test('aa') // true
/𠮷{2}/.test('𠮷𠮷') // false
/𠮷{2}/u.test('𠮷𠮷') // true
```

**4. Predefined character classes**

With `u`, classes like `\S` correctly match code points above `0xFFFF`:

```javascript
/^\S$/.test('𠮷') // false
/^\S$/u.test('𠮷') // true
```

You can use this to get correct string length:

```javascript
function codePointLength(text) {
  var result = text.match(/[\s\S]/gu);
  return result ? result.length : 0;
}

var s = '𠮷𠮷';

s.length // 4
codePointLength(s) // 2
```

**5. i modifier**

Some Unicode characters have different encodings but look alike (e.g. `\u004B` and `\u212A` for uppercase K):

```javascript
/[a-z]/i.test('\u212A') // false
/[a-z]/iu.test('\u212A') // true
```

Without `u`, the non-canonical K is not recognized.

**6. Escaping**

Without `u`, undefined escapes (e.g. `\,`) are ignored. With `u`, they cause errors:

```javascript
/\,/ // /\,,/
/\,/u // throws
```

## RegExp.prototype.unicode Property

RegExp instances have a `unicode` property indicating whether the `u` flag is set.

```javascript
const r1 = /hello/;
const r2 = /hello/u;

r1.unicode // false
r2.unicode // true
```

## y Modifier

ES6 also adds the `y` modifier (sticky modifier) to regex.

`y` is similar to `g` in that it enables global matching. Each match starts after the previous match. The difference: `g` allows a match anywhere in the remaining string, while `y` requires the match to start at the very next position — hence "sticky."

```javascript
var s = 'aaa_aa_a';
var r1 = /a+/g;
var r2 = /a+/y;

r1.exec(s) // ["aaa"]
r2.exec(s) // ["aaa"]

r1.exec(s) // ["aa"]
r2.exec(s) // null
```

After the first match, the remainder is `_aa_a`. With `g`, the second match succeeds. With `y`, matching must start at the start of the remainder (at `_`), so the second match fails.

If the pattern always matches from the start of the remainder, `y` keeps returning matches:

```javascript
var s = 'aaa_aa_a';
var r = /a+_/y;

r.exec(s) // ["aaa_"]
r.exec(s) // ["aa_"]
```

`lastIndex` clarifies how `y` works:

```javascript
const REGEX = /a/g;

// start matching at index 2
REGEX.lastIndex = 2;

const match = REGEX.exec('xaya');

match.index // 3

REGEX.lastIndex // 4

REGEX.exec('xaya') // null
```

With `g`, the regex scans from `lastIndex` until it finds a match.

With `y`, matching must succeed exactly at `lastIndex`:

```javascript
const REGEX = /a/y;

REGEX.lastIndex = 2;

REGEX.exec('xaya') // null

REGEX.lastIndex = 3;

const match = REGEX.exec('xaya');
match.index // 3
REGEX.lastIndex // 4
```

Conceptually, `y` implies a start-of-string anchor at each step:

```javascript
/b/y.exec('aba')
// null
```

`b` does not appear at the start, so the match fails. The design of `y` makes the start anchor effective at each match position.

Example with `replace`:

```javascript
const REGEX = /a/gy;
'aaxa'.replace(REGEX, '-') // '--xa'
```

The last `a` is not at the start of the next match position, so it is not replaced.

With only `y`, `match` returns only the first match. Combine with `g` to get all matches:

```javascript
'a1a2a3'.match(/a\d/y) // ["a1"]
'a1a2a3'.match(/a\d/gy) // ["a1", "a2", "a3"]
```

`y` is useful for tokenizing: it ensures no characters are skipped between matches:

```javascript
const TOKEN_Y = /\s*(\+|[0-9]+)\s*/y;
const TOKEN_G  = /\s*(\+|[0-9]+)\s*/g;

tokenize(TOKEN_Y, '3 + 4')
// [ '3', '+', '4' ]
tokenize(TOKEN_G, '3 + 4')
// [ '3', '+', '4' ]

function tokenize(TOKEN_REGEX, str) {
  let result = [];
  let match;
  while (match = TOKEN_REGEX.exec(str)) {
    result.push(match[1]);
  }
  return result;
}
```

Without invalid characters, `y` and `g` produce the same tokens. With invalid characters, they differ:

```javascript
tokenize(TOKEN_Y, '3x + 4')
// [ '3' ]
tokenize(TOKEN_G, '3x + 4')
// [ '3', '+', '4' ]
```

With `g`, invalid characters are skipped. With `y`, they cause the match to stop, making errors easy to detect.

## RegExp.prototype.sticky Property

RegExp instances have a `sticky` property for the `y` flag:

```javascript
var r = /hello\d/y;
r.sticky // true
```

## RegExp.prototype.flags Property

ES6 adds a `flags` property that returns the regex flags:

```javascript
/abc/ig.source
// "abc"

/abc/ig.flags
// 'gi'
```

## s Modifier: dotAll Mode

In regex, the dot (`.`) matches any single character except two cases: four-byte UTF-16 characters (handled with `u`) and line terminator characters.

Line terminators are:

- U+000A: Line feed (`\n`)
- U+000D: Carriage return (`\r`)
- U+2028: Line separator
- U+2029: Paragraph separator

```javascript
/foo.bar/.test('foo\nbar')
// false
```

The dot does not match `\n`, so the result is `false`.

A common workaround is to use a negated class:

```javascript
/foo[^]bar/.test('foo\nbar')
// true
```

ES2018 [adds](https://github.com/tc39/proposal-regexp-dotall-flag) the `s` modifier so that `.` matches any character including line terminators:

```javascript
/foo.bar/s.test('foo\nbar') // true
```

This is called dotAll mode. RegExp instances have a `dotAll` property:

```javascript
const re = /foo.bar/s;

re.test('foo\nbar') // true
re.dotAll // true
re.flags // 's'
```

The `s` and `m` modifiers can be used together: `.` matches everything, while `^` and `$` match line boundaries.

## Lookbehind Assertions

Previously, JavaScript regex only supported lookahead (`(?=...)`) and negative lookahead (`(?!...)`). ES2018 adds [lookbehind](https://github.com/tc39/proposal-regexp-lookbehind) assertions (lookbehind and negative lookbehind).

Lookahead: `x` matches only when followed by `y`, written as `/x(?=y)/`. For example, numbers before `%`:

```javascript
/\d+(?=%)/.exec('100% of US presidents have been male')  // ["100"]
/\d+(?!%)/.exec('that's all 44 of them')                 // ["44"]
```

The lookahead part is not included in the match.

Lookbehind is the opposite: `x` matches only when preceded by `y`, written as `/(?<=y)x/`. Example: numbers after `$`:

```javascript
/(?<=\$)\d+/.exec('Benjamin Franklin is on the $100 bill')  // ["100"]
/(?<!\$)\d+/.exec('it's worth about €90')                   // ["90"]
```

The lookbehind part is also excluded from the match.

Example of replacement with lookbehind:

```javascript
const RE_DOLLAR_PREFIX = /(?<=\$)foo/g;
'$foo %foo foo'.replace(RE_DOLLAR_PREFIX, 'bar');
// '$bar %foo foo'
```

Only `foo` that follows `$` is replaced.

Lookbehind is matched right-to-left after matching `x`, which causes some differences from normal regex behavior.

First, group ordering in lookbehind can differ:

```javascript
/(?<=(\d+)(\d+))$/.exec('1053') // ["", "1", "053"]
/^(\d+)(\d+)$/.exec('1053') // ["1053", "105", "3"]
```

Without lookbehind, the first group is greedy and the second captures one digit. With lookbehind, the order is reversed.

Second, backreferences in lookbehind must appear before the referenced group:

```javascript
/(?<=(o)d\1)r/.exec('hodor')  // null
/(?<=\1d(o))r/.exec('hodor')  // ["r", "o"]
```

## Unicode Property Escapes

ES2018 [adds](https://github.com/tc39/proposal-regexp-unicode-property-escapes) Unicode property escapes: `\p{...}` and `\P{...}` (negated). These require the `u` modifier.

```javascript
const regexGreekSymbol = /\p{Script=Greek}/u;
regexGreekSymbol.test('π') // true
```

`\p{Script=Greek}` matches one Greek character.

The standard form specifies both property and value:

```javascript
\p{UnicodePropertyName=UnicodePropertyValue}
```

For some properties, the name or value alone can be used:

```javascript
\p{UnicodePropertyName}
\p{UnicodePropertyValue}
```

`\P{...}` matches characters that do not satisfy the property.

```javascript
const regex = /^\p{Decimal_Number}+$/u;
regex.test('𝟏𝟐𝟑𝟜𝟝𝟞𝟩𝟪𝟫𝟬𝟭𝟮𝟯𝟺𝟻𝟼') // true
```

`\p{Number}` can match Roman numerals, superscript digits, etc:

```javascript
const regex = /^\p{Number}+$/u;
regex.test('²³¹¼½¾') // true
regex.test('㉛㉜㉝') // true
regex.test('ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪⅫ') // true
```

More examples:

```javascript
\p{White_Space}

\p{Hex_Digit}

[\p{Alphabetic}\p{Mark}\p{Decimal_Number}\p{Connector_Punctuation}\p{Join_Control}]

[^\p{Alphabetic}\p{Mark}\p{Decimal_Number}\p{Connector_Punctuation}\p{Join_Control}]

/\p{Extended_Pictographic}/u

const regexArrows = /^\p{Block=Arrows}+$/u;
regexArrows.test('←↑→↓↔↕↖↗↘↙⇏⇐⇑⇒⇓⇔⇕⇖⇗⇘⇙⇧⇩') // true
```

## v Modifier: Set Operations on Unicode Properties

To add or remove characters from a Unicode property class, ES2024 adds [set operations](https://github.com/tc39/proposal-regexp-v-flag):

```javascript
// set difference (A minus B)
[A--B]

// set intersection (A and B)
[A&&B]
```

A and B can be character classes (e.g. `[a-z]`) or Unicode property classes (e.g. `\p{ASCII}`). Nesting is allowed:

```javascript
[A--[0-9]]
```

These require the new `v` modifier. `v` implies Unicode semantics, so `u` is not needed when using `v`.

Examples:

```javascript
[\p{Decimal_Number}--[0-9]]

[\p{Emoji}--\p{ASCII}]
```

`0` is in `\p{Decimal_Number}`:

```javascript
/[\p{Decimal_Number}]/u.test('0') // true
```

Subtracting `[0-9]` removes it:

```javascript
/[\p{Decimal_Number}--[0-9]]/v.test('0') // false
```

## Named Capture Groups

### Overview

Regex uses parentheses for capturing groups:

```javascript
const RE_DATE = /(\d{4})-(\d{2})-(\d{2})/;
```

Using `exec`:

```javascript
const RE_DATE = /(\d{4})-(\d{2})-(\d{2})/;

const matchObj = RE_DATE.exec('1999-12-31');
const year = matchObj[1]; // 1999
const month = matchObj[2]; // 12
const day = matchObj[3]; // 31
```

Groups are referenced by index. If the order changes, references must be updated. ES2018 adds [named capture groups](https://github.com/tc39/proposal-regexp-named-groups):

```javascript
const RE_DATE = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;

const matchObj = RE_DATE.exec('1999-12-31');
const year = matchObj.groups.year; // "1999"
const month = matchObj.groups.month; // "12"
const day = matchObj.groups.day; // "31"
```

Groups are named with `?<name>` in the pattern. Numeric indices still work.

If a named group does not match, `groups.property` is `undefined`, but the key exists:

```javascript
const RE_OPT_A = /^(?<as>a+)?$/;
const matchObj = RE_OPT_A.exec('');

matchObj.groups.as // undefined
'as' in matchObj.groups // true
```

With `|`, the same name can be used in different alternatives:

```javascript
const RE = /(?<chars>a+)|(?<chars>b+)/v;
```

### Destructuring and Replacement

With named groups you can destructure the result:

```javascript
let {groups: {one, two}} = /^(?<one>.*):(?<two>.*)$/u.exec('foo:bar');
one  // foo
two  // bar
```

In replacement, use `$<name>`:

```javascript
let re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/u;

'2015-01-02'.replace(re, '$<day>/$<month>/$<year>')
// '02/01/2015'
```

The replacement can be a function. Its last parameter is the `groups` object:

```javascript
'2015-01-02'.replace(re, (
   matched, capture1, capture2, capture3, position, S, groups
 ) => {
 let {day, month, year} = groups;
 return `${day}/${month}/${year}`;
});
```

### Backreferences

Reference a named group inside the regex with `\k<name>`:

```javascript
const RE_TWICE = /^(?<word>[a-z]+)!\k<word>$/;
RE_TWICE.test('abc!abc') // true
RE_TWICE.test('abc!ab') // false
```

Numeric backreferences (`\1`) still work, and both can be combined:

```javascript
const RE_TWICE = /^(?<word>[a-z]+)!\k<word>!\1$/;
RE_TWICE.test('abc!abc!abc') // true
```

## d Modifier: Match Indices

Getting start and end indices of capture groups has been awkward. `exec()` provides `index` for the full match, but not per group. [ES2022](https://github.com/tc39/proposal-regexp-match-Indices) adds the `d` modifier, which adds an `indices` property:

```javascript
const text = 'zabbcdef';
const re = /ab/d;
const result = re.exec(text);

result.index // 1
result.indices // [ [1, 3] ]
```

`indices` is an array of `[start, end]` pairs. Start is inclusive, end is exclusive.

With capture groups:

```javascript
const text = 'zabbcdef';
const re = /ab+(cd)/d;
const result = re.exec(text);

result.indices // [ [ 1, 6 ], [ 4, 6 ] ]
```

Multiple groups:

```javascript
const text = 'zabbcdef';
const re = /ab+(cd(ef))/d;
const result = re.exec(text);

result.indices // [ [1, 8], [4, 8], [6, 8] ]
```

Named groups get `indices.groups`:

```javascript
const text = 'zabbcdef';
const re = /ab+(?<Z>cd)/d;
const result = re.exec(text);

result.indices.groups // { Z: [ 4, 6 ] }
```

Unmatched groups have `undefined` in `indices` and `indices.groups`.

## String.prototype.matchAll()

To get all matches, you typically use `g` or `y` and loop with `exec`:

```javascript
var regex = /t(e)(st(\d?))/g;
var string = 'test1test2test3';

var matches = [];
var match;
while (match = regex.exec(string)) {
  matches.push(match);
}
```

[ES2020](https://github.com/tc39/proposal-string-matchall) adds `matchAll()`, which returns an iterator over all matches:

```javascript
const string = 'test1test2test3';
const regex = /t(e)(st(\d?))/g;

for (const match of string.matchAll(regex)) {
  console.log(match);
}
```

Convert to array:

```javascript
[...string.matchAll(regex)]
Array.from(string.matchAll(regex))
```

## RegExp.escape()

ES2025 adds `RegExp.escape()` to escape a string for safe use in regex:

```javascript
RegExp.escape('(*)')
// '\\(\\*\\)'
```

Characters like `(`, `*`, `)` are escaped. The double backslashes are needed because when the string is used in a regex literal or constructor, the string parser reduces `\\` to `\`.

Characters without special meaning are not escaped:

```javascript
RegExp.escape('_abc123')
// '_abc123'
```

Typical use for search-and-replace:

```javascript
function replacePlainText(str, searchText, replace) {
  const searchRegExp = new RegExp(
    RegExp.escape(searchText),
    'gu'
  );
  return str.replace(searchRegExp, replace)
}
```

## Inline Group Modifiers

ES2025 adds inline flags for groups: modifiers that apply only to part of the pattern. Supported: `i`, `m`, `s`.

```javascript
/^x(?i:HELLO)x$/.test('xHELLOx')
// true

/^x(?i:HELLO)x$/.test('xhellox')
// true
```

`(?i:HELLO)` enables case-insensitivity only for that group.

`(?-flag:pattern)` turns a flag off:

```javascript
/^x(?-i:HELLO)x$/i.test('xHELLOx')
// true
```

You can combine flags: `(?flag1-flag2:pattern)`. `(?:pattern)` remains the non-capturing group form.
