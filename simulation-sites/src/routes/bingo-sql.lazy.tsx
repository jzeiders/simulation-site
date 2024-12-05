import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/bingo-sql')({
  component: () => <div>Bingo SQL: WIP</div>,
})
