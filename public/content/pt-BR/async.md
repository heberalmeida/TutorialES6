# Função async

## Significado

O padrão ES2017 introduz a função async, tornando operações assíncronas mais fáceis de trabalhar.

O que é uma função async? Em resumo, é açúcar sintático sobre funções Generator.

Tínhamos antes um Generator que lê dois arquivos em sequência:

```javascript
const fs = require('fs');

const readFile = function (fileName) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fileName, function(error, data) {
      if (error) return reject(error);
      resolve(data);
    });
  });
};

const gen = function* () {
  const f1 = yield readFile('/etc/fstab');
  const f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

Escrito como função async:

```javascript
const asyncReadFile = async function () {
  const f1 = await readFile('/etc/fstab');
  const f2 = await readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

A mudança é simples: trocar `*` por `async` e `yield` por `await`.

Comparando com Generators, funções async melhoram em quatro pontos:

(1) **Executor embutido.** A execução de Generators exige um executor (ex.: o módulo co). Funções async executam como funções normais — basta chamá-las.

```javascript
asyncReadFile();
```

(2) **Semântica mais clara.** `async` e `await` são mais descritivos que `*` e `yield`. `async` indica que a função realiza trabalho assíncrono; `await` indica que a expressão seguinte deve ser aguardada.

(3) **Aplicabilidade maior.** O módulo co exige que `yield` seja seguido de Thunk ou Promise. Funções async permitem que `await` seja seguido de Promises ou valores primitivos (número, string, booleano); primitivos são envolvidos em Promises resolvidas imediatamente.

(4) **Retorno é uma Promise.** Funções async retornam uma Promise, mais fácil de encadear que o Iterator retornado por Generators.

Você pode ver uma função async como uma Promise que envolve várias operações assíncronas; `await` é açúcar sintático para chamadas internas de `then`.

## Uso Básico

Funções async retornam uma Promise. Adicione callbacks com `then`. Quando a execução encontra `await`, a função retorna e aguarda; quando a operação termina, a execução retoma.

Exemplo:

```javascript
async function getStockPriceByName(name) {
  const symbol = await getStockSymbol(name);
  const stockPrice = await getStockPrice(symbol);
  return stockPrice;
}

getStockPriceByName('goog').then(function (result) {
  console.log(result);
});
```

Outro exemplo: imprimir um valor após um atraso:

```javascript
function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function asyncPrint(value, ms) {
  await timeout(ms);
  console.log(value);
}

asyncPrint('hello world', 50);
```

Como funções async retornam Promises, podem ser usadas como alvo de `await`. Assim o exemplo também pode ser escrito como:

```javascript
async function timeout(ms) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function asyncPrint(value, ms) {
  await timeout(ms);
  console.log(value);
}

asyncPrint('hello world', 50);
```

Funções async podem ser declaradas de várias formas:

```javascript
// Declaração de função
async function foo() {}

// Expressão de função
const foo = async function () {};

// Método de objeto
let obj = { async foo() {} };
obj.foo().then(...)

// Método de classe
class Storage {
  constructor() {
    this.cachePromise = caches.open('avatars');
  }

  async getAvatar(name) {
    const cache = await this.cachePromise;
    return cache.match(`/avatars/${name}.jpg`);
  }
}

const storage = new Storage();
storage.getAvatar('jake').then(…);

// Arrow function
const foo = async () => {};
```

## Sintaxe

As regras para funções async são em geral simples. O ponto mais delicado é o tratamento de erros.

### Retornando uma Promise

Funções async retornam uma Promise. O valor de um `return` interno vira o argumento do callback de `then`:

```javascript
async function f() {
  return 'hello world';
}

f().then(v => console.log(v))
// "hello world"
```

Se a função lançar um erro, a Promise retornada é rejeitada. O erro é passado ao callback de `catch`:

```javascript
async function f() {
  throw new Error('erro');
}

f().then(
  v => console.log('resolve', v),
  e => console.log('reject', e)
)
//reject Error: erro
```

### Estado da Promise

A Promise retornada por uma função async só é resolvida depois que todas as Promises de `await` internas forem resolvidas (ou após um `return` ou erro lançado). Ou seja, o trabalho assíncrono deve terminar antes de `then` rodar.

### Comando await

Normalmente `await` é seguido de uma Promise. Ele retorna o resultado dessa Promise. Se não for Promise, o valor é retornado como está:

```javascript
async function f() {
  // Equivalente a
  // return 123;
  return await 123;
}

f().then(v => console.log(v))
// 123
```

Se `await` for seguido de um thenable (objeto com método `then`), ele é tratado como Promise:

```javascript
class Sleep {
  constructor(timeout) {
    this.timeout = timeout;
  }
  then(resolve, reject) {
    const startTime = Date.now();
    setTimeout(
      () => resolve(Date.now() - startTime),
      this.timeout
    );
  }
}

(async () => {
  const sleepTime = await new Sleep(1000);
  console.log(sleepTime);
})();
// 1000
```

Esse padrão pode ser usado para implementar um sleep simples:

```javascript
function sleep(interval) {
  return new Promise(resolve => {
    setTimeout(resolve, interval);
  })
}

// uso
async function one2FiveInAsync() {
  for(let i = 1; i <= 5; i++) {
    console.log(i);
    await sleep(1000);
  }
}

one2FiveInAsync();
```

Se a Promise aguardada rejeitar, o erro é passado a `catch`:

```javascript
async function f() {
  await Promise.reject('erro');
}

f()
.then(v => console.log(v))
.catch(e => console.log(e))
// erro
```

Se um `await` rejeitar, a função para. Os `await` seguintes não rodam:

```javascript
async function f() {
  await Promise.reject('erro');
  await Promise.resolve('hello world'); // não executará
}
```

Para continuar mesmo quando uma operação falhar, coloque-a em `try...catch`:

```javascript
async function f() {
  try {
    await Promise.reject('erro');
  } catch(e) {
  }
  return await Promise.resolve('hello world');
}

f()
.then(v => console.log(v))
// hello world
```

Ou encadeie `.catch()` na Promise:

```javascript
async function f() {
  await Promise.reject('erro')
    .catch(e => console.log(e));
  return await Promise.resolve('hello world');
}

f()
.then(v => console.log(v))
// erro
// hello world
```

### Tratamento de Erros

Se um erro for lançado dentro de uma operação aguardada, a Promise retornada pela função async é rejeitada.

Boa prática: envolver `await` em `try...catch` ou usar `.catch()` na Promise aguardada.

Exemplo: lógica de retry:

```javascript
const superagent = require('superagent');
const NUM_RETRIES = 3;

async function test() {
  let i;
  for (i = 0; i < NUM_RETRIES; ++i) {
    try {
      await superagent.get('http://google.com/this-throws-an-error');
      break;
    } catch(err) {}
  }
  console.log(i); // 3
}

test();
```

### Pontos de Atenção

**Primeiro:** Como Promises aguardadas podem rejeitar, prefira envolver `await` em `try...catch` ou usar `.catch()`.

**Segundo:** Se vários `await`s não dependem um do outro, execute-os em concorrência:

```javascript
// Ruim: sequencial
let foo = await getFoo();
let bar = await getBar();

// Estilo 1
let [foo, bar] = await Promise.all([getFoo(), getBar()]);

// Estilo 2
let fooPromise = getFoo();
let barPromise = getBar();
let foo = await fooPromise;
let bar = await barPromise;
```

**Terceiro:** `await` só pode aparecer dentro de uma função async. Usar em função normal causa erro.

```javascript
async function dbFuc(db) {
  let docs = [{}, {}, {}];

  // Erro
  docs.forEach(function (doc) {
    await db.post(doc);
  });
}
```

Tornar o callback `async` não serializa as chamadas; elas rodam em concorrência. Use um loop `for` para execução sequencial:

```javascript
async function dbFuc(db) {
  let docs = [{}, {}, {}];

  for (let doc of docs) {
    await db.post(doc);
  }
}
```

Ou `reduce`:

```javascript
async function dbFuc(db) {
  let docs = [{}, {}, {}];

  await docs.reduce(async (_, doc) => {
    await _;
    await db.post(doc);
  }, undefined);
}
```

Para execução concorrente, use `Promise.all`:

```javascript
async function dbFuc(db) {
  let docs = [{}, {}, {}];
  let promises = docs.map((doc) => db.post(doc));

  let results = await Promise.all(promises);
  console.log(results);
}
```

**Quarto:** Funções async preservam a pilha de chamadas. Quando `b()` roda em `await b()`, `a()` pausa mas seu contexto permanece. Erros de `b()` ou `c()` incluirão `a()` na pilha, ao contrário de código baseado em callbacks.

## Implementação

Funções async são implementadas envolvendo um Generator e um executor em uma única função. Conceitualmente:

```javascript
async function fn(args) {
  // ...
}

// Equivalente a

function fn(args) {
  return spawn(function* () {
    // ...
  });
}
```

`spawn` é o executor. Sua implementação segue o padrão do executor de Generator baseado em Promise anterior.

## Comparação com Outros Estilos Assíncronos

Estilo Promise: encadeamento de `then`/`catch`, verboso.

Estilo Generator: fluxo linear, mas exige executor e `yield` deve ser seguido de Promises.

Estilo async: mesmo fluxo linear, executor embutido na linguagem e `await` pode ser usado com Promises ou primitivos. Em geral a opção mais legível.

## Exemplo: Operações Assíncronas Sequenciais

Exemplo: ler várias URLs em sequência e exibir em ordem. Com Promises usa-se `reduce` e `then`. Com async:

```javascript
async function logInOrder(urls) {
  for (const url of urls) {
    const response = await fetch(url);
    console.log(await response.text());
  }
}
```

Isso é sequencial. Para requisições concorrentes com saída ordenada:

```javascript
async function logInOrder(urls) {
  // Ler URLs remotas concorrentemente
  const textPromises = urls.map(async url => {
    const response = await fetch(url);
    return response.text();
  });

  // Saída em ordem
  for (const textPromise of textPromises) {
    console.log(await textPromise);
  }
}
```

## await no topo

Originalmente, `await` precisava estar dentro de uma função async. A partir do ES2022, [top-level await](https://github.com/tc39/proposal-top-level-await) é permitido em módulos, permitindo usar `await` no escopo do módulo.

O await no topo ajuda no carregamento assíncrono de módulos. Um módulo pode esperar trabalho assíncrono antes de exportar valores, e os consumidores podem importar normalmente:

```javascript
// awaiting.js
const dynamic = import(someMission);
const data = fetch(url);
export const output = someProcess((await dynamic).default, await data);
```

```javascript
// usage.js
import { output } from "./awaiting.js";
function outputPlusValue(value) { return output + value }

console.log(outputPlusValue(100));
```

O `await` no topo só funciona em módulos ES, não em CommonJS.

Exemplos:

```javascript
// carregamento via import()
const strings = await import(`/i18n/${navigator.language}`);

// Operação de banco de dados
const connection = await dbConnector();

// Rollback de dependência
let jQuery;
try {
  jQuery = await import('https://cdn-a.com/jQuery');
} catch {
  jQuery = await import('https://cdn-b.com/jQuery');
}
```

Quando vários módulos usam await no topo, o carregamento continua síncrono: imports são processados primeiro, depois cada módulo roda. Módulos com await no topo cedem a outros trabalhos de carregamento até suas operações assíncronas concluírem.
