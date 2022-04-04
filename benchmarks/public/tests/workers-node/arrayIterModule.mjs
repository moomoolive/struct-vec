import {parentPort} from "worker_threads"

console.log("array worker init")

function factorial(n) {
    if (n < 2) {
        return 1
    } else {
        return n * factorial(n - 1)
    }
}

parentPort.on("message", (data) => {
    const {arr, start, end} = data
    for (let i = start; i < end; i++) {
        arr[i].y += factorial(
            Math.floor(Math.random() * 10) + 95
        )
    }
    parentPort.postMessage(true)
})
