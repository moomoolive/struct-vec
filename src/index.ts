/**
 * @module vec-struct
 */

// imports should be one line only => for build system
import {Vec as BaseVec} from "./core"
import type {StructDef, Struct, ReadonlyInt32Array} from "./core"
import {tokenizeStructDef, ERR_PREFIX, createVecDef, validateCompileOptions, invalidClassName} from "./compiler"

export {Vec} from "./core"
export type {CursorConstructor, VecCursor, ReadonlyInt32Array, } from "./core"

// Iterator callbacks
export type {SortCompareCallback, MapCallback} from "./core"
export type {ForEachCallback, ReduceCallback} from "./core"
export type {MapvCallback, TruthyIterCallback} from "./core"

// Type system
export type {i32, f32, char, bool} from "./core"
export type {VecPrimitive, Primitive} from "./core"
export type {Struct, StructDef,} from "./core"

/**
 * A helper function to validate an inputted struct
 * definition. If inputted struct def is valid
 * the function true, otherwise it will return 
 * false.
 * 
 * @param {any} def the struct definition to be validated
 * @returns {boolean}
 * 
 * @example <caption>Basic Usage</caption>
 * ```js
 * import {validateStructDef} from "vec-struct"
 * 
 * console.log(validateStructDef(null)) // output: false
 * console.log(validateStructDef(true)) // output: false
 * console.log(validateStructDef("def")) // output: false
 * console.log(validateStructDef({x: "randomType"})) // output: false
 * console.log(validateStructDef({x: {y: "f32"}})) // output: false
 * 
 * console.log(validateStructDef({x: "f32"})) // output: true
 * console.log(validateStructDef({code: "f32"})) // output: true
 * ```
 */
export function validateStructDef(def: any): boolean {
    try {
        tokenizeStructDef(def)
        return true
    } catch {
        return false
    }
}

/**
 * A vec compiler that can be used at runtime.
 * Creates class definitions for growable array-like
 * data structure (known as a vector or vec for short) that
 * hold fixed-sized objects (known as structs) from
 * your inputted struct definition.
 * 
 * Vecs are backed by SharedArrayBuffers and therefore
 * can be passed across threads with zero serialization
 * cost.
 * 
 * SAFETY-NOTE: this compiler uses the unsafe `Function`
 * constructor internally. Use`vecCompile` if you
 * wish to avoid unsafe code. Do note, that `vecCompile`
 * can only be used at build time.
 * 
 * NOTE: vecs carry fixed-sized, strongly-typed
 * elements that cannot be change once the class is
 * created, unlike normal arrays.
 * 
 * @param {StructDef} structDef a type definition for the elements
 * to be carried by an instance of the generated vec
 * class
 * @param {Object} [options]
 * @param {string} [options.className=AnonymousVec] the value
 * of the generated class's `name` property. Useful for debugging
 * @returns {VecClass<StructDef>} A class that creates vecs which conform
 * to inputted def
 * 
 * @example <caption>Basic Usage</caption>
 * ```js
 * import {vec} from "struct-vec"
 * 
 * // create Vec definition
 * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
 * // now initialize like a normal class
 * const p = new PositionV()
 * 
 * const geoCoordinates = vec({latitude: "f32", longitude: "f32"})
 * const geo = new geoCoordinates(15).fill({latitude: 1, longitude: 1})
 * 
 * // invalid struct defs throws error
 * const errClass = vec(null) // SyntaxError
 * const errClass2 = vec({x: "unknownType"}) // SyntaxError
 * ```
 */
export function vec<S extends StructDef>(
    structDef: S,
    options: {
        className?: string
    } = {}
): VecClass<S> {
    if (typeof SharedArrayBuffer === "undefined") {
        throw new Error(`${ERR_PREFIX} sharedArrayBuffers are not supported in this environment and are required for vecs`)
    }
    const tokens = tokenizeStructDef(structDef)
    const {
        className = "AnonymousVec"
    } = options
    if (invalidClassName(className)) {
        throw SyntaxError(`inputted class name (className option) is not a valid javascript class name, got "${className}"`)
    }
    const {def, className: clsName} = createVecDef(tokens, structDef, {
        lang: "js",
        exportSyntax: "none",
        pathToLib: "none",
        className,
        runtimeCompile: true
    })
    const genericVec = Function(`"use strict";return (Vec) => {
        ${def}
        return ${clsName}
    }`)()(BaseVec)
    return genericVec
}

/**
 * A vec compiler that can be used at build time.
 * Creates class definitions for growable array-like
 * data structure (known as a vector or vec for short) that
 * hold fixed-sized objects (known as structs) from
 * your inputted struct definition. 
 * 
 * Class definitions created by this compiler are the exact same
 * as the one's created by the runtime compiler.
 * 
 * Vecs are backed by SharedArrayBuffers and therefore
 * can be passed across threads with zero serialization
 * cost.
 * 
 * NOTE: this compiler does not come will any command line
 * tool, so you as the user must decide how to generate
 * and store the vec classes emitted by this compiler.
 * 
 * NOTE: vecs carry fixed-sized, strongly-typed
 * elements that cannot be change once the class is
 * created, unlike normal arrays.
 * 
 * @param {StructDef} structDef a type definition for the elements
 * to be carried by an instance of the generated vec
 * class.
 * @param {string} pathToLib where the "struct-vec" library is located
 * use the full url if using compiler in web (without build tool)
 * or deno.
 * @param {Object} [options]
 * @param {("js" | "ts")} [options.bindings="js"] what language should vec class 
 * be generated in. Choose either "js" (javascript) or
 * "ts" (typescript). Defaults to "js".
 * @param {("none" | "named" | "default")} [options.exportSyntax="none"] what es6 export
 * syntax should class be generated with. Choose either
 * "none" (no import statement with class), "named" (use
 * the "export" syntax), or "default" (use "export default"
 * syntax). Defaults to "none".
 * @param {string} [options.className=AnonymousVec] the name of the generated
 * vec class. Defaults to "AnonymousVec".
 * @returns {string} a string rendition of vec class
 * 
 * @example <caption>Basic Usage</caption>
 * ```js
 * import fs from "fs"
 * import {vecCompile} from "struct-vec"
 * 
 * // the path to the "struct-vec" library.
 * // For the web or deno, you would
 * // put the full url to the library.
 * const LIB_PATH = "struct-vec"
 * 
 * // create Vec definition
 * const def = {x: "f32", y: "f32", z: "f32"}
 * const GeneratedClass = vecCompile(def, LIB_PATH, {
 *      // create a typescript class
 *      lang: "ts",
 *      // export the class with "export default"
 *      // syntax
 *      exportSyntax: "default",
 *      className: "GeneratedClass"
 * })
 * console.log(typeof GeneratedClass) // output: string
 * // write the class to disk to use later
 * // // or in another application
 * fs.writeFileSync("GeneratedClass.js", GeneratedClass, {
 *      encoding: "utf-8"
 * })
 * ```
 */
export function vecCompile(
    structDef: StructDef,
    pathToLib: string,
    options: Partial<{
        lang: "ts" | "js"
        exportSyntax: "none" | "named" | "default"
        className: string     
    }> = {}
): string {
    const {
        lang = "js", 
        exportSyntax = "none", 
        className = "AnonymousVec"
    } = options
    const compilerArgs = {
        lang, 
        pathToLib, 
        className, 
        exportSyntax,
        runtimeCompile: false
    }
    validateCompileOptions(compilerArgs)
    const tokens = tokenizeStructDef(structDef)
    const {def} = createVecDef(tokens, structDef, compilerArgs)
    return def
}

export interface VecClass<T extends StructDef> {
    /**
     * The definition of an individual 
     * struct (element) in a vec class.
     * @type {StructDef}  
     */ 
    readonly def: StructDef

     /**
      * The amount of raw memory an individual
      * struct (element of a vec) requires for vecs of this class.
      * An individual block of memory corresponds to
      * 4 bytes (32-bits).
      * 
      * For example if ```elementSize``` is 2, each struct
      * will take 8 bytes.
      * 
      * @type {number}
      */
    readonly elementSize: number
    /**
     * Checks if input is a of Vec type.
     * 
     * If using the static method on generated
     * class, it will check if input is of same
     * Vec Type of generated class. 
     * 
     * If using the
     * static method on the `Vec` class exported
     * from this package, then it will check if 
     * input is of type `Vec` (more general).
     * 
     * @param {any} candidate the value to test
     * @returns {boolean}
     * 
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec, Vec} from "struct-vec"
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
     * const CatsV = vec({cuteness: "f32", isDangerous: "bool"})
     * 
     * const cats = new CatsV()
     * const positions = new PositionsV()
     * 
     * // base class method checks if
     * // input is a vec type
     * console.log(Vec.isVec(cats)) // output: true
     * console.log(Vec.isVec(positions)) // output: true
     * 
     * // generated class method checks
     * // if input is the same Vec type
     * // as generated class 
     * // equivalent to instanceof operator
     * console.log(CatsV.isVec(cats)) // output: true
     * console.log(CatsV.isVec(positions)) // output: false
     * 
     * console.log(PositionV.isVec(cats)) // output: false
     * console.log(PositionV.isVec(positions)) // output: true
     * ```
     */
    isVec(candidate: any): boolean
    /**
     * @constructor
     * @param {number} [initialCapacity=15] the amount
     * of capacity to initialize vec with. Defaults to
     * 15.
     * 
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     * 
     * const geoCoordinates = vec({latitude: "f32", longitude: "f32"})
     * 
     * // both are valid ways to initialize
     * const withCapacity = new geoCoordinates(100)
     * const without = new geoCoordinates()
     * ```
     */
    new (initialCapacity?: number): BaseVec<T>
    /**
     * An alternate constructor for vecs.
     * This constructor creates a vec from 
     * another vec's memory.
     * 
     * This constructor is particularly useful
     * when multithreading. One can send the memory
     * (```memory``` property) of a vec on one thread
     * to another, via ```postMessage``` and initialize
     * an identical vec on the receiving thread through
     * this constructor.
     * 
     * Vec memory is backed by ```SharedArrayBuffer```s,
     * so sending it between workers and the main thread is 
     * a zero-copy operation. In other words, vec memory
     * is always sent by reference when using the ```postMessage```
     * method of ```Worker```s.
     * 
     * @param {ReadonlyFloat32Array} memory memory 
     * of another Vec of the same kind
     * @returns {Vec<StructDef>} A new vec
     * 
     * @example <caption>Multithreading</caption>
     * ```js
     * // ------------ index.js ---------------
     * import {vec} from "struct-vec"
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
     * const positions = new PositionV(10_000).fill(
     *      {x: 1, y: 1, z: 1}
     * )
     * 
     * const worker = new Worker("worker.js")
     * // pass by reference, no copying
     * worker.postMessage(positions.memory)
     * 
     * // ------------ worker.js ---------------
     * import {vec} from "struct-vec" // or importScripts if in Firefox
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
     * 
     * self.onmessage = (message) => {
     *      PositionV.fromMemory(message.data).forEach((pos) => {
     *          pos.x += 1
     *          pos.y += 2
     *          pos.z += 3
     *      })
     * }
     * ```
     */
    fromMemory(memory: ReadonlyInt32Array): BaseVec<T>
    /**
     * An alternate constructor for vecs.
     * Creates a vec from inputted
     * array, if all elements of array are compliant 
     * with struct def of given vec class.
     * 
     * @param {Array<Struct<StructDef>>} structArray array 
     * from which to construct the vec.
     * @returns {Vec<StructDef>} A new vec
     * 
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec, Vec} from "struct-vec"
     * 
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
     * const arr = new Array(15).fill({x: 1, y: 2, z: 3})
     * 
     * const positions = PositionsV.fromArray(arr)
     * console.log(Vec.isVec(positions)) // output: true
     * ```
     * 
     */
    fromArray(array: Struct<T>[]): BaseVec<T>
    /**
     * An alternate constructor for vecs.
     * Creates a new vec instance from an inputted
     * string.
     * 
     * String should be a stringified vec. One 
     * can stringify any vec instance by calling the
     * ```toJSON``` method. 
     * 
     * @param {string} vecString a stringified vec
     * @returns {Vec<StructDef>} A new vec
     * 
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec, Vec} from "struct-vec"
     * 
     * const geoCoordinates = vec({latitude: "f32", longitude: "f32"})
     * 
     * const geo = new geoCoordinates(15).fill({
            latitude: 20.10,
            longitude: 76.52
        })
     * const string = JSON.stringify(geo)
     * const parsed = JSON.parse(string)
     * 
     * const geoCopy = geoCoordinates.fromString(parsed)
     * console.log(Vec.isVec(geoCopy)) // output: true
     * ```
     */
    fromString(vecString: string): BaseVec<T>
}

export default {
    vec,
    Vec: BaseVec,
    validateStructDef,
    vecCompile
}
