# String Extensions

This chapter introduces ES6 changes and enhancements to strings. The next chapter covers new methods on the string object.

## Unicode Representation of Characters

ES6 improves Unicode support, allowing characters to be represented in the form `\uxxxx`, where `xxxx` is the character's Unicode code point.

```javascript
"\u0061"
// "a"
```

However, this notation is limited to characters with code points between `\u0000` and `\uFFFF`. Characters outside this range must be represented using two 16-bit units (surrogate pairs).

```javascript
"\uD842\uDFB7"
// "𠮷"

"\u20BB7"
// " 7"
```

The code above shows that if you follow `\u` directly with a value exceeding `0xFFFF` (e.g. `\u20BB7`), JavaScript will interpret it as `\u20BB` + `7`. Since `\u20BB` is a non-printable character, only a space is displayed, followed by `7`.

ES6 fixes this: putting the code point inside curly braces allows correct interpretation.

```javascript
"\u{20BB7}"
// "𠮷"

"\u{41}\u{42}\u{43}"
// "ABC"

let hello = 123;
hell\u{6F} // 123

'\u{1F680}' === '\uD83D\uDE80'
// true
```

In the last example above, the curly-brace form is equivalent to the four-byte UTF-16 encoding.

With this notation, JavaScript has six ways to represent a single character.

```javascript
'\z' === 'z'  // true
'\172' === 'z' // true
'\x7A' === 'z' // true
'\u007A' === 'z' // true
'\u{7A}' === 'z' // true
```

## String Iterator

ES6 adds an iterator interface to strings (see the Iterator chapter), so strings can be iterated with `for...of` loops.

```javascript
for (let codePoint of 'foo') {
  console.log(codePoint)
}
// "f"
// "o"
// "o"
```

Besides iterating over strings, the main advantage of this iterator is that it correctly handles code points greater than `0xFFFF`; the traditional `for` loop does not.

```javascript
let text = String.fromCodePoint(0x20BB7);

for (let i = 0; i < text.length; i++) {
  console.log(text[i]);
}
// " "
// " "

for (let i of text) {
  console.log(i);
}
// "𠮷"
```

In the code above, the string `text` has a single character, but the `for` loop treats it as two characters (both non-printable), while `for...of` correctly recognizes the single character.

## Direct Input of U+2028 and U+2029

JavaScript strings allow direct input of characters as well as escape sequences. For example, "é" has Unicode code point U+00E9; you can either type the character directly or use the escape `\u00e9` — both are equivalent.

```javascript
'é' === '\u00e9' // true
```

However, JavaScript requires five characters to appear only in escaped form inside string literals:

- U+005C: Backslash (reverse solidus)
- U+000D: Carriage return
- U+2028: Line separator
- U+2029: Paragraph separator
- U+000A: Line feed

For example, a string must not contain a raw backslash; it must be written as `\\` or `\u005c`.

The rule itself is fine, but JSON format allows U+2028 (line separator) and U+2029 (paragraph separator) directly in strings. As a result, JSON output from a server parsed with `JSON.parse` can throw an error.

```javascript
const json = '"\u2028"';
JSON.parse(json); // may throw
```

The JSON format is frozen (RFC 7159), so it cannot be changed. To avoid this error, [ES2019](https://github.com/tc39/proposal-json-superset) allows JavaScript strings to include U+2028 (line separator) and U+2029 (paragraph separator) directly.

```javascript
const PS = eval("'\u2029'");
```

Under this proposal, the code above does not throw.

Note: Template strings already allow these two characters directly. Regular expressions still do not allow them, which is fine since JSON does not allow raw regular expressions.

## Changes to JSON.stringify()

According to the standard, JSON data must be UTF-8 encoded. The `JSON.stringify()` method may however return strings that are not valid UTF-8.

Specifically, UTF-8 requires code points in the range `0xD800`–`0xDFFF` to be used only in pairs. For example, `\uD834\uDF06` is two code points that must be used together to represent the character `𝌆`. This is a way to represent characters with code points above `0xFFFF`. Using `\uD834` or `\uDF06` alone is invalid, and reversing their order also does not form a valid character.

The issue with `JSON.stringify()` is that it may return lone surrogates in that range.

```javascript
JSON.stringify('\u{D834}') // "\u{D834}"
```

To ensure the output is valid UTF-8, [ES2019](https://github.com/tc39/proposal-well-formed-stringify) changes the behavior of `JSON.stringify()`. For lone surrogates or invalid pairs in the range `0xD800`–`0xDFFF`, it returns escaped strings so the application can decide how to handle them.

```javascript
JSON.stringify('\u{D834}') // ""\\uD834""
JSON.stringify('\uDF06\uD834') // ""\\udf06\\ud834""
```

## Template Strings

Traditional JavaScript often output templates like this (using jQuery below):

```javascript
$('#result').append(
  'There are <b>' + basket.count + '</b> ' +
  'items in your basket, ' +
  '<em>' + basket.onSale +
  '</em> are on sale!'
);
```

This approach is cumbersome. ES6 introduces template strings to solve this.

```javascript
$('#result').append(`
  There are <b>${basket.count}</b> items
   in your basket, <em>${basket.onSale}</em>
  are on sale!
`);
```

Template strings are an enhanced form of string, delimited by backticks (&#96;). They can be used as ordinary strings, for multi-line strings, or to embed variables.

```javascript
// ordinary string
`In JavaScript '\n' is a line-feed.`

// multi-line string
`In JavaScript this is
 not legal.`

console.log(`string text line 1
string text line 2`);

// embedding variables
let name = "Bob", time = "today";
`Hello ${name}, how are you ${time}?`
```

In the template strings above, all use backticks. To include a backtick inside a template string, escape it with a backslash.

```javascript
let greeting = `\`Yo\` World!`;
```

For multi-line template strings, all spaces and indentation are preserved in the output.

```javascript
$('#list').html(`
<ul>
  <li>first</li>
  <li>second</li>
</ul>
`);
```

All spaces and newlines in the template string are preserved, including the newline before `<ul>`. To remove leading/trailing whitespace, use `trim()`.

```javascript
$('#list').html(`
<ul>
  <li>first</li>
  <li>second</li>
</ul>
`.trim());
```

To embed variables, place the variable name inside `${}`.

```javascript
function authorize(user, action) {
  if (!user.hasPrivilege(action)) {
    throw new Error(
      // traditional approach would be
      // 'User '
      // + user.name
      // + ' is not authorized to do '
      // + action
      // + '.'
      `User ${user.name} is not authorized to do ${action}.`);
  }
}
```

Inside the braces you can put any JavaScript expression: arithmetic, object property access, etc.

```javascript
let x = 1;
let y = 2;

`${x} + ${y} = ${x + y}`
// "1 + 2 = 3"

`${x} + ${y * 2} = ${x + y * 2}`
// "1 + 4 = 5"

let obj = {x: 1, y: 2};
`${obj.x + obj.y}`
// "3"
```

Template strings can also call functions.

```javascript
function fn() {
  return "Hello World";
}

`foo ${fn()} bar`
// foo Hello World bar
```

If the expression in the braces is not a string, it is converted to one using the usual rules (e.g. objects use `toString`).

If a variable in a template string is not declared, an error is thrown.

```javascript
// variable place is not declared
let msg = `Hello, ${place}`;
// error
```

Because the content inside `${}` is executed as JavaScript, if it is a string literal it will be output as-is.

```javascript
`Hello ${'World'}`
// "Hello World"
```

Template strings can be nested.

```javascript
const tmpl = addrs => `
  <table>
  ${addrs.map(addr => `
    <tr><td>${addr.first}</td></tr>
    <tr><td>${addr.last}</td></tr>
  `).join('')}
  </table>
`;
```

In the code above, the template string embeds another template string in the variable part. Example usage:

```javascript
const data = [
    { first: '<Jane>', last: 'Bond' },
    { first: 'Lars', last: '<Croft>' },
];

console.log(tmpl(data));
// <table>
//
//   <tr><td><Jane></td></tr>
//   <tr><td>Bond</td></tr>
//
//   <tr><td>Lars</td></tr>
//   <tr><td><Croft></td></tr>
//
// </table>
```

To reference the template string itself and execute it when needed, you can wrap it in a function.

```javascript
let func = (name) => `Hello ${name}!`;
func('Jack') // "Hello Jack!"
```

Here the template string is the function’s return value. Calling the function effectively runs the template string.

## Example: Template Compilation

Below is an example that compiles a template string into a real template.

```javascript
let template = `
<ul>
  <% for(let i=0; i < data.supplies.length; i++) { %>
    <li><%= data.supplies[i] %></li>
  <% } %>
</ul>
`;
```

The template uses `<%...%>` for JavaScript code and `<%= ... %>` for JavaScript expressions to be output.

How to compile this template string? One approach is to turn it into a JavaScript expression string:

```javascript
echo('<ul>');
for(let i=0; i < data.supplies.length; i++) {
  echo('<li>');
  echo(data.supplies[i]);
  echo('</li>');
};
echo('</ul>');
```

This transformation can be done with regular expressions.

```javascript
let evalExpr = /<%=(.+?)%>/g;
let expr = /<%([\s\S]+?)%>/g;

template = template
  .replace(evalExpr, '`); \n  echo( $1 ); \n  echo(`')
  .replace(expr, '`); \n $1 \n  echo(`');

template = 'echo(`' + template + '`);';
```

Then wrap `template` in a function and return it.

```javascript
let script =
`(function parse(data){
  let output = "";

  function echo(html){
    output += html;
  }

  ${ template }

  return output;
})`;

return script;
```

Assembling this into a `compile` function:

```javascript
function compile(template){
  const evalExpr = /<%=(.+?)%>/g;
  const expr = /<%([\s\S]+?)%>/g;

  template = template
    .replace(evalExpr, '`); \n  echo( $1 ); \n  echo(`')
    .replace(expr, '`); \n $1 \n  echo(`');

  template = 'echo(`' + template + '`);';

  let script =
  `(function parse(data){
    let output = "";

    function echo(html){
      output += html;
    }

    ${ template }

    return output;
  })`;

  return script;
}
```

Usage of the `compile` function:

```javascript
let parse = eval(compile(template));
div.innerHTML = parse({ supplies: [ "broom", "mop", "cleaner" ] });
//   <ul>
//     <li>broom</li>
//     <li>mop</li>
//     <li>cleaner</li>
//   </ul>
```

## Tagged Templates

Template strings can also follow a function name. That function is called to process the template string. This is called a "tagged template."

```javascript
alert`hello`
// equivalent to
alert(['hello'])
```

A tagged template is not really a template; it's a special form of function call. The "tag" is the function, and the following template string is its argument.

If the template contains interpolations, the template string is processed into several arguments before the function is called.

```javascript
let a = 5;
let b = 10;

tag`Hello ${ a + b } world ${ a * b }`;
// equivalent to
tag(['Hello ', ' world ', ''], 15, 50);
```

The tag function receives multiple parameters. The return value of the whole expression is what the tag function returns.

```javascript
function tag(stringArr, value1, value2){
  // ...
}

// equivalent to

function tag(stringArr, ...values){
  // ...
}
```

The first parameter is an array whose elements are the literal parts of the template string (the parts between interpolations). Interpolation happens between the first and second elements, second and third, and so on.

The remaining parameters are the values of the interpolated expressions. In this example, the template has two interpolations, so the tag receives `value1` and `value2`.

The actual values for the tag function are:

- First parameter: `['Hello ', ' world ', '']`
- Second parameter: 15
- Third parameter: 50

So the tag is called as:

```javascript
tag(['Hello ', ' world ', ''], 15, 50)
```

You can implement the tag function as needed. Example:

```javascript
let a = 5;
let b = 10;

function tag(s, v1, v2) {
  console.log(s[0]);
  console.log(s[1]);
  console.log(s[2]);
  console.log(v1);
  console.log(v2);

  return "OK";
}

tag`Hello ${ a + b } world ${ a * b}`;
// "Hello "
// " world "
// ""
// 15
// 50
// "OK"
```

A more complex example:

```javascript
let total = 30;
let msg = passthru`The total is ${total} (${total*1.05} with tax)`;

function passthru(literals) {
  let result = '';
  let i = 0;

  while (i < literals.length) {
    result += literals[i++];
    if (i < arguments.length) {
      result += arguments[i];
    }
  }

  return result;
}

msg // "The total is 30 (31.5 with tax)"
```

This example reassembles the string from the literal parts and values in order.

Here is the rest-parameter form of `passthru`:

```javascript
function passthru(literals, ...values) {
  let output = "";
  let index;
  for (index = 0; index < values.length; index++) {
    output += literals[index] + values[index];
  }

  output += literals[index]
  return output;
}
```

Tagged templates are useful for sanitizing HTML strings to prevent malicious user input.

```javascript
let message =
  SaferHTML`<p>${sender} has sent you a message.</p>`;

function SaferHTML(templateData) {
  let s = templateData[0];
  for (let i = 1; i < arguments.length; i++) {
    let arg = String(arguments[i]);

    // Escape special characters in the substitution.
    s += arg.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    // Don't escape special characters in the template.
    s += templateData[i];
  }
  return s;
}
```

The `sender` variable is often user-supplied. After `SaferHTML`, special characters are escaped.

```javascript
let sender = '<script>alert("abc")</script>'; // malicious code
let message = SaferHTML`<p>${sender} has sent you a message.</p>`;

message
// <p>&lt;script&gt;alert("abc")&lt;/script&gt; has sent you a message.</p>
```

Another use is i18n (internationalization):

```javascript
i18n`Welcome to ${siteName}, you are visitor number ${visitorNumber}!`
// "Welcome to xxx, you are visitor number xxxx!"
```

Template strings alone cannot fully replace libraries like Mustache because they lack conditionals and loops, but with tag functions you can add these features.

```javascript
// hashTemplate below is a custom template processor
let libraryHtml = hashTemplate`
  <ul>
    #for book in ${myBooks}
      <li><i>#{book.title}</i> by #{book.author}</li>
    #end
  </ul>
`;
```

You can even use tagged templates to embed other languages inside JavaScript.

```javascript
jsx`
  <div>
    <input
      ref='input'
      onChange='${this.handleChange}'
      defaultValue='${this.state.value}' />
      ${this.state.value}
   </div>
`
```

The code above uses the `jsx` function to turn a DOM string into a React object. You can find the [implementation](https://gist.github.com/lygaret/a68220defa69174bdec5) on GitHub.

Below is a hypothetical example running Java code from JavaScript via a `java` function:

```javascript
java`
class HelloWorldApp {
  public static void main(String[] args) {
    System.out.println("Hello World!"); // Display the string.
  }
}
`
HelloWorldApp.main();
```

The first parameter (the template string array) of a tag function also has a `raw` property.

```javascript
console.log`123`
// ["123", raw: Array[1]]
```

Here `console.log` receives an array. That array has a `raw` property that holds the escaped original strings.

Consider this example:

```javascript
tag`First line\nSecond line`

function tag(strings) {
  console.log(strings.raw[0]);
  // strings.raw[0] is "First line\\nSecond line"
  // prints "First line\nSecond line"
}
```

The `strings` argument has a `raw` property, also an array. Its members match `strings`, but backslashes are escaped. For example, if `strings` is `["First line\nSecond line"]`, `strings.raw` is `["First line\\nSecond line"]`. The only difference is escaping: in `raw`, `\n` is treated as `\` and `n`, not a newline. This lets you get the raw template content.

## Limitations of Template Strings

Tagged templates can embed other languages, but template strings escape certain sequences by default, which can make embedding difficult.

For example, LaTeX can be embedded in a tagged template:

```javascript
function latex(strings) {
  // ...
}

let document = latex`
\newcommand{\fun}{\textbf{Fun!}}  // works
\newcommand{\unicode}{\textbf{Unicode!}} // error
\newcommand{\xerxes}{\textbf{King!}} // error

Breve over the h goes \u{h}ere // error
`
```

The content is valid LaTeX, but the JavaScript engine throws. The cause is string escaping: template strings treat `\u00FF` and `\u{42}` as Unicode escapes, so `\unicode` fails; and `\x56` is treated as a hex escape, so `\xerxes` fails. In LaTeX, `\u` and `\x` have special meaning, but JavaScript escapes them.

To address this, ES2018 [relaxed](https://tc39.github.io/proposal-template-literal-revision/) escape rules for tagged templates. Invalid escapes no longer throw; instead they yield `undefined`, and the raw string can be read from the `raw` property.

```javascript
function tag(strs) {
  strs[0] === undefined
  strs.raw[0] === "\\unicode and \\u{55}";
}
tag`\unicode and \u{55}`
```

Here, the template would normally throw, but with the relaxed rules it does not. The engine sets the first element to `undefined`, while `raw` still provides the original string, so the tag can handle it.

Note: this relaxation only applies when a tag processes the template. For ordinary template strings, invalid escapes still throw.

```javascript
let bad = `bad escape sequence: \unicode`; // throws
```
