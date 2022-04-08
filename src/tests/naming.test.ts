import {expect, it, describe} from "@jest/globals"
import {vec, StructDef} from "../index"

describe("field name restrictions", () => {
    it("defining struct fields that require bracket indexing should throw error", () => {
        const invalidKeys = (key: string) => {
            return () => {return vec({[key]: "f32"})}
        }
        expect(invalidKeys("bracket-notation-require")).toThrow()
        expect(invalidKeys("@types")).toThrow()
        expect(invalidKeys("my#tag")).toThrow()
        expect(invalidKeys("a key with spaces")).toThrow()
        expect(invalidKeys("(bracket-within-bracket-key!!)")).toThrow()
        expect(invalidKeys("😈")).toThrow()
    })

    it("defining structs that include field names which conflict with any of the standard methods or properties throws error", () => {
        expect(() => {vec({e: "f32"})}).toThrow()
        expect(() => {vec({self: "f32"})}).toThrow()
    })
})

describe("class naming restrictions", () => {
    it("if class name is a js reserved keyword an error should be thrown", () => {
        expect(() => {vec({a: "i32"}, {className: "await"})}).toThrow()
        expect(() => {vec({a: "i32"}, {className: "for"})}).toThrow()
        expect(() => {vec({a: "i32"}, {className: "let"})}).toThrow()
        expect(() => {vec({a: "i32"}, {className: "const"})}).toThrow()
        expect(() => {vec({a: "i32"}, {className: "while"})}).toThrow()
        expect(() => {vec({a: "i32"}, {className: "if"})}).toThrow()
    })

    it("if class name does not follow naming convention for variables an error should be thrown", () => {
        expect(() => {vec({a: "i32"}, {className: "my class"})}).toThrow()
        expect(() => {vec({a: "i32"}, {className: "my-class"})}).toThrow()
        expect(() => {vec({a: "i32"}, {className: "1class"})}).toThrow()
        expect(() => {vec({a: "i32"}, {className: "cl@ss"})}).toThrow()
        expect(() => {vec({a: "i32"}, {className: "#class"})}).toThrow()
        expect(() => {vec({a: "i32"}, {className: "class&"})}).toThrow()
        expect(() => {vec({a: "i32"}, {className: "class*"})}).toThrow()
    })

    it("if class name has unicode characters an error should be thrown", () => {
        expect(() => {vec({a: "i32"}, {className: "myclass😙"})}).toThrow()
        expect(() => {vec({a: "i32"}, {className: "my🏊‍♂️class"})}).toThrow()
        expect(() => {vec({a: "i32"}, {className: "❤️class"})}).toThrow()
        expect(() => {vec({a: "i32"}, {className: "cl💀ss"})}).toThrow()
        expect(() => {vec({a: "i32"}, {className: "🔥class"})}).toThrow()
        expect(() => {vec({a: "i32"}, {className: "class😂"})}).toThrow()
        expect(() => {vec({a: "i32"}, {className: "✔️"})}).toThrow()
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
