import {vecCompile} from "../dist/index.js"
import fs from 'fs'
import path from "path"
import {dirname} from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const LIB_PATH = "../dist"

export const structdef = {x: "bool", y: "f32", z: "char"}

const namedJs = vecCompile(
    structdef,
    LIB_PATH,
    {lang: "js", exportSyntax: "named", className: "NamedJs"}
)
fs.writeFileSync(path.join(__dirname, "named-js.mjs"), namedJs, {
    encoding: "utf-8"
})

const namedTs = vecCompile(
    structdef,
    LIB_PATH,
    {lang: "ts", exportSyntax: "named", className: "NamedTs"}
)
fs.writeFileSync(path.join(__dirname, "named.ts"), namedTs, {
    encoding: "utf-8"
})

const defaultJs = vecCompile(
    structdef,
    LIB_PATH,
    {lang: "js", exportSyntax: "default", className: "DefaultJs"}
)
fs.writeFileSync(path.join(__dirname, "default-js.mjs"), defaultJs, {
    encoding: "utf-8"
})

const defaultTs = vecCompile(
    structdef,
    LIB_PATH,
    {lang: "ts", exportSyntax: "default", className: "DefaultTs"}
)
fs.writeFileSync(path.join(__dirname, "default.ts"), defaultTs, {
    encoding: "utf-8"
})

console.info("✅ successfully generated code samples for tests\n")
