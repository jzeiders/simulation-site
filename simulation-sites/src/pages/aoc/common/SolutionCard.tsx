import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, XCircle } from "lucide-react"

interface SolutionCardProps {
    day: number
    title: string
    part1: {
        result: string
        runtime: string
        testResult?: {
            success: boolean
            expected: string
            actual: string
        }
    }
    part2: {
        result: string
        runtime: string
        testResult?: {
            success: boolean
            expected: string
            actual: string
        }
    }
    explanation: {
        part1: string
        part2: string
    }
}

function TestResult({ testResult }: { testResult?: { success: boolean; expected: string; actual: string } }) {
    if (!testResult) return null;

    return (
        <div className="flex items-center gap-2 text-sm">
            {testResult.success ? (
                <>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">Test passed</span>
                </>
            ) : (
                <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-muted-foreground">
                        Test failed: expected {testResult.expected}, got {testResult.actual}
                    </span>
                </>
            )}
        </div>
    );
}

export function SolutionCard({ day, title, part1, part2, explanation }: SolutionCardProps) {
    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">
                    Day {day}: {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">Part 1: Total Absolute Distance</h3>
                            <TestResult testResult={part1.testResult} />
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-mono mb-2">{part1.result}</div>
                            <div className="text-sm text-muted-foreground">Computed in {part1.runtime}</div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">Part 2: Total Value</h3>
                            <TestResult testResult={part2.testResult} />
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-mono mb-2">{part2.result}</div>
                            <div className="text-sm text-muted-foreground">Computed in {part2.runtime}</div>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="space-y-4 text-left">
                    <h3 className="text-xl font-semibold ">Solution Explanation</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2">Part 1</h4>
                            <p className="text-muted-foreground">{explanation.part1}</p>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Part 2</h4>
                            <p className="text-muted-foreground">{explanation.part2}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

