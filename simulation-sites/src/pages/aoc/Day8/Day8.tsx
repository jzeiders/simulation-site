import { Solution, runSolution } from '../common/SolutionRunner'
import { SolutionCard } from '../common/SolutionCard'
import testInput from './test-input.txt?raw'
import input from './input.txt?raw'

const solution: Solution<string, number> = {
    parseInput: (content: string): string => content,

    implementations: [
        {
            name: "Implementation 1",
            part1: (_input: string): number => {
                return 0
            },

            part2: (_input: string): number => {
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
            part1: 0,
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