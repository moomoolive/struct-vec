import {expect, it, describe} from "@jest/globals"
import {structdef} from "./codegen.mjs"
// generated code
import defaultTs from "./default"
import {NamedTs} from "./named"
import defaultJs from "./default-js.mjs"
import {NamedJs} from "./named-js.mjs"
// ends

describe("generated vec classes have all the standard methods and properties", () => {
    it("named export typescript class", () => {
        expect(typeof NamedTs.fromArray).toBe("function")
        expect(typeof NamedTs.fromMemory).toBe("function")
        expect(typeof NamedTs.fromString).toBe("function")
        expect(typeof NamedTs.isVec).toBe("function")
        const v = new NamedTs(15).fill({
            x: true, y: 10, z: "a"
        })
        expect(v.def).toEqual(structdef)
        expect(v.index(0).x).toBe(true)
        expect(v.index(0).y).toBe(10)
        expect(v.memory).toBeInstanceOf(Float32Array)
        expect(v.memory.buffer).toBeInstanceOf(SharedArrayBuffer)
        expect(v.index(0).z).toBe("a")
        expect(v.length).toBe(15)
        expect(v.capacity).toBe(15)
        expect(typeof v.elementSize).toBe("number")
        expect(v.elementSize).toBeGreaterThan(0)
        v.forEach(el => {
            expect(el.e).toEqual({
                x: true, y: 10, z: "a"
            })
        })
        expect(typeof v.slice).toBe("function")
        expect(typeof v.at).toBe("function")
        expect(typeof v.concat).toBe("function")
        expect(typeof v.copyWithin).toBe("function")
        expect(typeof v.entries).toBe("function")
        expect(typeof v.every).toBe("function")
        expect(typeof v.forEach).toBe("function")
        expect(typeof v.fill).toBe("function")
        expect(typeof v.filter).toBe("function")
        expect(typeof v.find).toBe("function")
        expect(typeof v.findIndex).toBe("function")
        expect(typeof v.map).toBe("function")
        expect(typeof v.mapv).toBe("function")
        expect(typeof v.lastIndexOf).toBe("function")
        expect(typeof v.reduce).toBe("function")
        expect(typeof v.reduceRight).toBe("function")
        expect(typeof v.some).toBe("function")
        expect(typeof v.keys).toBe("function")
        expect(typeof v.values).toBe("function")
        expect(typeof v.reserve).toBe("function")
        expect(typeof v.reverse).toBe("function")
        expect(typeof v.pop).toBe("function")
        expect(typeof v.truncate).toBe("function")
        expect(typeof v.push).toBe("function")
        expect(typeof v.splice).toBe("function")
        expect(typeof v.shift).toBe("function")
        expect(typeof v.unshift).toBe("function")
        expect(typeof v.sort).toBe("function")
        expect(typeof v.swap).toBe("function")
        expect(typeof v.toJSON).toBe("function")
        expect(typeof v.shrinkTo).toBe("function")
    })

    it("named export javascript class", () => {
        expect(typeof NamedJs.fromArray).toBe("function")
        expect(typeof NamedJs.fromMemory).toBe("function")
        expect(typeof NamedJs.fromString).toBe("function")
        expect(typeof NamedJs.isVec).toBe("function")
        const v = new NamedJs(15).fill({
            x: true, y: 10, z: "a"
        })
        expect(v.def).toEqual(structdef)
        expect(v.index(0).x).toBe(true)
        expect(v.index(0).y).toBe(10)
        expect(v.memory).toBeInstanceOf(Float32Array)
        expect(v.memory.buffer).toBeInstanceOf(SharedArrayBuffer)
        expect(v.index(0).z).toBe("a")
        expect(v.length).toBe(15)
        expect(v.capacity).toBe(15)
        expect(typeof v.elementSize).toBe("number")
        expect(v.elementSize).toBeGreaterThan(0)
        v.forEach(el => {
            expect(el.e).toEqual({
                x: true, y: 10, z: "a"
            })
        })
        expect(typeof v.slice).toBe("function")
        expect(typeof v.at).toBe("function")
        expect(typeof v.concat).toBe("function")
        expect(typeof v.copyWithin).toBe("function")
        expect(typeof v.entries).toBe("function")
        expect(typeof v.every).toBe("function")
        expect(typeof v.forEach).toBe("function")
        expect(typeof v.fill).toBe("function")
        expect(typeof v.filter).toBe("function")
        expect(typeof v.find).toBe("function")
        expect(typeof v.findIndex).toBe("function")
        expect(typeof v.map).toBe("function")
        expect(typeof v.mapv).toBe("function")
        expect(typeof v.lastIndexOf).toBe("function")
        expect(typeof v.reduce).toBe("function")
        expect(typeof v.reduceRight).toBe("function")
        expect(typeof v.some).toBe("function")
        expect(typeof v.keys).toBe("function")
        expect(typeof v.values).toBe("function")
        expect(typeof v.reserve).toBe("function")
        expect(typeof v.reverse).toBe("function")
        expect(typeof v.pop).toBe("function")
        expect(typeof v.truncate).toBe("function")
        expect(typeof v.push).toBe("function")
        expect(typeof v.splice).toBe("function")
        expect(typeof v.shift).toBe("function")
        expect(typeof v.unshift).toBe("function")
        expect(typeof v.sort).toBe("function")
        expect(typeof v.swap).toBe("function")
        expect(typeof v.toJSON).toBe("function")
        expect(typeof v.shrinkTo).toBe("function")
    })

    it("default export typescript class", () => {
        expect(typeof defaultTs.DefaultTs.fromArray).toBe("function")
        expect(typeof defaultTs.DefaultTs.fromMemory).toBe("function")
        expect(typeof defaultTs.DefaultTs.fromString).toBe("function")
        expect(typeof defaultTs.DefaultTs.isVec).toBe("function")
        const v = new defaultTs.DefaultTs(15).fill({
            x: true, y: 10, z: "a"
        })
        expect(v.def).toEqual(structdef)
        expect(v.index(0).x).toBe(true)
        expect(v.index(0).y).toBe(10)
        expect(v.memory).toBeInstanceOf(Float32Array)
        expect(v.memory.buffer).toBeInstanceOf(SharedArrayBuffer)
        expect(v.index(0).z).toBe("a")
        expect(v.length).toBe(15)
        expect(v.capacity).toBe(15)
        expect(typeof v.elementSize).toBe("number")
        expect(v.elementSize).toBeGreaterThan(0)
        v.forEach(el => {
            expect(el.e).toEqual({
                x: true, y: 10, z: "a"
            })
        })
        expect(typeof v.slice).toBe("function")
        expect(typeof v.at).toBe("function")
        expect(typeof v.concat).toBe("function")
        expect(typeof v.copyWithin).toBe("function")
        expect(typeof v.entries).toBe("function")
        expect(typeof v.every).toBe("function")
        expect(typeof v.forEach).toBe("function")
        expect(typeof v.fill).toBe("function")
        expect(typeof v.filter).toBe("function")
        expect(typeof v.find).toBe("function")
        expect(typeof v.findIndex).toBe("function")
        expect(typeof v.map).toBe("function")
        expect(typeof v.mapv).toBe("function")
        expect(typeof v.lastIndexOf).toBe("function")
        expect(typeof v.reduce).toBe("function")
        expect(typeof v.reduceRight).toBe("function")
        expect(typeof v.some).toBe("function")
        expect(typeof v.keys).toBe("function")
        expect(typeof v.values).toBe("function")
        expect(typeof v.reserve).toBe("function")
        expect(typeof v.reverse).toBe("function")
        expect(typeof v.pop).toBe("function")
        expect(typeof v.truncate).toBe("function")
        expect(typeof v.push).toBe("function")
        expect(typeof v.splice).toBe("function")
        expect(typeof v.shift).toBe("function")
        expect(typeof v.unshift).toBe("function")
        expect(typeof v.sort).toBe("function")
        expect(typeof v.swap).toBe("function")
        expect(typeof v.toJSON).toBe("function")
        expect(typeof v.shrinkTo).toBe("function")
    })

    it("default export javascript class", () => {
        expect(typeof defaultJs.DefaultJs.fromArray).toBe("function")
        expect(typeof defaultJs.DefaultJs.fromMemory).toBe("function")
        expect(typeof defaultJs.DefaultJs.fromString).toBe("function")
        expect(typeof defaultJs.DefaultJs.isVec).toBe("function")
        const v = new defaultJs.DefaultJs(15).fill({
            x: true, y: 10, z: "a"
        })
        expect(v.def).toEqual(structdef)
        expect(v.index(0).x).toBe(true)
        expect(v.index(0).y).toBe(10)
        expect(v.memory).toBeInstanceOf(Float32Array)
        expect(v.memory.buffer).toBeInstanceOf(SharedArrayBuffer)
        expect(v.index(0).z).toBe("a")
        expect(v.length).toBe(15)
        expect(v.capacity).toBe(15)
        expect(typeof v.elementSize).toBe("number")
        expect(v.elementSize).toBeGreaterThan(0)
        v.forEach(el => {
            expect(el.e).toEqual({
                x: true, y: 10, z: "a"
            })
        })
        expect(typeof v.slice).toBe("function")
        expect(typeof v.at).toBe("function")
        expect(typeof v.concat).toBe("function")
        expect(typeof v.copyWithin).toBe("function")
        expect(typeof v.entries).toBe("function")
        expect(typeof v.every).toBe("function")
        expect(typeof v.forEach).toBe("function")
        expect(typeof v.fill).toBe("function")
        expect(typeof v.filter).toBe("function")
        expect(typeof v.find).toBe("function")
        expect(typeof v.findIndex).toBe("function")
        expect(typeof v.map).toBe("function")
        expect(typeof v.mapv).toBe("function")
        expect(typeof v.lastIndexOf).toBe("function")
        expect(typeof v.reduce).toBe("function")
        expect(typeof v.reduceRight).toBe("function")
        expect(typeof v.some).toBe("function")
        expect(typeof v.keys).toBe("function")
        expect(typeof v.values).toBe("function")
        expect(typeof v.reserve).toBe("function")
        expect(typeof v.reverse).toBe("function")
        expect(typeof v.pop).toBe("function")
        expect(typeof v.truncate).toBe("function")
        expect(typeof v.push).toBe("function")
        expect(typeof v.splice).toBe("function")
        expect(typeof v.shift).toBe("function")
        expect(typeof v.unshift).toBe("function")
        expect(typeof v.sort).toBe("function")
        expect(typeof v.swap).toBe("function")
        expect(typeof v.toJSON).toBe("function")
        expect(typeof v.shrinkTo).toBe("function")
    })
})

import {VecClass, Vec, vec, StructDef} from "../dist/index"

describe("typescript type casting", () => {
    it("generated class conforms to VecClass interface (type returned from runtime compiler)", () => {
        let _x = NamedJs as VecClass<{
            x: "bool",
            y: "num",
            z: "char"
        }>
        let _y = NamedTs as VecClass<{
            x: "bool",
            y: "num",
            z: "char"
        }>
        let _z = defaultJs.DefaultJs as VecClass<{
            x: "bool",
            y: "num",
            z: "char"
        }>
        let _a = defaultTs.DefaultTs as VecClass<{
            x: "bool",
            y: "num",
            z: "char"
        }>
    })

    it("Instances from generated classes are of type Vec", () => {
        let _x = NamedJs as VecClass<{
            x: "bool",
            y: "num",
            z: "char"
        }>
        const x = new _x() as Vec<{
            x: "bool",
            y: "num",
            z: "char"
        }>
        let _y = NamedTs as VecClass<{
            x: "bool",
            y: "num",
            z: "char"
        }>
        const y = new _y() as Vec<{
            x: "bool",
            y: "num",
            z: "char"
        }>
        let _z = defaultJs.DefaultJs as VecClass<{
            x: "bool",
            y: "num",
            z: "char"
        }>
        const z = new _z() as Vec<{
            x: "bool",
            y: "num",
            z: "char"
        }>
        let _a = defaultTs.DefaultTs as VecClass<{
            x: "bool",
            y: "num",
            z: "char"
        }>
        const a = new _a() as Vec<{
            x: "bool",
            y: "num",
            z: "char"
        }>
    })

    it("runtime and buildtime compilers produce the same class with the same struct def, and interop 100%", () => {
        const def = {x: "bool", y: "num", z: "char"} as const
        expect(def).toEqual(structdef)
        const v = vec(def)
        const _v = new v()
        
        const x = new NamedJs() as Vec<{
            x: "bool",
            y: "num",
            z: "char"
        }> as typeof _v
        
        const y = new NamedTs() as Vec<{
            x: "bool",
            y: "num",
            z: "char"
        }> as typeof _v
        
        const z = new defaultJs.DefaultJs() as Vec<{
            x: "bool",
            y: "num",
            z: "char"
        }> as typeof _v

        const a = new defaultTs.DefaultTs() as Vec<{
            x: "bool",
            y: "num",
            z: "char"
        }> as typeof _v
    })
})
