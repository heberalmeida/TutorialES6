# Extensões de Arrays

## Operador Spread

### Significado

O operador spread são três pontos (`...`). É o inverso dos parâmetros rest: transforma um array em uma sequência de argumentos separados por vírgula.

```javascript
console.log(...[1, 2, 3])
// 1 2 3

console.log(1, ...[2, 3, 4], 5)
// 1 2 3 4 5

[...document.querySelectorAll('div')]
// [<div>, <div>, <div>]
```

Esse operador é usado principalmente em chamadas de função.

```javascript
function push(array, ...items) {
  array.push(...items);
}

function add(x, y) {
  return x + y;
}

const numbers = [4, 38];
add(...numbers) // 42
```

Aqui tanto `array.push(...items)` quanto `add(...numbers)` usam o operador spread para transformar um array em sequência de argumentos.

O operador spread pode ser combinado com argumentos normais:

```javascript
function f(v, w, x, y, z) { }
const args = [0, 1];
f(-1, ...args, 2, ...[3]);
```

Uma expressão pode seguir o operador spread:

```javascript
const arr = [
  ...(x > 0 ? ['a'] : []),
  'b',
];
```

Se o spread for seguido de um array vazio, não tem efeito:

```javascript
[...[], 1]
// [1]
```

Em chamadas de função, o spread pode aparecer dentro de parênteses; fora disso causa erro de sintaxe.

### Substituindo apply()

Como o spread expande arrays, não é mais necessário `apply()` para passar um array como argumentos:

```javascript
// ES5
function f(x, y, z) {
  // ...
}
var args = [0, 1, 2];
f.apply(null, args);

// ES6
function f(x, y, z) {
  // ...
}
let args = [0, 1, 2];
f(...args);
```

Exemplo com `Math.max()`:

```javascript
// ES5
Math.max.apply(null, [14, 3, 77])

// ES6
Math.max(...[14, 3, 77])

// Equivalente a
Math.max(14, 3, 77);
```

Outro exemplo—acrescentar um array a outro:

```javascript
// ES5
var arr1 = [0, 1, 2];
var arr2 = [3, 4, 5];
Array.prototype.push.apply(arr1, arr2);

// ES6
let arr1 = [0, 1, 2];
let arr2 = [3, 4, 5];
arr1.push(...arr2);
```

Uso com construtores:

```javascript
// ES5
new (Date.bind.apply(Date, [null, 2015, 1, 1]))

// ES6
new Date(...[2015, 1, 1]);
```

### Usos do Operador Spread

**(1)Copiando arrays**

Arrays são referências; atribuir copia a referência, não os dados. Use spread para cópia rasa:

```javascript
const a1 = [1, 2];
// Opção 1
const a2 = [...a1];
// Opção 2
const [...a2] = a1;
```

**(2)Mesclando arrays**

```javascript
const arr1 = ['a', 'b'];
const arr2 = ['c'];
const arr3 = ['d', 'e'];

// ES5
arr1.concat(arr2, arr3);
// [ 'a', 'b', 'c', 'd', 'e' ]

// ES6
[...arr1, ...arr2, ...arr3]
// [ 'a', 'b', 'c', 'd', 'e' ]
```

Ambos são cópias rasas; objetos/arrays aninhados são compartilhados.

**(3)Com desestruturação**

```javascript
// ES5
a = list[0], rest = list.slice(1)

// ES6
[a, ...rest] = list
```

O spread em desestruturação precisa ser o último elemento.

**(4)Strings**

O spread converte strings em arrays:

```javascript
[...'hello']
// [ "h", "e", "l", "l", "o" ]
```

Isso trata corretamente caracteres Unicode com múltiplas unidades de código:

```javascript
'x\uD83D\uDE80y'.length // 4
[...'x\uD83D\uDE80y'].length // 3
```

**(5)Objetos com Iterator**

Qualquer objeto que implemente a interface Iterator pode ser expandido em um array:

```javascript
let nodeList = document.querySelectorAll('div');
let array = [...nodeList];
```

**(6)Map, Set e Generator**

Chaves de Map, Set e resultados de Generator podem ser expandidos:

```javascript
let map = new Map([
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
]);
let arr = [...map.keys()]; // [1, 2, 3]

const go = function*(){
  yield 1;
  yield 2;
  yield 3;
};
[...go()] // [1, 2, 3]
```

## Array.from()

`Array.from()` converte dois tipos de valores em arrays: objetos array-like e iteráveis (incluindo Set e Map).

```javascript
let arrayLike = {
    '0': 'a',
    '1': 'b',
    '2': 'c',
    length: 3
};

// ES5
var arr1 = [].slice.call(arrayLike); // ['a', 'b', 'c']

// ES6
let arr2 = Array.from(arrayLike); // ['a', 'b', 'c']
```

Usos comuns: NodeList e `arguments`. Aceita uma segunda função semelhante ao `map`:

```javascript
Array.from(arrayLike, x => x * x);
// Equivalente a
Array.from(arrayLike).map(x => x * x);

Array.from([1, 2, 3], (x) => x * x)
// [1, 4, 9]
```

## Array.of()

`Array.of()` cria um array a partir dos valores passados:

```javascript
Array.of(3, 11, 8) // [3,11,8]
Array.of(3) // [3]
Array.of(3).length // 1
```

Diferente de `Array(n)`, que cria um array esparso de comprimento `n`, `Array.of` sempre retorna um array com os argumentos.

## Métodos de Instância: copyWithin()

`copyWithin(target, start = 0, end = this.length)` copia elementos dentro do array e retorna o array modificado:

```javascript
[1, 2, 3, 4, 5].copyWithin(0, 3)
// [4, 5, 3, 4, 5]
```

## Métodos de Instância: find(), findIndex(), findLast(), findLastIndex()

`find()` retorna o primeiro elemento que satisfaz o callback; `findIndex()` retorna o índice. Ambos aceitam um segundo argumento para `this` no callback. O [ES2022](https://github.com/tc39/proposal-array-find-from-last) adiciona `findLast()` e `findLastIndex()` para buscar a partir do fim:

```javascript
[1, 4, -5, 10].find((n) => n < 0)
// -5

const array = [
  { value: 1 },
  { value: 2 },
  { value: 3 },
  { value: 4 }
];
array.findLast(n => n.value % 2 === 1); // { value: 3 }
array.findLastIndex(n => n.value % 2 === 1); // 2
```

## Métodos de Instância: fill()

`fill(value, start?, end?)` preenche o array (ou um trecho) com um valor:

```javascript
['a', 'b', 'c'].fill(7)
// [7, 7, 7]

['a', 'b', 'c'].fill(7, 1, 2)
// ['a', 7, 'c']
```

## Métodos de Instância: entries(), keys(), values()

Retornam iteradores para chaves, valores ou pares chave-valor:

```javascript
for (let [index, elem] of ['a', 'b'].entries()) {
  console.log(index, elem);
}
// 0 "a"
// 1 "b"
```

## Métodos de Instância: includes()

`includes(value, fromIndex?)` retorna se o array contém o valor. Diferente de `indexOf`, trata `NaN` corretamente:

```javascript
[1, 2, 3].includes(2)     // true
[1, 2, NaN].includes(NaN) // true
```

## Métodos de Instância: flat(), flatMap()

`flat(depth = 1)` achata arrays aninhados; `flatMap()` mapeia e achata um nível:

```javascript
[1, 2, [3, 4]].flat()
// [1, 2, 3, 4]

[1, 2, [3, [4, 5]]].flat(2)
// [1, 2, 3, 4, 5]

[2, 3, 4].flatMap((x) => [x, x * 2])
// [2, 4, 3, 6, 4, 8]
```

## Métodos de Instância: at()

O [ES2022](https://github.com/tc39/proposal-relative-indexing-method/) adiciona `at(index)`, que aceita índices negativos:

```javascript
const arr = [5, 12, 8, 130, 44];
arr.at(2)  // 8
arr.at(-2) // 130
```

## Métodos de Instância: toReversed(), toSorted(), toSpliced(), with()

O [ES2023](https://github.com/tc39/proposal-change-array-by-copy) adiciona versões imutáveis de `reverse()`, `sort()`, `splice()` e atribuição por índice:

```javascript
const sequence = [1, 2, 3];
sequence.toReversed() // [3, 2, 1]
sequence // [1, 2, 3]

correctionNeeded.with(1, 2) // [1, 2, 3]
```

## Métodos de Instância: group(), groupToMap()

Uma [proposta](https://github.com/tc39/proposal-array-grouping) adiciona `group()` e `groupToMap()` para agrupar elementos:

```javascript
const array = [1, 2, 3, 4, 5];
array.group((num) => num % 2 === 0 ? 'even' : 'odd');
// { odd: [1, 3, 5], even: [2, 4] }
```

## Espaços Vazios em Arrays

O comportamento de slots vazios varia entre métodos. Prefira evitá-los.

## Estabilidade de Array.prototype.sort()

O [ES2019](https://github.com/tc39/ecma262/pull/1340) exige que `Array.prototype.sort()` seja estável. Os principais engines já usam ordenação estável.
