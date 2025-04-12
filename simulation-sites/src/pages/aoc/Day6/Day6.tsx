import { Solution, runSolution } from '../common/SolutionRunner'
import { SolutionCard } from '../common/SolutionCard'
import testInput from './test-input.txt?raw'
import input from './input.txt?raw'

interface Point {
    x: number;
    y: number;
}
function hashPoint(point: Point): string {
    return `${point.x},${point.y}`;
}
interface GuardPoint extends Point {
    dir: Direction;
}
type Direction = 'N' | 'E' | 'S' | 'W';
function rotateGuard(guard: GuardPoint): GuardPoint {
    switch (guard.dir) {
        case 'N': return { ...guard, dir: 'E' };
        case 'E': return { ...guard, dir: 'S' };
        case 'S': return { ...guard, dir: 'W' };
        case 'W': return { ...guard, dir: 'N' };
    }
}
interface Day6Input {
    width: number;
    height: number;
    blocks: Point[];
    guard: GuardPoint;
}
function nextPoint(point: Point, dir: Direction): Point {
    switch (dir) {
        case 'N': return { x: point.x, y: point.y - 1 };
        case 'E': return { x: point.x + 1, y: point.y };
        case 'S': return { x: point.x, y: point.y + 1 };
        case 'W': return { x: point.x - 1, y: point.y };
    }
}
function moveGuard(guard: GuardPoint, dir: Direction, blocks: Point[]): GuardPoint {
    const next = nextPoint(guard, dir);
    if (blocks.some(b => b.x === next.x && b.y === next.y)) {
        return rotateGuard(guard);
    }
    return { ...next, dir: guard.dir };
}

function moveGuardQuick(guard: GuardPoint, dir: Direction, blocks: Point[]): GuardPoint {
    const next = nextPoint(guard, dir);
    if (blocks.some(b => b.x === next.x && b.y === next.y)) {
        return rotateGuard(guard);
    }
    return { ...next, dir: guard.dir };
}



function cycleCheck(guard: GuardPoint, blocks: Point[], width: number, height: number): boolean {
    const visitedPoints = new Set<string>();
    while(guard.x >= 0 && guard.y >= 0 && guard.x < width && guard.y < height) {
        const pointKey = `${guard.x},${guard.y},${guard.dir}`;
        if(visitedPoints.has(pointKey)) {
            return true;
        }
        visitedPoints.add(pointKey);
        guard = moveGuard(guard, guard.dir, blocks);
    }
    return false;
}

const solution: Solution<Day6Input, number> = {
    parseInput: (content: string): Day6Input => {
        const lines = content.split('\n');
        const width = lines[0].length;
        const height = lines.length;
        const blocks = [];
        let guard: GuardPoint | null = null;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (lines[y][x] === '#') blocks.push({ x, y });
                if (lines[y][x] === '^') guard = { x, y, dir: 'N' };
            }
        }
        // if (!guard) throw new Error('No guard found');
        return { width, height, blocks, guard };
    },

    implementations: [
        {
            name: "Implementation 1",
            part1: (input: Day6Input): number => {
                let guard = input.guard;
                let visitedPoints = new Set<string>();
                while(guard.x >= 0 && guard.y >= 0 && guard.x < input.width && guard.y < input.height) {
                    const pointKey = `${guard.x},${guard.y}`;
                    visitedPoints.add(pointKey);
                    guard = moveGuard(guard, guard.dir, input.blocks);
                }
                return visitedPoints.size;
            },

            part2: (input: Day6Input): number => {
                let cyclePositions = 0;
                for(let x = 0; x < input.width; x++) {
                    for(let y = 0; y < input.height; y++) {
                        if(input.guard.x == x && input.guard.y == y) continue;
                        const newBlocks = [...input.blocks, { x, y }];
                        if(cycleCheck(input.guard, newBlocks, input.width, input.height)) {
                            cyclePositions++;
                        }
                    }
                }
                return cyclePositions;
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
            part1: 41,
            part2: 6
        }
    }
};

export function Day6() {
    const results = runSolution(solution, input, true);

    return (
        <SolutionCard
            day={6}
            title="Guard Gallivant"
            implementations={results}
            
            githubUrl="https://github.com/jzeiders/simulation-site/blob/main/simulation-sites/src/pages/aoc/Day6/Day6.tsx"
        />
    );
} 