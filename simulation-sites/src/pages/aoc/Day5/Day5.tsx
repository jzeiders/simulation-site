import { Solution, runSolution } from '../common/SolutionRunner'
import { SolutionCard } from '../common/SolutionCard'
import testInput from './test-input.txt?raw'
import input from './input.txt?raw'
import { DAG } from '../common/Graph'

interface Input {
    orderings: [number, number][]
    tests: number[][];
}

function getInvalids(input: Input): number[][] {
    const results = []
    for (const test of input.tests) {
        const positions = new Map<number, number>()
        for (const [index, value] of test.entries()) {
            positions.set(value, index)
        }
        let valid = true
        for (const [first, second] of input.orderings) {
            if (positions.has(first) && positions.has(second)) {
                if (positions.get(first)! > positions.get(second)!) {
                    valid = false
                    break
                }
            }
        }
        if (!valid) {
            results.push(test)
        }
    }
    return results
}


const solution: Solution<Input, number> = {
    parseInput: (content: string): Input => {
        const [orderings, tests] = content.split("\n\n")
        return {
            orderings: orderings.split("\n").map(line => line.split("|").map(Number) as [number, number]),
            tests: tests.split("\n").map(line => line.split(",").map(Number))
        }
    },

    implementations: [
        {
            name: "Implementation 1",
            part1: (input: Input): number => {
                const results = []
                for (const test of input.tests) {
                    const positions = new Map<number, number>()
                    for (const [index, value] of test.entries()) {
                        positions.set(value, index)
                    }
                    let valid = true
                    for (const [first, second] of input.orderings) {
                        if (positions.has(first) && positions.has(second)) {
                            if (positions.get(first)! > positions.get(second)!) {
                                valid = false
                                break
                            }
                        }
                    }
                    if (valid) {
                        results.push(test[Math.floor(test.length / 2)])
                    }
                }
                return results.reduce((acc, curr) => acc + curr, 0)
            },

            part2: (input: Input): number => {
                const invalids = getInvalids(input)
                const results = []

                for (const test of invalids) {
                    const dag = new DAG<number>()
                    for (const ordering of input.orderings) {
                        if (test.includes(ordering[0]) && test.includes(ordering[1])) {
                            dag.addEdge(ordering[0], ordering[1])
                        }
                    }
                    const topologicalOrder = dag.topologicalSort()
                    console.log(topologicalOrder)
                    results.push(topologicalOrder[Math.floor(test.length / 2)])
                }
                return results.reduce((acc, curr) => acc + curr, 0)
            },

            explanation: {
                part1: "Explanation for part 1",
                part2: "Explanation for part 2"
            }
        }
    ],

    testCases: {
        input: testInput,
        expected: {
            part1: 143,
            part2: 123
        }
    }
};

export function Day5() {
    const results = runSolution(solution, input);

    return (
        <SolutionCard
            day={5}
            title="Day 5"
            implementations={results}
            githubUrl="https://github.com/jzeiders/simulation-site/blob/main/simulation-sites/src/pages/aoc/Day5/Day5.tsx"
        />
    );
} 