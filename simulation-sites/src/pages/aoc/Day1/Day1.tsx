import day1Input from './input.txt?raw'
interface NumberPair {
    left: number;
    right: number;
}

interface ProcessedResult {
    sortedLeft: number[];
    sortedRight: number[];
    totalDistance: number;
}

// Function to parse the content into pairs of numbers
function parseContent(content: string): NumberPair[] {
    return content
        .trim()
        .split('\n')
        .map(line => {
            const [left, right] = line.trim().split(/\s+/).map(Number);
            return { left, right };
        });
}

// Function to sort arrays and calculate absolute distance sum
function calculateDistanceSum(pairs: NumberPair[]): ProcessedResult {
    const sortedLeft = pairs.map(p => p.left).sort((a, b) => a - b);
    const sortedRight = pairs.map(p => p.right).sort((a, b) => a - b);

    const totalDistance = sortedLeft.reduce((sum, val, index) => {
        return sum + Math.abs(val - sortedRight[index]);
    }, 0);

    return {
        sortedLeft,
        sortedRight,
        totalDistance
    };
}

function calculatePart2(pairs: NumberPair[]) {
    const valueCounts = new Map<number, number>()

    for (const pair of pairs) {
        valueCounts.set(pair.right, (valueCounts.get(pair.right) || 0) + 1)
    }

    let value = 0;
    for (const pair of pairs) {
        value += pair.left * (valueCounts.get(pair.left) || 0)
    }

    return value
}


export function getDay1Answer() {
    const data = parseContent(day1Input)
    const result = calculateDistanceSum(data)

    return {
        part1: result.totalDistance,
        part2: calculatePart2(data)
    }
}

