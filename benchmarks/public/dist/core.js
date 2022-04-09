const MEMORY_LAYOUT = Float32Array;
const BUFFER_TYPE = SharedArrayBuffer;
export const VALID_DATA_TYPES_INTERNAL = [
    "f32",
    "i32",
    "char",
    "bool"
];
export class Vec {
    constructor(initialCapacity = 15, memory) {
        let vecCapacity = 0;
        let vecLength = 0;
        let buffer;
        if (!memory) {
            vecCapacity = Math.abs(initialCapacity);
            buffer = this.createMemory(vecCapacity);
        }
        else {
            vecLength = memory[memory.length - 1];
            vecCapacity = memory[memory.length - 2];
            buffer = memory.buffer;
        }
        this._f32Memory = new Float32Array(buffer);
        this._i32Memory = new Int32Array(buffer);
        this._length = vecLength;
        this._capacity = vecCapacity;
        this._cursor = new this.cursorDef(this, 0);
    }
    static isVec(candidate) {
        return candidate instanceof this;
    }
    static fromMemory(memory) {
        return new this(0, memory);
    }
    static fromArray(structArray) {
        const newVec = new this(structArray.length + 15);
        newVec.push(...structArray);
        return newVec;
    }
    static fromString(vecString) {
        const arr = JSON.parse(vecString);
        if (!Array.isArray(arr)) {
            throw TypeError(`inputted string was not a stringified vec`);
        }
        const newVec = new this(0);
        const elementSize = arr[arr.length - 3];
        if (elementSize !== newVec.elementSize) {
            throw TypeError(`Inputted array does not match the encoding for this vec class. Size of element must be ${newVec.elementSize}, got "${elementSize}" (type=${typeof elementSize})`);
        }
        const length = arr[arr.length - 1];
        const capacity = arr[arr.length - 2];
        if (!Number.isInteger(length) || !Number.isInteger(capacity)) {
            throw TypeError(`Inputted length or capacity of vec is not an integer.`);
        }
        newVec.reserve(capacity);
        const vecMemory = newVec._f32Memory;
        for (let i = 0; i < arr.length - 3; i += 1) {
            vecMemory[i] = arr[i];
        }
        newVec._length = length;
        return newVec;
    }
    get elementSize() {
        return 1;
    }
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
    get length() {
        return this._length;
    }
    get capacity() {
        return this._capacity;
    }
    get memory() {
        const memory = this._i32Memory;
        memory[memory.length - 2] = this._capacity;
        memory[memory.length - 1] = this._length;
        return memory;
    }
    set memory(newMemory) {
        this._capacity = newMemory[newMemory.length - 2];
        this._length = newMemory[newMemory.length - 1];
        this._i32Memory = newMemory;
        this._f32Memory = new Float32Array(newMemory.buffer);
    }
    index(index) {
        this._cursor._viewingIndex = index * this.elementSize;
        return this.cursor;
    }
    at(index) {
        const normalize = Math.abs(index);
        return this.index(index < 0 && normalize !== 0
            ? this._length - normalize
            : normalize);
    }
    forEach(callback) {
        const previousIndex = this._cursor._viewingIndex;
        const length = this._length;
        for (let i = 0; i < length; i += 1) {
            const element = this.index(i);
            callback(element, i, this);
        }
        this._cursor._viewingIndex = previousIndex;
    }
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
    reserve(additional) {
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
        const bufferSize = (8
            + elementsMemory);
        const buffer = new BUFFER_TYPE(bufferSize);
        const memory = new MEMORY_LAYOUT(buffer);
        memory.set(this._f32Memory);
        this.replaceMemory(memory);
        this._capacity = newCapacity;
        return this;
    }
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
    push(...structs) {
        const elementSize = this.elementSize;
        let length = this._length;
        const capacity = this._capacity;
        const minimumCapcity = length + structs.length;
        if (minimumCapcity > capacity) {
            const targetCapacity = capacity * 2;
            const newCapacity = minimumCapcity > targetCapacity
                ? minimumCapcity + 15
                : targetCapacity;
            const elementsMemory = (MEMORY_LAYOUT.BYTES_PER_ELEMENT
                * elementSize
                * newCapacity);
            const bufferSize = (8
                + elementsMemory);
            const buffer = new BUFFER_TYPE(bufferSize);
            const memory = new MEMORY_LAYOUT(buffer);
            memory.set(this._f32Memory);
            this.replaceMemory(memory);
            this._capacity = newCapacity;
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
    splice(start, deleteCount, ...items) {
        const elementSize = this.elementSize;
        const length = this._length;
        const startIndex = start < 0 ? length + start : start;
        const initialCapacity = items.length + 15;
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
    shrinkTo(minCapacity = 15) {
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
    sort(compareFn) {
        if (this._length < 2) {
            return this;
        }
        const helperCursor = new this.cursorDef(this, 0);
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
    toJSON() {
        let memoryStr = "[";
        const lastIndex = this.length * this.elementSize;
        for (let i = 0; i < lastIndex; i += 1) {
            const memoryFragment = this._f32Memory[i] || 0;
            memoryStr += (memoryFragment.toString() + ",");
        }
        memoryStr += `${this.elementSize},${this._capacity},${this._length}]`;
        return memoryStr;
    }
    detachedCursor(index) {
        return new this.cursorDef(this, index);
    }
    createMemory(capacity) {
        const elementsMemory = (MEMORY_LAYOUT.BYTES_PER_ELEMENT
            * this.elementSize
            * capacity);
        return new SharedArrayBuffer(elementsMemory
            + 8);
    }
    shrinkCapacity(newCapacity) {
        const elementBytes = (MEMORY_LAYOUT.BYTES_PER_ELEMENT
            * this.elementSize
            * newCapacity);
        const bufferBytes = elementBytes + 8;
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
            <= 50) {
            return;
        }
        const memory = this.shrinkCapacity(length + 50);
        this.replaceMemory(memory);
        this._capacity = (length
            + 50);
    }
    replaceMemory(memory) {
        this._f32Memory = memory;
        this._i32Memory = new Int32Array(memory.buffer);
    }
}
Vec.def = {};
Vec.elementSize = 0;
