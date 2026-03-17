# Sintaxe Básica de Classes

## Origens das Classes

Em JavaScript, a forma tradicional de criar objetos de instância era através de funções construtoras. Eis um exemplo.

```javascript
function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.toString = function () {
  return '(' + this.x + ', ' + this.y + ')';
};

var p = new Point(1, 2);
```

Essa abordagem difere significativamente de linguagens orientadas a objetos tradicionais (como C++ e Java) e pode ser confusa para programadores iniciantes na linguagem.

O ES6 oferece uma sintaxe mais próxima das linguagens tradicionais ao introduzir o conceito de Class como um template para objetos. Você pode definir uma classe usando a palavra-chave `class`.

Em essência, a `class` do ES6 pode ser vista como açúcar sintático; a maior parte de sua funcionalidade poderia ser alcançada no ES5. A nova sintaxe `class` torna principalmente os padrões de protótipo de objeto mais claros e semelhantes à sintaxe orientada a objetos tradicional. O código acima reescrito com `class` do ES6 fica assim:

```javascript
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return '(' + this.x + ', ' + this.y + ')';
  }
}
```

O código acima define uma "classe". Ela possui um método `constructor()`, que é o construtor, e a palavra-chave `this` se refere ao objeto de instância. Essa nova sintaxe de Class é essencialmente equivalente ao construtor ES5 `Point` no início deste capítulo.

Além do construtor, a classe `Point` define um método `toString()`. Note que, ao definir `toString()`, você não precisa adicionar a palavra-chave `function`; a definição da função vai diretamente dentro. Além disso, os métodos não precisam ser separados por vírgulas, e adicionar vírgulas causará um erro.

No ES6, as classes podem ser vistas como outra forma de escrever construtores.

```javascript
class Point {
  // ...
}

typeof Point // "function"
Point === Point.prototype.constructor // true
```

O código acima mostra que o tipo de dados de uma classe é uma função, e a própria classe aponta para o construtor.

Ao usá-la, você usa o comando `new` diretamente na classe, exatamente como com construtores.

```javascript
class Bar {
  doStuff() {
    console.log('stuff');
  }
}

const b = new Bar();
b.doStuff() // "stuff"
```

A propriedade `prototype` dos construtores continua existindo nas "classes" do ES6. Na verdade, todos os métodos de uma classe são definidos na propriedade `prototype` da classe.

```javascript
class Point {
  constructor() {
    // ...
  }

  toString() {
    // ...
  }

  toValue() {
    // ...
  }
}

// Equivalente a

Point.prototype = {
  constructor() {},
  toString() {},
  toValue() {},
};
```

No código acima, os três métodos `constructor()`, `toString()` e `toValue()` estão todos definidos em `Point.prototype`.

Portanto, ao chamar um método em uma instância de classe, você está efetivamente chamando o método no protótipo.

```javascript
class B {}
const b = new B();

b.constructor === B.prototype.constructor // true
```

No código acima, `b` é uma instância da classe `B`; seu método `constructor()` é o método `constructor()` no protótipo da classe `B`.

Como todos os métodos de classe são definidos no objeto `prototype`, novos métodos podem ser adicionados ao objeto `prototype`. O método `Object.assign()` pode adicionar convenientemente vários métodos a uma classe de uma vez.

```javascript
class Point {
  constructor(){
    // ...
  }
}

Object.assign(Point.prototype, {
  toString(){},
  toValue(){}
});
```

A propriedade `constructor` do objeto `prototype` aponta diretamente para a própria "classe", o que é consistente com o comportamento do ES5.

```javascript
Point.prototype.constructor === Point // true
```

Além disso, todos os métodos definidos dentro de uma classe são não enumeráveis.

```javascript
class Point {
  constructor(x, y) {
    // ...
  }

  toString() {
    // ...
  }
}

Object.keys(Point.prototype)
// []
Object.getOwnPropertyNames(Point.prototype)
// ["constructor","toString"]
```

No código acima, o método `toString()` é um método definido dentro da classe `Point` e é não enumerável. Isso difere do comportamento do ES5.

```javascript
var Point = function (x, y) {
  // ...
};

Point.prototype.toString = function () {
  // ...
};

Object.keys(Point.prototype)
// ["toString"]
Object.getOwnPropertyNames(Point.prototype)
// ["constructor","toString"]
```

No código acima usando sintaxe ES5, o método `toString()` é enumerável.

## O método constructor()

O método `constructor()` é o método padrão de uma classe. Ele é chamado automaticamente ao gerar instâncias de objeto com o comando `new`. Uma classe deve ter um método `constructor()`; se nenhum for definido, um `constructor()` vazio é adicionado por padrão.

```javascript
class Point {
}

// Equivalente a
class Point {
  constructor() {}
}
```

No código acima, uma classe `Point` vazia é definida, e o motor JavaScript adicionará automaticamente um método `constructor()` vazio.

O método `constructor()` retorna o objeto de instância (ou seja, `this`) por padrão, mas você pode especificar que ele retorna outro objeto.

```javascript
class Foo {
  constructor() {
    return Object.create(null);
  }
}

new Foo() instanceof Foo
// false
```

No código acima, o `constructor()` retorna um objeto completamente novo, então a instância não é uma instância da classe `Foo`.

As classes devem ser chamadas com `new`, caso contrário um erro é lançado. Esta é uma diferença importante em relação aos construtores comuns, que podem ser invocados sem `new`.

```javascript
class Foo {
  constructor() {
    return Object.create(null);
  }
}

Foo()
// TypeError: Class constructor Foo cannot be invoked without 'new'
```

## Instâncias de Classe

A forma de criar instâncias de classe é exatamente a mesma do ES5: use o comando `new`. Como mencionado anteriormente, se você esquecer o `new` e chamar `Class()` como uma função, um erro será lançado.

```javascript
class Point {
  // ...
}

// Erro
var point = Point(2, 3);

// Correto
var point = new Point(2, 3);
```

Propriedades e métodos de classe são definidos no protótipo (ou seja, na `class`), a menos que sejam explicitamente definidos na própria instância (ou seja, no objeto `this`).

```javascript
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return '(' + this.x + ', ' + this.y + ')';
  }
}

var point = new Point(2, 3);

point.toString() // (2, 3)

point.hasOwnProperty('x') // true
point.hasOwnProperty('y') // true
point.hasOwnProperty('toString') // false
point.__proto__.hasOwnProperty('toString') // true
```

No código acima, `x` e `y` são propriedades do objeto de instância `point` (porque são definidas em `this`), então `hasOwnProperty()` retorna `true`. `toString()` é uma propriedade do objeto protótipo (porque é definida na classe `Point`), então `hasOwnProperty()` retorna `false`. Isso é consistente com o comportamento do ES5.

Como no ES5, todas as instâncias de uma classe compartilham o mesmo objeto protótipo.

```javascript
var p1 = new Point(2,3);
var p2 = new Point(3,2);

p1.__proto__ === p2.__proto__
//true
```

No código acima, `p1` e `p2` são ambas instâncias de `Point`, então seus protótipos são ambos `Point.prototype`, e suas propriedades `__proto__` são iguais.

Isso também significa que você pode adicionar métodos a uma "classe" através da propriedade `__proto__` de uma instância.

> `__proto__` não faz parte da linguagem em si; é uma propriedade privada adicionada pelas implementações. Embora muitos motores JS de navegadores modernos forneçam essa propriedade, ainda não é recomendado para uso em produção para evitar dependências de ambiente. Em produção, você pode usar `Object.getPrototypeOf()` para obter o protótipo do objeto de instância e então adicionar métodos ou propriedades ao protótipo.

```javascript
var p1 = new Point(2,3);
var p2 = new Point(3,2);

p1.__proto__.printName = function () { return 'Oops' };

p1.printName() // "Oops"
p2.printName() // "Oops"

var p3 = new Point(4,2);
p3.printName() // "Oops"
```

O código acima adiciona um método `printName()` no protótipo de `p1`. Como o protótipo de `p1` é também o protótipo de `p2`, `p2` pode chamar esse método. Além disso, novas instâncias criadas como `p3` também podem chamá-lo. Isso significa que modificar o protótipo através do `__proto__` de uma instância deve ser feito com muito cuidado; não é recomendado, pois altera a definição original da classe e afeta todas as instâncias.

## Nova Sintaxe para Propriedades de Instância

O [ES2022](https://github.com/tc39/proposal-class-fields) introduziu uma nova forma de definir propriedades de instância de classe. Agora, as propriedades de instância podem ser definidas no nível superior dentro da classe, além de serem definidas em `this` dentro do método `constructor()`.

```javascript
// Estilo original
class IncreasingCounter {
  constructor() {
    this._count = 0;
  }
  get value() {
    console.log('Getting the current value!');
    return this._count;
  }
  increment() {
    this._count++;
  }
}
```

No exemplo acima, a propriedade de instância `_count` é definida em `this` dentro do método `constructor()`.

Com a nova sintaxe, essa propriedade pode ser definida no nível superior da classe; todo o resto permanece igual.

```javascript
class IncreasingCounter {
  _count = 0;
  get value() {
    console.log('Getting the current value!');
    return this._count;
  }
  increment() {
    this._count++;
  }
}
```

No código acima, a propriedade de instância `_count` está no mesmo nível que o getter `value()` e o método `increment()`. Aqui, você não precisa adicionar `this` antes da propriedade de instância.

Note que propriedades definidas com essa nova sintaxe são propriedades próprias do objeto de instância, não propriedades no protótipo da instância.

O benefício dessa nova sintaxe é que todas as propriedades próprias de uma instância são definidas no topo da classe, facilitando ver quais propriedades de instância uma classe possui.

```javascript
class foo {
  bar = 'hello';
  baz = 'world';

  constructor() {
    // ...
  }
}
```

O código acima deixa claro à primeira vista que a classe `foo` tem duas propriedades de instância. Além disso, é mais conciso.

## Métodos Getter e Setter

Como no ES5, você pode usar as palavras-chave `get` e `set` dentro de uma "classe" para definir getters e setters para uma propriedade e interceptar seu comportamento de acesso.

```javascript
class MyClass {
  constructor() {
    // ...
  }
  get prop() {
    return 'getter';
  }
  set prop(value) {
    console.log('setter: '+value);
  }
}

let inst = new MyClass();

inst.prop = 123;
// setter: 123

inst.prop
// 'getter'
```

No código acima, a propriedade `prop` tem tanto getter quanto setter, então seu comportamento de leitura e escrita é customizado.

Getters e setters são definidos no objeto Descriptor da propriedade.

```javascript
class CustomHTMLElement {
  constructor(element) {
    this.element = element;
  }

  get html() {
    return this.element.innerHTML;
  }

  set html(value) {
    this.element.innerHTML = value;
  }
}

var descriptor = Object.getOwnPropertyDescriptor(
  CustomHTMLElement.prototype, "html"
);

"get" in descriptor  // true
"set" in descriptor  // true
```

No código acima, o getter e o setter são definidos no objeto descriptor da propriedade `html`, o que é totalmente consistente com o ES5.

## Nomes de Propriedade Computados

Os nomes de propriedades de classe podem usar expressões.

```javascript
let methodName = 'getArea';

class Square {
  constructor(length) {
    // ...
  }

  [methodName]() {
    // ...
  }
}
```

No código acima, o nome do método `getArea` da classe `Square` vem de uma expressão.

## Expressões de Classe

Como funções, as classes também podem ser definidas usando expressões.

```javascript
const MyClass = class Me {
  getClassName() {
    return Me.name;
  }
};
```

O código acima define uma classe usando uma expressão. Note que o nome da classe é `Me`, mas `Me` está disponível apenas dentro da classe e se refere à classe atual. Fora da classe, você só pode referenciá-la como `MyClass`.

```javascript
let inst = new MyClass();
inst.getClassName() // Me
Me.name // ReferenceError: Me is not defined
```

O código acima mostra que `Me` está definido apenas dentro da classe.

Se `Me` não for usado dentro da classe, pode ser omitido, então você pode escrever:

```javascript
const MyClass = class { /* ... */ };
```

Com expressões de classe, você pode escrever classes imediatamente invocadas.

```javascript
let person = new class {
  constructor(name) {
    this.name = name;
  }

  sayName() {
    console.log(this.name);
  }
}('John');

person.sayName(); // "John"
```

No código acima, `person` é uma instância de uma classe imediatamente invocada.

## Métodos Estáticos

Uma classe serve como protótipo para instâncias; todos os métodos definidos na classe são herdados pelas instâncias. Se você adicionar a palavra-chave `static` antes de um método, esse método não é herdado pelas instâncias e é chamado diretamente na classe. Esses métodos são chamados de "métodos estáticos".

```javascript
class Foo {
  static classMethod() {
    return 'hello';
  }
}

Foo.classMethod() // 'hello'

var foo = new Foo();
foo.classMethod()
// TypeError: foo.classMethod is not a function
```

No código acima, o método `classMethod` da classe `Foo` tem a palavra-chave `static`, indicando que é um método estático. Ele pode ser chamado diretamente na classe `Foo` (`Foo.classMethod()`), não em instâncias de `Foo`. Chamar um método estático em uma instância lança um erro porque o método não existe lá.

Note que, se um método estático contém `this`, ele se refere à classe, não à instância.

```javascript
class Foo {
  static bar() {
    this.baz();
  }
  static baz() {
    console.log('hello');
  }
  baz() {
    console.log('world');
  }
}

Foo.bar() // hello
```

No código acima, o método estático `bar` chama `this.baz`; aqui `this` se refere à classe `Foo`, não a uma instância de `Foo`, então é equivalente a chamar `Foo.baz`. Este exemplo também mostra que métodos estáticos podem compartilhar nomes com métodos de instância.

Métodos estáticos de uma classe pai podem ser herdados por classes filhas.

```javascript
class Foo {
  static classMethod() {
    return 'hello';
  }
}

class Bar extends Foo {
}

Bar.classMethod() // 'hello'
```

No código acima, a classe pai `Foo` tem um método estático, e a classe filha `Bar` pode chamá-lo.

Métodos estáticos também podem ser chamados a partir do objeto `super`.

```javascript
class Foo {
  static classMethod() {
    return 'hello';
  }
}

class Bar extends Foo {
  static classMethod() {
    return super.classMethod() + ', too';
  }
}

Bar.classMethod() // "hello, too"
```

## Propriedades Estáticas

Propriedades estáticas referem-se a propriedades na própria Classe, ou seja, `Class.propName`, não propriedades definidas em objetos de instância (`this`).

```javascript
class Foo {
}

Foo.prop = 1;
Foo.prop // 1
```

O código acima define uma propriedade estática `prop` para a classe `Foo`.

Atualmente, esta é a única forma suportada, pois o ES6 especifica claramente que uma Class tem apenas métodos estáticos, não propriedades estáticas. Uma [proposta](https://github.com/tc39/proposal-class-fields) adiciona propriedades estáticas para classes, usando a palavra-chave `static` antes da propriedade.

```javascript
class MyClass {
  static myStaticProp = 42;

  constructor() {
    console.log(MyClass.myStaticProp); // 42
  }
}
```

Essa nova sintaxe torna propriedades estáticas muito mais fáceis de expressar.

```javascript
// Estilo antigo
class Foo {
  // ...
}
Foo.prop = 1;

// Estilo novo
class Foo {
  static prop = 1;
}
```

No código acima, a sintaxe antiga define a propriedade estática fora da classe, após a criação da classe. Isso torna a propriedade estática fácil de ignorar e não segue o princípio de manter o código relacionado junto. A nova sintaxe é declarativa e tem semântica mais clara.

## Métodos e Propriedades Privados

### Soluções Antigas

Métodos e propriedades privados são métodos e propriedades que só podem ser acessados dentro da classe. Eles são uma necessidade comum para encapsulamento, mas o ES6 antigo não os fornecia, então tinham que ser simulados com alternativas.

Uma abordagem era usar convenções de nomenclatura.

```javascript
class Widget {

  // Método público
  foo (baz) {
    this._bar(baz);
  }

  // Método privado
  _bar(baz) {
    return this.snaf = baz;
  }

  // ...
}
```

No código acima, o underscore à frente de `_bar()` indica que é um método privado para uso interno. Porém, essa convenção não é confiável, pois o método ainda pode ser chamado de fora da classe.

Outra abordagem era mover o método privado para fora da classe, já que todos os métodos dentro de uma classe são visíveis externamente.

```javascript
class Widget {
  foo (baz) {
    bar.call(this, baz);
  }

  // ...
}

function bar(baz) {
  return this.snaf = baz;
}
```

No código acima, `foo` é um método público que chama `bar.call(this, baz)` internamente. Isso efetivamente torna `bar()` um método privado da classe atual.

Outra abordagem era usar a unicidade de valores `Symbol` nomeando o método privado com um valor `Symbol`.

```javascript
const bar = Symbol('bar');
const snaf = Symbol('snaf');

export default class myClass{

  // Método público
  foo(baz) {
    this[bar](baz);
  }

  // Método privado
  [bar](baz) {
    return this[snaf] = baz;
  }

  // ...
};
```

No código acima, `bar` e `snaf` são valores `Symbol`, que geralmente são inacessíveis de fora, alcançando o efeito de métodos e propriedades privados. Porém, não é absoluto: `Reflect.ownKeys()` ainda pode obtê-los.

```javascript
const inst = new myClass();

Reflect.ownKeys(myClass.prototype)
// [ 'constructor', 'foo', Symbol(bar) ]
```

No código acima, os nomes de propriedade usando valores Symbol ainda podem ser obtidos de fora da classe.

### Sintaxe Formal de Propriedades Privadas

O [ES2022](https://github.com/tc39/proposal-class-fields) adicionou formalmente propriedades privadas à `class` prefixando o nome da propriedade com `#`.

```javascript
class IncreasingCounter {
  #count = 0;
  get value() {
    console.log('Getting the current value!');
    return this.#count;
  }
  increment() {
    this.#count++;
  }
}
```

No código acima, `#count` é uma propriedade privada e só pode ser usada dentro da classe (`this.#count`). Usá-la fora da classe causará um erro.

```javascript
const counter = new IncreasingCounter();
counter.#count // Erro
counter.#count = 42 // Erro
```

No exemplo acima, ler ou escrever a propriedade privada `#count` fora da classe ambos causam erros.

Nota: [A partir do Chrome 111](https://developer.chrome.com/blog/new-in-devtools-111/#misc), as ferramentas de desenvolvedor podem ler e escrever propriedades privadas sem erros; a equipe do Chrome considera isso útil para depuração.

Além disso, tanto dentro quanto fora da classe, ler uma propriedade privada inexistente causa um erro. Isso é completamente diferente das propriedades públicas: ler uma propriedade pública inexistente não lança erro, apenas retorna `undefined`.

```javascript
class IncreasingCounter {
  #count = 0;
  get value() {
    console.log('Getting the current value!');
    return this.#myCount; // Erro
  }
  increment() {
    this.#count++;
  }
}

const counter = new IncreasingCounter();
counter.#myCount // Erro
```

No exemplo acima, `#myCount` é uma propriedade privada inexistente; lê-la dentro ou fora da função causa erro.

Note que o nome da propriedade privada deve incluir `#`; sem ele, é tratado como uma propriedade diferente.

```javascript
class Point {
  #x;

  constructor(x = 0) {
    this.#x = +x;
  }

  get x() {
    return this.#x;
  }

  set x(value) {
    this.#x = +value;
  }
}
```

No código acima, `#x` é a propriedade privada e não pode ser lida de fora da classe `Point`. Como `#` faz parte do nome da propriedade, deve ser usado junto com `#`, então `#x` e `x` são duas propriedades diferentes.

Essa sintaxe também pode ser usada para métodos privados.

```javascript
class Foo {
  #a;
  #b;
  constructor(a, b) {
    this.#a = a;
    this.#b = b;
  }
  #sum() {
    return this.#a + this.#b;
  }
  printSum() {
    console.log(this.#sum());
  }
}
```

No exemplo acima, `#sum()` é um método privado.

Propriedades privadas também podem ter métodos getter e setter.

```javascript
class Counter {
  #xValue = 0;

  constructor() {
    console.log(this.#x);
  }

  get #x() { return this.#xValue; }
  set #x(value) {
    this.#xValue = value;
  }
}
```

No código acima, `#x` é uma propriedade privada; seu getter e setter (`get #x()` e `set #x()`) operam em outra propriedade privada `#xValue`.

Propriedades privadas não se limitam a referências a partir de `this`; dentro da classe, instâncias também podem referenciar propriedades privadas.

```javascript
class Foo {
  #privateValue = 42;
  static getPrivateValue(foo) {
    return foo.#privateValue;
  }
}

Foo.getPrivateValue(new Foo()); // 42
```

O código acima permite referenciar a propriedade privada a partir da instância `foo`.

A palavra-chave `static` também pode ser adicionada antes de propriedades privadas e métodos privados para indicar uma propriedade ou método privado estático.

```javascript
class FakeMath {
  static PI = 22 / 7;
  static #totallyRandomNumber = 4;

  static #computeRandomNumber() {
    return FakeMath.#totallyRandomNumber;
  }

  static random() {
    console.log('I heard you like random numbers…')
    return FakeMath.#computeRandomNumber();
  }
}

FakeMath.PI // 3.142857142857143
FakeMath.random()
// I heard you like random numbers…
// 4
FakeMath.#totallyRandomNumber // Erro
FakeMath.#computeRandomNumber() // Erro
```

No código acima, `#totallyRandomNumber` é uma propriedade privada e `#computeRandomNumber()` é um método privado; eles só podem ser chamados dentro da classe `FakeMath`. Chamá-los de fora causa erro.

### O Operador in

Como mencionado anteriormente, acessar diretamente uma propriedade privada inexistente de uma classe lança um erro, mas acessar uma propriedade pública inexistente não lança. Esse comportamento pode ser usado para verificar se um objeto é uma instância de uma classe.

```javascript
class C {
  #brand;

  static isC(obj) {
    try {
      obj.#brand;
      return true;
    } catch {
      return false;
    }
  }
}
```

No exemplo acima, o método estático `isC()` da classe `C` verifica se um objeto é uma instância de `C` acessando sua propriedade privada `#brand`. Se não lançar, retorna `true`; se lançar, o objeto não é uma instância da classe atual, então o bloco `catch` retorna `false`.

Assim, `try...catch` pode ser usado para verificar se uma propriedade privada existe. Porém, essa abordagem é trabalhosa e reduz a legibilidade. O [ES2022](https://github.com/tc39/proposal-private-fields-in-in) estendeu o operador `in` para que ele também possa testar propriedades privadas.

```javascript
class C {
  #brand;

  static isC(obj) {
    if (#brand in obj) {
      // Propriedade privada #brand existe
      return true;
    } else {
      // Propriedade privada #brand não existe
      return false;
    }
  }
}
```

No exemplo acima, o operador `in` verifica se um objeto tem a propriedade privada `#brand`. Ele não lança erro; retorna um booleano.

Esse uso de `in` também pode ser combinado com `this`.

```javascript
class A {
  #foo = 0;
  m() {
    console.log(#foo in this); // true
  }
}
```

Note que, ao verificar propriedades privadas, `in` só pode ser usado dentro da classe. Além disso, a propriedade privada sendo verificada deve ser declarada primeiro; caso contrário, um erro é lançado.

```javascript
class A {
  m() {
    console.log(#foo in this); // Erro
  }
}
```

No exemplo acima, a propriedade privada `#foo` não é declarada antes de ser usada na verificação `in`, o que causa erro.

## Blocos Estáticos

Um problema com propriedades estáticas é que, se elas têm lógica de inicialização, essa lógica deve ser escrita fora da classe ou dentro do método `constructor()`.

```javascript
class C {
  static x = 234;
  static y;
  static z;
}

try {
  const obj = doSomethingWith(C.x);
  C.y = obj.y
  C.z = obj.z;
} catch {
  C.y = ...;
  C.z = ...;
}
```

No exemplo acima, os valores das propriedades estáticas `y` e `z` dependem de computações envolvendo a propriedade estática `x`; essa lógica de inicialização está escrita fora da classe (o bloco `try...catch`). A alternativa é colocá-la no método `constructor()`. Nenhuma abordagem é ideal: a primeira empurra a lógica interna da classe para fora, e a segunda é executada em cada nova instância.

Para resolver isso, o ES2022 introduziu [blocos estáticos](https://github.com/tc39/proposal-class-static-block), que permitem um bloco de código dentro da classe que roda uma vez quando a classe é criada, principalmente para inicializar propriedades estáticas. Quando novas instâncias são criadas depois, esse bloco não roda.

```javascript
class C {
  static x = ...;
  static y;
  static z;

  static {
    try {
      const obj = doSomethingWith(this.x);
      this.y = obj.y;
      this.z = obj.z;
    }
    catch {
      this.y = ...;
      this.z = ...;
    }
  }
}
```

No código acima, há um bloco estático dentro da classe. Sua vantagem é que a lógica de inicialização das propriedades estáticas `y` e `z` é mantida dentro da classe e roda apenas uma vez.

Cada classe pode ter múltiplos blocos estáticos. Cada bloco só pode acessar propriedades estáticas previamente declaradas. Além disso, blocos estáticos não podem conter instruções `return`.

Dentro de um bloco estático, o nome da classe ou `this` pode ser usado para referenciar a classe atual.

```javascript
class C {
  static x = 1;
  static {
    this.x; // 1
    // Ou
    C.x; // 1
  }
}
```

No exemplo acima, tanto `this.x` quanto `C.x` acessam a propriedade estática `x`.

Além de inicializar propriedades estáticas, blocos estáticos também podem ser usados para compartilhar propriedades privadas com código fora da classe.

```javascript
let getX;

export class C {
  #x = 1;
  static {
    getX = obj => obj.#x;
  }
}

console.log(getX(new C())); // 1
```

No exemplo acima, `#x` é uma propriedade privada da classe. Se a função externa `getX()` precisa acessá-la, antes ela tinha que ser definida no método `constructor()` da classe, então cada nova instância redefiniria `getX()`. Agora pode ser colocada em um bloco estático, então é definida apenas uma vez quando a classe é criada.

## Considerações sobre Classes

### Modo Estrito

Dentro de classes e módulos, o modo estrito é habilitado por padrão, então você não precisa adicionar `"use strict"` no topo. Qualquer código dentro de uma classe ou módulo roda em modo estrito. Como o código futuro efetivamente rodará dentro de módulos, o ES6 efetivamente atualizou toda a linguagem para o modo estrito.

### Sem Hoisting

As classes não sofrem hoisting, o que é diferente do ES5.

```javascript
new Foo(); // ReferenceError
class Foo {}
```

No código acima, `Foo` é usado antes de ser definido, o que causa um erro, porque o ES6 não faz hoisting das declarações de classe para o topo do código. Essa regra existe em parte devido à herança: a classe filha deve ser definida após a classe pai.

```javascript
{
  let Foo = class {};
  class Bar extends Foo {
  }
}
```

O código acima não lança erro, porque quando `Bar` estende `Foo`, `Foo` já está definido. Se as classes sofressem hoisting, falharia, já que a classe seria içada mas a linha que define `Foo` não seria, então `Foo` não estaria definido quando `Bar` herda dele.

### A Propriedade name

Como as classes do ES6 são essencialmente um wrapper em torno dos construtores do ES5, muitas características de função são herdadas pelas classes, incluindo a propriedade `name`.

```javascript
class Point {}
Point.name // "Point"
```

A propriedade `name` sempre retorna o nome da classe que segue a palavra-chave `class`.

### Métodos Geradores

Se você adicionar um asterisco (`*`) antes de um método, ele se torna uma função Generator.

```javascript
class Foo {
  constructor(...args) {
    this.args = args;
  }
  * [Symbol.iterator]() {
    for (let arg of this.args) {
      yield arg;
    }
  }
}

for (let x of new Foo('hello', 'world')) {
  console.log(x);
}
// hello
// world
```

No código acima, o método `Symbol.iterator` da classe `Foo` tem um asterisco, tornando-o uma função Generator. O método `Symbol.iterator` retorna o iterador padrão para instâncias de `Foo`, e o loop `for...of` usa automaticamente esse iterador.

### Ligação de this

Se um método de classe contém `this`, ele normalmente se refere à instância da classe. Porém, é preciso ter cuidado: se o método for usado sozinho, pode facilmente lançar um erro.

```javascript
class Logger {
  printName(name = 'there') {
    this.print(`Hello ${name}`);
  }

  print(text) {
    console.log(text);
  }
}

const logger = new Logger();
const { printName } = logger;
printName(); // TypeError: Cannot read property 'print' of undefined
```

No código acima, `this` em `printName` normalmente se refere à instância `Logger`. Mas quando o método é extraído e chamado sozinho, `this` se refere ao ambiente de execução (em modo estrito dentro de uma classe, `this` é `undefined`), então `print` não pode ser encontrado e um erro é lançado.

Uma correção simples é fazer bind de `this` no construtor para que `print` seja sempre encontrado.

```javascript
class Logger {
  constructor() {
    this.printName = this.printName.bind(this);
  }

  // ...
}
```

Outra abordagem é usar funções de seta.

```javascript
class Obj {
  constructor() {
    this.getThis = () => this;
  }
}

const myObj = new Obj();
myObj.getThis() === myObj // true
```

Dentro de uma função de seta, `this` sempre se refere ao objeto onde a função foi definida. No código acima, a função de seta está no construtor; ela é definida quando o construtor roda, então seu ambiente é o objeto de instância e `this` sempre se referirá a essa instância.

Outra abordagem é usar um `Proxy` para fazer bind automático de `this` quando métodos são acessados.

```javascript
function selfish (target) {
  const cache = new WeakMap();
  const handler = {
    get (target, key) {
      const value = Reflect.get(target, key);
      if (typeof value !== 'function') {
        return value;
      }
      if (!cache.has(value)) {
        cache.set(value, value.bind(target));
      }
      return cache.get(value);
    }
  };
  const proxy = new Proxy(target, handler);
  return proxy;
}

const logger = selfish(new Logger());
```

## A Propriedade new.target

`new` é o comando que cria objetos de instância a partir de construtores. O ES6 introduziu uma propriedade `new.target` para o comando `new`. Ela é tipicamente usada dentro de construtores e retorna o construtor no qual `new` foi chamado. Se o construtor não foi invocado com `new` ou `Reflect.construct()`, `new.target` é `undefined`, então essa propriedade pode ser usada para determinar como o construtor foi chamado.

```javascript
function Person(name) {
  if (new.target !== undefined) {
    this.name = name;
  } else {
    throw new Error('deve usar new para criar instância');
  }
}

// Alternativa
function Person(name) {
  if (new.target === Person) {
    this.name = name;
  } else {
    throw new Error('deve usar new para criar instância');
  }
}

var person = new Person('John'); // Correto
var notAPerson = Person.call(person, 'John');  // Erro
```

O código acima garante que o construtor só pode ser chamado com `new`.

Dentro de uma Class, `new.target` retorna a Class atual.

```javascript
class Rectangle {
  constructor(length, width) {
    console.log(new.target === Rectangle);
    this.length = length;
    this.width = width;
  }
}

var obj = new Rectangle(3, 4); // saída: true
```

Note que, quando uma classe filha herda de uma classe pai, `new.target` retorna a classe filha.

```javascript
class Rectangle {
  constructor(length, width) {
    console.log(new.target === Rectangle);
    // ...
  }
}

class Square extends Rectangle {
  constructor(length, width) {
    super(length, width);
  }
}

var obj = new Square(3); // saída: false
```

No código acima, `new.target` retorna a classe filha.

Isso pode ser usado para escrever classes que não podem ser instanciadas diretamente e precisam ser herdadas antes de serem usadas.

```javascript
class Shape {
  constructor() {
    if (new.target === Shape) {
      throw new Error('esta classe não pode ser instanciada');
    }
  }
}

class Rectangle extends Shape {
  constructor(length, width) {
    super();
    // ...
  }
}

var x = new Shape();  // Erro
var y = new Rectangle(3, 4);  // Correto
```

No código acima, a classe `Shape` não pode ser instanciada diretamente; ela só pode ser usada como base para herança.

Nota: usar `new.target` fora de uma função lança um erro.
