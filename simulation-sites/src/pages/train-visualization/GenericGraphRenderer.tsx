import React, { useMemo } from 'react';

interface Node {
  id: string | number;
  x: number;
  y: number;
  name: string;
}

interface Edge {
  sourceId: string | number;
  targetId: string | number;
}

interface GenericGraphRendererProps {
  nodes: Node[];
  edges: Edge[];
  width: number;
  height: number;
  padding: number;
  nodeColor?: string;
  edgeColor?: string;
  labelColor?: string;
  nodeRadius?: number;
  edgeWidth?: number;
  labelFontSize?: number;
}

const GenericGraphRenderer: React.FC<GenericGraphRendererProps> = ({
  nodes,
  edges,
  width,
  height,
  padding,
  nodeColor = '#333',
  edgeColor = '#ccc', // Default edge color, can be overridden or customized later
  labelColor = '#555',
  nodeRadius = 3,
  edgeWidth = 1,
  labelFontSize = 8,
}) => {
  // Calculate scaling functions based on provided nodes
  const { scaleX, scaleY, minX, maxX, minY, maxY } = useMemo(() => {
    if (nodes.length === 0) {
      return {
        scaleX: (x: number) => x,
        scaleY: (y: number) => y,
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
      };
    }
    const xValues = nodes.map(n => n.x);
    const yValues = nodes.map(n => n.y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    // Handle cases where all points have the same x or y to avoid division by zero
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    const scaleX = (x: number): number => {
        // If all x values are the same, center them
        if (rangeX === 1 && nodes.length > 0) return width / 2;
      return padding + ((x - minX) / rangeX) * (width - 2 * padding);
    };
    const scaleY = (y: number): number => {
        // If all y values are the same, center them
        if (rangeY === 1 && nodes.length > 0) return height / 2;
      // SVG y-coordinate is top-down, so we invert
      return height - padding - ((y - minY) / rangeY) * (height - 2 * padding);
    };
    return { scaleX, scaleY, minX, maxX, minY, maxY };
  }, [nodes, width, height, padding]);

  // Create a map for quick node lookup by id
  const nodeMap = useMemo(() => {
    return nodes.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {} as { [key: string | number]: Node });
  }, [nodes]);

  return (
    <svg width={width} height={height} className="border border-gray-300">
      {/* Render Edges */}
      <g>
        {edges.map((edge, index) => {
          const sourceNode = nodeMap[edge.sourceId];
          const targetNode = nodeMap[edge.targetId];

          if (!sourceNode || !targetNode) {
            console.warn(`Skipping edge ${index}: Could not find source or target node`, edge);
            return null; // Skip if source or target node doesn't exist
          }

          return (
            <path
              key={`edge-${edge.sourceId}-${edge.targetId}-${index}`}
              d={`M ${scaleX(sourceNode.x)},${scaleY(sourceNode.y)} L ${scaleX(targetNode.x)},${scaleY(targetNode.y)}`}
              stroke={edgeColor}
              strokeWidth={edgeWidth}
              fill="none"
            />
          );
        })}
      </g>

      {/* Render Nodes */}
      <g>
        {nodes.map((node) => (
          <circle
            key={`node-${node.id}`}
            cx={scaleX(node.x)}
            cy={scaleY(node.y)}
            r={nodeRadius}
            fill={nodeColor}
            data-name={node.name}
            data-id={node.id}
          >
            <title>{`${node.name} (ID: ${node.id})`}</title>
          </circle>
        ))}
      </g>

      {/* Render Node Labels */}
      <g>
        {nodes.map((node) => (
          <text
            key={`label-${node.id}`}
            x={scaleX(node.x) + nodeRadius + 2} // Offset text slightly
            y={scaleY(node.y) + nodeRadius / 2 } // Align baseline vertically
            fontSize={labelFontSize}
            fill={labelColor}
          >
            {node.name}
          </text>
        ))}
      </g>
    </svg>
  );
};

export default GenericGraphRenderer; 