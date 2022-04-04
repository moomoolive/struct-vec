/**
 * @module vec-struct
 */
export const enum encoding {
    bytesIn32Bits = 4,
    memorySize = 2,
    lengthReverseIndex = 1,
    capacityReverseIndex = 2,
    elementSizeJSONReserveIndex = 3,
    JSONMemorySize = 3,
    encodingBytes = encoding.memorySize * encoding.bytesIn32Bits
}
export const enum defaults {
    capacity = 15,
    memoryCollectionLimit = 50,
    spaceCharacteCodePoint = 32 
}
export const MEMORY_LAYOUT = Float32Array
export const BUFFER_TYPE = SharedArrayBuffer
export const VALID_DATA_TYPES_INTERNAL = [
    "char",
    "num",
    "bool"
] as const
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
 export class Vec<T extends StructDef> {
    
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
     * import {vec, Vec} from "struct-vec.ts"
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const CatsV = vec({cuteness: "num", isDangerous: "bool"})
     * 
     * const cats = new CatsV()
     * const positions = new PositionsV()
     * 
     * 
     * 
     * console.log(Vec.isVec(cats)) 
     * console.log(Vec.isVec(positions)) 
     * 
     * 
     * 
     * 
     * 
     * console.log(CatsV.isVec(cats)) 
     * console.log(CatsV.isVec(positions)) 
     * 
     * console.log(PositionV.isVec(cats)) 
     * console.log(PositionV.isVec(positions)) 
     * ```
     */
    static isVec(candidate: any): boolean {
        return candidate instanceof this
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
     * @param {ReadonlyFloat32Array} memory memory 
     * of another Vec of the same kind
     * @returns {Vec<StructDef>} A new vec
     * 
     * @example <caption>Multithreading</caption>
     * ```js
     * 
     * import {vec} from "struct-vec.ts"
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const positions = new PositionV(10_000).fill(
     *      {x: 1, y: 1, z: 1}
     * )
     * 
     * const worker = new Worker("worker.mjs", {type: "module"})
     * 
     * worker.postMessage(positions.memory)
     * 
     * 
     * import {vec} from "struct-vec.ts"
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
    static fromMemory<U extends StructDef>(
        memory: ReadonlyFloat32Array
    ): Vec<U> {
        return new this(0, memory) as Vec<U>
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
     * import {vec, Vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const arr = new Array(15).fill({x: 1, y: 2, z: 3})
     * 
     * const positions = PositionsV.fromArray(arr)
     * console.log(Vec.isVec(positions)) 
     * ```
     * 
     */
    static fromArray<U extends StructDef>(
        structArray: Struct<U>[]
    ): Vec<U> {
        const newVec = new this(structArray.length + defaults.capacity)
        newVec.push(...structArray)
        return newVec as Vec<U>
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
     * import {vec, Vec} from "struct-vec.ts"
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
     * console.log(Vec.isVec(geoCopy)) 
     * ```
     */
    static fromString<U extends StructDef>(
        vecString: string
    ): Vec<U> {
        const arr = JSON.parse(vecString) as number[]
        if (!Array.isArray(arr)) {
            throw TypeError(`inputted string was not a stringified vec`)
        }
        const newVec = new this(0)
        const elementSize = arr[arr.length - encoding.elementSizeJSONReserveIndex]
        if (elementSize !== newVec.elementSize) {
            throw TypeError(`Inputted array does not match the encoding for this vec class. Size of element must be ${newVec.elementSize}, got "${elementSize}" (type=${typeof elementSize})`)
        }
        const length = arr[arr.length - encoding.lengthReverseIndex]
        const capacity = arr[arr.length - encoding.capacityReverseIndex]
        if (!Number.isInteger(length) || !Number.isInteger(capacity)) {
            throw TypeError(`Inputted length or capacity of vec is not an integer.`)
        }
        newVec.reserve(capacity)
        const vecMemory = (newVec as unknown as {_memory: Float64Array})._memory
        for (let i = 0; i < arr.length - encoding.JSONMemorySize; i += 1) {
            vecMemory[i] = arr[i]
        }
        (newVec as unknown as {_length: number})._length = length
        return newVec as Vec<U>
    } 
    
    private _memory: ReadonlyFloat32Array
    private readonly _cursor: VecCursorInternals<T>
    private _length: number
    private _capacity: number
    /**
     * @constructor
     * @param {number} [initialCapacity=15] the amount
     * of capacity to initialize vec with. Defaults to
     * 15.
     * 
     * @example <caption>Basic Usage</caption>
     * ```js
     * import {vec} from "struct-vec.ts"
     * 
     * const geoCoordinates = vec({latitude: "num", longitude: "num"})
     * 
     * 
     * const withCapacity = new geoCoordinates(100)
     * const without = new geoCoordinates()
     * ```
     */
    constructor(
        initialCapacity?: number,
        memory?: ReadonlyFloat32Array
    ) {
        try {
            this._memory = memory ? memory : createMemory(
                this.elementSize,
                initialCapacity
            )
            this._length = this._memory[this._memory.length - encoding.lengthReverseIndex]
            this._capacity = this._memory[this._memory.length - encoding.capacityReverseIndex]
            this._cursor = new this.cursorDef(this)
        } catch (err) {
            throw new Error(`[Vec::allocator] buffer memory failed to initialize. ${err}`)
        }
    }
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
     get elementSize(): number {
        return 1 
    }
    
    /**
     * The definition of an individual 
     * struct (element) in a vec.
     * 
     * @type {StructDef}
     */
    get def(): StructDef { 
        return {} as StructDef 
    }
    protected get cursorDef(): CursorConstructor<T> {
        return class Cursor {
            e = {}
        } as unknown as CursorConstructor<T>
    }
    private get cursor(): VecCursor<T> {
        return this._cursor
    }
    /**
     * The number of elements in vec. 
     * The value is between 0 and 2^24 (about 16 million), 
     * always numerically greater than the 
     * highest index in the array.
     * 
     * @type {number}
     */
    get length(): number {
        return this._length
    }
    /**
     * The number of elements a vec can 
     * hold before needing to resize. 
     * The value is between 0 and 2^24 (about 16 million).
     * 
     * @example <caption>Expanding Capacity</caption>
     * ```js
     * import {vec} from "struct-vec.ts"
     * 
     * const Cats = vec({isCool: "num", isDangerous: "num"})
     * 
     * const cats = new Cats(15)
     * 
     * 
     * 
     * console.log(cats.capacity) 
     * console.log(cats.length) 
     * 
     * 
     * cats.fill({isCool: 1, isDangerous: 1})
     * 
     * 
     * console.log(cats.capacity) 
     * console.log(cats.length) 
     * 
     * const capacity = cats.capacity
     * cats.push({isCool: 1, isDangerous: 1})
     * 
     * 
     * console.log(capacity < cats.capacity) 
     * console.log(cats.length) 
     * ```
     * 
     * @example <caption>Shrinking Capacity</caption>
     * ```js
     * import {vec} from "struct-vec.ts"
     * 
     * const Cats = vec({isCool: "num", isDangerous: "num"})
     * 
     * const cats = new Cats(15)
     * 
     * 
     * 
     * console.log(cats.capacity) 
     * console.log(cats.length) 
     * for (let i = 0; i < 5; i++) {
     *      cats.push({isCool: 1, isDangerous: 1})
     * }
     * 
     * 
     * 
     * console.log(cats.capacity) 
     * console.log(cats.length) 
     * 
     * 
     * 
     * cats.shrinkTo(0)
     * console.log(cats.capacity) 
     * console.log(cats.length) 
     * ```
     * 
     * @type {number}
     */
    get capacity(): number {
        return this._capacity
    }
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
    get memory(): ReadonlyFloat32Array {
        const memory = this._memory as Float32Array
        memory[memory.length - encoding.capacityReverseIndex] = this._capacity
        memory[memory.length - encoding.lengthReverseIndex] = this._length
        return memory
    }
    set memory(newMemory: ReadonlyFloat32Array) {
        (this._capacity as number) = newMemory[newMemory.length - encoding.capacityReverseIndex];
        (this._length as number) = newMemory[newMemory.length - encoding.lengthReverseIndex];
        this._memory = newMemory
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * 
     * const pos = new PositionsV()
     * 
     * pos.push({x: 1, y: 1, z: 1})
     * pos.push({x: 1, y: 2, z: 1})
     * pos.push({x: 1, y: 3, z: 1})
     * 
     * 
     * 
     * 
     * console.log(pos.index(0).e) 
     * console.log(pos.index(1).e) 
     * 
     * 
     * console.log(pos.index(2).y) 
     * ```
     */
    index(index: number): VecCursor<T> {
        this._cursor._viewingIndex = index * this.elementSize
        return this.cursor
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * 
     * const pos = new PositionsV()
     * 
     * pos.push({x: 1, y: 1, z: 1})
     * pos.push({x: 1, y: 2, z: 1})
     * pos.push({x: 1, y: 3, z: 1})
     * 
     * 
     * 
     * 
     * console.log(pos.index(-1).e) 
     * console.log(pos.index(-2).e) 
     * 
     * 
     * console.log(pos.index(-3).y) 
     * ```
     */
    at(index: number): VecCursor<T> {
        const normalize = Math.abs(index)
        return this.index(
            index < 0 && normalize !== 0 
                ? this._length - normalize 
                : normalize
        )
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV(15).fill({x: 1, y: 1, z: 1})
     * 
     * pos.forEach((p, i, v) => {
     *      console.log(p.e) 
     * })
     * ```
     */
    forEach(callback: ForEachCallback<T>) {
        const previousIndex = this._cursor._viewingIndex
        const length = this._length
        for (let i = 0; i < length; i += 1) {
            const element = this.index(i)
            callback(element, i, this)
        }
        this._cursor._viewingIndex = previousIndex
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV(15).fill({x: 1, y: 1, z: 1})
     * const xVals = pos.map(p => p.x)
     * 
     * xVals.forEach((num) => {
     *      console.log(num) 
     * })
     * ```
     */
    map<U>(callback: MapCallback<T, U>): U[] {
        const previousIndex = this._cursor._viewingIndex
        const values = []
        const length = this._length
        for (let i = 0; i < length; i += 1) {
            const element = this.index(i)
            values.push(callback(element, i, this))
        }
        this._cursor._viewingIndex = previousIndex
        return values
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV(15).fill({x: 1, y: 1, z: 1})
     * const yAdd = pos.mapv(p => p.y += 2)
     * 
     * yAdd.forEach((p) => {
     *      console.log(p.e) 
     * })
     * pos.forEach((p) => {
     *      console.log(p.e) 
     * })
     * console.log(pos !== yAdd) 
     * ```
     */
    mapv(callback: MapvCallback<T>): Vec<T> {
        const previousIndex = this._cursor._viewingIndex
        const newVec = new (
            this.constructor as unknown as typeof Vec
        )<T>(0, this.memory.slice())
        const length = newVec.length
        for (let i = 0; i < length; i += 1) {
            const element = newVec.index(i)
            const value = callback(element, i, this)
            element.e = value
        }
        deallocateExcessMemory(newVec)
        this._cursor._viewingIndex = previousIndex
        return newVec
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
     * import {vec} from "struct-vec.ts"
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
     * console.log(bigZs.length) 
     * bigZs.forEach((p) => {
     *      console.log(p.e) 
     * })
     * console.log(pos.length) 
     * console.log(pos !== bigZs) 
     * ```
     */
    filter(callback: TruthyIterCallback<T>): Vec<T> {
        const previousIndex = this._cursor._viewingIndex
        const length = this._length
        const elementSize = this.elementSize
        const newVec = this.slice()
        let newVecLength = 0
        for (let i = 0; i < length; i += 1) {
            const element = this.index(i)
            if (callback(element, i, this)) {
                const copyStartIndex = i * elementSize;
                (newVec._memory as Float32Array).copyWithin(
                    newVecLength * elementSize,
                    copyStartIndex,
                    copyStartIndex + elementSize
                )
                newVecLength += 1
            }
        }
        this._cursor._viewingIndex = previousIndex;
        (newVec as unknown as {_length: number})._length = newVecLength
        deallocateExcessMemory(newVec)
        return newVec
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
     * import {vec} from "struct-vec.ts"
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
     * console.log(nonExistent) 
     * 
     * const exists = pos.find(p => p.z === 10)
     * console.log(exists.e) 
     * ```
     */
    find(callback: TruthyIterCallback<T>): VecCursor<T> | undefined {
        const previousIndex = this._cursor._viewingIndex
        const length = this._length
        for (let i = 0; i < length; i += 1) {
            const element = this.index(i)
            if (callback(element, i, this)) {
                this._cursor._viewingIndex = previousIndex
                return this.index(i)
            }
        }
        this._cursor._viewingIndex = previousIndex
        return
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
     * import {vec} from "struct-vec.ts"
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
     * console.log(nonExistent) 
     * 
     * const exists = pos.findIndex(p => p.z === 10)
     * console.log(exists) 
     * ```
     */
    findIndex(callback: TruthyIterCallback<T>): number {
        const previousIndex = this._cursor._viewingIndex
        const length = this._length
        for (let i = 0; i < length; i += 1) {
            const element = this.index(i)
            if (callback(element, i, this)) {
                this._cursor._viewingIndex = previousIndex
                return i
            }
        }
        this._cursor._viewingIndex = previousIndex
        return -1
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
     * import {vec} from "struct-vec.ts"
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
     * console.log(nonExistent) 
     * 
     * const exists = pos.lastIndexOf(p => p.z === 10)
     * console.log(exists) 
     * ```
     */
    lastIndexOf(callback: TruthyIterCallback<T>): number {
        const previousIndex = this._cursor._viewingIndex
        const length = this._length
        for (let i = length - 1; i > -1; i -= 1) {
            const element = this.index(i)
            if (callback(element, i, this)) {
                this._cursor._viewingIndex = previousIndex
                return i
            }
        }
        this._cursor._viewingIndex = previousIndex
        return -1
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     * const value = pos.reduce(p => {
     *      return p.x + p.y + p.z
     * }, 0)
     * console.log(value) 
     * ```
     */
    reduce<U>(
        callback: ReduceCallback<T, U>,
        initialValue: U
    ): U {
        if (initialValue === undefined) {
            throw TypeError("Reduce of vec with no initial value. Initial value argument is required.")
        }
        const previousIndex = this._cursor._viewingIndex
        let total = initialValue
        const length = this._length
        for (let i = 0; i < length; i += 1) {
            const element = this.index(i)
            total = callback(total, element, i, this)
        }
        this._cursor._viewingIndex = previousIndex
        return total
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     * const value = pos.reduceRight(p => {
     *      return p.x + p.y + p.z
     * }, 0)
     * console.log(value) 
     * ```
     */
    reduceRight<U>(
        callback: ReduceCallback<T, U>,
        initialValue: U
    ): U {
        if (initialValue === undefined) {
            throw TypeError("Reduce of vec with no initial value. Initial value argument is required.")
        }
        const previousIndex = this._cursor._viewingIndex
        let total = initialValue
        const length = this._length
        for (let i = length - 1; i > -1; i -= 1) {
            const element = this.index(i)
            total = callback(total, element, i, this)
        }
        this._cursor._viewingIndex = previousIndex
        return total
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     * 
     * const everyZis100 = pos.every(p => p.z === 100)
     * console.log(everyZis100) 
     * 
     * const everyZis10 = pos.every(p => p.z === 10)
     * console.log(everyZis10) 
     * ```
     */
    every(callback: TruthyIterCallback<T>): boolean {
        const previousIndex = this._cursor._viewingIndex
        const length = this._length
        for (let i = 0; i < length; i += 1) {
            const element = this.index(i)
            if (!callback(element, i, this)) {
                this._cursor._viewingIndex = previousIndex
                return false
            }
        }
        this._cursor._viewingIndex = previousIndex
        return true
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     * pos.push({x: 1, y: 5, z: 0})
     * 
     * const z100Exists = pos.some(p => p.z === 100)
     * console.log(z100Exists) 
     * 
     * const y5Exists = pos.some(p => p.y === 5)
     * console.log(y5Exists) 
     * ```
     */
    some(callback: TruthyIterCallback<T>): boolean {
        const previousIndex = this._cursor._viewingIndex
        const length = this._length
        for (let i = 0; i < length; i += 1) {
            const element = this.index(i)
            if (callback(element, i, this)) {
                this._cursor._viewingIndex = previousIndex
                return true
            }
        }
        this._cursor._viewingIndex = previousIndex
        return false
    }
    [Symbol.iterator](): Iterator<Struct<T>> {
        let index = -1
        const length = this._length
        return {
            next: () => ({
                done: (index += 1) >= length,
                value: this.index(index).e
            })
        }
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     * 
     * for (const [index, element] of pos.entries()) {
     *      console.log(typeof index) 
     *      console.log(element) 
     * }
     * ```
     */
    entries(): {
        [Symbol.iterator]: () => Iterator<[number, Struct<T>]>
    } {
        let index = -1
        const length = this._length
        return {
            [Symbol.iterator]: () => ({
                next: () => ({
                    done: (index += 1) >= length,
                    value: [index, this.index(index).e]
                })
            })
        }
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     * 
     * for (const index of pos.keys()) {
     *      console.log(typeof index) 
     * }
     * ```
     */
    keys(): {[Symbol.iterator]: () => Iterator<number>} {
        let index = -1
        const length = this._length
        return {
            [Symbol.iterator]: () => ({
                next: () => ({
                    done: (index += 1) >= length,
                    value: index
                })
            })
        }
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV()
     * for (let i = 0; i < 5; i++) {
     *      pos.push({x: 1, y: 2, z: 10})
     * }
     * 
     * for (const element of pos.values()) {
     *      console.log(element) 
     * }
     * ```
     */
    values(): {[Symbol.iterator]: () => Iterator<Struct<T>>} {
        let index = -1
        const length = this._length
        return {
            [Symbol.iterator]: () => ({
                next: () => ({
                    done: (index += 1) >= length,
                    value: this.index(index).e
                })
            })
        }
    }
    
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const pos = PositionsV(15).fill({x: 1, y: 2, z: 10})
     * 
     * const posCopy = pos.slice()
     * console.log(posCopy.length) 
     * posCopy.forEach(p => {
     *      console.log(p.e)
     * })
     * 
     * ```
     */
    slice(start = 0, end?: number): Vec<T> {
        const elementSize = this.elementSize
        const length = this._length
        const startIndex = start < 0 ? length + start : start
        if (startIndex < 0 || startIndex > length - 1) {
            return new (
                this.constructor as unknown as typeof Vec
            )<T>()
        }
        end = end || this._length
        const endIndex = end < 0 ? length + end : end
        if (endIndex < 0 || endIndex > length) {
            return new (
                this.constructor as unknown as typeof Vec
            )<T>()
        }
        const newVec = new (
            this.constructor as unknown as typeof Vec
        )<T>()
        const newVecLength = endIndex - startIndex
        if (newVecLength < 0) {
            return newVec
        }
        const newMemory = this._memory.slice()
        const shiftStartIndex = startIndex * elementSize
        const shiftEndIndex = endIndex * elementSize
        newMemory.copyWithin(
            0, 
            shiftStartIndex, 
            shiftEndIndex
        );
        (newVec as unknown as {_length: number})._length = newVecLength
        newVec._memory = newMemory
        deallocateExcessMemory(newVec)
        return newVec
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})
        
        p.copyWithin(0, 2, p.length)
        console.log(p.index(0).e) 
        console.log(p.index(1).e) 
        console.log(p.index(2).e) 
        console.log(p.index(3).e) 
        console.log(p.index(4).e) 
     * ```
     */
    copyWithin(
        target: number,
        start: number = 0,
        end?: number
    ): Vec<T> {
        const sizeOfElement = this.elementSize
        const length = this._length
        const targetIndex = target < 0 ? length + target : target
        if (targetIndex < 0 || targetIndex > length - 1) {
            return this
        }
        const startIndex = start < 0 ? length + start : start
        if (startIndex < 0 || startIndex > length - 1) {
            return this
        }
        end = end || length
        const endIndex = end < 0 ? length + end : end
        if (endIndex < 0 || endIndex > length) {
            return this
        }
        (this._memory as Float32Array).copyWithin(
            targetIndex * sizeOfElement,
            startIndex * sizeOfElement,
            endIndex * sizeOfElement,
        )
        return this
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * 
     * 
     * const p = new PositionV(15)
     * console.log(p.capacity) 
     * 
     * 
     * p.reserve(100)
     * console.log(p.capacity) 
     * ```
     */
    reserve(additional: number) {
        try {
            const elementSize = this.elementSize
            const length = this._length
            const capacity = this._capacity
            if (length + additional <= capacity) {
                return
            }
            const newCapacity = length + additional
            const elementsMemory = (
                MEMORY_LAYOUT.BYTES_PER_ELEMENT
                * elementSize
                * newCapacity
            )
            const bufferSize = (
                encoding.encodingBytes
                + elementsMemory
            )
            const buffer = new BUFFER_TYPE(bufferSize)
            const memory = new MEMORY_LAYOUT(buffer)
            memory.set(this._memory)
            this._memory = memory;
            (this._capacity as number) = newCapacity
            return this
        } catch (err) {
            console.error(`Vec ::allocator: runtime failed to allocate more memory for vec. Aborting operation`, err)
            throw err
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})
        p.reverse()
        console.log(p.index(0).e) 
        console.log(p.index(1).e) 
        console.log(p.index(2).e) 
        console.log(p.index(3).e) 
        console.log(p.index(4).e) 
     * ```
     */
    reverse(): Vec<T> {
        const elementSize = this.elementSize
        const length = this._length
        if (length < 2) {
            return this
        }
        let start = 0
        let end = this._length - 1
        this.reserve(1)
        const temporaryIndex = this._length * elementSize
        while (start < end) {
            const startElementStartIndex = start * elementSize;
            (this._memory as Float32Array).copyWithin(
                temporaryIndex, 
                startElementStartIndex, 
                startElementStartIndex + elementSize
            )
            const endElementStartIndex = end * elementSize;
            (this._memory as Float32Array).copyWithin(
                startElementStartIndex,
                endElementStartIndex,
                endElementStartIndex + elementSize
            );
            (this._memory as Float32Array).copyWithin(
                endElementStartIndex,
                temporaryIndex,
                temporaryIndex + elementSize
            )
            start += 1
            end -= 1
        }
        return this
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * 
     * const pos = new PositionsV(3).fill({x: 1, y: 1, z: 1})
     * const pos1 = new PositionsV(2).fill({x: 2, y: 1, z: 1})
     * const pos2 = new PositionsV(4).fill({x: 3, y: 1, z: 1})
     * 
     * const pos3 = pos.concat(pos1, pos2)
     * console.log(pos3.length) 
     * 
     * console.log(pos3 !== pos2) 
     * console.log(pos3 !== pos1) 
     * console.log(pos3 !== pos) 
     * 
     * console.log(pos3.index(0).e) 
     * console.log(pos3.index(3).e) 
     * console.log(pos3.index(5).e) 
     * ```
     */
    concat(...vecs: Vec<T>[]): Vec<T> {
        const elementSize = this.elementSize
        let combinedLength = 0
        let combinedCapacity = 0
        combinedLength += this.length
        combinedCapacity += this.capacity
        for (let i = 0; i < vecs.length; i += 1) {
            const vec = vecs[i]
            combinedLength += vec.length
            combinedCapacity += vec.capacity
        }
        const newVec = new (
            this.constructor as unknown as typeof Vec
        )<T>(combinedCapacity)
        let copyLength = 0;
        (newVec._memory as Float32Array).set(
            this._memory,
            copyLength
        )
        copyLength += (this.length * elementSize)
        for (let i = 0; i < vecs.length; i += 1) {
            const vec = vecs[i];
            (newVec._memory as Float32Array).set(
                vec._memory,
                copyLength
            )
            copyLength += (vec.length * elementSize)
        }
        (newVec as unknown as {_length: number})._length = combinedLength
        deallocateExcessMemory(newVec)
        return newVec
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})
        console.log(p.pop()) 
        console.log(p.length) 
        console.log(p.pop()) 
        console.log(p.length) 
        
        p.pop(); p.pop(); p.pop();
        console.log(p.length) 
        console.log(p.pop()) 
        console.log(p.length) 
     * ```
     */
    pop(): Struct<T> | undefined {
        if (this._length < 1) {
            deallocateExcessMemory(this)
            return
        }
        const targetElement = this.index(this._length - 1).e;
        this._length -= 1
        deallocateExcessMemory(this)
        return targetElement
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})
        const newLen = p.truncate(p.length)
        console.log(newLen) 
        console.log(p.length) 
     * ```
     */
    truncate(count: number): number {
        if (this._length < 1) {
            deallocateExcessMemory(this)
            return 0
        }
        const removeCount = count > this._length
            ? this._length
            : count;
        this._length -= removeCount
        deallocateExcessMemory(this)
        return this._length
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(15).fill({x: 1, y: 1, z: 1})
     * console.log(p.length) 
     * 
     * p.forEach(pos => {
     *      console.log(pos.e) 
     * })
     * ```
     */
    fill(
        value: Struct<T>,
        start: number = 0,
        end?: number
    ): Vec<T> {
        const elementSize = this.elementSize
        const capacity = this._capacity
        const length = this._length
        let startIndex = start < 0 ? length + start : start
        startIndex = startIndex < 0 
            ? 0 
            : startIndex > length - 1 ? length : startIndex  
        end = end || capacity
        let endIndex = end < 0 ? capacity + end : end
        endIndex = endIndex < 0 
            ? 0
            : endIndex > capacity ? capacity : endIndex
        const lengthIncrease = endIndex - startIndex
        if (lengthIncrease < 1) {
            return this
        }
        this.index(startIndex).e = value
        if (lengthIncrease < 2) {
            return this
        }
        const copyStart = startIndex * elementSize
        const endIndexRaw = endIndex * elementSize
        let copyRange = elementSize
        let copyEnd = copyStart + copyRange
        let operationIndex = copyEnd;
        (this._length as number) = startIndex
        while (operationIndex < endIndexRaw) {
            (this._memory as Float32Array).copyWithin(
                operationIndex, 
                copyStart, 
                copyEnd
            )
            copyRange += copyRange
            copyEnd = copyStart + copyRange
            operationIndex = copyEnd
        }
        (this._memory as Float32Array).copyWithin(
            operationIndex,
            copyStart,
            copyEnd
        );
        this._length += lengthIncrease
        return this
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV()
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10}, {x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})
        console.log(p.length) 
        console.log(p.index(0).e) 
        console.log(p.index(4).e) 
     * ```
     */
    push(...structs: Struct<T>[]): number {
        const elementSize = this.elementSize
        let length = this._length
        const capacity = this._capacity
        const minimumCapcity = length + structs.length
        if (minimumCapcity > capacity) {
            try {
                const targetCapacity = capacity * 2
                const newCapacity = minimumCapcity > targetCapacity
                    ? minimumCapcity + defaults.capacity
                    : targetCapacity
                const elementsMemory = (
                    MEMORY_LAYOUT.BYTES_PER_ELEMENT
                    * elementSize
                    * newCapacity
                )
                const bufferSize = (
                    encoding.encodingBytes
                    + elementsMemory
                )
                const buffer = new BUFFER_TYPE(bufferSize)
                const memory = new MEMORY_LAYOUT(buffer)
                memory.set(this._memory)
                this._memory = memory;
                (this._capacity as number) = newCapacity
            } catch (err) {
                throw new Error(`[Vec::allocator] runtime failed to allocate more memory for vec. ${err}`)
            }
        }
        const previousIndex = this._cursor._viewingIndex
        for (let i = 0; i < structs.length; i += 1) {
            const value = structs[i]
            this.index(length).e = value
            length += 1
        }
        (this._length as number) = length
        this._cursor._viewingIndex = previousIndex
        return length
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})
        p.splice(1, 2)
        console.log(p.length) 
        console.log(p.index(0).e) 
        console.log(p.index(1).e) 
        console.log(p.index(2).e) 
     * ```
     *
     * @example <caption>Adding Elements</caption>
     * ```js
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})
        p.splice(1, 0, {x: 1, y: 1, z: 1}, {x: 2, y: 2, z: 2})
        console.log(p.length) 
        console.log(p.index(0).e) 
        console.log(p.index(1).e) 
        console.log(p.index(2).e) 
        console.log(p.index(3).e) 
        console.log(p.index(4).e) 
        console.log(p.index(5).e) 
        console.log(p.index(6).e) 
     * ```
     * 
     * @example <caption>Adding and Removing Elements Simultaneously</caption>
     * ```js
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})
        p.splice(1, 2, {x: 1, y: 1, z: 1}, {x: 2, y: 2, z: 2})
        console.log(p.length) 
        console.log(p.index(0).e) 
        console.log(p.index(1).e) 
        console.log(p.index(2).e) 
        console.log(p.index(3).e) 
        console.log(p.index(4).e) 
     * ```
     */
    splice(
        start: number,
        deleteCount?: number,
        ...items: Struct<T>[]
    ): Vec<T> {
        const elementSize = this.elementSize
        const length = this._length
        const startIndex = start < 0 ? length + start : start
        const initialCapacity = items.length + defaults.capacity
        const vec = new (
            this.constructor as unknown as typeof Vec
        )<T>(
            initialCapacity
        )
        if (startIndex < 0 || startIndex > length - 1) {
            return vec
        }
        let maxDeleteCount = length - startIndex
        maxDeleteCount = maxDeleteCount < 0 
            ? 0 
            : maxDeleteCount
        deleteCount = deleteCount === undefined 
            ? maxDeleteCount 
            : deleteCount
        deleteCount = deleteCount < 1 
            ? 0 
            : deleteCount
        deleteCount = deleteCount > maxDeleteCount 
            ? maxDeleteCount 
            : deleteCount
        let itemsIndex = 0
        if (deleteCount === items.length) {
            for (let i = startIndex; i < (startIndex + items.length); i += 1) {
                const element = this.index(i)
                vec.push(element.e)
                const item = items[itemsIndex]
                element.e = item
                itemsIndex += 1
            }
        } else if (deleteCount > items.length) {
            const startOfDeletions = startIndex + items.length
            for (let i = startIndex; i < startOfDeletions; i += 1) {
                vec.push(this.index(i).e)
                this.index(i).e = items[itemsIndex]
                itemsIndex += 1
            }
    
            const numberOfItemsToDelete = deleteCount - items.length
            for (let i = startOfDeletions; i < startOfDeletions + numberOfItemsToDelete; i += 1) {
                const currentItem = this.index(i).e
                vec.push(currentItem)
            }
            const shiftTargetIndex = (startIndex + items.length) * elementSize
            const shiftStartIndex = (startIndex + deleteCount) * elementSize
            const shiftEndIndex = this._length * elementSize;
            (this._memory as Float32Array).copyWithin(
                shiftTargetIndex, 
                shiftStartIndex, 
                shiftEndIndex
            );
            (this._length as number) -= numberOfItemsToDelete
            deallocateExcessMemory(this)
        } else {
            const lengthIncrease = items.length - deleteCount
            this.reserve(lengthIncrease)
    
            const shiftTargetIndex = (startIndex + lengthIncrease) * elementSize
            const shiftStartIndex = startIndex * elementSize;
            (this._memory as Float32Array).copyWithin(
                shiftTargetIndex, 
                shiftStartIndex
            );
            (this._length as number) += lengthIncrease
    
            const deletionsEndIndex = startIndex + deleteCount
            for (let i = startIndex; i < deletionsEndIndex; i += 1) {
                vec.push(this.index(i).e)
                this.index(i).e = items[itemsIndex]
                itemsIndex += 1
            }
    
            for (let i = deletionsEndIndex; i < startIndex + items.length; i += 1) {
                this.index(i).e = items[itemsIndex]
                itemsIndex += 1
            }
        }
        return vec
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})
        console.log(p.shift()) 
        console.log(p.length) 
        console.log(p.shift()) 
        console.log(p.length) 
        
        p.shift(); p.shift(); p.shift();
        console.log(p.length) 
        console.log(p.shift()) 
        console.log(p.length) 
     * ```
     */
    shift(): Struct<T> | undefined {
        const elementSize = this.elementSize
        const length = this._length
        if (length < 1) {
            deallocateExcessMemory(this)
            return
        }
        const element = this.index(0).e;
        this._length -= 1
        if (length < 2) {
            deallocateExcessMemory(this)
            return element
        }
        const copyStart = 1 * elementSize
        const copyEnd = (
            ((length - 1) * elementSize) 
            + elementSize
        );
        (this._memory as Float32Array).copyWithin(
            0, 
            copyStart, 
            copyEnd
        )
        deallocateExcessMemory(this)
        return element
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV()
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})
        p.unshift({x: 2, y: 4, z: 10})
        p.unshift({x: 2, y: 3, z: 8}, {x: 1, y: 3, z: 0})
        console.log(p.length) 
        console.log(p.index(0).e) 
        console.log(p.index(1).e) 
        console.log(p.index(2).e) 
        console.log(p.index(3).e) 
        console.log(p.index(4).e) 
     * ```
     */
    unshift(...structs: Struct<T>[]): number {
        const elementSize = this.elementSize
        const length = this._length
        const newLength = length + structs.length;
        (this._length as number) = newLength
        if (length < 1) {
            for (let i = 0; i < structs.length; i += 1) {
                this.index(i).e = structs[i]
            }
            return newLength
        }
        const shiftToIndex = structs.length * elementSize;
        (this._memory as Float32Array).copyWithin(
            shiftToIndex,
            0
        )
        for (let i = 0; i < structs.length; i += 1) {
            this.index(i).e = structs[i]
        }
        return newLength
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * 
     * 
     * const p = new PositionV(15)
     * console.log(p.capacity) 
     * 
     * 
     * 
     * p.shrinkTo(10)
     * console.log(p.capacity) 
     * ```
     */
    shrinkTo(
        minCapacity: number = defaults.capacity
    ): Vec<T> {
        try {
            const elementSize = this.elementSize
            const length = this._length
            const capacity = this._capacity
            const minCapacityNormalize = minCapacity < 0 
                ? 0 
                : minCapacity
            const newCapacity = length + minCapacityNormalize
            if (newCapacity >= capacity) {
                return this
            }
            this._memory = shrinkCapacity(
                this._memory, 
                elementSize, 
                newCapacity
            );
            (this._capacity as number) = newCapacity
            return this
        } catch (err) {
            throw new Error(`[Vec::allocator] runtime failed to deallocate memory for vec. ${err}`)
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV()
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})
        console.log(p.length) 
        p.sort((a, b) => {
            
            
            if (a.x > b.x) {
                return 1
            }
            
            return 0
        })
        console.log(p.index(0).e) 
        console.log(p.index(1).e) 
        console.log(p.index(2).e) 
        console.log(p.index(3).e) 
        console.log(p.index(4).e) 
     * ```
     *
     * @example <caption>Descending Order</caption>
     * ```js
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV()
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})
        console.log(p.length) 
        p.sort((a, b) => {
            
            
            if (a.x < b.x) {
                return -1
            }
            
            return 0
        })
        console.log(p.index(0).e) 
        console.log(p.index(1).e) 
        console.log(p.index(2).e) 
        console.log(p.index(3).e) 
        console.log(p.index(4).e) 
     * ```
     */
    sort(compareFn: SortCompareCallback<T>): Vec<T> {
        if (this._length < 2) {
            return this
        }
        const helperCursor = new this.cursorDef(this)
        this.reserve(1)
        const elementSize = this.elementSize
        const temporaryIndex = this._length * elementSize
        if (this._length === 2) {
            const result = compareFn(
                helperCursor,
                this.index(1)
            )
            if (result !== 0) {
                const startElementStartIndex = 0 * elementSize;
                (this._memory as Float32Array).copyWithin(
                    temporaryIndex, 
                    startElementStartIndex, 
                    startElementStartIndex + elementSize
                )
                const endElementStartIndex = 1 * elementSize;
                (this._memory as Float32Array).copyWithin(
                    startElementStartIndex,
                    endElementStartIndex,
                    endElementStartIndex + elementSize
                );
                (this._memory as Float32Array).copyWithin(
                    endElementStartIndex,
                    temporaryIndex,
                    temporaryIndex + elementSize
                )
            }
            return this
        }
        let elementsAreOrdered = false
        while (!elementsAreOrdered) {
            elementsAreOrdered = true
            for (let i = 0; i < this._length - 1; i += 1) {
                helperCursor._viewingIndex = i * elementSize
                const result = compareFn(
                    helperCursor,
                    this.index(i + 1)
                )
                if (result === 0) {
                    continue
                }
                elementsAreOrdered = false
                const startElementStartIndex = i * elementSize;
                (this._memory as Float32Array).copyWithin(
                    temporaryIndex, 
                    startElementStartIndex, 
                    startElementStartIndex + elementSize
                )
                const endElementStartIndex = (i + 1) * elementSize;
                (this._memory as Float32Array).copyWithin(
                    startElementStartIndex,
                    endElementStartIndex,
                    endElementStartIndex + elementSize
                );
                (this._memory as Float32Array).copyWithin(
                    endElementStartIndex,
                    temporaryIndex,
                    temporaryIndex + elementSize
                )
            }
        }
        return this
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV()
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})
        p.swap(0, 2)
        console.log(p.index(0).e) 
        console.log(p.index(2).e) 
        p.swap(1, 3)
        console.log(p.index(1).e) 
        console.log(p.index(3).e) 
     * ```   
     */
    swap(aIndex: number, bIndex: number): Vec<T> {
        this.reserve(1)
        const elementSize = this.elementSize
        const temporaryIndex = this._length * elementSize;
        aIndex = aIndex < 0 ? this._length + aIndex : aIndex
        const startElementStartIndex = (aIndex * elementSize);
        (this._memory as Float32Array).copyWithin(
            temporaryIndex, 
            startElementStartIndex, 
            startElementStartIndex + elementSize
        )
        bIndex = bIndex < 0 ? this._length + bIndex : bIndex
        const endElementStartIndex = bIndex * elementSize;
        (this._memory as Float32Array).copyWithin(
            startElementStartIndex,
            endElementStartIndex,
            endElementStartIndex + elementSize
        );
        (this._memory as Float32Array).copyWithin(
            endElementStartIndex,
            temporaryIndex,
            temporaryIndex + elementSize
        )
        return this
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
     * import {vec} from "struct-vec.ts"
     * 
     * const PositionV = vec({x: "num", y: "num", z: "num"})
     * const p = new PositionV(20).fill({x: 1, y: 1, z: 1})
     * 
     * console.log(p.length) 
     * p.forEach(pos => {
     *      console.log(pos.e) 
     * })
     * 
     * const vecString = p.toJSON()
     * console.log(typeof vecString) 
     * 
     * const jsonVec = PositionV.fromString(vecString)
     * 
     * console.log(jsonVec.length) 
     * jsonVec.forEach(pos => {
     *      console.log(pos.e) 
     * })
     * ```
     */
    toJSON(): string {
        let memoryStr = "["
        const lastIndex = this.length * this.elementSize
        for (let i = 0; i < lastIndex; i += 1) {
            
            
            
            
            const memoryFragment = this._memory[i] || 0
            memoryStr += (memoryFragment.toString() + ",")
        }
        memoryStr += `${this.elementSize},${this._capacity},${this._length}]`
        return memoryStr
    }
}
function createMemory(
    elementSize: number,
    capacity = defaults.capacity
): ReadonlyFloat32Array {
    const normalizedCapacity = Math.abs(capacity)
    const elementsMemory = (
        MEMORY_LAYOUT.BYTES_PER_ELEMENT
        * elementSize
        * normalizedCapacity
    )
    const bufferSize = (
        elementsMemory
        + encoding.encodingBytes
    )
    const buffer = new BUFFER_TYPE(bufferSize)
    const memory = new MEMORY_LAYOUT(buffer)
    memory[memory.length - encoding.capacityReverseIndex] = normalizedCapacity
    memory[memory.length - encoding.lengthReverseIndex] = 0
    return memory
}
function shrinkCapacity(
    memory: ReadonlyFloat32Array, 
    elementSize: number,
    newCapacity: number
): ReadonlyFloat32Array {
    const elementBytes = (
        MEMORY_LAYOUT.BYTES_PER_ELEMENT
        * elementSize
        * newCapacity
    )
    const bufferBytes = elementBytes + encoding.encodingBytes
    const buffer = new BUFFER_TYPE(bufferBytes)
    const newMemory = new MEMORY_LAYOUT(buffer)
    for (let i = 0; i < memory.length; i += 1) {
        newMemory[i] = memory[i]
    }
    return newMemory
}
function deallocateExcessMemory<T extends StructDef>(
    vec: Vec<T>
) {
    const elementSize = vec.elementSize
    const length = vec.length
    const capacity = vec.capacity
    if (capacity - length <= defaults.memoryCollectionLimit) {
        return
    }
    (vec as unknown as {_memory: ReadonlyFloat32Array})._memory = shrinkCapacity(
        (vec as unknown as {_memory: ReadonlyFloat32Array})._memory, 
        elementSize, 
        length + defaults.memoryCollectionLimit
    );
    (vec as unknown as {_capacity: number})._capacity = (
        length
        + defaults.memoryCollectionLimit
    )
}
export type VecPrimitive = "num" | "bool" | "char"
export type Num<T extends VecPrimitive> = T extends "num" ? number : never
export type Bool<T extends VecPrimitive> = T extends "bool" ? boolean : never
export type Char<T extends VecPrimitive> = T extends "char" ? string : never
export type Primitive<T extends VecPrimitive> = (
    Num<T> 
    | Bool<T>
    | Char<T>
)
export type StructDef = Readonly<{[key: string]: VecPrimitive}>
export type Struct<S extends StructDef> = {[key in keyof S]: Primitive<S[key]>}
type TypedArrayMutableProperties = (
    'copyWithin' 
    | 'fill' 
    | 'reverse' 
    | 'set' 
    | 'sort'
)
export interface ReadonlyFloat32Array extends Omit<
    Float32Array, TypedArrayMutableProperties
> {
    readonly [n: number]: number
}
export type VecCursor<T extends StructDef> = (
    Struct<T> 
    & {e: Struct<T>}
)
export type CursorConstructor<T extends StructDef> = {
    new (self: Vec<T>): VecCursorInternals<T>
}
type VecCursorInternals<T extends StructDef> = (
    VecCursor<T> 
    & {
        _viewingIndex: number
        self: Vec<T>
    }
)
export type SortCompareCallback<T extends StructDef> = (
    (
        a: Readonly<VecCursor<T>>,
        b: Readonly<VecCursor<T>>
    ) => number
) 
export type ForEachCallback<T extends StructDef> = (
    (() => void)
    | ((
        element: VecCursor<T>, 
        index: number, 
        array: Vec<T>
    ) => void)
)
export type MapCallback<T extends StructDef, U> = (
    (() => U)
    | ((
        element: Readonly<VecCursor<T>>, 
        index: number, 
        array: Vec<T>
    ) => U)
)
export type MapvCallback<T extends StructDef> = (
    (() => Struct<T>)
    | ((
        element: VecCursor<T>, 
        index: number, 
        array: Vec<T>
    ) => Struct<T>)
)
export type TruthyIterCallback<T extends StructDef> = (
    (() => boolean)
    | ((
    element: Readonly<VecCursor<T>>, 
    index: number, 
    array: Vec<T>
    ) => boolean)
)
export type ReduceCallback<T extends StructDef, U> = (
    (() => U)
    | ((
        previousValue: U,
        currentValue: Readonly<VecCursor<T>>, 
        index: number, 
        array: Vec<T>
    ) => U)
)