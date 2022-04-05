import {expect, it, describe} from "@jest/globals"
import {vec, Vec} from "../index"

describe("vec generation", () => {
    it("should generate a class definition with getters and setter that correspond to inputted keys with standard helper methods", () => {
        const PositionVec = vec({x: "num", y: "num", z: "num"})
        const myPosition = new PositionVec(1)

        myPosition.push({x: 1, y: 2, z: 3})

        const pos = myPosition.index(0)
        expect(pos.x).toBe(1)
        expect(pos.y).toBe(2)
        expect(pos.z).toBe(3)

        pos.x = 1
        expect(pos.x).toBe(1)
        pos.y = 60
        expect(pos.y).toBe(60)
        expect(pos.z).toBe(3)
    })

    it("all standard instance properties exist", () => {
        const PositionVec = vec({x: "num", y: "num", z: "num"})
        const myPosition = new PositionVec(1)
        expect(myPosition.def).toEqual({x: "num", y: "num", z: "num"})
        const memory = myPosition.memory
        expect(ArrayBuffer.isView(memory)).toBe(true)
        expect(ArrayBuffer.isView(memory)).toBe(true)
        expect(myPosition.length).toBe(0)
        expect(myPosition.capacity).toBe(1)
    })

    it("array length increments correctly", () => {
        const PositionVec = vec({x: "num", y: "num", z: "num"})
        const myPosition = new PositionVec(1)

        expect(myPosition.length).toBe(0)
        expect(myPosition.capacity).toBe(1)
        myPosition.push({x: 1, y: 5, z: 1})
        expect(myPosition.length).toBe(1)
        expect(myPosition.capacity).toBe(1)
    })

    it("should be of Vec class", () => {
        const Position = vec({x: "num", y: "num", z: "num"})
        const p = new Position()
        expect(Vec.isVec(p)).toBe(true)
    })

    it("array can push multiple values at once", () => {
        const PositionVec = vec({x: "num", y: "num", z: "num"})
        const myPosition = new PositionVec(1)

        expect(myPosition.length).toBe(0)

        myPosition.push(
            {x: 1, y: 5, z: 1},
            {x: 1, y: 5, z: 1},
            {x: 1, y: 5, z: 1},
            {x: 1, y: 5, z: 1},
            {x: 1, y: 5, z: 1},
        )
        expect(myPosition.length).toBe(5)
        myPosition.forEach((position) => {
            expect(position.e).toEqual({x: 1, y: 5, z: 1})
        })
    })

    it("vec can be push on another vec (of same kind) via spread syntax", () => {
        const PositionVec = vec({x: "num", y: "num", z: "num"})
        const myPosition = new PositionVec(1)

        expect(myPosition.length).toBe(0)

        myPosition.push(
            {x: 1, y: 5, z: 1},
            {x: 1, y: 5, z: 1},
            {x: 1, y: 5, z: 1},
            {x: 1, y: 5, z: 1},
            {x: 1, y: 5, z: 1},
        )
        expect(myPosition.length).toBe(5)

        const position2 = new PositionVec(5).fill({x: 1, y: 7, z: 6})
        myPosition.push(...position2)
        expect(myPosition.length).toBe(10)
        myPosition.forEach((position, index) => {
            if (index > 4) {
                expect(position.e).toEqual({x: 1, y: 7, z: 6})
            } else {
                expect(position.e).toEqual({x: 1, y: 5, z: 1})
            }
        })
    })

    it("mutating one element should not mutate any others", () => {
        const RgbVec = vec({red: "num", blue: "num", green: "num"})
        const rgb = new RgbVec(5)
        
        const newLength = rgb.push({red: 233, blue: 177, green: 0})
        expect(newLength).toBe(1)
        expect(rgb.index(0).e).toEqual({red: 233, blue: 177, green: 0})
        rgb.push({red: 33, blue:0, green: 213})
        expect(rgb.index(1).e).toEqual({red: 33, blue: 0, green: 213})

        const rgb1 = rgb.index(0)
        rgb1.blue = 255
        rgb1.red = 55
        expect(rgb1.e).toEqual({red: 55, blue: 255, green: 0})
        expect(rgb.index(1).e).toEqual({red: 33, blue: 0, green: 213})
        expect(rgb.length).toBe(2)
        rgb.push({red: 1, blue: 1, green: 1})
        expect(rgb.length).toBe(3)
        rgb.index(2).blue = 2
        expect(rgb.index(2).e).toEqual({red: 1, blue: 2, green: 1})
        expect(rgb.index(0).e).toEqual({red: 55, blue: 255, green: 0})
    })
    
    it("to object returns the correct js object repersentation of struct", () => {
        const QuaternionVec = vec({x: "num", y: "num", z: "num", w: "num"})
        const q4 = new QuaternionVec()
        q4.push({x: 0, y: 0, z: 200, w: 3})
        expect(q4.index(0).e).toEqual({x: 0, y: 0, z: 200, w: 3})

        const NpcVec = vec({"isCool": "num", "likesYoda": "num"})
        const npcs = new NpcVec()
        npcs.push({likesYoda: 500, isCool: 1})
        expect(npcs.index(0).e).toEqual({isCool: 1, likesYoda: 500})
    })

    it("adding and removing lots of items works", () => {
        const Vec3V = vec({x: "num", y: "num", z: "num"})
        const vec3 = new Vec3V()
        for (let i = 0; i < 2_000; i += 1) {
            expect(vec3.push({x: 1, y: 1, z: 1})).toBe(i + 1)
        }
        expect(vec3.length).toBe(2_000)
        for (let i = 0; i < 2_000; i += 1) {
            expect(vec3.pop()).toEqual({x: 1, y: 1, z: 1})
        }
        expect(vec3.length).toBe(0)
    })

    it("all properties of an element with the vec can be set at once", () => {
        const Vec3V = vec({x: "num", y: "num", z: "num"})
        const vec3 = new Vec3V()
        vec3.push({x: 1, y: 1, z: 1})
        vec3.push({x: 2, y: 2, z: 1})
        const val = vec3.index(1).e
        vec3.index(0).e = val
        expect(vec3.index(0).e).toEqual({x: 2, y: 2, z: 1})
    })
})

describe("bool data type", () => {
    it("single bool generated correctly", () => {
        const BooleanClass = vec({testBool: "bool"})
        const b = new BooleanClass()
        b.push({testBool: true})
        expect(b.index(0).testBool).not.toBe(undefined)
        expect(b.index(0).testBool).toBe(true)
        b.index(0).testBool = false
        expect(b.index(0).testBool).toBe(false)
        b.index(0).testBool = true
        expect(b.index(0).testBool).toBe(true)
    })

    it("multiple bools generated correctly", () => {
        const BooleanClass = vec({
            testBool: "bool", 
            testBool2: "bool",
            testBool3: "bool",
        })
        const b = new BooleanClass()
        b.push({testBool: true, testBool2: true, testBool3: true})

        expect(b.index(0).testBool).not.toBe(undefined)
        expect(b.index(0).testBool).toBe(true)
        b.index(0).testBool = false
        expect(b.index(0).testBool).toBe(false)
        b.index(0).testBool = true
        expect(b.index(0).testBool).toBe(true)

        expect(b.index(0).testBool2).not.toBe(undefined)
        expect(b.index(0).testBool2).toBe(true)
        b.index(0).testBool2 = false
        expect(b.index(0).testBool2).toBe(false)
        b.index(0).testBool2 = true
        expect(b.index(0).testBool2).toBe(true)

        expect(b.index(0).e).toEqual({
            testBool: true, 
            testBool2: true, 
            testBool3: true
        })
    })

    it("setting one bool doesn't set others", () => {
        const BooleanClass = vec({
            testBool: "bool", 
            testBool2: "bool",
            testBool3: "bool",
        })
        const b = new BooleanClass()
        b.push({
            testBool: true, 
            testBool2: true, 
            testBool3: true
        })

        b.index(0).testBool = false
        expect(b.index(0).testBool).toBe(false)
        expect(b.index(0).testBool2).toBe(true)
        expect(b.index(0).testBool3).toBe(true)

        b.index(0).testBool = true
        expect(b.index(0).testBool).toBe(true)
        expect(b.index(0).testBool2).toBe(true)
        expect(b.index(0).testBool3).toBe(true)

        b.index(0).testBool2 = false
        expect(b.index(0).testBool).toBe(true)
        expect(b.index(0).testBool2).toBe(false)
        expect(b.index(0).testBool3).toBe(true)

        b.index(0).testBool3 = false
        expect(b.index(0).testBool).toBe(true)
        expect(b.index(0).testBool2).toBe(false)
        expect(b.index(0).testBool3).toBe(false)
    })

    it("more than 32 bools in class generates correctly", () => {
        const schema = {}
        const boolNum = 34
        for (let i = 0; i < boolNum; i += 1) {
            // @ts-ignore
            schema["testBool" + i.toString()] = "bool"
        }
        const BooleanClass = vec(schema)
        const b = new BooleanClass()
        const val = {}
        for (let i = 0; i < boolNum; i += 1) {
            // @ts-ignore
            val["testBool" + i.toString()] = true
        }
        b.push(val)

        for (let i = 0; i < boolNum; i += 1) {
            const key = "testBool" + i.toString() as unknown as keyof typeof schema
            expect(b.index(0)[key]).not.toBe(undefined)
            expect(b.index(0)[key]).toBe(true);
            (b.index(0)[key] as boolean) = false
            expect(b.index(0)[key]).toBe(false);
            (b.index(0)[key] as boolean) = true
            expect(b.index(0)[key]).toBe(true)
        }
    })

    it("mixing bool and other types generates correct class", () => {
        const BooleanClass = vec({
            testBool: "bool", 
            x: "num",
            testBool2: "bool",
            cat: "char"
        })
        const b = new BooleanClass()
        b.push({
            testBool: true, 
            x: 1, 
            testBool2: false,
            cat: "😸"
        })
        expect(b.index(0).testBool).not.toBe(undefined)
        expect(b.index(0).testBool).toBe(true)
        b.index(0).testBool = false
        expect(b.index(0).testBool).toBe(false)
        b.index(0).testBool = true
        expect(b.index(0).testBool).toBe(true)

        expect(b.index(0).x).toBe(1)
        b.index(0).x = 2
        expect(b.index(0).x).toBe(2)

        expect(b.index(0).testBool2).not.toBe(undefined)
        expect(b.index(0).testBool2).toBe(false)
        b.index(0).testBool2 = true
        expect(b.index(0).testBool2).toBe(true)
        b.index(0).testBool2 = false
        expect(b.index(0).testBool2).toBe(false)

        expect(b.index(0).e).toEqual({
            testBool: true, 
            x: 2, 
            testBool2: false,
            cat: "😸"
        })
    })

    it("setting bool type with other than boolean type does not lead to memory corruption and only affects targeted bool", () => {
        const BooleanClass = vec({
            testBool: "bool", 
            testBool2: "bool",
            testBool3: "bool",
        })
        const b = new BooleanClass()
        b.push({
            testBool: true, 
            testBool2: true, 
            testBool3: true
        })

        // @ts-ignore
        b.index(0).testBool = {}
        expect(typeof b.index(0).testBool).toBe("boolean")
        expect(b.index(0).testBool2).toBe(true)
        expect(b.index(0).testBool3).toBe(true)

        // @ts-ignore
        b.index(0).testBool = []
        expect(typeof b.index(0).testBool).toBe("boolean")
        expect(b.index(0).testBool2).toBe(true)
        expect(b.index(0).testBool3).toBe(true)

        // @ts-ignore
        b.index(0).testBool = null
        expect(typeof b.index(0).testBool).toBe("boolean")
        expect(b.index(0).testBool2).toBe(true)
        expect(b.index(0).testBool3).toBe(true)

        // @ts-ignore
        b.index(0).testBool = undefined
        expect(typeof b.index(0).testBool).toBe("boolean")
        expect(b.index(0).testBool2).toBe(true)
        expect(b.index(0).testBool3).toBe(true)

        // @ts-ignore
        b.index(0).testBool = 1
        expect(typeof b.index(0).testBool).toBe("boolean")
        expect(b.index(0).testBool2).toBe(true)
        expect(b.index(0).testBool3).toBe(true)

        // @ts-ignore
        b.index(0).testBool = 400
        expect(typeof b.index(0).testBool).toBe("boolean")
        expect(b.index(0).testBool2).toBe(true)
        expect(b.index(0).testBool3).toBe(true)

        // @ts-ignore
        b.index(0).testBool = 2
        expect(typeof b.index(0).testBool).toBe("boolean")
        expect(b.index(0).testBool2).toBe(true)
        expect(b.index(0).testBool3).toBe(true)

        // @ts-ignore
        b.index(0).testBool = 4
        expect(typeof b.index(0).testBool).toBe("boolean")
        expect(b.index(0).testBool2).toBe(true)
        expect(b.index(0).testBool3).toBe(true)

        // @ts-ignore
        b.index(0).testBool = 0
        expect(typeof b.index(0).testBool).toBe("boolean")
        expect(b.index(0).testBool2).toBe(true)
        expect(b.index(0).testBool3).toBe(true)

        // @ts-ignore
        b.index(0).testBool = "hi"
        expect(typeof b.index(0).testBool).toBe("boolean")
        expect(b.index(0).testBool2).toBe(true)
        expect(b.index(0).testBool3).toBe(true)

        // @ts-ignore
        b.index(0).testBool = Symbol()
        expect(typeof b.index(0).testBool).toBe("boolean")
        expect(b.index(0).testBool2).toBe(true)
        expect(b.index(0).testBool3).toBe(true)
    })

    it("setting bool field with type other than boolean and is truthy sets field to true", () => {
        const BooleanClass = vec({testBool: "bool"})
        const b = new BooleanClass()
        b.push({testBool: false})
        
        //@ts-ignore
        b.index(0).testBool = {}
        expect(b.index(0).testBool).toBe(true)
        b.index(0).testBool = false

        //@ts-ignore
        b.index(0).testBool = []
        expect(b.index(0).testBool).toBe(true)
        b.index(0).testBool = false

        //@ts-ignore
        b.index(0).testBool = 1
        expect(b.index(0).testBool).toBe(true)
        b.index(0).testBool = false

        //@ts-ignore
        b.index(0).testBool = Symbol()
        expect(b.index(0).testBool).toBe(true)
        b.index(0).testBool = false
    })

    it("setting bool field with type other than boolean and is false sets field to false", () => {
        const BooleanClass = vec({testBool: "bool"})
        const b = new BooleanClass()
        b.push({testBool: true})
        
        //@ts-ignore
        b.index(0).testBool = NaN
        expect(b.index(0).testBool).toBe(false)
        b.index(0).testBool = true

        //@ts-ignore
        b.index(0).testBool = 0
        expect(b.index(0).testBool).toBe(false)
        b.index(0).testBool = true

        //@ts-ignore
        b.index(0).testBool = null
        expect(b.index(0).testBool).toBe(false)
        b.index(0).testBool = true

        //@ts-ignore
        b.index(0).testBool = undefined
        expect(b.index(0).testBool).toBe(false)
        b.index(0).testBool = true
    })
})


describe("char data type", () => {
    it("single char field generated correctly", () => {
        const charClass = vec({char: "char"})
        const c = new charClass()
        c.push({char: "a"})
        expect(c.index(0).char).toBe("a")

        expect(c.index(0).e).toEqual({char: "a"})
    })

    it("char type supports unicode", () => {
        const charClass = vec({char: "char"})
        const c = new charClass()
        c.push({char: "🧱"})
        expect(c.index(0).char).toBe("🧱")

        c.index(0).char = "😀"
        expect(c.index(0).char).toBe("😀")

        expect(c.index(0).e).toEqual({char: "😀"})
    })

    it("char type is set to space character if set as empty string", () => {
        const charClass = vec({char: "char"})
        const c = new charClass()
        c.push({char: "🧱"})
        c.index(0).char = ""
        expect(c.index(0).char).toBe(" ")
    })

    it("char type is set to space character if set to object that mimicks string type but returns differently", () => {
        const charClass = vec({char: "char"})
        const c = new charClass()
        c.push({char: "🧱"})
        // @ts-ignore
        c.index(0).char = {codePointAt: () => undefined}
        expect(c.index(0).char).toBe(" ")
        // @ts-ignore
        c.index(0).char = {codePointAt: () => null}
        expect(c.index(0).char).toBe(" ")
        // @ts-ignore
        c.index(0).char = {codePointAt: () => NaN}
        expect(c.index(0).char).toBe(" ")
        // @ts-ignore
        c.index(0).char = {codePointAt: () => []}
        expect(c.index(0).char).toBe(" ")
        // @ts-ignore
        c.index(0).char = {codePointAt: () => "hi"}
        expect(c.index(0).char).toBe(" ")
        // @ts-ignore
        c.index(0).char = {codePointAt: () => ({})}
        expect(c.index(0).char).toBe(" ")
    })

    it("char type throws error if attempt to set with type other than string", () => {
        const charClass = vec({char: "char"})
        const c = new charClass()
        c.push({char: "🧱"})
        expect(() => {c.index(0).char = true as unknown as string}).toThrow()
        expect(() => {c.index(0).char = false as unknown as string}).toThrow()
        expect(() => {c.index(0).char = undefined as unknown as string}).toThrow()
        expect(() => {c.index(0).char = 0 as unknown as string}).toThrow()
        expect(() => {c.index(0).char = 1 as unknown as string}).toThrow()
        expect(() => {c.index(0).char = [] as unknown as string}).toThrow()
        expect(() => {c.index(0).char = {} as unknown as string}).toThrow()
        expect(() => {c.index(0).char = Symbol() as unknown as string}).toThrow()
        expect(() => {c.index(0).char = null as unknown as string}).toThrow()
    })

    it("char type will only take the first valid unicode character from string when setting field", () => {
        const charClass = vec({char: "char"})
        const c = new charClass()
        c.push({char: "🧱😀"})
        expect(c.index(0).char).toBe("🧱")

        c.index(0).char = "a really long string"
        expect(c.index(0).char).toBe("a")
    })

    it("multiple char fields generated correctly", () => {
        const charClass = vec({
            char: "char",
            char1: "char",
            char2: "char"
        })
        const c = new charClass()
        c.push({char: "a", char1: "b", char2: "c"})
        expect(c.index(0).char).toBe("a")
        expect(c.index(0).char1).toBe("b")
        expect(c.index(0).char2).toBe("c")

        expect(c.index(0).e).toEqual({
            char: "a",
            char1: "b",
            char2: "c"
        })
    })

    it("multiple char fields generated correctly", () => {
        const charClass = vec({
            char: "char",
            char1: "char",
            char2: "char",
            b: "bool",
            num: "num"
        })
        const c = new charClass()
        c.push({
            char: "a", 
            char1: "b", 
            char2: "c",
            b: true,
            num: 23.7
        })
        expect(c.index(0).char).toBe("a")
        expect(c.index(0).char1).toBe("b")
        expect(c.index(0).char2).toBe("c")
        expect(c.index(0).b).toBe(true)
        expect(c.index(0).num).toBe(Math.fround(23.7))

        expect(c.index(0).e).toEqual({
            char: "a", 
            char1: "b", 
            char2: "c",
            b: true,
            num: Math.fround(23.7)
        })
    })
})

describe("num data type", () => {
    it("setting num field with incorrect type sets field to NaN", () => {
        const NumVec = vec({num: "num"})
        const v = new NumVec()
        v.push({num: 2})
        
        // @ts-ignore
        v.index(0).num = {}
        expect(v.index(0).num).toBe(NaN)
        v.index(0).num = 2

        // @ts-ignore
        v.index(0).num = undefined
        expect(v.index(0).num).toBe(NaN)
        v.index(0).num = 2
    })
})
