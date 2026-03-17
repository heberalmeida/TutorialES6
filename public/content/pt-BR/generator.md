# Sintaxe de Funções Generator

## Introdução

### Conceitos Básicos

Funções Generator são uma solução de programação assíncrona oferecida pelo ES6. Sua sintaxe e comportamento diferem significativamente das funções tradicionais. Este capítulo aborda em detalhes a sintaxe e a API de Generators; para o uso assíncrono, consulte o capítulo "Funções Generator para Aplicação Assíncrona".

Funções Generator podem ser entendidas sob vários ângulos. Sintaticamente, você pode pensar em um Generator como uma máquina de estados que encapsula múltiplos estados internos.

Chamar uma função Generator retorna um objeto iterador. Assim, um Generator é ao mesmo tempo uma máquina de estados e um gerador de iteradores. O iterador retornado pode percorrer cada estado interno do Generator.

Na forma, um Generator se assemelha a uma função normal, mas possui duas características: há um asterisco entre a palavra-chave `function` e o nome da função, e o corpo usa expressões `yield` para definir estados internos (`yield` significa "produzir" em inglês).

```javascript
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}

var hw = helloWorldGenerator();
```

O código acima define um Generator `helloWorldGenerator` com duas expressões `yield` (`hello` e `world`). Isso lhe confere três estados: hello, world e o return (fim).

Funções Generator são chamadas como funções regulares (com parênteses após o nome). Diferente das funções regulares, chamar um Generator não o executa imediatamente; ele retorna um ponteiro para o estado interno—um objeto iterador.

O próximo passo é chamar `next` no iterador para avançar ao próximo estado. Cada chamada a `next` começa do início ou de onde o Generator pausou pela última vez, executa até o próximo `yield` (ou `return`) e então para. Em outras palavras, Generators executam em segmentos; `yield` marca onde a execução pausa, e `next` a retoma.

```javascript
hw.next()
// { value: 'hello', done: false }

hw.next()
// { value: 'world', done: false }

hw.next()
// { value: 'ending', done: true }

hw.next()
// { value: undefined, done: true }
```

O código acima chama `next` quatro vezes:

- **Primeira chamada**: O Generator executa até o primeiro `yield`. O objeto retornado tem `value: 'hello'` e `done: false`.
- **Segunda chamada**: A execução retoma a partir do `yield` anterior e continua até o próximo. Retorna `value: 'world'`, `done: false`.
- **Terceira chamada**: Executa do `yield` anterior até o `return` (ou fim). Retorna `value: 'ending'`, `done: true`.
- **Quarta chamada**: O Generator já está finalizado. Retorna `value: undefined`, `done: true`.

Em resumo: chamar um Generator retorna um iterador que atua como um ponteiro interno. Cada chamada a `next` retorna um objeto com `value` e `done`. `value` é o estado atual (a expressão após `yield`); `done` indica se a iteração terminou.

O ES6 não define onde o asterisco deve ficar; todos estes são válidos:

```javascript
function * foo(x, y) { ··· }
function *foo(x, y) { ··· }
function* foo(x, y) { ··· }
function*foo(x, y) { ··· }
```

Como Generators ainda são funções comuns, o terceiro estilo (asterisco após `function`) é o mais usado. Este livro usa esse estilo.

### Expressão yield

Como o iterador avança apenas quando `next` é chamado, Generators efetivamente permitem execução pausável. `yield` é o marcador de pausa.

A lógica de `next` é:

1. Em um `yield`, a execução pausa. A expressão logo após `yield` é usada como o `value` do objeto retornado.
2. Na próxima chamada a `next`, a execução retoma desse ponto e segue até o próximo `yield`.
3. Se nenhum `yield` adicional for alcançado, a execução continua até o `return` (ou fim). O valor da expressão `return` torna-se o `value` retornado.
4. Se não houver `return`, o `value` retornado é `undefined`.

Nota: a expressão após `yield` só é avaliada quando o ponteiro interno atinge essa instrução (quando `next` é chamado). Isso confere ao JavaScript uma forma de "avaliação preguiçosa" manual.

```javascript
function* gen() {
  yield  123 + 456;
}
```

No código acima, `123 + 456` não é avaliado imediatamente; é avaliado quando `next` avança até essa linha.

`yield` e `return` ambos devolvem o valor da expressão seguinte. A diferença: cada `yield` pausa a função e depois a retoma naquele ponto, enquanto `return` não; uma função pode ter vários `yield`s mas apenas um `return`. Funções normais retornam um único valor; Generators podem produzir muitos valores (um por `yield`), daí o nome "generator".

Um Generator sem nenhum `yield` é simplesmente uma função adiada:

```javascript
function* f() {
  console.log('executado!')
}

var generator = f();

setTimeout(function () {
  generator.next()
}, 2000);
```

Se `f` fosse uma função normal, ela seria executada ao ser atribuída a `generator`. Como Generator, `f` só executa quando `next` é chamado.

`yield` só pode ser usado dentro de um Generator. Usá-lo em outro lugar causa um erro de sintaxe:

```javascript
(function (){
  yield 1;
})()
// SyntaxError: Unexpected number
```

Outro exemplo:

```javascript
var arr = [1, [[2, 3], 4], [5, 6]];

var flat = function* (a) {
  a.forEach(function (item) {
    if (typeof item !== 'number') {
      yield* flat(item);
    } else {
      yield item;
    }
  });
};

for (var f of flat(arr)){
  console.log(f);
}
```

Isso também causa erro de sintaxe: o callback de `forEach` é uma função normal, então `yield` dentro dele é inválido. Use um laço `for` em vez disso:

```javascript
var arr = [1, [[2, 3], 4], [5, 6]];

var flat = function* (a) {
  var length = a.length;
  for (var i = 0; i < length; i++) {
    var item = a[i];
    if (typeof item !== 'number') {
      yield* flat(item);
    } else {
      yield item;
    }
  }
};

for (var f of flat(arr)) {
  console.log(f);
}
// 1, 2, 3, 4, 5, 6
```

Se `yield` aparecer dentro de outra expressão, deve estar entre parênteses:

```javascript
function* demo() {
  console.log('Hello' + yield); // SyntaxError
  console.log('Hello' + yield 123); // SyntaxError

  console.log('Hello' + (yield)); // OK
  console.log('Hello' + (yield 123)); // OK
}
```

Quando `yield` é usado como argumento de função ou no lado direito de uma atribuição, parênteses não são necessários:

```javascript
function* demo() {
  foo(yield 'a', yield 'b'); // OK
  let input = yield; // OK
}
```

### Relação com a Interface de Iterador

O método `Symbol.iterator` de qualquer objeto é seu gerador de iterador. Chamá-lo retorna um iterador para esse objeto.

Generators são geradores de iteradores, então você pode atribuir um Generator ao `Symbol.iterator` de um objeto para torná-lo iterável:

```javascript
var myIterable = {};
myIterable[Symbol.iterator] = function* () {
  yield 1;
  yield 2;
  yield 3;
};

[...myIterable] // [1, 2, 3]
```

No código acima, atribuir um Generator a `Symbol.iterator` torna `myIterable` iterável e utilizável com o operador spread.

O objeto retornado por um Generator possui um `Symbol.iterator` que retorna a si mesmo:

```javascript
function* gen(){
  // some code
}

var g = gen();

g[Symbol.iterator]() === g
// true
```

`gen` é um Generator; chamá-lo retorna o iterador `g`. Seu `Symbol.iterator` também é um gerador de iterador; invocá-lo retorna o próprio `g`.

## Parâmetro do Método next

`yield` em si não tem valor de retorno (ou sempre retorna `undefined`). `next` pode receber um argumento; esse argumento se torna o valor de retorno do `yield` anterior.

```javascript
function* f() {
  for(var i = 0; true; i++) {
    var reset = yield i;
    if(reset) { i = -1; }
  }
}

var g = f();

g.next() // { value: 0, done: false }
g.next() // { value: 1, done: false }
g.next(true) // { value: 0, done: false }
```

No Generator infinito acima, se `next` for chamado sem argumentos, `reset` em cada `yield` é `undefined`. Quando `next(true)` é chamado, `reset` passa a ser `true`, então `i` é definido como `-1` e o próximo laço começa de `-1`.

Isso é importante: permite injetar valores em um Generator de fora, em diferentes estágios, e assim ajustar seu comportamento.

Outro exemplo:

```javascript
function* foo(x) {
  var y = 2 * (yield (x + 1));
  var z = yield (y / 3);
  return (x + y + z);
}

var a = foo(5);
a.next() // Object{value:6, done:false}
a.next() // Object{value:NaN, done:false}
a.next() // Object{value:NaN, done:true}

var b = foo(5);
b.next() // { value:6, done:false }
b.next(12) // { value:8, done:false }
b.next(13) // { value:42, done:true }
```

Quando o segundo `next` é chamado sem argumento, `y` passa a ser `2 * undefined` (NaN). Sem argumento na terceira chamada, `z` é `undefined`, então o return final é `5 + NaN + undefined` = NaN.

Quando argumentos são passados: o primeiro `next` retorna `x+1` = 6; o segundo `next(12)` define o valor do `yield` anterior como 12, então `y = 24` e o retorno é `8`; o terceiro `next(13)` define `z = 13`, resultando em `return 5 + 24 + 13 = 42`.

Nota: a primeira chamada a `next` não aceita argumento (é usada para iniciar o iterador). O V8 ignora o primeiro argumento; apenas argumentos do segundo `next` em diante são usados.

Aqui está um exemplo de alimentar valores em um Generator via `next`:

```javascript
function* dataConsumer() {
  console.log('Started');
  console.log(`1. ${yield}`);
  console.log(`2. ${yield}`);
  return 'result';
}

let genObj = dataConsumer();
genObj.next();
// Started
genObj.next('a')
// 1. a
genObj.next('b')
// 2. b
```

Para aceitar um valor na primeira chamada a `next`, envolva o Generator em outra função:

```javascript
function wrapper(generatorFunction) {
  return function (...args) {
    let generatorObject = generatorFunction(...args);
    generatorObject.next();
    return generatorObject;
  };
}

const wrapped = wrapper(function* () {
  console.log(`First input: ${yield}`);
  return 'DONE';
});

wrapped().next('hello!')
// First input: hello!
```

## Laço for...of

`for...of` pode iterar sobre o Iterator produzido por um Generator sem chamar `next` manualmente:

```javascript
function* foo() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
  return 6;
}

for (let v of foo()) {
  console.log(v);
}
// 1 2 3 4 5
```

Quando o `done` do objeto retornado é `true`, `for...of` para e não inclui esse valor. Portanto o `6` do `return` não é logado.

Exemplo de Fibonacci:

```javascript
function* fibonacci() {
  let [prev, curr] = [0, 1];
  for (;;) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

for (let n of fibonacci()) {
  if (n > 1000) break;
  console.log(n);
}
```

Você pode usar um Generator para tornar qualquer objeto iterável. Objetos comuns não têm iterador, então você pode adicionar um via Generator:

```javascript
function* objectEntries(obj) {
  let propKeys = Reflect.ownKeys(obj);

  for (let propKey of propKeys) {
    yield [propKey, obj[propKey]];
  }
}

let jane = { first: 'Jane', last: 'Doe' };

for (let [key, value] of objectEntries(jane)) {
  console.log(`${key}: ${value}`);
}
// first: Jane
// last: Doe
```

Alternativamente, atribua o Generator a `Symbol.iterator`:

```javascript
function* objectEntries() {
  let propKeys = Object.keys(this);

  for (let propKey of propKeys) {
    yield [propKey, this[propKey]];
  }
}

let jane = { first: 'Jane', last: 'Doe' };

jane[Symbol.iterator] = objectEntries;

for (let [key, value] of jane) {
  console.log(`${key}: ${value}`);
}
// first: Jane
// last: Doe
```

Spread, desestruturação e `Array.from` também usam a interface de iterador, então funcionam com Generators:

```javascript
function* numbers () {
  yield 1
  yield 2
  return 3
  yield 4
}

// operador spread
[...numbers()] // [1, 2]

// método Array.from
Array.from(numbers()) // [1, 2]

// atribuição por desestruturação
let [x, y] = numbers();
x // 1
y // 2

// loop for...of
for (let n of numbers()) {
  console.log(n)
}
// 1
// 2
```

## Generator.prototype.throw()

O iterador retornado por um Generator possui um método `throw` que lança um erro de fora, o qual pode ser capturado dentro do Generator:

```javascript
var g = function* () {
  try {
    yield;
  } catch (e) {
    console.log('captura interna', e);
  }
};

var i = g();
i.next();

try {
  i.throw('a');
  i.throw('b');
} catch (e) {
  console.log('captura externa', e);
}
// captura interna a
// captura externa b
```

Aqui, `i` lança dois erros. O primeiro é capturado pelo `catch` interno. O segundo não é, porque esse `catch` já foi executado, então ele se propaga para o `try/catch` externo.

`throw` pode receber um parâmetro passado ao bloco `catch`. Prefira passar uma instância de `Error`:

```javascript
var g = function* () {
  try {
    yield;
  } catch (e) {
    console.log(e);
  }
};

var i = g();
i.next();
i.throw(new Error('erro!'));
// Error: erro! (...)
```

Não confunda o `throw` do iterador com a instrução global `throw`. O acima usa o `throw` do iterador, que pode ser capturado dentro do Generator. O `throw` global só é capturado por `try/catch` externo:

```javascript
var g = function* () {
  while (true) {
    try {
      yield;
    } catch (e) {
      if (e != 'a') throw e;
      console.log('captura interna', e);
    }
  }
};

var i = g();
i.next();

try {
  throw new Error('a');
  throw new Error('b');
} catch (e) {
  console.log('captura externa', e);
}
// captura externa [Error: a]
```

Se o Generator não tiver `try/catch`, erros de `throw` são capturados pelo `try/catch` externo:

```javascript
var g = function* () {
  while (true) {
    yield;
    console.log('captura interna', e);
  }
};

var i = g();
i.next();

try {
  i.throw('a');
  i.throw('b');
} catch (e) {
  console.log('captura externa', e);
}
// captura externa a
```

Se não houver `try/catch` em lugar algum, o programa lança e encerra:

```javascript
var gen = function* gen(){
  yield console.log('hello');
  yield console.log('world');
}

var g = gen();
g.next();
g.throw();
// hello
// Uncaught undefined
```

Para que um erro seja capturado internamente, `next` deve ter sido chamado pelo menos uma vez:

```javascript
function* gen() {
  try {
    yield 1;
  } catch (e) {
    console.log('captura interna');
  }
}

var g = gen();
g.throw(1);
// Uncaught 1
```

Um `throw` capturado internamente se comporta como um `next`; a execução continua até o próximo `yield`:

```javascript
var gen = function* gen(){
  try {
    yield 1;
  } catch (e) {
    yield 2;
  }
  yield 3;
}

var g = gen();
g.next() // { value:1, done:false }
g.throw() // { value:2, done:false }
g.next() // { value:3, done:false }
g.next() // { value:undefined, done:true }
```

O `throw` global e o `g.throw` são independentes:

```javascript
var gen = function* gen(){
  yield console.log('hello');
  yield console.log('world');
}

var g = gen();
g.next();

try {
  throw new Error();
} catch (e) {
  g.next();
}
// hello
// world
```

Esse tratamento de erros interno/externo simplifica fluxos assíncronos: múltiplos `yield`s podem compartilhar um único `try/catch` em vez de repetir o tratamento de erros em cada callback.

Erros lançados internamente podem ser capturados externamente, e vice-versa:

```javascript
function* foo() {
  var x = yield 3;
  var y = x.toUpperCase();
  yield y;
}

var it = foo();

it.next(); // { value:3, done:false }

try {
  it.next(42);
} catch (err) {
  console.log(err);
}
```

Se um erro for lançado e não capturado, o Generator para. Chamadas posteriores a `next` retornam `{ value: undefined, done: true }`:

```javascript
function* g() {
  yield 1;
  console.log('throwing an exception');
  throw new Error('generator broke!');
  yield 2;
  yield 3;
}

function log(generator) {
  var v;
  console.log('starting generator');
  try {
    v = generator.next();
    console.log('primeira chamada next()', v);
  } catch (err) {
    console.log('capturar erro', v);
  }
  try {
    v = generator.next();
    console.log('segunda chamada next()', v);
  } catch (err) {
    console.log('capturar erro', v);
  }
  try {
    v = generator.next();
    console.log('terceira chamada next()', v);
  } catch (err) {
    console.log('capturar erro', v);
  }
  console.log('caller done');
}

log(g());
// starting generator
// primeira chamada next() { value: 1, done: false }
// throwing an exception
// capturar erro { value: 1, done: false }
// terceira chamada next() { value: undefined, done: true }
// caller done
```

## Generator.prototype.return()

O iterador possui um método `return()` que finaliza a iteração e retorna um valor dado:

```javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

var g = gen();

g.next()        // { value: 1, done: false }
g.return('foo') // { value: "foo", done: true }
g.next()        // { value: undefined, done: true }
```

Se `return()` for chamado sem argumento, o `value` retornado é `undefined`:

```javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

var g = gen();

g.next() // { value: 1, done: false }
g.return() // { value: undefined, done: true }
```

Se o Generator estiver dentro de um `try...finally`, `return()` executa o bloco `finally` primeiro e depois finaliza:

```javascript
function* numbers () {
  yield 1;
  try {
    yield 2;
    yield 3;
  } finally {
    yield 4;
    yield 5;
  }
  yield 6;
}
var g = numbers();
g.next() // { value: 1, done: false }
g.next() // { value: 2, done: false }
g.return(7) // { value: 4, done: false }
g.next() // { value: 5, done: false }
g.next() // { value: 7, done: true }
```

## Ponto Comum de next(), throw() e return()

`next()`, `throw()` e `return()` todos retomam o Generator e substituem a expressão `yield` por algo diferente:

- `next(value)` substitui `yield` por um valor:

```javascript
const g = function* (x, y) {
  let result = yield x + y;
  return result;
};

const gen = g(1, 2);
gen.next(); // Object {value: 3, done: false}

gen.next(1); // Object {value: 1, done: true}
// equivalente a let result = yield x + y
// substituir por let result = 1;
```

- `throw(err)` substitui `yield` por `throw err`.
- `return(value)` substitui `yield` por `return value`.

## Expressão yield*

Para chamar outro Generator de dentro de um Generator, é preciso iterá-lo manualmente:

```javascript
function* foo() {
  yield 'a';
  yield 'b';
}

function* bar() {
  yield 'x';
  // iterar foo() manualmente
  for (let i of foo()) {
    console.log(i);
  }
  yield 'y';
}

for (let v of bar()){
  console.log(v);
}
// x
// a
// b
// y
```

O ES6 fornece `yield*` para delegar a outro Generator:

```javascript
function* bar() {
  yield 'x';
  yield* foo();
  yield 'y';
}

// Equivalente a
function* bar() {
  yield 'x';
  yield 'a';
  yield 'b';
  yield 'y';
}

// Equivalente a
function* bar() {
  yield 'x';
  for (let v of foo()) {
    yield v;
  }
  yield 'y';
}

for (let v of bar()){
  console.log(v);
}
// "x"
// "a"
// "b"
// "y"
```

Comparação com e sem `yield*`:

```javascript
function* inner() {
  yield 'hello!';
}

function* outer1() {
  yield 'open';
  yield inner();
  yield 'close';
}

var gen = outer1()
gen.next().value // "open"
gen.next().value // retorna objeto iterador
gen.next().value // "close"

function* outer2() {
  yield 'open'
  yield* inner()
  yield 'close'
}

var gen = outer2()
gen.next().value // "open"
gen.next().value // "hello!"
gen.next().value // "close"
```

`yield` com um `*` indica delegação a outro iterador. Se `yield*` for seguido de um array, ele itera o array. Qualquer estrutura com interface de Iterator pode seguir `yield*`:

```javascript
function* gen(){
  yield* ["a", "b", "c"];
}

gen().next() // { value:"a", done:false }
```

Se o Generator delegado tiver um `return`, seu valor pode ser recebido:

```javascript
function* foo() {
  yield 2;
  yield 3;
  return "foo";
}

function* bar() {
  yield 1;
  var v = yield* foo();
  console.log("v: " + v);
  yield 4;
}
```

`yield*` é útil para achatar arrays aninhados:

```javascript
function* iterTree(tree) {
  if (Array.isArray(tree)) {
    for(let i=0; i < tree.length; i++) {
      yield* iterTree(tree[i]);
    }
  } else {
    yield tree;
  }
}
```

## Generator como Propriedade de Objeto

Forma abreviada de um método Generator:

```javascript
let obj = {
  * myGeneratorMethod() {
    ···
  }
};
```

Forma longa equivalente:

```javascript
let obj = {
  myGeneratorMethod: function* () {
    // ···
  }
};
```

## this em Funções Generator

Generators retornam iteradores. Segundo o ES6, esse iterador é uma instância do Generator e herda do `prototype`:

```javascript
function* g() {}

g.prototype.hello = function () {
  return 'hi!';
};

let obj = g();

obj instanceof g // true
obj.hello() // 'hi!'
```

Mas usar `g` como construtor normal não funciona: ele sempre retorna o iterador, não `this`:

```javascript
function* g() {
  this.a = 11;
}

let obj = g();
obj.next();
obj.a // undefined
```

Funções Generator não podem ser usadas com `new`:

```javascript
function* F() {
  yield this.x = 2;
  yield this.y = 3;
}

new F()
// TypeError: F is not a constructor
```

Solução alternativa: vincular um objeto com `call`:

```javascript
function* F() {
  this.a = 1;
  yield this.b = 2;
  yield this.c = 3;
}
var obj = {};
var f = F.call(obj);

f.next();  // Object {value: 2, done: false}
f.next();  // Object {value: 3, done: false}
f.next();  // Object {value: undefined, done: true}

obj.a // 1
obj.b // 2
obj.c // 3
```

Usar `F.prototype` em vez de `obj` permite que o iterador sirva como instância. Envolver em um construtor habilita o uso de `new`.

## Significado

### Generator e Máquinas de Estado

Generators são ideais para máquinas de estado. Um relógio que faz tic-tac sem Generator precisa de estado externo; com um Generator, o estado é interno e mais limpo.

### Generator e Corrotinas

Corrotinas são uma forma de executar tarefas de modo cooperativo. Podem ser mono ou multithread. Na forma mono-thread, são um tipo de sub-rotina com pontos de suspensão.

Funções Generator são a forma do ES6 de implementar corrotinas, mas apenas parcialmente ("semi-corrotinas"): apenas o chamador pode retomá-las.

### Generator e Contexto

Funções normais empilham e desempilham a pilha de chamadas. Generators podem pausar e manter seu contexto de execução; ao serem retomados com `next`, esse contexto é restaurado. Por isso variáveis locais e fluxo de controle são preservados entre os `yield`s.

## Aplicações

Generators pausam e produzem valores arbitrários, o que suporta vários casos de uso:

### (1) Código Assíncrono em Estilo Síncrono

Coloque trabalho assíncrono em `yield`; a lógica após `yield` roda quando `next` é chamado, evitando callbacks aninhados.

### (2) Fluxo de Controle

Código em Generator pode expressar fluxos de trabalho com múltiplos passos de forma linear, com `yield` marcando cada etapa. (Para fluxos realmente assíncronos, use o capítulo "Aplicação Assíncrona" ou async/await.)

### (3) Implementar Interface de Iterador

Use Generators para tornar qualquer objeto iterável implementando `Symbol.iterator` ou um auxiliar que produz entradas.

### (4) Estrutura de Dados

Generators podem atuar como sequências preguiçosas, produzindo valores sob demanda, semelhante a uma interface tipo array para expressões arbitrárias.
