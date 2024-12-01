'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from "@/lib/utils"

interface SimulationResult {
    avgTurns: number;
    minTurns: number;
    maxTurns: number;
    distribution: { turns: number; frequency: number }[];
    heatMap: HeatMapData;
    avgTurnsToSecond: number;
    turnDifferenceDistribution: { difference: number; frequency: number }[];
}

interface WinningTile {
    row: number;
    col: number;
    frequency: number;
}

interface HeatMapData {
    tiles: WinningTile[];
    maxFrequency: number;
}

interface SimulationOptions {
    checkCorners: boolean;
    useFreeSpace: boolean;
}

function BingoHeatMap({ heatMap }: { heatMap: HeatMapData }) {
    return (
        <div className="grid grid-cols-5 gap-1 w-full max-w-md mx-auto">
            {heatMap.tiles.map((tile, i) => (
                <div
                    key={i}
                    className={cn(
                        "aspect-square flex items-center justify-center rounded-md text-sm font-medium",
                        "border border-gray-200"
                    )}
                    style={{
                        backgroundColor: `rgba(136, 132, 216, ${tile.frequency / heatMap.maxFrequency})`
                    }}
                >
                    <span className="text-black">
                        {((tile.frequency / heatMap.maxFrequency) * 100).toFixed(1)}%
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function BingoSimulatorBlog() {
    const [numGames, setNumGames] = useState(10000)
    const [numPlayers, setNumPlayers] = useState(10)
    const [options, setOptions] = useState<SimulationOptions>({
        checkCorners: true,
        useFreeSpace: true
    })
    const [result, setResult] = useState<SimulationResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const runSimulation = () => {
        setIsLoading(true)
        try {
            const results = simulateGames(numGames, numPlayers, options)

            const turns = results.map(r => r.turns)
            const avgTurns = turns.reduce((a, b) => a + b, 0) / turns.length
            const minTurns = Math.min(...turns)
            const maxTurns = Math.max(...turns)

            // Calculate turn differences and average turns to second
            const turnDifferences = results.map(r => r.turnsToSecond - r.turns)
            const avgTurnsToSecond = results.map(r => r.turnsToSecond).reduce((a, b) => a + b, 0) / results.length

            // Calculate turn difference distribution with percentages
            const turnDiffDistribution = turnDifferences.reduce((acc, diff) => {
                acc[diff] = (acc[diff] || 0) + 1
                return acc
            }, {} as Record<number, number>)

            const turnDifferenceDistribution = Object.entries(turnDiffDistribution)
                .map(([difference, frequency]) => ({
                    difference: parseInt(difference),
                    frequency: (frequency / numGames) * 100  // Convert to percentage
                }))
                .sort((a, b) => a.difference - b.difference)

            // Calculate distribution with percentages
            const distribution = turns.reduce((acc, turns) => {
                acc[turns] = (acc[turns] || 0) + 1
                return acc
            }, {} as Record<number, number>)

            const distributionArray = Object.entries(distribution).map(([turns, frequency]) => ({
                turns: parseInt(turns),
                frequency: (frequency / numGames) * 100  // Convert to percentage
            }))

            // Calculate position frequency
            const positionFrequency = new Array(25).fill(0)
            results.forEach(result => {
                result.winningPositions.forEach(pos => {
                    const index = pos.row * 5 + pos.col
                    positionFrequency[index]++
                })
            })

            const tiles: WinningTile[] = Array.from({ length: 25 }, (_, i) => {
                const row = i % 5
                const col = Math.floor(i / 5)
                return {
                    row,
                    col,
                    frequency: positionFrequency[i]
                }
            })

            const maxFrequency = Math.max(...tiles.map(t => t.frequency))

            setResult({
                avgTurns,
                minTurns,
                maxTurns,
                distribution: distributionArray,
                heatMap: {
                    tiles,
                    maxFrequency
                },
                avgTurnsToSecond,
                turnDifferenceDistribution
            })
        } catch (error) {
            console.error('Error running simulation:', error)
        }
        setIsLoading(false)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-6">Bingo Simulator Results</h1>
            <p className="mb-6">
                This blog post presents the results of a Bingo game simulator. You can adjust the number of games and players to see how it affects the distribution of turns needed to win.
            </p>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Simulation Parameters</CardTitle>
                    <CardDescription>Adjust the simulation settings</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                            <Label htmlFor="numGames">Number of Games</Label>
                            <Input
                                id="numGames"
                                type="number"
                                value={numGames}
                                onChange={(e) => setNumGames(parseInt(e.target.value))}
                                min={1}
                                max={100000}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="numPlayers">Number of Players</Label>
                            <Input
                                id="numPlayers"
                                type="number"
                                value={numPlayers}
                                onChange={(e) => setNumPlayers(parseInt(e.target.value))}
                                min={1}
                                max={100}
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="checkCorners"
                                checked={options.checkCorners}
                                onChange={(e) => setOptions(prev => ({
                                    ...prev,
                                    checkCorners: e.target.checked
                                }))}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="checkCorners">Check Corners as Win Condition</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="useFreeSpace"
                                checked={options.useFreeSpace}
                                onChange={(e) => setOptions(prev => ({
                                    ...prev,
                                    useFreeSpace: e.target.checked
                                }))}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="useFreeSpace">Use Free Space (Center)</Label>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={runSimulation}
                        disabled={isLoading}
                        className="relative"
                    >
                        {isLoading ? (
                            <>
                                <span className="opacity-0">Run Simulation</span>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-r-transparent border-white rounded-full animate-spin" />
                                </div>
                            </>
                        ) : (
                            'Run Simulation'
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {result && (
                <>
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Simulation Results</CardTitle>
                            <CardDescription>Statistics from {numGames} games with {numPlayers} players</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="font-semibold">Average Turns to Win</p>
                                    <p className="text-2xl">{result.avgTurns.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Minimum Turns to Win</p>
                                    <p className="text-2xl">{result.minTurns}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Maximum Turns to Win</p>
                                    <p className="text-2xl">{result.maxTurns}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Distribution of Turns to Win</CardTitle>
                            <CardDescription>Histogram showing the frequency of games won in a certain number of turns</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={result.distribution}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="turns" 
                                            label={{ value: 'Number of Turns', position: 'bottom' }}
                                        />
                                        <YAxis 
                                            label={{ value: 'Percentage of Games', angle: -90, position: 'insideLeft' }}
                                            tickFormatter={(value) => `${value.toFixed(1)}%`}
                                        />
                                        <Tooltip 
                                            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Percentage of Games']}
                                        />
                                        <Bar dataKey="frequency" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Winning Numbers Heat Map</CardTitle>
                            <CardDescription>
                                Visualization of the most common numbers in winning patterns
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BingoHeatMap heatMap={result.heatMap} />
                        </CardContent>
                    </Card>

                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Winner vs Runner-up Analysis</CardTitle>
                            <CardDescription>
                                Distribution of how many turns after the winner the next player would have won
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <p className="font-semibold">Average Turns Until Second Place Would Win</p>
                                <p className="text-2xl">{(result.avgTurnsToSecond - result.avgTurns).toFixed(2)} turns after winner</p>
                            </div>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={result.turnDifferenceDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="difference" 
                                            label={{ value: 'Turns After Winner', position: 'bottom' }} 
                                        />
                                        <YAxis 
                                            label={{ value: 'Percentage of Games', angle: -90, position: 'insideLeft' }}
                                            tickFormatter={(value) => `${value.toFixed(1)}%`}
                                        />
                                        <Tooltip 
                                            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Percentage of Games']}
                                        />
                                        <Bar dataKey="frequency" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}

function simulateGames(
    numGames: number, 
    numPlayers: number, 
    options: SimulationOptions
): { 
    turns: number; 
    winningPositions: { row: number; col: number }[];
    turnsToSecond: number;
}[] {
    const results: { 
        turns: number; 
        winningPositions: { row: number; col: number }[];
        turnsToSecond: number;
    }[] = []
    
    for (let i = 0; i < numGames; i++) {
        const game = generateBingoGame(numPlayers)
        const firstWinner = turnDidWin(game, game.numbers, options)
        
        const remainingPlayers = Array.from({ length: numPlayers }, (_, i) => i)
            .filter(i => i !== firstWinner.playerIndex)
        
        let minTurnsToSecond = 75
        for (const playerIndex of remainingPlayers) {
            const playerResult = turnDidWinPlayer(game, game.numbers, playerIndex, options)
            minTurnsToSecond = Math.min(minTurnsToSecond, playerResult.turns)
        }

        results.push({
            turns: firstWinner.turns,
            winningPositions: firstWinner.winningPositions,
            turnsToSecond: minTurnsToSecond
        })
    }
    return results
}


interface BingoCard {
    numbers: number[];
}
function generateBingoCard(): BingoCard {
    const card: number[][] = []
    for (let i = 0; i < 5; i++) {
        card.push(Array.from({ length: 15 }, (_, j) => i * 15 + j + 1).sort(() => Math.random() - 0.5).slice(0, 5))
    }
    return { numbers: card.flat() }
}

interface BingoGame {
    cards: BingoCard[];
    numbers: number[];
}

function generateBingoGame(numPlayers: number): BingoGame {
    return {
        cards: Array.from({ length: numPlayers }, () => generateBingoCard()),
        numbers: Array.from({ length: 75 }, (_, i) => i + 1).sort(() => Math.random() - 0.5)
    }
}

function turnDidWin(
    game: BingoGame, 
    drawnNumbers: number[], 
    options: SimulationOptions
): { 
    turns: number; 
    winningPositions: { row: number; col: number }[];
    playerIndex: number;
} {
    for (let playerIndex = 0; playerIndex < game.cards.length; playerIndex++) {
        const { turns, winningPositions } = turnDidWinPlayer(game, drawnNumbers, playerIndex, options)
        if (winningPositions.length > 0) {
            return { turns, winningPositions, playerIndex }
        }
    }
    throw new Error("No winner found after 75 turns")
}

function turnDidWinPlayer(
    game: BingoGame, 
    drawnNumbers: number[], 
    playerIndex: number,
    options: SimulationOptions
): { 
    turns: number; 
    winningPositions: { row: number; col: number }[] 
} {
    for (let i = 0; i < game.numbers.length; i++) {
        const card = game.cards[playerIndex]
        const winningPositions = checkDidWin(card, drawnNumbers.slice(0, i + 1), options)
        if (winningPositions) {
            return { turns: i + 1, winningPositions }
        }
    }
    return { turns: 75, winningPositions: [] }
}



function checkDidWin(
    card: BingoCard, 
    drawnNumbers: number[], 
    options: SimulationOptions
): { row: number; col: number }[] | null {
    const size = 5;
    const marked = new Array(25).fill(false);

    // Mark all numbers that have been drawn
    for (let i = 0; i < card.numbers.length; i++) {
        if (drawnNumbers.includes(card.numbers[i])) {
            marked[i] = true;
        }
    }

    // Apply free space if enabled
    if (options.useFreeSpace) {
        marked[12] = true; // Center position (2,2)
    }

    // Check corners if enabled
    if (options.checkCorners) {
        if (marked[0] && marked[4] && marked[20] && marked[24]) {
            return [
                { row: 0, col: 0 },
                { row: 0, col: 4 },
                { row: 4, col: 0 },
                { row: 4, col: 4 }
            ];
        }
    }

    // Check rows
    for (let row = 0; row < size; row++) {
        let rowComplete = true;
        for (let col = 0; col < size; col++) {
            if (!marked[row * size + col]) {
                rowComplete = false;
                break;
            }
        }
        if (rowComplete) {
            return Array.from({ length: size }, (_, col) => ({ row, col }));
        }
    }

    // Check columns
    for (let col = 0; col < size; col++) {
        let colComplete = true;
        for (let row = 0; row < size; row++) {
            if (!marked[row * size + col]) {
                colComplete = false;
                break;
            }
        }
        if (colComplete) {
            return Array.from({ length: size }, (_, row) => ({ row, col }));
        }
    }

    // Check diagonals
    let diagonal1Complete = true;
    for (let i = 0; i < size; i++) {
        if (!marked[i * size + i]) {
            diagonal1Complete = false;
            break;
        }
    }
    if (diagonal1Complete) {
        return Array.from({ length: size }, (_, i) => ({ row: i, col: i }));
    }

    let diagonal2Complete = true;
    for (let i = 0; i < size; i++) {
        if (!marked[i * size + (size - 1 - i)]) {
            diagonal2Complete = false;
            break;
        }
    }
    if (diagonal2Complete) {
        return Array.from({ length: size }, (_, i) => ({ row: i, col: size - 1 - i }));
    }

    return null;
}

