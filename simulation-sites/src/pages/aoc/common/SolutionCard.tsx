import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, XCircle } from "lucide-react"
import { ImplementationResults } from "./SolutionRunner"

interface SolutionCardProps {
    day: number
    title: string
    implementations: ImplementationResults[]
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

function ImplementationSection({ implementation }: { implementation: ImplementationResults }) {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">{implementation.name}</h3>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium">Part 1</h4>
                    <TestResult testResult={implementation.part1.testResult} />
                </div>
                <div className="text-center">
                    <div className="text-4xl font-mono mb-2">{implementation.part1.result}</div>
                    <div className="text-sm text-muted-foreground">Computed in {implementation.part1.runtime}</div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium">Part 2</h4>
                    <TestResult testResult={implementation.part2.testResult} />
                </div>
                <div className="text-center">
                    <div className="text-4xl font-mono mb-2">{implementation.part2.result}</div>
                    <div className="text-sm text-muted-foreground">Computed in {implementation.part2.runtime}</div>
                </div>
            </div>
        </div>
    )
}

export function SolutionCard({ day, title, implementations }: SolutionCardProps) {
    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">
                    Day {day}: {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                {implementations.map((implementation, index) => (
                    <div key={implementation.name}>
                        <ImplementationSection implementation={implementation} />
                        {index < implementations.length - 1 && <Separator className="my-8" />}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

