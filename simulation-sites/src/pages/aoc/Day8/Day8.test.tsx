import { describe, it, expect } from 'vitest'
import { solution } from './Day8'

const testInput = `............
........0...
.....0......
.......0....
....0.......
......A.....
............
............
........A...
.........A..
............
............`

describe('Day8', () => {
    describe('part1', () => {
        it('should correctly calculate the number of matching antennas', () => {
            const parsed = solution.parseInput(testInput)
            const result = solution.implementations[0].part1(parsed)
            expect(result).toBe(14)
        })
    })
  
}) 