import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDay1Answer } from '@/pages/aoc/Day1/Day1'
export const Route = createFileRoute('/advent2024')({
  component: AdventOfCode2024,
})

function AdventOfCode2024() {
  const result = getDay1Answer()


  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6">Advent of Code 2024</h1>
      <p className="mb-6">Solutions and explanations for Advent of Code 2024 challenges.</p>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Day 1: Array Distance Calculator</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Part 1: Total Absolute Distance:</h3>
                <p className="text-2xl font-mono">{result.part1}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Part 2: Total Value:</h3>
              <p className="text-2xl font-mono">{result.part2}</p>
            </div>
        </CardContent>
      </Card>
    </div>
  )
} 