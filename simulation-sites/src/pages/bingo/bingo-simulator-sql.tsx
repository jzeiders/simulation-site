'use client'

import { Distribution, getAvgValue, getMaxValue, getMinValue } from "@/components/Distribution"
import { DistributionChart } from "@/components/DistributionChart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import initSqlJs from 'sql.js'

// Reuse the same interfaces from the original
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

interface SimulationMetadata {
    id: number;
    numGames: number;
    numPlayers: number;
    timestamp: number;
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
                        {(tile.frequency).toFixed(1)}%
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function BingoSimulatorSQL() {
    const [db, setDb] = useState<any>(null);
    const [simulations, setSimulations] = useState<SimulationMetadata[]>([]);
    const [activeSimulationId, setActiveSimulationId] = useState<number | null>(null);
    const [numGames, setNumGames] = useState(10000);
    const [numPlayers, setNumPlayers] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<SimulationAnalysis | null>(null);

    // Initialize SQL.js
    useEffect(() => {
        const initDB = async () => {
            try {
                const SQL = await initSqlJs({
                    locateFile: file => `https://sql.js.org/dist/${file}`
                });
                const db = new SQL.Database();
                
                // Create our tables
                db.run(`
                    CREATE TABLE IF NOT EXISTS simulations (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        num_games INTEGER,
                        num_players INTEGER,
                        timestamp INTEGER
                    );
                    
                    CREATE TABLE IF NOT EXISTS game_results (
                        simulation_id INTEGER,
                        game_id INTEGER,
                        winning_turn INTEGER,
                        next_winner_turn INTEGER,
                        winning_pattern TEXT,
                        FOREIGN KEY(simulation_id) REFERENCES simulations(id)
                    );
                    
                    CREATE TABLE IF NOT EXISTS winning_numbers (
                        simulation_id INTEGER,
                        game_id INTEGER,
                        row INTEGER,
                        col INTEGER,
                        number INTEGER,
                        FOREIGN KEY(simulation_id) REFERENCES simulations(id)
                    );
                `);
                
                setDb(db);
                loadSimulations(db);
            } catch (error) {
                console.error('Failed to initialize SQL.js:', error);
                toast({
                    variant: "destructive",
                    title: "Database Initialization Failed",
                    description: "Failed to initialize the SQLite database",
                });
            }
        };

        initDB();
    }, []);

    const loadSimulations = (database: any) => {
        const results = database.exec(`
            SELECT id, num_games, num_players, timestamp 
            FROM simulations 
            ORDER BY timestamp DESC
        `);
        
        if (results.length > 0) {
            const sims = results[0].values.map((row: any) => ({
                id: row[0],
                numGames: row[1],
                numPlayers: row[2],
                timestamp: row[3]
            }));
            setSimulations(sims);
            if (sims.length > 0 && !activeSimulationId) {
                setActiveSimulationId(sims[0].id);
            }
        }
    };

    const analyzeSimulation = async (simulationId: number) => {
        if (!db) return;

        try {
            // Get winning turn distribution
            const winningTurnResults = db.exec(`
                SELECT winning_turn as value, COUNT(*) as frequency
                FROM game_results
                WHERE simulation_id = ?
                GROUP BY winning_turn
                ORDER BY winning_turn
            `, [simulationId]);

            // Get turns until next winner distribution
            const nextWinnerResults = db.exec(`
                SELECT (next_winner_turn - winning_turn) as value, COUNT(*) as frequency
                FROM game_results
                WHERE simulation_id = ? AND next_winner_turn IS NOT NULL
                GROUP BY value
                ORDER BY value
            `, [simulationId]);

            // Get heat map data
            const heatMapResults = db.exec(`
                SELECT row, col, COUNT(*) * 100.0 / (
                    SELECT COUNT(DISTINCT game_id) 
                    FROM winning_numbers 
                    WHERE simulation_id = ?
                ) as frequency
                FROM winning_numbers
                WHERE simulation_id = ?
                GROUP BY row, col
                ORDER BY row, col
            `, [simulationId, simulationId]);

            const totalGames = db.exec(`
                SELECT COUNT(*) FROM game_results WHERE simulation_id = ?
            `, [simulationId])[0].values[0][0];

            const analysis: SimulationAnalysis = {
                winningTurnDistribution: {
                    values: winningTurnResults[0].values.map(row => row[0] as number),
                    frequencies: winningTurnResults[0].values.map(row => (row[1] as number) / totalGames)
                },
                turnsUntilNextWinner: {
                    values: nextWinnerResults[0].values.map(row => row[0] as number),
                    frequencies: nextWinnerResults[0].values.map(row => (row[1] as number) / totalGames)
                },
                heatMapData: {
                    tiles: heatMapResults[0].values.map(row => ({
                        row: row[0] as number,
                        col: row[1] as number,
                        frequency: row[2] as number
                    })),
                    maxFrequency: Math.max(...heatMapResults[0].values.map(row => row[2] as number))
                }
            };

            setAnalysis(analysis);
        } catch (error) {
            console.error('Analysis failed:', error);
            toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: "Failed to analyze the simulation results",
            });
        }
    };

    const runNewSimulation = async () => {
        if (!db) return;
        
        setIsLoading(true);
        try {
            const simulationId = await runSimulation({ numGames, numPlayers, db });
            loadSimulations(db);
            setActiveSimulationId(simulationId);
            toast({
                title: "Simulation Complete",
                description: `Successfully simulated ${numGames} games with ${numPlayers} players`,
            });
        } catch (error) {
            console.error('Simulation failed:', error);
            toast({
                variant: "destructive",
                title: "Simulation Failed",
                description: "Failed to run the simulation",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeSimulationId !== null) {
            analyzeSimulation(activeSimulationId);
        }
    }, [activeSimulationId]);

    // ... (rest of the component implementation with UI similar to original)
    
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-6">SQL-Based Bingo Simulator</h1>
            
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Simulation Parameters</CardTitle>
                    <CardDescription>Adjust the simulation settings</CardDescription>
                </CardHeader>
                <CardContent>
                    {simulations.length > 0 && (
                        <div className="mb-4">
                            <Label htmlFor="simulationSelect">Select Simulation</Label>
                            <select
                                id="simulationSelect"
                                value={activeSimulationId ?? ''}
                                onChange={(e) => setActiveSimulationId(parseInt(e.target.value))}
                                className="w-full p-2 border rounded-md"
                            >
                                {simulations.map((sim) => (
                                    <option key={sim.id} value={sim.id}>
                                        Simulation {sim.id} ({sim.numGames} games, {sim.numPlayers} players)
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
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
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={runNewSimulation}
                        disabled={isLoading}
                        className="relative"
                    >
                        {isLoading ? (
                            <>
                                <span className="opacity-0">Run New Simulation</span>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-r-transparent border-white rounded-full animate-spin" />
                                </div>
                            </>
                        ) : (
                            'Run New Simulation'
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {analysis && (
                <>
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Winning Turn Distribution</CardTitle>
                            <CardDescription>Distribution of turns needed to win</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DistributionChart
                                distributions={[
                                    {
                                        label: "Winning Turns",
                                        distribution: analysis.winningTurnDistribution
                                    }
                                ]}
                                xLabel="Number of Turns"
                                yLabel="Percentage of Games"
                            />
                        </CardContent>
                    </Card>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Turns Until Next Winner</CardTitle>
                            <CardDescription>Distribution of additional turns until another player wins</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DistributionChart
                                distributions={[
                                    {
                                        label: "Additional Turns",
                                        distribution: analysis.turnsUntilNextWinner
                                    }
                                ]}
                                xLabel="Number of Additional Turns"
                                yLabel="Percentage of Games"
                            />
                        </CardContent>
                    </Card>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Winning Numbers Heat Map</CardTitle>
                            <CardDescription>Frequency of numbers in winning patterns</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BingoHeatMap heatMap={analysis.heatMapData} />
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
} 