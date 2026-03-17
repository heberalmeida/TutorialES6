# Iterador assíncrono

## Problema com o iterador síncrono

Conforme explicado no capítulo sobre iteradores, a interface Iterator é um protocolo para percorrer dados. Chamar o método `next` de um objeto iterador retorna um objeto que representa informações sobre a posição atual do ponteiro de iteração. A estrutura do objeto retornado por `next` é `{value, done}`, onde `value` é o valor atual e `done` é um booleano indicando se a iteração terminou.

```javascript
function idMaker() {
  let index = 0;

  return {
    next: function() {
      return { value: index++, done: false };
    }
  };
}

const it = idMaker();

it.next().value // 0
it.next().value // 1
it.next().value // 2
// ...
```

No código acima, `it` é um iterador. Cada chamada a `it.next()` retorna um objeto com informações sobre a posição atual.

Uma regra implícita é que `it.next()` deve ser síncrono: a chamada deve retornar imediatamente um valor. Em outras palavras, assim que `it.next()` for invocado, `value` e `done` devem estar disponíveis de forma síncrona. Isso funciona quando o ponteiro aponta para uma operação síncrona, mas não para assíncronas.

```javascript
function idMaker() {
  let index = 0;

  return {
    next: function() {
      return new Promise(function (resolve, reject) {
        setTimeout(() => {
          resolve({ value: index++, done: false });
        }, 1000);
      });
    }
  };
}
```

No código acima, `next()` retorna uma Promise. Isso viola o protocolo Iterator, que exige comportamento síncrono. Qualquer operação assíncrona é proibida.

Uma solução comum é encapsular a operação assíncrona em um Thunk ou Promise, de modo que o `value` no objeto retornado seja um Thunk ou Promise que eventualmente produz o valor real, enquanto `done` é produzido de forma síncrona.

```javascript
function idMaker() {
  let index = 0;

  return {
    next: function() {
      return {
        value: new Promise(resolve => setTimeout(() => resolve(index++), 1000)),
        done: false
      };
    }
  };
}

const it = idMaker();

it.next().value.then(o => console.log(o)) // 0
it.next().value.then(o => console.log(o)) // 1
it.next().value.then(o => console.log(o)) // 2
// ...
```

Aqui, `value` é uma Promise que armazena o resultado assíncrono. Essa abordagem é trabalhosa e menos intuitiva.

ES2018 [introduziu](https://github.com/tc39/proposal-async-iteration) o iterador assíncrono, fornecendo uma interface nativa de iterador para operações assíncronas em que tanto `value` quanto `done` são produzidos de forma assíncrona.

## Interface do iterador assíncrono

A principal característica sintática do iterador assíncrono é que chamar `next` retorna uma Promise.

```javascript
asyncIterator
  .next()
  .then(
    ({ value, done }) => /* ... */
  );
```

Aqui, `asyncIterator` é um iterador assíncrono. Chamar `next` retorna uma Promise, então `.then()` pode especificar um callback executado quando a Promise é resolvida. O callback recebe um objeto com `value` e `done`, igual ao iterador síncrono.

O iterador síncrono de um objeto está em `Symbol.iterator`. De forma similar, o iterador assíncrono está em `Symbol.asyncIterator`. Qualquer objeto com um valor em `Symbol.asyncIterator` deve ser percorrido de forma assíncrona.

Exemplo de iterador assíncrono:

```javascript
const asyncIterable = createAsyncIterable(['a', 'b']);
const asyncIterator = asyncIterable[Symbol.asyncIterator]();

asyncIterator
.next()
.then(iterResult1 => {
  console.log(iterResult1); // { value: 'a', done: false }
  return asyncIterator.next();
})
.then(iterResult2 => {
  console.log(iterResult2); // { value: 'b', done: false }
  return asyncIterator.next();
})
.then(iterResult3 => {
  console.log(iterResult3); // { value: undefined, done: true }
});
```

O iterador assíncrono produz duas vezes: primeiro retorna uma Promise; quando essa Promise é resolvida, retorna um objeto com o item atual e o status. Assim, seu comportamento corresponde ao iterador síncrono; ele apenas intercala uma Promise.

Como `next` retorna uma Promise, pode ser usado com `await`:

```javascript
async function f() {
  const asyncIterable = createAsyncIterable(['a', 'b']);
  const asyncIterator = asyncIterable[Symbol.asyncIterator]();
  console.log(await asyncIterator.next());
  // { value: 'a', done: false }
  console.log(await asyncIterator.next());
  // { value: 'b', done: false }
  console.log(await asyncIterator.next());
  // { value: undefined, done: true }
}
```

Com `await`, não é necessário `.then()`. O fluxo se aproxima de código síncrono.

Você pode chamar `next` várias vezes sem esperar a Promise anterior ser resolvida. Nesse caso, as chamadas são enfileiradas e executadas em ordem. Exemplo com `Promise.all`:

```javascript
const asyncIterable = createAsyncIterable(['a', 'b']);
const asyncIterator = asyncIterable[Symbol.asyncIterator]();
const [{value: v1}, {value: v2}] = await Promise.all([
  asyncIterator.next(), asyncIterator.next()
]);

console.log(v1, v2); // a b
```

Você também pode fazer todas as chamadas `next` de uma vez e dar `await` na última:

```javascript
async function runner() {
  const writer = openFile('someFile.txt');
  writer.next('hello');
  writer.next('world');
  await writer.return();
}

runner();
```

## for await...of

O `for...of` percorre a interface Iterator síncrona. O novo `for await...of` faz o mesmo para iteradores assíncronos:

```javascript
async function f() {
  for await (const x of createAsyncIterable(['a', 'b'])) {
    console.log(x);
  }
}
// a
// b
```

`createAsyncIterable()` retorna um objeto com um iterador assíncrono. O loop chama seu método `next` e obtém uma Promise; `await` trata dessa Promise e, quando ela é resolvida, o valor é atribuído a `x`.

Um uso típico de `for await...of` é com streams assíncronos iteráveis:

```javascript
let body = '';

async function f() {
  for await(const data of req) body += data;
  const parsed = JSON.parse(body);
  console.log('got', parsed);
}
```

`req` é um iterável assíncrono que lê dados de forma assíncrona. Com `for await...of`, a lógica permanece concisa.

Se a Promise retornada por `next` rejeitar, `for await...of` lança exceção; use `try...catch` para tratar:

```javascript
async function () {
  try {
    for await (const x of createRejectingIterable()) {
      console.log(x);
    }
  } catch (e) {
    console.error(e);
  }
}
```

`for await...of` também pode ser usado com iteradores síncronos:

```javascript
(async function () {
  for await (const x of ['a', 'b']) {
    console.log(x);
  }
})();
// a
// b
```

O Node v10 suporta iteradores assíncronos; Stream implementa essa interface. Aqui está a forma tradicional vs. iterador assíncrono para ler um arquivo:

```javascript
// Estilo tradicional
function main(inputFilePath) {
  const readStream = fs.createReadStream(
    inputFilePath,
    { encoding: 'utf8', highWaterMark: 1024 }
  );
  readStream.on('data', (chunk) => {
    console.log('>>> '+chunk);
  });
  readStream.on('end', () => {
    console.log('### DONE ###');
  });
}

// Estilo iterador assíncrono
async function main(inputFilePath) {
  const readStream = fs.createReadStream(
    inputFilePath,
    { encoding: 'utf8', highWaterMark: 1024 }
  );

  for await (const chunk of readStream) {
    console.log('>>> '+chunk);
  }
  console.log('### DONE ###');
}
```

## Funções Generator assíncronas

Funções Generator síncronas retornam objetos iterador síncronos. Funções Generator assíncronas retornam objetos iterador assíncronos.

Sintaticamente, um Generator assíncrono é a combinação de uma função `async` e uma função Generator:

```javascript
async function* gen() {
  yield 'hello';
}
const genObj = gen();
genObj.next().then(x => console.log(x));
// { value: 'hello', done: false }
```

`gen` é um Generator assíncrono. Chamá-lo retorna um iterador assíncrono; chamar `next` nele retorna uma Promise.

Um dos objetivos dos iteradores assíncronos é permitir a mesma interface tanto para Generators síncronos quanto assíncronos:

```javascript
// Função Generator síncrona
function* map(iterable, func) {
  const iter = iterable[Symbol.iterator]();
  while (true) {
    const {value, done} = iter.next();
    if (done) break;
    yield func(value);
  }
}

// Função Generator assíncrona
async function* map(iterable, func) {
  const iter = iterable[Symbol.asyncIterator]();
  while (true) {
    const {value, done} = await iter.next();
    if (done) break;
    yield func(value);
  }
}
```

Ambas as versões de `map` recebem um iterável e um callback e aplicam o callback a cada valor. A versão síncrona usa `Symbol.iterator`; a assíncrona usa `Symbol.asyncIterator` e `await iter.next()`.

Outro exemplo:

```javascript
async function* readLines(path) {
  let file = await fileOpen(path);

  try {
    while (!file.EOF) {
      yield await file.readLine();
    }
  } finally {
    await file.close();
  }
}
```

`await` marca operações assíncronas; `yield` marca onde `next` suspende. O valor após `yield` se torna o `value` do objeto retornado por `next()`, igual aos Generators síncronos.

Dentro de um Generator assíncrono você pode usar tanto `await` quanto `yield`. `await` traz valores externos; `yield` envia valores internos para fora.

Uso do Generator assíncrono acima:

```javascript
(async function () {
  for await (const line of readLines(filePath)) {
    console.log(line);
  }
})()
```

Generators assíncronos funcionam naturalmente com `for await...of`:

```javascript
async function* prefixLines(asyncIterable) {
  for await (const line of asyncIterable) {
    yield '> ' + line;
  }
}
```

Um Generator assíncrono retorna um iterador assíncrono, então cada chamada a `next` retorna uma Promise. Se você fizer `yield` de uma string como no exemplo acima, ela é encapsulada em uma Promise.

```javascript
function fetchRandom() {
  const url = 'https://www.random.org/decimal-fractions/'
    + '?num=1&dec=10&col=1&format=plain&rnd=new';
  return fetch(url);
}

async function* asyncGenerator() {
  console.log('Start');
  const result = await fetchRandom(); // (A)
  yield 'Result: ' + await result.text(); // (B)
  console.log('Done');
}

const ag = asyncGenerator();
ag.next().then(({value, done}) => {
  console.log(value);
})
```

`ag` é o iterador assíncrono retornado por `asyncGenerator()`. Chamar `ag.next()`:

1. Retorna uma Promise imediatamente.
2. `asyncGenerator` começa, registra `Start`.
3. `await` retorna uma Promise e o generator pausa.
4. Em (A), quando cumprida, o resultado é armazenado e a execução continua.
5. A execução pausa no `yield` em (B). Quando o valor está pronto, a Promise de `ag.next()` é resolvida.
6. O callback de `.then` é executado com `{value, done}`; `value` é o valor produzido, `done` é `false`.

As linhas A e B são análogas a:

```javascript
return new Promise((resolve, reject) => {
  fetchRandom()
  .then(result => result.text())
  .then(result => {
     resolve({
       value: 'Result: ' + result,
       done: false,
     });
  });
});
```

Se um Generator assíncrono lançar exceção, a Promise de `next` rejeita e o erro pode ser capturado com `.catch`:

```javascript
async function* asyncGenerator() {
  throw new Error('Problem!');
}

asyncGenerator()
.next()
.catch(err => console.log(err)); // Error: Problem!
```

Uma função `async` normal retorna uma Promise; um Generator assíncrono retorna um iterador assíncrono. Ambos encapsulam trabalho assíncrono; a diferença é que `async` vem com seu próprio executor, enquanto um Generator assíncrono é acionado por `for await...of` ou um executor personalizado. Exemplo de executor personalizado:

```javascript
async function takeAsync(asyncIterable, count = Infinity) {
  const result = [];
  const iterator = asyncIterable[Symbol.asyncIterator]();
  while (result.length < count) {
    const {value, done} = await iterator.next();
    if (done) break;
    result.push(value);
  }
  return result;
}
```

Cada `await iterator.next()` avança o loop; quando `done` é true, o loop termina.

Uso:

```javascript
async function f() {
  async function* gen() {
    yield 'a';
    yield 'b';
    yield 'c';
  }

  return await takeAsync(gen());
}

f().then(function (result) {
  console.log(result); // ['a', 'b', 'c']
})
```

Com Generators assíncronos, JavaScript tem quatro tipos de função: função normal, função async, função Generator e função Generator assíncrona. Use `async` para operações assíncronas sequenciais (ler arquivo, escrever, salvar). Use Generator assíncrono quando produzir um fluxo de valores assíncronos (ex.: leitura de arquivo linha a linha).

Generators assíncronos podem receber dados via `next`:

```javascript
const writer = openFile('someFile.txt');
writer.next('hello'); // Executa imediatamente
writer.next('world'); // Executa imediatamente
await writer.return(); // Aguarda escrita terminar
```

Aqui, `openFile` é um Generator assíncrono; `next` envia dados para dentro dele. Cada chamada a `next` executa de forma síncrona; `await writer.return()` aguarda toda a escrita terminar.

Dados síncronos também podem ser convertidos em um Generator assíncrono:

```javascript
async function* createAsyncIterable(syncIterable) {
  for (const elem of syncIterable) {
    yield elem;
  }
}
```

Não é necessário `await` quando não há operações assíncronas.

## Instrução yield*

`yield*` pode delegar para um iterador assíncrono:

```javascript
async function* gen1() {
  yield 'a';
  yield 'b';
  return 2;
}

async function* gen2() {
  // result será igual a 2
  const result = yield* gen1();
}
```

Aqui, `result` acaba sendo `2`.

Como nos Generators síncronos, `for await...of` expande `yield*`:

```javascript
(async function () {
  for await (const x of gen2()) {
    console.log(x);
  }
})();
// a
// b
```
