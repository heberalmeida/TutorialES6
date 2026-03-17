# Comandos let e const

## Comando let

### Uso Básico

O ES6 adiciona o comando `let` para declarar variáveis. Seu uso é semelhante ao `var`, mas variáveis declaradas com `let` só são válidas dentro do bloco onde o comando `let` aparece.

```javascript
{
  let a = 10;
  var b = 1;
}

a // ReferenceError: a is not defined.
b // 1
```

No código acima, duas variáveis são declaradas com `let` e `var` dentro de um bloco. Quando acessadas fora do bloco, a variável declarada com `let` gera erro, enquanto a declarada com `var` retorna o valor correto. Isso mostra que variáveis declaradas com `let` só são válidas no seu bloco.

O contador do loop em um `for` é bem adequado para `let`.

```javascript
for (let i = 0; i < 10; i++) {
  // ...
}

console.log(i);
// ReferenceError: i is not defined
```

No código acima, o contador `i` só é válido dentro do corpo do loop `for`; referenciá-lo fora gera erro.

Se `var` fosse usado no código a seguir, a saída seria `10`.

```javascript
var a = [];
for (var i = 0; i < 10; i++) {
  a[i] = function () {
    console.log(i);
  };
}
a[6](); // 10
```

Aqui, `i` é declarado com `var`, então é válido no escopo global e há apenas um `i`. Cada iteração do loop altera `i`, e o `console.log(i)` dentro das funções atribuídas ao array `a` se refere a esse `i` global. Ou seja, todos os membros do array `a` usam o mesmo `i`, então em tempo de execução exibem o valor de `i` da última iteração, que é 10.

Com `let`, a variável só é válida no escopo do bloco, então a saída é 6.

```javascript
var a = [];
for (let i = 0; i < 10; i++) {
  a[i] = function () {
    console.log(i);
  };
}
a[6](); // 6
```

Aqui, `i` é declarado com `let`, então o `i` atual só é válido para aquela iteração. Cada loop efetivamente cria um novo `i`, daí a saída ser `6`. Você pode se perguntar: se `i` é redeclarado a cada iteração, como ele sabe o valor anterior para calcular o atual? O motor JavaScript internamente guarda o valor da iteração anterior e o usa ao inicializar o `i` atual.

Outro detalhe dos loops `for`: a parte que define a variável do loop está em um escopo pai, enquanto o corpo do loop está em um escopo filho separado.

```javascript
for (let i = 0; i < 3; i++) {
  let i = 'abc';
  console.log(i);
}
// abc
// abc
// abc
```

O código acima roda corretamente e exibe `abc` três vezes. Isso mostra que o `i` interno e a variável de loop `i` estão em escopos diferentes (no mesmo escopo, não é possível declarar a mesma variável duas vezes com `let`).

### Sem Hoisting de Variáveis

Com `var`, ocorre o "hoisting" de variáveis: uma variável pode ser usada antes de sua declaração, com valor `undefined`. Esse comportamento é um tanto estranho; normalmente, uma variável só deveria ser utilizável após sua declaração.

Para corrigir isso, `let` muda o comportamento: variáveis declaradas com `let` devem ser usadas apenas após sua declaração, caso contrário um erro é lançado.

```javascript
// caso var
console.log(foo); // saídaundefined
var foo = 2;

// caso let
console.log(bar); // ErroReferenceError
let bar = 2;
```

Com `var`, o hoisting ocorre: quando o script executa, `foo` existe mas ainda não tem valor, então `undefined` é exibido. Com `let`, não há hoisting. Antes de sua declaração, `bar` não existe; usá-la lança erro.

### Zona de Morte Temporal

Enquanto um bloco contiver uma declaração `let`, essa variável fica "ligada" a esse bloco e não é afetada por escopos externos.

```javascript
var tmp = 123;

if (true) {
  tmp = 'abc'; // ReferenceError
  let tmp;
}
```

Existe um `tmp` global, mas dentro do bloco `let` declara um `tmp` local. O local fica ligado ao bloco, então atribuir a `tmp` antes de sua declaração `let` lança erro.

O ES6 especifica que, se um bloco contém `let` ou `const`, esse bloco forma um escopo fechado para essas variáveis desde o início. Usá-las antes da declaração lança erro.

Em outras palavras, dentro de um bloco, variáveis declaradas com `let` ficam indisponíveis até sua declaração. Isso é chamado de "zona de morte temporal" (TDZ).

```javascript
if (true) {
  // TDZ começa
  tmp = 'abc'; // ReferenceError
  console.log(tmp); // ReferenceError

  let tmp; // TDZ termina
  console.log(tmp); // undefined

  tmp = 123;
  console.log(tmp); // 123
}
```

No código acima, tudo antes da declaração `let` de `tmp` é a "zona de morte" da variável.

A zona de morte temporal também significa que `typeof` não é mais sempre seguro.

```javascript
typeof x; // ReferenceError
let x;
```

`x` é declarado com `let`, então antes de sua declaração está na zona de morte e qualquer uso lança erro. Por isso `typeof` lança `ReferenceError`.

Em contraste, se uma variável nunca foi declarada, `typeof` não lança:

```javascript
typeof undeclared_variable // "undefined"
```

Aqui, `undeclared_variable` não existe e o resultado é `"undefined"`. Antes do `let`, `typeof` era sempre seguro. Isso não vale mais, por design, para encorajar declarar variáveis antes do uso.

Algumas zonas de morte são sutis:

```javascript
function bar(x = y, y = 2) {
  return [x, y];
}

bar(); // Erro
```

Chamar `bar` lança erro porque o valor padrão do parâmetro `x` é o outro parâmetro `y`, que ainda não foi declarado e está na zona de morte. Se o padrão de `y` fosse `x`, funcionaria, pois `x` já está declarado:

```javascript
function bar(x = 2, y = x) {
  return [x, y];
}
bar(); // [2, 2]
```

O seguinte também lança erro, ao contrário do `var`:

```javascript
// OK
var x = x;

// Erro
let x = x;
// ReferenceError: x is not defined
```

Isso falha por causa da zona de morte temporal. Com `let`, usar a variável antes de sua declaração estar completa lança erro. Aqui, tentamos ler `x` antes de sua declaração terminar de executar.

O ES6 introduz a zona de morte temporal e o fato de que `let` e `const` não sofrem hoisting principalmente para reduzir erros em tempo de execução e evitar usar variáveis antes de serem declaradas. Esses erros eram comuns no ES5; com essas regras, são mais fáceis de evitar.

Em resumo, a zona de morte temporal significa que, ao entrar no escopo atual, a variável existe mas não pode ser acessada até a linha em que é declarada.

### Sem Declarações Duplicadas

`let` não permite que a mesma variável seja declarada mais de uma vez no mesmo escopo.

```javascript
// Erro
function func() {
  let a = 10;
  var a = 1;
}

// Erro
function func() {
  let a = 10;
  let a = 1;
}
```

Também não é possível redeclarar parâmetros de função dentro da função:

```javascript
function func(arg) {
  let arg;
}
func() // Erro

function func(arg) {
  {
    let arg;
  }
}
func() // OK
```

## Escopo de Bloco

### Por Que Escopo de Bloco?

O ES5 tem apenas escopo global e de função, não escopo de bloco, o que leva a muitas situações estranhas.

Primeiro, variáveis internas podem ocultar as externas:

```javascript
var tmp = new Date();

function f() {
  console.log(tmp);
  if (false) {
    var tmp = 'hello world';
  }
}

f(); // undefined
```

A intenção era usar o `tmp` externo fora do `if` e o interno dentro. Mas por causa do hoisting, o `tmp` interno oculta o externo, e a saída é `undefined`.

Segundo, contadores de loop vazam para o escopo global:

```javascript
var s = 'hello';

for (var i = 0; i < s.length; i++) {
  console.log(s[i]);
}

console.log(i); // 5
```

Aqui, `i` é apenas para o loop, mas após o loop continua existindo como variável global.

### Escopo de Bloco no ES6

`let` efetivamente adiciona escopo de bloco ao JavaScript.

```javascript
function f1() {
  let n = 5;
  if (true) {
    let n = 10;
  }
  console.log(n); // 5
}
```

Esta função tem dois blocos, ambos declarando `n`. A saída é 5, então o bloco interno não afeta o externo. Se ambos usassem `var`, a saída seria 10.

O ES6 permite escopos de bloco aninhados arbitrariamente:

```javascript
{{{{
  {let insane = 'Hello World'}
  console.log(insane); // Erro
}}}};
```

Há cinco níveis de escopo de bloco, cada um separado. O quarto nível não consegue ler a variável interna do quinto.

Escopos internos podem definir variáveis com o mesmo nome dos externos:

```javascript
{{{{
  let insane = 'Hello World';
  {let insane = 'Hello World'}
}}}};
```

Com escopo de bloco, a IIFE anônima amplamente usada frequentemente não é mais necessária:

```javascript
// estilo IIFE
(function () {
  var tmp = ...;
  ...
}());

// estilo escopo de bloco
{
  let tmp = ...;
  ...
}
```

### Escopo de Bloco e Declarações de Função

Funções podem ser declaradas dentro de escopo de bloco? Essa é uma pergunta confusa.

O ES5 diz que funções só podem ser declaradas no nível superior ou dentro de escopo de função, não em escopo de bloco:

```javascript
// Caso 1
if (true) {
  function f() {}
}

// Caso 2
try {
  function f() {}
} catch(e) {
  // ...
}
```

Segundo o ES5, ambos são ilegais.

No entanto, os navegadores não seguiram essa regra e continuaram permitindo declarações de função em escopo de bloco por compatibilidade, então ambos na verdade rodam sem erro.

O ES6 introduz escopo de bloco e explicitamente permite declarações de função em blocos. No ES6, declarações de função em escopo de bloco se comportam como `let` e não são acessíveis fora do bloco.

```javascript
function f() { console.log('I am outside!'); }

(function () {
  if (false) {
    // redeclarar função f
    function f() { console.log('I am inside!'); }
  }

  f();
}());
```

No ES5, isso exibe "I am inside!" porque a função `f` declarada no `if` sofre hoisting para o topo da função. Efetivamente:

```javascript
// ambiente ES5
function f() { console.log('I am outside!'); }

(function () {
  function f() { console.log('I am inside!'); }
  if (false) {
  }
  f();
}());
```

No ES6 deveria se comportar diferente e exibir "I am outside!", pois a função no bloco se comportaria como `let`. Porém, em navegadores ES6 reais, o código acima lança erro. Por quê?

```javascript
// Ambiente ES6 do navegador
function f() { console.log('I am outside!'); }

(function () {
  if (false) {
    // redeclarar função f
    function f() { console.log('I am inside!'); }
  }

  f();
}());
// Uncaught TypeError: f is not a function
```

Para reduzir mudanças incompatíveis, o [Anexo B](https://www.ecma-international.org/ecma-262/6.0/index.html#sec-block-level-function-declarations-web-legacy-compatibility-semantics) do ES6 permite que implementações de navegador divirjam. Elas podem [se comportar de forma diferente](https://stackoverflow.com/questions/31419897/what-are-the-precise-semantics-of-block-level-functions-in-es6):

- Permitir declarações de função em escopo de bloco.
- Tratá-las como `var`, ou seja, hoisting para escopo global ou de função.
- Também promover para o topo do seu bloco.

Essas regras aplicam-se apenas a implementações ES6 em navegadores; outros ambientes podem tratar declarações de função em escopo de bloco como `let`.

Sob essas regras, em navegadores ES6, funções declaradas em blocos se comportam como variáveis declaradas com `var`. O exemplo efetivamente roda como:

```javascript
// Ambiente ES6 do navegador
function f() { console.log('I am outside!'); }
(function () {
  var f = undefined;
  if (false) {
    function f() { console.log('I am inside!'); }
  }

  f();
}());
// Uncaught TypeError: f is not a function
```

Como o comportamento difere entre ambientes, evite declarar funções dentro de escopo de bloco. Se necessário, use expressões de função:

```javascript
// Evitar declarações de função dentro de escopo de bloco
{
  let a = 'secret';
  function f() {
    return a;
  }
}

// Preferir expressões de função dentro de escopo de bloco
{
  let a = 'secret';
  let f = function () {
    return a;
  };
}
```

Observe: o escopo de bloco ES6 deve ter chaves. Sem elas, o motor não trata como escopo de bloco:

```javascript
// estilo 1, Erro
if (true) let x = 1;

// Estilo 2, OK
if (true) {
  let x = 1;
}
```

Sem chaves não há escopo de bloco, e `let` só pode aparecer no nível superior do escopo atual, então lança erro. Com chaves, o bloco existe.

Declarações de função seguem a mesma regra: em modo estrito, funções só podem ser declaradas no nível superior do escopo atual:

```javascript
// OK
'use strict';
if (true) {
  function f() {}
}

// Erro
'use strict';
if (true)
  function f() {}
```

## Comando const

### Uso Básico

`const` declara uma constante somente leitura. Uma vez declarada, o valor não pode mudar.

```javascript
const PI = 3.1415;
PI // 3.1415

PI = 3;
// TypeError: Assignment to constant variable.
```

Alterar o valor lança erro.

`const` deve ser inicializado na declaração; não é possível atribuir depois:

```javascript
const foo;
// SyntaxError: Missing initializer in const declaration
```

`const` tem o mesmo escopo que `let`: apenas dentro do bloco onde é declarado.

```javascript
if (true) {
  const MAX = 5;
}

MAX // Uncaught ReferenceError: MAX is not defined
```

`const` também não sofre hoisting e tem zona de morte temporal; só pode ser usado após sua declaração:

```javascript
if (true) {
  console.log(MAX); // ReferenceError
  const MAX = 5;
}
```

`const` também não pode ser redeclarado:

```javascript
var message = "Hello!";
let age = 25;

// Ambas as linhas abaixo erro
const message = "Goodbye!";
const age = 30;
```

### Essência

`const` não garante que o valor em si seja imutável, mas que os dados no endereço de memória para o qual a variável aponta não possam mudar. Para tipos primitivos (número, string, booleano), o valor fica nesse endereço, então age como constante de fato. Para tipos compostos (objetos e arrays), o endereço guarda um ponteiro para os dados reais. `const` só garante que o ponteiro seja fixo; a estrutura subjacente ainda pode ser mutada. Tenha cuidado ao declarar objetos como constantes.

```javascript
const foo = {};

// adicionar propriedade a foo, sucesso
foo.prop = 123;
foo.prop // 123

// Apontar foo a outro objeto, erro
foo = {}; // TypeError: "foo" is read-only
```

A constante `foo` guarda um endereço para um objeto. Só o endereço é fixo; não se pode reatribuir `foo`, mas o objeto pode ser modificado.

```javascript
const a = [];
a.push('Hello'); // executável
a.length = 0;    // executável
a = ['Dave'];    // Erro
```

`a` é um array e o array pode ser mutado, mas atribuir outro array a `a` lança erro.

Para congelar de fato um objeto, use `Object.freeze`:

```javascript
const foo = Object.freeze({});

// Em modo sloppy, próxima linha sem efeito;
// Em modo estrito, essa linha erro
foo.prop = 123;
```

Aqui, `foo` aponta para um objeto congelado, então adicionar propriedades não tem efeito, e em modo estrito lança erro.

Para congelar um objeto profundamente, congele também suas propriedades:

```javascript
var constantize = (obj) => {
  Object.freeze(obj);
  Object.keys(obj).forEach( (key, i) => {
    if ( typeof obj[key] === 'object' ) {
      constantize( obj[key] );
    }
  });
};
```

### Seis Formas de Declarar Variáveis no ES6

ES5 tinha apenas `var` e `function`. ES6 adiciona `let` e `const`, e capítulos posteriores cobrem `import` e `class`. Assim, ES6 tem seis formas de declarar variáveis.

## Propriedades do Objeto de Nível Superior

O objeto de nível superior é `window` no navegador e `global` no Node. No ES5, suas propriedades eram equivalentes a variáveis globais.

```javascript
window.a = 1;
a // 1

a = 2;
window.a // 2
```

Atribuir a uma propriedade do objeto de nível superior era o mesmo que atribuir a uma variável global.

Esse design foi considerado uma das maiores falhas do JavaScript. Significava: variáveis não declaradas não podiam ser detectadas em tempo de compilação, só em execução; era fácil criar globais acidentalmente; e propriedades do nível superior podiam ser lidas e escritas em qualquer lugar, prejudicando a modularização. Além disso, `window` tem significado concreto (a janela do navegador), então usá-lo como objeto de nível superior era inadequado.

ES6 muda isso: por compatibilidade, variáveis globais com `var` e `function` ainda viram propriedades do nível superior, mas `let`, `const` e `class` não. Variáveis globais gradualmente se desconectam do objeto de nível superior.

```javascript
var a = 1;
// No REPL do Node, pode usar global.a
// Ou usar this.a
window.a // 1

let b = 1;
window.b // undefined
```

`a` é declarada com `var`, então é propriedade do nível superior; `b` é declarada com `let`, então não é, e `window.b` é `undefined`.

## O Objeto globalThis

O JavaScript tem um objeto de nível superior que fornece o ambiente global (escopo global). Todo o código roda nesse ambiente, mas o objeto de nível superior varia entre implementações:

- No navegador é `window`, mas Node e Web Worker não têm `window`.
- No navegador e Web Worker, `self` também se refere ao objeto de nível superior, mas Node não tem `self`.
- No Node é `global`, que não está disponível em outros ambientes.

Para obter o objeto de nível superior em qualquer ambiente, costumava-se usar `this`, mas tem limitações:

- No ambiente global, `this` é o objeto de nível superior. Mas em módulos Node.js `this` é o módulo atual, e em módulos ES6 `this` é `undefined`.
- Em uma função, se ela é chamada como função pura (não como método), `this` pode ser o objeto de nível superior. Em modo estrito, é `undefined`.
- Em modo estrito e não estrito, `new Function('return this')()` retorna o objeto global. Porém, com CSP (Content Security Policy), `eval` e `new Function` podem estar desabilitados.

Não havia forma confiável de obter o objeto de nível superior em todos os casos. Duas alternativas:

```javascript
// Método 1
(typeof window !== 'undefined'
   ? window
   : (typeof process === 'object' &&
      typeof require === 'function' &&
      typeof global === 'object')
     ? global
     : this);

// Método 2
var getGlobal = function () {
  if (typeof self !== 'undefined') { return self; }
  if (typeof window !== 'undefined') { return window; }
  if (typeof global !== 'undefined') { return global; }
  throw new Error('unable to locate global object');
};
```

O [ES2020](https://github.com/tc39/proposal-global) introduz `globalThis` como forma padrão de acessar o objeto de nível superior. Em qualquer ambiente, `globalThis` existe e se refere ao `this` global.

O polyfill [`global-this`](https://github.com/ungap/global-this) implementa essa proposta para usar `globalThis` em todos os ambientes.
