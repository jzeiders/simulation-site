'use client'

import { Distribution, getAvgValue, getMaxValue, getMinValue } from "@/components/Distribution"
import { DistributionChart } from "@/components/DistributionChart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BingoSimulation, getNumGames, getNumPlayers } from './bingo-worker'
import type * as BingoWorker from './bingo-worker'
import { toast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

interface WinningTile {
    row: number;
    col: number;
    frequency: number;
}

interface HeatMapData {
    tiles: WinningTile[];
    maxFrequency: number;
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
    const [simulations, setSimulations] = useState<BingoSimulation[]>([]);
    const [activeSimulationIdx, setActiveSimulationIdx] = useState<number>(0);
    const [numGames, setNumGames] = useState(10000);
    const [numPlayers, setNumPlayers] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

    const instance = new ComlinkWorker<typeof BingoWorker>(
        new URL('./bingo-worker.ts', import.meta.url)
    )

    const activeSimulation = useMemo(() =>
        simulations[activeSimulationIdx],
        [simulations, activeSimulationIdx]
    );

    useEffect(() => {
        const loadInitialSimulation = async () => {
            try {
                const sim = await instance.makeSimulation(numGames, numPlayers);
                setSimulations([sim]);
                setActiveSimulationIdx(0);
            } catch (error) {
                console.error(error);
                toast({
                    variant: "destructive",
                    title: "Initial Simulation Failed",
                    description: "There was an error creating the initial simulation",
                    action: <ToastAction altText="Try again" onClick={runSimulation}>Try again</ToastAction>,
                });
            }
        };

        loadInitialSimulation();
    }, [instance]);

    const [analysis, setAnalysis] = useState<SimulationAnalysis | null>(null);

    useEffect(() => {
        if (!instance || !activeSimulation) return;

        const analyzeSimulation = async () => {
            try {
                const analysis = await instance.analyzeSimulation(activeSimulation, {
                    checkCorners: false,
                    useFreeSpace: false
                });
                setAnalysis(analysis);
                toast({
                    title: "Analysis Complete",
                    description: "Successfully analyzed the simulation",
                });
            } catch (error) {
                console.error(error);
                toast({
                    variant: "destructive",
                    title: "Analysis Failed",
                    description: "There was an error analyzing the simulation",
                });
            }
        };

        setAnalysis(null);
        analyzeSimulation();
    }, [instance, activeSimulation]);

    const runSimulation = useCallback(async () => {
        if (!instance) return;

        setIsLoading(true);
        try {
            const sim = await instance.makeSimulation(numGames, numPlayers);
            setSimulations(prev => [...prev, sim]);
            setActiveSimulationIdx(prev => prev + 1);
            toast({
                title: "Simulation Complete",
                description: `Successfully simulated ${numGames} games with ${numPlayers} players`,
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Simulation Failed",
                description: "There was an error running the simulation",
                action: <ToastAction altText="Try again" onClick={runSimulation}>Try again</ToastAction>,
            });
        } finally {
            setIsLoading(false);
        }
    }, [instance, numGames, numPlayers]);

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
                                    <p className="text-2xl">{analysis?.winningTurnDistribution ? getAvgValue(analysis.winningTurnDistribution) : 0}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Minimum Turns to Win</p>
                                    <p className="text-2xl">{analysis?.winningTurnDistribution ? getMinValue(analysis.winningTurnDistribution) : 0}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Maximum Turns to Win</p>
                                    <p className="text-2xl">{analysis?.winningTurnDistribution ? getMaxValue(analysis.winningTurnDistribution) : 0}</p>
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
                            <DistributionChart
                                distributions={[
                                    {
                                        label: "Basic Rules",
                                        distribution: analysis?.winningTurnDistribution
                                    },
                                    {
                                        label: "With Free Space",
                                        distribution: analysis?.winningTurnDistribution
                                    },
                                    {
                                        label: "Free Space & Corners",
                                        distribution: analysis?.winningTurnDistribution
                                    }
                                ].filter(d => d.distribution) as { label: string, distribution: Distribution }[]}
                                xLabel="Number of Turns"
                                yLabel="Percentage of Games"
                            />
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
                                        distribution: analysis?.turnsUntilNextWinner
                                    },
                                ].filter(d => d.distribution) as { label: string, distribution: Distribution }[]}
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


