# Novos Métodos do Object

Este capítulo apresenta os novos métodos adicionados ao objeto `Object`.

## Object.is()

O ES5 comparava dois valores com dois operadores: igualdade (`==`) e igualdade estrita (`===`). Ambos têm limitações: o primeiro faz coerção de tipo, e o segundo trata `NaN` como diferente de si mesmo e `+0` igual a `-0`. O JavaScript não tinha uma forma de expressar igualdade "mesmo valor" em todos os ambientes.

O ES6 introduz o algoritmo "Same-value equality" para resolver isso. `Object.is` é o novo método que o implementa. Ele compara dois valores por igualdade estrita e se comporta como o operador estrito (`===`) na maioria dos casos.

```javascript
Object.is('foo', 'foo')
// true
Object.is({}, {})
// false
```

As únicas diferenças são: `+0` não é igual a `-0`, e `NaN` é igual a si mesmo.

```javascript
+0 === -0 //true
NaN === NaN // false

Object.is(+0, -0) // false
Object.is(NaN, NaN) // true
```

No ES5, `Object.is` pode ser implementado assim:

```javascript
Object.defineProperty(Object, 'is', {
  value: function(x, y) {
    if (x === y) {
      // quando +0 !== -0
      return x !== 0 || 1 / x === 1 / y;
    }
    // quando NaN
    return x !== x && y !== y;
  },
  configurable: true,
  enumerable: false,
  writable: true
});
```

## Object.assign()

### Uso Básico

`Object.assign()` mescla objetos copiando todas as propriedades enumeráveis dos objetos fonte para o objeto alvo.

```javascript
const target = { a: 1 };

const source1 = { b: 2 };
const source2 = { c: 3 };

Object.assign(target, source1, source2);
target // {a:1, b:2, c:3}
```

O primeiro argumento é o alvo; os demais são fontes. Se o alvo e uma fonte têm a mesma propriedade, ou se várias fontes têm a mesma propriedade, o valor posterior sobrescreve o anterior.

```javascript
const target = { a: 1, b: 1 };

const source1 = { b: 2, c: 2 };
const source2 = { c: 3 };

Object.assign(target, source1, source2);
target // {a:1, b:2, c:3}
```

Com um único argumento, `Object.assign()` retorna esse argumento:

```javascript
const obj = {a: 1};
Object.assign(obj) === obj // true
```

Se o argumento não for um objeto, ele é convertido em objeto e então retornado:

```javascript
typeof Object.assign(2) // "object"
```

`undefined` e `null` não podem ser convertidos em objetos; passá-los como primeiro argumento lança erro:

```javascript
Object.assign(undefined) // Erro
Object.assign(null) // Erro
```

Se valores não-objeto aparecem em posições de fonte (ou seja, não como primeiro argumento), as regras são diferentes. Eles são convertidos em objetos e, se a conversão falhar, são ignorados. Assim, `undefined` e `null` como argumentos que não o primeiro não lançam erro:

```javascript
let obj = {a: 1};
Object.assign(obj, undefined) === obj // true
Object.assign(obj, null) === obj // true
```

Valores numéricos, string e booleanos em posições de fonte também não lançam. Apenas strings produzem efeito, sendo copiadas para o alvo como índices semelhantes a array:

```javascript
const v1 = 'abc';
const v2 = true;
const v3 = 10;

const obj = Object.assign({}, v1, v2, v3);
console.log(obj); // { "0": "a", "1": "b", "2": "c" }
```

No código acima, `v1`, `v2` e `v3` são string, booleano e número. Apenas a string é mesclada (como índices de caractere); números e booleanos são ignorados. Só objetos wrapper de string produzem propriedades enumeráveis:

```javascript
Object(true) // {[[PrimitiveValue]]: true}
Object(10)  //  {[[PrimitiveValue]]: 10}
Object('abc') // {0: "a", 1: "b", 2: "c", length: 3, [[PrimitiveValue]]: "abc"}
```

Ao converter booleanos, números e strings em objetos wrapper, o valor primitivo fica na propriedade interna `[[PrimitiveValue]]`, que `Object.assign()` não copia. Só o wrapper de string produz propriedades enumeráveis, e essas são copiadas.

`Object.assign()` copia apenas propriedades próprias enumeráveis; não copia propriedades herdadas ou não enumeráveis:

```javascript
Object.assign({b: 'c'},
  Object.defineProperty({}, 'invisible', {
    enumerable: false,
    value: 'hello'
  })
)
// { b: 'c' }
```

No código acima, a fonte tem uma única propriedade não enumerável `invisible`, que não é copiada.

Propriedades com chaves Symbol também são copiadas por `Object.assign()`:

```javascript
Object.assign({ a: 'b' }, { [Symbol('c')]: 'd' })
// { a: 'b', Symbol(c): 'd' }
```

### Observações

**(1)Cópia Superficial**

`Object.assign()` faz cópia superficial. Se o valor de uma propriedade fonte for um objeto, o alvo recebe uma referência a esse objeto, não uma cópia:

```javascript
const obj1 = {a: {b: 1}};
const obj2 = Object.assign({}, obj1);

obj1.a.b = 2;
obj2.a.b // 2
```

No código acima, `obj1.a` é um objeto. `Object.assign()` copia uma referência; alterações nesse objeto afetam tanto `obj1` quanto `obj2`.

**(2)Substituição de Propriedades de Mesmo Nome**

Para objetos aninhados, quando a mesma propriedade existe no alvo e na fonte, `Object.assign()` substitui, não mescla:

```javascript
const target = { a: { b: 'c', d: 'e' } }
const source = { a: { b: 'hello' } }
Object.assign(target, source)
// { a: { b: 'hello' } }
```

No código acima, `target.a` é completamente substituído por `source.a`; o resultado não é `{ a: { b: 'hello', d: 'e' } }`. Bibliotecas como `_.defaultsDeep()` do Lodash fornecem alternativas de mesclagem profunda.

**(3)Tratamento de Arrays**

`Object.assign()` pode operar em arrays, mas os trata como objetos com chaves numéricas:

```javascript
Object.assign([1, 2, 3], [4, 5])
// [4, 5, 3]
```

Aqui os índices 0 e 1 da fonte sobrescrevem os do alvo.

**(4)Tratamento de Getters**

`Object.assign()` copia valores. Se uma propriedade fonte for um getter, o valor é lido e esse valor é copiado:

```javascript
const source = {
  get foo() { return 1 }
};
const target = {};

Object.assign(target, source)
// { foo: 1 }
```

O getter em si não é copiado; apenas seu valor retornado é atribuído.

### Usos Comuns

**(1)Adicionar Propriedades a Objetos**

```javascript
class Point {
  constructor(x, y) {
    Object.assign(this, {x, y});
  }
}
```

`Object.assign()` adiciona `x` e `y` à instância de `Point`.

**(2)Adicionar Métodos a Objetos**

```javascript
Object.assign(SomeClass.prototype, {
  someMethod(arg1, arg2) {
    ···
  },
  anotherMethod() {
    ···
  }
});

// Equivalente ao abaixo
SomeClass.prototype.someMethod = function (arg1, arg2) {
  ···
};
SomeClass.prototype.anotherMethod = function () {
  ···
};
```

O exemplo usa sintaxe abreviada para adicionar dois métodos a `SomeClass.prototype`.

**(3)Clonar Objetos**

```javascript
function clone(origin) {
  return Object.assign({}, origin);
}
```

Isso clona as propriedades próprias da origem em um objeto vazio.

Para preservar a cadeia de protótipo:

```javascript
function clone(origin) {
  let originProto = Object.getPrototypeOf(origin);
  return Object.assign(Object.create(originProto), origin);
}
```

**(4)Mesclar Múltiplos Objetos**

```javascript
const merge =
  (target, ...sources) => Object.assign(target, ...sources);
```

Para mesclar em um novo objeto em vez de alterar o alvo:

```javascript
const merge =
  (...sources) => Object.assign({}, ...sources);
```

**(5)Especificar Valores Padrão**

```javascript
const DEFAULTS = {
  logLevel: 0,
  outputFormat: 'html'
};

function processContent(options) {
  options = Object.assign({}, DEFAULTS, options);
  console.log(options);
  // ...
}
```

`DEFAULTS` fornece os padrões; `options` os sobrescreve quando mesclado.

Como a mesclagem é superficial, evite objetos aninhados nos padrões:

```javascript
const DEFAULTS = {
  url: {
    host: 'example.com',
    port: 7070
  },
};

processContent({ url: {port: 8000} })
// {
//   url: {port: 8000}
// }
```

A intenção era alterar apenas `url.port`, mas `options.url` substitui todo `DEFAULTS.url`, então `url.host` é perdido.

## Object.getOwnPropertyDescriptors()

O ES5 tem `Object.getOwnPropertyDescriptor()` que retorna o descriptor de uma única propriedade. O ES2017 adiciona `Object.getOwnPropertyDescriptors()`, que retorna os descriptors de todas as propriedades próprias (não herdadas):

```javascript
const obj = {
  foo: 123,
  get bar() { return 'abc' }
};

Object.getOwnPropertyDescriptors(obj)
// { foo:
//    { value: 123,
//      writable: true,
//      enumerable: true,
//      configurable: true },
//   bar:
//    { get: [Function: get bar],
//      set: undefined,
//      enumerable: true,
//      configurable: true } }
```

O objeto retornado mapeia cada nome de propriedade ao seu descriptor.

Uma implementação simples:

```javascript
function getOwnPropertyDescriptors(obj) {
  const result = {};
  for (let key of Reflect.ownKeys(obj)) {
    result[key] = Object.getOwnPropertyDescriptor(obj, key);
  }
  return result;
}
```

`Object.getOwnPropertyDescriptors()` resolve o fato de que `Object.assign()` não copia corretamente getters e setters:

```javascript
const source = {
  set foo(value) {
    console.log(value);
  }
};

const target1 = {};
Object.assign(target1, source);

Object.getOwnPropertyDescriptor(target1, 'foo')
// { value: undefined,
//   writable: true,
//   enumerable: true,
//   configurable: true }
```

Aqui, `source.foo` é um setter, mas `Object.assign` copia apenas o valor, transformando em propriedade simples.

Usando `Object.getOwnPropertyDescriptors()` com `Object.defineProperties()` preserva os accessors:

```javascript
const source = {
  set foo(value) {
    console.log(value);
  }
};

const target2 = {};
Object.defineProperties(target2, Object.getOwnPropertyDescriptors(source));
Object.getOwnPropertyDescriptor(target2, 'foo')
// { get: undefined,
//   set: [Function: set foo],
//   enumerable: true,
//   configurable: true }
```

Mesclagem superficial com tratamento correto de descriptors:

```javascript
const shallowMerge = (target, source) => Object.defineProperties(
  target,
  Object.getOwnPropertyDescriptors(source)
);
```

Outro uso: clonar um objeto (superficialmente) preservando descriptors:

```javascript
const clone = Object.create(Object.getPrototypeOf(obj),
  Object.getOwnPropertyDescriptors(obj));

// Ou

const shallowClone = (obj) => Object.create(
  Object.getPrototypeOf(obj),
  Object.getOwnPropertyDescriptors(obj)
);
```

Também pode expressar herança:

```javascript
const obj = {
  __proto__: prot,
  foo: 123,
};
```

O ES6 especifica que `__proto__` só precisa existir em browsers. Sem ele:

```javascript
const obj = Object.create(prot);
obj.foo = 123;

// Ou

const obj = Object.assign(
  Object.create(prot),
  {
    foo: 123,
  }
);
```

Com `Object.getOwnPropertyDescriptors()`:

```javascript
const obj = Object.create(
  prot,
  Object.getOwnPropertyDescriptors({
    foo: 123,
  })
);
```

Padrão de mixin:

```javascript
let mix = (object) => ({
  with: (...mixins) => mixins.reduce(
    (c, mixin) => Object.create(
      c, Object.getOwnPropertyDescriptors(mixin)
    ), object)
});

// multiple mixins example
let a = {a: 'a'};
let b = {b: 'b'};
let c = {c: 'c'};
let d = mix(c).with(a, b);

d.c // "c"
d.b // "b"
d.a // "a"
```

Aqui `d` é um objeto que mistura `a` e `b` em `c`.

## `__proto__`, Object.setPrototypeOf(), Object.getPrototypeOf()

O JavaScript usa a cadeia de protótipos para herança. O ES6 adiciona mais formas de trabalhar com protótipos.

### Propriedade `__proto__`

A propriedade `__proto__` (duplo sublinhado de cada lado) lê ou define o protótipo do objeto. Browsers (incluindo IE11) a suportam.

```javascript
// estilo ES5
const obj = {
  method: function() { ... }
};
obj.__proto__ = someOtherObj;

// estilo ES6
var obj = Object.create(someOtherObj);
obj.method = function() { ... };
```

`__proto__` está no anexo do ES6, não no spec principal, pois é uma propriedade interna. Foi incluída por compatibilidade com browsers. Prefira `Object.setPrototypeOf()` (escrita), `Object.getPrototypeOf()` (leitura) e `Object.create()` (criação).

`__proto__` é implementada via `Object.prototype.__proto__`:

```javascript
Object.defineProperty(Object.prototype, '__proto__', {
  get() {
    let _thisObj = Object(this);
    return Object.getPrototypeOf(_thisObj);
  },
  set(proto) {
    if (this === undefined || this === null) {
      throw new TypeError();
    }
    if (!isObject(this)) {
      return undefined;
    }
    if (!isObject(proto)) {
      return undefined;
    }
    let status = Reflect.setPrototypeOf(this, proto);
    if (!status) {
      throw new TypeError();
    }
  },
});

function isObject(value) {
  return Object(value) === value;
}
```

Se um objeto define seu próprio `__proto__`, esse valor é seu protótipo:

```javascript
Object.getPrototypeOf({ __proto__: null })
// null
```

### Object.setPrototypeOf()

`Object.setPrototypeOf` define o protótipo de um objeto e retorna o objeto. É a forma recomendada no ES6:

```javascript
// formato
Object.setPrototypeOf(object, prototype)

// uso
const o = Object.setPrototypeOf({}, null);
```

Equivalente a:

```javascript
function setPrototypeOf(obj, proto) {
  obj.__proto__ = proto;
  return obj;
}
```

Exemplo:

```javascript
let proto = {};
let obj = { x: 10 };
Object.setPrototypeOf(obj, proto);

proto.y = 20;
proto.z = 40;

obj.x // 10
obj.y // 20
obj.z // 40
```

`proto` é definido como protótipo de `obj`, então `obj` pode acessar as propriedades de `proto`.

Se o primeiro argumento for primitivo, ele é convertido em objeto. O retorno ainda é o primeiro argumento, então a operação não tem efeito prático:

```javascript
Object.setPrototypeOf(1, {}) === 1 // true
Object.setPrototypeOf('foo', {}) === 'foo' // true
Object.setPrototypeOf(true, {}) === true // true
```

`undefined` e `null` não podem ser convertidos em objetos, então usá-los como primeiro argumento lança erro:

```javascript
Object.setPrototypeOf(undefined, {})
// TypeError: Object.setPrototypeOf called on null or undefined

Object.setPrototypeOf(null, {})
// TypeError: Object.setPrototypeOf called on null or undefined
```

### Object.getPrototypeOf()

Este método lê o protótipo de um objeto:

```javascript
Object.getPrototypeOf(obj);
```

Exemplo:

```javascript
function Rectangle() {
  // ...
}

const rec = new Rectangle();

Object.getPrototypeOf(rec) === Rectangle.prototype
// true

Object.setPrototypeOf(rec, Object.prototype);
Object.getPrototypeOf(rec) === Rectangle.prototype
// false
```

Se o argumento não for objeto, ele é convertido:

```javascript
// Equivalente a Object.getPrototypeOf(Number(1))
Object.getPrototypeOf(1)
// Number {[[PrimitiveValue]]: 0}

// Equivalente a Object.getPrototypeOf(String('foo'))
Object.getPrototypeOf('foo')
// String {length: 0, [[PrimitiveValue]]: ""}

// Equivalente a Object.getPrototypeOf(Boolean(true))
Object.getPrototypeOf(true)
// Boolean {[[PrimitiveValue]]: false}

Object.getPrototypeOf(1) === Number.prototype // true
Object.getPrototypeOf('foo') === String.prototype // true
Object.getPrototypeOf(true) === Boolean.prototype // true
```

`undefined` e `null` não podem ser convertidos e lançarão erro:

```javascript
Object.getPrototypeOf(null)
// TypeError: Cannot convert undefined or null to object

Object.getPrototypeOf(undefined)
// TypeError: Cannot convert undefined or null to object
```

## Object.keys(), Object.values(), Object.entries()

### Object.keys()

O ES5 introduziu `Object.keys`, que retorna um array com as chaves das propriedades próprias enumeráveis:

```javascript
var obj = { foo: 'bar', baz: 42 };
Object.keys(obj)
// ["foo", "baz"]
```

O ES2017 [adicionou](https://github.com/tc39/proposal-object-values-entries) `Object.values` e `Object.entries` para complementar `Object.keys` para uso com `for...of`:

```javascript
let {keys, values, entries} = Object;
let obj = { a: 1, b: 2, c: 3 };

for (let key of keys(obj)) {
  console.log(key); // 'a', 'b', 'c'
}

for (let value of values(obj)) {
  console.log(value); // 1, 2, 3
}

for (let [key, value] of entries(obj)) {
  console.log([key, value]); // ['a', 1], ['b', 2], ['c', 3]
}
```

### Object.values()

`Object.values` retorna um array com os valores das propriedades próprias enumeráveis:

```javascript
const obj = { foo: 'bar', baz: 42 };
Object.values(obj)
// ["bar", 42]
```

A ordem das propriedades segue as mesmas regras de percorrimento (chaves numéricas primeiro, depois string, depois Symbol):

```javascript
const obj = { 100: 'a', 2: 'b', 7: 'c' };
Object.values(obj)
// ["b", "c", "a"]
```

`Object.values` retorna apenas propriedades próprias enumeráveis:

```javascript
const obj = Object.create({}, {p: {value: 42}});
Object.values(obj) // []
```

Por padrão, propriedades do segundo parâmetro de `Object.create` têm `enumerable: false`, então não são incluídas. Defina `enumerable: true` para incluí-las:

```javascript
const obj = Object.create({}, {p:
  {
    value: 42,
    enumerable: true
  }
});
Object.values(obj) // [42]
```

`Object.values` ignora propriedades com chave Symbol:

```javascript
Object.values({ [Symbol()]: 123, foo: 'abc' });
// ['abc']
```

Se o argumento for string, retorna um array de caracteres:

```javascript
Object.values('foo')
// ['f', 'o', 'o']
```

Se o argumento não for objeto, ele é convertido. Números e booleanos não têm propriedades próprias enumeráveis, então retornam array vazio:

```javascript
Object.values(42) // []
Object.values(true) // []
```

### Object.entries()

`Object.entries()` retorna um array de pares `[chave, valor]` para todas as propriedades próprias enumeráveis:

```javascript
const obj = { foo: 'bar', baz: 42 };
Object.entries(obj)
// [ ["foo", "bar"], ["baz", 42] ]
```

Se comporta como `Object.values`, exceto pelo formato do retorno. Propriedades com chave Symbol são ignoradas:

```javascript
Object.entries({ [Symbol()]: 123, foo: 'abc' });
// [ [ 'foo', 'abc' ] ]
```

Uso básico—iterar sobre propriedades:

```javascript
let obj = { one: 1, two: 2 };
for (let [k, v] of Object.entries(obj)) {
  console.log(
    `${JSON.stringify(k)}: ${JSON.stringify(v)}`
  );
}
// "one": 1
// "two": 2
```

Converter um objeto em `Map`:

```javascript
const obj = { foo: 'bar', baz: 42 };
const map = new Map(Object.entries(obj));
map // Map { foo: "bar", baz: 42 }
```

Implementação simples:

```javascript
// versão função Generator
function* entries(obj) {
  for (let key of Object.keys(obj)) {
    yield [key, obj[key]];
  }
}

// Versão não-Generator
function entries(obj) {
  let arr = [];
  for (let key of Object.keys(obj)) {
    arr.push([key, obj[key]]);
  }
  return arr;
}
```

## Object.fromEntries()

`Object.fromEntries()` é o inverso de `Object.entries()`, transformando um array de pares chave-valor em objeto:

```javascript
Object.fromEntries([
  ['foo', 'bar'],
  ['baz', 42]
])
// { foo: "bar", baz: 42 }
```

É especialmente útil para converter um `Map` em objeto:

```javascript
// Exemplo 1
const entries = new Map([
  ['foo', 'bar'],
  ['baz', 42]
]);

Object.fromEntries(entries)
// { foo: "bar", baz: 42 }

// Exemplo 2
const map = new Map().set('foo', true).set('bar', false);
Object.fromEntries(map)
// { foo: true, bar: false }
```

Outro uso: converter string de query em objeto com `URLSearchParams`:

```javascript
Object.fromEntries(new URLSearchParams('foo=bar&baz=qux'))
// { foo: "bar", baz: "qux" }
```

## Object.hasOwn()

Propriedades de objeto podem ser próprias ou herdadas. O método de instância `hasOwnProperty()` verifica propriedades próprias. O ES2022 adiciona o método estático [`Object.hasOwn()`](https://github.com/tc39/proposal-accessible-object-hasownproperty) para o mesmo fim.

`Object.hasOwn()` recebe dois argumentos: o objeto e o nome da propriedade:

```javascript
const foo = Object.create({ a: 123 });
foo.b = 456;

Object.hasOwn(foo, 'a') // false
Object.hasOwn(foo, 'b') // true
```

No exemplo acima, `a` é herdada e `b` é própria. `Object.hasOwn()` retorna `false` para `a` e `true` para `b`.

`Object.hasOwn()` não lança erro para objetos que não herdam de `Object.prototype`, diferentemente de `hasOwnProperty()`:

```javascript
const obj = Object.create(null);

obj.hasOwnProperty('foo') // Erro
Object.hasOwn(obj, 'foo') // false
```

`Object.create(null)` cria um objeto sem protótipo. Chamar `obj.hasOwnProperty()` lança erro, mas `Object.hasOwn()` trata isso corretamente.
