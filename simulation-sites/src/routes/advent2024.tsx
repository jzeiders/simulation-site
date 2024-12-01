import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/advent2024')({
  component: AdventOfCode2024,
})

function AdventOfCode2024() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Advent of Code 2024</h1>
      <p>Solutions and explanations for Advent of Code 2024 challenges.</p>
    </div>
  )
} 