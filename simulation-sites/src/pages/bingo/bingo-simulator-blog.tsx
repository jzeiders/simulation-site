'use client'

import { Distribution, DistributionChart, getAvgValue, getMaxValue, getMinValue, makeDistribution } from '@/components/Distribution'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { cacheable } from '@/lib/Cache';
import { shuffle, uniqBy } from 'es-toolkit'
import { BingoSimulation, getNumGames, getNumPlayers, makeSimulation } from './bingo-worker'

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

interface SimulationAnalysis {
    winningTurnDistribution: Distribution;
    turnsUntilNextWinner: Distribution;
    heatMapData: HeatMapData;
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

    const workerRef = useRef<Worker>();
    const [analysis, setAnalysis] = useState<SimulationAnalysis | null>(null);

    useEffect(() => {
        workerRef.current = new Worker(
            new URL('../workers/bingo-worker.ts', import.meta.url),
            { type: 'module' }
        );

        workerRef.current.onmessage = (e) => {
            const { type, payload } = e.data;
            
            switch (type) {
                case 'SIMULATION_COMPLETE':
                    setSimulations(prev => [...prev, payload]);
                    setActiveSimulationIdx(prev => prev + 1);
                    setIsLoading(false);
                    break;
                    
                case 'ANALYSIS_COMPLETE':
                    setAnalysis(payload);
                    break;
            }
        };

        return () => workerRef.current?.terminate();
    }, []);

    const runSimulation = useCallback(() => {
        setIsLoading(true);
        workerRef.current?.postMessage({
            type: 'RUN_SIMULATION',
            payload: { numGames, numPlayers }
        });
    }, [numGames, numPlayers]);

    useEffect(() => {
        if (!activeSimulation) return;

        workerRef.current?.postMessage({
            type: 'ANALYZE_SIMULATION',
            payload: {
                simulation: activeSimulation,
                options: {
                    checkCorners: false,
                    useFreeSpace: false
                }
            }
        });
    }, [activeSimulation]);

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

    const minTurns = analysis?.winningTurnDistribution ? getMinValue(analysis.winningTurnDistribution) : 0;
    const maxTurns = analysis?.winningTurnDistribution ? getMaxValue(analysis.winningTurnDistribution) : 0;
    const avgTurns = analysis?.winningTurnDistribution ? getAvgValue(analysis.winningTurnDistribution) : 0;

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
                            {analysis && (
                                <DistributionChart
                                    distributions={[
                                        {
                                            label: "Basic Rules",
                                            distribution: analysis.winningTurnDistribution
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
                                        distribution: analysis?.turnsUntilNextWinner ? analysis.turnsUntilNextWinner : getTurnsUntilNextWinnerDistribution(activeSimulation, {
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
                            {analysis && (
                                <BingoHeatMap heatMap={analysis.heatMapData} />
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}


