# Implementação do Carregador de Módulos

O capítulo anterior tratou da sintaxe de módulos. Este capítulo descreve como carregar módulos ES6 no navegador e no Node.js, além de questões comuns como dependências circulares.

## Carregamento no Navegador

### Abordagem Tradicional

Em HTML, o navegador carrega JavaScript por meio das tags `<script>`.

```html
<!-- Script embutido na página -->
<script type="application/javascript">
  // module code
</script>

<!-- Script externo -->
<script type="application/javascript" src="path/to/myModule.js">
</script>
```

Como JavaScript é a linguagem padrão de script, `type="application/javascript"` pode ser omitido.

Por padrão, o navegador carrega scripts de forma síncrona: ao encontrar uma tag `<script>`, ele interrompe a renderização até o script terminar. Para scripts externos, também precisa aguardar o download.

Scripts grandes podem deixar a página lenta ou não responsiva. Por isso, os navegadores suportam carregamento assíncrono com estes atributos:

```html
<script src="path/to/myModule.js" defer></script>
<script src="path/to/myModule.js" async></script>
```

Com `defer` ou `async`, o script é carregado de forma assíncrona. O motor inicia o download do script externo mas não espera; continua com o restante da página.

A diferença: `defer` espera até a página estar totalmente renderizada (DOM pronto e outros scripts executados) antes de executar; `async` executa assim que o script termina de baixar, podendo interromper a renderização. Resumindo, `defer` significa "executar após a renderização"; `async` significa "executar quando carregar". Com vários scripts `defer`, eles rodam na ordem do documento; com vários scripts `async`, não há ordem garantida.

### Regras de Carregamento

Para carregar módulos ES6 no navegador, use `<script>` com `type="module"`:

```html
<script type="module" src="./foo.js"></script>
```

Isso carrega o módulo `foo.js`. Com `type="module"`, o navegador o trata como um módulo ES6.

Scripts com `type="module"` são carregados de forma assíncrona e não bloqueiam a página; são executados após a renderização da página, de forma semelhante a `defer`:

```html
<script type="module" src="./foo.js"></script>
<!-- Equivalente a -->
<script type="module" src="./foo.js" defer></script>
```

Várias tags `<script type="module">` são executadas na ordem do documento.

Ao adicionar `async`, o módulo é executado assim que carregar, mesmo que a renderização ainda não tenha terminado:

```html
<script type="module" src="./foo.js" async></script>
```

Com `async`, os módulos não são mais executados na ordem do documento; rodam assim que cada um terminar de carregar.

Módulos ES6 também podem ser incorporados em linha no HTML; o comportamento é o mesmo dos scripts de módulo externos:

```html
<script type="module">
  import utils from "./utils.js";

  // other code
</script>
```

Por exemplo, o jQuery suporta carregamento de módulos:

```html
<script type="module">
  import $ from "./jquery/src/jquery.js";
  $('#message').text('Hi from jQuery!');
</script>
```

Para scripts de módulo externos (por ex. `foo.js`):

- O código roda em escopo de módulo, não em escopo global. Variáveis de nível superior não são visíveis fora do módulo.
- Scripts de módulo rodam em modo estrito independentemente de `use strict`.
- Módulos podem usar `import` para carregar outros módulos (a extensão `.js` é obrigatória; use URLs absolutas ou relativas) e `export` para sua interface.
- O `this` de nível superior é `undefined`, não `window`. Usar `this` no nível superior em um módulo não tem efeito útil.
- Um módulo é executado apenas uma vez, mesmo que seja importado várias vezes.

Exemplo:

```javascript
import utils from 'https://example.com/js/utils.js';

const x = 1;

console.log(x === window.x); //false
console.log(this === undefined); // true
```

É possível detectar se o código roda em um módulo ES6 verificando o `this` de nível superior:

```javascript
const isNotModuleScript = this !== undefined;
```

## Diferenças Entre Módulos ES6 e CommonJS

Antes de falar sobre o carregamento de módulos ES6 no Node.js, é importante entender que os módulos ES6 e CommonJS se comportam de forma diferente.

Diferenças principais:

- CommonJS retorna uma cópia dos valores; ES6 retorna bindings em tempo real (referências).
- CommonJS carrega em tempo de execução; exports ES6 são resolvidos em tempo de compilação.
- CommonJS `require()` carrega de forma síncrona; ES6 `import` é assíncrono e tem uma fase separada de resolução de dependências.

A segunda diferença surge porque o CommonJS carrega um objeto (`module.exports`) que só é criado quando o script termina. Módulos ES6 não usam objetos; sua interface é estática e resolvida durante a análise estática.

Aqui nos concentramos na primeira diferença.

CommonJS retorna uma cópia: uma vez que um valor é exportado, alterações internas não o afetam. Exemplo de `lib.js`:

```javascript
// lib.js
var counter = 3;
function incCounter() {
  counter++;
}
module.exports = {
  counter: counter,
  incCounter: incCounter,
};
```

Então em `main.js`:

```javascript
// main.js
var mod = require('./lib');

console.log(mod.counter);  // 3
mod.incCounter();
console.log(mod.counter); // 3
```

Após carregar `lib.js`, suas atualizações internas não afetam `mod.counter` porque `mod.counter` é um primitivo em cache. Para obter o valor atualizado, é preciso exportar uma função:

```javascript
// lib.js
var counter = 3;
function incCounter() {
  counter++;
}
module.exports = {
  get counter() {
    return counter
  },
  incCounter: incCounter,
};
```

Agora `counter` é exportado via um getter. Executando `main.js`:

```bash
$ node main.js
3
4
```

Os módulos ES6 se comportam de forma diferente. Quando o motor analisa estaticamente o script e encontra um `import`, cria um binding somente leitura. Em tempo de execução resolve esse binding para o valor no módulo importado. Em outras palavras, o `import` ES6 funciona como um link simbólico: quando o valor original muda, o valor importado também muda. Módulos ES6 são referenciados dinamicamente; valores não são cacheados e os bindings permanecem vinculados ao módulo de origem.

Usando o mesmo exemplo com ES6:

```javascript
// lib.js
export let counter = 3;
export function incCounter() {
  counter++;
}

// main.js
import { counter, incCounter } from './lib';
console.log(counter); // 3
incCounter();
console.log(counter); // 4
```

O `counter` em `main.js` é um binding em tempo real para `lib.js` e reflete suas mudanças.

Outro exemplo da seção de `export`:

```javascript
// m1.js
export var foo = 'bar';
setTimeout(() => foo = 'baz', 500);

// m2.js
import {foo} from './m1.js';
console.log(foo);
setTimeout(() => console.log(foo), 500);
```

O `foo` em `m1.js` é inicialmente `bar`, depois `baz` após 500ms. Conferindo em `m2.js`:

```bash
$ babel-node m2.js

bar
baz
```

Módulos ES6 não fazem cache de valores; resolvem bindings dinamicamente, e as variáveis permanecem vinculadas ao seu módulo.

Como os imports ES6 são "links simbólicos", são somente leitura; reatribuição lança erro:

```javascript
// lib.js
export let obj = {};

// main.js
import { obj } from './lib';

obj.prop = 123; // OK
obj = {}; // TypeError
```

Você pode alterar as propriedades de `obj`, mas não reatribuir o próprio `obj`. O binding é somente leitura, como se `obj` fosse um `const`.

Por fim, `export` retorna o mesmo valor pela interface. Qualquer script que o importe obtém a mesma instância:

```javascript
// mod.js
function C() {
  this.sum = 0;
  this.add = function () {
    this.sum += 1;
  };
  this.show = function () {
    console.log(this.sum);
  };
}

export let c = new C();
```

O módulo acima exporta uma instância de `C`. Diferentes scripts que a importam compartilham essa instância:

```javascript
// x.js
import {c} from './mod';
c.add();

// y.js
import {c} from './mod';
c.show();

// main.js
import './x';
import './y';
```

Executando `main.js` a saída é `1`:

```bash
$ babel-node main.js
1
```

Ou seja, tanto `x.js` quanto `y.js` operam sobre a mesma instância.

## Carregando Módulos ES6 no Node.js

### Visão Geral

JavaScript possui dois sistemas de módulos: ES6 (ESM) e CommonJS (CJS).

CommonJS é específico do Node.js e não é compatível com módulos ES6. Sintaticamente, CommonJS usa `require()` e `module.exports`; ES6 usa `import` e `export`.

Eles usam mecanismos de carregamento diferentes. Desde o Node.js v13.2, os módulos ES6 são suportados por padrão.

O Node.js espera que módulos ES6 usem a extensão `.mjs`. Scripts que usam `import` ou `export` devem usar `.mjs`. O Node trata arquivos `.mjs` como módulos ES6 e os executa em modo estrito sem precisar de `"use strict"` no topo.

Alternativamente, defina `type` como `"module"` em `package.json`:

```javascript
{
   "type": "module"
}
```

Com isso, todos os scripts `.js` do projeto são tratados como módulos ES6.

```bash
# Interpretar como módulo ES6
$ node my-app.js
```

Se você ainda usar CommonJS, esses scripts devem usar a extensão `.cjs`. Sem `type`, ou com `type` igual a `"commonjs"`, arquivos `.js` são carregados como CommonJS.

Resumo: `.mjs` é sempre ESM, `.cjs` é sempre CJS, e `.js` depende do campo `type` em `package.json`.

Evite misturar ES6 e CommonJS. `require()` não consegue carregar arquivos `.mjs` e lançará erro. Apenas `import` pode carregá-los. Por outro lado, arquivos `.mjs` não podem usar `require`; precisam usar `import`.

### Campo main do package.json

O `package.json` pode especificar o arquivo de entrada com `main` ou `exports`. Para pacotes mais simples, `main` é suficiente:

```javascript
// ./node_modules/es-module-package/package.json
{
  "type": "module",
  "main": "./src/index.js"
}
```

Isso define o ponto de entrada como `./src/index.js` como módulo ES6. Sem `type`, o `index.js` seria carregado como CommonJS.

Em seguida você pode importar o pacote:

```javascript
// ./my-app.mjs

import { something } from 'es-module-package';
// Na prática carrega ./node_modules/es-module-package/src/index.js
```

O Node resolve `es-module-package` e usa o campo `main` para carregar o arquivo de entrada.

Carregar com `require()` falhará porque o CommonJS não consegue lidar com `export`.

### Campo exports do package.json

O campo `exports` sobrescreve `main`. Ele tem vários usos:

(1) Aliases de subcaminhos

`exports` pode mapear subcaminhos para arquivos:

```javascript
// ./node_modules/es-module-package/package.json
{
  "exports": {
    "./submodule": "./src/submodule.js"
  }
}
```

Isso mapeia `submodule` para `src/submodule.js`:

```javascript
import submodule from 'es-module-package/submodule';
// Carrega ./node_modules/es-module-package/src/submodule.js
```

Exemplo de alias de diretório:

```javascript
// ./node_modules/es-module-package/package.json
{
  "exports": {
    "./features/": "./src/features/"
  }
}

import feature from 'es-module-package/features/x.js';
// Carrega ./node_modules/es-module-package/src/features/x.js
```

Sem uma entrada de export, não é possível carregar via nome do pacote + caminho do script:

```javascript
// Erro
import submodule from 'es-module-package/private-module.js';

// OK
import submodule from './node_modules/es-module-package/private-module.js';
```

(2) Alias do ponto de entrada principal

Se a chave for `.`, é o ponto de entrada principal e tem precedência sobre `main`. O valor pode ser uma string:

```javascript
{
  "exports": {
    ".": "./main.js"
  }
}

// Equivalente a
{
  "exports": "./main.js"
}
```

Como apenas versões do Node compatíveis com ES6 reconhecem `exports`, você pode manter `main` para versões antigas:

```javascript
{
  "main": "./main-legacy.cjs",
  "exports": {
    ".": "./main-modern.cjs"
  }
}
```

Aqui, o Node antigo usa `main-legacy.cjs`; o Node mais novo usa `main-modern.cjs`.

(3) Exports condicionais

Usando `.` como chave, você pode especificar entradas diferentes para `require` versus o padrão (import):

```javascript
{
  "type": "module",
  "exports": {
    ".": {
      "require": "./main.cjs",
      "default": "./main.js"
    }
  }
}
```

`require` é a entrada CommonJS; `default` é a entrada ES6.

Forma abreviada:

```javascript
{
  "exports": {
    "require": "./main.cjs",
    "default": "./main.js"
  }
}
```

Se você tiver outros exports de subcaminhos, não pode usar essa abreviação:

```javascript
{
  // Erro
  "exports": {
    "./feature": "./lib/feature.js",
    "require": "./main.cjs",
    "default": "./main.js"
  }
}
```

### CommonJS Carregando Módulos ES6

O `require()` do CommonJS não pode carregar módulos ES6. Use `import()` em vez disso:

```javascript
(async () => {
  await import('./my-app.mjs');
})();
```

Isso funciona a partir de um módulo CommonJS.

`require()` é síncrono; módulos ES6 podem usar `await` no nível superior, então não podem ser carregados de forma síncrona.

### Módulos ES6 Carregando CommonJS

O `import` ES6 pode carregar módulos CommonJS, mas apenas inteiros; não é possível importar exports individuais:

```javascript
// Correto
import packageMain from 'commonjs-package';

// Erro
import { method } from 'commonjs-package';
```

Módulos ES6 exigem análise estática; o CommonJS expõe `module.exports`, um objeto cuja forma não é conhecida estaticamente, então apenas a importação do módulo inteiro funciona.

Para usar um export específico:

```javascript
import packageMain from 'commonjs-package';
const { method } = packageMain;
```

Outra opção é o `module.createRequire()` do Node:

```javascript
// cjs.cjs
module.exports = 'cjs';

// esm.mjs
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const cjs = require('./cjs.cjs');
cjs === 'cjs'; // true
```

Isso permite que um módulo ES6 carregue CommonJS, mas mistura os dois sistemas e não é recomendado.

### Suportando Ambos os Formatos

Um pacote pode suportar tanto CommonJS quanto ES6.

Se o pacote for ES6, exporte um default (por ex. `export default obj`) para que o CommonJS possa carregá-lo com `import()`.

Se o pacote for CommonJS, adicione um wrapper ES6:

```javascript
import cjsModule from '../index.js';
export const foo = cjsModule.foo;
```

Isso importa o módulo CommonJS e reexporta valores nomeados. Use extensão `.mjs` ou um subdiretório com seu próprio `package.json` que tenha `{ "type": "module" }`.

Alternativamente, use `exports` em `package.json` para apontar para arquivos de entrada diferentes:

```javascript
"exports": {
  "require": "./index.js",
  "import": "./esm/wrapper.js"
}
```

Aqui `require()` e `import` resolvem para arquivos diferentes.

### Módulos Integrados do Node.js

Módulos integrados podem ser importados inteiros ou por nome:

```javascript
// Carregar tudo
import EventEmitter from 'events';
const e = new EventEmitter();

// Carregar exportações nomeadas específicas
import { readFile } from 'fs';
readFile('./foo.txt', (err, source) => {
  if (err) {
    console.error(err);
  } else {
    console.log(source);
  }
});
```

### Caminhos de Carregamento

Os caminhos de módulos ES6 devem ser totalmente especificados; a extensão do arquivo não pode ser omitida. `import` e o campo `main` em `package.json` devem incluir a extensão, caso contrário o Node lança erro.

```javascript
// Erro no módulo ES6
import { something } from './index';
```

Para consistência com os navegadores, arquivos `.mjs` do Node suportam caminhos em estilo URL:

```javascript
import './foo.mjs?query=1'; // Carrega ./foo com parâmetro ?query=1
```

O caminho pode incluir parâmetros de query. Parâmetros diferentes criam instâncias diferentes do módulo. Caminhos contendo `:`, `%`, `#`, `?` devem ser escapados.

O `import` do Node suporta apenas módulos locais (`file:`) e `data:`; módulos remotos não são suportados. Os caminhos devem ser relativos; caminhos absolutos que começam com `/` ou `//` não são suportados.

### Variáveis Internas

Módulos ES6 são projetados para serem portáveis entre navegador e Node. Para isso, o Node desabilita algumas variáveis específicas do CommonJS em módulos ES6.

Primeiro, `this`: em módulos ES6, o `this` de nível superior é `undefined`; no CommonJS é o objeto módulo.

Segundo, estas variáveis de nível superior não existem em módulos ES6:

- `arguments`
- `require`
- `module`
- `exports`
- `__filename`
- `__dirname`

## Carregamento Circular

"Carregamento circular" significa que o módulo `a` depende de `b`, e `b` depende de `a`:

```javascript
// a.js
var b = require('b');

// b.js
var a = require('a');
```

Dependências circulares geralmente indicam acoplamento forte. Se não forem tratadas corretamente, podem causar recursão infinita ou falhas. Idealmente devem ser evitadas.

Na prática são difíceis de evitar em projetos grandes: `a` depende de `b`, `b` de `c` e `c` de `a`. O carregador precisa lidar com ciclos.

CommonJS e ES6 tratam carregamento circular de forma diferente e produzem resultados diferentes.

### Como o CommonJS Carrega Módulos

Entender o carregamento do CommonJS ajuda a explicar o tratamento de ciclos.

Um módulo CommonJS é um arquivo de script. Na primeira vez que `require` o carrega, o script inteiro é executado e o Node constrói um objeto na memória:

```javascript
{
  id: '...',
  exports: { ... },
  loaded: true,
  ...
}
```

`id` é o nome do módulo, `exports` é a interface exportada, `loaded` indica se o script terminou. Outros campos existem mas são omitidos aqui.

Chamadas subsequentes de `require` retornam o `exports` em cache. O script roda apenas uma vez, a menos que o cache seja limpo.

### Carregamento Circular no CommonJS

O CommonJS executa um módulo quando ele é `require`d. Em carregamento circular, retorna apenas o que já foi exportado; partes ainda não executadas ficam ausentes.

A [documentação](https://nodejs.org/api/modules.html#modules_cycles) do Node usa este exemplo. `a.js`:

```javascript
exports.done = false;
var b = require('./b.js');
console.log('Em a.js, b.done = %j', b.done);
exports.done = true;
console.log('a.js finalizado');
```

`a.js` primeiro exporta `done`, depois carrega `b.js` e para até `b.js` terminar.

`b.js`:

```javascript
exports.done = false;
var a = require('./a.js');
console.log('Em b.js, a.done = %j', a.done);
exports.done = true;
console.log('b.js finalizado');
```

Quando `b.js` executa e carrega `a.js`, há um ciclo. O Node retorna o `exports` em cache para `a.js`. Nesse momento `a.js` só executou:

```javascript
exports.done = false;
```

Então `b.js` vê `a.done === false`.

Em seguida `b.js` continua, termina e devolve o controle a `a.js`. Podemos verificar com `main.js`:

```javascript
var a = require('./a.js');
var b = require('./b.js');
console.log('Em main.js, a.done=%j, b.done=%j', a.done, b.done);
```

Saída:

```bash
$ node main.js

Em b.js, a.done = false
b.js finalizado
Em a.js, b.done = true
a.js finalizado
Em main.js, a.done=true, b.done=true
```

Então, quando `b.js` carrega `a.js`, `a.js` só executou parcialmente. E quando `main.js` faz require de `b.js` novamente, obtém o resultado em cache (incluindo `exports.done = true`).

O CommonJS importa cópias cacheadas dos valores, não referências em tempo real.

Como ciclos retornam valores parcialmente executados, é preciso cuidado ao usar desestruturação:

```javascript
var a = require('a'); // Abordagem segura
var foo = require('a').foo; // Abordagem arriscada

exports.good = function (arg) {
  return a.foo('good', arg); // Usa o valor mais recente de a.foo
};

exports.bad = function (arg) {
  return foo('bad', arg); // Usa valor carregado parcialmente
};
```

Se houver um ciclo, `require('a').foo` pode ser sobrescrito depois. Usar `require('a')` e então `a.foo` é mais seguro.

### Carregamento Circular em Módulos ES6

O ES6 trata carregamento circular de forma diferente. Imports são bindings em tempo real; não são cacheados. Você precisa garantir que os valores estejam disponíveis quando usados.

Exemplo:

```javascript
// a.mjs
import {bar} from './b';
console.log('a.mjs');
console.log(bar);
export let foo = 'foo';

// b.mjs
import {foo} from './a';
console.log('b.mjs');
console.log(foo);
export let bar = 'bar';
```

`a.mjs` carrega `b.mjs`, e `b.mjs` carrega `a.mjs`. Executando `a.mjs`:

```bash
$ node --experimental-modules a.mjs
b.mjs
ReferenceError: foo is not defined
```

`foo` ainda não está definido quando `b.mjs` executa. Por quê?

O motor executa `a.mjs`, vê que importa `b.mjs`, e executa `b.mjs` primeiro. Quando `b.mjs` executa, importa `foo` de `a.mjs`. O motor não reexecuta `a.mjs`; assume que o binding existe. Quando `b.mjs` chega em `console.log(foo)`, `foo` ainda não foi exportado, então lança erro.

Para corrigir, garanta que `foo` esteja definido antes que `b.mjs` o use. Uma forma é usar uma função (funções sofrem hoisting):

```javascript
// a.mjs
import {bar} from './b';
console.log('a.mjs');
console.log(bar());
function foo() { return 'foo' }
export {foo};

// b.mjs
import {foo} from './a';
console.log('b.mjs');
console.log(foo());
function bar() { return 'bar' }
export {bar};
```

Executando `a.mjs`:

```bash
$ node --experimental-modules a.mjs
b.mjs
foo
a.mjs
bar
```

Quando `import {bar} from './b'` executa, `foo` já está definido (hoisted), então `b.mjs` não lança erro. Usar uma expressão de função lançaria erro, pois expressões não sofrem hoisting:

```javascript
// a.mjs
import {bar} from './b';
console.log('a.mjs');
console.log(bar());
const foo = () => 'foo';
export {foo};
```

Outro exemplo do [SystemJS](https://github.com/ModuleLoader/es6-module-loader/blob/master/docs/circular-references-bindings.md):

```javascript
// even.js
import { odd } from './odd'
export var counter = 0;
export function even(n) {
  counter++;
  return n === 0 || odd(n - 1);
}

// odd.js
import { even } from './even';
export function odd(n) {
  return n !== 0 && even(n - 1);
}
```

`even` e `odd` se chamam mutuamente. Executando:

```javascript
$ babel-node
> import * as m from './even.js';
> m.even(10);
true
> m.counter
6
> m.even(20)
true
> m.counter
17
```

Para `even(10)`, `even` roda 6 vezes antes de `n` chegar a 0, então `counter` é 6. Para `even(20)`, roda mais 11 vezes, então `counter` passa a ser 17.

No CommonJS, o código equivalente falharia:

```javascript
// even.js
var odd = require('./odd');
var counter = 0;
exports.counter = counter;
exports.even = function (n) {
  counter++;
  return n == 0 || odd(n - 1);
}

// odd.js
var even = require('./even').even;
module.exports = function (n) {
  return n != 0 && even(n - 1);
}
```

O ciclo faz com que `even` seja `undefined` quando `odd` executa, então `even(n - 1)` lança erro:

```bash
$ node
> var m = require('./even');
> m.even(10)
TypeError: even is not a function
```
