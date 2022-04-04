export class Benchmark {
    WARM_UP_RUNS = 4
    numberOfRuns = 100 + this.WARM_UP_RUNS
    names = {}
    tests = []
    
    add(name, callback) {
        this.tests.push({name, callback})
        return this
    }
    
    setNumberOfIterations(number) {
        if (number < 0) {
            throw new Error(`number of iterations cannot be < 0`)
        }
        this.numberOfRuns = number + this.WARM_UP_RUNS
        return this
    }

    async run() {
        const results = {}

        this.tests.forEach(({name}) => {
            results[name] = {deltas: [], avg: 0}
        })

        console.info("starting warmup, please wait a moment...")

        for (let iter = 0; iter < this.numberOfRuns; iter += 1) {
            if (iter === this.WARM_UP_RUNS) {
                console.info("warmup finished. commencing tests\n")
            }
            for (let i = 0; i < this.tests.length; i++) {
                const {name, callback} = this.tests[i]
                const t1 = Date.now()
                await callback()
                const t2 = Date.now()
                const delta = t2 - t1
                results[name].deltas.push(delta)
                if (iter >= this.WARM_UP_RUNS) {
                    console.info(`[iteration ${(iter + 1) - this.WARM_UP_RUNS}]:"${name}" took ${delta} ms`)
                }
            }
            if (iter >= this.WARM_UP_RUNS) { console.log("\n") }
        }

        console.log("\n")

        Object.keys(results).forEach((testName) => {
            const value = results[testName]
            const sum = value.deltas.slice(this.WARM_UP_RUNS).reduce((total, res) => {
                return total + res
            })
            const totalRuns = this.numberOfRuns - this.WARM_UP_RUNS
            value.avg = sum / totalRuns
            value.stdDeviation = value.deltas
                .slice(this.WARM_UP_RUNS)
                .map((delta) => Math.pow(delta - value.avg, 2))
                .reduce((total, squaredDiff) => total + squaredDiff, 0)
            value.stdDeviation = Math.sqrt(value.stdDeviation / totalRuns)
            console.info(`"${testName}" took an average of ${value.avg.toFixed(2)} ms ±${value.stdDeviation.toFixed(2)} (${this.numberOfRuns - this.WARM_UP_RUNS} runs)`)
        })

        return results
    }
}