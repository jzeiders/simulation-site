import { createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: HomePage,
})

function HomePage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Welcome to Simulations</h1>
      <p>Explore various simulation projects and coding challenges.</p>
    </div>
  )
} 