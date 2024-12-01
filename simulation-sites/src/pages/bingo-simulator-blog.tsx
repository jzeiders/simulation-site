'use client'

import { Distribution, DistributionChart, getAvgValue, getMaxValue, getMinValue, makeDistribution } from '@/components/Distribution'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useMemo, useState } from 'react'
import { cacheable } from '@/lib/Cache';
import { uniqBy } from 'es-toolkit'

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
                        {((tile.frequency) * 100).toFixed(1)}%
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function BingoSimulatorBlog() {
    const [simulations, setSimulations] = useState<BingoSimulation[]>(() => {
        return [makeSimulation(1000, 4)];
    });

    const [activeSimulationIdx, setActiveSimulationIdx] = useState<number>(0);
    const [numGames, setNumGames] = useState(10000);
    const [numPlayers, setNumPlayers] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

    const activeSimulation = useMemo(() =>
        simulations[activeSimulationIdx],
        [simulations, activeSimulationIdx]
    );

    const runSimulation = async () => {
        setIsLoading(true);
        (async () => {
            const newSimulation = makeSimulation(numGames, numPlayers);
            setSimulations(prev => [...prev, newSimulation]);
            setActiveSimulationIdx(prev => prev + 1);
            setIsLoading(false);
        })()
    };

    const simulationDistribution = useMemo(() => {
        if (!activeSimulation) {
            return null;
        }
        return getWinningTurnDistribution(activeSimulation, {
            checkCorners: false,
            useFreeSpace: false
        });
    }, [activeSimulation]);

    const simulationSelector = (
        <div className="mb-4">
            <Label htmlFor="simulationSelect">Select Simulation</Label>
            <select
                id="simulationSelect"
                value={activeSimulationIdx}
                onChange={(e) => setActiveSimulationIdx(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
            >
                {simulations.map((sim, i) => (
                    <option key={i} value={i}>
                        Simulation {i} ({getNumGames(sim)} games, {getNumPlayers(sim)} players)
                    </option>
                ))}
            </select>
        </div>
    );

    const minTurns = simulationDistribution ? getMinValue(simulationDistribution) : 0;
    const maxTurns = simulationDistribution ? getMaxValue(simulationDistribution) : 0;
    const avgTurns = simulationDistribution ? getAvgValue(simulationDistribution) : 0;

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
                    {simulationSelector}
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
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={runSimulation}
                        disabled={isLoading}
                        className="relative"
                    >
                        {isLoading ? (
                            <>
                                <span className="opacity-0">Create New Simulation</span>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-r-transparent border-white rounded-full animate-spin" />
                                </div>
                            </>
                        ) : (
                            'Create New Simulation'
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {activeSimulation && (
                <>
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Simulation Results</CardTitle>
                            <CardDescription>Statistics from {getNumGames(activeSimulation)} games with {getNumPlayers(activeSimulation)} players</CardDescription>
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
                            <CardDescription>Histogram showing the frequency of games won in a certain number of turns under different rules</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activeSimulation && (
                                <DistributionChart
                                    distributions={[
                                        {
                                            label: "Basic Rules",
                                            distribution: getWinningTurnDistribution(activeSimulation, {
                                                checkCorners: false,
                                                useFreeSpace: false
                                            })
                                        },
                                        {
                                            label: "With Free Space",
                                            distribution: getWinningTurnDistribution(activeSimulation, {
                                                checkCorners: false,
                                                useFreeSpace: true
                                            })
                                        },
                                        {
                                            label: "Free Space & Corners",
                                            distribution: getWinningTurnDistribution(activeSimulation, {
                                                checkCorners: true,
                                                useFreeSpace: true
                                            })
                                        }
                                    ]}
                                    xLabel="Number of Turns"
                                    yLabel="Percentage of Games"
                                />
                            )}
                        </CardContent>
                    </Card>

                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Turns Until Next Winner Distribution</CardTitle>
                            <CardDescription>Distribution of how many additional turns it would take for the next player to win after the first winner</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DistributionChart
                                distributions={[
                                    {
                                        label: "Basic Rules",
                                        distribution: getTurnsUntilNextWinnerDistribution(activeSimulation, {
                                            checkCorners: false,
                                            useFreeSpace: false
                                        })
                                    },  
                                ]}
                                xLabel="Turns"
                                yLabel="Percentage of Games"
                            />
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
                            <BingoHeatMap 
                                heatMap={generateHeatMapData(activeSimulation, {
                                    checkCorners: false,
                                    useFreeSpace: false
                                })} 
                            />
                        </CardContent>
                    </Card>

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


// Bingo Simulation Data
interface BingoSimulation {
    games: BingoGame[];
    playerCount: number;
}
function getNumGames(simulation: BingoSimulation): number {
    return simulation.games.length;
}
function getNumPlayers(simulation: BingoSimulation): number {
    return simulation.playerCount;
}

interface AnalysisOptions {
    checkCorners: boolean;
    useFreeSpace: boolean;
}


const makeSimulation = function makeSimulation(numGames: number, numPlayers: number): BingoSimulation {
    return {
        games: Array.from({ length: numGames }, () => makeBingoGame(numPlayers)),
        playerCount: numPlayers
    }
}

// Bingo Simulation Analysis
const getWinningTurnDistribution = cacheable()(function getWinningTurnDistribution(simulation: BingoSimulation, options: AnalysisOptions): Distribution {
    const winningTurnsByGame = simulation.games.map(game => getFirstWinningTurn(game, options))
    return makeDistribution(winningTurnsByGame)
});


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

        winTypes.forEach(winType => {
            const winTypeKey = JSON.stringify(winType);
            winTypeMap.set(winTypeKey, (winTypeMap.get(winTypeKey) || 0) + 1);
        });

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

    return {
        tiles,
        maxFrequency: maxFrequency / totalWins
    };
});

// Add to exports
export { getWinTypes, getWinningTileIndices }