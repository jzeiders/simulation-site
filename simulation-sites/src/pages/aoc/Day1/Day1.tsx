import day1Input from './input.txt?raw'
import { Solution, runSolution } from '../common/SolutionRunner'
import { SolutionCard } from '../common/SolutionCard'

interface NumberPair {
    left: number;
    right: number;
}

const solution: Solution<NumberPair[], number> = {
    parseInput: (content: string): NumberPair[] => {
        return content
            .trim()
            .split('\n')
            .map(line => {
                const [left, right] = line.trim().split(/\s+/).map(Number);
                return { left, right };
            });
    },

    part1: (pairs: NumberPair[]): number => {
        const sortedLeft = pairs.map(p => p.left).sort((a, b) => a - b);
        const sortedRight = pairs.map(p => p.right).sort((a, b) => a - b);

        return sortedLeft.reduce((sum, val, index) => {
            return sum + Math.abs(val - sortedRight[index]);
        }, 0);
    },

    part2: (pairs: NumberPair[]): number => {
        const valueCounts = new Map<number, number>();
        for (const pair of pairs) {
            valueCounts.set(pair.right, (valueCounts.get(pair.right) || 0) + 1);
        }

        return pairs.reduce((sum, pair) => {
            return sum + pair.left * (valueCounts.get(pair.left) || 0);
        }, 0);
    },

    explanation: {
        part1: "The first part involves finding the minimum total distance between two arrays after optimally pairing their elements. The optimal solution pairs the smallest number from one array with the smallest from the other.",
        steps: [
            "Sort both arrays in ascending order",
            "Pair elements at the same indices",
            "Calculate the sum of absolute differences between pairs",
            "For each number in the left array, multiply it by its count in the right array",
            "Sum all these products for the final result"
        ]
    }
};

export function Day1() {
    const { part1, part2 } = runSolution(solution, day1Input);

    return (
        <SolutionCard
            day={1}
            title="Array Distance Calculator"
            part1={part1}
            part2={part2}
            explanation={solution.explanation}
        />
    );
}

