import { createLazyFileRoute } from '@tanstack/react-router'
import { Day1 } from '@/pages/aoc/Day1/Day1'
import { Day2 } from '@/pages/aoc/Day2/Day2'
import { Day3 } from '@/pages/aoc/Day3/Day3'
import { Day4 } from '@/pages/aoc/Day4/Day4'
import { Day5 } from '@/pages/aoc/Day5/Day5'
import { Day6 } from '@/pages/aoc/Day6/Day6'
import { Day7 } from '@/pages/aoc/Day7/Day7'
import { Day8 } from '@/pages/aoc/Day8/Day8'
import { Day9 } from '@/pages/aoc/Day9/Day9'
import { Day10 } from '@/pages/aoc/Day10/Day10'

export const Route = createLazyFileRoute('/advent2024')({
  component: AdventOfCode2024,
})

function AdventOfCode2024() {
  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6">Advent of Code 2024</h1>
      <p className="mb-6">
        Solutions and explanations for Advent of Code 2024 challenges.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Day1 />
        <Day2 />
        <Day3 />
        <Day4 />
        <Day5 />
        <Day6 />
        <Day7 />
        <Day8 />
        <Day9 />
        <Day10 />
      </div>
    </div>
  )
}
