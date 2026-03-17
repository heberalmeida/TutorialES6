# Herança de Classes

## Introdução

As classes podem herdar as propriedades e métodos de uma classe pai por meio da palavra-chave `extends`. Essa sintaxe é muito mais clara e conveniente do que a herança por cadeia de protótipos do ES5.

```javascript
class Point {
}

class ColorPoint extends Point {
}
```

No exemplo acima, `Point` é a classe pai e `ColorPoint` é a classe filha. Ela herda todas as propriedades e métodos da classe `Point` através da palavra-chave `extends`. Como nenhum código foi implementado, ambas as classes são idênticas, equivalentes a copiar a classe `Point`.

Em seguida, adicionamos código dentro de `ColorPoint`.

```javascript
class Point { /* ... */ }

class ColorPoint extends Point {
  constructor(x, y, color) {
    super(x, y); // Chama construtor pai (x, y)
    this.color = color;
  }

  toString() {
    return this.color + ' ' + super.toString(); // Chama toString() do pai
  }
}
```

No exemplo acima, a palavra-chave `super` aparece tanto no método `constructor()` quanto no método `toString()`. Aqui `super` representa o construtor da classe pai e é usado para criar uma nova instância da classe pai.

O ES6 exige que as classes filhas chamem `super()` no método `constructor()`; caso contrário, um erro será lançado. Isso ocorre porque o próprio objeto `this` da classe filha deve primeiro ser moldado pelo construtor da classe pai para obter as mesmas propriedades e métodos de instância que o pai, e só então a classe filha pode adicionar suas próprias propriedades e métodos de instância. Sem chamar `super()`, a classe filha não pode obter seu próprio objeto `this`.

```javascript
class Point { /* ... */ }

class ColorPoint extends Point {
  constructor() {
  }
}

let cp = new ColorPoint(); // ReferenceError
```

No código acima, `ColorPoint` herda da classe pai `Point`, mas seu construtor não chama `super()`, causando erro ao criar uma nova instância.

Por que o construtor da classe filha deve chamar `super()`? A razão está no mecanismo de herança do ES6, que difere fundamentalmente do ES5. A herança do ES5 primeiro cria um objeto de instância da classe filha independente, depois adiciona os métodos da classe pai a ele—"instância primeiro, herança depois." A herança do ES6 primeiro adiciona as propriedades e métodos da classe pai a um objeto vazio, depois usa esse objeto como a instância da classe filha—"herança primeiro, instância depois." Por isso a herança do ES6 deve chamar `super()` primeiro: essa etapa produz o objeto `this` que herda do pai; sem ela, a herança falha.

Note que isso significa que o construtor pai sempre executa primeiro ao criar uma instância da classe filha.

```javascript
class Foo {
  constructor() {
    console.log(1);
  }
}

class Bar extends Foo {
  constructor() {
    super();
    console.log(2);
  }
}

const bar = new Bar();
// 1
// 2
```

No exemplo acima, ao criar uma nova instância de `Bar`, 1 e 2 são exibidos porque o construtor filho chama `super()`, que executa o construtor pai.

Outro ponto importante: no construtor filho, `this` só pode ser usado após chamar `super()`; usá-lo antes causa erro. Isso ocorre porque a instância filha deve primeiro herdar do pai, e só `super()` faz com que essa herança aconteça.

```javascript
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class ColorPoint extends Point {
  constructor(x, y, color) {
    this.color = color; // ReferenceError
    super(x, y);
    this.color = color; // Correto
  }
}
```

No código acima, o `constructor()` da classe filha usa `this` antes de chamar `super()`, o que causa erro; colocá-lo após `super()` está correto.

Se a classe filha não definir um método `constructor()`, um é adicionado por padrão e chamará `super()`. Ou seja, esteja definido explicitamente ou não, toda classe filha tem um método `constructor()`.

```javascript
class ColorPoint extends Point {
}

// Equivalente a
class ColorPoint extends Point {
  constructor(...args) {
    super(...args);
  }
}
```

Com a classe filha definida, você pode criar instâncias da classe filha.

```javascript
let cp = new ColorPoint(25, 8, 'green');

cp instanceof ColorPoint // true
cp instanceof Point // true
```

No exemplo acima, a instância `cp` é instância tanto de `ColorPoint` quanto de `Point`, o que corresponde ao comportamento do ES5.

## Herança de Propriedades e Métodos Privados

Todas as propriedades e métodos da classe pai são herdados pela classe filha, exceto propriedades e métodos privados.

Uma classe filha não pode herdar propriedades privadas do pai; propriedades privadas só podem ser usadas dentro da classe onde foram definidas.

```javascript
class Foo {
  #p = 1;
  #m() {
    console.log('hello');
  }
}

class Bar extends Foo {
  constructor() {
    super();
    console.log(this.#p); // Erro
    this.#m(); // Erro
  }
}
```

No exemplo acima, a classe filha Bar acessar propriedades ou métodos privados do pai Foo causa erro.

Se a classe pai definir métodos getter/setter para propriedades privadas, a classe filha pode ler e escrever essas propriedades privadas através desses métodos.

```javascript
class Foo {
  #p = 1;
  getP() {
    return this.#p;
  }
}

class Bar extends Foo {
  constructor() {
    super();
    console.log(this.getP()); // 1
  }
}
```

No exemplo acima, `getP()` é o método do pai que lê a propriedade privada; através dele, a classe filha pode ler a propriedade privada do pai.

## Herança de Propriedades Estáticas e Métodos Estáticos

Propriedades estáticas e métodos estáticos da classe pai são herdados pela classe filha.

```javascript
class A {
  static hello() {
    console.log('hello world');
  }
}

class B extends A {
}

B.hello()  // hello world
```

No código acima, `hello()` é um método estático da classe A; B herda de A e assim herda o método estático de A.

Note que propriedades estáticas são herdadas por cópia rasa (shallow copy).

```javascript
class A { static foo = 100; }
class B extends A {
  constructor() {
    super();
    B.foo--;
  }
}

const b = new B();
B.foo // 99
A.foo // 100
```

No exemplo acima, `foo` é uma propriedade estática da classe A; B herda de A, então herda essa propriedade. Porém, quando B modifica `B.foo`, `A.foo` não é afetado, porque a classe filha herda propriedades estáticas por cópia rasa—o valor do pai é copiado, então `A.foo` e `B.foo` são propriedades separadas.

Como essa cópia é rasa, se o valor da propriedade estática do pai for um objeto, a propriedade estática da classe filha apontará para o mesmo objeto, já que cópia rasa copia apenas a referência ao objeto.

```javascript
class A {
  static foo = { n: 100 };
}

class B extends A {
  constructor() {
    super();
    B.foo.n--;
  }
}

const b = new B();
B.foo.n // 99
A.foo.n // 99
```

No exemplo acima, `A.foo` é um objeto; a cópia rasa faz com que `B.foo` e `A.foo` apontem para o mesmo objeto. Então, quando a classe filha B modifica uma propriedade desse objeto, o pai A também é afetado.

## Object.getPrototypeOf()

O método `Object.getPrototypeOf()` pode ser usado para obter a classe pai a partir de uma classe filha.

```javascript
class Point { /*...*/ }

class ColorPoint extends Point { /*...*/ }

Object.getPrototypeOf(ColorPoint) === Point
// true
```

Portanto, esse método pode ser usado para verificar se uma classe herda de outra.

## A Palavra-chave super

A palavra-chave `super` pode ser usada tanto como função quanto como objeto. Nestes dois casos, seu comportamento é diferente.

**Primeiro caso:** quando `super` é chamado como função, representa o construtor da classe pai. O ES6 exige que o construtor filho chame `super()` uma vez.

```javascript
class A {}

class B extends A {
  constructor() {
    super();
  }
}
```

No código acima, `super()` no construtor da classe filha B representa uma chamada ao construtor pai. Isso é obrigatório; caso contrário, um erro será lançado.

Chamar `super()` cria o objeto `this` da classe filha e coloca as propriedades e métodos de instância do pai nele. Antes de chamar `super()`, a classe filha não tem um objeto `this`; qualquer uso de `this` deve vir após `super()`.

Nota: embora `super` aqui represente o construtor pai, ele retorna o `this` da classe filha (a instância filha). Assim, `this` dentro de `super` refere-se à instância filha, não à instância pai. Aqui, `super()` equivale a `A.prototype.constructor.call(this)` (executando o construtor pai sobre o `this` da classe filha).

```javascript
class A {
  constructor() {
    console.log(new.target.name);
  }
}
class B extends A {
  constructor() {
    super();
  }
}
new A() // A
new B() // B
```

No exemplo acima, `new.target` aponta para o construtor atualmente em execução. Quando `super()` executa (durante `new B()`), ele aponta para o construtor da classe filha B, não para o construtor da classe pai A. Ou seja, `this` dentro de `super()` refere-se a B.

Porém, quando `super()` executa no construtor filho, as propriedades e métodos da classe filha ainda não foram vinculados a `this`. Então, se houver propriedades com o mesmo nome, o valor do pai é usado naquele momento.

```javascript
class A {
  name = 'A';
  constructor() {
    console.log('My name is ' + this.name);
  }
}

class B extends A {
  name = 'B';
}

const b = new B(); // My name is A
```

No exemplo acima, a saída é `A`, não `B`, porque quando `super()` executa, a propriedade `name` de B ainda não foi vinculada a `this`, então `this.name` lê a propriedade `name` de A.

Quando usado como função, `super()` só pode ser usado no construtor filho; usá-lo em outro lugar causa erro.

```javascript
class A {}

class B extends A {
  m() {
    super(); // Erro
  }
}
```

No código acima, usar `super()` no método `m` de B causa um erro de sintaxe.

**Segundo caso:** quando `super` é usado como objeto, em um método normal ele refere-se ao protótipo do pai; em um método estático refere-se à classe pai.

```javascript
class A {
  p() {
    return 2;
  }
}

class B extends A {
  constructor() {
    super();
    console.log(super.p()); // 2
  }
}

let b = new B();
```

No código acima, `super.p()` na classe filha B usa `super` como objeto. Aqui `super` em um método normal refere-se a `A.prototype`, então `super.p()` equivale a `A.prototype.p()`.

Note que, como `super` refere-se ao protótipo do pai, métodos ou propriedades definidos na instância do pai não podem ser acessados através de `super`.

```javascript
class A {
  constructor() {
    this.p = 2;
  }
}

class B extends A {
  get m() {
    return super.p;
  }
}

let b = new B();
b.m // undefined
```

No código acima, `p` é uma propriedade da instância do pai A; `super.p` não pode acessá-la.

Se a propriedade estiver definida no protótipo do pai, `super` pode acessá-la.

```javascript
class A {}
A.prototype.x = 2;

class B extends A {
  constructor() {
    super();
    console.log(super.x) // 2
  }
}

let b = new B();
```

No código acima, `x` está definido em `A.prototype`, então `super.x` pode acessar seu valor.

O ES6 especifica que, quando uma classe filha chama um método do pai através de `super` em um método normal, `this` dentro desse método refere-se à instância filha atual.

```javascript
class A {
  constructor() {
    this.x = 1;
  }
  print() {
    console.log(this.x);
  }
}

class B extends A {
  constructor() {
    super();
    this.x = 2;
  }
  m() {
    super.print();
  }
}

let b = new B();
b.m() // 2
```

No código acima, `super.print()` chama `A.prototype.print()`, mas `this` dentro de `A.prototype.print()` refere-se à instância filha B, então a saída é `2`, não `1`. Na prática, executa como `super.print.call(this)`.

Como `this` refere-se à instância filha, se você atribuir a uma propriedade através de `super`, essa atribuição é aplicada a `this`, e a propriedade torna-se uma propriedade da instância filha.

```javascript
class A {
  constructor() {
    this.x = 1;
  }
}

class B extends A {
  constructor() {
    super();
    this.x = 2;
    super.x = 3;
    console.log(super.x); // undefined
    console.log(this.x); // 3
  }
}

let b = new B();
```

No código acima, atribuir a `super.x` equivale a atribuir a `this.x`, então passa a ser 3. Ao ler `super.x`, lê-se de `A.prototype.x`, que é undefined.

Se `super` for usado como objeto em um método estático, ele refere-se à classe pai, não ao protótipo do pai.

```javascript
class Parent {
  static myMethod(msg) {
    console.log('static', msg);
  }

  myMethod(msg) {
    console.log('instance', msg);
  }
}

class Child extends Parent {
  static myMethod(msg) {
    super.myMethod(msg);
  }

  myMethod(msg) {
    super.myMethod(msg);
  }
}

Child.myMethod(1); // static 1

var child = new Child();
child.myMethod(2); // instance 2
```

No código acima, `super` em um método estático refere-se à classe pai; em um método normal refere-se ao protótipo do pai.

Ao chamar um método do pai através de `super` em um método estático da classe filha, `this` dentro desse método refere-se à classe filha atual, não à instância filha.

```javascript
class A {
  constructor() {
    this.x = 1;
  }
  static print() {
    console.log(this.x);
  }
}

class B extends A {
  constructor() {
    super();
    this.x = 2;
  }
  static m() {
    super.print();
  }
}

B.x = 3;
B.m() // 3
```

No código acima, dentro do método estático `B.m`, `super.print` refere-se ao método estático do pai. `this` dentro desse método refere-se a B, não a uma instância de B.

Nota: ao usar `super`, você deve indicar claramente se está sendo usado como função ou como objeto; caso contrário, um erro será lançado.

```javascript
class A {}

class B extends A {
  constructor() {
    super();
    console.log(super); // Erro
  }
}
```

No código acima, `super` em `console.log(super)` é ambíguo como função ou objeto, então o motor JavaScript lança um erro. Se o uso deixar o tipo claro, não lança.

```javascript
class A {}

class B extends A {
  constructor() {
    super();
    console.log(super.valueOf() instanceof B); // true
  }
}

let b = new B();
```

No código acima, `super.valueOf()` mostra que `super` é um objeto, então nenhum erro é lançado. Como `super` faz com que `this` se refira à instância B, `super.valueOf()` retorna uma instância de B.

Por fim, como objetos sempre herdam de outros objetos, a palavra-chave `super` pode ser usada em qualquer objeto.

```javascript
var obj = {
  toString() {
    return "MyObject: " + super.toString();
  }
};

obj.toString(); // MyObject: [object Object]
```

## As Propriedades prototype e __proto__ das Classes

Na maioria das implementações do ES5, todo objeto tem uma propriedade `__proto__` que aponta para o `prototype` do seu construtor. Classes, como açúcar sintático para construtores, têm tanto `prototype` quanto `__proto__`, então existem duas cadeias de herança:

(1) A propriedade `__proto__` da classe filha, representando a herança do construtor, sempre aponta para a classe pai.

(2) O `__proto__` da propriedade `prototype` da classe filha, representando a herança de métodos, sempre aponta para o `prototype` da classe pai.

```javascript
class A {
}

class B extends A {
}

B.__proto__ === A // true
B.prototype.__proto__ === A.prototype // true
```

No código acima, o `__proto__` da classe filha B aponta para o pai A; o `prototype.__proto__` da classe filha B aponta para o `prototype` do pai A.

Isso ocorre porque a herança de classes é implementada da seguinte forma:

```javascript
class A {
}

class B {
}

// Instâncias de B herdam de instâncias de A
Object.setPrototypeOf(B.prototype, A.prototype);

// B herda propriedades estáticas de A
Object.setPrototypeOf(B, A);

const b = new B();
```

O capítulo Object Extensions cobre a implementação de `Object.setPrototypeOf`:

```javascript
Object.setPrototypeOf = function (obj, proto) {
  obj.__proto__ = proto;
  return obj;
}
```

Assim, os resultados acima se seguem.

```javascript
Object.setPrototypeOf(B.prototype, A.prototype);
// Equivalente a
B.prototype.__proto__ = A.prototype;

Object.setPrototypeOf(B, A);
// Equivalente a
B.__proto__ = A;
```

Essas duas cadeias de herança podem ser entendidas como: como objeto, o protótipo (`__proto__`) da classe filha (B) é a classe pai (A); como construtor, o objeto protótipo (`prototype`) da classe filha (B) herda do objeto protótipo (`prototype`) do pai.

```javascript
B.prototype = Object.create(A.prototype);
// Equivalente a
B.prototype.__proto__ = A.prototype;
```

O valor após a palavra-chave `extends` pode ser de vários tipos.

```javascript
class B extends A {
}
```

No código acima, `A` só precisa ser uma função com uma propriedade `prototype` para B estendê-la. Como a maioria das funções tem `prototype` (exceto `Function.prototype`), A pode ser quase qualquer função.

Dois casos: primeiro, quando a classe filha estende `Object`:

```javascript
class A extends Object {
}

A.__proto__ === Object // true
A.prototype.__proto__ === Object.prototype // true
```

Aqui A é efetivamente uma cópia do construtor `Object`, e as instâncias de A são instâncias de Object.

Segundo, quando não há herança:

```javascript
class A {
}

A.__proto__ === Function.prototype // true
A.prototype.__proto__ === Object.prototype // true
```

Aqui A, como classe base, é uma função ordinária e herda diretamente de `Function.prototype`. Quando chamada, retorna um objeto vazio (uma instância de Object), então `A.prototype.__proto__` aponta para o `prototype` de `Object`.

### Propriedade __proto__ da Instância

O `__proto__` do `__proto__` da instância filha aponta para o `__proto__` da instância pai. Ou seja, o protótipo do protótipo da filha é o protótipo do pai.

```javascript
var p1 = new Point(2, 3);
var p2 = new ColorPoint(2, 3, 'red');

p2.__proto__ === p1.__proto__ // false
p2.__proto__.__proto__ === p1.__proto__ // true
```

No código acima, `ColorPoint` estende `Point`, então o protótipo do protótipo da filha é o protótipo do pai.

Assim, você pode modificar o comportamento da instância pai através de `__proto__.__proto__` da instância filha.

```javascript
p2.__proto__.__proto__.printName = function () {
  console.log('Ha');
};

p1.printName() // "Ha"
```

O código acima adiciona um método a `Point` via instância `p2` de `ColorPoint`; isso afeta a instância `p1` de `Point`.

## Herdando de Construtores Nativos

Construtores nativos são construtores embutidos na linguagem, geralmente usados para criar estruturas de dados. Os construtores nativos do ECMAScript incluem:

- Boolean()
- Number()
- String()
- Array()
- Date()
- Function()
- RegExp()
- Error()
- Object()

Anteriormente, esses construtores nativos não podiam ser estendidos. Por exemplo, não era possível definir sua própria subclasse de Array:

```javascript
function MyArray() {
  Array.apply(this, arguments);
}

MyArray.prototype = Object.create(Array.prototype, {
  constructor: {
    value: MyArray,
    writable: true,
    configurable: true,
    enumerable: true
  }
});
```

O código acima define uma classe `MyArray` que estende Array, mas seu comportamento é inconsistente com Array:

```javascript
var colors = new MyArray();
colors[0] = "red";
colors.length  // 0

colors.length = 0;
colors[0]  // "red"
```

Isso acontece porque a classe filha não consegue obter as propriedades internas do construtor nativo; nem `Array.apply()` nem a atribuição ao protótipo funcionam. Os construtores nativos ignoram o `this` passado para `apply`, então `this` não pode ser vinculado e as propriedades internas não ficam disponíveis.

No ES5, o objeto de instância filha `this` é criado primeiro, depois as propriedades do pai são adicionadas. Como as propriedades internas do pai não podem ser obtidas, os construtores nativos não podiam ser estendidos corretamente. Por exemplo, o construtor Array tem uma propriedade interna `[[DefineOwnProperty]]` que atualiza a propriedade `length` quando novas propriedades são definidas; isso não pode ser acessado na classe filha, então o comportamento de `length` na filha fica incorreto.

No próximo exemplo, tentamos fazer um objeto simples herdar de Error:

```javascript
var e = {};

Object.getOwnPropertyNames(Error.call(e))
// [ 'stack' ]

Object.getOwnPropertyNames(e)
// []
```

No código acima, tentamos dar ao objeto simples `e` as propriedades de instância de Error via `Error.call(e)`. Mas `Error.call()` ignora o primeiro argumento e retorna um novo objeto; o próprio `e` permanece inalterado. Isso mostra que `Error.call(e)` não pode estender construtores nativos.

O ES6 permite estender construtores nativos porque primeiro cria o objeto de instância do pai `this`, depois o modifica com o construtor filho, de modo que todo o comportamento do pai pode ser herdado. Eis um exemplo estendendo Array:

```javascript
class MyArray extends Array {
  constructor(...args) {
    super(...args);
  }
}

var arr = new MyArray();
arr[0] = 12;
arr.length // 1

arr.length = 0;
arr[0] // undefined
```

O código acima define uma classe `MyArray` que estende Array; as instâncias criadas dela se comportam como arrays. O ES6 pode definir subclasses de estruturas de dados nativas (ex.: Array, String) que o ES5 não podia.

Isso também mostra que `extends` pode estender construtores nativos, não apenas classes, então você pode construir suas próprias estruturas de dados sobre as nativas. Eis um array versionado:

```javascript
class VersionedArray extends Array {
  constructor() {
    super();
    this.history = [[]];
  }
  commit() {
    this.history.push(this.slice());
  }
  revert() {
    this.splice(0, this.length, ...this.history[this.history.length - 1]);
  }
}

var x = new VersionedArray();

x.push(1);
x.push(2);
x // [1, 2]
x.history // [[]]

x.commit();
x.history // [[], [1, 2]]

x.push(3);
x // [1, 2, 3]
x.history // [[], [1, 2]]

x.revert();
x // [1, 2]
```

No código acima, `VersionedArray` usa `commit` para salvar um snapshot do estado atual em `history`. `revert` restaura o array para a última versão salva. Além disso, `VersionedArray` se comporta como um array normal; todos os métodos nativos de array funcionam nele.

Eis uma subclasse customizada de Error que personaliza o comportamento de erro:

```javascript
class ExtendableError extends Error {
  constructor(message) {
    super();
    this.message = message;
    this.stack = (new Error()).stack;
    this.name = this.constructor.name;
  }
}

class MyError extends ExtendableError {
  constructor(m) {
    super(m);
  }
}

var myerror = new MyError('ll');
myerror.message // "ll"
myerror instanceof Error // true
myerror.name // "MyError"
myerror.stack
// Error
//     at MyError.ExtendableError
//     ...
```

Nota: estender `Object` tem uma [diferença comportamental](https://stackoverflow.com/questions/36203614/super-does-not-pass-arguments-when-instantiating-a-class-extended-from-object).

```javascript
class NewObj extends Object{
  constructor(){
    super(...arguments);
  }
}
var o = new NewObj({attr: true});
o.attr === true  // false
```

No código acima, `NewObj` estende `Object`, mas os argumentos não podem ser passados ao pai via `super`. O ES6 alterou o comportamento do construtor `Object`: quando não é invocado como `new Object()`, ele ignora seus argumentos.

## Implementando o Padrão Mixin

Mixin significa combinar múltiplos objetos em um novo objeto que expõe as interfaces de cada componente. Uma implementação mínima é:

```javascript
const a = {
  a: 'a'
};
const b = {
  b: 'b'
};
const c = {...a, ...b}; // {a: 'a', b: 'b'}
```

No código acima, o objeto `c` combina `a` e `b` e expõe ambas as interfaces.

Uma implementação mais completa mistura múltiplas interfaces de classe em outra classe:

```javascript
function mix(...mixins) {
  class Mix {
    constructor() {
      for (let mixin of mixins) {
        copyProperties(this, new mixin()); // Copiar propriedades de instância
      }
    }
  }

  for (let mixin of mixins) {
    copyProperties(Mix, mixin); // Copiar propriedades estáticas
    copyProperties(Mix.prototype, mixin.prototype); // Copiar propriedades do protótipo
  }

  return Mix;
}

function copyProperties(target, source) {
  for (let key of Reflect.ownKeys(source)) {
    if ( key !== 'constructor'
      && key !== 'prototype'
      && key !== 'name'
    ) {
      let desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    }
  }
}
```

A função `mix` acima combina múltiplos objetos em uma classe. Para usá-la, herde dessa classe:

```javascript
class DistributedEdit extends mix(Loggable, Serializable) {
  // ...
}
```
