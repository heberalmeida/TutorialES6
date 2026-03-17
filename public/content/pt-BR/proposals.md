# Propostas mais recentes

Este capítulo apresenta propostas que ainda não entraram no padrão, mas mostram forte potencial.

## Expressão do

Em sua essência, um escopo de bloco é uma declaração que agrupa várias operações e não retorna valor.

```javascript
{
  let t = f();
  t = t * t + 1;
}
```

No código acima, o escopo de bloco agrupa duas declarações. Mas fora do bloco não há como obter o valor de `t`, pois o bloco não retorna nada (a menos que `t` seja global).

Existe uma [proposta](https://github.com/tc39/proposal-do-expressions) que permite que um bloco se torne uma expressão prefixando-o com `do`, permitindo retornar um valor. Ele retorna o valor da última expressão executada dentro do bloco.

```javascript
let x = do {
  let t = f();
  t * t + 1;
};
```

Aqui, `x` recebe o valor retornado pelo bloco (ou seja, `t * t + 1`).

A ideia é simples: o bloco retorna o que encapsula.

```javascript
// Equivalente a <expressão>
do { <expressão>; }

// Equivalente a <declaração>
do { <declaração> }
```

Expressões `do` facilitam encapsular várias declarações e estruturar programas como blocos de construção.

```javascript
let x = do {
  if (foo()) { f() }
  else if (bar()) { g() }
  else { h() }
};
```

O bloco escolhe qual função chamar com base em `foo()` e atribui o resultado a `x`. Também fornece um escopo separado para que variáveis internas fiquem isoladas.

Expressões `do` funcionam bem em JSX:

```javascript
return (
  <nav>
    <Home />
    {
      do {
        if (loggedIn) {
          <LogoutButton />
        } else {
          <LoginButton />
        }
      }
    }
  </nav>
)
```

Sem `do`, seria necessário o operador ternário (`?:`). Com lógica mais complexa, isso rapidamente fica difícil de ler.

## Expressão throw

Em JavaScript, `throw` é uma declaração para lançar erros e não pode ser usada como expressão.

```javascript
// Erro
console.log(throw new Error());
```

Aqui, o argumento de `console.log` deve ser uma expressão; uma declaração `throw` é inválida.

Existe uma [proposta](https://github.com/tc39/proposal-throw-expressions) para permitir `throw` em expressões:

```javascript
// Valor padrão do parâmetro
function save(filename = throw new TypeError("Argument required")) {
}

// Retorno da arrow function
lint(ast, {
  with: () => throw new Error("avoid using 'with' statements.")
});

// Expressão condicional
function getEncoder(encoding) {
  const encoder = encoding === "utf8" ?
    new UTF8Encoder() :
    encoding === "utf16le" ?
      new UTF16Encoder(false) :
      encoding === "utf16be" ?
        new UTF16Encoder(true) :
        throw new Error("Unsupported encoding");
}

// Expressão lógica
class Product {
  get id() {
    return this._id;
  }
  set id(value) {
    this._id = value || throw new Error("Invalid value");
  }
}
```

Em cada caso, `throw` aparece dentro de uma expressão.

Sintaticamente, quando usada em expressão, `throw` é tratada como operador. Para evitar confusão com a declaração, `throw` no início da linha é sempre analisado como declaração, não como expressão.

## Aplicação parcial de funções

### Sintaxe

Às vezes é necessário vincular um ou mais parâmetros de uma função com vários parâmetros e retornar uma nova função.

```javascript
function add(x, y) { return x + y; }
function add7(x) { return x + 7; }
```

Aqui, `add7` é uma especialização de `add` com um parâmetro fixado em 7.

```javascript
// método bind
const add7 = add.bind(null, 7);

// Arrow function
const add7 = x => add(x, 7);
```

Ambas as abordagens são um pouco redundantes. `bind` é mais limitado: precisa fornecer `this` e os parâmetros só podem ser vinculados da esquerda para a direita.

Existe uma [proposta](https://github.com/tc39/proposal-partial-application) para aplicação parcial que simplifica isso:

```javascript
const add = (x, y) => x + y;
const addOne = add(1, ?);

const maxGreaterThanZero = Math.max(0, ...);
```

Nesta proposta, `?` é um placeholder para um parâmetro e `...` para vários parâmetros. Todas as formas abaixo são aplicações parciais válidas:

```javascript
f(x, ?)
f(x, ...)
f(?, x)
f(..., x)
f(?, x, ?)
f(..., x, ...)
```

`?` e `...` só podem aparecer em chamadas de função e retornam uma nova função.

```javascript
const g = f(?, 1, ...);
// Equivalente a
const g = (x, ...y) => f(x, 1, ...y);
```

A aplicação parcial também funciona com métodos de objeto:

```javascript
let obj = {
  f(x, y) { return x + y; },
};

const g = obj.f(?, 3);
g(1) // 4
```

### Observações

Há pontos importantes sobre aplicação parcial:

(1) A aplicação parcial está vinculada à função original. Se a função original mudar, a função parcialmente aplicada reflete isso imediatamente.

```javascript
let f = (x, y) => x + y;

const g = f(?, 3);
g(1); // 4

// Substituir função f
f = (x, y) => x * y;

g(1); // 3
```

(2) Se o valor pré-vinculado for uma expressão, ela é avaliada em cada chamada, não na definição.

```javascript
let a = 3;
const f = (x, y) => x + y;

const g = f(?, a);
g(1); // 4

// Alterar valor de a
a = 10;
g(1); // 11
```

(3) Se a nova função receber mais argumentos do que placeholders, os argumentos extras são ignorados.

```javascript
const f = (x, ...y) => [x, ...y];
const g = f(?, 1);
g(2, 3, 4); // [2, 1]
```

Para aceitar mais argumentos, adicione `...`:

```javascript
const f = (x, ...y) => [x, ...y];
const g = f(?, 1, ...);
g(2, 3, 4); // [2, 1, 3, 4];
```

(4) `...` é capturado apenas uma vez. Se uma aplicação parcial usar múltiplos `...`, cada um recebe o mesmo valor.

```javascript
const f = (...x) => x;
const g = f(..., 9, ...);
g(1, 2, 3); // [1, 2, 3, 9, 1, 2, 3]
```

## Operador pipeline

O Unix tem um pipeline que passa a saída de um comando como entrada do próximo. Esse padrão é comum em muitas linguagens. Existe uma [proposta](https://github.com/tc39/proposal-pipeline-operator) para adicionar um pipeline similar ao JavaScript.

O operador pipeline é escrito `|>`. O lado esquerdo é uma expressão e o lado direito é uma função. O operador passa o valor da esquerda para a função da direita e retorna o resultado.

```javascript
x |> f
// Equivalente a
f(x)
```

O principal benefício é transformar chamadas de função aninhadas em cadeias da esquerda para a direita:

```javascript
function doubleSay (str) {
  return str + ", " + str;
}

function capitalize (str) {
  return str[0].toUpperCase() + str.substring(1);
}

function exclaim (str) {
  return str + '!';
}
```

Estilo tradicional vs. pipeline:

```javascript
// Estilo tradicional
exclaim(capitalize(doubleSay('hello')))
// "Hello, hello!"

// Estilo pipeline
'hello'
  |> doubleSay
  |> capitalize
  |> exclaim
// "Hello, hello!"
```

O pipeline passa um único valor, então a função à direita deve receber um argumento. Para funções com vários argumentos, faça currying ou envolva-as.

```javascript
function double (x) { return x + x; }
function add (x, y) { return x + y; }

let person = { score: 25 };
person.score
  |> double
  |> (_ => add(7, _))
// 57
```

O sublinhado aqui é apenas um nome de placeholder.

O operador pipeline funciona com `await`:

```javascript
x |> await f
// Equivalente a
await f(x)

const userAge = userId |> await fetchUserById |> getAgeFromUser;
// Equivalente a
const userAge = getAgeFromUser(await fetchUserById(userId));
```

Pipelines são úteis para processamento de dados em várias etapas:

```javascript
const numbers = [10, 20, 30, 40, 50];

const processedNumbers = numbers
  |> (_ => _.map(n => n / 2)) // [5, 10, 15, 20, 25]
  |> (_ => _.filter(n => n > 10)); // [15, 20, 25]
```

## Math.signbit()

JavaScript representa números com ponto flutuante de 64 bits (IEEE 754). O IEEE 754 usa o primeiro bit como sinal: 0 para positivo, 1 para negativo. Assim existem dois zeros: `+0` (bit de sinal 0) e `-0` (bit de sinal 1). Diferenciá-los em código é complicado porque são considerados iguais:

```javascript
+0 === -0 // true
```

O `Math.sign()` do ES6 indica o sinal, mas não o bit de sinal: para `-0` retorna `-0`, que não indica diretamente o bit de sinal.

```javascript
Math.sign(-0) // -0
```

Existe uma [proposta](https://github.com/tc39/proposal-Math.signbit) para `Math.signbit()` verificar se o bit de sinal está definido:

```javascript
Math.signbit(2) //false
Math.signbit(-2) //true
Math.signbit(0) //false
Math.signbit(-0) //true
```

Isso indica corretamente que `-0` tem seu bit de sinal definido.

Comportamento:

- Se o argumento for `NaN`, retorna `false`
- Se o argumento for `-0`, retorna `true`
- Se o argumento for negativo, retorna `true`
- Caso contrário retorna `false`

## Operador dois dois pontos

Funções de seta podem vincular `this`, reduzindo a necessidade de `call()`, `apply()` e `bind()`. Mas não servem para todos os casos, então há uma [proposta](https://github.com/zenparsing/es-function-bind) para um operador de "ligação de função": dois dois pontos (`::`).

Com `foo::bar`, o lado esquerdo é um objeto e o direito é uma função. O operador vincula o objeto à esquerda como `this` da função à direita:

```javascript
foo::bar;
// Equivalente a
bar.bind(foo);

foo::bar(...arguments);
// Equivalente a
bar.apply(foo, arguments);

const hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(obj, key) {
  return obj::hasOwnProperty(key);
}
```

Se o lado esquerdo estiver vazio e o direito for um método de objeto, o método é vinculado a esse objeto:

```javascript
var method = obj::obj.foo;
// Equivalente a
var method = ::obj.foo;

let log = ::console.log;
// Equivalente a
var log = console.log.bind(console);
```

O resultado de `::` pode ser encadeado se ainda for um objeto:

```javascript
import { map, takeWhile, forEach } from "iterlib";

getPlayers()
::map(x => x.character())
::takeWhile(x => x.strength > 100)
::forEach(x => console.log(x));
```

## Realm API

A [Realm API](https://github.com/tc39/proposal-realms) fornece um sandbox para isolar código e impedir acesso ao objeto global.

Antes, `<iframe>` era frequentemente usado como sandbox:

```javascript
const globalOne = window;
let iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const globalTwo = iframe.contentWindow;
```

Aqui, o objeto global do iframe é separado. A Realm API pode substituir isso:

```javascript
const globalOne = window;
const globalTwo = new Realm().global;
```

`Realm()` é um construtor que cria um objeto Realm cuja propriedade `global` aponta para um novo objeto de nível superior semelhante ao original.

```javascript
const globalOne = window;
const globalTwo = new Realm().global;

globalOne.evaluate('1 + 2') // 3
globalTwo.evaluate('1 + 2') // 3
```

O método `evaluate()` do Realm executa código. O seguinte mostra que o objeto de nível superior do Realm é distinto do original:

```javascript
let a1 = globalOne.evaluate('[1,2,3]');
let a2 = globalTwo.evaluate('[1,2,3]');
a1.prototype === a2.prototype; // false
a1 instanceof globalTwo.Array; // false
a2 instanceof globalOne.Array; // false
```

Um sandbox Realm executa apenas APIs ECMAScript, não APIs do host:

```javascript
globalTwo.evaluate('console.log(1)')
// throw an error: console is undefined
```

Para corrigir isso, você pode atribuir objetos do host:

```javascript
globalTwo.console = globalOne.console;
```

`Realm()` pode aceitar um objeto de opções. Se `intrinsics` for `'inherit'`, o Realm herda intrínsecos do original:

```javascript
const r1 = new Realm();
r1.global === this;
r1.global.JSON === JSON; // false

const r2 = new Realm({ intrinsics: 'inherit' });
r2.global === this; // false
r2.global.JSON === JSON; // true
```

Você pode criar subclasses de `Realm` para personalizar o sandbox:

```javascript
class FakeWindow extends Realm {
  init() {
    super.init();
    let global = this.global;

    global.document = new FakeDocument(...);
    global.alert = new Proxy(fakeAlert, { ... });
    // ...
  }
}
```
