# Sintaxe de Módulos

## Visão geral

Historicamente, JavaScript não tinha um sistema de módulos. Não havia como dividir um programa grande em arquivos menores e interdependentes e, em seguida, montá-los de forma simples. Outras linguagens ofereciam isso (por exemplo, `require` do Ruby, `import` do Python e até mesmo o `@import` do CSS), mas JavaScript não tinha suporte, o que dificultava a construção de projetos grandes e complexos.

Antes do ES6, a comunidade desenvolveu vários esquemas de carregamento de módulos. Os principais foram CommonJS e AMD — o primeiro para o servidor, o último para o navegador. O ES6 trouxe módulos para o padrão da linguagem. O design é simples e pode substituir em grande parte CommonJS e AMD como solução de módulos comum tanto para navegador quanto para servidor.

Os módulos ES6 foram projetados para serem o mais estáticos possível: dependências e variáveis importadas/exportadas são determinadas em tempo de compilação. Os módulos CommonJS e AMD só conseguem resolver isso em tempo de execução. Por exemplo, um módulo CommonJS é um objeto; importações precisam ler propriedades do objeto.

```javascript
// Módulo CommonJS
let { stat, exists, readfile } = require('fs');

// Equivalente a
let _fs = require('fs');
let stat = _fs.stat;
let exists = _fs.exists;
let readfile = _fs.readfile;
```

O código acima carrega o módulo `fs` inteiro (todos os seus métodos), cria um objeto (`_fs`) e, em seguida, lê três métodos dele. Isso é "carregamento em tempo de execução": o objeto só está disponível em tempo de execução, portanto a otimização estática não é possível.

Os módulos ES6 não são objetos. A saída é especificada explicitamente com `export` e a entrada com `import`.

```javascript
// Módulo ES6
import { stat, exists, readFile } from 'fs';
```

O código acima carrega três métodos do módulo `fs`; outros métodos não são carregados. Isso é "carregamento em tempo de compilação" ou carregamento estático: o módulo pode ser totalmente resolvido em tempo de compilação, portanto é mais eficiente que o CommonJS. Também significa que os módulos ES6 não podem ser referenciados como objetos, já que não são objetos.

Como os módulos ES6 são carregados em tempo de compilação, a análise estática é possível. Isso permite recursos como macros e verificação de tipos que dependem de análise estática.

Além dos benefícios do carregamento estático, os módulos ES6 oferecem:

- Não é necessário o formato de módulo UMD; servidores e navegadores suportarão módulos ES6. Ferramentas já suportam isso.
- APIs do navegador podem ser fornecidas como módulos em vez de globais ou propriedades de `navigator`.
- Objetos de namespace (por exemplo, `Math`) podem eventualmente ser fornecidos como módulos.

Este capítulo aborda a sintaxe de módulos ES6. O próximo capítulo aborda como carregar módulos ES6 no navegador e no Node.

## Modo estrito

Os módulos ES6 rodam automaticamente em modo estrito, com ou sem `"use strict"` especificado no topo.

O modo estrito impõe, entre outras, estas restrições:

- Variáveis devem ser declaradas antes do uso
- Parâmetros de função não podem ter nomes duplicados
- `with` não é permitido
- Atribuição a propriedades somente leitura lança erro
- Literais octais com 0 à esquerda não são permitidos
- Exclusão de propriedades não configuráveis lança erro
- `delete prop` em variáveis lança erro; apenas `delete global[prop]` é permitido
- `eval` não introduz variáveis no escopo externo
- `eval` e `arguments` não podem ser reatribuídos
- `arguments` não reflete alterações em parâmetros de função
- `arguments.callee` não é permitido
- `arguments.caller` não é permitido
- `this` não é o objeto global
- `fn.caller` e `fn.arguments` não podem ser usados
- Palavras reservadas adicionais (por exemplo, `protected`, `static`, `interface`)

Os módulos devem seguir essas regras. O modo estrito faz parte do ES5; para detalhes completos, consulte a documentação do ES5.

Em particular, observe que nos módulos ES6, `this` no nível superior é `undefined`, portanto o código no nível superior não deve depender de `this`.

## O comando export

A funcionalidade de módulos é fornecida principalmente por dois comandos: `export` e `import`. `export` define a interface pública do módulo; `import` carrega exportações de outros módulos.

Um módulo é um arquivo separado. Variáveis dentro dele não são visíveis externamente. Para expor uma variável, use a palavra-chave `export`. Exemplo:

```javascript
// profile.js
export var firstName = 'Michael';
export var lastName = 'Jackson';
export var year = 1958;
```

O código acima está em `profile.js`, que armazena informações do usuário. O ES6 trata isso como um módulo e exporta três variáveis com `export`.

Além da forma acima, há outra:

```javascript
// profile.js
var firstName = 'Michael';
var lastName = 'Jackson';
var year = 1958;

export { firstName, lastName, year };
```

Aqui, o comando `export` usa chaves para listar as variáveis a exportar. É equivalente à forma anterior, mas esse estilo costuma ser preferido porque mostra todas as exportações em um só lugar no final do arquivo.

`export` pode exportar funções ou classes além de variáveis:

```javascript
export function multiply(x, y) {
  return x * y;
};
```

O código acima exporta uma função `multiply`.

Por padrão, `export` usa os nomes originais. Você pode renomear com `as`:

```javascript
function v1() { ... }
function v2() { ... }

export {
  v1 as streamV1,
  v2 as streamV2,
  v2 as streamLatestVersion
};
```

O código acima renomeia as funções exportadas. `v2` pode ser exportada com dois nomes diferentes.

Importante: `export` define a interface pública. Deve criar um mapeamento um-para-um com variáveis dentro do módulo.

```javascript
// Erro
export 1;

// Erro
var m = 1;
export m;
```

Ambas as formas acima estão incorretas porque não fornecem uma interface adequada. A primeira exporta o literal `1`; a segunda exporta o valor de `m`, ainda apenas `1`. Um valor sozinho não é uma interface. Formas corretas:

```javascript
// Estilo 1
export var m = 1;

// Estilo 2
var m = 1;
export {m};

// Estilo 3
var n = 1;
export {n as m};
```

Estas definem uma interface adequada `m`. Outros scripts podem importá-la para obter o valor `1`. O mapeamento entre o nome da interface e a variável interna deve ser explícito.

O mesmo se aplica a exportações de `function` e `class`:

```javascript
// Erro
function f() {}
export f;

// Correto
export function f() {};

// Correto
function f() {}
export {f};
```

Atualmente, `export` pode exportar três tipos de interface: funções, classes e variáveis (declaradas com `var`, `let` ou `const`).

Além disso, `export` cria um vínculo dinâmico: a interface importada reflete o valor atual dentro do módulo.

```javascript
export var foo = 'bar';
setTimeout(() => foo = 'baz', 500);
```

O código acima exporta `foo`; seu valor é `bar` no início e depois `baz` após 500ms.

Isso difere do CommonJS, que usa valores em cache e não suporta atualizações dinâmicas. Consulte a seção "Implementação do carregamento de módulos" abaixo.

Por fim, `export` pode aparecer em qualquer lugar no nível superior do módulo. Dentro de um bloco (por exemplo, `if`), lança erro, assim como `import`, porque exportações no nível de bloco impedem otimização estática.

```javascript
function foo() {
  export default 'bar' // SyntaxError
}
foo()
```

No código acima, `export` dentro de uma função causa erro.

## O comando import

Depois que um módulo define sua interface com `export`, outros arquivos JS podem carregá-lo com `import`:

```javascript
// main.js
import { firstName, lastName, year } from './profile.js';

function setName(element) {
  element.textContent = firstName + ' ' + lastName;
}
```

O comando `import` carrega `profile.js` e importa as variáveis. As chaves listam os nomes a importar; eles devem corresponder aos nomes exportados de `profile.js`.

Para renomear variáveis importadas, use `as`:

```javascript
import { lastName as surname } from './profile.js';
```

Variáveis importadas são somente leitura; são vínculos com a interface do módulo. O script que importa não deve reatribuí-las.

```javascript
import {a} from './xxx.js'

a = {}; // Syntax Error : 'a' is read-only;
```

No código acima, reatribuir `a` lança erro, porque `a` é um vínculo somente leitura. No entanto, se `a` for um objeto, modificar suas propriedades é permitido:

```javascript
import {a} from './xxx.js'

a.foo = 'hello'; // Operação válida
```

As propriedades de `a` podem ser modificadas, e outros módulos verão as alterações. Mas isso torna bugs mais difíceis de rastrear, então variáveis importadas devem ser tratadas como somente leitura e suas propriedades não devem ser alteradas casualmente.

O caminho após `from` pode ser relativo ou absoluto. Se for apenas um nome de módulo (sem caminho), o engine precisa estar configurado para resolvê-lo:

```javascript
import { myMethod } from 'util';
```

Aqui `util` é um nome de módulo; sem caminho, é necessária configuração para localizá-lo.

Nota: `import` é içado e roda no topo do módulo, antes de outro código.

```javascript
foo();

import { foo } from 'my_module';
```

O código acima não lança erro, porque `import` roda antes da chamada a `foo`. Imports são executados em tempo de compilação, antes de o código rodar.

Como `import` é estático, não pode usar expressões, variáveis ou outras construções de tempo de execução:

```javascript
// Erro
import { 'f' + 'oo' } from 'my_module';

// Erro
let module = 'my_module';
import { foo } from module;

// Erro
if (x === 1) {
  import { foo } from 'module1';
} else {
  import { foo } from 'module2';
}
```

Essas formas lançam erro porque usam expressões, variáveis ou condicionais que não estão disponíveis em tempo de análise estática.

Por fim, `import` executa o módulo carregado. Então você pode escrever:

```javascript
import 'lodash';
```

Isso apenas carrega e executa `lodash`; não importa nenhum vínculo.

Se o mesmo `import` for executado múltiplas vezes, o módulo roda apenas uma vez:

```javascript
import 'lodash';
import 'lodash';
```

O código acima carrega `lodash` duas vezes, mas executa apenas uma.

```javascript
import { foo } from 'my_module';
import { bar } from 'my_module';

// Equivalente a
import { foo, bar } from 'my_module';
```

Aqui `foo` e `bar` são importados do mesmo módulo em duas instruções; equivale a um único import combinado. Imports seguem um padrão singleton.

Hoje, o Babel pode misturar `require` do CommonJS e `import` do ES6 em um módulo, mas é melhor não fazer isso. `import` roda na fase estática, então é executado primeiro. O seguinte pode não se comportar como esperado:

```javascript
require('core-js/modules/es6.symbol');
require('core-js/modules/es6.promise');
import React from 'React';
```

## Importação do módulo inteiro

Em vez de importar exportações específicas, você pode carregar todas as exportações em um único objeto usando asterisco (`*`):

Arquivo `circle.js`:

```javascript
// circle.js

export function area(radius) {
  return Math.PI * radius * radius;
}

export function circumference(radius) {
  return 2 * Math.PI * radius;
}
```

Carregando o módulo:

```javascript
// main.js

import { area, circumference } from './circle';

console.log('Área do círculo: ' + area(4));
console.log('Circunferência: ' + circumference(14));
```

A forma acima importa métodos específicos. Importação do módulo inteiro:

```javascript
import * as circle from './circle';

console.log('Área do círculo: ' + circle.area(4));
console.log('Circunferência: ' + circle.circumference(14));
```

Nota: o objeto que mantém a importação do módulo inteiro (por exemplo, `circle`) deve ser estaticamente analisável, portanto não pode ser mutado em tempo de execução. O seguinte não é permitido:

```javascript
import * as circle from './circle';

// Ambas as linhas abaixo não são permitidas
circle.foo = 'hello';
circle.area = function () {};
```

## O comando export default

Como visto acima, com `import` o usuário precisa conhecer os nomes exatos das variáveis ou funções. Para incorporação mais rápida, `export default` permite que o módulo especifique uma exportação padrão:

```javascript
// export-default.js
export default function () {
  console.log('foo');
}
```

O arquivo acima exporta uma função padrão.

Outros módulos podem importá-la com qualquer nome:

```javascript
// import-default.js
import customName from './export-default';
customName(); // 'foo'
```

O comando `import` pode usar qualquer nome para a exportação padrão; o nome original da função não é necessário. Ao importar um default, não use chaves.

`export default` também pode ser usado com funções nomeadas:

```javascript
// export-default.js
export default function foo() {
  console.log('foo');
}

// Ou escrever como

function foo() {
  console.log('foo');
}

export default foo;
```

O nome da função `foo` não é visível fora do módulo; o import a trata como anônima.

Comparação entre default e exportações nomeadas:

```javascript
// Grupo 1
export default function crc32() { // saída
  // ...
}

import crc32 from 'crc32'; // entrada

// Grupo 2
export function crc32() { // saída
  // ...
};

import {crc32} from 'crc32'; // entrada
```

Com `export default`, o `import` correspondente não usa chaves; sem `export default`, usa.

`export default` define a exportação padrão do módulo. Um módulo pode ter apenas um default, então `export default` pode aparecer apenas uma vez. Por isso o import não precisa de chaves: há no máximo um default.

Em essência, `export default` exporta um vínculo chamado `default`, e o sistema permite que você o nomeie arbitrariamente. Então essas formas são válidas:

```javascript
// modules.js
function add(x, y) {
  return x * y;
}
export {add as default};
// Equivalente a
// export default add;

// app.js
import { default as foo } from 'modules';
// Equivalente a
// import foo from 'modules';
```

Como `export default` realmente exporta um vínculo `default`, não pode ser seguido de uma declaração de variável:

```javascript
// Correto
export var a = 1;

// Correto
var a = 1;
export default a;

// Incorreto
export default var a = 1;
```

Em `export default a`, o valor de `a` é atribuído ao vínculo `default`. A última forma é inválida.

Como `export default` atribui o valor seguinte a `default`, você pode exportar um literal diretamente:

```javascript
// Correto
export default 42;

// Erro
export 42;
```

A primeira linha exporta `default` com valor 42. A segunda lança erro porque não define uma interface adequada.

Com `export default`, a importação é direta. Para lodash:

```javascript
import _ from 'lodash';
```

Para importar tanto o default quanto exportações nomeadas em uma única instrução:

```javascript
import _, { each, forEach } from 'lodash';
```

O `export` correspondente poderia ser:

```javascript
export default function (obj) {
  // ···
}

export function each(obj, iterator, context) {
  // ···
}

export { each as forEach };
```

A última linha expõe `forEach` como alias para `each`.

`export default` pode exportar uma classe:

```javascript
// MyClass.js
export default class { ... }

// main.js
import MyClass from 'MyClass';
let o = new MyClass();
```

## Combinação de export e import

Se um módulo importa e depois reexporta do mesmo módulo, `import` e `export` podem ser combinados:

```javascript
export { foo, bar } from 'my_module';

// Pode ser entendido como
import { foo, bar } from 'my_module';
export { foo, bar };
```

Aqui `export` e `import` são mesclados. Note que `foo` e `bar` não são importados no módulo atual; são apenas reexportados, portanto o módulo atual não pode usá-los diretamente.

Renomeação e reexportação do módulo inteiro funcionam da mesma forma:

```javascript
// Renomear interface
export { foo as myFoo } from 'my_module';

// Exportar tudo
export * from 'my_module';
```

Reexportação default:

```javascript
export { default } from 'foo';
```

Nomeado para default:

```javascript
export { es6 as default } from './someModule';

// Equivalente a
import { es6 } from './someModule';
export default es6;
```

Default para nomeado:

```javascript
export { default as es6 } from './someModule';
```

Antes do ES2020, não havia forma combinada para:

```javascript
import * as someIdentifier from "someModule";
```

O [ES2020](https://github.com/tc39/proposal-export-ns-from) adicionou:

```javascript
export * as ns from "mod";

// Equivalente a
import * as ns from "mod";
export {ns};
```

## Atributos de import

O ES2025 introduziu "[import attributes](https://github.com/tc39/proposal-import-attributes)", que permitem especificar atributos para `import`, principalmente para código não modular como JSON, WebAssembly ou CSS.

Atualmente, apenas import de JSON é suportado:

```javascript
// Importação estática
import configData from './config-data.json' with { type: 'json' };

// Importação dinâmica
const configData = await import(
  './config-data.json', { with: { type: 'json' } }
);
```

O comando `import` usa uma cláusula `with` para passar um objeto de atributos. No momento, o único atributo suportado é `type`, que deve ser `json`.

Sem atributos de import, JSON só pode ser carregado via `fetch`:

```javascript
const response = await fetch('./config.json');
const json = await response.json();
```

Reexportações também podem usar atributos de import:

```javascript
export { default as config } from './config-data.json' with { type: 'json' };
```

## Herança de módulos

Módulos podem estender outros módulos.

Exemplo: `circleplus` estende `circle`:

```javascript
// circleplus.js

export * from 'circle';
export var e = 2.71828182846;
export default function(x) {
  return Math.exp(x);
}
```

`export *` reexporta tudo de `circle`; não inclui a exportação default. O arquivo também exporta sua própria variável `e` e uma função default.

Você pode renomear ao reexportar:

```javascript
// circleplus.js

export { area as circleArea } from 'circle';
```

Isso reexporta apenas `area` de `circle` como `circleArea`.

Carregando o módulo:

```javascript
// main.js

import * as math from 'circleplus';
import exp from 'circleplus';
console.log(exp(math.e));
```

`import exp` carrega a exportação default de `circleplus` como `exp`.

## Constantes entre módulos

Como discutido na seção `const`, `const` tem escopo de bloco. Para compartilhar uma constante entre módulos, use este padrão:

```javascript
// módulo constants.js
export const A = 1;
export const B = 3;
export const C = 4;

// módulo test1.js
import * as constants from './constants';
console.log(constants.A); // 1
console.log(constants.B); // 3

// módulo test2.js
import {A, B} from './constants';
console.log(A); // 1
console.log(B); // 3
```

Para muitas constantes, use um diretório `constants` e divida-as em arquivos:

```javascript
// constants/db.js
export const db = {
  url: 'http://my.couchdbserver.local:5984',
  admin_username: 'admin',
  admin_password: 'admin password'
};

// constants/user.js
export const users = ['root', 'admin', 'staff', 'ceo', 'chief', 'moderator'];
```

Depois agregue em `index.js`:

```javascript
// constants/index.js
export {db} from './db';
export {users} from './users';
```

Importe do index:

```javascript
// script.js
import {db, users} from './constants/index';
```

## import()

### Introdução

Como mencionado, `import` é analisado estaticamente e roda antes de outro código do módulo. Então o seguinte lança erro:

```javascript
// Erro
if (x === 2) {
  import MyModual from './myModual';
}
```

O engine trata `import` em tempo de compilação e não avalia o `if`; colocar `import` dentro dele é inválido e causa erro de sintaxe. `import` e `export` devem estar no nível superior do módulo, não dentro de blocos ou funções.

Esse design ajuda compiladores a otimizar, mas impede carregamento em tempo de execução. Carregamento condicional não é possível. Para que `import` substituísse o `require` do Node, era necessário carregamento dinâmico, mas `import` não conseguia fazer isso:

```javascript
const path = './' + fileName;
const myModual = require(path);
```

`require` carrega em tempo de execução, então o módulo exato só é conhecido quando o código roda. `import` não podia suportar isso.

A [proposta ES2020](https://github.com/tc39/proposal-dynamic-import) adicionou a função `import()` para carregamento dinâmico:

```javascript
import(specifier)
```

`specifier` é o caminho do módulo. Aceita os mesmos tipos de caminho que `import`, mas o carregamento é dinâmico.

`import()` retorna uma Promise. Exemplo:

```javascript
const main = document.querySelector('main');

import(`./section-modules/${someVariable}.js`)
  .then(module => {
    module.loadPageInto(main);
  })
  .catch(err => {
    main.textContent = err.message;
  });
```

`import()` pode ser usado em qualquer lugar, incluindo scripts não modulares. Ele roda quando a execução chega àquela linha. Não cria um vínculo estático com o módulo, ao contrário de `import`. É similar ao `require()` do Node, mas é assíncrono.

Como `import()` retorna uma Promise, use `.then()` para tratar o resultado. Para clareza, `await` costuma ser preferido:

```javascript
async function renderWidget() {
  const container = document.getElementById('widget');
  if (container !== null) {
    // Equivalente a
    // import("./widget").then(widget => {
    //   widget.render(container);
    // });
    const widget = await import('./widget.js');
    widget.render(container);
  }
}

renderWidget();
```

Aqui `await import()` substitui a forma com `.then()`.

### Casos de uso

Alguns usos típicos de `import()`:

(1) Carregamento sob demanda

Carregue um módulo apenas quando necessário:

```javascript
button.addEventListener('click', event => {
  import('./dialogBox.js')
  .then(dialogBox => {
    dialogBox.open();
  })
  .catch(error => {
    /* Error handling */
  })
});
```

O módulo só é carregado quando o botão é clicado.

(2) Carregamento condicional

Carregue módulos diferentes com base em condições:

```javascript
if (condition) {
  import('moduleA').then(...);
} else {
  import('moduleB').then(...);
}
```

(3) Caminhos de módulo dinâmicos

O caminho do módulo pode ser calculado em tempo de execução:

```javascript
import(f())
.then(...);
```

O caminho vem do valor retornado por `f()`.

### Notas

Depois que `import()` resolve, o módulo é passado como objeto para `.then()`. Você pode desestruturar para obter exportações nomeadas:

```javascript
import('./myModule.js')
.then(({export1, export2}) => {
  // ...·
});
```

Para exportações default:

```javascript
import('./myModule.js')
.then(myModule => {
  console.log(myModule.default);
});
```

Ou com import nomeado:

```javascript
import('./myModule.js')
.then(({default: theDefault}) => {
  console.log(theDefault);
});
```

Para carregar múltiplos módulos:

```javascript
Promise.all([
  import('./module1.js'),
  import('./module2.js'),
  import('./module3.js'),
])
.then(([module1, module2, module3]) => {
   ···
});
```

`import()` pode ser usado dentro de funções assíncronas:

```javascript
async function main() {
  const myModule = await import('./myModule.js');
  const {export1, export2} = await import('./myModule.js');
  const [module1, module2, module3] =
    await Promise.all([
      import('./module1.js'),
      import('./module2.js'),
      import('./module3.js'),
    ]);
}
main();
```

## import.meta

Desenvolvedores às vezes precisam de informações sobre o módulo atual (por exemplo, seu caminho). O [ES2020](https://github.com/tc39/proposal-import-meta) adicionou a meta-propriedade `import.meta`, que fornece metadados sobre o módulo atual.

`import.meta` só pode ser usado dentro de um módulo; usá-lo fora lança erro.

Retorna um objeto com metadados. As propriedades exatas dependem do ambiente. Normalmente inclui pelo menos:

**(1)import.meta.url**

`import.meta.url` é a URL do módulo atual. Por exemplo, se o arquivo principal é `https://foo.com/main.js`, `import.meta.url` é essa URL. Para resolver um caminho relativo como `data.txt`:

```javascript
new URL('data.txt', import.meta.url)
```

No Node.js, `import.meta.url` é sempre um caminho local como URL `file:`, por exemplo `file:///home/user/foo.js`.

**(2)import.meta.scriptElement**

`import.meta.scriptElement` é uma meta-propriedade específica do navegador. Retorna o elemento `<script>` que carregou o módulo, similar a `document.currentScript`.

```javascript
// Código HTML é
// <script type="module" src="my-module.js" data-foo="abc"></script>

// my-module.js executa o código abaixo
import.meta.scriptElement.dataset.foo
// "abc"
```

**(3)Outros**

O Deno suporta `import.meta.filename` e `import.meta.dirname`, correspondendo a `__filename` e `__dirname` no CommonJS:

- `import.meta.filename`: caminho absoluto do arquivo do módulo atual
- `import.meta.dirname`: caminho absoluto do diretório que contém o arquivo do módulo atual

Ambos usam o separador de caminho correto para a plataforma (por exemplo, `/dev/my_module.ts` no Linux, `C:\dev\my_module.ts` no Windows).

Eles funcionam tanto para módulos locais quanto remotos.
