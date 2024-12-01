import { createFileRoute } from '@tanstack/react-router'
import BingoSimulatorBlog from '../pages/bingo-simulator-blog'

export const Route = createFileRoute('/bingo')({
  component: BingoSimulatorBlog,
}) 