import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface DistributionChartProps {
    distribution: Distribution;
    xLabel?: string;
    yLabel?: string;
    barColor?: string;
    height?: number | string;
}

export function DistributionChart({ 
    distribution,
    xLabel = "Value",
    yLabel = "Percentage", 
    barColor = "#8884d8",
    height = "400px"
}: DistributionChartProps) {
    const chartData = useMemo(() => {
        const total = Array.from(distribution.values.values()).reduce((a, b) => a + b, 0);
        const minValue = getMinValue(distribution);
        const maxValue = getMaxValue(distribution);
        
        // Create array with all values between min and max
        const data = [];
        for (let i = minValue; i <= maxValue; i++) {
            data.push({
                value: i,
                frequency: ((distribution.values.get(i) || 0) / total) * 100
            });
        }
        
        return data;
    }, [distribution]);

    return (
        <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="value"
                        label={{ value: xLabel, position: 'bottom' }}
                    />
                    <YAxis
                        label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
                        tickFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <Tooltip
                        formatter={(value: number) => [`${value.toFixed(1)}%`, yLabel]}
                    />
                    <Bar dataKey="frequency" fill={barColor} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
