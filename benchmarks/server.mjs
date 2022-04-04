import express from "express"
import {dirname} from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = 8181
const app = express()

app.use(express.static(__dirname + "/public", {
    setHeaders: (res) => {
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin")
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp")
    } 
}))

app.use((req, res, next) => {
    console.info("[inbound request]: requested", req.originalUrl)
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin")
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp")
    next()
})

app.listen(PORT, () => {
    console.info(`app is listening on: http://localhost:${PORT}`)
})
