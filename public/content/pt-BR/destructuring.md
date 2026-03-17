# Atribuição por Desestruturação

## Desestruturação de Arrays

### Uso Básico

O ES6 permite extrair valores de arrays e objetos e atribuí-los a variáveis com base em um padrão. Isso é chamado de desestruturação (Destructuring).

Antes, atribuir valores a variáveis exigia especificação direta.

```javascript
let a = 1;
let b = 2;
let c = 3;
```

O ES6 permite a seguinte sintaxe.

```javascript
let [a, b, c] = [1, 2, 3];
```

O código acima extrai valores do array e os atribui às variáveis por posição.

Em essência, isso é "correspondência de padrões": enquanto os padrões em ambos os lados do sinal de igual corresponderem, as variáveis à esquerda recebem os valores correspondentes. Abaixo estão exemplos usando arrays aninhados.

```javascript
let [foo, [[bar], baz]] = [1, [[2], 3]];
foo // 1
bar // 2
baz // 3

let [ , , third] = ["foo", "bar", "baz"];
third // "baz"

let [x, , y] = [1, 2, 3];
x // 1
y // 3

let [head, ...tail] = [1, 2, 3, 4];
head // 1
tail // [2, 3, 4]

let [x, y, ...z] = ['a'];
x // "a"
y // undefined
z // []
```

Se a desestruturação falhar, a variável recebe o valor `undefined`.

```javascript
let [foo] = [];
let [bar, foo] = [1];
```

Em ambos os casos acima, a desestruturação falha e `foo` fica igual a `undefined`.

Outro caso é a desestruturação parcial: o padrão à esquerda corresponde apenas a parte do array à direita. Nesse caso, a desestruturação ainda pode ter sucesso.

```javascript
let [x, y] = [1, 2, 3];
x // 1
y // 2

let [a, [b], d] = [1, [2, 3], 4];
a // 1
b // 2
d // 4
```

Os dois exemplos acima são desestruturação parcial, mas têm sucesso.

Se o lado direito não for um array (ou, mais precisamente, não for uma estrutura iterável; veja o capítulo sobre Iterator), um erro é lançado.

```javascript
// Erro
let [foo] = 1;
let [foo] = false;
let [foo] = NaN;
let [foo] = undefined;
let [foo] = null;
let [foo] = {};
```

As instruções acima lançam erro porque o valor à direita ou não possui interface Iterator após ser convertido em objeto (os primeiros cinco) ou não possui interface Iterator (o último).

A desestruturação de arrays também funciona com estruturas Set.

```javascript
let [x, y, z] = new Set(['a', 'b', 'c']);
x // "a"
```

Na verdade, qualquer estrutura de dados que implemente a interface Iterator pode usar desestruturação de array.

```javascript
function* fibs() {
  let a = 0;
  let b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

let [first, second, third, fourth, fifth, sixth] = fibs();
sixth // 5
```

No código acima, `fibs` é uma função Generator (veja o capítulo sobre Generator). Ela possui a interface Iterator nativamente. A atribuição por desestruturação lê valores sequencialmente dessa interface.

### Valores Padrão

A atribuição por desestruturação permite valores padrão.

```javascript
let [foo = true] = [];
foo // true

let [x, y = 'b'] = ['a']; // x='a', y='b'
let [x, y = 'b'] = ['a', undefined]; // x='a', y='b'
```

Nota: o ES6 usa o operador de igualdade estrita (`===`) para verificar se uma posição tem valor. Os valores padrão são usados apenas quando um elemento do array é estritamente igual a `undefined`.

```javascript
let [x = 1] = [undefined];
x // 1

let [x = 1] = [null];
x // null
```

No código acima, se um elemento do array for `null`, o valor padrão não é usado, pois `null` não é estritamente igual a `undefined`.

Se o valor padrão for uma expressão, ela é avaliada de forma preguiçosa — apenas quando for usada.

```javascript
function f() {
  console.log('aaa');
}

let [x = f()] = [1];
```

No código acima, como `x` tem valor, a função `f` nunca é chamada. O código é equivalente a:

```javascript
let x;
if ([1][0] === undefined) {
  x = f();
} else {
  x = [1][0];
}
```

Um valor padrão pode referenciar outras variáveis na desestruturação, mas essas variáveis devem já estar declaradas.

```javascript
let [x = 1, y = x] = [];     // x=1; y=1
let [x = 1, y = x] = [2];    // x=2; y=2
let [x = 1, y = x] = [1, 2]; // x=1; y=2
let [x = y, y = 1] = [];     // ReferenceError: y is not defined
```

A última expressão lança erro porque, quando `x` usa `y` como padrão, `y` ainda não foi declarado.

## Desestruturação de Objetos

### Introdução

A desestruturação funciona com objetos e com arrays.

```javascript
let { foo, bar } = { foo: 'aaa', bar: 'bbb' };
foo // "aaa"
bar // "bbb"
```

A desestruturação de objetos difere da de arrays em um ponto importante. Os elementos do array são ordenados, então os valores das variáveis dependem da posição. As propriedades do objeto não têm ordem, então as variáveis devem corresponder aos nomes das propriedades para obter os valores corretos.

```javascript
let { bar, foo } = { foo: 'aaa', bar: 'bbb' };
foo // "aaa"
bar // "bbb"

let { baz } = { foo: 'aaa', bar: 'bbb' };
baz // undefined
```

No primeiro exemplo, a ordem das variáveis à esquerda não corresponde à ordem das propriedades à direita, mas não afeta o resultado. No segundo exemplo, a variável não tem propriedade correspondente, então fica `undefined`.

Se a desestruturação falhar, a variável será `undefined`.

```javascript
let {foo} = {bar: 'baz'};
foo // undefined
```

Aqui, o objeto à direita não tem a propriedade `foo`, então `foo` fica `undefined`.

A desestruturação de objetos é conveniente para atribuir métodos de objetos existentes a variáveis.

```javascript
// Exemplo 1
let { log, sin, cos } = Math;

// Exemplo 2
const { log } = console;
log('hello') // hello
```

O Exemplo 1 atribui os métodos log, seno e cosseno de `Math` às variáveis. O Exemplo 2 atribui `console.log` a `log`.

Quando o nome da variável difere do nome da propriedade, use esta forma:

```javascript
let { foo: baz } = { foo: 'aaa', bar: 'bbb' };
baz // "aaa"

let obj = { first: 'hello', last: 'world' };
let { first: f, last: l } = obj;
f // 'hello'
l // 'world'
```

Isso mostra que a desestruturação de objetos é abreviação da seguinte forma (veja o capítulo sobre extensões de objetos).

```javascript
let { foo: foo, bar: bar } = { foo: 'aaa', bar: 'bbb' };
```

Ou seja, o mecanismo primeiro encontra o nome da propriedade correspondente, depois atribui à variável. A variável (à direita dos dois pontos) é o que recebe a atribuição, não o padrão (à esquerda).

```javascript
let { foo: baz } = { foo: 'aaa', bar: 'bbb' };
baz // "aaa"
foo // error: foo is not defined
```

Aqui, `foo` é o padrão correspondente e `baz` é a variável. Apenas `baz` é atribuída, não `foo`.

Como arrays, a desestruturação funciona com objetos aninhados.

```javascript
let obj = {
  p: [
    'Hello',
    { y: 'World' }
  ]
};

let { p: [x, { y }] } = obj;
x // "Hello"
y // "World"
```

Nota: aqui `p` é o padrão, não uma variável, então não é atribuído. Para atribuir `p` também, escreva:

```javascript
let obj = {
  p: [
    'Hello',
    { y: 'World' }
  ]
};

let { p, p: [x, { y }] } = obj;
x // "Hello"
y // "World"
p // ["Hello", {y: "World"}]
```

Outro exemplo:

```javascript
const node = {
  loc: {
    start: {
      line: 1,
      column: 5
    }
  }
};

let { loc, loc: { start }, loc: { start: { line }} } = node;
line // 1
loc  // Object {start: Object}
start // Object {line: 1, column: 5}
```

Há três atribuições por desestruturação aqui: para `loc`, `start` e `line`. Na última, apenas `line` é variável; `loc` e `start` são padrões.

Exemplo de atribuição aninhada:

```javascript
let obj = {};
let arr = [];

({ foo: obj.prop, bar: arr[0] } = { foo: 123, bar: true });

obj // {prop:123}
arr // [true]
```

Se o padrão de desestruturação for um objeto aninhado e a propriedade pai não existir, um erro é lançado.

```javascript
// Erro
let {foo: {bar}} = {baz: 'baz'};
```

Aqui a propriedade `foo` à esquerda espera um objeto aninhado. Desestruturar a propriedade `bar` desse objeto falha porque `foo` é `undefined`.

Nota: a desestruturação de objetos pode acessar propriedades herdadas.

```javascript
const obj1 = {};
const obj2 = { foo: 'bar' };
Object.setPrototypeOf(obj1, obj2);

const { foo } = obj1;
foo // "bar"
```

O protótipo de `obj1` é `obj2`. A propriedade `foo` não está em `obj1` em si, mas herdada de `obj2`; a desestruturação ainda a extrai.

### Valores Padrão

A desestruturação de objetos suporta valores padrão.

```javascript
var {x = 3} = {};
x // 3

var {x, y = 5} = {x: 1};
x // 1
y // 5

var {x: y = 3} = {};
y // 3

var {x: y = 3} = {x: 5};
y // 5

var { message: msg = 'Something went wrong' } = {};
msg // "Something went wrong"
```

Os valores padrão se aplicam quando o valor da propriedade é estritamente igual a `undefined`.

```javascript
var {x = 3} = {x: undefined};
x // 3

var {x = 3} = {x: null};
x // null
```

No último caso, `x` é `null`, e como `null !== undefined`, o padrão `3` não é usado.

### Cuidados

(1) Ao usar uma variável já declarada na desestruturação, tenha cuidado.

```javascript
// Errado
let x;
{x} = {x: 1};
// SyntaxError: syntax error
```

Isso falha porque o engine interpreta `{x}` como um bloco. Evite colocar a chave de abertura no início da linha para que não seja parseada como bloco.

```javascript
// Correto
let x;
({x} = {x: 1});
```

Colocar toda a atribuição entre parênteses faz o parse correto. Veja abaixo sobre parênteses e desestruturação.

(2) Os padrões de desestruturação podem omitir nomes de variáveis, então atribuições com aparência estranha são possíveis.

```javascript
({} = [true, false]);
({} = 'abc');
({} = []);
```

São válidas, mas não têm efeito prático.

(3) Como arrays são objetos, você pode desestruturar índices de array como propriedades de objeto.

```javascript
let arr = [1, 2, 3];
let {0 : first, [arr.length - 1] : last} = arr;
first // 1
last // 3
```

Aqui o array é desestruturado por índice. O índice `0` dá `1`, e `[arr.length - 1]` é o índice `2`, dando `3`. A notação de colchetes é uma "expressão de nome de atributo" (veja o capítulo sobre extensões de objetos).

## Desestruturação de Strings

Strings também podem ser desestruturadas, pois são convertidas em objetos semelhantes a arrays.

```javascript
const [a, b, c, d, e] = 'hello';
a // "h"
b // "e"
c // "l"
d // "l"
e // "o"
```

Objetos semelhantes a arrays têm uma propriedade `length`, que também pode ser desestruturada.

```javascript
let {length : len} = 'hello';
len // 5
```

## Desestruturação de Números e Booleanos

Quando o lado direito é um número ou booleano, ele é convertido em objeto primeiro.

```javascript
let {toString: s} = 123;
s === Number.prototype.toString // true

let {toString: s} = true;
s === Boolean.prototype.toString // true
```

Números e booleanos têm objetos wrapper com `toString`, então `s` é atribuído corretamente.

A regra é: se o lado direito não for objeto ou array, ele é convertido em objeto. `undefined` e `null` não podem ser convertidos, então desestruturá-los lança erro.

```javascript
let { prop: x } = undefined; // TypeError
let { prop: y } = null; // TypeError
```

## Desestruturação de Parâmetros de Função

Os parâmetros de função podem usar desestruturação.

```javascript
function add([x, y]){
  return x + y;
}

add([1, 2]); // 3
```

O parâmetro de `add` parece um array, mas quando é passado, é desestruturado em `x` e `y`. Dentro da função, os parâmetros efetivos são `x` e `y`.

Outro exemplo:

```javascript
[[1, 2], [3, 4]].map(([a, b]) => a + b);
// [ 3, 7 ]
```

A desestruturação de parâmetros de função suporta valores padrão.

```javascript
function move({x = 0, y = 0} = {}) {
  return [x, y];
}

move({x: 3, y: 8}); // [3, 8]
move({x: 3}); // [3, 0]
move({}); // [0, 0]
move(); // [0, 0]
```

`move` recebe um objeto e o desestrutura para `x` e `y`. Se a desestruturação falhar, eles usam os valores padrão.

A seguinte variante produz resultados diferentes:

```javascript
function move({x, y} = { x: 0, y: 0 }) {
  return [x, y];
}

move({x: 3, y: 8}); // [3, 8]
move({x: 3}); // [3, undefined]
move({}); // [undefined, undefined]
move(); // [0, 0]
```

Aqui o padrão está no parâmetro da função, não em `x` e `y`, então o comportamento muda.

`undefined` dispara o valor padrão do parâmetro da função.

```javascript
[1, undefined, 3].map((x = 'yes') => x);
// [ 1, 'yes', 3 ]
```

## Parênteses

A desestruturação é conveniente, mas não trivial de parsear. O compilador não pode saber desde o início se um token é um padrão ou uma expressão; pode precisar ver o sinal de igual. Por isso, o ES6 proíbe parênteses em qualquer lugar onde possam introduzir ambiguidade. Na prática, é melhor evitar parênteses em padrões quando possível.

### Casos em que Parênteses Não São Permitidos

(1) Declarações de variáveis

```javascript
// Todos dão erro
let [(a)] = [1];

let {x: (c)} = {};
let ({x: c}) = {};
let {(x: c)} = {};
let {(x): c} = {};

let { o: ({ p: p }) } = { o: { p: 2 } };
```

Todos falham porque são declarações de variáveis e o padrão não pode usar parênteses.

(2) Parâmetros de função

Parâmetros também são declarações, então não podem usar parênteses.

```javascript
// Erro
function f([(z)]) { return z; }
// Erro
function f([z,(x)]) { return x; }
```

(3) Parte padrão da atribuição

```javascript
// Todos dão erro
({ p: a }) = { p: 42 };
([a]) = [5];
```

Colocar todo o padrão entre parênteses causa erro.

```javascript
// Erro
[({ p: a }), { x: c }] = [{}, {}];
```

Colocar parte do padrão entre parênteses também causa erro.

### Casos em que Parênteses São Permitidos

Parênteses são permitidos apenas na parte não-padrão de uma atribuição:

```javascript
[(b)] = [3]; // Correto
({ p: (d) } = {}); // Correto
[(parseInt.prop)] = [3]; // Correto
```

Todos são válidos. São atribuições, não declarações, e os parênteses não fazem parte do padrão. Na primeira linha, o padrão é o primeiro elemento do array; na segunda, o padrão é `p`, não `d`; a terceira é similar à primeira.

## Casos de Uso

A desestruturação é amplamente útil.

**(1) Trocar variáveis**

```javascript
let x = 1;
let y = 2;

[x, y] = [y, x];
```

Isso troca `x` e `y` de forma clara e legível.

**(2) Retornar múltiplos valores**

Funções só podem retornar um valor. Para retornar vários, coloque-os em um array ou objeto. A desestruturação facilita extraí-los.

```javascript
// Retornar um array

function example() {
  return [1, 2, 3];
}
let [a, b, c] = example();

// Retornar um objeto

function example() {
  return {
    foo: 1,
    bar: 2
  };
}
let { foo, bar } = example();
```

**(3) Mapeamento de parâmetros de função**

A desestruturação mapeia um conjunto de parâmetros para variáveis nomeadas.

```javascript
// Parâmetros ordenados
function f([x, y, z]) { ... }
f([1, 2, 3]);

// Parâmetros não ordenados
function f({x, y, z}) { ... }
f({z: 3, y: 2, x: 1});
```

**(4) Extrair dados JSON**

A desestruturação é útil para extrair valores de objetos JSON.

```javascript
let jsonData = {
  id: 42,
  status: "OK",
  data: [867, 5309]
};

let { id, status, data: number } = jsonData;

console.log(id, status, number);
// 42, "OK", [867, 5309]
```

**(5) Valores padrão de parâmetros**

```javascript
jQuery.ajax = function (url, {
  async = true,
  beforeSend = function () {},
  cache = true,
  complete = function () {},
  crossDomain = false,
  global = true,
  // ... mais config
} = {}) {
  // ... fazer algo
};
```

Isso evita escrever `var foo = config.foo || 'default foo';` dentro do corpo da função.

**(6) Iterar sobre Map**

Qualquer objeto com Iterator pode ser usado com `for...of`. Map possui Iterator, então a desestruturação facilita obter chaves e valores.

```javascript
const map = new Map();
map.set('first', 'hello');
map.set('second', 'world');

for (let [key, value] of map) {
  console.log(key + " is " + value);
}
// first is hello
// second is world
```

Para obter apenas chaves ou apenas valores:

```javascript
// Apenas chaves
for (let [key] of map) {
  // ...
}

// Apenas valores
for (let [,value] of map) {
  // ...
}
```

**(7) Importar métodos de módulos**

Ao carregar módulos, muitas vezes é preciso escolher quais exportações usar. A desestruturação mantém as instruções de importação claras.

```javascript
const { SourceMapConsumer, SourceNode } = require("source-map");
```
