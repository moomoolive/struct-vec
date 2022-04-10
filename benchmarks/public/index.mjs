import {vec} from "../../dist/index.js"
import {Benchmark} from "./lib.mjs"

const Position = vec({x: "f32", y: "f32", z: "f32"})

const elementCount = 10_000_000

const benchmark = new Benchmark()
benchmark
    .add("vec push", () => {
        const container = new Position()
        for (let i = 0; i < elementCount; i += 1) {
            container.push({x: 1, y: 1, z: 1})
        }
    })
    .add("arr push", () => {
        const container = []
        for (let i = 0; i < elementCount; i += 1) {
            container.push({x: 1, y: 1, z: 1})
        }
    })
/*
    .add("vec push with pre-alloc", () => {
        const container = new Position()
        container.reserve(elementCount)
        for (let i = 0; i < elementCount; i += 1) {
            container.push({x: 1, y: 1, z: 1})
        }
    })
    .add("arr push with pre-alloc", () => {
        const container = new Array(elementCount)
        for (let i = 0; i < elementCount; i += 1) {
            container.push({x: 1, y: 1, z: 1})
        }
    })
*/
    .run()
