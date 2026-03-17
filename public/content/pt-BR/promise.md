# Objeto Promise

## Significado de Promise

Promise é uma solução para programação assíncrona que é mais racional e poderosa que as abordagens tradicionais—callbacks e eventos. Foi proposta e implementada primeiro pela comunidade, e o ES6 a incorporou ao padrão da linguagem, unificou seu uso e fornece o objeto `Promise` nativamente.

Em resumo, uma `Promise` é um container que guarda o resultado de algum evento futuro (geralmente uma operação assíncrona). Sintaticamente, uma Promise é um objeto a partir do qual você pode obter mensagens sobre a operação assíncrona. A Promise fornece uma API unificada para que diferentes operações assíncronas possam ser tratadas da mesma forma.

Um objeto `Promise` tem duas características:

(1) Seu estado é independente do mundo externo. Uma `Promise` representa uma operação assíncrona e tem três estados: `pending` (em andamento), `fulfilled` (sucesso) e `rejected` (falha). Apenas o resultado da operação assíncrona pode determinar o estado atual; nada mais pode alterá-lo. Essa é a origem do nome "Promise"—seu significado em inglês é "compromisso", indicando que outros meios não podem mudá-lo.

(2) Uma vez que o estado mude, não muda novamente. Você sempre pode obter o resultado a qualquer momento. O estado de uma Promise só pode transitar de duas formas: de `pending` para `fulfilled` ou de `pending` para `rejected`. Quando uma delas acontece, o estado fica congelado e mantém esse resultado; isso é chamado resolved (settled). Se a mudança já aconteceu, adicionar um callback à Promise ainda receberá imediatamente esse resultado. Isso é completamente diferente de eventos—com eventos, se você perder um, escutar depois não dará o resultado.

Nota: Por conveniência, o termo `resolved` neste capítulo refere-se apenas ao estado `fulfilled`, não a `rejected`.

Com objetos `Promise`, operações assíncronas podem ser expressas em um fluxo síncrono, evitando callbacks aninhados. A Promise também fornece uma interface unificada, facilitando o controle de operações assíncronas.

`Promise` tem algumas desvantagens. Primeiro, não é possível cancelar uma Promise; uma vez criada ela executa imediatamente e não pode ser cancelada no meio. Segundo, se você não configurar funções de retorno, erros lançados dentro de uma Promise não aparecerão fora. Terceiro, quando no estado `pending`, não é possível saber em qual estágio está (recém-iniciada ou prestes a terminar).

Para eventos que ocorrem repetidamente, usar o padrão [Stream](https://nodejs.org/api/stream.html) geralmente é melhor do que usar Promises.

## Uso Básico

O ES6 especifica que o objeto `Promise` é um construtor usado para criar instâncias Promise.

O código abaixo cria uma instância Promise:

```javascript
const promise = new Promise(function(resolve, reject) {
  // ... some code

  if (/* operação assíncrona sucedeu */){
    resolve(value);
  } else {
    reject(error);
  }
});
```

O construtor `Promise` recebe uma função como argumento. Essa função recebe dois parâmetros: `resolve` e `reject`. Eles são fornecidos pelo motor JavaScript e não precisam ser definidos por você.

A função `resolve` muda o estado da Promise de "incompleta" para "sucesso" (pending para resolved) e é chamada quando a operação assíncrona tem sucesso, passando o resultado como argumento. A função `reject` muda o estado de "incompleta" para "falha" (pending para rejected) e é chamada quando a operação assíncrona falha, passando o erro como argumento.

Depois que uma instância Promise é criada, você pode usar o método `then` para especificar callbacks para os estados `resolved` e `rejected`.

```javascript
promise.then(function(value) {
  // success
}, function(error) {
  // failure
});
```

O método `then` aceita duas funções de retorno. A primeira é chamada quando a Promise se torna `resolved`; a segunda quando se torna `rejected`. Ambas são opcionais. Cada uma recebe o valor passado pela Promise como argumento.

Abaixo está um exemplo simples:

```javascript
function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms, 'done');
  });
}

timeout(100).then((value) => {
  console.log(value);
});
```

No código acima, `timeout` retorna uma instância Promise que representa um resultado a ocorrer após certo tempo. Após o tempo especificado (`ms`), o estado da Promise se torna `resolved` e o callback do `then` é executado.

Uma Promise executa imediatamente assim que é criada.

```javascript
let promise = new Promise(function(resolve, reject) {
  console.log('Promise');
  resolve();
});

promise.then(function() {
  console.log('resolved');
});

console.log('Hi!');

// Promise
// Hi!
// resolved
```

No código acima, a Promise executa imediatamente após a criação, então `Promise` é impresso primeiro. O callback do `then` só executa após todas as tarefas síncronas do script atual terminarem, então `resolved` é impresso por último.

Abaixo está um exemplo de carregamento assíncrono de imagem:

```javascript
function loadImageAsync(url) {
  return new Promise(function(resolve, reject) {
    const image = new Image();

    image.onload = function() {
      resolve(image);
    };

    image.onerror = function() {
      reject(new Error('Could not load image at ' + url));
    };

    image.src = url;
  });
}
```

O código acima envolve o carregamento de imagem em uma Promise. Em sucesso chama `resolve`, caso contrário `reject`.

Abaixo está um exemplo de Ajax usando Promise:

```javascript
const getJSON = function(url) {
  const promise = new Promise(function(resolve, reject){
    const handler = function() {
      if (this.readyState !== 4) {
        return;
      }
      if (this.status === 200) {
        resolve(this.response);
      } else {
        reject(new Error(this.statusText));
      }
    };
    const client = new XMLHttpRequest();
    client.open("GET", url);
    client.onreadystatechange = handler;
    client.responseType = "json";
    client.setRequestHeader("Accept", "application/json");
    client.send();

  });

  return promise;
};

getJSON("/posts.json").then(function(json) {
  console.log('Contents: ' + json);
}, function(error) {
  console.error('erro', error);
});
```

No código acima, `getJSON` encapsula XMLHttpRequest para requisições HTTP JSON e retorna uma Promise. Note que tanto `resolve` quanto `reject` em `getJSON` são chamados com argumentos.

Argumentos passados a `resolve` e `reject` são repassados aos callbacks. `reject` geralmente recebe uma instância de `Error`. `resolve` pode receber outra instância Promise:

```javascript
const p1 = new Promise(function (resolve, reject) {
  // ...
});

const p2 = new Promise(function (resolve, reject) {
  // ...
  resolve(p1);
})
```

No código acima, `p1` e `p2` são instâncias Promise, mas o `resolve` de `p2` recebe `p1`—o resultado de uma operação assíncrona é outra operação assíncrona.

Quando isso acontece, o estado de `p1` é passado para `p2`. Se `p1` está `pending`, os callbacks de `p2` esperam `p1`. Se `p1` já está `resolved` ou `rejected`, os callbacks de `p2` rodam imediatamente.

```javascript
const p1 = new Promise(function (resolve, reject) {
  setTimeout(() => reject(new Error('fail')), 3000)
})

const p2 = new Promise(function (resolve, reject) {
  setTimeout(() => resolve(p1), 1000)
})

p2
  .then(result => console.log(result))
  .catch(error => console.log(error))
// Error: fail
```

No código acima, `p1` se torna `rejected` após 3 segundos. O estado de `p2` muda após 1 segundo quando `resolve` recebe `p1`. Como `p2` resolve para outra Promise, o próprio estado de `p2` não se aplica; o estado de `p1` determina o de `p2`. O `then` seguinte é efetivamente anexado a `p1`. Após mais 2 segundos, `p1` se torna `rejected`, acionando o callback do `catch`.

Nota: Chamar `resolve` ou `reject` não encerra a execução da função executora da Promise.

```javascript
new Promise((resolve, reject) => {
  resolve(1);
  console.log(2);
}).then(r => {
  console.log(r);
});
// 2
// 1
```

Após `resolve(1)`, `console.log(2)` ainda executa e executa primeiro. Uma Promise que resolve imediatamente roda ao final do event loop atual, sempre após tarefas síncronas.

Geralmente, uma vez que `resolve` ou `reject` é chamado, o trabalho da Promise está feito. Lógica subsequente deve ir no `then`, não após `resolve` ou `reject`. Prefira adicionar `return` antes deles para evitar surpresas.

```javascript
new Promise((resolve, reject) => {
  return resolve(1);
  // próximas instruções não executarão
  console.log(2);
})
```

## Promise.prototype.then()

Uma instância Promise tem um método `then` definido em `Promise.prototype`. Ele adiciona callbacks para mudanças de estado. O primeiro argumento é o callback para `resolved`, o segundo para `rejected`. Ambos são opcionais.

`then` retorna uma nova instância Promise (não a original). Assim você pode encadear chamadas:

```javascript
getJSON("/posts.json").then(function(json) {
  return json.post;
}).then(function(post) {
  // ...
});
```

O código acima encadeia dois callbacks. O resultado do primeiro é passado como argumento para o segundo.

Com `then` encadeado, você pode sequenciar callbacks. O callback anterior pode retornar outra Promise (outra operação assíncrona); o próximo callback espera essa Promise ser resolvida antes de rodar.

```javascript
getJSON("/post/1.json").then(function(post) {
  return getJSON(post.commentURL);
}).then(function (comments) {
  console.log("resolved: ", comments);
}, function (err){
  console.log("rejected: ", err);
});
```

No código acima, o primeiro callback do `then` retorna uma Promise. Os callbacks do segundo `then` esperam por ela. Se virar `resolved`, o primeiro roda; se `rejected`, o segundo roda.

Usando arrow functions, o código pode ser simplificado:

```javascript
getJSON("/post/1.json").then(
  post => getJSON(post.commentURL)
).then(
  comments => console.log("resolved: ", comments),
  err => console.log("rejected: ", err)
);
```

## Promise.prototype.catch()

`Promise.prototype.catch()` é um alias para `.then(null, rejection)` ou `.then(undefined, rejection)` e é usado para especificar o callback de erro.

```javascript
getJSON('/posts.json').then(function(posts) {
  // ...
}).catch(function(error) {
  // tratar erros de getJSON e callback anterior
  console.log('Erro ocorreu!', error);
});
```

Quando `getJSON()` retorna uma Promise: se ela se tornar `resolved`, o callback do `then` roda; se a operação assíncrona lançar erro, ela se torna `rejected` e o callback do `catch` lida com isso. Erros lançados no callback do `then` também são capturados pelo `catch`.

```javascript
p.then((val) => console.log('fulfilled:', val))
  .catch((err) => console.log('rejected', err));

// Equivalente a
p.then((val) => console.log('fulfilled:', val))
  .then(null, (err) => console.log("rejected:", err));
```

Exemplo:

```javascript
const promise = new Promise(function(resolve, reject) {
  throw new Error('test');
});
promise.catch(function(error) {
  console.log(error);
});
// Error: test
```

O erro lançado no executor é capturado pelo `catch`. O acima é equivalente a:

```javascript
// Estilo 1
const promise = new Promise(function(resolve, reject) {
  try {
    throw new Error('test');
  } catch(e) {
    reject(e);
  }
});
promise.catch(function(error) {
  console.log(error);
});

// Estilo 2
const promise = new Promise(function(resolve, reject) {
  reject(new Error('test'));
});
promise.catch(function(error) {
  console.log(error);
});
```

Então `reject()` é equivalente a lançar um erro.

Se a Promise já está `resolved`, lançar um erro depois não tem efeito.

```javascript
const promise = new Promise(function(resolve, reject) {
  resolve('ok');
  throw new Error('test');
});
promise
  .then(function(value) { console.log(value) })
  .catch(function(error) { console.log(error) });
// ok
```

O erro lançado após `resolve` não é capturado. O estado de uma Promise, uma vez alterado, permanece assim.

Os erros de Promise "borbulham" até o próximo `catch`:

```javascript
getJSON('/post/1.json').then(function(post) {
  return getJSON(post.commentURL);
}).then(function(comments) {
  // some code
}).catch(function(error) {
  // tratar erros dos três Promises
});
```

Há três Promises aqui. Qualquer erro de qualquer uma delas é capturado pelo `catch` final.

Geralmente, evite usar o segundo parâmetro do `then` para rejeição; use `catch` em vez disso.

```javascript
// bad
promise
  .then(function(data) {
    // success
  }, function(err) {
    // error
  });

// good
promise
  .then(function(data) { //cb
    // success
  })
  .catch(function(err) {
    // error
  });
```

O segundo estilo é melhor porque também captura erros do callback do `then` e é mais próximo de `try/catch`.

Sem `catch`, os erros de Promise não chegam ao código externo:

```javascript
const someAsyncThing = function() {
  return new Promise(function(resolve, reject) {
    // próxima linha erro, x não declarado
    resolve(x + 2);
  });
};

someAsyncThing().then(function() {
  console.log('everything is great');
});

setTimeout(() => { console.log(123) }, 2000);
// Uncaught (in promise) ReferenceError: x is not defined
// 123
```

No servidor, o código de saída ainda seria `0`. O Node.js tem o evento `unhandledRejection` para rejeições não capturadas:

```javascript
process.on('unhandledRejection', function (err, p) {
  throw err;
});
```

Nota: O Node planeja mudar o comportamento em torno de `unhandledRejection`; erros não tratados podem terminar o processo com código de saída não zero.

## Promise.prototype.finally()

`finally()` executa independentemente do estado final da Promise. Foi adicionado no ES2018.

```javascript
promise
.then(result => {···})
.catch(error => {···})
.finally(() => {···});
```

O callback de `finally` não recebe argumentos e não deve depender do resultado da Promise.

## Promise.all()

`Promise.all()` envolve múltiplas instâncias Promise em uma única nova Promise.

```javascript
const p = Promise.all([p1, p2, p3]);
```

Se algum argumento não for uma Promise, é convertido com `Promise.resolve`. O argumento pode ser qualquer iterável de Promises.

O estado da nova Promise é determinado por `p1`, `p2`, `p3`:

(1) Todas precisam se tornar `fulfilled` para `p` ser `fulfilled`. Seus valores de retorno formam um array passado ao callback de `p`.

(2) Se alguma se tornar `rejected`, `p` se torna `rejected` com o motivo dessa instância.

```javascript
const promises = [2, 3, 5, 7, 11, 13].map(function (id) {
  return getJSON('/post/' + id + ".json");
});

Promise.all(promises).then(function (posts) {
  // ...
}).catch(function(reason){
  // ...
});
```

Se uma Promise no array tiver seu próprio `catch`, esse `catch` roda em vez do de `Promise.all`.

## Promise.race()

`Promise.race()` também envolve múltiplas Promises em uma. A primeira a ser resolvida determina o resultado.

```javascript
const p = Promise.race([
  fetch('/resource-that-may-take-a-while'),
  new Promise(function (resolve, reject) {
    setTimeout(() => reject(new Error('request timeout')), 5000)
  })
]);

p
.then(console.log)
.catch(console.error);
```

## Promise.allSettled()

Às vezes você quer esperar todas as operações assíncronas terminarem, sucedam ou falhem. `Promise.all()` falha assim que uma falha. O [ES2020](https://github.com/tc39/proposal-promise-allSettled) adiciona `Promise.allSettled()` para isso.

```javascript
const promises = [
  fetch('/api-1'),
  fetch('/api-2'),
  fetch('/api-3'),
];

await Promise.allSettled(promises);
removeLoadingIndicator();
```

A Promise retornada é sempre `fulfilled` com um array de resultados.

## Promise.any()

O [ES2021](https://github.com/tc39/proposal-promise-any) adiciona `Promise.any()`. Ela retorna uma Promise que se cumpre quando qualquer entrada se cumpre, e rejeita apenas quando todas rejeitam.

```javascript
Promise.any([
  fetch('https://v8.dev/').then(() => 'home'),
  fetch('https://v8.dev/blog').then(() => 'blog'),
  fetch('https://v8.dev/docs').then(() => 'docs')
]).then((first) => {
  console.log(first);
}).catch((error) => {
  console.log(error);
});
```

`Promise.any()` rejeita com um AggregateError cujo array `errors` contém todos os motivos de rejeição.

## Promise.resolve()

`Promise.resolve()` converte valores em Promises.

`Promise.resolve('foo')` é equivalente a `new Promise(resolve => resolve('foo'))`.

Casos de parâmetro:

(1) Se o argumento for uma Promise, ela é retornada inalterada.

(2) Se for um thenable (tem `then`), é convertido e seu `then` é executado.

(3) Se for um valor simples ou objeto não-thenable, uma Promise fulfilled é retornada com esse valor.

(4) Chamado sem argumento, retorna uma Promise fulfilled.

Um `resolve()` imediato executa no final do event loop atual.

## Promise.reject()

`Promise.reject(reason)` retorna uma Promise rejeitada.

```javascript
const p = Promise.reject('erro');
// Equivalente a
const p = new Promise((resolve, reject) => reject('erro'))
```

O motivo da rejeição é passado aos manipuladores subsequentes.

## Aplicações

### Carregamento de Imagens

```javascript
const preloadImage = function (path) {
  return new Promise(function (resolve, reject) {
    const image = new Image();
    image.onload  = resolve;
    image.onerror = reject;
    image.src = path;
  });
};
```

### Generator e Promise

```javascript
function getFoo () {
  return new Promise(function (resolve, reject){
    resolve('foo');
  });
}

const g = function* () {
  try {
    const foo = yield getFoo();
    console.log(foo);
  } catch (e) {
    console.log(e);
  }
};

function run (generator) {
  const it = generator();

  function go(result) {
    if (result.done) return result.value;

    return result.value.then(function (value) {
      return go(it.next(value));
    }, function (error) {
      return go(it.throw(error));
    });
  }

  go(it.next());
}

run(g);
```

## Promise.try()

Na prática, muitas vezes você quer usar Promise para uma função `f` sem se importar se é síncrona ou assíncrona, para poder usar `then` e `catch` de forma consistente. O [ES2025](https://github.com/ljharb/proposal-promise-try) fornece `Promise.try()`:

```javascript
const f = () => console.log('now');
Promise.try(f);
console.log('next');
// now
// next
```

```javascript
Promise.try(() => database.users.get({id: userId}))
  .then(...)
  .catch(...)
```
