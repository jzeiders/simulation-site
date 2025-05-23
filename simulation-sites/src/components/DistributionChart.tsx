import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Distribution } from './Distribution';



interface LabeledDistribution {
    label: string;
    distribution: Distribution;
}

interface DistributionChartProps {
    distributions: LabeledDistribution[];
    xLabel?: string;
    yLabel?: string;
    height?: number | string;
}

// Predefined colors for the bars
const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];

export function DistributionChart({ 
    distributions,
    xLabel = "Value",
    yLabel = "Percentage", 
    height = "400px"
}: DistributionChartProps) {
    const chartData = useMemo(() => {
        // Find global min/max across all distributions
        const allValues = distributions.flatMap(d => 
            Array.from(d.distribution.values.keys())
        );
        const minValue = Math.min(...allValues);
        const maxValue = Math.max(...allValues);
        
        // Create unified data points for all values
        const data = [];
        for (let i = minValue; i <= maxValue; i++) {
            const point: any = { value: i };
            distributions.forEach((d, idx) => {
                const total = Array.from(d.distribution.values.values())
                    .reduce((a, b) => a + b, 0);
                const count = d.distribution.values.get(i) || 0;
                point[`frequency${idx}`] = (count / total) * 100;
            });
            data.push(point);
        }
        return data;
    }, [distributions]);

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
                        formatter={(value: number, name: string) => {
                            const idx = parseInt(name.replace('frequency', ''));
                            return [`${value.toFixed(1)}%`, distributions[idx].label];
                        }}
                    />
                    {distributions.map((_, idx) => (
                        <Bar 
                            key={idx}
                            dataKey={`frequency${idx}`}
                            fill={CHART_COLORS[idx % CHART_COLORS.length]}
                            name={`frequency${idx}`}
                        />
                    ))}
                    <Legend verticalAlign="top" height={36} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
