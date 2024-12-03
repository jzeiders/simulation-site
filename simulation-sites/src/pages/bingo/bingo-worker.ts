// import { Distribution, makeDistribution } from '@/components/Distribution'
import { Distribution, makeDistribution } from '@/components/Distribution';
import { cacheable } from '@/lib/Cache'
import { shuffle, uniqBy } from 'es-toolkit'

// Copy all the core bingo interfaces and functions here
interface BingoCard {
    numbers: number[];
}

interface BingoGame {
    cards: BingoCard[];
    numbers: number[];
}

interface SimulationOptions {
    checkCorners: boolean;
    useFreeSpace: boolean;
}

// Copy other type definitions and helper functions...
// (Include all the functions from the original file that don't depend on React/UI)



// Add message handling
// self.onmessage = async (e: MessageEvent) => {
//     console.log("Worker received message", e.data)
//     const { type, payload } = e.data;

//     switch (type) {
//         case 'RUN_SIMULATION':
//             const { numGames, numPlayers } = payload;
//             const simulation = makeSimulation(numGames, numPlayers);
//             self.postMessage({ type: 'SIMULATION_COMPLETE', payload: simulation });
//             break;

//         case 'ANALYZE_SIMULATION':
//             const { simulation: simToAnalyze, options } = payload;
//             const analysis = {
//                 winningTurnDistribution: getWinningTurnDistribution(simToAnalyze, {
//                     checkCorners: false,
//                     useFreeSpace: false
//                 }),
//                 withFreeSpace: getWinningTurnDistribution(simToAnalyze, {
//                     checkCorners: false,
//                     useFreeSpace: true
//                 }),
//                 withFreeSpaceAndCorners: getWinningTurnDistribution(simToAnalyze, {
//                     checkCorners: true,
//                     useFreeSpace: true
//                 }),
//                 turnsUntilNextWinner: getTurnsUntilNextWinnerDistribution(simToAnalyze, options),
//                 heatMapData: generateHeatMapData(simToAnalyze, options)
//             };
//             self.postMessage({ type: 'ANALYSIS_COMPLETE', payload: analysis });
//             break;
//     }
// };

// Bingo Simulation Data
export interface BingoSimulation {
    games: BingoGame[];
    playerCount: number;
}
export function getNumGames(simulation: BingoSimulation): number {
    return simulation.games.length;
}
export function getNumPlayers(simulation: BingoSimulation): number {
    return simulation.playerCount;
}

interface AnalysisOptions {
    checkCorners: boolean;
    useFreeSpace: boolean;
}



// The core bingo logic
interface BingoCard {
    numbers: number[];
}
interface BingoGame {
    cards: BingoCard[];
    numbers: number[];
}


export const makeSimulation = function makeSimulation(numGames: number, numPlayers: number): BingoSimulation {
    return {
        games: Array.from({ length: numGames }, () => makeBingoGame(numPlayers)),
        playerCount: numPlayers
    }
}

export function makeBingoCard(): BingoCard {
    let card: number[] = []
    for (let i = 0; i < 5; i++) {
        card = card.concat(
            shuffle(Array.from({ length: 15 }, (_, j) => i * 15 + j + 1))
                .slice(0, 5)
        )
    }
    // Transpose the card
    const transposedCard: number[][] = Array.from({ length: 5 }, (_, i) => card.filter((_, j) => j % 5 === i))
    return { numbers: transposedCard.flat() }
}

// Modify makeBingoGame to accept random function
export function makeBingoGame(numPlayers: number): BingoGame {
    return {
        cards: Array.from({ length: numPlayers }, () => makeBingoCard()),
        numbers: shuffle(Array.from({ length: 75 }, (_, i) => i + 1))
    }
}


// Bingo Simulation Analysis
const getWinningTurnDistribution = cacheable()(function getWinningTurnDistribution(simulation: BingoSimulation, options: AnalysisOptions): Distribution {
    const winningTurnsByGame = simulation.games.map(game => getFirstWinningTurn(game, options))
    return makeDistribution(winningTurnsByGame)
});


interface WinTypeRow {
    type: 'row'
    row: number
}
interface WinTypeCol {
    type: 'col'
    col: number
}
interface WinTypeDiagonal {
    type: 'diagonal'
    direction: 'left' | 'right'
}
interface WinTypeFourCorners {
    type: 'fourCorners'
}
type WinType = WinTypeRow | WinTypeCol | WinTypeDiagonal | WinTypeFourCorners


// This returns an array of all the win types for a given card and drawn numbers
function getWinTypes(
    card: BingoCard,
    drawnNumbers: number[],
    options: AnalysisOptions
): WinType[] {
    const size = 5;
    const marked = new Array(25).fill(false);
    const centerIndex = 12; // Index of center space (0-based)

    // Mark drawn numbers
    for (let i = 0; i < drawnNumbers.length; i++) {
        const index = card.numbers.indexOf(drawnNumbers[i])
        if (index !== -1) {
            marked[index] = true
        }
    }

    // Handle free space
    if (options.useFreeSpace) {
        marked[centerIndex] = true
    }

    const winTypes: WinType[] = []

    // Check rows
    for (let row = 0; row < size; row++) {
        if (marked.slice(row * size, (row + 1) * size).every(Boolean)) {
            winTypes.push({ type: 'row', row })
        }
    }

    // Check columns
    for (let col = 0; col < size; col++) {
        if (marked.filter((_, i) => i % size === col).every(Boolean)) {
            winTypes.push({ type: 'col', col })
        }
    }

    // Check diagonals
    const leftDiagonal = Array.from({ length: size }, (_, i) => marked[i * size + i]).every(Boolean)
    const rightDiagonal = Array.from({ length: size }, (_, i) => marked[i * size + (size - 1 - i)]).every(Boolean)

    if (leftDiagonal) {
        winTypes.push({ type: 'diagonal', direction: 'left' })
    }
    if (rightDiagonal) {
        winTypes.push({ type: 'diagonal', direction: 'right' })
    }

    // Check four corners if enabled
    if (options.checkCorners) {
        if (marked[0] && marked[4] && marked[20] && marked[24]) {
            winTypes.push({ type: 'fourCorners' })
        }
    }

    return winTypes
}


const getTurnsUntilNextWinnerDistribution = cacheable()(function getTurnsUntilNextWinnerDistribution(simulation: BingoSimulation, options: SimulationOptions): Distribution {
    const turnDifferences = simulation.games.map(game => {
        const firstWinTurn = getFirstWinningTurn(game, options);
        const nextWinTurn = getNextWinningTurn(game, options);
        return nextWinTurn - firstWinTurn;
    });

    return makeDistribution(turnDifferences);
});

// Add these interfaces near the other interfaces
interface TilePosition {
    row: number;
    col: number;
}

// Add this function near getWinTypes
function getWinningTileIndices(winType: WinType): TilePosition[] {
    switch (winType.type) {
        case 'row':
            return Array.from({ length: 5 }, (_, col) => ({
                row: winType.row,
                col
            }));
        case 'col':
            return Array.from({ length: 5 }, (_, row) => ({
                row,
                col: winType.col
            }));
        case 'diagonal':
            return Array.from({ length: 5 }, (_, i) => ({
                row: i,
                col: winType.direction === 'left' ? i : 4 - i
            }));
        case 'fourCorners':
            return [
                { row: 0, col: 0 },
                { row: 0, col: 4 },
                { row: 4, col: 0 },
                { row: 4, col: 4 }
            ];
    }
}

const generateHeatMapData = cacheable()(function generateHeatMapData(simulation: BingoSimulation, options: SimulationOptions): HeatMapData {
    const tileFrequency = new Array(25).fill(0);
    let totalWins = 0;

    const winTypeMap = new Map<string, number>()


    simulation.games.forEach(game => {
        const firstWinTurn = getFirstWinningTurn(game, options);

        // Get the winning card and its numbers at the winning turn
        const winningCard = getFirstWinnerCard(game, options);
        const drawnNumbers = game.numbers.slice(0, firstWinTurn);
        const winTypes = getWinTypes(winningCard, drawnNumbers, options);

        // For each win type, increment the frequency of the winning tiles
        winTypes.forEach(winType => {
            const indices = uniqBy(getWinningTileIndices(winType), ({ row, col }) => row * 5 + col)
            indices.forEach(({ row, col }) => {
                tileFrequency[row * 5 + col]++;
            });
            totalWins++;
        });
    });

    console.log(winTypeMap)

    // Convert to the required format
    const maxFrequency = Math.max(...tileFrequency);
    const tiles = tileFrequency.map((frequency, index) => ({
        row: Math.floor(index / 5),
        col: index % 5,
        frequency: frequency / totalWins
    }));
    console.log(tiles)

    return {
        tiles,
        maxFrequency: maxFrequency / totalWins
    };
});

// This function returns an array of the number of turns it took for each player to win
const getWinningTurnsForGame = cacheable()(function getWinningTurnsForGame(game: BingoGame, options: AnalysisOptions): number[] {
    const winningTurns = game.cards.map(() => 76)

    for (let i = 0; i < game.numbers.length; i++) {
        for (let playerIndex = 0; playerIndex < game.cards.length; playerIndex++) {
            if (winningTurns[playerIndex] <= i) {
                continue
            }
            const winTypes = getWinTypes(game.cards[playerIndex], game.numbers.slice(0, i + 1), options)
            if (winTypes.length > 0) {
                winningTurns[playerIndex] = Math.min(winningTurns[playerIndex], i + 1)
            }
        }
    }

    return winningTurns
});

const getFirstWinningTurn = cacheable()(function getFirstWinningTurn(game: BingoGame, options: AnalysisOptions): number {
    const winningTurns = getWinningTurnsForGame(game, options)
    return Math.min(...winningTurns)
});

const getFirstWinnerCard = cacheable()(function getFirstWinnerCard(game: BingoGame, options: AnalysisOptions): BingoCard {
    const firstWinTurn = getFirstWinningTurn(game, options)
    const winningTurns = getWinningTurnsForGame(game, options)
    return game.cards[winningTurns.indexOf(firstWinTurn)]
});

const getNextWinningTurn = cacheable()(function getNextWinningTurn(game: BingoGame, options: AnalysisOptions): number {
    const winningTurns = getWinningTurnsForGame(game, options)
    const firstWinTurn = Math.min(...winningTurns)
    return Math.min(...winningTurns.filter(turn => turn > firstWinTurn))
});



// Add these interfaces near the other interfaces
interface TilePosition {
    row: number;
    col: number;
}


// Add to exports
export { getWinTypes, getWinningTileIndices }

// Add near the top with other interfaces
interface HeatMapData {
    tiles: {
        row: number;
        col: number;
        frequency: number;
    }[];
    maxFrequency: number;
}

// Add near other exports
export type { HeatMapData }

// Add this function to expose analysis functionality
export async function analyzeSimulation(simulation: BingoSimulation, options: SimulationOptions) {
    return {
        winningTurnDistribution: getWinningTurnDistribution(simulation, options),
        withFreeSpace: getWinningTurnDistribution(simulation, {
            ...options,
            useFreeSpace: true
        }),
        withFreeSpaceAndCorners: getWinningTurnDistribution(simulation, {
            checkCorners: true,
            useFreeSpace: true
        }),
        turnsUntilNextWinner: getTurnsUntilNextWinnerDistribution(simulation, options),
        heatMapData: generateHeatMapData(simulation, options)
    };
}