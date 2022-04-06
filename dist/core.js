"use strict";
/**
 * @module vec-struct
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vec = exports.VALID_DATA_TYPES_INTERNAL = void 0;
const MEMORY_LAYOUT = Float32Array;
const BUFFER_TYPE = SharedArrayBuffer;
exports.VALID_DATA_TYPES_INTERNAL = [
    "f32",
    "i32",
    "char",
    "bool"
];
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
class Vec {
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
    constructor(initialCapacity = 15 /* capacity */, memory) {
        try {
            let vecCapacity = 0;
            let vecLength = 0;
            let buffer;
            if (!memory) {
                vecCapacity = Math.abs(initialCapacity);
                buffer = this.createMemory(vecCapacity);
            }
            else {
                vecLength = memory[memory.length - 1 /* lengthReverseIndex */];
                vecCapacity = memory[memory.length - 2 /* capacityReverseIndex */];
                buffer = memory.buffer;
            }
            this._f32Memory = new Float32Array(buffer);
            this._i32Memory = new Int32Array(buffer);
            this._length = vecLength;
            this._capacity = vecCapacity;
            this._cursor = new this.cursorDef(this);
        }
        catch (err) {
            throw new Error(`[Vec::allocator] buffer memory failed to initialize. ${err}`);
        }
    }
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
    static isVec(candidate) {
        return candidate instanceof this;
    }
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
     * @param {ReadonlyInt32Array} memory memory
     * of another Vec of the same kind
     * @returns {Vec<StructDef>} A new vec
     *
     * @example <caption>Multithreading</caption>
     * ```js
     * // ------------ index.mjs ---------------
     * import {vec} from "struct-vec"
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    static fromMemory(memory) {
        return new this(0, memory);
    }
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
    static fromArray(structArray) {
        const newVec = new this(structArray.length + 15 /* capacity */);
        newVec.push(...structArray);
        return newVec;
    }
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
    static fromString(vecString) {
        const arr = JSON.parse(vecString);
        if (!Array.isArray(arr)) {
            throw TypeError(`inputted string was not a stringified vec`);
        }
        const newVec = new this(0);
        const elementSize = arr[arr.length - 3 /* elementSizeJSONReserveIndex */];
        if (elementSize !== newVec.elementSize) {
            throw TypeError(`Inputted array does not match the encoding for this vec class. Size of element must be ${newVec.elementSize}, got "${elementSize}" (type=${typeof elementSize})`);
        }
        const length = arr[arr.length - 1 /* lengthReverseIndex */];
        const capacity = arr[arr.length - 2 /* capacityReverseIndex */];
        if (!Number.isInteger(length) || !Number.isInteger(capacity)) {
            throw TypeError(`Inputted length or capacity of vec is not an integer.`);
        }
        newVec.reserve(capacity);
        const vecMemory = newVec._f32Memory;
        for (let i = 0; i < arr.length - 3 /* JSONMemorySize */; i += 1) {
            vecMemory[i] = arr[i];
        }
        newVec._length = length;
        return newVec;
    }
    /**
     * The amount of raw memory an individual
     * struct (element of a vec) requires for this vec type.
     * An individual block of memory corresponds to
     * 4 bytes (32-bits).
     *
     * For example if ```elementSize``` is 2, each struct
     * will take 8 bytes.
     *
     * @type {number}
     */
    get elementSize() {
        return 1;
    }
    /**
     * The definition of an individual
     * struct (element) in a vec.
     *
     * @type {StructDef}
     */
    get def() {
        return {};
    }
    get cursorDef() {
        return class Cursor {
            constructor() {
                this.e = {};
            }
        };
    }
    get cursor() {
        return this._cursor;
    }
    /**
     * The number of elements in vec.
     * The value is between 0 and (2^32) - 1
     * (about 2 billion),
     * always numerically greater than the
     * highest index in the array.
     *
     * @type {number}
     */
    get length() {
        return this._length;
    }
    /**
     * The number of elements a vec can
     * hold before needing to resize.
     * The value is between 0 and (2^32) - 1
     * (about 2 billion).
     *
     * @example <caption>Expanding Capacity</caption>
     * ```js
     * import {vec} from "struct-vec"
     *
     * const Cats = vec({isCool: "f32", isDangerous: "f32"})
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
     * const Cats = vec({isCool: "f32", isDangerous: "f32"})
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
    get capacity() {
        return this._capacity;
    }
    /**
     * The binary representation
     * of a vec.
     *
     * WARNING: It is never recommended
     * to manually edit the underlying memory,
     * doing so may lead to memory corruption.
     *
     * @type {ReadonlyInt32Array}
     */
    get memory() {
        const memory = this._i32Memory;
        memory[memory.length - 2 /* capacityReverseIndex */] = this._capacity;
        memory[memory.length - 1 /* lengthReverseIndex */] = this._length;
        return memory;
    }
    set memory(newMemory) {
        this._capacity = newMemory[newMemory.length - 2 /* capacityReverseIndex */];
        this._length = newMemory[newMemory.length - 1 /* lengthReverseIndex */];
        this._i32Memory = newMemory;
        this._f32Memory = new Float32Array(newMemory.buffer);
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    index(index) {
        this._cursor._viewingIndex = index * this.elementSize;
        return this.cursor;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    at(index) {
        const normalize = Math.abs(index);
        return this.index(index < 0 && normalize !== 0
            ? this._length - normalize
            : normalize);
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
     * const pos = PositionsV(15).fill({x: 1, y: 1, z: 1})
     *
     * pos.forEach((p, i, v) => {
     *      console.log(p.e) // output: {x: 1, y: 1, z: 1}
     * })
     * ```
     */
    forEach(callback) {
        const previousIndex = this._cursor._viewingIndex;
        const length = this._length;
        for (let i = 0; i < length; i += 1) {
            const element = this.index(i);
            callback(element, i, this);
        }
        this._cursor._viewingIndex = previousIndex;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
     * const pos = PositionsV(15).fill({x: 1, y: 1, z: 1})
     * const xVals = pos.map(p => p.x)
     *
     * xVals.forEach((num) => {
     *      console.log(num) // output: 1
     * })
     * ```
     */
    map(callback) {
        const previousIndex = this._cursor._viewingIndex;
        const values = [];
        const length = this._length;
        for (let i = 0; i < length; i += 1) {
            const element = this.index(i);
            values.push(callback(element, i, this));
        }
        this._cursor._viewingIndex = previousIndex;
        return values;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    mapv(callback) {
        const previousIndex = this._cursor._viewingIndex;
        const newVec = new this.constructor(0, this.memory.slice());
        const length = newVec.length;
        for (let i = 0; i < length; i += 1) {
            const element = newVec.index(i);
            const value = callback(element, i, this);
            element.e = value;
        }
        this.deallocateExcessMemory();
        this._cursor._viewingIndex = previousIndex;
        return newVec;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    filter(callback) {
        const previousIndex = this._cursor._viewingIndex;
        const length = this._length;
        const elementSize = this.elementSize;
        const newVec = this.slice();
        let newVecLength = 0;
        for (let i = 0; i < length; i += 1) {
            const element = this.index(i);
            if (callback(element, i, this)) {
                const copyStartIndex = i * elementSize;
                newVec._f32Memory.copyWithin(newVecLength * elementSize, copyStartIndex, copyStartIndex + elementSize);
                newVecLength += 1;
            }
        }
        this._cursor._viewingIndex = previousIndex;
        newVec._length = newVecLength;
        newVec.deallocateExcessMemory();
        return newVec;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    find(callback) {
        const previousIndex = this._cursor._viewingIndex;
        const length = this._length;
        for (let i = 0; i < length; i += 1) {
            const element = this.index(i);
            if (callback(element, i, this)) {
                this._cursor._viewingIndex = previousIndex;
                return this.index(i);
            }
        }
        this._cursor._viewingIndex = previousIndex;
        return;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    findIndex(callback) {
        const previousIndex = this._cursor._viewingIndex;
        const length = this._length;
        for (let i = 0; i < length; i += 1) {
            const element = this.index(i);
            if (callback(element, i, this)) {
                this._cursor._viewingIndex = previousIndex;
                return i;
            }
        }
        this._cursor._viewingIndex = previousIndex;
        return -1;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    lastIndexOf(callback) {
        const previousIndex = this._cursor._viewingIndex;
        const length = this._length;
        for (let i = length - 1; i > -1; i -= 1) {
            const element = this.index(i);
            if (callback(element, i, this)) {
                this._cursor._viewingIndex = previousIndex;
                return i;
            }
        }
        this._cursor._viewingIndex = previousIndex;
        return -1;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    reduce(callback, initialValue) {
        if (initialValue === undefined) {
            throw TypeError("Reduce of vec with no initial value. Initial value argument is required.");
        }
        const previousIndex = this._cursor._viewingIndex;
        let total = initialValue;
        const length = this._length;
        for (let i = 0; i < length; i += 1) {
            const element = this.index(i);
            total = callback(total, element, i, this);
        }
        this._cursor._viewingIndex = previousIndex;
        return total;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    reduceRight(callback, initialValue) {
        if (initialValue === undefined) {
            throw TypeError("Reduce of vec with no initial value. Initial value argument is required.");
        }
        const previousIndex = this._cursor._viewingIndex;
        let total = initialValue;
        const length = this._length;
        for (let i = length - 1; i > -1; i -= 1) {
            const element = this.index(i);
            total = callback(total, element, i, this);
        }
        this._cursor._viewingIndex = previousIndex;
        return total;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    every(callback) {
        const previousIndex = this._cursor._viewingIndex;
        const length = this._length;
        for (let i = 0; i < length; i += 1) {
            const element = this.index(i);
            if (!callback(element, i, this)) {
                this._cursor._viewingIndex = previousIndex;
                return false;
            }
        }
        this._cursor._viewingIndex = previousIndex;
        return true;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    some(callback) {
        const previousIndex = this._cursor._viewingIndex;
        const length = this._length;
        for (let i = 0; i < length; i += 1) {
            const element = this.index(i);
            if (callback(element, i, this)) {
                this._cursor._viewingIndex = previousIndex;
                return true;
            }
        }
        this._cursor._viewingIndex = previousIndex;
        return false;
    }
    [Symbol.iterator]() {
        let index = -1;
        const length = this._length;
        return {
            next: () => ({
                done: (index += 1) >= length,
                value: this.index(index).e
            })
        };
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    entries() {
        let index = -1;
        const length = this._length;
        return {
            [Symbol.iterator]: () => ({
                next: () => ({
                    done: (index += 1) >= length,
                    value: [index, this.index(index).e]
                })
            })
        };
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    keys() {
        let index = -1;
        const length = this._length;
        return {
            [Symbol.iterator]: () => ({
                next: () => ({
                    done: (index += 1) >= length,
                    value: index
                })
            })
        };
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    values() {
        let index = -1;
        const length = this._length;
        return {
            [Symbol.iterator]: () => ({
                next: () => ({
                    done: (index += 1) >= length,
                    value: this.index(index).e
                })
            })
        };
    }
    // mutations
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    slice(start = 0, end) {
        const elementSize = this.elementSize;
        const length = this._length;
        const startIndex = start < 0 ? length + start : start;
        if (startIndex < 0 || startIndex > length - 1) {
            return new this.constructor();
        }
        end = end || this._length;
        const endIndex = end < 0 ? length + end : end;
        if (endIndex < 0 || endIndex > length) {
            return new this.constructor();
        }
        const newVec = new this.constructor();
        const newVecLength = endIndex - startIndex;
        if (newVecLength < 0) {
            return newVec;
        }
        const newMemory = this._f32Memory.slice();
        const shiftStartIndex = startIndex * elementSize;
        const shiftEndIndex = endIndex * elementSize;
        newMemory.copyWithin(0, shiftStartIndex, shiftEndIndex);
        newVec._length = newVecLength;
        newVec.replaceMemory(newMemory);
        newVec.deallocateExcessMemory();
        return newVec;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    copyWithin(target, start = 0, end) {
        const sizeOfElement = this.elementSize;
        const length = this._length;
        const targetIndex = target < 0 ? length + target : target;
        if (targetIndex < 0 || targetIndex > length - 1) {
            return this;
        }
        const startIndex = start < 0 ? length + start : start;
        if (startIndex < 0 || startIndex > length - 1) {
            return this;
        }
        end = end || length;
        const endIndex = end < 0 ? length + end : end;
        if (endIndex < 0 || endIndex > length) {
            return this;
        }
        this._f32Memory.copyWithin(targetIndex * sizeOfElement, startIndex * sizeOfElement, endIndex * sizeOfElement);
        return this;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    reserve(additional) {
        try {
            const elementSize = this.elementSize;
            const length = this._length;
            const capacity = this._capacity;
            if (length + additional <= capacity) {
                return;
            }
            const newCapacity = length + additional;
            const elementsMemory = (MEMORY_LAYOUT.BYTES_PER_ELEMENT
                * elementSize
                * newCapacity);
            const bufferSize = (8 /* encodingBytes */
                + elementsMemory);
            const buffer = new BUFFER_TYPE(bufferSize);
            const memory = new MEMORY_LAYOUT(buffer);
            memory.set(this._f32Memory);
            this.replaceMemory(memory);
            this._capacity = newCapacity;
            return this;
        }
        catch (err) {
            console.error(`Vec ::allocator: runtime failed to allocate more memory for vec. Aborting operation`, err);
            throw err;
        }
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    reverse() {
        const elementSize = this.elementSize;
        const length = this._length;
        if (length < 2) {
            return this;
        }
        let start = 0;
        let end = this._length - 1;
        this.reserve(1);
        const temporaryIndex = this._length * elementSize;
        while (start < end) {
            const startElementStartIndex = start * elementSize;
            this._f32Memory.copyWithin(temporaryIndex, startElementStartIndex, startElementStartIndex + elementSize);
            const endElementStartIndex = end * elementSize;
            this._f32Memory.copyWithin(startElementStartIndex, endElementStartIndex, endElementStartIndex + elementSize);
            this._f32Memory.copyWithin(endElementStartIndex, temporaryIndex, temporaryIndex + elementSize);
            start += 1;
            end -= 1;
        }
        return this;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    concat(...vecs) {
        const elementSize = this.elementSize;
        let combinedLength = 0;
        let combinedCapacity = 0;
        combinedLength += this.length;
        combinedCapacity += this.capacity;
        for (let i = 0; i < vecs.length; i += 1) {
            const vec = vecs[i];
            combinedLength += vec.length;
            combinedCapacity += vec.capacity;
        }
        const newVec = new this.constructor(combinedCapacity);
        let copyLength = 0;
        newVec._f32Memory.set(this._f32Memory, copyLength);
        copyLength += (this.length * elementSize);
        for (let i = 0; i < vecs.length; i += 1) {
            const vec = vecs[i];
            newVec._f32Memory.set(vec._f32Memory, copyLength);
            copyLength += (vec.length * elementSize);
        }
        newVec._length = combinedLength;
        newVec.deallocateExcessMemory();
        return newVec;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    pop() {
        if (this._length < 1) {
            this.deallocateExcessMemory();
            return;
        }
        const targetElement = this.index(this._length - 1).e;
        this._length -= 1;
        this.deallocateExcessMemory();
        return targetElement;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    truncate(count) {
        if (this._length < 1) {
            this.deallocateExcessMemory();
            return 0;
        }
        const removeCount = count > this._length
            ? this._length
            : count;
        this._length -= removeCount;
        this.deallocateExcessMemory();
        return this._length;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
     * const p = new PositionV(15).fill({x: 1, y: 1, z: 1})
     * console.log(p.length) // output: 15
     *
     * p.forEach(pos => {
     *      console.log(pos.e) // output: {x: 1, y: 1, z: 1}
     * })
     * ```
     */
    fill(value, start = 0, end) {
        const elementSize = this.elementSize;
        const capacity = this._capacity;
        const length = this._length;
        let startIndex = start < 0 ? length + start : start;
        startIndex = startIndex < 0
            ? 0
            : startIndex > length - 1 ? length : startIndex;
        end = end || capacity;
        let endIndex = end < 0 ? capacity + end : end;
        endIndex = endIndex < 0
            ? 0
            : endIndex > capacity ? capacity : endIndex;
        const lengthIncrease = endIndex - startIndex;
        if (lengthIncrease < 1) {
            return this;
        }
        this.index(startIndex).e = value;
        if (lengthIncrease < 2) {
            return this;
        }
        const copyStart = startIndex * elementSize;
        const endIndexRaw = endIndex * elementSize;
        let copyRange = elementSize;
        let copyEnd = copyStart + copyRange;
        let operationIndex = copyEnd;
        this._length = startIndex;
        while (operationIndex < endIndexRaw) {
            this._f32Memory.copyWithin(operationIndex, copyStart, copyEnd);
            copyRange += copyRange;
            copyEnd = copyStart + copyRange;
            operationIndex = copyEnd;
        }
        this._f32Memory.copyWithin(operationIndex, copyStart, copyEnd);
        this._length += lengthIncrease;
        return this;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    push(...structs) {
        const elementSize = this.elementSize;
        let length = this._length;
        const capacity = this._capacity;
        const minimumCapcity = length + structs.length;
        if (minimumCapcity > capacity) {
            try {
                const targetCapacity = capacity * 2;
                const newCapacity = minimumCapcity > targetCapacity
                    ? minimumCapcity + 15 /* capacity */
                    : targetCapacity;
                const elementsMemory = (MEMORY_LAYOUT.BYTES_PER_ELEMENT
                    * elementSize
                    * newCapacity);
                const bufferSize = (8 /* encodingBytes */
                    + elementsMemory);
                const buffer = new BUFFER_TYPE(bufferSize);
                const memory = new MEMORY_LAYOUT(buffer);
                memory.set(this._f32Memory);
                this.replaceMemory(memory);
                this._capacity = newCapacity;
            }
            catch (err) {
                throw new Error(`[Vec::allocator] runtime failed to allocate more memory for vec. ${err}`);
            }
        }
        const previousIndex = this._cursor._viewingIndex;
        for (let i = 0; i < structs.length; i += 1) {
            const value = structs[i];
            this.index(length).e = value;
            length += 1;
        }
        this._length = length;
        this._cursor._viewingIndex = previousIndex;
        return length;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    splice(start, deleteCount, ...items) {
        const elementSize = this.elementSize;
        const length = this._length;
        const startIndex = start < 0 ? length + start : start;
        const initialCapacity = items.length + 15 /* capacity */;
        const vec = new this.constructor(initialCapacity);
        if (startIndex < 0 || startIndex > length - 1) {
            return vec;
        }
        let maxDeleteCount = length - startIndex;
        maxDeleteCount = maxDeleteCount < 0
            ? 0
            : maxDeleteCount;
        deleteCount = deleteCount === undefined
            ? maxDeleteCount
            : deleteCount;
        deleteCount = deleteCount < 1
            ? 0
            : deleteCount;
        deleteCount = deleteCount > maxDeleteCount
            ? maxDeleteCount
            : deleteCount;
        let itemsIndex = 0;
        if (deleteCount === items.length) {
            for (let i = startIndex; i < (startIndex + items.length); i += 1) {
                const element = this.index(i);
                vec.push(element.e);
                const item = items[itemsIndex];
                element.e = item;
                itemsIndex += 1;
            }
        }
        else if (deleteCount > items.length) {
            const startOfDeletions = startIndex + items.length;
            for (let i = startIndex; i < startOfDeletions; i += 1) {
                vec.push(this.index(i).e);
                this.index(i).e = items[itemsIndex];
                itemsIndex += 1;
            }
            const numberOfItemsToDelete = deleteCount - items.length;
            for (let i = startOfDeletions; i < startOfDeletions + numberOfItemsToDelete; i += 1) {
                const currentItem = this.index(i).e;
                vec.push(currentItem);
            }
            const shiftTargetIndex = (startIndex + items.length) * elementSize;
            const shiftStartIndex = (startIndex + deleteCount) * elementSize;
            const shiftEndIndex = this._length * elementSize;
            this._f32Memory.copyWithin(shiftTargetIndex, shiftStartIndex, shiftEndIndex);
            this._length -= numberOfItemsToDelete;
            this.deallocateExcessMemory();
        }
        else {
            const lengthIncrease = items.length - deleteCount;
            this.reserve(lengthIncrease);
            const shiftTargetIndex = (startIndex + lengthIncrease) * elementSize;
            const shiftStartIndex = startIndex * elementSize;
            this._f32Memory.copyWithin(shiftTargetIndex, shiftStartIndex);
            this._length += lengthIncrease;
            const deletionsEndIndex = startIndex + deleteCount;
            for (let i = startIndex; i < deletionsEndIndex; i += 1) {
                vec.push(this.index(i).e);
                this.index(i).e = items[itemsIndex];
                itemsIndex += 1;
            }
            for (let i = deletionsEndIndex; i < startIndex + items.length; i += 1) {
                this.index(i).e = items[itemsIndex];
                itemsIndex += 1;
            }
        }
        return vec;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    shift() {
        const elementSize = this.elementSize;
        const length = this._length;
        if (length < 1) {
            this.deallocateExcessMemory();
            return;
        }
        const element = this.index(0).e;
        this._length -= 1;
        if (length < 2) {
            this.deallocateExcessMemory();
            return element;
        }
        const copyStart = 1 * elementSize;
        const copyEnd = (((length - 1) * elementSize)
            + elementSize);
        this._f32Memory.copyWithin(0, copyStart, copyEnd);
        this.deallocateExcessMemory();
        return element;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    unshift(...structs) {
        const elementSize = this.elementSize;
        const length = this._length;
        const newLength = length + structs.length;
        this._length = newLength;
        if (length < 1) {
            for (let i = 0; i < structs.length; i += 1) {
                this.index(i).e = structs[i];
            }
            return newLength;
        }
        const shiftToIndex = structs.length * elementSize;
        this._f32Memory.copyWithin(shiftToIndex, 0);
        for (let i = 0; i < structs.length; i += 1) {
            this.index(i).e = structs[i];
        }
        return newLength;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    shrinkTo(minCapacity = 15 /* capacity */) {
        try {
            const elementSize = this.elementSize;
            const length = this._length;
            const capacity = this._capacity;
            const minCapacityNormalize = minCapacity < 0
                ? 0
                : minCapacity;
            const newCapacity = length + minCapacityNormalize;
            if (newCapacity >= capacity) {
                return this;
            }
            this._f32Memory = this.shrinkCapacity(newCapacity);
            this._capacity = newCapacity;
            return this;
        }
        catch (err) {
            throw new Error(`[Vec::allocator] runtime failed to deallocate memory for vec. ${err}`);
        }
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    sort(compareFn) {
        if (this._length < 2) {
            return this;
        }
        const helperCursor = new this.cursorDef(this);
        this.reserve(1);
        const elementSize = this.elementSize;
        const temporaryIndex = this._length * elementSize;
        if (this._length === 2) {
            const result = compareFn(helperCursor, this.index(1));
            if (result !== 0) {
                const startElementStartIndex = 0 * elementSize;
                this._f32Memory.copyWithin(temporaryIndex, startElementStartIndex, startElementStartIndex + elementSize);
                const endElementStartIndex = 1 * elementSize;
                this._f32Memory.copyWithin(startElementStartIndex, endElementStartIndex, endElementStartIndex + elementSize);
                this._f32Memory.copyWithin(endElementStartIndex, temporaryIndex, temporaryIndex + elementSize);
            }
            return this;
        }
        let elementsAreOrdered = false;
        while (!elementsAreOrdered) {
            elementsAreOrdered = true;
            for (let i = 0; i < this._length - 1; i += 1) {
                helperCursor._viewingIndex = i * elementSize;
                const result = compareFn(helperCursor, this.index(i + 1));
                if (result === 0) {
                    continue;
                }
                elementsAreOrdered = false;
                const startElementStartIndex = i * elementSize;
                this._f32Memory.copyWithin(temporaryIndex, startElementStartIndex, startElementStartIndex + elementSize);
                const endElementStartIndex = (i + 1) * elementSize;
                this._f32Memory.copyWithin(startElementStartIndex, endElementStartIndex, endElementStartIndex + elementSize);
                this._f32Memory.copyWithin(endElementStartIndex, temporaryIndex, temporaryIndex + elementSize);
            }
        }
        return this;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    swap(aIndex, bIndex) {
        this.reserve(1);
        const elementSize = this.elementSize;
        const temporaryIndex = this._length * elementSize;
        aIndex = aIndex < 0 ? this._length + aIndex : aIndex;
        const startElementStartIndex = (aIndex * elementSize);
        this._f32Memory.copyWithin(temporaryIndex, startElementStartIndex, startElementStartIndex + elementSize);
        bIndex = bIndex < 0 ? this._length + bIndex : bIndex;
        const endElementStartIndex = bIndex * elementSize;
        this._f32Memory.copyWithin(startElementStartIndex, endElementStartIndex, endElementStartIndex + elementSize);
        this._f32Memory.copyWithin(endElementStartIndex, temporaryIndex, temporaryIndex + elementSize);
        return this;
    }
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
     * const PositionV = vec({x: "f32", y: "f32", z: "f32"})
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
    toJSON() {
        let memoryStr = "[";
        const lastIndex = this.length * this.elementSize;
        for (let i = 0; i < lastIndex; i += 1) {
            // if any of the underlying buffer is "NaN"
            // convert it to 0. This is done 
            // is because "NaN" is not part of the JSON
            // spec
            const memoryFragment = this._f32Memory[i] || 0;
            memoryStr += (memoryFragment.toString() + ",");
        }
        memoryStr += `${this.elementSize},${this._capacity},${this._length}]`;
        return memoryStr;
    }
    createMemory(capacity) {
        const elementsMemory = (MEMORY_LAYOUT.BYTES_PER_ELEMENT
            * this.elementSize
            * capacity);
        return new SharedArrayBuffer(elementsMemory
            + 8 /* encodingBytes */);
    }
    shrinkCapacity(newCapacity) {
        const elementBytes = (MEMORY_LAYOUT.BYTES_PER_ELEMENT
            * this.elementSize
            * newCapacity);
        const bufferBytes = elementBytes + 8 /* encodingBytes */;
        const buffer = new BUFFER_TYPE(bufferBytes);
        const newMemory = new MEMORY_LAYOUT(buffer);
        const len = this._f32Memory.length;
        for (let i = 0; i < len; i += 1) {
            newMemory[i] = this._f32Memory[i];
        }
        return newMemory;
    }
    deallocateExcessMemory() {
        const length = this._length;
        const capacity = this._capacity;
        if ((capacity - length)
            <= 50 /* memoryCollectionLimit */) {
            return;
        }
        const memory = this.shrinkCapacity(length + 50 /* memoryCollectionLimit */);
        this.replaceMemory(memory);
        this._capacity = (length
            + 50 /* memoryCollectionLimit */);
    }
    replaceMemory(memory) {
        this._f32Memory = memory;
        this._i32Memory = new Int32Array(memory.buffer);
    }
}
exports.Vec = Vec;
