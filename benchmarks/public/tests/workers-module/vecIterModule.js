import {vec} from "../../dist/index.js"

console.log("vec worker init")

const Position = vec({x: "num", y: "num", z: "num", w: "num"})

function factorial(n) {
    if (n < 2) {
        return 1
    } else {
        return n * factorial(n - 1)
    }
}

const pos = new Position(1)

self.onmessage = ({data}) => {
    const {memory, start, end} = data
    pos.memory = memory
    for (let i = start; i < end; i += 1) {
        pos.index(i).y += factorial(
            Math.floor(Math.random() * 10) + 95
        )
    }
    self.postMessage(true)
}
