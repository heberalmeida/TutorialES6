# Symbol

## Visão Geral

No ES5, os nomes das propriedades de objetos eram sempre strings, o que podia causar conflitos. Por exemplo, ao estender o objeto de outra pessoa (padrão mixin), sua nova propriedade podia conflitar com as existentes. O ES6 introduz `Symbol` para garantir nomes de propriedade únicos e evitar colisões.

`Symbol` é um novo tipo primitivo para valores únicos. É um dos tipos nativos do JavaScript, junto com `undefined`, `null`, Boolean, String, Number, BigInt e Object.

Symbols são criados com `Symbol()`. As chaves de objeto agora podem ser strings ou Symbols; chaves Symbol são sempre únicas.

```javascript
let s = Symbol();

typeof s
// "symbol"
```

A variável `s` é um valor único. `typeof` indica que é um Symbol.

`Symbol()` não pode ser usado com `new`; retorna um primitivo, não um objeto. Symbols são semelhantes a strings, mas imutáveis e únicos.

`Symbol()` aceita uma string opcional como descrição para exibição e depuração:

```javascript
let s1 = Symbol('foo');
let s2 = Symbol('bar');

s1 // Symbol(foo)
s2 // Symbol(bar)

s1.toString() // "Symbol(foo)"
s2.toString() // "Symbol(bar)"
```

Sem descrição, ambos apareceriam como `Symbol()`, dificultando distingui-los. A descrição ajuda a identificá-los.

Se o argumento for um objeto, seu `toString()` é chamado para gerar a descrição:

```javascript
const obj = {
  toString() {
    return 'abc';
  }
};
const sym = Symbol(obj);
sym // Symbol(abc)
```

O argumento é apenas uma descrição; `Symbol()` com o mesmo argumento ainda retorna valores diferentes:

```javascript
// sem argumentos
let s1 = Symbol();
let s2 = Symbol();

s1 === s2 // false

// com argumentos
let s1 = Symbol('foo');
let s2 = Symbol('foo');

s1 === s2 // false
```

Cada chamada a `Symbol()` retorna um valor único, mesmo com o mesmo argumento.

Symbols não podem ser usados em aritmética ou concatenação de strings:

```javascript
let sym = Symbol('My symbol');

"your symbol is " + sym
// TypeError: can't convert symbol to string
`your symbol is ${sym}`
// TypeError: can't convert symbol to string
```

Symbols podem ser convertidos explicitamente para strings:

```javascript
let sym = Symbol('My symbol');

String(sym) // 'Symbol(My symbol)'
sym.toString() // 'Symbol(My symbol)'
```

Symbols podem ser convertidos para booleanos, mas não para números:

```javascript
let sym = Symbol();
Boolean(sym) // true
!sym  // false

if (sym) {
  // ...
}

Number(sym) // TypeError
sym + 2 // TypeError
```

## Symbol.prototype.description

`Symbol()` pode receber uma string como descrição. Antes do ES2019, era preciso usar `toString()` para lê-la. O [ES2019](https://github.com/tc39/proposal-Symbol-description) adiciona a propriedade `description`:

```javascript
const sym = Symbol('foo');
```

Anteriormente:

```javascript
const sym = Symbol('foo');

String(sym) // "Symbol(foo)"
sym.toString() // "Symbol(foo)"
```

Agora:

```javascript
const sym = Symbol('foo');

sym.description // "foo"
```

## Usando Symbols como Chaves de Propriedade

Como cada Symbol é único, usar Symbols como chaves evita conflitos de nome, útil quando vários módulos contribuem para um mesmo objeto.

```javascript
let mySymbol = Symbol();

// estilo 1
let a = {};
a[mySymbol] = 'Hello!';

// estilo 2
let a = {
  [mySymbol]: 'Hello!'
};

// estilo 3
let a = {};
Object.defineProperty(a, mySymbol, { value: 'Hello!' });

// todos dão o mesmo resultado
a[mySymbol] // "Hello!"
```

Use colchetes ou `Object.defineProperty` para usar Symbol como chave. A notação de ponto não funciona:

```javascript
const mySymbol = Symbol();
const a = {};

a.mySymbol = 'Hello!';
a[mySymbol] // undefined
a['mySymbol'] // "Hello!"
```

Com notação de ponto, a chave é sempre a string `"mySymbol"`, não o Symbol.

Dentro de literais de objeto, chaves Symbol devem estar entre colchetes:

```javascript
let s = Symbol();

let obj = {
  [s]: function (arg) { ... }
};

obj[s](123);
```

Sem colchetes, a chave seria a string `"s"`. Com abreviação:

```javascript
let obj = {
  [s](arg) { ... }
};
```

Symbols funcionam bem para constantes que precisam ser distintas:

```javascript
const log = {};

log.levels = {
  DEBUG: Symbol('debug'),
  INFO: Symbol('info'),
  WARN: Symbol('warn')
};
console.log(log.levels.DEBUG, 'debug message');
console.log(log.levels.INFO, 'info message');
```

Outro exemplo:

```javascript
const COLOR_RED    = Symbol();
const COLOR_GREEN  = Symbol();

function getComplement(color) {
  switch (color) {
    case COLOR_RED:
      return COLOR_GREEN;
    case COLOR_GREEN:
      return COLOR_RED;
    default:
      throw new Error('Undefined color');
    }
}
```

Usar Symbols garante que o `switch` funcione como planejado; nenhum outro valor pode igualá-los.

Observação: chaves Symbol são públicas, não privadas; podem ser enumeradas com `Object.getOwnPropertySymbols()`.

## Exemplo: Removendo Strings Mágicas

Strings mágicas são valores literais repetidos que criam acoplamento forte. Um bom estilo prefere variáveis com significado claro.

```javascript
function getArea(shape, options) {
  let area = 0;

  switch (shape) {
    case 'Triangle': // string mágica
      area = .5 * options.width * options.height;
      break;
    /* ... more code ... */
  }

  return area;
}

getArea('Triangle', { width: 100, height: 100 }); // string mágica
```

A string `'Triangle'` é uma string mágica. Uma solução comum é usar uma variável:

```javascript
const shapeType = {
  triangle: 'Triangle'
};

function getArea(shape, options) {
  let area = 0;
  switch (shape) {
    case shapeType.triangle:
      area = .5 * options.width * options.height;
      break;
  }
  return area;
}

getArea(shapeType.triangle, { width: 100, height: 100 });
```

O valor exato de `shapeType.triangle` não importa desde que seja único. Symbols se encaixam bem:

```javascript
const shapeType = {
  triangle: Symbol()
};
```

Apenas `shapeType.triangle` muda; o restante permanece igual.

## Enumeração de Propriedades

Chaves Symbol não são retornadas por `for...in`, `for...of`, `Object.keys()`, `Object.getOwnPropertyNames()` ou `JSON.stringify()`.

Também não são privadas. `Object.getOwnPropertySymbols()` retorna todas as chaves Symbol:

```javascript
const obj = {};
let a = Symbol('a');
let b = Symbol('b');

obj[a] = 'Hello';
obj[b] = 'World';

const objectSymbols = Object.getOwnPropertySymbols(obj);

objectSymbols
// [Symbol(a), Symbol(b)]
```

Comparação:

```javascript
const obj = {};
const foo = Symbol('foo');

obj[foo] = 'bar';

for (let i in obj) {
  console.log(i); // sem saída
}

Object.getOwnPropertyNames(obj) // []
Object.getOwnPropertySymbols(obj) // [Symbol(foo)]
```

`Reflect.ownKeys()` retorna todas as chaves, incluindo Symbol:

```javascript
let obj = {
  [Symbol('my_key')]: 1,
  enum: 2,
  nonEnum: 3
};

Reflect.ownKeys(obj)
//  ["enum", "nonEnum", Symbol(my_key)]
```

Como chaves Symbol são ignoradas pela enumeração normal, podem simular propriedades "internas":

```javascript
let size = Symbol('size');

class Collection {
  constructor() {
    this[size] = 0;
  }

  add(item) {
    this[this[size]] = item;
    this[size]++;
  }

  static sizeOf(instance) {
    return instance[size];
  }
}

let x = new Collection();
Collection.sizeOf(x) // 0

x.add('foo');
Collection.sizeOf(x) // 1

Object.keys(x) // ['0']
Object.getOwnPropertyNames(x) // ['0']
Object.getOwnPropertySymbols(x) // [Symbol(size)]
```

`size` é um Symbol, então `Object.keys` e `Object.getOwnPropertyNames` não o incluem.

## Symbol.for(), Symbol.keyFor()

Para reutilizar o mesmo Symbol em todo o código, use `Symbol.for()`. Ele recebe uma string como chave, procura um Symbol existente com essa chave em um registro global e o retorna ou cria e registra um novo:

```javascript
let s1 = Symbol.for('foo');
let s2 = Symbol.for('foo');

s1 === s2 // true
```

Ambos `s1` e `s2` referem-se ao mesmo Symbol porque compartilham a chave `'foo'`.

`Symbol.for()` registra Symbols globalmente; `Symbol()` não. Várias chamadas a `Symbol.for('cat')` retornam o mesmo Symbol; várias chamadas a `Symbol('cat')` retornam Symbols diferentes:

```javascript
Symbol.for("bar") === Symbol.for("bar")
// true

Symbol("bar") === Symbol("bar")
// false
```

`Symbol.keyFor()` retorna a chave de um Symbol registrado:

```javascript
let s1 = Symbol.for("foo");
Symbol.keyFor(s1) // "foo"

let s2 = Symbol("foo");
Symbol.keyFor(s2) // undefined
```

`s2` não está registrado, então `Symbol.keyFor` retorna `undefined`.

`Symbol.for()` usa um registro global, independente do escopo atual:

```javascript
function foo() {
  return Symbol.for('bar');
}

const x = foo();
const y = Symbol.for('bar');
console.log(x === y); // true
```

`Symbol.for('bar')` dentro de `foo` é o mesmo Symbol que no escopo externo.

Isso permite que o mesmo Symbol seja compartilhado entre iframes e service workers:

```javascript
iframe = document.createElement('iframe');
iframe.src = String(window.location);
document.body.appendChild(iframe);

iframe.contentWindow.Symbol.for('foo') === Symbol.for('foo')
// true
```

## Exemplo: Singleton de Módulo

Um singleton garante que uma classe sempre retorne a mesma instância. No Node, cada módulo pode agir como uma classe; você quer a mesma instância toda vez que o módulo for carregado.

Uma abordagem é armazenar a instância em `global`:

```javascript
// mod.js
function A() {
  this.foo = 'hello';
}

if (!global._foo) {
  global._foo = new A();
}

module.exports = global._foo;
```

Então:

```javascript
const a = require('./mod.js');
console.log(a.foo);
```

O problema: `global._foo` é gravável, então qualquer arquivo pode sobrescrevê-lo:

```javascript
global._foo = { foo: 'world' };

const a = require('./mod.js');
console.log(a.foo);
```

Usar uma chave Symbol reduz sobrescritas acidentais:

```javascript
// mod.js
const FOO_KEY = Symbol.for('foo');

function A() {
  this.foo = 'hello';
}

if (!global[FOO_KEY]) {
  global[FOO_KEY] = new A();
}

module.exports = global[FOO_KEY];
```

`global[FOO_KEY]` é mais difícil de sobrescrever acidentalmente, mas ainda pode ser:

```javascript
global[Symbol.for('foo')] = { foo: 'world' };

const a = require('./mod.js');
```

Com `Symbol()` (não `Symbol.for()`), a chave não é globalmente descobrível, então código externo não pode facilmente sobrescrevê-la. O lado negativo: cada require obtém um Symbol diferente, então o singleton quebra se o módulo for recarregado.

## Symbols Built-in

O ES6 define 11 Symbols built-in usados pelos internos da linguagem.

### Symbol.hasInstance

`Symbol.hasInstance` aponta para o método usado por `instanceof`. Para `foo instanceof Foo`, o engine chama `Foo[Symbol.hasInstance](foo)`:

```javascript
class MyClass {
  [Symbol.hasInstance](foo) {
    return foo instanceof Array;
  }
}

[1, 2, 3] instanceof new MyClass() // true
```

`new MyClass()` retorna uma instância cujo `Symbol.hasInstance` personaliza `instanceof`.

Outro exemplo:

```javascript
class Even {
  static [Symbol.hasInstance](obj) {
    return Number(obj) % 2 === 0;
  }
}

// Equivalente a
const Even = {
  [Symbol.hasInstance](obj) {
    return Number(obj) % 2 === 0;
  }
};

1 instanceof Even // false
2 instanceof Even // true
12345 instanceof Even // false
```

### Symbol.isConcatSpreadable

`Symbol.isConcatSpreadable` é um booleano que controla se um objeto é expandido quando passado a `Array.prototype.concat()`:

```javascript
let arr1 = ['c', 'd'];
['a', 'b'].concat(arr1, 'e') // ['a', 'b', 'c', 'd', 'e']
arr1[Symbol.isConcatSpreadable] // undefined

let arr2 = ['c', 'd'];
arr2[Symbol.isConcatSpreadable] = false;
['a', 'b'].concat(arr2, 'e') // ['a', 'b', ['c','d'], 'e']
```

Arrays se expandem por padrão; `Symbol.isConcatSpreadable` é `undefined`. Definir como `false` impede a expansão.

Objetos array-like não se expandem por padrão. Defina `Symbol.isConcatSpreadable = true` para expandi-los:

```javascript
let obj = {length: 2, 0: 'c', 1: 'd'};
['a', 'b'].concat(obj, 'e') // ['a', 'b', obj, 'e']

obj[Symbol.isConcatSpreadable] = true;
['a', 'b'].concat(obj, 'e') // ['a', 'b', 'c', 'd', 'e']
```

Pode ser definido em uma classe:

```javascript
class A1 extends Array {
  constructor(args) {
    super(args);
    this[Symbol.isConcatSpreadable] = true;
  }
}
class A2 extends Array {
  constructor(args) {
    super(args);
  }
  get [Symbol.isConcatSpreadable] () {
    return false;
  }
}
let a1 = new A1();
a1[0] = 3;
a1[1] = 4;
let a2 = new A2();
a2[0] = 5;
a2[1] = 6;
[1, 2].concat(a1).concat(a2)
// [1, 2, 3, 4, [5, 6]]
```

### Symbol.species

`Symbol.species` aponta para o construtor usado ao criar objetos derivados:

```javascript
class MyArray extends Array {
}

const a = new MyArray(1, 2, 3);
const b = a.map(x => x);
const c = a.filter(x => x > 1);

b instanceof MyArray // true
c instanceof MyArray // true
```

Por padrão, métodos como `map` e `filter` retornam instâncias da subclasse. `Symbol.species` permite retornar a classe base:

```javascript
class MyArray extends Array {
  static get [Symbol.species]() { return Array; }
}

const a = new MyArray();
const b = a.map(x => x);

b instanceof MyArray // false
b instanceof Array // true
```

Comportamento padrão:

```javascript
static get [Symbol.species]() {
  return this;
}
```

Com subclasses de `Promise`:

```javascript
class T1 extends Promise {
}

class T2 extends Promise {
  static get [Symbol.species]() {
    return Promise;
  }
}

new T1(r => r()).then(v => v) instanceof T1 // true
new T2(r => r()).then(v => v) instanceof T2 // false
```

`Symbol.species` é usado quando instâncias derivadas (por exemplo de `then`, `map`, `filter`) devem ser criadas com um construtor específico.

### Symbol.match

`Symbol.match` é o método invocado quando um objeto é usado como argumento de `String.prototype.match`:

```javascript
String.prototype.match(regexp)
// Equivalente a
regexp[Symbol.match](this)

class MyMatcher {
  [Symbol.match](string) {
    return 'hello world'.indexOf(string);
  }
}

'e'.match(new MyMatcher()) // 1
```

### Symbol.replace

`Symbol.replace` é usado por `String.prototype.replace`:

```javascript
String.prototype.replace(searchValue, replaceValue)
// Equivalente a
searchValue[Symbol.replace](this, replaceValue)
```

Exemplo:

```javascript
const x = {};
x[Symbol.replace] = (...s) => console.log(s);

'Hello'.replace(x, 'World') // ["Hello", "World"]
```

O primeiro argumento é a string sendo substituída; o segundo é o substituto.

### Symbol.search

`Symbol.search` é usado por `String.prototype.search`:

```javascript
String.prototype.search(regexp)
// Equivalente a
regexp[Symbol.search](this)

class MySearch {
  constructor(value) {
    this.value = value;
  }
  [Symbol.search](string) {
    return string.indexOf(this.value);
  }
}
'foobar'.search(new MySearch('foo')) // 0
```

### Symbol.split

`Symbol.split` é usado por `String.prototype.split`:

```javascript
String.prototype.split(separator, limit)
// Equivalente a
separator[Symbol.split](this, limit)
```

Exemplo:

```javascript
class MySplitter {
  constructor(value) {
    this.value = value;
  }
  [Symbol.split](string) {
    let index = string.indexOf(this.value);
    if (index === -1) {
      return string;
    }
    return [
      string.substr(0, index),
      string.substr(index + this.value.length)
    ];
  }
}

'foobar'.split(new MySplitter('foo'))
// ['', 'bar']

'foobar'.split(new MySplitter('bar'))
// ['foo', '']

'foobar'.split(new MySplitter('baz'))
// 'foobar'
```

### Symbol.iterator

`Symbol.iterator` aponta para o método iterador padrão usado por `for...of` e o operador spread:

```javascript
const myIterable = {};
myIterable[Symbol.iterator] = function* () {
  yield 1;
  yield 2;
  yield 3;
};

[...myIterable] // [1, 2, 3]
```

Veja o capítulo sobre Iterator para detalhes.

```javascript
class Collection {
  *[Symbol.iterator]() {
    let i = 0;
    while(this[i] !== undefined) {
      yield this[i];
      ++i;
    }
  }
}

let myCollection = new Collection();
myCollection[0] = 1;
myCollection[1] = 2;

for(let value of myCollection) {
  console.log(value);
}
// 1
// 2
```

### Symbol.toPrimitive

`Symbol.toPrimitive` é o método chamado quando um objeto é convertido em primitivo. Recebe um hint: `'number'`, `'string'` ou `'default'`:

```javascript
let obj = {
  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case 'number':
        return 123;
      case 'string':
        return 'str';
      case 'default':
        return 'default';
      default:
        throw new Error();
     }
   }
};

2 * obj // 246
3 + obj // '3default'
obj == 'default' // true
String(obj) // 'str'
```

### Symbol.toStringTag

`Symbol.toStringTag` personaliza a string retornada por `Object.prototype.toString()`:

```javascript
// Exemplo 1
({[Symbol.toStringTag]: 'Foo'}.toString())
// "[object Foo]"

// Exemplo 2
class Collection {
  get [Symbol.toStringTag]() {
    return 'xxx';
  }
}
let x = new Collection();
Object.prototype.toString.call(x) // "[object xxx]"
```

Valores built-in ES6 de `Symbol.toStringTag`: `'JSON'`, `'Math'`, `'Module'`, `'ArrayBuffer'`, `'DataView'`, `'Map'`, `'Promise'`, `'Set'`, `'Uint8Array'` (etc.), `'WeakMap'`, `'WeakSet'`, `'Map Iterator'`, `'Set Iterator'`, `'String Iterator'`, `'Symbol'`, `'Generator'`, `'GeneratorFunction'`.

### Symbol.unscopables

`Symbol.unscopables` define quais propriedades são excluídas da busca no escopo de `with`:

```javascript
Array.prototype[Symbol.unscopables]
// {
//   copyWithin: true,
//   entries: true,
//   fill: true,
//   find: true,
//   findIndex: true,
//   includes: true,
//   keys: true
// }

Object.keys(Array.prototype[Symbol.unscopables])
// ['copyWithin', 'entries', 'fill', 'find', 'findIndex', 'includes', 'keys']
```

Sem unscopables:

```javascript
// sem unscopables
class MyClass {
  foo() { return 1; }
}

var foo = function () { return 2; };

with (MyClass.prototype) {
  foo(); // 1
}

// com unscopables
class MyClass {
  foo() { return 1; }
  get [Symbol.unscopables]() {
    return { foo: true };
  }
}

var foo = function () { return 2; };

with (MyClass.prototype) {
  foo(); // 2
}
```

Com `Symbol.unscopables`, `foo` no bloco `with` refere-se ao `foo` externo, não a `MyClass.prototype.foo`.
