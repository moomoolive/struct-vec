import {expect, it, describe} from "@jest/globals"
import {vec} from "../index"

describe("references are independent from vec cursor", () => {
    it("can point to different index", () => {
        const Enemy = vec({power: "i32", isDead: "bool"})
        const orcs = new Enemy()
        orcs.push(
            {power: 55, isDead: false},
            {power: 13, isDead: false},
            {power: 72, isDead: false},
        )
        const ref = orcs.index(0).ref
        expect(orcs.index(1).e).toEqual({
            power: 13,
            isDead: false
        })
        expect(orcs.index(2).e).toEqual({
            power: 72,
            isDead: false
        })
        expect(ref.e).toEqual({
            power: 55,
            isDead: false
        })
    })

    it("can mutate different indexes without influencing cursor's index", () => {
        const Enemy = vec({power: "i32", isDead: "bool"})
        const orcs = new Enemy()
        orcs.push(
            {power: 55, isDead: false},
            {power: 13, isDead: false},
            {power: 72, isDead: false},
        )
        const orc1 = orcs.index(0).ref
        orc1.isDead = true
        orc1.power = 0
        expect(orcs.index(1).e).toEqual({
            power: 13,
            isDead: false
        })
        expect(orcs.index(2).e).toEqual({
            power: 72,
            isDead: false
        })
        expect(orc1.e).toEqual({
            power: 0,
            isDead: true
        })
    })

    it("multiple references pointing to the same memory can be created", () => {
        const Enemy = vec({power: "i32", isDead: "bool"})
        const orcs = new Enemy()
        orcs.push(
            {power: 55, isDead: false},
            {power: 13, isDead: false},
            {power: 72, isDead: false},
        )
        const ref1 = orcs.index(0).ref
        ref1.isDead = true
        ref1.power = 0
        expect(ref1.e).toEqual({
            power: 0,
            isDead: true
        })
        const ref2 = ref1.ref
        expect(ref2.e).toEqual({
            power: 0,
            isDead: true
        })
        ref2.isDead = false
        ref2.power = 10
        expect(ref2.e).toEqual({
            power: 10,
            isDead: false
        })
        expect(ref1.e).toEqual({
            power: 10,
            isDead: false
        })
    })
})

describe("references point to an index not a particular element", () => {
    it("ref does not point to a particular element", () => {
        const Enemy = vec({power: "i32", isDead: "bool"})
        const orcs = new Enemy()
        orcs.push(
            {power: 55, isDead: false},
            {power: 13, isDead: false},
            {power: 72, isDead: false},
        )
        const ref = orcs.index(0).ref
        expect(ref.e).toEqual({
            power: 55, isDead: false
        })
        orcs.swap(0, 1)
        expect(ref.e).not.toEqual({
            power: 55, isDead: false
        })
        expect(ref.e).toEqual({
            power: 13, isDead: false
        })
    })
})


describe("detached references", () => {
    it("detached references are just like normal references, except they can move positions", () => {
        const Enemy = vec({power: "i32", isDead: "bool"})
        const orcs = new Enemy()
        orcs.push(
            {power: 55, isDead: false},
            {power: 13, isDead: false},
            {power: 72, isDead: false},
        )
        const cursor = orcs.detachedCursor(0)
        expect(orcs.index(1).e).toEqual({
            power: 13,
            isDead: false
        })
        expect(orcs.index(2).e).toEqual({
            power: 72,
            isDead: false
        })
        expect(cursor.e).toEqual({
            power: 55,
            isDead: false
        })
        expect(cursor.index(2).e).toEqual({
            power: 72,
            isDead: false
        })
        expect(orcs.index(1).e).toEqual({
            power: 13,
            isDead: false
        })
        cursor.index(1).power = 9_001
        expect(orcs.index(1).e).toEqual({
            power: 9_001,
            isDead: false
        })
    })
})