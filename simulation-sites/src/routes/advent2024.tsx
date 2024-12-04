import { createFileRoute } from '@tanstack/react-router'
import { Day1 } from '@/pages/aoc/Day1/Day1'
import { Day2 } from '@/pages/aoc/Day2/Day2'
import { Day3 } from '@/pages/aoc/Day3/Day3'
export const Route = createFileRoute('/advent2024')({
  component: AdventOfCode2024,
})

function AdventOfCode2024() {
  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6">Advent of Code 2024</h1>
      <p className="mb-6">Solutions and explanations for Advent of Code 2024 challenges.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Day1 />
        <Day2 />
        <Day3 />
      </div>
    </div>
  )
} 