import { Solution, runSolution } from '../common/SolutionRunner'
import { SolutionCard } from '../common/SolutionCard'
import testInput from './test-input.txt?raw'
import input from './input.txt?raw'

type StateIdx = "none" | 'm' | 'u' | 'l' | '(' | "first" | "," | "second" | ")"
interface State {
    idx: StateIdx
    first: string;
    second: string;
    value: number;
}

function nextState(state: State, char: string): State {
    if (state.idx === "none") {
        if (char === "m") return { ...state, idx: "m" }
    }
    if (state.idx === "m") {
        if (char === "u") return { ...state, idx: "u" }
    }
    if (state.idx === "u") {
        if (char === "l") return { ...state, idx: "l" }
    }
    if (state.idx === "l") {
        if (char === "(") return { ...state, idx: "(" }
    }
    if (state.idx === "(") {
        if (Number.isInteger(parseInt(char))) return { ...state, idx: "first", first: char }
    }
    if (state.idx === "first") {
        if (char === ',') {
            return { ...state, idx: "," }
        }
        if (Number.isInteger(parseInt(char))) return { ...state, idx: "first", first: state.first + char }
    }
    if (state.idx === ",") {
        if (Number.isInteger(parseInt(char))) return { ...state, idx: "second", second: char }
    }
    if (state.idx === "second") {
        if (char === ")") {
            return { ...state, idx: "none", value: parseInt(state.first) * parseInt(state.second) + state.value }
        }
        if (Number.isInteger(parseInt(char))) return { ...state, idx: "second", second: state.second + char }
    }
    return { ...state, idx: "none" }
}

interface State2 {
    idx: StateIdx | "d" | "do" | "do(" | "don" | "don'" | "don't" | "don't("
    value: number;
    first: string;
    second: string;
    enabled: boolean;
}

function nextStatePart2(state: State2, char: string): State2 {
    if (state.idx === "none") {
        if (char === "m") return { ...state, idx: "m" }
        if (char === "d") return { ...state, idx: "d" }
    }
    if (state.idx === "d") {
        if (char === "o") return { ...state, idx: "do" }
    }
    if (state.idx === "do") {
        if (char === "(") return { ...state, idx: "do(" }
        if (char === "n") return { ...state, idx: "don" }
    }
    if (state.idx === "don") {
        if (char === "'") return { ...state, idx: "don'" }
    }
    if (state.idx === "don'") {
        if (char === "t") return { ...state, idx: "don't" }
    }
    if (state.idx === "don't") {
        if (char === "(") return { ...state, idx: "don't(" }
    }
    if (state.idx === "do(") {
        if (char === ")") return { ...state, idx: "none", enabled: true }
    }
    if (state.idx === "don't(") {
        if (char === ")") return { ...state, idx: "none", enabled: false }
    }

    if (state.enabled) {
        if (state.idx === "m") {
            if (char === "u") return { ...state, idx: "u" }
        }
        if (state.idx === "u") {
            if (char === "l") return { ...state, idx: "l" }
        }
        if (state.idx === "l") {
            if (char === "(") return { ...state, idx: "(" }
        }
        if (state.idx === "(") {
            if (Number.isInteger(parseInt(char))) return { ...state, idx: "first", first: char }
        }
        if (state.idx === "first") {
            if (char === ',') {
                return { ...state, idx: "," }
            }
            if (Number.isInteger(parseInt(char))) return { ...state, idx: "first", first: state.first + char }
        }
        if (state.idx === ",") {
            if (Number.isInteger(parseInt(char))) return { ...state, idx: "second", second: char }
        }
        if (state.idx === "second") {
            if (char === ")") {
                return { ...state, idx: "none", value: parseInt(state.first) * parseInt(state.second) + state.value }
            }
            if (Number.isInteger(parseInt(char))) return { ...state, idx: "second", second: state.second + char }
        }
    }
    return { ...state, idx: "none" }
}

const solution: Solution<string, number> = {
    parseInput: (content: string): string => content,

    implementations: [
        {
            name: "State Machine",
            part1: (input: string): number => {
                let state: State = { idx: "none", first: "", second: "", value: 0 }
                for (const char of input) {
                    state = nextState(state, char)
                }
                return state.value
            },

            part2: (input: string): number => {
                let state: State2 = { idx: "none", value: 0, first: "", second: "", enabled: true }
                for (const char of input) {
                    state = nextStatePart2(state, char)
                }
                return state.value
            },

            explanation: {
                part1: "Just a little state machine. The excessive switch cases were a little buggy but simple enough to work.",
                part2: "Same as part 1 but with a little more state. The state machine is a little more complex but it works."
            }
        },
        {
            name: "Regex",
            part1: (input: string): number => {
                const matches = input.match(/mul\((\d{1,3}),(\d{1,3})\)/g) || []
                
                return matches.reduce((sum, match) => {
                    const [num1, num2] = match
                        .replace('mul(', '')
                        .replace(')', '')
                        .split(',')
                        .map(Number)
                    return sum + (num1 * num2)
                }, 0)
            },

            part2: (input: string): number => {
                let sum = 0
                let enabled = true
                
                // Split the input into chunks whenever we see do() or don't()
                const chunks = input.split(/(do\(\)|don't\(\))/)
                
                for (const chunk of chunks) {
                    if (chunk === 'do()') {
                        enabled = true
                        continue
                    }
                    if (chunk === "don't()") {
                        enabled = false
                        continue
                    }
                    
                    if (enabled) {
                        const matches = chunk.match(/mul\((\d{1,3}),(\d{1,3})\)/g) || []
                        for (const match of matches) {
                            const [num1, num2] = match
                                .replace('mul(', '')
                                .replace(')', '')
                                .split(',')
                                .map(Number)
                            sum += num1 * num2
                        }
                    }
                }
                
                return sum
            },

            explanation: {
                part1: "Use regex to find all valid mul(X,Y) patterns and sum their products",
                part2: "Split on control statements and only process multiplication when enabled"
            }
        }
    ],

    testCases: {
        input: testInput,
        expected: {
            part1: 161,
            part2: 48
        }
    }
};

export function Day3() {
    const results = runSolution(solution, input);

    return (
        <SolutionCard
            day={3}
            title="Mul it Over"
            implementations={results}
        />
    );
} 