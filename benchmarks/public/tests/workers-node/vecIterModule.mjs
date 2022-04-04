import {parentPort} from "worker_threads"
import {vec} from "../../../../dist/index.js"

console.log("vec worker init")

const Position = vec({x: "num", y: "num", z: "num", w: "num"})

function factorial(n) {
    if (n < 2) {
        return 1
    } else {
        return n * factorial(n - 1)
    }
}

parentPort.on("message", (data) => {
    const {memory, start, end} = data
    const pos = Position.fromMemory(memory)
    for (let i = start; i < end; i += 1) {
        pos.index(i).y += factorial(
            Math.floor(Math.random() * 10) + 95
        )
    }
    parentPort.postMessage(true)
})
