# Estilo de Programação

Este capítulo discute como aplicar a sintaxe ES6 na prática e combiná-la com JavaScript tradicional para escrever código claro e manutenível.

Várias empresas e organizações publicaram guias de estilo. O conteúdo abaixo é baseado principalmente no [guia de estilo JavaScript da Airbnb](https://github.com/airbnb/javascript).

## Escopo de Bloco

**(1)Prefira let em vez de var**

O ES6 introduziu duas novas palavras-chave para declaração de variáveis: `let` e `const`. O `let` pode substituir completamente o `var`, pois possuem a mesma semântica, e o `let` evita efeitos colaterais problemáticos.

```javascript
'use strict';

if (true) {
  let x = 'hello';
}

for (let i = 0; i < 10; i++) {
  console.log(i);
}
```

Se `var` fosse usado em vez de `let`, duas variáveis globais seriam declaradas, o que geralmente não é intencional. As variáveis devem existir apenas dentro do bloco em que são declaradas; o `var` não impõe isso.

O `var` é afetado pelo hoisting; o `let` não é.

```javascript
'use strict';

if (true) {
  console.log(x); // ReferenceError
  let x = 'hello';
}
```

Com `var` em vez de `let`, o `console.log` não lançaria erro e retornaria `undefined`, porque a declaração seria içada (hoisted). Isso viola o princípio de declarar antes de usar.

Portanto, prefira `let` em vez de `var`.

**(2)Constantes globais e segurança de threads**

Entre `let` e `const`, prefira `const`, especialmente no escopo global. Variáveis globais devem ser constantes, não variáveis.

Há várias razões para favorecer `const`. Primeiro, sinaliza ao leitor que o valor não deve mudar. Segundo, alinha-se com programação funcional, onde expressões computam novos valores em vez de mutar os existentes, e ajuda na concorrência futura. Terceiro, os motores JavaScript otimizam `const` melhor do que `let`; usar `const` pode melhorar o desempenho.

```javascript
// bad
var a = 1, b = 2, c = 3;

// good
const a = 1;
const b = 2;
const c = 3;

// best
const [a, b, c] = [1, 2, 3];
```

O `const` também deixa claro que um valor não deve ser modificado e ajuda a evitar alterações acidentais.

Todas as funções devem ser declaradas como constantes.

No futuro, o JavaScript pode suportar multithreading. Nesse cenário, variáveis `let` devem aparecer apenas em código single-threaded e não devem ser compartilhadas entre threads, para garantir segurança de threads.

## Strings

Use aspas simples ou crases para strings estáticas; evite aspas duplas. Use template literals (crases) para strings dinâmicas.

```javascript
// bad
const a = "foobar";
const b = 'foo' + a + 'bar';

// acceptable
const c = `foobar`;

// good
const a = 'foobar';
const b = `foo${a}bar`;
```

## Atribuição por Desestruturação

Prefira desestruturação ao atribuir a partir de elementos de array:

```javascript
const arr = [1, 2, 3, 4];

// bad
const first = arr[0];
const second = arr[1];

// good
const [first, second] = arr;
```

Se os parâmetros de uma função forem propriedades de objeto, use desestruturação:

```javascript
// bad
function getFullName(user) {
  const firstName = user.firstName;
  const lastName = user.lastName;
}

// good
function getFullName(obj) {
  const { firstName, lastName } = obj;
}

// best
function getFullName({ firstName, lastName }) {
}
```

Se uma função retorna múltiplos valores, prefira desestruturar um objeto em vez de um array. Isso facilita adicionar ou reordenar valores de retorno depois.

```javascript
// bad
function processInput(input) {
  return [left, right, top, bottom];
}

// good
function processInput(input) {
  return { left, right, top, bottom };
}

const { left, right } = processInput(input);
```

## Objetos

Para literais de objeto de uma linha, não adicione vírgula final após a última propriedade. Para objetos de múltiplas linhas, adicione vírgula final após a última propriedade.

```javascript
// bad
const a = { k1: v1, k2: v2, };
const b = {
  k1: v1,
  k2: v2
};

// good
const a = { k1: v1, k2: v2 };
const b = {
  k1: v1,
  k2: v2,
};
```

Mantenha os objetos o mais estáticos possível após definidos; evite adicionar propriedades dinamicamente. Se precisar adicionar propriedades, use `Object.assign`:

```javascript
// bad
const a = {};
a.x = 3;

// if reshape unavoidable
const a = {};
Object.assign(a, { x: 3 });

// good
const a = { x: null };
a.x = 3;
```

Se o nome de uma propriedade for dinâmico, use nomes de propriedade computados ao criar o objeto:

```javascript
// bad
const obj = {
  id: 5,
  name: 'San Francisco',
};
obj[getKey('enabled')] = true;

// good
const obj = {
  id: 5,
  name: 'San Francisco',
  [getKey('enabled')]: true,
};
```

No exemplo acima, o nome da última propriedade é computado. Usar uma propriedade computada ao criar `obj` mantém todas as propriedades definidas em um só lugar.

Prefira sintaxe abreviada de propriedade e método quando possível:

```javascript
var ref = 'some value';

// bad
const atom = {
  ref: ref,

  value: 1,

  addValue: function (value) {
    return atom.value + value;
  },
};

// good
const atom = {
  ref,

  value: 1,

  addValue(value) {
    return atom.value + value;
  },
};
```

## Arrays

Use o operador spread (`...`) para copiar arrays:

```javascript
// bad
const len = items.length;
const itemsCopy = [];
let i;

for (i = 0; i < len; i++) {
  itemsCopy[i] = items[i];
}

// good
const itemsCopy = [...items];
```

Use `Array.from` para converter objetos array-like em arrays:

```javascript
const foo = document.querySelectorAll('.foo');
const nodes = Array.from(foo);
```

## Funções

Funções invocadas imediatamente podem ser escritas como arrow functions:

```javascript
(() => {
  console.log('Welcome to the Internet.');
})();
```

Prefira arrow functions em vez de funções anônimas como argumentos. São mais curtas e preservam o binding de `this`:

```javascript
// bad
[1, 2, 3].map(function (x) {
  return x * x;
});

// good
[1, 2, 3].map((x) => {
  return x * x;
});

// best
[1, 2, 3].map(x => x * x);
```

Use arrow functions em vez de `Function.prototype.bind`; evite `self`, `_this` ou `that` para vincular `this`:

```javascript
// bad
const self = this;
const boundMethod = function(...params) {
  return method.apply(self, params);
}

// acceptable
const boundMethod = method.bind(this);

// best
const boundMethod = (...params) => method.apply(this, params);
```

Use arrow functions para funções simples e de uma linha que não são reutilizadas. Para funções mais longas e complexas, use a sintaxe tradicional de função.

Agrupe todas as opções de configuração em um único objeto, passado como último parâmetro. Evite passar booleanos diretamente como parâmetros; prejudica a legibilidade e dificulta adicionar opções depois:

```javascript
// bad
function divide(a, b, option = false ) {
}

// good
function divide(a, b, { option = false } = {}) {
}
```

Evite `arguments` dentro de funções; use o operador rest (`...`) em vez disso. Rest torna explícito quais parâmetros você deseja e produz um array real em vez de um objeto array-like:

```javascript
// bad
function concatenateAll() {
  const args = Array.prototype.slice.call(arguments);
  return args.join('');
}

// good
function concatenateAll(...args) {
  return args.join('');
}
```

Use valores padrão de parâmetro para parâmetros opcionais:

```javascript
// bad
function handleThings(opts) {
  opts = opts || {};
}

// good
function handleThings(opts = {}) {
  // ...
}
```

## Estrutura Map

Use `Object` apenas ao modelar entidades do mundo real. Para dados genéricos chave-valor, use `Map`, que possui iteração integrada:

```javascript
let map = new Map(arr);

for (let key of map.keys()) {
  console.log(key);
}

for (let value of map.values()) {
  console.log(value);
}

for (let item of map.entries()) {
  console.log(item[0], item[1]);
}
```

## Classe

Prefira `class` em vez de manipulação manual de protótipo. Classes são mais claras e fáceis de entender:

```javascript
// bad
function Queue(contents = []) {
  this._queue = [...contents];
}
Queue.prototype.pop = function() {
  const value = this._queue[0];
  this._queue.splice(0, 1);
  return value;
}

// good
class Queue {
  constructor(contents = []) {
    this._queue = [...contents];
  }
  pop() {
    const value = this._queue[0];
    this._queue.splice(0, 1);
    return value;
  }
}
```

Use `extends` para herança; é mais simples e preserva o comportamento correto de `instanceof`:

```javascript
// bad
const inherits = require('inherits');
function PeekableQueue(contents) {
  Queue.apply(this, contents);
}
inherits(PeekableQueue, Queue);
PeekableQueue.prototype.peek = function() {
  return this._queue[0];
}

// good
class PeekableQueue extends Queue {
  peek() {
    return this._queue[0];
  }
}
```

## Módulos

A sintaxe de módulos ES6 é o padrão. Prefira-a ao CommonJS do Node.js.

Primeiro, use `import` em vez de `require()`:

```javascript
// Estilo CommonJS
const moduleA = require('moduleA');
const func1 = moduleA.func1;
const func2 = moduleA.func2;

// Estilo ES6
import { func1, func2 } from 'moduleA';
```

Segundo, use `export` em vez de `module.exports`:

```javascript
// Estilo CommonJS
var React = require('react');

var Breadcrumbs = React.createClass({
  render() {
    return <nav />;
  }
});

module.exports = Breadcrumbs;

// Estilo ES6
import React from 'react';

class Breadcrumbs extends React.Component {
  render() {
    return <nav />;
  }
};

export default Breadcrumbs;
```

Se um módulo exporta apenas um valor, use `export default`. Se exporta múltiplos valores e são de igual importância, evite misturar `export default` com `export` nomeado.

Se o export padrão for uma função, use um nome em minúsculas para indicar que é uma utilidade:

```javascript
function makeStyleGuide() {
}

export default makeStyleGuide;
```

Se o export padrão for um objeto, use um nome com maiúscula para indicar que é um objeto de configuração:

```javascript
const StyleGuide = {
  es6: {
  }
};

export default StyleGuide;
```

## Usando ESLint

O ESLint verifica sintaxe e estilo. Use-o para manter o código consistente e correto.

Primeiro, instale o ESLint na raiz do projeto:

```bash
$ npm install --save-dev eslint
```

Depois, instale a config da Airbnb e os plugins para import, a11y e React:

```bash
$ npm install --save-dev eslint-config-airbnb
$ npm install --save-dev eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react
```

Por fim, crie um arquivo `.eslintrc` na raiz do projeto:

```javascript
{
  "extends": "eslint-config-airbnb"
}
```

Agora você pode analisar o projeto com as regras configuradas.

Exemplo `index.js`:

```javascript
var unused = 'I have no purpose!';

function greet() {
    var message = 'Hello, World!';
    console.log(message);
}

greet();
```

O ESLint reportará problemas:

```bash
$ npx eslint index.js
index.js
  1:1  error  Unexpected var, use let or const instead          no-var
  1:5  error  unused is defined but never used                 no-unused-vars
  4:5  error  Expected indentation of 2 characters but found 4  indent
  4:5  error  Unexpected var, use let or const instead          no-var
  5:5  error  Expected indentation of 2 characters but found 4  indent

✖ 5 problems (5 errors, 0 warnings)
```

A saída mostra cinco erros: dois por usar `var` em vez de `let` ou `const`, um por variável não utilizada e dois por indentação (4 espaços em vez de 2).
