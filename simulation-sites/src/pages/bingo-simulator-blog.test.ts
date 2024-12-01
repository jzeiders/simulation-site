import { describe, it, expect } from 'vitest'
import { getWinTypes } from './bingo-simulator-blog'

describe('Bingo Win Conditions', () => {
    // Helper function to create a test card with specific numbers
    const makeTestCard = (numbers: number[]) => ({ numbers })

    it('should detect a horizontal win', () => {
        const card = makeTestCard([
            1, 2, 3, 4, 5,    // Row 0 (winning row)
            6, 7, 8, 9, 10,   // Row 1
            11, 12, 13, 14, 15, // Row 2
            16, 17, 18, 19, 20, // Row 3
            21, 22, 23, 24, 25  // Row 4
        ])
        const drawnNumbers = [1, 2, 3, 4, 5]
        const options = { checkCorners: true, useFreeSpace: false }
        
        const winTypes = getWinTypes(card, drawnNumbers, options)
        
        expect(winTypes).toContainEqual({ type: 'row', row: 0 })
        expect(winTypes).toHaveLength(1)
    })

    it('should detect a vertical win', () => {
        const card = makeTestCard([
            1, 2, 3, 4, 5,
            6, 7, 8, 9, 10,
            11, 12, 13, 14, 15,
            16, 17, 18, 19, 20,
            21, 22, 23, 24, 25
        ])
        const drawnNumbers = [1, 6, 11, 16, 21] // First column
        const options = { checkCorners: true, useFreeSpace: false }
        
        const winTypes = getWinTypes(card, drawnNumbers, options)
        
        expect(winTypes).toContainEqual({ type: 'col', col: 0 })
        expect(winTypes).toHaveLength(1)
    })

    it('should detect a diagonal win (left to right)', () => {
        const card = makeTestCard([
            1, 2, 3, 4, 5,
            6, 7, 8, 9, 10,
            11, 12, 13, 14, 15,
            16, 17, 18, 19, 20,
            21, 22, 23, 24, 25
        ])
        const drawnNumbers = [1, 7, 13, 19, 25]
        const options = { checkCorners: true, useFreeSpace: false }
        
        const winTypes = getWinTypes(card, drawnNumbers, options)
        
        expect(winTypes).toContainEqual({ type: 'diagonal', direction: 'left' })
        expect(winTypes).toHaveLength(1)
    })

    it('should detect four corners win when enabled', () => {
        const card = makeTestCard([
            1, 2, 3, 4, 5,
            6, 7, 8, 9, 10,
            11, 12, 13, 14, 15,
            16, 17, 18, 19, 20,
            21, 22, 23, 24, 25
        ])
        const drawnNumbers = [1, 5, 21, 25]
        const options = { checkCorners: true, useFreeSpace: false }
        
        const winTypes = getWinTypes(card, drawnNumbers, options)
        
        expect(winTypes).toContainEqual({ type: 'fourCorners' })
        expect(winTypes).toHaveLength(1)
    })

    it('should not detect four corners win when disabled', () => {
        const card = makeTestCard([
            1, 2, 3, 4, 5,
            6, 7, 8, 9, 10,
            11, 12, 13, 14, 15,
            16, 17, 18, 19, 20,
            21, 22, 23, 24, 25
        ])
        const drawnNumbers = [1, 5, 21, 25]
        const options = { checkCorners: false, useFreeSpace: false }
        
        const winTypes = getWinTypes(card, drawnNumbers, options)
        
        expect(winTypes).toHaveLength(0)
    })

    it('should consider free space when enabled', () => {
        const card = makeTestCard([
            1, 2, 3, 4, 5,
            6, 7, 8, 9, 10,
            11, 12, 13, 14, 15, // Row with center free space
            16, 17, 18, 19, 20,
            21, 22, 23, 24, 25
        ])
        const drawnNumbers = [11, 12, 14, 15] // Note: 13 is free space
        const options = { checkCorners: true, useFreeSpace: true }
        
        const winTypes = getWinTypes(card, drawnNumbers, options)
        
        expect(winTypes).toContainEqual({ type: 'row', row: 2 })
        expect(winTypes).toHaveLength(1)
    })
}) 