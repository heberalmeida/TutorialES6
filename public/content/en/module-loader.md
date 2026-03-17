# Module Loading Implementation

The previous chapter covered module syntax. This chapter describes how to load ES6 modules in the browser and Node.js, and common issues such as circular dependencies.

## Browser Loading

### Traditional Approach

In HTML, the browser loads JavaScript via `<script>` tags.

```html
<!-- Inline script -->
<script type="application/javascript">
  // module code
</script>

<!-- External script -->
<script type="application/javascript" src="path/to/myModule.js">
</script>
```

Because JavaScript is the default script language, `type="application/javascript"` can be omitted.

By default, the browser loads scripts synchronously: when it hits a `<script>` tag, it stops rendering until the script finishes. For external scripts, it must also wait for the download.

Large scripts can make the page feel blocked or unresponsive. Browsers therefore support asynchronous loading with these attributes:

```html
<script src="path/to/myModule.js" defer></script>
<script src="path/to/myModule.js" async></script>
```

With `defer` or `async`, the script loads asynchronously. The engine starts downloading the external script but does not wait; it continues with the rest of the page.

The difference: `defer` waits until the full page is rendered (DOM ready and other scripts run) before executing; `async` executes as soon as the script finishes downloading, possibly interrupting rendering. In short, `defer` means "run after render"; `async` means "run when loaded." With multiple `defer` scripts, they run in document order; multiple `async` scripts have no guaranteed order.

### Loading Rules

To load ES6 modules in the browser, use `<script>` with `type="module"`:

```html
<script type="module" src="./foo.js"></script>
```

This loads the module `foo.js`. With `type="module"`, the browser treats it as an ES6 module.

Scripts with `type="module"` load asynchronously and do not block the page; they run after the page is rendered, similar to `defer`:

```html
<script type="module" src="./foo.js"></script>
<!-- Equivalent to -->
<script type="module" src="./foo.js" defer></script>
```

Multiple `<script type="module">` tags run in document order.

Adding `async` runs the module as soon as it loads, even if rendering is incomplete:

```html
<script type="module" src="./foo.js" async></script>
```

With `async`, modules no longer run in document order; they run as soon as each one loads.

ES6 modules can also be inlined in HTML; behavior matches external module scripts:

```html
<script type="module">
  import utils from "./utils.js";

  // other code
</script>
```

For example, jQuery supports module loading:

```html
<script type="module">
  import $ from "./jquery/src/jquery.js";
  $('#message').text('Hi from jQuery!');
</script>
```

For external module scripts (e.g. `foo.js`):

- Code runs in module scope, not global scope. Top-level variables are not visible outside.
- Module scripts run in strict mode regardless of `use strict`.
- Modules can use `import` to load other modules (the `.js` extension is required; use absolute or relative URLs) and `export` for their interface.
- Top-level `this` is `undefined`, not `window`. Using `this` at the top level in a module is meaningless.
- A module is only executed once, even if imported multiple times.

Example:

```javascript
import utils from 'https://example.com/js/utils.js';

const x = 1;

console.log(x === window.x); //false
console.log(this === undefined); // true
```

You can detect whether code runs in an ES6 module using top-level `this`:

```javascript
const isNotModuleScript = this !== undefined;
```

## Differences Between ES6 and CommonJS Modules

Before discussing Node.js loading of ES6 modules, it is important to understand that ES6 and CommonJS modules behave differently.

Key differences:

- CommonJS outputs a copy of values; ES6 outputs live bindings (references).
- CommonJS loads at runtime; ES6 exports are resolved at compile time.
- CommonJS `require()` loads synchronously; ES6 `import` is asynchronous and has a separate dependency resolution phase.

The second difference arises because CommonJS loads an object (`module.exports`) that is only created when the script finishes. ES6 modules do not use objects; their interface is static and resolved during static analysis.

Here we focus on the first difference.

CommonJS outputs a copy: once a value is exported, internal changes do not affect it. Example from `lib.js`:

```javascript
// lib.js
var counter = 3;
function incCounter() {
  counter++;
}
module.exports = {
  counter: counter,
  incCounter: incCounter,
};
```

Then in `main.js`:

```javascript
// main.js
var mod = require('./lib');

console.log(mod.counter);  // 3
mod.incCounter();
console.log(mod.counter); // 3
```

After loading `lib.js`, its internal updates do not affect `mod.counter` because `mod.counter` is a cached primitive. To get the updated value, you must export a function:

```javascript
// lib.js
var counter = 3;
function incCounter() {
  counter++;
}
module.exports = {
  get counter() {
    return counter
  },
  incCounter: incCounter,
};
```

Now `counter` is exported via a getter. Running `main.js`:

```bash
$ node main.js
3
4
```

ES6 modules behave differently. When the engine statically analyzes the script and sees an `import`, it creates a read-only binding. At runtime it resolves that binding to the value in the imported module. In other words, ES6 `import` is like a symbolic link: when the original value changes, the imported value changes too. ES6 modules are dynamically referenced; values are not cached and bindings stay attached to their module.

Using the same example with ES6:

```javascript
// lib.js
export let counter = 3;
export function incCounter() {
  counter++;
}

// main.js
import { counter, incCounter } from './lib';
console.log(counter); // 3
incCounter();
console.log(counter); // 4
```

`counter` in `main.js` is a live binding to `lib.js` and reflects its changes.

Another example from the `export` section:

```javascript
// m1.js
export var foo = 'bar';
setTimeout(() => foo = 'baz', 500);

// m2.js
import {foo} from './m1.js';
console.log(foo);
setTimeout(() => console.log(foo), 500);
```

`foo` in `m1.js` is `bar` initially, then `baz` after 500ms. Checking in `m2.js`:

```bash
$ babel-node m2.js

bar
baz
```

ES6 modules do not cache values; they resolve bindings dynamically, and variables stay bound to their module.

Because ES6 imports are "symbolic links," they are read-only; reassignment throws:

```javascript
// lib.js
export let obj = {};

// main.js
import { obj } from './lib';

obj.prop = 123; // OK
obj = {}; // TypeError
```

You can mutate `obj`'s properties, but not reassign `obj` itself. The binding is read-only, as if `obj` were a `const`.

Finally, `export` outputs the same value through the interface. Any script that imports it gets the same instance:

```javascript
// mod.js
function C() {
  this.sum = 0;
  this.add = function () {
    this.sum += 1;
  };
  this.show = function () {
    console.log(this.sum);
  };
}

export let c = new C();
```

The module above exports an instance of `C`. Different scripts that import it all share that instance:

```javascript
// x.js
import {c} from './mod';
c.add();

// y.js
import {c} from './mod';
c.show();

// main.js
import './x';
import './y';
```

Running `main.js` outputs `1`:

```bash
$ babel-node main.js
1
```

So `x.js` and `y.js` both operate on the same instance.

## Loading ES6 Modules in Node.js

### Overview

JavaScript has two module systems: ES6 modules (ESM) and CommonJS (CJS).

CommonJS is Node.js-specific and not compatible with ES6 modules. Syntactically, CommonJS uses `require()` and `module.exports`; ES6 uses `import` and `export`.

They use different loading mechanisms. Since Node.js v13.2, ES6 modules are supported by default.

Node.js expects ES6 modules to use the `.mjs` extension. Scripts that use `import` or `export` must use `.mjs`. Node treats `.mjs` files as ES6 modules and runs them in strict mode without needing `"use strict"` at the top.

Alternatively, set `type` to `"module"` in `package.json`:

```javascript
{
   "type": "module"
}
```

With that, all `.js` scripts in the project are treated as ES6 modules.

```bash
# Interpret as ES6 module
$ node my-app.js
```

If you still use CommonJS, those scripts must use the `.cjs` extension. Without `type`, or with `type` equal to `"commonjs"`, `.js` files are loaded as CommonJS.

Summary: `.mjs` is always ESM, `.cjs` is always CJS, and `.js` depends on the `type` field in `package.json`.

Avoid mixing ES6 and CommonJS. `require()` cannot load `.mjs` files and will throw. Only `import` can load them. Conversely, `.mjs` files cannot use `require`; they must use `import`.

### package.json main Field

`package.json` can specify the entry file with `main` or `exports`. For simpler packages, `main` is enough:

```javascript
// ./node_modules/es-module-package/package.json
{
  "type": "module",
  "main": "./src/index.js"
}
```

This sets the entry to `./src/index.js` as an ES6 module. Without `type`, `index.js` would be loaded as CommonJS.

Then you can import the package:

```javascript
// ./my-app.mjs

import { something } from 'es-module-package';
// Actually loads ./node_modules/es-module-package/src/index.js
```

Node resolves `es-module-package` and uses its `main` field to load the entry file.

Loading with `require()` will fail because CommonJS cannot handle `export`.

### package.json exports Field

The `exports` field overrides `main`. It has several uses:

(1) Subpath aliases

`exports` can map subpaths to files:

```javascript
// ./node_modules/es-module-package/package.json
{
  "exports": {
    "./submodule": "./src/submodule.js"
  }
}
```

This maps `submodule` to `src/submodule.js`:

```javascript
import submodule from 'es-module-package/submodule';
// Loads ./node_modules/es-module-package/src/submodule.js
```

Directory alias example:

```javascript
// ./node_modules/es-module-package/package.json
{
  "exports": {
    "./features/": "./src/features/"
  }
}

import feature from 'es-module-package/features/x.js';
// Loads ./node_modules/es-module-package/src/features/x.js
```

Without an export entry, you cannot load via package name + script path:

```javascript
// Error
import submodule from 'es-module-package/private-module.js';

// OK
import submodule from './node_modules/es-module-package/private-module.js';
```

(2) Main entry alias

If the key is `.`, it is the main entry and takes precedence over `main`. The value can be a string:

```javascript
{
  "exports": {
    ".": "./main.js"
  }
}

// Same as
{
  "exports": "./main.js"
}
```

Because only ES6-aware Node recognizes `exports`, you can keep `main` for older versions:

```javascript
{
  "main": "./main-legacy.cjs",
  "exports": {
    ".": "./main-modern.cjs"
  }
}
```

Here, older Node uses `main-legacy.cjs`; newer Node uses `main-modern.cjs`.

(3) Conditional exports

Using `.` as the key, you can specify different entries for `require` vs default (import):

```javascript
{
  "type": "module",
  "exports": {
    ".": {
      "require": "./main.cjs",
      "default": "./main.js"
    }
  }
}
```

`require` is the CommonJS entry; `default` is the ES6 entry.

Shorter form:

```javascript
{
  "exports": {
    "require": "./main.cjs",
    "default": "./main.js"
  }
}
```

If you have other subpath exports, you cannot use this shorthand:

```javascript
{
  // Error
  "exports": {
    "./feature": "./lib/feature.js",
    "require": "./main.cjs",
    "default": "./main.js"
  }
}
```

### CommonJS Loading ES6 Modules

CommonJS `require()` cannot load ES6 modules. Use `import()` instead:

```javascript
(async () => {
  await import('./my-app.mjs');
})();
```

This works from a CommonJS module.

`require()` is synchronous; ES6 modules can use top-level `await`, so they cannot be loaded synchronously.

### ES6 Modules Loading CommonJS

ES6 `import` can load CommonJS modules, but only as a whole; you cannot import individual exports:

```javascript
// Correct
import packageMain from 'commonjs-package';

// Error
import { method } from 'commonjs-package';
```

ES6 modules require static analysis; CommonJS exposes `module.exports`, an object whose shape is not known statically, so only whole-module import works.

To use a specific export:

```javascript
import packageMain from 'commonjs-package';
const { method } = packageMain;
```

Another option is Node's `module.createRequire()`:

```javascript
// cjs.cjs
module.exports = 'cjs';

// esm.mjs
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const cjs = require('./cjs.cjs');
cjs === 'cjs'; // true
```

This lets an ES6 module load CommonJS, but it mixes both systems and is not recommended.

### Supporting Both Formats

A package can support both CommonJS and ES6.

If the package is ES6, export a default (e.g. `export default obj`) so CommonJS can load it with `import()`.

If the package is CommonJS, add an ES6 wrapper:

```javascript
import cjsModule from '../index.js';
export const foo = cjsModule.foo;
```

This imports the CommonJS module and re-exports named values. Use an `.mjs` extension or a subdirectory with its own `package.json` that has `{ "type": "module" }`.

Alternatively, use `exports` in `package.json` to point to different entry files:

```javascript
"exports": {
  "require": "./index.js",
  "import": "./esm/wrapper.js"
}
```

Here `require()` and `import` resolve to different files.

### Node.js Built-in Modules

Built-in modules can be imported as a whole or by name:

```javascript
// Load all
import EventEmitter from 'events';
const e = new EventEmitter();

// Load specific named exports
import { readFile } from 'fs';
readFile('./foo.txt', (err, source) => {
  if (err) {
    console.error(err);
  } else {
    console.log(source);
  }
});
```

### Load Paths

ES6 module paths must be fully specified; the file extension cannot be omitted. `import` and the `main` field in `package.json` must include the extension, otherwise Node throws.

```javascript
// Error in ES6 module
import { something } from './index';
```

For consistency with browsers, Node's `.mjs` files support URL-style paths:

```javascript
import './foo.mjs?query=1'; // Load ./foo with parameter ?query=1
```

The path can include query parameters. Different parameters create different module instances. Paths containing `:`, `%`, `#`, `?` should be escaped.

Node's `import` supports only local modules (`file:`) and `data:`; remote modules are not supported. Paths must be relative; absolute paths starting with `/` or `//` are not supported.

### Internal Variables

ES6 modules are meant to be portable between browser and Node. To achieve this, Node disallows some CommonJS-specific variables in ES6 modules.

First, `this`: in ES6 modules, top-level `this` is `undefined`; in CommonJS it is the module object.

Second, these top-level variables do not exist in ES6 modules:

- `arguments`
- `require`
- `module`
- `exports`
- `__filename`
- `__dirname`

## Circular Loading

"Circular loading" means module `a` depends on `b`, and `b` depends on `a`:

```javascript
// a.js
var b = require('b');

// b.js
var a = require('a');
```

Circular dependencies usually indicate tight coupling. If not handled well, they can cause infinite recursion or failures. Ideally they should be avoided.

In practice they are hard to avoid in large projects: `a` depends on `b`, `b` on `c`, and `c` on `a`. The loader must handle cycles.

CommonJS and ES6 handle circular loading differently and produce different results.

### How CommonJS Loads Modules

Understanding CommonJS loading helps explain cycle handling.

A CommonJS module is a script file. The first time `require` loads it, the entire script runs and Node builds an object in memory:

```javascript
{
  id: '...',
  exports: { ... },
  loaded: true,
  ...
}
```

`id` is the module name, `exports` is the exported interface, `loaded` indicates whether the script has finished. Other fields exist but are omitted here.

Later `require` calls return the cached `exports`. The script runs only once unless the cache is cleared.

### Circular Loading in CommonJS

CommonJS runs a module when it is `require`d. Under circular loading, it only returns what has already been exported; not-yet-executed parts are missing.

Node's [documentation](https://nodejs.org/api/modules.html#modules_cycles) uses this example. `a.js`:

```javascript
exports.done = false;
var b = require('./b.js');
console.log('In a.js, b.done = %j', b.done);
exports.done = true;
console.log('a.js finished');
```

`a.js` first exports `done`, then loads `b.js` and stops until `b.js` finishes.

`b.js`:

```javascript
exports.done = false;
var a = require('./a.js');
console.log('In b.js, a.done = %j', a.done);
exports.done = true;
console.log('b.js finished');
```

When `b.js` runs and loads `a.js`, we have a cycle. Node returns the cached `exports` for `a.js`. At that moment `a.js` has only run:

```javascript
exports.done = false;
```

So `b.js` sees `a.done === false`.

Then `b.js` continues, finishes, and returns control to `a.js`. We can verify with `main.js`:

```javascript
var a = require('./a.js');
var b = require('./b.js');
console.log('In main.js, a.done=%j, b.done=%j', a.done, b.done);
```

Output:

```bash
$ node main.js

In b.js, a.done = false
b.js finished
In a.js, b.done = true
a.js finished
In main.js, a.done=true, b.done=true
```

So when `b.js` loads `a.js`, `a.js` has only partially run. And when `main.js` requires `b.js` again, it gets the cached result (including `exports.done = true`).

CommonJS imports cached copies of values, not live references.

Because cycles return partially executed values, you must be careful when destructuring:

```javascript
var a = require('a'); // Safe approach
var foo = require('a').foo; // Risky approach

exports.good = function (arg) {
  return a.foo('good', arg); // Uses latest value of a.foo
};

exports.bad = function (arg) {
  return foo('bad', arg); // Uses partially loaded value
};
```

If there is a cycle, `require('a').foo` might be overwritten later. Using `require('a')` and then `a.foo` is safer.

### Circular Loading in ES6 Modules

ES6 handles circular loading differently. Imports are live bindings; they are not cached. You must ensure values are available when used.

Example:

```javascript
// a.mjs
import {bar} from './b';
console.log('a.mjs');
console.log(bar);
export let foo = 'foo';

// b.mjs
import {foo} from './a';
console.log('b.mjs');
console.log(foo);
export let bar = 'bar';
```

`a.mjs` loads `b.mjs`, and `b.mjs` loads `a.mjs`. Running `a.mjs`:

```bash
$ node --experimental-modules a.mjs
b.mjs
ReferenceError: foo is not defined
```

`foo` is not yet defined when `b.mjs` runs. Why?

The engine runs `a.mjs`, sees that it imports `b.mjs`, and runs `b.mjs` first. When `b.mjs` runs, it imports `foo` from `a.mjs`. The engine does not re-run `a.mjs`; it assumes the binding exists. When `b.mjs` reaches `console.log(foo)`, `foo` has not been exported yet, so it throws.

To fix this, ensure `foo` is defined before `b.mjs` uses it. One way is to use a function (functions are hoisted):

```javascript
// a.mjs
import {bar} from './b';
console.log('a.mjs');
console.log(bar());
function foo() { return 'foo' }
export {foo};

// b.mjs
import {foo} from './a';
console.log('b.mjs');
console.log(foo());
function bar() { return 'bar' }
export {bar};
```

Running `a.mjs`:

```bash
$ node --experimental-modules a.mjs
b.mjs
foo
a.mjs
bar
```

When `import {bar} from './b'` runs, `foo` is already defined (hoisted), so `b.mjs` does not throw. Using a function expression instead would throw, because expressions are not hoisted:

```javascript
// a.mjs
import {bar} from './b';
console.log('a.mjs');
console.log(bar());
const foo = () => 'foo';
export {foo};
```

Another example from [SystemJS](https://github.com/ModuleLoader/es6-module-loader/blob/master/docs/circular-references-bindings.md):

```javascript
// even.js
import { odd } from './odd'
export var counter = 0;
export function even(n) {
  counter++;
  return n === 0 || odd(n - 1);
}

// odd.js
import { even } from './even';
export function odd(n) {
  return n !== 0 && even(n - 1);
}
```

`even` and `odd` call each other. Running:

```javascript
$ babel-node
> import * as m from './even.js';
> m.even(10);
true
> m.counter
6
> m.even(20)
true
> m.counter
17
```

For `even(10)`, `even` runs 6 times before `n` reaches 0, so `counter` is 6. For `even(20)`, it runs 11 more times, so `counter` becomes 17.

In CommonJS, the equivalent code would fail:

```javascript
// even.js
var odd = require('./odd');
var counter = 0;
exports.counter = counter;
exports.even = function (n) {
  counter++;
  return n == 0 || odd(n - 1);
}

// odd.js
var even = require('./even').even;
module.exports = function (n) {
  return n != 0 && even(n - 1);
}
```

The cycle causes `even` to be undefined when `odd` runs, so `even(n - 1)` throws:

```bash
$ node
> var m = require('./even');
> m.even(10)
TypeError: even is not a function
```
