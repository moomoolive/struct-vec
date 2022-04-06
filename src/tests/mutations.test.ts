import {expect, it, describe} from "@jest/globals"
import {vec} from "../index"

describe("mutations", () => {
    it("popping an element should return the target index or undefined if no elements in array", () => {
        const CustomersV = vec({is_active: "f32", payment_plan: "f32"})
        const customers = new CustomersV()
        customers.push({is_active: 1, payment_plan: 67})
        expect(customers.length).toBe(1)
        customers.push({is_active: 0, payment_plan: 11})
        expect(customers.length).toBe(2)
        const secondElementPopped = customers.pop()
        expect(secondElementPopped).toEqual({is_active: 0, payment_plan: 11})
        expect(customers.length).toBe(1)
        const firstElementPopped  = customers.pop()
        expect(firstElementPopped).toEqual({is_active: 1, payment_plan: 67})
        expect(customers.length).toBe(0)
        let noElementsPopped = customers.pop()
        expect(noElementsPopped).toBe(undefined)
        expect(customers.length).toBe(0)

        noElementsPopped = customers.pop()
        expect(noElementsPopped).toBe(undefined)
        expect(customers.length).toBe(0)

        noElementsPopped = customers.pop()
        expect(noElementsPopped).toBe(undefined)
        expect(customers.length).toBe(0)
    })

    it("shift method removes the first element and returns it", () => {
        const PersonV = vec({"id": "f32", "age": "f32"})
        const persons = new PersonV()

        persons.push({id: 1, age: 10})
        persons.push({id: 2, age: 25})
        persons.push({id: 4, age: 44})

        expect(persons.length).toBe(3)

        expect(persons.shift()).toEqual({id: 1, age: 10})
        expect(persons.length).toBe(2)

        expect(persons.shift()).toEqual({id: 2, age: 25})
        expect(persons.length).toBe(1)

        expect(persons.shift()).toEqual({id: 4, age: 44})
        expect(persons.length).toBe(0)

        expect(persons.shift()).toEqual(undefined)
        expect(persons.length).toBe(0)
        expect(persons.shift()).toEqual(undefined)
        expect(persons.length).toBe(0)
        expect(persons.shift()).toEqual(undefined)
        expect(persons.length).toBe(0)
    })

    it("unshift method inserts elements at beginning of array and returns new length", () => {
        const CatsV = vec({"age": "f32", "evilness": "f32"})
        const cats = new CatsV()
        cats.push(
            {age: Math.fround(1.1), evilness: 500_000},
            {age: Math.fround(1.1), evilness: 500_000},
            {age: Math.fround(1.1), evilness: 500_000},
            {age: Math.fround(1.1), evilness: 500_000},
            {age: Math.fround(1.1), evilness: 500_000},
            {age: Math.fround(1.1), evilness: 500_000},
        )

        expect(cats.unshift({
            age: Math.fround(2.4), 
            evilness: 300
        })).toBe(7)
        expect(cats.length).toBe(7)
        expect([...cats]).toEqual([
            {age: Math.fround(2.4), evilness: 300},
            {age: Math.fround(1.1), evilness: 500_000},
            {age: Math.fround(1.1), evilness: 500_000},
            {age: Math.fround(1.1), evilness: 500_000},
            {age: Math.fround(1.1), evilness: 500_000},
            {age: Math.fround(1.1), evilness: 500_000},
            {age: Math.fround(1.1), evilness: 500_000},
        ])

        const moreCats = [
            {age: Math.fround(5.7), evilness: 302},
            {age: Math.fround(5.7), evilness: 302},
            {age: Math.fround(5.7), evilness: 302},
            {age: Math.fround(5.7), evilness: 302},
        ]
        expect(cats.unshift(...moreCats)).toBe(11)
        expect(cats.length).toBe(11)
        expect([...cats]).toEqual([
            {age: Math.fround(5.7), evilness: 302},
            {age: Math.fround(5.7), evilness: 302},
            {age: Math.fround(5.7), evilness: 302},
            {age: Math.fround(5.7), evilness: 302},
            {age: Math.fround(2.4), evilness: 300},
            {age: Math.fround(1.1), evilness: 500_000},
            {age: Math.fround(1.1), evilness: 500_000},
            {age: Math.fround(1.1), evilness: 500_000},
            {age: Math.fround(1.1), evilness: 500_000},
            {age: Math.fround(1.1), evilness: 500_000},
            {age: Math.fround(1.1), evilness: 500_000},
        ])
    })

    it("reverse method should reverse the order of a vec items in place an return this same array", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})
        const p = new PositionV(20)
        
        // returns the same array it was performed on
        expect(p.reverse()).toBe(p)
        
        // does nothing with one element
        p.push({x: 2, y: 3, z: 8})
        p.reverse()
        
        // works with even number of elements
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.reverse()
        expect([...p]).toEqual([
            {x: 233, y: 31, z: 99},
            {x: 2, y: 4, z: 10},
            {x: 1, y: 3, z: 0},
            {x: 2, y: 3, z: 8}
        ])

        // works with odd number of elements
        p.push(
            {x: 55, y: 22, z: 0},
            {x: 62, y: 666, z: 0},
            {x: 89089, y: 21, z: 98},
        )
        p.reverse()
        expect([...p]).toEqual([
            {x: 89089, y: 21, z: 98},
            {x: 62, y: 666, z: 0},
            {x: 55, y: 22, z: 0},
            {x: 2, y: 3, z: 8},
            {x: 1, y: 3, z: 0},
            {x: 2, y: 4, z: 10},
            {x: 233, y: 31, z: 99},
        ])
    })

    it("truncate should remove the specified number of elements from the back and return new length", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})
        const p = new PositionV(20).fill({x: 1, y: 1, z: 1})
        expect(p.length).toBe(20)
        
        expect(p.truncate(10)).toBe(10)
        expect(p.length).toBe(10)

        expect(p.truncate(10)).toBe(0)
        expect(p.length).toBe(0)

        expect(p.truncate(10)).toBe(0)
        expect(p.length).toBe(0)
    })
})

describe("fill method", () => {
    it("should fill all arrays element from start index to end index if both are supplied. If end index is greater than capacity then it defaults to capacity", () => {
        const ProgrammerV = vec({"yearsOfTraining": "f32", "averageHoursWorked": "f32"})

        const programmers = new ProgrammerV(50)

        expect(programmers.length).toBe(0)
        expect(programmers.capacity).toBe(50)

        programmers.fill({yearsOfTraining: 1, averageHoursWorked: 43.7}, 0, -3)
        expect(programmers.length).toBe(47)
        expect(programmers.capacity).toBe(50)

        programmers.forEach((p) => {
            expect(p.e).toEqual({
                yearsOfTraining: 1, 
                averageHoursWorked: Math.fround(43.7)
            })
        })

        const p2 = new ProgrammerV(50)
        p2.fill({yearsOfTraining: 1, averageHoursWorked: 43.7}, 0, 4)
        expect(p2.capacity).toBe(50)
        expect(p2.length).toBe(4)

        p2.forEach((p) => expect(p.e).toEqual({
            yearsOfTraining: 1, 
            averageHoursWorked: Math.fround(43.7)
        }))

        p2.fill({yearsOfTraining: 2, averageHoursWorked: 2.4}, 0, p2.length)
        p2.forEach((p) => {
            expect(p.e).toEqual({
                yearsOfTraining: 2, 
                averageHoursWorked: Math.fround(2.4)
            })
        })
    })

    it("should fill all of array's capacity with inputted element if no start or end index is supplied", () => {
        const AliensV = vec({"height": "f32", "weight": "f32", "power": "f32"})
        const aliens = new AliensV(200)
        expect(aliens.capacity).toBe(200)
        expect(aliens.length).toBe(0)
        aliens.fill({height: 2, weight: 2, power: 2})
        expect(aliens.capacity).toBe(200)
        expect(aliens.length).toBe(200)
        aliens.forEach((alien) => {
            expect(alien.e).toEqual({height: 2, weight: 2, power: 2})
        })
    })

    it("should fill all arrays element from start index to capcity if start index provided. If start index is greater than length then start index defaults to the last element + 1", () => {

        const AliensV = vec({"height": "f32", "weight": "f32", "power": "f32"})
        const aliens = new AliensV(200)
        
        expect(aliens.capacity).toBe(200)
        expect(aliens.length).toBe(0)
        
        aliens.fill({height: 2, weight: 2, power: 2}, 5)
        
        expect(aliens.capacity).toBe(200)
        expect(aliens.length).toBe(200)
        
        aliens.forEach((alien) => {
            expect(alien.e).toEqual({height: 2, weight: 2, power: 2})
        })

        const aliens2 = new AliensV(50)
        aliens2.push({height: 10, weight: 10, power: 12})
        aliens2.push({height: 10, weight: 10, power: 12})
        aliens2.push({height: 10, weight: 10, power: 12})
        expect(aliens2.length).toBe(3)
        expect(aliens2.capacity).toBe(50)
        aliens2.fill({height: 2, weight: 2, power: 2}, 5)

        expect(aliens2.length).toBe(50)
        expect(aliens2.capacity).toBe(50)

        aliens2.forEach((alien, index) => {
            if (index > 2) {
                expect(alien.e).toEqual({height: 2, weight: 2, power: 2})
            } else {
                expect(alien.e).toEqual({height: 10, weight: 10, power: 12})
            }
        })

        const alien3 = new AliensV(30)
        alien3.push({height: 11, weight: 10, power: 12})
        alien3.push({height: 11, weight: 10, power: 12})
        alien3.push({height: 11, weight: 10, power: 12})
        alien3.push({height: 11, weight: 10, power: 12})

        alien3.fill({height: 2, weight: 2, power: 2}, -1)

        expect(alien3.length).toBe(30)
        expect(alien3.capacity).toBe(30)

        alien3.forEach((alien, index) => {
            if (index > 2) {
                expect(alien.e).toEqual({height: 2, weight: 2, power: 2})
            } else {
                expect(alien.e).toEqual({height: 11, weight: 10, power: 12})
            }
        })

        alien3
            .fill({height: 2, weight: 2, power: 2}, 1)
            .forEach((alien, index) => {
                if (index >= 1) {
                    expect(alien.e).toEqual({height: 2, weight: 2, power: 2})
                } else {
                    expect(alien.e).toEqual({height: 11, weight: 10, power: 12})
                }
            })
        expect(alien3.length).toBe(30)
        expect(alien3.capacity).toBe(30)

        // overwrite all elements with below
        alien3.fill({height: 2, weight: 2, power: 2})
        
        alien3.fill({height: 11, weight: 10, power: 12}, -3)
        alien3.forEach((alien, index) => {
            if (index >= alien3.length - 3) {
                expect(alien.e).toEqual({height: 11, weight: 10, power: 12})
            } else {
                expect(alien.e).toEqual({height: 2, weight: 2, power: 2})
            }
        })
    })
})

describe("splice method", () => {
    it("with only target argument should return a new array with value from the target index to the end of array it was called on and remove them", () => {
        const Vec3V = vec({x: "f32", y: "f32", z: "f32"})
        const v1 = new Vec3V()

        v1.push({x: 0, y: 0, z: 200})
        v1.push({x: 0, y: 0, z: 201})
        v1.push({x: 0, y: 0, z: 202})
        v1.push({x: 0, y: 0, z: 203})

        const vec3 = v1.slice()
        
        const v2 = vec3.splice(2)
        expect(v2).not.toBe(vec3)
        expect(v2.length).toBe(2)
        expect([...v2]).toEqual([
            {x: 0, y: 0, z: 202},
            {x: 0, y: 0, z: 203}
        ])

        expect(vec3.length).toBe(2)
        expect([...vec3]).toEqual([
            {x: 0, y: 0, z: 200},
            {x: 0, y: 0, z: 201},
        ])

        const v3 = v1.slice()
        const v4 = v3.splice(6)
        expect(v4.length).toBe(0)
        expect([...v4]).toEqual([])

        expect(v3.length).toBe(4)
        expect([...v3]).toEqual([
            {x: 0, y: 0, z: 200},
            {x: 0, y: 0, z: 201},
            {x: 0, y: 0, z: 202},
            {x: 0, y: 0, z: 203}
        ])

        const v5 = v3.splice(-1000)
        expect(v5.length).toBe(0)
        expect([...v5]).toEqual([])

        expect(v3.length).toBe(4)
        expect([...v3]).toEqual([
            {x: 0, y: 0, z: 200},
            {x: 0, y: 0, z: 201},
            {x: 0, y: 0, z: 202},
            {x: 0, y: 0, z: 203}
        ])

        const v6 = v1.slice()
        const v7 = v6.splice(-1)
        expect(v6.length).toBe(3)
        expect([...v6]).toEqual([
            {x: 0, y: 0, z: 200},
            {x: 0, y: 0, z: 201},
            {x: 0, y: 0, z: 202},
        ])

        expect(v7.length).toBe(1)
        expect([...v7]).toEqual([
            {x: 0, y: 0, z: 203}
        ])

        const v8 = v7.splice(-1)
        expect(v8.length).toBe(1)
        const [v8Val] = v8
        expect(v8Val).toEqual({x: 0, y: 0, z: 203})
        expect(v7.length).toBe(0)

        expect([...v1.slice().splice(0)]).toEqual([
            {x: 0, y: 0, z: 200},
            {x: 0, y: 0, z: 201},
            {x: 0, y: 0, z: 202},
            {x: 0, y: 0, z: 203}
        ])
    })

    it("with a delete count deletes only specified number of items after start", () => {
        const FrogsV = vec({"sound": "f32", "cuteness": "f32"})
        const frogs = new FrogsV()

        frogs.push(
            {sound: 1, cuteness: 0},
            {sound: 3, cuteness: 10},
            {sound: 5, cuteness: 7},
            {sound: 8, cuteness: -2},
            {sound: 6, cuteness: 100},
            {sound: 67, cuteness: 9_001}
        )
        const f1 = frogs.slice()
        expect([...f1.splice(0, 2)]).toEqual([
            {sound: 1, cuteness: 0},
            {sound: 3, cuteness: 10},
        ])
        
        expect([...f1]).toEqual([
            {sound: 5, cuteness: 7},
            {sound: 8, cuteness: -2},
            {sound: 6, cuteness: 100},
            {sound: 67, cuteness: 9_001}
        ])
        expect([...f1.slice().splice(1, 3)]).toEqual([
            {sound: 8, cuteness: -2},
            {sound: 6, cuteness: 100},
            {sound: 67, cuteness: 9_001}
        ])

        // removing zero or negative items has no effect
        expect([...f1.splice(1, 0)]).toEqual([])
        expect([...f1.splice(1, -10)]).toEqual([])
        expect([...f1]).toEqual([
            {sound: 5, cuteness: 7},
            {sound: 8, cuteness: -2},
            {sound: 6, cuteness: 100},
            {sound: 67, cuteness: 9_001}
        ])

        // removing more elements than in array results in entire array
        // being removed
        expect([...f1.splice(0, 19)]).toEqual([
            {sound: 5, cuteness: 7},
            {sound: 8, cuteness: -2},
            {sound: 6, cuteness: 100},
            {sound: 67, cuteness: 9_001}
        ])
        expect([...f1]).toEqual([])
        expect([...f1.splice(0, 2_000)]).toEqual([])
    })

    it("with 0 delete count and items to insert returns an empty array and inserts items into array it was called on", () => {
        const DoggosV = vec({"tail_length": "f32", "lovability": "f32"})
        const doggos = new DoggosV()

        doggos.push(
            {tail_length: 2, lovability: 100},
            {tail_length: 7, lovability: 88},
            {tail_length: 10, lovability: 102},
            {tail_length: 0, lovability: 10},
            {tail_length: 3, lovability: 55},
        )

        const d1 = doggos.slice()
        expect([...d1.splice(0, 0, {tail_length: 2, lovability: 5})]).toEqual([])
        expect([...d1]).toEqual([
            {tail_length: 2, lovability: 5},
            {tail_length: 2, lovability: 100},
            {tail_length: 7, lovability: 88},
            {tail_length: 10, lovability: 102},
            {tail_length: 0, lovability: 10},
            {tail_length: 3, lovability: 55},
        ])

        const d2 = doggos.slice()
        expect([...d2.splice(-1, 0, 
            {tail_length: 0, lovability: 10},
            {tail_length: 3, lovability: 55},
        )]).toEqual([])
        expect([...d2]).toEqual([
            {tail_length: 2, lovability: 100},
            {tail_length: 7, lovability: 88},
            {tail_length: 10, lovability: 102},
            {tail_length: 0, lovability: 10},
            {tail_length: 0, lovability: 10},
            {tail_length: 3, lovability: 55},
            {tail_length: 3, lovability: 55},
        ])

        const d3 = doggos.slice()
        expect([...d3.splice(3, 0, 
            {tail_length: 10, lovability: 102},
            {tail_length: 10, lovability: 102},
            {tail_length: 10, lovability: 102},
            {tail_length: 10, lovability: 102},
        )]).toEqual([])
        expect([...d3]).toEqual([
            {tail_length: 2, lovability: 100},
            {tail_length: 7, lovability: 88},
            {tail_length: 10, lovability: 102},
            {tail_length: 10, lovability: 102},
            {tail_length: 10, lovability: 102},
            {tail_length: 10, lovability: 102},
            {tail_length: 10, lovability: 102},
            {tail_length: 0, lovability: 10},
            {tail_length: 3, lovability: 55},
        ])

        // out of bounds negative or positive index does nothing
        const d4 = doggos.slice()
        expect([...d4.splice(-100, 0, {tail_length: 1, lovability: 100})]).toEqual([])
        expect([...d4]).toEqual([...doggos])

        expect([...d4.splice(2_000, 0, {tail_length: 1, lovability: 100})]).toEqual([])
        expect([...d4]).toEqual([...doggos])
    })

    it("with delete count and items to insert returns array of deleted items and inputs items at index", () => {
        const DoggosV = vec({"tail_length": "f32", "lovability": "f32"})
        const doggos = new DoggosV()

        // delete count does nothing on empty vec 
        const empty = new DoggosV()
        expect([...empty.splice(0, 2)]).toEqual([])
        expect([...empty]).toEqual([])

        doggos.push(
            {tail_length: 2, lovability: 100},
            {tail_length: 7, lovability: 88},
            {tail_length: 10, lovability: 102},
            {tail_length: 0, lovability: 10},
            {tail_length: 3, lovability: 55},
        )

        const d5 = doggos.slice()
        expect([...d5.splice(2, 1, 
            {tail_length: 2, lovability: 500},
            {tail_length: 2, lovability: 500},
            {tail_length: 2, lovability: 500},
        )]).toEqual([{tail_length: 10, lovability: 102},])
        expect([...d5]).toEqual([
            {tail_length: 2, lovability: 100},
            {tail_length: 7, lovability: 88},
            {tail_length: 2, lovability: 500},
            {tail_length: 2, lovability: 500},
            {tail_length: 2, lovability: 500},
            {tail_length: 0, lovability: 10},
            {tail_length: 3, lovability: 55},
        ])

        const d1 = doggos.slice()
        expect([...d1.splice(0, 1, {tail_length: 50, lovability: 50})]).toEqual([
            {tail_length: 2, lovability: 100},
        ])
        expect([...d1]).toEqual([
            {tail_length: 50, lovability: 50},
            {tail_length: 7, lovability: 88},
            {tail_length: 10, lovability: 102},
            {tail_length: 0, lovability: 10},
            {tail_length: 3, lovability: 55},
        ])

        // out of bounds does nothing
        const d2 = doggos.slice()
        expect([...d2.splice(100, 2, {tail_length: 1, lovability: 2})]).toEqual([])
        expect([...d2]).toEqual([
            {tail_length: 2, lovability: 100},
            {tail_length: 7, lovability: 88},
            {tail_length: 10, lovability: 102},
            {tail_length: 0, lovability: 10},
            {tail_length: 3, lovability: 55},
        ])
        expect([...d2.splice(-100, 2, {tail_length: 1, lovability: 2})]).toEqual([])
        expect([...d2]).toEqual([
            {tail_length: 2, lovability: 100},
            {tail_length: 7, lovability: 88},
            {tail_length: 10, lovability: 102},
            {tail_length: 0, lovability: 10},
            {tail_length: 3, lovability: 55},
        ])

        const d4 = doggos.slice()
        expect([...d4.splice(1, 3, {tail_length: 3, lovability: 200})]).toEqual([
            {tail_length: 7, lovability: 88},
            {tail_length: 10, lovability: 102},
            {tail_length: 0, lovability: 10},
        ])
        expect([...d4]).toEqual([
            {tail_length: 2, lovability: 100},
            {tail_length: 3, lovability: 200},
            {tail_length: 3, lovability: 55},
        ])

        const d3 = doggos.slice()
        expect([...d3.splice(-1, 2, 
            {tail_length: 10, lovability: 102},
            {tail_length: 0, lovability: 10},
            {tail_length: 0, lovability: 10},
        )]).toEqual([{tail_length: 3, lovability: 55}])
        expect([...d3]).toEqual([
            {tail_length: 2, lovability: 100},
            {tail_length: 7, lovability: 88},
            {tail_length: 10, lovability: 102},
            {tail_length: 0, lovability: 10},
            {tail_length: 10, lovability: 102},
            {tail_length: 0, lovability: 10},
            {tail_length: 0, lovability: 10},
        ])
    })
})

describe("concat method", () => {
    it("returns a new vec with elements of inputted vecs (one)", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})

        const vec1 = new PositionV(5).fill({x: 1, y: 2, z: 3})
        const vec2 = new PositionV(5).fill({x: 1, y: 4, z: 3})
        const vec4 = vec1.concat(vec2)

        expect(vec4).not.toBe(vec1)

        expect(vec4.length).toBe(10)
        vec4.forEach((element, index) => {
            if (index < 5) {
                expect(element.e).toEqual({x: 1, y: 2, z: 3})
            } else {
                expect(element.e).toEqual({x: 1, y: 4, z: 3})
            }
        })
    })

    it("returns a new vec with elements of inputted vecs (with none inputted)", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})

        const vec1 = new PositionV(5).fill({x: 1, y: 2, z: 3})
        const vec4 = vec1.concat()

        expect(vec4).not.toBe(vec1)

        expect(vec4.length).toBe(5)
        vec4.forEach((element) => {
            expect(element.e).toEqual({x: 1, y: 2, z: 3})
        })
    })

    it("returns a new vec with elements of inputted vecs (with multiple inputted)", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})

        const vec1 = new PositionV(5).fill({x: 1, y: 2, z: 3})
        const vec2 = new PositionV(5).fill({x: 1, y: 4, z: 3})
        const vec3 = new PositionV(5).fill({x: 2, y: 2, z: 3})
        const vec4 = vec1.concat(vec2, vec3)

        // check that new vec has been created
        expect(vec4).not.toBe(vec1)

        expect(vec4.length).toBe(15)
        vec4.forEach((element, index) => {
            if (index < 5) {
                expect(element.e).toEqual({x: 1, y: 2, z: 3})
            } else if (index < 10) {
                expect(element.e).toEqual({x: 1, y: 4, z: 3})
            } else {
                expect(element.e).toEqual({x: 2, y: 2, z: 3})
            }
        })
    })
})

describe("copyWithin Method", () => {
    it("copies entire array contents to target if no start or end is specified", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})
        const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})
        expect(p.length).toBe(5)

        expect([...p.slice().copyWithin(0)]).toEqual([
            {x: 2, y: 3, z: 8},
            {x: 1, y: 3, z: 0},
            {x: 2, y: 4, z: 10},
            {x: 233, y: 31, z: 99},
            {x: 122, y: 23, z: 8},
        ])

        // no change due to out of bounds
        expect([...p.slice().copyWithin(55)]).toEqual([
            {x: 2, y: 3, z: 8},
            {x: 1, y: 3, z: 0},
            {x: 2, y: 4, z: 10},
            {x: 233, y: 31, z: 99},
            {x: 122, y: 23, z: 8},
        ])

        expect([...p.slice().copyWithin(2)]).toEqual([
            {x: 2, y: 3, z: 8},
            {x: 1, y: 3, z: 0},
            {x: 2, y: 3, z: 8},
            {x: 1, y: 3, z: 0},
            {x: 2, y: 4, z: 10},
        ])

        expect([...p.slice().copyWithin(3)]).toEqual([
            {x: 2, y: 3, z: 8},
            {x: 1, y: 3, z: 0},
            {x: 2, y: 4, z: 10},
            {x: 2, y: 3, z: 8},
            {x: 1, y: 3, z: 0},
        ])
    })

    it("copies entire array contents to target index if no start or end is specified even when negative indexes are used", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})
        const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})
        expect(p.length).toBe(5)

        expect([...p.slice().copyWithin(-1)]).toEqual([
            {x: 2, y: 3, z: 8},
            {x: 1, y: 3, z: 0},
            {x: 2, y: 4, z: 10},
            {x: 233, y: 31, z: 99},
            {x: 2, y: 3, z: 8}
        ])

        expect([...p.slice().copyWithin(-3)]).toEqual([
            {x: 2, y: 3, z: 8},
            {x: 1, y: 3, z: 0},
            {x: 2, y: 3, z: 8},
            {x: 1, y: 3, z: 0},
            {x: 2, y: 4, z: 10}
        ])

        // no change due to out of bounds
        expect([...p.slice().copyWithin(-29)]).toEqual([
            {x: 2, y: 3, z: 8},
            {x: 1, y: 3, z: 0},
            {x: 2, y: 4, z: 10},
            {x: 233, y: 31, z: 99},
            {x: 122, y: 23, z: 8},
        ])
    })

    it("starts copy to target index from start if specified and supports negative indexing", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})
        const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})
        expect(p.length).toBe(5)

        expect([...p.slice().copyWithin(0, 2)]).toEqual([
            {x: 2, y: 4, z: 10},
            {x: 233, y: 31, z: 99},
            {x: 122, y: 23, z: 8},
            {x: 233, y: 31, z: 99},
            {x: 122, y: 23, z: 8},
        ])

        expect([...p.slice().copyWithin(-3, 3)]).toEqual([
            {x: 2, y: 3, z: 8},
            {x: 1, y: 3, z: 0},
            {x: 233, y: 31, z: 99},
            {x: 122, y: 23, z: 8},
            {x: 122, y: 23, z: 8},
        ])

        // no change due to out of bounds
        expect([...p.slice().copyWithin(0, 25)]).toEqual([
            {x: 2, y: 3, z: 8},
            {x: 1, y: 3, z: 0},
            {x: 2, y: 4, z: 10},
            {x: 233, y: 31, z: 99},
            {x: 122, y: 23, z: 8},
        ])

        expect([...p.slice().copyWithin(-10, 25)]).toEqual([
            {x: 2, y: 3, z: 8},
            {x: 1, y: 3, z: 0},
            {x: 2, y: 4, z: 10},
            {x: 233, y: 31, z: 99},
            {x: 122, y: 23, z: 8},
        ])
    })

    it("starts copy to target index from start until end index if both are specified", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})
        const p = new PositionV(20)
        p.push({x: 2, y: 3, z: 8})
        p.push({x: 1, y: 3, z: 0})
        p.push({x: 2, y: 4, z: 10})
        p.push({x: 233, y: 31, z: 99})
        p.push({x: 122, y: 23, z: 8})
        expect(p.length).toBe(5)

        expect([...p.slice().copyWithin(0, 2, 3)]).toEqual([
            {x: 2, y: 4, z: 10},
            {x: 1, y: 3, z: 0},
            {x: 2, y: 4, z: 10},
            {x: 233, y: 31, z: 99},
            {x: 122, y: 23, z: 8},
        ])

        expect([...p.slice().copyWithin(1, -3, -2)]).toEqual([
            {x: 2, y: 3, z: 8},
            {x: 2, y: 4, z: 10},
            {x: 2, y: 4, z: 10},
            {x: 233, y: 31, z: 99},
            {x: 122, y: 23, z: 8},
        ])

        expect([...p.slice().copyWithin(2, -2, -1)]).toEqual([
            {x: 2, y: 3, z: 8},
            {x: 1, y: 3, z: 0},
            {x: 233, y: 31, z: 99},
            {x: 233, y: 31, z: 99},
            {x: 122, y: 23, z: 8},
        ])

        expect([...p.slice().copyWithin(-1, 1, -3)]).toEqual([
            {x: 2, y: 3, z: 8},
            {x: 1, y: 3, z: 0},
            {x: 2, y: 4, z: 10},
            {x: 233, y: 31, z: 99},
            {x: 1, y: 3, z: 0},
        ])

        // no change due to out of bounds
        expect([...p.slice().copyWithin(-10, 25, 200)]).toEqual([
            {x: 2, y: 3, z: 8},
            {x: 1, y: 3, z: 0},
            {x: 2, y: 4, z: 10},
            {x: 233, y: 31, z: 99},
            {x: 122, y: 23, z: 8},
        ])
    })
})

describe("slice method", () => {
    it("returns a copy of the entire vec if no arguments are supplied", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})
        const p = new PositionV(20).fill({x: 2, y: 2, z: 2})
        const copy = p.slice()
        expect(copy).not.toBe(p)
        expect(copy.length).toBe(20)
        for (let i = 0; i < copy.length; i += 1) {
            expect(copy.index(i).e).toEqual({x: 2, y: 2, z: 2})
        }
    })

    it("returns a copy of vec from start index to length - 1 if start is defined and end is undefined", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})
        const p = new PositionV(20).fill({x: 2, y: 2, z: 2})
        const copy = p.slice(4)
        expect(copy.length).toBe(p.length - 4)
        expect(copy).not.toBe(p)
        for (let i = 0; i < copy.length; i += 1) {
            expect(copy.index(i).e).toEqual({x: 2, y: 2, z: 2})
        }

        const copy2 = p.slice(10)
        expect(copy2.length).toBe(p.length - 10)
        expect(copy2).not.toBe(p)
        for (let i = 0; i < copy2.length; i += 1) {
            expect(copy2.index(i).e).toEqual({x: 2, y: 2, z: 2})
        }
    })

    it("returns a copy of vec from start index to end if both start and end are defined", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})
        const p = new PositionV(20).fill({x: 2, y: 2, z: 2})
        const copy = p.slice(0, 4)
        expect(copy.length).toBe(4)
        expect(copy).not.toBe(p)
        for (let i = 0; i < copy.length; i += 1) {
            expect(copy.index(i).e).toEqual({x: 2, y: 2, z: 2})
        }

        const copy2 = p.slice(2, 7)
        expect(copy2.length).toBe(5)
        expect(copy2).not.toBe(p)
        for (let i = 0; i < copy2.length; i += 1) {
            expect(copy2.index(i).e).toEqual({x: 2, y: 2, z: 2})
        }
    })

    it("end argument supports negative indexes", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})
        const p = new PositionV(20).fill({x: 2, y: 2, z: 2})
        const copy = p.slice(5, -7)
        expect(copy.length).toBe(8)
        expect(copy).not.toBe(p)
        for (let i = 0; i < copy.length; i += 1) {
            expect(copy.index(i).e).toEqual({x: 2, y: 2, z: 2})
        }

        const copy2 = p.slice(2, -2)
        expect(copy2.length).toBe(16)
        expect(copy2).not.toBe(p)
        for (let i = 0; i < copy2.length; i += 1) {
            expect(copy2.index(i).e).toEqual({x: 2, y: 2, z: 2})
        }

        const copy3 = p.slice(0, -1)
        expect(copy3.length).toBe(19)
        expect(copy3).not.toBe(p)
        for (let i = 0; i < copy3.length; i += 1) {
            expect(copy3.index(i).e).toEqual({x: 2, y: 2, z: 2})
        }
    })

    it("start argument supports negative indexes", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})
        const p = new PositionV(20).fill({x: 2, y: 2, z: 2})
        const copy = p.slice(-3, -1)
        expect(copy.length).toBe(2)
        expect(copy).not.toBe(p)
        copy.forEach((pos) => expect(pos.e).toEqual({x: 2, y: 2, z: 2}))

        const copy1 = p.slice(-(p.length), -1)
        expect(copy1.length).toBe(19)
        expect(copy1).not.toBe(p)
        copy1.forEach((pos) => expect(pos.e).toEqual({x: 2, y: 2, z: 2}))
    })

    it("returns empty vec if either start or end arguments are out of bounds", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})
        const p = new PositionV(20).fill({x: 2, y: 2, z: 2})
        const copy = p.slice(20, -7)

        expect(copy.length).toBe(0)
        expect(copy).not.toBe(p)

        const copy2 = p.slice(2, -21)
        expect(copy2.length).toBe(0)
        expect(copy2).not.toBe(p)

        const copy3 = p.slice(40)
        expect(copy3.length).toBe(0)
    })
})

describe("sort method", () => {
    it("nothing occurs if length is smaller than 2", () => {
        const Position = vec({x: "f32", y: "f32", z: "f32"})
        const length0 = new Position()
        expect(length0.length).toBe(0)
        const l0ref = length0.sort((_a, _b) => 1)
        expect(l0ref).toBe(length0)
        expect(length0.length).toBe(0)

        const length1 = new Position()
        length1.push({x: 1, z: 1, y: 1})
        expect(length1.length).toBe(1)
        const l1ref = length1.sort((_a, _b) => 1)
        expect(l1ref).toBe(length1)
        expect(length1.length).toBe(1)
    })

    it("returns correctly sorted array if length is 2", () => {
        const Position = vec({x: "f32", y: "f32", z: "f32"})
        const p = new Position(2)
        p.push(
            {x: 1, z: 1, y: 1},
            {x: 2, z: 2, y: 2}
        )
        expect(p.length).toBe(2)
        
        // descending order
        p.sort((a, b) => b.x - a.x)
        expect(p.index(0).e).toEqual({x: 2, z: 2, y: 2})
        expect(p.index(1).e).toEqual({x: 1, z: 1, y: 1})

        // ascending order
        p.sort((a, b) => a.x - b.x)
        expect(p.index(0).e).toEqual({x: 1, z: 1, y: 1})
        expect(p.index(1).e).toEqual({x: 2, z: 2, y: 2})
    })
    
    it("returns correctly sorted array if length is bigger than 2", () => {
        const Position = vec({x: "f32", y: "f32", z: "f32"})
        const p = new Position()
        const elementsLength = 15
        for (let i = 0; i < elementsLength; i += 1) {
            p.push({x: i, y: i, z: i})
        }
        expect(p.length).toBe(elementsLength)

        // descending order
        p.sort((a, b) => {
            if (a.x < b.x) {
                return -1
            }
            return 0
        })
        p.forEach((pos, i) => {
            const val = (elementsLength - 1) - i
            expect(pos.e).toEqual({x: val, y: val, z: val})
        })
        expect(p.length).toBe(elementsLength)

        // ascending order
        p.sort((a, b) => {
            if (a.x > b.x) {
                return 1
            }
            return 0
        })
        p.forEach((pos, i) => {
            expect(pos.e).toEqual({x: i, y: i, z: i})
        })
        expect(p.length).toBe(elementsLength)
    })
})

describe("swap method", () => {
    it("swapping with positive indices works", () => {
        const Position = vec({x: "f32", y: "f32", z: "f32"})
        const p = new Position()
        p.push(
            {x: 1, z: 1, y: 1},
            {x: 2, z: 2, y: 2},
        )
        p.swap(0, 1)
        expect(p.index(0).e).toEqual({x: 2, z: 2, y: 2})
        expect(p.index(1).e).toEqual({x: 1, z: 1, y: 1})
    })

    it("swapping with negative indices works", () => {
        const Position = vec({x: "f32", y: "f32", z: "f32"})
        const p = new Position()
        p.push(
            {x: 1, z: 1, y: 1},
            {x: 2, z: 2, y: 2},
        )
        p.swap(-2, -1)
        expect(p.index(0).e).toEqual({x: 2, z: 2, y: 2})
        expect(p.index(1).e).toEqual({x: 1, z: 1, y: 1})
    })
})
