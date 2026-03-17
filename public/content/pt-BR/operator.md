# Extensões de Operadores

Este capítulo cobre operadores adicionados nos padrões ES6 e posteriores.

## Operador de Exponenciação

O ES2016 adicionou o operador de exponenciação (`**`).

```javascript
2 ** 2 // 4
2 ** 3 // 8
```

Este operador é associativo à direita. Quando vários operadores de exponenciação estão encadeados, a avaliação começa pela direita:

```javascript
// equivalente a 2 ** (3 ** 2)
2 ** 3 ** 2
// 512
```

No código acima, o segundo `**` é avaliado primeiro, não o primeiro.

O operador de exponenciação pode ser combinado com atribuição como `**=`:

```javascript
let a = 1.5;
a **= 2;
// Equivalente a a = a * a;

let b = 4;
b **= 3;
// Equivalente a b = b * b * b;
```

## Operador de Encadeamento Opcional

Ao acessar propriedades aninhadas, muitas vezes é necessário verificar se cada nível existe. Por exemplo, para ler com segurança `message.body.user.firstName`, você poderia escrever:

```javascript
// estilo incorreto
const  firstName = message.body.user.firstName || 'default';

// Estilo correto
const firstName = (message
  && message.body
  && message.body.user
  && message.body.user.firstName) || 'default';
```

Aqui, `firstName` está quatro níveis de profundidade, então são necessárias quatro verificações de existência.

O operador ternário `?:` também é comumente usado para proteger o acesso a propriedades:

```javascript
const fooInput = myForm.querySelector('input[name=foo]')
const fooValue = fooInput ? fooInput.value : undefined
```

Aqui é preciso verificar se `fooInput` existe antes de ler `fooInput.value`.

O [ES2020](https://github.com/tc39/proposal-optional-chaining) introduz o operador de encadeamento opcional `?.` para simplificar isso:

```javascript
const firstName = message?.body?.user?.firstName || 'default';
const fooValue = myForm.querySelector('input[name=foo]')?.value
```

Com `?.`, a cadeia interrompe e retorna `undefined` se o lado esquerdo for `null` ou `undefined`, sem avaliar mais.

Verificar se um método existe antes de chamá-lo:

```javascript
iterator.return?.()
```

Se `iterator.return` estiver definido, será chamado; caso contrário a expressão retorna `undefined` e não avalia além de `?.`.

Isso é especialmente útil para métodos que podem não existir:

```javascript
if (myForm.checkValidity?.() === false) {
  // validação do formulário falhou
  return;
}
```

Aqui, formulários antigos podem não ter `checkValidity()`. O operador `?.` retorna `undefined`, então a condição vira `undefined === false` e o bloco é pulado.

O operador de encadeamento opcional tem três formas:

- `obj?.prop` // acesso a propriedade
- `obj?.[expr]` // acesso a propriedade computada
- `func?.(...args)` // chamada opcional de método/função

Exemplo de `obj?.[expr]`:

```bash
let hex = "#C0FFEE".match(/#([A-Z]+)/i)?.[1];
```

Aqui, `match()` retorna `null` sem correspondência ou um array com correspondência; `?.` trata ambos os casos.

Equivalentes sem encadeamento opcional:

```javascript
a?.b
// Equivalente a
a == null ? undefined : a.b

a?.[x]
// Equivalente a
a == null ? undefined : a[x]

a?.b()
// Equivalente a
a == null ? undefined : a.b()

a?.()
// Equivalente a
a == null ? undefined : a()
```

Para `a?.b()` e `a?.()`, se `a` não for `null`/`undefined` mas `a.b` (ou `a`) não for uma função, chamá-la ainda lançará erro.

Observações:

**(1)Short-circuit**

`?.` faz short-circuit: se o lado esquerdo falhar na verificação, o lado direito não é avaliado:

```javascript
a?.[++x]
// Equivalente a
a == null ? undefined : a[++x]
```

Se `a` for `undefined` ou `null`, `x` não será incrementado.

**(2)Parênteses**

Parênteses limitam o efeito de `?.`:

```javascript
(a?.b).c
// equivalente a
(a == null ? undefined : a.b).c
```

Aqui, `?.` só afeta `a.b`. O acesso `.c` sempre é avaliado; se `a` for null/undefined, isso lançará erro.

Em geral, evite parênteses em torno de expressões `?.`.

**(3)Usos inválidos**

Estes padrões lançam erro:

```javascript
// construtor
new a?.()
new a?.b()

// lado direito tem template string
a?.`{b}`
a?.b`{c}`

// lado esquerdo é super
super?.()
super?.foo

// usado à esquerda da atribuição
a?.b = c
```

**(4)O lado direito não pode ser decimal**

Por compatibilidade retroativa, `foo?.3:0` é parseado como `foo ? .3 : 0`. Se `?.` for imediatamente seguido por um dígito decimal, `?.` não é tratado como um único token; o ponto é parseado com os dígitos seguintes.

## Operador de coalescência nula

Ao ler propriedades que podem ser `null` ou `undefined`, muitas vezes você quer valores padrão. Uma abordagem comum usa `||`:

```javascript
const headerText = response.settings.headerText || 'Hello, world!';
const animationDuration = response.settings.animationDuration || 300;
const showSplashScreen = response.settings.showSplashScreen || true;
```

Essas três linhas usam `||` para padrões, mas isso está incorreto. A intenção é usar o padrão apenas quando o valor for `null` ou `undefined`. Com `||`, string vazia, `false` ou `0` também acionam o padrão.

O [ES2020](https://github.com/tc39/proposal-nullish-coalescing) adiciona o operador de coalescência nula `??`. Ele se comporta como `||`, mas retorna o lado direito apenas quando o lado esquerdo for `null` ou `undefined`:

```javascript
const headerText = response.settings.headerText ?? 'Hello, world!';
const animationDuration = response.settings.animationDuration ?? 300;
const showSplashScreen = response.settings.showSplashScreen ?? true;
```

Agora o padrão é aplicado apenas quando a propriedade for `null` ou `undefined`.

`??` combina bem com encadeamento opcional `?.`:

```javascript
const animationDuration = response.settings?.animationDuration ?? 300;
```

Isso verifica tanto `response.settings` quanto `response.settings.animationDuration`.

`??` é útil para valores padrão de parâmetros:

```javascript
function Component(props) {
  const enable = props.enabled ?? true;
  // …
}
```

Isso é aproximadamente equivalente a:

```javascript
function Component(props) {
  const {
    enabled: enable = true,
  } = props;
  // …
}
```

`??` é um operador lógico. Quando misturado com `&&` e `||`, use parênteses para evitar ambiguidade; caso contrário pode ocorrer erro de sintaxe:

```javascript
// Erro
lhs && middle ?? rhs
lhs ?? middle && rhs
lhs || middle ?? rhs
lhs ?? middle || rhs
```

Todas as quatro expressões acima lançam erro. Você deve adicionar parênteses:

```javascript
(lhs && middle) ?? rhs;
lhs && (middle ?? rhs);

(lhs ?? middle) && rhs;
lhs ?? (middle && rhs);

(lhs || middle) ?? rhs;
lhs || (middle ?? rhs);

(lhs ?? middle) || rhs;
lhs ?? (middle || rhs);
```

## Operadores de Atribuição Lógica

O ES2021 adiciona três [operadores de atribuição lógica](https://github.com/tc39/proposal-logical-assignment) que combinam operadores lógicos e de atribuição:

```javascript
// operador de atribuição OR
x ||= y
// Equivalente a
x || (x = y)

// operador de atribuição AND
x &&= y
// Equivalente a
x && (x = y)

// operador de atribuição nullish
x ??= y
// Equivalente a
x ?? (x = y)
```

Esses operadores executam a operação lógica primeiro e atribuem apenas se o resultado acionar a atribuição.

São úteis para definir valores padrão:

```javascript
// estilo antigo
user.id = user.id || 1;

// estilo novo
user.id ||= 1;
```

Aqui, se `user.id` for falsy, será definido como `1`.

Outro exemplo:

```javascript
function example(opts) {
  opts.foo = opts.foo ?? 'bar';
  opts.baz ?? (opts.baz = 'qux');
}
```

Com atribuição lógica:

```javascript
function example(opts) {
  opts.foo ??= 'bar';
  opts.baz ??= 'qux';
}
```

## `#!` (Hashbang)

Scripts Unix suportam a diretiva `#!` (Shebang ou Hashbang) na primeira linha para especificar o interpretador.

Script Bash:

```bash
#!/bin/sh
```

Script Python:

```python
#!/usr/bin/env python
```

O [ES2023](https://github.com/tc39/proposal-hashbang) adiciona suporte a `#!` para scripts JavaScript. Pode aparecer na primeira linha de um script ou arquivo de módulo:

```javascript
// na primeira linha do script
#!/usr/bin/env node
'use strict';
console.log(1);

// na primeira linha do módulo
#!/usr/bin/env node
export {};
console.log(1);
```

Com essa linha, o Unix pode executar o script diretamente:

```bash
# forma anterior de executar script
$ node hello.js

# abordagem hashbang
$ ./hello.js
```

Para o engine JavaScript, `#!` é tratado como comentário e ignorado.
