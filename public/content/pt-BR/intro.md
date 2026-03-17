# Introdução ao ECMAScript 6

ECMAScript 6.0 (doravante denominado ES6) é o padrão de próxima geração da linguagem JavaScript, lançado oficialmente em junho de 2015. Seu objetivo é tornar o JavaScript adequado para escrita de aplicações complexas e em larga escala e consolidá-lo como linguagem de desenvolvimento em nível empresarial.

## A Relação Entre ECMAScript e JavaScript

Uma pergunta comum é: qual é exatamente a relação entre ECMAScript e JavaScript?

Para responder isso de forma clara, precisamos olhar para a história. Em novembro de 1996, a Netscape, criadora do JavaScript, decidiu submeter o JavaScript à organização de padronização ECMA, na esperança de que a linguagem se tornasse um padrão internacional. No ano seguinte, a ECMA publicou a primeira edição do documento padrão 262 (ECMA-262), que definia o padrão para linguagens de script de navegador e chamava essa linguagem de ECMAScript—essa versão era a 1.0.

Desde o início, o padrão foi criado para a linguagem JavaScript, mas há dois motivos pelos quais não foi chamado JavaScript. Primeiro, marca: Java é marca registrada da Sun Microsystems e, pelo acordo de licenciamento, só a Netscape podia usar legalmente o nome JavaScript, que a Netscape também registrou como marca. Segundo, o nome deveria indicar que a linguagem foi definida pela ECMA, não pela Netscape, ajudando a garantir sua abertura e neutralidade.

Portanto, a relação entre ECMAScript e JavaScript é: o primeiro é a especificação, o segundo é uma implementação do primeiro (outros dialetos ECMAScript incluem JScript e ActionScript). No dia a dia, os dois termos são intercambiáveis.

## A Relação Entre ES6 e ECMAScript 2015

O termo ECMAScript 2015 (ES2015 abreviado) também é comum. Qual é sua relação com ES6?

Após o lançamento do ECMAScript 5.1 em 2011, o trabalho na versão 6.0 começou. Então, originalmente, ES6 significava simplesmente a próxima versão da linguagem JavaScript.

Porém, como essa versão introduziu muitas funcionalidades de sintaxe novas e muitas organizações e pessoas continuaram propondo mais durante a elaboração, logo ficou claro que uma única versão não poderia incluir tudo planejado. O caminho habitual seria lançar primeiro a 6.0, depois 6.1, 6.2, 6.3 e assim por diante.

O comitê de padrões não queria fazer isso. Queriam que a padronização seguisse um processo regular: qualquer pessoa poderia propor novas sintaxes ao comitê a qualquer momento, e o comitê se reuniria mensalmente para avaliar se as propostas poderiam ser aceitas e quais melhorias eram necessárias. Após reuniões suficientes, propostas maduras poderiam entrar oficialmente no padrão. Ou seja, o padrão seria atualizado de forma contínua, com mudanças todo mês.

O comitê decidiu então publicar o padrão formalmente uma vez por ano, em junho, como a versão oficial daquele ano. O trabalho continuaria naquela versão até o próximo junho, quando o rascunho se tornaria o lançamento do ano seguinte. Isso tornou os números de versão antigos desnecessários—os anos poderiam ser usados como marcadores.

A primeira release do ES6 foi publicada em junho de 2015 como o *ECMAScript 2015 Standard* (ES2015). Em junho de 2016, uma revisão menor, o *ECMAScript 2016 Standard* (ES2016), foi lançado conforme planejado; pode ser visto como ES6.1 porque as diferenças são bem pequenas (apenas o método `includes` das instâncias de array e o operador de exponenciação foram adicionados). ES2017 foi planejado para junho de 2017.

Assim, ES6 é tanto um termo histórico quanto genérico, significando a próxima geração do JavaScript após 5.1, cobrindo ES2015, ES2016, ES2017 e assim por diante. ES2015 é o nome oficial do padrão da linguagem lançado naquele ano. Neste livro, ES6 geralmente se refere ao padrão ES2015, mas às vezes à “próxima geração do JavaScript” em geral.

## Processo de Aprovação de Propostas de Sintaxe

Qualquer pessoa pode propor mudanças no padrão da linguagem ao comitê de padrões (também conhecido como comitê TC39).

Uma nova sintaxe passa por cinco estágios antes de entrar no padrão formal. Cada mudança de estágio precisa ser aprovada pelo comitê TC39.

- Stage 0 - Strawman (estágio de apresentação)
- Stage 1 - Proposal (estágio de coleta de opiniões)
- Stage 2 - Draft (estágio de rascunho)
- Stage 3 - Candidate (estágio de candidato)
- Stage 4 - Finished (estágio final)

Assim que uma proposta atinge o Stage 2, é provável que seja incluída em um padrão futuro. As propostas atuais do ECMAScript podem ser encontradas em [GitHub.com/tc39/ecma262](https://github.com/tc39/ecma262).

Um dos objetivos deste livro é acompanhar os últimos desenvolvimentos do ECMAScript e apresentar todas as novas sintaxes após a versão 5.1. Novas sintaxes que estejam claramente ou muito provavelmente padronizadas serão abordadas.

## História do ECMAScript

O ES6 levou 15 anos do início do processo até seu lançamento final.

ECMAScript 1.0 foi lançado em 1997. Nos dois anos seguintes vieram ECMAScript 2.0 (junho de 1998) e ECMAScript 3.0 (dezembro de 1999). A versão 3.0 foi um grande sucesso, amplamente adotada e tornando-se o padrão comum. Ela estabeleceu a sintaxe básica do JavaScript, totalmente herdada pelas versões posteriores. Até hoje, iniciantes em JavaScript estão essencialmente aprendendo a sintaxe da 3.0.

Em 2000, o ECMAScript 4.0 começou a tomar forma. Essa versão nunca foi finalizada, mas muito de seu conteúdo foi herdado pelo ES6. Então o ponto de partida do ES6 é de fato 2000.

Por que o ES4 não passou? Porque era muito radical, fazendo atualizações amplas em relação ao ES3 que alguns membros do comitê não aceitavam. O Technical Committee 39 (TC39) da ECMA é responsável pelo padrão ECMAScript; seus membros incluem Microsoft, Mozilla, Google e outras grandes empresas.

Em outubro de 2007, o rascunho do ECMAScript 4.0 foi lançado, com previsão de versão formal em agosto de 2008. Mas houve desacordos sérios sobre sua adoção. Grandes empresas lideradas por Yahoo, Microsoft e Google se opuseram a grandes mudanças no JavaScript e preferiam alterações menores. A Mozilla, liderada pelo criador do JavaScript Brendan Eich, insistia no rascunho atual.

Em julho de 2008, os desacordos sobre o que incluir na próxima versão foram tão intensos que a ECMA decidiu interromper o desenvolvimento do ECMAScript 4.0. O conjunto menor de melhorias em funcionalidades existentes foi lançado como ECMAScript 3.1, e as ideias mais radicais foram transferidas para versões futuras. Dado o clima da reunião, o codinome do projeto passou a ser Harmony. O ECMAScript 3.1 logo foi renomeado para ECMAScript 5.

Em dezembro de 2009, o ECMAScript 5.0 foi lançado formalmente. O projeto Harmony se dividiu em dois: ideias mais viáveis continuaram como JavaScript.next, depois ECMAScript 6; ideias menos maduras viraram JavaScript.next.next para o futuro distante. A visão do TC39 era que o ES5 manteria ampla compatibilidade com o ES3, com mudanças maiores de sintaxe e novas funcionalidades vindas em JavaScript.next. Na época, JavaScript.next significava ES6; após ES6, passou a significar ES7. O TC39 esperava que o ES5 se tornasse o padrão principal do JavaScript em meados de 2013 e permanecesse assim por cinco anos.

Em junho de 2011, o ECMAScript 5.1 foi lançado e se tornou padrão internacional ISO (ISO/IEC 16262:2011).

Em março de 2013, o rascunho do ECMAScript 6 foi congelado, sem adição de novas funcionalidades. Novas ideias iriam para o ECMAScript 7.

Em dezembro de 2013, o rascunho do ECMAScript 6 foi lançado, seguido de 12 meses de discussão e feedback.

Em junho de 2015, o ECMAScript 6 foi formalmente adotado como padrão internacional. Foram 15 anos desde 2000.

O suporte atual ao ES6 nos principais navegadores pode ser consultado em [https://compat-table.github.io/compat-table/es6/](https://compat-table.github.io/compat-table/es6/).

O Node.js é um runtime JavaScript para servidor. Seu suporte ao ES6 geralmente é maior. Além das funcionalidades habilitadas por padrão, algumas sintaxes estão implementadas mas desabilitadas por padrão. Você pode verificar a sintaxe experimental do Node com:

```bash
// Linux & Mac
$ node --v8-options | grep harmony

// Windows
$ node --v8-options | findstr harmony
```

## Transpilador Babel

O [Babel](https://babeljs.io/) é um transpilador ES6 amplamente usado que converte código ES6 para ES5 para rodar em navegadores antigos. Isso permite escrever em ES6 garantindo compatibilidade com ambientes existentes. Exemplo:

```javascript
// antes de transpilar
input.map(item => item + 1);

// depois de transpilar
input.map(function (item) {
  return item + 1;
});
```

O código original usa arrow functions; o Babel as converte em funções regulares para rodar em ambientes JavaScript que não suportam arrow functions.

Instale o Babel no seu projeto:

```bash
$ npm install --save-dev @babel/core
```

### Arquivo de Configuração `.babelrc`

O arquivo de configuração do Babel é o `.babelrc`, colocado na raiz do projeto. O primeiro passo para usar o Babel é configurar esse arquivo.

Use-o para definir regras de transpilação e plugins. Formato básico:

```javascript
{
  "presets": [],
  "plugins": []
}
```

O campo `presets` define as regras de transpilação. Você pode instalar estes presets oficiais conforme necessário:

```bash
# Regras mais recentes de transpilação
$ npm install --save-dev @babel/preset-env

# regras de transpilação react
$ npm install --save-dev @babel/preset-react
```

Depois, adicione esses presets ao `.babelrc`:

```javascript
  {
    "presets": [
      "@babel/env",
      "@babel/preset-react"
    ],
    "plugins": []
  }
```

Nota: todas as ferramentas e plugins do Babel exigem um `.babelrc` configurado antes do uso.

### Transpilação via Linha de Comando

O Babel fornece a ferramenta de linha de comando `@babel/cli` para transpilação.

Instale com:

```bash
$ npm install --save-dev @babel/cli
```

Uso básico:

```bash
# Saída para stdout
$ npx babel example.js

# Escrever saída em arquivo
# --out-file ou -o especifica o arquivo de saída
$ npx babel example.js --out-file compiled.js
# ou
$ npx babel example.js -o compiled.js

# Transpilar diretório inteiro
# --out-dir ou -d especifica o diretório de saída
$ npx babel src --out-dir lib
# ou
$ npx babel src -d lib

# -s gera arquivos source map
$ npx babel src -d lib -s
```

### babel-node

O comando `babel-node` do pacote `@babel/node` fornece um REPL que suporta ES6. Suporta todas as funcionalidades do REPL do Node e pode executar código ES6 diretamente.

Instale o módulo:

```bash
$ npm install --save-dev @babel/node
```

Depois, execute `babel-node` para entrar no REPL:

```bash
$ npx babel-node
> (x => x * 2)(1)
2
```

Você pode executar scripts ES6 diretamente com `babel-node`. Coloque o código acima em um arquivo `es6.js` e execute:

```bash
# código es6.js
# console.log((x => x * 2)(1));
$ npx babel-node es6.js
2
```

### Módulo @babel/register

O módulo `@babel/register` envolve o `require` com um hook. Depois de carregá-lo, qualquer `require` de arquivos `.js`, `.jsx`, `.es` ou `.es6` é transpilado pelo Babel primeiro.

```bash
$ npm install --save-dev @babel/register
```

Carregue o `@babel/register` primeiro ao usá-lo:

```bash
// index.js
require('@babel/register');
require('./es6.js');
```

Você não precisa mais transpilar o `index.js` manualmente:

```bash
$ node index.js
2
```

Nota: o `@babel/register` só transpila arquivos carregados via `require`, não o arquivo atual. Por transpilar sob demanda, é adequado apenas para desenvolvimento.

### polyfill

O Babel só transforma novas sintaxes JavaScript por padrão, não novas APIs. Objetos globais como `Iterator`, `Generator`, `Set`, `Map`, `Proxy`, `Reflect`, `Symbol`, `Promise`, e métodos em objetos globais (ex.: `Object.assign`) não são transpilados.

Por exemplo, o ES6 adicionou `Array.from` em `Array`. O Babel não transpila esse método. Para usá-lo, adicione um polyfill com `core-js` e `regenerator-runtime` (para transpilação de funções geradoras).

Instale:

```bash
$ npm install --save-dev core-js regenerator-runtime
```

Adicione estas linhas no início do seu script:

```javascript
import 'core-js';
import 'regenerator-runtime/runtime';
// ou
require('core-js');
require('regenerator-runtime/runtime');
```

O Babel deixa muitas APIs sem transpilação por padrão. Veja o [definitions.js](https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-runtime/src/runtime-corejs3-definitions.js) do `babel-plugin-transform-runtime` para a lista completa.

### Ambiente de Navegador

O Babel pode rodar no navegador usando a versão standalone de [@babel/standalone](https://babeljs.io/docs/en/next/babel-standalone.html). Adicione-a à sua página:

```html
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel">
// Seu código ES6
</script>
```

A transpilação em tempo real no navegador afeta o desempenho. Use scripts pré-transpilados em produção.

O Babel fornece um [REPL online](https://babeljs.io/repl/) para converter ES6 em ES5. A saída pode ser usada diretamente como ES5 na sua página.
