/**
 * @module vec-struct
 */
export declare const enum encoding {
    bytesIn32Bits = 4,
    memorySize = 2,
    lengthReverseIndex = 1,
    capacityReverseIndex = 2,
    elementSizeJSONReserveIndex = 3,
    JSONMemorySize = 3,
    encodingBytes = 8
}
export declare const enum defaults {
    capacity = 15,
    memoryCollectionLimit = 50,
    spaceCharacteCodePoint = 32
}
export declare const MEMORY_LAYOUT: Float32ArrayConstructor;
export declare const VALID_DATA_TYPES_INTERNAL: readonly ["char", "num", "bool"];
/**
 * The base class that all generated vec
 * classes inherit from.
 *
 * This class isn't intended to be manually
 * inherited from, as the ```vec``` and `vecCompile` functions
 * will automatically inherit this class and
 * generate the necessary override methods
 * based on your struct definition. The class
 * is still made available however as it has
 * some useful static methods, such as:
 *
 * ```isVec``` : can be used
 * to check if a particular type
 * is a vec at runtime, similar to the ```Array.isArray```
 * method.
 *
 * The class is generic over ```T``` which extends
 * the ```StructDef``` type. In other words, the Vec class
 * is type ```Vec<T extends StructDef>```
 */
export declare class Vec<T extends StructDef> {
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
    static isVec(candidate: any): boolean;
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
     * // ------------ index.mjs ---------------
     * import {vec} from "struct-vec"
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const positions = new PositionV(10_000).fill(
     *      {x: 1, y: 1, z: 1}
     * )
     *
     * const worker = new Worker("worker.mjs", {type: "module"})
     * // pass by reference, no copying
     * worker.postMessage(positions.memory)
     *
     * // ------------ worker.mjs ---------------
     * import {vec} from "struct-vec"
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
    static fromMemory<U extends StructDef>(memory: ReadonlyFloat32Array): Vec<U>;
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
    static fromArray<U extends StructDef>(structArray: Struct<U>[]): Vec<U>;
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
    static fromString<U extends StructDef>(vecString: string): Vec<U>;
    private _memory;
    private readonly _cursor;
    private _length;
    private _capacity;
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
    constructor(initialCapacity?: number, memory?: ReadonlyFloat32Array);
    /**
     * The amount of raw memory an individual
     * struct (element of a vec) requires for this vec type.
     * An individual block of memory corresponds to
     * 8 bytes (64-bits).
     *
     * For example if ```elementSize``` is 2, each struct
     * will take 16 bytes.
     *
     * @type {number}
     */
    get elementSize(): number;
    /**
     * The definition of an individual
     * struct (element) in a vec.
     *
     * @type {StructDef}
     */
    get def(): StructDef;
    protected get cursorDef(): CursorConstructor<T>;
    private get cursor();
    /**
     * The number of elements in vec.
     * The value is between 0 and 2^24 (about 16 million),
     * always numerically greater than the
     * highest index in the array.
     *
     * @type {number}
     */
    get length(): number;
    /**
     * The number of elements a vec can
     * hold before needing to resize.
     * The value is between 0 and 2^24 (about 16 million).
     *
     * @example <caption>Expanding Capacity</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const Cats = vec({isCool: "num", isDangerous: "num"})
     * // initialize with a capacity of 15
     * const cats = new Cats(15)
     * // currently the "cats" array can hold
     * // up to 15 elements without resizing
     * // but does not have any elements yet
     * console.log(cats.capacity) // output: 15
     * console.log(cats.length) // output: 0
     *
     * // fill entire capacity with elements
     * cats.fill({isCool: 1, isDangerous: 1})
     * // now the cats array will need to resize
     * // if we attempt to add more elements
     * console.log(cats.capacity) // output: 15
     * console.log(cats.length) // output: 15
     *
     * const capacity = cats.capacity
     * cats.push({isCool: 1, isDangerous: 1})
     * // vec resized capacity to accommodate
     * // for more elements
     * console.log(capacity < cats.capacity) // output: true
     * console.log(cats.length) // output: 16
     * ```
     *
     * @example <caption>Shrinking Capacity</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const Cats = vec({isCool: "num", isDangerous: "num"})
     * // initialize with a capacity of 15
     * const cats = new Cats(15)
     * // currently the "cats" array can hold
     * // up to 15 elements without resizing
     * // but does not have any elements yet
     * console.log(cats.capacity) // output: 15
     * console.log(cats.length) // output: 0
     * for (let i = 0; i < 5; i++) {
     *      cats.push({isCool: 1, isDangerous: 1})
     * }
     *
     * // vec can hold 3x more elements than we need
     * // lets shrink the capacity to be memory efficient
     * console.log(cats.capacity) // output: 15
     * console.log(cats.length) // output: 5
     *
     * // shrink vec memory so that length
     * // and capacity are the same
     * cats.shrinkTo(0)
     * console.log(cats.capacity) // output: 5
     * console.log(cats.length) // output: 5
     * ```
     *
     * @type {number}
     */
    get capacity(): number;
    /**
     * The binary representation
     * of a vec.
     *
     * WARNING: It is never recommended
     * to manually edit the underlying memory,
     * doing so may lead to memory corruption.
     *
     * @type {ReadonlyFloat32Array}
     */
    get memory(): ReadonlyFloat32Array;
    set memory(newMemory: ReadonlyFloat32Array);
    /**
     * Returns a cursor which allows the viewing of
     * the element at the inputted index.
     *
     * NOTE: this method does not return the actual
     * element at the index. In order to get the entire
     * element at a given index you must use the
     * ".e" method on the cursor. If you want one
     * of the fields of the element just reference
     * the field (for example ".x")
     *
     * @param {number} index the index you want to view
     * @returns {VecCursor<StructDef>} A cursor of the target
     * index
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     *
     * const pos = new PositionsV()
     *
     * pos.push({x: 1, y: 1, z: 1})
     * pos.push({x: 1, y: 2, z: 1})
     * pos.push({x: 1, y: 3, z: 1})
     *
     * // get entire element at index 0.
     * // The "e" property comes with all elements
     * // automatically
     * console.log(pos.index(0).e) // output: {x: 1, y: 1, z: 1}
     * console.log(pos.index(1).e) // output: {x: 1, y: 2, z: 1}
     * // get the "y" field of the element
     * // at index 2
     * console.log(pos.index(2).y) // output: 3
     * ```
     */
    index(index: number): VecCursor<T>;
    /**
     * Returns a cursor which allows the viewing of
     * the element at the inputted index.
     *
     * This method is identical to the ```index``` method
     * except that it accepts negative indices. Negative
     * indices are counted from the back of the vec
     * (vec.length + index)
     *
     * PERFORMANCE-TIP: this method is far less efficient
     * than the ```index``` method.
     *
     * NOTE: this method does not return the actual
     * element at the index. In order to get the entire
     * element at a given index you must use the
     * ".e" method on the cursor. If you want one
     * of the fields of the element just reference
     * the field (for example ".x")
     *
     * @param {number} index the index you want to view. Supports
     * negative indices.
     * @returns {VecCursor<StructDef>} A cursor of the target
     * index
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     *
     * const pos = new PositionsV()
     *
     * pos.push({x: 1, y: 1, z: 1})
     * pos.push({x: 1, y: 2, z: 1})
     * pos.push({x: 1, y: 3, z: 1})
     *
     * // get entire element at index 0.
     * // The "e" property comes with all elements
     * // automatically
     * console.log(pos.index(-1).e) // output: {x: 1, y: 3, z: 1}
     * console.log(pos.index(-2).e) // output: {x: 1, y: 2, z: 1}
     * // get the "y" field of the element
     * // at index 2
     * console.log(pos.index(-3).y) // output: 1
     * ```
     */
    at(index: number): VecCursor<T>;
    /**
     * Executes a provided function once for each
     * vec element.
     *
     * @param {ForEachCallback<StructDef>} callback A function to execute
     * for each element taking three arguments:
     *
     * - ```element``` The current element being processed in the
     *
     * - ```index``` (optional) The index of the current element being processed in the vec.
     *
     * - ```vec``` (optional) The vec which method was called upon.
     * @returns {void}
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV(15).fill({x: 1, y: 1, z: 1})
     *
     * pos.forEach((p, i, v) => {
     *      console.log(p.e) // output: {x: 1, y: 1, z: 1}
     * })
     * ```
     */
    forEach(callback: ForEachCallback<T>): void;
    /**
     * Creates a new array populated with the results
     * of calling a provided function on every
     * element in the calling vec.
     *
     * @param {MapCallback<StructDef, YourCallbackReturnValue>} callback Function that is called for every element
     * of vec. Each time callbackFn executes,
     * the returned value is added to new Array.
     * Taking three arguments:
     *
     * - ```element``` The current element being processed
     *
     * - ```index``` (optional) The index of the current element being processed in the vec.
     *
     * - ```vec``` (optional) The vec which method was called upon.
     *
     * @returns {Array<YourCallbackReturnType>} A new array with each element being
     * the result of the callback function.
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV(15).fill({x: 1, y: 1, z: 1})
     * const xVals = pos.map(p => p.x)
     *
     * xVals.forEach((num) => {
     *      console.log(num) // output: 1
     * })
     * ```
     */
    map<U>(callback: MapCallback<T, U>): U[];
    /**
     * Creates a new vec populated with the results
     * of calling a provided function on every
     * element in the calling vec.
     *
     * Essentially ```mapv``` is the same as chaining
     * ```slice``` and ```forEach``` together.
     *
     * @param {MapvCallback<StructDef>} callback Function that is called
     * for every element of vec. Please note that each element
     * is an exact copy of the vec ```mapv``` was called on.
     *
     * Taking three arguments:
     *
     * - ```element``` The current element being processed
     *
     * - ```index``` (optional) The index of the current element being processed in the vec.
     *
     * - ```vec``` (optional) The vec which method was called upon.
     *
     * @returns {Vec<StructDef>} A new vec with each element being the result
     * of the callback function.
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV(15).fill({x: 1, y: 1, z: 1})
     * const yAdd = pos.mapv(p => p.y += 2)
     *
     * yAdd.forEach((p) => {
     *      console.log(p.e) // output: {x: 1, y: 3, z: 1}
     * })
     * pos.forEach((p) => {
     *      console.log(p.e) // output: {x: 1, y: 1, z: 1}
     * })
     * console.log(pos !== yAdd) // output: true
     * ```
     */
    mapv(callback: MapvCallback<T>): Vec<T>;
    /**
     * Creates a new vec with all elements that pass
     * the test implemented by the provided function.
     *
     * @param {TruthyIterCallback<StructDef>} callback A function to test for each element,
     * taking three arguments:
     *
     * - ```element``` The current element being processed
     *
     * - ```index``` (optional) The index of the current element being processed in the vec.
     *
     * - ```vec``` (optional) The vec which method was called upon.
     * @returns {Vec<StructDef>} A new vec with the elements that pass the test.
     * If no elements pass the test, an empty vec will be
     * returned.
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 0})
     * }
     * const bigZs = pos.filter(p => p.z > 5)
     *
     * console.log(bigZs.length) // output: 5
     * bigZs.forEach((p) => {
     *      console.log(p.e) // output: {x: 1, y: 2, z: 10}
     * })
     * console.log(pos.length) // output: 10
     * console.log(pos !== bigZs) // output: true
     * ```
     */
    filter(callback: TruthyIterCallback<T>): Vec<T>;
    /**
     * Returns a vec cursor to the first element in the provided
     * vec that satisfies the provided testing
     * function. If no values satisfy the testing
     * function, undefined is returned.
     *
     * @param {TruthyIterCallback<StructDef>} callback A function to test for each element,
     * taking three arguments:
     *
     * - ```element``` The current element being processed
     *
     * - ```index``` (optional) The index of the current element being processed in the vec.
     *
     * - ```vec``` (optional) The vec which method was called upon.
     * @returns {(VecCursor<StructDef> | undefined)}
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 0})
     * }
     *
     * const nonExistent = pos.find(p => p.z === 100)
     * console.log(nonExistent) // output: undefined
     *
     * const exists = pos.find(p => p.z === 10)
     * console.log(exists.e) // output: {x: 1, y: 2, z: 10}
     * ```
     */
    find(callback: TruthyIterCallback<T>): VecCursor<T> | undefined;
    /**
     * Returns the index of the first element in the
     * vec that satisfies the provided testing function.
     * Otherwise, it returns -1, indicating that no
     * element passed the test
     *
     * @param {TruthyIterCallback<StructDef>} callback A function to test for each element,
     * taking three arguments:
     *
     * - ```element``` The current element being processed
     *
     * - ```index``` (optional) The index of the current element being processed in the vec.
     *
     * - ```vec``` (optional) The vec which method was called upon.
     * @returns {number} The index of the first element in the vec
     * that passes the test. Otherwise, -1
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 0})
     * }
     *
     * const nonExistent = pos.findIndex(p => p.z === 100)
     * console.log(nonExistent) // output: -1
     *
     * const exists = pos.findIndex(p => p.z === 10)
     * console.log(exists) // output: 0
     * ```
     */
    findIndex(callback: TruthyIterCallback<T>): number;
    /**
     * Returns the last index at which a given element can
     * be found in the vec, or -1 if it
     * is not present. The vec is searched
     * backwards, starting at fromIndex.
     *
     * @param {TruthyIterCallback<StructDef>} callback A function to test for each element,
     * taking three arguments:
     *
     * - ```element``` The current element being processed
     *
     * - ```index``` (optional) The index of the current element being processed in the vec.
     *
     * - ```vec``` (optional) The vec which method was called upon.
     *
     * @returns {number} The index of the last element in the vec
     * that passes the test. Otherwise, -1
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 0})
     * }
     *
     * const nonExistent = pos.lastIndexOf(p => p.z === 100)
     * console.log(nonExistent) // output: -1
     *
     * const exists = pos.lastIndexOf(p => p.z === 10)
     * console.log(exists) // output: 4
     * ```
     */
    lastIndexOf(callback: TruthyIterCallback<T>): number;
    /**
     * Executes a user-supplied "reducer" callback
     * function on each element of the vec,
     * in order, passing in the return value from the
     * calculation on the preceding element. The
     * final result of running the reducer across
     * all elements of the vec is a single value.
     *
     * NOTE: this implementation is slightly different
     * than the standard vec "reduce" as an initial
     * value is required
     *
     * @param {ReduceCallback<StructDef, YourCallbackReturnValue>} callback A "reducer" function that takes
     * four arguments:
     *
     * - ```previousValue``` the value resulting from the
     * previous call to callbackFn.
     *
     * - ```currentValue``` The current element being processed
     *
     * - ```currentIndex``` (optional) The index of the current element being processed in the vec.
     *
     * - ```vec``` (optional) The vec which method was called upon.
     * @param {YourCallbackReturnValue} initialValue A value to which previousValue
     * is initialized the first time the callback is called.
     * @returns {YourCallbackReturnValue} The value that results from
     * running the "reducer" callback function
     * to completion over the entire vec.
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     * const value = pos.reduce(p => {
     *      return p.x + p.y + p.z
     * }, 0)
     * console.log(value) // output: 65
     * ```
     */
    reduce<U>(callback: ReduceCallback<T, U>, initialValue: U): U;
    /**
     * Applies a function against an accumulator
     * and each value of the array
     * (from right-to-left) to reduce it to a single value.
     *
     * NOTE: this implementation is slightly different
     * than the standard array "reduceRight", as an initial
     * value is required
     *
     * @param {ReduceCallback<StructDef, YourCallbackReturnValue>} callback A "reducer" function that takes
     * four arguments:
     *
     * - ```previousValue``` the value resulting from the
     * previous call to callbackFn.
     *
     * - ```currentValue``` The current element being processed
     *
     * - ```currentIndex``` (optional) The index of the current element being processed in the vec.
     *
     * - ```vec``` (optional) The vec which method was called upon.
     * @param {YourCallbackReturnValue} initialValue A value to which previousValue
     * is initialized the first time the callback is called.
     * @returns {YourCallbackReturnValue} The value that results from
     * running the "reducer" callback function
     * to completion over the entire vec.
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     * const value = pos.reduceRight(p => {
     *      return p.x + p.y + p.z
     * }, 0)
     * console.log(value) // output: 65
     * ```
     */
    reduceRight<U>(callback: ReduceCallback<T, U>, initialValue: U): U;
    /**
     * Tests whether all elements in the vec pass the
     * test implemented by the provided function.
     * It returns a Boolean value.
     *
     * @param {TruthyIterCallback<StructDef>} callback A function to test for each element,
     * taking three arguments:
     *
     * - ```element``` The current element being processed in the
     *
     * - ```index``` (optional) The index of the current element being processed in the vec.
     *
     * - ```vec``` (optional) The vec which method was called upon.
     * @returns {boolean}
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     *
     * const everyZis100 = pos.every(p => p.z === 100)
     * console.log(everyZis100) // output: false
     *
     * const everyZis10 = pos.every(p => p.z === 10)
     * console.log(everyZis10) // output: 10
     * ```
     */
    every(callback: TruthyIterCallback<T>): boolean;
    /**
     * Tests whether at least one element in
     * the vec passes the test implemented
     * by the provided function. It returns true
     * if, in the vec, it finds an element for
     * which the provided function returns true;
     * otherwise it returns false. It does not
     * modify the vec.
     *
     * @param {TruthyIterCallback<StructDef>} callback A function to test for each element,
     * taking three arguments:
     *
     * - ```element``` The current element being processed
     *
     * - ```index``` (optional) The index of the current element being processed in the vec.
     *
     * - ```vec``` (optional) The vec which method was called upon.
     * @returns {boolean}
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     * pos.push({x: 1, y: 5, z: 0})
     *
     * const z100Exists = pos.some(p => p.z === 100)
     * console.log(z100Exists) // output: false
     *
     * const y5Exists = pos.some(p => p.y === 5)
     * console.log(y5Exists) // output: true
     * ```
     */
    some(callback: TruthyIterCallback<T>): boolean;
    [Symbol.iterator](): Iterator<Struct<T>>;
    /**
     * Returns a new vec Iterator object that
     * contains the key/value pairs for each
     * index in the vec.
     *
     * PERFORMANCE-TIP: Vecs are very slow when using
     * the ES6 for...of looping syntax. Imperative iteration
     * and higher-order (forEach, map, etc.) iterators are
     * far more efficient.
     *
     * @returns {Iterator<Array<number, Struct<StructDef>>>} A new vec iterator object
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     *
     * for (const [index, element] of pos.entries()) {
     *      console.log(typeof index) // output: number
     *      console.log(element) // output: {x: 1, y: 2, z: 10}
     * }
     * ```
     */
    entries(): {
        [Symbol.iterator]: () => Iterator<[number, Struct<T>]>;
    };
    /**
     * Returns a new Array Iterator object that
     * contains the keys for each index in the array.
     *
     * PERFORMANCE-TIP: Vecs are very slow when using
     * the ES6 for...of looping syntax. Imperative iteration
     * and higher-order (forEach, map, etc.) iterators are
     * far more efficient.
     *
     * @returns {Iterator<number>} A new vec iterator object
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     *
     * for (const index of pos.keys()) {
     *      console.log(typeof index) // output: number
     * }
     * ```
     */
    keys(): {
        [Symbol.iterator]: () => Iterator<number>;
    };
    /**
     * Returns a new array iterator object that
     * contains the values for each index in the array.
     *
     * PERFORMANCE-TIP: Vecs are very slow when using
     * the ES6 for...of looping syntax. Imperative iteration
     * and higher-order (forEach, map, etc.) iterators are
     * far more efficient.
     *
     * @returns {Iterator<Struct<StructDef>>} A new vec iterator object
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     *
     * for (const element of pos.values()) {
     *      console.log(element) // output: {x: 1, y: 2, z: 10}
     * }
     * ```
     */
    values(): {
        [Symbol.iterator]: () => Iterator<Struct<T>>;
    };
    /**
     * Returns a deep copy of a portion
     * of an vec into a new vec object selected from
     * start to end (end not included) where start and end
     * represent the index of items in that vec. The original
     * vec will not be modified
     *
     * @param {number} [start=0] Zero-based index at which to start extraction.
     *
     * A negative index can be used, indicating an offset from
     * the end of the sequence. slice(-2) extracts the last two
     * elements in the sequence.
     *
     * If start is undefined, slice starts from the index 0.
     *
     * If start is greater than the index range of the sequence,
     * an empty vec is returned.
     * @param {number} [end=vec.length] Zero-based index at which to start extraction.
     *
     * A negative index can be used, indicating an offset from the end
     * of the sequence. slice(-2) extracts the last two elements
     * in the sequence.
     *
     * If start is undefined, slice starts from the index 0.
     *
     * If start is greater than the index range of the sequence, an empty
     * vec is returned.
     * @returns {Vec<StructDef>} A new vec containing the extracted elements.
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV(15).fill({x: 1, y: 2, z: 10})
     *
     * const posCopy = pos.slice()
     * console.log(posCopy.length) // output: 15
     * posCopy.forEach(p => {
     *      console.log(p.e)// output: {x: 1, y: 2, z: 10}
     * })
     *
     * ```
     */
    slice(start?: number, end?: number): Vec<T>;
    /**
     * Shallow copies part of an vec to another location in the
     * same vec and returns it without modifying its length.
     *
     * @param {number} target Zero-based index at which to copy the sequence to.
     * If negative, target will be counted from the end.
     *
     * If target is at or greater than vec.length, nothing will be copied.
     * If target is positioned after start, the copied sequence will be
     * trimmed to fit vec.length.
     * @param {number} [start=0] Zero-based index at which to start
     * copying elements from. If negative, start will be counted
     * from the end.
     *
     * If start is omitted, copyWithin will copy from index 0.
     * @param {number} [end=vec.length] Zero-based index at which to end copying
     * elements from. copyWithin copies up to but not including end.
     * If negative, end will be counted from the end.
     *
     * If end is omitted, copyWithin will copy until the
     * last index (default to vec.length).
     * @returns {Vec<StructDef>} The modified vec.
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20)
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
     * ```
     */
    copyWithin(target: number, start?: number, end?: number): Vec<T>;
    /**
     * Tries to reserve capacity for at least additional more
     * elements to be inserted in the given vec.
     * After calling reserve, capacity will be greater than or
     * equal to vec.length + additional.
     * Does nothing if capacity is already sufficient.
     *
     * If runtime will not allocate any more memory, an error is thrown.
     *
     * PERFORMANCE-TIP: use this method before adding many elements
     * to a vec to avoid resizing multiple times.
     *
     * @param {number} additional The amount of elements to allocate memory
     * for.
     * @returns {Vec<StructDef>} The expanded vec.
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     *
     * // initialize with space for 15 elements
     * const p = new PositionV(15)
     * console.log(p.capacity) // output: 15
     *
     * // make space for 100 more elements
     * p.reserve(100)
     * console.log(p.capacity) // output: 115
     * ```
     */
    reserve(additional: number): this | undefined;
    /**
     * Reverses an vec in place. The first vec
     * element becomes the last, and the last vec element
     * becomes the first.
     *
     * @returns {Vec<StructDef>} The reversed vec.
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20)
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
     * ```
     */
    reverse(): Vec<T>;
    /**
     * Merge two or more vec.
     * This method does not change the existing vec,
     * but instead returns a new vec.
     *
     * @param {...Vec<StructDef>} vecs Vecs to concatenate into a new vec.
     * If all value parameters are omitted, concat returns a
     * deep copy of the existing vec on which it is called.
     * @returns {Vec<StructDef>} A new vec instance.
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     *
     * const pos = new PositionsV(3).fill({x: 1, y: 1, z: 1})
     * const pos1 = new PositionsV(2).fill({x: 2, y: 1, z: 1})
     * const pos2 = new PositionsV(4).fill({x: 3, y: 1, z: 1})
     *
     * const pos3 = pos.concat(pos1, pos2)
     * console.log(pos3.length) // output: 9
     *
     * console.log(pos3 !== pos2) // output: true
     * console.log(pos3 !== pos1) // output: true
     * console.log(pos3 !== pos) // output: true
     *
     * console.log(pos3.index(0).e) // output: {x: 1, y: 1, z: 1}
     * console.log(pos3.index(3).e) // output: {x: 2, y: 1, z: 1}
     * console.log(pos3.index(5).e) // output: {x: 3, y: 1, z: 1}
     * ```
     */
    concat(...vecs: Vec<T>[]): Vec<T>;
    /**
     * Removes the last element from an vec and returns
     * that element. This method changes the length of
     * the vec.
     *
     * PERFORMANCE-TIP: use the ```truncate``` method
     * if you want to efficiently remove many elements from the back,
     * instead of using a loop with the ```pop``` method.
     *
     * @returns {(Struct<StructDef> | undefined)} The removed element from the vec;
     * undefined if the vec is empty
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20)
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
     * ```
     */
    pop(): Struct<T> | undefined;
    /**
     * Removes the last n elements from an vec and returns
     * the new length of the vec. If no elements are present
     * in vec, this is a no-op.
     *
     * PERFORMANCE-TIP: use the this method
     * if you want to efficiently remove many elements from the back,
     * instead the ```pop``` method.
     *
     * @param {number} count number of elements to remove
     * @returns {number} New length of the vec
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})

        const newLen = p.truncate(p.length)
        console.log(newLen) // output: 0
        console.log(p.length) // output: 0
     * ```
     */
    truncate(count: number): number;
    /**
     * Changes all elements in an vec to a static value,
     * from a start index (default 0) to an
     * end index (default vec.capacity).
     * It returns the modified vec.
     *
     * @param {Struct<StructDef>} value Value to fill the vec with.
     * Note: all elements in the vec will be a copy of this value.
     * @param {number} [start=0] Start index (inclusive), default 0.
     * @param {number} [end=vec.capacity] End index (exclusive), default vec.capacity.
     * @returns {Vec<StructDef>} The modified vec.
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(15).fill({x: 1, y: 1, z: 1})
     * console.log(p.length) // output: 15
     *
     * p.forEach(pos => {
     *      console.log(pos.e) // output: {x: 1, y: 1, z: 1}
     * })
     * ```
     */
    fill(value: Struct<T>, start?: number, end?: number): Vec<T>;
    /**
     * Adds one or more elements to the end of an Vec
     * and returns the new length of the Vec.
     *
     * @param {...Struct<StructDef>} structs the element(s) to add to the end
     * of a vec. Element(s) must conform to the struct def,
     * available through the "def" property.
     * @returns {number} the new length of the vec
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV()
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10}, {x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})

        console.log(p.length) // output: 5

        console.log(p.index(0).e) // output: {x: 2, y: 3, z: 8}
        console.log(p.index(4).e) // output: {x: 122, y: 23, z: 8}
     * ```
     */
    push(...structs: Struct<T>[]): number;
    /**
     * Changes the contents of an vec by removing or
     * replacing existing elements and/or adding new elements in place.
     * To access part of an vec without modifying it, see slice().
     *
     * @param start The index at which to start changing the vec.
     *
     * If greater than the largest index, no operation
     * is be performed and an empty vec is returned.
     *
     * If negative, it will begin that many elements from the end
     * of the vec. (In this case, the origin -1,
     * meaning -n is the index of the nth last element,
     * and is therefore equivalent to the index of vec.length - n.)
     * If start is negative infinity, no operation
     * is be performed and an empty vec is returned.
     * @param {number} [deleteCount=vec.length] An integer indicating the number
     * of elements in the vec to remove from start.
     *
     * If deleteCount is omitted, or if its value is
     * equal to or larger than vec.length - start
     * (that is, if it is equal to or greater than the
     * number of elements left in the vec, starting at start),
     * then all the elements from start to the end of the
     * vec will be deleted. However, it must not be
     * omitted if there is any item1 parameter.
     *
     * If deleteCount is 0 or negative, no elements are removed.
     * In this case, you should specify at least one
     * new element (see below).
     * @param {...Struct<StructDef>} items The elements to add to the vec,
     * beginning from start.
     *
     * If you do not specify any elements, splice()
     * will only remove elements from the vec.
     * @returns {Vec<StructDef>} A vec containing the deleted elements.
     *
     * If only one element is removed, an vec of one element is
     * returned.
     *
     * If no elements are removed, an empty vec is returned.
     *
     * @example <caption>Removing Elements</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20)
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
     * ```
     *
     * @example <caption>Adding Elements</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20)
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
     * ```
     *
     * @example <caption>Adding and Removing Elements Simultaneously</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20)
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
     * ```
     */
    splice(start: number, deleteCount?: number, ...items: Struct<T>[]): Vec<T>;
    /**
     * Removes the first element from an vec and returns
     * that removed element. This method changes the length
     * of the vec
     *
     * @returns {Struct<StructDef>} The removed element from the vec;
     * undefined if the vec is empty
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20)
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
     * ```
     */
    shift(): Struct<T> | undefined;
    /**
     * Adds one or more elements to the beginning of an
     * vec and returns the new length of the vec.
     *
     * @param {...Struct<StructDef>} structs The element(s) to add to the front of the vec
     * @returns {number} The new length of the vec.
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV()
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
     * ```
     */
    unshift(...structs: Struct<T>[]): number;
    /**
     * Shrinks the capacity of the vec with a lower bound.
     *
     * The capacity will remain at least as large as both
     * the length and the supplied value.
     *
     * If the current capacity is less than the lower limit,
     * this is a no-op.
     *
     * @param {number} [minCapacity=15] the maximum amount of elements a
     * vec can hold before needing to resize.
     *
     * If negative, it will default to zero.
     *
     * If omitted, defaults to 15.
     * @returns {Vec<StructDef>} The shrunken vec.
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     *
     * // initialize with space for 15 elements
     * const p = new PositionV(15)
     * console.log(p.capacity) // output: 15
     *
     * // shrink so that vec can only carry 10
     * // additional elements
     * p.shrinkTo(10)
     * console.log(p.capacity) // output: 10
     * ```
     */
    shrinkTo(minCapacity?: number): Vec<T>;
    /**
     * Sorts the elements of an array in place and
     * returns the sorted array.
     *
     * The underlying algorithm
     * used is "bubble sort", with a time-space complexity
     * between O(n^2) and O(n).
     *
     * @param {SortCompareCallback} compareFn Specifies a function that defines the
     * sort order. Takes two arguments and returns a number:
     *
     * ```a``` The first element for comparison.
     *
     * ```b``` The second element for comparison.
     *
     * If return value is bigger than 0, ```b``` will be sorted
     * before ```a```. If return value is smaller than 0,
     * ```a``` will be sorted before ```b```. Otherwise if
     * return is 0, order of the elements will not change.
     * @returns {Vec<StructDef>} The sorted vec. Note that the vec
     * is sorted in place, and no copy is made.
     *
     * @example <caption>Ascending Order</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV()
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
     * ```
     *
     * @example <caption>Descending Order</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV()
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
     * ```
     */
    sort(compareFn: SortCompareCallback<T>): Vec<T>;
    /**
     * Swaps the position of two elements. If inputted index
     * is negative it will be counted from the back of the
     * vec (vec.length + index)
     *
     * @param {number} aIndex the index of the first element to swap
     * @param {number} bIndex the index of the second element to swap
     * @returns {Vec<StructDef>} the vec with swapped elements
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV()
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
     * ```
     */
    swap(aIndex: number, bIndex: number): Vec<T>;
    /**
     * Returns a stringified version of the
     * vec it's called on.
     *
     * Can be re-parsed into vec via the ```Vec.fromString```
     * static method.
     *
     * NOTE: if any of the underlying memory is set to
     * `NaN` (via setting with an incorrect type for example)
     * it will be coerced to 0
     *
     * @returns {string} a string version of a vec
     *
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20).fill({x: 1, y: 1, z: 1})
     *
     * console.log(p.length) // output: 20
     * p.forEach(pos => {
     *      console.log(pos.e) // output: {x: 1, y: 1, z: 1}
     * })
     *
     * const vecString = p.toJSON()
     * console.log(typeof vecString) // output: "string"
     * // create vec from string representation
     * const jsonVec = PositionV.fromString(vecString)
     *
     * console.log(jsonVec.length) // output: 20
     * jsonVec.forEach(pos => {
     *      console.log(pos.e) // output: {x: 1, y: 1, z: 1}
     * })
     * ```
     */
    toJSON(): string;
}
export declare type VecPrimitive = "num" | "bool" | "char";
export declare type Num<T extends VecPrimitive> = T extends "num" ? number : never;
export declare type Bool<T extends VecPrimitive> = T extends "bool" ? boolean : never;
export declare type Char<T extends VecPrimitive> = T extends "char" ? string : never;
export declare type Primitive<T extends VecPrimitive> = (Num<T> | Bool<T> | Char<T>);
export declare type StructDef = Readonly<{
    [key: string]: VecPrimitive;
}>;
export declare type Struct<S extends StructDef> = {
    [key in keyof S]: Primitive<S[key]>;
};
declare type TypedArrayMutableProperties = ('copyWithin' | 'fill' | 'reverse' | 'set' | 'sort');
export interface ReadonlyFloat32Array extends Omit<Float32Array, TypedArrayMutableProperties> {
    readonly [n: number]: number;
}
export declare type VecCursor<T extends StructDef> = (Struct<T> & {
    e: Struct<T>;
});
export declare type CursorConstructor<T extends StructDef> = {
    new (self: Vec<T>): VecCursorInternals<T>;
};
declare type VecCursorInternals<T extends StructDef> = (VecCursor<T> & {
    _viewingIndex: number;
    self: Vec<T>;
});
export declare type SortCompareCallback<T extends StructDef> = ((a: Readonly<VecCursor<T>>, b: Readonly<VecCursor<T>>) => number);
export declare type ForEachCallback<T extends StructDef> = ((() => void) | ((element: VecCursor<T>, index: number, array: Vec<T>) => void));
export declare type MapCallback<T extends StructDef, U> = ((() => U) | ((element: Readonly<VecCursor<T>>, index: number, array: Vec<T>) => U));
export declare type MapvCallback<T extends StructDef> = ((() => Struct<T>) | ((element: VecCursor<T>, index: number, array: Vec<T>) => Struct<T>));
export declare type TruthyIterCallback<T extends StructDef> = ((() => boolean) | ((element: Readonly<VecCursor<T>>, index: number, array: Vec<T>) => boolean));
export declare type ReduceCallback<T extends StructDef, U> = ((() => U) | ((previousValue: U, currentValue: Readonly<VecCursor<T>>, index: number, array: Vec<T>) => U));
export {};
//# sourceMappingURL=core.d.ts.map