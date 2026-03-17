# Introduction to ECMAScript 6

ECMAScript 6.0 (hereinafter referred to as ES6) is the next-generation standard for the JavaScript language, officially released in June 2015. Its goal is to make JavaScript suitable for writing complex, large-scale applications and to establish it as an enterprise-level development language.

## The Relationship Between ECMAScript and JavaScript

A common question is: what exactly is the relationship between ECMAScript and JavaScript?

To answer this clearly, we need to look at history. In November 1996, Netscape, the creator of JavaScript, decided to submit JavaScript to the ECMA standards organization, hoping the language would become an international standard. The following year, ECMA published the first edition of standard document 262 (ECMA-262), which defined the standard for browser scripting languages and called this language ECMAScript—this version was 1.0.

From the beginning, the standard was written for the JavaScript language, but there are two reasons it was not called JavaScript. First, trademark: Java is a trademark of Sun Microsystems, and under the licensing agreement, only Netscape could legally use the name JavaScript, which Netscape had also registered as a trademark. Second, the name was meant to show that the language was defined by ECMA, not Netscape, which helps ensure its openness and neutrality.

Therefore, the relationship between ECMAScript and JavaScript is: the former is the specification, the latter is an implementation of the former (other ECMAScript dialects include JScript and ActionScript). In everyday use, the two terms are interchangeable.

## The Relationship Between ES6 and ECMAScript 2015

The term ECMAScript 2015 (ES2015 for short) is also commonly used. What is its relationship to ES6?

After ECMAScript 5.1 was released in 2011, work began on version 6.0. So originally, ES6 simply meant the next version of the JavaScript language.

However, because this version introduced too many new syntax features and many organizations and individuals kept proposing more during the drafting process, it quickly became clear that one version could not include everything planned. The usual approach would be to release 6.0 first, then 6.1, 6.2, 6.3, and so on.

The standards committee did not want to do that. They wanted standardization to follow a regular process: anyone could submit proposals for new syntax to the committee at any time, and the committee would meet monthly to evaluate whether proposals could be accepted and what improvements were needed. After enough meetings, mature proposals could officially enter the standard. In other words, the standard would be updated on a rolling basis, with changes every month.

The committee eventually decided to publish the standard formally once a year in June as that year’s official release. Work would continue on that version until the next June, when the draft would become the next year’s release. This made the old version numbers unnecessary—years could be used as markers instead.

The first ES6 release was thus published in June 2015 as the *ECMAScript 2015 Standard* (ES2015). In June 2016, a minor revision, the *ECMAScript 2016 Standard* (ES2016), was released as planned; it can be seen as ES6.1 because the differences are very small (only the array instance’s `includes` method and the exponentiation operator were added). ES2017 was planned for June 2017.

So ES6 is both a historical term and a general one, meaning the next generation of JavaScript after 5.1, covering ES2015, ES2016, ES2017, and so on. ES2015 is the official name for the language standard released that year. In this book, ES6 usually refers to the ES2015 standard but sometimes to “next-generation JavaScript” in general.

## Syntax Proposal Approval Process

Anyone can propose changes to the language standard to the standards committee (also known as the TC39 committee).

A new syntax goes through five stages before becoming part of the formal standard. Each stage change must be approved by the TC39 committee.

- Stage 0 - Strawman (presentation stage)
- Stage 1 - Proposal (solicitation stage)
- Stage 2 - Draft (draft stage)
- Stage 3 - Candidate (candidate stage)
- Stage 4 - Finished (finished stage)

Once a proposal reaches Stage 2, it is likely to be included in a future standard. Current ECMAScript proposals can be found at [GitHub.com/tc39/ecma262](https://github.com/tc39/ecma262).

One goal of this book is to follow the latest developments in ECMAScript and introduce all new syntax after version 5.1. New syntax that is clearly or very likely to be standardized will be covered.

## History of ECMAScript

ES6 took 15 years from the start of the process to its final release.

ECMAScript 1.0 was released in 1997. The next two years saw ECMAScript 2.0 (June 1998) and ECMAScript 3.0 (December 1999). Version 3.0 was a major success, widely adopted and becoming the common standard. It established the basic syntax of JavaScript, which later versions would fully inherit. To this day, beginners learning JavaScript are essentially learning 3.0 syntax.

In 2000, ECMAScript 4.0 began to take shape. This version was never finalized, but much of its content was inherited by ES6. So the starting point for ES6 is really 2000.

Why did ES4 not pass? Because it was too radical, making wholesale upgrades to ES3 that some committee members were unwilling to accept. ECMA’s Technical Committee 39 (TC39) is responsible for the ECMAScript standard; its members include Microsoft, Mozilla, Google, and other major companies.

In October 2007, the ECMAScript 4.0 draft was released, with a formal release expected in August 2008. But there were serious disagreements about whether to adopt it. Major companies led by Yahoo, Microsoft, and Google opposed major upgrades to JavaScript and favored minor changes. Mozilla, led by JavaScript creator Brendan Eich, insisted on the current draft.

In July 2008, disagreements over what the next version should include were so fierce that ECMA decided to halt development of ECMAScript 4.0. The smaller set of improvements to existing features was released as ECMAScript 3.1, and the more radical ideas were moved to future versions. Given the mood of the meeting, the project code name became Harmony. ECMAScript 3.1 was soon renamed ECMAScript 5.

In December 2009, ECMAScript 5.0 was formally released. The Harmony project split in two: more feasible ideas continued as JavaScript.next, later ECMAScript 6; less mature ideas became JavaScript.next.next for the distant future. TC39’s view was that ES5 would remain largely compatible with ES3, with major syntax changes and new features coming in JavaScript.next. At the time, JavaScript.next meant ES6; after ES6, it meant ES7. TC39 expected ES5 to become the mainstream JavaScript standard by mid-2013 and remain so for five years.

In June 2011, ECMAScript 5.1 was released and became an ISO international standard (ISO/IEC 16262:2011).

In March 2013, the ECMAScript 6 draft was frozen, with no new features added. New ideas would go into ECMAScript 7.

In December 2013, the ECMAScript 6 draft was released, followed by 12 months of discussion and feedback.

In June 2015, ECMAScript 6 was formally adopted as an international standard. That was 15 years after 2000.

Current ES6 support across major browsers can be found at [https://compat-table.github.io/compat-table/es6/](https://compat-table.github.io/compat-table/es6/).

Node.js is a JavaScript runtime for the server. Its ES6 support is generally higher. Beyond features enabled by default, some syntax features are implemented but disabled by default. You can check Node’s experimental syntax with:

```bash
// Linux & Mac
$ node --v8-options | grep harmony

// Windows
$ node --v8-options | findstr harmony
```

## Babel Transpiler

[Babel](https://babeljs.io/) is a widely used ES6 transpiler that converts ES6 code to ES5 so it can run in older browsers. This lets you write in ES6 while ensuring compatibility with existing environments. Example:

```javascript
// before transpile
input.map(item => item + 1);

// after transpile
input.map(function (item) {
  return item + 1;
});
```

The original code uses arrow functions; Babel converts them to regular functions so they run in JavaScript environments that don’t support arrow functions.

Install Babel in your project:

```bash
$ npm install --save-dev @babel/core
```

### Configuration File `.babelrc`

Babel’s config file is `.babelrc`, placed at the project root. The first step to using Babel is configuring this file.

Use it to set transpilation rules and plugins. Basic format:

```javascript
{
  "presets": [],
  "plugins": []
}
```

The `presets` field sets transpilation rules. You can install these official presets as needed:

```bash
# Latest transpilation rules
$ npm install --save-dev @babel/preset-env

# react transpile rules
$ npm install --save-dev @babel/preset-react
```

Then add these presets to `.babelrc`:

```javascript
  {
    "presets": [
      "@babel/env",
      "@babel/preset-react"
    ],
    "plugins": []
  }
```

Note: all Babel tools and plugins require a configured `.babelrc` before use.

### Command-Line Transpilation

Babel provides the `@babel/cli` command-line tool for transpilation.

Install with:

```bash
$ npm install --save-dev @babel/cli
```

Basic usage:

```bash
# Output to stdout
$ npx babel example.js

# Write output to a file
# --out-file or -o specifies output file
$ npx babel example.js --out-file compiled.js
# or
$ npx babel example.js -o compiled.js

# Transpile entire directory
# --out-dir or -d specifies output directory
$ npx babel src --out-dir lib
# or
$ npx babel src -d lib

# -s generates source map files
$ npx babel src -d lib -s
```

### babel-node

The `babel-node` command from `@babel/node` provides a REPL that supports ES6. It supports all Node REPL features and can run ES6 code directly.

Install the module:

```bash
$ npm install --save-dev @babel/node
```

Then run `babel-node` to enter the REPL:

```bash
$ npx babel-node
> (x => x * 2)(1)
2
```

You can run ES6 scripts directly with `babel-node`. Put the code above in a file `es6.js` and run:

```bash
# es6.js code
# console.log((x => x * 2)(1));
$ npx babel-node es6.js
2
```

### @babel/register Module

The `@babel/register` module wraps `require` with a hook. After loading it, any `require` of `.js`, `.jsx`, `.es`, or `.es6` files is transpiled by Babel first.

```bash
$ npm install --save-dev @babel/register
```

Load `@babel/register` first when using it:

```bash
// index.js
require('@babel/register');
require('./es6.js');
```

You no longer need to manually transpile `index.js`:

```bash
$ node index.js
2
```

Note: `@babel/register` only transpiles files loaded via `require`, not the current file. Because it transpiles on demand, it is suitable for development only.

### polyfill

Babel only transforms new JavaScript syntax by default, not new APIs. Global objects like `Iterator`, `Generator`, `Set`, `Map`, `Proxy`, `Reflect`, `Symbol`, `Promise`, and methods on global objects (e.g. `Object.assign`) are not transpiled.

For example, ES6 added `Array.from` to `Array`. Babel does not transpile this method. To use it, add a polyfill with `core-js` and `regenerator-runtime` (for generator function transpilation).

Install:

```bash
$ npm install --save-dev core-js regenerator-runtime
```

Add these lines at the top of your script:

```javascript
import 'core-js';
import 'regenerator-runtime/runtime';
// or
require('core-js');
require('regenerator-runtime/runtime');
```

Babel leaves many APIs untranspiled by default. See the `babel-plugin-transform-runtime` [definitions.js](https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-runtime/src/runtime-corejs3-definitions.js) for the full list.

### Browser Environment

Babel can run in the browser using the standalone build from [@babel/standalone](https://babeljs.io/docs/en/next/babel-standalone.html). Add it to your page:

```html
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel">
// Your ES6 code
</script>
```

Real-time transpilation in the browser affects performance. Use pre-transpiled scripts in production.

Babel provides an [online REPL](https://babeljs.io/repl/) to convert ES6 to ES5. The output can be used directly as ES5 in your page.
