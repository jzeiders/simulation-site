import { createLazyFileRoute } from '@tanstack/react-router'
import BingoSimulatorBlog from '../pages/bingo/bingo-simulator-blog'

export const Route = createLazyFileRoute('/bingo')({
  component: BingoSimulatorBlog,
})
