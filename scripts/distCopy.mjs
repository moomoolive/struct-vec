import copy from "recursive-copy"

const options = {overwrite: true}

copy(
    "dist", 
    "benchmarks/public/dist", 
    options, 
    (err, res) => {
    if (err) {
        console.error("copy failed", err)
    } else {
        console.info("Copied", res.length, "files")
    }
})

copy(
    "dist-web", 
    "benchmarks/public/dist-web", 
    options, 
    (err, res) => {
    if (err) {
        console.error("copy failed", err)
    } else {
        console.info("Copied", res.length, "files")
    }
})
