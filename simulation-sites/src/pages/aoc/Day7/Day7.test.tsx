import { describe, it, expect } from 'vitest'
import { validEquation2 } from './Day7'

describe('Day7', () => {
    describe('validEquation2', () => {
        it('should validate 156 can be made with 15 6 through concatenation', () => {
            expect(validEquation2(156, [6, 15])).toBe(true)
        })

        it('should validate 7290 can be made with 6 8 6 15 through multiplication and concatenation', () => {
            expect(validEquation2(7290, [15, 6, 8, 6])).toBe(true)
        })

        it('should validate 192 can be made with 17 8 14 through concatenation and addition', () => {
            expect(validEquation2(192, [14, 8, 17])).toBe(true)
        })
    })
}) 