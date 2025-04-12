import { Solution, runSolution } from '../common/SolutionRunner'
import { SolutionCard } from '../common/SolutionCard'
import testInput from './test-input.txt?raw'
import input from './input.txt?raw'
import { addPoints, Grid, multiplyPoint, negatePoint, Point, subtractPoints } from '../common/Grid'

type Input = string[][]

export const solution: Solution<Input, number> = {
    parseInput: (content: string): Input => content.split('\n').map(line => line.split('')),

    implementations: [
        {
            name: "Implementation 1",
            part1: (input: Input): number => {
                const antennaMap = new Map<Point, string>()    
                const grid = new Grid(input)
                for (const cell of grid.cells()) {
                    if(cell.value !== '.') {
                        antennaMap.set(cell.point, cell.value)
                    }
                }
                console.log(antennaMap)
                const matchingPoints = new Set<Point>()
                for (const cell of grid.cells()) {
                    for (const antenna of antennaMap.entries()) {
                        const opposite = addPoints(subtractPoints(cell.point, antenna[0]), antenna[0])
                        if(antennaMap.has(opposite) && antennaMap.get(opposite) === antenna[1]) {
                            matchingPoints.add(cell.point)
                        }
                    }
                }
                return matchingPoints.size
            },

            part2: (input: Input): number => {
                return 0
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
            part1: 14,
            part2: 0
        }
    }
};

export function Day8() {
    const results = runSolution(solution, input);

    return (
        <SolutionCard
            day={8}
            title="Day 8"
            implementations={results}
            githubUrl="https://github.com/jzeiders/simulation-site/blob/main/simulation-sites/src/pages/aoc/Day8/Day8.tsx"
        />
    );
} 