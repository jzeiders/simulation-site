import { Solution, runSolution } from '../common/SolutionRunner'
import { SolutionCard } from '../common/SolutionCard'
import testInput from './test-input.txt?raw'
import input from './input.txt?raw'

type Dir = "U" | "D" | "L" | "R" | "UL" | "UR" | "DL" | "DR"
const DIRS: Dir[] = ["U", "D", "L", "R", "UL", "UR", "DL", "DR"]
type Point = { x: number, y: number }
function move(point: Point, dir: Dir): Point {
    switch (dir) {
        case "U": return { x: point.x, y: point.y - 1 }
        case "D": return { x: point.x, y: point.y + 1 }
        case "L": return { x: point.x - 1, y: point.y }
        case "R": return { x: point.x + 1, y: point.y }
        case "UL": return { x: point.x - 1, y: point.y - 1 }
        case "UR": return { x: point.x + 1, y: point.y - 1 }
        case "DL": return { x: point.x - 1, y: point.y + 1 }
        case "DR": return { x: point.x + 1, y: point.y + 1 }
    }
}
function checkPoint(dir: Dir, chars: string[], point: Point, board: string[][]): boolean {
    if(chars.length === 0) return true
    if(point.x < 0 || point.x >= board[0].length || point.y < 0 || point.y >= board.length) return false
    if(board[point.y][point.x] !== chars[0]) return false
    const nextPoint = move(point, dir)
    return checkPoint(dir, chars.slice(1), nextPoint, board)
}




const solution: Solution<string[][], number> = {
    parseInput: (content: string): string[][] => content.split("\n").map(line => line.split("")),

    implementations: [
        {
            name: "Implementation 1",
            part1: (input: string[][]): number => {
                let count = 0
                for(let i = 0; i < input.length; i++) {
                    for(let j = 0; j < input[i].length; j++) {
                        for(const dir of DIRS) {
                            if(checkPoint(dir, ['X','M', 'A', 'S'], { x: j, y: i }, input)) {
                                count++
                            }
                        }
                    }
                }
                return count
            },

            part2: (input: string[][]): number => {
                const leftMarks: boolean[][] = Array.from({ length: input.length }, () => Array(input[0].length).fill(false))
                const rightMarks: boolean[][] = Array.from({ length: input.length }, () => Array(input[0].length).fill(false))
                for(let i = 0; i < input.length; i++) {
                    for(let j = 0; j < input[i].length; j++) {
                        if(checkPoint("UR", ['M', 'A', 'S'], { x: j, y: i }, input) || checkPoint("UR", ['S', 'A', 'M'], { x: j, y: i }, input)) {
                            const point = move({ x: j, y: i }, "UR")
                            rightMarks[point.y][point.x] = true
                        }
                        if(checkPoint("UL", ['M', 'A', 'S'], { x: j, y: i }, input) || checkPoint("UL", ['S', 'A', 'M'], { x: j, y: i }, input)) {
                            const point = move({ x: j, y: i }, "UL")
                            leftMarks[point.y][point.x] = true
                        }
                    }
                }
                let count = 0;
                for(let i = 0; i < input.length; i++) {
                    for(let j = 0; j < input[i].length; j++) {
                        if(leftMarks[i][j] && rightMarks[i][j]) {
                            count++
                        }
                    }
                }
                return count
            },

            explanation: {
                part1: "Made a little recursive function to search for a pattern in a direction. Then just checked every point in the board.",
                part2: "Made two boards to mark the points that can see the pattern from the left and right. Then just counted the points that are marked on both boards."
            }
        }
    ],

    testCases: {
        input: testInput,
        expected: {
            part1: 18,
            part2: 9
        }
    }
};

export function Day4() {
    const results = runSolution(solution, input);

    return (
        <SolutionCard
            day={4}
            title="Ceres Search"
            implementations={results}
            githubUrl="https://github.com/jzeiders/simulation-site/blob/main/simulation-sites/src/pages/aoc/Day4/Day4.tsx"
        />
    );
} 