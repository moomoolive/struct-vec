import fs from "fs"
import path from "path"
import jsdoc2md from "jsdoc-to-markdown"

const API_REFERENCE_START = "## API Reference"
const README_FILE_NAME = "README.md"
const PATH = path.join(README_FILE_NAME)

const data = jsdoc2md.getTemplateDataSync({files: "dist/*.js"})
const rawDocs = jsdoc2md.renderSync({data})
const importAndAnchorMutations = rawDocs
    .replace(
        /module_vec-struct..vec/gm,
        "module_vec-struct..vec_gen",
    )
    .replace(
        /from "struct-vec.js"/gm,
        `from "struct-vec"`
    )
    .replace(/\.js+/gm, "")
const compiledModule = importAndAnchorMutations
        .split(/name="module_vec-struct"/gm)
const target = compiledModule[compiledModule.length - 1]
const [_, withoutHeader] = target.split("## vec-struct\n")
const docs = (
    "<a name=\"module_vec-struct\"></a>"
    + "\n\n" 
    + withoutHeader.trim()
)
console.info("📗 Docs were successfully generated")

const readmeFile = fs.readFileSync(PATH, {encoding: "utf-8"})
const [restOfDocs, _oldAPIRef] = readmeFile.split(
    API_REFERENCE_START
)

const newReadme = `${restOfDocs}${API_REFERENCE_START}\n${docs}`
fs.writeFileSync(PATH, newReadme, {encoding: "utf-8"})
console.info("✏️  Successfully updated docs")
