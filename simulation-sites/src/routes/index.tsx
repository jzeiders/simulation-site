import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const articles = [
  {
    title: "Bingo Simulator",
    description: "Explore the probabilities and patterns in Bingo games through interactive simulations.",
    link: "/bingo",
    date: "December 1st, 2024"
  },
  {
    title: "Advent of Code 2024",
    description: "Solutions and explanations for Advent of Code 2024 programming challenges.",
    link: "/advent2024",
    date: "December 2nd, 2024"
  },
  {
    title: "Bingo SQL",
    description: "Exploring the probabilities and patterns in Bingo games through SQL.",
    link: "/bingo-sql",
    date: "December 4th, 2024"
  },
  {
    title: "Train Visualization",
    description: "Visualizing the train routes in Chicago.",
    link: "/train-visualization",
    date: "April 12th, 2025"
  }
]

function HomePage() {
  return (
    <div className='min-h-screen'>
      <h1 className="text-4xl font-bold mb-6">Articles</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {articles.map((article, i) => (
          <Link key={i} to={article.link} className="block no-underline">
            <Card className="h-full hover:bg-muted/50 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{article.title}</CardTitle>
                  <span className="text-sm text-muted-foreground">{article.date}</span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{article.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
} 