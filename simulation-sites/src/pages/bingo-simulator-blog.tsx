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

interface GameOptions {
    freeCenter: boolean;
    allowFourCorners: boolean;
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
    const [options, setOptions] = useState<GameOptions>({
        freeCenter: false,
        allowFourCorners: false
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

            // Calculate distribution
            const distribution = turns.reduce((acc, turns) => {
                acc[turns] = (acc[turns] || 0) + 1
                return acc
            }, {} as Record<number, number>)

            const distributionArray = Object.entries(distribution).map(([turns, frequency]) => ({
                turns: parseInt(turns),
                frequency
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
                }
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
                    <CardDescription>Adjust the number of games and players for the simulation</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="space-y-2 md:col-span-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="freeCenter"
                                    checked={options.freeCenter}
                                    onChange={(e) => setOptions(prev => ({ ...prev, freeCenter: e.target.checked }))}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="freeCenter">Free Center Space</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="fourCorners"
                                    checked={options.allowFourCorners}
                                    onChange={(e) => setOptions(prev => ({ ...prev, allowFourCorners: e.target.checked }))}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="fourCorners">Allow Four Corners Win</Label>
                            </div>
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
                                        <XAxis dataKey="turns" />
                                        <YAxis />
                                        <Tooltip />
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
                </>
            )}
        </div>
    )
}

function simulateGames(
    numGames: number, 
    numPlayers: number, 
    options: GameOptions
): { turns: number; winningPositions: { row: number; col: number }[] }[] {
    const results: { turns: number; winningPositions: { row: number; col: number }[] }[] = []
    for (let i = 0; i < numGames; i++) {
        const game = generateBingoGame(numPlayers, options)
        const result = turnDidWin(game, game.numbers, options)
        results.push({
            turns: result.turns,
            winningPositions: result.winningPositions
        })
    }
    return results
}


interface BingoCard {
    numbers: number[];
}
function generateBingoCard(options: GameOptions): BingoCard {
    const card: number[][] = []
    for (let i = 0; i < 5; i++) {
        card.push(Array.from({ length: 15 }, (_, j) => i * 15 + j + 1)
            .sort(() => Math.random() - 0.5)
            .slice(0, 5))
    }
    
    // If free center is enabled, set center position to 0 (representing free space)
    if (options.freeCenter) {
        const centerRow = Math.floor(5/2);
        const centerCol = Math.floor(5/2);
        card[centerRow][centerCol] = 0;
    }
    
    return { numbers: card.flat() }
}

interface BingoGame {
    cards: BingoCard[];
    numbers: number[];
}

function generateBingoGame(numPlayers: number, options: GameOptions): BingoGame {
    return {
        cards: Array.from({ length: numPlayers }, () => generateBingoCard(options)),
        numbers: Array.from({ length: 75 }, (_, i) => i + 1).sort(() => Math.random() - 0.5)
    }
}

function turnDidWin(
    game: BingoGame, 
    drawnNumbers: number[], 
    options: GameOptions
): { turns: number; winningPositions: { row: number; col: number }[] } {
    for (let i = 0; i < game.numbers.length; i++) {
        for (const card of game.cards) {
            const winningPositions = checkDidWin(card, drawnNumbers.slice(0, i + 1), options)
            if (winningPositions) {
                return { turns: i + 1, winningPositions }
            }
        }
    }
    throw new Error("No winner found after 75 turns")
}



function checkDidWin(
    card: BingoCard, 
    drawnNumbers: number[],
    options: GameOptions
): { row: number; col: number }[] | null {
    const size = 5;
    const marked = new Array(25).fill(false);

    // Mark all numbers that have been drawn or free spaces
    for (let i = 0; i < card.numbers.length; i++) {
        if (card.numbers[i] === 0 || drawnNumbers.includes(card.numbers[i])) {
            marked[i] = true;
        }
    }

    // Check four corners if enabled
    if (options.allowFourCorners) {
        const corners = [
            {row: 0, col: 0},
            {row: 0, col: size-1},
            {row: size-1, col: 0},
            {row: size-1, col: size-1}
        ];
        
        if (corners.every(({row, col}) => marked[row * size + col])) {
            return corners;
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

    // Check diagonal (top-left to bottom-right)
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

    // Check diagonal (top-right to bottom-left)
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

