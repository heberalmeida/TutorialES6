# ArrayBuffer

Os objetos `ArrayBuffer`, as views `TypedArray` e a view `DataView` formam a interface JavaScript para manipular dados binários. Esses objetos existem há bastante tempo como parte de uma especificação separada (publicada em fevereiro de 2011); o ES6 os incorporou à especificação ECMAScript e adicionou novos métodos. Todos manipulam dados binários usando sintaxe de array, por isso são chamados coletivamente de arrays tipados.

O objetivo original dessa interface estava relacionado ao projeto WebGL. WebGL é a interface de comunicação entre o navegador e a GPU. Para suportar grandes volumes de troca de dados em tempo real entre JavaScript e a GPU, essa comunicação precisa ser binária, não em formato de texto tradicional. Transmitir um inteiro de 32 bits em formato de texto exige que tanto o script JavaScript quanto a GPU convertam o formato, o que é muito custoso. Se houvesse um mecanismo para operar bytes diretamente (como em C), enviar um inteiro de 32 bits em 4 bytes inalterado em formato binário para a GPU melhoraria bastante o desempenho do script.

Os arrays tipados surgiram nesse contexto. Assemelham-se aos arrays em C, permitindo que o desenvolvedor opere a memória diretamente usando subscrito de array, aumentando significativamente a capacidade do JavaScript de processar dados binários e possibilitando a comunicação com interfaces nativas do sistema operacional via JavaScript.

Os arrays tipados consistem em três tipos de objetos.

**(1) Objeto `ArrayBuffer`**: Representa um bloco de dados binários na memória que pode ser manipulado através de "views". As views implementam a interface de array, ou seja, a memória pode ser operada com métodos de array.

**(2) Views `TypedArray`**: Total de 9 tipos de view, incluindo `Uint8Array` (inteiro sem sinal de 8 bits), `Int16Array` (inteiro de 16 bits), `Float32Array` (ponto flutuante de 32 bits), etc.

**(3) View `DataView`**: Permite views de formato composto personalizadas. Por exemplo, o primeiro byte pode ser Uint8, os bytes 2–3 podem ser Int16, a partir do quarto byte pode ser Float32, etc. A ordem dos bytes também pode ser personalizada.

Em resumo: o objeto `ArrayBuffer` representa dados binários brutos; as views `TypedArray` leem e escrevem tipos simples de dados binários; a view `DataView` lê e escreve tipos complexos.

As views `TypedArray` suportam 12 tipos de dados.

| Tipo de dados | Tamanho em bytes | Significado | Tipo C correspondente |
| ------------- | ---------------- | ----------- | --------------------- |
| Int8 | 1 | Inteiro com sinal de 8 bits | signed char |
| Uint8 | 1 | Inteiro sem sinal de 8 bits | unsigned char |
| Uint8C | 1 | Inteiro sem sinal de 8 bits (clamp em overflow) | unsigned char |
| Int16 | 2 | Inteiro com sinal de 16 bits | short |
| Uint16 | 2 | Inteiro sem sinal de 16 bits | unsigned short |
| Int32 | 4 | Inteiro com sinal de 32 bits | int |
| Uint32 | 4 | Inteiro sem sinal de 32 bits | unsigned int |
| BigInt64 | 8 | Inteiro com sinal de 64 bits |   |
| BigUint64 | 8 | Inteiro sem sinal de 64 bits |   |
| Float16 | 2 | Ponto flutuante de 16 bits |   |
| Float32 | 4 | Ponto flutuante de 32 bits | float |
| Float64 | 8 | Ponto flutuante de 64 bits | double |

Os arrays tipados não são arrays reais; são objetos tipo array.

Várias APIs web usam arrays tipados para manipular dados binários. Alguns exemplos:

- [Canvas](#canvas)
- [Fetch API](#fetch-api)
- [File API](#file-api)
- [WebSockets](#websocket)
- [XMLHttpRequest](#ajax)

## Objeto ArrayBuffer

### Visão geral

O objeto `ArrayBuffer` representa um bloco de memória que armazena dados binários. Não pode ser lido nem escrito diretamente; o acesso é feito através de views (views `TypedArray` ou `DataView`), que interpretam os dados em um formato definido.

`ArrayBuffer` também é um construtor usado para alocar uma região contígua de memória.

```javascript
const buf = new ArrayBuffer(32);
```

O código acima cria uma região de 32 bytes, com cada byte em 0 por padrão. O construtor `ArrayBuffer` recebe o tamanho desejado em bytes como argumento.

Para ler ou escrever, é preciso criar uma view. A view `DataView` exige uma instância de `ArrayBuffer` como argumento.

```javascript
const buf = new ArrayBuffer(32);
const dataView = new DataView(buf);
dataView.getUint8(0) // 0
```

O código cria uma `DataView` sobre 32 bytes e lê os primeiros 8 bits como inteiro sem sinal de 8 bits, que é 0 porque o padrão de cada bit no `ArrayBuffer` é 0.

Diferente da `DataView`, `TypedArray` não é um único construtor, mas um conjunto de construtores para diferentes formatos.

```javascript
const buffer = new ArrayBuffer(12);

const x1 = new Int32Array(buffer);
x1[0] = 1;
const x2 = new Uint8Array(buffer);
x2[0]  = 2;

x1[0] // 2
```

São criadas duas views sobre a mesma memória: uma de inteiro com sinal de 32 bits e outra sem sinal de 8 bits. Alterações em uma afetam a outra.

Os construtores `TypedArray` também podem receber arrays comuns; nesse caso, alocam memória e preenchem em um passo.

```javascript
const typedArray = new Uint8Array([0,1,2]);
typedArray.length // 3

typedArray[0] = 5;
typedArray // [5, 1, 2]
```

### ArrayBuffer.prototype.byteLength

A propriedade `byteLength` retorna o tamanho em bytes da região alocada.

```javascript
const buffer = new ArrayBuffer(32);
buffer.byteLength
// 32
```

Alocações grandes podem falhar por falta de memória contígua, então vale verificar o sucesso.

```javascript
if (buffer.byteLength === n) {
  // success
} else {
  // failure
}
```

### ArrayBuffer.prototype.slice()

O método `slice` copia uma parte da memória e retorna um novo `ArrayBuffer`.

```javascript
const buffer = new ArrayBuffer(8);
const newBuffer = buffer.slice(0, 3);
```

Copia os 3 primeiros bytes (de 0 inclusive até 3 exclusive). O `slice` aloca memória nova e copia os bytes.

`slice` recebe o índice de início (inclusive) e de fim (exclusive). Se o segundo argumento for omitido, vai até o final.

### ArrayBuffer.isView()

O método estático `isView` retorna um booleano indicando se o argumento é uma view de `ArrayBuffer` (ou seja, `TypedArray` ou `DataView`).

```javascript
const buffer = new ArrayBuffer(8);
ArrayBuffer.isView(buffer) // false

const v = new Int32Array(buffer);
ArrayBuffer.isView(v) // true
```

## Views TypedArray

### Visão geral

O `ArrayBuffer` pode armazenar vários tipos. A mesma memória pode ser interpretada de formas diferentes; essa interpretação é a "view". Existem views `TypedArray` e `DataView`. Nas `TypedArray`, todos os elementos têm o mesmo tipo; na `DataView` podem ter tipos diferentes.

Há 12 tipos de view `TypedArray`:

- **`Int8Array`**: 8 bits com sinal, 1 byte
- **`Uint8Array`**: 8 bits sem sinal, 1 byte
- **`Uint8ClampedArray`**: 8 bits sem sinal, 1 byte, com clamp de overflow
- **`Int16Array`**: 16 bits com sinal, 2 bytes
- **`Uint16Array`**: 16 bits sem sinal, 2 bytes
- **`Int32Array`**: 32 bits com sinal, 4 bytes
- **`Uint32Array`**: 32 bits sem sinal, 4 bytes
- **`BigInt64Array`**: 64 bits com sinal, 8 bytes
- **`BigUint64Array`**: 64 bits sem sinal, 8 bytes
- **`Float16Array`**: 16 bits, 2 bytes
- **`Float32Array`**: 32 bits, 4 bytes
- **`Float64Array`**: 64 bits, 8 bytes

Diferenças principais em relação a arrays normais:

- Todos os elementos têm o mesmo tipo
- Elementos contíguos, sem buracos
- Padrão 0
- São só views; os dados ficam no `ArrayBuffer` subjacente, acessível por `buffer`

### Construtores

**(1)TypedArray(buffer, byteOffset=0, length?)**

Várias views podem ser criadas sobre o mesmo `ArrayBuffer`.

```javascript
// Criar ArrayBuffer de 8 bytes
const b = new ArrayBuffer(8);

// Criar vista Int32 de b, byte 0 ao fim
const v1 = new Int32Array(b);

// Criar vista Uint8 de b, byte 2 ao fim
const v2 = new Uint8Array(b, 2);

// Criar vista Int16 de b, byte 2, comprimento 2
const v3 = new Int16Array(b, 2, 2);
```

O código acima cria três views (`v1`, `v2` e `v3`) sobre 8 bytes de memória (`b`).

Os construtores de view aceitam três parâmetros:

- Primeiro (obrigatório): o objeto `ArrayBuffer` subjacente.
- Segundo (opcional): o deslocamento em bytes onde a view começa; padrão 0.
- Terceiro (opcional): o número de elementos da view; padrão até o fim do buffer.

Assim, `v1`, `v2` e `v3` se sobrepõem: `v1[0]` é um inteiro de 32 bits cobrindo bytes 0–3; `v2[0]` é um inteiro sem sinal de 8 bits no byte 2; `v3[0]` é um inteiro de 16 bits cobrindo bytes 2–3. Alterações em uma view aparecem nas outras.

O `byteOffset` deve ser alinhado ao tamanho do elemento; caso contrário um erro é lançado.

```javascript
const buffer = new ArrayBuffer(8);
const i16 = new Int16Array(buffer, 1);
// Uncaught RangeError: start offset of Int16Array should be a multiple of 2
```

O código acima tenta criar uma view de inteiro de 16 bits a partir do byte 1, o que lança erro porque inteiros de 16 bits exigem alinhamento de 2 bytes. Para interpretar um `ArrayBuffer` em limites arbitrários de bytes, use a view `DataView`.

**(2)TypedArray(length)**

Cria a view alocando memória diretamente.

```javascript
const f64a = new Float64Array(8);
f64a[0] = 10;
f64a[1] = 20;
f64a[2] = f64a[0] + f64a[1];
```

**(3)TypedArray(typedArray)**

Um construtor TypedArray pode aceitar outra instância `TypedArray` como argumento.

```javascript
const typedArray = new Int8Array(new Uint8Array(4));
```

O novo array copia os valores; a memória subjacente é diferente. Para compartilhar o mesmo buffer, use `x.buffer`:

```javascript
const x = new Int8Array([1, 1]);
const y = new Int8Array(x.buffer);
x[0] = 2;
y[0] // 2
```

**(4)TypedArray(arrayLikeObject)**

Aceita array comum e cria a TypedArray preenchendo os dados. A TypedArray aloca nova memória; não cria view sobre o array original.

TypedArrays podem ser convertidas de volta para arrays comuns:

```javascript
const normalArray = [...typedArray];
// ou
const normalArray = Array.from(typedArray);
```

### Métodos de array

Os mesmos métodos e propriedades de arrays comuns se aplicam. TypedArray não tem `concat`; para concatenar, use:

```javascript
function concatenate(resultConstructor, ...arrays) {
  let totalLength = 0;
  for (let arr of arrays) {
    totalLength += arr.length;
  }
  let result = new resultConstructor(totalLength);
  let offset = 0;
  for (let arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

concatenate(Uint8Array, Uint8Array.of(1, 2), Uint8Array.of(3, 4))
// Uint8Array [1, 2, 3, 4]
```

TypedArrays implementam a interface Iterator e podem ser iteradas com `for...of`.

### Ordem dos bytes (byte order)

Em little-endian (x86), o byte menos significativo vem primeiro. TypedArrays usam a ordem do host. Big-endian ainda é comum em dispositivos de rede; para dados big-endian, use `DataView`, que permite especificar a ordem.

### BYTES_PER_ELEMENT

Cada construtor tem a propriedade `BYTES_PER_ELEMENT` indicando quantos bytes por elemento.

```javascript
Int8Array.BYTES_PER_ELEMENT // 1
Uint8Array.BYTES_PER_ELEMENT // 1
Int16Array.BYTES_PER_ELEMENT // 2
Float32Array.BYTES_PER_ELEMENT // 4
Float64Array.BYTES_PER_ELEMENT // 8
```

### Conversão ArrayBuffer e string

Use `TextEncoder` e `TextDecoder` para converter entre `ArrayBuffer` e string. O segundo parâmetro `outputEncoding` de `ab2str()` especifica a codificação de saída (padrão `utf-8`).

### Overflow

Valores fora do intervalo causam overflow. A regra típica descarta os bits excedentes e interpreta conforme o tipo da view. `Uint8ClampedArray` usa regras diferentes: em overflow positivo retorna 255, em negativo retorna 0.

```javascript
const uint8 = new Uint8Array(1);
uint8[0] = 256;
uint8[0] // 0

const uint8c = new Uint8ClampedArray(1);
uint8c[0] = 256;
uint8c[0] // 255
```

### Propriedades e métodos importantes

- **`TypedArray.prototype.buffer`**: ArrayBuffer subjacente (somente leitura)
- **`byteLength`**, **`byteOffset`**: tamanho em bytes e deslocamento no ArrayBuffer
- **`length`**: número de elementos (diferente de `byteLength`)
- **`set()`**: copia dados de array ou outra TypedArray
- **`subarray(start, end)`**: cria nova view sobre parte do array
- **`slice()`**: retorna cópia como nova TypedArray
- **`TypedArray.of()`**, **`TypedArray.from()`**: criam TypedArray a partir de argumentos ou iterável

## Composite Views

Como os construtores de view permitem posição inicial e comprimento, diferentes tipos podem ser organizados sequencialmente na mesma memória:

```javascript
const buffer = new ArrayBuffer(24);

const idView = new Uint32Array(buffer, 0, 1);
const usernameView = new Uint8Array(buffer, 4, 16);
const amountDueView = new Float32Array(buffer, 20, 1);
```

## DataView

Para dados que misturam vários tipos (ex.: respostas HTTP), use a view `DataView`. Ela oferece mais controle e suporta ordem de bytes configurável. Os métodos `get` e `set` aceitam um segundo parâmetro opcional: `true` para little-endian, `false` ou `undefined` para big-endian.

## Aplicações

- **AJAX**: `responseType: 'arraybuffer'`
- **Canvas**: `imageData.data` é `Uint8ClampedArray`
- **WebSocket**: `binaryType: 'arraybuffer'`
- **Fetch API**: `response.arrayBuffer()`
- **File API**: `reader.readAsArrayBuffer(file)`

## SharedArrayBuffer

ES2017 introduz `SharedArrayBuffer`, permitindo que a thread principal e workers compartilhem memória. A API é igual à do `ArrayBuffer`.

## Atomics

O objeto `Atomics` garante operações atômicas e sincronização entre threads:

- **`Atomics.store()`**, **`Atomics.load()`**: escrita e leitura atômicas; evitam reordenação de instruções
- **`Atomics.exchange()`**: troca valor e retorna o anterior
- **`Atomics.wait()`**, **`Atomics.notify()`**: sincronização tipo wait/notify; evite `wait` na thread principal
- **Métodos aritméticos**: `add`, `sub`, `and`, `or`, `xor` — use `Atomics.add(ia, 112, 1)` em vez de `ia[112]++`
- **`Atomics.compareExchange()`**: operação compare-and-swap para read-modify-write seguro
- **`Atomics.isLockFree(size)`**: indica se o tamanho suporta locking implícito
