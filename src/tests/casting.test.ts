import {expect, it, describe} from "@jest/globals"
import {vec, Vec} from "../index"
const geoCoordinates = vec({latitude: "num", longitude: "num"})

describe("type checking", () => {
    it("Vec.isVec static method should correctly identify vecs and non-vecs", () => {
        expect(Vec.isVec(new geoCoordinates())).toBe(true)
        const p = vec({x: "num", y: "num", z: "num"})
        expect(Vec.isVec(new p())).toBe(true)

        expect(Vec.isVec(0)).toBe(false)
        expect(Vec.isVec(null)).toBe(false)
        expect(Vec.isVec(undefined)).toBe(false)
        expect(Vec.isVec("hi")).toBe(false)
        expect(Vec.isVec(Symbol("vec"))).toBe(false)
        expect(Vec.isVec(true)).toBe(false)
        expect(Vec.isVec({})).toBe(false)
        expect(Vec.isVec([])).toBe(false)
        expect(Vec.isVec(() => {})).toBe(false)
        expect(Vec.isVec(class FakeVec {})).toBe(false)
    })

    it("Vec.isVec static method for generated class should check if type is instance of generated vec class", () => {
        expect(geoCoordinates.isVec(new geoCoordinates())).toBe(true)
        
        const p = vec({x: "num", y: "num", z: "num"})
        expect(geoCoordinates.isVec(new p())).toBe(false)
        expect(geoCoordinates.isVec(0)).toBe(false)
        expect(geoCoordinates.isVec(null)).toBe(false)
        expect(geoCoordinates.isVec(undefined)).toBe(false)
        expect(geoCoordinates.isVec("hi")).toBe(false)
        expect(geoCoordinates.isVec(Symbol("vec"))).toBe(false)
        expect(geoCoordinates.isVec(true)).toBe(false)
        expect(geoCoordinates.isVec({})).toBe(false)
        expect(geoCoordinates.isVec([])).toBe(false)
        expect(geoCoordinates.isVec(() => {})).toBe(false)
        expect(geoCoordinates.isVec(class FakeVec {})).toBe(false)
    })
})

describe("casting between vec and array", () => {
    it("vec should be able to constructed from an array of compliant structs via 'fromArray' method", () => {
        const geoArray = [
            {latitude: 19.65, longitude: 89.22},
            {latitude: 19.65, longitude: 89.22},
            {latitude: 19.65, longitude: 89.22},
            {latitude: 19.65, longitude: 89.22},
            {latitude: 19.65, longitude: 89.22},
        ]
        expect(geoArray.length).toBe(5)
        const geoVec = geoCoordinates.fromArray(geoArray)
        expect(geoVec.length).toBe(5)
        geoVec.forEach((geo) => {
            expect(geo.e).toEqual({
                latitude: Math.fround(19.65), 
                longitude: Math.fround(89.22)
            })
        })
    })

    it("Should be able to create array from vec via spread operator", () => {
        const PositionV = vec({"x": "num", "y": "num", "z": "num"})
        const vec1 = new PositionV(5).fill({x: 1, y: 2, z: 3})
        const target = [...vec1]
        expect(target).toEqual(new Array(5).fill({x: 1, y: 2, z: 3}))
    })
})

describe("casting between vec memory (float64Array) and vec", () => {
    it("should be able to construct vec from another vec's memory", () => {
        const Cats = vec({isCool: "num", isDangerous: "num"})
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

    it("should be able to cast vec into float64array", () => {
        const Cats = vec({isCool: "num", isDangerous: "num"})
        const cats = new Cats().fill({isCool: 1, isDangerous: 1})
        expect(ArrayBuffer.isView(cats.memory)).toBe(true)
    })
})

describe("casting between string and vec", () => {
    it("vec can be transformed into a string", () => {
        const geo = new geoCoordinates(15).fill({
            latitude: 20.10,
            longitude: 76.52
        })
        expect(typeof geo.toJSON()).toBe("string")
    })

    it("vec can be transformed via JSON.stringify with no error", () => {
        const geo = new geoCoordinates(15).fill({
            latitude: 20.10,
            longitude: 76.52
        })
        const json = JSON.stringify(geo)
        expect(typeof json).toBe("string")
    })

    it("vec's stringified rendition can be parsed by JSON.parse with no errors", () => {
        const geo = new geoCoordinates(15).fill({
            latitude: 20.10,
            longitude: 76.52
        })
        const json = JSON.stringify(geo)
        expect(typeof json).toBe("string")
        expect(() => JSON.parse(json)).not.toThrow()
    })

    it("string rendition of vec can be casted to vec again", () => {
        const geo = new geoCoordinates(15).fill({
            latitude: 20.10,
            longitude: 76.52
        })
        geo.reserve(100)
        const string = JSON.stringify(geo)
        const parsed = JSON.parse(string)
        const geoCopy = geoCoordinates.fromString(parsed)
        expect(Vec.isVec(geoCopy)).toBe(true)
        expect(geoCopy.length).toBe(geo.length)
        expect(geoCopy.capacity).toBe(geoCopy.capacity)
        geo.forEach((coordinate, i) => {
            expect(coordinate.e).toEqual(
                geoCopy.index(i).e
            )
        })
        expect(true).toBe(true)
    })

    it("casting to string casts any NaNs to 0", () => {
        const geo = new geoCoordinates(15).fill({
            latitude: 20.10,
            longitude: 76.52
        })
        // @ts-ignore
        geo.index(0).latitude = "hi";geo.index(1).longitude = "hi";
        expect(geo.index(0).latitude).toBe(NaN)
        expect(geo.index(1).longitude).toBe(NaN)
        const str = geo.toJSON()
        const NaNsRemoved = geoCoordinates.fromString(str)
        expect(NaNsRemoved.index(0).latitude).toBe(0)
        expect(NaNsRemoved.index(1).longitude).toBe(0)
    })
})
