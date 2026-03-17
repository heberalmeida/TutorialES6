# Iterator e loop for...of

## Conceito de Iterator (iterador)

As estruturas de dados originais do JavaScript para representar "coleções" eram principalmente o array (`Array`) e o objeto (`Object`). O ES6 adicionou `Map` e `Set`. Isso nos dá quatro estruturas para coleções, e os usuários podem combiná-las para definir suas próprias estruturas — por exemplo, membros de array como `Map`, e membros de `Map` como objetos. Isso exige um mecanismo de interface unificado para lidar com todas as estruturas diferentes.

O Iterator (iterador) é esse mecanismo. É uma interface que fornece uma forma unificada de acessar diferentes estruturas. Qualquer estrutura que implemente a interface Iterator pode ser iterada (ou seja, processar todos os membros em sequência).

O Iterator serve a três propósitos: primeiro, fornecer uma interface de acesso unificada e simples para várias estruturas; segundo, permitir que os membros sejam ordenados de alguma forma; e terceiro, o ES6 criou o comando de iteração `for...of`, cujo principal consumidor é a interface Iterator.

O processo de iteração funciona assim:

(1) Cria um objeto de ponteiro que aponta para o início da estrutura atual. Ou seja, o iterador é essencialmente um objeto de ponteiro.

(2) A primeira chamada ao método `next` move o ponteiro para o primeiro membro.

(3) A segunda chamada move para o segundo membro.

(4) Chama-se `next` sucessivamente até chegar ao fim da estrutura.

Cada chamada a `next` retorna um objeto com informações sobre o membro atual: `value` e `done`. `value` é o valor atual; `done` indica se a iteração terminou.

Aqui está um exemplo que simula o retorno do método `next`:

```javascript
var it = makeIterator(['a', 'b']);

it.next() // { value: "a", done: false }
it.next() // { value: "b", done: false }
it.next() // { value: undefined, done: true }

function makeIterator(array) {
  var nextIndex = 0;
  return {
    next: function() {
      return nextIndex < array.length ?
        {value: array[nextIndex++], done: false} :
        {value: undefined, done: true};
    }
  };
}
```

O código acima define `makeIterator`, que retorna um iterador. Ao executar sobre `['a', 'b']`, retorna o iterador `it`.

O método `next` do ponteiro avança o ponteiro. Inicialmente ele aponta para o início do array. Cada chamada move para o próximo membro: primeiro `a`, depois `b`.

`next` retorna um objeto com `value` (membro atual) e `done` (booleano indicando se a iteração terminou).

Resumindo: chamar `next` percorre a estrutura passo a passo.

Para iteradores, `done: false` e `value: undefined` podem ser omitidos. Assim, `makeIterator` pode ser simplificada assim:

```javascript
function makeIterator(array) {
  var nextIndex = 0;
  return {
    next: function() {
      return nextIndex < array.length ?
        {value: array[nextIndex++]} :
        {done: true};
    }
  };
}
```

Como a interface Iterator é apenas uma camada sobre a estrutura, o iterador e a estrutura são separados. É possível criar iteradores sem estrutura subjacente, ou simular estruturas com iteradores. Exemplo de iterador infinito:

```javascript
var it = idMaker();

it.next().value // 0
it.next().value // 1
it.next().value // 2
// ...

function idMaker() {
  var index = 0;

  return {
    next: function() {
      return {value: index++, done: false};
    }
  };
}
```

A função geradora de iterador `idMaker` retorna um iterador sem estrutura correspondente — ou melhor, o iterador representa a própria estrutura.

Em TypeScript, a interface Iterable, o objeto Iterator e o retorno de `next` podem ser descritos como:

```javascript
interface Iterable {
  [Symbol.iterator]() : Iterator,
}

interface Iterator {
  next(value?: any) : IterationResult,
}

interface IterationResult {
  value: any,
  done: boolean,
}
```

## Interface Iterator padrão

O objetivo da interface Iterator é fornecer um mecanismo unificado de acesso para todas as estruturas — o loop `for...of` (veja abaixo). Ao usar `for...of`, o loop procura automaticamente a interface Iterator.

Uma estrutura é considerada "iterável" se implementar a interface Iterator.

O ES6 especifica que a interface Iterator padrão está na propriedade `Symbol.iterator`. Uma estrutura é iterável se tiver `Symbol.iterator`, que é uma função geradora de iterador. Executá-la retorna um iterador. O nome `Symbol.iterator` é uma expressão que retorna a propriedade `iterator` do `Symbol`, um valor especial de tipo Symbol, portanto deve estar entre colchetes (veja o capítulo "Symbol").

```javascript
const obj = {
  [Symbol.iterator] : function () {
    return {
      next: function () {
        return {
          value: 1,
          done: true
        };
      }
    };
  }
};
```

No código acima, `obj` é iterável por ter `Symbol.iterator`. Chamar essa propriedade retorna um iterador com método `next`, que retorna objetos com `value` e `done`.

Algumas estruturas do ES6 são iteráveis nativamente (ex.: arrays), podendo ser percorridas com `for...of` sem configuração extra. Outras, como objetos comuns, não. Estruturas que implementam `Symbol.iterator` têm a interface de iterador.

Estruturas que possuem a interface Iterator nativamente:

- Array
- Map
- Set
- String
- TypedArray
- Objeto `arguments`
- NodeList

Exemplo da propriedade `Symbol.iterator` de um array:

```javascript
let arr = ['a', 'b', 'c'];
let iter = arr[Symbol.iterator]();

iter.next() // { value: 'a', done: false }
iter.next() // { value: 'b', done: false }
iter.next() // { value: 'c', done: false }
iter.next() // { value: undefined, done: true }
```

`arr` é um array e tem a interface nativamente em `arr[Symbol.iterator]`. Chamar essa propriedade retorna o iterador.

Para estruturas que implementam o Iterator nativamente, não é preciso implementar você mesmo; `for...of` as percorre automaticamente. Para outras (principalmente objetos), é necessário implementar em `Symbol.iterator`.

Objetos não têm a interface Iterator padrão porque a ordem das propriedades não é garantida; o desenvolvedor precisa defini-la. Iteradores fazem processamento linear; em estruturas não lineares isso equivale a linearizar. Implementar iterador em objetos muitas vezes não é necessário, pois objetos passam a ser usados como Map, que o ES6 fornece nativamente.

Para um objeto ser iterável com `for...of`, ele deve implementar o gerador em `Symbol.iterator` (ou herdá-lo na cadeia de protótipos).

```javascript
class RangeIterator {
  constructor(start, stop) {
    this.value = start;
    this.stop = stop;
  }

  [Symbol.iterator]() { return this; }

  next() {
    var value = this.value;
    if (value < this.stop) {
      this.value++;
      return {done: false, value: value};
    }
    return {done: true, value: undefined};
  }
}

function range(start, stop) {
  return new RangeIterator(start, stop);
}

for (var value of range(0, 3)) {
  console.log(value); // 0, 1, 2
}
```

O código mostra como implementar a interface em uma classe. `Symbol.iterator` aponta para uma função que retorna o iterador.

Exemplo de implementação de "lista encadeada" com iterador:

```javascript
function Obj(value) {
  this.value = value;
  this.next = null;
}

Obj.prototype[Symbol.iterator] = function() {
  var iterator = { next: next };

  var current = this;

  function next() {
    if (current) {
      var value = current.value;
      current = current.next;
      return { done: false, value: value };
    }
    return { done: true };
  }
  return iterator;
}

var one = new Obj(1);
var two = new Obj(2);
var three = new Obj(3);

one.next = two;
two.next = three;

for (var i of one){
  console.log(i); // 1, 2, 3
}
```

`Symbol.iterator` está no protótipo do construtor. Chamá-lo retorna o iterador; cada chamada a `next` retorna um valor e avança o ponteiro interno.

Outro exemplo de adicionar a interface Iterator a um objeto:

```javascript
let obj = {
  data: [ 'hello', 'world' ],
  [Symbol.iterator]() {
    const self = this;
    let index = 0;
    return {
      next() {
        if (index < self.data.length) {
          return {
            value: self.data[index++],
            done: false
          };
        }
        return { value: undefined, done: true };
      }
    };
  }
};
```

Para objetos array-like (com chaves numéricas e `length`), há um atalho: fazer `Symbol.iterator` referenciar o Iterator do array:

```javascript
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
// Ou
NodeList.prototype[Symbol.iterator] = [][Symbol.iterator];

[...document.querySelectorAll('div')] // pode executar agora
```

NodeList já é array-like e tem interface de iteração. Atribuir o `Symbol.iterator` do array não altera o comportamento neste exemplo.

Outro exemplo de objeto array-like usando o `Symbol.iterator` do array:

```javascript
let iterable = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3,
  [Symbol.iterator]: Array.prototype[Symbol.iterator]
};
for (let item of iterable) {
  console.log(item); // 'a', 'b', 'c'
}
```

Observação: implementar o `Symbol.iterator` do array em um objeto comum não funciona:

```javascript
let iterable = {
  a: 'a',
  b: 'b',
  c: 'c',
  length: 3,
  [Symbol.iterator]: Array.prototype[Symbol.iterator]
};
for (let item of iterable) {
  console.log(item); // undefined, undefined, undefined
}
```

Se a função referenciada por `Symbol.iterator` não for um gerador de iterador (não retornar um iterador), o engine lança erro:

```javascript
var obj = {};

obj[Symbol.iterator] = () => 1;

[...obj] // TypeError: [] is not a function
```

`obj[Symbol.iterator]` não retorna um gerador de iterador, então o spread gera TypeError.

Com a interface implementada, a estrutura pode ser iterada com `for...of` (veja abaixo) ou com loop `while`:

```javascript
var $iterator = ITERABLE[Symbol.iterator]();
var $result = $iterator.next();
while (!$result.done) {
  var x = $result.value;
  // ...
  $result = $iterator.next();
}
```

`ITERABLE` é a estrutura iterável e `$iterator` é seu iterador. A cada chamada de `next`, o `result.done` é verificado; se a iteração não terminou, o iterador avança e o loop continua.

## Situações que chamam a interface Iterator

Algumas situações chamam a interface Iterator (método `Symbol.iterator`) por padrão. Além de `for...of`, há outras.

**(1)atribuição por desestruturação**

Na desestruturação de arrays e Set, o `Symbol.iterator` é chamado:

```javascript
let set = new Set().add('a').add('b').add('c');

let [x,y] = set;
// x='a'; y='b'

let [first, ...rest] = set;
// first='a'; rest=['b','c'];
```

**(2)operador spread**

O operador spread (`...`) também chama a interface Iterator:

```javascript
// Exemplo 1
var str = 'hello';
[...str] //  ['h','e','l','l','o']

// Exemplo 2
let arr = ['b', 'c'];
['a', ...arr, 'd']
// ['a', 'b', 'c', 'd']
```

O spread usa a interface Iterator internamente.

Na prática, isso permite converter qualquer estrutura iterável em array:

```javascript
let arr = [...iterable];
```

**(3)yield\***

`yield*` é seguido por uma estrutura iterável e chama sua interface Iterator:

```javascript
let generator = function* () {
  yield 1;
  yield* [2,3,4];
  yield 5;
};

var iterator = generator();

iterator.next() // { value: 1, done: false }
iterator.next() // { value: 2, done: false }
iterator.next() // { value: 3, done: false }
iterator.next() // { value: 4, done: false }
iterator.next() // { value: 5, done: false }
iterator.next() // { value: undefined, done: true }
```

**(4) Outros casos**

A iteração de arrays usa a interface Iterator, então qualquer API que aceita array acaba chamando o iterador. Exemplos:

- for...of
- Array.from()
- Map(), Set(), WeakMap(), WeakSet() (ex.: `new Map([['a',1],['b',2]])`)
- Promise.all()
- Promise.race()

## Interface Iterator de String

Strings são array-like e têm interface Iterator nativa:

```javascript
var someString = "hi";
typeof someString[Symbol.iterator]
// "function"

var iterator = someString[Symbol.iterator]();

iterator.next()  // { value: "h", done: false }
iterator.next()  // { value: "i", done: false }
iterator.next()  // { value: undefined, done: true }
```

Chamar `Symbol.iterator` retorna o iterador; `next` percorre os caracteres.

É possível sobrescrever o `Symbol.iterator` nativo para personalizar o comportamento:

```javascript
var str = new String("hi");

[...str] // ["h", "i"]

str[Symbol.iterator] = function() {
  return {
    next: function() {
      if (this._first) {
        this._first = false;
        return { value: "bye", done: false };
      } else {
        return { done: true };
      }
    },
    _first: true
  };
};

[...str] // ["bye"]
str // "hi"
```

`str` teve seu `Symbol.iterator` modificado, então o spread retorna `"bye"`; o valor da string continua `"hi"`.

## Interface Iterator e funções Generator

A forma mais simples de implementar `Symbol.iterator()` é com funções Generator (veja o próximo capítulo):

```javascript
let myIterable = {
  [Symbol.iterator]: function* () {
    yield 1;
    yield 2;
    yield 3;
  }
};
[...myIterable] // [1, 2, 3]

// Ou usar o estilo conciso abaixo

let obj = {
  * [Symbol.iterator]() {
    yield 'hello';
    yield 'world';
  }
};

for (let x of obj) {
  console.log(x);
}
// "hello"
// "world"
```

O método `Symbol.iterator()` quase não precisa de código — basta usar `yield` para o valor de cada etapa.

## return() e throw() em objetos iteradores

Além de `next()`, iteradores podem implementar `return()` e `throw()`. Em geradores manuais, `next()` é obrigatório; `return()` e `throw()` são opcionais.

`return()` é usado quando `for...of` sai antecipadamente (por exemplo, erro ou `break`). Se o objeto precisar de limpeza ou liberação de recursos antes do fim da iteração, implemente `return()`:

```javascript
function readLinesSync(file) {
  return {
    [Symbol.iterator]() {
      return {
        next() {
          return { done: false };
        },
        return() {
          file.close();
          return { done: true };
        }
      };
    },
  };
}
```

`readLinesSync` recebe um arquivo e retorna um iterador com `next()` e `return()`. Os dois casos abaixo acionam `return()`:

```javascript
// Caso 1
for (let line of readLinesSync(fileName)) {
  console.log(line);
  break;
}

// Caso 2
for (let line of readLinesSync(fileName)) {
  console.log(line);
  throw new Error();
}
```

No primeiro caso, após imprimir a primeira linha, `return()` fecha o arquivo. No segundo, `return()` fecha o arquivo antes do erro ser relançado.

`return()` deve retornar um objeto, conforme a especificação de Generator.

`throw()` é usado principalmente com funções Generator; iteradores comuns raramente precisam. Veja o capítulo "Funções Generator".

## Loop for...of

O ES6 introduz o loop `for...of`, inspirado em C++, Java, C# e Python, como forma unificada de iterar estruturas.

Qualquer estrutura que implemente `Symbol.iterator` é iterável e pode ser usada com `for...of`. Ou seja, `for...of` chama internamente o método `Symbol.iterator` da estrutura.

`for...of` funciona com arrays, Set, Map, objetos array-like (ex.: `arguments`, NodeList), objetos Generator e strings.

### Arrays

Arrays têm a interface nativamente. `for...of` usa essa interface:

```javascript
const arr = ['red', 'green', 'blue'];

for(let v of arr) {
  console.log(v); // red green blue
}

const obj = {};
obj[Symbol.iterator] = arr[Symbol.iterator].bind(arr);

for(let v of obj) {
  console.log(v); // red green blue
}
```

O objeto vazio `obj` recebeu o `Symbol.iterator` de `arr`; assim `for...of` sobre `obj` produz o mesmo resultado.

`for...of` pode substituir `forEach`:

```javascript
const arr = ['red', 'green', 'blue'];

arr.forEach(function (element, index) {
  console.log(element); // red green blue
  console.log(index);   // 0 1 2
});
```

O loop `for...in` tradicional retorna chaves, não valores. O `for...of` do ES6 permite iterar sobre valores:

```javascript
var arr = ['a', 'b', 'c', 'd'];

for (let a in arr) {
  console.log(a); // 0 1 2 3
}

for (let a of arr) {
  console.log(a); // a b c d
}
```

`for...in` retorna chaves; `for...of` retorna valores. Para índices com `for...of`, use `entries` ou `keys` (veja o capítulo de extensões de array).

`for...of` usa o iterador, que para arrays retorna apenas propriedades com índice numérico, diferente de `for...in`:

```javascript
let arr = [3, 5, 7];
arr.foo = 'hello';

for (let i in arr) {
  console.log(i); // "0", "1", "2", "foo"
}

for (let i of arr) {
  console.log(i); //  "3", "5", "7"
}
```

`for...of` não itera sobre a propriedade `foo` de `arr`.

### Set e Map

Set e Map também têm a interface nativamente e funcionam com `for...of`:

```javascript
var engines = new Set(["Gecko", "Trident", "Webkit", "Webkit"]);
for (var e of engines) {
  console.log(e);
}
// Gecko
// Trident
// Webkit

var es6 = new Map();
es6.set("edition", 6);
es6.set("committee", "TC39");
es6.set("standard", "ECMA-262");
for (var [name, value] of es6) {
  console.log(name + ": " + value);
}
// edition: 6
// committee: TC39
// standard: ECMA-262
```

A iteração segue a ordem de inserção; Set retorna valores únicos e Map retorna arrays [chave, valor]:

```javascript
let map = new Map().set('a', 1).set('b', 2);
for (let pair of map) {
  console.log(pair);
}
// ['a', 1]
// ['b', 2]

for (let [key, value] of map) {
  console.log(key + ' : ' + value);
}
// a : 1
// b : 2
```

### Estruturas de iteração calculadas

Algumas estruturas são derivadas de outras. Arrays, Set e Map no ES6 têm três métodos que retornam iteradores:

- `entries()`: itera sobre pares `[chave, valor]`. Em arrays, a chave é o índice; em Set, chave e valor são iguais. O iterador padrão de Map é `entries()`.
- `keys()`: itera sobre todas as chaves.
- `values()`: itera sobre todos os valores.

```javascript
let arr = ['a', 'b', 'c'];
for (let pair of arr.entries()) {
  console.log(pair);
}
// [0, 'a']
// [1, 'b']
// [2, 'c']
```

### Objetos array-like

Exemplos: string, NodeList, `arguments`:

```javascript
// string
let str = "hello";

for (let s of str) {
  console.log(s); // h e l l o
}

// objeto DOM NodeList
let paras = document.querySelectorAll("p");

for (let p of paras) {
  p.classList.add("test");
}

// objeto arguments
function printArgs() {
  for (let x of arguments) {
    console.log(x);
  }
}
printArgs('a', 'b');
// 'a'
// 'b'
```

Em strings, `for...of` trata corretamente caracteres UTF-16 de 32 bits:

```javascript
for (let x of 'a\uD83D\uDC0A') {
  console.log(x);
}
// 'a'
// '\uD83D\uDC0A'
```

Nem todos os objetos array-like têm interface de iterador. Uma alternativa é `Array.from`:

```javascript
let arrayLike = { length: 2, 0: 'a', 1: 'b' };

// Erro
for (let x of arrayLike) {
  console.log(x);
}

// Correto
for (let x of Array.from(arrayLike)) {
  console.log(x);
}
```

### Objetos

Objetos comuns não funcionam diretamente com `for...of` e geram erro. Precisam implementar a interface Iterator. Nesses casos, `for...in` ainda pode iterar sobre chaves:

```javascript
let es6 = {
  edition: 6,
  committee: "TC39",
  standard: "ECMA-262"
};

for (let e in es6) {
  console.log(e);
}
// edition
// committee
// standard

for (let e of es6) {
  console.log(e);
}
// TypeError: es6[Symbol.iterator] is not a function
```

Uma solução é usar `Object.keys` e iterar o array resultante:

```javascript
for (var key of Object.keys(someObject)) {
  console.log(key + ': ' + someObject[key]);
}
```

Outra opção é envolver o objeto com um Generator:

```javascript
const obj = { a: 1, b: 2, c: 3 }

function* entries(obj) {
  for (let key of Object.keys(obj)) {
    yield [key, obj[key]];
  }
}

for (let [key, value] of entries(obj)) {
  console.log(key, '->', value);
}
// a -> 1
// b -> 2
// c -> 3
```

### Comparação com outras sintaxes de iteração

Usando arrays como exemplo, o JavaScript oferece várias formas. A mais básica é o loop `for`:

```javascript
for (var index = 0; index < myArray.length; index++) {
  console.log(myArray[index]);
}
```

`forEach` é mais enxuto, mas não permite `break` nem `return` para sair.

`for...in` itera sobre chaves:

```javascript
for (var index in myArray) {
  console.log(myArray[index]);
}
```

`for...in` tem desvantagens: chaves numéricas viram strings; itera propriedades extras e da cadeia de protótipos; ordem não garantida. É mais adequado para objetos do que para arrays.

`for...of` melhora isso:

```javascript
for (let value of myArray) {
  console.log(value);
}
```

- Sintaxe simples, sem os problemas de `for...in`.
- Ao contrário de `forEach`, funciona com `break`, `continue` e `return`.
- Interface unificada para todas as estruturas iteráveis.

Exemplo com `break`:

```javascript
for (var n of fibonacci) {
  if (n > 1000)
    break;
  console.log(n);
}
```

## Métodos utilitários de Iterator

O ES2025 adiciona métodos utilitários aos iteradores retornados pela interface:

```javascript
const arr = ['a', '', 'b', '', 'c', '', 'd', '', 'e'];

arr.values() // creates an iterator
  .filter(x => x.length > 0)
  .drop(1)
  .take(3)
  .map(x => `=${x}=`)
  .toArray()
// ['=b=', '=c=', '=d=']
```

Métodos que retornam iterador:
- iterator.filter(filterFn)
- iterator.map(mapFn)
- iterator.flatMap(mapFn)

Métodos que retornam booleano:
- iterator.some(fn)
- iterator.every(fn)

Métodos que retornam outro valor:
- iterator.find(fn)
- iterator.reduce(reducer, initialValue?)

Método sem retorno:
- iterator.forEach(fn)

Métodos específicos de iteradores:
- iterator.drop(limit): ignora os primeiros `limit` itens.
- iterator.take(limit): retorna só os primeiros `limit` itens.
- iterator.toArray(): retorna array com todos os itens.
