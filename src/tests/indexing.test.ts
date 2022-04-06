import {expect, it, describe} from "@jest/globals"
import {vec} from "../index"

describe("ways to index (and not index...lol)", () => {
    it("index can be targeted via array destructuring", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})
        const vec1 = new PositionV(5).fill({x: 1, y: 2, z: 3})
        const [target] = vec1
        expect(target).toEqual({x: 1, y: 2, z: 3})
    })

    it("calling index without capturing (via .e, struct.yourField, etc.) in variable returns the vec and NOT a struct within the vec", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})
        const vec1 = new PositionV(5).fill({x: 1, y: 2, z: 3})
        const index1 = vec1.index(1)
        expect(index1).not.toEqual({x: 1, y: 2, z: 3})
    })

    it("vec can only point at one value at a time", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})
        const vec1 = new PositionV(5).fill({x: 1, y: 2, z: 3})
        const index1 = vec1.index(1)
        const index2 = vec1.index(2)
        expect(index2.e).toEqual(index1.e)
    })
})

describe("at method", () => {
    it("works like index method with positive integers", () => {
        const EmployeesV = vec({"salary": "f32", "department": "f32"})
        const employees = new EmployeesV()
        
        employees.push({salary: 100_000, department: 1})
        employees.push({salary: 153_020, department: 1})
        employees.push({salary: 103_122, department: 0})
        const firstElement = employees.index(0).e
        expect(firstElement).toEqual(employees.at(0).e)

        const secondElement = employees.index(1).e
        expect(secondElement).toEqual(employees.at(1).e)

        const thirdElement = employees.index(2).e
        expect(thirdElement).toEqual(employees.at(2).e)
    })

    it("computes reverse index with negative integers", () => {
        const EmployeesV = vec({"salary": "f32", "department": "f32"})
        const employees = new EmployeesV()
        
        employees.push({salary: 100_000, department: 1})
        employees.push({salary: 153_020, department: 1})
        employees.push({salary: 103_122, department: 0})

        const one = employees.index(employees.length - 1).e
        expect(one).toEqual(employees.at(-1).e)

        const two = employees.index(employees.length - 2).e
        expect(two).toEqual(employees.at(-2).e)

        const three = employees.index(employees.length - 3).e
        expect(three).toEqual(employees.at(-3)?.e)
    })

    it("indexes to 0 if input is -0", () => {
        const EmployeesV = vec({"salary": "f32", "department": "f32"})
        const employees = new EmployeesV()
        
        employees.push({salary: 100_000, department: 1})
        employees.push({salary: 153_020, department: 1})
        employees.push({salary: 103_122, department: 0})
        const firstElement = employees.at(-0).e
        expect(firstElement).toEqual(employees.index(0).e)
    })
})