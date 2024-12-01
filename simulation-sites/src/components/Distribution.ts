export interface Distribution {
    values: Map<number, number>;
}

export function makeDistribution(values: number[]): Distribution {
    const distribution = new Map<number, number>();
    for (const value of values) {
        distribution.set(value, (distribution.get(value) || 0) + 1);
    }
    return {
        values: distribution
    };
}

export function getMinValue(distribution: Distribution): number {
    return Math.min(...Array.from(distribution.values.keys()));
}

export function getMaxValue(distribution: Distribution): number {
    return Math.max(...Array.from(distribution.values.keys()));
}

export function getAvgValue(distribution: Distribution): number {
    const entries = Array.from(distribution.values.entries());
    const total = entries.reduce((acc, [value, count]) => acc + value * count, 0);
    const count = entries.reduce((acc, [_, count]) => acc + count, 0);
    return total / count;
}