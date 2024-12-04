import { createFileRoute } from '@tanstack/react-router'
import BingoSimulatorSql from '../pages/bingo/bingo-simulator-sql'

export const Route = createFileRoute('/bingo-sql')({
  component: BingoSimulatorSql,
})
