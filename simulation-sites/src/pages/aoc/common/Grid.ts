export type Point = {
    row: number;
    col: number;
}

export const addPoints = (a: Point, b: Point): Point => ({ row: a.row + b.row, col: a.col + b.col })
export const negatePoint = (a: Point): Point => ({ row: -a.row, col: -a.col })
export const subtractPoints = (a: Point, b: Point): Point => ({ row: a.row - b.row, col: a.col - b.col })
export const multiplyPoint = (a: Point, b: number): Point => ({ row: a.row * b, col: a.col * b })
export type PointValue<T> = {
    point: Point;
    value: T;
}

export class Grid<T> {
    private grid: T[][];
    readonly width: number;
    readonly height: number;

    constructor(input: T[][]) {
        this.grid = input;
        this.height = input.length;
        this.width = input[0]?.length || 0;
    }

    get(row: number, col: number): T | undefined {
        if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
            return undefined;
        }
        return this.grid[row][col];
    }
    *cells(): Generator<PointValue<T>> {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                yield { point: { row, col }, value: this.grid[row][col] };
            }
        }
    }

    toString(): string {
        return this.grid.map(row => row.join('')).join('\n');
    }
} 