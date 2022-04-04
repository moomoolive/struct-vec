import {expect, it, describe} from "@jest/globals"
import {vec, StructDef} from "../index"

describe("field name restrictions", () => {
    it("defining struct fields that require bracket indexing should throw error", () => {
        const invalidKeys = (key: string) => {
            return () => {return vec({[key]: "num"})}
        }
        expect(invalidKeys("bracket-notation-require")).toThrow()
        expect(invalidKeys("@types")).toThrow()
        expect(invalidKeys("my#tag")).toThrow()
        expect(invalidKeys("a key with spaces")).toThrow()
        expect(invalidKeys("(bracket-within-bracket-key!!)")).toThrow()
        expect(invalidKeys("😈")).toThrow()
    })

    it("defining structs that include field names which conflict with any of the standard methods or properties throws error", () => {
        expect(() => {vec({e: "num"})}).toThrow()
        expect(() => {vec({self: "num"})}).toThrow()
    })
})

describe("schema restrictions", () => {
    it("inputting a non-object (including arrays & null) into schema field throws error", () => {
        expect(() => {vec(null as unknown as StructDef)}).toThrow()
        expect(() => {vec([] as unknown as StructDef)}).toThrow()
        expect(() => {vec("my string" as unknown as StructDef)}).toThrow()
        expect(() => {vec(true as unknown as StructDef)}).toThrow()
        expect(() => {vec(Symbol("sym") as unknown as StructDef)}).toThrow()
        expect(() => {vec(undefined as unknown as StructDef)}).toThrow()
        expect(() => {vec(3 as unknown as StructDef)}).toThrow()
    })

    it("inputting non-string into struct field definition throws error", () => {
        expect(() => {vec({field1: null} as unknown as StructDef)}).toThrow()
        expect(() => {vec({field1: 1} as unknown as StructDef)}).toThrow()
        expect(() => {vec({field1: true} as unknown as StructDef)}).toThrow()
        expect(() => {vec({field1: Symbol("value")} as unknown as StructDef)}).toThrow()
        expect(() => {vec({field1: undefined} as unknown as StructDef)}).toThrow()
        expect(() => {vec({field1: {}} as unknown as StructDef)}).toThrow()
        expect(() => {vec({field1: []} as unknown as StructDef)}).toThrow()
    })

    it("inputting unsupported datatypes into struct field definition throws error", () => {
        expect(() => {vec({field1: "xtype"} as unknown as StructDef)}).toThrow()
        expect(() => {vec({field1: "aldjalfdjasf "} as unknown as StructDef)}).toThrow()
        expect(() => {vec({field1: "f64"} as unknown as StructDef)}).toThrow()
        expect(() => {vec({field1: "character"} as unknown as StructDef)}).toThrow()
        expect(() => {vec({field1: "boolean"} as unknown as StructDef)}).toThrow()
        expect(() => {vec({field1: "number"} as unknown as StructDef)}).toThrow()
        expect(() => {vec({field1: "my custom datatype"} as unknown as StructDef)}).toThrow()
    })
})
