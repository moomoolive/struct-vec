import {vec} from "../../dist/index.js"
import {Benchmark} from "./lib.mjs"

const Position = vec({
    x: "i32", 
    y: "i32", 
    z: "i32"
})

const elementCount = 10_000_000

const positionVec = new Position(1_000_000)
const positionArr = []
const rawTypedArray = new Float64Array(elementCount * 3)

for (let i = 0; i < elementCount; i += 1) {
    positionArr.push({x: 1, y: 1, z: 1})
}
for (let i = 0; i < elementCount; i += 1) {
    positionVec.push({x: 1, y: 1, z: 1})
}

const tArrayLength = (elementCount * 3)

const benchmark = new Benchmark()
benchmark
    .add("typed array imperative loop", () => {
        for (let i = 0; i < tArrayLength; i += 3) {
            rawTypedArray[i + 1] += 10
        }
    })
    /*
    .add("array iterator", () => {
        positionArr.forEach(e => e.x += 10)
    })
    */
    .add("array imperative loop", () => {
        for (let i = 0; i < positionArr.length; i += 1) {
            positionArr[i].y += 10
        }
    })
    /*
    .add("array es6 iterator", () => {
        for (const position of positionArr) {
            position.x += 10
        }
    })
    */
    .add("vec imperative loop", () => {
        for (let i = 0; i < elementCount; i += 1) {
            positionVec.index(i).y += 10
        }
    })
    /*
    .add("vec iterator", () => {
        positionVec.forEach((e) => e.x += 10)
    })
    .add("vec es6 iterator", () => {
        for (const position of positionVec) {
            position.x += 10
        }
    })
    */
    .run()
