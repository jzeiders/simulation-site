import { createLazyFileRoute } from '@tanstack/react-router'
import TrainVisualization from '../pages/train-visualization/TrainVisualization'

export const Route = createLazyFileRoute('/train-visualization')({
  component: TrainVisualization,
})
