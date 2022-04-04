import {expect, it, describe} from "@jest/globals"
import {vecCompile, StructDef} from "../index"

describe("compiler throws error on wrong options", () => {
    it("invalid javascript class name inputted into className option throws error", () => {
        expect(() => {
            vecCompile({x: "char"}, "randompath", {
                className: "7890"
            })
        }).toThrow()

        expect(() => {
            vecCompile({x: "char"}, "randompath", {
                className: "for"
            })
        }).toThrow()

        expect(() => {
            vecCompile({x: "char"}, "randompath", {
                className: "await"
            })
        }).toThrow()

        expect(() => {
            vecCompile({x: "char"}, "randompath", {
                className: "🐩"
            })
        }).toThrow()

        expect(() => {
            vecCompile({x: "char"}, "randompath", {
                // @ts-ignore
                className: {}
            })
        }).toThrow()

        expect(() => {
            vecCompile({x: "char"}, "randompath", {
                // @ts-ignore
                className: []
            })
        }).toThrow()

        expect(() => {
            vecCompile({x: "char"}, "randompath", {
                // @ts-ignore
                className: ""
            })
        }).toThrow()
    })

    it("Inputting invalid 'exportSyntax' option throws error", () => {
        expect(() => {
            vecCompile({x: "char"}, "randompath", {
                //@ts-ignore
                exportSyntax: "7890"
            })
        }).toThrow()

        expect(() => {
            vecCompile({x: "char"}, "randompath", {
                //@ts-ignore
                exportSyntax: "export default"
            })
        }).toThrow()

        expect(() => {
            vecCompile({x: "char"}, "randompath", {
                //@ts-ignore
                exportSyntax: 1
            })
        }).toThrow()
    })

    it("Inputting invalid 'lang' option throws error", () => {
        expect(() => {
            vecCompile({x: "char"}, "randompath", {
                //@ts-ignore
                lang: "7890"
            })
        }).toThrow()

        expect(() => {
            vecCompile({x: "char"}, "randompath", {
                //@ts-ignore
                exportSyntax: "export default"
            })
        }).toThrow()

        expect(() => {
            vecCompile({x: "char"}, "randompath", {
                //@ts-ignore
                lang: []
            })
        }).toThrow()
    })

    it("not providing pathToCore argument throws error", () => {
        expect(() => {
            // @ts-ignore
            vecCompile({x: "char"})
        }).toThrow()
    })

    it("providing incorrect type to pathToCore argument throws error", () => {
        expect(() => {vecCompile({x: "char"}, null as unknown as string)}).toThrow()
        expect(() => {vecCompile({x: "char"}, true as unknown as string)}).toThrow()
        expect(() => {vecCompile({x: "char"}, false as unknown as string)}).toThrow()
        expect(() => {vecCompile({x: "char"}, 1 as unknown as string)}).toThrow()
        expect(() => {vecCompile({x: "char"}, 0 as unknown as string)}).toThrow()
        expect(() => {vecCompile({x: "char"}, {} as unknown as string)}).toThrow()
        expect(() => {vecCompile({x: "char"}, [] as unknown as string)}).toThrow()
        expect(() => {vecCompile({x: "char"}, Symbol() as unknown as string)}).toThrow()
    })

    it("providing empty string to pathToCore argument throws error", () => {
        expect(() => {vecCompile({x: "char"}, "")}).toThrow()
    })

    it("not providing struct def argument throws error", () => {
        expect(() => {
            // @ts-ignore
            vecCompile()
        }).toThrow()
    })

    it("providing incorrect type to struct def argument throws error", () => {
        expect(() => {vecCompile(true as unknown as StructDef, "hi")}).toThrow()
        expect(() => {vecCompile(undefined as unknown as StructDef, "hi")}).toThrow()
        expect(() => {vecCompile(null as unknown as StructDef, "hi")}).toThrow()
        expect(() => {vecCompile([] as unknown as StructDef, "hi")}).toThrow()
        expect(() => {vecCompile(Symbol() as unknown as StructDef, "hi")}).toThrow()
        expect(() => {vecCompile(1 as unknown as StructDef, "hi")}).toThrow()
        expect(() => {vecCompile(0 as unknown as StructDef, "hi")}).toThrow()
    })

    it("providing empty struct def argument throws error", () => {
        expect(() => {
            // @ts-ignore
            vecCompile({})
        }).toThrow()
    })
})

describe("compiler generates valid javascript", () => {
    it("javascript is valid", async () => {
        const def = vecCompile({x: "char"}, "../core.js", {
            lang: "js",
        })
        expect(typeof def).toBe("string")
        expect(true).toBe(true)
    })
})
