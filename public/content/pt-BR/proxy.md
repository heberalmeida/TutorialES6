# Proxy

## Visão Geral

Proxy é usado para modificar o comportamento padrão de certas operações, equivalente a fazer alterações no nível da linguagem. Pertence à "meta programação"—programar a linguagem de programação em si.

Proxy pode ser entendido como uma camada de "interceptação" na frente do objeto alvo. Todo acesso externo ao objeto deve passar por essa camada, que fornece um mecanismo para filtrar e reescrever esse acesso. A palavra proxy significa "agente"; aqui ele "faz proxy" de certas operações e pode ser traduzido como "manipulador de proxy".

```javascript
var obj = new Proxy({}, {
  get: function (target, propKey, receiver) {
    console.log(`getting ${propKey}!`);
    return Reflect.get(target, propKey, receiver);
  },
  set: function (target, propKey, value, receiver) {
    console.log(`setting ${propKey}!`);
    return Reflect.set(target, propKey, value, receiver);
  }
});
```

O código acima configura uma camada de interceptação em um objeto vazio, redefinindo o comportamento de leitura (`get`) e gravação (`set`) de propriedades. Não explicaremos a sintaxe em detalhes—apenas os resultados. Ao ler ou gravar propriedades no objeto `obj` com comportamento de interceptação, você obtém o seguinte:

```javascript
obj.count = 1
//  setting count!
++obj.count
//  getting count!
//  setting count!
//  2
```

O código acima mostra que Proxy efetivamente sobrecarrega o operador de ponto—sobrescreve a definição original da linguagem com a sua própria.

O ES6 fornece o construtor Proxy nativamente para criar instâncias Proxy.

```javascript
var proxy = new Proxy(target, handler);
```

Todo uso de Proxy segue essa forma; apenas o parâmetro `handler` muda. Aqui, `new Proxy()` cria uma instância Proxy, o parâmetro `target` é o objeto a interceptar e o parâmetro `handler` também é um objeto que personaliza o comportamento de interceptação.

Abaixo está outro exemplo de interceptação de leitura de propriedades:

```javascript
var proxy = new Proxy({}, {
  get: function(target, propKey) {
    return 35;
  }
});

proxy.time // 35
proxy.name // 35
proxy.title // 35
```

No código acima, o construtor `Proxy` recebe dois argumentos. O primeiro é o objeto alvo do proxy (um objeto vazio neste exemplo)—o objeto que seria acessado se o Proxy não estivesse envolvido. O segundo é um objeto de configuração. Para cada operação interceptada, você fornece uma função manipuladora. Por exemplo, o objeto de configuração acima tem um método `get` que intercepta o acesso a propriedades no alvo. O método `get` recebe dois parâmetros: o objeto alvo e a propriedade sendo acessada. Como o interceptor sempre retorna `35`, acessar qualquer propriedade retorna `35`.

Nota: Para o Proxy ter efeito, você deve operar na instância Proxy (o objeto `proxy` acima), não no objeto alvo (o objeto vazio).

Se `handler` não definir nenhuma interceptação, o acesso vai diretamente para o objeto original.

```javascript
var target = {};
var handler = {};
var proxy = new Proxy(target, handler);
proxy.a = 'b';
target.a // "b"
```

No código acima, `handler` está vazio e não tem efeito de interceptação. Acessar `proxy` é equivalente a acessar `target`.

Uma técnica é colocar o objeto Proxy na propriedade `object.proxy` para que possa ser chamado em `object`.

```javascript
var object = { proxy: new Proxy(target, handler) };
```

Instâncias Proxy também podem ser usadas como protótipo de outros objetos.

```javascript
var proxy = new Proxy({}, {
  get: function(target, propKey) {
    return 35;
  }
});

let obj = Object.create(proxy);
obj.time // 35
```

No código acima, `proxy` é o protótipo de `obj`. Como `obj` não tem a propriedade `time` por si só, ela é procurada na cadeia de protótipos em `proxy`, o que aciona a interceptação.

Uma única função interceptor pode interceptar múltiplas operações.

```javascript
var handler = {
  get: function(target, name) {
    if (name === 'prototype') {
      return Object.prototype;
    }
    return 'Hello, ' + name;
  },

  apply: function(target, thisBinding, args) {
    return args[0];
  },

  construct: function(target, args) {
    return {value: args[1]};
  }
};

var fproxy = new Proxy(function(x, y) {
  return x + y;
}, handler);

fproxy(1, 2) // 1
new fproxy(1, 2) // {value: 2}
fproxy.prototype === Object.prototype // true
fproxy.foo === "Hello, foo" // true
```

Para operações que podem ser interceptadas mas não estão configuradas, a execução passa para o objeto alvo e produz resultados usando o comportamento original.

Abaixo está um resumo das operações de interceptação suportadas pelo Proxy—13 no total:

- **get(target, propKey, receiver)**: Intercepta leituras de propriedades, ex. `proxy.foo` e `proxy['foo']`.
- **set(target, propKey, value, receiver)**: Intercepta gravações de propriedades, ex. `proxy.foo = v` ou `proxy['foo'] = v`. Retorna um booleano.
- **has(target, propKey)**: Intercepta `propKey in proxy`. Retorna um booleano.
- **deleteProperty(target, propKey)**: Intercepta `delete proxy[propKey]`. Retorna um booleano.
- **ownKeys(target)**: Intercepta `Object.getOwnPropertyNames(proxy)`, `Object.getOwnPropertySymbols(proxy)`, `Object.keys(proxy)` e loops `for...in`. Retorna um array.
- **getOwnPropertyDescriptor(target, propKey)**: Intercepta `Object.getOwnPropertyDescriptor(proxy, propKey)`.
- **defineProperty(target, propKey, propDesc)**: Intercepta `Object.defineProperty(proxy, propKey, propDesc)` e `Object.defineProperties(proxy, propDescs)`. Retorna um booleano.
- **preventExtensions(target)**: Intercepta `Object.preventExtensions(proxy)`. Retorna um booleano.
- **getPrototypeOf(target)**: Intercepta `Object.getPrototypeOf(proxy)`. Retorna um objeto.
- **isExtensible(target)**: Intercepta `Object.isExtensible(proxy)`. Retorna um booleano.
- **setPrototypeOf(target, proto)**: Intercepta `Object.setPrototypeOf(proxy, proto)`. Retorna um booleano.
- **apply(target, object, args)**: Intercepta a instância Proxy invocada como função, ex. `proxy(...args)`, `proxy.call(object, ...args)`, `proxy.apply(...)`.
- **construct(target, args)**: Intercepta a instância Proxy invocada como construtor, ex. `new proxy(...args)`.

## Métodos de Instância do Proxy

Abaixo estão descrições detalhadas desses métodos de interceptação.

### get()

O método `get` intercepta leituras de propriedades. Aceita três parâmetros: o objeto alvo, o nome da propriedade e a própria instância Proxy (estritamente falando, o objeto ao qual a operação é aplicada). O último parâmetro é opcional.

Um exemplo de `get` já foi mostrado acima. Abaixo está outro que intercepta leituras:

```javascript
var person = {
  name: "John"
};

var proxy = new Proxy(person, {
  get: function(target, propKey) {
    if (propKey in target) {
      return target[propKey];
    } else {
      throw new ReferenceError("Prop name \"" + propKey + "\" does not exist.");
    }
  }
});

proxy.name // "John"
proxy.age // lança um erro
```

O código acima lança um erro ao acessar uma propriedade inexistente no alvo. Sem esse interceptor, acessar uma propriedade inexistente apenas retornaria `undefined`.

O método `get` pode ser herdado.

```javascript
let proto = new Proxy({}, {
  get(target, propertyKey, receiver) {
    console.log('GET ' + propertyKey);
    return target[propertyKey];
  }
});

let obj = Object.create(proto);
obj.foo // "GET foo"
```

No código acima, a interceptação é definida no objeto `Prototype`, então entra em efeito ao ler propriedades herdadas de `obj`.

O exemplo abaixo usa interceptação `get` para implementar índices de array negativos:

```javascript
function createArray(...elements) {
  let handler = {
    get(target, propKey, receiver) {
      let index = Number(propKey);
      if (index < 0) {
        propKey = String(target.length + index);
      }
      return Reflect.get(target, propKey, receiver);
    }
  };

  let target = [];
  target.push(...elements);
  return new Proxy(target, handler);
}

let arr = createArray('a', 'b', 'c');
arr[-1] // c
```

No código acima, um índice de `-1` retorna o último elemento.

Com Proxy, leituras de propriedades (`get`) podem ser transformadas em execução de função, permitindo acesso encadeado a propriedades.

```javascript
var pipe = function (value) {
  var funcStack = [];
  var oproxy = new Proxy({} , {
    get : function (pipeObject, fnName) {
      if (fnName === 'get') {
        return funcStack.reduce(function (val, fn) {
          return fn(val);
        },value);
      }
      funcStack.push(window[fnName]);
      return oproxy;
    }
  });

  return oproxy;
}

var double = n => n * 2;
var pow    = n => n * n;
var reverseInt = n => n.toString().split("").reverse().join("") | 0;

pipe(3).double.pow.reverseInt.get; // 63
```

O código acima alcança uma cadeia de nomes de funções via Proxy.

O exemplo abaixo usa interceptação `get` para criar uma função `dom` genérica para gerar elementos DOM:

```javascript
const dom = new Proxy({}, {
  get(target, property) {
    return function(attrs = {}, ...children) {
      const el = document.createElement(property);
      for (let prop of Object.keys(attrs)) {
        el.setAttribute(prop, attrs[prop]);
      }
      for (let child of children) {
        if (typeof child === 'string') {
          child = document.createTextNode(child);
        }
        el.appendChild(child);
      }
      return el;
    }
  }
});

const el = dom.div({},
  'Hello, my name is ',
  dom.a({href: '//example.com'}, 'Mark'),
  '. I like:',
  dom.ul({},
    dom.li({}, 'The web'),
    dom.li({}, 'Food'),
    dom.li({}, '…actually that\'s it')
  )
);

document.body.appendChild(el);
```

Abaixo está um exemplo do terceiro parâmetro de `get`—ele sempre aponta para o objeto onde a leitura se originou. Normalmente é a instância Proxy.

```javascript
const proxy = new Proxy({}, {
  get: function(target, key, receiver) {
    return receiver;
  }
});
proxy.getReceiver === proxy // true
```

No código acima, ler a propriedade `getReceiver` em `proxy` é interceptado por `get()`, e o valor retornado é o objeto `proxy`.

```javascript
const proxy = new Proxy({}, {
  get: function(target, key, receiver) {
    return receiver;
  }
});

const d = Object.create(proxy);
d.a === d // true
```

No código acima, `d` não tem a propriedade `a`, então ler `d.a` a procura no protótipo `proxy` de `d`. Aqui `receiver` aponta para `d`, o objeto onde a leitura se originou.

Se uma propriedade for não configurável e não gravável, o Proxy não pode alterá-la; acessar essa propriedade pelo Proxy lançará um erro.

```javascript
const target = Object.defineProperties({}, {
  foo: {
    value: 123,
    writable: false,
    configurable: false
  },
});

const handler = {
  get(target, propKey) {
    return 'abc';
  }
};

const proxy = new Proxy(target, handler);

proxy.foo
// TypeError: Invariant check failed
```

### set()

O método `set` intercepta atribuições de propriedades. Aceita quatro parâmetros: o objeto alvo, o nome da propriedade, o valor da propriedade e a instância Proxy. O último parâmetro é opcional.

Suponha que um objeto `Person` tenha uma propriedade `age` que deve ser um inteiro não maior que 200. O Proxy pode fazer validação:

```javascript
let validator = {
  set: function(obj, prop, value) {
    if (prop === 'age') {
      if (!Number.isInteger(value)) {
        throw new TypeError('The age is not an integer');
      }
      if (value > 200) {
        throw new RangeError('The age seems invalid');
      }
    }

    // Para age e outras props que atendem, salvar diretamente
    obj[prop] = value;
    return true;
  }
};

let person = new Proxy({}, validator);

person.age = 100;

person.age // 100
person.age = 'young' // Erro
person.age = 300 // Erro
```

O código acima usa um manipulador `set` para validação. Qualquer atribuição inválida de `age` lança um erro. O método `set` também pode ser usado para data binding—ex. atualizar o DOM quando um objeto muda.

Às vezes propriedades internas usam um sublinhado inicial para indicar que não devem ser acessadas externamente. Combinado com `get` e `set`, você pode impedir que essas propriedades internas sejam lidas ou gravadas:

```javascript
const handler = {
  get (target, key) {
    invariant(key, 'get');
    return target[key];
  },
  set (target, key, value) {
    invariant(key, 'set');
    target[key] = value;
    return true;
  }
};
function invariant (key, action) {
  if (key[0] === '_') {
    throw new Error(`Invalid attempt to ${action} private "${key}" property`);
  }
}
const target = {};
const proxy = new Proxy(target, handler);
proxy._prop
// Error: Invalid attempt to get private "_prop" property
proxy._prop = 'c'
// Error: Invalid attempt to set private "_prop" property
```

O código acima lança erro em qualquer leitura ou gravação de propriedades cujo primeiro caractere seja sublinhado.

Abaixo está um exemplo do quarto parâmetro de `set`:

```javascript
const handler = {
  set: function(obj, prop, value, receiver) {
    obj[prop] = receiver;
    return true;
  }
};
const proxy = new Proxy({}, handler);
proxy.foo = 'bar';
proxy.foo === proxy // true
```

No código acima, o quarto parâmetro `receiver` de `set` é o objeto onde a operação se originou—normalmente a instância proxy. Veja o próximo exemplo:

```javascript
const handler = {
  set: function(obj, prop, value, receiver) {
    obj[prop] = receiver;
    return true;
  }
};
const proxy = new Proxy({}, handler);
const myObj = {};
Object.setPrototypeOf(myObj, proxy);

myObj.foo = 'bar';
myObj.foo === myObj // true
```

No código acima, ao definir `myObj.foo`, `myObj` não tem a propriedade `foo`, então o motor procura `foo` na cadeia de protótipos. O protótipo `proxy` de `myObj` é uma instância Proxy; definir sua propriedade `foo` aciona `set`. Aqui `receiver` aponta para `myObj`, onde a atribuição se originou.

Nota: Se o alvo tiver uma propriedade própria não gravável, `set` não terá efeito.

```javascript
const obj = {};
Object.defineProperty(obj, 'foo', {
  value: 'bar',
  writable: false
});

const handler = {
  set: function(obj, prop, value, receiver) {
    obj[prop] = 'baz';
    return true;
  }
};

const proxy = new Proxy(obj, handler);
proxy.foo = 'baz';
proxy.foo // "bar"
```

Nota: `set` deve retornar um booleano. Em modo estrito, se `set` não retornar `true`, lança erro.

```javascript
'use strict';
const handler = {
  set: function(obj, prop, value, receiver) {
    obj[prop] = receiver;
    // Erro com ou sem a linha abaixo
    return false;
  }
};
const proxy = new Proxy({}, handler);
proxy.foo = 'bar';
// TypeError: 'set' on proxy: trap returned falsish for property 'foo'
```

No código acima, em modo estrito, retornar `false` ou `undefined` de `set` lança erro.

### apply()

O método `apply` intercepta chamadas de função e invocações `call`/`apply`.

`apply` recebe três parâmetros: o objeto alvo, o objeto de contexto do alvo (`this`) e o array de argumentos do alvo.

```javascript
var handler = {
  apply (target, ctx, args) {
    return Reflect.apply(...arguments);
  }
};
```

Exemplo:

```javascript
var target = function () { return 'I am the target'; };
var handler = {
  apply: function () {
    return 'I am the proxy';
  }
};

var p = new Proxy(target, handler);

p()
// "I am the proxy"
```

No código acima, quando `p` é chamado como função (`p()`), é interceptado por `apply` e retorna uma string.

Outro exemplo:

```javascript
var twice = {
  apply (target, ctx, args) {
    return Reflect.apply(...arguments) * 2;
  }
};
function sum (left, right) {
  return left + right;
};
var proxy = new Proxy(sum, twice);
proxy(1, 2) // 6
proxy.call(null, 5, 6) // 22
proxy.apply(null, [7, 8]) // 30
```

Cada chamada a `proxy` (direta, `call` ou `apply`) é interceptada por `apply`.

`Reflect.apply` invocado diretamente também é interceptado.

```javascript
Reflect.apply(proxy, null, [9, 10]) // 38
```

### has()

O método `has()` intercepta a operação `HasProperty`—a verificação se um objeto tem uma propriedade. O uso típico é o operador `in`.

`has()` recebe dois parâmetros: o objeto alvo e o nome da propriedade a verificar.

Exemplo: usar `has()` para esconder certas propriedades do `in`:

```javascript
var handler = {
  has (target, key) {
    if (key[0] === '_') {
      return false;
    }
    return key in target;
  }
};
var target = { _prop: 'foo', prop: 'foo' };
var proxy = new Proxy(target, handler);
'_prop' in proxy // false
```

Se o alvo for não configurável ou não extensível, um `has()` que retorna `false` para tais propriedades lançará erro.

```javascript
var obj = { a: 10 };
Object.preventExtensions(obj);

var p = new Proxy(obj, {
  has: function(target, prop) {
    return false;
  }
});

'a' in p // TypeError is thrown
```

`has()` intercepta `HasProperty`, não `HasOwnProperty`—não distingue propriedade própria de herdada.

Além disso, embora `for...in` use `in`, `has()` não afeta loops `for...in`.

```javascript
let stu1 = {name: 'John', score: 59};
let stu2 = {name: 'Jane', score: 99};

let handler = {
  has(target, prop) {
    if (prop === 'score' && target[prop] < 60) {
      console.log(`${target.name} reprovado`);
      return false;
    }
    return prop in target;
  }
}

let oproxy1 = new Proxy(stu1, handler);
let oproxy2 = new Proxy(stu2, handler);

'score' in oproxy1
// John reprovado
// false

'score' in oproxy2
// true

for (let a in oproxy1) {
  console.log(oproxy1[a]);
}
// John
// 59

for (let b in oproxy2) {
  console.log(oproxy2[b]);
}
// Jane
// 99
```

No código acima, `has()` afeta `in` mas não `for...in`, então propriedades que falham na verificação não são excluídas da iteração `for...in`.

### construct()

O método `construct()` intercepta o operador `new`. Exemplo:

```javascript
const handler = {
  construct (target, args, newTarget) {
    return new target(...args);
  }
};
```

`construct()` recebe três parâmetros:

- `target`: O objeto alvo.
- `args`: O array de argumentos do construtor.
- `newTarget`: O construtor ao qual o operador `new` foi aplicado (ex. `p` abaixo).

```javascript
const p = new Proxy(function () {}, {
  construct: function(target, args) {
    console.log('called: ' + args.join(', '));
    return { value: args[0] * 10 };
  }
});

(new p(1)).value
// "called: 1"
// 10
```

`construct()` deve retornar um objeto; caso contrário lança erro.

```javascript
const p = new Proxy(function() {}, {
  construct: function(target, argumentsList) {
    return 1;
  }
});

new p() // Erro
// Uncaught TypeError: 'construct' on proxy: trap returned non-object ('1')
```

Como `construct()` intercepta construtores, o alvo deve ser uma função; caso contrário lança erro.

```javascript
const p = new Proxy({}, {
  construct: function(target, argumentsList) {
    return {};
  }
});

new p() // Erro
// Uncaught TypeError: p is not a constructor
```

No exemplo acima, o alvo é um objeto, não uma função, então lança erro.

Nota: Em `construct()`, `this` refere-se ao `handler`, não à instância.

```javascript
const handler = {
  construct: function(target, args) {
    console.log(this === handler);
    return new target(...args);
  }
}

let p = new Proxy(function () {}, handler);
new p() // true
```

### deleteProperty()

O método `deleteProperty` intercepta `delete`. Se lançar ou retornar `false`, a propriedade não pode ser removida.

```javascript
var handler = {
  deleteProperty (target, key) {
    invariant(key, 'delete');
    delete target[key];
    return true;
  }
};
function invariant (key, action) {
  if (key[0] === '_') {
    throw new Error(`Invalid attempt to ${action} private "${key}" property`);
  }
}

var target = { _prop: 'foo' };
var proxy = new Proxy(target, handler);
delete proxy._prop
// Error: Invalid attempt to delete private "_prop" property
```

No código acima, `deleteProperty` intercepta `delete`; remover propriedades que começam com sublinhado lança erro.

Nota: Propriedades próprias não configuráveis no alvo não podem ser removidas por `deleteProperty`; fazer isso lança erro.

### defineProperty()

O método `defineProperty()` intercepta `Object.defineProperty()`.

```javascript
var handler = {
  defineProperty (target, key, descriptor) {
    return false;
  }
};
var target = {};
var proxy = new Proxy(target, handler);
proxy.foo = 'bar' // não terá efeito
```

No código acima, `defineProperty()` retorna `false`, então adicionar novas propriedades sempre falha.

Nota: Se o alvo for não extensível, `defineProperty()` não pode adicionar propriedades que não existem no alvo.

### getOwnPropertyDescriptor()

O método `getOwnPropertyDescriptor()` intercepta `Object.getOwnPropertyDescriptor()` e retorna um descritor de propriedade ou `undefined`.

```javascript
var handler = {
  getOwnPropertyDescriptor (target, key) {
    if (key[0] === '_') {
      return;
    }
    return Object.getOwnPropertyDescriptor(target, key);
  }
};
var target = { _foo: 'bar', baz: 'tar' };
var proxy = new Proxy(target, handler);
Object.getOwnPropertyDescriptor(proxy, 'wat')
// undefined
Object.getOwnPropertyDescriptor(proxy, '_foo')
// undefined
Object.getOwnPropertyDescriptor(proxy, 'baz')
// { value: 'tar', writable: true, enumerable: true, configurable: true }
```

No código acima, `getOwnPropertyDescriptor` retorna `undefined` para propriedades que começam com sublinhado.

### getPrototypeOf()

O método `getPrototypeOf()` intercepta o acesso ao protótipo. Especificamente, intercepta:

- `Object.prototype.__proto__`
- `Object.prototype.isPrototypeOf()`
- `Object.getPrototypeOf()`
- `Reflect.getPrototypeOf()`
- `instanceof`

### isExtensible()

O método `isExtensible()` intercepta `Object.isExtensible()`.

```javascript
var p = new Proxy({}, {
  isExtensible: function(target) {
    console.log("called");
    return true;
  }
});

Object.isExtensible(p)
// "called"
// true
```

`isExtensible()` deve retornar um booleano. Seu valor de retorno deve corresponder ao `isExtensible` do alvo; caso contrário lança erro.

### ownKeys()

O método `ownKeys()` intercepta leituras dos nomes de propriedades próprias de um objeto.

### preventExtensions()

O método `preventExtensions()` intercepta `Object.preventExtensions()`. Deve retornar um booleano. Só pode retornar `true` quando o alvo for não extensível.

### setPrototypeOf()

O método `setPrototypeOf()` intercepta `Object.setPrototypeOf()`.

## Proxy.revocable()

O método `Proxy.revocable()` retorna uma instância Proxy revogável.

```javascript
let target = {};
let handler = {};

let {proxy, revoke} = Proxy.revocable(target, handler);

proxy.foo = 123;
proxy.foo // 123

revoke();
proxy.foo // TypeError: Revoked
```

`Proxy.revocable()` retorna um objeto com a propriedade `proxy` (a instância Proxy) e a função `revoke`. Após chamar `revoke`, qualquer acesso ao proxy lança erro.

## O Problema do `this`

Embora o Proxy possa fazer proxy do acesso ao alvo, não é um proxy transparente. Mesmo sem interceptação, o comportamento pode diferir do alvo. O principal motivo é que quando há proxy, o `this` interno do alvo aponta para o Proxy.

```javascript
const target = {
  m: function () {
    console.log(this === proxy);
  }
};
const handler = {};

const proxy = new Proxy(target, handler);

target.m() // false
proxy.m()  // true
```

No código acima, quando `proxy` faz proxy de `target`, o `this` dentro de `target.m()` refere-se a `proxy`, não a `target`. Então mesmo sem interceptação, `target.m()` e `proxy.m()` dão resultados diferentes.

## Exemplo: Cliente de Serviço Web

O Proxy pode interceptar qualquer propriedade do alvo, o que o torna adequado para criar clientes de serviços web.

```javascript
function createWebService(baseUrl) {
  return new Proxy({}, {
    get(target, propKey, receiver) {
      return () => httpGet(baseUrl + '/' + propKey);
    }
  });
}
```
