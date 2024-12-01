import { createFileRoute } from '@tanstack/react-router'
import { Day1 } from '@/pages/aoc/Day1/Day1'

export const Route = createFileRoute('/advent2024')({
  component: AdventOfCode2024,
})

function AdventOfCode2024() {
  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6">Advent of Code 2024</h1>
      <p className="mb-6">Solutions and explanations for Advent of Code 2024 challenges.</p>
      
      <Day1 />
    </div>
  )
} 