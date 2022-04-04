import fs from "fs"
import esbuild from "esbuild"
import gzipPlugin from "@luncheon/esbuild-plugin-gzip"

esbuild.build({
    entryPoints: ["__tmp__/index.js"],
    minify: true,
    bundle: true,
    outfile: "dist-web/index.js",
    globalName: "structVec",
    platform: "browser",
    write: false,
    plugins: [
        gzipPlugin({
            brotli: true,
            gzip: false,
            onEnd: ({outputFiles}) => {
                const [_, zippedFile] = outputFiles
                const {path, contents} = zippedFile
                if (!fs.existsSync("buildInfo")) {
                    fs.mkdirSync("buildInfo")
                }
                fs.writeFileSync("buildInfo/index.js.br", contents)
                fs.rmSync(path)
            }
        })
    ]
})