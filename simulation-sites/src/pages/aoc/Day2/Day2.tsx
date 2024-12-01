import { Solution, runSolution } from '../common/SolutionRunner'
import { SolutionCard } from '../common/SolutionCard'

const solution: Solution<any, number> = {
    parseInput: (content: string): any => {
        // TODO: Implement parsing logic
        return [];
    },

    part1: (input: any): number => {
        // TODO: Implement part 1
        return 0;
    },

    part2: (input: any): number => {
        // TODO: Implement part 2
        return 0;
    },

    explanation: {
        part1: "Coming soon...",
        steps: [
            "Step 1 placeholder",
            "Step 2 placeholder"
        ]
    },

    testCases: {
        input: "",
        expected: {
            part1: 0,
            part2: 0
        }
    }
};

export function Day2() {
    const { part1, part2 } = runSolution(solution, "");

    return (
        <SolutionCard
            day={2}
            title="Day 2 Placeholder"
            part1={part1}
            part2={part2}
            explanation={solution.explanation}
        />
    );
} 