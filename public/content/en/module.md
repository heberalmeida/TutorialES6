# Module Syntax

## Overview

Historically, JavaScript had no module system. There was no way to split a large program into smaller, interdependent files and then assemble them in a simple way. Other languages provided this (e.g. Ruby's `require`, Python's `import`, and even CSS's `@import`), but JavaScript had no support, which made it difficult to build large, complex projects.

Before ES6, the community developed several module loading schemes. The main ones were CommonJS and AMD—the former for the server, the latter for the browser. ES6 brought modules into the language standard. The design is simple and can largely replace CommonJS and AMD as a common module solution for both browser and server.

ES6 modules are designed to be as static as possible: dependencies and imported/exported variables are determined at compile time. CommonJS and AMD modules can only resolve these at runtime. For example, a CommonJS module is an object; imports must read object properties.

```javascript
// CommonJS module
let { stat, exists, readfile } = require('fs');

// Same as
let _fs = require('fs');
let stat = _fs.stat;
let exists = _fs.exists;
let readfile = _fs.readfile;
```

The code above loads the entire `fs` module (all of its methods), creates an object (`_fs`), and then reads three methods from it. This is "runtime loading": the object is only available at runtime, so static optimization is not possible.

ES6 modules are not objects. Output is explicitly specified with `export`, and input is specified with `import`.

```javascript
// ES6 module
import { stat, exists, readFile } from 'fs';
```

The code above loads three methods from the `fs` module; other methods are not loaded. This is "compile-time loading" or static loading: the module can be fully resolved at compile time, so it is more efficient than CommonJS. It also means ES6 modules cannot be referenced as objects, since they are not objects.

Because ES6 modules are loaded at compile time, static analysis is possible. This enables features like macros and type checking that rely on static analysis.

Besides the benefits of static loading, ES6 modules offer:

- No need for the UMD module format; servers and browsers will support ES6 modules. Tools already support this.
- Browser APIs can be provided as modules instead of globals or `navigator` properties.
- Namespace objects (e.g. `Math`) may eventually be provided as modules instead.

This chapter covers ES6 module syntax. The next chapter covers how to load ES6 modules in the browser and Node.

## Strict Mode

ES6 modules automatically run in strict mode, whether or not `"use strict"` is specified at the top.

Strict mode imposes these restrictions, among others:

- Variables must be declared before use
- Function parameters cannot have duplicate names
- `with` is not allowed
- Assignment to read-only properties throws
- Octal literals with leading 0 are not allowed
- Deletion of non-configurable properties throws
- `delete prop` on variables throws; only `delete global[prop]` is allowed
- `eval` does not introduce variables in outer scope
- `eval` and `arguments` cannot be reassigned
- `arguments` does not reflect changes to function parameters
- `arguments.callee` is not allowed
- `arguments.caller` is not allowed
- `this` is not the global object
- `fn.caller` and `fn.arguments` cannot be used
- Additional reserved words (e.g. `protected`, `static`, `interface`)

Modules must follow these rules. Strict mode is part of ES5; for full details, see ES5 documentation.

In particular, note that in ES6 modules, top-level `this` is `undefined`, so top-level code should not rely on `this`.

## The export Command

Module functionality is mainly provided by two commands: `export` and `import`. `export` defines the module's public interface; `import` loads exports from other modules.

A module is a separate file. Variables inside it are not visible outside. To expose a variable, use the `export` keyword. Example:

```javascript
// profile.js
export var firstName = 'Michael';
export var lastName = 'Jackson';
export var year = 1958;
```

The code above is in `profile.js`, which stores user information. ES6 treats it as a module and exports three variables with `export`.

Besides the form above, there is another:

```javascript
// profile.js
var firstName = 'Michael';
var lastName = 'Jackson';
var year = 1958;

export { firstName, lastName, year };
```

Here, the `export` command uses curly braces to list the variables to export. It is equivalent to the previous form, but this style is often preferred because it shows all exports in one place at the end of the file.

`export` can export functions or classes as well as variables:

```javascript
export function multiply(x, y) {
  return x * y;
};
```

The code above exports a function `multiply`.

By default, `export` uses the original names. You can rename with `as`:

```javascript
function v1() { ... }
function v2() { ... }

export {
  v1 as streamV1,
  v2 as streamV2,
  v2 as streamLatestVersion
};
```

The code above renames the exported functions. `v2` can be exported under two different names.

Important: `export` defines the public interface. It must create a one-to-one mapping with variables inside the module.

```javascript
// Error
export 1;

// Error
var m = 1;
export m;
```

Both forms above are wrong because they do not provide a proper interface. The first exports the literal `1`; the second exports the value of `m`, still just `1`. A value alone is not an interface. Correct forms:

```javascript
// Style 1
export var m = 1;

// Style 2
var m = 1;
export {m};

// Style 3
var n = 1;
export {n as m};
```

These define a proper interface `m`. Other scripts can import it to get the value `1`. The mapping between the interface name and the internal variable must be explicit.

The same applies to `function` and `class` exports:

```javascript
// Error
function f() {}
export f;

// Correct
export function f() {};

// Correct
function f() {}
export {f};
```

Currently, `export` can export three kinds of interfaces: functions, classes, and variables (declared with `var`, `let`, or `const`).

Also, `export` creates a live binding: the imported interface reflects the current value inside the module.

```javascript
export var foo = 'bar';
setTimeout(() => foo = 'baz', 500);
```

The code above exports `foo`; its value is `bar` at first, then `baz` after 500ms.

This differs from CommonJS, which uses cached values and does not support dynamic updates. See the "Module Loading Implementation" section below.

Finally, `export` can appear anywhere at the top level of a module. Inside a block (e.g. `if`), it throws, as does `import`, because block-level exports prevent static optimization.

```javascript
function foo() {
  export default 'bar' // SyntaxError
}
foo()
```

In the code above, `export` inside a function causes an error.

## The import Command

After a module defines its interface with `export`, other JS files can load it with `import`:

```javascript
// main.js
import { firstName, lastName, year } from './profile.js';

function setName(element) {
  element.textContent = firstName + ' ' + lastName;
}
```

The `import` command loads `profile.js` and imports the variables. The curly braces list the names to import; they must match the exported names from `profile.js`.

To rename imported variables, use `as`:

```javascript
import { lastName as surname } from './profile.js';
```

Imported variables are read-only; they are bindings to the module's interface. The importing script must not reassign them.

```javascript
import {a} from './xxx.js'

a = {}; // Syntax Error : 'a' is read-only;
```

In the code above, reassigning `a` throws, because `a` is a read-only binding. However, if `a` is an object, modifying its properties is allowed:

```javascript
import {a} from './xxx.js'

a.foo = 'hello'; // Valid operation
```

Properties of `a` can be modified, and other modules will see the changes. But this makes bugs harder to trace, so imported variables should be treated as read-only and their properties should not be changed casually.

The path after `from` can be relative or absolute. If it is just a module name (no path), the engine must be configured to resolve it:

```javascript
import { myMethod } from 'util';
```

Here `util` is a module name; without a path, configuration is required to locate it.

Note: `import` is hoisted and runs at the top of the module, before other code.

```javascript
foo();

import { foo } from 'my_module';
```

The code above does not throw, because `import` runs before the call to `foo`. Imports are executed at compile time, before the code runs.

Because `import` is static, it cannot use expressions, variables, or other runtime constructs:

```javascript
// Error
import { 'f' + 'oo' } from 'my_module';

// Error
let module = 'my_module';
import { foo } from module;

// Error
if (x === 1) {
  import { foo } from 'module1';
} else {
  import { foo } from 'module2';
}
```

These forms throw because they use expressions, variables, or conditionals that are not available at static analysis time.

Finally, `import` executes the loaded module. So you can write:

```javascript
import 'lodash';
```

This only loads and runs `lodash`; it does not import any bindings.

If the same `import` is executed multiple times, the module runs only once:

```javascript
import 'lodash';
import 'lodash';
```

The code above loads `lodash` twice but runs it only once.

```javascript
import { foo } from 'my_module';
import { bar } from 'my_module';

// Same as
import { foo, bar } from 'my_module';
```

Here `foo` and `bar` are imported from the same module in two statements; it is equivalent to a single combined import. Imports follow a singleton pattern.

Today, Babel can mix CommonJS `require` and ES6 `import` in one module, but it is better not to. `import` runs in the static phase, so it executes first. The following may not behave as expected:

```javascript
require('core-js/modules/es6.symbol');
require('core-js/modules/es6.promise');
import React from 'React';
```

## Whole-Module Import

Instead of importing specific exports, you can load all exports into a single object using an asterisk (`*`):

File `circle.js`:

```javascript
// circle.js

export function area(radius) {
  return Math.PI * radius * radius;
}

export function circumference(radius) {
  return 2 * Math.PI * radius;
}
```

Loading the module:

```javascript
// main.js

import { area, circumference } from './circle';

console.log('Circle area: ' + area(4));
console.log('Circle circumference: ' + circumference(14));
```

The form above imports specific methods. Whole-module import:

```javascript
import * as circle from './circle';

console.log('Circle area: ' + circle.area(4));
console.log('Circle circumference: ' + circle.circumference(14));
```

Note: the object that holds the whole-module import (e.g. `circle`) must be statically analyzable, so it cannot be mutated at runtime. The following is not allowed:

```javascript
import * as circle from './circle';

// Both lines below are not allowed
circle.foo = 'hello';
circle.area = function () {};
```

## The export default Command

As seen above, with `import` the user must know the exact names of variables or functions. For quicker onboarding, `export default` lets the module specify a default export:

```javascript
// export-default.js
export default function () {
  console.log('foo');
}
```

The file above exports a default function.

Other modules can import it with any name:

```javascript
// import-default.js
import customName from './export-default';
customName(); // 'foo'
```

The `import` command can use any name for the default export; the original function name is not required. When importing a default, do not use curly braces.

`export default` can be used with named functions too:

```javascript
// export-default.js
export default function foo() {
  console.log('foo');
}

// Or write as

function foo() {
  console.log('foo');
}

export default foo;
```

The function name `foo` is not visible outside the module; the import treats it as anonymous.

Comparison of default vs named exports:

```javascript
// Group 1
export default function crc32() { // output
  // ...
}

import crc32 from 'crc32'; // input

// Group 2
export function crc32() { // output
  // ...
};

import {crc32} from 'crc32'; // input
```

With `export default`, the corresponding `import` does not use curly braces; without `export default`, it does.

`export default` sets the module’s default export. A module can have only one default, so `export default` can appear only once. That is why the import does not need curly braces: there is at most one default.

In essence, `export default` exports a binding named `default`, and the system lets you name it arbitrarily. So these forms are valid:

```javascript
// modules.js
function add(x, y) {
  return x * y;
}
export {add as default};
// Same as
// export default add;

// app.js
import { default as foo } from 'modules';
// Same as
// import foo from 'modules';
```

Because `export default` really exports a `default` binding, it cannot be followed by a variable declaration:

```javascript
// Correct
export var a = 1;

// Correct
var a = 1;
export default a;

// Incorrect
export default var a = 1;
```

In `export default a`, the value of `a` is assigned to the `default` binding. The last form is invalid.

Since `export default` assigns the following value to `default`, you can export a literal directly:

```javascript
// Correct
export default 42;

// Error
export 42;
```

The first line exports `default` with value 42. The second throws because it does not define a proper interface.

With `export default`, importing is straightforward. For lodash:

```javascript
import _ from 'lodash';
```

To import both the default and named exports in one statement:

```javascript
import _, { each, forEach } from 'lodash';
```

The matching `export` could look like:

```javascript
export default function (obj) {
  // ···
}

export function each(obj, iterator, context) {
  // ···
}

export { each as forEach };
```

The last line exposes `forEach` as an alias for `each`.

`export default` can export a class:

```javascript
// MyClass.js
export default class { ... }

// main.js
import MyClass from 'MyClass';
let o = new MyClass();
```

## Combined export and import

If a module imports and then re-exports from the same module, `import` and `export` can be combined:

```javascript
export { foo, bar } from 'my_module';

// Can be simply understood as
import { foo, bar } from 'my_module';
export { foo, bar };
```

Here `export` and `import` are merged. Note that `foo` and `bar` are not imported into the current module; they are only re-exported, so the current module cannot use them directly.

Renaming and whole-module re-export work the same way:

```javascript
// Rename interface
export { foo as myFoo } from 'my_module';

// Export all
export * from 'my_module';
```

Default re-export:

```javascript
export { default } from 'foo';
```

Named to default:

```javascript
export { es6 as default } from './someModule';

// Same as
import { es6 } from './someModule';
export default es6;
```

Default to named:

```javascript
export { default as es6 } from './someModule';
```

Before ES2020, there was no combined form for:

```javascript
import * as someIdentifier from "someModule";
```

[ES2020](https://github.com/tc39/proposal-export-ns-from) added:

```javascript
export * as ns from "mod";

// Same as
import * as ns from "mod";
export {ns};
```

## Import Attributes

ES2025 introduced "[import attributes](https://github.com/tc39/proposal-import-attributes)", which allow specifying attributes for `import`, mainly for non-module code such as JSON, WebAssembly, or CSS.

Currently, only JSON import is supported:

```javascript
// Static import
import configData from './config-data.json' with { type: 'json' };

// Dynamic import
const configData = await import(
  './config-data.json', { with: { type: 'json' } }
);
```

The `import` command uses a `with` clause to pass an attribute object. At present, the only supported attribute is `type`, which must be `json`.

Without import attributes, JSON can only be loaded via `fetch`:

```javascript
const response = await fetch('./config.json');
const json = await response.json();
```

Re-exports can also use import attributes:

```javascript
export { default as config } from './config-data.json' with { type: 'json' };
```

## Module Inheritance

Modules can extend other modules.

Example: `circleplus` extends `circle`:

```javascript
// circleplus.js

export * from 'circle';
export var e = 2.71828182846;
export default function(x) {
  return Math.exp(x);
}
```

`export *` re-exports everything from `circle`; it does not include the default export. The file also exports its own variable `e` and a default function.

You can rename when re-exporting:

```javascript
// circleplus.js

export { area as circleArea } from 'circle';
```

This re-exports only `area` from `circle` as `circleArea`.

Loading the module:

```javascript
// main.js

import * as math from 'circleplus';
import exp from 'circleplus';
console.log(exp(math.e));
```

`import exp` loads the default export of `circleplus` as `exp`.

## Cross-Module Constants

As discussed in the `const` section, `const` is block-scoped. To share a constant across modules, use this pattern:

```javascript
// constants.js module
export const A = 1;
export const B = 3;
export const C = 4;

// test1.js module
import * as constants from './constants';
console.log(constants.A); // 1
console.log(constants.B); // 3

// test2.js module
import {A, B} from './constants';
console.log(A); // 1
console.log(B); // 3
```

For many constants, use a `constants` directory and split them into files:

```javascript
// constants/db.js
export const db = {
  url: 'http://my.couchdbserver.local:5984',
  admin_username: 'admin',
  admin_password: 'admin password'
};

// constants/user.js
export const users = ['root', 'admin', 'staff', 'ceo', 'chief', 'moderator'];
```

Then aggregate in `index.js`:

```javascript
// constants/index.js
export {db} from './db';
export {users} from './users';
```

Import from the index:

```javascript
// script.js
import {db, users} from './constants/index';
```

## import()

### Introduction

As mentioned, `import` is statically analyzed and runs before other module code. So the following throws:

```javascript
// Error
if (x === 2) {
  import MyModual from './myModual';
}
```

The engine handles `import` at compile time and does not evaluate the `if`; putting `import` inside it is invalid and causes a syntax error. `import` and `export` must be at module top level, not inside blocks or functions.

This design helps compilers optimize, but it prevents runtime loading. Conditional loading is not possible. For `import` to replace Node's `require`, dynamic loading was needed, but `import` could not do it:

```javascript
const path = './' + fileName;
const myModual = require(path);
```

`require` loads at runtime, so the exact module is only known when the code runs. `import` could not support this.

The [ES2020 proposal](https://github.com/tc39/proposal-dynamic-import) added the `import()` function for dynamic loading:

```javascript
import(specifier)
```

`specifier` is the module path. It accepts the same kinds of paths as `import`, but loading is dynamic.

`import()` returns a Promise. Example:

```javascript
const main = document.querySelector('main');

import(`./section-modules/${someVariable}.js`)
  .then(module => {
    module.loadPageInto(main);
  })
  .catch(err => {
    main.textContent = err.message;
  });
```

`import()` can be used anywhere, including non-module scripts. It runs when execution reaches that line. It does not create a static link to the module, unlike `import`. It is similar to Node's `require()`, but is asynchronous.

Because `import()` returns a Promise, use `.then()` to handle the result. For clarity, `await` is often preferred:

```javascript
async function renderWidget() {
  const container = document.getElementById('widget');
  if (container !== null) {
    // Same as
    // import("./widget").then(widget => {
    //   widget.render(container);
    // });
    const widget = await import('./widget.js');
    widget.render(container);
  }
}

renderWidget();
```

Here `await import()` replaces the `.then()` form.

### Use Cases

Some typical uses of `import()`:

(1) On-demand loading

Load a module only when needed:

```javascript
button.addEventListener('click', event => {
  import('./dialogBox.js')
  .then(dialogBox => {
    dialogBox.open();
  })
  .catch(error => {
    /* Error handling */
  })
});
```

The module loads only when the button is clicked.

(2) Conditional loading

Load different modules based on conditions:

```javascript
if (condition) {
  import('moduleA').then(...);
} else {
  import('moduleB').then(...);
}
```

(3) Dynamic module paths

The module path can be computed at runtime:

```javascript
import(f())
.then(...);
```

The path comes from the return value of `f()`.

### Notes

After `import()` resolves, the module is passed as an object to `.then()`. You can destructure to get named exports:

```javascript
import('./myModule.js')
.then(({export1, export2}) => {
  // ...·
});
```

For default exports:

```javascript
import('./myModule.js')
.then(myModule => {
  console.log(myModule.default);
});
```

Or with named import:

```javascript
import('./myModule.js')
.then(({default: theDefault}) => {
  console.log(theDefault);
});
```

To load multiple modules:

```javascript
Promise.all([
  import('./module1.js'),
  import('./module2.js'),
  import('./module3.js'),
])
.then(([module1, module2, module3]) => {
   ···
});
```

`import()` can be used inside async functions:

```javascript
async function main() {
  const myModule = await import('./myModule.js');
  const {export1, export2} = await import('./myModule.js');
  const [module1, module2, module3] =
    await Promise.all([
      import('./module1.js'),
      import('./module2.js'),
      import('./module3.js'),
    ]);
}
main();
```

## import.meta

Developers sometimes need information about the current module (e.g. its path). [ES2020](https://github.com/tc39/proposal-import-meta) added the `import.meta` meta-property, which provides metadata about the current module.

`import.meta` can only be used inside a module; using it outside throws.

It returns an object with metadata. The exact properties are environment-dependent. Typically it includes at least:

**(1)import.meta.url**

`import.meta.url` is the URL of the current module. For example, if the main file is `https://foo.com/main.js`, `import.meta.url` is that URL. To resolve a relative path like `data.txt`:

```javascript
new URL('data.txt', import.meta.url)
```

In Node.js, `import.meta.url` is always a local path as a `file:` URL, e.g. `file:///home/user/foo.js`.

**(2)import.meta.scriptElement**

`import.meta.scriptElement` is a browser-specific meta property. It returns the `<script>` element that loaded the module, similar to `document.currentScript`.

```javascript
// HTML code is
// <script type="module" src="my-module.js" data-foo="abc"></script>

// my-module.js executes the following code
import.meta.scriptElement.dataset.foo
// "abc"
```

**(3)Other**

Deno supports `import.meta.filename` and `import.meta.dirname`, corresponding to `__filename` and `__dirname` in CommonJS:

- `import.meta.filename`: absolute path of the current module file
- `import.meta.dirname`: absolute path of the directory containing the current module file

Both use the correct path separator for the platform (e.g. `/dev/my_module.ts` on Linux, `C:\dev\my_module.ts` on Windows).

They work for both local and remote modules.
