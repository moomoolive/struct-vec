console.log("array worker init")

function factorial(n) {
    if (n < 2) {
        return 1
    } else {
        return n * factorial(n - 1)
    }
}

self.onmessage = ({data}) => {
    const {arr, start, end} = data
    for (let i = start; i < end; i++) {
        arr[i].y += factorial(
            Math.floor(Math.random() * 10) + 95
        )
    }
    self.postMessage(true)
}
