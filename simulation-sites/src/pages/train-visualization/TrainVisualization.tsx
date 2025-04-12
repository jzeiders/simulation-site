import React, { useState, useMemo } from 'react';
import stationData from './l-stations.json';
import GenericGraphRenderer from './GenericGraphRenderer'; // Import the new component

interface LineInfo {
  line: string;
  prior: string | null;
  next: string | null | { [key: string]: string }; // Handle Green line split, object maps branch name to next station name
}

interface Station {
  name: string;
  lat: number;
  lon: number;
  lines: LineInfo[];
}

// Define colors for each train line (Keep for potential future use, e.g., coloring edges)
const lineColors: { [key: string]: string } = {
  Red: '#c60c30',
  Blue: '#00a1de',
  Brown: '#62361b',
  Green: '#009b3a',
  Orange: '#f9461c',
  Pink: '#e27ea6',
  Purple: '#522398',
  Yellow: '#f9e300',
};

// Define types for the generic renderer
interface GenericNode {
  id: string; // Use station name as ID for simplicity, ensure uniqueness
  x: number;
  y: number;
  name: string;
}

interface GenericEdge {
  sourceId: string;
  targetId: string;
  // Optional: Add line color if needed later
  // color?: string;
}


const TrainVisualization: React.FC = () => {
  const [stations] = useState<Station[]>(stationData as Station[]); // Load stations directly

  // Define SVG dimensions and padding
  const width = 800;
  const height = 600;
  const padding = 50;

  // --- Transformation Step ---
  const { nodes, edges } = useMemo(() => {
    const genericNodes: GenericNode[] = [];
    const genericEdges: GenericEdge[] = [];
    const stationIdSet = new Set<string>(); // To ensure unique node IDs

    stations.forEach(station => {
      // Create node if it doesn't exist
      if (!stationIdSet.has(station.name)) {
        genericNodes.push({
          id: station.name, // Using name as ID
          x: station.lon,   // Use longitude for x
          y: station.lat,   // Use latitude for y
          name: station.name,
        });
        stationIdSet.add(station.name);
      }

      // Create edges based on 'next' connections
      station.lines.forEach(lineInfo => {
        const processNextStation = (nextStationName: string | null) => {
          if (nextStationName) {
             // Check if target station exists in the original data (implicitly checks if node exists)
             if (stations.some(s => s.name === nextStationName)) {
                 genericEdges.push({
                    sourceId: station.name,
                    targetId: nextStationName,
                    // color: lineColors[lineInfo.line] // Optional: Store color
                 });
             } else {
                 console.warn(`Target station "${nextStationName}" for edge from "${station.name}" not found in station data.`);
             }
          }
        };

        if (typeof lineInfo.next === 'string') {
          processNextStation(lineInfo.next);
        } else if (typeof lineInfo.next === 'object' && lineInfo.next !== null) {
          // Handle branches (like Green Line split)
          Object.values(lineInfo.next).forEach(nextStationName => {
            processNextStation(nextStationName);
          });
        }
      });
    });

    // Optional: Deduplicate edges if necessary (e.g., if two lines connect the same two stations)
    const uniqueEdges = Array.from(new Map(genericEdges.map(edge => [`${edge.sourceId}-${edge.targetId}`, edge])).values());


    // Log counts for debugging
    console.log("Generated Nodes:", genericNodes.length);
    console.log("Generated Edges:", uniqueEdges.length);


    return { nodes: genericNodes, edges: uniqueEdges };
  }, [stations]);
  // --- End Transformation Step ---


  // Remove old scaling and rendering logic (scaleX, scaleY, lineSegments)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Train Visualization System</h1>
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        {nodes.length > 0 ? (
          <GenericGraphRenderer
            nodes={nodes}
            edges={edges}
            width={width}
            height={height}
            padding={padding}
            // Pass optional props if needed
            // nodeColor="#ff0000"
            // edgeColor="#0000ff"
            // nodeRadius={5}
          />
        ) : (
          <p className="text-gray-600">Loading or processing station data...</p>
        )}
      </div>
    </div>
  );
};

export default TrainVisualization; 