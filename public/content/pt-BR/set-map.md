# Estruturas de Dados Set e Map

## Set

### Uso Básico

O ES6 fornece uma nova estrutura de dados chamada Set. É semelhante a um array, mas os valores dos membros são todos únicos—não há valores duplicados.

`Set` em si é uma função construtora usada para gerar estruturas de dados Set.

```javascript
const s = new Set();

[2, 3, 5, 4, 5, 2, 2].forEach(x => s.add(x));

for (let i of s) {
  console.log(i);
}
// 2 3 5 4
```

O código acima adiciona membros à estrutura Set através do método `add()`. O resultado mostra que a estrutura Set não adiciona valores duplicados.

A função `Set()` pode aceitar um array (ou outras estruturas de dados com interface iterável) como argumento para inicialização.

```javascript
// Exemplo 1
const set = new Set([1, 2, 3, 4, 4]);
[...set]
// [1, 2, 3, 4]

// Exemplo 2
const items = new Set([1, 2, 3, 4, 5, 5, 5, 5]);
items.size // 5

// Exemplo 3
const set = new Set(document.querySelectorAll('div'));
set.size // 56

// Similar a
const set = new Set();
document
 .querySelectorAll('div')
 .forEach(div => set.add(div));
set.size // 56
```

No código acima, os exemplos 1 e 2 passam arrays para a função `Set`. O exemplo 3 passa um objeto semelhante a array.

O código acima também demonstra uma forma de remover membros duplicados de um array.

```javascript
// Remover elementos duplicados do array
[...new Set(array)]
```

Este método também pode ser usado para remover caracteres duplicados de uma string.

```javascript
[...new Set('ababbc')].join('')
// "abc"
```

Ao adicionar valores a um Set, não ocorre conversão de tipo. Assim, `5` e `"5"` são dois valores diferentes. O algoritmo usado internamente pelo Set para determinar se dois valores são diferentes é chamado "Same-value-zero equality". É semelhante ao operador de igualdade estrita (`===`), com a principal diferença sendo que ao adicionar valores a um Set, `NaN` é considerado igual a si mesmo, enquanto o operador de igualdade estrita considera `NaN` diferente de si mesmo.

```javascript
let set = new Set();
let a = NaN;
let b = NaN;
set.add(a);
set.add(b);
set // Set {NaN}
```

O código acima adiciona `NaN` à instância Set duas vezes, mas apenas um é armazenado. Isso mostra que internamente, dois valores `NaN` são considerados iguais em um Set.

Além disso, dois objetos são sempre considerados diferentes.

```javascript
let set = new Set();

set.add({});
set.size // 1

set.add({});
set.size // 2
```

O código acima mostra que, como dois objetos vazios não são iguais, eles são tratados como dois valores distintos.

O método `Array.from()` pode converter uma estrutura Set em array.

```javascript
const items = new Set([1, 2, 3, 4, 5]);
const array = Array.from(items);
```

Isso fornece outra forma de remover membros duplicados de um array.

```javascript
function dedupe(array) {
  return Array.from(new Set(array));
}

dedupe([1, 1, 2, 3]) // [1, 2, 3]
```

### Propriedades e Métodos de Instância do Set

As instâncias de estrutura Set têm as seguintes propriedades:

- `Set.prototype.constructor`: A função construtora, que por padrão é a função `Set`.
- `Set.prototype.size`: Retorna o número total de membros na instância `Set`.

Os métodos de instância do Set se dividem em duas categorias: métodos de manipulação (para operar nos dados) e métodos de iteração (para iterar sobre membros). Abaixo estão os quatro métodos de manipulação.

- `Set.prototype.add(value)`: Adiciona um valor e retorna a estrutura Set em si.
- `Set.prototype.delete(value)`: Remove um valor e retorna um booleano indicando se a remoção teve sucesso.
- `Set.prototype.has(value)`: Retorna um booleano indicando se o valor é membro do `Set`.
- `Set.prototype.clear()`: Limpa todos os membros. Sem valor de retorno.

Exemplos das propriedades e métodos acima:

```javascript
s.add(1).add(2).add(2);
// Nota: 2 foi adicionado duas vezes

s.size // 2

s.has(1) // true
s.has(2) // true
s.has(3) // false

s.delete(2) // true
s.has(2) // false
```

A seguir, uma comparação de como as estruturas `Object` e `Set` verificam a presença de uma chave:

```javascript
// Estilo objeto
const properties = {
  'width': 1,
  'height': 1
};

if (properties[someName]) {
  // do something
}

// Estilo Set
const properties = new Set();

properties.add('width');
properties.add('height');

if (properties.has(someName)) {
  // do something
}
```

### Operações de Iteração

As instâncias de estrutura Set têm quatro métodos de iteração para iterar sobre os membros:

- `Set.prototype.keys()`: Retorna um iterador para chaves
- `Set.prototype.values()`: Retorna um iterador para valores
- `Set.prototype.entries()`: Retorna um iterador para pares chave-valor
- `Set.prototype.forEach()`: Itera sobre cada membro usando uma função de retorno

Vale notar que a ordem de iteração de um `Set` é a ordem de inserção. Esta característica às vezes é muito útil, por exemplo ao usar Set para armazenar uma lista de funções de retorno—a chamada seguirá a ordem em que foram adicionadas.

**(1)`keys()`,`values()`,`entries()`**

Os métodos `keys`, `values` e `entries` retornam objetos iteradores (veja o capítulo "Iterator"). Como a estrutura Set não tem chaves, apenas valores (ou seja, chaves e valores são iguais), os métodos `keys` e `values` se comportam identicamente.

```javascript
let set = new Set(['red', 'green', 'blue']);

for (let item of set.keys()) {
  console.log(item);
}
// red
// green
// blue

for (let item of set.values()) {
  console.log(item);
}
// red
// green
// blue

for (let item of set.entries()) {
  console.log(item);
}
// ["red", "red"]
// ["green", "green"]
// ["blue", "blue"]
```

No código acima, o iterador retornado pelo método `entries` inclui tanto chaves quanto valores, então cada iteração produz um array com dois membros idênticos.

As instâncias de estrutura Set são iteráveis por padrão; o gerador de iterador padrão é o método `values`.

```javascript
Set.prototype[Symbol.iterator] === Set.prototype.values
// true
```

Isso significa que você pode omitir o método `values` e iterar diretamente sobre um Set com um loop `for...of`.

```javascript
let set = new Set(['red', 'green', 'blue']);

for (let x of set) {
  console.log(x);
}
// red
// green
// blue
```

**(2)`forEach()`**

As instâncias de estrutura Set têm um método `forEach` como os arrays, usado para executar uma operação em cada membro. Não retorna valor.

```javascript
let set = new Set([1, 4, 9]);
set.forEach((value, key) => console.log(key + ' : ' + value))
// 1 : 1
// 4 : 4
// 9 : 9
```

O código acima mostra que o método `forEach` recebe uma função manipuladora. Os parâmetros dessa função correspondem aos do `forEach` de array: valor, chave e a coleção em si (o terceiro parâmetro foi omitido no exemplo). Note que no Set, a chave e o valor são iguais, então o primeiro e o segundo parâmetros sempre têm o mesmo valor.

Além disso, o método `forEach` pode receber um segundo parâmetro para vincular como o objeto `this` da função manipuladora.

**(3)Aplicações de Iteração**

O operador spread (`...`) usa internamente um loop `for...of`, então também pode ser usado com estruturas Set.

```javascript
let set = new Set(['red', 'green', 'blue']);
let arr = [...set];
// ['red', 'green', 'blue']
```

Combinando o operador spread com a estrutura Set remove membros duplicados do array.

```javascript
let arr = [3, 5, 2, 2, 5, 5];
let unique = [...new Set(arr)];
// [3, 5, 2]
```

Além disso, os métodos `map` e `filter` de array podem ser usados indiretamente em Set.

```javascript
let set = new Set([1, 2, 3]);
set = new Set([...set].map(x => x * 2));
// Retorna Set: {2, 4, 6}

let set = new Set([1, 2, 3, 4, 5]);
set = new Set([...set].filter(x => (x % 2) == 0));
// Retorna Set: {2, 4}
```

Portanto, o Set facilita a implementação de união, interseção e diferença.

```javascript
let a = new Set([1, 2, 3]);
let b = new Set([4, 3, 2]);

// União
let union = new Set([...a, ...b]);
// Set {1, 2, 3, 4}

// Interseção
let intersect = new Set([...a].filter(x => b.has(x)));
// set {2, 3}

// Diferença (a em relação a b)
let difference = new Set([...a].filter(x => !b.has(x)));
// Set {1}
```

Se você quiser alterar a estrutura Set original durante a iteração, não há método direto. Existem duas alternativas: mapear o Set original para uma nova estrutura e atribuí-la de volta; ou usar o método `Array.from`.

```javascript
// Método 1
let set = new Set([1, 2, 3]);
set = new Set([...set].map(val => val * 2));
// valor de set é 2, 4, 6

// Método 2
let set = new Set([1, 2, 3]);
set = new Set(Array.from(set, val => val * 2));
// valor de set é 2, 4, 6
```

O código acima fornece dois métodos para modificar a estrutura Set original durante operações de iteração.

### Operações de Conjunto

O [ES2025](https://github.com/tc39/proposal-set-methods) adiciona os seguintes métodos de operação de conjunto à estrutura Set:

- Set.prototype.intersection(other): Interseção
- Set.prototype.union(other): União
- Set.prototype.difference(other): Diferença
- Set.prototype.symmetricDifference(other): Diferença simétrica
- Set.prototype.isSubsetOf(other): Verificar se é subconjunto
- Set.prototype.isSupersetOf(other): Verificar se é superconjunto
- Set.prototype.isDisjointFrom(other): Verificar se é disjunto

Todos os parâmetros desses métodos devem ser estruturas Set ou estruturas semelhantes a Set (com propriedade `size` e métodos `keys()` e `has()`).

`.union()` realiza a união, retornando um conjunto contendo todos os membros que existem em qualquer coleção.

```javascript
const frontEnd = new Set(["JavaScript", "HTML", "CSS"]);
const backEnd = new Set(["Python", "Java", "JavaScript"]);

const all = frontEnd.union(backEnd);
// Set {"JavaScript", "HTML", "CSS", "Python", "Java"}
```

`.intersection()` realiza a interseção, retornando um conjunto de membros que existem em ambas as coleções.

```javascript
const frontEnd = new Set(["JavaScript", "HTML", "CSS"]);
const backEnd = new Set(["Python", "Java", "JavaScript"]);

const frontAndBackEnd = frontEnd.intersection(backEnd);
// Set {"JavaScript"}
```

`.difference()` realiza a diferença, retornando um conjunto de todos os membros que existem na primeira coleção mas não na segunda.

```javascript
const frontEnd = new Set(["JavaScript", "HTML", "CSS"]);
const backEnd = new Set(["Python", "Java", "JavaScript"]);

const onlyFrontEnd = frontEnd.difference(backEnd);
// Set {"HTML", "CSS"}

const onlyBackEnd = backEnd.difference(frontEnd);
// Set {"Python", "Java"}
```

`.symmetricDifference()` realiza a diferença simétrica, retornando um conjunto de todos os membros únicos de ambas as coleções (duplicados removidos).

```javascript
const frontEnd = new Set(["JavaScript", "HTML", "CSS"]);
const backEnd = new Set(["Python", "Java", "JavaScript"]);

const onlyFrontEnd = frontEnd.symmetricDifference(backEnd);
// Set {"HTML", "CSS", "Python", "Java"} 

const onlyBackEnd = backEnd.symmetricDifference(frontEnd);
// Set {"Python", "Java", "HTML", "CSS"}
```

Note que a ordem dos membros no resultado é determinada pela ordem em que foram adicionados à coleção.

`.isSubsetOf()` retorna um booleano indicando se o primeiro conjunto é subconjunto do segundo—ou seja, todos os membros do primeiro conjunto são membros do segundo.

```javascript
const frontEnd = new Set(["JavaScript", "HTML", "CSS"]);
const declarative = new Set(["HTML", "CSS"]);

declarative.isSubsetOf(frontEnd);
// true

frontEndLanguages.isSubsetOf(declarativeLanguages);
// false
```

Qualquer conjunto é subconjunto de si mesmo.

```javascript
frontEnd.isSubsetOf(frontEnd);
// true
```

`isSupersetOf()` retorna um booleano indicando se o primeiro conjunto é superconjunto do segundo—ou seja, todos os membros do segundo conjunto são membros do primeiro.

```javascript
const frontEnd = new Set(["JavaScript", "HTML", "CSS"]);
const declarative = new Set(["HTML", "CSS"]);

declarative.isSupersetOf(frontEnd);
// false

frontEnd.isSupersetOf(declarative);
// true
```

Qualquer conjunto é superconjunto de si mesmo.

```javascript
frontEnd.isSupersetOf(frontEnd);
// true
```

`.isDisjointFrom()` verifica se dois conjuntos são disjuntos—ou seja, não têm membros em comum.

```javascript
const frontEnd = new Set(["JavaScript", "HTML", "CSS"]);
const interpreted = new Set(["JavaScript", "Ruby", "Python"]);
const compiled = new Set(["Java", "C++", "TypeScript"]);

interpreted.isDisjointFrom(compiled);
// true

frontEnd.isDisjointFrom(interpreted);
// false
```

## WeakSet

### Significado

A estrutura WeakSet é semelhante ao Set—também é uma coleção de valores únicos. Porém, difere do Set de duas formas.

Primeiro, os membros do WeakSet só podem ser objetos e valores Symbol, não outros tipos.

```javascript
const ws = new WeakSet();
ws.add(1) // Erro
ws.add(Symbol()) // OK
```

O código acima tenta adicionar um número e um valor `Symbol` ao WeakSet. O primeiro lança um erro porque WeakSet só pode conter objetos e valores Symbol.

Segundo, os objetos no WeakSet são referenciados fracamente. O coletor de lixo não conta as referências do WeakSet a esses objetos. Ou seja, quando não restam outras referências a um objeto, o coletor de lixo recuperará sua memória sem considerar que o objeto ainda existe no WeakSet.

Isso acontece porque o coletor de lixo decide quando recuperar com base na alcançabilidade do objeto. Se um objeto ainda é alcançável, o coletor de lixo não liberará essa memória. Após terminar de usar um valor, às vezes esquecemos de remover sua referência, o que pode causar vazamentos de memória. As referências dentro do WeakSet não são contadas pelo coletor de lixo, então esse problema não ocorre. Portanto, WeakSet é adequado para armazenar temporariamente um grupo de objetos e para armazenar informações vinculadas a objetos. Quando esses objetos desaparecem do exterior, suas referências dentro do WeakSet desaparecerão automaticamente.

Por causa dessa característica, os membros do WeakSet não são adequados para serem referenciados—podem desaparecer a qualquer momento. Além disso, o número de membros no WeakSet depende de o coletor de lixo ter sido executado; a contagem pode mudar antes e depois da execução. Como quando o coletor de lixo é executado é imprevisível, o ES6 especifica que WeakSet não é iterável.

Essas características também se aplicam à estrutura WeakMap apresentada mais adiante neste capítulo.

### Sintaxe

WeakSet é um construtor e pode ser usado com o comando `new` para criar estruturas de dados WeakSet.

```javascript
const ws = new WeakSet();
```

Como construtor, WeakSet pode aceitar um array ou objeto semelhante a array como argumento. (Na verdade, qualquer objeto com interface Iterable pode ser passado como argumento ao WeakSet.) Todos os membros desse array tornam-se automaticamente membros da instância WeakSet.

```javascript
const a = [[1, 2], [3, 4]];
const ws = new WeakSet(a);
// WeakSet {[1, 2], [3, 4]}
```

No código acima, `a` é um array com dois membros, ambos arrays. Passar `a` ao construtor WeakSet faz com que os membros de `a` se tornem membros do WeakSet.

Note que são os membros do array `a` que se tornam membros do WeakSet, não `a` em si. Isso significa que os membros do array devem ser objetos.

```javascript
const b = [3, 4];
const ws = new WeakSet(b);
// Uncaught TypeError: Invalid value used in weak set(…)
```

No código acima, os membros do array `b` não são objetos, então adicioná-los ao WeakSet lança um erro.

A estrutura WeakSet tem os seguintes três métodos:

- **WeakSet.prototype.add(value)**: Adiciona um novo membro à instância WeakSet. Retorna a estrutura WeakSet em si.
- **WeakSet.prototype.delete(value)**: Remove o membro especificado da instância WeakSet. Retorna `true` em sucesso; retorna `false` se o membro não for encontrado ou não for um objeto.
- **WeakSet.prototype.has(value)**: Retorna um booleano indicando se um valor está na instância WeakSet.

Exemplo:

```javascript
const ws = new WeakSet();
const obj = {};
const foo = {};

ws.add(window);
ws.add(obj);

ws.has(window); // true
ws.has(foo); // false

ws.delete(window); // true
ws.has(window); // false
```

WeakSet não tem propriedade `size` e não há como iterar sobre seus membros.

```javascript
ws.size // undefined
ws.forEach // undefined

ws.forEach(function(item){ console.log('WeakSet has ' + item)})
// TypeError: undefined is not a function
```

O código acima tenta acessar as propriedades `size` e `forEach`; nenhuma tem sucesso.

WeakSet não pode ser iterado porque seus membros são referenciados fracamente e podem desaparecer a qualquer momento. A iteração não pode garantir a existência dos membros—eles podem se tornar inacessíveis logo após o fim da iteração. Um uso do WeakSet é armazenar nós DOM sem se preocupar com vazamentos de memória quando esses nós são removidos do documento.

Aqui está outro exemplo de WeakSet:

```javascript
const foos = new WeakSet()
class Foo {
  constructor() {
    foos.add(this)
  }
  method () {
    if (!foos.has(this)) {
      throw new TypeError('Foo.prototype.method só pode ser chamado em instâncias de Foo!');
    }
  }
}
```

O código acima garante que o método de instância de `Foo` só pode ser chamado em instâncias de `Foo`. Usar WeakSet aqui significa que a referência de `foos` às instâncias não é contada pelo coletor de lixo, então quando as instâncias são deletadas, não é preciso considerar `foos`, e não ocorrem vazamentos de memória.

## Map

### Significado e Uso Básico

Os objetos JavaScript (Object) são essencialmente coleções de pares chave-valor (estruturas hash), mas tradicionalmente apenas strings podiam ser usadas como chaves. Isso impôs limitações significativas ao seu uso.

```javascript
const data = {};
const element = document.getElementById('myDiv');

data[element] = 'metadata';
data['[object HTMLDivElement]'] // "metadata"
```

O código acima pretendia usar um nó DOM como chave do objeto `data`. Porém, como objetos só aceitam strings como chaves, `element` foi automaticamente convertido na string `[object HTMLDivElement]`.

Para resolver esse problema, o ES6 fornece a estrutura de dados Map. É semelhante a um objeto—também uma coleção de pares chave-valor—mas o intervalo de chaves não se limita a strings. Valores de qualquer tipo, incluindo objetos, podem ser usados como chaves. Object fornece mapeamento "string-para-valor", enquanto Map fornece mapeamento "valor-para-valor", uma implementação mais completa de estrutura hash. Se você precisa de uma estrutura de dados chave-valor, Map é mais adequado que Object.

```javascript
const m = new Map();
const o = {p: 'Hello World'};

m.set(o, 'content')
m.get(o) // "content"

m.has(o) // true
m.delete(o) // true
m.has(o) // false
```

O código acima usa o método `set` do Map para usar o objeto `o` como chave em `m`, depois usa `get` para ler essa chave e `delete` para removê-la.

O exemplo acima mostra como adicionar membros a um Map. Como construtor, Map também pode aceitar um array como argumento. Os membros do array são arrays representando pares chave-valor.

```javascript
const map = new Map([
  ['name', 'John'],
  ['title', 'Author']
]);

map.size // 2
map.has('name') // true
map.get('name') // "John"
map.has('title') // true
map.get('title') // "Author"
```

O código acima especifica duas chaves, `name` e `title`, ao criar a instância Map.

Quando o construtor `Map` aceita um array como argumento, ele efetivamente executa o seguinte algoritmo:

```javascript
const items = [
  ['name', 'John'],
  ['title', 'Author']
];

const map = new Map();

items.forEach(
  ([key, value]) => map.set(key, value)
);
```

Na verdade, não apenas arrays—qualquer estrutura de dados com interface Iterator cujos membros são arrays de dois elementos (veja o capítulo "Iterator") pode ser passada ao construtor `Map`. Isso significa que tanto `Set` quanto `Map` podem ser usados para gerar novos Maps.

```javascript
const set = new Set([
  ['foo', 1],
  ['bar', 2]
]);
const m1 = new Map(set);
m1.get('foo') // 1

const m2 = new Map([['baz', 3]]);
const m3 = new Map(m2);
m3.get('baz') // 3
```

No código acima, usamos objetos Set e Map como argumentos do construtor `Map`; ambos produzem novos objetos Map.

Se a mesma chave for atribuída várias vezes, os valores posteriores sobrescrevem os anteriores.

```javascript
const map = new Map();

map
.set(1, 'aaa')
.set(1, 'bbb');

map.get(1) // "bbb"
```

O código acima atribui à chave `1` duas vezes; o segundo valor sobrescreve o primeiro.

Ler uma chave desconhecida retorna `undefined`.

```javascript
new Map().get('asfddfsasadf')
// undefined
```

Note que o Map trata apenas referências ao mesmo objeto como a mesma chave. Isso requer cuidado.

```javascript
const map = new Map();

map.set(['a'], 555);
map.get(['a']) // undefined
```

No código acima, `set` e `get` parecem usar a mesma chave, mas são na verdade duas instâncias de array diferentes com endereços de memória diferentes, então `get` não pode recuperar o valor e retorna `undefined`.

Da mesma forma, duas instâncias com o mesmo valor são tratadas como duas chaves diferentes no Map.

```javascript
const map = new Map();

const k1 = ['a'];
const k2 = ['a'];

map
.set(k1, 111)
.set(k2, 222);

map.get(k1) // 111
map.get(k2) // 222
```

No código acima, `k1` e `k2` têm o mesmo valor mas são tratados como duas chaves diferentes no Map.

Disso vemos que as chaves do Map estão vinculadas aos endereços de memória. Endereços diferentes significam chaves diferentes. Isso evita o problema de colisão de nomes de propriedades ao estender bibliotecas de outras pessoas—ao usar objetos como chaves, não é preciso se preocupar com suas propriedades conflitando com as do autor original.

Se uma chave do Map for de um tipo simples (número, string, booleano), o Map trata dois valores estritamente iguais como a mesma chave. Por exemplo, `0` e `-0` são a mesma chave, enquanto o booleano `true` e a string `'true'` são chaves diferentes. Também, `undefined` e `null` são chaves diferentes. Embora `NaN` não seja estritamente igual a si mesmo, o Map o trata como a mesma chave.

```javascript
let map = new Map();

map.set(-0, 123);
map.get(+0) // 123

map.set(true, 1);
map.set('true', 2);
map.get(true) // 1

map.set(undefined, 3);
map.set(null, 4);
map.get(undefined) // 3

map.set(NaN, 123);
map.get(NaN) // 123
```

### Propriedades e Métodos de Instância

As instâncias de estrutura Map têm as seguintes propriedades e métodos:

**(1)Propriedade size**

A propriedade `size` retorna o número total de membros na estrutura Map.

```javascript
const map = new Map();
map.set('foo', true);
map.set('bar', false);

map.size // 2
```

**(2)Map.prototype.set(key, value)**

O método `set` define o valor da chave `key` como `value`, depois retorna toda a estrutura Map. Se `key` já tiver valor, é atualizado; caso contrário, uma nova chave é criada.

```javascript
const m = new Map();

m.set('edition', 6)        // chave é string
m.set(262, 'standard')     // chave é número
m.set(undefined, 'nah')    // chave é undefined
```

O método `set` retorna o objeto `Map` atual, então suporta encadeamento.

```javascript
let map = new Map()
  .set(1, 'a')
  .set(2, 'b')
  .set(3, 'c');
```

**(3)Map.prototype.get(key)**

O método `get` lê o valor da chave `key`. Se `key` não for encontrado, retorna `undefined`.

```javascript
const m = new Map();

const hello = function() {console.log('hello');};
m.set(hello, 'Hello ES6!') // chave é função

m.get(hello)  // Hello ES6!
```

**(4)Map.prototype.has(key)**

O método `has` retorna um booleano indicando se uma chave existe no objeto Map atual.

```javascript
const m = new Map();

m.set('edition', 6);
m.set(262, 'standard');
m.set(undefined, 'nah');

m.has('edition')     // true
m.has('years')       // false
m.has(262)           // true
m.has(undefined)     // true
```

**(5)Map.prototype.delete(key)**

O método `delete()` remove uma chave. Retorna `true` em sucesso, `false` em falha.

```javascript
const m = new Map();
m.set(undefined, 'nah');
m.has(undefined)     // true

m.delete(undefined)
m.has(undefined)       // false
```

**(6)Map.prototype.clear()**

O método `clear()` remove todos os membros. Sem valor de retorno.

```javascript
let map = new Map();
map.set('foo', true);
map.set('bar', false);

map.size // 2
map.clear()
map.size // 0
```

### Métodos de Iteração

A estrutura Map fornece nativamente três geradores de iterador e um método de iteração:

- `Map.prototype.keys()`: Retorna um iterador para chaves
- `Map.prototype.values()`: Retorna um iterador para valores
- `Map.prototype.entries()`: Retorna um iterador para todos os membros
- `Map.prototype.forEach()`: Itera sobre todos os membros do Map

A ordem de iteração do Map é a ordem de inserção.

```javascript
const map = new Map([
  ['F', 'no'],
  ['T',  'yes'],
]);

for (let key of map.keys()) {
  console.log(key);
}
// "F"
// "T"

for (let value of map.values()) {
  console.log(value);
}
// "no"
// "yes"

for (let item of map.entries()) {
  console.log(item[0], item[1]);
}
// "F" "no"
// "T" "yes"

// Ou
for (let [key, value] of map.entries()) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"

// Equivalente a map.entries()
for (let [key, value] of map) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"
```

O último exemplo acima mostra que a interface de iterador padrão do Map (propriedade `Symbol.iterator`) é o método `entries`.

```javascript
map[Symbol.iterator] === map.entries
// true
```

Uma forma rápida de converter a estrutura Map em estrutura de array é usar o operador spread (`...`).

```javascript
const map = new Map([
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
]);

[...map.keys()]
// [1, 2, 3]

[...map.values()]
// ['one', 'two', 'three']

[...map.entries()]
// [[1,'one'], [2, 'two'], [3, 'three']]

[...map]
// [[1,'one'], [2, 'two'], [3, 'three']]
```

Combinando com os métodos `map` e `filter` de array, a iteração e filtragem do Map podem ser implementadas (o Map em si não tem métodos `map` ou `filter`).

```javascript
const map0 = new Map()
  .set(1, 'a')
  .set(2, 'b')
  .set(3, 'c');

const map1 = new Map(
  [...map0].filter(([k, v]) => k < 3)
);
// Produz Map {1 => 'a', 2 => 'b'}

const map2 = new Map(
  [...map0].map(([k, v]) => [k * 2, '_' + v])
    );
// Produz Map {2 => '_a', 4 => '_b', 6 => '_c'}
```

Além disso, Map tem um método `forEach` semelhante ao dos arrays, que pode ser usado para iteração.

```javascript
map.forEach(function(value, key, map) {
  console.log("Key: %s, Value: %s", key, value);
});
```

O método `forEach` também pode aceitar um segundo parâmetro para vincular como `this`.

```javascript
const reporter = {
  report: function(key, value) {
    console.log("Key: %s, Value: %s", key, value);
  }
};

map.forEach(function(value, key, map) {
  this.report(key, value);
}, reporter);
```

No código acima, o `this` do retorno do `forEach` refere-se a `reporter`.

### Conversão para e de Outras Estruturas de Dados

**(1)Map para Array**

Como mencionado, a forma mais conveniente de converter Map em array é o operador spread (`...`).

```javascript
const myMap = new Map()
  .set(true, 7)
  .set({foo: 3}, ['abc']);
[...myMap]
// [ [ true, 7 ], [ { foo: 3 }, [ 'abc' ] ] ]
```

**(2)Array para Map**

Passar um array ao construtor Map converte em Map.

```javascript
new Map([
  [true, 7],
  [{foo: 3}, ['abc']]
])
// Map {
//   true => 7,
//   Object {foo: 3} => ['abc']
// }
```

**(3)Map para Object**

Se todas as chaves do Map forem strings, pode ser convertido para objeto sem perda.

```javascript
function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k,v] of strMap) {
    obj[k] = v;
  }
  return obj;
}

const myMap = new Map()
  .set('yes', true)
  .set('no', false);
strMapToObj(myMap)
// { yes: true, no: false }
```

Se houver chaves não-string, essas chaves serão convertidas em strings antes de serem usadas como chaves de objeto.

**(4)Object para Map**

Object para Map pode ser feito via `Object.entries()`.

```javascript
let obj = {"a":1, "b":2};
let map = new Map(Object.entries(obj));
```

Você também pode implementar uma função de conversão por conta própria.

```javascript
function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}

objToStrMap({yes: true, no: false})
// Map {"yes" => true, "no" => false}
```

**(5)Map para JSON**

Converter Map para JSON depende das chaves. Se todas as chaves do Map forem strings, pode ser convertido para JSON de objeto.

```javascript
function strMapToJson(strMap) {
  return JSON.stringify(strMapToObj(strMap));
}

let myMap = new Map().set('yes', true).set('no', false);
strMapToJson(myMap)
// '{"yes":true,"no":false}'
```

Se o Map tiver chaves não-string, pode ser convertido para JSON de array.

```javascript
function mapToArrayJson(map) {
  return JSON.stringify([...map]);
}

let myMap = new Map().set(true, 7).set({foo: 3}, ['abc']);
mapToArrayJson(myMap)
// '[[true,7],[{"foo":3},["abc"]]]'
```

**(6)JSON para Map**

Ao converter JSON para Map, as chaves são normalmente strings.

```javascript
function jsonToStrMap(jsonStr) {
  return objToStrMap(JSON.parse(jsonStr));
}

jsonToStrMap('{"yes": true, "no": false}')
// Map {'yes' => true, 'no' => false}
```

Porém, se o JSON inteiro for um array onde cada membro é um array de dois elementos, pode ser convertido um-a-um para Map. Isso costuma ser o inverso da conversão Map-para-array JSON.

```javascript
function jsonToMap(jsonStr) {
  return new Map(JSON.parse(jsonStr));
}

jsonToMap('[[true,7],[{"foo":3},["abc"]]]')
// Map {true => 7, Object { foo: 3 } => ['abc']}
```

## WeakMap

### Significado

A estrutura `WeakMap` é semelhante ao `Map`—também é para gerar coleções de pares chave-valor.

```javascript
// WeakMap pode adicionar membros via set
const wm1 = new WeakMap();
const key = {foo: 1};
wm1.set(key, 2);
wm1.get(key) // 2

// WeakMap pode aceitar array como argumento do construtor
const k1 = [1, 2, 3];
const k2 = [4, 5, 6];
const wm2 = new WeakMap([[k1, 'foo'], [k2, 'bar']]);
wm2.get(k2) // "bar"
```

`WeakMap` difere do `Map` de duas formas.

Primeiro, `WeakMap` só aceita objetos (exceto `null`) e [valores Symbol](https://github.com/tc39/proposal-symbols-as-weakmap-keys) como chaves, não outros tipos.

```javascript
const map = new WeakMap();
map.set(1, 2) // Erro
map.set(null, 2) // Erro
map.set(Symbol(), 2) // OK
```

No código acima, usar o número `1` ou `null` como chaves do WeakMap lança erros; usar um valor Symbol não lança.

Segundo, os objetos referenciados pelas chaves do WeakMap não são contados pelo coletor de lixo.

O propósito do `WeakMap` é que às vezes queremos armazenar dados em um objeto, mas isso criaria uma referência a esse objeto. Considere este exemplo:

```javascript
const e1 = document.getElementById('foo');
const e2 = document.getElementById('bar');
const arr = [
  [e1, 'elemento foo'],
  [e2, 'elemento bar'],
];
```

No código acima, `e1` e `e2` são dois objetos, e adicionamos algumas descrições de texto a eles via o array `arr`. Isso cria referências de `arr` para `e1` e `e2`.

Uma vez que não precisamos mais desses dois objetos, devemos remover manualmente essas referências; caso contrário o coletor de lixo não liberará a memória usada por `e1` e `e2`.

```javascript
// Quando e1 e e2 não forem mais necessários, remover referências manualmente
arr [0] = null;
arr [1] = null;
```

Essa abordagem é claramente inconveniente. Esquecer de fazer isso pode causar vazamentos de memória.

WeakMap foi criado para resolver esse problema. Os objetos referenciados por suas chaves são referenciados fracamente—o coletor de lixo não os conta. Então, quando todas as outras referências a um objeto referenciado forem limpas, o coletor de lixo liberará a memória desse objeto. Uma vez que o objeto não é mais necessário, a chave no WeakMap e seu par chave-valor associado desaparecem automaticamente sem remoção manual de referências.

Essencialmente, se você quer adicionar dados a um objeto sem interferir na coleta de lixo, use WeakMap. Um caso de uso típico é adicionar dados a elementos DOM em uma página web. Quando um elemento DOM é removido, sua entrada correspondente no WeakMap é removida automaticamente.

```javascript
const wm = new WeakMap();

const element = document.getElementById('example');

wm.set(element, 'some information');
wm.get(element) // "some information"
```

No código acima, criamos uma instância WeakMap, usamos um nó DOM como chave, armazenamos algumas informações adicionais como valor, e armazenamos ambos no WeakMap. A referência a `element` no WeakMap é fraca e não é contada pelo coletor de lixo.

Então, uma vez que outras referências ao objeto nó DOM desapareçam, a memória desse objeto será liberada pelo coletor de lixo. O par chave-valor do WeakMap desaparecerá automaticamente.

Em resumo, `WeakMap` é destinado a casos em que os objetos correspondentes às suas chaves podem desaparecer no futuro. `WeakMap` ajuda a prevenir vazamentos de memória.

Note: WeakMap referencia fracamente apenas as chaves, não os valores. Os valores ainda são referências normais.

```javascript
const wm = new WeakMap();
let key = {};
let obj = {foo: 1};

wm.set(key, obj);
obj = null;
wm.get(key)
// Object {foo: 1}
```

No código acima, o valor `obj` é uma referência normal. Então mesmo após remover a referência a `obj` fora do WeakMap, a referência dentro do WeakMap permanece.

### Sintaxe do WeakMap

As principais diferenças de API entre WeakMap e Map são: (1) WeakMap não tem operações de iteração (sem métodos `keys()`, `values()` ou `entries()`) e não tem propriedade `size`—não há como listar todas as chaves, e se uma chave existe é imprevisível porque depende da coleta de lixo; (2) WeakMap não pode ser esvaziado—não suporta o método `clear`. Portanto, WeakMap tem apenas quatro métodos: `get()`, `set()`, `has()` e `delete()`.

```javascript
const wm = new WeakMap();

// size, forEach, clear não existem
wm.size // undefined
wm.forEach // undefined
wm.clear // undefined
```

### Exemplo de WeakMap

Exemplos de WeakMap são difíceis de demonstrar porque não podemos observar suas referências desaparecendo automaticamente. Nesse momento, todas as outras referências se foram e nada aponta para as chaves do WeakMap, então não podemos confirmar se essas chaves ainda existem.

Um usuário [sugeriu](https://github.com/ruanyf/es6tutorial/issues/362#issuecomment-292109104) que se os valores referenciados ocuparem muita memória, podemos observar isso via o método `process.memoryUsage` do Node. Seguindo essa ideia, outro usuário [forneceu](https://github.com/ruanyf/es6tutorial/issues/362#issuecomment-292451925) o exemplo abaixo.

Primeiro, abra a linha de comando do Node:

```bash
$ node --expose-gc
```

O parâmetro `--expose-gc` permite execução manual do coletor de lixo.

Depois execute o seguinte código:

```javascript
// Executar GC manualmente para obter estado de memória preciso
> global.gc();
undefined

// Estado inicial de memória, heapUsed ~4M
> process.memoryUsage();
{ rss: 21106688,
  heapTotal: 7376896,
  heapUsed: 4153936,
  external: 9059 }

> let wm = new WeakMap();
undefined

// Criar key apontando para array 5*1024*1024
> let key = new Array(5 * 1024 * 1024);
undefined

// Definir chave do WeakMap apontando para key array
// Key array referenciada duas vezes; WeakMap é referência fraca
> wm.set(key, 1);
WeakMap {}

> global.gc();
undefined

// heapUsed agora ~45M
> process.memoryUsage();
{ rss: 67538944,
  heapTotal: 7376896,
  heapUsed: 45782816,
  external: 8945 }

// Limpar referência de key ao array
> key = null;
null

// Executar GC novamente
> global.gc();
undefined

// heapUsed volta para ~4M; chave WeakMap não bloqueou GC
> process.memoryUsage();
{ rss: 20639744,
  heapTotal: 8425472,
  heapUsed: 3979792,
  external: 8956 }
```

No código acima, assim que a referência externa desaparece, a referência interna do WeakMap é automaticamente limpa pelo coletor de lixo. Com WeakMap, resolver vazamentos de memória se torna muito mais simples.

O painel Memory do Chrome DevTools tem um botão de lixeira que força a coleta de lixo. Isso também pode ser usado para observar se as referências dentro do WeakMap desaparecem.

### Casos de Uso do WeakMap

Como mencionado, um caso de uso típico do WeakMap é nós DOM como chaves. Exemplo:

```javascript
let myWeakmap = new WeakMap();

myWeakmap.set(
  document.getElementById('logo'),
  {timesClicked: 0})
;

document.getElementById('logo').addEventListener('click', function() {
  let logoData = myWeakmap.get(document.getElementById('logo'));
  logoData.timesClicked++;
}, false);
```

No código acima, `document.getElementById('logo')` é um nó DOM. Sempre que ocorre um evento `click`, o estado é atualizado. Armazenamos esse estado como valor no WeakMap com o objeto nó como chave. Uma vez que o nó DOM seja removido, o estado desaparece automaticamente sem risco de vazamento de memória.

Outro uso do WeakMap é implementar propriedades privadas.

```javascript
const _counter = new WeakMap();
const _action = new WeakMap();

class Countdown {
  constructor(counter, action) {
    _counter.set(this, counter);
    _action.set(this, action);
  }
  dec() {
    let counter = _counter.get(this);
    if (counter < 1) return;
    counter--;
    _counter.set(this, counter);
    if (counter === 0) {
      _action.get(this)();
    }
  }
}

const c = new Countdown(2, () => console.log('DONE'));

c.dec()
c.dec()
// DONE
```

No código acima, as duas propriedades internas `_counter` e `_action` da classe `Countdown` são referências fracas à instância, então quando a instância é deletada elas desaparecem também, evitando vazamentos de memória.

## WeakRef

WeakSet e WeakMap são estruturas de dados baseadas em referências fracas. O [ES2021](https://github.com/tc39/proposal-weakrefs) vai além fornecendo o objeto WeakRef para criar diretamente referências fracas a objetos.

```javascript
let target = {};
let wr = new WeakRef(target);
```

No exemplo acima, `target` é o objeto original. O construtor `WeakRef()` cria um novo objeto `wr` baseado em `target`. Aqui `wr` é uma instância WeakRef e uma referência fraca a `target`. O coletor de lixo não conta essa referência—ou seja, a existência de `wr` não impede que `target` seja coletado pelo lixo.

Instâncias WeakRef têm um método `deref()`. Se o objeto original existir, retorna o objeto original; se o objeto original foi coletado pelo lixo, retorna `undefined`.

```javascript
let target = {};
let wr = new WeakRef(target);

let obj = wr.deref();
if (obj) { // target ainda não foi coletado pelo GC
  // ...
}
```

No exemplo acima, o método `deref()` pode determinar se o objeto original foi limpo.

Um uso importante de objetos de referência fraca é cache—valores podem ser lidos do cache quando não limpos, e o cache invalida automaticamente assim que é limpo.

```javascript
function makeWeakCached(f) {
  const cache = new Map();
  return key => {
    const ref = cache.get(key);
    if (ref) {
      const cached = ref.deref();
      if (cached !== undefined) return cached;
    }

    const fresh = f(key);
    cache.set(key, new WeakRef(fresh));
    return fresh;
  };
}

const getImageCached = makeWeakCached(getImage);
```

No exemplo acima, `makeWeakCached()` constrói um cache que armazena referências fracas aos arquivos originais.

Note: A especificação determina que uma vez que uma referência fraca é criada com `WeakRef()` para um objeto original, o objeto original definitivamente não será coletado no event loop atual—ele só pode ser coletado em um event loop posterior.

## FinalizationRegistry

O [ES2021](https://github.com/tc39/proposal-weakrefs#finalizers) introduziu o FinalizationRegistry para registro de limpeza. Ele especifica um callback a ser executado após um objeto alvo ter sido coletado pelo lixo.

Primeiro, crie uma instância do registro:

```javascript
const registry = new FinalizationRegistry(heldValue => {
  // ....
});
```

No código acima, `FinalizationRegistry()` é um construtor integrado que retorna uma instância de registro de limpeza com o callback a executar. O callback é passado como argumento para `FinalizationRegistry()` e recebe um parâmetro, `heldValue`.

Depois, o método `register()` da instância do registro registra o objeto alvo a observar:

```javascript
registry.register(theObject, "some value");
```

No exemplo acima, `theObject` é o alvo a observar. Uma vez que esse objeto é coletado pelo lixo, o registro chamará o callback previamente registrado após a limpeza e passará `"some value"` como argumento (o `heldValue` anterior).

Note que o registro não referencia fortemente o objeto alvo—é uma referência fraca. Uma referência forte impediria o objeto original de ser coletado pelo lixo, frustrando o propósito do registro.

O parâmetro `heldValue` do callback pode ser de qualquer tipo: string, número, booleano, objeto, ou até `undefined`.

Por fim, para cancelar um callback já registrado, passe um terceiro parâmetro ao `register()` como token. Este token deve ser um objeto, frequentemente o objeto original. Então use o método `unregister()` da instância do registro para desregistrar.

```javascript
registry.register(theObject, "some value", theObject);
// ...outras operações...
registry.unregister(theObject);
```

No código acima, o terceiro parâmetro de `register()` é o token `theObject`. Para cancelar o callback, use `unregister()` com o token como argumento. A referência ao terceiro parâmetro em `register()` também é fraca. Sem esse parâmetro, o callback não pode ser cancelado.

Como o callback é removido do registro após ser chamado, `unregister()` deve ser chamado antes do callback ser invocado.

Abaixo, `FinalizationRegistry` é usado para aprimorar a função de cache da seção anterior:

```javascript
function makeWeakCached(f) {
  const cache = new Map();
  const cleanup = new FinalizationRegistry(key => {
    const ref = cache.get(key);
    if (ref && !ref.deref()) cache.delete(key);
  });

  return key => {
    const ref = cache.get(key);
    if (ref) {
      const cached = ref.deref();
      if (cached !== undefined) return cached;
    }

    const fresh = f(key);
    cache.set(key, new WeakRef(fresh));
    cleanup.register(fresh, key);
    return fresh;
  };
}

const getImageCached = makeWeakCached(getImage);
```

Comparado com o exemplo da seção anterior, o código acima adiciona um registro de limpeza. Uma vez que um objeto original em cache é coletado pelo lixo, um callback é executado automaticamente para remover a chave inválida do cache.

Outro exemplo:

```javascript
class Thingy {
  #file;
  #cleanup = file => {
    console.error(
      `The \`release\` method was never called for the \`Thingy\` for the file "${file.name}"`
    );
  };
  #registry = new FinalizationRegistry(this.#cleanup);

  constructor(filename) {
    this.#file = File.open(filename);
    this.#registry.register(this, this.#file, this.#file);
  }

  release() {
    if (this.#file) {
      this.#registry.unregister(this.#file);
      File.close(this.#file);
      this.#file = null;
    }
  }
}
```

No exemplo acima, se por algum motivo uma instância de `Thingy` for coletada pelo lixo sem chamar `release()`, o registro de limpeza chamará o callback `#cleanup()` e registrará um erro.

Como não podemos saber quando a limpeza será executada, é melhor evitar usá-la. Além disso, se a janela do navegador fechar ou o processo sair inesperadamente, a limpeza não será executada.

## Links de Referência

- [Union, intersection, difference, and more are coming to JavaScript Sets](https://www.sonarsource.com/blog/union-intersection-difference-javascript-sets/)
