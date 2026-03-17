# Decoradores

[Nota] A proposta de Decorators passou por mudanças significativas de sintaxe e atualmente está na terceira etapa. Não se sabe se haverá mais alterações antes da conclusão. Este capítulo está em fase de rascunho. Seções marcadas como "nova sintaxe" são baseadas na sintaxe atual, mas não foram completamente organizadas—são materiais brutos. Seções não marcadas como "nova sintaxe" são baseadas na sintaxe anterior e são conteúdo legado. O conteúdo anterior é mantido por duas razões: primeiro, os decoradores do TypeScript usam essa sintaxe; segundo, contêm material valioso. Quando o padrão for totalmente finalizado, este capítulo será completamente reescrito: removendo conteúdo desatualizado, complementando materiais e adicionando explicações. (Junho de 2022)

## Introdução (nova sintaxe)

Decoradores são usados para aprimorar a funcionalidade das classes JavaScript. Muitas linguagens orientadas a objetos possuem essa sintaxe, e há uma [proposta](https://github.com/tc39/proposal-decorators) para introduzi-la no ECMAScript.

Um decorador é uma função escrita como `@ + nome da função`. Pode ser usado para decorar quatro tipos de valores:

- Classes
- Propriedades de classe
- Métodos de classe
- Acessadores de propriedade

O exemplo a seguir mostra decoradores colocados antes do nome da classe e dos métodos da classe, para que você possa sentir a sintaxe.

```javascript
@frozen class Foo {
  @configurable(false)
  @enumerable(true)
  method() {}

  @throttle(500)
  expensiveMethod() {}
}
```

O código acima usa quatro decoradores: um na própria classe (`@frozen`) e três nos métodos da classe (`@configurable()`, `@enumerable()` e `@throttle()`). Eles não apenas melhoram a legibilidade do código e expressam claramente a intenção, como também fornecem uma forma conveniente de adicionar ou modificar a funcionalidade da classe.

## API de Decoradores (nova sintaxe)

Um decorador é uma função. A descrição de tipo da API é a seguinte (sintaxe TypeScript).

```typescript
type Decorator = (value: Input, context: {
  kind: string;
  name: string | symbol;
  access: {
    get?(): unknown;
    set?(value: unknown): void;
  };
  private?: boolean;
  static?: boolean;
  addInitializer?(initializer: () => void): void;
}) => Output | void;
```

Uma função decoradora recebe dois parâmetros. Em tempo de execução, o motor JavaScript fornece esses dois parâmetros.

- `value`: O valor sendo decorado; em alguns casos pode ser `undefined` (ao decorar propriedades).
- `context`: O objeto de informações de contexto.

O valor de retorno da função decoradora é uma nova versão do objeto decorado, mas também pode não retornar nada (void).

O objeto `context` possui muitas propriedades. A propriedade `kind` indica qual tipo de decorador é. Os significados das outras propriedades são:

- `kind`: Uma string indicando o tipo do decorador. Valores possíveis são `class`, `method`, `getter`, `setter`, `field` e `accessor`.
- `name`: O nome do valor decorado, ou no caso de elementos privados a descrição dele (ex.: o nome legível).
- `access`: Um objeto contendo métodos para acessar esse valor, ou seja, o setter e o getter.
- `static`: Um booleano indicando se o valor é um elemento estático.
- `private`: Um booleano indicando se o valor é um elemento privado.
- `addInitializer`: Uma função que permite aos usuários adicionar lógica de inicialização.

Os passos de execução dos decoradores são:

1. Calcular o valor de cada decorador, na ordem da esquerda para a direita e de cima para baixo.
1. Chamar os decoradores de método.
1. Chamar o decorador de classe.

## Decorando Classes

Decoradores podem ser usados para decorar uma classe inteira.

```javascript
@testable
class MyTestableClass {
  // ...
}

function testable(target) {
  target.isTestable = true;
}

MyTestableClass.isTestable // true
```

No código acima, `@testable` é um decorador. Ele modifica o comportamento da classe `MyTestableClass` adicionando a propriedade estática `isTestable` a ela. O parâmetro `target` da função `testable` é a própria classe `MyTestableClass`.

Essencialmente, um decorador se comporta assim:

```javascript
@decorator
class A {}

// equivalente a

class A {}
A = decorator(A) || A;
```

Ou seja, um decorador é uma função que processa uma classe. O primeiro parâmetro da função decoradora é a classe alvo sendo decorada.

```javascript
function testable(target) {
  // ...
}
```

No código acima, o parâmetro `target` da função `testable` é a classe que será decorada.

Se um parâmetro não for suficiente, você pode envolver outra função ao redor do decorador.

```javascript
function testable(isTestable) {
  return function(target) {
    target.isTestable = isTestable;
  }
}

@testable(true)
class MyTestableClass {}
MyTestableClass.isTestable // true

@testable(false)
class MyClass {}
MyClass.isTestable // false
```

No código acima, o decorador `testable` pode aceitar parâmetros, o que permite modificar o comportamento do decorador.

O exemplo anterior adicionou uma propriedade estática à classe. Para adicionar uma propriedade de instância, você pode operar através do objeto `prototype` da classe alvo.

```javascript
function testable(target) {
  target.prototype.isTestable = true;
}

@testable
class MyTestableClass {}

let obj = new MyTestableClass();
obj.isTestable // true
```

No código acima, a função decoradora `testable` adiciona uma propriedade ao objeto `prototype` da classe alvo, então ela pode ser chamada na instância.

Aqui está outro exemplo.

```javascript
// mixins.js
export function mixins(...list) {
  return function (target) {
    Object.assign(target.prototype, ...list)
  }
}

// main.js
import { mixins } from './mixins.js'

const Foo = {
  foo() { console.log('foo') }
};

@mixins(Foo)
class MyClass {}

let obj = new MyClass();
obj.foo() // 'foo'
```

O código acima usa o decorador `mixins` para adicionar os métodos do objeto `Foo` às instâncias de `MyClass`. Você pode usar `Object.assign()` para simular essa funcionalidade:

```javascript
const Foo = {
  foo() { console.log('foo') }
};

class MyClass {}

Object.assign(MyClass.prototype, Foo);

let obj = new MyClass();
obj.foo() // 'foo'
```

No desenvolvimento real, ao usar React junto com a biblioteca Redux, muitas vezes é necessário escrever algo assim:

```javascript
class MyReactComponent extends React.Component {}

export default connect(mapStateToProps, mapDispatchToProps)(MyReactComponent);
```

Com decoradores, o código acima pode ser reescrito como:

```javascript
@connect(mapStateToProps, mapDispatchToProps)
export default class MyReactComponent extends React.Component {}
```

O estilo alternativo é relativamente mais fácil de entender.

## Decoradores de Classe (nova sintaxe)

A descrição de tipo de um decorador de classe é a seguinte.

```typescript
type ClassDecorator = (value: Function, context: {
  kind: "class";
  name: string | undefined;
  addInitializer(initializer: () => void): void;
}) => Function | void;
```

O primeiro parâmetro de um decorador de classe é a classe sendo decorada. O segundo parâmetro é o objeto de contexto. Se a classe decorada for anônima, a propriedade `name` será `undefined`.

Um decorador de classe pode retornar uma nova classe que substitui a original, ou pode não retornar nada. Se retornar algo que não é um construtor, um erro será lançado.

Aqui está um exemplo:

```javascript
function logged(value, { kind, name }) {
  if (kind === "class") {
    return class extends value {
      constructor(...args) {
        super(...args);
        console.log(`constructing an instance of ${name} with arguments ${args.join(", ")}`);
      }
    }
  }

  // ...
}

@logged
class C {}

new C(1);
// constructing an instance of C with arguments 1
```

Sem usar a sintaxe de decorador, um decorador de classe efetivamente executa assim:

```javascript
class C {}

C = logged(C, {
  kind: "class",
  name: "C",
}) ?? C;

new C(1);
```

## Decoradores de Método (nova sintaxe)

Decoradores de método modificam os métodos da classe.

```javascript
class C {
  @trace
  toString() {
    return 'C';
  }
}

// equivalente a
C.prototype.toString = trace(C.prototype.toString);
```

No exemplo acima, o decorador `@trace` decora o método `toString()`, o que equivale a modificar esse método.

O tipo de um decorador de método descrito em TypeScript é o seguinte:

```typescript
type ClassMethodDecorator = (value: Function, context: {
  kind: "method";
  name: string | symbol;
  access: { get(): unknown };
  static: boolean;
  private: boolean;
  addInitializer(initializer: () => void): void;
}) => Function | void;
```

O primeiro parâmetro `value` de um decorador de método é o método sendo decorado.

Um decorador de método pode retornar uma nova função que substitui o método original, ou pode não retornar nada para indicar que o método original ainda deve ser usado. Retornar qualquer outro tipo de valor lançará um erro. Aqui está um exemplo:

```javascript
function replaceMethod() {
  return function () {
    return `How are you, ${this.name}?`;
  }
}

class Person {
  constructor(name) {
    this.name = name;
  }
  @replaceMethod
  hello() {
    return `Hi ${this.name}!`;
  }
}

const robin = new Person('Robin');

robin.hello(), 'How are you, Robin?'
```

No exemplo acima, `@replaceMethod` retorna uma nova função que substitui o método original `hello()`.

```typescript
function logged(value, { kind, name }) {
  if (kind === "method") {
    return function (...args) {
      console.log(`starting ${name} with arguments ${args.join(", ")}`);
      const ret = value.call(this, ...args);
      console.log(`ending ${name}`);
      return ret;
    };
  }
}

class C {
  @logged
  m(arg) {}
}

new C().m(1);
// starting m with arguments 1
// ending m
```

No exemplo acima, o decorador `@logged` retorna uma função que substitui o método original `m()`.

Aqui o decorador é essencialmente açúcar sintático. A operação real é modificar o método `m()` na cadeia de protótipos, assim:

```javascript
class C {
  m(arg) {}
}

C.prototype.m = logged(C.prototype.m, {
  kind: "method",
  name: "m",
  static: false,
  private: false,
}) ?? C.prototype.m;
```

## Decorando Métodos

Decoradores podem decorar não apenas classes, mas também propriedades de classe.

```javascript
class Person {
  @readonly
  name() { return `${this.first} ${this.last}` }
}
```

No código acima, o decorador `readonly` é usado para decorar o método `name` da "classe".

A função decoradora `readonly` pode aceitar três parâmetros no total:

```javascript
function readonly(target, name, descriptor){
  // o valor original do objeto descriptor é o seguinte
  // {
  //   value: specifiedFunction,
  //   enumerable: false,
  //   configurable: true,
  //   writable: true
  // };
  descriptor.writable = false;
  return descriptor;
}

readonly(Person.prototype, 'name', descriptor);
// semelhante a
Object.defineProperty(Person.prototype, 'name', descriptor);
```

O primeiro parâmetro do decorador é o objeto protótipo da classe—no exemplo acima, `Person.prototype`. A intenção do decorador é "decorar" instâncias da classe, mas neste momento a instância ainda não foi criada, então só pode decorar o protótipo (isso difere dos decoradores de classe, onde o parâmetro `target` se refere à própria classe). O segundo parâmetro é o nome da propriedade sendo decorada e o terceiro é o objeto descriptor dessa propriedade.

Além disso, o código acima mostra que o decorador (`readonly`) modifica o objeto descriptor da propriedade, e o descriptor modificado é então usado para definir a propriedade.

Aqui está outro exemplo que modifica a propriedade `enumerable` do objeto descriptor para que a propriedade não possa ser enumerada:

```javascript
class Person {
  @nonenumerable
  get kidCount() { return this.children.length; }
}

function nonenumerable(target, name, descriptor) {
  descriptor.enumerable = false;
  return descriptor;
}
```

O decorador `@log` abaixo pode ser usado para exibir logs:

```javascript
class Math {
  @log
  add(a, b) {
    return a + b;
  }
}

function log(target, name, descriptor) {
  var oldValue = descriptor.value;

  descriptor.value = function() {
    console.log(`Calling ${name} with`, arguments);
    return oldValue.apply(this, arguments);
  };

  return descriptor;
}

const math = new Math();

// passed parameters should get logged now
math.add(2, 4);
```

No código acima, o decorador `@log` faz com que `console.log` seja executado antes da operação original, produzindo assim os logs.

Decoradores servem como documentação.

```javascript
@testable
class Person {
  @readonly
  @nonenumerable
  name() { return `${this.first} ${this.last}` }
}
```

A partir do código acima, podemos ver de relance que a classe `Person` é testável e que o método `name` é somente leitura e não enumerável.

O seguinte é um [componente](https://github.com/ionic-team/stencil) escrito usando a sintaxe de Decorator—fica claro à primeira vista:

```javascript
@Component({
  tag: 'my-component',
  styleUrl: 'my-component.scss'
})
export class MyComponent {
  @Prop() first: string;
  @Prop() last: string;
  @State() isVisible: boolean = true;

  render() {
    return (
      <p>Hello, my name is {this.first} {this.last}</p>
    );
  }
}
```

Se o mesmo método tiver vários decoradores, eles executam como descascar uma cebola: primeiro aplicados de fora para dentro, depois executados de dentro para fora.

```javascript
function dec(id){
  console.log('evaluated', id);
  return (target, property, descriptor) => console.log('executed', id);
}

class Example {
    @dec(1)
    @dec(2)
    method(){}
}
// evaluated 1
// evaluated 2
// executed 2
// executed 1
```

No código acima, o decorador externo `@dec(1)` é aplicado primeiro, mas o decorador interno `@dec(2)` executa primeiro.

Além da documentação, decoradores também podem ser usados para verificação de tipos. Para classes, isso é bastante útil. A longo prazo, será uma ferramenta importante para análise estática de código JavaScript.

## Por que Decoradores Não Podem Ser Usados em Funções?

Decoradores só podem ser usados em classes e métodos de classe, não em funções, por causa do hoisting de funções.

```javascript
var counter = 0;

var add = function () {
  counter++;
};

@add
function foo() {
}
```

A intenção do código acima é que `counter` seja igual a 1 após a execução, mas na prática o resultado é `counter` igual a 0. Por causa do hoisting de funções, o código que realmente executa é:

```javascript
var counter;
var add;

@add
function foo() {
}

counter = 0;

add = function () {
  counter++;
};
```

Aqui está outro exemplo:

```javascript
var readOnly = require("some-decorator");

@readOnly
function foo() {
}
```

Este código também tem problemas porque a execução real é:

```javascript
var readOnly;

@readOnly
function foo() {
}

readOnly = require("some-decorator");
```

Em resumo, por causa do hoisting de funções, decoradores não podem ser usados em funções. Classes não sofrem hoisting, então não há esse problema.

Por outro lado, se você realmente precisar decorar uma função, pode usar a forma de função de ordem superior e chamá-la diretamente:

```javascript
function doSomething(name) {
  console.log('Hello, ' + name);
}

function loggingDecorator(wrapped) {
  return function() {
    console.log('Starting');
    const result = wrapped.apply(this, arguments);
    console.log('Finished');
    return result;
  }
}

const wrapped = loggingDecorator(doSomething);
```

## Decoradores de Acessador (nova sintaxe)

A descrição de tipo dos decoradores de acessador em TypeScript é a seguinte:

```typescript
type ClassGetterDecorator = (value: Function, context: {
  kind: "getter";
  name: string | symbol;
  access: { get(): unknown };
  static: boolean;
  private: boolean;
  addInitializer(initializer: () => void): void;
}) => Function | void;

type ClassSetterDecorator = (value: Function, context: {
  kind: "setter";
  name: string | symbol;
  access: { set(value: unknown): void };
  static: boolean;
  private: boolean;
  addInitializer(initializer: () => void): void;
}) => Function | void;
```

O primeiro parâmetro de um decorador de acessador é o setter ou getter original.

Se o valor de retorno de um decorador de acessador for uma função, ela substitui o acessador original. Essencialmente, como os decoradores de método, a modificação acontece no objeto `prototype` da classe. Também pode não retornar nada e continuar usando o acessador original. Retornar qualquer outro tipo de valor lançará um erro.

Decoradores de acessador se aplicam separadamente a setters e getters. No exemplo abaixo, `@foo` decora apenas `get x()`, não `set x()`:

```javascript
class C {
  @foo
  get x() {
    // ...
  }

  set x(val) {
    // ...
  }
}
```

O decorador `@logged` da seção anterior pode ser adaptado para decoradores de acessador:

```javascript
function logged(value, { kind, name }) {
  if (kind === "method" || kind === "getter" || kind === "setter") {
    return function (...args) {
      console.log(`starting ${name} with arguments ${args.join(", ")}`);
      const ret = value.call(this, ...args);
      console.log(`ending ${name}`);
      return ret;
    };
  }
}

class C {
  @logged
  set x(arg) {}
}

new C().x = 1
// starting x with arguments 1
// ending x
```

Sem o açúcar sintático, a sintaxe tradicional equivalente modifica a cadeia de protótipos da classe:

```javascript
class C {
  set x(arg) {}
}

let { set } = Object.getOwnPropertyDescriptor(C.prototype, "x");
set = logged(set, {
  kind: "setter",
  name: "x",
  static: false,
  private: false,
}) ?? set;

Object.defineProperty(C.prototype, "x", { set });
```

## Decoradores de Propriedade (nova sintaxe)

A descrição de tipo de um decorador de propriedade é a seguinte:

```typescript
type ClassFieldDecorator = (value: undefined, context: {
  kind: "field";
  name: string | symbol;
  access: { get(): unknown, set(value: unknown): void };
  static: boolean;
  private: boolean;
}) => (initialValue: unknown) => unknown | void;
```

O primeiro parâmetro de um decorador de propriedade é `undefined`—nenhum valor é passado. Os usuários podem escolher fazer o decorador retornar uma função de inicialização. Quando a propriedade for atribuída, essa função de inicialização será executada automaticamente. Ela recebe o valor inicial da propriedade e retorna um novo valor inicial. Um decorador de propriedade também pode não retornar nada. Retornar qualquer outro tipo de valor lançará um erro.

Aqui está um exemplo:

```javascript
function logged(value, { kind, name }) {
  if (kind === "field") {
    return function (initialValue) {
      console.log(`initializing ${name} with value ${initialValue}`);
      return initialValue;
    };
  }

  // ...
}

class C {
  @logged x = 1;
}

new C();
// initializing x with value 1
```

Sem a sintaxe de decorador, um decorador de propriedade efetivamente funciona assim:

```javascript
let initializeX = logged(undefined, {
  kind: "field",
  name: "x",
  static: false,
  private: false,
}) ?? (initialValue) => initialValue;

class C {
  x = initializeX.call(this, 1);
}
```

## A Palavra-chave `accessor` (nova sintaxe)

A proposta de decoradores de classe introduz uma nova palavra-chave `accessor` usada como prefixo de propriedades.

```javascript
class C {
  accessor x = 1;
}
```

Ela é uma abreviação equivalente a declarar a propriedade `x` como a interface de acesso da propriedade privada `#x`. O código acima equivale a:

```javascript
class C {
  #x = 1;

  get x() {
    return this.#x;
  }

  set x(val) {
    this.#x = val;
  }
}
```

A palavra-chave `accessor` pode ser precedida por `static` e `private`:

```javascript
class C {
  static accessor x = 1;
  accessor #y = 2;
}
```

A palavra-chave `accessor` também pode aceitar decoradores de propriedade:

```javascript
function logged(value, { kind, name }) {
  if (kind === "accessor") {
    let { get, set } = value;

    return {
      get() {
        console.log(`getting ${name}`);

        return get.call(this);
      },

      set(val) {
        console.log(`setting ${name} to ${val}`);

        return set.call(this, val);
      },

      init(initialValue) {
        console.log(`initializing ${name} with value ${initialValue}`);
        return initialValue;
      }
    };
  }

  // ...
}

class C {
  @logged accessor x = 1;
}

let c = new C();
// initializing x with value 1
c.x;
// getting x
c.x = 123;
// setting x to 123
```

O exemplo acima equivale a usar o decorador `@logged` para modificar os métodos getter e setter da propriedade `accessor`.

A descrição de tipo de um decorador de propriedade para `accessor` é a seguinte:

```typescript
type ClassAutoAccessorDecorator = (
  value: {
    get: () => unknown;
    set(value: unknown) => void;
  },
  context: {
    kind: "accessor";
    name: string | symbol;
    access: { get(): unknown, set(value: unknown): void };
    static: boolean;
    private: boolean;
    addInitializer(initializer: () => void): void;
  }
) => {
  get?: () => unknown;
  set?: (value: unknown) => void;
  initialize?: (initialValue: unknown) => unknown;
} | void;
```

O primeiro parâmetro recebido pelo decorador `accessor` é um objeto contendo o getter e o setter da propriedade acessadora definida pela palavra-chave `accessor`. O decorador de propriedade pode retornar um novo objeto contendo novos acessadores para substituir os originais, o que efetivamente os intercepta. Além disso, o objeto retornado pode incluir uma função `initialize` para alterar o valor inicial da propriedade privada. O decorador também pode não retornar nada. Retornar qualquer outro tipo de valor ou um objeto com outras propriedades lançará um erro.

## O Método `addInitializer()` (nova sintaxe)

Exceto para decoradores de propriedade, o objeto de contexto dos demais decoradores inclui um método `addInitializer()` para inicialização.

Quando ele é executado:

- Decoradores de classe: Após a classe ser totalmente definida.
- Decoradores de método: Durante a construção da classe, antes da inicialização das propriedades.
- Decoradores de método estático: Durante a definição da classe, após as definições dos métodos da classe, mas antes das definições das propriedades estáticas.

Aqui está um exemplo:

```javascript
function customElement(name) {
  return (value, { addInitializer }) => {
    addInitializer(function() {
      customElements.define(name, this);
    });
  }
}

@customElement('my-element')
class MyElement extends HTMLElement {
  static get observedAttributes() {
    return ['some', 'attrs'];
  }
}
```

O código acima equivale a este código sem decoradores:

```javascript
class MyElement {
  static get observedAttributes() {
    return ['some', 'attrs'];
  }
}

let initializersForMyElement = [];

MyElement = customElement('my-element')(MyElement, {
  kind: "class",
  name: "MyElement",
  addInitializer(fn) {
    initializersForMyElement.push(fn);
  },
}) ?? MyElement;

for (let initializer of initializersForMyElement) {
  initializer.call(MyElement);
}
```

Aqui está um exemplo de decorador de método:

```javascript
function bound(value, { name, addInitializer }) {
  addInitializer(function () {
    this[name] = this[name].bind(this);
  });
}

class C {
  message = "hello!";

  @bound
  m() {
    console.log(this.message);
  }
}

let { m } = new C();

m(); // hello!
```

O código acima equivale a este código sem decoradores:

```javascript
class C {
  constructor() {
    for (let initializer of initializersForM) {
      initializer.call(this);
    }

    this.message = "hello!";
  }

  m() {}
}

let initializersForM = []

C.prototype.m = bound(
  C.prototype.m,
  {
    kind: "method",
    name: "m",
    static: false,
    private: false,
    addInitializer(fn) {
      initializersForM.push(fn);
    },
  }
) ?? C.prototype.m;
```

## core-decorators.js

[core-decorators.js](https://github.com/jayphelps/core-decorators.js) é um módulo de terceiros que fornece vários decoradores comuns. Ele pode ajudá-lo a entender melhor os decoradores.

**(1)@autobind**

O decorador `autobind` faz com que o objeto `this` no método seja vinculado ao objeto original.

```javascript
import { autobind } from 'core-decorators';

class Person {
  @autobind
  getPerson() {
    return this;
  }
}

let person = new Person();
let getPerson = person.getPerson;

getPerson() === person;
// true
```

**(2)@readonly**

O decorador `readonly` torna uma propriedade ou método não gravável.

```javascript
import { readonly } from 'core-decorators';

class Meal {
  @readonly
  entree = 'steak';
}

var dinner = new Meal();
dinner.entree = 'salmon';
// Cannot assign to read only property 'entree' of [object Object]
```

**(3)@override**

O decorador `override` verifica se um método da subclasse sobrescreve corretamente um método da classe pai com o mesmo nome; lança um erro se não o fizer.

```javascript
import { override } from 'core-decorators';

class Parent {
  speak(first, second) {}
}

class Child extends Parent {
  @override
  speak() {}
  // SyntaxError: Child#speak() does not properly override Parent#speak(first, second)
}

// ou

class Child extends Parent {
  @override
  speaks() {}
  // SyntaxError: No descriptor matching Child#speaks() was found on the prototype chain.
  //
  //   Did you mean "speak"?
}
```

**(4)@deprecate (alias @deprecated)**

O decorador `deprecate` ou `deprecated` exibe um aviso no console indicando que o método será removido.

```javascript
import { deprecate } from 'core-decorators';

class Person {
  @deprecate
  facepalm() {}

  @deprecate('We stopped facepalming')
  facepalmHard() {}

  @deprecate('We stopped facepalming', { url: 'http://knowyourmeme.com/memes/facepalm' })
  facepalmHarder() {}
}

let person = new Person();

person.facepalm();
// DEPRECATION Person#facepalm: This function will be removed in future versions.

person.facepalmHard();
// DEPRECATION Person#facepalmHard: We stopped facepalming

person.facepalmHarder();
// DEPRECATION Person#facepalmHarder: We stopped facepalming
//
//     See http://knowyourmeme.com/memes/facepalm for more details.
//
```

**(5)@suppressWarnings**

O decorador `suppressWarnings` suprime chamadas `console.warn()` acionadas pelo decorador `deprecated`. Porém, chamadas emitidas por código assíncrono não são suprimidas.

```javascript
import { suppressWarnings } from 'core-decorators';

class Person {
  @deprecated
  facepalm() {}

  @suppressWarnings
  facepalmWithoutWarning() {
    this.facepalm();
  }
}

let person = new Person();

person.facepalmWithoutWarning();
// no warning is logged
```

## Usando Decoradores para Publicar Eventos Automaticamente

Podemos usar decoradores para que, quando um método de um objeto for chamado, um evento seja automaticamente emitido.

```javascript
const postal = require("postal/lib/postal.lodash");

export default function publish(topic, channel) {
  const channelName = channel || '/';
  const msgChannel = postal.channel(channelName);
  msgChannel.subscribe(topic, v => {
    console.log('Canal: ', channelName);
    console.log('Evento: ', topic);
    console.log('Dados: ', v);
  });

  return function(target, name, descriptor) {
    const fn = descriptor.value;

    descriptor.value = function() {
      let value = fn.apply(this, arguments);
      msgChannel.publish(topic, value);
    };
  };
}
```

O código acima define um decorador chamado `publish` que modifica `descriptor.value` para que, quando o método original for chamado, um evento seja automaticamente emitido. Ele usa [Postal.js](https://github.com/postaljs/postal.js) como biblioteca de publicação/assinatura de eventos.

Exemplo de uso:

```javascript
// index.js
import publish from './publish';

class FooComponent {
  @publish('foo.some.message', 'component')
  someMethod() {
    return { my: 'data' };
  }
  @publish('foo.some.other')
  anotherMethod() {
    // ...
  }
}

let foo = new FooComponent();

foo.someMethod();
foo.anotherMethod();
```

A partir de então, sempre que `someMethod` ou `anotherMethod` for chamado, um evento será automaticamente emitido.

```bash
$ bash-node index.js
Canal:  component
Evento:  foo.some.message
Dados:  { my: 'data' }

Canal:  /
Evento:  foo.some.other
Dados:  undefined
```

## Mixin

Sobre decoradores, o padrão Mixin pode ser implementado. O padrão Mixin é uma alternativa à herança de objetos—significa misturar os métodos de outro objeto em um objeto.

Considere o exemplo a seguir:

```javascript
const Foo = {
  foo() { console.log('foo') }
};

class MyClass {}

Object.assign(MyClass.prototype, Foo);

let obj = new MyClass();
obj.foo() // 'foo'
```

No código acima, o objeto `Foo` possui um método `foo`. Usando o método `Object.assign`, o método `foo` pode ser "misturado" na classe `MyClass`, de modo que instâncias de `MyClass` tenham o método `foo`. Esta é uma implementação simples do padrão "mixin".

A seguir, vamos implementar um script geral `mixins.js` que escreve Mixin como um decorador:

```javascript
export function mixins(...list) {
  return function (target) {
    Object.assign(target.prototype, ...list);
  };
}
```

Então podemos usar esse decorador para "misturar" vários métodos em uma classe:

```javascript
import { mixins } from './mixins.js';

const Foo = {
  foo() { console.log('foo') }
};

@mixins(Foo)
class MyClass {}

let obj = new MyClass();
obj.foo() // "foo"
```

Com o decorador `mixins`, o método `foo` do objeto `Foo` é "misturado" na classe `MyClass`.

Porém, a abordagem acima muta o objeto `prototype` da classe `MyClass`. Se preferir não fazer isso, você também pode implementar Mixin através de herança de classe:

```javascript
class MyClass extends MyBaseClass {
  /* ... */
}
```

No código acima, `MyClass` estende `MyBaseClass`. Se quisermos "misturar" um método `foo` em `MyClass`, uma abordagem é inserir uma classe mixin entre `MyClass` e `MyBaseClass`. Esta classe possui o método `foo` e herda todos os métodos de `MyBaseClass`, e então `MyClass` estende esta classe:

```javascript
let MyMixin = (superclass) => class extends superclass {
  foo() {
    console.log('foo from MyMixin');
  }
};
```

No código acima, `MyMixin` é um gerador de classe mixin que aceita `superclass` como parâmetro e retorna uma subclasse que estende `superclass` e inclui um método `foo`.

Então, se a classe alvo estender esta classe mixin, o objetivo de "misturar" o método `foo` é alcançado:

```javascript
class MyClass extends MyMixin(MyBaseClass) {
  /* ... */
}

let c = new MyClass();
c.foo(); // "foo from MyMixin"
```

Se precisar "misturar" vários métodos, crie várias classes mixin:

```javascript
class MyClass extends Mixin1(Mixin2(MyBaseClass)) {
  /* ... */
}
```

Uma vantagem dessa abordagem é que você pode chamar `super`, o que ajuda a evitar sobrescrever o método da classe pai com o mesmo nome durante o processo de "mistura":

```javascript
let Mixin1 = (superclass) => class extends superclass {
  foo() {
    console.log('foo from Mixin1');
    if (super.foo) super.foo();
  }
};

let Mixin2 = (superclass) => class extends superclass {
  foo() {
    console.log('foo from Mixin2');
    if (super.foo) super.foo();
  }
};

class S {
  foo() {
    console.log('foo from S');
  }
}

class C extends Mixin1(Mixin2(S)) {
  foo() {
    console.log('foo from C');
    super.foo();
  }
}
```

No código acima, cada vez que uma "mistura" ocorre, o método `super.foo` da classe pai é chamado, então o método da classe pai com o mesmo nome não é sobrescrito e seu comportamento é preservado.

```javascript
new C().foo()
// foo from C
// foo from Mixin1
// foo from Mixin2
// foo from S
```

## Trait

Um Trait também é um tipo de decorador com efeito semelhante ao Mixin, mas fornece mais recursos, como prevenir conflitos entre métodos com o mesmo nome, excluir certos métodos de serem misturados e dar apelidos a métodos misturados.

O exemplo a seguir usa o módulo de terceiros [traits-decorator](https://github.com/CocktailJS/traits-decorator). O decorador `traits` fornecido por este módulo pode aceitar não apenas objetos, mas também classes ES6 como parâmetros.

```javascript
import { traits } from 'traits-decorator';

class TFoo {
  foo() { console.log('foo') }
}

const TBar = {
  bar() { console.log('bar') }
};

@traits(TFoo, TBar)
class MyClass { }

let obj = new MyClass();
obj.foo() // foo
obj.bar() // bar
```

No código acima, o decorador `traits` "mistura" o método `foo` da classe `TFoo` e o método `bar` do objeto `TBar` na classe `MyClass`.

Trait não permite "misturar" métodos com o mesmo nome:

```javascript
import { traits } from 'traits-decorator';

class TFoo {
  foo() { console.log('foo') }
}

const TBar = {
  bar() { console.log('bar') },
  foo() { console.log('foo') }
};

@traits(TFoo, TBar)
class MyClass { }
// Erro
// throw new Error('Method named: ' + methodName + ' is defined twice.');
//        ^
// Error: Method named: foo is defined twice.
```

No código acima, tanto `TFoo` quanto `TBar` possuem um método `foo`, então o decorador `traits` lança um erro.

Uma solução é excluir o método `foo` de `TBar`:

```javascript
import { traits, excludes } from 'traits-decorator';

class TFoo {
  foo() { console.log('foo') }
}

const TBar = {
  bar() { console.log('bar') },
  foo() { console.log('foo') }
};

@traits(TFoo, TBar::excludes('foo'))
class MyClass { }

let obj = new MyClass();
obj.foo() // foo
obj.bar() // bar
```

O código acima usa o operador de vinculação (`::`) para excluir o método `foo` de `TBar`, então nenhum erro é lançado durante a mistura.

Outra abordagem é dar um apelido ao método `foo` de `TBar`:

```javascript
import { traits, alias } from 'traits-decorator';

class TFoo {
  foo() { console.log('foo') }
}

const TBar = {
  bar() { console.log('bar') },
  foo() { console.log('foo') }
};

@traits(TFoo, TBar::alias({foo: 'aliasFoo'}))
class MyClass { }

let obj = new MyClass();
obj.foo() // foo
obj.aliasFoo() // foo
obj.bar() // bar
```

O código acima dá ao método `foo` de `TBar` o apelido `aliasFoo`, então `MyClass` também pode misturar o método `foo` de `TBar`.

Os métodos `alias` e `excludes` podem ser usados juntos:

```javascript
@traits(TExample::excludes('foo','bar')::alias({baz:'exampleBaz'}))
class MyClass {}
```

O código acima exclui os métodos `foo` e `bar` de `TExample` e dá ao método `baz` o apelido `exampleBaz`.

O método `as` oferece outra forma de escrever o acima:

```javascript
@traits(TExample::as({excludes:['foo', 'bar'], alias: {baz: 'exampleBaz'}}))
class MyClass {}
```
