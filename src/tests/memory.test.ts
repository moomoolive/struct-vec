import {expect, it, describe} from "@jest/globals"
import {vec} from "../index"

const Cats = vec({isDangerous: "f32", isCool: "f32"})

describe("automatic memory management", () => {
    it("automatically resizes if capacity is at maximum", () => {
        const PositionVec = vec({x: "f32", y: "f32", z: "f32"})
        const positions = new PositionVec(1)

        expect(positions.length).toBe(0)
        expect(positions.capacity).toBe(1)
        positions.push({x: 1, y: 5, z: 1})
        expect(positions.length).toBe(1)
        expect(positions.capacity).toBe(1)
        
        let currentCapacity = 1
        positions.push({x: 1, y: 5, z: 1})
        expect(positions.length).toBe(2)
        expect(positions.capacity).toBeGreaterThan(currentCapacity)
        currentCapacity = positions.capacity
        positions.push({x: 1, y: 5, z: 1})
        positions.push({x: 1, y: 5, z: 1})
        positions.push({x: 1, y: 5, z: 1})
        positions.push({x: 1, y: 5, z: 1})
        expect(positions.length).toBe(6)
        expect(positions.capacity).toBeGreaterThan(currentCapacity)
    })

    it("automatically deallocates memory on the next removal action (eg. pop, shift, etc.) if capacity is 50 elements greater than length", () => {
        const cats = new Cats(1)
        cats.push({isDangerous: 3, isCool: 4})
        expect(cats.length).toBe(1)
        expect(cats.capacity).toBe(1)

        cats.reserve(10_000)

        const expectedCapacity = 10_001
        expect(cats.length).toBe(1)
        expect(cats.capacity).toBe(expectedCapacity)

        cats.pop()
        expect(cats.length).toBe(0)
        expect(cats.capacity).toBe(50)
    })
})

describe("manual memory management", () => {
    it("vecs from the same class can swap memory and not cause corruption", () => {
        const cats = new Cats().fill({isCool: 1, isDangerous: 1})
        const catties = new Cats().fill({isCool: 2, isDangerous: 2})

        const capacity = cats.capacity
        expect(cats.length).toBe(capacity)
        expect(catties.length).toBe(capacity)

        cats.forEach((cat) => {
            expect(cat.e).toEqual({isCool: 1, isDangerous: 1})
        })
        catties.forEach((cat) => {
            expect(cat.e).toEqual({isCool: 2, isDangerous: 2})
        })

        const catsMemory = cats.memory
        cats.memory = catties.memory
        catties.memory = catsMemory

        expect(cats.length).toBe(capacity)
        expect(catties.length).toBe(capacity)

        catties.forEach((cat) => {
            expect(cat.e).toEqual({isCool: 1, isDangerous: 1})
        })
        cats.forEach((cat) => {
            expect(cat.e).toEqual({isCool: 2, isDangerous: 2})
        })
    })
    
    it("shrinkTo method shrinks vec to inputted capcity or no-op if capcity is smaller than input", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})
        const p = new PositionV(5)

        expect(p.capacity).toBe(5)
        p.shrinkTo(5)
        expect(p.capacity).toBe(5)

        p.shrinkTo(3)
        expect(p.capacity).toBe(3)

        p.fill({x: 1, y: 1, z: 1})
        p.shrinkTo(1)
        expect(p.capacity).toBe(3)

        p.reserve(100)
        expect(p.capacity).toBe(103)
        for (let i = 0; i < 3; i += 1) {
            expect(p.index(i).e).toEqual({x: 1, y: 1, z: 1})
        }

        p.shrinkTo(0)
        expect(p.capacity).toBe(3)
        for (let i = 0; i < 3; i += 1) {
            expect(p.index(i).e).toEqual({x: 1, y: 1, z: 1})
        }
    })

    it("reserve method should only expand capacity of array if length + additional is larger than current capacity", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})
        const vec1 = new PositionV(5)
        
        expect(vec1.capacity).toBe(5)
        vec1.reserve(5)
        expect(vec1.capacity).toBe(5)

        vec1.reserve(3)
        expect(vec1.capacity).toBe(5)

        vec1.reserve(100)
        expect(vec1.capacity).toBe(100)

        vec1.reserve(101)
        expect(vec1.capacity).toBe(101)

        vec1.fill({x: 1, y: 1, z: 1}, 0, 50)
        expect(vec1.length).toBe(50)

        vec1.reserve(50)
        expect(vec1.capacity).toBe(101)

        vec1.reserve(52)
        expect(vec1.capacity).toBe(102)
        expect(vec1.length).toBe(50)
        for (let i = 0; i < 50; i += 1) {
            expect(vec1.index(i).e).toEqual({x: 1, y: 1, z: 1})
        }
    })

    it("Vecs can be constructed from another vecs memory", () => {
        const cats = new Cats().fill({isCool: 1, isDangerous: 1})

        const capacity = cats.capacity
        expect(cats.length).toBe(capacity)
        cats.forEach((cat) => {
            expect(cat.e).toEqual({isCool: 1, isDangerous: 1})
        })
        const newCats = Cats.fromMemory(cats.memory)
        expect(newCats.length).toBe(capacity)
        newCats.forEach((cat) => {
            expect(cat.e).toEqual({isCool: 1, isDangerous: 1})
        })
    })
})

describe("memory protection", () => {
    it("attempting to overwrite cursor results in error", () => {
        const cats = new Cats()
        cats.push({isDangerous: 1, isCool: 3})
        expect(() => {
            //@ts-ignore
            cats.index(0) = {
                isDangerous: 2, isCool: 4
            }
        }).toThrow()
    })

    it("attempting to set length results in error", () => {
        const cats = new Cats()
        cats.push({isDangerous: 1, isCool: 3})
        //@ts-ignore
        expect(() => cats.length = 1).toThrow()
    })

    it("attempting to set capacity results in error", () => {
        const cats = new Cats()
        cats.push({isDangerous: 1, isCool: 3})
        //@ts-ignore
        expect(() => cats.capacity = 1).toThrow()
    })

    it("attempting to create vec with negative initial capacity creates vec with a capacity of the absolute value of input", () => {
        expect(new Cats(-1).capacity).toBe(1)
        expect(new Cats(-15).capacity).toBe(15)
        expect(new Cats(-120).capacity).toBe(120)
    })
})
