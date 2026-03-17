# Extensões de Objetos

O objeto é a estrutura de dados mais importante em JavaScript. O ES6 fez aprimoramentos significativos nele. Este capítulo descreve as mudanças na estrutura de dados em si; o próximo capítulo apresenta os novos métodos adicionados ao objeto `Object`.

## Sintaxe Concisa de Propriedades

O ES6 permite escrever variáveis e funções diretamente dentro de chaves como propriedades e métodos do objeto. Isso torna a sintaxe mais concisa.

```javascript
const foo = 'bar';
const baz = {foo};
baz // {foo: "bar"}

// Equivalente a
const baz = {foo: foo};
```

No código acima, a variável `foo` é escrita diretamente dentro das chaves. O nome da propriedade passa a ser o nome da variável e o valor da propriedade passa a ser o valor da variável. Abaixo está outro exemplo.

```javascript
function f(x, y) {
  return {x, y};
}

// Equivalente a

function f(x, y) {
  return {x: x, y: y};
}

f(1, 2) // Object {x: 1, y: 2}
```

Além da abreviação de propriedades, os métodos também podem usar a forma abreviada.

```javascript
const o = {
  method() {
    return "Hello!";
  }
};

// Equivalente a

const o = {
  method: function() {
    return "Hello!";
  }
};
```

Abaixo está um exemplo prático.

```javascript
let birth = '2000/01/01';

const Person = {

  name: 'John',

  //equivalente a birth: birth
  birth,

  // Equivalente ahello: function ()...
  hello() { console.log('Meu nome é', this.name); }

};
```

Essa sintaxe é muito conveniente para valores de retorno de funções.

```javascript
function getPoint() {
  const x = 1;
  const y = 10;
  return {x, y};
}

getPoint()
// {x:1, y:10}
```

Quando um módulo CommonJS exporta um conjunto de variáveis, a sintaxe abreviada se adequa bem.

```javascript
let ms = {};

function getItem (key) {
  return key in ms ? ms[key] : null;
}

function setItem (key, value) {
  ms[key] = value;
}

function clear () {
  ms = {};
}

module.exports = { getItem, setItem, clear };
// Equivalente a
module.exports = {
  getItem: getItem,
  setItem: setItem,
  clear: clear
};
```

Getters e setters também usam essa forma abreviada.

```javascript
const cart = {
  _wheels: 4,

  get wheels () {
    return this._wheels;
  },

  set wheels (value) {
    if (value < this._wheels) {
      throw new Error('Valor muito pequeno!');
    }
    this._wheels = value;
  }
}
```

A abreviação também é útil ao registrar objetos no log.

```javascript
let user = {
  name: 'test'
};

let foo = {
  bar: 'baz'
};

console.log(user, foo)
// {name: "test"} {bar: "baz"}
console.log({user, foo})
// {user: {name: "test"}, foo: {bar: "baz"}}
```

No código acima, quando `console.log` imprime `user` e `foo` diretamente, obtemos dois grupos de pares chave-valor, o que pode ser confuso. Colocá-los entre chaves produz a notação abreviada, com os nomes dos objetos impressos antes de cada grupo, tornando mais claro.

Observação: métodos abreviados de objetos não podem ser usados como construtores; isso lançará um erro.

```javascript
const obj = {
  f() {
    this.foo = 'bar';
  }
};

new obj.f() // Erro
```

No código acima, `f` é um método abreviado de objeto, então `obj.f` não pode ser usado como construtor.

## Expressões como Nome de Propriedade

Existem duas formas de definir propriedades de objetos em JavaScript.

```javascript
// Método 1
obj.foo = true;

// Método 2
obj['a' + 'bc'] = 123;
```

O primeiro método usa um identificador diretamente como nome da propriedade; o segundo usa uma expressão como nome da propriedade, que deve estar entre colchetes.

Porém, ao definir objetos com literais (chaves), o ES5 permitia apenas o método um (identificadores) para nomes de propriedades.

```javascript
var obj = {
  foo: true,
  abc: 123
};
```

O ES6 permite usar o método dois (expressões) para nomes de propriedades ao definir objetos com literais — coloque a expressão entre colchetes.

```javascript
let propKey = 'foo';

let obj = {
  [propKey]: true,
  ['a' + 'bc']: 123
};
```

Abaixo está outro exemplo.

```javascript
let lastWord = 'last word';

const a = {
  'first word': 'hello',
  [lastWord]: 'world'
};

a['first word'] // "hello"
a[lastWord] // "world"
a['last word'] // "world"
```

Expressões também podem ser usadas para nomes de métodos.

```javascript
let obj = {
  ['h' + 'ello']() {
    return 'hi';
  }
};

obj.hello() // hi
```

Observação: expressões como nome de propriedade e sintaxe abreviada não podem ser usadas juntas; isso lançará um erro.

```javascript
// Erro
const foo = 'bar';
const bar = 'abc';
const baz = { [foo] };

// Correto
const foo = 'bar';
const baz = { [foo]: 'abc'};
```

Observação: se a expressão de nome de propriedade for um objeto, ele será automaticamente convertido para a string `[object Object]`, o que pode ser problemático.

```javascript
const keyA = {a: 1};
const keyB = {b: 2};

const myObject = {
  [keyA]: 'valueA',
  [keyB]: 'valueB'
};

myObject // Object {[object Object]: "valueB"}
```

No código acima, tanto `[keyA]` quanto `[keyB]` resolvem para `[object Object]`, então `[keyB]` sobrescreve `[keyA]` e `myObject` acaba com apenas uma propriedade `[object Object]`.

## A Propriedade name de Métodos

A propriedade `name` de uma função retorna o nome da função. Métodos de objeto são funções, portanto também têm a propriedade `name`.

```javascript
const person = {
  sayName() {
    console.log('hello!');
  },
};

person.sayName.name   // "sayName"
```

No código acima, a propriedade `name` do método retorna o nome da função (ou seja, o nome do método).

Para getters e setters, a propriedade `name` não fica no próprio método, mas nas propriedades `get` e `set` do descriptor, prefixadas com `get` e `set`.

```javascript
const obj = {
  get foo() {},
  set foo(x) {}
};

obj.foo.name
// TypeError: Cannot read property 'name' of undefined

const descriptor = Object.getOwnPropertyDescriptor(obj, 'foo');

descriptor.get.name // "get foo"
descriptor.set.name // "set foo"
```

Existem dois casos especiais: funções criadas por `bind` têm `name` retornando `bound` mais o nome da função original; funções criadas com o construtor `Function` têm `name` retornando `anonymous`.

```javascript
(new Function()).name // "anonymous"

var doSomething = function() {
  // ...
};
doSomething.bind().name // "bound doSomething"
```

Se um método de objeto for um valor Symbol, a propriedade `name` retorna a descrição desse Symbol.

```javascript
const key1 = Symbol('description');
const key2 = Symbol();
let obj = {
  [key1]() {},
  [key2]() {},
};
obj[key1].name // "[description]"
obj[key2].name // ""
```

No código acima, o Symbol de `key1` tem descrição; `key2` não tem.

## Enumerabilidade e Percorrimento de Propriedades

### Enumerabilidade

Cada propriedade de um objeto tem um descriptor que controla seu comportamento. `Object.getOwnPropertyDescriptor` pode recuperar esse descriptor.

```javascript
let obj = { foo: 123 };
Object.getOwnPropertyDescriptor(obj, 'foo')
//  {
//    value: 123,
//    writable: true,
//    enumerable: true,
//    configurable: true
//  }
```

A propriedade `enumerable` do descriptor, chamada "enumerabilidade", indica se certas operações ignorarão a propriedade quando ela for `false`.

Quatro operações ignoram propriedades com `enumerable` definido como `false`:

- Loop `for...in`: percorre apenas propriedades próprias e herdadas enumeráveis.
- `Object.keys()`: retorna as chaves de todas as propriedades próprias enumeráveis.
- `JSON.stringify()`: serializa apenas propriedades próprias enumeráveis.
- `Object.assign()`: ignora propriedades com `enumerable` false e copia apenas propriedades próprias enumeráveis.

Dessas, as três primeiras existiam no ES5; `Object.assign()` é novo no ES6. Apenas `for...in` retorna propriedades herdadas; as outras três operam apenas sobre propriedades próprias. O propósito original de "enumerabilidade" foi permitir que algumas propriedades fossem ignoradas por `for...in` para que propriedades e métodos internos não aparecessem. Por exemplo, `Object.prototype.toString` e a propriedade `length` de arrays têm `enumerable: false` e por isso não são percorridos por `for...in`.

```javascript
Object.getOwnPropertyDescriptor(Object.prototype, 'toString').enumerable
// false

Object.getOwnPropertyDescriptor([], 'length').enumerable
// false
```

No código acima, tanto `toString` quanto `length` têm `enumerable: false`, então `for...in` não os inclui.

O ES6 também especifica que todos os métodos de protótipo de classes são não enumeráveis.

```javascript
Object.getOwnPropertyDescriptor(class {foo() {}}.prototype, 'foo').enumerable
// false
```

Em geral, incluir propriedades herdadas complica as operações. Na maioria dos casos nos importamos apenas com propriedades próprias, então prefira `Object.keys()` ao invés de `for...in`.

### Percorrimento de Propriedades

O ES6 fornece cinco formas de percorrer propriedades de objetos.

**(1)for...in**

`for...in` percorre propriedades próprias e herdadas enumeráveis (excluindo propriedades Symbol).

**(2)Object.keys(obj)**

`Object.keys` retorna um array com as chaves das propriedades próprias (não herdadas) enumeráveis (excluindo propriedades Symbol).

**(3)Object.getOwnPropertyNames(obj)**

`Object.getOwnPropertyNames` retorna um array com todas as chaves de propriedades próprias (excluindo Symbol, mas incluindo não enumeráveis).

**(4)Object.getOwnPropertySymbols(obj)**

`Object.getOwnPropertySymbols` retorna um array com todas as chaves de propriedades Symbol próprias.

**(5)Reflect.ownKeys(obj)**

`Reflect.ownKeys` retorna um array com todas as chaves próprias (não herdadas), sejam Symbol ou string, e sejam ou não enumeráveis.

Esses cinco métodos seguem a mesma ordem de percorrimento:

- Primeiro, todas as chaves numéricas em ordem ascendente.
- Depois, todas as chaves string na ordem de adição.
- Por fim, todas as chaves Symbol na ordem de adição.

```javascript
Reflect.ownKeys({ [Symbol()]:0, b:0, 10:0, 2:0, a:0 })
// ['2', '10', 'b', 'a', Symbol()]
```

No código acima, `Reflect.ownKeys` retorna um array com todas as propriedades do objeto passado: chaves numéricas `2` e `10`, depois chaves string `b` e `a`, depois propriedades Symbol.

## A Palavra-chave super

A palavra-chave `this` sempre se refere ao objeto atual. O ES6 adiciona outra palavra-chave, `super`, que se refere ao protótipo do objeto atual.

```javascript
const proto = {
  foo: 'hello'
};

const obj = {
  foo: 'world',
  find() {
    return super.foo;
  }
};

Object.setPrototypeOf(obj, proto);
obj.find() // "hello"
```

No código acima, dentro de `obj.find()`, `super.foo` se refere à propriedade `foo` no protótipo `proto`.

Observação: quando `super` se refere ao protótipo, ele só pode ser usado dentro de métodos de objeto; usar em outro lugar lançará um erro.

```javascript
// Erro
const obj = {
  foo: super.foo
}

// Erro
const obj = {
  foo: () => super.foo
}

// Erro
const obj = {
  foo: function () {
    return super.foo
  }
}
```

Os três usos de `super` acima lançam erros porque o engine os trata como fora de métodos de objeto. O primeiro usa `super` em uma propriedade; o segundo e terceiro usam `super` dentro de uma função atribuída a `foo`. Apenas a sintaxe abreviada de método de objeto permite que o engine identifique de forma confiável métodos de objeto.

Internamente, `super.foo` equivale a `Object.getPrototypeOf(this).foo` (para propriedades) ou `Object.getPrototypeOf(this).foo.call(this)` (para métodos).

```javascript
const proto = {
  x: 'hello',
  foo() {
    console.log(this.x);
  },
};

const obj = {
  x: 'world',
  foo() {
    super.foo();
  }
}

Object.setPrototypeOf(obj, proto);

obj.foo() // "world"
```

No código acima, `super.foo` aponta para `proto.foo`, mas `this` continua vinculado a `obj`, então a saída é `world`.

## Operador Spread em Objetos

O operador spread (`...`) foi introduzido no capítulo sobre extensões de array. O [ES2018](https://github.com/sebmarkbage/ecmascript-rest-spread) o adicionou a objetos.

### Atribuição por Desestruturação

A desestruturação de objeto extrai valores de um objeto, atribuindo todas as propriedades próprias enumeráveis que ainda não foram lidas ao objeto especificado. Todas as chaves e seus valores são copiados para o novo objeto.

```javascript
let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };
x // 1
y // 2
z // { a: 3, b: 4 }
```

No código acima, `z` é o destino da desestruturação com spread. Ele recebe todas as chaves não lidas (`a` e `b`) e as copia com seus valores.

O lado direito da desestruturação deve ser um objeto. Se for `undefined` ou `null`, um erro é lançado porque não podem ser convertidos em objetos.

```javascript
let { ...z } = null; // erro em tempo de execução
let { ...z } = undefined; // erro em tempo de execução
```

O spread na desestruturação deve ser o último parâmetro; caso contrário ocorre erro de sintaxe.

```javascript
let { ...x, y, z } = someObject; // erro de sintaxe
let { x, ...y, ...z } = someObject; // erro de sintaxe
```

No código acima, o spread não é o último parâmetro, então lança um erro.

Observação: a desestruturação com spread faz uma cópia superficial. Se o valor de uma propriedade for um tipo composto (array, objeto, função), a cópia é por referência, não um clone.

```javascript
let obj = { a: { b: 1 } };
let { ...x } = obj;
obj.a.b = 2;
x.a.b // 2
```

No código acima, `x` é o destino do spread e recebe uma referência a `obj.a`. Alterações nesse objeto afetam `x` também.

A desestruturação com spread não copia propriedades herdadas.

```javascript
let o1 = { a: 1 };
let o2 = { b: 2 };
o2.__proto__ = o1;
let { ...o3 } = o2;
o3 // { b: 2 }
o3.a // undefined
```

No código acima, `o3` copia `o2`, mas apenas propriedades próprias; propriedades herdadas de `o1` não são copiadas.

Outro exemplo:

```javascript
const o = Object.create({ x: 1, y: 2 });
o.z = 3;

let { x, ...newObj } = o;
let { y, z } = newObj;
x // 1
y // undefined
z // 3
```

No código acima, `x` é desestruturação simples e pode ler propriedades herdadas. `y` e `z` vêm da desestruturação com spread e só podem ler propriedades próprias, então `z` recebe um valor mas `y` não. O ES6 exige que em declarações de variáveis, quando se usa desestruturação com spread, o que segue `...` deve ser um nome de variável, não outra expressão de desestruturação. Por isso `newObj` é usado; o seguinte lançaria erro:

```javascript
let { x, ...{ y, z } } = o;
// SyntaxError: ... must be followed by an identifier in declaration contexts
```

Um uso da desestruturação com spread é estender os parâmetros de uma função delegando o restante.

```javascript
function baseFunction({ a, b }) {
  // ...
}
function wrapperFunction({ x, y, ...restConfig }) {
  // Usar params x e y
  // resto passado à função original
  return baseFunction(restConfig);
}
```

No código acima, `baseFunction` espera `a` e `b`. `wrapperFunction` a estende aceitando parâmetros extras mantendo o comportamento original.

### Operador Spread

O operador spread em objetos (`...`) copia todas as propriedades enumeráveis do objeto fonte para o objeto atual.

```javascript
let z = { a: 3, b: 4 };
let n = { ...z };
n // { a: 3, b: 4 }
```

Arrays são objetos, então o operador spread também funciona com eles.

```javascript
let foo = { ...['a', 'b', 'c'] };
foo
// {0: "a", 1: "b", 2: "c"}
```

Se o operando após o spread for um objeto vazio, nada é adicionado.

```javascript
{...{}, a: 1}
// { a: 1 }
```

Se o operando não for um objeto, ele é convertido em um.

```javascript
// Equivalente a {...Object(1)}
{...1} // {}
```

No código acima, o inteiro `1` é convertido no objeto wrapper `Number{1}`. Ele não tem propriedades próprias, então o resultado é um objeto vazio.

Lógica similar se aplica nestes exemplos:

```javascript
// Equivalente a {...Object(true)}
{...true} // {}

// Equivalente a {...Object(undefined)}
{...undefined} // {}

// Equivalente a {...Object(null)}
{...null} // {}
```

Se o operando for uma string, ela é convertida em um objeto semelhante a array, então o resultado não é vazio:

```javascript
{...'hello'}
// {0: "h", 1: "e", 2: "l", 3: "l", 4: "o"}
```

O operador spread em objetos retorna apenas propriedades próprias enumeráveis. Isso importa especialmente ao fazer spread de instâncias de classes.

```javascript
class C {
  p = 12;
  m() {}
}

let c = new C();
let clone = { ...c };

clone.p; // ok
clone.m(); // Erro
```

No exemplo acima, `c` é uma instância de `C`. Fazer spread dele inclui apenas a propriedade própria `c.p`, não o método `c.m()`, que está no protótipo (veja o capítulo sobre Classes).

O operador spread em objetos equivale a `Object.assign()`:

```javascript
let aClone = { ...a };
// Equivalente a
let aClone = Object.assign({}, a);
```

O exemplo acima copia apenas propriedades de instância. Para clonar completamente um objeto incluindo propriedades do protótipo, use:

```javascript
// Estilo 1
const clone1 = {
  __proto__: Object.getPrototypeOf(obj),
  ...obj
};

// Estilo 2
const clone2 = Object.assign(
  Object.create(Object.getPrototypeOf(obj)),
  obj
);

// Estilo 3
const clone3 = Object.create(
  Object.getPrototypeOf(obj),
  Object.getOwnPropertyDescriptors(obj)
)
```

No código acima, `__proto__` pode não estar disponível em ambientes não-browser, então a abordagem dois ou três é preferida.

O spread pode mesclar dois objetos:

```javascript
let ab = { ...a, ...b };
// Equivalente a
let ab = Object.assign({}, a, b);
```

Propriedades colocadas após o spread sobrescrevem as que estão dentro dele:

```javascript
let aWithOverrides = { ...a, x: 1, y: 2 };
// Equivalente a
let aWithOverrides = { ...a, ...{ x: 1, y: 2 } };
// Equivalente a
let x = 1, y = 2, aWithOverrides = { ...a, x, y };
// Equivalente a
let aWithOverrides = Object.assign({}, a, { x: 1, y: 2 });
```

No código acima, `x` e `y` de `a` são sobrescritos no resultado.

Isso é útil para sobrescrever propriedades selecionadas:

```javascript
let newVersion = {
  ...previousVersion,
  name: 'New Name' // Override the name property
};
```

No código acima, `newVersion` sobrescreve `name`; todas as outras propriedades vêm de `previousVersion`.

Se as propriedades personalizadas vierem antes do spread, elas atuam como padrões:

```javascript
let aWithDefaults = { x: 1, y: 2, ...a };
// Equivalente a
let aWithDefaults = Object.assign({}, { x: 1, y: 2 }, a);
// Equivalente a
let aWithDefaults = Object.assign({ x: 1, y: 2 }, a);
```

Como o spread de array, o spread de objetos pode ser seguido por uma expressão:

```javascript
const obj = {
  ...(x > 1 ? {a: 1} : {}),
  b: 2,
};
```

Se o operando tiver um getter, esse getter será invocado durante o spread:

```javascript
let a = {
  get x() {
    throw new Error('not throw yet');
  }
}

let aWithXGetter = { ...a }; // Erro
```

No exemplo acima, o getter é executado ao fazer spread de `a` e causa o erro.

## AggregateError

O ES2021 introduz o objeto `AggregateError` para suportar o novo método `Promise.any()` (veja o capítulo sobre Promise). Ele é tratado aqui por completude.

`AggregateError` encapsula vários erros em um único objeto. Quando uma operação dispara vários erros e todos precisam ser lançados juntos, use `AggregateError`.

`AggregateError` é um construtor para instâncias de `AggregateError`:

```javascript
AggregateError(errors[, message])
```

Ele aceita dois argumentos:

- `errors`: array de objetos de erro (obrigatório).
- `message`: string opcional com a mensagem de erro geral.

```javascript
const error = new AggregateError([
  new Error('ERROR_11112'),
  new TypeError('First name must be a string'),
  new RangeError('Transaction value must be at least 1'),
  new URIError('User profile link must be https'),
], 'Transaction cannot be processed')
```

No exemplo acima, o primeiro argumento é um array de quatro erros; o segundo é a mensagem geral.

Uma instância de `AggregateError` tem três propriedades:

- `name`: nome do erro, padrão `"AggregateError"`.
- `message`: a mensagem de erro.
- `errors`: array de objetos de erro.

Exemplo:

```javascript
try {
  throw new AggregateError([
    new Error("some error"),
  ], 'Hello');
} catch (e) {
  console.log(e instanceof AggregateError); // true
  console.log(e.message);                   // "Hello"
  console.log(e.name);                      // "AggregateError"
  console.log(e.errors);                    // [ Error: "some error" ]
}
```

## Propriedade cause de Error

O objeto `Error` representa exceções em tempo de execução, mas o contexto que ele fornece costuma ser difícil de interpretar. O [ES2022](https://github.com/tc39/proposal-error-cause) adiciona a propriedade `cause` para que você possa anexar o motivo ao criar erros.

Passe um objeto de opções para `new Error()` com a propriedade `cause`:

```javascript
const actual = new Error('an error!', { cause: 'Error cause' });
actual.cause; // 'Error cause'
```

No exemplo acima, a opção `cause` armazena o motivo; você pode lê-la na instância do erro.

`cause` pode conter qualquer valor, não apenas strings:

```javascript
try {
  maybeWorks();
} catch (err) {
  throw new Error('maybeWorks failed!', { cause: err });
}
```

No exemplo acima, `cause` contém outro objeto de erro.
