import { Link, Outlet } from '@tanstack/react-router'

import { createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => {
    return (
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-8">
          <div className="flex gap-4">
            <Link to="/" className="[&.active]:font-bold">
              Home
            </Link>
            <Link to="/bingo" className="[&.active]:font-bold">
              Bingo Simulator
            </Link>
            <Link to="/advent2024" className="[&.active]:font-bold">
              Advent of Code 2024
            </Link>
          </div>
        </nav>
        <Outlet />
      </div>
    )
  },
})
