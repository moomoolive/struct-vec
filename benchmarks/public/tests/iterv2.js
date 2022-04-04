import {vec} from "./dist/index.js"
import {Benchmark} from "./lib.js"

const Position = vec({x: "num", y: "num", z: "num", w: "num"})

const _anotherVec = vec({zz: "num"})

const elementCount = 10_000_000

const positionVec = new Position(elementCount)
const positionArr = []
const rawTypedArray = new Float64Array(elementCount * 4)

for (let i = 0; i < elementCount; i += 1) {
    positionArr.push({x: 2, y: 2, z: 2, w: 2})
}
for (let i = 0; i < elementCount; i += 1) {
    positionVec.push({x: 2, y: 2, z: 2, w: 2})
}

const benchmark = new Benchmark()
benchmark
    .add("typed array imperative loop", () => {
        for (let i = 0; i < rawTypedArray.length; i += 4) {
            rawTypedArray[i + 1] += 10
        }
    })
    /*
    .add("array iterator", () => {
        positionArr.forEach(e => e.y += 10)
    })
    */
    /*
    .add("array imperative loop", () => {
        for (let i = 0; i < positionArr.length; i += 1) {
            positionArr[i].y += 10
        }
    })
    */
    .add("array es6 iterator", () => {
        for (const position of positionArr) {
            position.y += 10
        }
    })
   /*
    .add("vec imperative loop", () => {
        for (let i = 0; i < elementCount; i += 1) {
            positionVec.index(i).y += 10
        }
    })
    */
   /*
    .add("vec iterator", () => {
        positionVec.forEach((e) => e.y += 10)
    })
    */
    .add("vec es6 iterator", () => {
        for (const position of positionVec) {
            position.y += 10
        }
    })
    .run()
