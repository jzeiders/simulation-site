'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SimulationResult {
  avgTurns: number;
  minTurns: number;
  maxTurns: number;
  distribution: { turns: number; frequency: number }[];
}

export default function BingoSimulatorBlog() {
  const [numGames, setNumGames] = useState(10000)
  const [numPlayers, setNumPlayers] = useState(10)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runSimulation = () => {
    setIsLoading(true)
    try {
      const results = simulateGames(numGames, numPlayers)
      
      const avgTurns = results.reduce((a, b) => a + b, 0) / results.length
      const minTurns = Math.min(...results)
      const maxTurns = Math.max(...results)

      // Calculate distribution
      const distribution = results.reduce((acc, turns) => {
        acc[turns] = (acc[turns] || 0) + 1
        return acc
      }, {} as Record<number, number>)

      const distributionArray = Object.entries(distribution).map(([turns, frequency]) => ({
        turns: parseInt(turns),
        frequency
      }))

      setResult({
        avgTurns,
        minTurns,
        maxTurns,
        distribution: distributionArray
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
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={runSimulation} disabled={isLoading}>
            {isLoading ? 'Simulating...' : 'Run Simulation'}
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
        </>
      )}
    </div>
  )
}

function simulateGames(numGames: number, numPlayers: number): number[] {
  const results: number[] = []
  for (let i = 0; i < numGames; i++) {
    results.push(playBingoGame(numPlayers))
  }
  return results
}

class BingoCard {
    card: number[][]
  
    constructor() {
      this.card = this.generateCard()
    }
  
    generateCard(): number[][] {
      const card: number[][] = []
      for (let i = 0; i < 5; i++) {
        const column: number[] = []
        const start = i * 15 + 1
        const end = start + 15
        const numbers = Array.from({length: 15}, (_, i) => i + start)
        for (let j = 0; j < 5; j++) {
          const index = Math.floor(Math.random() * numbers.length)
          column.push(numbers[index])
          numbers.splice(index, 1)
        }
        card.push(column)
      }
      return card
    }
  
    checkWin(drawnNumbers: number[]): boolean {
      // Check rows
      for (let row = 0; row < 5; row++) {
        if (this.card.every(col => drawnNumbers.includes(col[row]))) {
          return true
        }
      }
      // Check columns
      for (let col = 0; col < 5; col++) {
        if (this.card[col].every(num => drawnNumbers.includes(num))) {
          return true
        }
      }
      // Check diagonals
      if ([0, 1, 2, 3, 4].every(i => drawnNumbers.includes(this.card[i][i]))) {
        return true
      }
      if ([0, 1, 2, 3, 4].every(i => drawnNumbers.includes(this.card[i][4-i]))) {
        return true
      }
      return false
    }
  }
  
  function playBingoGame(numPlayers: number): number {
    const players = Array.from({length: numPlayers}, () => new BingoCard())
    const numbers = Array.from({length: 75}, (_, i) => i + 1)
    const drawnNumbers: number[] = []
  
    while (numbers.length > 0) {
      const index = Math.floor(Math.random() * numbers.length)
      const drawnNumber = numbers[index]
      numbers.splice(index, 1)
      drawnNumbers.push(drawnNumber)
  
      for (const player of players) {
        if (player.checkWin(drawnNumbers)) {
          return drawnNumbers.length
        }
      }
    }
    return -1 // No winner (shouldn't happen in a real game)
  }