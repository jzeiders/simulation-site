import { describe, it, expect } from 'vitest'
import { addPoints, Grid } from './Grid'

describe('Point', () => {
    it('should add points', () => {
        expect(addPoints({ row: 1, col: 1 }, { row: 2, col: 2 })).toEqual({ row: 3, col: 3 })
    })
})

describe('Grid', () => {
    const testGrid = new Grid([
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9']
    ]);

    it('should iterate over cells', () => {
        const cells = Array.from(testGrid.cells())
        expect(cells).toEqual([
            { point: { row: 0, col: 0 }, value: '1' },
            { point: { row: 0, col: 1 }, value: '2' },
            { point: { row: 0, col: 2 }, value: '3' },
            { point: { row: 1, col: 0 }, value: '4' },
            { point: { row: 1, col: 1 }, value: '5' },
            { point: { row: 1, col: 2 }, value: '6' },
            { point: { row: 2, col: 0 }, value: '7' },
            { point: { row: 2, col: 1 }, value: '8' },
            { point: { row: 2, col: 2 }, value: '9' },
        ])
    })
}); 