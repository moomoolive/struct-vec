## بسم الله الرحمن الرحيم

![CI Workflow](https://github.com/moomoolive/struct-vec/actions/workflows/node.js.yml/badge.svg)
[![Dependencies](https://img.shields.io/badge/%F0%9F%93%A6-0%20dependencies-green.svg)](https://shields.io/)
[![Bundle Size](https://img.shields.io/github/size/moomoolive/struct-vec/buildInfo/index.js.br)](https://shields.io/) 

# Struct Vec

### 🧰 Javascript array-like containers for multithreading

Efficiently communicating between js workers is a pain because you are forced either to pass data by [structured cloning](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) or represent your data as raw buffers. Structured cloning isn't ideal for performance because it requires de-serialization/serialization every time you pass a message, and raw buffers aren't ideal for productivity because they are esoteric and hard to work with.

This package attempts to solve this problem by allowing you to define data structures called `Vecs`. `Vecs` provide an API is similar to javascript `Arrays`, but are completely backed by `SharedArrayBuffers` - thus can be passed between workers at zero-cost, while still being intuitive to work with with. 

## Table of Contents

- [Examples](#examples)
  - [Quick Start](#quick-start)
  - [Initializing a Vec](#initializing-a-vec)
  - [Indexing](#indexing)
  - [Adding Elements](#adding-elements)
  - [Iterating](#iterating)
  - [Removing Elements](#removing-elements)
  - [Swapping Elements](#swapping-elements)
  - [Type Casting](#casting)
  - [Multithreading](#multithreading)
- [Requirements](#requirements)
- [Struct Definitions](#struct-definitions)
  - [Creating a Struct Definition](#creating-a-struct-definition)
  - [Default Struct Fields](#default-struct-fields)
  - [Supported Data Types](#data-types)
    - [f32](#f32)
    - [i32](#i32)
    - [bool](#bool)
    - [char](#char)
  - [Disallowed Field Names](#disallowed-field-names)
- [Compilers](#compilers)
  - [Runtime Compiler](#runtime-compiler)
  - [Build-time Compiler](#build-time-compiler)
- [Caveats](#caveats)
  - [Indexing does not Return Element](#indexing-does-not-return-element)
  - [Elements of a Vec are not Reference Types](#elements-of-a-vec-are-not-reference-types)
  - [Indexing out of Bounds](#indexing-out-of-bounds)
  - [Do Not Mutate Vec Length or Capacity during Multithreading](#do-not-mutate-vec-length-or-capacity-during-multithreading)
- [Performance Tips](#performance-tips)
  - [Adding Many Elements](#adding-many-elements)
  - [Removing Many Elements](#removing-many-elements)
  - [Avoid ES6 Iterators and Indexing](#avoid-es6-iterators-and-indexing)
  - [Avoid Using the "e" Field Except for Setting an Element](#avoid-using-the-e-field-except-for-setting-an-element)
- [Benchmarks](#benchmarks)
  - [Benchmarks Summary](#benchmarks-summary)
  - [Imperative Loop](#imperative-loop)
  - [ForEach Loop](#foreach-loop)
  - [ES6 Iterator Loop](#es6-iterator-loop)
  - [Parallel Loop](#parallel-loop)
  - [Pushing Elements](#pushing-elements)
- [API Reference](#api-reference)
  - [Vec](#module_vec-struct..Vec)
  - [validateStructDef](#module_vec-struct..validateStructDef)
  - [vec](#module_vec-struct..vec_gen)
  - [vecCompile](#module_vec-struct..vec_gencompile)

## Examples

### Quick Start

```js
import {vec} from "struct-vec"

// define the typing of elements in
// vec. Returns a class
const PositionV = vec({x: "f32", y: "f32", z: "f32"})

// initialize a vec
const positions = new PositionV()

// add some elements
for (let i = 0; i < 200; i++) {
  positions.push({x: 1, y: 2, z: 3})
}

console.log(positions.length) // output: 200

// loop over vec
for (let i = 0; i < positions.length; i++) {
  // get element with ".index" method
  const element = positions.index(i)
  console.log(element.x) // output: 1
  console.log(element.y) // output: 2
  console.log(element.z) // output: 3
}

positions.forEach(pos => {
    // use the ".e" method to get
    // the object representation
    // of your element
    console.log(pos.e) // output: {x: 1, y: 1, z: 1}
})

// remove elements
const allElements = positions.length
for (let i = 0; i < allElements; i++) {
  positions.pop()
}

console.log(positions.length) // output: 0
```

### Initializing a Vec

```js
import {vec} from "struct-vec"

// define what an element should look like 
// definitions are called "struct defs" 
const PositionV = vec({x: "f32", y: "f32", z: "f32"})

// you can initialize your vecs without any arguments
const noArg = new PositionV()

// Or you can specify how much capacity it initially has
// (check the api reference for more info on capacity)
const withCapacity = new PositionV(15_000)
console.log(withCapacity.capacity) // output: 15_000

// Or you can construct a vec from another vec's memory
const fromMemory = PositionV.fromMemory(withCapacity.memory)
console.log(fromMemory.capacity) // output: 15_000
```

### Indexing

Indexing into a vec (using the `index` method) is similar to calling `next` method on an iterator. Calling `myVec.index(0)` takes you to the first element but [doesn't actually return the element](#indexing-does-not-return-element).

If none of that makes sense just remember this, whenever you wish to operate on an element in a vec (get the value or set it), reference a specific field of the element NOT the entire element.

#### Getting Values at an Index

If you want the value of an element, refer to one of it's fields (`yourElement.x` for example) or reference the `e` field to get the entire element [by value](#elements-of-a-vec-are-not-reference-types) ([The `e` field is is auto-generated](#default-struct-fields) for all struct defs).

```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const positions = new PositionV()

positions.push({x: 1, y: 2, z: 3})

// 🛑 "wrongValue" doesn't equal {x: 1, y: 2, z: 3}
const wrongValue = positions.index(0)

// ✅ "correctValue" equals {x: 1, y: 2, z: 3}
const correctValue = positions.index(0).e
// ✅ "xValue" equals 1 
const xValue = positions.index(0).x
// ✅ "yValue" equals 2 
const yValue = positions.index(0).y
// ✅ "zValue" equals 3 
const zValue = positions.index(0).z
// ✅ also works
const {x, y, z} = positions.index(0)
// ✅ array destructuring is allowed as well
const [element] = positions
```

#### Setting Values at an Index

If you want to set the value of an element, refer to one of it's fields (`yourElement.x = 2` for example) or reference the `e` field to set the entire element([The `e` field is is auto-generated](#default-struct-fields) for all struct defs).

```js
import {vec} from "struct-vec"

const Cats = vec({
     cuteness: "i32",
     isDangerous: "bool", 
     emoji: "char"
})
const cats = new Cats()

cats.push({
     cuteness: 10_000, 
     isDangerous: false, 
     emoji: "😸"
})

// 🛑 does not work - throws error
cats.index(0) = {
     cuteness: 2_876, 
     isDangerous: true, 
     emoji: "😸"
}

// ✅ works
cats.index(0).e = {
     cuteness: 2_876, 
     isDangerous: true, 
     emoji: "😸"
}
// ✅ this is fine as well
cats.index(0).cuteness = 2_876
cats.index(0).isDangerous = true
cats.index(0).emoji = "😸"
```

### Adding Elements

```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const positions = new PositionV()

for (let i = 0; i < 100_000; i++) {
  // add elements
  positions.push({x: 1, y: 1, z: 1})
}

console.log(positions.index(0).e) // output: {x: 1, y: 1, z: 1}
console.log(positions.index(2_500).e) // output: {x: 1, y: 1, z: 1}
console.log(positions.length) // output: 100_000
```

### Iterating

#### Imperatively

```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const positions = new PositionV()

const positions = new PositionV(5_560).fill({x: 4, y: 3, z: 2})

for (let i = 0; i < positions.length; i++) {
  const element = positions.index(i)
  element.x = 20
  element.y = 5
  element.z = element.x + element.y
}

```

#### Iterators

Vecs support the majority of iterators that are found on javascript arrays. Check the [API Reference](#api-reference) for a full list of available iterators.

```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const positions = new PositionV()

const positions = new PositionV(5_560).fill({x: 4, y: 3, z: 2})

positions.forEach((element, i, v) => {
  element.x = 20
  element.y = 5
  element.z = element.x + element.y
})

const bigPositions = positions.filter((element) => element.x > 10)

// note: vec es6 iterators are slow!!! but work nonetheless
for (const element of positions) {
  element.x = 20
  element.y = 5
  element.z = element.x + element.y
}
```

### Removing Elements

#### End of Vec

```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const positions = new PositionV()

positions.push({x: 1, y: 1, z: 1})
const removed = positions.pop()
console.log(removed) // output: {x: 1, y: 1, z: 1}
console.log(positions.length) // output: 0
```

#### Start of Vec

```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const positions = new PositionV()

positions.push({x: 1, y: 1, z: 1})
positions.push({x: 2, y: 2, z: 2})
const removed = positions.shift()
console.log(removed) // output: {x: 1, y: 1, z: 1}
console.log(positions.length) // output: 1
```

#### Middle of Vec

```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const positions = new PositionV()

positions.push({x: 1, y: 1, z: 1})
positions.push({x: 3, y: 3, z: 3})
positions.push({x: 2, y: 2, z: 2})
const [removed] = positions.splice(1, 1)
console.log(removed) // output: {x: 3, y: 3, z: 3}
console.log(positions.length) // output: 2
```

### Swapping Elements

Due to how [vecs work internally](#indexing-does-not-return-element), swapping can feel awkward. Luckily, there is a `swap` method that lets you forget about the details.

```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const positions = new PositionV()

positions.push({x: 1, y: 1, z: 1})
positions.push({x: 3, y: 3, z: 3})

// 🛑 incorrect swap
const tmp = positions.index(0)
positions.index(0) = positions.index(1) // throws Error
positions.index(1) = tmp // throws Error

// ✅ Correct swap
positions.swap(0, 1)
// ✅ This also works, but looks a little
// awkward
const correctTmp = positions.index(0).e
positions.index(0).e = positions.index(1).e
positions.index(1).e = correctTmp
```

### Casting

#### Array

*Note: [Vecs use 32-bit floats](#f32), so there will be a loss of precision for decimal numbers when converting an array to a vec.

```js
import {vec, Vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV(15).fill({x: 1, y: 2, z: 3})

// cast to array
const pArray = [...p]
console.log(pArray.length) // output: 15
console.log(pArray[0]) // output: {x: 1, y: 2, z: 3}
console.log(Array.isArray(pArray)) // output: true

// create from array
// note: array elements and vec elements must be
// of same type
const pFromArray = PositionsV.fromArray(pArray)
console.log(pFromArray.length) // output: 15
console.log(pFromArray.index(0).e) // output: {x: 1, y: 2, z: 3}
console.log(Vec.isVec(pFromArray)) // output: true
console.log(pFromArray !== p) // output: true
```

#### String

```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV(20).fill({x: 1, y: 1, z: 1})

// cast to string
const vecString = p.toJSON()
// can be casted to string like so as well
const vecString1 = JSON.stringify(p)
console.log(typeof vecString) // output: "string"
console.log(vecString1 === vecString) // output: true
// create vec from string
const jsonVec = PositionV.fromString(vecString)

console.log(jsonVec.length) // output: 20
jsonVec.forEach(pos => {
     console.log(pos.e) // output: {x: 1, y: 1, z: 1}
})
```

### Multithreading

Vecs are backed by SharedArrayBuffers and can therefore be sent between workers at zero-cost ([check out the benchmarks](#parallel-loop)), irrespective of how many elements are in the vec.

Multithreading with vecs is as easy as this:

*index.mjs*

```js
import {vec} from "struct-vec"

const Position = vec({x: "f32", y: "f32", z: "f32"})
const positions = new Position(10_000).fill(
    {x: 1, y: 1, z: 1}
)

const worker = new Worker("worker.mjs", {type: "module"})
// pass by reference, no copying
worker.postMessage(positions.memory)
```

*worker.mjs*

```js
import {vec} from "struct-vec" 

const Position = vec({x: "f32", y: "f32", z: "f32"})

self.onmessage = ({data}) => {
   Position.fromMemory(data).forEach(p => {
      p.x += 1
      p.y += 2
      p.z += 3
   })
   self.postMessage("finished")
}
```

SAFETY-NOTES: 
- do not attempt to use [length-changing methods while multithreading](#do-not-mutate-vec-length-or-capacity-during-multithreading)
- because vecs are shared across multiple contexts, you can run into real threading issues like data races. Vecs do not come with any type of protections against threading-related bugs, so you'll have to devise your own (mutexes, scheduling, etc.).

## Requirements

This package requires javascript environments that support ES6 and `SharedArrayBuffers` (eg. Node, Deno, [supported browsers](https://caniuse.com/sharedarraybuffer), etc.).

In order to allow enable `SharedArrayBuffers` in supported browsers you probably need to fulfill these [security requirements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements).

Also be aware that the runtime compiler (the [`vec`](#runtime-compiler) function) uses the unsafe [Function constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function) behind the scenes to generate vec classes at runtime. This will render `vec` useless in javascript environments that disallow the use of unsafe constructors such as `Function`, `eval`, etc. If it is the case that your environment disallows unsafe constructors, then consider using the build-time compiler (the [`vecCompile`](#buildtime-compiler) function) instead.

### Typescript

Typescript bindings requires version 3.3.3+.

## Struct Definitions

All elements in a vec are structs, which can be thought of as strictly-typed objects, that only carry data (no methods). Once a vec is given a struct definition (struct def), structs within the vec can only be exactly the type specified in the definition. This is why it is highly recommended to use this package with Typescript, as setting struct fields with incorrect types can lead to odd behaviors.

### Creating a Struct Definition

Creating a struct def is similar to defining a struct def in statically-typed languages (C, Rust, Go, etc.) or an [interface in Typescript](https://www.typescriptlang.org/docs/handbook/2/objects.html). Define a struct def by creating an object and mapping fields ([with a valid name](#disallowed-field-names)) to [supported data types](#data-types). Nesting of struct defs is NOT allowed.

```js
// should have floats at "x", "y", and "z" fields
const positionDef = {x: "f32", y: "f32", z: "f32"}

// should have character type at "emoji" field, and
// integer type at "cuteness" field
const catDef = {emoji: "char", cuteness: "i32"}

// should have boolean type at "isScary" and
// integer type at "power" field
const monsterDef = {isScary: "bool", power: "i32"}
```

### Default Struct Fields

Every struct, regardless of definition has some auto-generated fields. Auto-generated fields are:

`e` : this field allows you to get and set an entire element at once.
```js
import {vec} from "struct-vec"

const Cats = vec({
     cuteness: "i32",
     isDangerous: "bool", 
     emoji: "char"
})
const cats = new Cats()

cats.push({
     cuteness: 10_000, 
     isDangerous: false, 
     emoji: "😸"
})
// get entire element
console.log(cats.index(0).e) // output: {cuteness: 10_000, isDangerous: false, emoji: "😸"}

// set entire element
cats.index(0).e = {
     cuteness: 2_876, 
     isDangerous: true, 
     emoji: "🐈‍⬛"
}
console.log(cats.index(0).e) // output: {cuteness: 2_876, isDangerous: true, emoji: "🐈‍⬛"}
```

### Data types
#### f32

[Single-precision floating point number](https://en.wikipedia.org/wiki/Single-precision_floating-point_format), takes 4 bytes (32 bits) of memory. Similar to javascript's `Number` type, but with less precision. Also similar to to C's [`float` type](https://www.learnc.net/c-tutorial/c-float/).

To define a `f32` field:
```js
import {vec} from "struct-vec"

// "num" should be a float type
const NumVec = vec({num: "f32"})
const v = new NumVec()

v.push({num: 1.1})
console.log(v.index(0).num) // output: 1.100000023841858
v.index(0).num = 2.1
// notice the loss of precision
console.log(v.index(0).num) // output: 2.0999999046325684
```

[![access-speed-num](https://img.shields.io/badge/%F0%9F%9A%80%20Access%20Speed-Great-brightgreen)](https://shields.io/)

This data type very fast in terms of access speed as it maps exactly to a native javascript type.  

[![type-safety-num](https://img.shields.io/badge/%F0%9F%AA%B2%20Type%20Saftey-info-blue)](https://shields.io/) 

If one sets a `f32` field with an incorrect type (`String` type for example), the field will be set to `NaN`. There a couple of exceptions to this rule, such as if the incorrect type is `null`, an `Array`, a `BigInt`, a `Symbol`, or a `Boolean` which will either throw a runtime error, set the field to 0 or 1, depending on the type and javascript engine.

#### i32

A [32-bit signed integer](https://www.ibm.com/docs/en/aix/7.2?topic=types-signed-unsigned-integers), takes 4 bytes (32 bits) of memory. Similar to javascript's `Number` type, but without the ability to carry decimals. Also similar to C's [`int` type](https://www.learnc.net/c-tutorial/c-integer/).

To define a `i32` field:
```js
import {vec} from "struct-vec"

// "num" should be a integer type
const NumVec = vec({num: "i32"})
const v = new NumVec()

v.push({num: 1})
console.log(v.index(0).num) // output: 1
v.index(0).num = 2
console.log(v.index(0).num) // output: 2
v.index(0).num = 2.2
// notice that i32s cannot hold decimals
console.log(v.index(0).num) // output: 2
```

[![access-speed-num](https://img.shields.io/badge/%F0%9F%9A%80%20Access%20Speed-Great-brightgreen)](https://shields.io/)

This data type very fast in terms of access speed as it maps exactly to a native javascript type.  

[![type-safety-num](https://img.shields.io/badge/%F0%9F%AA%B2%20Type%20Saftey-info-blue)](https://shields.io/) 

If one sets a `i32` field with an incorrect type (`String` type for example), the field will be set to `NaN`. There a couple of exceptions to this rule, such as if the incorrect type is `null`, an `Array`, a `BigInt`, a `Symbol`, or a `Boolean` which will either throw a runtime error, set the field to 0 or 1, depending on the type and javascript engine.


#### bool

A boolean value that can be either true or false, takes 1/8 of a byte of memory (1 bit). Same as javascript's `Boolean` type.

To define a `bool` field:
```js
import {vec} from "struct-vec"

// "bool" should be boolean type
const BoolVec = vec({bool: "bool"})
const v = new BoolVec()

v.push({bool: true})
console.log(v.index(0).bool) // output: true
v.index(0).bool = false
console.log(v.index(0).bool) // output: false
```

[![access-speed-bool](https://img.shields.io/badge/%F0%9F%9A%80%20Access%20Speed-Good-green)](https://shields.io/)

This data type requires a small conversion when getting and setting it's value.

[![type-safety-bool](https://img.shields.io/badge/%F0%9F%AA%B2%20Type%20Saftey-info-blue)](https://shields.io/)

When a `bool` field is set with an incorrect type (`Number` type for example), the field will be set to `true` except if the type is [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy), in which case the field will be set to `false`. 

#### char

One valid [unicode 14.0.0](http://www.unicode.org/versions/Unicode14.0.0/) character, takes 8 bytes (64 bits). The `char` type is NOT the same as the javascript's `String` type, as the `char` type is restricted to exactly one character.

To define a `char` field:
```js
import {vec} from "struct-vec"

// "char" should be character type
const CharVec = vec({char: "char"})
const v = new CharVec()
v.push({char: "😀"})
console.log(v.index(0).char) // output: "😀"
v.index(0).char = "a"
console.log(v.index(0).char) // output: "a"
```

[![access-speed-char](https://img.shields.io/badge/%F0%9F%9A%80%20Access%20Speed-Bad-yellow)](https://shields.io/)

This data type requires a medium level conversion in order to access. Performance varies wildly between different javascript environments, but you can expect access times for `char` types to be up to 100% slower (2x slower) than the `i32` (or `f32`) type.

[![type-safety-char](https://img.shields.io/badge/%F0%9F%AA%B2%20Type%20Saftey-info-blue)](https://shields.io/)

When a `char` field is set with an incorrect type an error will be thrown. If the inputted type is a string longer than one character, the field will be set to the first character of input. If the inputted type is an empty string, the field will be set to `" "` (space character).

### Disallowed Field Names

Struct field names follow the same naming convention as [javascript variables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#variables), excluding unicode characters.

Fields also cannot be named (reserved field names):
- `e` 
- `_viewingIndex`
- `ref`
- `isNull`
- `self`

```js
import {vec} from "struct-vec"

// 🛑 Not allowed
const v0 = vec({_viewingIndex: "char"})
const v1 = vec({self: "f32"})
const v5 = vec({e: "f32"})
const v2 = vec({["my-field"]: "bool"})
const v3 = vec({["👍"]: "char"})
const v4 = vec({0: "f32"})

// ✅ allowed
const v11 = vec({x: "f32", y: "f32", z: "f32"})
const v6 = vec({$field: "bool"})
const v7 = vec({_field: "char"})
const v8 = vec({e0: "f32"})
const v9 = vec({myCoolField: "f32"})
const v10 = vec({my$_crazy0_fieldName123: "bool"})
```

## Compilers

This package gives you two ways to define vecs, either through the exported `vec` (runtime compiler) or `vecCompile` (build-time compiler) functions. Both compilers emit the exact same vec classes.

The key differences between the compilers is that the build-time compiler returns a string containing your vec class which you can write to disk to use in another application, instead of creating a vec class which can be used right away.

### Runtime Compiler

Generally, the runtime compiler is easier to work with and that's why all the documentation examples use it. Essentially, the runtime compiler takes your [struct def](#struct-definitions) and returns a vec class that can immediately be used.

In case your were wondering, the runtime compiler is quite fast. Defining a vec like so:

```js
const v = vec({x: "f32", y: "f32", z: "f32", w: "f32"})
```

takes about `0.013` milliseconds in Node. Unless you are planning on defining tens of thousands of vecs, the runtime compiler won't really slow down your application.

The runtime compiler does however make use of the unsafe [`Function constructor`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function) internally. If you know that your javascript environment doesn't allow the use of unsafe constructors (like `Function`, `eval`, etc.), then use the build-time compiler.

Also, if you want a build tool like Webpack, ESBuild, Vite, etc. to apply transforms on your vec classes (such as convert them to ES5 syntax), the build-time compiler might be the right choice for you.

### Build-time Compiler

The build-time compiler is almost exactly the same as the runtime one. The difference being, after the compiler takes your [struct def](#struct-definitions), it returns a string version of your vec class, instead of a vec class that can be immediately used by javascript.

Here's an example:

*build.mjs*
```js
import fs from "fs"
import {vecCompile} from "struct-vec"

// the path to the "struct-vec" library.
// For the web or Deno, you would
// put the full url to the library.
// for example: https://deno.land/....
// or https://unpkg.com/...
const LIB_PATH = "struct-vec"

// create a struct def, just like with the
// runtime compiler
const def = {x: "bool", y: "f32", z: "char"}

const MyClass = vecCompile(def, LIB_PATH, {
     // generate a javascript class, not typescript
     lang: "js",
     // create class with "export" statement
     exportSyntax: "named",
     className: "MyClass"
})
console.log(typeof MyClass) // output: string
// write the class to disk to use later
// or in another application
fs.writeFileSync("MyClass.mjs", MyClass, {encoding: "utf-8"})
```

now take a look at the file the class was written to:

*MyClass.mjs*
```js
// imported dependencies from LIB_PATH
import {Vec} from "struct-vec"
/**
 * @extends {Vec<{"x":"bool","y":"f32","z":"char"}>}
 */
// class was named correctly
// and it was created as a "named" export
export class MyClass extends Vec {
     // some auto generated stuff
     // that looks like it was written by an ape
    static Cursor = class Cursor {
        _viewingIndex = 0
        constructor(self) { this.self = self }
        get y() { return this.self._memory[this._viewingIndex] }; set y(newValue) { this.self._memory[this._viewingIndex] = newValue };
        get z() { return String.fromCodePoint(this.self._memory[this._viewingIndex + 1] || 32) }; set z(newValue) { this.self._memory[this._viewingIndex + 1] = newValue.codePointAt(0) || 32 };
        get x() { return Boolean(this.self._memory[this._viewingIndex + 2] & 1) }; set x(newValue) { this.self._memory[this._viewingIndex + 2] &= -2;this.self._memory[this._viewingIndex + 2] |= Boolean(newValue)};
        set e({y, z, x}) { this.y = y;this.z = z;this.x = x; }
        get e() { return {y: this.y, z: this.z, x: this.x} }        
    }
    get elementSize() { return 3 }
    // here's the inputted struct def
    get def() { return {"x":"bool","y":"f32","z":"char"} }
    get cursorDef() { return MyClass.Cursor }
}
```
You can now import `MyClass` into a javascript or typescript file and it will work just like any other vec.

There are also other build options, such as generating the typescript version of a class, exporting via `export default`, etc. which I will leave to the [API Reference](#api-reference) to explain.

Unfortunately, the build-time compiler does not come with a command-line tool - so you'll need to figure out exactly how you want to generate and store your vec classes.

## Caveats

### Indexing does NOT Return Element

> Indexing into a vec (calling ".index") is similar to calling ".next" on an iterator. Calling myVec.index(0) takes you to the first element but doesn't actually return the element.

The implication of this is that a vec can only point to one value at a time. In essence the `index` method takes you where the element "lives" and gives you tools to access it's fields, but does NOT return the element.

If you want to operate on the entire element use the `e` field, that comes [built-in with all structs](#default-struct-fields) regardless of their definition. Please note that the `e` field returns the element [by value and NOT by reference](#elements-of-a-vec-are-not-reference-types).

Generally this is a non-issue, but it can cause bugs in situations like these:

```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const positions = new PositionV()

positions.push({x: 1, y: 1, z: 1})
positions.push({x: 3, y: 3, z: 3})
positions.push({x: 2, y: 2, z: 2})

// 🛑 incorrect example
// point vec to index 0
const element0 = positions.index(0)
// point vec from 0 to 1
const element1 = positions.index(1)

// ❌ uh-oh, since I didn't capture the value of any of 
// the indexes in a variable this occurs
console.log(element0.x) // output: 3
console.log(element1.x) // output: 3

// ✅ correct example
// point vec to 0 and capture entire element (by value)
const element0correct = positions.index(0).e
// move vec from 0 to 1 and capture entire element (by value)
const element1correct = positions.index(1).e

// 👍 works as expected 
console.log(element0correct.x) // output: 1
console.log(element1correct.x) // output: 3
```

or if attempting to swap elements:

```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const positions = new PositionV()

positions.push({x: 1, y: 1, z: 1})
positions.push({x: 3, y: 3, z: 3})

// 🛑 incorrect swap
const tmp = positions.index(0)
positions.index(0) = positions.index(1) // throws Error
positions.index(1) = tmp // throws Error

// ✅ use the .swap method (most performant)
positions.swap(0, 1)
// ✅ you can manually swap them yourself 
// using the "e" field
const correctTmp = positions.index(0).e
positions.index(0).e = positions.index(1).e
positions.index(1).e = correctTmp
```

or when attempt to do nested imperative for loops (vec iterators don't have this problem):

```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const positions = new PositionV()

positions.push({x: 1, y: 1, z: 1})
positions.push({x: 3, y: 3, z: 3})
positions.push({x: 2, y: 2, z: 2})

// 🛑 incorrect example
for (let i = 0; i < positions.length; i++) {
     // move vec to index 0
     const el = positions.index(i)
     // move vec from index 0 through 2
     for (let x = 0; x < vec.length; x++) {
          const innerEl = positions.index(x)
     }
     // ❌ vec was moved to index 2 (vec.length) at the 
     // end of the inner
     // loop and is no longer pointing to index i
     console.log(el.e) // output: {x: 2, y: 2, z: 2}
}

// ✅ correct example
for (let i = 0; i < positions.length; i++) {
     // move vec to index 0
     // capture element in variable
     // before inner loop changes index
     const el = positions.index(i).e
     // move vec from index 0 through 2
     for (let x = 0; x < vec.length; x++) {
          const innerEl = positions.index(x)
     }
     console.log(el) // output: what ever is at index i
}
```

### Elements of a Vec are not Reference Types

Individual elements of a vec are behave like [primitive types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#primitive_values) (numbers, booleans, etc.) and are not [reference types](https://javascript.info/reference-type), unlike javascript objects which are reference types. If you want to set a particular element, you must index into the vec and change it there.

```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const positions = new PositionV()

positions.push({x: 1, y: 1, z: 1})

// vec elements behave like primitives
// so this gets the element by value
const element0 = positions.index(0).e
element0.x = 2
console.log(element0) // output: {x: 2, y: 1, z: 1}
// 🛑 changes not made to the element in vec
console.log(positions.index(0).e) // output: {x: 1, y: 1, z: 1}

// you must index into the vec to make changes
positions.index(0).x = 2
// ✅ changes made
console.log(positions.index(0).e) // output: {x: 2, y: 1, z: 1}
// ✅ also works
const el = positions.index(0)
el.x = 3
console.log(positions.index(0).e) // output: {x: 3, y: 1, z: 1}
```

### Indexing Out of Bounds

Indexing out of bounds negatively (`i < 0`) will return `undefined` just like an array. Indexing out of bounds past the length (`i > vec.length - 1`) may or may not return `undefined`. Sometimes a vec will keep garbage memory at the end to avoid resizing and this is the expected behavior.

```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const positions = new PositionV(5)

positions.push({x: 1, y: 1, z: 1})
positions.push({x: 2, y: 2, z: 2})
positions.pop()
// current length
console.log(positions.length) // output: 1

// ✅ indexing out of bounds negatively (i < 0) 
// always returns undefined
console.log(positions.index(-1).x) // output: undefined

// ⚠️ indexing out of bounds positively (i > vec.length - 1)
// may or may not return undefined
console.log(positions.index(1).x) // output: 2
console.log(positions.index(2).x) // output: 0
console.log(positions.index(10_000).x) // output: undefined
```

### Do Not Mutate Vec Length or Capacity during Multithreading

Vecs are designed for multithreaded iterations and NOT multithreaded length-changing (or capacity-changing) mutations. Beyond the fact that mutating the length (or capacity) of a vec during multithreading is a bad idea, it will lead to unpredictable bugs. Do not use any methods that may potentially change the `length` (or `capacity`) of a vec during multithreading. 

Length-changing methods include: `pop`, `truncate`, `splice`, `shift`, `push`, `fill`, `unshift`

Capacity-changing methods include: `shrinkTo`, `reserve`

## Performance Tips

### Adding Many Elements

Generally speaking vecs manage their own memory, so you never have to think about resizing or shrinking a vec. However, vecs also provide the ability to expand their memory (or shrink it) on-demand, which is useful when you know ahead of time that you will be adding many elements at once.

Before pushing many elements at once you can use the `reserve` method to resize the vec's memory as to avoid resizing multiple times and [increase performance](#pushing-elements).

```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const positions = new PositionV()

// make sure there is enough memory for an additional
// 10,00 elements
positions.reserve(10_000)

for (let i = 0; i < 10_000; i++) {
  positions.push({x: 1, z: 1, y: 1})
}
```

### Removing Many Elements

Similar to when adding many elements, vecs provide a couple of mass removal methods that are more performant.

If you want to remove the last n elements use the `truncate` method

```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const positions = new PositionV(10_000).fill({x: 1, y: 1, z: 1})

console.log(positions.length) // output: 10_000

// remove last 5_000 elements at once
positions.truncate(5_000)

console.log(positions.length) // output: 5_000
```

### Avoid ES6 Iterators and Indexing

ES6 array destructuring operator (`const [element] = vec`), spread operator (`...vec`), and for...of loops (`for (const el of vec)`) should be avoided except if you want to [cast a vec to an array](#casting) or something similar. 

These operators force vecs to deserialize their internal binary representation of structs to objects - [which is costly](#es6-iterator-loop) and can cause some unexpected side-effects due to fact that they [return elements by value , NOT by reference](#elements-of-a-vec-are-not-reference-types).

NOTE: the `values`, `entries`, `keys` methods are also es6 iterators.

### Avoid Using the e Field Except for Setting an Element

Using the `e` field to view the value of an element is costly as it forces the vec to deserialize it's internal binary representation into object format ([similar to es6 methods](#avoid-es6-iterators-and-indexing)). Getting the value of individual fields is far more performant than using the `e` field. Fortunately, this bottleneck doesn't seem to exist when setting with `e`.

```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const positions = new PositionV()

positions.push({x: 1, z: 1, y: 1})

// ✅ performant
const {x, y, z} = positions.index(0)
// ✅ also performant
const xVal = positions.index(0).x
const yVal = positions.index(0).y
const zVal = positions.index(0).z

// ⚠️ less performant
const val = positions.index(0).e

// ✅ setting with "e" field is also performant 
// unlike viewing
positions.index(0).e = {x: 2, y: 5, z: 7}
```

## Benchmarks

All test were done over 100 samples, with 4 warmup runs
before recording. [The multithreaded benchmarks](#parallel-loop) are the only exception to this.

Test machine was a Windows 11/WSL-Ubuntu 20.04 (x64), with a Intel i7-9750H CPU (12 core), and 16 GB RAM.

All of these tests are micro benchmarks which rarely tell the entire truth about performance, but can give you an idea on what to expect from vecs in terms of performance.

### Iteration
#### Imperative loop

Iterate over 10 million elements in an imperative manner, adding 10 to one of the element fields.

The raw buffer fields here are `Float32Array`s.

Taken on ```March 31, 2022```

`Node 16.13.1 (Ubuntu 20.04)`
| Candidate | Result |
| ---- | ------ |
| Raw Buffer | 15.28 ms ±0.96 |
| Array | 49.82 ms ±2.35 |
| Vec | 21.69 ms ±0.74 |

`Deno 1.20.2 (Ubuntu 20.04)`
| Candidate | Result |
| ---- | ------ |
| Raw Buffer | 14.79 ms ±0.89 |
| Array | 32.01 ms ±1.15 |
| Vec | 20.63 ms ±0.76 |

`Chrome 99 (Windows 11)`
| Candidate | Result |
| ---- | ------ |
| Raw Buffer | 18.80 ms ±2.42 |
| Array | 38.19 ms ±2.64 |
| Vec | 21.54 ms ±1.66 |

`Firefox 98 (Windows 11)`
| Candidate | Result |
| ---- | ------ |
| Raw Buffer | 23.97 ms ±0.93 |
| Array | 64.30 ms ±3.13 |
| Vec | 54.68 ms ±1.54 |

`Edge 99 (Windows 11)`
| Candidate | Result |
| ---- | ------ |
| Raw Buffer | 17.19 ms ±1.87 |
| Array | 37.82 ms ±2.10 |
| Vec | 21.36 ms ±1.28 |

#### ForEach loop

Iterate over 10 million elements with `ForEach` iterator, adding 10 to one of the element fields.

Taken on ```March 24, 2022```

`Node 16.13.1 (Ubuntu 20.04)`
| Candidate | Result |
| ---- | ------ |
| Array | 116.84 ms ±3.53 |
| Vec | 47.84 ms ±0.77 |

`Deno 1.20.2 (Ubuntu 20.04)`
| Candidate | Result |
| ---- | ------ |
| Array | 103.82 ms ±2.98 |
| Vec | 45.57 ms ±1.14 |

`Chrome 99 (Windows 11)`
| Candidate | Result |
| ---- | ------ |
| Array | 126.19 ms ±5.72 |
| Vec | 48.67 ms ±4.08 |

`Firefox 98 (Windows 11)`
| Candidate | Result |
| ---- | ------ |
| Array | 102.04 ms ±4.00 |
| Vec | 149.01 ms ±10.09 |

`Edge 99 (Windows 11)`
| Candidate | Result |
| ---- | ------ |
| Array | 124.70 ms ±4.44 |
| Vec | 48.71 ms ±2.59 |

#### ES6 Iterator loop

Iterate over 10 million elements with ES6's for...of loop and add 10 to one of the element fields.

Taken on ```March 24, 2022```

`Node 16.13.1 (Ubuntu 20.04)`
| Candidate | Result |
| ---- | ------ |
| Raw Buffer (imperative) | 30.59 ms ±1.56 |
| Array | 53.12 ms ±1.96 |
| Vec | 196.70 ms ±6.47 |

`Deno 1.20.2 (Ubuntu 20.04)`
| Candidate | Result |
| ---- | ------ |
| Raw Buffer (imperative) | 30.45 ms ±1.54 |
| Array | 34.95 ms ±1.19 |
| Vec | 194.63 ms ±4.82 |

`Chrome 99 (Windows 11)`
| Candidate | Result |
| ---- | ------ |
| Raw Buffer (imperative) | 32.13 ms ±2.15 |
| Array | 34.97 ms ±1.57 |
| Vec | 200.56 ms ±7.61 |

`Firefox 98 (Windows 11)`
| Candidate | Result |
| ---- | ------ |
| Raw Buffer (imperative) | 29.21 ms ±3.35 |
| Array | 106.89 ms ±4.14 |
| Vec | 346.72 ms ±13.57 |

`Edge 99 (Windows 11)`
| Candidate | Result |
| ---- | ------ |
| Raw Buffer (imperative) | 31.20 ms ±1.66 |
| Array | 34.46 ms ±0.83 |
| Vec | 200.35 ms ±6.35 |

#### Parallel Loop

Iterate over 8 million elements in a parallel (4 cores) and perform a significant computation. Average of 10 runs, with 4 warmups runs before recording.

Taken on ```March 31, 2022```

`Node 16.13.1 (Ubuntu 20.04)`
| Candidate | Result |
| ---- | ------ |
| Single-thread Array | 6,415.10 ms ±469.00 |
| Multithreaded Array |  18,833.40 ms ±246.66 |
| Single-thread Vec | 4,856.90 ms ±120.40 |
| Multithreaded Vec | 1,411.40 ms ±98.34 |

`Deno 1.20.2 (Ubuntu 20.04)`
| Candidate | Result |
| ---- | ------ |
| Single-thread Array | 6,541.40 ms ±167.11 |
| Multithreaded Array | 18,204.20 ms ±172.01 |
| Single-thread Vec | 5,487.70 ms ±43.90 |
| Multithreaded Vec | 1,411.40 ms ±98.34 |

`Chrome 99 (Windows 11)`
| Candidate | Result |
| ---- | ------ |
| Single-thread Array | 5,746.00 ms ±76.65 |
| Multithreaded Array | 17,989.40 ms ±751.12 |
| Single-thread Vec | 5,350.60 ms ±162.57 |
| Multithreaded Vec | 1,580.80 ms ±39.07 |

`Firefox 98 (Windows 11)`
| Candidate | Result |
| ---- | ------ |
| Single-thread Array | 6387.00 ms ±26.23 |
| Multithreaded Array | Crashed with no error code |
| Single-thread Vec | 6293.40 ms ±179.05 |
| Multithreaded Vec | 1847.10 ms ±74.04 |

`Edge 99 (Windows 11)`
| Candidate | Result |
| ---- | ------ |
| Single-thread Array | 6,388.00 ms ±233.65 |
| Multithreaded Array | Crashed with code STATUS_BREAKPOINT |
| Single-thread Vec | 5,338.30 ms ±127.40 |
| Multithreaded Vec | 1,569.20 ms ±73.29 |

#### Pushing Elements

Pushing 10 million elements in a row.

"with reserve" label means that vec/array preallocated enough space for all 10 million elements before attempting to push elements.

Preallocation with arrays looks like this:
```js
const arr = new Array(10_000_000)
// start pushing elements
```

For vecs:
```js
const vec = new PositionV()
vec.reserve(10_000_000)
// start pushing elements 
```

Taken on ```March 31, 2022```

`Node 16.13.1 (Ubuntu 20.04)`
| Candidate | Result |
| ---- | ------ |
| Vec | 138.99 ms ±15.51 | 
| Array | 690.30 ms ±227.53 |
| Vec with reserve | 76.92 ms ±4.69 |
| Array with reserve | 2305.48 ms ±85.52 |

`Deno 1.20.2 (Ubuntu 20.04)`
| Candidate | Result |
| ---- | ------ |
| Vec |  143.74 ms ±12.57 |
| Array | 1459.62 ms ±170.93 |
| Vec with reserve | 101.21 ms ±5.23 |
| Array with reserve | 1602.00 ms ±27.78 |

`Chrome 99 (Windows 11)`
| Candidate | Result |
| ---- | ------ |
| Vec |  228.77 ms ±14.33 |
| Array | 1373.45 ms ±262.41 |
| Vec with reserve | 129.86 ms ±62.47 |
| Array with reserve | 1459.22 ms ±35.14 |

`Firefox 98 (Windows 11)`
| Candidate | Result |
| ---- | ------ |
| Vec |  630.28 ms ±9.57 |
| Array | 612.50 ms ±10.76 |
| Vec with reserve | 446.65 ms ±22.07 |
| Array with reserve | 2348.31 ms ±198.37 |

`Edge 99 (Windows 11)`
| Candidate | Result |
| ---- | ------ |
| Vec |  243.50 ms ±11.83 |
| Array | 1370.32 ms ±259.06 |
| Vec with reserve | 132.42 ms ±10.41 |
| Array with reserve | 1457.89 ms ±58.15 |

## API Reference
<a name="module_vec-struct"></a>

* [vec-struct](#module_vec-struct)
    * [~Vec](#module_vec-struct..Vec)
        * [new Vec([initialCapacity])](#new_module_vec-struct..Vec_new)
        * _instance_
            * [.elementSize](#module_vec-struct..Vec+elementSize) : <code>number</code>
            * [.def](#module_vec-struct..Vec+def) : <code>StructDef</code>
            * [.length](#module_vec-struct..Vec+length) : <code>number</code>
            * [.capacity](#module_vec-struct..Vec+capacity) : <code>number</code>
            * [.memory](#module_vec-struct..Vec+memory) : <code>ReadonlyInt32Array</code>
            * [.index(index)](#module_vec-struct..Vec+index) ⇒ <code>VecCursor.&lt;StructDef&gt;</code>
            * [.at(index)](#module_vec-struct..Vec+at) ⇒ <code>VecCursor.&lt;StructDef&gt;</code>
            * [.forEach(callback)](#module_vec-struct..Vec+forEach) ⇒ <code>void</code>
            * [.map(callback)](#module_vec-struct..Vec+map) ⇒ <code>Array.&lt;YourCallbackReturnType&gt;</code>
            * [.mapv(callback)](#module_vec-struct..Vec+mapv) ⇒ <code>Vec.&lt;StructDef&gt;</code>
            * [.filter(callback)](#module_vec-struct..Vec+filter) ⇒ <code>Vec.&lt;StructDef&gt;</code>
            * [.find(callback)](#module_vec-struct..Vec+find) ⇒ <code>VecCursor.&lt;StructDef&gt;</code> \| <code>undefined</code>
            * [.findIndex(callback)](#module_vec-struct..Vec+findIndex) ⇒ <code>number</code>
            * [.lastIndexOf(callback)](#module_vec-struct..Vec+lastIndexOf) ⇒ <code>number</code>
            * [.reduce(callback, initialValue)](#module_vec-struct..Vec+reduce) ⇒ <code>YourCallbackReturnValue</code>
            * [.reduceRight(callback, initialValue)](#module_vec-struct..Vec+reduceRight) ⇒ <code>YourCallbackReturnValue</code>
            * [.every(callback)](#module_vec-struct..Vec+every) ⇒ <code>boolean</code>
            * [.some(callback)](#module_vec-struct..Vec+some) ⇒ <code>boolean</code>
            * [.entries()](#module_vec-struct..Vec+entries) ⇒ <code>Iterator.&lt;Array.&lt;number, Struct.&lt;StructDef&gt;&gt;&gt;</code>
            * [.keys()](#module_vec-struct..Vec+keys) ⇒ <code>Iterator.&lt;number&gt;</code>
            * [.values()](#module_vec-struct..Vec+values) ⇒ <code>Iterator.&lt;Struct.&lt;StructDef&gt;&gt;</code>
            * [.slice([start], [end])](#module_vec-struct..Vec+slice) ⇒ <code>Vec.&lt;StructDef&gt;</code>
            * [.copyWithin(target, [start], [end])](#module_vec-struct..Vec+copyWithin) ⇒ <code>Vec.&lt;StructDef&gt;</code>
            * [.reserve(additional)](#module_vec-struct..Vec+reserve) ⇒ <code>Vec.&lt;StructDef&gt;</code>
            * [.reverse()](#module_vec-struct..Vec+reverse) ⇒ <code>Vec.&lt;StructDef&gt;</code>
            * [.concat(...vecs)](#module_vec-struct..Vec+concat) ⇒ <code>Vec.&lt;StructDef&gt;</code>
            * [.pop()](#module_vec-struct..Vec+pop) ⇒ <code>Struct.&lt;StructDef&gt;</code> \| <code>undefined</code>
            * [.truncate(count)](#module_vec-struct..Vec+truncate) ⇒ <code>number</code>
            * [.fill(value, [start], [end])](#module_vec-struct..Vec+fill) ⇒ <code>Vec.&lt;StructDef&gt;</code>
            * [.push(...structs)](#module_vec-struct..Vec+push) ⇒ <code>number</code>
            * [.splice(start, [deleteCount], ...items)](#module_vec-struct..Vec+splice) ⇒ <code>Vec.&lt;StructDef&gt;</code>
            * [.shift()](#module_vec-struct..Vec+shift) ⇒ <code>Struct.&lt;StructDef&gt;</code>
            * [.unshift(...structs)](#module_vec-struct..Vec+unshift) ⇒ <code>number</code>
            * [.shrinkTo([minCapacity])](#module_vec-struct..Vec+shrinkTo) ⇒ <code>Vec.&lt;StructDef&gt;</code>
            * [.sort(compareFn)](#module_vec-struct..Vec+sort) ⇒ <code>Vec.&lt;StructDef&gt;</code>
            * [.swap(aIndex, bIndex)](#module_vec-struct..Vec+swap) ⇒ <code>Vec.&lt;StructDef&gt;</code>
            * [.toJSON()](#module_vec-struct..Vec+toJSON) ⇒ <code>string</code>
            * [.detachedCursor(index)](#module_vec-struct..Vec+detachedCursor) ⇒ <code>DetachedVecCursor</code>
        * _static_
            * [.def](#module_vec-struct..Vec.def) : <code>Readonly.&lt;StructDef&gt;</code>
            * [.elementSize](#module_vec-struct..Vec.elementSize) : <code>Readonly.&lt;number&gt;</code>
            * [.isVec(candidate)](#module_vec-struct..Vec.isVec) ⇒ <code>boolean</code>
            * [.fromMemory(memory)](#module_vec-struct..Vec.fromMemory) ⇒ <code>Vec.&lt;StructDef&gt;</code>
            * [.fromArray(structArray)](#module_vec-struct..Vec.fromArray) ⇒ <code>Vec.&lt;StructDef&gt;</code>
            * [.fromString(vecString)](#module_vec-struct..Vec.fromString) ⇒ <code>Vec.&lt;StructDef&gt;</code>
    * [~validateStructDef(def)](#module_vec-struct..validateStructDef) ⇒ <code>boolean</code>
    * [~vec(structDef, [options])](#module_vec-struct..vec_gen) ⇒ <code>VecClass.&lt;StructDef&gt;</code>
    * [~vecCompile(structDef, pathToLib, [options])](#module_vec-struct..vec_genCompile) ⇒ <code>string</code>

<a name="module_vec-struct..Vec"></a>

### vec-struct~Vec
The base class that all generated vec
classes inherit from.

This class isn't intended to be manually
inherited from, as the ```vec``` and `vecCompile` functions
will automatically inherit this class and
generate the necessary override methods
based on your struct definition. The class
is still made available however as it has
some useful static methods, such as:

```isVec``` : can be used
to check if a particular type
is a vec at runtime, similar to the ```Array.isArray```
method.

The class is generic over ```T``` which extends
the ```StructDef``` type. In other words, the Vec class
is type ```Vec<T extends StructDef>```

**Kind**: inner class of [<code>vec-struct</code>](#module_vec-struct)  

* [~Vec](#module_vec-struct..Vec)
    * [new Vec([initialCapacity])](#new_module_vec-struct..Vec_new)
    * _instance_
        * [.elementSize](#module_vec-struct..Vec+elementSize) : <code>number</code>
        * [.def](#module_vec-struct..Vec+def) : <code>StructDef</code>
        * [.length](#module_vec-struct..Vec+length) : <code>number</code>
        * [.capacity](#module_vec-struct..Vec+capacity) : <code>number</code>
        * [.memory](#module_vec-struct..Vec+memory) : <code>ReadonlyInt32Array</code>
        * [.index(index)](#module_vec-struct..Vec+index) ⇒ <code>VecCursor.&lt;StructDef&gt;</code>
        * [.at(index)](#module_vec-struct..Vec+at) ⇒ <code>VecCursor.&lt;StructDef&gt;</code>
        * [.forEach(callback)](#module_vec-struct..Vec+forEach) ⇒ <code>void</code>
        * [.map(callback)](#module_vec-struct..Vec+map) ⇒ <code>Array.&lt;YourCallbackReturnType&gt;</code>
        * [.mapv(callback)](#module_vec-struct..Vec+mapv) ⇒ <code>Vec.&lt;StructDef&gt;</code>
        * [.filter(callback)](#module_vec-struct..Vec+filter) ⇒ <code>Vec.&lt;StructDef&gt;</code>
        * [.find(callback)](#module_vec-struct..Vec+find) ⇒ <code>VecCursor.&lt;StructDef&gt;</code> \| <code>undefined</code>
        * [.findIndex(callback)](#module_vec-struct..Vec+findIndex) ⇒ <code>number</code>
        * [.lastIndexOf(callback)](#module_vec-struct..Vec+lastIndexOf) ⇒ <code>number</code>
        * [.reduce(callback, initialValue)](#module_vec-struct..Vec+reduce) ⇒ <code>YourCallbackReturnValue</code>
        * [.reduceRight(callback, initialValue)](#module_vec-struct..Vec+reduceRight) ⇒ <code>YourCallbackReturnValue</code>
        * [.every(callback)](#module_vec-struct..Vec+every) ⇒ <code>boolean</code>
        * [.some(callback)](#module_vec-struct..Vec+some) ⇒ <code>boolean</code>
        * [.entries()](#module_vec-struct..Vec+entries) ⇒ <code>Iterator.&lt;Array.&lt;number, Struct.&lt;StructDef&gt;&gt;&gt;</code>
        * [.keys()](#module_vec-struct..Vec+keys) ⇒ <code>Iterator.&lt;number&gt;</code>
        * [.values()](#module_vec-struct..Vec+values) ⇒ <code>Iterator.&lt;Struct.&lt;StructDef&gt;&gt;</code>
        * [.slice([start], [end])](#module_vec-struct..Vec+slice) ⇒ <code>Vec.&lt;StructDef&gt;</code>
        * [.copyWithin(target, [start], [end])](#module_vec-struct..Vec+copyWithin) ⇒ <code>Vec.&lt;StructDef&gt;</code>
        * [.reserve(additional)](#module_vec-struct..Vec+reserve) ⇒ <code>Vec.&lt;StructDef&gt;</code>
        * [.reverse()](#module_vec-struct..Vec+reverse) ⇒ <code>Vec.&lt;StructDef&gt;</code>
        * [.concat(...vecs)](#module_vec-struct..Vec+concat) ⇒ <code>Vec.&lt;StructDef&gt;</code>
        * [.pop()](#module_vec-struct..Vec+pop) ⇒ <code>Struct.&lt;StructDef&gt;</code> \| <code>undefined</code>
        * [.truncate(count)](#module_vec-struct..Vec+truncate) ⇒ <code>number</code>
        * [.fill(value, [start], [end])](#module_vec-struct..Vec+fill) ⇒ <code>Vec.&lt;StructDef&gt;</code>
        * [.push(...structs)](#module_vec-struct..Vec+push) ⇒ <code>number</code>
        * [.splice(start, [deleteCount], ...items)](#module_vec-struct..Vec+splice) ⇒ <code>Vec.&lt;StructDef&gt;</code>
        * [.shift()](#module_vec-struct..Vec+shift) ⇒ <code>Struct.&lt;StructDef&gt;</code>
        * [.unshift(...structs)](#module_vec-struct..Vec+unshift) ⇒ <code>number</code>
        * [.shrinkTo([minCapacity])](#module_vec-struct..Vec+shrinkTo) ⇒ <code>Vec.&lt;StructDef&gt;</code>
        * [.sort(compareFn)](#module_vec-struct..Vec+sort) ⇒ <code>Vec.&lt;StructDef&gt;</code>
        * [.swap(aIndex, bIndex)](#module_vec-struct..Vec+swap) ⇒ <code>Vec.&lt;StructDef&gt;</code>
        * [.toJSON()](#module_vec-struct..Vec+toJSON) ⇒ <code>string</code>
        * [.detachedCursor(index)](#module_vec-struct..Vec+detachedCursor) ⇒ <code>DetachedVecCursor</code>
    * _static_
        * [.def](#module_vec-struct..Vec.def) : <code>Readonly.&lt;StructDef&gt;</code>
        * [.elementSize](#module_vec-struct..Vec.elementSize) : <code>Readonly.&lt;number&gt;</code>
        * [.isVec(candidate)](#module_vec-struct..Vec.isVec) ⇒ <code>boolean</code>
        * [.fromMemory(memory)](#module_vec-struct..Vec.fromMemory) ⇒ <code>Vec.&lt;StructDef&gt;</code>
        * [.fromArray(structArray)](#module_vec-struct..Vec.fromArray) ⇒ <code>Vec.&lt;StructDef&gt;</code>
        * [.fromString(vecString)](#module_vec-struct..Vec.fromString) ⇒ <code>Vec.&lt;StructDef&gt;</code>

<a name="new_module_vec-struct..Vec_new"></a>

#### new Vec([initialCapacity])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [initialCapacity] | <code>number</code> | <code>15</code> | the amount of capacity to initialize vec with. Defaults to 15. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const geoCoordinates = vec({latitude: "f32", longitude: "f32"})

// both are valid ways to initialize
const withCapacity = new geoCoordinates(100)
const without = new geoCoordinates()
```
<a name="module_vec-struct..Vec+elementSize"></a>

#### vec.elementSize : <code>number</code>
The amount of raw memory an individual
struct (element of a vec) requires for this vec type.
An individual block of memory corresponds to
4 bytes (32-bits).

For example if ```elementSize``` is 2, each struct
will take 8 bytes.

**Kind**: instance property of [<code>Vec</code>](#module_vec-struct..Vec)  
<a name="module_vec-struct..Vec+def"></a>

#### vec.def : <code>StructDef</code>
The definition of an individual
struct (element) in a vec.

**Kind**: instance property of [<code>Vec</code>](#module_vec-struct..Vec)  
<a name="module_vec-struct..Vec+length"></a>

#### vec.length : <code>number</code>
The number of elements in vec.
The value is between 0 and (2^32) - 1
(about 2 billion),
always numerically greater than the
highest index in the array.

**Kind**: instance property of [<code>Vec</code>](#module_vec-struct..Vec)  
<a name="module_vec-struct..Vec+capacity"></a>

#### vec.capacity : <code>number</code>
The number of elements a vec can
hold before needing to resize.
The value is between 0 and (2^32) - 1
(about 2 billion).

**Kind**: instance property of [<code>Vec</code>](#module_vec-struct..Vec)  
**Example** *(Expanding Capacity)*  
```js
import {vec} from "struct-vec"

const Cats = vec({isCool: "f32", isDangerous: "f32"})
// initialize with a capacity of 15
const cats = new Cats(15)
// currently the "cats" array can hold
// up to 15 elements without resizing
// but does not have any elements yet
console.log(cats.capacity) // output: 15
console.log(cats.length) // output: 0

// fill entire capacity with elements
cats.fill({isCool: 1, isDangerous: 1})
// now the cats array will need to resize
// if we attempt to add more elements
console.log(cats.capacity) // output: 15
console.log(cats.length) // output: 15

const capacity = cats.capacity
cats.push({isCool: 1, isDangerous: 1})
// vec resized capacity to accommodate
// for more elements
console.log(capacity < cats.capacity) // output: true
console.log(cats.length) // output: 16
```
**Example** *(Shrinking Capacity)*  
```js
import {vec} from "struct-vec"

const Cats = vec({isCool: "f32", isDangerous: "f32"})
// initialize with a capacity of 15
const cats = new Cats(15)
// currently the "cats" array can hold
// up to 15 elements without resizing
// but does not have any elements yet
console.log(cats.capacity) // output: 15
console.log(cats.length) // output: 0
for (let i = 0; i < 5; i++) {
     cats.push({isCool: 1, isDangerous: 1})
}

// vec can hold 3x more elements than we need
// lets shrink the capacity to be memory efficient
console.log(cats.capacity) // output: 15
console.log(cats.length) // output: 5

// shrink vec memory so that length
// and capacity are the same
cats.shrinkTo(0)
console.log(cats.capacity) // output: 5
console.log(cats.length) // output: 5
```
<a name="module_vec-struct..Vec+memory"></a>

#### vec.memory : <code>ReadonlyInt32Array</code>
The binary representation
of a vec.

WARNING: It is never recommended
to manually edit the underlying memory,
doing so may lead to memory corruption.

**Kind**: instance property of [<code>Vec</code>](#module_vec-struct..Vec)  
<a name="module_vec-struct..Vec+index"></a>

#### vec.index(index) ⇒ <code>VecCursor.&lt;StructDef&gt;</code>
Returns a cursor which allows the viewing of
the element at the inputted index.

NOTE: this method does not return the actual
element at the index. In order to get the entire
element at a given index you must use the
".e" method on the cursor. If you want one
of the fields of the element just reference
the field (for example ".x")

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>VecCursor.&lt;StructDef&gt;</code> - A cursor of the target
index  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | the index you want to view |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})

const pos = new PositionsV()

pos.push({x: 1, y: 1, z: 1})
pos.push({x: 1, y: 2, z: 1})
pos.push({x: 1, y: 3, z: 1})

// get entire element at index 0.
// The "e" property comes with all elements
// automatically
console.log(pos.index(0).e) // output: {x: 1, y: 1, z: 1}
console.log(pos.index(1).e) // output: {x: 1, y: 2, z: 1}
// get the "y" field of the element
// at index 2
console.log(pos.index(2).y) // output: 3
```
<a name="module_vec-struct..Vec+at"></a>

#### vec.at(index) ⇒ <code>VecCursor.&lt;StructDef&gt;</code>
Returns a cursor which allows the viewing of
the element at the inputted index.

This method is identical to the ```index``` method
except that it accepts negative indices. Negative
indices are counted from the back of the vec
(vec.length + index)

PERFORMANCE-TIP: this method is far less efficient
than the ```index``` method.

NOTE: this method does not return the actual
element at the index. In order to get the entire
element at a given index you must use the
".e" method on the cursor. If you want one
of the fields of the element just reference
the field (for example ".x")

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>VecCursor.&lt;StructDef&gt;</code> - A cursor of the target
index  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | the index you want to view. Supports negative indices. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})

const pos = new PositionsV()

pos.push({x: 1, y: 1, z: 1})
pos.push({x: 1, y: 2, z: 1})
pos.push({x: 1, y: 3, z: 1})

// get entire element at index 0.
// The "e" property comes with all elements
// automatically
console.log(pos.index(-1).e) // output: {x: 1, y: 3, z: 1}
console.log(pos.index(-2).e) // output: {x: 1, y: 2, z: 1}
// get the "y" field of the element
// at index 2
console.log(pos.index(-3).y) // output: 1
```
<a name="module_vec-struct..Vec+forEach"></a>

#### vec.forEach(callback) ⇒ <code>void</code>
Executes a provided function once for each
vec element.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>ForEachCallback.&lt;StructDef&gt;</code> | A function to execute for each element taking three arguments: - ```element``` The current element being processed in the - ```index``` (optional) The index of the current element being processed in the vec. - ```vec``` (optional) The vec which method was called upon. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const pos = PositionsV(15).fill({x: 1, y: 1, z: 1})

pos.forEach((p, i, v) => {
     console.log(p.e) // output: {x: 1, y: 1, z: 1}
})
```
<a name="module_vec-struct..Vec+map"></a>

#### vec.map(callback) ⇒ <code>Array.&lt;YourCallbackReturnType&gt;</code>
Creates a new array populated with the results
of calling a provided function on every
element in the calling vec.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Array.&lt;YourCallbackReturnType&gt;</code> - A new array with each element being
the result of the callback function.  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>MapCallback.&lt;StructDef, YourCallbackReturnValue&gt;</code> | Function that is called for every element of vec. Each time callbackFn executes, the returned value is added to new Array. Taking three arguments: - ```element``` The current element being processed - ```index``` (optional) The index of the current element being processed in the vec. - ```vec``` (optional) The vec which method was called upon. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const pos = PositionsV(15).fill({x: 1, y: 1, z: 1})
const xVals = pos.map(p => p.x)

xVals.forEach((num) => {
     console.log(num) // output: 1
})
```
<a name="module_vec-struct..Vec+mapv"></a>

#### vec.mapv(callback) ⇒ <code>Vec.&lt;StructDef&gt;</code>
Creates a new vec populated with the results
of calling a provided function on every
element in the calling vec.

Essentially ```mapv``` is the same as chaining
```slice``` and ```forEach``` together.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Vec.&lt;StructDef&gt;</code> - A new vec with each element being the result
of the callback function.  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>MapvCallback.&lt;StructDef&gt;</code> | Function that is called for every element of vec. Please note that each element is an exact copy of the vec ```mapv``` was called on. Taking three arguments: - ```element``` The current element being processed - ```index``` (optional) The index of the current element being processed in the vec. - ```vec``` (optional) The vec which method was called upon. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const pos = PositionsV(15).fill({x: 1, y: 1, z: 1})
const yAdd = pos.mapv(p => p.y += 2)

yAdd.forEach((p) => {
     console.log(p.e) // output: {x: 1, y: 3, z: 1}
})
pos.forEach((p) => {
     console.log(p.e) // output: {x: 1, y: 1, z: 1}
})
console.log(pos !== yAdd) // output: true
```
<a name="module_vec-struct..Vec+filter"></a>

#### vec.filter(callback) ⇒ <code>Vec.&lt;StructDef&gt;</code>
Creates a new vec with all elements that pass
the test implemented by the provided function.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Vec.&lt;StructDef&gt;</code> - A new vec with the elements that pass the test.
If no elements pass the test, an empty vec will be
returned.  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>TruthyIterCallback.&lt;StructDef&gt;</code> | A function to test for each element, taking three arguments: - ```element``` The current element being processed - ```index``` (optional) The index of the current element being processed in the vec. - ```vec``` (optional) The vec which method was called upon. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const pos = PositionsV()
for (let i = 0; i < 5; i++) {
     pos.push({x: 1, y: 2, z: 10})
}
for (let i = 0; i < 5; i++) {
     pos.push({x: 1, y: 2, z: 0})
}
const bigZs = pos.filter(p => p.z > 5)

console.log(bigZs.length) // output: 5
bigZs.forEach((p) => {
     console.log(p.e) // output: {x: 1, y: 2, z: 10}
})
console.log(pos.length) // output: 10
console.log(pos !== bigZs) // output: true
```
<a name="module_vec-struct..Vec+find"></a>

#### vec.find(callback) ⇒ <code>VecCursor.&lt;StructDef&gt;</code> \| <code>undefined</code>
Returns a vec cursor to the first element in the provided
vec that satisfies the provided testing
function. If no values satisfy the testing
function, undefined is returned.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>TruthyIterCallback.&lt;StructDef&gt;</code> | A function to test for each element, taking three arguments: - ```element``` The current element being processed - ```index``` (optional) The index of the current element being processed in the vec. - ```vec``` (optional) The vec which method was called upon. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const pos = PositionsV()
for (let i = 0; i < 5; i++) {
     pos.push({x: 1, y: 2, z: 10})
}
for (let i = 0; i < 5; i++) {
     pos.push({x: 1, y: 2, z: 0})
}

const nonExistent = pos.find(p => p.z === 100)
console.log(nonExistent) // output: undefined

const exists = pos.find(p => p.z === 10)
console.log(exists.e) // output: {x: 1, y: 2, z: 10}
```
<a name="module_vec-struct..Vec+findIndex"></a>

#### vec.findIndex(callback) ⇒ <code>number</code>
Returns the index of the first element in the
vec that satisfies the provided testing function.
Otherwise, it returns -1, indicating that no
element passed the test

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>number</code> - The index of the first element in the vec
that passes the test. Otherwise, -1  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>TruthyIterCallback.&lt;StructDef&gt;</code> | A function to test for each element, taking three arguments: - ```element``` The current element being processed - ```index``` (optional) The index of the current element being processed in the vec. - ```vec``` (optional) The vec which method was called upon. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const pos = PositionsV()
for (let i = 0; i < 5; i++) {
     pos.push({x: 1, y: 2, z: 10})
}
for (let i = 0; i < 5; i++) {
     pos.push({x: 1, y: 2, z: 0})
}

const nonExistent = pos.findIndex(p => p.z === 100)
console.log(nonExistent) // output: -1

const exists = pos.findIndex(p => p.z === 10)
console.log(exists) // output: 0
```
<a name="module_vec-struct..Vec+lastIndexOf"></a>

#### vec.lastIndexOf(callback) ⇒ <code>number</code>
Returns the last index at which a given element can
be found in the vec, or -1 if it
is not present. The vec is searched
backwards, starting at fromIndex.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>number</code> - The index of the last element in the vec
that passes the test. Otherwise, -1  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>TruthyIterCallback.&lt;StructDef&gt;</code> | A function to test for each element, taking three arguments: - ```element``` The current element being processed - ```index``` (optional) The index of the current element being processed in the vec. - ```vec``` (optional) The vec which method was called upon. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const pos = PositionsV()
for (let i = 0; i < 5; i++) {
     pos.push({x: 1, y: 2, z: 10})
}
for (let i = 0; i < 5; i++) {
     pos.push({x: 1, y: 2, z: 0})
}

const nonExistent = pos.lastIndexOf(p => p.z === 100)
console.log(nonExistent) // output: -1

const exists = pos.lastIndexOf(p => p.z === 10)
console.log(exists) // output: 4
```
<a name="module_vec-struct..Vec+reduce"></a>

#### vec.reduce(callback, initialValue) ⇒ <code>YourCallbackReturnValue</code>
Executes a user-supplied "reducer" callback
function on each element of the vec,
in order, passing in the return value from the
calculation on the preceding element. The
final result of running the reducer across
all elements of the vec is a single value.

NOTE: this implementation is slightly different
than the standard vec "reduce" as an initial
value is required

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>YourCallbackReturnValue</code> - The value that results from
running the "reducer" callback function
to completion over the entire vec.  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>ReduceCallback.&lt;StructDef, YourCallbackReturnValue&gt;</code> | A "reducer" function that takes four arguments: - ```previousValue``` the value resulting from the previous call to callbackFn. - ```currentValue``` The current element being processed - ```currentIndex``` (optional) The index of the current element being processed in the vec. - ```vec``` (optional) The vec which method was called upon. |
| initialValue | <code>YourCallbackReturnValue</code> | A value to which previousValue is initialized the first time the callback is called. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const pos = PositionsV()
for (let i = 0; i < 5; i++) {
     pos.push({x: 1, y: 2, z: 10})
}
const value = pos.reduce(p => {
     return p.x + p.y + p.z
}, 0)
console.log(value) // output: 65
```
<a name="module_vec-struct..Vec+reduceRight"></a>

#### vec.reduceRight(callback, initialValue) ⇒ <code>YourCallbackReturnValue</code>
Applies a function against an accumulator
and each value of the array
(from right-to-left) to reduce it to a single value.

NOTE: this implementation is slightly different
than the standard array "reduceRight", as an initial
value is required

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>YourCallbackReturnValue</code> - The value that results from
running the "reducer" callback function
to completion over the entire vec.  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>ReduceCallback.&lt;StructDef, YourCallbackReturnValue&gt;</code> | A "reducer" function that takes four arguments: - ```previousValue``` the value resulting from the previous call to callbackFn. - ```currentValue``` The current element being processed - ```currentIndex``` (optional) The index of the current element being processed in the vec. - ```vec``` (optional) The vec which method was called upon. |
| initialValue | <code>YourCallbackReturnValue</code> | A value to which previousValue is initialized the first time the callback is called. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const pos = PositionsV()
for (let i = 0; i < 5; i++) {
     pos.push({x: 1, y: 2, z: 10})
}
const value = pos.reduceRight(p => {
     return p.x + p.y + p.z
}, 0)
console.log(value) // output: 65
```
<a name="module_vec-struct..Vec+every"></a>

#### vec.every(callback) ⇒ <code>boolean</code>
Tests whether all elements in the vec pass the
test implemented by the provided function.
It returns a Boolean value.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>TruthyIterCallback.&lt;StructDef&gt;</code> | A function to test for each element, taking three arguments: - ```element``` The current element being processed in the - ```index``` (optional) The index of the current element being processed in the vec. - ```vec``` (optional) The vec which method was called upon. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const pos = PositionsV()
for (let i = 0; i < 5; i++) {
     pos.push({x: 1, y: 2, z: 10})
}

const everyZis100 = pos.every(p => p.z === 100)
console.log(everyZis100) // output: false

const everyZis10 = pos.every(p => p.z === 10)
console.log(everyZis10) // output: 10
```
<a name="module_vec-struct..Vec+some"></a>

#### vec.some(callback) ⇒ <code>boolean</code>
Tests whether at least one element in
the vec passes the test implemented
by the provided function. It returns true
if, in the vec, it finds an element for
which the provided function returns true;
otherwise it returns false. It does not
modify the vec.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>TruthyIterCallback.&lt;StructDef&gt;</code> | A function to test for each element, taking three arguments: - ```element``` The current element being processed - ```index``` (optional) The index of the current element being processed in the vec. - ```vec``` (optional) The vec which method was called upon. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const pos = PositionsV()
for (let i = 0; i < 5; i++) {
     pos.push({x: 1, y: 2, z: 10})
}
pos.push({x: 1, y: 5, z: 0})

const z100Exists = pos.some(p => p.z === 100)
console.log(z100Exists) // output: false

const y5Exists = pos.some(p => p.y === 5)
console.log(y5Exists) // output: true
```
<a name="module_vec-struct..Vec+entries"></a>

#### vec.entries() ⇒ <code>Iterator.&lt;Array.&lt;number, Struct.&lt;StructDef&gt;&gt;&gt;</code>
Returns a new vec Iterator object that
contains the key/value pairs for each
index in the vec.

PERFORMANCE-TIP: Vecs are very slow when using
the ES6 for...of looping syntax. Imperative iteration
and higher-order (forEach, map, etc.) iterators are
far more efficient.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Iterator.&lt;Array.&lt;number, Struct.&lt;StructDef&gt;&gt;&gt;</code> - A new vec iterator object  
**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const pos = PositionsV()
for (let i = 0; i < 5; i++) {
     pos.push({x: 1, y: 2, z: 10})
}

for (const [index, element] of pos.entries()) {
     console.log(typeof index) // output: number
     console.log(element) // output: {x: 1, y: 2, z: 10}
}
```
<a name="module_vec-struct..Vec+keys"></a>

#### vec.keys() ⇒ <code>Iterator.&lt;number&gt;</code>
Returns a new Array Iterator object that
contains the keys for each index in the array.

PERFORMANCE-TIP: Vecs are very slow when using
the ES6 for...of looping syntax. Imperative iteration
and higher-order (forEach, map, etc.) iterators are
far more efficient.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Iterator.&lt;number&gt;</code> - A new vec iterator object  
**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const pos = PositionsV()
for (let i = 0; i < 5; i++) {
     pos.push({x: 1, y: 2, z: 10})
}

for (const index of pos.keys()) {
     console.log(typeof index) // output: number
}
```
<a name="module_vec-struct..Vec+values"></a>

#### vec.values() ⇒ <code>Iterator.&lt;Struct.&lt;StructDef&gt;&gt;</code>
Returns a new array iterator object that
contains the values for each index in the array.

PERFORMANCE-TIP: Vecs are very slow when using
the ES6 for...of looping syntax. Imperative iteration
and higher-order (forEach, map, etc.) iterators are
far more efficient.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Iterator.&lt;Struct.&lt;StructDef&gt;&gt;</code> - A new vec iterator object  
**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const pos = PositionsV()
for (let i = 0; i < 5; i++) {
     pos.push({x: 1, y: 2, z: 10})
}

for (const element of pos.values()) {
     console.log(element) // output: {x: 1, y: 2, z: 10}
}
```
<a name="module_vec-struct..Vec+slice"></a>

#### vec.slice([start], [end]) ⇒ <code>Vec.&lt;StructDef&gt;</code>
Returns a deep copy of a portion
of an vec into a new vec object selected from
start to end (end not included) where start and end
represent the index of items in that vec. The original
vec will not be modified

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Vec.&lt;StructDef&gt;</code> - A new vec containing the extracted elements.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [start] | <code>number</code> | <code>0</code> | Zero-based index at which to start extraction. A negative index can be used, indicating an offset from the end of the sequence. slice(-2) extracts the last two elements in the sequence. If start is undefined, slice starts from the index 0. If start is greater than the index range of the sequence, an empty vec is returned. |
| [end] | <code>number</code> | <code>vec.length</code> | Zero-based index at which to start extraction. A negative index can be used, indicating an offset from the end of the sequence. slice(-2) extracts the last two elements in the sequence. If start is undefined, slice starts from the index 0. If start is greater than the index range of the sequence, an empty vec is returned. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const pos = PositionsV(15).fill({x: 1, y: 2, z: 10})

const posCopy = pos.slice()
console.log(posCopy.length) // output: 15
posCopy.forEach(p => {
     console.log(p.e)// output: {x: 1, y: 2, z: 10}
})

```
<a name="module_vec-struct..Vec+copyWithin"></a>

#### vec.copyWithin(target, [start], [end]) ⇒ <code>Vec.&lt;StructDef&gt;</code>
Shallow copies part of an vec to another location in the
same vec and returns it without modifying its length.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Vec.&lt;StructDef&gt;</code> - The modified vec.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| target | <code>number</code> |  | Zero-based index at which to copy the sequence to. If negative, target will be counted from the end. If target is at or greater than vec.length, nothing will be copied. If target is positioned after start, the copied sequence will be trimmed to fit vec.length. |
| [start] | <code>number</code> | <code>0</code> | Zero-based index at which to start copying elements from. If negative, start will be counted from the end. If start is omitted, copyWithin will copy from index 0. |
| [end] | <code>number</code> | <code>vec.length</code> | Zero-based index at which to end copying elements from. copyWithin copies up to but not including end. If negative, end will be counted from the end. If end is omitted, copyWithin will copy until the last index (default to vec.length). |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})

        // copy position to 0 elements 2, 3, 4
        p.copyWithin(0, 2, p.length)

        console.log(p.index(0).e) // output: {x: 2, y: 4, z: 10}
        console.log(p.index(1).e) // output: {x: 233, y: 31, z: 99}
        console.log(p.index(2).e) // output: {x: 122, y: 23, z: 8}
        console.log(p.index(3).e) // output: {x: 233, y: 31, z: 99}
        console.log(p.index(4).e) // output: {x: 122, y: 23, z: 8}
```
<a name="module_vec-struct..Vec+reserve"></a>

#### vec.reserve(additional) ⇒ <code>Vec.&lt;StructDef&gt;</code>
Tries to reserve capacity for at least additional more
elements to be inserted in the given vec.
After calling reserve, capacity will be greater than or
equal to vec.length + additional.
Does nothing if capacity is already sufficient.

If runtime will not allocate any more memory, an error is thrown.

PERFORMANCE-TIP: use this method before adding many elements
to a vec to avoid resizing multiple times.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Vec.&lt;StructDef&gt;</code> - The expanded vec.  

| Param | Type | Description |
| --- | --- | --- |
| additional | <code>number</code> | The amount of elements to allocate memory for. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})

// initialize with space for 15 elements
const p = new PositionV(15)
console.log(p.capacity) // output: 15

// make space for 100 more elements
p.reserve(100)
console.log(p.capacity) // output: 115
```
<a name="module_vec-struct..Vec+reverse"></a>

#### vec.reverse() ⇒ <code>Vec.&lt;StructDef&gt;</code>
Reverses an vec in place. The first vec
element becomes the last, and the last vec element
becomes the first.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Vec.&lt;StructDef&gt;</code> - The reversed vec.  
**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})

        p.reverse()

        console.log(p.index(0).e) // output: {x: 122, y: 23, z: 8}
        console.log(p.index(1).e) // output: {x: 233, y: 31, z: 99}
        console.log(p.index(2).e) // output: {x: 2, y: 4, z: 10}
        console.log(p.index(3).e) // output: {x: 1, y: 3, z: 0}
        console.log(p.index(4).e) // output: {x: 2, y: 3, z: 8}
```
<a name="module_vec-struct..Vec+concat"></a>

#### vec.concat(...vecs) ⇒ <code>Vec.&lt;StructDef&gt;</code>
Merge two or more vec.
This method does not change the existing vec,
but instead returns a new vec.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Vec.&lt;StructDef&gt;</code> - A new vec instance.  

| Param | Type | Description |
| --- | --- | --- |
| ...vecs | <code>Vec.&lt;StructDef&gt;</code> | Vecs to concatenate into a new vec. If all value parameters are omitted, concat returns a deep copy of the existing vec on which it is called. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})

const pos = new PositionsV(3).fill({x: 1, y: 1, z: 1})
const pos1 = new PositionsV(2).fill({x: 2, y: 1, z: 1})
const pos2 = new PositionsV(4).fill({x: 3, y: 1, z: 1})

const pos3 = pos.concat(pos1, pos2)
console.log(pos3.length) // output: 9

console.log(pos3 !== pos2) // output: true
console.log(pos3 !== pos1) // output: true
console.log(pos3 !== pos) // output: true

console.log(pos3.index(0).e) // output: {x: 1, y: 1, z: 1}
console.log(pos3.index(3).e) // output: {x: 2, y: 1, z: 1}
console.log(pos3.index(5).e) // output: {x: 3, y: 1, z: 1}
```
<a name="module_vec-struct..Vec+pop"></a>

#### vec.pop() ⇒ <code>Struct.&lt;StructDef&gt;</code> \| <code>undefined</code>
Removes the last element from an vec and returns
that element. This method changes the length of
the vec.

PERFORMANCE-TIP: use the ```truncate``` method
if you want to efficiently remove many elements from the back,
instead of using a loop with the ```pop``` method.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Struct.&lt;StructDef&gt;</code> \| <code>undefined</code> - The removed element from the vec;
undefined if the vec is empty  
**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})

        console.log(p.pop()) // output: {x: 122, y: 23, z: 8}
        console.log(p.length) // output: 4

        console.log(p.pop()) // output: {x: 233, y: 31, z: 99}
        console.log(p.length) // output: 3

        // pop rest of elements
        p.pop(); p.pop(); p.pop();
        console.log(p.length) // output: 0

        console.log(p.pop()) // output: undefined
        console.log(p.length) // output: 0
```
<a name="module_vec-struct..Vec+truncate"></a>

#### vec.truncate(count) ⇒ <code>number</code>
Removes the last n elements from an vec and returns
the new length of the vec. If no elements are present
in vec, this is a no-op.

PERFORMANCE-TIP: use the this method
if you want to efficiently remove many elements from the back,
instead the ```pop``` method.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>number</code> - New length of the vec  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>number</code> | number of elements to remove |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})

        const newLen = p.truncate(p.length)
        console.log(newLen) // output: 0
        console.log(p.length) // output: 0
```
<a name="module_vec-struct..Vec+fill"></a>

#### vec.fill(value, [start], [end]) ⇒ <code>Vec.&lt;StructDef&gt;</code>
Changes all elements in an vec to a static value,
from a start index (default 0) to an
end index (default vec.capacity).
It returns the modified vec.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Vec.&lt;StructDef&gt;</code> - The modified vec.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| value | <code>Struct.&lt;StructDef&gt;</code> |  | Value to fill the vec with. Note: all elements in the vec will be a copy of this value. |
| [start] | <code>number</code> | <code>0</code> | Start index (inclusive), default 0. |
| [end] | <code>number</code> | <code>vec.capacity</code> | End index (exclusive), default vec.capacity. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV(15).fill({x: 1, y: 1, z: 1})
console.log(p.length) // output: 15

p.forEach(pos => {
     console.log(pos.e) // output: {x: 1, y: 1, z: 1}
})
```
<a name="module_vec-struct..Vec+push"></a>

#### vec.push(...structs) ⇒ <code>number</code>
Adds one or more elements to the end of an Vec
and returns the new length of the Vec.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>number</code> - the new length of the vec  

| Param | Type | Description |
| --- | --- | --- |
| ...structs | <code>Struct.&lt;StructDef&gt;</code> | the element(s) to add to the end of a vec. Element(s) must conform to the struct def, available through the "def" property. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV()
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10}, {x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})

        console.log(p.length) // output: 5

        console.log(p.index(0).e) // output: {x: 2, y: 3, z: 8}
        console.log(p.index(4).e) // output: {x: 122, y: 23, z: 8}
```
<a name="module_vec-struct..Vec+splice"></a>

#### vec.splice(start, [deleteCount], ...items) ⇒ <code>Vec.&lt;StructDef&gt;</code>
Changes the contents of an vec by removing or
replacing existing elements and/or adding new elements in place.
To access part of an vec without modifying it, see slice().

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Vec.&lt;StructDef&gt;</code> - A vec containing the deleted elements.

If only one element is removed, an vec of one element is
returned.

If no elements are removed, an empty vec is returned.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| start |  |  | The index at which to start changing the vec. If greater than the largest index, no operation is be performed and an empty vec is returned. If negative, it will begin that many elements from the end of the vec. (In this case, the origin -1, meaning -n is the index of the nth last element, and is therefore equivalent to the index of vec.length - n.) If start is negative infinity, no operation is be performed and an empty vec is returned. |
| [deleteCount] | <code>number</code> | <code>vec.length</code> | An integer indicating the number of elements in the vec to remove from start. If deleteCount is omitted, or if its value is equal to or larger than vec.length - start (that is, if it is equal to or greater than the number of elements left in the vec, starting at start), then all the elements from start to the end of the vec will be deleted. However, it must not be omitted if there is any item1 parameter. If deleteCount is 0 or negative, no elements are removed. In this case, you should specify at least one new element (see below). |
| ...items | <code>Struct.&lt;StructDef&gt;</code> |  | The elements to add to the vec, beginning from start. If you do not specify any elements, splice() will only remove elements from the vec. |

**Example** *(Removing Elements)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})

        p.splice(1, 2)
        console.log(p.length) // output: 3

        console.log(p.index(0).e) // output: {x: 2, y: 3, z: 8}
        console.log(p.index(1).e) // output: {x: 233, y: 31, z: 99}
        console.log(p.index(2).e) // output: {x: 122, y: 23, z: 8}
```
**Example** *(Adding Elements)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})

        p.splice(1, 0, {x: 1, y: 1, z: 1}, {x: 2, y: 2, z: 2})
        console.log(p.length) // output: 7

        console.log(p.index(0).e) // output: {x: 2, y: 3, z: 8}
        console.log(p.index(1).e) // output: {x: 1, y: 1, z: 1}
        console.log(p.index(2).e) // output: {x: 2, y: 2, z: 2}
        console.log(p.index(3).e) // output: {x: 1, y: 3, z: 0}
        console.log(p.index(4).e) // output: {x: 2, y: 4, z: 10}
        console.log(p.index(5).e) // output: {x: 233, y: 31, z: 99}
        console.log(p.index(6).e) // output: {x: 122, y: 23, z: 8}
```
**Example** *(Adding and Removing Elements Simultaneously)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})

        p.splice(1, 2, {x: 1, y: 1, z: 1}, {x: 2, y: 2, z: 2})
        console.log(p.length) // output: 5

        console.log(p.index(0).e) // output: {x: 2, y: 3, z: 8}
        console.log(p.index(1).e) // output: {x: 1, y: 1, z: 1}
        console.log(p.index(2).e) // output: {x: 2, y: 2, z: 2}
        console.log(p.index(3).e) // output: {x: 233, y: 31, z: 99}
        console.log(p.index(4).e) // output: {x: 122, y: 23, z: 8}
```
<a name="module_vec-struct..Vec+shift"></a>

#### vec.shift() ⇒ <code>Struct.&lt;StructDef&gt;</code>
Removes the first element from an vec and returns
that removed element. This method changes the length
of the vec

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Struct.&lt;StructDef&gt;</code> - The removed element from the vec;
undefined if the vec is empty  
**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})

        console.log(p.shift()) // output: {x: 2, y: 3, z: 8}
        console.log(p.length) // output: 4

        console.log(p.shift()) // output: {x: 1, y: 3, z: 0}
        console.log(p.length) // output: 3

        // shift rest of elements
        p.shift(); p.shift(); p.shift();
        console.log(p.length) // output: 0

        console.log(p.shift()) // output: undefined
        console.log(p.length) // output: 0
```
<a name="module_vec-struct..Vec+unshift"></a>

#### vec.unshift(...structs) ⇒ <code>number</code>
Adds one or more elements to the beginning of an
vec and returns the new length of the vec.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>number</code> - The new length of the vec.  

| Param | Type | Description |
| --- | --- | --- |
| ...structs | <code>Struct.&lt;StructDef&gt;</code> | The element(s) to add to the front of the vec |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV()
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})

        p.unshift({x: 2, y: 4, z: 10})
        p.unshift({x: 2, y: 3, z: 8}, {x: 1, y: 3, z: 0})

        console.log(p.length) // output: 5

        console.log(p.index(0).e) // output: {x: 2, y: 3, z: 8}
        console.log(p.index(1).e) // output: {x: 1, y: 3, z: 0}
        console.log(p.index(2).e) // output: {x: 2, y: 4, z: 10}
        console.log(p.index(3).e) // output: {x: 233, y: 31, z: 99}
        console.log(p.index(4).e) // output: {x: 122, y: 23, z: 8}
```
<a name="module_vec-struct..Vec+shrinkTo"></a>

#### vec.shrinkTo([minCapacity]) ⇒ <code>Vec.&lt;StructDef&gt;</code>
Shrinks the capacity of the vec with a lower bound.

The capacity will remain at least as large as both
the length and the supplied value.

If the current capacity is less than the lower limit,
this is a no-op.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Vec.&lt;StructDef&gt;</code> - The shrunken vec.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [minCapacity] | <code>number</code> | <code>15</code> | the maximum amount of elements a vec can hold before needing to resize. If negative, it will default to zero. If omitted, defaults to 15. |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})

// initialize with space for 15 elements
const p = new PositionV(15)
console.log(p.capacity) // output: 15

// shrink so that vec can only carry 10
// additional elements
p.shrinkTo(10)
console.log(p.capacity) // output: 10
```
<a name="module_vec-struct..Vec+sort"></a>

#### vec.sort(compareFn) ⇒ <code>Vec.&lt;StructDef&gt;</code>
Sorts the elements of an array in place and
returns the sorted array.

The underlying algorithm
used is "bubble sort", with a time-space complexity
between O(n^2) and O(n).

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Vec.&lt;StructDef&gt;</code> - The sorted vec. Note that the vec
is sorted in place, and no copy is made.  

| Param | Type | Description |
| --- | --- | --- |
| compareFn | <code>SortCompareCallback</code> | Specifies a function that defines the sort order. Takes two arguments and returns a number: ```a``` The first element for comparison. ```b``` The second element for comparison. If return value is bigger than 0, ```b``` will be sorted before ```a```. If return value is smaller than 0, ```a``` will be sorted before ```b```. Otherwise if return is 0, order of the elements will not change. |

**Example** *(Ascending Order)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV()
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})

        console.log(p.length) // output: 5

        p.sort((a, b) => {
            // if a's "x" field is larger than b's
            // swap the position of a and b
            if (a.x > b.x) {
                return 1
            }
            // otherwise keep the same order
            return 0
        })

        console.log(p.index(0).e) // output: {x: 1, y: 3, z: 0}
        console.log(p.index(1).e) // output: {x: 2, y: 3, z: 8}
        console.log(p.index(2).e) // output: {x: 2, y: 4, z: 10}
        console.log(p.index(3).e) // output: {x: 122, y: 23, z: 8}
        console.log(p.index(4).e) // output: {x: 233, y: 31, z: 99}
```
**Example** *(Descending Order)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV()
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})

        console.log(p.length) // output: 5

        p.sort((a, b) => {
            // if a's "x" field is smaller than b's
            // swap the position of a and b
            if (a.x < b.x) {
                return -1
            }
            // otherwise keep the same order
            return 0
        })

        console.log(p.index(0).e) // output: {x: 233, y: 31, z: 99}
        console.log(p.index(1).e) // output: {x: 122, y: 23, z: 8}
        console.log(p.index(2).e) // output: {x: 2, y: 3, z: 8}
        console.log(p.index(3).e) // output: {x: 2, y: 4, z: 10}
        console.log(p.index(4).e) // output: {x: 1, y: 3, z: 0}
```
<a name="module_vec-struct..Vec+swap"></a>

#### vec.swap(aIndex, bIndex) ⇒ <code>Vec.&lt;StructDef&gt;</code>
Swaps the position of two elements. If inputted index
is negative it will be counted from the back of the
vec (vec.length + index)

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Vec.&lt;StructDef&gt;</code> - the vec with swapped elements  

| Param | Type | Description |
| --- | --- | --- |
| aIndex | <code>number</code> | the index of the first element to swap |
| bIndex | <code>number</code> | the index of the second element to swap |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV()
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})

        p.swap(0, 2)
        console.log(p.index(0).e) // output: {x: 2, y: 4, z: 10}
        console.log(p.index(2).e) // output: {x: 2, y: 3, z: 8}

        p.swap(1, 3)
        console.log(p.index(1).e) // output: {x: 233, y: 31, z: 99}
        console.log(p.index(3).e) // output: {x: 1, y: 3, z: 0}
```
<a name="module_vec-struct..Vec+toJSON"></a>

#### vec.toJSON() ⇒ <code>string</code>
Returns a stringified version of the
vec it's called on.

Can be re-parsed into vec via the ```Vec.fromString```
static method.

NOTE: if any of the underlying memory is set to
`NaN` (via setting with an incorrect type for example)
it will be coerced to 0

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>string</code> - a string version of a vec  
**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV(20).fill({x: 1, y: 1, z: 1})

console.log(p.length) // output: 20
p.forEach(pos => {
     console.log(pos.e) // output: {x: 1, y: 1, z: 1}
})

const vecString = p.toJSON()
console.log(typeof vecString) // output: "string"
// create vec from string representation
const jsonVec = PositionV.fromString(vecString)

console.log(jsonVec.length) // output: 20
jsonVec.forEach(pos => {
     console.log(pos.e) // output: {x: 1, y: 1, z: 1}
})
```
<a name="module_vec-struct..Vec+detachedCursor"></a>

#### vec.detachedCursor(index) ⇒ <code>DetachedVecCursor</code>
Creates an cursor that can be used to inspect/mutate
a vec, independent of the vec. It has
identical functionality as the ```Vec.index``` method,
expect that you can use it without the vec.

**Kind**: instance method of [<code>Vec</code>](#module_vec-struct..Vec)  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | what index should the cursor initially point at |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const p = new PositionV()
p.push(
     {x: 1, y: 1, z: 1},
     {x: 2, y: 2, z: 2},
     {x: 3, y: 3, z: 3},
)

// create a cursor and point it at index
// 0
const cursorA = p.detachedCursor(0)
// create a cursor and point it at index
// 1
const cursorB = p.detachedCursor(1)

console.log(cursorA.e) // {x: 1, y: 1, z: 1}
console.log(cursorB.e) // {x: 2, y: 2, z: 2}
console.log(p.index(2).e) // {x: 3, y: 3, z: 3}

// works like the "index" method of vecs
// but can be used independantly
cursorA.index(2).x = 55
console.log(p.index(2).e) // {x: 55, y: 3, z: 3}
console.log(cursorA.e) // {x: 55, y: 3, z: 3}
```
<a name="module_vec-struct..Vec.def"></a>

#### Vec.def : <code>Readonly.&lt;StructDef&gt;</code>
The definition of an individual
struct (element) in a vec class.

**Kind**: static property of [<code>Vec</code>](#module_vec-struct..Vec)  
<a name="module_vec-struct..Vec.elementSize"></a>

#### Vec.elementSize : <code>Readonly.&lt;number&gt;</code>
The amount of raw memory an individual
struct (element of a vec) requires for vecs of this class.
An individual block of memory corresponds to
4 bytes (32-bits).

For example if ```elementSize``` is 2, each struct
will take 8 bytes.

**Kind**: static property of [<code>Vec</code>](#module_vec-struct..Vec)  
<a name="module_vec-struct..Vec.isVec"></a>

#### Vec.isVec(candidate) ⇒ <code>boolean</code>
Checks if input is a of Vec type.

If using the static method on generated
class, it will check if input is of same
Vec Type of generated class.

If using the
static method on the `Vec` class exported
from this package, then it will check if
input is of type `Vec` (more general).

**Kind**: static method of [<code>Vec</code>](#module_vec-struct..Vec)  

| Param | Type | Description |
| --- | --- | --- |
| candidate | <code>any</code> | the value to test |

**Example** *(Basic Usage)*  
```js
import {vec, Vec} from "struct-vec"
const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const CatsV = vec({cuteness: "f32", isDangerous: "bool"})

const cats = new CatsV()
const positions = new PositionsV()

// base class method checks if
// input is a vec type
console.log(Vec.isVec(cats)) // output: true
console.log(Vec.isVec(positions)) // output: true

// generated class method checks
// if input is the same Vec type
// as generated class
// equivalent to instanceof operator
console.log(CatsV.isVec(cats)) // output: true
console.log(CatsV.isVec(positions)) // output: false

console.log(PositionV.isVec(cats)) // output: false
console.log(PositionV.isVec(positions)) // output: true
```
<a name="module_vec-struct..Vec.fromMemory"></a>

#### Vec.fromMemory(memory) ⇒ <code>Vec.&lt;StructDef&gt;</code>
An alternate constructor for vecs.
This constructor creates a vec from
another vec's memory.

This constructor is particularly useful
when multithreading. One can send the memory
(```memory``` property) of a vec on one thread
to another, via ```postMessage``` and initialize
an identical vec on the receiving thread through
this constructor.

Vec memory is backed by ```SharedArrayBuffer```s,
so sending it between workers and the main thread is
a zero-copy operation. In other words, vec memory
is always sent by reference when using the ```postMessage```
method of ```Worker```s.

**Kind**: static method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Vec.&lt;StructDef&gt;</code> - A new vec  

| Param | Type | Description |
| --- | --- | --- |
| memory | <code>ReadonlyInt32Array</code> | memory of another Vec of the same kind |

**Example** *(Multithreading)*  
```js
// ------------ index.mjs ---------------
import {vec} from "struct-vec"
const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const positions = new PositionV(10_000).fill(
     {x: 1, y: 1, z: 1}
)

const worker = new Worker("worker.mjs", {type: "module"})
// pass by reference, no copying
worker.postMessage(positions.memory)

// ------------ worker.mjs ---------------
import {vec} from "struct-vec"
const PositionV = vec({x: "f32", y: "f32", z: "f32"})

self.onmessage = (message) => {
     PositionV.fromMemory(message.data).forEach((pos) => {
         pos.x += 1
         pos.y += 2
         pos.z += 3
     })
}
```
<a name="module_vec-struct..Vec.fromArray"></a>

#### Vec.fromArray(structArray) ⇒ <code>Vec.&lt;StructDef&gt;</code>
An alternate constructor for vecs.
Creates a vec from inputted
array, if all elements of array are compliant
with struct def of given vec class.

**Kind**: static method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Vec.&lt;StructDef&gt;</code> - A new vec  

| Param | Type | Description |
| --- | --- | --- |
| structArray | <code>Array.&lt;Struct.&lt;StructDef&gt;&gt;</code> | array from which to construct the vec. |

**Example** *(Basic Usage)*  
```js
import {vec, Vec} from "struct-vec"

const PositionV = vec({x: "f32", y: "f32", z: "f32"})
const arr = new Array(15).fill({x: 1, y: 2, z: 3})

const positions = PositionsV.fromArray(arr)
console.log(Vec.isVec(positions)) // output: true
```
<a name="module_vec-struct..Vec.fromString"></a>

#### Vec.fromString(vecString) ⇒ <code>Vec.&lt;StructDef&gt;</code>
An alternate constructor for vecs.
Creates a new vec instance from an inputted
string.

String should be a stringified vec. One
can stringify any vec instance by calling the
```toJSON``` method.

**Kind**: static method of [<code>Vec</code>](#module_vec-struct..Vec)  
**Returns**: <code>Vec.&lt;StructDef&gt;</code> - A new vec  

| Param | Type | Description |
| --- | --- | --- |
| vecString | <code>string</code> | a stringified vec |

**Example** *(Basic Usage)*  
```js
import {vec, Vec} from "struct-vec"

const geoCoordinates = vec({latitude: "f32", longitude: "f32"})

const geo = new geoCoordinates(15).fill({
            latitude: 20.10,
            longitude: 76.52
        })
const string = JSON.stringify(geo)
const parsed = JSON.parse(string)

const geoCopy = geoCoordinates.fromString(parsed)
console.log(Vec.isVec(geoCopy)) // output: true
```
<a name="module_vec-struct..validateStructDef"></a>

### vec-struct~validateStructDef(def) ⇒ <code>boolean</code>
A helper function to validate an inputted struct
definition. If inputted struct def is valid
the function true, otherwise it will return
false.

**Kind**: inner method of [<code>vec-struct</code>](#module_vec-struct)  

| Param | Type | Description |
| --- | --- | --- |
| def | <code>any</code> | the struct definition to be validated |

**Example** *(Basic Usage)*  
```js
import {validateStructDef} from "vec-struct"

console.log(validateStructDef(null)) // output: false
console.log(validateStructDef(true)) // output: false
console.log(validateStructDef("def")) // output: false
console.log(validateStructDef({x: "randomType"})) // output: false
console.log(validateStructDef({x: {y: "f32"}})) // output: false

console.log(validateStructDef({x: "f32"})) // output: true
console.log(validateStructDef({code: "f32"})) // output: true
```
<a name="module_vec-struct..vec_gen"></a>

### vec-struct~vec(structDef, [options]) ⇒ <code>VecClass.&lt;StructDef&gt;</code>
A vec compiler that can be used at runtime.
Creates class definitions for growable array-like
data structure (known as a vector or vec for short) that
hold fixed-sized objects (known as structs) from
your inputted struct definition.

Vecs are backed by SharedArrayBuffers and therefore
can be passed across threads with zero serialization
cost.

SAFETY-NOTE: this compiler uses the unsafe `Function`
constructor internally. Use`vecCompile` if you
wish to avoid unsafe code. Do note, that `vecCompile`
can only be used at build time.

NOTE: vecs carry fixed-sized, strongly-typed
elements that cannot be change once the class is
created, unlike normal arrays.

**Kind**: inner method of [<code>vec-struct</code>](#module_vec-struct)  
**Returns**: <code>VecClass.&lt;StructDef&gt;</code> - A class that creates vecs which conform
to inputted def  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| structDef | <code>StructDef</code> |  | a type definition for the elements to be carried by an instance of the generated vec class |
| [options] | <code>Object</code> |  |  |
| [options.className] | <code>string</code> | <code>&quot;AnonymousVec&quot;</code> | the value of the generated class's `name` property. Useful for debugging |

**Example** *(Basic Usage)*  
```js
import {vec} from "struct-vec"

// create Vec definition
const PositionV = vec({x: "f32", y: "f32", z: "f32"})
// now initialize like a normal class
const p = new PositionV()

const geoCoordinates = vec({latitude: "f32", longitude: "f32"})
const geo = new geoCoordinates(15).fill({latitude: 1, longitude: 1})

// invalid struct defs throws error
const errClass = vec(null) // SyntaxError
const errClass2 = vec({x: "unknownType"}) // SyntaxError
```
<a name="module_vec-struct..vec_genCompile"></a>

### vec-struct~vecCompile(structDef, pathToLib, [options]) ⇒ <code>string</code>
A vec compiler that can be used at build time.
Creates class definitions for growable array-like
data structure (known as a vector or vec for short) that
hold fixed-sized objects (known as structs) from
your inputted struct definition.

Class definitions created by this compiler are the exact same
as the one's created by the runtime compiler.

Vecs are backed by SharedArrayBuffers and therefore
can be passed across threads with zero serialization
cost.

NOTE: this compiler does not come will any command line
tool, so you as the user must decide how to generate
and store the vec classes emitted by this compiler.

NOTE: vecs carry fixed-sized, strongly-typed
elements that cannot be change once the class is
created, unlike normal arrays.

**Kind**: inner method of [<code>vec-struct</code>](#module_vec-struct)  
**Returns**: <code>string</code> - a string rendition of vec class  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| structDef | <code>StructDef</code> |  | a type definition for the elements to be carried by an instance of the generated vec class. |
| pathToLib | <code>string</code> |  | where the "struct-vec" library is located use the full url if using compiler in web (without build tool) or deno. |
| [options] | <code>Object</code> |  |  |
| [options.bindings] | <code>&quot;js&quot;</code> \| <code>&quot;ts&quot;</code> | <code>&quot;js&quot;</code> | what language should vec class be generated in. Choose either "js" (javascript) or "ts" (typescript). Defaults to "js". |
| [options.exportSyntax] | <code>&quot;none&quot;</code> \| <code>&quot;named&quot;</code> \| <code>&quot;default&quot;</code> | <code>&quot;none&quot;</code> | what es6 export syntax should class be generated with. Choose either "none" (no import statement with class), "named" (use the "export" syntax), or "default" (use "export default" syntax). Defaults to "none". |
| [options.className] | <code>string</code> | <code>&quot;AnonymousVec&quot;</code> | the name of the generated vec class. Defaults to "AnonymousVec". |

**Example** *(Basic Usage)*  
```js
import fs from "fs"
import {vecCompile} from "struct-vec"

// the path to the "struct-vec" library.
// For the web or deno, you would
// put the full url to the library.
const LIB_PATH = "struct-vec"

// create Vec definition
const def = {x: "f32", y: "f32", z: "f32"}
const GeneratedClass = vecCompile(def, LIB_PATH, {
     // create a typescript class
     lang: "ts",
     // export the class with "export default"
     // syntax
     exportSyntax: "default",
     className: "GeneratedClass"
})
console.log(typeof GeneratedClass) // output: string
// write the class to disk to use later
// // or in another application
fs.writeFileSync("GeneratedClass", GeneratedClass, {
     encoding: "utf-8"
})
```