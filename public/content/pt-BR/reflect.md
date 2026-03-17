# Reflect

## Visão Geral

O objeto `Reflect`, como o objeto `Proxy`, é uma nova API fornecida pelo ES6 para operar em objetos. Os objetivos de design do `Reflect` são:

(1) Mover alguns métodos de `Object` que são claramente internos à linguagem (como `Object.defineProperty`) para o objeto `Reflect`. Por enquanto, alguns métodos existem tanto em `Object` quanto em `Reflect`. Novos métodos no futuro serão implementados apenas em `Reflect`. Ou seja, métodos internos da linguagem podem ser obtidos do objeto `Reflect`.

(2) Alterar os valores de retorno de alguns métodos de `Object` para que sejam mais razoáveis. Por exemplo, `Object.defineProperty(obj, name, desc)` lança um erro quando não pode definir uma propriedade, enquanto `Reflect.defineProperty(obj, name, desc)` retorna `false`.

```javascript
// estilo antigo
try {
  Object.defineProperty(target, property, attributes);
  // success
} catch (e) {
  // failure
}

// estilo novo
if (Reflect.defineProperty(target, property, attributes)) {
  // success
} else {
  // failure
}
```

(3) Transformar operações de `Object` em comportamento funcional. Algumas operações de `Object` são imperativas, como `name in obj` e `delete obj[name]`, enquanto `Reflect.has(obj, name)` e `Reflect.deleteProperty(obj, name)` as tornam funcionais.

```javascript
// estilo antigo
'assign' in Object // true

// estilo novo
Reflect.has(Object, 'assign') // true
```

(4) Os métodos de `Reflect` correspondem um a um com os métodos de `Proxy`. Qualquer método em `Proxy` tem um método correspondente em `Reflect`. Isso permite que `Proxy` chame facilmente o método `Reflect` correspondente para executar o comportamento padrão e usá-lo como base para o comportamento modificado. Em outras palavras, não importa como `Proxy` modifique o comportamento padrão, você sempre pode obter o comportamento padrão de `Reflect`.

```javascript
Proxy(target, {
  set: function(target, name, value, receiver) {
    var success = Reflect.set(target, name, value, receiver);
    if (success) {
      console.log('property ' + name + ' on ' + target + ' set to ' + value);
    }
    return success;
  }
});
```

No código acima, `Proxy` intercepta a atribuição de propriedade do objeto `target`. Ele usa `Reflect.set` para atribuir o valor, garantindo que o comportamento original seja executado, e então adiciona sua própria lógica.

Outro exemplo:

```javascript
var loggedObj = new Proxy(obj, {
  get(target, name) {
    console.log('get', target, name);
    return Reflect.get(target, name);
  },
  deleteProperty(target, name) {
    console.log('delete' + name);
    return Reflect.deleteProperty(target, name);
  },
  has(target, name) {
    console.log('has' + name);
    return Reflect.has(target, name);
  }
});
```

No código acima, cada interceptação de Proxy (`get`, `delete`, `has`) chama internamente o método `Reflect` correspondente para que o comportamento padrão seja executado. O trabalho adicional é registrar cada operação.

Com `Reflect`, muitas operações se tornam mais legíveis:

```javascript
// estilo antigo
Function.prototype.apply.call(Math.floor, undefined, [1.75]) // 1

// estilo novo
Reflect.apply(Math.floor, undefined, [1.75]) // 1
```

## Métodos Estáticos

O objeto `Reflect` tem 13 métodos estáticos:

- Reflect.apply(target, thisArg, args)
- Reflect.construct(target, args)
- Reflect.get(target, name, receiver)
- Reflect.set(target, name, value, receiver)
- Reflect.defineProperty(target, name, desc)
- Reflect.deleteProperty(target, name)
- Reflect.has(target, name)
- Reflect.ownKeys(target)
- Reflect.isExtensible(target)
- Reflect.preventExtensions(target)
- Reflect.getOwnPropertyDescriptor(target, name)
- Reflect.getPrototypeOf(target)
- Reflect.setPrototypeOf(target, prototype)

A maioria deles tem o mesmo efeito dos métodos correspondentes em `Object`, e correspondem um a um aos métodos de `Proxy`. Abaixo estão as explicações.

### Reflect.get(target, name, receiver)

O método `Reflect.get` procura e retorna a propriedade `name` do objeto `target`. Se a propriedade não existir, retorna `undefined`.

```javascript
var myObject = {
  foo: 1,
  bar: 2,
  get baz() {
    return this.foo + this.bar;
  },
}

Reflect.get(myObject, 'foo') // 1
Reflect.get(myObject, 'bar') // 2
Reflect.get(myObject, 'baz') // 3
```

Se a propriedade `name` tiver um getter, o `this` do getter é vinculado a `receiver`.

```javascript
var myObject = {
  foo: 1,
  bar: 2,
  get baz() {
    return this.foo + this.bar;
  },
};

var myReceiverObject = {
  foo: 4,
  bar: 4,
};

Reflect.get(myObject, 'baz', myReceiverObject) // 8
```

Se o primeiro argumento não for um objeto, `Reflect.get` lança um erro.

```javascript
Reflect.get(1, 'foo') // Erro
Reflect.get(false, 'foo') // Erro
```

### Reflect.set(target, name, value, receiver)

O método `Reflect.set` define a propriedade `name` do `target` como `value`.

```javascript
var myObject = {
  foo: 1,
  set bar(value) {
    return this.foo = value;
  },
}

myObject.foo // 1

Reflect.set(myObject, 'foo', 2);
myObject.foo // 2

Reflect.set(myObject, 'bar', 3)
myObject.foo // 3
```

Se a propriedade `name` tiver um setter, o `this` do setter é vinculado a `receiver`.

```javascript
var myObject = {
  foo: 4,
  set bar(value) {
    return this.foo = value;
  },
};

var myReceiverObject = {
  foo: 0,
};

Reflect.set(myObject, 'bar', 1, myReceiverObject);
myObject.foo // 4
myReceiverObject.foo // 1
```

Nota: Quando `Proxy` e `Reflect` são usados juntos, se o primeiro intercepta atribuição e o segundo executa a atribuição padrão com argumento `receiver`, `Reflect.set` acionará a interceptação `Proxy.defineProperty`.

```javascript
let p = {
  a: 'a'
};

let handler = {
  set(target, key, value, receiver) {
    console.log('set');
    Reflect.set(target, key, value, receiver)
  },
  defineProperty(target, key, attribute) {
    console.log('defineProperty');
    Reflect.defineProperty(target, key, attribute);
  }
};

let obj = new Proxy(p, handler);
obj.a = 'A';
// set
// defineProperty
```

No código acima, `Proxy.set` usa `Reflect.set` com `receiver`, o que aciona `Proxy.defineProperty`. Isso ocorre porque o `receiver` de `Proxy.set` sempre aponta para a instância Proxy atual (ex. `obj`), e quando `Reflect.set` recebe `receiver`, atribui a propriedade em `receiver` (ou seja, `obj`), o que aciona `defineProperty`. Se `Reflect.set` for chamado sem `receiver`, `defineProperty` não é acionado.

```javascript
let p = {
  a: 'a'
};

let handler = {
  set(target, key, value, receiver) {
    console.log('set');
    Reflect.set(target, key, value)
  },
  defineProperty(target, key, attribute) {
    console.log('defineProperty');
    Reflect.defineProperty(target, key, attribute);
  }
};

let obj = new Proxy(p, handler);
obj.a = 'A';
// set
```

Se o primeiro argumento não for um objeto, `Reflect.set` lança um erro.

```javascript
Reflect.set(1, 'foo', {}) // Erro
Reflect.set(false, 'foo', {}) // Erro
```

### Reflect.has(obj, name)

O método `Reflect.has` corresponde ao operador `in`: `name in obj`.

```javascript
var myObject = {
  foo: 1,
};

// estilo antigo
'foo' in myObject // true

// estilo novo
Reflect.has(myObject, 'foo') // true
```

Se o primeiro argumento de `Reflect.has()` não for um objeto, lança um erro.

### Reflect.deleteProperty(obj, name)

O método `Reflect.deleteProperty` é equivalente a `delete obj[name]` e é usado para remover propriedades de objetos.

```javascript
const myObj = { foo: 'bar' };

// estilo antigo
delete myObj.foo;

// estilo novo
Reflect.deleteProperty(myObj, 'foo');
```

Este método retorna um booleano. Retorna `true` em sucesso ou quando a propriedade não existe; retorna `false` quando a remoção falha e a propriedade ainda existe.

Se o primeiro argumento de `Reflect.deleteProperty()` não for um objeto, lança um erro.

### Reflect.construct(target, args)

O método `Reflect.construct` é equivalente a `new target(...args)`. Fornece uma forma de chamar um construtor sem usar `new`.

```javascript
function Greeting(name) {
  this.name = name;
}

// estilo new
const instance = new Greeting('John');

// estilo Reflect.construct
const instance = Reflect.construct(Greeting, ['John']);
```

Se o primeiro argumento de `Reflect.construct()` não for uma função, lança um erro.

### Reflect.getPrototypeOf(obj)

O método `Reflect.getPrototypeOf` lê a propriedade `__proto__` de um objeto e corresponde a `Object.getPrototypeOf(obj)`.

```javascript
const myObj = new FancyThing();

// estilo antigo
Object.getPrototypeOf(myObj) === FancyThing.prototype;

// estilo novo
Reflect.getPrototypeOf(myObj) === FancyThing.prototype;
```

Uma diferença: se o argumento não for um objeto, `Object.getPrototypeOf` primeiro o converte em objeto, enquanto `Reflect.getPrototypeOf` lança um erro.

```javascript
Object.getPrototypeOf(1) // Number {[[PrimitiveValue]]: 0}
Reflect.getPrototypeOf(1) // Erro
```

### Reflect.setPrototypeOf(obj, newProto)

O método `Reflect.setPrototypeOf` define o protótipo do objeto alvo, correspondendo a `Object.setPrototypeOf(obj, newProto)`. Retorna um booleano indicando sucesso.

```javascript
const myObj = {};

// estilo antigo
Object.setPrototypeOf(myObj, Array.prototype);

// estilo novo
Reflect.setPrototypeOf(myObj, Array.prototype);

myObj.length // 0
```

Se o protótipo do alvo não puder ser definido (ex. o objeto é não extensível), `Reflect.setPrototypeOf` retorna `false`.

```javascript
Reflect.setPrototypeOf({}, null)
// true
Reflect.setPrototypeOf(Object.freeze({}), null)
// false
```

Se o primeiro argumento não for um objeto, `Object.setPrototypeOf` retorna o primeiro argumento, enquanto `Reflect.setPrototypeOf` lança um erro.

```javascript
Object.setPrototypeOf(1, {})
// 1

Reflect.setPrototypeOf(1, {})
// TypeError: Reflect.setPrototypeOf called on non-object
```

Se o primeiro argumento for `undefined` ou `null`, tanto `Object.setPrototypeOf` quanto `Reflect.setPrototypeOf` lançam erro.

```javascript
Object.setPrototypeOf(null, {})
// TypeError: Object.setPrototypeOf called on null or undefined

Reflect.setPrototypeOf(null, {})
// TypeError: Reflect.setPrototypeOf called on non-object
```

### Reflect.apply(func, thisArg, args)

O método `Reflect.apply` é equivalente a `Function.prototype.apply.call(func, thisArg, args)` e executa a função dada com `this` vinculado.

Para vincular o `this` de uma função, você normalmente escreveria `fn.apply(obj, args)`, mas se a função define seu próprio `apply`, você precisa de `Function.prototype.apply.call(fn, obj, args)`. Usar `Reflect` simplifica isso:

```javascript
const ages = [11, 33, 12, 54, 18, 96];

// estilo antigo
const youngest = Math.min.apply(Math, ages);
const oldest = Math.max.apply(Math, ages);
const type = Object.prototype.toString.call(youngest);

// estilo novo
const youngest = Reflect.apply(Math.min, Math, ages);
const oldest = Reflect.apply(Math.max, Math, ages);
const type = Reflect.apply(Object.prototype.toString, youngest, []);
```

### Reflect.defineProperty(target, propertyKey, attributes)

O método `Reflect.defineProperty` é em grande parte equivalente a `Object.defineProperty` e é usado para definir propriedades de objetos. O último pode ser descontinuado com o tempo; prefira `Reflect.defineProperty`.

```javascript
function MyDate() {
  /*…*/
}

// estilo antigo
Object.defineProperty(MyDate, 'now', {
  value: () => Date.now()
});

// estilo novo
Reflect.defineProperty(MyDate, 'now', {
  value: () => Date.now()
});
```

Se o primeiro argumento de `Reflect.defineProperty` não for um objeto, lança um erro (ex. `Reflect.defineProperty(1, 'foo')`).

Este método pode ser usado com `Proxy.defineProperty`:

```javascript
const p = new Proxy({}, {
  defineProperty(target, prop, descriptor) {
    console.log(descriptor);
    return Reflect.defineProperty(target, prop, descriptor);
  }
});

p.foo = 'bar';
// {value: "bar", writable: true, enumerable: true, configurable: true}

p.foo // "bar"
```

No código acima, `Proxy.defineProperty` intercepta a atribuição de propriedade, então `Reflect.defineProperty` completa a atribuição.

### Reflect.getOwnPropertyDescriptor(target, propertyKey)

O método `Reflect.getOwnPropertyDescriptor` é em grande parte equivalente a `Object.getOwnPropertyDescriptor` e é usado para obter o descritor de uma propriedade. Eventualmente substituirá o último.

```javascript
var myObject = {};
Object.defineProperty(myObject, 'hidden', {
  value: true,
  enumerable: false,
});

// estilo antigo
var theDescriptor = Object.getOwnPropertyDescriptor(myObject, 'hidden');

// estilo novo
var theDescriptor = Reflect.getOwnPropertyDescriptor(myObject, 'hidden');
```

Uma diferença: se o primeiro argumento não for um objeto, `Object.getOwnPropertyDescriptor(1, 'foo')` retorna `undefined`, enquanto `Reflect.getOwnPropertyDescriptor(1, 'foo')` lança um erro.

### Reflect.isExtensible (target)

O método `Reflect.isExtensible` corresponde a `Object.isExtensible` e retorna um booleano indicando se o objeto é extensível.

```javascript
const myObject = {};

// estilo antigo
Object.isExtensible(myObject) // true

// estilo novo
Reflect.isExtensible(myObject) // true
```

Se o argumento não for um objeto, `Object.isExtensible` retorna `false` (não-objetos são não extensíveis), enquanto `Reflect.isExtensible` lança um erro.

```javascript
Object.isExtensible(1) // false
Reflect.isExtensible(1) // Erro
```

### Reflect.preventExtensions(target)

O método `Reflect.preventExtensions` corresponde a `Object.preventExtensions` e torna um objeto não extensível. Retorna um booleano indicando sucesso.

```javascript
var myObject = {};

// estilo antigo
Object.preventExtensions(myObject) // Object {}

// estilo novo
Reflect.preventExtensions(myObject) // true
```

Se o argumento não for um objeto, `Object.preventExtensions` se comporta diferente em ES5 vs ES6, enquanto `Reflect.preventExtensions` sempre lança erro.

```javascript
// ambiente ES5
Object.preventExtensions(1) // Erro

// ambiente ES6
Object.preventExtensions(1) // 1

// estilo novo
Reflect.preventExtensions(1) // Erro
```

### Reflect.ownKeys (target)

O método `Reflect.ownKeys` retorna todas as propriedades próprias de um objeto e é equivalente a `Object.getOwnPropertyNames` mais `Object.getOwnPropertySymbols`.

```javascript
var myObject = {
  foo: 1,
  bar: 2,
  [Symbol.for('baz')]: 3,
  [Symbol.for('bing')]: 4,
};

// estilo antigo
Object.getOwnPropertyNames(myObject)
// ['foo', 'bar']

Object.getOwnPropertySymbols(myObject)
//[Symbol(baz), Symbol(bing)]

// estilo novo
Reflect.ownKeys(myObject)
// ['foo', 'bar', Symbol(baz), Symbol(bing)]
```

Se o primeiro argumento de `Reflect.ownKeys()` não for um objeto, lança um erro.

## Exemplo: Padrão Observer com Proxy

O padrão observer (Observer mode) significa que funções observam automaticamente um objeto de dados; quando o objeto muda, as funções são executadas automaticamente.

```javascript
const person = observable({
  name: 'John',
  age: 20
});

function print() {
  console.log(`${person.name}, ${person.age}`)
}

observe(print);
person.name = 'Jane';
// saída
// Jane, 20
```

No código acima, o objeto de dados `person` é o alvo observado e a função `print` é o observador. Quando os dados mudam, `print` é executada automaticamente.

Abaixo está uma implementação mínima do padrão observer com Proxy, ou seja, `observable` e `observe`. A ideia: `observable` retorna um Proxy do objeto original que intercepta atribuições e aciona todas as funções observadoras.

```javascript
const queuedObservers = new Set();

const observe = fn => queuedObservers.add(fn);
const observable = obj => new Proxy(obj, {set});

function set(target, key, value, receiver) {
  const result = Reflect.set(target, key, value, receiver);
  queuedObservers.forEach(observer => observer());
  return result;
}
```

No código acima, um `Set` é definido e todas as funções observadoras são adicionadas a ele. A função `observable` retorna um proxy do objeto original que intercepta atribuições. O manipulador `set` executa todos os observadores automaticamente.
