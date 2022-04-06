import {expect, it, describe} from "@jest/globals"
import {vec} from "../index"

describe("higher order iterators", () => {
    it("'forEach' iterator works as expected", () => {
        const SportsTeamV = vec({"pointsScored": "f32", "powerRanking": "f32", "playersOnRoster": "f32"}) 
        const teams = new SportsTeamV()
        teams.push({pointsScored: 4, powerRanking: 1, playersOnRoster: 18})
        teams.push({pointsScored: 0, powerRanking: 4, playersOnRoster: 17})
        teams.push({pointsScored: 2, powerRanking: 2, playersOnRoster: 14})
        teams.push({pointsScored: 2, powerRanking: 3, playersOnRoster: 15})
        teams.forEach((team) => team.pointsScored += 1)

        expect(teams.index(0).pointsScored).toBe(5)
        expect(teams.index(1).pointsScored).toBe(1)
        expect(teams.index(2).pointsScored).toBe(3)
        expect(teams.index(3).pointsScored).toBe(3)
    })

    it("'map' iterator works as expected", () => {
        const SportsTeamV = vec({"pointsScored": "f32", "powerRanking": "f32", "playersOnRoster": "f32"}) 
        const teams = new SportsTeamV()
        teams.push({pointsScored: 4, powerRanking: 1, playersOnRoster: 18})
        teams.push({pointsScored: 0, powerRanking: 4, playersOnRoster: 17})
        teams.push({pointsScored: 2, powerRanking: 2, playersOnRoster: 14})
        teams.push({pointsScored: 2, powerRanking: 3, playersOnRoster: 15})
        const powerRankings = teams.map((team) => team.powerRanking)

        expect(powerRankings).toEqual([1, 4, 2, 3])
    })

    it("'mapv' iterator work like 'map' except it returns a vec instead of any array", () => {
        const SportsTeamV = vec({"pointsScored": "f32", "powerRanking": "f32", "playersOnRoster": "f32"}) 
        const teams = new SportsTeamV()
        teams.push({pointsScored: 4, powerRanking: 1, playersOnRoster: 18})
        teams.push({pointsScored: 0, powerRanking: 4, playersOnRoster: 17})
        teams.push({pointsScored: 2, powerRanking: 2, playersOnRoster: 14})
        teams.push({pointsScored: 2, powerRanking: 3, playersOnRoster: 15})
        const powerRankings = teams.mapv((team) =>{ 
            team.playersOnRoster = 1
            team.pointsScored = 1
            team.powerRanking = 1
            return team
        })

        // make sure change is made
        expect([...powerRankings]).toEqual([
            {pointsScored: 1, powerRanking: 1, playersOnRoster: 1},
            {pointsScored: 1, powerRanking: 1, playersOnRoster: 1},
            {pointsScored: 1, powerRanking: 1, playersOnRoster: 1},
            {pointsScored: 1, powerRanking: 1, playersOnRoster: 1},
        ])

        // copy was returned and not same vec
        expect(powerRankings).not.toBe(teams)
    })

    it("'filter' iterator works as expected", () => {
        const SportsTeamV = vec({"pointsScored": "f32", "powerRanking": "f32", "playersOnRoster": "f32"}) 
        const teams = new SportsTeamV()
        teams.push({pointsScored: 4, powerRanking: 1, playersOnRoster: 18})
        teams.push({pointsScored: 0, powerRanking: 4, playersOnRoster: 17})
        teams.push({pointsScored: 2, powerRanking: 2, playersOnRoster: 14})
        teams.push({pointsScored: 2, powerRanking: 3, playersOnRoster: 15})
        const teamsThatDontSuck = teams.filter((team) => team.pointsScored > 0)

        expect(teamsThatDontSuck).toBeInstanceOf(SportsTeamV)
        expect(teamsThatDontSuck.length).toBe(3)
        expect(teamsThatDontSuck.index(0).e).toEqual({pointsScored: 4, powerRanking: 1, playersOnRoster: 18})
        expect(teamsThatDontSuck.index(1).e).toEqual({pointsScored: 2, powerRanking: 2, playersOnRoster: 14})
        expect(teamsThatDontSuck.index(2).e).toEqual({pointsScored: 2, powerRanking: 3, playersOnRoster: 15})

        const teamsThatAreGreat = teams.filter((team) => team.pointsScored > 2)
        expect(teamsThatAreGreat.length).toBe(1)
        expect(teamsThatAreGreat.index(0).e).toEqual({pointsScored: 4, powerRanking: 1, playersOnRoster: 18})
    })

    it("'find' iterator works as expected", () => {
        const SportsTeamV = vec({"pointsScored": "f32", "powerRanking": "f32", "playersOnRoster": "f32"}) 
        const teams = new SportsTeamV()
        teams.push({pointsScored: 4, powerRanking: 1, playersOnRoster: 18})
        teams.push({pointsScored: 0, powerRanking: 4, playersOnRoster: 17})
        teams.push({pointsScored: 2, powerRanking: 2, playersOnRoster: 14})
        teams.push({pointsScored: 2, powerRanking: 3, playersOnRoster: 15})

        const topTeam = teams.find((team) => team.powerRanking === 1)
        expect(topTeam?.e).toEqual({pointsScored: 4, powerRanking: 1, playersOnRoster: 18})
        
        const nonExistentTeam = teams.find((team) => team.powerRanking === 5)
        expect(nonExistentTeam).toBe(undefined)
    })

    it("'lastIndexOf' iterator works as expected", () => {
        const SportsTeamV = vec({"pointsScored": "f32", "powerRanking": "f32", "playersOnRoster": "f32"}) 
        const teams = new SportsTeamV()
        teams.push({pointsScored: 4, powerRanking: 1, playersOnRoster: 18})
        teams.push({pointsScored: 0, powerRanking: 4, playersOnRoster: 14})
        teams.push({pointsScored: 2, powerRanking: 2, playersOnRoster: 14})
        teams.push({pointsScored: 2, powerRanking: 3, playersOnRoster: 15})

        const topTeamIndex = teams.lastIndexOf((team) => team.pointsScored === 2)
        expect(topTeamIndex).toEqual(3)

        const playersOnRosterLast = teams.lastIndexOf((team) => {
            return team.playersOnRoster === 14
        })
        expect(playersOnRosterLast).toBe(2)
        
        const nonExistentTeamIndex = teams.lastIndexOf((team) => team.powerRanking === 5)
        expect(nonExistentTeamIndex).toBe(-1)
    })

    it("'findIndex' iterator works as expected", () => {
        const SportsTeamV = vec({"pointsScored": "f32", "powerRanking": "f32", "playersOnRoster": "f32"}) 
        const teams = new SportsTeamV()
        teams.push({pointsScored: 4, powerRanking: 1, playersOnRoster: 18})
        teams.push({pointsScored: 0, powerRanking: 4, playersOnRoster: 17})
        teams.push({pointsScored: 2, powerRanking: 2, playersOnRoster: 14})
        teams.push({pointsScored: 2, powerRanking: 3, playersOnRoster: 15})

        const topTeamIndex = teams.findIndex((team) => team.powerRanking === 1)
        expect(topTeamIndex).toEqual(0)
        
        const nonExistentTeamIndex = teams.findIndex((team) => team.powerRanking === 5)
        expect(nonExistentTeamIndex).toBe(-1)
    })

    it("'reduce' iterator works as expected", () => {
        const SportsTeamV = vec({"pointsScored": "f32", "powerRanking": "f32", "playersOnRoster": "f32"}) 
        const teams = new SportsTeamV()
        teams.push({pointsScored: 4, powerRanking: 1, playersOnRoster: 18})
        teams.push({pointsScored: 0, powerRanking: 4, playersOnRoster: 17})
        teams.push({pointsScored: 2, powerRanking: 2, playersOnRoster: 14})
        teams.push({pointsScored: 2, powerRanking: 3, playersOnRoster: 15})

        const goalCount = teams.reduce((total, team) => {
            return total + team.pointsScored
        }, 0)
        expect(goalCount).toBe(8)

        const playerCount = teams.reduce((total, team) => total + team.playersOnRoster, 0)
        expect(playerCount).toBe(64)
    })

    it("'reduce' iterator should throw error with no initial value", () => {
        const SportsTeamV = vec({"pointsScored": "f32", "powerRanking": "f32", "playersOnRoster": "f32"}) 
        const teams = new SportsTeamV()
        // @ts-ignore
        expect(() => teams.reduce((total, val) => total + val.powerRanking)).toThrow()
    })

    it("'reduceRight' iterator works as expected and iterates the opposite ways as 'reduce' iterator", () => {
        const SportsTeamV = vec({"pointsScored": "f32", "powerRanking": "f32", "playersOnRoster": "f32"}) 
        const teams = new SportsTeamV()
        teams.push({pointsScored: 4, powerRanking: 1, playersOnRoster: 18})
        teams.push({pointsScored: 0, powerRanking: 4, playersOnRoster: 17})
        teams.push({pointsScored: 2, powerRanking: 2, playersOnRoster: 14})
        teams.push({pointsScored: 2, powerRanking: 3, playersOnRoster: 15})

        let goalCountIndexes = teams.length - 1
        const goalCount = teams.reduceRight((total, team, index) => {
            expect(index).toBe(goalCountIndexes)
            goalCountIndexes -= 1
            return total + team.pointsScored
        }, 0)
        expect(goalCount).toBe(8)

        let playerCountIndexes = teams.length - 1
        const playerCount = teams.reduceRight((total, team, index) => {
            expect(index).toBe(playerCountIndexes)
            playerCountIndexes -= 1
            return total + team.playersOnRoster
        }, 0)
        expect(playerCount).toBe(64)
    })

    it("'reduceRight' iterator should throw error with no initial value", () => {
        const SportsTeamV = vec({"pointsScored": "f32", "powerRanking": "f32", "playersOnRoster": "f32"}) 
        const teams = new SportsTeamV()
        // @ts-ignore
        expect(() => teams.reduceRight((total, val) => total + val.powerRanking)).toThrow()
    })

    it("'every' iterator works as expected", () => {
        const EmployeesV = vec({"salary": "f32", "department": "f32"})
        const employees = new EmployeesV()
        
        employees.push({salary: 100_000, department: 1})
        employees.push({salary: 153_020, department: 1})
        employees.push({salary: 103_122, department: 0})

        expect(employees.every((e) => e.salary > 99_999)).toBe(true)
        expect(employees.every((e) => e.salary > 199_999)).toBe(false)
    })

    it("'some' iterator works as expected", () => {
        const AliensV = vec({"height": "f32", "weight": "f32", "power": "f32"})
        const aliens = new AliensV()

        aliens.push({height: 8, weight: 200, power: 2})
        aliens.push({height: 11, weight: 187, power: 4})
        aliens.push({height: 10, weight: 200, power: 6})
        aliens.push({height: 13, weight: 203, power: 1})

        expect(aliens.some((alien) => alien.height > 12)).toBe(true)
        expect(aliens.some((alien) => alien.power === 4)).toBe(true)
        expect(aliens.some((alien) => alien.weight < 150)).toBe(false)
        expect(aliens.some((alien) => alien.height > 20)).toBe(false)
    })
})

describe("es6 iterators", () => {
    it("should be able to iterate over vec with 'for...of' syntax", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})

        const vec1 = new PositionV(5).fill({x: 1, y: 2, z: 3})
        expect(true).toBe(true)
        let iterCalled = 0
        for (const element of vec1) {
            iterCalled += 1
            expect(element).toEqual({x: 1, y: 2, z: 3})
        }
        expect(iterCalled).toBe(vec1.length)
    })

    it("'entries' iterator works as expected", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})

        const vec1 = new PositionV(5).fill({x: 1, y: 2, z: 3})
        expect(true).toBe(true)
        let iterCalled = 0
        for (const [index, element] of vec1.entries()) {
            expect(index).toBe(iterCalled)
            expect(element).toEqual({x: 1, y: 2, z: 3})
            iterCalled += 1
        }
        expect(iterCalled).toBe(vec1.length)
    })

    it("'values' iterator works as expected", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})

        const vec1 = new PositionV(5).fill({x: 1, y: 2, z: 3})
        expect(true).toBe(true)
        let iterCalled = 0
        for (const value of vec1.values()) {
            expect(value).toEqual({x: 1, y: 2, z: 3})
            iterCalled += 1
        }
        expect(iterCalled).toBe(vec1.length)
    })

    it("'keys' iterator works as expected", () => {
        const PositionV = vec({"x": "f32", "y": "f32", "z": "f32"})

        const vec1 = new PositionV(5).fill({x: 1, y: 2, z: 3})
        expect(true).toBe(true)
        let iterCalled = 0
        for (const key of vec1.keys()) {
            expect(key).toBe(iterCalled)
            iterCalled += 1
        }
        expect(iterCalled).toBe(vec1.length)
    })
})