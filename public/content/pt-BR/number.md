# Extensões de Números

## Literais Binários e Octais

O ES6 adiciona novas formas de literal para números binários e octais, usando os prefixos `0b` (ou `0B`) e `0o` (ou `0O`).

```javascript
0b111110111 === 503 // true
0o767 === 503 // true
```

Desde o modo estrito do ES5, octal não pode mais usar o prefixo `0`. O ES6 especifica que octal deve usar o prefixo `0o`.

```javascript
// modo não estrito
(function(){
  console.log(0o11 === 011);
})() // true

// modo estrito
(function(){
  'use strict';
  console.log(0o11 === 011);
})() // Uncaught SyntaxError: Octal literals are not allowed in strict mode.
```

Para converter literais binários ou octais em string para decimal, use `Number`:

```javascript
Number('0b111')  // 7
Number('0o10')  // 8
```

## Separadores Numéricos

Em muitas línguas, números longos usam um separador (geralmente vírgula) a cada três dígitos. O [ES2021](https://github.com/tc39/proposal-numeric-separator) permite ao JavaScript usar sublinhados (`_`) como separadores numéricos.

```javascript
let budget = 1_000_000_000_000;
budget === 10 ** 12 // true
```

O separador pode ser colocado em qualquer agrupamento de dígitos; não precisa ser a cada três.

```javascript
123_00 === 12_300 // true

12345_00 === 123_4500 // true
12345_00 === 1_234_500 // true
```

Decimais e notação científica também podem usar separadores:

```javascript
0.000_001

1e10_000
```

Regras:

- Não pode aparecer no início ou fim do número
- Não pode ter dois ou mais separadores consecutivos
- Não pode aparecer imediatamente antes ou depois do ponto decimal
- Não pode aparecer imediatamente antes ou depois de `e` ou `E` na notação científica

Estes são inválidos:

```javascript
3_.141
3._141
1_e12
1e_12
123__456
_1464301
1464301_
```

Outras bases (binário, hex, etc.) podem usar separadores:

```javascript
0b1010_0001_1000_0101
0xA0_B0_C0
```

Separadores não podem aparecer imediatamente após o prefixo de base (`0b`, `0B`, `0o`, `0O`, `0x`, `0X`):

```javascript
0_b111111000   // erro
0b_111111000   // erro
```

Separadores são apenas para legibilidade; não afetam armazenamento ou saída:

```javascript
let num = 12_345;

num // 12345
num.toString() // 12345
```

As funções que convertem strings em números não suportam separadores numéricos:

- `Number()`
- `parseInt()`
- `parseFloat()`

```javascript
Number('123_456') // NaN
parseInt('123_456') // 123
```

## Number.isFinite(), Number.isNaN()

O ES6 adiciona `Number.isFinite()` e `Number.isNaN()`.

`Number.isFinite()` verifica se um valor é um número finito (não `Infinity`):

```javascript
Number.isFinite(15); // true
Number.isFinite(0.8); // true
Number.isFinite(NaN); // false
Number.isFinite(Infinity); // false
Number.isFinite(-Infinity); // false
Number.isFinite('foo'); // false
Number.isFinite('15'); // false
Number.isFinite(true); // false
```

Se o argumento não for número, `Number.isFinite` retorna `false`.

`Number.isNaN()` verifica se um valor é `NaN`:

```javascript
Number.isNaN(NaN) // true
Number.isNaN(15) // false
Number.isNaN('15') // false
Number.isNaN(true) // false
Number.isNaN(9/NaN) // true
Number.isNaN('true' / 0) // true
Number.isNaN('true' / 'true') // true
```

Se o argumento não for `NaN`, `Number.isNaN` retorna `false`.

Diferença em relação aos globais `isFinite()` e `isNaN()`: as funções globais convertem valores não numéricos com `Number()` antes de verificar. `Number.isFinite` retorna `false` para não-números; `Number.isNaN` retorna `true` apenas para `NaN`.

```javascript
isFinite(25) // true
isFinite("25") // true
Number.isFinite(25) // true
Number.isFinite("25") // false

isNaN(NaN) // true
isNaN("NaN") // true
Number.isNaN(NaN) // true
Number.isNaN("NaN") // false
Number.isNaN(1) // false
```

## Number.parseInt(), Number.parseFloat()

O ES6 adiciona `Number.parseInt` e `Number.parseFloat`, delegando às funções globais. O comportamento é idêntico.

```javascript
Number.parseInt('12.34') // 12
Number.parseFloat('123.45#') // 123.45

Number.parseInt === parseInt // true
Number.parseFloat === parseFloat // true
```

## Number.isInteger()

`Number.isInteger()` verifica se um valor é inteiro:

```javascript
Number.isInteger(25) // true
Number.isInteger(25.1) // false
```

Em JavaScript, inteiros e floats usam o mesmo formato de armazenamento, então 25 e 25.0 são iguais:

```javascript
Number.isInteger(25) // true
Number.isInteger(25.0) // true
```

Valores não numéricos retornam `false`.

Devido ao IEEE 754, os números são armazenados em precisão dupla de 64 bits. Além de 53 bits significativos, os dígitos restantes são perdidos. Isso pode fazer `Number.isInteger` errar:

```javascript
Number.isInteger(3.0000000000000002) // true
```

Valores menores que `Number.MIN_VALUE` (5E-324) são arredondados para 0:

```javascript
Number.isInteger(5E-324) // false
Number.isInteger(5E-325) // true
```

Para requisitos de alta precisão, evite depender apenas de `Number.isInteger()`.

## Number.EPSILON

O ES6 adiciona `Number.EPSILON`, uma constante muito pequena. Representa a diferença entre 1 e o menor valor representável maior que 1.

Para floats de 64 bits, esse menor valor tem a forma `1.00..001` (51 zeros). Assim `Number.EPSILON` equivale a 2<sup>-52</sup>.

```javascript
Number.EPSILON === Math.pow(2, -52)
// true
Number.EPSILON.toFixed(20)
// "0.00000000000000022204"
```

`Number.EPSILON` pode definir uma margem de erro aceitável para comparações de floats:

```javascript
0.1 + 0.2
// 0.30000000000000004

0.1 + 0.2 === 0.3 // false
```

Verificação simples de tolerância:

```javascript
function withinErrorMargin(left, right) {
  return Math.abs(left - right) < Number.EPSILON * Math.pow(2, 2);
}

withinErrorMargin(0.1 + 0.2, 0.3) // true
withinErrorMargin(1.1 + 1.3, 2.4) // true
```

## Inteiros Seguros e Number.isSafeInteger()

O JavaScript pode representar exatamente inteiros no intervalo de -(2<sup>53</sup>) a 2<sup>53</sup> (exclusive). Fora desse intervalo, a precisão é perdida.

```javascript
Math.pow(2, 53) === Math.pow(2, 53) + 1
// true
```

O ES6 adiciona `Number.MAX_SAFE_INTEGER` e `Number.MIN_SAFE_INTEGER` para esses limites.

`Number.isSafeInteger()` verifica se um inteiro está dentro desse intervalo.

Ao validar aritmética, verifique operandos e resultado, não apenas o resultado:

```javascript
Number.isSafeInteger(9007199254740993 - 990) // true
9007199254740993 - 990
// 9007199254740002 (incorreto; correto é 9007199254740003)
```

Como `9007199254740993` excede o intervalo seguro, é armazenado como `9007199254740992`, então a subtração já está errada. Abordagem mais segura:

```javascript
function trusty(left, right, result) {
  if (
    Number.isSafeInteger(left) &&
    Number.isSafeInteger(right) &&
    Number.isSafeInteger(result)
  ) {
    return result;
  }
  throw new RangeError('Operation cannot be trusted!');
}
```

## Extensões de Math

O ES6 adiciona 17 novos métodos estáticos a `Math`.

### Math.trunc()

`Math.trunc` remove a parte fracionária e retorna a parte inteira:

```javascript
Math.trunc(4.1) // 4
Math.trunc(4.9) // 4
Math.trunc(-4.1) // -4
Math.trunc(-4.9) // -4
Math.trunc(-0.1234) // -0
```

Valores não numéricos são convertidos via `Number`:

```javascript
Math.trunc('123.456') // 123
Math.trunc(true) // 1
Math.trunc(false) // 0
Math.trunc(null) // 0
```

Para valores vazios ou não numéricos, retorna `NaN`:

```javascript
Math.trunc(NaN);      // NaN
Math.trunc('foo');    // NaN
Math.trunc();         // NaN
Math.trunc(undefined) // NaN
```

Polyfill simples:

```javascript
Math.trunc = Math.trunc || function(x) {
  return x < 0 ? Math.ceil(x) : Math.floor(x);
};
```

### Math.sign()

`Math.sign` retorna o sinal de um número:

- Positivo: `+1`
- Negativo: `-1`
- Zero: `0`
- Zero negativo: `-0`
- Caso contrário: `NaN`

```javascript
Math.sign(-5) // -1
Math.sign(5) // +1
Math.sign(0) // +0
Math.sign(-0) // -0
Math.sign(NaN) // NaN
```

Para valores não numéricos, converte primeiro:

```javascript
Math.sign('')  // 0
Math.sign(true)  // +1
Math.sign(false)  // 0
Math.sign(null)  // 0
Math.sign('9')  // +1
Math.sign('foo')  // NaN
Math.sign()  // NaN
Math.sign(undefined)  // NaN
```

Polyfill simples:

```javascript
Math.sign = Math.sign || function(x) {
  x = +x;
  if (x === 0 || isNaN(x)) {
    return x;
  }
  return x > 0 ? 1 : -1;
};
```

### Math.cbrt()

`Math.cbrt()` retorna a raiz cúbica:

```javascript
Math.cbrt(-1) // -1
Math.cbrt(0)  // 0
Math.cbrt(1)  // 1
Math.cbrt(2)  // 1.2599210498948732
```

Valores não numéricos são convertidos. Polyfill simples:

```javascript
Math.cbrt = Math.cbrt || function(x) {
  var y = Math.pow(Math.abs(x), 1/3);
  return x < 0 ? -y : y;
};
```

### Math.clz32()

`Math.clz32()` converte o argumento para inteiro não assinado de 32 bits e retorna a contagem de bits zero à esquerda:

```javascript
Math.clz32(0) // 32
Math.clz32(1) // 31
Math.clz32(1000) // 22
Math.clz32(0b01000000000000000000000000000000) // 1
```

O nome vem de "count leading zero bits in 32-bit binary representation". Relaciona-se ao operador de deslocamento à esquerda.

### Math.imul()

`Math.imul` retorna o produto de dois números como inteiro assinado de 32 bits:

```javascript
Math.imul(2, 4)   // 8
Math.imul(-1, 8)  // -8
Math.imul(-2, -2) // 4
```

Na maioria dos casos, comporta-se como `(a * b)|0`. Importa ao multiplicar números muito grandes: o JavaScript tem precisão limitada e `Math.imul` retorna os 32 bits inferiores corretos quando o produto excede 2<sup>53</sup>.

### Math.fround()

`Math.fround` retorna a forma de float de precisão simples de 32 bits do argumento. Para inteiros no intervalo de -2<sup>24</sup> a 2<sup>24</sup> (exclusive), o resultado iguala o argumento. Além disso, a precisão é perdida.

### Math.hypot()

`Math.hypot` retorna a raiz quadrada da soma dos quadrados dos argumentos:

```javascript
Math.hypot(3, 4) // 5
```

### Math.f16round()

O ES2025 adiciona `Math.f16round()`, que retorna o float de meia precisão de 16 bits mais próximo:

```javascript
Math.f16round(5) // 5
Math.f16round(5.05) // 5.05078125
```

Floats de 16 bits usam 5 bits para expoente, 1 para sinal e 10 para mantissa, então podem representar valores até cerca de ±65.504. Valores além disso retornam `Infinity`.

### Métodos de Logaritmo

- `Math.expm1(x)`: retorna e<sup>x</sup> - 1
- `Math.log1p(x)`: retorna ln(1 + x); retorna NaN se x < -1
- `Math.log10(x)`: logaritmo na base 10
- `Math.log2(x)`: logaritmo na base 2

### Funções Hiperbólicas

- `Math.sinh(x)`, `Math.cosh(x)`, `Math.tanh(x)`
- `Math.asinh(x)`, `Math.acosh(x)`, `Math.atanh(x)`

## BigInt

### Introdução

Números em JavaScript são floats de 64 bits. Isso limita a precisão (53 bits) e a magnitude máxima (2<sup>1024</sup> retorna `Infinity`). O [ES2020](https://github.com/tc39/proposal-bigint) adiciona `BigInt` para inteiros de precisão arbitrária.

```javascript
const a = 2172141653n;
const b = 15346349309n;

a * b // 33334444555566667777n

Number(a) * Number(b) // 33334444555566670000
```

Literais BigInt usam o sufixo `n`:

```javascript
1234n
0b1101n
0o777n
0xFFn
```

BigInt e Number são tipos diferentes:

```javascript
42n === 42 // false
typeof 123n // 'bigint'
```

BigInt pode ser negativo com `-`, mas não com `+` (para evitar conflito com asm.js).

### BigInt()

`BigInt()` converte valores para BigInt. As regras são semelhantes a `Number()`, mas BigInt não aceita decimais nem `NaN`/`Infinity`:

```javascript
BigInt(123) // 123n
BigInt('123') // 123n
BigInt(1.5) // RangeError
```

Métodos estáticos:

- `BigInt.asUintN(width, bigint)`: valor módulo 2<sup>width</sup>
- `BigInt.asIntN(width, bigint)`: valor assinado em `-2<sup>width-1</sup>` a `2<sup>width-1</sup> - 1`

### Conversão

Use `Boolean()`, `Number()` e `String()` para converter BigInt. Nota: `Number(bigint)` pode perder precisão para valores grandes.

### Aritmética

BigInt suporta `+`, `-`, `*`, `/`, `**`. A divisão trunca (sem parte fracionária).

`>>>` e unário `+` não são suportados para BigInt.

BigInt e Number não podem ser misturados em aritmética; converta explicitamente:

```javascript
1n + 1.3 // erro
Math.sqrt(4n) // erro
Math.sqrt(Number(4n)) // 2
```

### Comparações

Comparação e igualdade fraca permitem misturar BigInt e Number:

```javascript
0n < 1 // true
0n == 0 // true
0n === 0 // false
```
