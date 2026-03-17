# Novos Métodos de String

Este capítulo cobre os novos métodos do objeto string.

## String.fromCodePoint()

O ES5 fornece `String.fromCharCode()` para criar caracteres a partir de pontos de código Unicode, mas não suporta pontos acima de `0xFFFF`.

```javascript
String.fromCharCode(0x20BB7)
// "ஷ"
```

No código acima, `String.fromCharCode()` não consegue tratar pontos de código acima de `0xFFFF`, então `0x20BB7` sofre overflow. O dígito mais significativo `2` é descartado e retorna o caractere de U+0BB7 em vez de U+20BB7.

O ES6 adiciona `String.fromCodePoint()`, que trata pontos acima de `0xFFFF`. É o inverso de `codePointAt()`.

```javascript
String.fromCodePoint(0x20BB7)
// "𠮷"
String.fromCodePoint(0x78, 0x1f680, 0x79) === 'x\uD83D\uDE80y'
// true
```

Com vários argumentos, `String.fromCodePoint()` concatena os caracteres em uma única string.

Nota: `fromCodePoint` é definido em `String`; `codePointAt` é um método de instância em strings.

## String.raw()

O ES6 também adiciona `raw()` em `String`. Retorna uma string com barras invertidas escapadas (cada barra é precedida por outra). É usado principalmente em funções tag de template strings.

```javascript
String.raw`Hi\n${2+3}!`
// Na verdade retorna "Hi\\n5!", exibido como "Hi\n5!"

String.raw`Hi\u000A!`;
// Na verdade retorna "Hi\\u000A!", exibido como "Hi\u000A!"
```

Se as barras já estão escapadas na string original, `String.raw()` escapa novamente.

```javascript
String.raw`Hi\\n`
// Retorna "Hi\\\\n"

String.raw`Hi\\n` === "Hi\\\\n" // true
```

`String.raw()` pode servir de base para processamento de template strings: substitui interpolações e escapa barras invertidas, produzindo uma string adequada para uso posterior.

Como função normal, `String.raw()` espera que o primeiro argumento seja um objeto com a propriedade `raw` cujo valor é um array correspondente à template string analisada.

```javascript
// `foo${1 + 2}bar`
// equivale a
String.raw({ raw: ['foo', 'bar'] }, 1 + 2) // "foo3bar"
```

A propriedade `raw` do primeiro argumento corresponde ao array produzido ao analisar a template string.

Como função, `String.raw()` pode ser implementada aproximadamente assim:

```javascript
String.raw = function (strings, ...values) {
  let output = '';
  let index;
  for (index = 0; index < values.length; index++) {
    output += strings.raw[index] + values[index];
  }

  output += strings.raw[index]
  return output;
}
```

## Método de Instância: codePointAt()

Internamente, o JavaScript armazena caracteres em UTF-16. Cada caractere usa 2 bytes. Caracteres que precisam de 4 bytes (pontos de código Unicode acima de `0xFFFF`) são tratados como dois caracteres.

```javascript
var s = "😀";

s.length // 2
s.charAt(0) // ''
s.charAt(1) // ''
s.charCodeAt(0) // 55357
s.charCodeAt(1) // 56832
```

O caractere "😀" (emoji) tem ponto de código `0x1F600`, codificado em UTF-16 como `0xD83D 0xDE00` (decimal 55357 56832), exigindo 4 bytes. O JavaScript relata erroneamente o comprimento como 2, `charAt()` não consegue ler o caractere completo e `charCodeAt()` retorna as metades substitutas separadamente.

O ES6 adiciona `codePointAt()`, que trata corretamente caracteres de 4 bytes e retorna o ponto de código completo.

```javascript
let s = '😀a';

s.codePointAt(0) // 128512
s.codePointAt(1) // 56832

s.codePointAt(2) // 97
```

O argumento de `codePointAt()` é o índice do caractere na string (base 0). O JavaScript trata "😀a" como três caracteres; no índice 0, `codePointAt` retorna corretamente o ponto de código completo 128512 (hex 0x1F600). Nos índices 1 (surrogate baixo de "😀") e 2 ("a"), o resultado é igual ao de `charCodeAt()`.

Em resumo, `codePointAt()` retorna o ponto de código para caracteres UTF-16 de 32 bits. Para caracteres regulares de 2 bytes, comporta-se como `charCodeAt()`.

`codePointAt()` retorna um valor decimal. Use `toString(16)` para hexadecimal:

```javascript
let s = '𠮷a';

s.codePointAt(0).toString(16) // "20bb7"
s.codePointAt(2).toString(16) // "61"
```

Pode-se notar que `codePointAt()` ainda usa índices baseados em surrogates. Para "a", a posição lógica é 1, mas devemos passar 2. Usar `for...of` evita isso, pois respeita caracteres UTF-16 de 32 bits:

```javascript
let s = '𠮷a';
for (let ch of s) {
  console.log(ch.codePointAt(0).toString(16));
}
// 20bb7
// 61
```

Também é possível usar o operador spread:

```javascript
let arr = [...'𠮷a']; // arr.length === 2
arr.forEach(
  ch => console.log(ch.codePointAt(0).toString(16))
);
// 20bb7
// 61
```

`codePointAt()` é uma forma simples de verificar se um caractere usa 2 ou 4 bytes.

```javascript
function is32Bit(c) {
  return c.codePointAt(0) > 0xFFFF;
}

is32Bit("𠮷") // true
is32Bit("a") // false
```

## Método de Instância: normalize()

Muitas línguas europeias usam acentos e diacríticos. O Unicode suporta isso de duas formas: caracteres pré-compostos (ex.: `Ǒ`, `\u01D1`) ou base + caractere combinante (ex.: `O` + `ˇ` → `Ǒ`).

As duas formas são equivalentes visual e semanticamente, mas o JavaScript não as trata como iguais:

```javascript
'\u01D1'==='\u004F\u030C' //false

'\u01D1'.length // 1
'\u004F\u030C'.length // 2
```

O JavaScript trata a forma decomposta como dois caracteres, então as representações não são iguais.

O ES6 adiciona `normalize()` nas instâncias de string para unificar representações diferentes. Isso é normalização Unicode.

```javascript
'\u01D1'.normalize() === '\u004F\u030C'.normalize()
// true
```

`normalize()` aceita um parâmetro opcional para a forma de normalização:

- `NFC` (padrão): Composição canônica. Combina base + caracteres combinantes.
- `NFD`: Decomposição canônica. Separa em base + caracteres combinantes.
- `NFKC`: Composição de compatibilidade. Equivalência mais ampla.
- `NFKD`: Decomposição de compatibilidade.

```javascript
'\u004F\u030C'.normalize('NFC').length // 1
'\u004F\u030C'.normalize('NFD').length // 2
```

`NFC` retorna a forma composta; `NFD` retorna a forma decomposta.

`normalize()` não trata sequências de três ou mais caracteres. Para isso, use regex com intervalos Unicode.

## Método de Instância: includes(), startsWith(), endsWith()

Tradicionalmente, o JavaScript tinha apenas `indexOf()` para verificar se uma string contém outra. O ES6 adiciona três métodos:

- **includes()**: Retorna booleano indicando se a substring foi encontrada.
- **startsWith()**: Retorna booleano indicando se a substring está no início.
- **endsWith()**: Retorna booleano indicando se a substring está no final.

```javascript
let s = 'Hello world!';

s.startsWith('Hello') // true
s.endsWith('!') // true
s.includes('o') // true
```

Os três aceitam um segundo argumento para o índice inicial da busca.

```javascript
let s = 'Hello world!';

s.startsWith('world', 6) // true
s.endsWith('Hello', 5) // true
s.includes('Hello', 6) // false
```

Com o segundo argumento `n`, `endsWith` se comporta diferente: restringe aos primeiros `n` caracteres, enquanto os outros buscam do índice `n` até o fim.

## Método de Instância: repeat()

`repeat` retorna uma nova string repetindo a original `n` vezes.

```javascript
'x'.repeat(3) // "xxx"
'hello'.repeat(2) // "hellohello"
'na'.repeat(0) // ""
```

Valores fracionários são truncados.

```javascript
'na'.repeat(2.9) // "nana"
```

Números negativos e `Infinity` lançam erro:

```javascript
'na'.repeat(Infinity)
// RangeError
'na'.repeat(-1)
// RangeError
```

Valores entre 0 e -1 são truncados para 0 (truncar -0.9 resulta em -0, que `repeat` trata como 0):

```javascript
'na'.repeat(-0.9) // ""
```

`NaN` é tratado como 0:

```javascript
'na'.repeat(NaN) // ""
```

Se o argumento for string, é convertido para número primeiro:

```javascript
'na'.repeat('na') // ""
'na'.repeat('3') // "nanana"
```

## Método de Instância: padStart(), padEnd()

O ES2017 adiciona preenchimento de strings. `padStart()` preenche no início, `padEnd()` no final. Ambos recebem o comprimento alvo e opcionalmente a string de preenchimento.

```javascript
'x'.padStart(5, 'ab') // 'ababx'
'x'.padStart(4, 'ab') // 'abax'

'x'.padEnd(5, 'ab') // 'xabab'
'x'.padEnd(4, 'ab') // 'xaba'
```

Se a string já tiver comprimento igual ou maior ao alvo, é retornada sem alteração:

```javascript
'xxx'.padStart(2, 'ab') // 'xxx'
'xxx'.padEnd(2, 'ab') // 'xxx'
```

Se a string de preenchimento exceder o espaço restante, é truncada:

```javascript
'abc'.padStart(10, '0123456789')
// '0123456abc'
```

Omitir o segundo argumento usa espaços:

```javascript
'x'.padStart(4) // '   x'
'x'.padEnd(4) // 'x   '
```

Uso comum de `padStart()` é preencher strings numéricas para largura fixa:

```javascript
'1'.padStart(10, '0') // "0000000001"
'12'.padStart(10, '0') // "0000000012"
'123456'.padStart(10, '0') // "0000123456"
```

Outro uso é sugerir formato de data:

```javascript
'12'.padStart(10, 'YYYY-MM-DD') // "YYYY-MM-12"
'09-12'.padStart(10, 'YYYY-MM-DD') // "YYYY-09-12"
```

## Método de Instância: trimStart(), trimEnd()

O [ES2019](https://github.com/tc39/proposal-string-left-right-trim) adiciona `trimStart()` e `trimEnd()` em instâncias de string. Funcionam como `trim()`: `trimStart()` remove espaços no início, `trimEnd()` no final. Ambos retornam novas strings e não modificam a original.

```javascript
const s = '  abc  ';

s.trim() // "abc"
s.trimStart() // "abc  "
s.trimEnd() // "  abc"
```

Também removem tabs, quebras de linha e outros espaços em branco no início ou fim.

Alguns navegadores oferecem `trimLeft()` e `trimRight()` como aliases de `trimStart()` e `trimEnd()`.

## Método de Instância: matchAll()

O método `matchAll()` retorna todas as ocorrências de uma expressão regular na string. Ver o capítulo RegExp para detalhes.

## Método de Instância: replaceAll()

 Historicamente, `replace()` substituía apenas a primeira ocorrência:

```javascript
'aabbcc'.replace('b', '_')
// 'aa_bcc'
```

Para substituir todas, era preciso usar regex com o modificador `g`:

```javascript
'aabbcc'.replace(/b/g, '_')
// 'aa__cc'
```

O [ES2021](https://github.com/tc39/proposal-string-replaceall) adiciona `replaceAll()` para substituir todas as ocorrências:

```javascript
'aabbcc'.replaceAll('b', '_')
// 'aa__cc'
```

Comporta-se como `replace()` mas substitui todas as ocorrências. Retorna uma nova string e não modifica a original.

```javascript
String.prototype.replaceAll(searchValue, replacement)
```

`searchValue` pode ser uma string ou uma regex global (com modificador `g`).

Se `searchValue` for uma regex sem `g`, `replaceAll()` lança erro. Diferente de `replace()`.

```javascript
// não lança
'aabbcc'.replace(/b/, '_')

// lança
'aabbcc'.replaceAll(/b/, '_')
```

O segundo parâmetro `replacement` pode usar marcadores especiais:

- `$&`: Texto correspondido
- `` $` ``: Texto antes da correspondência
- `$'`: Texto depois da correspondência
- `$n`: Grupo de captura `n` (base 1). Requer que `searchValue` seja regex.
- `$$`: Literal `$`

Exemplos:

```javascript
// $& é o texto correspondido, então resultado igual ao original
'abbc'.replaceAll('b', '$&')
// 'abbc'

// $` é o texto antes de cada correspondência
'abbc'.replaceAll('b', '$`')
// 'aaabc'

// $' é o texto depois de cada correspondência
'abbc'.replaceAll('b', `$'`)
// 'abccc'

// $1, $2 referem-se aos grupos de captura
'abbc'.replaceAll(/(ab)(bc)/g, '$2$1')
// 'bcab'

// $$ é literal $
'abc'.replaceAll('b', '$$')
// 'a$c'
```

`replacement` também pode ser uma função. Seu valor de retorno substitui o texto correspondido:

```javascript
'aabbcc'.replaceAll('b', () => '_')
// 'aa__cc'
```

A função de substituição recebe: a correspondência, grupos de captura, índice da correspondência e a string original.

```javascript
const str = '123abc456';
const regex = /(\d+)([a-z]+)(\d+)/g;

function replacer(match, p1, p2, p3, offset, string) {
  return [p1, p2, p3].join(' - ');
}

str.replaceAll(regex, replacer)
// 123 - abc - 456
```

Aqui a regex tem três grupos, então `replacer` recebe `match` e as três capturas `p1`, `p2`, `p3`.

## Método de Instância: at()

O método `at()` recebe um índice inteiro e retorna o caractere nessa posição. Índices negativos contam a partir do final:

```javascript
const str = 'hello';
str.at(1) // "e"
str.at(-1) // "o"
```

Se o índice estiver fora do intervalo, `at()` retorna `undefined`.

Este método é baseado na proposta de `at()` para arrays. Ver o capítulo Array para detalhes.

## Método de Instância: toWellFormed()

O ES2024 adiciona `toWellFormed()` para tratar pares substitutos Unicode.

O JavaScript usa UTF-16 internamente. O UTF-16 usa 16 bits por unidade, então representa diretamente pontos de código de U+0000 a U+FFFF. Pontos acima de U+FFFF (U+10000 a U+10FFFF) são codificados como pares substitutos: duas unidades UTF-16. O intervalo U+D800–U+DFFF é reservado. O substituto alto é 0xD800–0xDBFF e o baixo 0xDC00–0xDFFF. Por exemplo, U+1D306 (𝌆) é codificado como 0xD834 0xDF06.

Às vezes strings contêm substitutos órfãos (um caractere em U+D800–U+DFFF sem par). Essas strings são malformadas e podem causar problemas.

`toWellFormed()` retorna uma nova string em que cada substituto órfão é substituído pelo caractere de substituição U+FFFD. Não modifica a string original.

```javascript
"ab\uD800".toWellFormed() // 'ab'
```

No exemplo, `\uD800` é um substituto órfão. `toWellFormed()` o converte para `\uFFFD`.

Funções como `encodeURI()` lançam erro quando recebem string com substitutos órfãos:

```javascript
const illFormed = "https://example.com/search?q=\uD800";

encodeURI(illFormed) // lança erro
```

Usar `toWellFormed()` antes evita o erro:

```javascript
const illFormed = "https://example.com/search?q=\uD800";

encodeURI(illFormed.toWellFormed()) // funciona
```
