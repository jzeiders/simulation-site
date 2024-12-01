import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface SolutionCardProps {
  day: number
  title: string
  part1: {
    result: string
    runtime: string
  }
  part2: {
    result: string
    runtime: string
  }
  explanation: {
    part1: string
    steps: string[]
  }
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
            <h3 className="text-xl font-semibold mb-4">Part 1: Total Absolute Distance</h3>
            <div className="text-center">
              <div className="text-4xl font-mono mb-2">{part1.result}</div>
              <div className="text-sm text-muted-foreground">Computed in {part1.runtime}</div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Part 2: Total Value</h3>
            <div className="text-center">
              <div className="text-4xl font-mono mb-2">{part2.result}</div>
              <div className="text-sm text-muted-foreground">Computed in {part2.runtime}</div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Solution Explanation</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Part 1: Minimum Total Distance</h4>
              <p className="text-muted-foreground">{explanation.part1}</p>
            </div>
            <div>
              <div className="font-medium mb-2">The solution follows these steps:</div>
              <ul className="list-decimal list-inside space-y-2">
                {explanation.steps.map((step, index) => (
                  <li key={index} className="text-muted-foreground">{step}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

