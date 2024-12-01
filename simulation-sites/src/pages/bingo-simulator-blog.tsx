'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from "@/lib/utils"
import assert from 'assert'

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
    const [simulation, setSimulation] = useState<BingoSimulation | null>(null)
    const [options, setOptions] = useState<SimulationOptions>({
        checkCorners: true,
        useFreeSpace: true
    })

    const [isLoading, setIsLoading] = useState(false)

    const runSimulation = () => {
        setIsLoading(true)
        const simulation = makeSimulation(numGames, numPlayers)
        setSimulation(simulation)
        setIsLoading(false)
    }
    

    const simulationDistribution = useMemo(() => {
        if (!simulation) {
            return null
        }
        return getWinningTurnDistribution(simulation, options)
    }, [simulation, options])
    

    const minTurns = simulationDistribution ? getMinValue(simulationDistribution) : 0
    const maxTurns = simulationDistribution ? getMaxValue(simulationDistribution) : 0
    const avgTurns = simulationDistribution ? getAvgValue(simulationDistribution) : 0

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

            {simulation && (
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
                                    <p className="text-2xl">{avgTurns.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Minimum Turns to Win</p>
                                    <p className="text-2xl">{minTurns}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Maximum Turns to Win</p>
                                    <p className="text-2xl">{maxTurns}</p>
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
                                    <BarChart data={simulationDistribution}>
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

                    {/* <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Winning Numbers Heat Map</CardTitle>
                            <CardDescription>
                                Visualization of the most common numbers in winning patterns
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BingoHeatMap heatMap={simulation.heatMap} />
                        </CardContent>
                    </Card> */}

                    {/* <Card className="mt-8">
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
                    </Card> */}
                </>
            )}
        </div>
    )
}



// Generic Distirbution Code
interface Distribution {
    values: Map<number, number>;
}
function makeDistribution(values: number[]): Distribution {
    const distribution = new Map<number, number>()
    for (const value of values) {
        distribution.set(value, (distribution.get(value) || 0) + 1)
    }
    return {
        values: distribution
    }
}
function getMinValue(distribution: Distribution): number {
    return Math.min(...Array.from(distribution.values.keys()))
}
function getMaxValue(distribution: Distribution): number {
    return Math.max(...Array.from(distribution.values.keys()))
}
function getAvgValue(distribution: Distribution): number {
    return Array.from(distribution.values.entries()).reduce((acc, [value, count]) => acc + value * count, 0) / Array.from(distribution.values.values()).reduce((a, b) => a + b, 0)
}


// Bingo Simulation Data
interface BingoSimulation {
    games: BingoGame[];
    playerCount: number;
}


function makeSimulation(numGames: number, numPlayers: number): BingoSimulation {
    return {
        games: Array.from({ length: numGames }, () => makeBingoGame(numPlayers)),
        playerCount: numPlayers
    }
}
// Bingo Simulation Analysis
function getWinningTurnDistribution(simulation: BingoSimulation, options: SimulationOptions): Distribution {
    const winningTurnsByGame = simulation.games.map(game => getWinningTurnsForGame(game, options)).map(turns => Math.min(...turns))
    return makeDistribution(winningTurnsByGame)
}


// The core bingo logic
interface BingoCard {
    numbers: number[];
}
interface BingoGame {
    cards: BingoCard[];
    numbers: number[];
}

function makeBingoCard(): BingoCard {
    let card: number[] = []
    for (let i = 0; i < 5; i++) {
        card = card.concat(Array.from({ length: 15 }, (_, j) => i * 15 + j + 1).sort(() => Math.random() - 0.5).slice(0, 5))
    }
    return { numbers: card }
}

function makeBingoGame(numPlayers: number): BingoGame {
    return {
        cards: Array.from({ length: numPlayers }, () => makeBingoCard()),
        numbers: Array.from({ length: 75 }, (_, i) => i + 1).sort(() => Math.random() - 0.5)
    }
}

// This function returns an array of the number of turns it took for each player to win
function getWinningTurnsForGame(game: BingoGame, options: SimulationOptions): number[] {
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
}

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
    options: SimulationOptions
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

// Make sure to export the function for testing
export { getWinTypes }