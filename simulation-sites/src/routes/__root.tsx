import { Toaster } from '@/components/ui/toaster'
import { Link, Outlet, useMatches } from '@tanstack/react-router'
import { createRootRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const matches = useMatches()
  // Filter out root route and get path segments
  const breadcrumbs = matches
    .filter((match) => match.pathname !== '/')
    .map((match) => ({
      title: getBreadcrumbTitle(match.pathname),
      path: match.pathname,
    }))
    // We drop the first because it's the root
    .slice(1)

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center mb-8 gap-4">
        <Link 
          to="/" 
          className="text-xl font-bold hover:text-primary/80 transition-colors"
        >
          Simulation Site
        </Link>
        
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <ChevronRight className="h-4 w-4" />
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                <Link 
                  to={crumb.path}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.title}
                </Link>
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            ))}
          </div>
        )}
      </header>
      <Outlet />
      <Toaster />
    </div>
  )
}

// Helper function to convert paths to readable titles
function getBreadcrumbTitle(path: string): string {
  const segment = path.split('/').pop() || ''
  
  switch (segment) {
    case 'bingo':
      return 'Bingo Simulator'
    case 'advent2024':
      return 'Advent of Code 2024'
    default:
      return segment.charAt(0).toUpperCase() + segment.slice(1)
  }
}
