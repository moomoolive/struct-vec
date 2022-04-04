import copy from "recursive-copy"
import fs from "fs"

const options = {
    overwrite: true,
    filter: (path) => !/\.test\./gi.test(path)
}

copy(
    "src", 
    "dist-deno", 
    options, 
    (err, res) => {
    if (err) {
        console.error("copy failed", err)
    } else {
        console.info("Copied", res.length, "files")
        fs.rmdirSync("dist-deno/tests")
    }
})