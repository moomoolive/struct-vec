/**
 * @module vec-struct
 */
import { Vec as BaseVec, StructDef, Struct, ReadonlyFloat32Array } from "./core";
export { Vec } from "./core";
export type { CursorConstructor, VecCursor, Primitive, Bool, Char, Num, VecPrimitive, ReadonlyFloat32Array, Struct, StructDef, SortCompareCallback, MapCallback, MapvCallback, ForEachCallback, ReduceCallback, TruthyIterCallback } from "./core";
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
 * console.log(validateStructDef({x: {y: "num"}})) // output: false
 *
 * console.log(validateStructDef({x: "num"})) // output: true
 * console.log(validateStructDef({code: "num"})) // output: true
 * ```
 */
export declare function validateStructDef(def: any): boolean;
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
 * @returns {VecClass<StructDef>} A class that creates vecs which conform
 * to inputted def
 *
 * @example <caption>Basic Usage</caption>
 * ```js
 * import {vec} from "struct-vec"
 *
 * // create Vec definition
 * const PositionV = vec({x: "num", y: "num", z: "num"})
 * // now initialize like a normal class
 * const p = new PositionV()
 *
 * const geoCoordinates = vec({latitude: "num", longitude: "num"})
 * const geo = new geoCoordinates(15).fill({latitude: 1, longitude: 1})
 *
 * // invalid struct defs throws error
 * const errClass = vec(null) // SyntaxError
 * const errClass2 = vec({x: "unknownType"}) // SyntaxError
 * ```
 */
export declare function vec<S extends StructDef>(structDef: S): VecClass<S>;
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
 * @param {string} [options.className="AnonymousVec"] the name of the generated
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
 * const def = {x: "num", y: "num", z: "num"}
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
export declare function vecCompile(structDef: StructDef, pathToLib: string, options?: Partial<{
    lang: "ts" | "js";
    exportSyntax: "none" | "named" | "default";
    className: string;
}>): string;
export interface VecClass<T extends StructDef> {
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
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const CatsV = vec({cuteness: "num", isDangerous: "bool"})
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
    isVec(candidate: any): boolean;
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
     * const geoCoordinates = vec({latitude: "num", longitude: "num"})
     *
     * // both are valid ways to initialize
     * const withCapacity = new geoCoordinates(100)
     * const without = new geoCoordinates()
     * ```
     */
    new (initialCapacity?: number): BaseVec<T>;
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
     * const PositionV = vec({x: "num", y: "num", z: "num"})
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
     * const PositionV = vec({x: "num", y: "num", z: "num"})
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
    fromMemory(memory: ReadonlyFloat32Array): BaseVec<T>;
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
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const arr = new Array(15).fill({x: 1, y: 2, z: 3})
     *
     * const positions = PositionsV.fromArray(arr)
     * console.log(Vec.isVec(positions)) // output: true
     * ```
     *
     */
    fromArray(array: Struct<T>[]): BaseVec<T>;
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
     * const geoCoordinates = vec({latitude: "num", longitude: "num"})
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
    fromString(vecString: string): BaseVec<T>;
}
declare const _default: {
    vec: typeof vec;
    Vec: typeof BaseVec;
    validateStructDef: typeof validateStructDef;
    vecCompile: typeof vecCompile;
};
export default _default;
//# sourceMappingURL=index.d.ts.map