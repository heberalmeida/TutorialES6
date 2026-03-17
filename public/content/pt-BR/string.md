# Extensões de Strings

Este capítulo apresenta as alterações e melhorias do ES6 para strings. O próximo capítulo cobre os novos métodos do objeto string.

## Representação Unicode de Caracteres

O ES6 melhora o suporte a Unicode, permitindo representar caracteres na forma `\uxxxx`, onde `xxxx` é o ponto de código Unicode do caractere.

```javascript
"\u0061"
// "a"
```

Porém, essa notação é limitada a caracteres com pontos de código entre `\u0000` e `\uFFFF`. Caracteres fora desse intervalo devem ser representados com duas unidades de 16 bits (pares substitutos).

```javascript
"\uD842\uDFB7"
// "𠮷"

"\u20BB7"
// " 7"
```

O código acima mostra que, se você colocar diretamente após `\u` um valor acima de `0xFFFF` (ex.: `\u20BB7`), o JavaScript interpretará como `\u20BB` + `7`. Como `\u20BB` é um caractere não imprimível, só aparece um espaço seguido de `7`.

O ES6 corrige isso: colocar o ponto de código entre chaves permite interpretação correta.

```javascript
"\u{20BB7}"
// "𠮷"

"\u{41}\u{42}\u{43}"
// "ABC"

let hello = 123;
hell\u{6F} // 123

'\u{1F680}' === '\uD83D\uDE80'
// true
```

No último exemplo, a forma com chaves é equivalente à codificação UTF-16 de quatro bytes.

Com essa notação, o JavaScript tem seis formas de representar um único caractere.

```javascript
'\z' === 'z'  // true
'\172' === 'z' // true
'\x7A' === 'z' // true
'\u007A' === 'z' // true
'\u{7A}' === 'z' // true
```

## Iterador de Strings

O ES6 adiciona uma interface de iterador a strings (ver capítulo Iterator), permitindo iterar com `for...of`.

```javascript
for (let codePoint of 'foo') {
  console.log(codePoint)
}
// "f"
// "o"
// "o"
```

Além de iterar sobre a string, o iterador trata corretamente pontos de código maiores que `0xFFFF`; o loop `for` tradicional não trata.

```javascript
let text = String.fromCodePoint(0x20BB7);

for (let i = 0; i < text.length; i++) {
  console.log(text[i]);
}
// " "
// " "

for (let i of text) {
  console.log(i);
}
// "𠮷"
```

No código acima, a string `text` tem um único caractere, mas o `for` trata como dois caracteres (ambos não imprimíveis), enquanto `for...of` reconhece corretamente o caractere único.

## Entrada Direta de U+2028 e U+2029

Strings em JavaScript permitem tanto caracteres diretos quanto sequências de escape. Por exemplo, "é" tem ponto de código Unicode U+00E9; você pode digitar o caractere diretamente ou usar o escape `\u00e9` — ambos são equivalentes.

```javascript
'é' === '\u00e9' // true
```

No entanto, o JavaScript exige que cinco caracteres apareçam apenas em forma escapada dentro de strings:

- U+005C: Barra invertida (reverse solidus)
- U+000D: Retorno de carro (carriage return)
- U+2028: Separador de linha (line separator)
- U+2029: Separador de parágrafo (paragraph separator)
- U+000A: Quebra de linha (line feed)

Por exemplo, uma string não pode conter uma barra invertida crua; deve ser escrita como `\\` ou `\u005c`.

A regra em si está correta, mas o formato JSON permite U+2028 (separador de linha) e U+2029 (separador de parágrafo) diretamente em strings. Assim, JSON retornado por um servidor e analisado com `JSON.parse` pode lançar erro.

```javascript
const json = '"\u2028"';
JSON.parse(json); // pode lançar
```

O formato JSON está congelado (RFC 7159) e não pode ser alterado. Para evitar esse erro, o [ES2019](https://github.com/tc39/proposal-json-superset) permite que strings em JavaScript incluam U+2028 e U+2029 diretamente.

```javascript
const PS = eval("'\u2029'");
```

Com essa proposta, o código acima não lança.

Nota: Template strings já permitem esses dois caracteres diretamente. Expressões regulares ainda não os permitem, o que é aceitável, já que JSON não permite expressões regulares cruas.

## Alterações em JSON.stringify()

Segundo o padrão, dados JSON devem ser codificados em UTF-8. O método `JSON.stringify()` pode, porém, retornar strings inválidas em UTF-8.

Especificamente, UTF-8 exige que pontos de código no intervalo `0xD800`–`0xDFFF` sejam usados apenas em pares. Por exemplo, `\uD834\uDF06` são dois pontos de código que devem ser usados juntos para representar o caractere `𝌆`. É uma forma de representar caracteres com pontos acima de `0xFFFF`. Usar `\uD834` ou `\uDF06` isoladamente é inválido; inverter a ordem também não forma um caractere válido.

O problema com `JSON.stringify()` é que ele pode retornar substitutos órfãos nesse intervalo.

```javascript
JSON.stringify('\u{D834}') // "\u{D834}"
```

Para garantir que a saída seja UTF-8 válido, o [ES2019](https://github.com/tc39/proposal-well-formed-stringify) altera o comportamento de `JSON.stringify()`. Para substitutos órfãos ou pares inválidos em `0xD800`–`0xDFFF`, retorna strings escapadas para a aplicação decidir como tratá-las.

```javascript
JSON.stringify('\u{D834}') // ""\\uD834""
JSON.stringify('\uDF06\uD834') // ""\\udf06\\ud834""
```

## Template Strings

Em JavaScript tradicional, a saída de templates costumava ser assim (usando jQuery abaixo):

```javascript
$('#result').append(
  'There are <b>' + basket.count + '</b> ' +
  'items in your basket, ' +
  '<em>' + basket.onSale +
  '</em> are on sale!'
);
```

Essa abordagem é trabalhosa. O ES6 introduz template strings para resolver isso.

```javascript
$('#result').append(`
  There are <b>${basket.count}</b> items
   in your basket, <em>${basket.onSale}</em>
  are on sale!
`);
```

Template strings são uma forma aprimorada de string, delimitadas por crases (&#96;). Podem ser usadas como strings comuns, para strings multilinhas ou para incorporar variáveis.

```javascript
// string comum
`In JavaScript '\n' is a line-feed.`

// string multilinha
`In JavaScript this is
 not legal.`

console.log(`string text line 1
string text line 2`);

// incorporando variáveis
let name = "Bob", time = "today";
`Hello ${name}, how are you ${time}?`
```

Nas template strings acima, todas usam crases. Para incluir uma crase dentro da template string, escape-a com barra invertida.

```javascript
let greeting = `\`Yo\` World!`;
```

Em template strings multilinhas, espaços e indentação são preservados na saída.

```javascript
$('#list').html(`
<ul>
  <li>first</li>
  <li>second</li>
</ul>
`);
```

Todos os espaços e quebras de linha da template string são preservados, incluindo a quebra antes de `<ul>`. Para remover espaços em branco no início e fim, use `trim()`.

```javascript
$('#list').html(`
<ul>
  <li>first</li>
  <li>second</li>
</ul>
`.trim());
```

Para incorporar variáveis, coloque o nome da variável dentro de `${}`.

```javascript
function authorize(user, action) {
  if (!user.hasPrivilege(action)) {
    throw new Error(
      // abordagem tradicional seria
      // 'User '
      // + user.name
      // + ' is not authorized to do '
      // + action
      // + '.'
      `User ${user.name} is not authorized to do ${action}.`);
  }
}
```

Dentro das chaves você pode colocar qualquer expressão JavaScript: aritmética, acesso a propriedades, etc.

```javascript
let x = 1;
let y = 2;

`${x} + ${y} = ${x + y}`
// "1 + 2 = 3"

`${x} + ${y * 2} = ${x + y * 2}`
// "1 + 4 = 5"

let obj = {x: 1, y: 2};
`${obj.x + obj.y}`
// "3"
```

Template strings também podem chamar funções.

```javascript
function fn() {
  return "Hello World";
}

`foo ${fn()} bar`
// foo Hello World bar
```

Se a expressão entre chaves não for string, é convertida pelas regras usuais (objetos usam `toString`).

Se uma variável na template string não estiver declarada, ocorre erro.

```javascript
// variável place não declarada
let msg = `Hello, ${place}`;
// erro
```

Como o conteúdo dentro de `${}` é executado como JavaScript, se for literal de string será exibido tal qual.

```javascript
`Hello ${'World'}`
// "Hello World"
```

Template strings podem ser aninhadas.

```javascript
const tmpl = addrs => `
  <table>
  ${addrs.map(addr => `
    <tr><td>${addr.first}</td></tr>
    <tr><td>${addr.last}</td></tr>
  `).join('')}
  </table>
`;
```

No código acima, a template string incorpora outra na parte variável. Uso:

```javascript
const data = [
    { first: '<Jane>', last: 'Bond' },
    { first: 'Lars', last: '<Croft>' },
];

console.log(tmpl(data));
// <table>
//
//   <tr><td><Jane></td></tr>
//   <tr><td>Bond</td></tr>
//
//   <tr><td>Lars</td></tr>
//   <tr><td><Croft></td></tr>
//
// </table>
```

Para referenciar a template string em si e executá-la quando necessário, pode-se colocá-la dentro de uma função.

```javascript
let func = (name) => `Hello ${name}!`;
func('Jack') // "Hello Jack!"
```

Aqui a template string é o valor de retorno da função. Chamar a função equivale a executar a template string.

## Exemplo: Compilação de Template

Segue um exemplo que compila uma template string em um template real.

```javascript
let template = `
<ul>
  <% for(let i=0; i < data.supplies.length; i++) { %>
    <li><%= data.supplies[i] %></li>
  <% } %>
</ul>
`;
```

O template usa `<%...%>` para código JavaScript e `<%= ... %>` para expressões a serem exibidas.

Como compilar essa template string? Uma abordagem é transformá-la em string de expressão JavaScript:

```javascript
echo('<ul>');
for(let i=0; i < data.supplies.length; i++) {
  echo('<li>');
  echo(data.supplies[i]);
  echo('</li>');
};
echo('</ul>');
```

Essa transformação pode ser feita com expressões regulares.

```javascript
let evalExpr = /<%=(.+?)%>/g;
let expr = /<%([\s\S]+?)%>/g;

template = template
  .replace(evalExpr, '`); \n  echo( $1 ); \n  echo(`')
  .replace(expr, '`); \n $1 \n  echo(`');

template = 'echo(`' + template + '`);';
```

Depois envolva `template` em uma função e retorne-a.

```javascript
let script =
`(function parse(data){
  let output = "";

  function echo(html){
    output += html;
  }

  ${ template }

  return output;
})`;

return script;
```

Montando isso em uma função `compile`:

```javascript
function compile(template){
  const evalExpr = /<%=(.+?)%>/g;
  const expr = /<%([\s\S]+?)%>/g;

  template = template
    .replace(evalExpr, '`); \n  echo( $1 ); \n  echo(`')
    .replace(expr, '`); \n $1 \n  echo(`');

  template = 'echo(`' + template + '`);';

  let script =
  `(function parse(data){
    let output = "";

    function echo(html){
      output += html;
    }

    ${ template }

    return output;
  })`;

  return script;
}
```

Uso da função `compile`:

```javascript
let parse = eval(compile(template));
div.innerHTML = parse({ supplies: [ "broom", "mop", "cleaner" ] });
//   <ul>
//     <li>broom</li>
//     <li>mop</li>
//     <li>cleaner</li>
//   </ul>
```

## Template Tags

Template strings também podem seguir o nome de uma função. Essa função é chamada para processar a template string. Isso é chamado de "template tag".

```javascript
alert`hello`
// equivalente a
alert(['hello'])
```

Um template tag não é um template de fato; é uma forma especial de chamada de função. O "tag" é a função, e a template string seguinte é seu argumento.

Se a template contiver interpolações, ela é processada em vários argumentos antes de chamar a função.

```javascript
let a = 5;
let b = 10;

tag`Hello ${ a + b } world ${ a * b }`;
// equivalente a
tag(['Hello ', ' world ', ''], 15, 50);
```

A função tag recebe vários parâmetros. O valor retornado pela expressão toda é o que a função tag retorna.

```javascript
function tag(stringArr, value1, value2){
  // ...
}

// equivalente a

function tag(stringArr, ...values){
  // ...
}
```

O primeiro parâmetro é um array cujos elementos são as partes literais da template string (entre as interpolações). As interpolações ficam entre o primeiro e o segundo, segundo e terceiro, etc.

Os parâmetros restantes são os valores das expressões interpoladas. Neste exemplo, a template tem duas interpolações, então a tag recebe `value1` e `value2`.

Os valores reais da função tag são:

- Primeiro parâmetro: `['Hello ', ' world ', '']`
- Segundo parâmetro: 15
- Terceiro parâmetro: 50

Portanto a tag é chamada assim:

```javascript
tag(['Hello ', ' world ', ''], 15, 50)
```

A função tag pode ser implementada conforme necessário. Exemplo:

```javascript
let a = 5;
let b = 10;

function tag(s, v1, v2) {
  console.log(s[0]);
  console.log(s[1]);
  console.log(s[2]);
  console.log(v1);
  console.log(v2);

  return "OK";
}

tag`Hello ${ a + b } world ${ a * b}`;
// "Hello "
// " world "
// ""
// 15
// 50
// "OK"
```

Exemplo mais complexo:

```javascript
let total = 30;
let msg = passthru`The total is ${total} (${total*1.05} with tax)`;

function passthru(literals) {
  let result = '';
  let i = 0;

  while (i < literals.length) {
    result += literals[i++];
    if (i < arguments.length) {
      result += arguments[i];
    }
  }

  return result;
}

msg // "The total is 30 (31.5 with tax)"
```

Este exemplo remonta a string a partir das partes literais e dos valores na ordem correta.

Versão com parâmetro rest de `passthru`:

```javascript
function passthru(literals, ...values) {
  let output = "";
  let index;
  for (index = 0; index < values.length; index++) {
    output += literals[index] + values[index];
  }

  output += literals[index]
  return output;
}
```

Template tags são úteis para sanitizar strings HTML e evitar conteúdo malicioso do usuário.

```javascript
let message =
  SaferHTML`<p>${sender} has sent you a message.</p>`;

function SaferHTML(templateData) {
  let s = templateData[0];
  for (let i = 1; i < arguments.length; i++) {
    let arg = String(arguments[i]);

    // Escapa caracteres especiais na substituição.
    s += arg.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    // Não escapa caracteres especiais no template.
    s += templateData[i];
  }
  return s;
}
```

A variável `sender` costuma ser fornecida pelo usuário. Após `SaferHTML`, caracteres especiais são escapados.

```javascript
let sender = '<script>alert("abc")</script>'; // código malicioso
let message = SaferHTML`<p>${sender} has sent you a message.</p>`;

message
// <p>&lt;script&gt;alert("abc")&lt;/script&gt; has sent you a message.</p>
```

Outro uso é i18n (internacionalização):

```javascript
i18n`Welcome to ${siteName}, you are visitor number ${visitorNumber}!`
// "Bem-vindo a xxx, você é o visitante número xxxx!"
```

Template strings sozinhas não substituem completamente bibliotecas como Mustache por falta de condicionais e loops, mas com funções tag é possível adicionar esses recursos.

```javascript
// hashTemplate abaixo é um processador de template customizado
let libraryHtml = hashTemplate`
  <ul>
    #for book in ${myBooks}
      <li><i>#{book.title}</i> by #{book.author}</li>
    #end
  </ul>
`;
```

É possível usar template tags para incorporar outras linguagens dentro do JavaScript.

```javascript
jsx`
  <div>
    <input
      ref='input'
      onChange='${this.handleChange}'
      defaultValue='${this.state.value}' />
      ${this.state.value}
   </div>
`
```

O código acima usa a função `jsx` para converter uma string DOM em objeto React. A [implementação](https://gist.github.com/lygaret/a68220defa69174bdec5) está no GitHub.

Exemplo hipotético de execução de código Java via função `java`:

```javascript
java`
class HelloWorldApp {
  public static void main(String[] args) {
    System.out.println("Hello World!"); // Display the string.
  }
}
`
HelloWorldApp.main();
```

O primeiro parâmetro (o array da template string) da função tag também tem uma propriedade `raw`.

```javascript
console.log`123`
// ["123", raw: Array[1]]
```

Aqui `console.log` recebe um array. Esse array tem a propriedade `raw` com as strings originais escapadas.

Exemplo:

```javascript
tag`First line\nSecond line`

function tag(strings) {
  console.log(strings.raw[0]);
  // strings.raw[0] é "First line\\nSecond line"
  // imprime "First line\nSecond line"
}
```

O argumento `strings` tem a propriedade `raw`, também um array. Seus membros correspondem a `strings`, mas com barras invertidas escapadas. Por exemplo, se `strings` for `["First line\nSecond line"]`, `strings.raw` será `["First line\\nSecond line"]`. A única diferença é o escape: em `raw`, `\n` é tratado como `\` e `n`, não como quebra de linha. Isso permite obter o conteúdo original da template.

## Limitações de Template Strings

Template tags podem incorporar outras linguagens, mas template strings escapam certas sequências por padrão, o que pode dificultar a incorporação.

Por exemplo, LaTeX pode ser incorporado em um template tag:

```javascript
function latex(strings) {
  // ...
}

let document = latex`
\newcommand{\fun}{\textbf{Fun!}}  // funciona
\newcommand{\unicode}{\textbf{Unicode!}} // erro
\newcommand{\xerxes}{\textbf{King!}} // erro

Breve over the h goes \u{h}ere // erro
`
```

O conteúdo é LaTeX válido, mas o motor JavaScript lança erro. A causa é o escape de strings: template strings tratam `\u00FF` e `\u{42}` como escapes Unicode, então `\unicode` falha; e `\x56` é tratado como escape hexadecimal, então `\xerxes` falha. Em LaTeX, `\u` e `\x` têm significado especial, mas o JavaScript os escapa.

Para lidar com isso, o ES2018 [flexibilizou](https://tc39.github.io/proposal-template-literal-revision/) as regras de escape em template tags. Escapes inválidos não lançam mais erro; em vez disso retornam `undefined`, e a string original pode ser lida da propriedade `raw`.

```javascript
function tag(strs) {
  strs[0] === undefined
  strs.raw[0] === "\\unicode and \\u{55}";
}
tag`\unicode and \u{55}`
```

Aqui, a template normalmente lançaria erro, mas com as regras flexibilizadas não lança. O motor define o primeiro elemento como `undefined`, enquanto `raw` ainda fornece a string original, permitindo que a tag a processe.

Nota: essa flexibilização vale apenas quando uma tag processa a template. Em template strings comuns, escapes inválidos ainda lançam erro.

```javascript
let bad = `bad escape sequence: \unicode`; // lança erro
```
