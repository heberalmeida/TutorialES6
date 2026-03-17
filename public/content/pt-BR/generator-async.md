# Funções Generator para Aplicação Assíncrona

A programação assíncrona é fundamental em JavaScript. O ambiente de execução é single-threaded; sem programação assíncrona, as aplicações travariam. Este capítulo explica como funções Generator podem lidar com operações assíncronas.

## Métodos Tradicionais

Antes do ES6, a programação assíncrona usava tipicamente:

- Funções callback
- Event listeners
- Publicar/assinar
- Objetos Promise

As funções Generator elevaram a programação assíncrona em JavaScript a outro nível.

## Conceitos Básicos

### Assíncrono

"Assíncrono" significa que uma tarefa não é concluída em uma única execução contínua. Pense em duas partes: executar a primeira, mudar para outras tarefas e, quando pronto, voltar e executar a segunda.

Por exemplo, uma tarefa pode ser ler um arquivo e processá-lo. A primeira parte é pedir ao SO para ler o arquivo. O programa segue executando outras coisas até o SO devolver o arquivo; então roda a segunda parte (processar). Essa execução não contínua é assíncrona.

"Síncrono" significa execução contínua: nada pode rodar no meio; enquanto o SO lê do disco, o programa só espera.

### Funções Callback

O JavaScript implementa programação assíncrona por callbacks. Um callback é a segunda parte da tarefa escrita como função, chamada quando a tarefa está pronta para continuar. "Callback" significa literalmente "chamar de novo."

A leitura e processamento de um arquivo ficam assim:

```javascript
fs.readFile('/etc/passwd', 'utf-8', function (err, data) {
  if (err) throw err;
  console.log(data);
});
```

O terceiro argumento de `readFile` é o callback — a segunda parte da tarefa. Ele só roda depois que o SO retorna o arquivo.

Por que o Node.js convenciona colocar um objeto de erro `err` como primeiro argumento dos callbacks (ou `null` se não houver erro)?

Porque a execução é dividida em duas fases. Quando a primeira fase termina, seu contexto de execução desaparece. Erros lançados depois não podem ser capturados nesse contexto, então precisam ser passados como parâmetro para a segunda fase.

### Promise

Callbacks em si são ok; o problema surge com callbacks aninhados. Suponha que você leia o arquivo A e depois o B:

```javascript
fs.readFile(fileA, 'utf-8', function (err, data) {
  fs.readFile(fileB, 'utf-8', function (err, data) {
    // ...
  });
});
```

Com mais arquivos, o aninhamento cresce e fica difícil de gerenciar. Várias operações assíncronas ficam fortemente acopladas; mudar uma muitas vezes exige alterações em chamadores e chamados. Isso costuma ser chamado de "callback hell".

Promises resolvem isso transformando callbacks aninhados em chamadas encadeadas. Não são sintaxe nova, mas outro padrão. Com Promises, leituras encadeadas ficam assim:

```javascript
var readFile = require('fs-readfile-promise');

readFile(fileA)
.then(function (data) {
  console.log(data.toString());
})
.then(function () {
  return readFile(fileB);
})
.then(function (data) {
  console.log(data.toString());
})
.catch(function (err) {
  console.log(err);
});
```

O módulo `fs-readfile-promise` fornece um `readFile` baseado em Promise. Promises usam `then` para sucesso e `catch` para erros.

Promises deixam a lógica mais clara: as duas fases da tarefa assíncrona ficam mais visíveis. Fora isso, o modelo continua o mesmo.

A principal desvantagem das Promises é verbosidade. A lógica original fica envolta em Promises, operações viram cadeias de `then`, e a intenção pode se perder.

Existe algo melhor?

## Funções Generator

### Corrotinas

Linguagens tradicionais já tinham soluções para programação assíncrona (ou multi-tarefa). Uma delas são "corrotinas" — várias threads (ou funções) cooperando para concluir tarefas assíncronas.

Corrotinas lembram tanto funções quanto threads. Fluxo resumido:

- Passo 1: Corrotina A inicia.
- Passo 2: A executa até a metade, pausa e cede o controle à corrotina B.
- Passo 3: (Depois) B devolve o controle.
- Passo 4: A retoma.

Aqui a corrotina A é uma tarefa assíncrona porque roda em várias fases.

Exemplo: ler um arquivo no estilo corrotina:

```javascript
function* asyncJob() {
  // ...other code
  var f = yield readFile(fileA);
  // ...other code
}
```

`asyncJob` é uma corrotina. O ponto central é `yield`: significa "pausar aqui e ceder o controle a outra corrotina". Assim, `yield` separa as duas fases da operação assíncrona.

Quando uma corrotina encontra `yield`, pausa; quando o controle retorna, ela retoma daquele ponto. A vantagem é que o código se parece com fluxo síncrono; remova o `yield` e passa por código síncrono.

### Corrotinas Implementadas com Generators

Funções Generator são a implementação de corrotinas no ES6. Sua principal característica é poder ceder a execução (pausar).

Uma função Generator é um container para uma tarefa assíncrona. Cada ponto que precisa pausar é marcado com `yield`. A execução funciona assim:

```javascript
function* gen(x) {
  var y = yield x + 2;
  return y;
}

var g = gen(1);
g.next() // { value: 3, done: false }
g.next() // { value: undefined, done: true }
```

Chamar o Generator retorna um ponteiro interno (um iterador) `g`. Diferente de funções normais, não retorna um resultado; retorna esse ponteiro. Chamar `g.next()` avança o ponteiro (executa a primeira fase da tarefa assíncrona) até o primeiro `yield`, aqui `x + 2`.

Ou seja, `next` roda o Generator em fases. Cada chamada retorna um objeto com `value` e `done`: `value` é a expressão após `yield`; `done` indica se o Generator terminou.

### Troca de Dados e Tratamento de Erros em Generators

Generators podem pausar e retomar, o que permite encapsular tarefas assíncronas. Também permitem troca de dados e tratamento de erros através do limite da função:

- O `value` do retorno de `next` é como o Generator envia dados para fora.
- `next` pode receber um argumento, que passa a ser o retorno do `yield` anterior e assim injeta dados no Generator.

```javascript
function* gen(x){
  var y = yield x + 2;
  return y;
}

var g = gen(1);
g.next() // { value: 3, done: false }
g.next(2) // { value: 2, done: true }
```

Aqui, o primeiro `next` retorna `x + 2` = 3. O segundo `next(2)` passa 2 como resultado da fase assíncrona anterior, então `y` vira 2 e o retorno final é 2.

O corpo do Generator pode usar `try/catch` para capturar erros lançados de fora (ex.: pelo método `throw` do iterador):

```javascript
function* gen(x){
  try {
    var y = yield x + 2;
  } catch (e){
    console.log(e);
  }
  return y;
}

var g = gen(1);
g.next();
g.throw('erro');
// erro
```

O erro lançado de fora com `throw` do iterador é capturado dentro. O erro e o tratamento podem estar separados no tempo e no espaço, o que ajuda em fluxos assíncronos.

### Encapsulando Tarefas Assíncronas

Exemplo de tarefa assíncrona real com Generators:

```javascript
var fetch = require('node-fetch');

function* gen(){
  var url = 'https://api.github.com/users/github';
  var result = yield fetch(url);
  console.log(result.bio);
}
```

O Generator encapsula uma operação assíncrona: buscar uma API remota e interpretar o resultado. O código parece quase síncrono, exceto pelo `yield`.

Para executar:

```javascript
var g = gen();
var result = g.next();

result.value.then(function(data){
  return data.json();
}).then(function(data){
  g.next(data);
});
```

`gen()` retorna o iterador. O primeiro `next` roda a primeira fase. Como `fetch` retorna uma Promise, encadeia-se `then` para chamar o próximo `next` quando a requisição terminar.

Generators deixam a lógica assíncrona compacta, mas ainda é preciso um mecanismo para gerenciar o fluxo (quando rodar cada fase). É aí que entram ferramentas como Thunk e co.

## Função Thunk

Funções Thunk são uma forma de executar Generators automaticamente.

### Estratégia de Avaliação de Parâmetros

A ideia de Thunk remonta aos anos 1960.

Na época, discutia-se a "estratégia de avaliação" — quando avaliar argumentos de funções.

```javascript
var x = 1;

function f(m) {
  return m * 2;
}

f(x + 5)
```

`x + 5` deve ser avaliado antes ou no momento do uso?

**Chamada por valor**: Avaliar `x + 5` (para 6) antes de entrar na função. C usa isso.

```javascript
f(x + 5)
// chamada por valor, equivalente a
f(6)
```

**Chamada por nome**: Passar a expressão para a função e avaliar só quando usada. Haskell usa isso.

```javascript
f(x + 5)
// chamada por nome, equivalente a
(x + 5) * 2
```

Cada abordagem tem prós e contras. Chamada por valor é mais simples, mas pode avaliar argumentos não usados. Chamada por nome evita isso, mas complica a implementação.

```javascript
function f(a, b){
  return b;
}

f(3 * x * x - 2 * x - 1, x);
```

Aqui o primeiro argumento nunca é usado; avaliá-lo é desperdício. Alguns preferem chamada por nome nesses casos.

### Significado de Thunk

Em implementações de chamada por nome, parâmetros são muitas vezes substituídos por uma função temporária que o corpo chama quando precisa do valor. Essa função temporária é um Thunk.

```javascript
function f(m) {
  return m * 2;
}

f(x + 5);

// Equivalente a

var thunk = function () {
  return x + 5;
};

function f(thunk) {
  return thunk() * 2;
}
```

O argumento `x + 5` é trocado por uma função. Onde o argumento original era usado, o Thunk é chamado.

### Thunk em JavaScript

JavaScript usa chamada por valor. Aqui Thunk significa outra coisa: uma função que transforma uma função multi-argumento (com callback) em uma função de um único argumento que só aceita o callback.

```javascript
// readFile normal (multi-arg)
fs.readFile(fileName, callback);

// readFile Thunk (single-arg)
var Thunk = function (fileName) {
  return function (callback) {
    return fs.readFile(fileName, callback);
  };
};

var readFileThunk = Thunk(fileName);
readFileThunk(callback);
```

`fs.readFile` recebe o caminho e o callback. A versão Thunk primeiro recebe o caminho e retorna uma função que só recebe o callback. Qualquer função com callback pode ser convertida nessa forma. Um conversor Thunk simples:

```javascript
// versão ES5
var Thunk = function(fn){
  return function (){
    var args = Array.prototype.slice.call(arguments);
    return function (callback){
      args.push(callback);
      return fn.apply(this, args);
    }
  };
};

// versão ES6
const Thunk = function(fn) {
  return function (...args) {
    return function (callback) {
      return fn.call(this, ...args, callback);
    }
  };
};
```

Exemplo para `fs.readFile`:

```javascript
var readFileThunk = Thunk(fs.readFile);
readFileThunk(fileA)(callback);
```

Outro exemplo:

```javascript
function f(a, cb) {
  cb(a);
}
const ft = Thunk(f);

ft(1)(console.log) // 1
```

### Módulo Thunkify

Em produção, use o módulo Thunkify.

Instalação:

```bash
$ npm install thunkify
```

Uso:

```javascript
var thunkify = require('thunkify');
var fs = require('fs');

var read = thunkify(fs.readFile);
read('package.json')(function(err, str){
  // ...
});
```

O código do Thunkify é parecido com o conversor simples acima, com uma checagem extra: a variável `called` garante que o callback rode só uma vez. Isso importa quando o callback retoma um Generator.

Exemplo:

```javascript
function f(a, b, callback){
  var sum = a + b;
  callback(sum);
  callback(sum);
}

var ft = thunkify(f);
var print = console.log.bind(console);
ft(1, 2)(print);
// 3
```

### Controle de Fluxo de Generators com Thunk

Thunk é útil para rodar Generators automaticamente.

Um Generator pode ser percorrido manualmente:

```javascript
function* gen() {
  // ...
}

var g = gen();
var res = g.next();

while(!res.done){
  console.log(res.value);
  res = g.next();
}
```

Isso funciona para passos síncronos, mas não quando os passos precisam rodar em ordem e alguns são assíncronos. Thunk ajuda nesse caso. Exemplo: Generator com duas leituras assíncronas:

```javascript
var fs = require('fs');
var thunkify = require('thunkify');
var readFileThunk = thunkify(fs.readFile);

var gen = function* (){
  var r1 = yield readFileThunk('/etc/fstab');
  console.log(r1.toString());
  var r2 = yield readFileThunk('/etc/shells');
  console.log(r2.toString());
};
```

`yield` cede o controle. Precisamos de um jeito de devolver o controle ao Generator — é isso que o callback do Thunk faz. Execução manual:

```javascript
var g = gen();

var r1 = g.next();
r1.value(function (err, data) {
  if (err) throw err;
  var r2 = g.next(data);
  r2.value(function (err, data) {
    if (err) throw err;
    g.next(data);
  });
});
```

`g` é o ponteiro interno do Generator. `next` o avança e retorna o `value` (um Thunk) e `done` do passo atual. O padrão é sempre: passar um callback para `value`; quando rodar, chamar `next` de novo (e passar os dados). Isso pode ser automatizado com recursão.

### Gerenciamento Automático de Fluxo com Thunk

Aqui está um executor baseado em Thunk para Generators:

```javascript
function run(fn) {
  var gen = fn();

  function next(err, data) {
    var result = gen.next(data);
    if (result.done) return;
    result.value(next);
  }

  next();
}

function* g() {
  // ...
}

run(g);
```

`run` inicia o Generator e define `next` como o callback do Thunk. `next` avança o Generator, verifica `result.done` e, se não terminou, passa a si mesmo ao próximo Thunk. Com esse executor, qualquer Generator cujos `yield`s produzam Thunks pode ser executado automaticamente:

```javascript
var g = function* (){
  var f1 = yield readFileThunk('fileA');
  var f2 = yield readFileThunk('fileB');
  // ...
  var fn = yield readFileThunk('fileN');
};

run(g);
```

Thunk não é a única opção. Callbacks ou Promises também podem dirigir Generators. O importante é ter um mecanismo que ceda o controle e o retome quando o trabalho assíncrono terminar.

## Módulo co

### Uso Básico

O [módulo co](https://github.com/tj/co) de TJ Holowaychuk (junho de 2013) executa funções Generator automaticamente.

Exemplo: ler dois arquivos em sequência:

```javascript
var gen = function* () {
  var f1 = yield readFile('/etc/fstab');
  var f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

O co executa o Generator por você:

```javascript
var co = require('co');
co(gen);
```

`co` retorna uma Promise, então você pode adicionar callbacks com `then`:

```javascript
co(gen).then(function (){
  console.log('Função Generator finalizada');
});
```

### Como o co Funciona

O co usa uma das duas formas de retomar o Generator quando o trabalho assíncrono termina:

1. **Callbacks**: Envolver o trabalho em Thunks; o callback chama `next` para retomar.
2. **Promises**: Envolver o trabalho em Promises; usar `then` para retomar.

O co aceita ambos. O `yield` deve ser seguido por Thunk ou Promise. Arrays ou objetos cujos membros são Promises também funcionam.

### Executor Baseado em Promise

Envolva `fs.readFile` em uma Promise:

```javascript
var fs = require('fs');

var readFile = function (fileName){
  return new Promise(function (resolve, reject){
    fs.readFile(fileName, function(error, data){
      if (error) return reject(error);
      resolve(data);
    });
  });
};

var gen = function* (){
  var f1 = yield readFile('/etc/fstab');
  var f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

Execução manual:

```javascript
var g = gen();

g.next().value.then(function(data){
  g.next(data).value.then(function(data){
    g.next(data);
  });
});
```

Um executor automático segue o mesmo padrão: encadear `then` e chamar `next` recursivamente.

### Operações Assíncronas Concorrentes

O co permite operações concorrentes: faça `yield` de um array ou objeto de Promises e ele espera todas:

```javascript
// estilo array
co(function* () {
  var res = yield [
    Promise.resolve(1),
    Promise.resolve(2)
  ];
  console.log(res);
}).catch(onerror);

// estilo objeto
co(function* () {
  var res = yield {
    1: Promise.resolve(1),
    2: Promise.resolve(2),
  };
  console.log(res);
}).catch(onerror);
```

### Exemplo: Tratamento de Streams

A API de Stream do Node processa dados em partes. Emite:

- `data`: próxima parte pronta
- `end`: stream finalizada
- `error`: erro

Com `Promise.race()` você detecta qual evento ocorre primeiro. O exemplo conta ocorrências de "valjean" em um arquivo de texto:

```javascript
const co = require('co');
const fs = require('fs');

const stream = fs.createReadStream('./les_miserables.txt');
let valjeanCount = 0;

co(function*() {
  while(true) {
    const res = yield Promise.race([
      new Promise(resolve => stream.once('data', resolve)),
      new Promise(resolve => stream.once('end', resolve)),
      new Promise((resolve, reject) => stream.once('error', reject))
    ]);
    if (!res) {
      break;
    }
    stream.removeAllListeners('data');
    stream.removeAllListeners('end');
    stream.removeAllListeners('error');
    valjeanCount += (res.toString().match(/valjean/ig) || []).length;
  }
  console.log('count:', valjeanCount); // count: 1120
});
```
