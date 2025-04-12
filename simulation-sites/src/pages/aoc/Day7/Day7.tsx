import { Solution, runSolution } from '../common/SolutionRunner'
import { SolutionCard } from '../common/SolutionCard'
import testInput from './test-input.txt?raw'
import input from './input.txt?raw'

type Input = {
    target: number
    values: number[]
}[]

function validEquation(target: number, values: number[]): boolean {
    if (target == 0 && values.length == 0) return true
    if (values.length == 0 || target < 0 || target % 1 != 0) return false
    return validEquation(target - values[0], values.slice(1)) || validEquation(target / values[0], values.slice(1))
}
export function validEquation2(target: number, values: number[]): boolean {
    console.log(target, values)
    if (target == 0 && values.length == 0) return true
    if (values.length == 0 || target < 0 || target % 1 != 0) return false
    return validEquation2(target - values[0], values.slice(1))
        || validEquation2(target / values[0], values.slice(1))
    // TODO: How to make this faster?
        // || (values.length > 1 && validEquation2(target, [Number(values[1].toString() + values[0].toString()), ...values.slice(2)]))
}

const solution: Solution<Input, number> = {
    parseInput: (content: string): Input => {
        const lines = content.split('\n')
        return lines.map(line => {
            const [key, values] = line.split(': ')
            return {
                target: Number(key),
                values: values.split(' ').map(Number)
            }
        })
    },
    implementations: [
        {
            name: "Implementation 1",
            part1: (input: Input): number => {
                console.log(input[0])
                const solution = input.filter(equation => validEquation(equation.target, equation.values.reverse())).map(equation => equation.target).reduce((a, b) => a + b, 0)
                return solution
            },

            part2: (input: Input): number => {
                const solution = input.filter(equation => validEquation2(equation.target, equation.values.reverse())).map(equation => equation.target).reduce((a, b) => a + b, 0)
                return solution
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
            part1: 3749,
            part2: 11387,
        }
    }
};

export function Day7() {
    const results = runSolution(solution, input);

    return (
        <SolutionCard
            day={7}
            title="Day 7"
            implementations={results}
            githubUrl="https://github.com/jzeiders/simulation-site/blob/main/simulation-sites/src/pages/aoc/Day7/Day7.tsx"
        />
    );
} 