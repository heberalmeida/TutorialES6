# Extensões do RegExp

## Construtor RegExp

No ES5, o construtor `RegExp` aceita dois tipos de argumentos.

Primeiro: dois argumentos — uma string (o padrão) e uma segunda string para os modificadores:

```javascript
var regex = new RegExp('xyz', 'i');
// equivalente a
var regex = /xyz/i;
```

Segundo: um único argumento regex, que retorna uma cópia do regex original:

```javascript
var regex = new RegExp(/xyz/i);
// equivalente a
var regex = /xyz/i;
```

Porém, o ES5 não permite passar um segundo argumento quando o primeiro é um regex, e lançaria erro:

```javascript
var regex = new RegExp(/xyz/, 'i');
// Uncaught TypeError: Cannot supply flags when constructing one RegExp from another
```

O ES6 altera isso: quando o primeiro argumento é um regex, o segundo pode especificar os modificadores. O novo regex ignora os modificadores originais e usa apenas os novos.

```javascript
new RegExp(/abc/ig, 'i').flags
// "i"
```

O regex original tinha modificadores `ig`, mas são sobrescritos pelo segundo argumento `i`.

## Métodos de String Relacionados a RegExp

Antes do ES6, havia quatro métodos de string que usavam expressões regulares: `match()`, `replace()`, `search()` e `split()`.

O ES6 faz com que esses métodos chamem internamente os métodos correspondentes do protótipo de `RegExp`:

- `String.prototype.match` chama `RegExp.prototype[Symbol.match]`
- `String.prototype.replace` chama `RegExp.prototype[Symbol.replace]`
- `String.prototype.search` chama `RegExp.prototype[Symbol.search]`
- `String.prototype.split` chama `RegExp.prototype[Symbol.split]`

## Modificador u

O ES6 adiciona o modificador `u` às expressões regulares, significando "modo Unicode", que trata corretamente caracteres acima de `\uFFFF` (codificação UTF-16 de quatro bytes).

```javascript
/^\uD83D/u.test('\uD83D\uDC2A') // false
/^\uD83D/.test('\uD83D\uDC2A') // true
```

`\uD83D\uDC2A` é uma codificação UTF-16 de quatro bytes para um único caractere. O ES5 trata como dois caracteres, por isso a segunda linha é `true`. Com `u`, o ES6 trata como um caractere, então a primeira linha é `false`.

Com `u`, os seguintes comportamentos da regex mudam:

**1. Ponto (`.` )**

O ponto corresponde a qualquer caractere único exceto quebras de linha. Para pontos de código acima de `0xFFFF`, o ponto falha sem `u`.

```javascript
var s = '𠮷';

/^.$/.test(s) // false
/^.$/u.test(s) // true
```

**2. Escape Unicode**

O ES6 suporta escapes Unicode com chaves (ex.: `\u{61}`) em regexes. Com `u`, as chaves são reconhecidas; sem ele, podem ser interpretadas como quantificadores.

```javascript
/\u{61}/.test('a') // false
/\u{61}/u.test('a') // true
/\u{20BB7}/u.test('𠮷') // true
```

**3. Quantificadores**

Com `u`, os quantificadores contam corretamente pontos de código acima de `0xFFFF`:

```javascript
/a{2}/.test('aa') // true
/a{2}/u.test('aa') // true
/𠮷{2}/.test('𠮷𠮷') // false
/𠮷{2}/u.test('𠮷𠮷') // true
```

**4. Classes de caracteres predefinidas**

Com `u`, classes como `\S` correspondem corretamente a pontos de código acima de `0xFFFF`:

```javascript
/^\S$/.test('𠮷') // false
/^\S$/u.test('𠮷') // true
```

Podemos usar isso para obter o comprimento correto da string:

```javascript
function codePointLength(text) {
  var result = text.match(/[\s\S]/gu);
  return result ? result.length : 0;
}

var s = '𠮷𠮷';

s.length // 4
codePointLength(s) // 2
```

**5. Modificador i**

Alguns caracteres Unicode têm codificações diferentes mas aparência similar (ex.: `\u004B` e `\u212A` para K maiúsculo):

```javascript
/[a-z]/i.test('\u212A') // false
/[a-z]/iu.test('\u212A') // true
```

**6. Escapamento**

Sem `u`, escapes indefinidos (ex.: `\,`) são ignorados. Com `u`, causam erro:

```javascript
/\,/ // /\,,/
/\,/u // lança erro
```

## Propriedade RegExp.prototype.unicode

Instâncias de RegExp têm a propriedade `unicode` indicando se o modificador `u` está ativo.

```javascript
const r1 = /hello/;
const r2 = /hello/u;

r1.unicode // false
r2.unicode // true
```

## Modificador y

O ES6 também adiciona o modificador `y` (modificador aderente/sticky).

`y` é semelhante a `g` pois habilita correspondência global. A diferença: `g` permite correspondência em qualquer posição restante, enquanto `y` exige que a correspondência comece exatamente na próxima posição.

```javascript
var s = 'aaa_aa_a';
var r1 = /a+/g;
var r2 = /a+/y;

r1.exec(s) // ["aaa"]
r2.exec(s) // ["aaa"]

r1.exec(s) // ["aa"]
r2.exec(s) // null
```

Após a primeira correspondência, o resto é `_aa_a`. Com `g`, a segunda correspondência obtém sucesso. Com `y`, a correspondência deve começar no início do resto (em `_`), então a segunda falha.

Se o padrão sempre corresponder a partir do início do resto, `y` continua retornando correspondências:

```javascript
var s = 'aaa_aa_a';
var r = /a+_/y;

r.exec(s) // ["aaa_"]
r.exec(s) // ["aa_"]
```

`lastIndex` esclarece o comportamento de `y`:

```javascript
const REGEX = /a/g;

REGEX.lastIndex = 2;

const match = REGEX.exec('xaya');

match.index // 3

REGEX.lastIndex // 4

REGEX.exec('xaya') // null
```

Com `g`, a regex busca a partir de `lastIndex` até encontrar correspondência. Com `y`, a correspondência deve ocorrer exatamente em `lastIndex`.

Conceptualmente, `y` implica uma âncora de início a cada passo:

```javascript
/b/y.exec('aba')
// null
```

Exemplo com `replace`:

```javascript
const REGEX = /a/gy;
'aaxa'.replace(REGEX, '-') // '--xa'
```

Com apenas `y`, `match` retorna só a primeira correspondência. Combine com `g` para todas:

```javascript
'a1a2a3'.match(/a\d/y) // ["a1"]
'a1a2a3'.match(/a\d/gy) // ["a1", "a2", "a3"]
```

`y` é útil para tokenização: garante que nenhum caractere seja pulado entre correspondências.

## Propriedade RegExp.prototype.sticky

Instâncias de RegExp têm a propriedade `sticky` para o modificador `y`:

```javascript
var r = /hello\d/y;
r.sticky // true
```

## Propriedade RegExp.prototype.flags

O ES6 adiciona a propriedade `flags` que retorna os modificadores da regex:

```javascript
/abc/ig.source
// "abc"

/abc/ig.flags
// 'gi'
```

## Modificador s: Modo dotAll

Em regex, o ponto (`.`) corresponde a qualquer caractere único exceto dois casos: caracteres UTF-16 de quatro bytes (tratados com `u`) e caracteres terminadores de linha (line terminators).

Line terminators:

- U+000A: Line feed (`\n`)
- U+000D: Carriage return (`\r`)
- U+2028: Line separator
- U+2029: Paragraph separator

```javascript
/foo.bar/.test('foo\nbar')
// false
```

O ponto não corresponde a `\n`. O ES2018 [adiciona](https://github.com/tc39/proposal-regexp-dotall-flag) o modificador `s` para que `.` corresponda a qualquer caractere, incluindo line terminators:

```javascript
/foo.bar/s.test('foo\nbar') // true
```

Isso é chamado modo dotAll. Instâncias de RegExp têm a propriedade `dotAll`.

## Asserções de Lookbehind

Antes, regex em JavaScript suportava apenas lookahead (`(?=...)`) e lookahead negativo (`(?!...)`). O ES2018 adiciona [lookbehind](https://github.com/tc39/proposal-regexp-lookbehind).

Lookbehind: `x` corresponde apenas quando precedido por `y`, escrito como `/(?<=y)x/`:

```javascript
/(?<=\$)\d+/.exec('Benjamin Franklin is on the $100 bill')  // ["100"]
/(?<!\$)\d+/.exec('it's worth about €90')                   // ["90"]
```

Exemplo de substituição:

```javascript
const RE_DOLLAR_PREFIX = /(?<=\$)foo/g;
'$foo %foo foo'.replace(RE_DOLLAR_PREFIX, 'bar');
// '$bar %foo foo'
```

## Unicode Property Escapes

O ES2018 [adiciona](https://github.com/tc39/proposal-regexp-unicode-property-escapes) escapes de propriedade Unicode: `\p{...}` e `\P{...}` (negado). Exigem o modificador `u`.

```javascript
const regexGreekSymbol = /\p{Script=Greek}/u;
regexGreekSymbol.test('π') // true
```

## Modificador v: Operações de Conjunto em Propriedades Unicode

O ES2024 adiciona [operações de conjunto](https://github.com/tc39/proposal-regexp-v-flag):

```javascript
[A--B]  // diferença de conjuntos
[A&&B]  // interseção
```

Exigem o modificador `v`.

## Grupos de Captura Nomeados

O ES2018 adiciona [grupos de captura nomeados](https://github.com/tc39/proposal-regexp-named-groups):

```javascript
const RE_DATE = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;

const matchObj = RE_DATE.exec('1999-12-31');
const year = matchObj.groups.year;   // "1999"
const month = matchObj.groups.month; // "12"
const day = matchObj.groups.day;     // "31"
```

Na substituição, use `$<nome>`:

```javascript
'2015-01-02'.replace(re, '$<day>/$<month>/$<year>')
// '02/01/2015'
```

Referência interna com `\k<nome>`:

```javascript
const RE_TWICE = /^(?<word>[a-z]+)!\k<word>$/;
RE_TWICE.test('abc!abc') // true
```

## Modificador d: Índices de Correspondência

O [ES2022](https://github.com/tc39/proposal-regexp-match-Indices) adiciona o modificador `d`, que inclui a propriedade `indices`:

```javascript
const text = 'zabbcdef';
const re = /ab/d;
const result = re.exec(text);

result.index // 1
result.indices // [ [1, 3] ]
```

## String.prototype.matchAll()

O [ES2020](https://github.com/tc39/proposal-string-matchall) adiciona `matchAll()`, que retorna um iterador sobre todas as correspondências:

```javascript
for (const match of string.matchAll(regex)) {
  console.log(match);
}
```

## RegExp.escape()

O ES2025 adiciona `RegExp.escape()` para escapar uma string para uso seguro em regex:

```javascript
RegExp.escape('(*)')
// '\\(\\*\\)'
```

## Modificadores Inline em Grupos

O ES2025 adiciona modificadores inline para grupos: `i`, `m`, `s` aplicam-se apenas a parte do padrão.

```javascript
/^x(?i:HELLO)x$/.test('xhellox')
// true
```
