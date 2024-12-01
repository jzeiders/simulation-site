import { describe, it, expect } from 'vitest'
import { makeBingoCard, makeBingoGame } from './bingo-simulator-blog'
import { getWinTypes, getWinningTileIndices } from './bingo-worker'

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

describe('getWinningTileIndices', () => {
    it('should return correct indices for row win', () => {
        const winType = { type: 'row' as const, row: 2 }
        const indices = getWinningTileIndices(winType)
        
        expect(indices).toEqual([
            { row: 2, col: 0 },
            { row: 2, col: 1 },
            { row: 2, col: 2 },
            { row: 2, col: 3 },
            { row: 2, col: 4 }
        ])
    })

    it('should return correct indices for column win', () => {
        const winType = { type: 'col' as const, col: 3 }
        const indices = getWinningTileIndices(winType)
        
        expect(indices).toEqual([
            { row: 0, col: 3 },
            { row: 1, col: 3 },
            { row: 2, col: 3 },
            { row: 3, col: 3 },
            { row: 4, col: 3 }
        ])
    })

    it('should return correct indices for left diagonal win', () => {
        const winType = { type: 'diagonal' as const, direction: 'left' as const }
        const indices = getWinningTileIndices(winType)
        
        expect(indices).toEqual([
            { row: 0, col: 0 },
            { row: 1, col: 1 },
            { row: 2, col: 2 },
            { row: 3, col: 3 },
            { row: 4, col: 4 }
        ])
    })

    it('should return correct indices for right diagonal win', () => {
        const winType = { type: 'diagonal' as const, direction: 'right' as const }
        const indices = getWinningTileIndices(winType)
        
        expect(indices).toEqual([
            { row: 0, col: 4 },
            { row: 1, col: 3 },
            { row: 2, col: 2 },
            { row: 3, col: 1 },
            { row: 4, col: 0 }
        ])
    })

    it('should return correct indices for four corners win', () => {
        const winType = { type: 'fourCorners' as const }
        const indices = getWinningTileIndices(winType)
        
        expect(indices).toEqual([
            { row: 0, col: 0 },
            { row: 0, col: 4 },
            { row: 4, col: 0 },
            { row: 4, col: 4 }
        ])
    })
})

describe('Bingo Card Generation (100 Seeded Tests)', () => {
    it('should generate 100 valid cards with fixed seed', () => {
        
        for (let test = 0; test < 100; test++) {
            const card = makeBingoCard();
            
            // Check each column (B I N G O)
            for (let col = 0; col < 5; col++) {
                const colNumbers = [
                    card.numbers[col],      // Row 1
                    card.numbers[col + 5],  // Row 2
                    card.numbers[col + 10], // Row 3
                    card.numbers[col + 15], // Row 4
                    card.numbers[col + 20]  // Row 5
                ];

                // Define valid ranges for each column
                const minValue = col * 15 + 1;
                const maxValue = (col + 1) * 15;

                // Check each number in the column is within range
                colNumbers.forEach(num => {
                    expect(num).toBeGreaterThanOrEqual(minValue)
                    expect(num).toBeLessThanOrEqual(maxValue)
                });

                // Check for duplicates
                const uniqueNumbers = new Set(colNumbers);
                expect(uniqueNumbers.size).toBe(5)
            }
        }
    });
});

describe('Bingo Game Generation (100 Seeded Tests)', () => {
    it('should generate 100 valid games with fixed seed', () => {
        for (let test = 0; test < 100; test++) {
            const game = makeBingoGame(4);
            
            // Check drawn numbers
            expect(game.numbers).toHaveLength(75)
            
            const uniqueDrawnNumbers = new Set(game.numbers);
            expect(uniqueDrawnNumbers.size).toBe(75)
            
            // Check all numbers 1-75 are present
            const expectedNumbers = new Set(Array.from({ length: 75 }, (_, i) => i + 1));
            game.numbers.forEach(num => {
                expect(expectedNumbers.has(num)).toBe(true)
            });

            // Check player cards
            expect(game.cards).toHaveLength(4)
        }
    });
}); 