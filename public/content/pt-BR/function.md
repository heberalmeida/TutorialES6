# Extensões de Funções

## Valores Padrão para Parâmetros

### Uso Básico

Antes do ES6, não era possível especificar valores padrão diretamente nos parâmetros; era preciso usar alternativas.

```javascript
function log(x, y) {
  y = y || 'World';
  console.log(x, y);
}

log('Hello') // Hello World
log('Hello', 'China') // Hello China
log('Hello', '') // Hello World
```

O código acima verifica se o parâmetro `y` de `log()` foi definido. Se não, usa `World`. A desvantagem é que, se `y` for atribuído mas seu valor for falsy, a atribuição não surte efeito — como na última linha, em que `y` é string vazia mas é substituído pelo padrão.

Para evitar isso, em geral se verifica se `y` foi atribuído antes de usar o padrão.

```javascript
if (typeof y === 'undefined') {
  y = 'World';
}
```

O ES6 permite definir valores padrão diretamente na lista de parâmetros.

```javascript
function log(x, y = 'World') {
  console.log(x, y);
}

log('Hello') // Hello World
log('Hello', 'China') // Hello China
log('Hello', '') // Hello
```

O estilo ES6 é mais conciso e natural. Outro exemplo:

```javascript
function Point(x = 0, y = 0) {
  this.x = x;
  this.y = y;
}

const p = new Point();
p // { x: 0, y: 0 }
```

Além de ser mais curto, isso traz duas vantagens: fica claro quais parâmetros são opcionais sem ler o corpo da função ou a documentação, e versões futuras podem remover um parâmetro sem quebrar código antigo.

Parâmetros com valor padrão são implicitamente declarados; não podem ser redeclarados com `let` ou `const`.

```javascript
function foo(x = 5) {
  let x = 1; // erro
  const x = 2; // erro
}
```

Parâmetros não podem ter o mesmo nome quando se usam valores padrão.

```javascript
// OK
function foo(x, x, y) {
  // ...
}

// Erro
function foo(x, x, y = 1) {
  // ...
}
// SyntaxError: Duplicate parameter name not allowed in this context
```

Outro detalhe: os valores padrão não são calculados uma única vez na definição. Eles são recalculados sempre que o padrão é usado.

```javascript
let x = 99;
function foo(p = x + 1) {
  console.log(p);
}

foo() // 100

x = 100;
foo() // 101
```

O padrão de `p` é `x + 1`. Cada chamada a `foo()` recalcula essa expressão, então `p` não fica fixo em 100.

### Uso com Desestruturação e Valores Padrão

Os padrões de parâmetro podem ser combinados com valores padrão em desestruturação.

```javascript
function foo({x, y = 5}) {
  console.log(x, y);
}

foo({}) // undefined 5
foo({x: 1}) // 1 5
foo({x: 1, y: 2}) // 1 2
foo() // TypeError: Cannot read property 'x' of undefined
```

Aqui só se usam valores padrão na desestruturação, não um padrão para o parâmetro inteiro. `x` e `y` vêm da desestruturação apenas quando `foo()` é chamada com um objeto. Chamar `foo()` sem argumento impede a desestruturação e causa erro. Um padrão para o parâmetro inteiro evita isso:

```javascript
function foo({x, y = 5} = {}) {
  console.log(x, y);
}

foo() // undefined 5
```

Outro exemplo de desestruturação com padrões:

```javascript
function fetch(url, { body = '', method = 'GET', headers = {} }) {
  console.log(method);
}

fetch('http://example.com', {})
// "GET"

fetch('http://example.com')
// Erro
```

Se o segundo argumento for um objeto, dá para definir padrões para suas propriedades. Não é possível omitir o segundo argumento a menos que se defina um padrão para ele, o que leva a "padrões duplos":

```javascript
function fetch(url, { body = '', method = 'GET', headers = {} } = {}) {
  console.log(method);
}

fetch('http://example.com')
// "GET"
```

Quando `fetch` é chamada sem segundo argumento, o padrão do parâmetro é usado primeiro e depois a desestruturação, então `method` acaba como `GET`.

Após os padrões de parâmetro entrarem em vigor, a desestruturação ainda é executada:

```javascript
function f({ a, b = 'world' } = { a: 'hello' }) {
  console.log(b);
}

f() // world
```

Aqui `f()` é chamada sem argumentos; o padrão `{ a: 'hello' }` é usado, em seguida esse objeto é desestruturado, o que aciona o padrão para `b`.

Como exercício, compare estas duas formas:

```javascript
// Forma 1
function m1({x = 0, y = 0} = {}) {
  return [x, y];
}

// Forma 2
function m2({x, y} = { x: 0, y: 0 }) {
  return [x, y];
}

// Sem argumentos
m1() // [0, 0]
m2() // [0, 0]

// x e y ambos informados
m1({x: 3, y: 8}) // [3, 8]
m2({x: 3, y: 8}) // [3, 8]

// x informado, y não
m1({x: 3}) // [3, 0]
m2({x: 3}) // [3, undefined]

// Nem x nem y informados
m1({}) // [0, 0];
m2({}) // [undefined, undefined]

m1({z: 3}) // [0, 0]
m2({z: 3}) // [undefined, undefined]
```

### Posição dos Parâmetros com Padrão

Em geral, parâmetros com padrão devem vir por último, para ficar claro quais foram omitidos. Se um parâmetro não final tiver padrão, não dá para omiti-lo sem omitir os seguintes.

```javascript
// Exemplo 1
function f(x = 1, y) {
  return [x, y];
}

f() // [1, undefined]
f(2) // [2, undefined]
f(, 1) // Erro
f(undefined, 1) // [1, 1]

// Exemplo 2
function f(x, y = 5, z) {
  return [x, y, z];
}

f() // [undefined, 5, undefined]
f(1) // [1, 5, undefined]
f(1, ,2) // Erro
f(1, undefined, 2) // [1, 5, 2]
```

Para pular um parâmetro com padrão e passar um posterior, é preciso passar `undefined` explicitamente.

Passar `undefined` aciona o padrão; `null` não.

```javascript
function foo(x = 5, y = 6) {
  console.log(x, y);
}

foo(undefined, null)
// 5 null
```

Aqui `x` recebe o padrão porque o argumento é `undefined`; `y` permanece `null`.

### Propriedade length das Funções

Quando se usam padrões, `length` retorna o número de parâmetros sem padrão. Ou seja, `length` deixa de refletir o número real de parâmetros.

```javascript
(function (a) {}).length // 1
(function (a = 5) {}).length // 0
(function (a, b, c = 5) {}).length // 2
```

Parâmetros rest também não entram no `length`:

```javascript
(function(...args) {}).length // 0
```

Se um parâmetro com padrão não for o último, `length` também deixa de contar os parâmetros após ele:

```javascript
(function (a = 0, b, c) {}).length // 0
(function (a, b = 1, c) {}).length // 1
```

### Escopo

Quando se usam padrões, os parâmetros formam um escopo próprio durante a inicialização da função. Esse escopo some ao final da inicialização. Esse comportamento não ocorre sem padrões.

```javascript
var x = 1;

function f(x, y = x) {
  console.log(y);
}

f(2) // 2
```

Aqui `y` tem como padrão `x`. Os parâmetros formam um escopo próprio; o `x` no padrão se refere ao parâmetro, não ao global, então a saída é `2`.

Outro exemplo:

```javascript
let x = 1;

function f(y = x) {
  let x = 2;
  console.log(y);
}

f() // 1
```

Quando `f()` é chamada, `y = x` executa no escopo dos parâmetros. Não existe `x` nesse escopo, então usa-se o `x` externo. O `x` declarado no corpo não afeta o padrão.

Se o `x` externo não existir, ocorre erro:

```javascript
function f(y = x) {
  let x = 2;
  console.log(y);
}

f() // ReferenceError: x is not defined
```

O seguinte também lança erro:

```javascript
var x = 1;

function foo(x = x) {
  // ...
}

foo() // ReferenceError: Cannot access 'x' before initialization
```

No escopo dos parâmetros existe `let x = x`, o que causa zona de morte temporal.

Se o valor padrão for uma função, o escopo segue as mesmas regras:

```javascript
let foo = 'outer';

function bar(func = () => foo) {
  let foo = 'inner';
  console.log(func());
}

bar(); // outer
```

O padrão de `func` é uma função anônima que retorna `foo`. No escopo dos parâmetros `foo` não está definido, então refere-se ao externo.

Esta versão lança erro:

```javascript
function bar(func = () => foo) {
  let foo = 'inner';
  console.log(func());
}

bar() // ReferenceError: foo is not defined
```

O escopo externo não tem `foo`.

Exemplo mais complexo:

```javascript
var x = 1;
function foo(x, y = function() { x = 2; }) {
  var x = 3;
  y();
  console.log(x);
}

foo() // 3
x // 1
```

Os parâmetros formam um escopo próprio com `x` e `y`. A função anônima no padrão de `y` se refere ao parâmetro `x`. No corpo, `var x = 3` declara outra variável, em outro escopo. Chamar `y()` altera o parâmetro `x`, não o interno; o `x` interno continua 3.

Removendo o `var` de `var x = 3`, o `x` interno seria o parâmetro e a saída seria `2`:

```javascript
var x = 1;
function foo(x, y = function() { x = 2; }) {
  x = 3;
  y();
  console.log(x);
}

foo() // 2
x // 1
```

### Caso de Uso

Você pode exigir que um parâmetro seja informado lançando erro no padrão:

```javascript
function throwIfMissing() {
  throw new Error('Missing parameter');
}

function foo(mustBeProvided = throwIfMissing()) {
  return mustBeProvided;
}

foo()
// Error: Missing parameter
```

O padrão só é avaliado quando necessário. Se o parâmetro for passado, `throwIfMissing` não é chamada.

Também dá para usar `undefined` explicitamente para indicar que o parâmetro é opcional:

```javascript
function foo(optional = undefined) { ··· }
```

## Parâmetros rest

O ES6 introduz parâmetros rest (`...nomeVariável`) para coletar argumentos extras, substituindo `arguments`. A variável após `...` é um array com os parâmetros restantes.

```javascript
function add(...values) {
  let sum = 0;

  for (var val of values) {
    sum += val;
  }

  return sum;
}

add(2, 5, 3) // 10
```

Parâmetros rest substituem `arguments`:

```javascript
// Usando arguments
function sortNumbers() {
  return Array.from(arguments).sort();
}

// Usando parâmetros rest
const sortNumbers = (...numbers) => numbers.sort();
```

`arguments` é array-like, não um array; métodos de array exigem `Array.from`. Parâmetros rest são arrays reais. Exemplo de variante de `push`:

```javascript
function push(array, ...items) {
  items.forEach(function(item) {
    array.push(item);
    console.log(item);
  });
}

var a = [];
push(a, 1, 2, 3)
```

O parâmetro rest precisa ser o último; nenhum outro pode vir depois.

```javascript
// Erro
function f(a, ...b, c) {
  // ...
}
```

Parâmetros rest não entram no `length`:

```javascript
(function(a) {}).length  // 1
(function(...a) {}).length  // 0
(function(a, ...b) {}).length  // 1
```

## Modo Estrito

Desde o ES5, funções podem usar modo estrito internamente:

```javascript
function doSomething(a, b) {
  'use strict';
  // código
}
```

O ES2016 alterou isso: se uma função usar parâmetros padrão, desestruturação ou spread nos parâmetros, ela não pode definir modo estrito explicitamente, senão ocorre erro de sintaxe.

```javascript
// Erro
function doSomething(a, b = a) {
  'use strict';
  // código
}

// Erro
const doSomething = function ({a, b}) {
  'use strict';
  // código
};

// Erro
const doSomething = (...a) => {
  'use strict';
  // código
};

const obj = {
  // Erro
  doSomething({a, b}) {
    'use strict';
    // código
  }
};
```

O motivo é que o modo estrito vale para corpo e parâmetros, mas os parâmetros são avaliados antes. Duas alternativas: usar modo estrito global:

```javascript
'use strict';

function doSomething(a, b = a) {
  // código
}
```

Ou envolver a função em uma IIFE:

```javascript
const doSomething = (function () {
  'use strict';
  return function(value = 42) {
    return value;
  };
}());
```

## Propriedade name

A propriedade `name` retorna o nome da função:

```javascript
function foo() {}
foo.name // "foo"
```

Se uma função anônima é atribuída a uma variável, no ES5 `name` era string vazia; no ES6 passa a ser o nome da variável:

```javascript
var f = function () {};

// ES5
f.name // ""

// ES6
f.name // "f"
```

Para expressão de função nomeada atribuída a variável, ES5 e ES6 usam o nome original da função:

```javascript
const bar = function baz() {};

// ES5
bar.name // "baz"

// ES6
bar.name // "baz"
```

Funções criadas com `Function` têm `name` igual a `"anonymous"`:

```javascript
(new Function).name // "anonymous"
```

Funções retornadas por `bind` ganham prefixo `"bound "`:

```javascript
function foo() {};
foo.bind({}).name // "bound foo"

(function(){}).bind({}).name // "bound "
```

## Arrow Functions

### Uso Básico

O ES6 permite definir funções com a sintaxe de seta (`=>`):

```javascript
var f = v => v;

// Equivalente a
var f = function (v) {
  return v;
};
```

Para nenhum ou múltiplos parâmetros, use parênteses:

```javascript
var f = () => 5;
// Equivalente a
var f = function () { return 5 };

var sum = (num1, num2) => num1 + num2;
// Equivalente a
var sum = function(num1, num2) {
  return num1 + num2;
};
```

Para mais de uma instrução, use chaves e `return`:

```javascript
var sum = (num1, num2) => { return num1 + num2; }
```

Para retornar um objeto literal diretamente, envolva-o em parênteses:

```javascript
// Erro
let getTempItem = id => { id: id, name: "Temp" };

// OK
let getTempItem = id => ({ id: id, name: "Temp" });
```

Arrow functions não têm `this` próprio, não podem ser usadas com `new`, não têm `arguments` (use rest parameters) e não podem usar `yield`. O mais importante: o `this` é herdado do escopo onde a função é definida.

```javascript
function foo() {
  setTimeout(() => {
    console.log('id:', this.id);
  }, 100);
}

var id = 21;

foo.call({ id: 42 });
// id: 42
```

O `this` fica fixo no contexto onde a arrow function foi criada. Use arrow functions em callbacks quando precisar desse comportamento; evite em métodos de objeto ou quando precisar de `this` dinâmico.

### Arrow Functions Aninhadas

Arrow functions podem ser aninhadas e são úteis para encadear transformações ou implementar pipelines funcionais.

## Otimização de Tail Call

### O que é Tail Call?

Tail call (chamada em cauda) ocorre quando a última operação de uma função é chamar outra função.

```javascript
function f(x){
  return g(x);
}
```

A otimização de tail call permite que o frame da função externa seja descartado, reduzindo o uso da pilha. Funções que chamam a si mesmas em tail position (recursão de cauda) podem ser otimizadas e evitar estouro de pilha.

Note: Atualmente apenas o Safari implementa a otimização; Chrome e Firefox não.

## Vírgula Final nos Parâmetros

O ES2017 [permite](https://github.com/jeffmo/es-trailing-function-commas) vírgula após o último parâmetro.

## Function.prototype.toString()

O [ES2019](https://github.com/tc39/Function-prototype-toString-revision) exige que `toString()` retorne o código-fonte da função, incluindo comentários e espaços.

## Parâmetro de catch Opcional

O [ES2019](https://github.com/tc39/proposal-optional-catch-binding) permite omitir o parâmetro de `catch` quando não é usado:

```javascript
try {
  // ...
} catch {
  // ...
}
```
