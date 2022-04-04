import {Worker} from "worker_threads"
import {vec} from "../../dist/index.js"
import {Benchmark} from "./lib.mjs"
import {dirname} from 'path'
import {fileURLToPath} from 'url'
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const Position = vec({x: "num", y: "num", z: "num", w: "num"})

const elementCount = 8_000_000

const numberOfCores = 3
const vecWorkers = []
for (let i = 0; i < numberOfCores; i++) {
    vecWorkers.push(new Worker(
        path.join(__dirname, "/tests/workers-node/vecIterModule.mjs"),
        //{type: "module"}
    ))
}

const arrWorkers = []
for (let i = 0; i < numberOfCores; i++) {
    arrWorkers.push(new Worker(
        path.join(__dirname, "/tests/workers-node/arrayIterModule.mjs"),
        //{type: "module"}
    ))
}

const positionVec = new Position(elementCount)
const positionArr = []

for (let i = 0; i < elementCount; i += 1) {
    positionArr.push({x: 2, y: 2, z: 2, w: 2})
}
for (let i = 0; i < elementCount; i += 1) {
    positionVec.push({x: 2, y: 2, z: 2, w: 2})
}

function factorial(n) {
    if (n < 2) {
        return 1
    } else {
        return n * factorial(n - 1)
    }
}

async function main() {
    const benchmark = new Benchmark()
    await benchmark
    .setNumberOfIterations(10)
    /*
    .add("array single thread", () => {
        for (let i = 0; i < positionArr.length; i += 1) {
            positionArr[i].y = factorial(
                Math.floor(Math.random() * 10) + 95
            )
        }
    })
    
    .add("array multi-threaded", async () => {
        const len = positionArr.length
        const numberOfElementsPerWorker = len / (numberOfCores + 1)
        const ps = []
        for (let i = 0; i < arrWorkers.length; i++) {
            const worker = arrWorkers[i]
            ps.push(new Promise(resolve => {
                worker.on("message", resolve)
                worker.postMessage({
                    arr: positionArr,
                    start: i * numberOfElementsPerWorker,
                    end: (i * numberOfElementsPerWorker) + numberOfElementsPerWorker
                })
            }))
        }
        for (let i = 4 * numberOfElementsPerWorker; i < len; i += 1) {
            positionArr[i].y += factorial(
                Math.floor(Math.random() * 10) + 95
            )
        }
        await Promise.all(ps)
    })
    */
    .add("vec single thread", () => {
        const len = positionVec.length
        for (let i = 0; i < len; i += 1) {
            positionVec.index(i).y += factorial(
                Math.floor(Math.random() * 10) + 95
            )
        }
    })
    /*
    .add("vec multi-core", async () => {
        const len = positionVec.length
        const numberOfElementsPerWorker = len / (numberOfCores + 1)
        const ps = []
        for (let i = 0; i < vecWorkers.length; i++) {
            const worker = vecWorkers[i]
            ps.push(new Promise(resolve => {
                worker.on("message", resolve)
                worker.postMessage({
                    memory: positionVec.memory,
                    start: i * numberOfElementsPerWorker,
                    end: (i * numberOfElementsPerWorker) + numberOfElementsPerWorker
                })
            }))
        }
        for (let i = 4 * numberOfElementsPerWorker; i < len; i += 1) {
            positionVec.index(i).y += factorial(
                Math.floor(Math.random() * 10) + 95
            )
        }
        await Promise.all(ps)
    })
    */
    .run()
}

main()
