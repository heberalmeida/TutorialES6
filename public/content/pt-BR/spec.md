# Entendendo a Especificação ECMAScript

## Visão geral

O documento de especificação é o padrão oficial de uma linguagem de computador, detalhando regras sintáticas e métodos de implementação.

De forma geral, não é necessário ler a especificação, a menos que você esteja escrevendo um compilador. Por ser escrita de forma abstrata e concisa, sem exemplos, a especificação é difícil de entender e, para resolver problemas práticos, ajuda pouco. No entanto, se você encontrar uma questão de sintaxe difícil e não conseguir resposta em outro lugar, pode consultar a especificação para ver o que o padrão da linguagem diz. A especificação é o "último recurso" para resolver problemas.

Isso é especialmente necessário para JavaScript. Seus cenários de uso são complexos, as regras de sintaxe são inconsistentes, há muitas exceções e vários ambientes de execução se comportam de forma diferente, levando a inúmeros problemas de sintaxe estranhos. Nenhum livro de sintaxe pode cobrir todos os casos. Consultar a especificação é o método mais confiável e autorizado para resolver problemas de sintaxe.

Este capítulo explica como ler a especificação ECMAScript 6.

A especificação ECMAScript 6 pode ser baixada gratuitamente e lida online no site da ECMA International ([www.ecma-international.org/ecma-262/6.0/](https://www.ecma-international.org/ecma-262/6.0/)).

Esse documento de especificação é bastante extenso, com um total de 26 capítulos — 545 páginas se impressas em A4. Sua característica é especificar tudo em grande detalhe: cada comportamento sintático e cada implementação de função são descritos de forma clara e exaustiva. Em essência, os autores de compiladores só precisam traduzir cada etapa em código. Isso garante em grande parte que todas as implementações ES6 tenham comportamento consistente.

Dos 26 capítulos da especificação ECMAScript 6, os capítulos 1 a 3 são introduções ao próprio documento e têm pouca relação com a linguagem. O capítulo 4 descreve o design geral da linguagem; leitores interessados podem lê-lo. Os capítulos 5 a 8 descrevem a linguagem em nível macro. O capítulo 5 explica a terminologia e notação usadas na especificação; o capítulo 6 introduz os tipos de dados; o capítulo 7 introduz as operações abstratas usadas internamente pela linguagem; o capítulo 8 descreve como o código é executado. Os capítulos 9 a 26 introduzem sintaxe específica.

Para usuários em geral, além do capítulo 4, os demais capítulos envolvem detalhes de aspectos particulares. Não é necessário lê-los por completo; basta consultar o capítulo relevante quando necessário.

## Terminologia

A especificação ES6 usa terminologia especializada. Entender esses termos ajuda a ler a especificação. Esta seção apresenta alguns deles.

### Operações abstratas

"Operações abstratas" são métodos internos do motor que não podem ser chamados de fora. A especificação define uma série de operações abstratas, especifica seu comportamento e deixa a implementação para cada motor.

Por exemplo, o algoritmo de `Boolean(value)` tem uma primeira etapa assim:

> 1. Let `b` be `ToBoolean(value)`.

Aqui `ToBoolean` é uma operação abstrata: o algoritmo interno do motor para produzir um valor booleano.

Muitas funções reutilizam as mesmas etapas, então a especificação ES6 as extrai em "operações abstratas" por conveniência.

### Record e field

A especificação ES6 chama a estrutura de dados de mapa chave-valor de Record, e cada par chave-valor é um field. Assim, um Record consiste em vários fields, e cada field contém um nome de chave e um valor.

### [[Notation]]

A especificação ES6 usa amplamente o estilo `[[Notation]]`, por exemplo `[[Value]]`, `[[Writable]]`, `[[Get]]`, `[[Set]]`, etc. Refere-se aos nomes das chaves dos fields.

Por exemplo, `obj` é um Record com uma propriedade `Prototype`. A especificação ES6 não escreveria `obj.Prototype` mas sim `obj.[[Prototype]]`. Em geral, propriedades escritas em `[[Notation]]` são propriedades internas de objetos.

Todas as funções JavaScript têm uma propriedade interna `[[Call]]` para executar essa função.

```javascript
F.[[Call]](V, argumentsList)
```

No código acima, `F` é um objeto função, `[[Call]]` é seu método interno; `F.[[call]]()` significa executar a função; `V` é o valor de `this` quando `[[Call]]` executa; `argumentsList` é a lista de argumentos passados na chamada.

### Completion Record

Toda declaração retorna um Completion Record representando o resultado da execução. Cada Completion Record tem uma propriedade `[[Type]]` indicando o tipo do resultado.

A propriedade `[[Type]]` tem cinco valores possíveis:

- normal
- return
- throw
- break
- continue

Se `[[Type]]` for `normal`, é chamado de normal completion (execução bem-sucedida). Todos os outros valores são abrupt completion. Para desenvolvedores, só precisa de atenção quando `[[Type]]` é igual a `throw` (erro); os valores `break`, `continue` e `return` aparecem apenas em contextos específicos e podem ser ignorados.

## Fluxo padrão das operações abstratas

O fluxo de execução das operações abstratas geralmente segue este padrão:

> 1. Let `result` be `AbstractOp()`.
> 1. If `result` is an abrupt completion, return `result`.
> 1. Set `result` to `result.[[Value]]`.
> 1. return `result`.

O passo 1 chama a operação abstrata `AbstractOp()` e obtém `result`, um Completion Record. O passo 2 retorna imediatamente se `result` for abrupt completion. Se a execução continuar, `result` é normal completion. O passo 3 define `result` para `resultCompletionRecord.[[Value]]`. O passo 4 retorna `result`.

A especificação ES6 expressa esse fluxo padrão em forma abreviada:

> 1. Let `result` be `AbstractOp()`.
> 1. `ReturnIfAbrupt(result)`.
> 1. return `result`.

Aqui `ReturnIfAbrupt(result)` representa os passos 2 e 3 anteriores: se houver erro, retorná-lo; caso contrário, extrair o valor.

Há uma forma ainda mais concisa:

> 1. Let `result` be `? AbstractOp()`.
> 1. return `result`.

O `?` significa que `AbstractOp()` pode lançar exceção. Se lançar, o erro é retornado; caso contrário, o valor é extraído.

Além de `?`, a especificação ES6 usa outro símbolo abreviado `!`:

> 1. Let `result` be `! AbstractOp()`.
> 1. return `result`.

Aqui `!` significa que `AbstractOp()` não lançará exceção; sempre retorna normal completion, portanto o valor pode sempre ser extraído.

## Operador de igualdade

A próxima seção ilustra como usar a especificação com alguns exemplos.

O operador de igualdade (`==`) é notório por seu comportamento variado e não intuitivo. Esta seção mostra o que a especificação diz sobre ele.

Considere esta expressão e seu valor:

```javascript
0 == null
```

Se você não tem certeza da resposta ou quer saber como a linguagem trata isso internamente, consulte a especificação. [Seção 7.2.12](https://www.ecma-international.org/ecma-262/6.0/#sec-abstract-equality-comparison) descreve o operador de igualdade (`==`).

A descrição de cada comportamento sintático é dividida em duas partes: uma descrição geral e o algoritmo detalhado. A descrição geral do operador de igualdade é uma única sentença:

> "The comparison `x == y`, where `x` and `y` are values, produces `true` or `false`."

Isso significa que o operador de igualdade compara dois valores e retorna `true` ou `false`.

Os detalhes do algoritmo são:

> 1. ReturnIfAbrupt(x).
> 1. ReturnIfAbrupt(y).
> 1. If `Type(x)` is the same as `Type(y)`, then
>    1. Return the result of performing Strict Equality Comparison `x === y`.
> 1. If `x` is `null` and `y` is `undefined`, return `true`.
> 1. If `x` is `undefined` and `y` is `null`, return `true`.
> 1. If `Type(x)` is Number and `Type(y)` is String,
>    return the result of the comparison `x == ToNumber(y)`.
> 1. If `Type(x)` is String and `Type(y)` is Number,
>    return the result of the comparison `ToNumber(x) == y`.
> 1. If `Type(x)` is Boolean, return the result of the comparison `ToNumber(x) == y`.
> 1. If `Type(y)` is Boolean, return the result of the comparison `x == ToNumber(y)`.
> 1. If `Type(x)` is either String, Number, or Symbol and `Type(y)` is Object, then
>    return the result of the comparison `x == ToPrimitive(y)`.
> 1. If `Type(x)` is Object and `Type(y)` is either String, Number, or Symbol, then
>    return the result of the comparison `ToPrimitive(x) == y`.
> 1. Return `false`.

Traduzido, o algoritmo é:

> 1. Se `x` não for um valor normal (ex.: lança exceção), interromper.
> 1. Se `y` não for um valor normal, interromper.
> 1. Se `Type(x)` for igual a `Type(y)`, executar igualdade estrita `x === y`.
> 1. Se `x` for `null` e `y` for `undefined`, retornar `true`.
> 1. Se `x` for `undefined` e `y` for `null`, retornar `true`.
> 1. Se `Type(x)` for Number e `Type(y)` for String, retornar `x == ToNumber(y)`.
> 1. Se `Type(x)` for String e `Type(y)` for Number, retornar `ToNumber(x) == y`.
> 1. Se `Type(x)` for Boolean, retornar `ToNumber(x) == y`.
> 1. Se `Type(y)` for Boolean, retornar `x == ToNumber(y)`.
> 1. Se `Type(x)` for String ou Number ou Symbol e `Type(y)` for Object, retornar `x == ToPrimitive(y)`.
> 1. Se `Type(x)` for Object e `Type(y)` for String ou Number ou Symbol, retornar `ToPrimitive(x) == y`.
> 1. Retornar `false`.

Como `0` tem tipo Number e `null` tem tipo Null (conforme [seção 4.3.13](https://www.ecma-international.org/ecma-262/6.0/#sec-terms-and-definitions-null-type) da especificação — esta é a operação interna Type, distinta de `typeof`), nenhuma das 11 primeiras etapas se aplica. A etapa 12 retorna `false`.

```javascript
0 == null // false
```

## Buracos em arrays

Eis outro exemplo.

```javascript
const a1 = [undefined, undefined, undefined];
const a2 = [, , ,];

a1.length // 3
a2.length // 3

a1[0] // undefined
a2[0] // undefined

a1[0] === a2[0] // true
```

Acima, `a1` tem três elementos `undefined`; `a2` tem três buracos. Ambos os arrays têm comprimento 3, e ler cada índice retorna `undefined`.

Mas eles se comportam de forma diferente:

```javascript
0 in a1 // true
0 in a2 // false

a1.hasOwnProperty(0) // true
a2.hasOwnProperty(0) // false

Object.keys(a1) // ["0", "1", "2"]
Object.keys(a2) // []

a1.map(n => 1) // [1, 1, 1]
a2.map(n => 1) // [, , ,]
```

`in`, `hasOwnProperty` e `Object.keys` mostram que `a2` não tem nomes de propriedade para esses índices. `map` mostra que `a2` não itera sobre buracos.

Por que buracos e elementos `undefined` se comportam diferente? [Seção 12.2.5 (Inicialização de array)](https://www.ecma-international.org/ecma-262/6.0/#sec-array-initializer) diz:

> "Array elements may be elided at the beginning, middle or end of the element list. Whenever a comma in the element list is not preceded by an AssignmentExpression (i.e., a comma at the beginning or after another comma), the missing array element contributes to the length of the Array and increases the index of subsequent elements. Elided array elements are not defined. If an element is elided at the end of an array, that element does not contribute to the length of the Array."

Tradução:

> "Elementos de array podem ser omitidos. Sempre que uma vírgula não é precedida por nenhuma expressão, o `length` do array é incrementado e o índice dos elementos seguintes aumenta correspondentemente. Elementos omitidos não são definidos. Se o elemento omitido estiver no final, não aumenta o `length`."

Assim, buracos contribuem para `length` e ocupam posições, mas essas posições não têm valor definido. Lê-las retorna `undefined` (o valor JavaScript que significa 'ausente').

Isso explica por que `in`, `hasOwnProperty` e `Object.keys` não enxergam índices de buracos: esses índices simplesmente não existem como propriedades; a especificação não atribui nomes de propriedade a buracos, apenas incrementa o índice do próximo elemento.

Quanto ao por que `map` pula buracos, veja a próxima seção.

## Método map de arrays

A [Seção 22.1.3.15](https://www.ecma-international.org/ecma-262/6.0/#sec-array.prototype.map) define o método `map`. O resumo não menciona buracos.

O algoritmo:

> 1. Let `O` be `ToObject(this value)`.
> 1. `ReturnIfAbrupt(O)`.
> 1. Let `len` be `ToLength(Get(O, "length"))`.
> 1. `ReturnIfAbrupt(len)`.
> 1. If `IsCallable(callbackfn)` is `false`, throw a TypeError exception.
> 1. If `thisArg` was supplied, let `T` be `thisArg`; else let `T` be `undefined`.
> 1. Let `A` be `ArraySpeciesCreate(O, len)`.
> 1. `ReturnIfAbrupt(A)`.
> 1. Let `k` be 0.
> 1. Repeat, while `k` < `len`
>    1. Let `Pk` be `ToString(k)`.
>    1. Let `kPresent` be `HasProperty(O, Pk)`.
>    1. `ReturnIfAbrupt(kPresent)`.
>    1. If `kPresent` is `true`, then
>       1. Let `kValue` be `Get(O, Pk)`.
>       1. `ReturnIfAbrupt(kValue)`.
>       1. Let `mappedValue` be `Call(callbackfn, T, «kValue, k, O»)`.
>       1. `ReturnIfAbrupt(mappedValue)`.
>       1. Let `status` be `CreateDataPropertyOrThrow (A, Pk, mappedValue)`.
>       1. `ReturnIfAbrupt(status)`.
>    1. Increase `k` by 1.
> 1. Return `A`.

Traduzido:

> 1. Obter o objeto `this` do array atual.
> 1. Se erro, retornar.
> 1. Obter o `length` do array atual.
> 1. Se erro, retornar.
> 1. Se `callbackfn` não for callable, lançar exceção.
> 1. Se `thisArg` foi fornecido, definir `T`; caso contrário `T` é `undefined`.
> 1. Criar um novo array `A` com o mesmo comprimento do array atual.
> 1. Se erro, retornar.
> 1. Definir `k` como 0.
> 1. Enquanto `k` < length:
>    1. Definir `Pk` como `ToString(k)`.
>    1. Definir `kPresent` como `HasProperty(O, Pk)` (esse índice existe?).
>    1. Se erro, retornar.
>    1. Se `kPresent` for `true`:
>       1. Definir `kValue` como `Get(O, Pk)`.
>       1. Se erro, retornar.
>       1. Definir `mappedValue` como `Call(callbackfn, T, «kValue, k, O»)`.
>       1. Se erro, retornar.
>       1. Definir `status` como `CreateDataPropertyOrThrow(A, Pk, mappedValue)`.
>       1. Se erro, retornar.
>    1. Incrementar `k`.
> 1. Retornar `A`.

No passo 10.2, para arrays com buracos, `kPresent` é `false` para esses índices, porque buracos não têm propriedade. Portanto, o callback nunca é executado para buracos.

```javascript
const arr = [, , ,];
arr.map(n => {
  console.log(n);
  return 1;
}) // [, , ,]
```

A implementação do V8 de `map` segue exatamente esse algoritmo: [array.js](https://github.com/v8/v8/blob/44c44521ae11859478b42004f57ea93df52526ee/src/js/array.js#L1347).

```javascript
function ArrayMap(f, receiver) {
  CHECK_OBJECT_COERCIBLE(this, "Array.prototype.map");

  // Pull out the length so that modifications to the length in the
  // loop will not affect the looping and side effects are visible.
  var array = TO_OBJECT(this);
  var length = TO_LENGTH_OR_UINT32(array.length);
  return InnerArrayMap(f, receiver, array, length);
}

function InnerArrayMap(f, receiver, array, length) {
  if (!IS_CALLABLE(f)) throw MakeTypeError(kCalledNonCallable, f);

  var accumulator = new InternalArray(length);
  var is_array = IS_ARRAY(array);
  var stepping = DEBUG_IS_STEPPING(f);
  for (var i = 0; i < length; i++) {
    if (HAS_INDEX(array, i, is_array)) {
      var element = array[i];
      // Prepare break slots for debugger step in.
      if (stepping) %DebugPrepareStepInIfStepping(f);
      accumulator[i] = %_Call(f, receiver, element, i, array);
    }
  }
  var result = new GlobalArray();
  %MoveArrayContents(accumulator, result);
  return result;
}
```
