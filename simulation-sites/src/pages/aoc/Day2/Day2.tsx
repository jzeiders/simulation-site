import { Solution, runSolution } from '../common/SolutionRunner'
import { SolutionCard } from '../common/SolutionCard'
import testInput from './test-input.txt?raw'
import input from './input.txt?raw'

function validLevel(level: number[]): boolean {
    const differences = level.slice(1).map((n, i) => n - level[i])
    const direction = differences[0] > 0 ? 'asc' : 'desc'
    if (!differences.every(d => Math.abs(d) <= 3 && d !== 0)) return false
    if (direction === 'asc') {
        return differences.every(d => d > 0)
    } else {
        return differences.every(d => d < 0)
    }
}
function allSubsetsMinusOne(level: number[]): number[][] {
    return level.map((_, i) => level.slice(0, i).concat(level.slice(i + 1)))
}

const solution: Solution<number[][], number> = {
    parseInput: (content: string): number[][] => {
        return content
            .trim()
            .split('\n')
            .map(line =>
                line.trim()
                    .split(/\s+/)
                    .map(Number)
            )
    },

    part1: (input: number[][]): number => {
        console.log(input)
        return input.filter(validLevel).length
    },

    part2: (input: number[][]): number => {
        return input.map(allSubsetsMinusOne).map((xs) => xs.some(validLevel)).filter(Boolean).length
    },

    explanation: {
        part1: "This one is super simple, just get a set of the distances and run the requirement checks on them.",
        part2: "Brute forcing the problem is feasible given the small input size, so we just check all subsets of the input minus one and see if any of them are valid."
    },

    testCases: {
        input: testInput,
        expected: {
            part1: 2,
            part2: 4
        }
    }
};

export function Day2() {
    const { part1, part2 } = runSolution(solution, input);

    return (
        <SolutionCard
            day={2}
            title="Red-Nosed Reports"
            part1={part1}
            part2={part2}
            explanation={solution.explanation}
        />
    );
} 